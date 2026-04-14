import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthRequest, JwtPayload } from '../types';

// ─── BASE44-COMPATIBLE ERROR HELPERS ─────────────────────────────────────────
// AuthContext.jsx checks: appError.status === 403 && appError.data?.extra_data?.reason
// So 403 errors must include { extra_data: { reason: string } } in the body.

function authRequired(res: Response): void {
  res.status(403).json({
    success: false,
    error: 'Authentication required',
    extra_data: { reason: 'auth_required' },
  });
}

function notRegistered(res: Response): void {
  res.status(403).json({
    success: false,
    error: 'User not registered',
    extra_data: { reason: 'user_not_registered' },
  });
}

function forbidden(res: Response): void {
  res.status(403).json({
    success: false,
    error: 'Forbidden',
    extra_data: { reason: 'forbidden' },
  });
}

// ─── JWT AUTHENTICATION ───────────────────────────────────────────────────────

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    authRequired(res);
    return;
  }

  const token = header.split(' ')[1];

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
        extra_data: { reason: 'token_expired' },
      });
      return;
    }
    authRequired(res);
  }
}

// ─── ADMIN GUARD ──────────────────────────────────────────────────────────────

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) { authRequired(res); return; }
  if (req.user.role !== 'admin') { forbidden(res); return; }
  next();
}

// Export error helpers for use in route handlers
export { authRequired, notRegistered, forbidden };

/**
 * verifyToken — decode + validate a JWT token string.
 * Used by GET /app/public-settings to validate optional token.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
