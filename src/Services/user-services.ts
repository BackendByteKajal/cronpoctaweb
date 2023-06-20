import { Context } from "koa";
import { RegisterUserDto } from "../dtos/request/user-register-dto";
import { UpdateUserDto } from "../dtos/request/user-update-dto";
import { UserObject } from "../dtos/response/user-object-dto";
import { User } from "../entities/user-entity";
const bcrypt = require("bcrypt");

export class UserServices {
  public static async Register(userData: RegisterUserDto): Promise<any> {
    try {
      this.isUserExists(userData.email);
      const saltRounds = 10;
      let { password } = userData;
      const hash = await bcrypt.hash(password, saltRounds);
      // console.log("hashed_pass",hash);
      const saveUser: User = User.fromRegisterObj(userData, hash);
      const user: User = await User.create(saveUser).save();
      return user;
    } catch (err: any) {
      throw err;
    }
  }

  public static async getAllUsers() {
    try {
      const users = await User.find();

      return users;
    } catch (err: any) {
      throw err;
    }
  }

  public static async isUserExists(email: string): Promise<boolean> {
    try {
      const user: User | null = await User.findOne({ where: { email: email } });
      if (user) {
        throw new Error("User Already Exists");
      }
      return false;
    } catch (err: any) {
      throw err;
    }
  }
}
