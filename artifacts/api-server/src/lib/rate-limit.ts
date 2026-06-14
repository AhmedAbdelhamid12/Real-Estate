import type { Request, Response, NextFunction } from "express";

const windowMs = 60_000;
const maxRequests = 200;

const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const key =
    req.currentUser?.id ??
    (req.headers["x-forwarded-for"]?.toString().split(",")[0] ?? req.socket.remoteAddress ?? "unknown");

  const now = Date.now();
  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count++;

  if (entry.count > maxRequests) {
    res.status(429).json({ error: "Too many requests, slow down" });
    return;
  }

  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - entry.count));
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60_000);
