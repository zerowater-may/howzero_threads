import crypto from "node:crypto";
import { redis } from "./redis";

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

async function slidingWindowRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const member = `${now}:${crypto.randomBytes(4).toString("hex")}`;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, now, member);
  pipeline.zcard(key);
  pipeline.pexpire(key, windowMs);

  const results = await pipeline.exec();
  const count = results![2][1] as number;

  if (count > maxRequests) {
    await redis.zrem(key, member);
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: maxRequests - count };
}

export const rateLimit = {
  register: {
    limit: (ip: string) =>
      slidingWindowRateLimit(`rl:register:${ip}`, 5, 15 * 60 * 1000),
  },
  api: {
    limit: (userId: string) =>
      slidingWindowRateLimit(`rl:api:${userId}`, 100, 60 * 1000),
  },
  login: {
    limit: (ip: string) =>
      slidingWindowRateLimit(`rl:login:${ip}`, 5, 15 * 60 * 1000),
  },
};
