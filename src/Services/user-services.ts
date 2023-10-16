import { Context } from "koa";
import { RegisterUserDto } from "../dtos/request/user-register-dto";
//import { UpdateUserDto } from "../dtos/request/user-update-dto";
//import { UserObject } from "../dtos/response/user-object-dto";
//import { User } from "../entities/user-entity";

import { configData } from "../config/config";
import { RedisCache } from "../connection/redis-connection";
const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";
import { User } from "../entities/user-entity";

export class UserServices {
  //
  public static async Registeruser(userData: any) {
    const result = await this.isUserExistsUser(userData.email);
    const saveUser: User = User.fromRegisterObj(userData);
    if (result) {
      const user: User = await User.create(saveUser).save();
      return user;
    } else {
      
      const user: User | null = await User.findOne({
        where: { email: userData.email },
      });

      return user;
    }
  }

  //
  public static async getAllUsers() {
    try {
      const users = await User.find();
      if (users.length == 0) {
        throw { status: 404, message: "No users found" };
      }
      return users;
    } catch (err: any) {
      throw err;
    }
  }

  public static async getAllGuests() {
    try {
      const users = await User.find();

      if (users.length == 0) {
        throw { status: 404, message: "No users found" };
      }
      return users;
    } catch (err: any) {
      throw err;
    }
  }

  public static async isUserExistsUser(email: string): Promise<boolean> {
    const user: User | null = await User.findOne({
      where: { email: email },
    });

    if (user) {
      return false;
    }
    return true;
  }

  // //logout
  // public static async deleteToken(Token: any, ctx: Context) {
  //   let [bearer, token] = Token.split(" ");
  //   const redisObj = await RedisCache.connect();
  //   redisObj.del(token);
  //   console.log(token, "token...");
  // }
}
