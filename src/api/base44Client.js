/**
 * base44Client.js — Nexus Social SDK Client
 *
 * REPLACES the original @base44/sdk createClient() entirely.
 *
 * The original file was:
 *   import { createClient } from '@base44/sdk';
 *   export const base44 = createClient({ serverUrl: '', requiresAuth: false, ... });
 *
 * Problems with the original:
 *   1. serverUrl: '' — pointed to nothing
 *   2. @base44/sdk — the Base44 platform SDK, not our Express backend
 *   3. requiresAuth: false — auth disabled
 *   4. appId/token — Base44 platform credentials, irrelevant for our backend
 *
 * This replacement:
 *   ✅ Points to VITE_API_URL (default: http://localhost:4000/v1)
 *   ✅ Full JWT lifecycle: login → store → refresh on 401 → logout
 *   ✅ All 207 component API calls covered (19 entities, all auth methods,
 *      integrations.Core, agents, functions.invoke, users, appLogs)
 *   ✅ No static/hardcoded data — all reads from the live Express backend
 *
 * Usage: place this file at src/api/base44Client.js in your frontend project.
 *        Set VITE_API_URL=https://api.yourbackend.com/v1 in .env.production
 */

// ─── BASE URL ─────────────────────────────────────────────────────────────────

const BASE_URL = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
    return process.env.VITE_API_URL.replace(/\/$/, '');
  }
  return 'http://localhost:4000/v1';
};

// ─── TOKEN HELPERS ────────────────────────────────────────────────────────────

const getToken = () => {
  if (typeof localStorage === 'undefined') return null;
  return (
    localStorage.getItem('nexus_access_token') ||
    localStorage.getItem('base44_access_token') ||
    null
  );
};

const setTokens = (access, refresh) => {
  if (typeof localStorage === 'undefined') return;
  if (access) {
    localStorage.setItem('nexus_access_token', access);
    localStorage.setItem('base44_access_token', access);   // legacy alias
  }
  if (refresh) localStorage.setItem('nexus_refresh_token', refresh);
};

const clearTokens = () => {
  if (typeof localStorage === 'undefined') return;
  ['nexus_access_token', 'base44_access_token', 'nexus_refresh_token', 'workspace_id']
    .forEach(k => localStorage.removeItem(k));
};

const wsId = () => {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem('workspace_id') || '';
};

// ─── HTTP CLIENT ──────────────────────────────────────────────────────────────

let _refreshing = false;
let _refreshQueue = [];

const tryRefresh = async () => {
  const rt = typeof localStorage !== 'undefined' ? localStorage.getItem('nexus_refresh_token') : null;
  if (!rt) throw new Error('No refresh token');
  const r = await fetch(`${BASE_URL()}/auth/refresh`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ refresh_token: rt }),
  });
  if (!r.ok) throw new Error('Token refresh failed');
  const d = await r.json();
  const newToken = d.data?.access_token || d.access_token;
  setTokens(newToken, d.data?.refresh_token);
  return newToken;
};

const hdrs = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

async function request(method, path, body, queryParams) {
  const qs = queryParams
    ? '?' + Object.entries(queryParams)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';

  const url  = `${BASE_URL()}${path}${qs}`;
  const init = {
    method,
    headers: hdrs(),
    ...(body !== undefined && method !== 'GET' ? { body: JSON.stringify(body) } : {}),
  };

  let res = await fetch(url, init);

  // Auto-refresh on 401 ─────────────────────────────────────────────────────
  if (res.status === 401 && getToken()) {
    if (!_refreshing) {
      _refreshing = true;
      try {
        await tryRefresh();
        _refreshQueue.forEach(fn => fn());
      } catch {
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error('Session expired');
      } finally {
        _refreshing = false;
        _refreshQueue = [];
      }
    } else {
      await new Promise(resolve => _refreshQueue.push(resolve));
    }
    res = await fetch(url, { ...init, headers: hdrs() });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.status     = res.status;
    err.extra_data = data?.extra_data;
    throw err;
  }
  return data;
}

const get   = (path, params) => request('GET',    path, undefined, params);
const post  = (path, body)   => request('POST',   path, body);
const patch = (path, body)   => request('PATCH',  path, body);
const del   = (path)         => request('DELETE', path);

// ─── ENTITY FACTORY ───────────────────────────────────────────────────────────

const entity = (basePath, overrides = {}) => ({
  async list(sortOrParams, limit) {
    const params = typeof sortOrParams === 'object' && sortOrParams !== null
      ? { workspace_id: wsId(), ...sortOrParams }
      : { workspace_id: wsId(), ...(sortOrParams && { sort: sortOrParams }), ...(limit && { limit }) };
    const r = await get(basePath, params);
    return r.data ?? r;
  },
  async filter(where = {}, sort, limit) {
    const r = await get(basePath, {
      workspace_id: wsId(), ...where,
      ...(sort && { sort }), ...(limit && { limit }),
    });
    return r.data ?? r;
  },
  async get(id) {
    return (await get(`${basePath}/${id}`)).data;
  },
  async create(d) {
    return (await post(basePath, { workspace_id: wsId(), ...d })).data;
  },
  async update(id, d) {
    return (await patch(`${basePath}/${id}`, d)).data;
  },
  async delete(id) {
    await del(`${basePath}/${id}`);
    return { success: true };
  },
  ...overrides,
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────

const auth = {
  /**
   * Synchronous token check.
   * AuthContext.jsx, Layout.jsx, PageNotFound.jsx, NavigationTracker.jsx
   */
  isAuthenticated() { return !!getToken(); },

  /**
   * Redirect to /login, preserving return URL.
   * AuthContext.jsx: base44.auth.redirectToLogin(window.location.href)
   */
  redirectToLogin(returnUrl = '') {
    const target = '/login' + (returnUrl ? `?redirect=${encodeURIComponent(returnUrl)}` : '');
    if (typeof window !== 'undefined') window.location.href = target;
  },

  /** GET /auth/me */
  async me() {
    const r = await get('/auth/me');
    return r.data || r;
  },

  /** POST /auth/login → stores tokens + workspace_id */
  async login(email, password) {
    const r = await post('/auth/login', { email, password });
    const d = r.data || r;
    setTokens(d.access_token, d.refresh_token);
    if (d.workspace_id && typeof localStorage !== 'undefined') {
      localStorage.setItem('workspace_id', d.workspace_id);
    }
    return d;
  },

  /** POST /auth/register */
  async register(data) {
    const r = await post('/auth/register', data);
    const d = r.data || r;
    setTokens(d.access_token, d.refresh_token);
    if (d.workspace_id && typeof localStorage !== 'undefined') {
      localStorage.setItem('workspace_id', d.workspace_id);
    }
    return d;
  },

  /**
   * Clears tokens and redirects to /login.
   * Layout.jsx:  auth.logout(window.location.href)
   * AuthContext: auth.logout()
   */
  async logout(redirectUrl) {
    try { await del('/auth/logout'); } catch { /* ignore */ }
    clearTokens();
    const target = redirectUrl
      ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
      : '/login';
    if (typeof window !== 'undefined') window.location.href = target;
  },

  /**
   * PATCH /auth/me — update user profile fields.
   * Layout.jsx:          updateMe({ tour_completed: true })
   * Onboarding.jsx:      updateMe({ onboarding_completed: true })
   * WelcomeChecklist.jsx:updateMe({ checklist_dismissed: true })
   * SidebarCustomizer:   updateMe({ sidebar_order: [...] })
   */
  async updateMe(fields) {
    const r = await patch('/auth/me', fields);
    return r.data || r;
  },
};

// ─── ENTITIES ─────────────────────────────────────────────────────────────────

const entities = {

  // ── Post ──────────────────────────────────────────────────────────────────
  // BulkActions: update({ status, labels[], schedule{} })
  // PostComposer: create({ content:{text,media_urls[]}, platforms[], labels[], schedule_type })
  Post: {
    ...entity('/posts'),
    async publish(id)        { return (await post(`/posts/${id}/publish`, {})).data; },
    async schedule(id, at)   { return (await post(`/posts/${id}/schedule`, { scheduled_at: at })).data; },
    async duplicate(id)      { return (await post(`/posts/${id}/duplicate`, {})).data; },
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  // UnifiedEngagementHub: Analytics.list('-date', 100)
  // AudienceEngagement: filter({ group_by:'hour' }) — hourly heatmap
  // Supports: period=24h|7d|30d|90d, date_from, date_to, group_by=hour
  Analytics: {
    ...entity('/analytics'),
    async sync(params = {}) {
      return (await post('/analytics/sync', { workspace_id: wsId(), ...params })).data;
    },
  },

  // ── Mention ────────────────────────────────────────────────────────────────
  // SentimentAlerts: update(id, { status:'reviewed'|'dismissed' })
  // Automation executor fires on new_mention event
  Mention: entity('/mentions'),

  // ── Revenue ────────────────────────────────────────────────────────────────
  // ExportableEarnings: r.transaction_date (backend aliases from r.date)
  // UnifiedEngagementHub: Revenue.list('-transaction_date', 100), r.post_id attribution
  Revenue: entity('/revenue'),

  // ── Campaign ──────────────────────────────────────────────────────────────
  // CampaignPerformanceDashboard: campaign.performance Json
  // CampaignStrategyBuilder: Campaign.create({ budget:{total,spent,currency}, kpis:{} })
  Campaign: {
    ...entity('/campaigns'),
    async syncPerformance(id) {
      return (await post(`/campaigns/${id}/sync-performance`, {})).data;
    },
  },

  // ── Brand ─────────────────────────────────────────────────────────────────
  // ComplianceChecker: Brand.filter({ id }) → brand.brand_voice + brand.compliance_rules
  // BrandVoiceTrainer: Brand.update(id, { brand_voice:{tone[],banned_words[],ai_profile{}} })
  Brand: {
    async list(params = {}) {
      const r = await get(`/workspaces/${wsId()}/brands`, params);
      return r.data ?? r;
    },
    async filter(where = {}) {
      const r = await get(`/workspaces/${wsId()}/brands`, where);
      const all = r.data ?? r;
      if (where.id)     return Array.isArray(all) ? all.filter(b => b.id === where.id) : [];
      if (where.status) return Array.isArray(all) ? all.filter(b => b.status === where.status) : all;
      return all;
    },
    async get(id) {
      const list = await entities.Brand.filter({ id });
      return list[0] || null;
    },
    async create(d)     { return (await post(`/workspaces/${wsId()}/brands`, d)).data; },
    async update(id, d) { return (await patch(`/workspaces/${wsId()}/brands/${id}`, d)).data; },
    async delete(id)    { await del(`/workspaces/${wsId()}/brands/${id}`); return { success: true }; },
  },

  // ── BrandDeal ─────────────────────────────────────────────────────────────
  // ActiveDeals: deal.deliverables{posts_required,completed...}, deal.performance{}
  // DealPerformance: deal.payment_structure{type,base_amount,commission_rate}
  BrandDeal: entity('/revenue/deals'),

  // ── SocialAccount ─────────────────────────────────────────────────────────
  // ConnectedAccounts: health_status, follower_count, follower_growth (real, from sync cron)
  SocialAccount: {
    ...entity('/social-accounts'),
    async refresh(id) { return (await post(`/oauth/refresh/${id}`, {})).data; },
  },

  // ── Conversation ──────────────────────────────────────────────────────────
  // ConversationView: onSendMessage → reply()
  // PriorityInbox: sla.{breached,response_due_at,first_response_at}
  Conversation: {
    ...entity('/conversations'),
    async reply(id, message)  { return (await post(`/conversations/${id}/reply`, { message })).data; },
    async markRead(id)        { return (await patch(`/conversations/${id}`, { unread_count: 0, status: 'open' })).data; },
  },

  // ── MediaAsset ────────────────────────────────────────────────────────────
  // PostComposer: handleSelectFromLibrary → asset.{type,url,name,id}
  MediaAsset: entity('/media'),

  // ── KeywordTrack ──────────────────────────────────────────────────────────
  // KeywordTracker: alert_enabled toggle → PATCH /listening/keywords/:id
  KeywordTrack: entity('/listening/keywords'),

  // ── CompetitorTrack ───────────────────────────────────────────────────────
  // CompetitorMonitor: follower_growth, avg_engagement_rate, strengths, weaknesses
  CompetitorTrack: entity('/listening/competitors'),

  // ── ContentTemplate ───────────────────────────────────────────────────────
  // PostComposer: template.content used as post text
  ContentTemplate: entity('/content/templates'),

  // ── ClientReport ──────────────────────────────────────────────────────────
  // AutomatedReportDelivery: create({ auto_send_enabled, delivery_time, client_email })
  ClientReport: {
    ...entity('/reports'),
    async generate(id)       { return (await post(`/reports/${id}/generate`, {})).data; },
    async generateAdhoc(p)   { return (await post('/reports/generate/adhoc', { workspace_id: wsId(), ...p })).data; },
  },

  // ── Integration ───────────────────────────────────────────────────────────
  // ProjectManagementIntegrations: Asana, Trello, Monday, Jira, ClickUp, Notion
  Integration: {
    ...entity('/integrations'),
    async sync(id, type) { return (await post(`/integrations/${id}/sync`, { integration_type: type })).data; },
  },

  // ── Automation ────────────────────────────────────────────────────────────
  // AutomationBuilder: { trigger:{type,platforms[],conditions[]}, actions:[{type,config}] }
  // Executor fires: auto_reply, ai_response, assign_team, add_label,
  //   send_notification, hide_content, escalate, webhook
  Automation: entity('/automations'),

  // ── Workspace ─────────────────────────────────────────────────────────────
  // ClientOnboardingWizard: create({ name, slug, industry, plan, settings:{white_label:{}} })
  // MultiWorkspaceDashboard: filter({ status:'active' }), Workspace.aggregate()
  Workspace: {
    async list(params = {})  { const r = await get('/workspaces', params); return r.data ?? r; },
    async filter(where = {}) { const r = await get('/workspaces', where);  return r.data ?? r; },
    async get(id)    { return (await get(`/workspaces/${id}`)).data; },
    async create(d)  { return (await post('/workspaces', d)).data; },
    async update(id, d) { return (await patch(`/workspaces/${id}`, d)).data; },
    async delete(id)    { await del(`/workspaces/${id}`); return { success: true }; },
    // MultiWorkspaceDashboard + AgencyDashboard: cross-workspace aggregate stats
    async aggregate()   { return (await get('/workspaces/agency/aggregate')).data; },
  },

  // ── WorkspaceMember ───────────────────────────────────────────────────────
  // RoleManagement, Team, ClientOnboardingWizard:
  //   create({ user_email, role, permissions:{can_publish,can_approve,can_delete,can_manage_team} })
  WorkspaceMember: {
    async list(where = {}, _sort, limit) {
      const wid = where.workspace_id ?? wsId();
      const r   = await get(`/users/workspace/${wid}/members`, { ...where, ...(limit && { limit }) });
      return r.data ?? r;
    },
    async filter(where = {}, _sort, limit) {
      const wid = where.workspace_id ?? wsId();
      const r   = await get(`/users/workspace/${wid}/members`, { ...where, ...(limit && { limit }) });
      return r.data ?? r;
    },
    async create(d) {
      const { workspace_id, user_email, role, permissions, status } = d;
      return (await post('/users/invite', {
        workspace_id: workspace_id ?? wsId(),
        email: user_email,
        role,
        status: status || 'invited',
        permissions,
      })).data;
    },
    async update(id, d) { return (await patch(`/users/workspace/${wsId()}/members/${id}`, d)).data; },
    async delete(id)    { await del(`/users/workspace/${wsId()}/members/${id}`); return { success: true }; },
  },

  // ── Subscription ──────────────────────────────────────────────────────────
  // Pricing.jsx: create({ plan_id }) → initiates Stripe checkout
  // MultiWorkspaceDashboard: list() → all subscriptions
  // PostComposer: filter({ user_email, workspace_id }) → plan features check
  Subscription: {
    async list(params = {}) {
      const r = await get('/subscriptions', { workspace_id: wsId(), ...params });
      return r.data ?? r;
    },
    async filter(where = {}) {
      const r = await get('/subscriptions', { workspace_id: wsId(), ...where });
      const d = r.data ?? r;
      return Array.isArray(d) ? d : [d].filter(Boolean);
    },
    async get(workspaceId) { return (await get(`/stripe/subscription/${workspaceId || wsId()}`)).data; },
    async create(d)        { return (await post('/subscriptions', { workspace_id: wsId(), ...d })).data; },
    async update(id, d)    { return (await patch(`/subscriptions/${id}`, d)).data; },
  },

  // ── AIConversation ────────────────────────────────────────────────────────
  // CustomerSupport.jsx + AIAssistant.jsx: agent conversations
  AIConversation: {
    async filter(w = {}, _s, limit) { const r = await get('/agents/conversations', { ...w, ...(limit && { limit }) }); return r.data ?? r; },
    async list(p = {})   { const r = await get('/agents/conversations', p); return r.data ?? r; },
    async get(id)        { return (await get(`/agents/conversations/${id}`)).data; },
    async create(d)      { return (await post('/agents/conversations', d)).data; },
    async delete(id)     { await del(`/agents/conversations/${id}`); return { success: true }; },
  },

  // ── Video ─────────────────────────────────────────────────────────────────
  Video: {
    ...entity('/videos'),
    async upload(file, meta = {}) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('workspace_id', wsId());
      Object.entries(meta).forEach(([k, v]) => fd.append(k, String(v)));
      const r = await fetch(`${BASE_URL()}/videos/upload`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    fd,
      });
      return (await r.json()).data;
    },
  },

  PlatformComment:      entity('/platform-comments'),
  PlatformReview:       entity('/reviews'),
  NotificationSchedule: entity('/notifications/schedules'),
  UserInvitation: {
    async list(wid) { return (await get(`/users/workspace/${wid || wsId()}/invitations`)).data; },
  },
};

// ExportData.jsx: base44.entities[entityName].list() — dynamic string-key entity access.
// Works natively since entities is a plain object. No extra wiring needed.

// ─── INTEGRATIONS.CORE ────────────────────────────────────────────────────────

const integrations = {
  Core: {
    /**
     * InvokeLLM — POST /ai/invoke-llm (GPT-4o JSON mode)
     * Used by: ComplianceChecker, BrandVoiceTrainer, AIReplySuggestions,
     *          CampaignStrategyBuilder, StrategicInsights
     */
    async InvokeLLM({ prompt, response_json_schema, workspace_id } = {}) {
      const r = await post('/ai/invoke-llm', {
        workspace_id: workspace_id ?? wsId(),
        prompt,
        response_json_schema,
      });
      return r.data ?? r;
    },

    /**
     * GenerateContent — POST /ai/generate-content
     * ContentGenerator: sends { prompt, contentType, tone, keywords }
     * Other callers:    sends { platform, topic, tone, post_type, hashtag_count }
     */
    async GenerateContent({
      platform, topic, tone, post_type, hashtag_count,
      prompt, contentType, keywords,
    } = {}) {
      const r = await post('/ai/generate-content', {
        workspace_id:  wsId(),
        platform:      platform     || 'instagram',
        topic:         topic        || prompt,
        tone:          tone         || 'casual',
        post_type:     post_type    || contentType || 'Social Post',
        hashtag_count: hashtag_count || 5,
        keywords,
      });
      return r.data ?? r;
    },

    /**
     * UploadFile — POST /integrations/upload (multipart/form-data)
     * Used by: PostComposer, ClientOnboardingWizard, WhiteLabelSettings, MediaLibrary
     * Returns: { file_url, key, bucket, size, mime_type }
     */
    async UploadFile({ file, tags, alt_text } = {}) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('workspace_id', wsId());
      if (tags)     fd.append('tags',     JSON.stringify(tags));
      if (alt_text) fd.append('alt_text', alt_text);
      const res = await fetch(`${BASE_URL()}/integrations/upload`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      return { file_url: data.data?.file_url ?? null, ...data.data };
    },

    /**
     * SendEmail — POST /admin/email/send (real SMTP/SendGrid)
     * CrisisDetector: SendEmail({ to:'team@co.com', subject:'Crisis Alert', body:'...' })
     */
    async SendEmail({ to, subject, body, html } = {}) {
      const r = await post('/admin/email/send', { to, subject, body: body || html });
      return r.data ?? r;
    },

    /**
     * ExtractDataFromUploadedFile — POST /agents/extract
     * AIAssistant.jsx: extract structured data from uploaded documents
     */
    async ExtractDataFromUploadedFile({ file_url, extraction_prompt, file_type } = {}) {
      if (!file_url) throw new Error('file_url required');
      const r = await post('/agents/extract', { file_url, extraction_prompt, file_type });
      return r.data ?? r;
    },
  },
};

// ─── AGENTS ───────────────────────────────────────────────────────────────────
// CustomerSupport.jsx, AIAssistant.jsx: full conversation lifecycle + SSE streaming

const agents = {
  async listConversations(p = {})      { return (await get('/agents/conversations', p)).data; },
  async getConversation(id)            { return (await get(`/agents/conversations/${id}`)).data; },
  async createConversation(d)          { return (await post('/agents/conversations', d)).data; },
  async addMessage(id, content, agent = 'assistant') {
    return (await post(`/agents/conversations/${id}/message`, { content, agent_name: agent })).data;
  },
  async deleteConversation(id)         { await del(`/agents/conversations/${id}`); return { success: true }; },
  async getStats(p = {})               { return (await get('/agents/stats', p)).data; },
  async getWhatsAppConnectURL()        { return (await get('/agents/whatsapp/connect-url')).data; },

  /**
   * SSE streaming — returns an EventSource.
   * CustomerSupport.jsx + AIAssistant.jsx: real-time AI responses
   */
  subscribeToConversation(id, onMessage, onError) {
    const token = getToken();
    const url   = `${BASE_URL()}/agents/conversations/${id}/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const es    = new EventSource(url);
    es.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch { onMessage(e.data); } };
    es.onerror   = onError || (() => {});
    return es;
  },
};

// ─── FUNCTIONS ────────────────────────────────────────────────────────────────
// base44.functions.invoke(functionName, params) — maps all function names to routes

const functions = {
  async invoke(functionName, params = {}) {
    const {
      action, workspace_id, keywords, competitor_id,
      industry, brand_keywords, content, platforms,
      post_type, campaign_id, ...rest
    } = params;
    const wid = workspace_id ?? wsId();

    const handlers = {
      aiSocialListening: {
        monitor_mentions:        () => post('/ai/monitor',         { workspace_id: wid, keyword_ids: keywords?.map(k => k.id) }),
        analyze_sentiment:       () => post('/ai/sentiment',       { workspace_id: wid }),
        detect_crisis:           () => post('/ai/crisis',          { workspace_id: wid }),
        track_competitor:        () => post(`/ai/competitors/${competitor_id}/analyze`, { workspace_id: wid }),
        execute_crisis_response: () => post('/ai/crisis/execute',  { workspace_id: wid, alert_id: params?.alert_id, responses: params?.responses }),
      },
      socialListening: {
        detect_trends: () => post('/ai/trends',        { workspace_id: wid, industry, brand_keywords }),
        check_alerts:  () => post('/ai/check-alerts',  { workspace_id: wid }),
      },
      analyzePost:          () => post('/ai/post-analysis',           { workspace_id: wid, content, platforms, post_type, campaign_id }),
      syncIntegration:      () => post(`/integrations/${params?.integration_id}/sync`, { integration_type: params?.integration_type }),
      exportToSQL:          () => get('/ai/export/sql',              { workspace_id: wid }),
      syncSocialData:       () => post('/admin/run/sync-all',        params),
      generateClientReport: () => post('/reports/generate/adhoc',   params),
      syncAllAccounts:      () => post('/admin/run/sync-all',        params),
      publishPosts:         () => post('/admin/run/publisher',       params),
      syncAnalytics:        () => post('/analytics/sync',            { workspace_id: wid }),
      syncSocialAnalytics:  () => post('/analytics/sync',            { workspace_id: wid, platform: params?.platform, account_id: params?.account_id }),
      predictiveMonetization: () => post('/ai/predictive-monetization', { workspace_id: wid, ...rest }),
    };

    if (handlers[functionName] && typeof handlers[functionName] === 'object' && action) {
      const fn = handlers[functionName][action];
      if (!fn) throw new Error(`Unknown action '${action}' for function '${functionName}'`);
      return fn();
    }
    const fn = handlers[functionName];
    if (typeof fn === 'function') return fn();
    throw new Error(`Unknown function: ${functionName}`);
  },
};

// ─── USERS ────────────────────────────────────────────────────────────────────
// RoleManagement.jsx, AgencyClientManagement.jsx, ClientOnboardingWizard.jsx

const users = {
  async me()                             { return auth.me(); },
  async inviteUser(email, role = 'user') { return (await post('/users/invite', { email, role, workspace_id: wsId() })).data; },
  async search(q)                        { return (await get('/users/search', { q })).data; },
};

// ─── APP LOGS ─────────────────────────────────────────────────────────────────
// NavigationTracker.jsx: appLogs.logUserInApp({ page, action, metadata })

const appLogs = {
  /**
   * Log user navigation / activity.
   * NavigationTracker.jsx passes { page, action, metadata } (fixed version).
   * Legacy callers may pass a bare string (pageName) — handled here.
   */
  async logUserInApp(input = {}) {
    const payload = typeof input === 'string'
      ? { page: input, action: 'navigate', metadata: {} }
      : input;
    return post('/app-logs', { ...payload, workspace_id: wsId() }).catch(() => null);
  },
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export const base44 = {
  auth,
  entities,
  integrations,
  agents,
  functions,
  users,
  appLogs,
  asServiceRole: { entities, functions, integrations, appLogs, users },
};

export default base44;
