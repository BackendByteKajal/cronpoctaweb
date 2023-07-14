import { MeetingRoom } from "../entities/meeting_room-entity";

export class Mapper {
  public static meetingMapper(obj: any, imgurl: string) {
    const meetingRoom = new MeetingRoom();
    meetingRoom.room_name = obj.meetRoomName;
    meetingRoom.capacity = obj.capacity;
    meetingRoom.image_url = imgurl;
    return meetingRoom;
  }
}
