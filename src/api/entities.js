// HTTP helpers — shared with index.js
const BASE = () => (typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_URL : undefined) ?? "http://localhost:4000/v1";
const tok  = () => (typeof localStorage !== "undefined" ? localStorage.getItem("nexus_access_token") || localStorage.getItem("base44_access_token") : null) ?? "";
const wsId = () => (typeof localStorage !== "undefined" ? localStorage.getItem("workspace_id") : null) ?? "";
const hdr  = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${tok()}` });

async function get(path, params = {}) {
  const qs = Object.entries(params).filter(([,v]) => v != null).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const r = await fetch(`${BASE()}${path}${qs ? "?" + qs : ""}`, { headers: hdr() });
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
}
async function post(path, body = {}) {
  const r = await fetch(`${BASE()}${path}`, { method: "POST", headers: hdr(), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`POST ${path} → ${r.status}`);
  return r.json();
}
async function patch(path, body = {}) {
  const r = await fetch(`${BASE()}${path}`, { method: "PATCH", headers: hdr(), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PATCH ${path} → ${r.status}`);
  return r.json();
}
async function del(path) {
  const r = await fetch(`${BASE()}${path}`, { method: "DELETE", headers: hdr() });
  if (!r.ok) throw new Error(`DELETE ${path} → ${r.status}`);
  return r.json();
}


// ─── NEW ENTITIES FROM 18-PAGE ANALYSIS ──────────────────────────────────────

export const Video = {
  async filter(where = {}, _sort, limit) {
    const r = await get('/videos', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async list(params = {}) {
    const r = await get('/videos', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/videos/${id}`)).data; },
  async create(data) { return (await post('/videos', { workspace_id: wsId(), ...data })).data; },
  async update(id, data) { return (await patch(`/videos/${id}`, data)).data; },
  async delete(id) { await del(`/videos/${id}`); return { success: true }; },
  async upload(file, metadata = {}) {
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/v1';
    const fd = new FormData();
    fd.append('file', file);
    fd.append('workspace_id', wsId());
    Object.entries(metadata).forEach(([k, v]) => fd.append(k, String(v)));
    const r = await fetch(`${BASE}/videos/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('nexus_access_token')}` },
      body: fd,
    });
    return (await r.json()).data;
  },
  async stats(params) { return (await get('/videos/stats/summary', { workspace_id: wsId(), ...params })).data; },
};

export const PlatformComment = {
  async filter(where = {}, _sort, limit) {
    const r = await get('/platform-comments', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async list(params = {}) {
    const r = await get('/platform-comments', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async create(data) { return (await post('/platform-comments', { workspace_id: wsId(), ...data })).data; },
  async update(id, data) { return (await patch(`/platform-comments/${id}`, data)).data; },
  async reply(id, reply_content) { return (await post(`/platform-comments/${id}/reply`, { reply_content })).data; },
  async bulkAction(ids, action) { return (await post('/platform-comments/bulk/action', { comment_ids: ids, action })).data; },
  async analytics(params) { return (await get('/platform-comments/analytics/summary', { workspace_id: wsId(), ...params })).data; },
};

export const UserInvitation = {
  async list(workspaceId) { return (await get(`/users/workspace/${workspaceId || wsId()}/invitations`)).data; },
  async revoke(id) { return del(`/users/invitations/${id}`); },
};

// Override Subscription with full entity support including .create() for Pricing.jsx
// MultiWorkspaceDashboard: Subscription.list() → all subscriptions across workspaces
// PostComposer: Subscription.filter({ user_email, workspace_id }) → plan_id, current_usage
// Fields: plan_id, plan, current_usage.team_members, current_usage.social_accounts, usage_limits
export const Subscription = {
  async list(params = {}) {
    const r = await get('/subscriptions', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}) {
    const r = await get('/subscriptions', { workspace_id: wsId(), ...where });
    const data = r.data ?? r;
    return Array.isArray(data) ? data : [data].filter(Boolean);
  },
  async get(workspaceId) { return (await get(`/stripe/subscription/${workspaceId || wsId()}`)).data; },
  async create(data) { return (await post('/subscriptions', data)).data; },
  async update(id, data) { return (await patch(`/subscriptions/${id}`, data)).data; },
  async getPlans() { return (await get('/stripe/plans')).data; },
  async createCheckout(p) { return (await post('/stripe/checkout', p)).data; },
  async createPortal(p) { return (await post('/stripe/portal', p)).data; },
  async trackUsage(workspaceId, metric, amount = 1) { return (await post(`/subscriptions/${workspaceId}/track-usage`, { metric, amount })).data; },
};

// ─── NEW ENTITIES FROM 16-PAGE ANALYSIS ──────────────────────────────────────

export const PlatformReview = {
  async filter(where = {}, _sort, limit) {
    const r = await get('/reviews', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async list(params = {}) {
    const r = await get('/reviews', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async create(data) { return (await post('/reviews', { workspace_id: wsId(), ...data })).data; },
  async update(id, data) { return (await patch(`/reviews/${id}`, data)).data; },
  async delete(id) { await del(`/reviews/${id}`); return { success: true }; },
  async reply(id, reply_content) { return (await post(`/reviews/${id}/reply`, { reply_content })).data; },
  async bulkAction(ids, action) { return (await post('/reviews/bulk/action', { review_ids: ids, action })).data; },
  async analytics(params) { return (await get('/reviews/analytics/summary', { workspace_id: wsId(), ...params })).data; },
  async import(data) { return (await post('/reviews/import', data)).data; },
};

export const NotificationSchedule = {
  async filter(where = {}, _sort, limit) {
    const r = await get('/live-notifications', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async list(params = {}) {
    const r = await get('/live-notifications', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async create(data) { return (await post('/live-notifications', { workspace_id: wsId(), ...data })).data; },
  async bulkCreate(data) { return (await post('/live-notifications/bulk', { workspace_id: wsId(), ...data })).data; },
  async update(id, data) { return (await patch(`/live-notifications/${id}`, data)).data; },
  async cancel(id) { await del(`/live-notifications/${id}`); return { cancelled: true }; },
  async sendNow(id) { return (await post(`/live-notifications/${id}/send`, {})).data; },
  async stats(params) { return (await get('/live-notifications/stats/summary', { workspace_id: wsId(), ...params })).data; },
};

// Updated auth.updateMe to support Onboarding.jsx's auth.updateMe({ onboarding_completed: true })
// The existing PATCH /auth/me already handles this — just ensure it's in the auth export

// ─── ENTITIES FROM 6-PAGE ANALYSIS ───────────────────────────────────────────

// ClientPortal.jsx — plan access check + portal dashboard
export const ClientPortal = {
  async checkAccess(workspaceId) {
    return (await get('/portal/access', { workspace_id: workspaceId ?? wsId() })).data;
  },
  async getDashboard(workspaceId) {
    return (await get(`/portal/${workspaceId ?? wsId()}/dashboard`)).data;
  },
  async saveSettings(workspaceId, settings) {
    return (await import('./client.js').then(m => m.patch(`/portal/${workspaceId ?? wsId()}/settings`, settings))).data;
  },
};

// WorkspaceMember entity — list() used by RoleManagement.jsx
export const WorkspaceMember = {
  async list(params = {}) {
    const wid = wsId();
    const r = await get(`/users/workspace/${wid}/members`, params);
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const wid = where.workspace_id ?? wsId();
    const r = await get(`/users/workspace/${wid}/members`, { ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async update(id, data) {
    const wid = wsId();
    return (await import('./client.js').then(m => m.patch(`/users/workspace/${wid}/members/${id}`, data))).data;
  },
  async delete(id) {
    const wid = wsId();
    return (await import('./client.js').then(m => m.del(`/users/workspace/${wid}/members/${id}`))).data;
  },
  async create(data) {
    // ClientOnboardingWizard: WorkspaceMember.create({ workspace_id, user_email, role, permissions:{} })
    const { workspace_id, user_email, role, permissions, status } = data;
    return (await post('/users/invite', {
      workspace_id: workspace_id ?? wsId(),
      email: user_email,
      role,
      status: status || 'invited',
      permissions,  // { can_publish, can_approve, can_delete, can_manage_team }
    })).data;
  },
};

// ─── ENTITIES FROM FINAL 18-FILE ANALYSIS ────────────────────────────────────

// AIConversation — backed by agents module, but also accessible as entity
export const AIConversation = {
  async filter(where = {}, _sort, limit) {
    const r = await get('/agents/conversations', { ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async list(params = {}) {
    const r = await get('/agents/conversations', params);
    return r.data ?? r;
  },
  async get(id) { return (await get(`/agents/conversations/${id}`)).data; },
  async create(data) { return (await post('/agents/conversations', data)).data; },
  async delete(id) { return del(`/agents/conversations/${id}`); },
};

// UsageLimits — usageLimits.jsx hook uses Subscription.filter, but we also expose direct usage
export const UsageLimits = {
  async get(workspaceId) {
    return (await get(`/usage/${workspaceId ?? wsId()}`)).data;
  },
  async increment(workspaceId, metric, amount = 1) {
    return (await import('./client.js').then(m => m.post(`/usage/${workspaceId ?? wsId()}/increment`, { metric, amount }))).data;
  },
  async resetMonthly(workspaceId) {
    return (await import('./client.js').then(m => m.post(`/usage/${workspaceId ?? wsId()}/reset-monthly`, {}))).data;
  },
};

// Permissions — permissions.jsx is client-side only, but backend validates these
export const Permissions = {
  async get(workspaceId) {
    return (await get('/permissions', { workspace_id: workspaceId ?? wsId() })).data;
  },
  async check(workspaceId, permissions) {
    return (await import('./client.js').then(m => m.post('/permissions/check', { workspace_id: workspaceId ?? wsId(), permissions }))).data;
  },
};

// ─── CORE ENTITIES (all 16 used by uploaded frontend components) ──────────────
// These are the primary entities referenced across all analysed components.

// ── Post ──────────────────────────────────────────────────────────────────────
// RecentPosts, UpcomingPosts, BulkActions, ContentCalendar, UnifiedEngagementHub
// PostComposer onSave: { content:{text,media_urls[]}, platforms[], post_type, scheduled_at,
//   schedule_type, recurrence_rule, campaign_id, assigned_to, is_sponsored, labels[], schedule{} }
export const Post = {
  async list(sort, limit) {
    const r = await get('/posts', { workspace_id: wsId(), ...(sort && { sort }), ...(limit && { limit }) });
    return r.data ?? r;
  },
  async filter(where = {}, sort, limit) {
    const r = await get('/posts', { workspace_id: wsId(), ...where, ...(sort && { sort }), ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/posts/${id}`)).data; },
  // PostComposer onSave/onPublish
  async create(d) { return (await post('/posts', { workspace_id: wsId(), ...d })).data; },
  // BulkActions: update(id, { status }), update(id, { labels }), update(id, { schedule })
  async update(id, d) { return (await patch(`/posts/${id}`, d)).data; },
  async delete(id) { await del(`/posts/${id}`); return { success: true }; },
  async duplicate(id) { return (await post(`/posts/${id}/duplicate`, {})).data; },
  async schedule(id, scheduledAt) { return (await post(`/posts/${id}/schedule`, { scheduled_at: scheduledAt })).data; },
  async publish(id) { return (await post(`/posts/${id}/publish`, {})).data; },
};

// ── Analytics ─────────────────────────────────────────────────────────────────
// UnifiedEngagementHub: Analytics.list('-date', 100)
// CampaignPerformanceDashboard: aggregated via campaign.performance
export const Analytics = {
  async list(sort, limit) {
    const r = await get('/analytics', { workspace_id: wsId(), ...(sort && { sort }), ...(limit && { limit }) });
    return r.data ?? r;
  },
  async filter(where = {}, sort, limit) {
    const r = await get('/analytics', { workspace_id: wsId(), ...where, ...(sort && { sort }), ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/analytics/${id}`)).data; },
  async create(d) { return (await post('/analytics', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/analytics/${id}`, d)).data; },
  async sync(params = {}) { return (await post('/analytics/sync', { workspace_id: wsId(), ...params })).data; },
};

// ── Mention ───────────────────────────────────────────────────────────────────
// MentionsFeed, SentimentAlerts, RealTimeDashboard
// SentimentAlerts: Mention.update(id, { status: 'reviewed'|'dismissed' })
export const Mention = {
  async list(params = {}) {
    const r = await get('/mentions', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/mentions', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/mentions/${id}`)).data; },
  async create(d) { return (await post('/mentions', { workspace_id: wsId(), ...d })).data; },
  // SentimentAlerts: update(id, { status: 'reviewed' | 'dismissed' })
  async update(id, d) { return (await patch(`/mentions/${id}`, d)).data; },
  async delete(id) { await del(`/mentions/${id}`); return { success: true }; },
};

// ── Revenue ───────────────────────────────────────────────────────────────────
// UnifiedEngagementHub: Revenue.list('-transaction_date', 100)
// ExportableEarnings: uses r.transaction_date alias
export const Revenue = {
  async list(sort, limit) {
    const r = await get('/revenue', { workspace_id: wsId(), ...(sort && { sort }), ...(limit && { limit }) });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/revenue', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/revenue/${id}`)).data; },
  // transaction_date aliases date field in backend
  async create(d) { return (await post('/revenue', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/revenue/${id}`, d)).data; },
  async delete(id) { await del(`/revenue/${id}`); return { success: true }; },
};

// ── Campaign ──────────────────────────────────────────────────────────────────
// CampaignPerformanceDashboard: props campaigns[] (fetched by parent)
// campaign.performance: aggregated by POST /campaigns/:id/sync-performance
export const Campaign = {
  async syncPerformance(id) { return (await post(`/campaigns/${id}/sync-performance`, {})).data; },
  async list(params = {}) {
    const r = await get('/campaigns', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/campaigns', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/campaigns/${id}`)).data; },
  async create(d) { return (await post('/campaigns', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/campaigns/${id}`, d)).data; },
  async delete(id) { await del(`/campaigns/${id}`); return { success: true }; },
};

// ── Brand ─────────────────────────────────────────────────────────────────────
// ComplianceChecker: Brand.filter({ id: brandId }) → brand.brand_voice + brand.compliance_rules
// BrandVoiceTrainer: Brand.update(brandId, { brand_voice: {...} })
export const Brand = {
  async list(params = {}) {
    const r = await get(`/workspaces/${wsId()}/brands`, params);
    return r.data ?? r;
  },
  async filter(where = {}) {
    try {
      const r = await get(`/workspaces/${wsId()}/brands`, where);
      const all = r.data ?? r;
      if (where.id) return Array.isArray(all) ? all.filter(b => b.id === where.id) : [];
      if (where.status) return Array.isArray(all) ? all.filter(b => b.status === where.status) : all;
      return all;
    } catch { return []; }
  },
  async get(id) {
    const brands = await Brand.filter({ id });
    return brands[0] || null;
  },
  async create(d) { return (await post(`/workspaces/${wsId()}/brands`, d)).data; },
  // BrandVoiceTrainer: Brand.update(brandId, { brand_voice: {...} })
  async update(id, d) { return (await patch(`/workspaces/${wsId()}/brands/${id}`, d)).data; },
  async delete(id) { await del(`/workspaces/${wsId()}/brands/${id}`); return { success: true }; },
};

// ── BrandDeal ─────────────────────────────────────────────────────────────────
// ActiveDeals, DealPerformance: deal.deliverables, deal.performance, deal.payment_structure
export const BrandDeal = {
  async list(params = {}) {
    const r = await get('/revenue/deals', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/revenue/deals', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/revenue/deals/${id}`)).data; },
  async create(d) { return (await post('/revenue/deals', { workspace_id: wsId(), ...d })).data; },
  // DealPerformance: update(id, deal.performance Json)
  async update(id, d) { return (await patch(`/revenue/deals/${id}`, d)).data; },
  async delete(id) { await del(`/revenue/deals/${id}`); return { success: true }; },
};

// ── SocialAccount ─────────────────────────────────────────────────────────────
// ConnectedAccounts: accounts[], account.health_status, account.follower_count
// OAuth: SocialAccount upserted on callback
export const SocialAccount = {
  async list(params = {}) {
    const r = await get('/social-accounts', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/social-accounts', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/social-accounts/${id}`)).data; },
  async create(d) { return (await post('/social-accounts', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/social-accounts/${id}`, d)).data; },
  async delete(id) { await del(`/social-accounts/${id}`); return { success: true }; },
  async refresh(id) { return (await post(`/oauth/refresh/${id}`, {})).data; },
  async sync(id) { return (await post(`/admin/run/sync-all`, { account_id: id })).data; },
};

// ── Conversation ──────────────────────────────────────────────────────────────
// ConversationList, ConversationView, PriorityInbox
// ConversationView: messages[{direction,content,sent_at}], sla{}, participant{}
export const Conversation = {
  async list(params = {}) {
    const r = await get('/conversations', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/conversations', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/conversations/${id}`)).data; },
  async create(d) { return (await post('/conversations', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/conversations/${id}`, d)).data; },
  async delete(id) { await del(`/conversations/${id}`); return { success: true }; },
  // ConversationView onSendMessage: reply to conversation
  async reply(id, message) { return (await post(`/conversations/${id}/reply`, { message })).data; },
  // PriorityInbox: mark as read
  async markRead(id) { return (await patch(`/conversations/${id}`, { unread_count: 0, status: 'open' })).data; },
};

// ── MediaAsset ────────────────────────────────────────────────────────────────
// PostComposer handleSelectFromLibrary: asset.type, asset.url, asset.name, asset.id
// integrations.Core.UploadFile saves to /media
export const MediaAsset = {
  async list(params = {}) {
    const r = await get('/media', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/media', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/media/${id}`)).data; },
  async create(d) { return (await post('/media', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/media/${id}`, d)).data; },
  async delete(id) { await del(`/media/${id}`); return { success: true }; },
};

// ── KeywordTrack ──────────────────────────────────────────────────────────────
// KeywordTracker: keyword, category, mentions_today, trending_score, alert_enabled
export const KeywordTrack = {
  async list(params = {}) {
    const r = await get('/listening/keywords', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/listening/keywords', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/listening/keywords/${id}`)).data; },
  async create(d) { return (await post('/listening/keywords', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/listening/keywords/${id}`, d)).data; },
  async delete(id) { await del(`/listening/keywords/${id}`); return { success: true }; },
};

// ── CompetitorTrack ───────────────────────────────────────────────────────────
// CompetitorMonitor: name, total_followers, follower_growth, avg_engagement_rate
export const CompetitorTrack = {
  async list(params = {}) {
    const r = await get('/listening/competitors', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/listening/competitors', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/listening/competitors/${id}`)).data; },
  async create(d) { return (await post('/listening/competitors', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/listening/competitors/${id}`, d)).data; },
  async delete(id) { await del(`/listening/competitors/${id}`); return { success: true }; },
};

// ── ContentTemplate ───────────────────────────────────────────────────────────
// PostComposer handleSelectFromLibrary: template.content used as post text
export const ContentTemplate = {
  async list(params = {}) {
    const r = await get('/content/templates', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/content/templates', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/content/templates/${id}`)).data; },
  async create(d) { return (await post('/content/templates', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/content/templates/${id}`, d)).data; },
  async delete(id) { await del(`/content/templates/${id}`); return { success: true }; },
};

// ── ClientReport ──────────────────────────────────────────────────────────────
// ExportableEarnings (report generation), ClientPortal
export const ClientReport = {
  async list(params = {}) {
    const r = await get('/reports', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/reports', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/reports/${id}`)).data; },
  async create(d) { return (await post('/reports', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/reports/${id}`, d)).data; },
  async delete(id) { await del(`/reports/${id}`); return { success: true }; },
  async generate(id) { return (await post(`/reports/${id}/generate`, {})).data; },
  async generateAdhoc(params) { return (await post('/reports/generate/adhoc', { workspace_id: wsId(), ...params })).data; },
};

// ── Integration ───────────────────────────────────────────────────────────────
// ProjectManagementIntegrations: integration.id, platform, connected, settings
export const Integration = {
  async list(params = {}) {
    const r = await get('/integrations', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}, _sort, limit) {
    const r = await get('/integrations', { workspace_id: wsId(), ...where, ...(limit && { limit }) });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/integrations/${id}`)).data; },
  async create(d) { return (await post('/integrations', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/integrations/${id}`, d)).data; },
  async delete(id) { await del(`/integrations/${id}`); return { success: true }; },
  async sync(id, integration_type) { return (await post(`/integrations/${id}/sync`, { integration_type })).data; },
};

// ── Automation ────────────────────────────────────────────────────────────────
// AutomationBuilder: { name, description, status, trigger:{type,platforms[],conditions[]}, actions:[{type,config}] }
export const Automation = {
  async list(params = {}) {
    const r = await get('/automations', { workspace_id: wsId(), ...params });
    return r.data ?? r;
  },
  async filter(where = {}) {
    const r = await get('/automations', { workspace_id: wsId(), ...where });
    return r.data ?? r;
  },
  async get(id) { return (await get(`/automations/${id}`)).data; },
  // AutomationBuilder.jsx onSave(automation)
  async create(d) { return (await post('/automations', { workspace_id: wsId(), ...d })).data; },
  async update(id, d) { return (await patch(`/automations/${id}`, d)).data; },
  async delete(id) { await del(`/automations/${id}`); return { success: true }; },
};

// ── Workspace ─────────────────────────────────────────────────────────────────
// PostComposer: Workspace.filter({ status: 'active' })
// AppearanceContext: reads workspace.settings.white_label
export const Workspace = {
  async list(params = {}) {
    const r = await get('/workspaces', params);
    return r.data ?? r;
  },
  async filter(where = {}) {
    const r = await get('/workspaces', where);
    return r.data ?? r;
  },
  async get(id) { return (await get(`/workspaces/${id}`)).data; },
  async create(d) { return (await post('/workspaces', d)).data; },
  async update(id, d) { return (await patch(`/workspaces/${id}`, d)).data; },
  async delete(id) { await del(`/workspaces/${id}`); return { success: true }; },
};
