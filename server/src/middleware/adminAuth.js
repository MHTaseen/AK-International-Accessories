import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a), 'utf8');
  const bufB = Buffer.from(String(b), 'utf8');
  if (bufA.length !== bufB.length) {
    // Still run timingSafeEqual on equal-length dummy buffers to avoid length leak
    crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Temporary admin privilege gate until full JWT/HTTP-only cookie RBAC is added.
 * Requires `X-Admin-Key` header matching `process.env.ADMIN_API_KEY`.
 */
export function requireAdmin(req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    if (isProd) {
      return res.status(503).json({ error: 'Admin authentication is not configured.' });
    }
    // Development-only fallback key (never allowed in production)
    const devKey = 'ak-dev-admin';
    const provided = req.get('X-Admin-Key') || '';
    if (!provided || !safeEqual(provided, devKey)) {
      return res.status(403).json({ error: 'Admin privilege required.' });
    }
    return next();
  }

  const provided = req.get('X-Admin-Key') || '';
  if (!provided || !safeEqual(provided, configuredKey)) {
    return res.status(403).json({ error: 'Admin privilege required.' });
  }

  return next();
}

/**
 * Stricter rate limiter for admin write & auth-verification endpoints.
 */
export const adminWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many admin requests. Please try again later.' },
});
