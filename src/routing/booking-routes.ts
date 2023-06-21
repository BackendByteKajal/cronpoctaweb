import Router from "koa-router";
import { BookingApiRoute } from "../routes/route-constant";
import { AdminController } from "../controller/admin-controller";
import { UserController } from "../controller/user-controller";
import { BookingController } from "../controller/book-controller";

export class BookRoute {
  public static routes(router: Router) {

    router.post(BookingApiRoute.BookMeetRoom,BookingController.BookMeetRoom);
    // router.get(MeetingRoomApiRoute.MeetRoom,AdminController.getAllMeetRooms);
    
  }
}
