import Router from "koa-router";
import { AdminApiRoutes, MeetingRoomApiRoute, UserApiRoutes } from "../routes/route-constant";
import { AdminController } from "../controller/admin-controller";
import { UserController } from "../controller/user-controller";
import { AdminValidator } from "../Validator/validator";

export class AdminRoute {
  public static routes(router: Router) {

    router.post(MeetingRoomApiRoute.MeetRoom,AdminValidator.addMeetRoomValidation,AdminController.AddMeetRoom);
    router.get(MeetingRoomApiRoute.MeetRoom,AdminController.getAllMeetRooms);
    router.patch(AdminApiRoutes.MeetRoom,AdminController.editMeetRoom);
    router.get(AdminApiRoutes.MeetRoom,AdminController.meetRoomHistory);
    
  }
}
