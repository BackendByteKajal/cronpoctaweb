import { Context } from "koa";
import {
  MeetRoomDto,
  MeetRoomDtobody,
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

export class AdminController {
  /*public static async AddMeetRoom(ctx: Context) {
    try {
        const data = ctx.request.body as MeetRoomDto;
        const result = await AdminServices.addMeetRoom(data);
        ctx.body = Utils.successResponse(Message.MeetRoomAdded,result);

    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status,err.message)
    }
  }*/

  public static async AddMeetRoom(ctx: Context) {
    try {
      console.log("ControlTower")
      const { meetRoomName, capacity} = ctx.request
        .body as MeetRoomDtobody;

      const obj = {
        meetRoomName: meetRoomName,
        capacity: capacity
      };
      console.log(obj)
      const file = ctx.request.files;
      console.log(file,"file")
      if (!ctx.request.files || !ctx.request.files.imageurl){
        var imgurl='https://res.cloudinary.com/dveklqhi8/image/upload/v1689296425/mfkumpec447heqclkps7.jpg'

      }
      else{
        const file = ctx.request.files;
      const form = JSON.stringify(file);
      const data = JSON.parse(form);
      const imgpath = data.imageurl.filepath;

       console.log(imgpath);
      var imgurl = await AdminServices.upload(data, imgpath); //upload call
      console.log(imgurl, "imgurl...........");
      }
      
      
    
      const meetingRoomData = Mapper.meetingMapper(obj, imgurl); //mapper
          console.log("mapper",meetingRoomData)
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

 /* public static async editMeetRoom(ctx: Context) {
    try {
      const param = ctx.params.id;
      const dataToEdit = ctx.request.body as MeetRoomDto;
      const result = await AdminServices.doEditMeetRoom(
        Number(param),
        dataToEdit
      );

      ctx.body = Utils.successResponse("Meeting Data Updated", result);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }
*/
public static async editMeetRoom(ctx: Context) {
  try {
    const param = ctx.params.id;
    const dataToEdit = ctx.request.body as MeetRoomDto;
    const result = await AdminServices.doEditMeetRoom(
      Number(param),
      dataToEdit
    );

    ctx.body = Utils.successResponse("Meeting Data Updated", result);
  } catch (err: any) {
    const status = err.status || 400;
    ctx.status = status;
    ctx.body = Utils.errorResponse(status, err.message);
  }
}






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

}
