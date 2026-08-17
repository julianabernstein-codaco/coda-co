// Rate limiter with two backends behind one API:
//
//   - Upstash Redis (sliding window) when UPSTASH_REDIS_REST_URL and
//     UPSTASH_REDIS_REST_TOKEN are set. Counters are shared across every
//     serverless instance and survive cold starts — the real defense.
//   - An in-memory Map otherwise. Per-process, so it doesn't share across
//     Vercel instances; good enough for local dev, CI, and any environment
//     where Redis isn't provisioned. It's also the *degraded* fallback if a
//     Redis call throws at runtime, so a Redis blip weakens protection to
//     per-instance rather than dropping it entirely (never fully fail-open).
//
// Callers don't pick a backend — they call `rateLimit` / `isRateLimited` and
// get whichever is configured. Both are async because the Redis path is.
//
// Still not a defense against a truly distributed attacker spread across many
// IPs — that's what a WAF / Turnstile is for (see TASKS.md).

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { log } from "@/lib/log";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
}

interface LimitOpts {
  limit: number;
  windowMs: number;
}

// ---------------------------------------------------------------------------
// In-memory backend (fallback)
// ---------------------------------------------------------------------------

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function memRateLimit(key: string, opts: LimitOpts): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1 };
  }

  if (bucket.count >= opts.limit) {
    return { ok: false, remaining: 0 };
  }

  bucket.count += 1;
  return { ok: true, remaining: opts.limit - bucket.count };
}

function memIsRateLimited(key: string, opts: LimitOpts): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= Date.now()) return false;
  return bucket.count >= opts.limit;
}

// ---------------------------------------------------------------------------
// Upstash Redis backend
// ---------------------------------------------------------------------------

// Built once, lazily, on first use — reading env at module load would break
// `next build`'s page-data collection the same way an eager Prisma client
// does. `null` means "not configured, use in-memory".
let redis: Redis | null | undefined;

// Hard ceiling on any single Redis round-trip. Upstash REST normally answers
// in tens of ms from Vercel; if a call hasn't returned by this deadline the
// endpoint is misconfigured or unreachable, and we must not make the auth path
// wait on it. On timeout we throw, which the callers below turn into the
// in-memory fallback — never an indefinite stall.
const REDIS_TIMEOUT_MS = 1000;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  // `retry: false` fails fast — on the auth path we'd rather fall back to the
  // in-memory limiter than spend seconds on @upstash/redis's default 5-retry
  // backoff. The withTimeout wrapper is the real backstop; this just avoids
  // burning the whole budget on retries first.
  redis = url && token ? new Redis({ url, token, retry: false }) : null;
  return redis;
}

// Race a Redis call against REDIS_TIMEOUT_MS. Rejecting on timeout means a
// hung endpoint is treated exactly like any other Redis error by the callers
// (log once, fall back to in-memory) instead of blocking the request forever.
// Needed because @upstash/redis has no per-request fetch timeout and
// @upstash/ratelimit only guards limit(), not getRemaining().
function withTimeout<T>(p: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("ratelimit_redis_timeout")), REDIS_TIMEOUT_MS);
    p.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

// One Ratelimit instance per distinct (limit, window) config — the limiter
// algorithm is fixed at construction, and call sites use a handful of
// configs, so memoize instead of rebuilding per request.
const limiters = new Map<string, Ratelimit>();

function getLimiter(client: Redis, opts: LimitOpts): Ratelimit {
  const cacheKey = `${opts.limit}:${opts.windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: client,
      // Sliding window avoids the burst-at-boundary hole a fixed window has.
      limiter: Ratelimit.slidingWindow(opts.limit, `${opts.windowMs} ms`),
      prefix: "rl",
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

// Log a Redis outage once (not per request) and once on recovery, so a blip
// is visible without flooding logs during a sustained outage.
let redisHealthy = true;

function noteRedisDown(err: unknown) {
  if (redisHealthy) {
    redisHealthy = false;
    log.warn("ratelimit.redis_unavailable", { err });
  }
}

function noteRedisUp() {
  if (!redisHealthy) {
    redisHealthy = true;
    log.info("ratelimit.redis_recovered");
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Count one attempt against `key` and report whether it's allowed. Uses
// Redis when configured, in-memory otherwise (or if Redis errors).
export async function rateLimit(key: string, opts: LimitOpts): Promise<RateLimitResult> {
  const client = getRedis();
  if (!client) return memRateLimit(key, opts);
  try {
    const { success, remaining } = await withTimeout(getLimiter(client, opts).limit(key));
    noteRedisUp();
    return { ok: success, remaining };
  } catch (err) {
    noteRedisDown(err);
    return memRateLimit(key, opts);
  }
}

// Read-only check: is `key` already at/over its limit right now? Does NOT
// count as an attempt, so a caller can peek to pick a user-facing message
// while the authoritative `rateLimit()` call elsewhere does the counting.
// Returns false for an unseen / expired key.
export async function isRateLimited(key: string, opts: LimitOpts): Promise<boolean> {
  const client = getRedis();
  if (!client) return memIsRateLimited(key, opts);
  try {
    const { remaining } = await withTimeout(getLimiter(client, opts).getRemaining(key));
    noteRedisUp();
    return remaining <= 0;
  } catch (err) {
    noteRedisDown(err);
    return memIsRateLimited(key, opts);
  }
}

// Best-effort client IP. On Vercel `x-forwarded-for` is the trusted
// chain; we take the leftmost entry, which is the original client.
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
