import koaBody from "koa-body";
import { MeetRoomDto } from "../dtos/request/admin-meetroom-dto";
import { BookingResponseObj } from "../dtos/response/booking-response-dto";
import { MeetRoomObject } from "../dtos/response/meetroom-dto";
import { Booking } from "../entities/booking-entity";
import { MeetingRoom } from "../entities/meeting_room-entity";
import { BookingServices } from "./booking-services";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import app from "../app";
import cloudinary from "cloudinary";
import { CostExplorer } from "aws-sdk";
import dotenv from "dotenv";
import moment from "moment";
dotenv.config({ path: ".env" });

export class AdminServices {
  public static async addMeetRoom(data: any) {
    try {
     
      const result = await MeetingRoom.create(data).save();
      
      const response = MeetRoomObject.convertMeetRoomToObj(result);
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  public static async allMeetingRooms() {
    try {
      const meetRooms = await MeetingRoom.find();
      if (meetRooms) {
        return meetRooms;
      }
      throw { status: 404, message: "No results Found" };
    } catch (err: any) {
      throw err;
    }
  }

 
  // Edit Meeting Room
  public static async doEditRoom(meetRoomId: number, roomDetails: MeetingRoom) {
    try {
      
      const meetRoom: any = await MeetingRoom.findOneBy({ id: meetRoomId });
      
      if (!meetRoom) {
        throw { status: 404, message: "Meeting Room Does not Exists" };
      }
      const meetRoomObj = MeetRoomObject.convertMeetRoomToObj(roomDetails);
      const editedMeetingData = {
        ...meetRoomObj,
        ...roomDetails,
      };
      const data = MeetingRoom.fromAdminMeetRoom(editedMeetingData);
      
      await MeetingRoom.update(meetRoomId, data);
      const response: any = await MeetingRoom.findOneBy({ id: meetRoomId });
      
      if (response.status == "InActive") {
        
        await Booking.update(
          { meetroom_id: meetRoomId }, // Condition to find the user
          {
            status: "InActive",
          }
        );
      } else {
        
        await Booking.update(
          { meetroom_id: meetRoomId }, // Condition to find the user
          {
            status: "Active",
          }
        );
      }

      return response;
    } catch (err: any) {
      throw err;
    }
  }
  //meeting room history
  public static async getMeetRoomHistory(meetRoomId: number) {
    try {
      
      const meetRoomHistory = await Booking.findBy({ meetroom_id: meetRoomId });

      if (meetRoomHistory.length == 0) {
        throw { status: 404, message: "No history found" };
      }

      // Sort the data in ascending order by date and start time
      const sortdata = meetRoomHistory.sort((a, b) => {
        const dateA = moment(a.date, "DD/MM/YYYY").valueOf();
        const dateB = moment(b.date, "DD/MM/YYYY").valueOf();
        const startTimeA = moment(a.start_time, "HH:mm").valueOf();
        const startTimeB = moment(b.start_time, "HH:mm").valueOf();

        if (dateA === dateB) {
          return startTimeA - startTimeB; // Compare start times in ascending order
        } else {
          return dateA - dateB; // Compare dates in ascending order
        }
      });
      const historyDetails = sortdata.map((data) => {
        return BookingResponseObj.convertBookingToObj(data);
      });
      const meetRoomDetail = await BookingServices.addExtraDetails(
        historyDetails
      );

      const meetRoomDataduration = BookingServices.addDuration(meetRoomDetail);
      const meetRoomData =
        BookingServices.addToatalAttendies(meetRoomDataduration);

      return meetRoomData;
    } catch (err: any) {
      throw err;
    }
  }
  //upload image
  public static async upload(data: string, imgpath: string) {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
      secure: true,
    });

    if (data) {
      try {
        const uploadResult = await cloudinary.v2.uploader.upload(imgpath);

        const imageUrl = uploadResult.secure_url;

        return imageUrl;
      } catch (err) {
        console.log(err, "error");
        throw err;
      }
    } else {
      throw new Error("No file Provider!");
    }
  }
  //delete room
  public static async doDeleteBooking(roomId: number) {
    try {
      const roomData = await MeetingRoom.findOneBy({ id: roomId });
      if (roomData) {
        await MeetingRoom.delete(roomId);
        
        await Booking.update(
          { meetroom_id: roomId }, // Condition to find the user
          {
            status: "Inactive",
          }
        );

        return MeetRoomObject.convertMeetRoomToObj(roomData);
      }
      throw { status: 404, message: "Room with this ID not found" };
    } catch (err: any) {
      throw err;
    }
  }
  //fetch room with id
  public static async fetchRoomWithId(roomId: number) {
    try {
      const roomData = await MeetingRoom.findOneBy({ id: roomId });
      if (roomData) {
        return MeetRoomObject.convertMeetRoomToObj(roomData);
      }
      throw { status: 404, message: "Room with this ID not found" };
    } catch (err: any) {
      throw err;
    }
  }
}
