import { Context } from "koa";
import { AuthServices } from "../Services/auth-services";
import { LoginUserDto } from "../dtos/request/user-login-dto";
import { Utils } from "../utils/utils";

export class AuthController {
  public static async login(ctx: Context) {
    try{
      const body = ctx.request.body as LoginUserDto;
  
      const data: any = await AuthServices.LoginUser(body.email, body.password);
  
      ctx.body = {
        data: data,
      };
    }catch(err:any){
      ctx.body = Utils.errorResponse(404,err.message);
    }
  }
}
