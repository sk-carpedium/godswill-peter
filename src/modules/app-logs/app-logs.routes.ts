import { Router, Response } from 'express';
import { z } from 'zod';
import db from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, paginated, parsePage } from '../../utils';

const router = Router();

// ─── PAGE VIEW (NavigationTracker → base44.appLogs.logUserInApp) ──────────────
// Called on every route change across all 61 pages.
// Must be fast and non-blocking — frontend silently ignores errors.

const pageViewZ = z.object({
  page_name:    z.string().min(1).max(200),
  workspace_id: z.string().cuid().optional(),
  path:         z.string().max(500).optional(),
  referrer:     z.string().max(500).optional(),
  duration_ms:  z.coerce.number().int().min(0).optional(),
  metadata:     z.record(z.unknown()).optional(),
});

router.post('/page-view', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const p = pageViewZ.safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }

  const log = await db.appLog.create({
    data: {
      user_id:      req.user!.userId,
      workspace_id: p.data.workspace_id ?? null,
      page_name:    p.data.page_name,
      event_type:   'page_view',
      path:         p.data.path ?? null,
      referrer:     p.data.referrer ?? null,
      duration_ms:  p.data.duration_ms ?? null,
      metadata:     (p.data.metadata as any) ?? null,
      ip:           req.ip ?? null,
      user_agent:   req.headers['user-agent']?.substring(0, 500) ?? null,
    },
  });

  created(res, log);
});

// ─── GENERIC EVENT ────────────────────────────────────────────────────────────

const eventZ = z.object({
  event_type:   z.string().min(1).max(100),
  page_name:    z.string().max(200).optional(),
  workspace_id: z.string().cuid().optional(),
  metadata:     z.record(z.unknown()).optional(),
});

router.post('/event', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const p = eventZ.safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }

  const log = await db.appLog.create({
    data: {
      user_id:      req.user!.userId,
      workspace_id: p.data.workspace_id ?? null,
      page_name:    p.data.page_name ?? null,
      event_type:   p.data.event_type,
      metadata:     (p.data.metadata as any) ?? null,
      ip:           req.ip ?? null,
      user_agent:   req.headers['user-agent']?.substring(0, 500) ?? null,
    },
  });

  created(res, log);
});

// ─── LIST LOGS ────────────────────────────────────────────────────────────────

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, user_id, page_name, event_type, start_date, end_date } = req.query as Record<string, string>;
  const { page, limit, skip } = parsePage(req.query);

  const where: any = {
    ...(workspace_id && { workspace_id }),
    ...(user_id      && { user_id }),
    ...(page_name    && { page_name: { contains: page_name, mode: 'insensitive' } }),
    ...(event_type   && { event_type }),
    ...((start_date || end_date) && {
      created_at: {
        ...(start_date && { gte: new Date(start_date) }),
        ...(end_date   && { lte: new Date(end_date) }),
      },
    }),
  };

  const [total, logs] = await Promise.all([
    db.appLog.count({ where }),
    db.appLog.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: limit }),
  ]);

  paginated(res, logs, total, page, limit);
});

// ─── PAGE ANALYTICS (most visited pages) ──────────────────────────────────────

router.get('/page-analytics', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, start_date, end_date } = req.query as Record<string, string>;

  const where: any = {
    event_type: 'page_view',
    ...(workspace_id && { workspace_id }),
    ...((start_date || end_date) && {
      created_at: {
        ...(start_date && { gte: new Date(start_date) }),
        ...(end_date   && { lte: new Date(end_date) }),
      },
    }),
  };

  const grouped = await db.appLog.groupBy({
    by: ['page_name'],
    where,
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 30,
  });

  ok(res, grouped.map(g => ({
    page:        g.page_name,
    views:       g._count.id,
  })));
});

// ─── USER ACTIVITY (for a specific user's journey) ────────────────────────────

router.get('/user/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePage(req.query);
  const [total, logs] = await Promise.all([
    db.appLog.count({ where: { user_id: req.params.userId } }),
    db.appLog.findMany({
      where: { user_id: req.params.userId },
      orderBy: { created_at: 'desc' },
      skip, take: limit,
    }),
  ]);
  paginated(res, logs, total, page, limit);
});

// ─── WORKSPACE ACTIVITY SUMMARY ────────────────────────────────────────────────

router.get('/summary', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.query as { workspace_id: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalViews, uniqueUsers, topPages, eventTypes] = await Promise.all([
    db.appLog.count({
      where: { workspace_id, event_type: 'page_view', created_at: { gte: last30 } },
    }),
    db.appLog.groupBy({
      by: ['user_id'],
      where: { workspace_id, created_at: { gte: last30 } },
      _count: { id: true },
    }),
    db.appLog.groupBy({
      by: ['page_name'],
      where: { workspace_id, event_type: 'page_view', created_at: { gte: last30 } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    db.appLog.groupBy({
      by: ['event_type'],
      where: { workspace_id, created_at: { gte: last30 } },
      _count: { id: true },
    }),
  ]);

  ok(res, {
    period:        '30d',
    total_views:   totalViews,
    unique_users:  uniqueUsers.length,
    top_pages:     topPages.map(p => ({ page: p.page_name, views: p._count.id })),
    event_types:   eventTypes.map(e => ({ type: e.event_type, count: e._count.id })),
  });
});

export default router;
