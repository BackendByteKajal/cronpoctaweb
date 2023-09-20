import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Builder } from "builder-pattern";
import { RegisterUserDto } from "../dtos/request/user-register-dto";
import { MeetRoomDto } from "../dtos/request/admin-meetroom-dto";

@Entity()
export class MeetingRoom extends BaseEntity {
  private _id: number;
  private _room_name: string;
  private _capacity: number;
  private _image_url: string;
  private _status: string;

  @PrimaryGeneratedColumn()
  public get id(): number {
    return this._id;
  }
  public set id(id: number) {
    this._id = id;
  }

  @Column({ nullable: true })
  public get room_name(): string {
    return this._room_name;
  }
  public set room_name(room_name: string) {
    this._room_name = room_name;
  }

  @Column({ nullable: true })
  public get capacity(): number {
    return this._capacity;
  }
  public set capacity(capacity: number) {
    this._capacity = capacity;
  }

  @Column({ nullable: true })
  public get image_url(): string {
    return this._image_url;
  }
  public set image_url(image_url: string) {
    this._image_url = image_url;
  }

  @Column({ default: "Active" })
  public get status(): string {
    return this._status;
  }
  public set status(status: string) {
    this._status = status;
  }

  @CreateDateColumn()
  created_at: Date; // Creation date

  @UpdateDateColumn()
  updated_at: Date; // Last updated date

  @DeleteDateColumn()
  deleted_at: Date; // Deletion date

  /*public static fromAdminMeetRoom(MeetRoomObj: MeetRoomDto): MeetingRoom {
    const obj = Builder<MeetingRoom>()
      .room_name(MeetRoomObj.meetRoomName)
      .capacity(MeetRoomObj.capacity)
      .image_url(MeetRoomObj.imageUrl)
      .status(MeetRoomObj.status) 
      .build();

    return obj;
  }*/
  public static fromAdminMeetRoom(MeetRoomObj: MeetRoomDto): MeetingRoom {
    const obj = Builder<MeetingRoom>()
      .room_name(MeetRoomObj.meetRoomName)
      .capacity(MeetRoomObj.capacity)
      .image_url(MeetRoomObj.imageUrl)
      .status(MeetRoomObj.status)
      .build();

    return obj;
  }
}
