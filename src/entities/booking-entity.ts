import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Builder } from "builder-pattern";
import { RegisterUserDto } from "../dtos/request/user-register-dto";
import { BookingRoomDto } from "../dtos/request/booking-dto";

@Entity()
export class Booking extends BaseEntity{

  private _id: number;
  private _user_id: number;
  private _meetroom_id: number;
  private _title: string;
  private _date: string;
  private _start_time: string;
  private _end_time: string;
  private _status: string;
  private _guests: string;
  private _description: string;

  @PrimaryGeneratedColumn()
  public get id(): number {
    return this._id;
  }
  public set id(id: number) {
    this._id = id;
  }

  @Column()
  public get user_id(): number {
    return this._user_id;
  }
  public set user_id(user_id: number) {
    this._user_id = user_id;
  }

  @Column()
  public get meetroom_id(): number {
    return this._meetroom_id;
  }
  public set meetroom_id(meetroom_id: number) {
    this._meetroom_id = meetroom_id;
  }

  @Column()
  public get title(): string {
    return this._title;
  }
  public set title(title: string) {
    this._title = title;
  }

  @Column()
  public get date(): string {
    return this._date;
  }
  public set date(date: string) {
    this._date = date;
  }

  @Column()
  public get start_time(): string {
    return this._start_time;
  }
  public set start_time(start_time: string) {
    this._start_time = start_time;
  }

  @Column()
  public get end_time(): string {
    return this._end_time;
  }
  public set end_time(end_time: string) {
    this._end_time = end_time;
  }

  @Column({default: "Inactive"})
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

  public static BookingRoomObj(bookingObj: BookingRoomDto): Booking {
    const obj = Builder<Booking>()
      .user_id(bookingObj.userId)
      .meetroom_id(bookingObj.meetRoomId)
      .title(bookingObj.title)
      .date(bookingObj.date)
      .start_time(bookingObj.startTime)
      .end_time(bookingObj.endTime)
      .status(bookingObj.status)
      .build();

    return obj;
  }
}
