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
dotenv.config({ path: ".env" });

export class AdminServices {
  /*public static async addMeetRoom(data: MeetRoomDto){
    try {
      const roomData = MeetingRoom.fromAdminMeetRoom(data);
      const result = await MeetingRoom.create(roomData).save();
      const response = MeetRoomObject.convertMeetRoomToObj(result);
      return response;
    } catch (err: any) {
      throw err;
    }
  }*/
  public static async addMeetRoom(data: any) {
    try {
      console.log("addmettservice");
      console.log(data);
      const result = await MeetingRoom.create(data).save();
      console.log("data");
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

  /* public static async doEditMeetRoom(meetRoomId:number,roomDetails:MeetRoomDto){
    try{
      const meetRoom:any = await MeetingRoom.findOneBy({id:meetRoomId});
      if(!meetRoom){
        throw { status: 404, message: "Meeting Room Does not Exists"}
      }
      const meetRoomObj = MeetRoomObject.convertMeetRoomToObj(meetRoom);
      const editedMeetingData = {
        ...meetRoomObj,
        ...roomDetails,
      };
      const data = MeetingRoom.fromAdminMeetRoom(editedMeetingData);
      await MeetingRoom.update(meetRoomId, data);
      const response:any = await MeetingRoom.findOneBy({id:meetRoomId});
      return MeetRoomObject.convertMeetRoomToObj(response);
    }catch(err:any){
      throw err;
    }
  }
  */

  public static async doEditMeetRoom(
    meetRoomId: number,
    roomDetails: MeetRoomDto
  ) {
    try {
      console.log("services......");
      const meetRoom: any = await MeetingRoom.findOneBy({ id: meetRoomId });
      console.log(meetRoom, ".....");
      if (!meetRoom) {
        throw { status: 404, message: "Meeting Room Does not Exists" };
      }
      const meetRoomObj = MeetRoomObject.convertMeetRoomToObj(meetRoom);
      const editedMeetingData = {
        ...meetRoomObj,
        ...roomDetails,
      };
      const data = MeetingRoom.fromAdminMeetRoom(editedMeetingData);
      await MeetingRoom.update(meetRoomId, data);
      //const response:any = await MeetingRoom.findOneBy({id:meetRoomId});
      return meetRoom;
    } catch (err: any) {
      throw err;
    }
  }

  //
  public static async doEditRoom(
    meetRoomId: number,
    roomDetails: MeetingRoom
  ) {
    try {
      console.log("services......");
      console.log(roomDetails,"roomdetail")
      const meetRoom: any = await MeetingRoom.findOneBy({ id: meetRoomId });
      console.log(meetRoom, ".....");
      if (!meetRoom) {
        throw { status: 404, message: "Meeting Room Does not Exists" };
      }
      const meetRoomObj = MeetRoomObject.convertMeetRoomToObj(roomDetails);
      const editedMeetingData = {
        ...meetRoomObj,
        ...roomDetails,
      };
      const data = MeetingRoom.fromAdminMeetRoom(editedMeetingData);
      console.log("data",data)
      await MeetingRoom.update(meetRoomId, data);
      const response:any = await MeetingRoom.findOneBy({id:meetRoomId});
      return response;
    } catch (err: any) {
      throw err;
    }
  }
  public static async getMeetRoomHistory(meetRoomId: number) {
    try {
         console.log("getmeethistory")
      const meetRoomHistory = await Booking.findBy({ meetroom_id: meetRoomId });

      if (meetRoomHistory.length == 0) {
        throw { status: 404, message: "No history found" };
      }
      const historyDetails = meetRoomHistory.map((data) => {
        return BookingResponseObj.convertBookingToObj(data);
      });
      const meetRoomDetail = await BookingServices.addExtraDetails(
        historyDetails
      );
      //const meetRoomData = BookingServices.addDuration(meetRoomDetail);
      //my change
      const meetRoomDataduration = BookingServices.addDuration(meetRoomDetail);
      const meetRoomData = BookingServices.addToatalAttendies(meetRoomDataduration);
      
      return meetRoomData;
    } catch (err: any) {
      throw err;
    }
  }

  public static async upload(data: string, imgpath: string) {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
      secure: true,
    });

    if (data) {
      try {
        console.log("file****");

        //const fileBuffer: any = fs.readFileSync(imgpath);
        console.log("file****");
        const uploadResult = await cloudinary.v2.uploader.upload(imgpath);

        const imageUrl = uploadResult.secure_url;
        console.log(imageUrl);

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

        return MeetRoomObject.convertMeetRoomToObj(roomData);
      }
      throw { status: 404, message: "Room with this ID not found" };
    } catch (err: any) {
      throw err;
    }
  }
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
