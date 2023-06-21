import { BookingRoomDto } from "../dtos/request/booking-dto";
import { BookingResponseObj } from "../dtos/response/booking-response-dto";
import { Booking } from "../entities/booking-entity";
import { MeetingRoom } from "../entities/meeting_room-entity";

export class BookingServices{
    public static async BookMeetRoom(bookingDetails: BookingRoomDto){
        try{
            const {userId,meetRoomId,title,date,startTime,endTime,status} = bookingDetails;
            await this.isMeetRoomExists(meetRoomId);
            const result = await this.roomAvailability(meetRoomId,date,startTime,endTime);
            if(result){
                const data = Booking.BookingRoomObj(bookingDetails);
                const response = await Booking.create(data).save();
                const responseObj = BookingResponseObj.convertBookingToObj(response);
                return responseObj;
            }
            
        }catch(err:any){
            throw err;
        }

    }

    public static async isMeetRoomExists(MeetRoomId:number){
        try{
            const result = await MeetingRoom.findOneBy({
                id: MeetRoomId
            });
            if(!result){
                throw new Error("Meeting Room Does not Exists");
            }
            return true;
        }catch(err:any){
            throw err;
        }

    }

    public static async roomAvailability(MeetRoomId:number,date:string,startTime:string,endTime:string){
        try{
            const booking_room_details = await Booking.findBy({
                meetroom_id: MeetRoomId
            });
            if(booking_room_details.length == 0){
                // return "Room is Available";
                return true
            }
            const start_time = startTime.replace(":",".");
            const end_time = endTime.replace(":",".");
            
            
            const clash_time = booking_room_details.filter((ele)=>{
                const booked_start_time = ele.start_time.replace(":",".");
                const booked_end_time = ele.end_time.replace(":",".");
    
                return ((start_time >= booked_start_time
                 && start_time < booked_end_time)
                 || (end_time <= booked_end_time
                 && end_time > booked_start_time)
                 || (start_time <= booked_start_time && end_time >= booked_end_time))
                 && date == ele.date
            })

            if(clash_time.length == 0 ){
                return true;
            }
            throw new Error("Room is Booked at this time slot");
        }catch(err:any){
            throw err;
        }

    }
}