import { MeetRoomDto } from "../dtos/request/admin-meetroom-dto";
import { MeetingRoom } from "../entities/meeting_room-entity";

export class AdminServices {
  public static async addMeetRoom(data: MeetRoomDto): Promise<MeetingRoom> {
    try {
      const roomData = MeetingRoom.fromAdminMeetRoom(data);
      const result = await MeetingRoom.create(roomData).save();
      return result;
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
        throw new Error("No results Found");
    }catch(err:any){
        throw err;
    }
  }
}
