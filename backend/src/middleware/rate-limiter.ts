import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests. Please try again later.',
    keyGenerator = (req: Request) => req.ip || req.socket.remoteAddress || 'unknown'
  } = options;

  const hits = new Map<string, RateLimitRecord>();

  // Periodic cleanup every 5 minutes to prevent memory leaks
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Unref timer so it does not block graceful process exit
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetTime) {
      hits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds
      });
    }

    record.count += 1;
    next();
  };
}

// Admin login rate limiter: 10 attempts per minute per IP + username
export const adminLoginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many organizer login attempts. Please wait 60 seconds before trying again.',
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const username = (req.body?.username || '').trim().toLowerCase();
    return `admin_login:${ip}:${username}`;
  }
});

// Team login rate limiter: 15 attempts per minute per IP + teamId
// Specifically designed for SRKR event: allows ~40 teams sharing the same lab network / NAT gateway
// without falsely locking out other teams when one team mistypes credentials
export const teamLoginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many team login attempts. Please wait 60 seconds before trying again.',
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const teamId = (req.body?.teamId || '').trim().toUpperCase();
    return `team_login:${ip}:${teamId}`;
  }
});
