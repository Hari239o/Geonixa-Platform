type Bucket = { tokens: number; last: number };

const RATE_LIMIT_TOKENS = parseInt(process.env.RATE_LIMIT_TOKENS || '10', 10); // default 10 requests
const RATE_LIMIT_INTERVAL = parseInt(process.env.RATE_LIMIT_INTERVAL_MS || '60000', 10); // per 60s

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key) || { tokens: RATE_LIMIT_TOKENS, last: now };
  const elapsed = now - bucket.last;
  // Replenish tokens
  const refill = Math.floor(elapsed / RATE_LIMIT_INTERVAL) * RATE_LIMIT_TOKENS;
  if (refill > 0) {
    bucket.tokens = Math.min(RATE_LIMIT_TOKENS, bucket.tokens + refill);
    bucket.last = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return { ok: true, remaining: bucket.tokens };
  }

  buckets.set(key, bucket);
  return { ok: false, retryAfterMs: RATE_LIMIT_INTERVAL };
}
