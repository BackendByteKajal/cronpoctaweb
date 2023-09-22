import { Context } from "koa";
import { AuthServices } from "../Services/auth-services";
import { LoginUserDto } from "../dtos/request/user-login-dto";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import passport from "koa-passport";
//import { User } from "../entities/user-entity";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export class AuthController {
  // Admin Login
  public static async loginAdmin(ctx: Context) {
    try {
      const body = ctx.request.body as LoginUserDto;
      const data: any = await AuthServices.loginAdmin(
        body.email,
        body.password
      );

      ctx.body = Utils.successResponse(Message.LoginSuccess, data);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }

  public static async handleGoogleCallback(ctx: Context) {
    try {
      // Access the user object and token from the Passport strategy
      const user = ctx.state.user;
      const token = ctx.state.authInfo;
      const userId = user.id;

      await AuthServices.setCookieAndReturnToken(ctx, "beareltoken", token);
      await AuthServices.setCookieAndReturnToken(ctx, "userdata", userId);

      // Redirect Url
      const redirectURL = `${process.env.CLIENT_URL}/home?token=${token}&userId=${userId}&userName=${user.userName}&lastname=${user.last_name}`;

      // Redirect the user to the generated URL
      ctx.redirect(redirectURL);
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = "Internal Server Error";
    }
  }
}
