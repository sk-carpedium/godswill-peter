/**
 * Nexus Social — API client for the Express backend.
 *
 * Authentication uses JWT access + refresh tokens stored under `nexus_*` keys
 * in localStorage (legacy `base44_access_token` is still read once for migration).
 *
 * `VITE_API_URL` defaults to `/v1` (Vite dev proxy → :4000).
 */
const API_URL = (import.meta.env.VITE_API_URL || '/v1').replace(/\/$/, '');

export function getAccessToken() {
  if (typeof localStorage === 'undefined') return null;
  return (
    localStorage.getItem('nexus_access_token') ||
    localStorage.getItem('base44_access_token') ||
    localStorage.getItem('token')
  );
}

function clearTokens() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('nexus_access_token');
  localStorage.removeItem('nexus_refresh_token');
  localStorage.removeItem('base44_access_token');
  localStorage.removeItem('token');
  localStorage.removeItem('workspace_id');
}

/** Persist session after POST /auth/login or /auth/register. */
function persistAuthSession(d) {
  if (typeof localStorage === 'undefined' || !d || typeof d !== 'object') return;
  if (d.access_token) {
    localStorage.setItem('nexus_access_token', d.access_token);
  }
  if (d.refresh_token) localStorage.setItem('nexus_refresh_token', d.refresh_token);
  if (d.workspace?.id) localStorage.setItem('workspace_id', d.workspace.id);
}

/** Deduped refresh so parallel 401s share one POST /auth/refresh. */
let refreshInFlight = null;

async function tryRefreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const rt = typeof localStorage !== 'undefined' ? localStorage.getItem('nexus_refresh_token') : null;
      if (!rt) return false;
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
      if (!res.ok) return false;
      const payload = data?.data !== undefined ? data.data : data;
      if (payload?.access_token) {
        persistAuthSession(payload);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function req(method, path, body, attempt = 0) {
  const norm = path.startsWith('/') ? path : `/${path}`;
  const token = getAccessToken();
  const res = await fetch(`${API_URL}${norm}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const noRetry =
      attempt > 0 ||
      res.status !== 401 ||
      norm === '/auth/refresh' ||
      norm === '/auth/login' ||
      norm === '/auth/register';
    if (!noRetry) {
      const refreshed = await tryRefreshAccessToken();
      if (refreshed) return req(method, path, body, attempt + 1);
    }
    const err = new Error(data?.error || data?.message || text || `HTTP ${res.status}`);
    err.status = res.status;
    err.extra_data = data?.extra_data;
    throw err;
  }
  return data?.data !== undefined ? data.data : data;
}

function toQuery(params) {
  if (!params || typeof params !== 'object') return '';
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (k === 'sort') {
      q.set('sort', String(v).replace(/^-/, ''));
      if (String(v).startsWith('-')) q.set('order', 'desc');
      continue;
    }
    q.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** REST path for entity name — backend uses kebab/compound routes, not `lowercase + s`. */
function entityRestPath(entity) {
  const name = String(entity);
  const map = {
    SocialAccount: '/social-accounts',
    Analytics: '/analytics',
    KeywordTrack: '/listening/keywords',
    CompetitorTrack: '/listening/competitors',
    TrendAnalysis: '/listening/trends',
    MediaAsset: '/media',
    ContentTemplate: '/content/templates',
    SavedReply: '/content/saved-replies',
    Automation: '/automations',
    ClientReport: '/reports',
    Integration: '/integrations',
    Mention: '/listening/mentions',
    Revenue: '/revenue/entries',
    BrandDeal: '/revenue/deals',
  };
  if (map[name]) return map[name];
  const lower = name.toLowerCase();
  if (lower.endsWith('s')) return `/${lower}`;
  return `/${lower}s`;
}

async function logUserInApp(data) {
  const workspaceId =
    typeof localStorage !== 'undefined' ? localStorage.getItem('workspace_id') : null;
  const path = typeof window !== 'undefined' ? window.location.pathname : undefined;
  let body;
  if (typeof data === 'string') {
    body = {
      page_name: data,
      path,
      ...(workspaceId ? { workspace_id: workspaceId } : {}),
    };
  } else if (data && typeof data === 'object') {
    const pageName = data.page_name ?? data.page ?? 'unknown';
    const meta = { ...(data.metadata || {}) };
    if (data.action) meta.action = data.action;
    body = {
      page_name: String(pageName),
      path: data.path ?? meta.path ?? path,
      metadata: Object.keys(meta).length ? meta : undefined,
      ...(data.workspace_id
        ? { workspace_id: data.workspace_id }
        : workspaceId
          ? { workspace_id: workspaceId }
          : {}),
    };
  } else {
    body = { page_name: 'unknown', path };
  }
  try {
    return await req('POST', '/app-logs/page-view', body);
  } catch {
    return null;
  }
}

export const api = {
  auth: {
    getAccessToken,
    isAuthenticated: () => !!getAccessToken(),

    me: () => req('GET', '/auth/me'),

    login: async (data) => {
      const d = await req('POST', '/auth/login', data);
      persistAuthSession(d);
      return d;
    },

    logout: (shouldRedirect) => {
      clearTokens();
      req('POST', '/auth/logout').catch(() => {});
      if (shouldRedirect === false) return;
      if (typeof window !== 'undefined') window.location.assign('/login');
    },

    redirectToLogin: (returnUrl) => {
      if (typeof window === 'undefined') return;
      let path = `${window.location.pathname}${window.location.search}`;
      if (returnUrl) {
        try {
          const u = new URL(String(returnUrl), window.location.origin);
          if (u.origin === window.location.origin) path = `${u.pathname}${u.search}`;
        } catch {
          /* keep path from window */
        }
      }
      const pathOnly = path.split('?')[0];
      // Avoid /login ↔ /Landing loops: never use public shell as post-login target
      if (/^\/login$/i.test(pathOnly) || /^\/Landing$/i.test(pathOnly)) {
        path = '/';
      }
      const q = path && path !== '/' ? `?return=${encodeURIComponent(path)}` : '';
      window.location.assign(`/login${q}`);
    },

    updateMe: (patch) => req('PATCH', '/auth/me', patch),

    inviteUser: async () => {
      throw new Error('inviteUser is not implemented for this backend');
    },
  },

  appLogs: {
    logUserInApp,
  },

  functions: {
    invoke: async (name, payload) => {
      return req('POST', `/functions/${encodeURIComponent(name)}`, payload);
    },
  },

  integrations: {
    Core: {
      InvokeLLM: async (payload) => req('POST', '/integrations/llm', payload),
      SendEmail: async (payload) => req('POST', '/integrations/email', payload),
    },
  },

  users: {
    inviteUser: async () => {
      throw new Error('users.inviteUser is not implemented for this backend');
    },
  },

  entities: new Proxy({}, {
    get: (_, entity) => {
      const base = entityRestPath(entity);
      return {
        list: (sort, limit) => {
          const params = {};
          if (sort) params.sort = sort;
          if (limit != null) params.limit = limit;
          return req('GET', `${base}${toQuery(params)}`);
        },
        filter: (filters, sort, limit) => {
          const params = { ...(filters && typeof filters === 'object' ? filters : {}) };
          if (typeof sort === 'string') params.sort = sort;
          if (typeof limit === 'number') params.limit = limit;
          return req('GET', `${base}${toQuery(params)}`);
        },
        get: (id) => req('GET', `${base}/${id}`),
        create: (data) => req('POST', base, data),
        update: (id, data) => req('PUT', `${base}/${id}`, data),
        delete: (id) => req('DELETE', `${base}/${id}`),
      };
    },
  }),
};

export default api;
