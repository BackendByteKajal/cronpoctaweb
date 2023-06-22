import Router from "koa-router";
import { PingApiRoute } from "../routes/route-constant";
import { PingController } from "../controller/ping-controller";

export class PingRoute {
    public static routes(router: Router) {
  
      router.get(PingApiRoute.Ping,PingController.pingService);
        
    }
  }