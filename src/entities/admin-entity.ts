import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Builder } from "builder-pattern";
import { RegisterUserDto } from "../dtos/request/user-register-dto";
import { MeetRoomDto } from "../dtos/request/admin-meetroom-dto";

@Entity()
export class Admin extends BaseEntity{

  private _id: number;
  private _email: string;
  private _password: string;
  private _role: string

  @PrimaryGeneratedColumn()
  public get id(): number {
    return this._id;
  }
  public set id(id: number) {
    this._id = id;
  }

  @Column()
  public get email(): string {
    return this._email;
  }
  public set email(email: string) {
    this._email = email;
  }

  @Column()
  public get password(): string {
    return this._password;
  }
  public set password(password: string) {
    this._password = password;
  }

  @Column()
  public get role(): string {
    return this._role;
  }
  public set role(role: string) {
    this._role = role;
  }

  @CreateDateColumn()
  created_at: Date; // Creation date

  @UpdateDateColumn()
  updated_at: Date; // Last updated date

  @DeleteDateColumn()
  deleted_at: Date; // Deletion date

//   public static fromAdminMeetRoom(MeetRoomObj: MeetRoomDto): MeetingRoom {
//     const obj = Builder<MeetingRoom>()
//       .room_name(MeetRoomObj.meetRoomName)
//       .capacity(MeetRoomObj.capacity)
//       .image_url(MeetRoomObj.imageUrl) 
//       .build();

//     return obj;
//   }

}
