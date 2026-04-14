/**
 * index.js — Nexus Social API SDK
 *
 * IMPORTANT: The canonical client for frontend use is base44Client.js
 * All 207 analysed components import from '@/api/base44Client'
 * This file maintains the internal SDK used server-side.
 */

/**
 * src/api/index.js — Complete Nexus Social SDK v2
 *
 * All namespaces used across all 61 pages:
 *   base44.auth.*           — auth methods
 *   base44.entities.*       — 24+ entity CRUD
 *   base44.appLogs.*        — NavigationTracker page logging
 *   base44.users.*          — Team.jsx + RoleManagement.jsx user management
 *   base44.integrations.*   — AI + CRM integrations
 *   base44.functions.*      — SocialListening.jsx function invocations
 */

import * as auth     from './auth.js';
import * as entities from './entities.js';
// ExportData.jsx: base44.entities[entityName].list() — dynamic entity access by string name
// All entities are already exported from entities.js, the import * makes them accessible as entities[name]
import { apiFetch, get, post, patch, del, uploadFile, setTokens, clearTokens, getAccessToken } from './client.js';

const wsId = () => localStorage.getItem('nexus_workspace_id') ?? '';

// ─── APP LOGS (NavigationTracker) ────────────────────────────────────────────

const appLogs = {
  // NavigationTracker.jsx: appLogs.logUserInApp({ page, action, metadata })
  async logUserInApp({ page, action, metadata } = {}) {
    return post('/app-logs', { page, action, metadata, workspace_id: wsId() }).catch(() => null);
  },
  async logUserInApp(pageName) {
    return post('/app-logs/page-view', {
      page_name:    pageName,
      workspace_id: wsId() || undefined,
      path:         window.location.pathname,
      referrer:     document.referrer || undefined,
    }).catch(() => null); // silently fail
  },
  async logEvent(eventType, pageName, metadata) {
    return post('/app-logs/event', {
      event_type: eventType, page_name: pageName,
      workspace_id: wsId() || undefined, metadata,
    }).catch(() => null);
  },
  async getPageAnalytics(params) {
    return get('/app-logs/page-analytics', { workspace_id: wsId(), ...params });
  },
};

// ─── AGENTS (base44.agents.* — AIAssistant.jsx + CustomerSupport.jsx) ──────────
const agents = {
  /**
   * agents.listConversations({ agent_name })
   * Called by AIAssistant.jsx + CustomerSupport.jsx on mount
   */
  async listConversations(params = {}) {
    const r = await get('/agents/conversations', params);
    return r.data ?? r;
  },

  /**
   * agents.getConversation(id)
   */
  async getConversation(id) {
    const r = await get(`/agents/conversations/${id}`);
    return r.data ?? r;
  },

  /**
   * agents.createConversation({ agent_name, metadata })
   */
  async createConversation({ agent_name = 'assistant', metadata = {}, workspace_id } = {}) {
    const r = await post('/agents/conversations', { agent_name, metadata, workspace_id: workspace_id ?? wsId() || undefined });
    return r.data ?? r;
  },

  /**
   * agents.addMessage(conversation, { role, content })
   * Returns the updated conversation with all messages
   */
  async addMessage(conversation, { role = 'user', content }) {
    const id = typeof conversation === 'string' ? conversation : conversation?.id;
    if (!id) throw new Error('conversation or conversation.id required');
    const r = await post(`/agents/conversations/${id}/messages`, { role, content });
    return r.data ?? r;
  },

  /**
   * agents.subscribeToConversation(id, callback)
   * Opens an SSE stream. Returns an unsubscribe function.
   * callback receives: { type, message, messages }
   */
  subscribeToConversation(conversationId, callback) {
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/v1';
    const token = localStorage.getItem('nexus_access_token') ?? localStorage.getItem('base44_access_token') ?? '';
    const url = `${BASE}/agents/conversations/${conversationId}/stream?token=${token}`;

    const es = new EventSource(url);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'connected') callback(data);
      } catch {}
    };
    es.onerror = () => es.close();

    // Return unsubscribe function (matches real Base44 agent API)
    return () => es.close();
  },

  /**
   * agents.getWhatsAppConnectURL(agentName)
   * CustomerSupport.jsx sidebar "Connect Now" link
   */
  async getWhatsAppConnectURL(agentName) {
    try {
      const r = await get(`/agents/whatsapp-url/${agentName}`);
      return r.data?.url ?? `https://wa.me/?text=${encodeURIComponent('Hi! I need help.')}`;
    } catch {
      return `https://wa.me/?text=${encodeURIComponent('Hi! I need help with Nexus Social.')}`;
    }
  },

  async deleteConversation(id) {
    return del(`/agents/conversations/${id}`);
  },

  async getStats(params = {}) {
    return get('/agents/stats', params);
  },
};

// ─── USERS (Team.jsx → base44.users.inviteUser) ───────────────────────────────

const users = {
  /**
   * inviteUser(email, roleString)
   * Matches: base44.users.inviteUser(email, role === 'admin' ? 'admin' : 'user')
   * Note: frontend passes 'admin' or 'user'; we map 'user' → 'member'
   */
  async inviteUser(email, roleOrType) {
    const role = roleOrType === 'admin' ? 'admin' : 'member';
    return post('/users/invite', { email, role, workspace_id: wsId() });
  },

  async acceptInvite(token) {
    return post('/users/accept-invite', { token });
  },

  async listMembers(workspaceId, params = {}) {
    return get(`/users/workspace/${workspaceId || wsId()}/members`, params);
  },

  async updateMember(workspaceId, memberId, data) {
    return patch(`/users/workspace/${workspaceId || wsId()}/members/${memberId}`, data);
  },

  async removeMember(workspaceId, memberId) {
    return del(`/users/workspace/${workspaceId || wsId()}/members/${memberId}`);
  },

  async listInvitations(workspaceId) {
    return get(`/users/workspace/${workspaceId || wsId()}/invitations`);
  },

  async revokeInvitation(invitationId) {
    return del(`/users/invitations/${invitationId}`);
  },

  async search(query) {
    return get('/users/search', { q: query });
  },
};

// ─── INTEGRATIONS (base44.integrations.Core.*) ───────────────────────────────

const integrations = {
  Core: {
    // ComplianceChecker.jsx + BrandVoiceTrainer.jsx use this for structured AI analysis
    // Routes to POST /ai/invoke-llm which uses GPT-4o with JSON mode
    async InvokeLLM({ prompt, response_json_schema, workspace_id }) {
      const r = await post('/ai/invoke-llm', {
        workspace_id: workspace_id ?? wsId(),
        prompt,
        response_json_schema,
      });
      return r.data;
    },
    // ContentGenerator.jsx: GenerateContent({ prompt, contentType, tone, keywords, platform })
    // Returns: { text, hashtags, suggested_media, call_to_action, best_post_time, estimated_reach }
    // NOTE: ContentGenerator uses setTimeout stub in frontend — real API route exists at /ai/generate-content
    async GenerateContent({ platform, topic, tone, post_type, hashtag_count, prompt, contentType, keywords } = {}) {
      const r = await post('/ai/generate-content', {
        workspace_id: wsId(),
        platform:     platform || 'instagram',
        topic:        topic   || prompt,       // ContentGenerator sends 'prompt' not 'topic'
        tone:         tone    || 'casual',
        post_type:    post_type || contentType || 'Social Post',
        hashtag_count: hashtag_count || 5,
        keywords:     keywords,
      });
      return r.data;
    },
    // CrisisDetector.jsx: SendEmail({ to, subject, body }) → real SMTP via /admin/email/send
    async SendEmail({ to, subject, body, html }) {
      return post('/admin/email/send', { to, subject, body: body || html });
    },
    // AIAssistant.jsx: integrations.Core.ExtractDataFromUploadedFile({ file_url, extraction_prompt })
    async ExtractDataFromUploadedFile({ file_url, extraction_prompt, file_type } = {}) {
      if (!file_url) throw new Error('file_url required');
      const r = await post('/agents/extract', { file_url, extraction_prompt, file_type });
      return r.data ?? r;
    },

    async UploadFile({ file, tags, alt_text }) {
      const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/v1';
      const fd = new FormData();
      fd.append('file', file);
      fd.append('workspace_id', wsId());
      if (tags) fd.append('tags', JSON.stringify(tags));
      if (alt_text) fd.append('alt_text', alt_text);
      const r = await fetch(`${BASE}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('nexus_access_token')}` },
        body: fd,
      });
      const data = await r.json();
      return { file_url: data.data?.file_url ?? null };
    },
  },
};

// ─── FUNCTIONS (SocialListening.jsx → base44.functions.invoke) ───────────────
// SocialListening.jsx calls these function names:
//   'aiSocialListening'  with actions: monitor_mentions, analyze_sentiment, detect_crisis, track_competitor
//   'socialListening'    with actions: detect_trends

const functions = {
  async invoke(functionName, params) {
    const { action, workspace_id, keywords, competitor_id, industry, brand_keywords, ...rest } = params ?? {};
    const wid = workspace_id ?? wsId();

    // Map Base44 function names + actions to our API endpoints
    const handlers = {
      aiSocialListening: {
        monitor_mentions:     () => post('/ai/monitor',                        { workspace_id: wid, keyword_ids: keywords?.map((k) => k.id) }),
        analyze_sentiment:    () => post('/ai/sentiment',                      { workspace_id: wid }),
        detect_crisis:        () => post('/ai/crisis',                         { workspace_id: wid }),
        track_competitor:     () => post(`/ai/competitors/${competitor_id}/analyze`, { workspace_id: wid }),
        // CrisisDetector.jsx: execute pre-approved automated responses
        execute_crisis_response: () => post('/ai/crisis/execute',              { workspace_id: wid, alert_id: params?.alert_id, responses: params?.responses }),
      },
      socialListening: {
        detect_trends:  () => post('/ai/trends',        { workspace_id: wid, industry, brand_keywords }),
        // AlertsPanel.jsx: functions.invoke('socialListening', { action: 'check_alerts', workspace_id })
        check_alerts:   () => post('/ai/check-alerts',  { workspace_id: wid }),
      },
      // Integrations.jsx: functions.invoke('syncIntegration', { integration_id, integration_type })
      syncIntegration:        () => post(`/integrations/${params?.integration_id}/sync`, { integration_type: params?.integration_type }),

    // ExportData.jsx: functions.invoke('exportToSQL', {})
      exportToSQL:            () => get('/ai/export/sql', { workspace_id: wid }),

    // Legacy function names
      // SyncStatusCard: functions.invoke('syncSocialData', { platform, account_id })
      syncSocialData:         () => post('/admin/run/sync-all', params),
      generateClientReport:   () => post('/reports/generate/adhoc', params),
      syncAllAccounts:        () => post('/admin/run/sync-all', params),
      publishPosts:           () => post('/admin/run/publisher', params),
      syncAnalytics:          () => post('/analytics/sync', params),
      // AnalyticsDashboard.jsx: functions.invoke('syncSocialAnalytics', { workspace_id, platform, account_id })
      syncSocialAnalytics:    () => post('/analytics/sync', { workspace_id: wid, platform: params?.platform, account_id: params?.account_id }),
      predictiveMonetization: () => post('/ai/predictive-monetization', { workspace_id: wid, ...rest }),
      // PostComposer.jsx handleAIEnhance → replaces the mock AI analysis in PostComposer
      analyzePost: () => post('/ai/post-analysis', { workspace_id: wid, content: params?.content, platforms: params?.platforms, post_type: params?.post_type, campaign_id: params?.campaign_id }),
    };

    // Handle namespaced functions (aiSocialListening + action)
    if (handlers[functionName] && typeof handlers[functionName] === 'object' && action) {
      const actionFn = handlers[functionName][action];
      if (!actionFn) throw new Error(`Unknown action '${action}' for function '${functionName}'`);
      return actionFn();
    }

    // Handle flat function names
    const fn = handlers[functionName];
    if (typeof fn === 'function') return fn();

    throw new Error(`Unknown function: ${functionName}`);
  },
};

// ─── MAIN CLIENT ─────────────────────────────────────────────────────────────

export function createClient() {
  return {
    auth, entities, appLogs, users, agents, integrations, functions,
    fetch: apiFetch, get, post, patch, delete: del, upload: uploadFile,
    asServiceRole: { entities, functions, integrations, appLogs, users },
  };
}

export const nexus  = createClient();
export const base44 = nexus;

export { auth, entities, appLogs, users, agents, integrations, functions };
export { setTokens, clearTokens, getAccessToken };

export default nexus;
