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
      const accessToken = ctx.headers.authorization ;
      console.log("user authenticate")
      if (!accessToken) {
        throw new Error("You are not Authenticated.")
      }
      if (ctx.headers.authorization) {
        const accessToken = ctx.headers.authorization;
        console.log(accessToken,"accesstoken")
        if (!accessToken) {
          throw new Error("You are not Authenticated.")
        }
        const [bearer, token] = accessToken.split(" ");
  
        if (bearer !== "Bearer") {
        
          throw new Error("You are not Authenticated.")
        }
          
        const cachedData = await AuthenticateMiddleware.getredisData(token);
        if (!cachedData) {
          
          throw new Error("You are not Authenticated.")
        }
          console.log(cachedData,"cachedata")
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



 /* public static async authenticateUser(ctx: Context, next: any ){
    try{

      console.log("uthenticateuser")
      const accessToken = ctx.header.authorization;
      console.log("uthenticateuser2",accessToken)
      if (!accessToken) {
        throw new Error("You are not Authenticated.");
      }
      let [bearer, tokens] = accessToken.split(" ");
      if (bearer !== "Bearer") {
        throw new Error("You are not Authenticated.");
      }
      let firstindex = tokens.indexOf('_');
      let type = tokens.substring(0,firstindex);
      let token = tokens.substring(firstindex+1);
      if(type!=="User"){
        throw new Error("Token Not Valid");
      }
      const cachedData = await this.getredisData(tokens);
      console.log(cachedData,"catch")
      if (!cachedData) {
        throw new Error("You are not Authenticated.");
      }
      jwt.verify(token, String(process.env.PRIVATE_KEY))
      ctx.state.user = cachedData;
      return next();
    }catch(err:any){
      ctx.response.status= 404;
      ctx.body = Utils.errorResponse(404,err.message)
    }
  
  }*/

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
