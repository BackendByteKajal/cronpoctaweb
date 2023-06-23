import Router from "koa-router";
import { AdminApiRoutes, MeetingRoomApiRoute, UserApiRoutes } from "../routes/route-constant";
import { AdminController } from "../controller/admin-controller";
import { UserController } from "../controller/user-controller";

export class AdminRoute {
  public static routes(router: Router) {

    router.post(MeetingRoomApiRoute.MeetRoom,AdminController.AddMeetRoom);
    router.get(MeetingRoomApiRoute.MeetRoom,AdminController.getAllMeetRooms);
    router.patch(AdminApiRoutes.MeetRoom,AdminController.editMeetRoom);
    router.get(AdminApiRoutes.MeetRoom,AdminController.meetRoomHistory);
    
  }
}
