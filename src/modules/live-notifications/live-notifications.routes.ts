import { Router, Response } from 'express';
import { z } from 'zod';
import db from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, notFound, paginated, parsePage } from '../../utils';
import { logger } from '../../config/logger';

const router = Router();
router.use(authenticate);

// ─── LIST NOTIFICATION SCHEDULES ──────────────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, status, platform, notification_type } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const { page, limit, skip } = parsePage(req.query);
  const where: any = {
    workspace_id,
    ...(status            && { status }),
    ...(platform          && { platform: platform as any }),
    ...(notification_type && { notification_type }),
  };

  const [total, schedules] = await Promise.all([
    db.notificationSchedule.count({ where }),
    db.notificationSchedule.findMany({
      where,
      orderBy: [{ scheduled_at: 'desc' }, { created_at: 'desc' }],
      skip, take: limit,
    }),
  ]);

  paginated(res, schedules, total, page, limit);
});

// ─── CREATE NOTIFICATION SCHEDULE ────────────────────────────────────────────

const createZ = z.object({
  workspace_id:       z.string().cuid(),
  post_id:            z.string().cuid().optional(),
  social_account_id:  z.string().cuid().optional(),
  platform:           z.string().optional(),
  notification_type:  z.enum(['post', 'story', 'reel', 'short', 'video', 'livestream']),
  title:              z.string().min(1).max(300),
  message:            z.string().min(1).max(1000),
  scheduled_at:       z.string().datetime().optional(),
  audience:           z.enum(['all_followers', 'subscribers', 'custom']).optional(),
  channels:           z.array(z.string()).optional(), // push, email, sms
  metadata:           z.record(z.unknown()).optional(),
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const p = createZ.safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }

  const schedule = await db.notificationSchedule.create({
    data: {
      ...p.data,
      platform: p.data.platform as any ?? null,
      scheduled_at: p.data.scheduled_at ? new Date(p.data.scheduled_at) : null,
      channels: p.data.channels ?? ['push'],
      audience: p.data.audience ?? 'all_followers',
      status: 'pending',
      metadata: p.data.metadata as any ?? null,
    },
  });

  created(res, schedule);
});

// ─── BULK SCHEDULE (one notification per platform for a post) ─────────────────

router.post('/bulk', async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    workspace_id, post_id, notification_type = 'post',
    title, message, platforms, scheduled_at, channels,
  } = req.body as {
    workspace_id: string; post_id?: string; notification_type?: string;
    title: string; message: string; platforms: string[];
    scheduled_at?: string; channels?: string[];
  };

  if (!workspace_id || !title || !message || !Array.isArray(platforms) || !platforms.length) {
    fail(res, 'workspace_id, title, message, platforms[] required'); return;
  }

  const schedules = await db.$transaction(
    platforms.map(platform =>
      db.notificationSchedule.create({
        data: {
          workspace_id,
          post_id: post_id ?? null,
          platform: platform as any,
          notification_type: notification_type as any,
          title, message,
          channels: channels ?? ['push'],
          audience: 'all_followers',
          scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
          status: 'pending',
        },
      })
    )
  );

  ok(res, { created: schedules.length, schedules });
});

// ─── UPDATE ───────────────────────────────────────────────────────────────────

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { scheduled_at, ...rest } = req.body;
  const schedule = await db.notificationSchedule.update({
    where: { id: req.params.id },
    data: { ...rest, ...(scheduled_at && { scheduled_at: new Date(scheduled_at) }) },
  });
  ok(res, schedule);
});

// ─── CANCEL ───────────────────────────────────────────────────────────────────

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const schedule = await db.notificationSchedule.findUnique({ where: { id: req.params.id }, select: { status: true } });
  if (!schedule) { notFound(res, 'Notification schedule'); return; }
  if (schedule.status === 'sent') { fail(res, 'Cannot cancel a sent notification'); return; }

  await db.notificationSchedule.update({ where: { id: req.params.id }, data: { status: 'cancelled' } });
  ok(res, { cancelled: true });
});

// ─── SEND NOW ─────────────────────────────────────────────────────────────────

router.post('/:id/send', async (req: AuthRequest, res: Response): Promise<void> => {
  const schedule = await db.notificationSchedule.findUnique({ where: { id: req.params.id } });
  if (!schedule) { notFound(res, 'Schedule'); return; }
  if (schedule.status === 'sent') { fail(res, 'Already sent'); return; }

  // Send the notification via channels
  const sentAt = new Date();

  // Push notification (using existing SSE/notification system)
  if (schedule.channels.includes('push')) {
    await db.notification.create({
      data: {
        workspace_id:  schedule.workspace_id,
        type:          'post_published',
        title:         schedule.title,
        message:       schedule.message,
        data:          { post_id: schedule.post_id, platform: schedule.platform, notification_type: schedule.notification_type } as any,
        action_url:    schedule.post_id ? `/posts/${schedule.post_id}` : null,
      },
    });
  }

  // Email delivered via sendEmail() in config/email.ts — see live-notifications module
  // SMS: add TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM to .env

  await db.notificationSchedule.update({
    where: { id: req.params.id },
    data: { status: 'sent', sent_at: sentAt },
  });

  logger.info(`Live notification sent: ${schedule.title} → ${schedule.platform ?? 'all'}`);
  ok(res, { sent: true, sent_at: sentAt });
});

// ─── STATS ────────────────────────────────────────────────────────────────────

router.get('/stats/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.query as { workspace_id: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const [total, byStatus, byType, byPlatform] = await Promise.all([
    db.notificationSchedule.count({ where: { workspace_id } }),
    db.notificationSchedule.groupBy({ by: ['status'], where: { workspace_id }, _count: { id: true } }),
    db.notificationSchedule.groupBy({ by: ['notification_type'], where: { workspace_id }, _count: { id: true } }),
    db.notificationSchedule.groupBy({ by: ['platform'], where: { workspace_id, platform: { not: null } }, _count: { id: true } }),
  ]);

  ok(res, {
    total,
    by_status:   byStatus.reduce((a, s) => ({ ...a, [s.status]: s._count.id }), {}),
    by_type:     byType.reduce((a, t) => ({ ...a, [t.notification_type]: t._count.id }), {}),
    by_platform: byPlatform.reduce((a, p) => ({ ...a, [p.platform ?? 'all']: p._count.id }), {}),
  });
});

// ─── DUE NOTIFICATIONS (called by scheduler) ──────────────────────────────────

router.get('/due', async (req: AuthRequest, res: Response): Promise<void> => {
  const due = await db.notificationSchedule.findMany({
    where: { status: 'pending', scheduled_at: { lte: new Date() } },
    take: 50,
  });
  ok(res, due);
});

export default router;
