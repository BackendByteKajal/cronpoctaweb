import { string } from "joi";

export class RegisterUserDto {
  userName: string;
  lastName: string;
  employeeId: string;
  email: string;
  password: string;
  isVerified: boolean
}
export class RegisterLoginUserDto {
  userName: string;
  lastName: string;
   authtoken:string;
  email: string;
  password: string;
  isVerified: boolean;
  eventId:string;
  
}