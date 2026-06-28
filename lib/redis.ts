import { Redis } from "@upstash/redis";

// A robust local in-memory fallback cache
class InMemoryCache {
  private store = new Map<string, { value: any; expiresAt: number | null }>();

  async set(key: string, value: any, options?: any) {
    const ttl = options?.ex; // TTL in seconds
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
    this.store.set(key, { value, expiresAt });
    return "OK";
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  async del(...keys: string[]): Promise<number> {
    let deletedCount = 0;
    for (const key of keys) {
      if (this.store.has(key)) {
        this.store.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }
}

const localCache = new InMemoryCache();
let useInMemoryFallback = false;

class SafeRedis {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async set(key: string, value: any, options?: any) {
    if (useInMemoryFallback) {
      return localCache.set(key, value, options);
    }
    try {
      return await this.redis.set(key, value, options as any);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn(`Redis 'set' failed. Switching to secure in-memory cache. Error: ${errMsg}`);
      useInMemoryFallback = true;
      return localCache.set(key, value, options);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (useInMemoryFallback) {
      return localCache.get<T>(key);
    }
    try {
      return await this.redis.get<T>(key);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn(`Redis 'get' failed. Switching to secure in-memory cache. Error: ${errMsg}`);
      useInMemoryFallback = true;
      return localCache.get<T>(key);
    }
  }

  async del(...keys: string[]): Promise<number> {
    if (useInMemoryFallback) {
      return localCache.del(...keys);
    }
    try {
      return await this.redis.del(...keys);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn(`Redis 'del' failed. Switching to secure in-memory cache. Error: ${errMsg}`);
      useInMemoryFallback = true;
      return localCache.del(...keys);
    }
  }
}

let redisInstance: Redis | null = null;
let safeRedisInstance: SafeRedis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn("Upstash Redis credentials are missing. Rate limiting and caching will be mock-based.");
      redisInstance = new Redis({
        url: "https://mock-redis.upstash.io",
        token: "mock-token",
      });
      useInMemoryFallback = true;
    } else {
      // Check if it's explicitly a read-only token starting with 'gg'
      const trimmedToken = token.trim().replace(/['"]/g, "");
      if (trimmedToken.startsWith("gg")) {
        console.warn("Read-only Upstash Redis token detected. Enabling secure in-memory fallback for writes.");
        useInMemoryFallback = true;
      }
      redisInstance = new Redis({
        url: url.trim().replace(/['"]/g, ""),
        token: trimmedToken,
      });
    }
    safeRedisInstance = new SafeRedis(redisInstance);
  }

  return safeRedisInstance as unknown as Redis;
}

export { Redis };
