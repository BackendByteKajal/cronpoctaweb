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

    router.get(
      AuthApiRoutes.Googlelogin,
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
      AuthApiRoutes.Callback,
      passport.authenticate("google"),
      AuthController.handleGoogleCallback
    );

   
  }
}
