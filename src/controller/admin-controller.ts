import { Context } from "koa";
import { MeetRoomDto } from "../dtos/request/admin-meetroom-dto";
import { AdminServices } from "../Services/admin-services";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import { MeetingRoom } from "../entities/meeting_room-entity";
import { MeetRoomObject } from "../dtos/response/meetroom-dto";

export class AdminController {
  public static async AddMeetRoom(ctx: Context) {
    try {
        const data = ctx.request.body as MeetRoomDto;
        const result = await AdminServices.addMeetRoom(data);
        ctx.body = Utils.successResponse(Message.MeetRoomAdded,result);

    } catch (err: any) {
      throw err;
    }
  }

  public static async getAllMeetRooms(ctx:Context){
        try{
            const data = await AdminServices.allMeetingRooms();

            const response = data.map((ele)=>{
                return MeetRoomObject.convertMeetRoomToObj(ele);
            })

            ctx.body = Utils.successResponse(Message.AllMeetingRooms,response);
        }catch(err){
            throw err;
        }
  }
}


