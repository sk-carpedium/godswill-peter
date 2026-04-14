import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import db from '../../config/database';
import { env } from '../../config/env';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, notFound, paginated, parsePage } from '../../utils';
import { logger } from '../../config/logger';

const router = Router();
router.use(authenticate);

// ─── INVITE USER ──────────────────────────────────────────────────────────────
// Backs: base44.users.inviteUser(email, role) called in Team.jsx + RoleManagement.jsx
// The frontend also calls WorkspaceMember.create({ workspace_id, user_email, role, status: 'invited' })
// This endpoint handles the invite-token generation + email + WorkspaceMember record

const inviteZ = z.object({
  email:        z.string().email(),
  role:         z.enum(['admin', 'member', 'viewer', 'client']).default('member'),
  workspace_id: z.string().cuid(),
});

router.post('/invite', async (req: AuthRequest, res: Response): Promise<void> => {
  const p = inviteZ.safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }

  const { email, role, workspace_id } = p.data;

  // Check if already a member
  const existing = await db.workspaceMember.findFirst({
    where: { workspace_id, user_email: email },
  });
  if (existing) {
    fail(res, 'This email is already a member or has a pending invitation', 409);
    return;
  }

  // Check subscription team member limit
  const sub = await db.subscription.findUnique({ where: { workspace_id } });
  if (sub?.usage_limits) {
    const limits = sub.usage_limits as any;
    const activeMembers = await db.workspaceMember.count({
      where: { workspace_id, is_active: true },
    });
    if (limits.team_members > 0 && activeMembers >= limits.team_members) {
      fail(res, `Team member limit reached (${limits.team_members}). Upgrade your plan to add more members.`, 403);
      return;
    }
  }

  // Generate secure token + expiry
  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Upsert invitation
  const invitation = await db.userInvitation.upsert({
    where:  { workspace_id_email: { workspace_id, email } },
    create: { workspace_id, email, role: role as any, token, invited_by: req.user!.userId, expires_at: expiresAt, status: 'pending' },
    update: { role: role as any, token, invited_by: req.user!.userId, expires_at: expiresAt, status: 'pending' },
  });

  // Create WorkspaceMember record in 'invited' state (Team.jsx creates this separately,
  // but we handle it here to keep the two in sync)
  await db.workspaceMember.upsert({
    where:  { workspace_id_user_email: { workspace_id, user_email: email } },
    create: { workspace_id, user_id: null, user_email: email, role: role as any, status: 'invited', is_active: false },
    update: { role: role as any, status: 'invited' },
  });

  const workspace = await db.workspace.findUnique({
    where: { id: workspace_id },
    select: { name: true },
  });
  const workspaceName = workspace?.name ?? 'Workspace';

  // Send invite email via SMTP
  const { sendEmail, buildInviteEmail } = await import('../../config/email');
  const inviteUrl = `${env.FRONTEND_URL}/accept-invite?token=${invitation.token}`;
  const inviterName = req.user?.display_name || 'A team member';
  await sendEmail(buildInviteEmail(workspaceName, inviterName, inviteUrl, email)).catch(e => logger.warn('Invite email failed', { error: e }));
  logger.info(`Invite generated: ${email} → ${inviteUrl}`);

  created(res, {
    invitation_id: invitation.id,
    email,
    role,
    token,       // expose for dev/testing; strip in production
    invite_url:  inviteUrl,
    expires_at:  expiresAt,
  });
});

// ─── ACCEPT INVITATION ────────────────────────────────────────────────────────

router.post('/accept-invite', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token?: string };
  if (!token) { fail(res, 'token required'); return; }

  const invitation = await db.userInvitation.findUnique({ where: { token } });
  if (!invitation) { fail(res, 'Invalid invitation token', 404); return; }
  if (invitation.status !== 'pending') { fail(res, `Invitation is ${invitation.status}`); return; }
  if (invitation.expires_at < new Date()) {
    await db.userInvitation.update({ where: { token }, data: { status: 'expired' } });
    fail(res, 'Invitation has expired'); return;
  }

  // Find or create user
  let user = await db.user.findUnique({ where: { email: invitation.email } });
  if (!user) {
    // Return the invite details for the signup form
    ok(res, {
      requires_registration: true,
      email: invitation.email,
      workspace_id: invitation.workspace_id,
      role: invitation.role,
      token,
    });
    return;
  }

  // Activate membership
  await db.$transaction([
    db.workspaceMember.upsert({
      where:  { workspace_id_user_id: { workspace_id: invitation.workspace_id, user_id: user.id } },
      create: { workspace_id: invitation.workspace_id, user_id: user.id, user_email: user.email, role: invitation.role, status: 'active', is_active: true, joined_at: new Date() },
      update: { role: invitation.role, status: 'active', is_active: true, joined_at: new Date() },
    }),
    db.userInvitation.update({ where: { token }, data: { status: 'accepted', accepted_at: new Date() } }),
  ]);

  ok(res, { accepted: true, workspace_id: invitation.workspace_id, role: invitation.role });
});

// ─── LIST WORKSPACE MEMBERS ───────────────────────────────────────────────────
// WorkspaceMember.list() called in RoleManagement.jsx

router.get('/workspace/:workspaceId/members', async (req: AuthRequest, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePage(req.query);
  const { search, status } = req.query as Record<string, string>;

  const where: any = {
    workspace_id: req.params.workspaceId,
    ...(status && { status }),
    ...(search && {
      OR: [
        { user_email: { contains: search, mode: 'insensitive' } },
        { user: { display_name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, members] = await Promise.all([
    db.workspaceMember.count({ where }),
    db.workspaceMember.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, display_name: true, avatar_url: true, role: true, last_login_at: true } },
        custom_role: { select: { id: true, name: true, permissions: true } },
      },
      orderBy: [{ is_active: 'desc' }, { joined_at: 'asc' }],
      skip, take: limit,
    }),
  ]);

  paginated(res, members, total, page, limit);
});

// ─── UPDATE MEMBER ROLE + PERMISSIONS ────────────────────────────────────────
// RoleManagement.jsx: WorkspaceMember.update(id, { role, permissions })

router.patch('/workspace/:workspaceId/members/:memberId', async (req: AuthRequest, res: Response): Promise<void> => {
  const { role, permissions, custom_role_id, status } = req.body;

  const member = await db.workspaceMember.update({
    where: { id: req.params.memberId },
    data: {
      ...(role && { role: role as any }),
      ...(permissions !== undefined && { permissions: permissions as any }),
      ...(custom_role_id !== undefined && { custom_role_id }),
      ...(status && { status, is_active: status === 'active' }),
    },
    include: { user: { select: { id: true, email: true, display_name: true } }, custom_role: true },
  });

  ok(res, member);
});

// ─── REMOVE MEMBER ────────────────────────────────────────────────────────────

router.delete('/workspace/:workspaceId/members/:memberId', async (req: AuthRequest, res: Response): Promise<void> => {
  const member = await db.workspaceMember.findUnique({ where: { id: req.params.memberId } });
  if (!member) { notFound(res, 'Member'); return; }
  if (member.user_id === req.user!.userId) { fail(res, 'Cannot remove yourself'); return; }

  await db.workspaceMember.update({
    where: { id: req.params.memberId },
    data: { is_active: false, status: 'suspended' },
  });

  ok(res, { removed: true });
});

// ─── LIST PENDING INVITATIONS ─────────────────────────────────────────────────

router.get('/workspace/:workspaceId/invitations', async (req: AuthRequest, res: Response): Promise<void> => {
  const invitations = await db.userInvitation.findMany({
    where: { workspace_id: req.params.workspaceId, status: 'pending', expires_at: { gt: new Date() } },
    orderBy: { created_at: 'desc' },
  });
  ok(res, invitations.map(({ token: _, ...i }) => i));
});

// ─── REVOKE INVITATION ────────────────────────────────────────────────────────

router.delete('/invitations/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await db.userInvitation.update({ where: { id: req.params.id }, data: { status: 'revoked' } });
  ok(res, { revoked: true });
});

// ─── SEARCH USERS (for autocomplete in Team.jsx) ──────────────────────────────

router.get('/search', async (req: AuthRequest, res: Response): Promise<void> => {
  const { q } = req.query as { q?: string };
  if (!q || q.length < 2) { ok(res, []); return; }

  const users = await db.user.findMany({
    where: {
      OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { display_name: { contains: q, mode: 'insensitive' } },
      ],
      is_active: true,
    },
    select: { id: true, email: true, display_name: true, avatar_url: true, role: true },
    take: 10,
  });

  ok(res, users);
});

export default router;
