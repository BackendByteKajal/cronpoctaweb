import { Context } from "koa";
import { AuthServices } from "../Services/auth-services";

const NodeCache = require("node-cache");
const myCache = new NodeCache();

export class Cache {
  public static async caching(ctx: Context,next:any,ttl:number) {
    const data = ctx.request.body;
    const key = ctx.request.headers["token"];
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

      myCache.set(key, data, ttl);

      //   res.originalSend = res.send;
      //   res.send = (body: any) => {
      //     cache.set(key, body);
      //   };
       next();
    }
  }
}
