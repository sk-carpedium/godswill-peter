import { Router, Request, Response } from 'express';
import db from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, paginated, parsePage } from '../../utils';
import { logger } from '../../config/logger';

const router = Router();

// SSE connection store
const sseClients = new Map<string, Set<Response>>();

export function pushNotification(workspaceId: string, notification: object) {
  const clients = sseClients.get(workspaceId);
  if (!clients?.size) return;
  const payload = `data: ${JSON.stringify(notification)}\n\n`;
  clients.forEach(client => { try { client.write(payload); } catch { clients.delete(client); } });
}

// SSE stream endpoint (no auth middleware — uses query param token)
router.get('/stream', authenticate, (req: AuthRequest, res: Response) => {
  const workspaceId = req.query.workspace_id as string;
  if (!workspaceId) { fail(res, 'workspace_id required'); return; }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch { clearInterval(ping); } }, 30_000);
  db.notification.count({ where: { workspace_id: workspaceId, is_read: false } })
    .then(count => res.write(`data: ${JSON.stringify({ type: 'init', unread_count: count })}\n\n`))
    .catch(() => null);
  if (!sseClients.has(workspaceId)) sseClients.set(workspaceId, new Set());
  sseClients.get(workspaceId)!.add(res);
  logger.debug(`SSE connected: ${workspaceId}`);
  req.on('close', () => { clearInterval(ping); sseClients.get(workspaceId)?.delete(res); });
});

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, is_read, type } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const { page, limit, skip } = parsePage(req.query);
  const where: any = { workspace_id, OR: [{ user_id: null }, { user_id: req.user!.userId }], ...(is_read !== undefined && { is_read: is_read === 'true' }), ...(type && { type }) };
  const [total, notifications] = await Promise.all([db.notification.count({ where }), db.notification.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: limit })]);
  paginated(res, notifications, total, page, limit);
});

router.get('/unread-count', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.query as { workspace_id: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const count = await db.notification.count({ where: { workspace_id, is_read: false, OR: [{ user_id: null }, { user_id: req.user!.userId }] } });
  ok(res, { unread_count: count });
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, user_id, type, title, message, data, action_url } = req.body;
  if (!workspace_id || !type || !title) { fail(res, 'workspace_id, type, title required'); return; }
  const notification = await db.notification.create({ data: { workspace_id, user_id: user_id ?? null, type, title, message: message ?? '', data: data ?? null, action_url: action_url ?? null } });
  pushNotification(workspace_id, notification);
  created(res, notification);
});

router.patch('/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  ok(res, await db.notification.update({ where: { id: req.params.id }, data: { is_read: true } }));
});

router.post('/mark-all-read', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.body as { workspace_id: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const result = await db.notification.updateMany({ where: { workspace_id, is_read: false, OR: [{ user_id: null }, { user_id: req.user!.userId }] }, data: { is_read: true } });
  ok(res, { marked_read: result.count });
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await db.notification.delete({ where: { id: req.params.id } });
  ok(res, { deleted: true });
});

export default router;
