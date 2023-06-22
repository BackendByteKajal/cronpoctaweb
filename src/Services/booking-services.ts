import { BookingRoomDto } from "../dtos/request/booking-dto";
import { BookingResponseObj } from "../dtos/response/booking-response-dto";
import { Booking } from "../entities/booking-entity";
import { MeetingRoom } from "../entities/meeting_room-entity";
import { User } from "../entities/user-entity";
const moment = require("moment");

export class BookingServices {
  public static async bookMeetRoom(bookingDetails: BookingRoomDto) {
    try {
      const { userId, meetRoomId, title, date, startTime, endTime, status } =
        bookingDetails;
      console.log("In bookMeetRoom");
      console.log(meetRoomId,date,startTime,endTime);
      await this.isMeetRoomExists(meetRoomId);
      const result = await this.roomAvailability(
        meetRoomId,
        date,
        startTime,
        endTime
      );
      if (result) {
        const data = Booking.BookingRoomObj(bookingDetails);
        const response = await Booking.create(data).save();
        const responseObj = BookingResponseObj.convertBookingToObj(response);
        return responseObj;
      }
    } catch (err: any) {
      throw err;
    }
  }

  public static async getAllBookings() {
    try {
      let todays_bookings: Booking[] = [];
      let upcoming_bookings: Booking[] = [];
      const bookings = await Booking.find();
      const current_date = moment().format("DD/MM/YYYY");
      console.log(current_date);
      bookings.forEach((booking) => {
        if (booking.date == current_date) {
          todays_bookings.push(booking);
        } else if (booking.date > current_date) {
          upcoming_bookings.push(booking);
        }
      });
      const todays_bookings_obj = todays_bookings.map((booking) => {
        return BookingResponseObj.convertBookingToObj(booking);
      });
      let todays_bookings_data = await this.addExtraDetails(
        todays_bookings_obj
      );

      const upcoming_bookings_obj = upcoming_bookings.map((booking) => {
        return BookingResponseObj.convertBookingToObj(booking);
      });
      let upcoming_bookings_data = await this.addExtraDetails(
        upcoming_bookings_obj
      );
      todays_bookings_data = todays_bookings_data.slice().reverse();
      upcoming_bookings_data = upcoming_bookings_data.slice().reverse();
      const response = {
        todays_bookings: todays_bookings_data,
        upcoming_bookings: upcoming_bookings_data,
      };
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  public static async getBookingHistory(userId: number) {
    try {
      let myBookings = await Booking.findBy({ user_id: userId });

      const bookingData = myBookings.map((booking) => {
        return BookingResponseObj.convertBookingToObj(booking);
      });
      // console.log(bookingData)
      const allBookings = await this.addExtraDetails(bookingData);
      const allBookingsHistory = this.addDuration(allBookings);
      return allBookingsHistory;
    } catch (err: any) {
      throw err;
    }
  }

  public static async doEditBookings(bookingId:number,bookingDetails:BookingRoomDto){
    try{
      let booking:any = await Booking.findOneBy({id:bookingId});
      // console.log(booking);
      const data = BookingResponseObj.convertBookingToObj(booking);
      // const data = Booking.BookingRoomObj(booking);
      const editedBookingData = {
        ...data,
        ...bookingDetails
      }
      //check wheather slot is available or not
      const result = await this.roomAvailability(
        editedBookingData.meetRoomId,
        editedBookingData.date,
        editedBookingData.startTime,
        editedBookingData.endTime
      );

      if(result){
        const result = Booking.BookingRoomObj(editedBookingData);
        await Booking.update(bookingId,result);
        const bookingData:any = await Booking.findOneBy({id:bookingId});
        const editedData = BookingResponseObj.convertBookingToObj(bookingData);
        return editedData; 
      }
        
    }catch(err:any){
      throw err;
    }
  }

  public static async isMeetRoomExists(MeetRoomId: number) {
    try {
      const result = await MeetingRoom.findOneBy({
        id: MeetRoomId,
      });
      if (!result) {
        throw new Error("Meeting Room Does not Exists");
      }
      return true;
    } catch (err: any) {
      throw err;
    }
  }

  public static async roomAvailability(
    MeetRoomId: number,
    date: string,
    startTime: string,
    endTime: string
  ) {
    try {
      const booking_room_details = await Booking.findBy({
        meetroom_id: MeetRoomId,
      });
      if (booking_room_details.length == 0) {
        // return "Room is Available";
        return true;
      }
      const start_time = startTime.replace(":", ".");
      const end_time = endTime.replace(":", ".");

      const clash_time = booking_room_details.filter((ele) => {
        const booked_start_time = ele.start_time.replace(":", ".");
        const booked_end_time = ele.end_time.replace(":", ".");

        return (
          ((start_time >= booked_start_time && start_time < booked_end_time) ||
            (end_time <= booked_end_time && end_time > booked_start_time) ||
            (start_time <= booked_start_time && end_time >= booked_end_time)) &&
          date == ele.date
        );
      });

      if (clash_time.length == 0) {
        return true;
      }
      throw new Error("Room is Booked at this time slot");
    } catch (err: any) {
      throw err;
    }
  }

  public static async addExtraDetails(toUpdateArray: any) {
    const updatedArray = await Promise.all(
      toUpdateArray.map(async (obj: any) => {
        const newObj = { ...obj };

        const userNamedata = await User.findOneBy({ id: obj.userId });
        const meetRoomData = await MeetingRoom.findOneBy({
          id: obj.meetRoomId,
        });

        newObj.userName = userNamedata ? userNamedata.user_name : null;
        newObj.lastName = userNamedata ? userNamedata.last_name : null;
        newObj.meetingRoomName = meetRoomData ? meetRoomData?.room_name : null;
        return newObj;
      })
    );
    console.log(updatedArray);
    return updatedArray;
  }

  public static addDuration(bookings: any) {
    const bookingResponse = bookings.map((booking: any) => {
      const [startHour, startMinute] = booking.startTime.split(":").map(Number);
      const [endHour, endMinute] = booking.endTime.split(":").map(Number);

      const totalStartMinutes = startHour * 60 + startMinute;
      const totalEndMinutes = endHour * 60 + endMinute;

      const duration = totalEndMinutes - totalStartMinutes;
      const hours = Math.floor(duration / 60);
      const remainingMinutes = duration % 60;
      let durationTime = "";
      if (hours == 0) {
        durationTime = `${remainingMinutes}m`;
      }
      if (remainingMinutes == 0) {
        durationTime = `${hours}h`;
      }
      if (hours != 0 && remainingMinutes != 0) {
        durationTime = `${hours}h ${remainingMinutes}m`;
      }
      return { ...booking, duration: durationTime };
    });
    return bookingResponse;
  }
}
