import Router from "koa-router";
import { UserController } from "../controller/user-controller";
import { UserApiRoutes } from "../routes/route-constant";
import { AuthenticateMiddleware } from "../Middleware/Authentication";
import { UserValidator } from "../Validator/validator";

export class UserRoute {
  public static routes(router: Router) {

    router.post(UserApiRoutes.Register,UserValidator.Register,UserController.userRegister);
    router.get(UserApiRoutes.Users,UserController.Users);
    
  }
}
