import { randomUUID } from 'crypto';
import { Router, Response } from 'express';
import { z } from 'zod';
import db from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, notFound, paginated, parsePage } from '../../utils';

const router = Router();
router.use(authenticate);

// ─── LIST REVIEWS ─────────────────────────────────────────────────────────────
// ReviewsManager component: GET /reviews?workspace_id=&platform=facebook

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, platform, rating, status, sentiment, search } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const { page, limit, skip } = parsePage(req.query);
  const where: any = {
    workspace_id,
    ...(platform  && { platform: platform as any }),
    ...(rating    && { rating: parseInt(rating) }),
    ...(status    && { status }),
    ...(sentiment && { sentiment: sentiment as any }),
    ...(search    && {
      OR: [
        { content: { contains: search, mode: 'insensitive' } },
        { reviewer_name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, reviews, ratingAgg] = await Promise.all([
    db.platformReview.count({ where }),
    db.platformReview.findMany({
      where,
      orderBy: [{ is_featured: 'desc' }, { reviewed_at: 'desc' }],
      skip, take: limit,
    }),
    db.platformReview.groupBy({
      by: ['rating'],
      where: { workspace_id, ...(platform && { platform: platform as any }) },
      _count: { id: true },
    }),
  ]);

  const avgRating = total > 0
    ? (await db.platformReview.aggregate({ where: { workspace_id, ...(platform && { platform: platform as any }) }, _avg: { rating: true } }))._avg.rating
    : null;

  res.json({
    success: true,
    data: reviews,
    summary: {
      total,
      avg_rating: avgRating ? parseFloat(avgRating.toFixed(2)) : 0,
      rating_distribution: ratingAgg.reduce((acc, r) => ({ ...acc, [r.rating]: r._count.id }), {}),
    },
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

// ─── GET ONE ──────────────────────────────────────────────────────────────────

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const review = await db.platformReview.findUnique({ where: { id: req.params.id } });
  if (!review) { notFound(res, 'Review'); return; }
  ok(res, review);
});

// ─── IMPORT REVIEWS (sync from platform) ─────────────────────────────────────

const importZ = z.object({
  workspace_id:       z.string().cuid(),
  platform:           z.string(),
  social_account_id:  z.string().cuid().optional(),
  reviews: z.array(z.object({
    platform_review_id: z.string().optional(),
    reviewer_name:      z.string(),
    reviewer_avatar:    z.string().url().optional(),
    reviewer_id:        z.string().optional(),
    rating:             z.coerce.number().int().min(1).max(5),
    title:              z.string().optional(),
    content:            z.string().optional(),
    is_verified:        z.boolean().optional(),
    helpful_count:      z.coerce.number().optional(),
    reviewed_at:        z.string().datetime().optional(),
    photos:             z.array(z.string()).optional(),
  })).min(1).max(200),
});

router.post('/import', async (req: AuthRequest, res: Response): Promise<void> => {
  const p = importZ.safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }

  const { workspace_id, platform, social_account_id, reviews } = p.data;

  const upserted = await Promise.all(
    reviews.map(r =>
      db.platformReview.upsert({
        where: {
          id: r.platform_review_id
            ? `${platform}_${r.platform_review_id}`
            : randomUUID(),
        },
        create: {
          workspace_id,
          platform: platform as any,
          social_account_id: social_account_id ?? null,
          platform_review_id: r.platform_review_id ?? null,
          reviewer_name: r.reviewer_name,
          reviewer_avatar: r.reviewer_avatar ?? null,
          reviewer_id: r.reviewer_id ?? null,
          rating: r.rating,
          title: r.title ?? null,
          content: r.content ?? null,
          is_verified: r.is_verified ?? false,
          helpful_count: r.helpful_count ?? 0,
          photos: r.photos ?? [],
          reviewed_at: r.reviewed_at ? new Date(r.reviewed_at) : new Date(),
          sentiment: r.rating >= 4 ? 'positive' : r.rating === 3 ? 'neutral' : 'negative',
        },
        update: { rating: r.rating, content: r.content ?? undefined, helpful_count: r.helpful_count ?? 0 },
      })
    )
  );

  ok(res, { imported: upserted.length });
});

// ─── CREATE REVIEW RECORD ─────────────────────────────────────────────────────

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, platform, rating, reviewer_name, ...rest } = req.body;
  if (!workspace_id || !platform || !reviewer_name) {
    fail(res, 'workspace_id, platform, reviewer_name required'); return;
  }

  const review = await db.platformReview.create({
    data: {
      workspace_id, platform: platform as any, rating: parseInt(rating ?? 5),
      reviewer_name, ...rest,
      sentiment: parseInt(rating) >= 4 ? 'positive' : parseInt(rating) === 3 ? 'neutral' : 'negative',
      photos: rest.photos ?? [],
    },
  });

  created(res, review);
});

// ─── REPLY TO REVIEW ──────────────────────────────────────────────────────────

router.post('/:id/reply', async (req: AuthRequest, res: Response): Promise<void> => {
  const { reply_content } = req.body as { reply_content?: string };
  if (!reply_content?.trim()) { fail(res, 'reply_content required'); return; }

  const review = await db.platformReview.update({
    where: { id: req.params.id },
    data: { reply_content, replied_at: new Date(), status: 'responded' },
  });

  ok(res, review);
});

// ─── UPDATE REVIEW ────────────────────────────────────────────────────────────

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const allowed = ['status', 'is_featured', 'tags', 'reply_content', 'replied_at'];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const review = await db.platformReview.update({ where: { id: req.params.id }, data });
  ok(res, review);
});

// ─── BULK ACTIONS ─────────────────────────────────────────────────────────────

router.post('/bulk/action', async (req: AuthRequest, res: Response): Promise<void> => {
  const { review_ids, action } = req.body as { review_ids?: string[]; action?: string };
  if (!Array.isArray(review_ids) || !review_ids.length) { fail(res, 'review_ids array required'); return; }

  const actionMap: Record<string, object> = {
    hide:    { status: 'hidden' },
    show:    { status: 'visible' },
    report:  { status: 'reported' },
    feature: { is_featured: true },
    unfeature: { is_featured: false },
  };

  if (!action || !actionMap[action]) {
    fail(res, `action must be one of: ${Object.keys(actionMap).join(', ')}`); return;
  }

  const result = await db.platformReview.updateMany({
    where: { id: { in: review_ids } },
    data: actionMap[action],
  });

  ok(res, { updated: result.count });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await db.platformReview.delete({ where: { id: req.params.id } });
  ok(res, { deleted: true });
});

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

router.get('/analytics/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, platform } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const where: any = { workspace_id, ...(platform && { platform: platform as any }) };

  const [total, agg, recent, bySentiment, responded] = await Promise.all([
    db.platformReview.count({ where }),
    db.platformReview.aggregate({ where, _avg: { rating: true }, _sum: { helpful_count: true } }),
    db.platformReview.count({ where: { ...where, reviewed_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    db.platformReview.groupBy({ by: ['sentiment'], where, _count: { id: true } }),
    db.platformReview.count({ where: { ...where, status: 'responded' } }),
  ]);

  const dist = await db.platformReview.groupBy({ by: ['rating'], where, _count: { id: true } });

  ok(res, {
    total,
    avg_rating:          agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(2)) : 0,
    total_helpful:       agg._sum.helpful_count ?? 0,
    last_30_days:        recent,
    response_rate:       total > 0 ? Math.round((responded / total) * 100) : 0,
    sentiment:           bySentiment.reduce((a, s) => ({ ...a, [s.sentiment ?? 'neutral']: s._count.id }), {}),
    rating_distribution: dist.reduce((a, d) => ({ ...a, [d.rating]: d._count.id }), {}),
  });
});

export default router;
