import { Context, Next } from "koa";
import { BookingResponseObj } from "../dtos/response/booking-response-dto";
import { Booking } from "../entities/booking-entity";
import { Utils } from "../utils/utils";

export class AccessValidation{
    public static async editDeleteValidation(ctx:Context,next:Next){
        try{
          const bookingId = ctx.params.id;
          const loggedUserId:any = ctx.request.body;
          const booking: any = await Booking.findOneBy({ id: bookingId });
          const data = BookingResponseObj.convertBookingToObj(booking);
          console.log(data);
          console.log("data.data_id",data.userId);
          console.log("userId",loggedUserId);
          if(data.userId == loggedUserId.userId){
            return next();
          }
          throw new Error("You do not have access to this booking");
        }catch(err:any){
          ctx.body = Utils.errorResponse(400,err.message);
        }
      }
}