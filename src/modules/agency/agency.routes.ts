import { Router, Request, Response } from 'express';
import db from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, notFound, paginated, parsePage } from '../../utils';

// ─── AGENCY ───────────────────────────────────────────────────────────────────

export const agencyRouter = Router();
agencyRouter.use(authenticate);

agencyRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, status, search } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const { page, limit, skip } = parsePage(req.query);
  const where: any = { agency_workspace_id: workspace_id, ...(status && { status }), ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { company: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }) };
  const [total, clients] = await Promise.all([db.agencyClient.count({ where }), db.agencyClient.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: limit })]);
  paginated(res, clients, total, page, limit);
});

agencyRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { agency_workspace_id, name, ...rest } = req.body;
  if (!agency_workspace_id || !name) { fail(res, 'agency_workspace_id and name required'); return; }
  const client = await db.agencyClient.create({ data: { agency_workspace_id, name, ...rest, status: rest.status ?? 'active', currency: rest.currency ?? 'USD', tags: rest.tags ?? [], contract_start: rest.contract_start ? new Date(rest.contract_start) : null, contract_end: rest.contract_end ? new Date(rest.contract_end) : null } });
  created(res, client);
});

agencyRouter.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { contract_start, contract_end, ...rest } = req.body;
  ok(res, await db.agencyClient.update({ where: { id: req.params.id }, data: { ...rest, ...(contract_start && { contract_start: new Date(contract_start) }), ...(contract_end && { contract_end: new Date(contract_end) }) } }));
});

agencyRouter.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await db.agencyClient.delete({ where: { id: req.params.id } });
  ok(res, { deleted: true });
});

agencyRouter.get('/dashboard/metrics', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.query as { workspace_id: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const [active, prospect, churned, inactive] = await Promise.all(['active','prospect','churned','inactive'].map(s => db.agencyClient.count({ where: { agency_workspace_id: workspace_id, status: s } })));
  const agg = await db.agencyClient.aggregate({ where: { agency_workspace_id: workspace_id, status: 'active' }, _sum: { monthly_retainer: true }, _avg: { monthly_retainer: true } });
  const recent = await db.agencyClient.findMany({ where: { agency_workspace_id: workspace_id }, orderBy: { created_at: 'desc' }, take: 5 });
  ok(res, { clients: { active, prospect, churned, inactive, total: active + prospect + churned + inactive }, revenue: { monthly_mrr: agg._sum.monthly_retainer ?? 0, avg_retainer: agg._avg.monthly_retainer ?? 0 }, recent_clients: recent });
});

// ─── APPEARANCE ───────────────────────────────────────────────────────────────

export const appearanceRouter = Router();

// Public endpoint — no auth (used by isLoadingPublicSettings in App.jsx)
appearanceRouter.get('/public/:slug', async (req: Request, res: Response): Promise<void> => {
  const ws = await db.workspace.findUnique({ where: { slug: req.params.slug }, select: { id: true, name: true, slug: true, logo_url: true, is_active: true, appearance_settings: { select: { primary_color: true, font_size: true, sidebar_style: true, dark_mode: true, logo_url: true, favicon_url: true, brand_name: true } }, subscription: { select: { plan: true, status: true } } } });
  if (!ws || !ws.is_active) { res.status(404).json({ success: false, error: 'Workspace not found' }); return; }
  res.json({ success: true, data: { workspace_id: ws.id, workspace_name: ws.name, slug: ws.slug, logo_url: ws.logo_url, plan: ws.subscription?.plan ?? 'free', appearance: ws.appearance_settings ?? { primary_color: '#d4af37', font_size: '14px', sidebar_style: 'expanded', dark_mode: 'system' } } });
});

appearanceRouter.use(authenticate);

appearanceRouter.get('/:workspaceId', async (req: AuthRequest, res: Response): Promise<void> => {
  const settings = await db.appearanceSettings.findUnique({ where: { workspace_id: req.params.workspaceId } });
  ok(res, settings ?? { workspace_id: req.params.workspaceId, primary_color: '#d4af37', font_size: '14px', sidebar_style: 'expanded', dark_mode: 'system', logo_url: null, favicon_url: null, brand_name: null, custom_css: null });
});

appearanceRouter.put('/:workspaceId', async (req: AuthRequest, res: Response): Promise<void> => {
  const { primary_color, font_size, sidebar_style, dark_mode, logo_url, favicon_url, brand_name, custom_css } = req.body;
  ok(res, await db.appearanceSettings.upsert({ where: { workspace_id: req.params.workspaceId }, create: { workspace_id: req.params.workspaceId, primary_color: primary_color ?? '#d4af37', font_size: font_size ?? '14px', sidebar_style: sidebar_style ?? 'expanded', dark_mode: dark_mode ?? 'system', logo_url: logo_url ?? null, favicon_url: favicon_url ?? null, brand_name: brand_name ?? null, custom_css: custom_css ?? null }, update: req.body }));
});

appearanceRouter.patch('/:workspaceId', async (req: AuthRequest, res: Response): Promise<void> => {
  ok(res, await db.appearanceSettings.upsert({ where: { workspace_id: req.params.workspaceId }, create: { workspace_id: req.params.workspaceId, ...req.body }, update: req.body }));
});
