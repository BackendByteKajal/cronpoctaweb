import Router from "koa-router";
import { AuthController } from "../controller/auth-controller";

import { AuthServices } from "../Services/auth-services";
import { AuthApiRoutes } from "../routes/route-constant";
import { Cache } from "../Middleware/cache";
import { Context } from "koa";
import passport from "../passport/passport";
import { auth } from "googleapis/build/src/apis/abusiveexperiencereport";
import { User } from "../entities/user-entity";
import { UserObject } from "../dtos/response/user-object-dto";
import { authenticate } from "passport";
import { AuthenticateMiddleware } from "../Middleware/Authentication";
const CLIENT_URL = "https://6585-27-107-28-2.ngrok-free.app";
export class AuthRoute {
  public static routes(router: Router) {
    router.post(AuthApiRoutes.Login, AuthController.login);
    router.post(AuthApiRoutes.AdminLogin, AuthController.loginAdmin);

    //
    router.get(
      "/google",
      passport.authenticate("google", {
        scope: [
          "profile",
          "email",
          "openid",
          "https://www.googleapis.com/auth/calendar",
        ],
      })
    );

    // router.get(
    //   "/google/callback",
    //   passport.authenticate("google"),
    //   async (ctx) => {
    //     // Access the user object and token from the Passport strategy
    //     const user = ctx.state.user;
    //     const token = ctx.state.authInfo;
    //     const userid = user._id;

    //     // Set cookies

    //     //await AuthServices.loginUserSuccesspass(ctx,token,userid);
    //     //await AuthServices.setCookieAndReturnToken(ctx, "beareltoken", token);
    //     //await AuthServices.setCookieAndReturnToken(ctx, "userdata", userid);

    //     //Redirect to the home page
    //     ctx.redirect("https://weak-spoons-chew.loca.lt/home");
    //   }
    // );
    router.get(
      "/google/callback",
      passport.authenticate("google"),
      async (ctx) => {
        console.log("ctx.............", ctx.state.user);
        //  const a = ctx.state.user;
        //ctx.state.kajal = a;
        // Access the user object and token from the Passport strategy
        const user1 = ctx.state.user;
        const token = ctx.state.authInfo;
        const userid = user1._id;

        await AuthServices.setCookieAndReturnToken(ctx, "beareltoken", token);
        await AuthServices.setCookieAndReturnToken(ctx, "userdata", userid);

        //ctx.redirect("https://olive-berries-drive.loca.lt/home");
        ctx.body = {
          message: "Login successfull...",
          beareltoken: token,
          user_id: userid,
        };
      }
    );
  }
}
