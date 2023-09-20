import { Builder } from "builder-pattern";
import { MeetingRoom } from "../../entities/meeting_room-entity";

export class MeetRoomObject {
  id: number;
  meetRoomName: string;
  capacity: number;
  imageUrl: string;
  status: string;

  public static convertMeetRoomToObj(meetRoomObj: MeetingRoom): MeetRoomObject {
    const resp = Builder<MeetRoomObject>()
      .id(meetRoomObj.id)
      .meetRoomName(meetRoomObj.room_name)
      .capacity(meetRoomObj.capacity)
      .imageUrl(meetRoomObj.image_url)
      .status(meetRoomObj.status)


      return resp.build();
  }
}