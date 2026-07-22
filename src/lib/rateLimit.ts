const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  ip: string,
  limit: number = 10,
  windowMs: number = 60_000
): { ok: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { ok: true, remaining: limit - entry.count, resetIn: entry.resetAt - now };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
