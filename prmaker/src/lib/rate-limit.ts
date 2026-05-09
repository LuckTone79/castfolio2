/**
 * Simple in-memory rate limiter (IP-based sliding window).
 *
 * Limitation: Vercel serverless has multiple instances, so this only limits
 * within a single cold-start lifetime. For stricter enforcement, use Upstash
 * Redis or Vercel's WAF rate limiting feature.
 *
 * Suitable for protecting low-traffic public endpoints (intake, review, quote)
 * against accidental double-submissions or light abuse.
 */

interface WindowEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  const staleKeys: string[] = [];
  store.forEach((entry, key) => {
    if (now - entry.windowStart > 60_000 * 10) {
      staleKeys.push(key);
    }
  });
  staleKeys.forEach(key => store.delete(key));
}, 300_000);

/**
 * Check if the given key (usually IP + endpoint) has exceeded the rate limit.
 * @param key      Unique identifier (e.g. `ip:POST:/api/public/review/xxx`)
 * @param limit    Max requests allowed within the window
 * @param windowMs Sliding window size in milliseconds (default: 60s)
 * @returns { allowed: boolean; remaining: number; resetIn: number }
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  entry.count += 1;
  const resetIn = windowMs - (now - entry.windowStart);

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetIn };
  }

  return { allowed: true, remaining: limit - entry.count, resetIn };
}

/**
 * Extract the client IP from a Next.js request.
 * Respects x-forwarded-for (set by Vercel/CDN).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
