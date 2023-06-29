import { createClient } from "redis";
import { configData } from "../config/config";
/**
 * The command returns -2 if the key does not exist.
 * The command returns -1 if the key exists but has no associated expire
 */
export class RedisCache {
  static connect(): any {
    const redisCache = createClient({
      url: `redis://${configData.redis.host}:${configData.redis.port}`,
    });
    redisCache.connect();

    redisCache.on("connect", () => {
      console.log("Connected to Redis");
    });

    redisCache.on("error", () => {
      console.error("Error in Redis Connection");
    });
    return redisCache;
  }
  //   async get(key: string): Promise<any | null> {
  //     this.connect();
  //     const ttl = await RedisCache.cacheInstance.ttl(key);
  //     if (ttl === -2) {
  //       return null;
  //     }
  //     const data = await RedisCache.cacheInstance.get(key);
  //     if (!data) {
  //       return null;
  //     }
  //     return JSON.parse(data);
  //   }
  //   async set(
  //     key: string,
  //     value: any,
  //     ttl: number | null = null
  //   ): Promise<boolean> {
  //     this.connect();
  //     return RedisCache.cacheInstance.set(key, JSON.stringify(value)).then(() => {
  //       if (ttl) {
  //         RedisCache.cacheInstance.expire(key, ttl);
  //       }
  //       return Promise.resolve(true);
  //     });
  //   }

  //   async delete(key: string) {
  //     this.connect();
  //     return RedisCache.cacheInstance.del(key);
  //   }

  //   async slideUserSession(
  //     value: string,
  //     sessionType: RedisSessionType
  //   ): Promise<UserProfile | null> {
  //     this.connect();
  //     const redisKey = RedisUtility.generateRedisSessionKey(value, sessionType);
  //     const ttl = await RedisCache.cacheInstance.ttl(redisKey);
  //     if (ttl === -2) {
  //       return null;
  //     }
  //     const user = await RedisCache.cacheInstance.get(redisKey);
  //     if (!user) {
  //       return null;
  //     }
  //     await RedisCache.cacheInstance.expire(
  //       redisKey,
  //       RedisSessionExpires.UserLogin
  //     );
  //     return JSON.parse(user);
  //   }
}
