import Router from "koa-router";
import { AuthRoute } from "../routing/auth-routes";
import { UserRoute } from "../routing/user-route";
import { RouteVersion } from "./route-constant";

import { AdminRoute } from "../routing/admin-routes";
import { BookRoute } from "../routing/booking-routes";
export class AppRoutes {
  static initAppRoutes(router: Router): void {
    AuthRoute.routes(router);
    UserRoute.routes(router);
    AdminRoute.routes(router);
    BookRoute.routes(router);
  }
}
