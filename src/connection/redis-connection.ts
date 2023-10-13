import { createClient } from "redis";
import { configData } from "../config/config";

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
}
