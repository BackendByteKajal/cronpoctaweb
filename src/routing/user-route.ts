import Router from "koa-router";
import { UserController } from "../controller/user-controller";
import { UserApiRoutes } from "../routes/route-constant";
import { AuthenticateMiddleware } from "../Middleware/Authentication";
import { UserValidator } from "../Validator/validator";

export class UserRoute {
  public static routes(router: Router) {
   router.get(UserApiRoutes.Users, UserController.Users);
   router.get(UserApiRoutes.GetAllGuests, UserController.getAllGuests);
    router.get(UserApiRoutes.LogOut, UserController.removeToken);
  }
}
