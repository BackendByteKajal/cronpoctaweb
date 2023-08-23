import Router from "koa-router";
import { AuthController } from "../controller/auth-controller";
import { AuthApiRoutes } from "../routes/route-constant";
import { Cache } from "../Middleware/cache";
import { Context } from "koa";
import passport from "../passport/passport";

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
    router.get(
      "/google/callback",
      passport.authenticate("google", {
        //console.log("xbhh")
        successRedirect: "/login",
        failureRedirect: "/fail",
      })
    );
    router.get("/login", (ctx) => {
      ctx.body = {
        message: "login.................",
      };
    });
    router.get("/fail", (ctx) => {
      ctx.body = {
        message: "failed Authentication",
      };
    });
  }

  //
}
