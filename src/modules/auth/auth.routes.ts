import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../../config/database';
import { env } from '../../config/env';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, unauthorized } from '../../utils';

const router = Router();

function sign(userId: string, email: string, role: string) {
  const access  = jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN  as any });
  const refresh = jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
  return { access, refresh };
}

async function storeRefresh(userId: string, token: string) {
  const exp = new Date(); exp.setDate(exp.getDate() + 7);
  await db.refreshToken.create({ data: { token, user_id: userId, expires_at: exp } });
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────

const registerZ = z.object({ email: z.string().email(), password: z.string().min(8), display_name: z.string().max(100).optional(), workspace_name: z.string().min(1).max(100) });

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const p = registerZ.safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }
  const { email, password, display_name, workspace_name } = p.data;
  if (await db.user.findUnique({ where: { email } })) { fail(res, 'Email already registered', 409); return; }
  const hash = await bcrypt.hash(password, 12);
  const slug = workspace_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
  const user = await db.user.create({
    data: {
      email, password_hash: hash, display_name, role: 'admin',
      workspace_members: { create: { role: 'admin', joined_at: new Date(), workspace: { create: { name: workspace_name, slug, subscription: { create: { plan: 'free', status: 'trialing' } }, appearance_settings: { create: { primary_color: '#d4af37' } }, onboarding_state: { create: { workspace_created: true } } } } } },
    },
    include: { workspace_members: { include: { workspace: { select: { id: true, name: true, slug: true } } } } },
  });
  // Fix onboarding user_id after creation
  const ws = user.workspace_members[0]?.workspace;
  if (ws) await db.onboardingState.update({ where: { workspace_id: ws.id }, data: { user_id: user.id } }).catch(() => null);
  const { access, refresh } = sign(user.id, user.email, user.role);
  await storeRefresh(user.id, refresh);
  created(res, { access_token: access, refresh_token: refresh, user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role }, workspace: ws });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) { fail(res, 'email and password required'); return; }
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) { res.status(401).json({ success: false, error: 'Invalid credentials' }); return; }
  await db.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });
  const ws = await db.workspaceMember.findFirst({ where: { user_id: user.id, is_active: true }, include: { workspace: { select: { id: true, name: true, slug: true } } }, orderBy: { joined_at: 'asc' } });
  const { access, refresh } = sign(user.id, user.email, user.role);
  await storeRefresh(user.id, refresh);
  ok(res, { access_token: access, refresh_token: refresh, user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role }, workspace: ws?.workspace ?? null });
});

// ─── REFRESH ──────────────────────────────────────────────────────────────────

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refresh_token } = req.body as { refresh_token?: string };
  if (!refresh_token) { fail(res, 'refresh_token required'); return; }
  const stored = await db.refreshToken.findUnique({ where: { token: refresh_token } });
  if (!stored || stored.expires_at < new Date()) { unauthorized(res); return; }
  const user = await db.user.findUnique({ where: { id: stored.user_id } });
  if (!user || !user.is_active) { unauthorized(res); return; }
  await db.refreshToken.delete({ where: { id: stored.id } });
  const { access, refresh } = sign(user.id, user.email, user.role);
  await storeRefresh(user.id, refresh);
  ok(res, { access_token: access, refresh_token: refresh });
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

router.post('/logout', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { refresh_token } = req.body as { refresh_token?: string };
  if (refresh_token) await db.refreshToken.deleteMany({ where: { token: refresh_token } }).catch(() => null);
  ok(res, null);
});

// ─── ME ───────────────────────────────────────────────────────────────────────

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await db.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, display_name: true, avatar_url: true, role: true, totp_enabled: true, created_at: true, last_login_at: true, onboarding_completed: true, tour_completed: true, checklist_dismissed: true, checklist_completed: true, sidebar_order: true,
      workspace_members: { where: { is_active: true }, include: { workspace: { select: { id: true, name: true, slug: true, logo_url: true }, include: { appearance_settings: true } as any } } } },
  });
  if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }
  ok(res, user);
});

router.patch('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  // Onboarding.jsx:       auth.updateMe({ onboarding_completed: true })
  // SidebarCustomizer.jsx: auth.updateMe({ sidebar_order: ['Dashboard','Analytics',...] })
  //                        auth.updateMe({ sidebar_order: null }) — reset
  const allowedFields = ['display_name', 'avatar_url', 'onboarding_completed', 'sidebar_order','tour_completed','checklist_dismissed','checklist_completed'];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowedFields.includes(k)));
  const user = await db.user.update({
    where: { id: req.user!.userId },
    data,
    select: { id: true, email: true, display_name: true, avatar_url: true, role: true, onboarding_completed: true, sidebar_order: true },
  });
  ok(res, user);
});

router.post('/password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { current_password, new_password } = req.body as { current_password?: string; new_password?: string };
  if (!current_password || !new_password) { fail(res, 'current_password and new_password required'); return; }
  if (new_password.length < 8) { fail(res, 'New password must be at least 8 characters'); return; }
  const user = await db.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || !(await bcrypt.compare(current_password, user.password_hash))) { fail(res, 'Current password incorrect', 401); return; }
  await db.user.update({ where: { id: user.id }, data: { password_hash: await bcrypt.hash(new_password, 12) } });
  await db.refreshToken.deleteMany({ where: { user_id: user.id } });
  ok(res, { message: 'Password updated — please log in again' });
});

export default router;
