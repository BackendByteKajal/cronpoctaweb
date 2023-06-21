import { Context } from "koa";
import { BookingRoomDto } from "../dtos/request/booking-dto";
import { BookingServices } from "../Services/booking-services";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";

export class BookingController{
    public static async BookMeetRoom(ctx:Context){
        try{
            const roomDetails = ctx.request.body as BookingRoomDto;
            const response = await BookingServices.BookMeetRoom(roomDetails);
            

            ctx.body = Utils.successResponse(Message.SuccessBooking,response);
            
        }catch(err:any){
            ctx.body = Utils.errorResponse(400,err.message)
        }

    }
}