import Router from "koa-router";
import { BookingApiRoute } from "../routes/route-constant";
import { AdminController } from "../controller/admin-controller";
import { UserController } from "../controller/user-controller";

export class BookRoute {
  public static routes(router: Router) {

    router.post(BookingApiRoute.BookMeetRoom,AdminController.AddMeetRoom);
    // router.get(MeetingRoomApiRoute.MeetRoom,AdminController.getAllMeetRooms);
    
  }
}
