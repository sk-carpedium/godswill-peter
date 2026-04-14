import { Router, Response } from 'express';
import db from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, notFound, paginated, parsePage } from '../../utils';

const router = Router();
router.use(authenticate);

router.get('/workflows', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.query as { workspace_id: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  ok(res, await db.approvalWorkflow.findMany({ where: { workspace_id }, include: { _count: { select: { approvals: true } } }, orderBy: { created_at: 'desc' } }));
});

router.post('/workflows', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, name, description, stages, platforms, post_types, is_active } = req.body;
  if (!workspace_id || !name || !Array.isArray(stages) || !stages.length) { fail(res, 'workspace_id, name, stages required'); return; }
  created(res, await db.approvalWorkflow.create({ data: { workspace_id, name, description, stages: stages as any, platforms: platforms ?? [], post_types: post_types ?? [], is_active: is_active ?? true } }));
});

router.patch('/workflows/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  ok(res, await db.approvalWorkflow.update({ where: { id: req.params.id }, data: { ...req.body, stages: req.body.stages as any } }));
});

router.delete('/workflows/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await db.approvalWorkflow.delete({ where: { id: req.params.id } });
  ok(res, { deleted: true });
});

router.get('/approvals', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, status, post_id } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const { page, limit, skip } = parsePage(req.query);
  const where: any = { workspace_id, ...(status && { status }), ...(post_id && { post_id }) };
  const [total, approvals] = await Promise.all([db.contentApproval.count({ where }), db.contentApproval.findMany({ where, include: { workflow: { select: { id: true, name: true, stages: true } }, post: { select: { id: true, title: true, content: true, status: true } }, submitter: { select: { id: true, email: true, display_name: true } } }, orderBy: { created_at: 'desc' }, skip, take: limit })]);
  paginated(res, approvals, total, page, limit);
});

router.get('/approvals/pending', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.query as { workspace_id: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const approvals = await db.contentApproval.findMany({ where: { workspace_id, status: 'pending_review' }, include: { workflow: true, post: { select: { id: true, title: true, content: true, platforms: true } }, submitter: { select: { id: true, email: true, display_name: true } } } });
  const userApprovals = approvals.filter(a => { const stages = (a.workflow?.stages ?? []) as any[]; const current = stages[a.current_stage]; return !current || current.approver_ids?.includes(req.user!.userId); });
  ok(res, userApprovals);
});

router.post('/approvals', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, post_id, workflow_id, due_date } = req.body;
  if (!workspace_id || !post_id) { fail(res, 'workspace_id and post_id required'); return; }
  await db.post.update({ where: { id: post_id }, data: { status: 'pending_approval' } });
  created(res, await db.contentApproval.create({ data: { workspace_id, post_id, workflow_id: workflow_id ?? null, status: 'pending_review', current_stage: 0, submitted_by: req.user!.userId, due_date: due_date ? new Date(due_date) : null, stage_history: [] }, include: { workflow: true, post: true } }));
});

router.post('/approvals/:id/review', async (req: AuthRequest, res: Response): Promise<void> => {
  const { action, notes } = req.body as { action: 'approved'|'rejected'|'changes_requested'; notes?: string };
  if (!['approved','rejected','changes_requested'].includes(action)) { fail(res, 'Invalid action'); return; }
  const approval = await db.contentApproval.findUnique({ where: { id: req.params.id }, include: { workflow: true } });
  if (!approval) { notFound(res, 'Approval'); return; }
  const stages = (approval.workflow?.stages ?? []) as any[];
  const history = [...(approval.stage_history as any[]), { stage: approval.current_stage, status: action, reviewer: req.user!.userId, notes, at: new Date().toISOString() }];
  let newStatus = action, nextStage = approval.current_stage;
  if (action === 'approved' && approval.current_stage < stages.length - 1) { nextStage = approval.current_stage + 1; newStatus = 'pending_review'; }
  if (newStatus === 'approved' && approval.post_id) await db.post.update({ where: { id: approval.post_id }, data: { status: 'scheduled' } });
  else if (newStatus === 'rejected' && approval.post_id) await db.post.update({ where: { id: approval.post_id }, data: { status: 'draft' } });
  ok(res, await db.contentApproval.update({ where: { id: req.params.id }, data: { status: newStatus as any, current_stage: nextStage, reviewed_by: req.user!.userId, review_notes: notes, stage_history: history }, include: { workflow: true, post: { select: { id: true, title: true } } } }));
});

router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.query as { workspace_id: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const [pending, approved, rejected, changes] = await Promise.all([db.contentApproval.count({ where: { workspace_id, status: 'pending_review' } }), db.contentApproval.count({ where: { workspace_id, status: 'approved' } }), db.contentApproval.count({ where: { workspace_id, status: 'rejected' } }), db.contentApproval.count({ where: { workspace_id, status: 'changes_requested' } })]);
  ok(res, { pending, approved, rejected, changes_requested: changes, total: pending + approved + rejected + changes });
});

export default router;
