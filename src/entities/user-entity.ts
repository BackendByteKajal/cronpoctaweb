import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Builder } from "builder-pattern";
import { RegisterUserDto } from "../dtos/request/user-register-dto";

@Entity()
export class User extends BaseEntity{

  private _id: number;
  private _userName: string;
  private _last_name: string;
  private _employee_id: string;
  private _email: string;
  private _password: string;
  

  @PrimaryGeneratedColumn()
  public get id(): number {
    return this._id;
  }
  public set id(id: number) {
    this._id = id;
  }

  @Column()
  public get userName(): string {
    return this._userName;
  }
  public set userName(userName: string) {
    this._userName = userName;
  }

  @Column({nullable:true})
  public get last_name(): string {
    return this._last_name;
  }
  public set last_name(last_name: string) {
    this._last_name = last_name;
  }

  @Column()
  public get employee_id(): string {
    return this._employee_id;
  }
  public set employee_id(employee_id: string) {
    this._employee_id = employee_id;
  }

  @Column()
  public get email(): string {
    return this._email;
  }
  public set email(email: string) {
    this._email = email;
  }
  @Column({nullable:true})
  public get password(): string {
    return this._password;
  }
  public set password(password: string) {
    this._password = password;
  }

  @CreateDateColumn()
  created_at: Date; // Creation date

  @UpdateDateColumn()
  updated_at: Date; // Last updated date

  @DeleteDateColumn()
  deleted_at: Date; // Deletion date

  public static fromRegisterObj(registerObj: RegisterUserDto): User {
    const obj = Builder<User>()
      .email(registerObj.email)
      .userName(registerObj.userName)
      .last_name(registerObj.lastName)
      .employee_id(registerObj.employeeId)
      .password(registerObj.password)
      .build();

    return obj;
  }
  // @PrimaryGeneratedColumn()
  // id: number;

  // @Column()
  // name: string;

  // @Column()
  // email: string;

  // @Column()
  // password: number;

  // @Column({default:true})
  // is_active: boolean

  // @Column({nullable:true})
  // phoneNumber: string
}
