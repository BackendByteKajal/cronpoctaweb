import Router from "koa-router";
import { AuthController } from "../controller/auth-controller";

import { AuthServices } from "../Services/auth-services";
import { AuthApiRoutes } from "../routes/route-constant";
//import { Cache } from "../Middleware/cache";
import { Context } from "koa";
import passport from "../passport/passport";
import { auth } from "googleapis/build/src/apis/abusiveexperiencereport";
//import { User } from "../entities/user-entity";
// import { UserObject } from "../dtos/response/user-object-dto";
import { authenticate } from "passport";
import { AuthenticateMiddleware } from "../Middleware/Authentication";

export class AuthRoute {
  public static routes(router: Router) {
    router.post(AuthApiRoutes.AdminLogin, AuthController.loginAdmin);

    router.get(
      AuthApiRoutes.Googlelogin,
      passport.authenticate("google", {
        scope: [
          "profile",
          "email",
          "openid",
          "https://www.googleapis.com/auth/calendar",
           "https://mail.google.com",
           
        ],
        accessType: "offline", // Set access_type to "offline
      })
    );

    router.get(
      AuthApiRoutes.Callback,
      passport.authenticate("google"),
      AuthController.handleGoogleCallback
    );
  }
}
