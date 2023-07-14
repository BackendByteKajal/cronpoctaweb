import { Context } from "koa";
import { configData } from "../config/config";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import { RedisCache } from "../connection/redis-connection";
import { RedisSessionExpires } from "../enum/redis-expire-session";

const jwt = require("jsonwebtoken");

export class AuthenticateMiddleware {
  public static async AuthenticateUser(ctx: Context, next: any) {
    try{
      console.log("user authenticate")
      if (ctx.headers.authorization) {
        const accessToken = ctx.headers.authorization;
        if (!accessToken) {
          throw "You are not Authenticated.";
        }
        const [bearer, token] = accessToken.split(" ");
  
        if (bearer !== "Bearer") {
          throw "You are not Authenticated.";
        }
          
        const cachedData = await AuthenticateMiddleware.getredisData(token);
        if (!cachedData) {
          throw "You are not Authenticated.";
        }
          
        const decode = jwt.verify(token, configData.jwt.key);
  
        ctx.state.me = JSON.parse(cachedData);
        console.log("ctx.state.me",ctx.state.me);
    }

      await next();
    } catch(err:any) {
      ctx.status = 401;
      ctx.body = Utils.errorResponse(401,`${err.message}, Check Authentication`);
    }
  }

  public static async getredisData(token: string) {
    const redisObj = RedisCache.connect();
    const data = await redisObj.get(token);
    return data;
  }

  public static async slideExpiration(token: string) {
    const redisObj = RedisCache.connect();
    redisObj.expire(token, RedisSessionExpires.UserLogin);
  }
}
