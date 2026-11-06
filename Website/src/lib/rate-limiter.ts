/**
 * In-Memory Sliding-Window Rate Limiter
 * 
 * Protects critical auth API endpoints (registration, password attempts, resend verification)
 * against automated brute-force attacks and high-frequency bot requests.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const staleThreshold = 1000 * 60 * 30; // 30 minutes
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < staleThreshold);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 1000 * 60 * 10);
}

export interface RateLimitOptions {
  intervalMs: number; // e.g. 60_000 for 1 minute
  maxRequests: number; // e.g. 5 requests
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { intervalMs: 60_000, maxRequests: 5 }
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - options.intervalMs;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + options.intervalMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  record.timestamps.push(now);

  return {
    allowed: true,
    remaining: options.maxRequests - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}

