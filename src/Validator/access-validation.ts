import { Context, Next } from "koa";
import { BookingResponseObj } from "../dtos/response/booking-response-dto";
import { Booking } from "../entities/booking-entity";
import { Utils } from "../utils/utils";
import moment from "moment";
import { BookMeetRoomValidations } from "./bookroom-valication";

export class AccessValidation {
  public static async editDeleteValidation(ctx: Context, next: Next) {
    try {
      const bookingId = ctx.params.id;
      const loggedUserId: any = ctx.request.body;
      const booking: any = await Booking.findOneBy({ id: bookingId });
      const data = BookingResponseObj.convertBookingToObj(booking);
      if (data.userId == loggedUserId.userId) {
        const current_time = AccessValidation.getCurrentTime();

        const compareTiming = AccessValidation.editDeletePossibility(
          current_time,
          booking.start_time
        );
        const result = BookMeetRoomValidations.dateValidation(booking.date);

        if (result == -1) {
          throw new Error("Cannot Edit or Delete booking now");
        } else if (compareTiming == false && result != 1) {
          throw new Error("Cannot Edit or Delete booking now");
        }

        return next();
      }
      throw new Error("You do not have access to this booking");
    } catch (err: any) {
      ctx.body = Utils.errorResponse(400, err.message);
    }
  }

  public static getCurrentTime() {
    const todaysDate = new Date();
    const hours = todaysDate.getHours().toString().padStart(2, "0");
    const minutes = todaysDate.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  }

  public static editDeletePossibility(
    currentTime: string,
    bookingTime: string
  ) {
    const current_time = Number(currentTime.replace(":", "."));
    const booking_time = Number(bookingTime.replace(":", "."));

    if (booking_time - current_time <= 1) {
      return false;
    }
    return true;
  }
}
