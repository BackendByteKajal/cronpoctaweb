import Router from "koa-router";
import { AuthController } from "../controller/auth-controller";
import { AuthApiRoutes } from "../routes/route-constant";
import { Cache } from "../Middleware/cache";
import { Context } from "koa";

export class AuthRoute {
  public static routes(router: Router) {
    router.post(AuthApiRoutes.Login, AuthController.login);
    router.post(AuthApiRoutes.AdminLogin,AuthController.loginAdmin)

  }
}
