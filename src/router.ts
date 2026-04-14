import { Router, Request, Response } from 'express';
import authRoutes         from './modules/auth/auth.routes';
import postsRoutes        from './modules/posts/posts.routes';
import aiRoutes           from './modules/ai/ai.routes';
import { stripeRouter }   from './modules/stripe/stripe.routes';
import notifRoutes        from './modules/notifications/notifications.routes';
import approvalRoutes     from './modules/approval/approval.routes';
import { agencyRouter, appearanceRouter } from './modules/agency/agency.routes';
import appLogsRoutes     from './modules/app-logs/app-logs.routes';
import usersRoutes       from './modules/users/users.routes';
import videosRoutes      from './modules/videos/videos.routes';
import commentsRoutes    from './modules/platform-comments/comments.routes';
import agentsRoutes       from './modules/agents/agents.routes';
import oauthRoutes        from './modules/auth/oauth.routes';
import reviewsRoutes       from './modules/reviews/reviews.routes';
import liveNotifRoutes     from './modules/live-notifications/live-notifications.routes';
import { authenticate, requireAdmin } from './middleware/auth';
import { AuthRequest }    from './types';
import db                 from './config/database';
import { logger }         from './config/logger';
import { ok, created, fail, notFound, paginated, parsePage, encrypt } from './utils';
import { syncPlatform, PLATFORM_META } from './platform-integrations';
import { syncQueue, analyticsQueue, publishQueue, reportQueue } from './jobs';

const router = Router();

// ─── HEALTH ───────────────────────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok', ts: new Date().toISOString(), version: '2.0.0' }));

// ─── CORE MODULES ─────────────────────────────────────────────────────────────
router.use('/auth',         authRoutes);

// ─── PUBLIC APP SETTINGS ──────────────────────────────────────────────────────
// GET /app/public-settings — NO AUTH REQUIRED
// Called by AuthContext.jsx on app boot BEFORE authentication.
// Replaces AuthContext's call to Base44 platform /prod/public-settings/by-id/:appId
// Returns workspace branding, white-label config, and feature flags.
//
// Response shape matches what AuthContext.jsx stores as appPublicSettings:
//   { id, name, logo_url, favicon_url, primary_color, white_label:{},
//     features:{}, plan, public_signup_enabled }
//
// Error responses trigger authError in AuthContext.jsx:
//   403 + extra_data.reason = 'auth_required'       → redirect to login
//   403 + extra_data.reason = 'user_not_registered' → show UserNotRegisteredError
//   403 + extra_data.reason = 'token_expired'       → refresh token flow
router.get('/app/public-settings', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  // If a token is provided, validate it and check user registration
  if (token) {
    try {
      const { verifyToken } = await import('./middleware/auth');
      const decoded = verifyToken(token);
      const user    = await db.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, role: true, workspace_members: { select: { workspace_id: true } } } });

      if (!user) {
        res.status(403).json({ success: false, error: 'User not found', extra_data: { reason: 'user_not_registered' } });
        return;
      }

      // Get the user's primary workspace
      const workspaceId = user.workspace_members[0]?.workspace_id;
      if (workspaceId) {
        const workspace = await db.workspace.findUnique({
          where:   { id: workspaceId },
          include: { appearance_settings: true, subscription: { select: { plan: true, plan_id: true } } },
        });

        const settings = (workspace?.settings as any) || {};
        const appearance = workspace?.appearance_settings as any;
        const wl = settings.white_label || {};

        res.json({ success: true, data: {
          id:                   workspaceId,
          name:                 wl.brand_name  || workspace?.name || 'Nexus Social',
          logo_url:             wl.logo_url    || appearance?.logo_url || null,
          favicon_url:          wl.favicon_url || null,
          primary_color:        wl.primary_color || appearance?.primary_color || '#d4af37',
          secondary_color:      wl.secondary_color || '#f4cf47',
          accent_color:         wl.accent_color || '#0ea5e9',
          hide_powered_by:      wl.hide_powered_by || false,
          custom_footer_text:   wl.custom_footer_text || null,
          client_portal_enabled:wl.client_portal_enabled || false,
          white_label:          wl,
          plan:                 workspace?.subscription?.plan_id || 'free',
          features: {
            ai_assistant:       true,
            social_listening:   true,
            multi_workspace:    (workspace?.subscription?.plan_id || 'free') !== 'free',
            white_label:        ['agency'].includes(workspace?.subscription?.plan_id || ''),
          },
          public_signup_enabled: true,
        }});
        return;
      }
    } catch (e) {
      const msg = (e as Error).message || '';
      // Token issues → tell client auth_required so it redirects to login
      if (msg.includes('expired') || msg.includes('invalid')) {
        res.status(403).json({ success: false, error: 'Token expired', extra_data: { reason: 'auth_required' } });
        return;
      }
    }
  }

  // No token or unauthenticated — return generic public settings
  res.json({ success: true, data: {
    id:                   'nexus-social',
    name:                 'Nexus Social',
    logo_url:             null,
    favicon_url:          null,
    primary_color:        '#d4af37',
    secondary_color:      '#f4cf47',
    accent_color:         '#0ea5e9',
    hide_powered_by:      false,
    white_label:          {},
    plan:                 'free',
    features:             { ai_assistant: true, social_listening: true, multi_workspace: false, white_label: false },
    public_signup_enabled: true,
  }});
});
router.use('/posts',        postsRoutes);
router.use('/ai',           aiRoutes);
router.use('/stripe',       stripeRouter);
router.use('/notifications', notifRoutes);
router.use('/approval',     approvalRoutes);
router.use('/agency',       agencyRouter);
router.use('/appearance',   appearanceRouter);
router.use('/app-logs',     appLogsRoutes);
router.use('/users',        usersRoutes);
router.use('/videos',       videosRoutes);
router.use('/platform-comments', commentsRoutes);
router.use('/agents',            agentsRoutes);
router.use('/oauth',             oauthRoutes);
router.use('/reviews',           reviewsRoutes);
router.use('/live-notifications', liveNotifRoutes);

// ─── SOCIAL ACCOUNTS ──────────────────────────────────────────────────────────
const accounts = Router();
accounts.use(authenticate);
accounts.get('/', async (req: any, res) => {
  const { workspace_id, platform, status } = req.query as Record<string,string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const rows = await db.socialAccount.findMany({ where: { workspace_id, ...(platform && { platform: platform as any }), ...(status && { status: status as any }) }, include: { brand: { select: { id: true, name: true } }, _count: { select: { analytics: true } } }, orderBy: { created_at: 'asc' } });
  ok(res, rows.map(({ access_token: _, refresh_token: __, ...r }) => r));
});
accounts.get('/:id', async (req: any, res) => {
  const a = await db.socialAccount.findUnique({ where: { id: req.params.id }, include: { analytics: { orderBy: { date: 'desc' }, take: 7 } } });
  if (!a) { notFound(res, 'Account'); return; }
  const { access_token: _, refresh_token: __, ...safe } = a;
  ok(res, safe);
});
accounts.post('/', async (req: any, res) => {
  const { access_token, refresh_token, ...rest } = req.body;
  created(res, await db.socialAccount.create({ data: { ...rest, follower_count: rest.follower_count ?? 0, access_token: access_token ? encrypt(access_token) : null, refresh_token: refresh_token ? encrypt(refresh_token) : null, token_expires_at: rest.token_expires_at ? new Date(rest.token_expires_at) : null } }).then(({ access_token: _, refresh_token: __, ...s }) => s));
});
accounts.patch('/:id', async (req: any, res) => {
  const { access_token, refresh_token, ...rest } = req.body;
  const a = await db.socialAccount.update({ where: { id: req.params.id }, data: { ...rest, ...(access_token && { access_token: encrypt(access_token) }), ...(refresh_token && { refresh_token: encrypt(refresh_token) }) } });
  const { access_token: _, refresh_token: __, ...safe } = a; ok(res, safe);
});
accounts.delete('/:id', async (req: any, res) => { await db.socialAccount.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
accounts.post('/:id/sync', async (req: any, res) => { const a = await db.socialAccount.findUnique({ where: { id: req.params.id } }); if (!a) { notFound(res, 'Account'); return; } const job = await syncQueue.add({ accountId: a.id, platform: a.platform }); ok(res, { queued: true, job_id: job.id }); });
accounts.post('/:id/sync/now', async (req: any, res) => {
  const a = await db.socialAccount.findUnique({ where: { id: req.params.id } }); if (!a) { notFound(res, 'Account'); return; }
  const result = await syncPlatform(a);
  await db.socialAccount.update({ where: { id: a.id }, data: { last_synced_at: new Date(), health_status: result.error ? 'error' : 'healthy', health_message: result.error ?? 'Synced', ...(result.follower_count != null && { follower_count: result.follower_count }), ...(result.following_count != null && { following_count: result.following_count }) } });
  ok(res, result);
});
router.use('/social-accounts', accounts);

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
const analytics = Router();
analytics.use(authenticate);
analytics.get('/', async (req: any, res) => {
  const { workspace_id, platform, social_account_id, post_id, sort,
          period, date_from, date_to, group_by, account_id } = req.query as Record<string,string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const { page, limit, skip } = parsePage(req.query);
  const dateFilter: any = {};
  if (period === '24h')  dateFilter.gte = new Date(Date.now() - 86_400_000);
  if (period === '7d')   dateFilter.gte = new Date(Date.now() - 7  * 86_400_000);
  if (period === '30d')  dateFilter.gte = new Date(Date.now() - 30 * 86_400_000);
  if (period === '90d')  dateFilter.gte = new Date(Date.now() - 90 * 86_400_000);
  if (date_from)         dateFilter.gte = new Date(date_from);
  if (date_to)           dateFilter.lte = new Date(date_to);
  const where: any = {
    workspace_id,
    ...(platform               && { platform: platform as any }),
    ...(social_account_id || account_id ? { social_account_id: social_account_id || account_id } : {}),
    ...(post_id               && { post_id }),
    ...(Object.keys(dateFilter).length && { date: dateFilter }),
  };
  const [total, rows] = await Promise.all([
    db.analytics.count({ where }),
    db.analytics.findMany({ where, orderBy: { date: sort === 'date' ? 'asc' : 'desc' }, skip, take: limit }),
  ]);
  // AudienceEngagement.jsx uses group_by=hour to build 24-slot heatmap
  if (group_by === 'hour') {
    const hourMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourMap[h] = 0;
    rows.forEach((r: any) => { const h = new Date(r.date).getHours(); hourMap[h] += r.engagement || 0; });
    ok(res, { data: Object.entries(hourMap).map(([hour, eng]) => ({ hour: +hour, engagement: eng })), meta: { grouped_by: 'hour', total_rows: rows.length } });
    return;
  }
  paginated(res, rows, total, page, limit);
});;
analytics.get('/summary', async (req: any, res) => {
  const { workspace_id, start_date, end_date } = req.query as Record<string,string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const d30 = new Date(); d30.setDate(d30.getDate() - 30);
  const start = start_date ?? d30.toISOString().split('T')[0], end = end_date ?? new Date().toISOString().split('T')[0];
  const rows = await db.analytics.findMany({ where: { workspace_id, date: { gte: start, lte: end } } });
  ok(res, { total_reach: rows.reduce((s,r)=>s+r.reach,0), total_engagement: rows.reduce((s,r)=>s+r.engagement,0), total_impressions: rows.reduce((s,r)=>s+r.impressions,0), total_conversions: rows.reduce((s,r)=>s+r.conversions,0), engagement_rate: rows.length ? (rows.reduce((s,r)=>s+r.engagement_rate,0)/rows.length).toFixed(2) : '0.00', period: { start, end }, record_count: rows.length });
});
analytics.get('/breakdown', async (req: any, res) => {
  const { workspace_id, start_date, end_date } = req.query as Record<string,string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  ok(res, await db.analytics.groupBy({ by: ['platform'], where: { workspace_id, platform: { not: null }, ...(start_date && end_date && { date: { gte: start_date, lte: end_date } }) }, _sum: { reach: true, engagement: true, impressions: true }, _avg: { engagement_rate: true }, _count: { id: true } }));
});
analytics.post('/sync', async (req: any, res) => {
  const { workspace_id, account_id, platform } = req.body;
  if (!workspace_id || !account_id || !platform) { fail(res, 'workspace_id, account_id, platform required'); return; }
  const job = await analyticsQueue.add({ workspaceId: workspace_id, accountId: account_id, platform });
  ok(res, { queued: true, job_id: job.id });
});
router.use('/analytics', analytics);

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────
const campaigns = Router();
campaigns.use(authenticate);
campaigns.get('/', async (req: any, res) => { const { workspace_id, status } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const { page, limit, skip } = parsePage(req.query); const where: any = { workspace_id, ...(status && { status }) }; const [total, rows] = await Promise.all([db.campaign.count({ where }), db.campaign.findMany({ where, include: { _count: { select: { posts: true } } }, orderBy: { created_at: 'desc' }, skip, take: limit })]);  paginated(res, rows, total, page, limit); });
campaigns.get('/:id', async (req: any, res) => { const row = await db.campaign.findUnique({ where: { id: req.params.id }, include: { posts: { include: { platforms: { select: { platform: true, status: true } } }, take: 50 } } }); if (!row) { notFound(res, 'Campaign'); return; } ok(res, row); });
campaigns.post('/', async (req: any, res) => {
  const { start_date, end_date, kpis, utm_parameters, budget, ...rest } = req.body;
  created(res, await db.campaign.create({ data: {
    ...rest,
    tags:           rest.tags ?? [],
    platforms:      rest.platforms ?? [],
    start_date:     start_date ? new Date(start_date) : null,
    end_date:       end_date   ? new Date(end_date)   : null,
    kpis:           kpis           ? kpis           as any : null,
    utm_parameters: utm_parameters ? utm_parameters as any : null,
    budget:         budget ? (typeof budget === 'string' ? { total: budget } : budget) as any : null,
  } }));
});
campaigns.patch('/:id', async (req: any, res) => {
  const { start_date, end_date, kpis, utm_parameters, budget, ...rest } = req.body;
  ok(res, await db.campaign.update({ where: { id: req.params.id }, data: {
    ...rest,
    ...(start_date     && { start_date: new Date(start_date) }),
    ...(end_date       && { end_date: new Date(end_date) }),
    ...(kpis           && { kpis: kpis as any }),
    ...(utm_parameters && { utm_parameters: utm_parameters as any }),
    ...(budget !== undefined && { budget: (typeof budget === 'string' ? { total: budget } : budget) as any }),
  } }));
});
campaigns.delete('/:id', async (req: any, res) => { await db.campaign.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
router.use('/campaigns', campaigns);

// ─── WORKSPACES ───────────────────────────────────────────────────────────────
const workspaces = Router();
workspaces.use(authenticate);
workspaces.get('/', async (req: any, res) => {
  // Workspace.list() and Workspace.filter({ status, id }) — used by ClientPortal, CampaignBuilder
  const { status, id } = req.query as Record<string,string>;
  const where: any = {
    ...(id && { id }),       // ClientPortal: Workspace.filter({ id: workspaceId })
    ...(status === 'active' && { is_active: true }),
    // AgencyClientManagement: Workspace.filter({ plan: 'agency' })
    ...(req.query.plan && { plan: req.query.plan as string }),
    members: { some: { user_id: req.user?.userId, is_active: true } },
  };
  const rows = await db.workspace.findMany({ where, include: { subscription: { select: { plan: true, plan_id: true, status: true, usage_limits: true, current_usage: true } }, appearance_settings: { select: { primary_color: true, logo_url: true, brand_name: true } }, _count: { select: { social_accounts: true, posts: true, campaigns: true } } }, orderBy: { created_at: 'asc' } });
  ok(res, rows);
});

workspaces.get('/:id', async (req: any, res) => { const ws = await db.workspace.findUnique({ where: { id: req.params.id }, include: { members: { where: { is_active: true }, include: { user: { select: { id: true, email: true, display_name: true, avatar_url: true } }, custom_role: true } }, subscription: true, appearance_settings: true, onboarding_state: true, _count: { select: { social_accounts: true, posts: true, campaigns: true, agency_clients: true } } } }); if (!ws) { notFound(res, 'Workspace'); return; } ok(res, ws); });
workspaces.patch('/:id', async (req: any, res) => {
  const { settings, ...rest } = req.body;
  // Deep merge settings (ClientPortal saves custom_kpis + custom_dashboard_layout)
  if (settings) {
    const existing = await db.workspace.findUnique({ where: { id: req.params.id }, select: { settings: true } });
    const merged = { ...(existing?.settings as any ?? {}), ...settings };
    ok(res, await db.workspace.update({ where: { id: req.params.id }, data: { ...rest, settings: merged } }));
  } else {
    ok(res, await db.workspace.update({ where: { id: req.params.id }, data: rest }));
  }
});
workspaces.get('/:id/brands', async (req: any, res) => {
  const { status } = req.query as { status?: string };
  ok(res, await db.brand.findMany({
    where: { workspace_id: req.params.id, ...(status && { status }) },
    include: { _count: { select: { social_accounts: true } } },
    orderBy: { name: 'asc' },
  }));
});
workspaces.post('/:id/brands', async (req: any, res) => { created(res, await db.brand.create({ data: { workspace_id: req.params.id, ...req.body } })); });
workspaces.patch('/:id/brands/:brandId', async (req: any, res) => { ok(res, await db.brand.update({ where: { id: req.params.brandId }, data: req.body })); });
workspaces.delete('/:id/brands/:brandId', async (req: any, res) => { await db.brand.delete({ where: { id: req.params.brandId } }); ok(res, { deleted: true }); });
workspaces.post('/:id/members', async (req: any, res) => { const { user_id, role } = req.body; const m = await db.workspaceMember.upsert({ where: { workspace_id_user_id: { workspace_id: req.params.id, user_id } }, create: { workspace_id: req.params.id, user_id, role: role ?? 'member', joined_at: new Date() }, update: { role, is_active: true } }); created(res, m); });
workspaces.delete('/:id/members/:userId', async (req: any, res) => { if (req.params.userId === req.user?.userId) { fail(res, 'Cannot remove yourself'); return; } await db.workspaceMember.update({ where: { workspace_id_user_id: { workspace_id: req.params.id, user_id: req.params.userId } }, data: { is_active: false } }); ok(res, { removed: true }); });
router.use('/workspaces', workspaces);

// ─── CONTACTS & CONVERSATIONS (Inbox page) ────────────────────────────────────
const contacts = Router();
contacts.use(authenticate);
contacts.get('/', async (req: any, res) => { const { workspace_id, platform, is_influencer, search } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const { page, limit, skip } = parsePage(req.query); const where: any = { workspace_id, ...(platform && { platform }), ...(is_influencer !== undefined && { is_influencer: is_influencer === 'true' }), ...(search && { OR: [{ display_name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }) }; const [total, rows] = await Promise.all([db.contact.count({ where }), db.contact.findMany({ where, include: { _count: { select: { conversations: true } } }, orderBy: { created_at: 'desc' }, skip, take: limit })]);  paginated(res, rows, total, page, limit); });
contacts.post('/', async (req: any, res) => { created(res, await db.contact.create({ data: { ...req.body, follower_count: req.body.follower_count ?? 0, tags: req.body.tags ?? [], is_influencer: req.body.is_influencer ?? false } })); });
contacts.patch('/:id', async (req: any, res) => { ok(res, await db.contact.update({ where: { id: req.params.id }, data: req.body })); });
contacts.delete('/:id', async (req: any, res) => { await db.contact.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
router.use('/contacts', contacts);

const convs = Router();
convs.use(authenticate);
convs.get('/', async (req: any, res) => { const { workspace_id, status, platform } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const { page, limit, skip } = parsePage(req.query); const [total, rows] = await Promise.all([db.conversation.count({ where: { workspace_id, ...(status && { status }), ...(platform && { platform: platform as any }) } }), db.conversation.findMany({ where: { workspace_id, ...(status && { status }), ...(platform && { platform: platform as any }) }, include: { contact: { select: { id: true, display_name: true, username: true } } }, orderBy: { last_message_at: 'desc' }, skip, take: limit })]);  paginated(res, rows, total, page, limit); });
convs.post('/', async (req: any, res) => { created(res, await db.conversation.create({ data: { ...req.body, messages: [], status: 'open' } })); });
convs.post('/:id/messages', async (req: any, res) => { const conv = await db.conversation.findUnique({ where: { id: req.params.id } }); if (!conv) { notFound(res, 'Conversation'); return; } const msg = { id: crypto.randomUUID(), ...req.body, author_id: req.user?.userId, sent_at: new Date().toISOString() }; ok(res, await db.conversation.update({ where: { id: req.params.id }, data: { messages: [...(conv.messages as any[]), msg], last_message_at: new Date() } })); });
convs.patch('/:id/status', async (req: any, res) => { ok(res, await db.conversation.update({ where: { id: req.params.id }, data: { status: req.body.status } })); });
router.use('/conversations', convs);

// ─── TEAM (Collaboration page) ────────────────────────────────────────────────
const team = Router();
team.use(authenticate);
team.get('/tasks', async (req: any, res) => { const { workspace_id, status, priority } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const { page, limit, skip } = parsePage(req.query); const [total, rows] = await Promise.all([db.teamTask.count({ where: { workspace_id, ...(status && { status }), ...(priority && { priority }) } }), db.teamTask.findMany({ where: { workspace_id, ...(status && { status }), ...(priority && { priority }) }, orderBy: [{ priority: 'asc' }, { due_date: 'asc' }], skip, take: limit })]);  paginated(res, rows, total, page, limit); });
team.post('/tasks', async (req: any, res) => { const { due_date, ...rest } = req.body; created(res, await db.teamTask.create({ data: { ...rest, status: rest.status ?? 'todo', priority: rest.priority ?? 'medium', tags: rest.tags ?? [], due_date: due_date ? new Date(due_date) : null, created_by: req.user?.userId } })); });
team.patch('/tasks/:id', async (req: any, res) => { const { due_date, ...rest } = req.body; ok(res, await db.teamTask.update({ where: { id: req.params.id }, data: { ...rest, ...(due_date && { due_date: new Date(due_date) }) } })); });
team.delete('/tasks/:id', async (req: any, res) => { await db.teamTask.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
team.post('/tasks/bulk/status', async (req: any, res) => { const { task_ids, status } = req.body; const result = await db.teamTask.updateMany({ where: { id: { in: task_ids } }, data: { status } }); ok(res, { updated: result.count }); });
team.get('/discussions', async (req: any, res) => { const { workspace_id } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const { page, limit, skip } = parsePage(req.query); const [total, rows] = await Promise.all([db.teamDiscussion.count({ where: { workspace_id } }), db.teamDiscussion.findMany({ where: { workspace_id }, orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }], skip, take: limit })]);  paginated(res, rows, total, page, limit); });
team.post('/discussions', async (req: any, res) => { created(res, await db.teamDiscussion.create({ data: { ...req.body, replies: [], is_pinned: req.body.is_pinned ?? false, author_id: req.user?.userId } })); });
team.post('/discussions/:id/replies', async (req: any, res) => { const d = await db.teamDiscussion.findUnique({ where: { id: req.params.id } }); if (!d) { notFound(res, 'Discussion'); return; } const reply = { id: crypto.randomUUID(), ...req.body, author_id: req.user?.userId, created_at: new Date().toISOString() }; ok(res, await db.teamDiscussion.update({ where: { id: req.params.id }, data: { replies: [...(d.replies as any[]), reply] } })); });
router.use('/team', team);

// ─── REVENUE & BRAND DEALS (CreatorEconomy, Monetization pages) ───────────────
const revenue = Router();
revenue.use(authenticate);
revenue.get('/deals', async (req: any, res) => { const { workspace_id, status } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const { page, limit, skip } = parsePage(req.query); const [total, rows] = await Promise.all([db.brandDeal.count({ where: { workspace_id, ...(status && { status }) } }), db.brandDeal.findMany({ where: { workspace_id, ...(status && { status }) }, include: { brand: { select: { id: true, name: true } }, revenues: true }, orderBy: { created_at: 'desc' }, skip, take: limit })]);  paginated(res, rows, total, page, limit); });
revenue.post('/deals', async (req: any, res) => { const { start_date, end_date, ...rest } = req.body; created(res, await db.brandDeal.create({ data: { ...rest, deliverables: rest.deliverables ?? [], start_date: start_date ? new Date(start_date) : null, end_date: end_date ? new Date(end_date) : null } })); });
revenue.patch('/deals/:id', async (req: any, res) => { ok(res, await db.brandDeal.update({ where: { id: req.params.id }, data: req.body })); });
revenue.delete('/deals/:id', async (req: any, res) => { await db.brandDeal.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
revenue.get('/entries', async (req: any, res) => { const { workspace_id, source, start_date, end_date } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const { page, limit, skip } = parsePage(req.query); const where: any = { workspace_id, ...(source && { source }), ...(start_date || end_date) && { date: { ...(start_date && { gte: new Date(start_date) }), ...(end_date && { lte: new Date(end_date) }) } } }; const [total, rows, agg] = await Promise.all([db.revenue.count({ where }), db.revenue.findMany({ where, include: { brand_deal: { select: { id: true, deal_name: true } } }, orderBy: { date: 'desc' }, skip, take: limit }), db.revenue.aggregate({ where, _sum: { amount: true } })]); res.json({ success: true, data: rows, summary: { total_amount: agg._sum.amount ?? 0 }, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }); });
revenue.post('/entries', async (req: any, res) => { created(res, await db.revenue.create({ data: { ...req.body, date: req.body.date ? new Date(req.body.date) : new Date() } })); });
revenue.delete('/entries/:id', async (req: any, res) => { await db.revenue.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
revenue.get('/summary', async (req: any, res) => { const { workspace_id, start_date, end_date } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const where: any = { workspace_id, ...(start_date || end_date) && { date: { ...(start_date && { gte: new Date(start_date) }), ...(end_date && { lte: new Date(end_date) }) } } }; const [bySource, agg] = await Promise.all([db.revenue.groupBy({ by: ['source'], where, _sum: { amount: true }, _count: { id: true } }), db.revenue.aggregate({ where, _sum: { amount: true } })]); ok(res, { total: agg._sum.amount ?? 0, by_source: bySource }); });
router.use('/revenue', revenue);

// ─── CONTENT TOOLS (Content, Automations pages) ───────────────────────────────
const content = Router();
content.use(authenticate);
content.get('/templates', async (req: any, res) => { const { workspace_id, platform } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } ok(res, await db.contentTemplate.findMany({ where: { workspace_id, ...(platform && { platform: platform as any }) }, orderBy: [{ use_count: 'desc' }, { created_at: 'desc' }] })); });
content.post('/templates', async (req: any, res) => { created(res, await db.contentTemplate.create({ data: { ...req.body, content: req.body.content ?? {}, tags: req.body.tags ?? [] } })); });
content.patch('/templates/:id', async (req: any, res) => { ok(res, await db.contentTemplate.update({ where: { id: req.params.id }, data: req.body })); });
content.delete('/templates/:id', async (req: any, res) => { await db.contentTemplate.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
content.post('/templates/:id/use', async (req: any, res) => { ok(res, await db.contentTemplate.update({ where: { id: req.params.id }, data: { use_count: { increment: 1 } } })); });
content.get('/saved-replies', async (req: any, res) => { const { workspace_id, search } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } ok(res, await db.savedReply.findMany({ where: { workspace_id, ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }] }) }, orderBy: [{ use_count: 'desc' }, { created_at: 'desc' }] })); });
content.post('/saved-replies', async (req: any, res) => { created(res, await db.savedReply.create({ data: { ...req.body, tags: req.body.tags ?? [] } })); });
content.patch('/saved-replies/:id', async (req: any, res) => { ok(res, await db.savedReply.update({ where: { id: req.params.id }, data: req.body })); });
content.delete('/saved-replies/:id', async (req: any, res) => { await db.savedReply.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
content.post('/saved-replies/:id/use', async (req: any, res) => { ok(res, await db.savedReply.update({ where: { id: req.params.id }, data: { use_count: { increment: 1 } } })); });
content.get('/automations', async (req: any, res) => { const { workspace_id, is_active } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } ok(res, await db.automation.findMany({ where: { workspace_id, ...(is_active !== undefined && { is_active: is_active === 'true' }) }, orderBy: { created_at: 'desc' } })); });
content.post('/automations', async (req: any, res) => { created(res, await db.automation.create({ data: { ...req.body, trigger: req.body.trigger ?? {}, actions: req.body.actions ?? [], is_active: req.body.is_active ?? true } })); });
content.patch('/automations/:id', async (req: any, res) => { ok(res, await db.automation.update({ where: { id: req.params.id }, data: req.body })); });
content.delete('/automations/:id', async (req: any, res) => { await db.automation.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
content.post('/automations/:id/toggle', async (req: any, res) => { const a = await db.automation.findUnique({ where: { id: req.params.id }, select: { id: true, is_active: true } }); if (!a) { notFound(res, 'Automation'); return; } ok(res, await db.automation.update({ where: { id: req.params.id }, data: { is_active: !a.is_active } })); });
router.use('/content', content);

// ─── SOCIAL LISTENING ─────────────────────────────────────────────────────────
const listening = Router();
listening.use(authenticate);
listening.get('/mentions', async (req: any, res) => { const { workspace_id, sentiment, status, is_crisis } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const { page, limit, skip } = parsePage(req.query); const [total, rows] = await Promise.all([db.mention.count({ where: { workspace_id, ...(sentiment && { sentiment }), ...(status && { status }), ...(is_crisis !== undefined && { is_crisis: is_crisis === 'true' }) } }), db.mention.findMany({ where: { workspace_id, ...(sentiment && { sentiment }), ...(status && { status }) }, orderBy: [{ priority: 'asc' }, { mentioned_at: 'desc' }], skip, take: limit })]);  paginated(res, rows, total, page, limit); });
listening.patch('/mentions/:id', async (req: any, res) => { ok(res, await db.mention.update({ where: { id: req.params.id }, data: req.body })); });
listening.get('/keywords', async (req: any, res) => { const { workspace_id } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } ok(res, await db.keywordTrack.findMany({ where: { workspace_id }, orderBy: { created_at: 'desc' } })); });
listening.post('/keywords', async (req: any, res) => { created(res, await db.keywordTrack.create({ data: req.body })); });
listening.patch('/keywords/:id', authenticate, async (req: any, res) => {
  ok(res, await db.keywordTrack.update({ where: { id: req.params.id }, data: req.body }));
});
listening.delete('/keywords/:id', async (req: any, res) => { await db.keywordTrack.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
listening.get('/competitors', async (req: any, res) => { const { workspace_id } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } ok(res, await db.competitorTrack.findMany({ where: { workspace_id, is_active: true }, orderBy: { created_at: 'desc' } })); });
listening.post('/competitors', async (req: any, res) => { created(res, await db.competitorTrack.create({ data: { ...req.body, social_handles: req.body.social_handles ?? {}, tracking_keywords: req.body.tracking_keywords ?? [] } })); });
listening.patch('/competitors/:id', authenticate, async (req: any, res) => {
  ok(res, await db.competitorTrack.update({ where: { id: req.params.id }, data: req.body }));
});
listening.delete('/competitors/:id', async (req: any, res) => { await db.competitorTrack.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
listening.get('/trends', async (req: any, res) => { const { workspace_id } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } ok(res, await db.trendAnalysis.findMany({ where: { workspace_id }, orderBy: { detected_at: 'desc' }, take: 20 })); });
listening.get('/alerts', async (req: any, res) => {
  const { workspace_id } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const oneHrAgo = new Date(Date.now() - 3_600_000);
  const [recent, crisis] = await Promise.all([db.mention.findMany({ where: { workspace_id, created_at: { gte: oneHrAgo } } }), db.mention.findMany({ where: { workspace_id, is_crisis: true, status: 'new' } })]);
  const alerts: any[] = [];
  const neg = recent.filter(m => m.sentiment === 'negative');
  if (recent.length > 10 && neg.length / recent.length > 0.3) alerts.push({ type: 'sentiment_spike', severity: 'high', message: `${Math.round(neg.length / recent.length * 100)}% negative mentions` });
  if (crisis.length) alerts.push({ type: 'crisis_detected', severity: 'urgent', message: `${crisis.length} potential crisis mentions`, mentions: crisis.map(m => m.id) });
  ok(res, alerts);
});
router.use('/listening', listening);
// SDK Mention entity uses /mentions path — alias /listening/mentions routes
router.use('/mentions', listening);  // MentionsFeed, SentimentAlerts use Mention.filter('/mentions')

// ─── INTEGRATIONS ─────────────────────────────────────────────────────────────
const integrations = Router();
integrations.use(authenticate);
integrations.get('/', async (req: any, res) => { const { workspace_id } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const rows = await db.integration.findMany({ where: { workspace_id }, orderBy: { created_at: 'desc' } }); ok(res, rows.map(({ credentials: _, ...r }) => ({ ...r, credentials_configured: !!_ }))); });
integrations.post('/', async (req: any, res) => { const { credentials, ...rest } = req.body; const encCreds = credentials ? Object.fromEntries(Object.entries(credentials).map(([k, v]) => [k, encrypt(v as string)])) : {}; created(res, { ...(await db.integration.create({ data: { ...rest, credentials: encCreds, settings: rest.settings ?? {} } })), credentials: undefined }); });
integrations.patch('/:id', async (req: any, res) => { const { credentials, ...rest } = req.body; const encCreds = credentials ? Object.fromEntries(Object.entries(credentials).map(([k, v]) => [k, encrypt(v as string)])) : undefined; ok(res, { ...(await db.integration.update({ where: { id: req.params.id }, data: { ...rest, ...(encCreds && { credentials: encCreds }) } })), credentials: undefined }); });
integrations.delete('/:id', async (req: any, res) => { await db.integration.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
integrations.post('/:id/toggle', async (req: any, res) => { const i = await db.integration.findUnique({ where: { id: req.params.id }, select: { id: true, is_active: true } }); if (!i) { notFound(res, 'Integration'); return; } ok(res, await db.integration.update({ where: { id: req.params.id }, data: { is_active: !i.is_active } })); });

// Sync an integration (Integrations.jsx → functions.invoke('syncIntegration', { integration_id, integration_type }))
integrations.post('/:id/sync', async (req: any, res) => {
  const integration = await db.integration.findUnique({ where: { id: req.params.id } });
  if (!integration) { notFound(res, 'Integration'); return; }
  // Mark as pending sync
  const updated = await db.integration.update({ where: { id: req.params.id }, data: { sync_status: 'pending', sync_error: null } });
  // Integration sync dispatched — mailchimp/salesforce/hubspot handlers run via syncQueue
  // For now: update to healthy after mock sync
  await db.integration.update({ where: { id: req.params.id }, data: { sync_status: 'healthy', last_synced_at: new Date() } });
  ok(res, { synced: true, integration_id: req.params.id, integration_type: integration.integration_type });
});

router.use('/integrations', integrations);

// ─── MEDIA (MediaLibrary page) ────────────────────────────────────────────────
const media = Router();
media.use(authenticate);
media.get('/', async (req: any, res) => { const { workspace_id, file_type } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const { page, limit, skip } = parsePage(req.query); const [total, rows] = await Promise.all([db.mediaAsset.count({ where: { workspace_id, ...(file_type && { file_type }) } }), db.mediaAsset.findMany({ where: { workspace_id, ...(file_type && { file_type }) }, orderBy: { created_at: 'desc' }, skip, take: limit })]);  paginated(res, rows, total, page, limit); });
media.delete('/:id', async (req: any, res) => { await db.mediaAsset.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
router.use('/media', media);

// ─── REPORTS (ClientReports, HistoricalReports pages) ────────────────────────
const reports = Router();
reports.use(authenticate);
reports.get('/', async (req: any, res) => { const { workspace_id, status } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } ok(res, await db.clientReport.findMany({ where: { workspace_id, ...(status && { status }) }, orderBy: { created_at: 'desc' } })); });
reports.post('/', async (req: any, res) => { const { next_scheduled_send, ...rest } = req.body; created(res, await db.clientReport.create({ data: { ...rest, date_range: rest.date_range ?? {}, white_label_settings: rest.white_label_settings ?? {}, custom_sections: rest.custom_sections ?? [], status: 'draft', ...(next_scheduled_send && { next_scheduled_send: new Date(next_scheduled_send) }) } })); });
reports.patch('/:id', async (req: any, res) => { const { next_scheduled_send, ...rest } = req.body; ok(res, await db.clientReport.update({ where: { id: req.params.id }, data: { ...rest, ...(next_scheduled_send && { next_scheduled_send: new Date(next_scheduled_send) }) } })); });
reports.delete('/:id', async (req: any, res) => { await db.clientReport.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
reports.post('/cron/auto-send', requireAdmin, async (_req: any, res) => { const job = await reportQueue.add({ type: 'auto-send' }); ok(res, { queued: true, job_id: job.id }); });
router.use('/reports', reports);

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
const onboarding = Router();
onboarding.use(authenticate);
onboarding.get('/:workspaceId', async (req: any, res) => { const state = await db.onboardingState.findUnique({ where: { workspace_id: req.params.workspaceId } }); ok(res, state ?? { workspace_id: req.params.workspaceId, current_step: 0, completed_steps: [], is_complete: false, workspace_created: false, accounts_connected: false, first_post_created: false, team_invited: false, appearance_set: false }); });
onboarding.put('/:workspaceId', async (req: any, res) => { const allowed = ['current_step','completed_steps','is_complete','workspace_created','accounts_connected','first_post_created','team_invited','appearance_set','data']; const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k))); ok(res, await db.onboardingState.upsert({ where: { workspace_id: req.params.workspaceId }, create: { workspace_id: req.params.workspaceId, user_id: req.user!.userId, ...update }, update })); });
onboarding.post('/:workspaceId/complete-step', async (req: any, res) => { const { step } = req.body as { step: number }; const state = await db.onboardingState.findUnique({ where: { workspace_id: req.params.workspaceId } }); const completedSteps = [...new Set([...(state?.completed_steps ?? []), step])]; ok(res, await db.onboardingState.upsert({ where: { workspace_id: req.params.workspaceId }, create: { workspace_id: req.params.workspaceId, user_id: req.user!.userId, current_step: step+1, completed_steps: completedSteps, is_complete: completedSteps.length >= 5 }, update: { current_step: Math.max(state?.current_step ?? 0, step+1), completed_steps: completedSteps, is_complete: completedSteps.length >= 5 } })); });
router.use('/onboarding', onboarding);

// ─── BENCHMARKING ─────────────────────────────────────────────────────────────
const bench = Router();
bench.use(authenticate);
bench.get('/', async (req: any, res) => { const { workspace_id, platform } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } ok(res, await db.benchmark.findMany({ where: { workspace_id, ...(platform && { platform: platform as any }) }, orderBy: [{ period: 'desc' }, { metric_name: 'asc' }] })); });
bench.post('/generate', async (req: any, res) => {
  const { workspace_id, platform, industry } = req.body;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const period = new Date().toISOString().slice(0, 7);
  const analytics = await db.analytics.findMany({ where: { workspace_id, ...(platform && { platform: platform as any }), date: { gte: `${period}-01` } } });
  const ownRate = analytics.length ? analytics.reduce((s,a)=>s+a.engagement_rate,0)/analytics.length : 0;
  const benchData: Record<string, any> = { instagram: { v: 1.94, p25: 0.8, p50: 1.5, p75: 3.2, top10: 5.8 }, tiktok: { v: 5.96, p25: 2.1, p50: 4.5, p75: 9.8, top10: 18.2 }, twitter: { v: 0.45, p25: 0.1, p50: 0.3, p75: 0.8, top10: 2.1 }, facebook: { v: 0.27, p25: 0.1, p50: 0.2, p75: 0.5, top10: 1.3 }, linkedin: { v: 2.0, p25: 0.6, p50: 1.4, p75: 3.5, top10: 7.2 } };
  const stats = platform && benchData[platform] ? benchData[platform] : benchData.instagram;
  const benchmark = await db.benchmark.create({ data: { workspace_id, industry: industry ?? 'general', platform: platform as any ?? null, metric_name: 'avg_engagement_rate', metric_value: stats.v, percentile_25: stats.p25, percentile_50: stats.p50, percentile_75: stats.p75, top_10_pct: stats.top10, your_value: ownRate, period, source: 'calculated' } });
  ok(res, { benchmark, comparison: { your_rate: ownRate.toFixed(2), industry_avg: stats.v, percentile: ownRate > stats.top10 ? 'top 10%' : ownRate > stats.p75 ? 'top 25%' : ownRate > stats.p50 ? 'above average' : 'below average' } });
});
router.use('/benchmarks', bench);

// ─── ECOMMERCE (EcommerceTracking + Shopify pages) ────────────────────────────
const ecom = Router();
ecom.use(authenticate);
ecom.get('/', async (req: any, res) => { const { workspace_id } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const rows = await db.ecommerceIntegration.findMany({ where: { workspace_id }, orderBy: { created_at: 'desc' } }); ok(res, rows.map(({ access_token: _, api_key: __, ...r }) => ({ ...r, is_connected: !!_ || !!__ }))); });
ecom.post('/', async (req: any, res) => { const { workspace_id, platform = 'shopify', access_token, api_key, ...rest } = req.body; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const row = await db.ecommerceIntegration.upsert({ where: { workspace_id_platform: { workspace_id, platform } }, create: { workspace_id, platform, ...rest, access_token: access_token ? encrypt(access_token) : null, api_key: api_key ? encrypt(api_key) : null, is_active: true }, update: { ...rest, ...(access_token && { access_token: encrypt(access_token) }), ...(api_key && { api_key: encrypt(api_key) }), is_active: true } }); const { access_token: _, api_key: __, ...safe } = row; created(res, { ...safe, is_connected: true }); });
ecom.post('/:id/sync', async (req: any, res) => {
  const integration = await db.ecommerceIntegration.findUnique({ where: { id: req.params.id } });
  if (!integration) { notFound(res, 'Integration'); return; }

  let stats = { total_products: 0, total_orders: 0, total_revenue: 0 };

  try {
    if (integration.platform === 'shopify') {
      const shopDomain = (integration.settings as any)?.shop_domain;
      const token      = (integration.settings as any)?.access_token;
      if (shopDomain && token) {
        const [prodRes, orderRes] = await Promise.all([
          fetch(`https://${shopDomain}/admin/api/2024-01/products/count.json`, { headers: { 'X-Shopify-Access-Token': token } }),
          fetch(`https://${shopDomain}/admin/api/2024-01/orders.json?status=any&fields=total_price&limit=250`, { headers: { 'X-Shopify-Access-Token': token } }),
        ]);
        const prodData  = await prodRes.json();
        const orderData = await orderRes.json();
        stats.total_products = prodData.count || 0;
        stats.total_orders   = orderData.orders?.length || 0;
        stats.total_revenue  = (orderData.orders || []).reduce((s: number, o: any) => s + parseFloat(o.total_price || '0'), 0);
      }
    } else if (integration.platform === 'woocommerce') {
      const baseUrl = (integration.settings as any)?.store_url;
      const key     = (integration.settings as any)?.consumer_key;
      const secret  = (integration.settings as any)?.consumer_secret;
      if (baseUrl && key && secret) {
        const auth = Buffer.from(`${key}:${secret}`).toString('base64');
        const [prodRes, orderRes] = await Promise.all([
          fetch(`${baseUrl}/wp-json/wc/v3/products?per_page=1`, { headers: { Authorization: `Basic ${auth}` } }),
          fetch(`${baseUrl}/wp-json/wc/v3/orders?per_page=100`, { headers: { Authorization: `Basic ${auth}` } }),
        ]);
        const totalProd = prodRes.headers.get('X-WP-Total');
        const orders    = await orderRes.json();
        stats.total_products = parseInt(totalProd || '0');
        stats.total_orders   = orders.length || 0;
        stats.total_revenue  = (orders as any[]).reduce((s, o) => s + parseFloat(o.total || '0'), 0);
      }
    }
  } catch (fetchErr) {
    logger.warn('Ecommerce sync fetch failed', { integrationId: integration.id, error: fetchErr });
  }

  await db.ecommerceIntegration.update({ where: { id: req.params.id }, data: { last_synced_at: new Date(), stats } });
  ok(res, { synced: true, stats });
});
ecom.delete('/:id', async (req: any, res) => { await db.ecommerceIntegration.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
router.use('/ecommerce', ecom);

// ─── ROLE MANAGEMENT ──────────────────────────────────────────────────────────
const roles = Router();
roles.use(authenticate);
roles.get('/', async (req: any, res) => { const { workspace_id } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const [customRoles, memberCount] = await Promise.all([db.customRole.findMany({ where: { workspace_id }, include: { _count: { select: { members: true } } } }), db.workspaceMember.count({ where: { workspace_id, is_active: true } })]); ok(res, { custom_roles: customRoles, total_members: memberCount }); });
roles.post('/', async (req: any, res) => { const { workspace_id, name, description, permissions } = req.body; if (!workspace_id || !name) { fail(res, 'workspace_id and name required'); return; } created(res, await db.customRole.create({ data: { workspace_id, name, description, permissions: permissions as any ?? {} } })); });
roles.patch('/:id', async (req: any, res) => { ok(res, await db.customRole.update({ where: { id: req.params.id }, data: { ...req.body, permissions: req.body.permissions as any } })); });
roles.delete('/:id', async (req: any, res) => { await db.workspaceMember.updateMany({ where: { custom_role_id: req.params.id }, data: { custom_role_id: null } }); await db.customRole.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
roles.post('/:id/assign', async (req: any, res) => { const { member_id } = req.body; ok(res, await db.workspaceMember.update({ where: { id: member_id }, data: { custom_role_id: req.params.id }, include: { user: { select: { id: true, email: true, display_name: true } }, custom_role: true } })); });
router.use('/roles', roles);

// ─── SUPPORT TICKETS (CustomerSupport page) ───────────────────────────────────
const support = Router();
support.use(authenticate);
support.get('/tickets', async (req: any, res) => { const { workspace_id, status, priority } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } const { page, limit, skip } = parsePage(req.query); const [total, rows] = await Promise.all([db.supportTicket.count({ where: { workspace_id, ...(status && { status }), ...(priority && { priority }) } }), db.supportTicket.findMany({ where: { workspace_id, ...(status && { status }), ...(priority && { priority }) }, include: { contact: { select: { id: true, display_name: true, email: true } } }, orderBy: [{ priority: 'asc' }, { created_at: 'desc' }], skip, take: limit })]);  paginated(res, rows, total, page, limit); });
support.post('/tickets', async (req: any, res) => { created(res, await db.supportTicket.create({ data: { ...req.body, tags: req.body.tags ?? [], messages: [], status: req.body.status ?? 'open', priority: req.body.priority ?? 'medium' } })); });
support.patch('/tickets/:id', async (req: any, res) => { ok(res, await db.supportTicket.update({ where: { id: req.params.id }, data: { ...req.body, ...(req.body.status === 'resolved' && { resolved_at: new Date() }) } })); });
support.post('/tickets/:id/messages', async (req: any, res) => { const t = await db.supportTicket.findUnique({ where: { id: req.params.id } }); if (!t) { notFound(res, 'Ticket'); return; } const msg = { id: crypto.randomUUID(), ...req.body, author_id: req.user?.userId, sent_at: new Date().toISOString() }; ok(res, await db.supportTicket.update({ where: { id: req.params.id }, data: { messages: [...(t.messages as any[]), msg] } })); });
router.use('/support', support);

// ─── OPTIMIZATION (AutonomousOptimization page) ────────────────────────────────
const optim = Router();
optim.use(authenticate);
optim.get('/rules', async (req: any, res) => { const { workspace_id } = req.query as Record<string,string>; if (!workspace_id) { fail(res, 'workspace_id required'); return; } ok(res, await db.optimizationRule.findMany({ where: { workspace_id }, orderBy: { created_at: 'desc' } })); });
optim.post('/rules', async (req: any, res) => { created(res, await db.optimizationRule.create({ data: { ...req.body, config: req.body.config ?? {}, is_active: req.body.is_active ?? true } })); });
optim.patch('/rules/:id', async (req: any, res) => { ok(res, await db.optimizationRule.update({ where: { id: req.params.id }, data: req.body })); });
optim.delete('/rules/:id', async (req: any, res) => { await db.optimizationRule.delete({ where: { id: req.params.id } }); ok(res, { deleted: true }); });
optim.post('/rules/:id/toggle', async (req: any, res) => { const r = await db.optimizationRule.findUnique({ where: { id: req.params.id }, select: { id: true, is_active: true } }); if (!r) { notFound(res, 'Rule'); return; } ok(res, await db.optimizationRule.update({ where: { id: req.params.id }, data: { is_active: !r.is_active } })); });
optim.get('/best-times', authenticate, async (req: any, res) => {
  const { workspace_id, platform } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  // Analyse real analytics data to find peak engagement windows
  const analytics = await db.analytics.findMany({
    where: {
      workspace_id,
      ...(platform && { platform: platform as any }),
      date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { date: 'asc' },
  });

  if (!analytics.length) {
    // No data yet — return evidence-based industry defaults
    ok(res, {
      platform: platform ?? 'all',
      data_source: 'industry_defaults',
      best_times: [
        { day: 'Tuesday',   hour: 9,  score: 8.8, label: 'Tue 9 AM' },
        { day: 'Wednesday', hour: 11, score: 9.2, label: 'Wed 11 AM' },
        { day: 'Thursday',  hour: 10, score: 9.0, label: 'Thu 10 AM' },
        { day: 'Friday',    hour: 11, score: 8.6, label: 'Fri 11 AM' },
      ],
      best_day: 'Wednesday', best_hour: 11,
    });
    return;
  }

  // Group engagement by day-of-week + hour-of-day
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const matrix: Record<string, { total: number; count: number }> = {};

  for (const row of analytics) {
    const d = new Date(row.date);
    const key = `${DAYS[d.getDay()]}_${d.getHours()}`;
    if (!matrix[key]) matrix[key] = { total: 0, count: 0 };
    matrix[key].total += row.engagement || 0;
    matrix[key].count += 1;
  }

  // Convert to scored list
  const maxEng = Math.max(...Object.values(matrix).map(v => v.count > 0 ? v.total / v.count : 0));
  const best_times = Object.entries(matrix)
    .map(([key, v]) => {
      const [day, hourStr] = key.split('_');
      const hour = parseInt(hourStr);
      const avgEng = v.count > 0 ? v.total / v.count : 0;
      const score = maxEng > 0 ? parseFloat(((avgEng / maxEng) * 10).toFixed(1)) : 0;
      return { day, hour, score, label: `${day.slice(0,3)} ${hour}:00`, avg_engagement: Math.round(avgEng) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const top = best_times[0];
  ok(res, {
    platform: platform ?? 'all',
    data_source: 'analytics',
    period_days: 30,
    total_data_points: analytics.length,
    best_times,
    best_day:  top?.day  ?? 'Wednesday',
    best_hour: top?.hour ?? 11,
  });
});
router.use('/optimization', optim);

// ─── PLATFORM METADATA (all 16 platforms) ─────────────────────────────────────
router.get('/platforms', authenticate, (_req, res) => ok(res, PLATFORM_META));


// ─── SUBSCRIPTIONS (Pricing.jsx → base44.entities.Subscription.create/filter) ─
const subs = Router();
subs.use(authenticate);

subs.get('/', async (req: any, res) => {
  const { workspace_id, user_email, plan_id } = req.query as Record<string,string>;
  const where: any = {
    ...(workspace_id && { workspace_id }),
    ...(user_email   && { user_email }),
    ...(plan_id      && { plan_id }),
  };
  const rows = await db.subscription.findMany({ where, orderBy: { created_at: 'desc' } });
  ok(res, rows);
});

subs.post('/', async (req: any, res) => {
  const { workspace_id, user_email, plan_id, billing_cycle, price, status, trial_ends_at, current_period_start, current_period_end, usage_limits, current_usage } = req.body;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  // Map plan_id to SubPlan enum
  const planMap: Record<string,any> = { free:'free', starter:'starter', growth:'growth', professional:'professional', agency:'agency', enterprise:'enterprise' };
  const plan = planMap[plan_id] ?? 'free';

  const sub = await db.subscription.upsert({
    where: { workspace_id },
    create: {
      workspace_id, user_email: user_email ?? null,
      plan, plan_id: plan_id ?? plan,
      billing_cycle: billing_cycle ?? 'monthly',
      price: price ?? null,
      status: status ?? 'trialing',
      trial_ends_at: trial_ends_at ? new Date(trial_ends_at) : null,
      trial_end:     trial_ends_at ? new Date(trial_ends_at) : null,
      current_period_start: current_period_start ? new Date(current_period_start) : null,
      current_period_end:   current_period_end   ? new Date(current_period_end)   : null,
      usage_limits:   usage_limits   ?? null,
      current_usage:  current_usage  ?? null,
    },
    update: {
      plan, plan_id: plan_id ?? plan,
      billing_cycle: billing_cycle ?? 'monthly',
      price: price ?? undefined,
      status: status ?? undefined,
      usage_limits:  usage_limits  ?? undefined,
      current_usage: current_usage ?? undefined,
      trial_ends_at: trial_ends_at ? new Date(trial_ends_at) : undefined,
    },
  });
  created(res, sub);
});

subs.patch('/:id', async (req: any, res) => {
  const sub = await db.subscription.update({ where: { id: req.params.id }, data: req.body });
  ok(res, sub);
});

// Usage tracking — increment counters
subs.post('/:workspaceId/track-usage', async (req: any, res) => {
  const { metric, amount = 1 } = req.body as { metric: string; amount?: number };
  const sub = await db.subscription.findUnique({ where: { workspace_id: req.params.workspaceId } });
  if (!sub) { fail(res, 'Subscription not found', 404); return; }
  const usage = (sub.current_usage as any) ?? {};
  usage[metric] = (usage[metric] ?? 0) + amount;
  await db.subscription.update({ where: { workspace_id: req.params.workspaceId }, data: { current_usage: usage } });
  ok(res, { metric, new_value: usage[metric] });
});

router.use('/subscriptions', subs);

// ─── ADMIN ───────────────────────────────────────────────────────────────────

const admin = Router();
// CrisisDetector.jsx: integrations.Core.SendEmail({ to, subject, body }) — auth only, not requireAdmin
admin.post('/email/send', authenticate, async (req: any, res) => {
  const { to, subject, body, html } = req.body as { to: string; subject: string; body?: string; html?: string };
  if (!to || !subject) { fail(res, 'to and subject required'); return; }
  try {
    const { sendEmail } = await import('./config/email');
    const result = await sendEmail({ to, subject, html: html || body, text: body });
    ok(res, { sent: true, messageId: result.messageId });
  } catch (e) {
    logger.error('Email send failed', { error: e });
    fail(res, (e as Error).message, 500);
  }
});
admin.use(authenticate, requireAdmin);
admin.get('/health', async (_req, res) => { const [users, workspaces, posts, accounts] = await Promise.all([db.user.count(), db.workspace.count(), db.post.count(), db.socialAccount.count()]); const qStats = await Promise.all([publishQueue.getJobCounts(), syncQueue.getJobCounts(), analyticsQueue.getJobCounts()]); res.json({ success: true, data: { database: { users, workspaces, posts, accounts }, queues: { publish: qStats[0], sync: qStats[1], analytics: qStats[2] }, server: { uptime: Math.round(process.uptime()), memory: process.memoryUsage(), node: process.version, env: process.env.NODE_ENV } } }); });
admin.post('/run/publisher', async (_req, res) => { const job = await publishQueue.add({ manual: true }); ok(res, { queued: true, job_id: job.id }); });
admin.post('/run/sync-all', async (_req, res) => {
  const accs = await db.socialAccount.findMany({ where: { status: 'active' } });
  const jobs = await Promise.all(accs.map(a => syncQueue.add({ accountId: a.id, platform: a.platform })));
  // SyncStatusCard.jsx expects: { data: { summary: { synced, total } } }
  ok(res, { queued: true, summary: { synced: jobs.length, total: accs.length } });
});
admin.get('/users', async (req, res) => { const { page, limit, skip } = parsePage(req.query); const [total, rows] = await Promise.all([db.user.count(), db.user.findMany({ select: { id: true, email: true, display_name: true, role: true, is_active: true, created_at: true, last_login_at: true }, skip, take: limit, orderBy: { created_at: 'desc' } })]);  paginated(res, rows, total, page, limit); });
admin.patch('/users/:id', async (req, res) => { const { role, is_active } = req.body; ok(res, await db.user.update({ where: { id: req.params.id }, data: { ...(role && { role }), ...(is_active !== undefined && { is_active }) }, select: { id: true, email: true, role: true, is_active: true } })); });
admin.get('/workspaces', async (req, res) => { const { page, limit, skip } = parsePage(req.query); const [total, rows] = await Promise.all([db.workspace.count(), db.workspace.findMany({ include: { _count: { select: { members: true, posts: true, social_accounts: true } }, subscription: { select: { plan: true, status: true } } }, skip, take: limit, orderBy: { created_at: 'desc' } })]);  paginated(res, rows, total, page, limit); });

// ─── CLIENT PORTAL (ClientPortal.jsx → plan_id === 'agency' check) ────────────
const portal = Router();
portal.use(authenticate);

// GET /portal/access — checks if current user has agency plan (ClientPortal gating)
portal.get('/access', async (req: any, res) => {
  const { workspace_id } = req.query as { workspace_id?: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const sub = await db.subscription.findUnique({ where: { workspace_id } });
  const plan = sub?.plan_id ?? sub?.plan ?? 'free';
  const hasAccess = ['agency', 'enterprise'].includes(plan);

  ok(res, {
    has_access: hasAccess,
    plan,
    required_plan: 'agency',
    upgrade_url: `${(req as any).headers?.origin ?? ''}/Pricing`,
  });
});

// PATCH /portal/:workspaceId/settings — save custom KPIs + dashboard layout
portal.patch('/:workspaceId/settings', async (req: any, res) => {
  const { custom_kpis, custom_dashboard_layout, ...rest } = req.body;
  const ws = await db.workspace.findUnique({ where: { id: req.params.workspaceId }, select: { settings: true } });
  const existingSettings = (ws?.settings as any) ?? {};
  const settings = {
    ...existingSettings,
    ...(custom_kpis           && { custom_kpis }),
    ...(custom_dashboard_layout && { custom_dashboard_layout }),
    ...rest,
  };
  ok(res, await db.workspace.update({ where: { id: req.params.workspaceId }, data: { settings } }));
});

// GET /portal/:workspaceId/dashboard — workspace overview for client-facing portal
portal.get('/:workspaceId/dashboard', async (req: any, res) => {
  const [workspace, analytics, posts, campaigns] = await Promise.all([
    db.workspace.findUnique({ where: { id: req.params.workspaceId }, select: { id: true, name: true, settings: true, slug: true, logo_url: true, appearance_settings: true } }),
    db.analytics.findMany({ where: { workspace_id: req.params.workspaceId }, orderBy: { date: 'desc' }, take: 30 }),
    db.post.findMany({ where: { workspace_id: req.params.workspaceId, status: 'published' }, orderBy: { created_at: 'desc' }, take: 10 }),
    db.campaign.findMany({ where: { workspace_id: req.params.workspaceId, status: 'active' }, take: 5 }),
  ]);
  if (!workspace) { notFound(res, 'Workspace'); return; }
  ok(res, {
    workspace,
    analytics,
    recent_posts: posts,
    active_campaigns: campaigns,
    custom_kpis: (workspace.settings as any)?.custom_kpis ?? [],
    dashboard_layout: (workspace.settings as any)?.custom_dashboard_layout ?? [],
  });
});

router.use('/portal', portal);


// ─── PERMISSIONS (permissions.jsx role matrix — backend enforcement) ──────────
const perms = Router();
perms.use(authenticate);

// GET /permissions → returns user's permissions for current workspace
// Matches permissions.jsx ROLES + PERMISSIONS matrix
perms.get('/', async (req: any, res) => {
  const { workspace_id } = req.query as { workspace_id?: string };

  const ROLE_PERMISSIONS: Record<string, string[]> = {
    admin:   ['*'], // all permissions
    owner:   ['*'],
    manager: ['create_post','edit_post','delete_post','publish_post','schedule_post','approve_post','connect_account','manage_accounts','view_analytics','view_advanced_analytics','export_reports','invite_members','use_ai_chat','use_ai_content_generation','use_revenue_optimizer','view_revenue','manage_deals','use_social_listening','manage_keywords','view_inbox','reply_messages','assign_conversations','create_campaign','edit_campaign','delete_campaign','upload_media','delete_media','create_automation','edit_automation','delete_automation'],
    editor:  ['create_post','edit_post','schedule_post','view_analytics','use_ai_chat','use_ai_content_generation','view_inbox','reply_messages','create_campaign','edit_campaign','upload_media'],
    analyst: ['view_analytics','view_advanced_analytics','export_reports','use_ai_chat','view_revenue','use_social_listening'],
    viewer:  ['view_analytics','use_ai_chat','view_inbox'],
    client:  ['view_analytics','export_reports','view_revenue'],
    member:  ['create_post','edit_post','schedule_post','view_analytics','use_ai_chat','view_inbox','upload_media'],
  };

  // Get user's role in this workspace
  let userRole = req.user.role; // global role
  if (workspace_id) {
    const member = await db.workspaceMember.findFirst({ where: { workspace_id, user_id: req.user.userId, is_active: true }, select: { role: true, permissions: true, custom_role: { select: { permissions: true } } } });
    if (member) {
      userRole = member.role;
      // Custom role overrides take precedence
      if (member.custom_role?.permissions) {
        const customPerms = member.custom_role.permissions as string[];
        ok(res, { role: userRole, permissions: customPerms, is_admin: false });
        return;
      }
      // Merged custom permissions on the member record
      if (member.permissions) {
        const merged = [...(ROLE_PERMISSIONS[userRole] ?? []), ...(member.permissions as string[])];
        ok(res, { role: userRole, permissions: [...new Set(merged)], is_admin: false });
        return;
      }
    }
  }

  const permissions = ROLE_PERMISSIONS[userRole] ?? ROLE_PERMISSIONS.viewer;
  ok(res, {
    role: userRole,
    permissions,
    is_admin: permissions.includes('*') || userRole === 'admin',
    can: (permission: string) => permissions.includes('*') || permissions.includes(permission),
  });
});

// POST /permissions/check — bulk permission check
perms.post('/check', authenticate, async (req: any, res) => {
  const { workspace_id, permissions: toCheck } = req.body as { workspace_id?: string; permissions?: string[] };
  if (!Array.isArray(toCheck)) { fail(res, 'permissions[] required'); return; }

  const member = workspace_id ? await db.workspaceMember.findFirst({ where: { workspace_id, user_id: req.user.userId, is_active: true }, select: { role: true, permissions: true } }) : null;
  const role = member?.role ?? req.user.role;

  const ALL: Record<string, string[]> = {
    admin: ['*'], owner: ['*'],
    manager: ['create_post','edit_post','delete_post','publish_post','schedule_post','approve_post','connect_account','manage_accounts','view_analytics','view_advanced_analytics','export_reports','invite_members','use_ai_chat','use_ai_content_generation','use_revenue_optimizer','view_revenue','manage_deals','use_social_listening','manage_keywords','view_inbox','reply_messages','assign_conversations','create_campaign','edit_campaign','delete_campaign','upload_media','delete_media','create_automation','edit_automation','delete_automation'],
    editor:  ['create_post','edit_post','schedule_post','view_analytics','use_ai_chat','use_ai_content_generation','view_inbox','reply_messages','create_campaign','edit_campaign','upload_media'],
    analyst: ['view_analytics','view_advanced_analytics','export_reports','use_ai_chat','view_revenue','use_social_listening'],
    viewer:  ['view_analytics','use_ai_chat','view_inbox'],
    client:  ['view_analytics','export_reports','view_revenue'],
    member:  ['create_post','edit_post','schedule_post','view_analytics','use_ai_chat','view_inbox','upload_media'],
  };

  const userPerms = [...(ALL[role] ?? ALL.viewer), ...((member?.permissions as string[]) ?? [])];
  const hasAll = userPerms.includes('*');

  ok(res, Object.fromEntries(toCheck.map(p => [p, hasAll || userPerms.includes(p)])));
});

router.use('/permissions', perms);

// ─── USAGE LIMITS (usageLimits.jsx hook + getUsageLimits.jsx utility) ─────────
// The usage limits are already on Subscription.usage_limits + current_usage
// These endpoints provide fast access without loading the full subscription

const usage = Router();
usage.use(authenticate);

// GET /usage/:workspaceId — current usage + limits for the workspace
usage.get('/:workspaceId', async (req: any, res) => {
  const sub = await db.subscription.findUnique({
    where: { workspace_id: req.params.workspaceId },
    select: { plan: true, plan_id: true, status: true, usage_limits: true, current_usage: true, trial_ends_at: true },
  });

  if (!sub) {
    ok(res, { plan: 'free', plan_id: 'free', usage_limits: { social_accounts: 2, posts_per_month: 10, team_members: 1, ai_requests_per_month: 50, storage_gb: 1, brands: 1, workspaces: 1 }, current_usage: { social_accounts: 0, posts_this_month: 0, team_members: 1, ai_requests_this_month: 0, storage_used_gb: 0 } });
    return;
  }

  ok(res, sub);
});

// POST /usage/:workspaceId/increment — increment a usage counter
// Called when: creating post, using AI, uploading file, adding team member
usage.post('/:workspaceId/increment', async (req: any, res) => {
  const { metric, amount = 1 } = req.body as { metric?: string; amount?: number };
  const ALLOWED_METRICS = ['posts_this_month', 'ai_requests_this_month', 'storage_used_gb', 'social_accounts', 'team_members'];
  if (!metric || !ALLOWED_METRICS.includes(metric)) { fail(res, `metric must be one of: ${ALLOWED_METRICS.join(', ')}`); return; }

  const sub = await db.subscription.findUnique({ where: { workspace_id: req.params.workspaceId } });
  if (!sub) { fail(res, 'Subscription not found', 404); return; }

  const current = (sub.current_usage as any) ?? {};
  current[metric] = (current[metric] ?? 0) + amount;
  await db.subscription.update({ where: { workspace_id: req.params.workspaceId }, data: { current_usage: current } });
  ok(res, { metric, new_value: current[metric] });
});

// POST /usage/:workspaceId/reset-monthly — resets monthly counters (called by cron at month start)
usage.post('/:workspaceId/reset-monthly', async (req: any, res) => {
  const sub = await db.subscription.findUnique({ where: { workspace_id: req.params.workspaceId } });
  if (!sub) { fail(res, 'Subscription not found', 404); return; }
  const current = (sub.current_usage as any) ?? {};
  current.posts_this_month = 0;
  current.ai_requests_this_month = 0;
  await db.subscription.update({ where: { workspace_id: req.params.workspaceId }, data: { current_usage: current } });
  ok(res, { reset: true });
});

router.use('/usage', usage);

router.use('/admin', admin);

// ─── AUTOMATIONS (/automations) ──────────────────────────────────────────────
// SDK: Automation entity('/automations') — AutomationBuilder.jsx, Automations.jsx
const automations = Router();
automations.use(authenticate);
automations.get('/', async (req: any, res) => {
  const { workspace_id, status } = req.query as Record<string,string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const { page, limit, skip } = parsePage(req.query);
  const where: any = { workspace_id, ...(status && { status }) };
  const [total, rows] = await Promise.all([
    db.automation.count({ where }),
    db.automation.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: limit }),
  ]);
  paginated(res, rows, total, page, limit);
});
automations.get('/:id', async (req: any, res) => {
  const row = await db.automation.findUnique({ where: { id: req.params.id } });
  if (!row) { notFound(res, 'Automation'); return; }
  ok(res, row);
});
automations.post('/', authenticate, async (req: any, res) => {
  const { workspace_id, name, description, trigger, actions, status } = req.body;
  if (!workspace_id || !name) { fail(res, 'workspace_id and name required'); return; }
  const row = await db.automation.create({
    data: { workspace_id, name, description, trigger: trigger ?? {}, actions: actions ?? [], status: status ?? 'draft' },
  });
  created(res, row);
});
automations.patch('/:id', authenticate, async (req: any, res) => {
  const { trigger, actions, ...rest } = req.body;
  const row = await db.automation.update({
    where: { id: req.params.id },
    data: { ...rest, ...(trigger && { trigger }), ...(actions && { actions }) },
  });
  ok(res, row);
});
automations.delete('/:id', authenticate, async (req: any, res) => {
  await db.automation.delete({ where: { id: req.params.id } });
  ok(res, { deleted: true });
});
automations.post('/:id/toggle', authenticate, async (req: any, res) => {
  const current = await db.automation.findUnique({ where: { id: req.params.id }, select: { status: true } });
  if (!current) { notFound(res, 'Automation'); return; }
  const newStatus = current.status === 'active' ? 'paused' : 'active';
  ok(res, await db.automation.update({ where: { id: req.params.id }, data: { status: newStatus } }));
});
router.use('/automations', automations);

export default router;
