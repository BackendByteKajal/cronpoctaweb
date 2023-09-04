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
      console.log("user authenticate");
      if (!accessToken) {
        throw new Error("You are not Authenticated.");
      }
      if (ctx.headers.authorization) {
        const accessToken = ctx.headers.authorization;
        console.log(accessToken, "accesstoken");
        if (!accessToken) {
          throw new Error("You are not Authenticated.");
        }
        const [bearer, token] = accessToken.split(" ");

        if (bearer !== "Bearer") {
          throw new Error("You are not Authenticated.");
        }

        const cachedData = await AuthenticateMiddleware.getredisData(token);
        if (!cachedData) {
          throw new Error("You are not Authenticated......");
        }
        console.log(cachedData, "cachedata");
        const decode = jwt.verify(token, configData.jwt.key);

        ctx.state.me = JSON.parse(cachedData);
        console.log("ctx.state.me", ctx.state.me);
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

  
public static async loginUserSuccesspass(ctx: Context,next: any) {
    console.log("pass...");
    // Access the user object and token from the Passport strategy
    const user = ctx.state.user;
    const token = ctx.state.authInfo;
    const userid = user._id;
    console.log(ctx.state.me);
    // Set cookies
    await AuthServices.setCookieAndReturnToken(ctx, "beareltoken", token);
    await AuthServices.setCookieAndReturnToken(ctx, "userdata", userid);
     await next();
  }

     
  

  ///

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
