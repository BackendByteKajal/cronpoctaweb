import { MeetRoomDto } from "../dtos/request/admin-meetroom-dto";
import { BookingResponseObj } from "../dtos/response/booking-response-dto";
import { MeetRoomObject } from "../dtos/response/meetroom-dto";
import { Booking } from "../entities/booking-entity";
import { MeetingRoom } from "../entities/meeting_room-entity";
import { BookingServices } from "./booking-services";

export class AdminServices {
  public static async addMeetRoom(data: MeetRoomDto){
    try {
      const roomData = MeetingRoom.fromAdminMeetRoom(data);
      const result = await MeetingRoom.create(roomData).save();
      const response = MeetRoomObject.convertMeetRoomToObj(result);
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  public static async allMeetingRooms(){
    try{
        const meetRooms = await MeetingRoom.find();
        if(meetRooms){
          return meetRooms;
        }
        throw { status: 404, message: "No results Found"}
    }catch(err:any){
        throw err;
    }
  }

  public static async doEditMeetRoom(meetRoomId:number,roomDetails:MeetRoomDto){
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

  public static async getMeetRoomHistory(meetRoomId:number){
    try{
      const meetRoomHistory = await Booking.findBy({ meetroom_id:meetRoomId});

      if(meetRoomHistory.length==0){
        throw { status: 404, message: "No history found"}
      }
      const historyDetails = meetRoomHistory.map((data)=>{
        return BookingResponseObj.convertBookingToObj(data);
      })
      const meetRoomData = BookingServices.addDuration(historyDetails);
      return meetRoomData;
    }catch(err:any){
      throw err;
    }
  }
}
