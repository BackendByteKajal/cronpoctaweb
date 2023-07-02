import { Builder } from "builder-pattern";
import { Booking } from "../../entities/booking-entity";
import { BookingRoomDto } from "../request/booking-dto";

export class BookingResponseObj extends BookingRoomDto{

    id:number;

    public static convertBookingToObj(bookingObj: Booking): BookingResponseObj {
        const resp = Builder<BookingResponseObj>()
        .id(bookingObj.id)
          .userId(bookingObj.user_id)
          .meetRoomId(bookingObj.meetroom_id)
          .title(bookingObj.title)
          .date(bookingObj.date)
          .startTime(bookingObj.start_time)
          .endTime(bookingObj.end_time)
          .status(bookingObj.status)
          .guests(bookingObj.guests)
          .description(bookingObj.description)
          
          return resp.build();
      }
}