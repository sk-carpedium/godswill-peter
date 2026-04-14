import { Router, Response } from 'express';
import { z } from 'zod';
import db from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, notFound, paginated, parsePage } from '../../utils';

const router = Router();
router.use(authenticate);

// ─── VALIDATION SCHEMAS ──────────────────────────────────────────────────────

const platformZ = z.object({
  account_id: z.string().cuid(),
  platform:   z.string(),
});

const scheduleZ = z.object({
  type:                z.enum(['once', 'recurring']),
  scheduled_at:        z.string().datetime(),
  recurrence_rule:     z.enum(['daily','weekly','biweekly','monthly']).optional(),
  recurrence_end_date: z.string().datetime().optional(),
}).optional();

const contentZ = z.object({
  text:      z.string().max(5000).optional(),
  hashtags:  z.array(z.string()).optional(),
  mentions:  z.array(z.string()).optional(),
  link:      z.string().url().optional(),
}).optional();

const createZ = z.object({
  workspace_id:     z.string().cuid(),
  campaign_id:      z.string().cuid().optional(),
  title:            z.string().max(300).optional(),
  post_type:        z.enum(['image','video','carousel','story','reel','text','short']).optional(),
  content:          contentZ,
  media_urls:       z.array(z.string().url()).optional(),
  platforms:        z.array(platformZ).min(1),
  schedule:         scheduleZ,
  tags:             z.array(z.string()).optional(),
  notes:            z.string().max(2000).optional(),
  approval_required: z.boolean().optional(),
  labels:           z.array(z.string()).optional(),
  // AI / analytics fields (set after publish by background jobs)
  thumbnail_url:    z.string().url().optional(),
  is_sponsored:     z.boolean().optional(),
});

const updateZ = z.object({
  title:             z.string().max(300).optional(),
  content:           contentZ,
  media_urls:        z.array(z.string().url()).optional(),
  tags:              z.array(z.string()).optional(),
  notes:             z.string().max(2000).optional(),
  labels:            z.array(z.string()).optional(),
  status:            z.enum(['draft','scheduled','archived']).optional(),
  schedule:          scheduleZ,
  thumbnail_url:     z.string().url().optional(),
  is_sponsored:      z.boolean().optional(),
  // Set by background jobs after publish:
  published_at:      z.string().datetime().optional(),
  engagement_rate:   z.number().min(0).max(100).optional(),
  metrics:           z.record(z.any()).optional(),
  ai_analysis:       z.record(z.any()).optional(),
}).partial();

// ─── GET / — list posts with filters ─────────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, status, campaign_id, platform, search, sort, label } =
    req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const { page, limit, skip } = parsePage(req.query);
  const where: any = {
    workspace_id,
    ...(status      && { status }),
    ...(campaign_id && { campaign_id }),
    ...(platform    && { platforms: { some: { platform: platform as any } } }),
    ...(label       && { labels: { has: label } }),
    ...(search      && { OR: [
      { title:   { contains: search, mode: 'insensitive' } },
      { content: { path: ['text'], string_contains: search } },
    ] }),
  };

  const orderBy: any = sort === '-engagement'
    ? { engagement_rate: 'desc' }
    : sort === 'scheduled_at'
    ? { scheduled_at: 'asc' }
    : [{ scheduled_at: 'asc' }, { created_at: 'desc' }];

  const [total, posts] = await Promise.all([
    db.post.count({ where }),
    db.post.findMany({
      where,
      include: {
        platforms: {
          include: {
            social_account: { select: { id: true, platform: true, account_name: true, profile_image_url: true } },
          },
        },
        campaign: { select: { id: true, name: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
  ]);
  paginated(res, posts, total, page, limit);
});

// ─── GET /calendar/month ──────────────────────────────────────────────────────

router.get('/calendar/month', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, year, month } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const y = parseInt(year  ?? String(new Date().getFullYear()));
  const m = parseInt(month ?? String(new Date().getMonth() + 1));
  const start = new Date(y, m - 1, 1);
  const end   = new Date(y, m, 0, 23, 59, 59);

  const posts = await db.post.findMany({
    where: { workspace_id, scheduled_at: { gte: start, lte: end } },
    include: { platforms: { select: { platform: true, status: true } } },
    orderBy: { scheduled_at: 'asc' },
  });
  ok(res, posts);
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await db.post.findUnique({
    where:   { id: req.params.id },
    include: {
      platforms:  { include: { social_account: true } },
      campaign:   true,
      analytics:  { orderBy: { date: 'desc' }, take: 30 },
      approvals:  { include: { workflow: true } },
      parent_post: { select: { id: true, scheduled_at: true } },
      child_posts: { select: { id: true, scheduled_at: true, status: true }, orderBy: { scheduled_at: 'asc' } },
    },
  });
  if (!post) { notFound(res, 'Post'); return; }
  ok(res, post);
});

// ─── POST / — create post ─────────────────────────────────────────────────────

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const p = createZ.safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }

  const {
    workspace_id, campaign_id, title, post_type, content, media_urls,
    platforms, schedule, tags, notes, approval_required, labels, thumbnail_url, is_sponsored,
  } = p.data;

  const status = schedule ? 'scheduled' : 'draft';

  const post = await db.post.create({
    data: {
      workspace_id,
      campaign_id,
      title,
      post_type,
      content:            content as any,
      media_urls:         media_urls  ?? [],
      labels:             labels      ?? [],
      tags:               tags        ?? [],
      notes,
      status,
      approval_required:  approval_required ?? false,
      created_by:         req.user!.userId,
      thumbnail_url,
      is_sponsored:       is_sponsored ?? false,
      schedule_type:      schedule?.type as any ?? null,
      scheduled_at:       schedule?.scheduled_at       ? new Date(schedule.scheduled_at)       : null,
      recurrence_rule:    schedule?.recurrence_rule    as any ?? null,
      recurrence_end_date:schedule?.recurrence_end_date ? new Date(schedule.recurrence_end_date) : null,
      platforms: {
        create: platforms.map(pp => ({
          social_account_id: pp.account_id,
          platform:          pp.platform as any,
          status:            status as any,
        })),
      },
    },
    include: {
      platforms: { include: { social_account: { select: { id: true, platform: true, account_name: true } } } },
    },
  });
  created(res, post);
});

// ─── PATCH /:id — update post ─────────────────────────────────────────────────

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await db.post.findUnique({ where: { id: req.params.id }, select: { status: true } });
  if (!existing) { notFound(res, 'Post'); return; }
  if (['published', 'publishing'].includes(existing.status)) { fail(res, 'Cannot edit a published post'); return; }

  const p = updateZ.safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }
  const { schedule, published_at, ...rest } = p.data;

  const post = await db.post.update({
    where: { id: req.params.id },
    data:  {
      ...rest,
      content: rest.content as any,
      ...(published_at && { published_at: new Date(published_at) }),
      ...(schedule && {
        schedule_type:      schedule.type as any,
        scheduled_at:       new Date(schedule.scheduled_at),
        recurrence_rule:    schedule.recurrence_rule    as any ?? null,
        recurrence_end_date:schedule.recurrence_end_date ? new Date(schedule.recurrence_end_date) : null,
        status: 'scheduled',
      }),
    },
    include: { platforms: { include: { social_account: true } } },
  });
  ok(res, post);
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await db.post.findUnique({ where: { id: req.params.id }, select: { status: true } });
  if (!post)  { notFound(res, 'Post'); return; }
  if (post.status === 'publishing') { fail(res, 'Cannot delete a publishing post'); return; }
  await db.post.delete({ where: { id: req.params.id } });
  ok(res, { deleted: true });
});

// ─── POST /:id/status ─────────────────────────────────────────────────────────

router.post('/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  if (!['draft', 'scheduled', 'archived'].includes(status)) { fail(res, 'Invalid status'); return; }
  ok(res, await db.post.update({ where: { id: req.params.id }, data: { status } }));
});

// ─── POST /bulk/status — bulk status update ───────────────────────────────────

router.post('/bulk/status', async (req: AuthRequest, res: Response): Promise<void> => {
  const { post_ids, status } = req.body as { post_ids?: string[]; status?: string };
  if (!Array.isArray(post_ids) || !post_ids.length) { fail(res, 'post_ids array required'); return; }
  const result = await db.post.updateMany({
    where: { id: { in: post_ids }, status: { notIn: ['published', 'publishing'] } },
    data:  { status: status as any },
  });
  ok(res, { updated: result.count });
});

// ─── POST /bulk/labels — bulk label management ────────────────────────────────

router.post('/bulk/labels', async (req: AuthRequest, res: Response): Promise<void> => {
  const { post_ids, add_labels, remove_labels } = req.body as {
    post_ids?: string[]; add_labels?: string[]; remove_labels?: string[];
  };
  if (!Array.isArray(post_ids) || !post_ids.length) { fail(res, 'post_ids array required'); return; }

  const posts = await db.post.findMany({ where: { id: { in: post_ids } }, select: { id: true, labels: true } });
  const updates = posts.map((p: any) => {
    let labels: string[] = p.labels ?? [];
    if (add_labels)    labels = [...new Set([...labels, ...add_labels])];
    if (remove_labels) labels = labels.filter((l: string) => !remove_labels.includes(l));
    return db.post.update({ where: { id: p.id }, data: { labels } });
  });
  await Promise.all(updates);
  ok(res, { updated: updates.length });
});

export default router;
