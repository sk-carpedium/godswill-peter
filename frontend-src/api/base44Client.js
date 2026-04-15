/**
 * Nexus Social API client.
 *
 * The export name `base44` is legacy: many components were generated for the
 * Base44 platform. This module does NOT call Base44 servers — only your
 * backend (`VITE_API_URL`, default proxied `/v1` → localhost:4000).
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
    localStorage.setItem('base44_access_token', d.access_token);
  }
  if (d.refresh_token) localStorage.setItem('nexus_refresh_token', d.refresh_token);
  if (d.workspace?.id) localStorage.setItem('workspace_id', d.workspace.id);
}

async function req(method, path, body) {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
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

export const base44 = {
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
    logUserInApp: (data) => req('POST', '/app-logs', data).catch(() => null),
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
      const base = `/${String(entity).toLowerCase()}s`;
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

export default base44;
