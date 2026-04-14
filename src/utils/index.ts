import crypto from 'crypto';
import { env } from '../config/env';
import { Response } from 'express';

// ─── CRYPTO ───────────────────────────────────────────────────────────────────
const ALGO = 'aes-256-gcm', IV_LEN = 16, TAG_LEN = 16;
function getKey() { const k = env.ENCRYPTION_KEY; if (!k) throw new Error('ENCRYPTION_KEY not set'); return crypto.scryptSync(k, 'nexus-salt', 32); }
export function encrypt(p: string): string { const iv = crypto.randomBytes(IV_LEN); const c = crypto.createCipheriv(ALGO, getKey(), iv); const enc = Buffer.concat([c.update(p, 'utf8'), c.final()]); const tag = c.getAuthTag(); return Buffer.concat([iv, tag, enc]).toString('base64'); }
export function decrypt(ct: string): string { const b = Buffer.from(ct, 'base64'); const iv = b.subarray(0, IV_LEN), tag = b.subarray(IV_LEN, IV_LEN + TAG_LEN), enc = b.subarray(IV_LEN + TAG_LEN); const d = crypto.createDecipheriv(ALGO, getKey(), iv); d.setAuthTag(tag); return Buffer.concat([d.update(enc), d.final()]).toString('utf8'); }
export function safeDecrypt(v?: string | null): string | null { if (!v) return null; try { return decrypt(v); } catch { return null; } }

// ─── RECURRENCE ───────────────────────────────────────────────────────────────
export function nextRecurrence(d: string, rule: string): string | null {
  const n = new Date(d); if (isNaN(n.getTime())) throw new Error(`Invalid date: ${d}`);
  switch (rule) { case 'daily': n.setDate(n.getDate()+1); break; case 'weekly': n.setDate(n.getDate()+7); break; case 'biweekly': n.setDate(n.getDate()+14); break; case 'monthly': n.setMonth(n.getMonth()+1); break; default: return null; }
  return n.toISOString();
}
export function nextReportSchedule(from: Date, freq: string): string | null {
  const n = new Date(from);
  switch (freq) { case 'weekly': n.setDate(n.getDate()+7); break; case 'monthly': n.setMonth(n.getMonth()+1); break; case 'quarterly': n.setMonth(n.getMonth()+3); break; default: return null; }
  return n.toISOString();
}
export const isDue = (d: string | Date) => new Date(d) <= new Date();

// ─── RESPONSE HELPERS ─────────────────────────────────────────────────────────
export const ok       = <T>(res: Response, data: T, status = 200) => res.status(status).json({ success: true, data });
export const created  = <T>(res: Response, data: T) => ok(res, data, 201);
export const fail     = (res: Response, error: string, status = 400) => res.status(status).json({ success: false, error });
export const notFound = (res: Response, e = 'Record') => fail(res, `${e} not found`, 404);
export const unauthorized = (res: Response) => fail(res, 'Unauthorized', 401);
export const forbidden    = (res: Response) => fail(res, 'Forbidden', 403);
export const paginated = <T>(res: Response, data: T[], total: number, page: number, limit: number) =>
  res.json({ success: true, data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });

// ─── PAGINATION ───────────────────────────────────────────────────────────────
export function parsePage(q: any) {
  const page = Math.max(1, parseInt(String(q.page ?? 1)));
  const limit = Math.min(100, Math.max(1, parseInt(String(q.limit ?? 20))));
  return { page, limit, skip: (page - 1) * limit };
}

// ─── MISC ─────────────────────────────────────────────────────────────────────
export const rand = (min: number, max: number, float = false) => { const v = Math.random() * (max - min) + min; return float ? v : Math.floor(v); };
