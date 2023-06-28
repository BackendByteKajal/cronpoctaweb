import { Context } from "koa";
import { AuthServices } from "../Services/auth-services";
import { LoginUserDto } from "../dtos/request/user-login-dto";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";

export class AuthController {
  public static async login(ctx: Context) {
    try{
      const body = ctx.request.body as LoginUserDto;
      const data: any = await AuthServices.loginUser(body.email, body.password);
  
      ctx.body = Utils.successResponse(Message.LoginSuccess,data);
    }catch(err:any){
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status,err.message)
    }
  }

  public static async loginAdmin(ctx: Context) {
    try{
      const body = ctx.request.body as LoginUserDto;
      const data: any = await AuthServices.loginAdmin(body.email, body.password);
  
      ctx.body = Utils.successResponse(Message.LoginSuccess,data);
    }catch(err:any){
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status,err.message)
    }
  }
}
