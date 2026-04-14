import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';  // Catches async errors in Express 4 handlers
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { logger } from './config/logger';
import router from './router';

const app = express();

// ─── SECURITY ─────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.ALLOWED_ORIGINS.split(',').map(o => o.trim()), credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));

// ─── STRIPE RAW BODY ─────────────────────────────────────────────────────────
app.use(`/${env.API_VERSION}/stripe/webhook`, express.raw({ type: 'application/json' }));

// ─── BODY + COMPRESSION ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15*60_000, max: 500, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'Too many requests' } }));
app.use(`/${env.API_VERSION}/auth`, rateLimit({ windowMs: 15*60_000, max: 20, message: { success: false, error: 'Too many auth attempts' } }));
app.use(`/${env.API_VERSION}/ai`, rateLimit({ windowMs: 60_000, max: 10, message: { success: false, error: 'AI rate limit exceeded' } }));

// ─── LOGGING ──────────────────────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: { write: m => logger.http(m.trim()) }, skip: req => req.url === '/health' }));

// ─── STATIC ───────────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── HEALTH (top-level) ───────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok', version: '2.0.0', env: env.NODE_ENV, ts: new Date().toISOString() }));

// ─── API ─────────────────────────────────────────────────────────────────────
app.use(`/${env.API_VERSION}`, router);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => res.status(404).json({ success: false, error: 'Route not found' }));

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { path: req.path, method: req.method, message: err.message });
  if (err.code === 'P2002') { res.status(409).json({ success: false, error: 'A record with that value already exists' }); return; }
  if (err.code === 'P2025') { res.status(404).json({ success: false, error: 'Record not found' }); return; }
  res.status(err.status ?? 500).json({ success: false, error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

export default app;
