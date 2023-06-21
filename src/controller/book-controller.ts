import { Context } from "koa";
import { BookingRoomDto } from "../dtos/request/booking-dto";
import { BookingServices } from "../Services/booking-services";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import { User } from "../entities/user-entity";

export class BookingController {
  public static async addBooking(ctx: Context) {
    try {
      const roomDetails = ctx.request.body as BookingRoomDto;
      const response = await BookingServices.bookMeetRoom(roomDetails);

      ctx.body = Utils.successResponse(Message.SuccessBooking, response);
    } catch (err: any) {
      ctx.body = Utils.errorResponse(400, err.message);
    }
  }

  public static async activeBookings(ctx: Context) {
    try {
      const allBookings = await BookingServices.getAllBookings();

      if (
        allBookings.todays_bookings.length == 0 &&
        allBookings.upcoming_bookings.length == 0
      ) {
        throw new Error("No Bookings Found");
      }

      ctx.body = Utils.successResponse(Message.ActiveBookings, allBookings);
    } catch (err: any) {
      ctx.body = Utils.errorResponse(400, err.message);
    }
  }
}
