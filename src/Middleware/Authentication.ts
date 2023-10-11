import { Context } from "koa";
import { configData } from "../config/config";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import { RedisCache } from "../connection/redis-connection";
import { RedisSessionExpires } from "../enum/redis-expire-session";
import { AuthServices } from "../Services/auth-services";

const jwt = require("jsonwebtoken");

export class AuthenticateMiddleware {
  public static async AuthenticateUser(ctx: Context, next: any) {
    try {
      const accessToken = ctx.headers.authorization;

      if (!accessToken) {
        throw new Error("Authentication failed: Missing access token.");
      }
      if (ctx.headers.authorization) {
        const accessToken = ctx.headers.authorization;

        if (!accessToken) {
          throw new Error("Authentication failed: Missing access token......");
        }
        const [bearer, token] = accessToken.split(" ");

        if (bearer !== "Bearer") {
          throw new Error("Authentication failed:Invalid token format.");
        }

        const cachedData = await AuthServices.getredisData(token);
        if (!cachedData) {
          throw new Error("You are not Authenticated.");
        }

        const decode = jwt.verify(token, configData.jwt.key);

        ctx.state.me = JSON.parse(cachedData);
      }

      await next();
    } catch (err: any) {
      ctx.status = 401;
      ctx.body = Utils.errorResponse(
        401,
        `${err.message}, Check Authentication`
      );
    }
  }

  ///

  // public static async getredisData(token: any) {
  //   const redisObj = RedisCache.connect();
  //   const data = await redisObj.get(token);
  //   return data;
  // }
  // public static async getrediseventid(eventid: number) {
  //   const redisObj = RedisCache.connect();
  //   const data = await redisObj.get(eventid.toString());
  //   return data;
  // }

  // public static async slideExpiration(token: string) {
  //   const redisObj = RedisCache.connect();
  //   redisObj.expire(token, RedisSessionExpires.UserLogin);
  // }
}
