import { Context } from "koa";
import {
  MeetRoomDto,
  MeetRoomDtobody,
  MeetingRoomDtobody,
} from "../dtos/request/admin-meetroom-dto";
import { AdminServices } from "../Services/admin-services";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import { MeetingRoom } from "../entities/meeting_room-entity";
import { MeetRoomObject } from "../dtos/response/meetroom-dto";
import app from "../app";
import cloudinary from "cloudinary";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaBody from "koa-body";
import { error } from "console";
import formidable from "formidable";
import fs from "fs";
import { Mapper } from "../Mapper/mapper";
import { ControlTower } from "aws-sdk";
import dotenv from "dotenv";

export class AdminController {
 

  public static async AddMeetRoom(ctx: Context) {
    try {
      const { meetRoomName, capacity } = ctx.request.body as MeetRoomDtobody;

      const obj = {
        meetRoomName: meetRoomName,
        capacity: capacity,
      };
      
        const file = ctx.request.files;
        const form = JSON.stringify(file);
        const data = JSON.parse(form);
        const imgpath = data.imageurl.filepath;
        var imgurl = await AdminServices.upload(data, imgpath); //upload call
        const meetingRoomData = Mapper.meetingMapper(obj, imgurl); //mapper
        const result = await AdminServices.addMeetRoom(meetingRoomData);
        ctx.body = Utils.successResponse(Message.MeetRoomAdded, result);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err);
    }
  }

  public static async getAllMeetRooms(ctx: Context) {
    try {
      const data = await AdminServices.allMeetingRooms();

      const response = data.map((ele) => {
        return MeetRoomObject.convertMeetRoomToObj(ele);
      });

      ctx.body = Utils.successResponse(Message.AllMeetingRooms, response);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;

      ctx.body = Utils.errorResponse(status, err.message);
    }
  }

 

  
//Edit Room
  public static async editRoom(ctx: Context) {
    try {
      const param = ctx.params.id;
      const roomData = await MeetingRoom.findOneBy({ id: param });
      
      if (!roomData) {
        throw { status: 404, message: "Meeting Room Does not Exists" };
      }

      const image = roomData?.image_url as string;
      const { meetRoomName, capacity, status } = ctx.request.body as MeetingRoomDtobody;

      const obj = {
        meetRoomName: meetRoomName,
        capacity: capacity,
        status:status
      };
    
      const file = ctx.request.files;
      if (!file) {
        throw new Error("pass image..");
      }
      
      //upload call
      if (!ctx.request.files?.imageurl) {
        var imgurl = image;
      } else {
        
        const file = ctx.request.files;
        const form = JSON.stringify(file);
        const data = JSON.parse(form);
        const imgpath = data.imageurl.filepath;
       var imgurl = await AdminServices.upload(data, imgpath); //upload call
        
      }
    

      const meetingRoomData = Mapper.meetingMapper(obj, imgurl); //mapper
      const result = await AdminServices.doEditRoom(
        Number(param),
        meetingRoomData
      );
      ctx.body = Utils.successResponse("Meeting Data Updated", result);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err);
    }
  }
  //meetroom history
  public static async meetRoomHistory(ctx: Context) {
    try {
      const meetRoomId = ctx.params.id;
      const meetRoomHistory = await AdminServices.getMeetRoomHistory(
        meetRoomId
      );

      ctx.body = Utils.successResponse(
        Message.MeetingRoomHistory,
        meetRoomHistory
      );
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }
  //delete room
  public static async deleteRoom(ctx: Context) {
    try {
      const id = ctx.params.id;
      const deletedDataResponse = await AdminServices.doDeleteBooking(
        Number(id)
      );

      ctx.body = Utils.successResponse(
        Message.DeletedRoom,
        deletedDataResponse
      );
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }
  //fetch room with id

  public static async fetchRoomById(ctx: Context) {
    try {
      
      const id = ctx.params.id;
      const Response = await AdminServices.fetchRoomWithId(Number(id));
     ctx.body = Utils.successResponse(Message.FetchRoom, Response);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }
 
}
