import Router from "koa-router";
import { AuthRoute } from "../routing/auth-routes";
import { UserRoute } from "../routing/user-route";
import { RouteVersion } from "./route-constant";
export class AppRoutes {
  static initAppRoutes(router: Router): void {
    AuthRoute.routes(router);
    UserRoute.routes(router);
  }
}
