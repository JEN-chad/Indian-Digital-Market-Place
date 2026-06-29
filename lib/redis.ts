import { Redis } from "@upstash/redis";

// A robust local in-memory fallback cache supporting sets and sorted sets
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

  async sadd(key: string, ...members: any[]): Promise<number> {
    let item = this.store.get(key);
    let set = item?.value;
    if (!set || !(set instanceof Set)) {
      set = new Set();
      this.store.set(key, { value: set, expiresAt: null });
    }
    let added = 0;
    for (const m of members) {
      if (!set.has(m)) {
        set.add(m);
        added++;
      }
    }
    return added;
  }

  async srem(key: string, ...members: any[]): Promise<number> {
    const item = this.store.get(key);
    const set = item?.value;
    if (!set || !(set instanceof Set)) return 0;
    let removed = 0;
    for (const m of members) {
      if (set.has(m)) {
        set.delete(m);
        removed++;
      }
    }
    return removed;
  }

  async smembers(key: string): Promise<any[]> {
    const item = this.store.get(key);
    const set = item?.value;
    if (!set || !(set instanceof Set)) return [];
    return Array.from(set);
  }

  async zadd(key: string, ...args: any[]): Promise<number> {
    let item = this.store.get(key);
    let zset = item?.value;
    if (!zset || !(zset instanceof Map)) {
      zset = new Map<any, number>(); // member -> score
      this.store.set(key, { value: zset, expiresAt: null });
    }
    let added = 0;

    if (args.length === 1 && typeof args[0] === "object") {
      const entry = args[0];
      // handle format: { score: number, member: any }
      if (entry && "score" in entry && "member" in entry) {
        if (!zset.has(entry.member)) added++;
        zset.set(entry.member, entry.score);
      }
    } else if (args.length >= 2) {
      if (typeof args[0] === "number") {
        const score = args[0];
        const member = args[1];
        if (!zset.has(member)) added++;
        zset.set(member, score);
      } else if (typeof args[0] === "object") {
        // array of { score, member }
        for (const entry of args) {
          if (entry && typeof entry === "object" && "score" in entry && "member" in entry) {
            if (!zset.has(entry.member)) added++;
            zset.set(entry.member, entry.score);
          }
        }
      }
    }
    return added;
  }

  async zrange(key: string, start: number, stop: number, options?: { rev?: boolean }): Promise<any[]> {
    const item = this.store.get(key);
    const zset = item?.value;
    if (!zset || !(zset instanceof Map)) return [];

    const entries = Array.from(zset.entries()); // [member, score][]
    entries.sort((a, b) => a[1] - b[1]);
    if (options?.rev) {
      entries.reverse();
    }

    const members = entries.map(e => e[0]);
    const normalizedStart = start < 0 ? members.length + start : start;
    const normalizedStop = stop < 0 ? members.length + stop : stop;
    return members.slice(normalizedStart, normalizedStop + 1);
  }

  async zremrangebyrank(key: string, start: number, stop: number): Promise<number> {
    const item = this.store.get(key);
    const zset = item?.value;
    if (!zset || !(zset instanceof Map)) return 0;

    const entries = Array.from(zset.entries());
    entries.sort((a, b) => a[1] - b[1]);

    const normalizedStart = start < 0 ? entries.length + start : start;
    const normalizedStop = stop < 0 ? entries.length + stop : stop;
    const toRemove = entries.slice(normalizedStart, normalizedStop + 1);

    let removed = 0;
    for (const [member] of toRemove) {
      zset.delete(member);
      removed++;
    }
    return removed;
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

  async sadd(key: string, ...members: any[]): Promise<number> {
    if (members.length === 0) return 0;
    if (useInMemoryFallback) {
      return localCache.sadd(key, ...members);
    }
    try {
      return await this.redis.sadd(key, members[0], ...members.slice(1));
    } catch (err: any) {
      console.warn(`Redis 'sadd' failed. Using in-memory fallback.`);
      useInMemoryFallback = true;
      return localCache.sadd(key, ...members);
    }
  }

  async srem(key: string, ...members: any[]): Promise<number> {
    if (members.length === 0) return 0;
    if (useInMemoryFallback) {
      return localCache.srem(key, ...members);
    }
    try {
      return await this.redis.srem(key, members[0], ...members.slice(1));
    } catch (err: any) {
      console.warn(`Redis 'srem' failed. Using in-memory fallback.`);
      useInMemoryFallback = true;
      return localCache.srem(key, ...members);
    }
  }

  async smembers(key: string): Promise<any[]> {
    if (useInMemoryFallback) {
      return localCache.smembers(key);
    }
    try {
      return await this.redis.smembers(key);
    } catch (err: any) {
      console.warn(`Redis 'smembers' failed. Using in-memory fallback.`);
      useInMemoryFallback = true;
      return localCache.smembers(key);
    }
  }

  async zadd(key: string, ...args: any[]): Promise<number> {
    if (useInMemoryFallback) {
      return localCache.zadd(key, ...args);
    }
    try {
      if (args.length === 1) {
        return await this.redis.zadd(key, args[0]);
      } else if (args.length === 2) {
        return await this.redis.zadd(key, args[0], args[1]);
      } else {
        return await this.redis.zadd(key, args[0], args[1], ...args.slice(2));
      }
    } catch (err: any) {
      console.warn(`Redis 'zadd' failed. Using in-memory fallback.`);
      useInMemoryFallback = true;
      return localCache.zadd(key, ...args);
    }
  }

  async zrange(key: string, start: number, stop: number, options?: { rev?: boolean }): Promise<any[]> {
    if (useInMemoryFallback) {
      return localCache.zrange(key, start, stop, options);
    }
    try {
      return await this.redis.zrange(key, start, stop, options);
    } catch (err: any) {
      console.warn(`Redis 'zrange' failed. Using in-memory fallback.`);
      useInMemoryFallback = true;
      return localCache.zrange(key, start, stop, options);
    }
  }

  async zremrangebyrank(key: string, start: number, stop: number): Promise<number> {
    if (useInMemoryFallback) {
      return localCache.zremrangebyrank(key, start, stop);
    }
    try {
      return await this.redis.zremrangebyrank(key, start, stop);
    } catch (err: any) {
      console.warn(`Redis 'zremrangebyrank' failed. Using in-memory fallback.`);
      useInMemoryFallback = true;
      return localCache.zremrangebyrank(key, start, stop);
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

