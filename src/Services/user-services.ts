import { Context } from "koa";
import { RegisterUserDto } from "../dtos/request/user-register-dto";
import { UpdateUserDto } from "../dtos/request/user-update-dto";
import { UserObject } from "../dtos/response/user-object-dto";
import { User } from "../entities/user-entity";
import { UserVerification } from "../Middleware/User-Verification";
const bcrypt = require("bcrypt");

export class UserServices {
  public static async Register(userData: RegisterUserDto): Promise<any> {
    try {
      await this.isUserExists(userData.email);
      const saltRounds = 10;
      let { password } = userData;
      const hash = await bcrypt.hash(password, saltRounds);
      // console.log("hashed_pass",hash);
      const saveUser: User = User.fromRegisterObj(userData, hash);
      const user: User = await User.create(saveUser).save();
      const userDetails:any = await User.findOneBy({email:userData.email})
      UserVerification.verifyUser(userDetails.email,userDetails.id)
      return user;
    } catch (err: any) {
      throw err;
    }
  }

  public static async getAllUsers() {
    try {
      const users = await User.find();
      if(users.length == 0){
        throw { status: 404, message:"No users found"}
      }
      return users;
    } catch (err: any) {
      throw err;
    }
  }

  public static async getAllGuests() {
    try {
      const users = await User.find();
      if(users.length == 0){
        throw { status: 404, message:"No users found"}
      }
      return users;
    } catch (err: any) {
      throw err;
    }
  }





  public static async isUserExists(email: string): Promise<boolean> {
    try {
      const user: User | null = await User.findOne({ where: { email: email } });
      if (user) {
        throw {status: 409, message:"User Already Exists"}
      }
      return false;
    } catch (err: any) {
      throw err;
    }
  }

  public static async verifyUser(userVerifyId:number){
    try{
      let user:any = await User.findOneBy({id:userVerifyId});
      console.log(user);
      if(!user){
        throw {status:404, message:"User Does Not Found"}
      }
      if(user.is_verified == true){
        throw { status:400, message:"User verified already"}
      }
      const userDetails = UserObject.convertToObj(user);
      console.log(userDetails);
      const data:any = {
        ...userDetails,
        isVerified:true,
      }
      const result = User.fromRegisterObj(data,user.password);
      await User.update(userVerifyId,result);
      return;
    }catch(err:any){
      throw err;
    }
  }
}
