import { Context, Next } from "koa";
import { AuthServices } from "../Services/auth-services";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";

const NodeCache = require("node-cache");
const myCache = new NodeCache();

export class Cache {
  public static async caching(ctx: Context,next:any) {
    const data = ctx.request.body;
    let key:string|undefined = ctx.request.headers["authorization"];
    key = key?.split(" ").pop();
    // const token = ctx.headers.authorization.split(" ").pop()
    // const Authorization_key:any = ctx.request.headers["token"];
    // console.log(Authorization_key);
    console.log(key);

    // if(!key){
    //   const details = await AuthServices.LoginUser(data);
    //   const {token} = details;
    //   myCache.set(token,data, ttl);
    // }

    const cacheResponse = myCache.get(key);

    // if key exists
    console.log("cahceResponse:", cacheResponse);

    if (cacheResponse) {
      console.log(`Cache hit for ${key}`);
      ctx.body = cacheResponse;
    } else {
      //if key not exists
    //   const body = ctx.request.body;
      console.log("Key not present");

      // myCache.set(key, data, ttl);
      myCache.set(key, data);
      //   res.originalSend = res.send;
      //   res.send = (body: any) => {
      //     cache.set(key, body);
      //   };
       next();
    }

    
  }

  public static async caching2(ctx: Context, next: any) {
    const data = ctx.request.body;
    if (ctx.headers.authorization) {
      const token = ctx.headers.authorization.split(" ").pop();

      const cachingResponse = myCache.get(token);
      if(cachingResponse){
        console.log(`Cache hit for ${token}`);
        ctx.body = cachingResponse;
      }
      else{
        console.log("Key not present");

     
      myCache.set(token, data);
      await next();
      }
      // const decode = jwt.verify(token, configData.jwt.key);

     
    } else {
      ctx.status = 401;
      ctx.body = Utils.errorResponse(401,Message.AuthenticationFailed);
    }
  }
}
