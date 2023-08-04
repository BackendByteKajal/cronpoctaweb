import { Context } from "koa";
import { BookingRoomDto } from "../dtos/request/booking-dto";
import { BookingResponseObj } from "../dtos/response/booking-response-dto";
import { Booking } from "../entities/booking-entity";
import { MeetingRoom } from "../entities/meeting_room-entity";
import { User } from "../entities/user-entity";
import { BookMeetRoomValidations } from "../Validator/bookroom-valication";
import json from "koa-json";
const moment = require("moment");
import { calendar_v3, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Not } from "typeorm";
import { AccessValidation } from "../Validator/access-validation";
//import { Not } from "typeorm/find-options/operator/Not";
//import { Not } from "typeorm";



const clientId = "403313880374-q4a82ib2c333je5bqlnoj43klf1p5d3p.apps.googleusercontent.com";
const clientSecret = "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";
const redirectUri = "http://localhost:3006/google/redirect";
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

//const oauth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export class BookingServices {
  /*public static async bookMeetRoom(bookingDetails: BookingRoomDto,ctx:Context) {
    try {
      const { userId, meetRoomId, title, date, startTime, endTime, status } =
        bookingDetails;
      await this.isMeetRoomExists(meetRoomId);
      const result = await this.roomAvailability(
        meetRoomId,
        date,
        startTime,
        endTime
      );
      if (result) {
        const bookRoomData = {...bookingDetails,userId:ctx.state.me.id}
        const data = Booking.BookingRoomObj(bookRoomData);
        
        const response = await Booking.create(data).save();
        const responseObj = BookingResponseObj.convertBookingToObj(response);
        return responseObj;
      }
    } catch (err: any) {
      throw err;
    }
  }*/

  /* public static async bookMeetRoom(bookingDetails: any, ctx: Context) {
    try {
      const {
        userId,
        meetRoomId,
        title,
        date,
        startTime,
        endTime,
        status,
        guests,
      } = bookingDetails;
      console.log(bookingDetails.guests, "booking detal");
      //const guestsArray = bookingDetails.guests.map((item: { guests: any; }) => item);
      //console.log(guestsArray,"guestsArray");

      //const parsedGuests = JSON.parse(bookingDetails.guests);
      //console.log(parsedGuests);
      await this.isMeetRoomExists(meetRoomId);
      const result = await this.roomAvailability(
        meetRoomId,
        date,
        startTime,
        endTime
      );
      console.log(result);
      if (result) {

        const guestsArray = guests.map((item: { guests: string; }) => item.guests);
        console.log(guestsArray)
        const guestsString = guestsArray.join(', ');
        console.log(guestsString);
        // const bookRoomData = {...bookingDetails,userId:ctx.state.me.id,guestsArray }
        const bookRoomData = {
          ...bookingDetails,
          userId: ctx.state.me.id,
          guests:guestsString,
        };
        console.log("join");
        const data = Booking.BookingRoomObj(bookRoomData);
        console.log(data, "dta");
        const response = await Booking.create(data).save();
        console.log(response);
        const responseObj = BookingResponseObj.convertBookingToObj(response);
        console.log(responseObj);


      // Authenticate and get the access token
     // const { tokens } = await oauth2Client.getToken('AUTHORIZATION_CODE'); // Replace 'AUTHORIZATION_CODE' with the actual code received from Google after the user grants permission

      // Set the access token in the oauth2Client
     // oauth2Client.setCredentials(tokens);
        // Call the createCalendarEvent function to create the event on Google Calendar
     //  await this.createCalendarEvent(title, guestsArray, date, startTime, endTime);
        return responseObj;
      }
    } catch (err: any) {
      throw err;
    }
  
}*/

  public static async bookMeetRoom(bookingDetails: any, ctx: Context) {
    try {
      const {
        userId,
        meetRoomId,
        title,
        date,
        startTime,
        endTime,
        status,
        guests,
      } = bookingDetails;
      console.log(bookingDetails.guests, "booking detal");
      //const guestsArray = bookingDetails.guests.map((item: { guests: any; }) => item);
      //console.log(guestsArray,"guestsArray");

      //const parsedGuests = JSON.parse(bookingDetails.guests);
      //console.log(parsedGuests);
      await this.isMeetRoomExists(meetRoomId);
      const result = await this.roomAvailability(
        meetRoomId,
        date,
        startTime,
        endTime
      );
      console.log(result);
      if (result) {
        // const guestsArray = guests.map((item: { guests: string; }) => item.guests);
        //console.log(guestsArray)
        //const guestsString = guestsArray.join(', ');
        //console.log(guestsString);
        // const bookRoomData = {...bookingDetails,userId:ctx.state.me.id,guestsArray }
        const bookRoomData = {
          ...bookingDetails,
          userId: ctx.state.me.id,
        };
        console.log("join");
        const data = Booking.BookingRoomObj(bookRoomData);
        console.log(data, "dta");
        const response = await Booking.create(data).save();
        console.log(response);
        const responseObj = BookingResponseObj.convertBookingToObj(response);
        console.log(responseObj, "...");

        // Authenticate and get the access token
        // const { tokens } = await oauth2Client.getToken('AUTHORIZATION_CODE'); // Replace 'AUTHORIZATION_CODE' with the actual code received from Google after the user grants permission

        // Set the access token in the oauth2Client
        // oauth2Client.setCredentials(tokens);
        // Call the createCalendarEvent function to create the event on Google Calendar
        //  await this.createCalendarEvent(title, guestsArray, date, startTime, endTime);
        return responseObj;
      }
    } catch (err: any) {
      throw err;
    }
  }

  //calender

  public static async createCalendarEvent(
    title: string,
    guestsArray: string[],
    date: string,
    startTime: string,
    endTime: string
  ) {
    try {
      console.log("calender function.....");
      const event: calendar_v3.Schema$Event = {
        summary: title,
        description: `Meeting with ${guestsArray.join(", ")}`,
        start: {
          dateTime: `${date}T${startTime}`,
          timeZone: "Asia/Kolkata", // desired timezone (e.g., 'America/New_York')
        },
        end: {
          dateTime: `${date}T${endTime}`,
          timeZone: "Asia/Kolkata", //  desired timezone (e.g., 'America/New_York')
        },
        attendees: guestsArray.map((guest: string) => ({ email: guest })),
      };
      console.log(event.attendees, "atten");
      console.log(event.start?.dateTime);
      const response = await calendar.events.insert({
        calendarId: "primary", // Use 'primary' for the user's primary calendar
        requestBody: event, // Use requestBody to pass the event object
        sendNotifications: true,
      });
      console.log("event creates..");
      console.log("Event created: %s", response.data.htmlLink);
    } catch (err: any) {
      console.log(err);
      throw err;
    }
  }

  // public static async getAllBookings(ctx: Context) {
  //   try {
  //     let todays_bookings: Booking[] = [];
  //     let upcoming_bookings: Booking[] = [];
  //     const bookings = await Booking.find();
  //     const current_date = moment().format("DD/MM/YYYY");
  //     // console.log(current_date);
  //     bookings.forEach((booking) => {
  //       const compareDate = BookMeetRoomValidations.dateValidation(
  //         booking.date
  //       );
  //       if (compareDate == 0) {
  //         todays_bookings.push(booking);
  //       } else if (compareDate == 1) {
  //         upcoming_bookings.push(booking);
  //       }
  //     });
  //     const todays_bookings_obj = todays_bookings.map((booking) => {
  //       return BookingResponseObj.convertBookingToObj(booking);
  //     });
  //     let todays_bookings_data = await this.addExtraDetails(
  //       todays_bookings_obj
  //     );

  //     const upcoming_bookings_obj = upcoming_bookings.map((booking) => {
  //       return BookingResponseObj.convertBookingToObj(booking);
  //     });
  //     let upcoming_bookings_data = await this.addExtraDetails(
  //       upcoming_bookings_obj
  //     );
  //     todays_bookings_data = todays_bookings_data.slice().reverse();
  //     upcoming_bookings_data = upcoming_bookings_data.slice().reverse();
  //     const response = {
  //       todays_bookings: todays_bookings_data,
  //       upcoming_bookings: upcoming_bookings_data,
  //     };
  //     return response;
  //   } catch (err: any) {
  //     throw err;
  //   }
  // }

  //
  public static async getAllBookings(ctx: Context) {
    try {
      let todays_bookings: Booking[] = [];
      let upcoming_bookings: Booking[] = [];
      const bookings = await Booking.find();
      const current_date = moment().format("DD/MM/YYYY");

      bookings.forEach((booking) => {
        const compareDate = BookMeetRoomValidations.dateValidation(
          booking.date
        );
        const isDone = AccessValidation.isBookingFuture(booking.end_time);

        if (compareDate === 0 && isDone) {
          todays_bookings.push(booking);
        } else if (compareDate === 1) {
          upcoming_bookings.push(booking);
        }
      });

      // Sort todays_bookings based on their dates and start times
      todays_bookings.sort((a, b) => {
        const dateA = moment(a.date, "DD/MM/YYYY").valueOf();
        const dateB = moment(b.date, "DD/MM/YYYY").valueOf();
        const startTimeA = moment(a.start_time, "HH:mm").valueOf();
        const startTimeB = moment(b.start_time, "HH:mm").valueOf();

        if (dateA === dateB) {
          return startTimeA - startTimeB;
        } else {
          return dateA - dateB;
        }
      });

      // Sort upcoming_bookings based on their dates and start times
      upcoming_bookings.sort((a, b) => {
        const dateA = moment(a.date, "DD/MM/YYYY").valueOf();
        const dateB = moment(b.date, "DD/MM/YYYY").valueOf();
        const startTimeA = moment(a.start_time, "HH:mm").valueOf();
        const startTimeB = moment(b.start_time, "HH:mm").valueOf();

        if (dateA === dateB) {
          return startTimeA - startTimeB;
        } else {
          return dateA - dateB;
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

      if (myBookings.length == 0) {
        throw { status: 404, message: "No history found" };
      }
      //sort data
      const sortdata = myBookings.sort((a, b) => {
        const dateA = moment(a.date, "DD/MM/YYYY").valueOf();
        const dateB = moment(b.date, "DD/MM/YYYY").valueOf();
        const startTimeA = moment(a.start_time, "HH:mm").valueOf();
        const startTimeB = moment(b.start_time, "HH:mm").valueOf();

        if (dateA === dateB) {
          return startTimeB - startTimeA;
        } else {
          return dateB - dateA;
        }
      });

      const bookingData = sortdata.map((booking) => {
        return BookingResponseObj.convertBookingToObj(booking);
      });
      // console.log(bookingData)
      const allBookings = await this.addExtraDetails(bookingData);
      const allBookingsHistory = this.addDuration(allBookings);
      return allBookingsHistory.slice().reverse();
    } catch (err: any) {
      throw err;
    }
  }

  /* public static async doEditBookings(
    bookingId: number,
    bookingDetails: BookingRoomDto
  ) {
    try {
      console.log(bookingId)
      console.log(bookingDetails)
      let booking: any = await Booking.findOneBy({ id: bookingId });
       console.log(booking,"bookin");
      // if(!booking){
      //   throw {status: 404, message:"Booking with this ID not found"}
      // }
      const data = BookingResponseObj.convertBookingToObj(booking);
      // const data = Booking.BookingRoomObj(booking);
      const editedBookingData = {
        ...data,
        ...bookingDetails,
      };
      //check wheather slot is available or not
      const result = await this.roomAvailability(
        editedBookingData.meetRoomId,
        editedBookingData.date,
        editedBookingData.startTime,
        editedBookingData.endTime
      );

      if (result) {
        const result = Booking.BookingRoomObj(editedBookingData);
        await Booking.update(bookingId, result);
        const bookingData: any = await Booking.findOneBy({ id: bookingId });
        const editedData = BookingResponseObj.convertBookingToObj(bookingData);
        return editedData;
      }
    } catch (err: any) {
      throw err;
    }
  }*/

  public static async doDeleteBooking(bookingId: number) {
    try {
      const bookingData = await Booking.findOneBy({ id: bookingId });
      if (bookingData) {
        await Booking.delete(bookingId);

        return BookingResponseObj.convertBookingToObj(bookingData);
      }
      throw { status: 404, message: "Booking with this ID not found" };
    } catch (err: any) {
      throw err;
    }
  }

  //fetch data from bookinh id

  public static async fetchBookingWithId(bookingId: number) {
    try {
      const bookingData = await Booking.findOneBy({ id: bookingId });
      if (bookingData) {
        return BookingResponseObj.convertBookingToObj(bookingData);
      }
      throw { status: 404, message: "Booking with this ID not found" };
    } catch (err: any) {
      throw err;
    }
  }
  //
  public static async fetchBookingWithUSERID(UserId: number) {
    try {
      const bookingData = await Booking.findOneByOrFail({ user_id: UserId });

      if (bookingData) {
        return BookingResponseObj.convertBookingToObj(bookingData);
      }
      throw { status: 404, message: "Booking with this ID not found" };
    } catch (err: any) {
      throw err;
    }
  }

  public static async bookingDelete(bookid: any): Promise<any> {
    const booking = await User.delete({ id: bookid });
    //const userData1: User = User.fromRegisterObj(userData);
    return booking;
  }

  public static async isMeetRoomExists(MeetRoomId: number) {
    try {
      const result = await MeetingRoom.findOneBy({
        id: MeetRoomId,
      });
      if (!result) {
        throw { status: 404, message: "Meeting Room Does not Exists" };
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
      console.log(MeetRoomId, "meetroomr");
      const booking_room_details = await Booking.findBy({
        meetroom_id: MeetRoomId,
      });
      console.log(booking_room_details, "bookingdetailroom");
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
      throw { status: 400, message: "Meeting Room is already occupied" };
    } catch (err: any) {
      console.log(err, "errrrrrrrrrrrr");
      throw err;
    }
  }
  public static async roomAvailabilityForEdit(
    MeetRoomId: number,
    date: string,
    startTime: string,
    endTime: string,
    booking_id: number
  ) {
    try {
      console.log(MeetRoomId, "meetroomr");
      /* const booking_room_details = await Booking.findBy({
        meetroom_id: MeetRoomId,
      });*/
      const booking_room_details = await Booking.find({
        where: {
          meetroom_id: MeetRoomId,
          id: Not(booking_id) as unknown as number, // Convert to number type
        },
      });
      console.log(booking_room_details, "bookingdetailroom");
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
      throw { status: 400, message: "Meeting Room is already occupied" };
    } catch (err: any) {
      console.log(err, "errrrrrrrrrrrr");
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
        console.log(newObj);
        console.log({ meetRoomData });

        return newObj;
      })
    );
    // console.log(updatedArray);
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

  public static addToatalAttendies(bookings: any) {
    console.log("attendieas..");
    const bookingResponse = bookings.map((booking: any) => {
      // Get the guests array from the booking object
      const guestsArray = booking.guests;

      // Calculate the number of attendees for this booking
      const totalAttendees = guestsArray.length;
      console.log("totalatten", totalAttendees);
      // Create a new object with the booking details and the total number of attendees
      return {
        ...booking,
        totalAttendees: totalAttendees,
      };
    });

    // Log the bookingResponse to see the result
    //console.log("bookingResponse", bookingResponse);
    return bookingResponse;
  }

  /*public static async bookindelete(bookid: any): Promise<any> {

    const users = await Booking.delete({ id: bookid});
    //const userData1: User = User.fromRegisterObj(userData);
    return userData;
  }*/

  public static async doEditBookings(
    bookingId: number,
    bookingDetails: BookingRoomDto
  ) {
    try {
      console.log(bookingId);
      console.log(bookingDetails);
      let booking: any = await Booking.findOneBy({ id: bookingId });
       const current_time = AccessValidation.getCurrentTime();
       console.log("currenttime....", current_time);
       let time = BookMeetRoomValidations.timeValidationEdit(
         booking.start_time,
         booking.end_time,
         current_time.toString(),
         booking.date
       );
      console.log(booking, "bookin");
      if (!booking) {
        throw { status: 404, message: "Booking with this ID not found" };
      }
      const data = BookingResponseObj.convertBookingToObj(booking);
      // const data = Booking.BookingRoomObj(booking);
      const editedBookingData = {
        ...data,
        ...bookingDetails,
      };
      //check wheather slot is available or not
      console.log("data", editedBookingData);
      const result = await this.roomAvailabilityForEdit(
        editedBookingData.meetRoomId,
        editedBookingData.date,
        editedBookingData.startTime,
        editedBookingData.endTime,
        bookingId
      );
      console.log(result, "result");
      if (result) {
        const result = Booking.BookingRoomObj(editedBookingData);
        await Booking.update(bookingId, result);

        const bookingData: any = await Booking.findOneBy({ id: bookingId });

        const editedData = BookingResponseObj.convertBookingToObj(bookingData);
        console.log(editedData);
        return editedData;
      }
    } catch (err: any) {
      throw err;
    }
  }
  public static async MeetRoomName(MeetRoomId: number) {
    try {
      console.log("roomfunction");
      const Roomdetail: any = await MeetingRoom.findOneBy({ id: MeetRoomId });
      const RoomName = Roomdetail.room_name;
      console.log("roomname", RoomName);

      if (!Roomdetail) {
        throw { status: 404, message: "Meeting Room Does not Exists" };
      }
      return RoomName;
    } catch (err: any) {
      throw err;
    }
  }
}



  

