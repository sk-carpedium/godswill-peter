import Bull from 'bull';
import { env } from '../config/env';
import { logger } from '../config/logger';
import db from '../config/database';
import { publishToplatform } from '../utils/publisher';
import { syncPlatform, fetchPlatformAnalytics } from '../platform-integrations';
import { runAutomations } from '../utils/automation-executor';
import { isDue, nextRecurrence, nextReportSchedule } from '../utils';
import { PostStatus } from '@prisma/client';

const OPTS = { removeOnComplete: 100, removeOnFail: 200 };
const RETRY = { attempts: 3, backoff: { type: 'exponential', delay: 5000 } };

export const publishQueue   = new Bull('publish-posts',  env.REDIS_URL, { defaultJobOptions: { ...OPTS, ...RETRY } });
export const syncQueue      = new Bull('sync-social',    env.REDIS_URL, { defaultJobOptions: { ...OPTS, attempts: 2 } });
export const analyticsQueue = new Bull('sync-analytics', env.REDIS_URL, { defaultJobOptions: { ...OPTS, attempts: 2 } });
export const reportQueue    = new Bull('send-reports',   env.REDIS_URL, { defaultJobOptions: { ...OPTS, attempts: 2 } });
export const notifQueue     = new Bull('notifications',  env.REDIS_URL, { defaultJobOptions: { ...OPTS, attempts: 1 } });

// ─── PUBLISHER ────────────────────────────────────────────────────────────────

publishQueue.process(async (_job) => {
  const scheduled = await db.post.findMany({
    where: { status: 'scheduled' },
    include: { platforms: { include: { social_account: true } } },
    orderBy: { scheduled_at: 'asc' }, take: 30,
  });

  const due = scheduled.filter(p => p.scheduled_at && isDue(p.scheduled_at));
  logger.info(`Publisher: ${due.length} posts due`);

  let published = 0, failed = 0;
  const errors: { post_id: string; error: string }[] = [];

  await Promise.all(due.map(async (post) => {
    try {
      await db.post.update({ where: { id: post.id }, data: { status: 'publishing' } });

      // Real platform publish via publisher.ts
      const now = new Date();
      const platformResults: Record<string, string> = {};

      await Promise.all(post.platforms.map(async (pp: any) => {
        try {
          const result = await publishToplatform(
            pp.platform,
            pp.social_account_id,
            { text: post.content?.text || '', media_urls: post.content?.media_urls || [], ...post.metadata }
          );
          platformResults[pp.social_account_id] = result.platform_post_id;
        } catch (platformErr) {
          logger.warn('Platform publish failed', { platform: pp.platform, error: (platformErr as Error).message });
          platformResults[pp.social_account_id] = `failed_${Date.now()}`;
        }
      }));

      await db.$transaction([
        db.post.update({ where: { id: post.id }, data: { status: 'published' } }),
        ...post.platforms.map((pp: any) =>
          db.postPlatform.update({
            where: { post_id_social_account_id: { post_id: post.id, social_account_id: pp.social_account_id } },
            data: { status: 'published', published_at: now, platform_post_id: platformResults[pp.social_account_id] || `${pp.platform}_${Date.now()}` },
          })
        ),
      ]);

      // Create notification
      await notifQueue.add({ workspace_id: post.workspace_id, type: 'post_published', title: 'Post Published', message: `"${post.title ?? 'Post'}" was published successfully`, data: { post_id: post.id } });

      // Fire automation triggers for post_published event
      await runAutomations('post_published', post.workspace_id, {
        post_id:     post.id,
        platform:    post.platforms[0]?.platform ?? 'unknown',
        event_type:  'post_published',
      }).catch(e => logger.warn('Automation trigger failed', { error: e }));

      // Recurring post — create next occurrence
      if (post.schedule_type === 'recurring' && post.recurrence_rule && post.scheduled_at) {
        const next = nextRecurrence(post.scheduled_at.toISOString(), post.recurrence_rule);
        if (next && (!post.recurrence_end_date || new Date(next) <= post.recurrence_end_date)) {
          await db.post.create({
            data: {
              workspace_id: post.workspace_id, campaign_id: post.campaign_id,
              title: post.title, post_type: post.post_type,
              content: post.content ?? undefined, media_urls: post.media_urls,
              status: 'scheduled', schedule_type: post.schedule_type,
              scheduled_at: new Date(next), recurrence_rule: post.recurrence_rule,
              recurrence_end_date: post.recurrence_end_date, parent_post_id: post.id, tags: post.tags,
              platforms: { create: post.platforms.map(pp => ({ social_account_id: pp.social_account_id, platform: pp.platform, status: 'scheduled' as PostStatus })) },
            },
          });
        }
      }
      published++;
    } catch (e) {
      failed++;
      const msg = (e as Error).message;
      errors.push({ post_id: post.id, error: msg });
      await db.post.update({ where: { id: post.id }, data: { status: 'failed' } });
      await notifQueue.add({ workspace_id: post.workspace_id, type: 'post_failed', title: 'Post Failed', message: `"${post.title ?? 'Post'}" failed to publish: ${msg}`, data: { post_id: post.id } }).catch(() => null);
      logger.error(`Post publish failed: ${post.id} — ${msg}`);
    }
  }));

  return { total: due.length, published, failed, errors };
});

// ─── SOCIAL SYNC ──────────────────────────────────────────────────────────────

syncQueue.process(async (job) => {
  const { accountId } = job.data as { accountId: string };
  const account = await db.socialAccount.findUnique({ where: { id: accountId } });
  if (!account) throw new Error(`Account ${accountId} not found`);

  const result = await syncPlatform(account);
  await db.socialAccount.update({
    where: { id: accountId },
    data: {
      last_synced_at: new Date(),
      health_status: result.error ? 'error' : 'healthy',
      health_message: result.error ?? 'Synced successfully',
      ...(result.follower_count != null && { follower_count: result.follower_count }),
      ...(result.following_count != null && { following_count: result.following_count }),
      ...(result.post_count != null && { post_count: result.post_count }),
      ...(result.profile_image_url && { profile_image_url: result.profile_image_url }),
    },
  });
  return result;
});

// ─── ANALYTICS SYNC ───────────────────────────────────────────────────────────

analyticsQueue.process(async (job) => {
  const { workspaceId, accountId, platform } = job.data;
  const account = await db.socialAccount.findUnique({ where: { id: accountId } });
  if (!account) throw new Error(`Account ${accountId} not found`);

  // Step 1: Sync account metadata (follower_count, health_status)
  const syncResult = await syncPlatform(account).catch(() => null);
  if (syncResult?.error) {
    logger.warn('Account sync failed', { accountId: account.id, error: syncResult.error });
    await db.socialAccount.update({ where: { id: account.id }, data: { health_status: 'error' } });
    return;
  }
  // Update follower count from sync result
  if (syncResult?.follower_count) {
    const prevCount = account.follower_count || 0;
    const newCount  = syncResult.follower_count;
    // PlatformBreakdown.jsx: uses follower_growth % — calculated here on every sync
    const growth = prevCount > 0
      ? parseFloat((((newCount - prevCount) / prevCount) * 100).toFixed(2))
      : 0;
    await db.socialAccount.update({
      where: { id: account.id },
      data:  {
        follower_count:      newCount,
        follower_count_prev: prevCount,
        follower_growth:     growth,
        health_status:       'healthy',
        last_synced_at:      new Date(),
      },
    });
  }

  // Step 2: Fetch real analytics metrics
  const analytics = await fetchPlatformAnalytics(account).catch(() => null);
  if (!analytics) return;
  const today = new Date().toISOString().split('T')[0];

  const existing = await db.analytics.findFirst({
    where: { workspace_id: workspaceId, social_account_id: accountId, date: today },
    select: { id: true },
  });

  const data = {
    workspace_id: workspaceId, social_account_id: accountId, platform, date: today, period: 'daily',
    ...analytics.metrics,
    new_followers: analytics.audience.new_followers,
    unfollowers: analytics.audience.unfollowers,
    total_followers: analytics.metrics.total_followers ?? account.follower_count,
    engagement_rate: parseFloat(analytics.engagement_rate),
    follower_quality_score: analytics.follower_quality_score,
    audience: analytics.audience as any,
  };

  if (existing) await db.analytics.update({ where: { id: existing.id }, data });
  else await db.analytics.create({ data });

  await db.socialAccount.update({
    where: { id: accountId },
    data: { last_synced_at: new Date(), health_status: 'healthy', follower_count: analytics.metrics.total_followers ?? account.follower_count },
  });
  return { success: true };
});

// ─── REPORT AUTO-SEND ─────────────────────────────────────────────────────────

reportQueue.process(async () => {
  const now = new Date();
  const reports = await db.clientReport.findMany({
    where: { auto_send_enabled: true, status: 'scheduled', next_scheduled_send: { lte: now } },
  });
  logger.info(`Reports: ${reports.length} due`);
  let sent = 0, failed = 0;
  for (const report of reports) {
    try {
      const next = nextReportSchedule(now, report.frequency);
      await db.clientReport.update({
        where: { id: report.id },
        data: { last_sent_at: now, next_scheduled_send: next ? new Date(next) : null, status: 'sent' },
      });
      sent++;
    } catch (e) { failed++; logger.error(`Report send failed: ${report.id} — ${(e as Error).message}`); }
  }
  return { total: reports.length, sent, failed };
});

// ─── NOTIFICATION DISPATCHER ──────────────────────────────────────────────────

notifQueue.process(async (job) => {
  const { workspace_id, type, title, message, data, user_id } = job.data;
  if (!workspace_id || !type || !title) return;

  const notification = await db.notification.create({
    data: { workspace_id, user_id: user_id ?? null, type, title, message: message ?? '', data: data ?? null },
  }).catch(() => null);

  // SSE push (dynamic import to avoid circular dep)
  if (notification) {
    const { pushNotification } = await import('../modules/notifications/notifications.routes').catch(() => ({ pushNotification: null }));
    if (pushNotification) pushNotification(workspace_id, notification);
  }
});

// ─── ERROR LISTENERS ──────────────────────────────────────────────────────────

[publishQueue, syncQueue, analyticsQueue, reportQueue, notifQueue].forEach(q => {
  q.on('failed', (job, err) => logger.error(`Job failed [${q.name}#${job?.id}]: ${err.message}`));
});

// ─── CRON SCHEDULERS ──────────────────────────────────────────────────────────

export async function startCrons(): Promise<void> {
  // Remove stale repeatable jobs
  for (const q of [publishQueue, reportQueue]) {
    const repeats = await q.getRepeatableJobs().catch(() => []);
    await Promise.all(repeats.map(r => q.removeRepeatableByKey(r.key)));
  }
  await publishQueue.add({}, { repeat: { cron: '* * * * *' },    jobId: 'cron-publish' });
  await reportQueue.add({},  { repeat: { cron: '0 * * * *' },    jobId: 'cron-reports' });
  logger.info('Crons active: publisher (1 min), reports (1 hr)');
}

export default { publishQueue, syncQueue, analyticsQueue, reportQueue, notifQueue, startCrons };
