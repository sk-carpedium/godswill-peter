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
  localStorage.removeItem('base44_access_token');
  localStorage.removeItem('token');
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

    login: (data) => req('POST', '/auth/login', data),

    logout: (shouldRedirect) => {
      clearTokens();
      req('POST', '/auth/logout').catch(() => {});
      if (shouldRedirect === false) return;
      if (typeof window !== 'undefined') window.location.assign('/login');
    },

    redirectToLogin: (returnUrl) => {
      if (typeof window === 'undefined') return;
      const q = returnUrl
        ? `?return=${encodeURIComponent(returnUrl)}`
        : '';
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
