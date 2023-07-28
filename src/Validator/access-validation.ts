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
      console.log(bookingId,"bookingid")
      const loggedUserData: any = ctx.request.body;
      const loggedUserId = ctx.state.me.id;
      const booking: any = await Booking.findOneBy({ id: bookingId });
      console.log("booking",booking);
      if(!booking){
        throw new Error("Booking with this ID not found")
      }
      const data = BookingResponseObj.convertBookingToObj(booking);
      if (data.userId == loggedUserId) {
        const current_time = AccessValidation.getCurrentTime();

        const compareTiming = AccessValidation.editDeletePossibility(
          current_time,
          booking.start_time
        );
        const result = BookMeetRoomValidations.dateValidation(booking.date);
        if(loggedUserData.date){
         const checkDate = BookMeetRoomValidations.dateValidation(loggedUserData.date);
         if(checkDate == -1){
          throw new Error("Please enter valid date");
         }
         const checkTiming = AccessValidation.editDeletePossibility(
          current_time,
          loggedUserData.startTime
        );
        if(checkTiming == false && checkDate != 1 ){
          throw new Error("Please enter valid time");
        }

         
        }
        if (result == -1) {
          throw new Error("Cannot Edit or Delete booking now");
        } else if (compareTiming == false && result != 1) {
          throw new Error("Cannot Edit or Delete booking now");
        }

        return next();
      }
      throw new Error("You do not have access to this booking");
    } catch (err: any) {
      // console.log(err);
      ctx.status = 400;
      ctx.body = Utils.errorResponse(400, err.message);
    }
  }
//edit validation

/*public static async editValidation(ctx: Context, next: Next) {
  try {
    const bookingId = ctx.params.id;
    console.log(bookingId,"bookingid")
    const loggedUserData: any = ctx.request.body;
    const loggedUserId = ctx.state.me.id;
    const booking: any = await Booking.findOneBy({ id: bookingId });
    console.log("booking",booking);
    if(!booking){
      throw new Error("Booking with this ID not found")
    }
    const data = BookingResponseObj.convertBookingToObj(booking);
    if (data.userId == loggedUserId) {
      const current_time = AccessValidation.getCurrentTime();

      const compareTiming = AccessValidation.editDeletePossibility(
        current_time,
        booking.start_time
      );
      const result = BookMeetRoomValidations.dateValidation(booking.date);
      if(loggedUserData.date){
       const checkDate = BookMeetRoomValidations.dateValidation(loggedUserData.date);
       if(checkDate == -1){
        throw new Error("Please enter valid date");
       }
       const checkTiming = AccessValidation.editDeletePossibility(
        current_time,
        loggedUserData.startTime
      );
      if(checkTiming == false && checkDate != 1 ){
        throw new Error("Please enter valid time");
      }

       
      }
      if (result == -1) {
        throw new Error("Cannot Edit or Delete booking now");
      } else if (compareTiming == false && result != 1) {
        throw new Error("Cannot Edit or Delete booking now");
      }

      return next();
    }
    throw new Error("You do not have access to this booking");
  } catch (err: any) {
    // console.log(err);
    ctx.status = 400;
    ctx.body = Utils.errorResponse(400, err.message);
  }
}*/






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
