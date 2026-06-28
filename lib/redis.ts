import { Redis } from "@upstash/redis";

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn("Upstash Redis credentials are missing. Rate limiting and caching will be mock-based.");
      // Create a mock client-like interface or default instance
      redisInstance = new Redis({
        url: "https://mock-redis.upstash.io",
        token: "mock-token",
      });
    } else {
      redisInstance = new Redis({
        url,
        token,
      });
    }
  }
  return redisInstance;
}
export { Redis };
