import Router from "koa-router";
import { BookingApiRoute } from "../routes/route-constant";
import { AdminController } from "../controller/admin-controller";
import { UserController } from "../controller/user-controller";
import { BookingController } from "../controller/book-controller";
import { AuthenticateMiddleware } from "../Middleware/Authentication";
import { AccessValidation } from "../Validator/access-validation";
import { BookMeetRoomValidations } from "../Validator/bookroom-valication";

export class BookRoute {
  public static routes(router: Router) {
    router.post(
      BookingApiRoute.BookMeetRoom,
      BookMeetRoomValidations.bookMeetRoom,
      AuthenticateMiddleware.AuthenticateUser,
      BookingController.addBooking
    );
    router.get(
      BookingApiRoute.Bookings,
      AuthenticateMiddleware.AuthenticateUser,
      BookingController.activeBookings
    );
    router.get(
      BookingApiRoute.MyBookings,
      AuthenticateMiddleware.AuthenticateUser,
      BookingController.bookingHistory
    );
    router.patch(
      BookingApiRoute.EditBooking,
      AuthenticateMiddleware.AuthenticateUser,
      AccessValidation.editDeleteValidation,
      BookingController.editBooking
    );
    router.delete(
      BookingApiRoute.DeleteBooking,
      AuthenticateMiddleware.AuthenticateUser,
      AccessValidation.editDeleteValidation,
      BookingController.deleteBooking
    );
  }
}
