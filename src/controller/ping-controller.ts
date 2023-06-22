import { Context } from "koa";

export class PingController{
    public static pingService(ctx:Context){
        ctx.body = {
            statusCode:200,
            message:"Route is Working..."
        }
    }
}