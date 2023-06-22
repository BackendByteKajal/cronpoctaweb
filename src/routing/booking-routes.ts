import Router from "koa-router";
import { BookingApiRoute } from "../routes/route-constant";
import { AdminController } from "../controller/admin-controller";
import { UserController } from "../controller/user-controller";
import { BookingController } from "../controller/book-controller";

export class BookRoute {
  public static routes(router: Router) {

    router.post(BookingApiRoute.BookMeetRoom,BookingController.addBooking);
    router.get(BookingApiRoute.Bookings,BookingController.activeBookings);
    router.post(BookingApiRoute.MyBookings,BookingController.bookingHistory);
    router.patch(BookingApiRoute.EditBooking,BookingController.editBooking);
    
  }
}
