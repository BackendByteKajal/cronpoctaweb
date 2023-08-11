import { Context, Next } from "koa";
import koaBody from "koa-body";
import app from "../app";



export class customerror {
  public static async fileSizeErrorHandler(ctx: Context, next: Next) {
    try {
    
        console.log("FileSystemHand");
        await next();
    } catch (err: any) {
      console.log("FileSystemHandlecatch");
      throw err;
      
    }
  }
}
export default customerror;