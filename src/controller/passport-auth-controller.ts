import { Context } from "koa";
export class PassportAuthController {
  public static async loginFailed(ctx: Context) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: "failure",
    };
  }
  public static async loginSuccess(ctx: Context) {
    ctx.status = 200;
    try {
      if (ctx.state.user) {
        ctx.body = {
          success: true,
          message: "succesful",
          user: ctx.state.user,
          cookies: ctx.cookies,
        };
      }
    } catch (error) {
      throw error;
    }
  }
  public static async logout(ctx: Context) {
    const CLIENT_URL = "http://localhost:3001/";
    ctx.logOut();
    ctx.redirect(CLIENT_URL);
  }
}
