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
import { RegisterLoginUserDto, RegisterUserDto } from "../dtos/request/user-register-dto";

@Entity()
export class UserLogin extends BaseEntity {
  private _id: number;
  private _user_name: string;
  private _last_name: string;

  private _email: string;

  private _is_verified: boolean;

  private _accesstoken: string;
  private _googleid: string;
  private _authtoken: string;

  @PrimaryGeneratedColumn()
  public get id(): number {
    return this._id;
  }
  public set id(id: number) {
    this._id = id;
  }

  @Column({ nullable: true })
  public get user_name(): string {
    return this._user_name;
  }
  public set user_name(user_name: string) {
    this._user_name = user_name;
  }

  @Column({ nullable: true })
  public get last_name(): string {
    return this._last_name;
  }
  public set last_name(last_name: string) {
    this._last_name = last_name;
  }

  @Column()
  public get email(): string {
    return this._email;
  }
  public set email(email: string) {
    this._email = email;
  }

  @Column({ nullable: true, default: false })
  public get is_verified(): boolean {
    return this._is_verified;
  }
  public set is_verified(is_verified: boolean) {
    this._is_verified = is_verified;
  }

  // @Column({ nullable: true })
  // public get googleid(): string {
  //   return this._googleid;
  // }
  // public set googleid(googleid: string) {
  //   this._googleid = googleid;
  // }
  @Column({ nullable: true })
  public get authtoken(): string {
    return this._authtoken;
  }
  public set authtoken(authtoken: string) {
    this._authtoken = authtoken;
  }

  @CreateDateColumn()
  created_at: Date; // Creation date

  @UpdateDateColumn()
  updated_at: Date; // Last updated date

  @DeleteDateColumn()
  deleted_at: Date; // Deletion date

  public static fromRegisterObj(registerObj: RegisterLoginUserDto): UserLogin {
    const obj = Builder<UserLogin>()
      .email(registerObj.email)
      .user_name(registerObj.userName)
      .last_name(registerObj.lastName)
      .is_verified(true)
      .authtoken(registerObj.authtoken)
      
      .build();

    return obj;
  }
}
