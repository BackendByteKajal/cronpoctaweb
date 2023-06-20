import { Context } from "koa";
import { BookingRoomDto } from "../dtos/request/booking-dto";

export class BookingController{
    public static BookMeetRoom(ctx:Context){
        try{
            const RoomDetails = ctx.request.body as BookingRoomDto;
            
        }catch(err:any){
            throw err;
        }

    }
}