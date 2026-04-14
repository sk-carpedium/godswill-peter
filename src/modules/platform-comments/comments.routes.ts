import { randomUUID } from 'crypto';
import { Router, Response } from 'express';
import { z } from 'zod';
import db from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, notFound, paginated, parsePage } from '../../utils';

const router = Router();
router.use(authenticate);

// ─── LIST COMMENTS ────────────────────────────────────────────────────────────
// Used by:
//   CommentsManager (Pinterest, TikTok, Twitter, Threads)
//   CommentManager  (YouTube, Twitch, Rumble)

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, platform, video_id, social_account_id, status, sentiment } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const { page, limit, skip } = parsePage(req.query);
  const where: any = {
    workspace_id,
    ...(platform          && { platform: platform as any }),
    ...(video_id          && { video_id }),
    ...(social_account_id && { social_account_id }),
    ...(status            && { status }),
    ...(sentiment         && { sentiment: sentiment as any }),
    is_reply: false, // top-level only by default
  };

  const [total, comments] = await Promise.all([
    db.platformComment.count({ where }),
    db.platformComment.findMany({
      where,
      orderBy: [{ is_pinned: 'desc' }, { commented_at: 'desc' }],
      skip, take: limit,
    }),
  ]);

  paginated(res, comments, total, page, limit);
});

// ─── GET COMMENT THREAD ───────────────────────────────────────────────────────

router.get('/:id/thread', async (req: AuthRequest, res: Response): Promise<void> => {
  const comment = await db.platformComment.findUnique({ where: { id: req.params.id } });
  if (!comment) { notFound(res, 'Comment'); return; }

  const replies = await db.platformComment.findMany({
    where: { parent_comment_id: req.params.id },
    orderBy: { commented_at: 'asc' },
  });

  ok(res, { comment, replies });
});

// ─── IMPORT COMMENTS (sync from platform) ────────────────────────────────────

const importZ = z.object({
  workspace_id:       z.string().cuid(),
  platform:           z.string(),
  video_id:           z.string().cuid().optional(),
  social_account_id:  z.string().cuid().optional(),
  comments:           z.array(z.object({
    platform_comment_id: z.string().optional(),
    author_name:         z.string(),
    author_avatar:       z.string().url().optional(),
    content:             z.string(),
    likes:               z.coerce.number().optional(),
    commented_at:        z.string().datetime().optional(),
    parent_comment_id:   z.string().optional(),
    is_reply:            z.boolean().optional(),
  })).min(1).max(500),
});

router.post('/import', async (req: AuthRequest, res: Response): Promise<void> => {
  const p = importZ.safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }

  const { workspace_id, platform, video_id, social_account_id, comments } = p.data;

  const created_comments = await db.$transaction(
    comments.map(c =>
      db.platformComment.upsert({
        where: {
          id: c.platform_comment_id
            ? `${platform}_${c.platform_comment_id}`
            : randomUUID(),
        },
        create: {
          workspace_id, platform: platform as any,
          video_id: video_id ?? null,
          social_account_id: social_account_id ?? null,
          platform_comment_id: c.platform_comment_id ?? null,
          author_name: c.author_name,
          author_avatar: c.author_avatar ?? null,
          content: c.content,
          likes: c.likes ?? 0,
          is_reply: c.is_reply ?? false,
          parent_comment_id: c.parent_comment_id ?? null,
          commented_at: c.commented_at ? new Date(c.commented_at) : new Date(),
        },
        update: { likes: c.likes ?? 0, content: c.content },
      })
    )
  );

  ok(res, { imported: created_comments.length });
});

// ─── CREATE COMMENT RECORD ────────────────────────────────────────────────────

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, platform, video_id, author_name, content, ...rest } = req.body;
  if (!workspace_id || !platform || !content) {
    fail(res, 'workspace_id, platform, content required'); return;
  }

  const comment = await db.platformComment.create({
    data: {
      workspace_id,
      platform: platform as any,
      video_id: video_id ?? null,
      author_name: author_name ?? 'Unknown',
      content,
      ...rest,
      commented_at: rest.commented_at ? new Date(rest.commented_at) : new Date(),
    },
  });

  created(res, comment);
});

// ─── UPDATE (hide, pin, mark spam, save reply) ────────────────────────────────

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const allowed = ['status', 'is_pinned', 'reply_content', 'replied_at', 'sentiment'];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  if (req.body.reply_content) {
    (data as any).replied_at = new Date();
  }

  const comment = await db.platformComment.update({ where: { id: req.params.id }, data });
  ok(res, comment);
});

// ─── REPLY TO COMMENT ────────────────────────────────────────────────────────

router.post('/:id/reply', async (req: AuthRequest, res: Response): Promise<void> => {
  const parent = await db.platformComment.findUnique({ where: { id: req.params.id } });
  if (!parent) { notFound(res, 'Comment'); return; }

  const { reply_content } = req.body as { reply_content?: string };
  if (!reply_content?.trim()) { fail(res, 'reply_content required'); return; }

  // Mark parent as replied
  await db.platformComment.update({
    where: { id: req.params.id },
    data: { reply_content, replied_at: new Date() },
  });

  // Create reply record
  const reply = await db.platformComment.create({
    data: {
      workspace_id:       parent.workspace_id,
      platform:           parent.platform,
      video_id:           parent.video_id,
      social_account_id:  parent.social_account_id,
      author_name:        'You', // workspace owner reply
      content:            reply_content,
      is_reply:           true,
      parent_comment_id:  parent.id,
    },
  });

  ok(res, reply);
});

// ─── BULK ACTIONS ─────────────────────────────────────────────────────────────

router.post('/bulk/action', async (req: AuthRequest, res: Response): Promise<void> => {
  const { comment_ids, action } = req.body as { comment_ids?: string[]; action?: string };
  if (!Array.isArray(comment_ids) || !comment_ids.length) { fail(res, 'comment_ids array required'); return; }

  const actionMap: Record<string, object> = {
    hide:   { status: 'hidden' },
    show:   { status: 'visible' },
    spam:   { status: 'spam' },
    report: { status: 'reported' },
    pin:    { is_pinned: true },
    unpin:  { is_pinned: false },
  };

  if (!action || !actionMap[action]) { fail(res, `action must be one of: ${Object.keys(actionMap).join(', ')}`); return; }

  const result = await db.platformComment.updateMany({
    where: { id: { in: comment_ids } },
    data: actionMap[action],
  });

  ok(res, { updated: result.count });
});

// ─── COMMENT ANALYTICS ────────────────────────────────────────────────────────

router.get('/analytics/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, platform } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const where: any = { workspace_id, ...(platform && { platform: platform as any }) };

  const [total, bySentiment, byStatus] = await Promise.all([
    db.platformComment.count({ where }),
    db.platformComment.groupBy({ by: ['sentiment'], where, _count: { id: true } }),
    db.platformComment.groupBy({ by: ['status'],    where, _count: { id: true } }),
  ]);

  ok(res, { total, by_sentiment: bySentiment, by_status: byStatus });
});

export default router;
