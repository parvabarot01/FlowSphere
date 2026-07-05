import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

const limiters = new Map<string, Ratelimit>();

function getLimiter(key: string, requests: number, window: `${number} ${"s" | "m" | "h"}`) {
  if (!redis) return null;

  const cacheKey = `${key}:${requests}:${window}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `flowsphere:${key}`,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * Fails open (allows the request) when Upstash isn't configured yet, so
 * local development and builds aren't blocked before real credentials exist.
 */
export async function rateLimit(
  key: string,
  identifier: string,
  requests = 10,
  window: `${number} ${"s" | "m" | "h"}` = "60 s"
): Promise<{ success: boolean }> {
  const limiter = getLimiter(key, requests, window);
  if (!limiter) {
    return { success: true };
  }
  return limiter.limit(identifier);
}
