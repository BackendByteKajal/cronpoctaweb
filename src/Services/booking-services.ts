import { Context } from "koa";
import { BookingRoomDto } from "../dtos/request/booking-dto";
import { BookingResponseObj } from "../dtos/response/booking-response-dto";
import { Booking } from "../entities/booking-entity";
import { MeetingRoom } from "../entities/meeting_room-entity";
//import { User } from "../entities/user-entity";
import { BookMeetRoomValidations } from "../Validator/bookroom-valication";
import json from "koa-json";
const moment = require("moment");
import { calendar_v3, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Not } from "typeorm";
import { AccessValidation } from "../Validator/access-validation";
import { UserLogin } from "../entities/userlogin-entity";
import { MeetRoomDto } from "../dtos/request/admin-meetroom-dto";
import { AuthenticateMiddleware } from "../Middleware/Authentication";
import { AuthServices } from "./auth-services";
import { RedisCache } from "../connection/redis-connection";
import { RedisSessionExpires } from "../enum/redis-expire-session";
import nodemailer from "nodemailer";
const apiKey = process.env.GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = `${process.env.URL}/google/callback`;
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const calendar = google.calendar("v3"); // Create an instance of the Calendar service
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  CALLBACK_URL
);

export class BookingServices {
  public static async bookMeetRoom(
    bookingDetails: BookingRoomDto,
    ctx: Context
  ) {
    const userid = ctx.state.me.id;
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

      await this.isMeetRoomExists(meetRoomId);
      const result = await this.roomAvailability(
        meetRoomId,
        date,
        startTime,
        endTime
      );
      if (result) {
        const bookRoomData = {
          ...bookingDetails,

          userId: userid,
        };
        const data = Booking.BookingRoomObj(bookRoomData);
        console.log(data, "data");
        const response = await Booking.create(data).save();
        console.log(response);
        const responseObj = BookingResponseObj.convertBookingToObj(response);
        // send calender notification
        const result = await calendarnotification(data, ctx);
        const eventId = result.response?.id; // Event ID
        const bid = responseObj.id;

        if (eventId) {
          await Booking.update(
            { id: bid }, // Condition to find the user
            {
              eventid: eventId,
            }
          );
        }

        if (result.success) {
          console.log("notification done");
          return responseObj;
        } else {
          console.log("event fail");
        }
        //return responseObj;
      }
    } catch (err: any) {
      throw err;
    }
  }

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

  public static async doDeleteBooking(bookingId: number, ctx: Context) {
    try {
      const booking: any = await Booking.findOneBy({ id: bookingId });
      console.log(booking, "booking");
      const eventiiid = booking._eventid;
      const redisvalue = await AuthenticateMiddleware.getrediseventid(
        bookingId
      );
      console.log(eventiiid, "eventiid");
      const eventid = JSON.parse(redisvalue);

      // Retrieve the booking data from your database
      const bookingData = await Booking.findOneBy({ id: bookingId });

      if (bookingData) {
        // Delete the event from Google Calendar using the event ID
        const success = await deleteCalendarEvent(eventiiid, ctx);

        // If the event is successfully deleted from Google Calendar, delete it from your database
        if (success) {
          await Booking.delete(bookingId);
          //
          const Email = ctx.state.me.email;
          console.log(Email, "email");
          const accesstoken = ctx.state.me.authtoken;
          console.log(Email, "email");
          const guestsArray = bookingData.guests;
          // Send booking confirmation email
          if (guestsArray.length != 0) {
            const emailSent = await sendEmaildelete(
              bookingData,
              accesstoken,
              Email
            );
          }
          //
          return BookingResponseObj.convertBookingToObj(bookingData);
        }
      }

      // If the booking or event doesn't exist, throw an error
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
    const booking = await UserLogin.delete({ id: bookid });
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
      console.log(err);
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
      throw err;
    }
  }
  public static async addExtraDetails(toUpdateArray: any) {
    const updatedArray = await Promise.all(
      toUpdateArray.map(async (obj: any) => {
        const newObj = { ...obj };

        const userNamedata = await UserLogin.findOneBy({ id: obj.userId });
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
    const bookingResponse = bookings.map((booking: any) => {
      // Get the guests array from the booking object
      const guestsArray = booking.guests;

      // Calculate the number of attendees for this booking
      const totalAttendees = guestsArray.length;

      // Create a new object with the booking details and the total number of attendees
      return {
        ...booking,
        totalAttendees: totalAttendees,
      };
    });

    return bookingResponse;
  }

  public static async doEditBookings(
    bookingId: number,
    bookingDetails: BookingRoomDto,
    ctx: Context
  ) {
    const accesstoken = ctx.state.me.authtoken;
    const email = ctx.state.me.email;
    try {
      const redisvalue = await AuthenticateMiddleware.getrediseventid(
        bookingId
      );

      const eventid = JSON.parse(redisvalue);

      const bookings: any = await Booking.findOneBy({ id: bookingId });

      const eventiiid = bookings._eventid;

      let booking: Booking | null = await Booking.findOneBy({ id: bookingId });

      //

      const current_time = AccessValidation.getCurrentTime();

      if (!booking) {
        throw { status: 404, message: "Booking with this ID not found" };
      }
      const data = BookingResponseObj.convertBookingToObj(booking);
      //

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

      if (result) {
        const result = Booking.BookingRoomObj(editedBookingData);
        await Booking.update(bookingId, result);

        const bookingData: any = await Booking.findOneBy({ id: bookingId });

        const editedData = BookingResponseObj.convertBookingToObj(bookingData);
        await sendEmaileguest(booking, accesstoken, email, bookingData);
        const editevent = await updateCalendarEventWithAttendees(
          eventiiid,
          editedData,
          ctx
        );
        const room_name = await this.MeetRoomName(bookingDetails.meetRoomId);
        console.log(editedData.meetRoomId, "meetid");
        return { ...editedData, roomname: room_name };
        // return editedData;
      }
    } catch (err: any) {
      throw err;
    }
  }
  public static async MeetRoomName(MeetRoomId: number) {
    try {
      console.log("roomfunction");
      const Roomdetail: any = await MeetingRoom.findOneBy({ id: MeetRoomId });
      //const RoomName = Roomdetail.room_name;
      //console.log("roomname", RoomName);

      if (!Roomdetail) {
        throw { status: 404, message: "Meeting Room Does not Exists" };
      }
      return Roomdetail.room_name;
    } catch (err: any) {
      throw err;
    }
  }
}

//create calender notification

async function calendarnotification(requestData: any, ctx: Context) {
  const token = ctx.state.me.authtoken;

  oAuth2Client.setCredentials({
    access_token: token,
  });

  oAuth2Client.credentials.access_token = token;

  const GuestsEmail = requestData.guests.map((guest: { guests: any }) => ({
    email: guest.guests,
  }));

  console.log(requestData.start_time, requestData.date, "time date");
  const eventStartTime = convertToISODate(
    requestData.date,
    requestData.start_time
  );
  console.log(eventStartTime, "starttime");
  const eventEndTime = convertToISODate(requestData.date, requestData.end_time);

  const meetroom = await MeetingRoom.findOneBy({ id: requestData.meetroom_id });

  const roomName = meetroom?.room_name;
  console.log(roomName, "roomname");

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      auth: oAuth2Client,
      conferenceDataVersion: 1,
      key: apiKey,
      requestBody: {
        summary: requestData.title,

        description: `meetroomname:${roomName} meetdescription:${requestData.description}`,

        start: {
          dateTime: eventStartTime,
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: eventEndTime,
          timeZone: "Asia/Kolkata",
        },
        attendees: GuestsEmail,
        conferenceData: {
          createRequest: {
            requestId: "kajal",
          },
        },
      },
    });
    // Construct the Google Meet link
    const googleMeetLink: any = response.data.hangoutLink;

    const calenderurl = response.data.htmlLink;

    const Email = ctx.state.me.email;

    // Send booking confirmation email
    if (GuestsEmail.length != 0) {
      if (calenderurl) {
        if (roomName) {
          const emailSent = await sendEmail(
            requestData,
            token,
            Email,
            calenderurl,
            roomName,
            googleMeetLink
          );
        }
      }
    }

    console.log("Event created:", response);
    return { success: true, response: response.data };
    console.log("Event created:", response.data);
  } catch (error) {
    console.error("Error creating event:", error);
    ctx.status = 500;
    return { success: false, error: error };
  }
}

//
function convertToISODate(dateString: string, timeString: string): string {
  console.log("conver");
  console.log(dateString);

  console.log(timeString);
  const dateParts = dateString.split("/");
  const year = parseInt(dateParts[2]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[0]);

  const timeParts = timeString.split(":");
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);

  const dateTime = new Date(year, month - 1, day, hour, minute);
  return dateTime.toISOString();
}

function redisCaching(value: any, key: number) {
  const redisObj = RedisCache.connect();
  redisObj.set(String(key), JSON.stringify(value)); // Convert key to string
}

// Function to delete a calendar event
async function deleteCalendarEvent(eventiid: string, ctx: Context) {
  try {
    const accessToken = ctx.state.me.authtoken;

    oAuth2Client.setCredentials({
      access_token: accessToken,
    });

    oAuth2Client.credentials.access_token = accessToken;

    const jsonString = JSON.stringify(eventiid);

    const eventid = JSON.parse(jsonString);

    const response = await calendar.events.delete({
      calendarId: "primary",
      eventId: eventid,
      auth: oAuth2Client,
      key: apiKey,
    });

    console.log("Event deleted from Google Calendar:", eventid);
    return true; // Event deleted successfully
  } catch (error) {
    console.error("Error:", error);
    // Handle the error as needed in your application
    return false; // Event deletion failed
  }
}
// edit calender event

async function updateCalendarEventWithAttendees(
  eventid: string,
  editedData: any,
  ctx: Context
) {
  console.log(eventid), console.log(editedData);
  console.log(typeof eventid);
  const accessToken = ctx.state.me.authtoken;

  oAuth2Client.setCredentials({
    access_token: accessToken,
  });

  oAuth2Client.credentials.access_token = accessToken;
  try {
    const event = await calendar.events.get({
      calendarId: "primary",
      eventId: eventid,
      auth: oAuth2Client,
      key: apiKey,
    });

    const dataemail = event.data.attendees || []; // Ensure attendees is an array

    // Convert the 'dataemail' array to 'existingAttendees' format
    const existingAttendees = dataemail
      .filter((attendee) => attendee.email)
      .map((attendee) => ({ email: attendee.email }));

    console.log(existingAttendees, "existing attendies");

    const startdatetime = convertToISODate(
      editedData.date,
      editedData.startTime
    );

    const enddatetime = convertToISODate(editedData.date, editedData.endTime);

    const newAttendees = editedData.guests.map((guest: { guests: any }) => ({
      email: guest.guests,
    }));
    console.log("new attendees", newAttendees);
    const meetroom = await MeetingRoom.findOneBy({
      id: editedData.meetRoomId,
    });

    const roomName = meetroom?.room_name;

    const updateevevent = {
      summary: editedData.title,
      conferenceDataVersion: 1,
      key: apiKey,
      description: `MeetroomName:${roomName} Description:${editedData.description}`,
      start: {
        dateTime: startdatetime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: enddatetime,
        timeZone: "Asia/Kolkata",
      },
      attendees: newAttendees, // Update attendees here
      // Add or modify any other event properties as needed
      conferenceData: {
        createRequest: {
          requestId: "kajal",
        },
      },
    };

    const response = await calendar.events.patch({
      calendarId: "primary",
      eventId: eventid,
      auth: oAuth2Client,
      requestBody: updateevevent,
    });
    const calenderurl = response.data.htmlLink;

    const Email = ctx.state.me.email;
    console.log(Email, "email");
    // Construct the Google Meet link
    const googleMeetLink: any = response.data.hangoutLink;

    // Send booking confirmation email
    if (newAttendees.length != 0) {
      if (calenderurl) {
        if (roomName) {
          const emailSent = await sendEmailEdit(
            editedData,
            accessToken,
            Email,
            calenderurl,
            roomName,
            googleMeetLink
          );
        }
      }
    }
    console.log("update event");
    return true;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

//send mail for meeting set

async function sendEmail(
  bookingDetails: any,
  access_token: string,
  Email: string,
  calenderurl: string,
  meetroomname: string,
  googleMeetLink: string
) {
  try {
    oAuth2Client.setCredentials({
      access_token: access_token,
    });

    oAuth2Client.credentials.access_token = access_token;
    // Create a Nodemailer transporter with OAuth2 authentication
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or your email provider
      auth: {
        type: "OAuth2",
        user: Email, // Your email address
        clientId: process.env.GOOGLE_CLIENT_ID, // Use your client ID here
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Use your client secret here
        accessToken: access_token, // Access token passed as an argument
      },
    });

    const GuestsEmail = bookingDetails.guests.map((guest: { guests: any }) => ({
      email: guest.guests,
    }));

    const emailAddresses: string[] = GuestsEmail.map(
      (guest: { email: any }) => guest.email
    );

    // Compose the email
    const mailOptions = {
      from: Email, // Your email address
      to: emailAddresses, // Recipient's email addresses
      subject: `Meeting Invitation: ${bookingDetails.title}`,
      text: `You are invited to a meeting scheduled for ${bookingDetails.date} from ${bookingDetails.start_time} to ${bookingDetails.start_time}. \n Description: ${bookingDetails.description} \n  MeetRoomName:${meetroomname} \n CalenderUrl:${calenderurl} \n GoogleMeetLink:${googleMeetLink}`,
      // html: "<h1>Meeting set</h1>",
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
//send mail for delete event
async function sendEmaildelete(
  bookingDetails: any,
  access_token: string,
  Email: string
) {
  try {
    oAuth2Client.setCredentials({
      access_token: access_token,
    });

    oAuth2Client.credentials.access_token = access_token;
    // Create a Nodemailer transporter with OAuth2 authentication
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or your email provider
      auth: {
        type: "OAuth2",
        user: Email, // Your email address
        clientId: process.env.GOOGLE_CLIENT_ID, // Use your client ID here
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Use your client secret here
        accessToken: access_token, // Access token passed as an argument
      },
    });

    const GuestsEmail = bookingDetails.guests.map((guest: { guests: any }) => ({
      email: guest.guests,
    }));

    const emailAddresses: string[] = GuestsEmail.map(
      (guest: { email: any }) => guest.email
    );

    // Compose the email
    const mailOptions = {
      from: Email, // Your email address
      to: emailAddresses, // Recipient's email addresses
      subject: `Meeting Cancelled : ${bookingDetails.title}`,
      text: `Meeting is Cancelled ${bookingDetails.date} from ${bookingDetails.start_time} to ${bookingDetails.start_time}. Description: ${bookingDetails.description} `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

//send mail for edit meeting

async function sendEmailEdit(
  bookingDetails: any,
  access_token: string,
  Email: string,
  calenderurl: string,
  meetroomname: string,
  googlemeetlink: string
) {
  console.log(bookingDetails, "bookingDetails");
  try {
    oAuth2Client.setCredentials({
      access_token: access_token,
    });

    oAuth2Client.credentials.access_token = access_token;
    // Create a Nodemailer transporter with OAuth2 authentication
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or your email provider
      auth: {
        type: "OAuth2",
        user: Email, // Your email address
        clientId: process.env.GOOGLE_CLIENT_ID, // Use your client ID here
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Use your client secret here
        accessToken: access_token, // Access token passed as an argument
      },
    });

    const GuestsEmail = bookingDetails.guests.map((guest: { guests: any }) => ({
      email: guest.guests,
    }));

    const emailAddresses: string[] = GuestsEmail.map(
      (guest: { email: any }) => guest.email
    );

    // Compose the email
    const mailOptions = {
      from: Email, // Your email address
      to: emailAddresses, // Recipient's email addresses
      subject: `Meeting Invitation: ${bookingDetails.title}`,
      text: `Your  Meeting is Edited ${bookingDetails.date} from ${bookingDetails.startTime} to ${bookingDetails.endTime}.\n Description: ${bookingDetails.description} \n MeetRoomName:${meetroomname} \n CalenderUrl:${calenderurl} \nGoogleMeetLink:${googlemeetlink}`,
      // html: "<h1>Meeting set</h1>",
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

//
async function sendEmaileguest(
  bookingDetails: any,
  access_token: string,
  Email: string,
  editedBookingData: any
) {
  try {
    oAuth2Client.setCredentials({
      access_token: access_token,
    });

    oAuth2Client.credentials.access_token = access_token;
    // Create a Nodemailer transporter with OAuth2 authentication
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or your email provider
      auth: {
        type: "OAuth2",
        user: Email, // Your email address
        clientId: process.env.GOOGLE_CLIENT_ID, // Use your client ID here
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Use your client secret here
        accessToken: access_token, // Access token passed as an argument
      },
    });
    //old
    const GuestsEmail = bookingDetails.guests.map((guest: { guests: any }) => ({
      email: guest.guests,
    }));

    const emailAddresses: string[] = GuestsEmail.map(
      (guest: { email: any }) => guest.email
    );
    console.log(emailAddresses, "emailA");
    //new
    const GuestsEmail1 = editedBookingData.guests.map(
      (guest: { guests: any }) => ({
        email: guest.guests,
      })
    );

    const emailAddresses1: string[] = GuestsEmail1.map(
      (guest: { email: any }) => guest.email
    );
    console.log(emailAddresses1, "emailadressedit");
    const elementsOnlyInArray1 = emailAddresses.filter(
      (item) => !emailAddresses1.includes(item)
    );

    if (elementsOnlyInArray1.length != 0) {
      var sender = elementsOnlyInArray1;
    } else {
      var sender = ["random@gmail.com"];
    }
    // Compose the email
    const mailOptions = {
      from: Email, // Your email address
      to: sender, // Recipient's email addresses
      subject: `Meeting title: ${bookingDetails.title}`,
      text: `You Are No Longer a Guest For This Meeting`,
      // html: "<h1>Meeting set</h1>",
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
//
