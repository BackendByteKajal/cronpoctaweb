import { Context } from "koa";
import { BookingRoomDto } from "../dtos/request/booking-dto";
import { BookingResponseObj } from "../dtos/response/booking-response-dto";
import { Booking } from "../entities/booking-entity";
import { MeetingRoom } from "../entities/meeting_room-entity";

import { BookMeetRoomValidations } from "../Validator/bookroom-valication";
import json from "koa-json";
const moment = require("moment");
import { calendar_v3, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Not } from "typeorm";
import { AccessValidation } from "../Validator/access-validation";
import { User } from "../entities/user-entity";
import { MeetRoomDto } from "../dtos/request/admin-meetroom-dto";
import { AuthenticateMiddleware } from "../Middleware/Authentication";
import { AuthServices } from "./auth-services";
import { RedisCache } from "../connection/redis-connection";
import { RedisSessionExpires } from "../enum/redis-expire-session";
import nodemailer from "nodemailer";
const apiKey = process.env.GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = `${process.env.BACKEND_URL}/google/callback`;
//const CALLBACK_URL = "/google/callback";
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

        // send calender notification
        const result = await calendarnotification(data, ctx);

        if (result.success) {
          const eventId = result.response?.id; // Event ID

          const bookRoomdata = {
            ...bookRoomData,

            eventid: eventId,
          };
          const data = Booking.BookingRoomObj(bookRoomdata);
          const response = await Booking.create(data).save();

          const responseObj = BookingResponseObj.convertBookingToObj(response);

          console.log("notification done");
          return responseObj;
        }
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

      const eventiiid = booking._eventid;

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

          //Access Token
          const cachedData = await AuthenticateMiddleware.getredisData(Email);
          const accesstoken = JSON.parse(cachedData);

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

  //room aviailability for book room
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
      throw { status: 400, message: "Meeting Room is already occupied" };
    } catch (err: any) {
      console.log(err);
      throw err;
    }
  }

  //room availability for edit room
  public static async roomAvailabilityForEdit(
    MeetRoomId: number,
    date: string,
    startTime: string,
    endTime: string,
    booking_id: number
  ) {
    try {
      const booking_room_details = await Booking.find({
        where: {
          meetroom_id: MeetRoomId,
          id: Not(booking_id) as unknown as number, // Convert to number type
        },
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
      throw { status: 400, message: "Meeting Room is already occupied" };
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
    let eventid = "";

    const email = ctx.state.me.email;

    const cachedData = await AuthenticateMiddleware.getredisData(email);
    const accesstoken = JSON.parse(cachedData);
    try {
      const bookings: Booking | null = await Booking.findOneBy({
        id: bookingId,
      });
      if (bookings) {
        eventid = bookings._eventid;
      }

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
        //send email to remove guest
        await sendEmaileRemoveguest(booking, accesstoken, email, bookingData);
        //update calender event
        const editevent = await updateCalendarEventWithAttendees(
          eventid,
          editedData,
          ctx
        );
        const room_name = await this.MeetRoomName(bookingDetails.meetRoomId);

        return { ...editedData, roomname: room_name };
        // return editedData;
      }
    } catch (err: any) {
      throw err;
    }
  }
  public static async MeetRoomName(MeetRoomId: number) {
    try {
      const Roomdetail: MeetingRoom | null = await MeetingRoom.findOneBy({
        id: MeetRoomId,
      });

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

async function calendarnotification(requestData: Booking, ctx: Context) {
    //Aceess Token
  const Authemail = ctx.state.me.email;
  const cachedData = await AuthenticateMiddleware.getredisData(Authemail);
  const accesstoken = JSON.parse(cachedData);
  oAuth2Client.setCredentials({
    access_token: accesstoken,
  });

  oAuth2Client.credentials.access_token = accesstoken;
  const Guest: any = requestData.guests;

  const GuestsEmail = Guest.map((guest: { guests: string }) => ({
    email: guest.guests,
  }));

  const eventStartTime = convertToUTCISODate(
    requestData.date,
    requestData.start_time
  );

  const eventEndTime = convertToUTCISODate(requestData.date, requestData.end_time);

  const meetroom = await MeetingRoom.findOneBy({ id: requestData.meetroom_id });

  const roomName = meetroom?.room_name;

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
            accesstoken,
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
    throw {
      status: 404,
      message: "Booking Not Created",
    };
  }
}

// //conver to ISODate
// function convertToISODate(dateString: string, timeString: string): string {
//   const dateParts = dateString.split("/");
//   const year = parseInt(dateParts[2]);
//   const month = parseInt(dateParts[1]);
//   const day = parseInt(dateParts[0]);

//   const timeParts = timeString.split(":");
//   const hour = parseInt(timeParts[0]);
//   const minute = parseInt(timeParts[1]);

//   const dateTime = new Date(year, month - 1, day, hour, minute);
//   return dateTime.toISOString();
// }

function convertToUTCISODate(dateString: string, timeString: string): string {
  const dateParts = dateString.split("/");
  const year = parseInt(dateParts[2]);
  const month = parseInt(dateParts[1]) - 1; // Adjust for zero-based month
  const day = parseInt(dateParts[0]);

  const timeParts = timeString.split(":");
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);

  const dateTime = new Date(Date.UTC(year, month, day, hour, minute));
  return dateTime.toISOString();
}

// Function to delete a calendar event
async function deleteCalendarEvent(eventiid: string, ctx: Context) {
  try {
    //const accessToken = ctx.state.me.authtoken;
    const Authemail = ctx.state.me.email;
    const cachedData = await AuthenticateMiddleware.getredisData(Authemail);
    const accessToken = JSON.parse(cachedData);

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
  editedData: BookingResponseObj,
  ctx: Context
) {
  //const accessToken = ctx.state.me.authtoken;
  const Authemail = ctx.state.me.email;
  const cachedData = await AuthenticateMiddleware.getredisData(Authemail);
  const accessToken = JSON.parse(cachedData);

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

    const startdatetime = convertToUTCISODate(
      editedData.date,
      editedData.startTime
    );

    const enddatetime = convertToUTCISODate(editedData.date, editedData.endTime);

    const Guest: any = editedData.guests;
    const newAttendees = Guest.map((guest: { guests: string }) => ({
      email: guest.guests,
    }));

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
  bookingDetails: Booking,
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
    const emailarr: any = bookingDetails.guests;
    const GuestsEmail = emailarr.map((guest: { guests: string }) => ({
      email: guest.guests,
    }));

    const emailAddresses: string[] = GuestsEmail.map(
      (guest: { email: string }) => guest.email
    );

    // Compose the email
    const mailOptions = {
      from: Email, // Your email address
      to: emailAddresses, // Recipient's email addresses
      subject: `Meeting Invitation: ${bookingDetails.title}`,
      text: `You are invited to a meeting scheduled for ${bookingDetails.date} from ${bookingDetails.start_time} to ${bookingDetails.end_time}. \n Description: ${bookingDetails.description} \n  MeetRoomName:${meetroomname} \n CalenderUrl:${calenderurl} \n GoogleMeetLink:${googleMeetLink}`,
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
  bookingDetails: Booking,
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
    const emailarr: any = bookingDetails.guests;
    const GuestsEmail = emailarr.map((guest: { guests: string }) => ({
      email: guest.guests,
    }));

    const emailAddresses: string[] = GuestsEmail.map(
      (guest: { email: string }) => guest.email
    );

    // Compose the email
    const mailOptions = {
      from: Email, // Your email address
      to: emailAddresses, // Recipient's email addresses
      subject: `Meeting Cancelled : ${bookingDetails.title}`,
      text: `Meeting is Cancelled ${bookingDetails.date} from ${bookingDetails.start_time} to ${bookingDetails.end_time}. Description: ${bookingDetails.description} `,
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
  bookingDetails: BookingResponseObj,
  access_token: string,
  Email: string,
  calenderurl: string,
  meetroomname: string,
  googlemeetlink: string
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

    const emailarr: any = bookingDetails.guests;
    const GuestsEmail = emailarr.map((guest: { guests: string }) => ({
      email: guest.guests,
    }));

    const emailAddresses: string[] = GuestsEmail.map(
      (guest: { email: string }) => guest.email
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

//send email to remove guest
async function sendEmaileRemoveguest(
  bookingDetails: Booking,
  access_token: string,
  Email: string,
  editedBookingData: Booking
) {
  let sender;
  try {
    oAuth2Client.setCredentials({
      access_token: access_token,
    });

    oAuth2Client.credentials.access_token = access_token;

    //old guest array
    const guestoldarr: any = bookingDetails.guests;
    const GuestsEmail = guestoldarr.map((guest: { guests: string }) => ({
      email: guest.guests,
    }));
    const emailAddresses: string[] = GuestsEmail.map(
      (guest: { email: string }) => guest.email
    );

    //new Guest Array
    const guestnewarr: any = editedBookingData.guests;
    const GuestsEmail1 = guestnewarr.map((guest: { guests: string }) => ({
      email: guest.guests,
    }));
    const emailAddresses1: string[] = GuestsEmail1.map(
      (guest: { email: string }) => guest.email
    );

    //remove guest array
    const elementsOnlyInArray1 = emailAddresses.filter(
      (item) => !emailAddresses1.includes(item)
    );

    //send mail to remove guest
    if (elementsOnlyInArray1.length != 0) {
      sender = elementsOnlyInArray1;
    }
    if (sender) {
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
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
