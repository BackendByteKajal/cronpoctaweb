import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Builder } from "builder-pattern";
import { RegisterUserDto } from "../dtos/request/user-register-dto";

@Entity()
export class MeetingRoom extends BaseEntity{

  private _id: number;
  private _room_name: string;
  

  @PrimaryGeneratedColumn()
  public get id(): number {
    return this._id;
  }
  public set id(id: number) {
    this._id = id;
  }

  @Column()
  public get room_name(): string {
    return this._room_name;
  }
  public set room_name(room_name: string) {
    this._room_name = room_name;
  }

  @CreateDateColumn()
  created_at: Date; // Creation date

  @UpdateDateColumn()
  updated_at: Date; // Last updated date

  @DeleteDateColumn()
  deleted_at: Date; // Deletion date

}
