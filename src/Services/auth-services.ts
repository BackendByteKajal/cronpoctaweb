import { Context, Next } from "koa";
import { configData } from "../config/config";
//import { User } from "../entities/user-entity";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
// import { UserObject } from "../dtos/response/user-object-dto";
import { Admin } from "../entities/admin-entity";

import { redisobj } from "../app";
import { RedisSessionExpires } from "../enum/redis-expire-session";
//import { UserObject } from "../dtos/response/user-object-dto";
import { UserLoginObject } from "../dtos/response/userlogin-object-dto";

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

export class AuthServices {
  //Admin Login
  public static async loginAdmin(email: string, password: string) {
    try {
      const admin: any = await this.isAdminExists(email);
      const adminData = UserLoginObject.convertToObj(admin);

      if (admin.password == password) {
        const token = this.createToken(admin);

        return {
          adminDetails: admin,
          token,
        };
      } else {
        throw { status: 400, message: "Please check credentials" };
      }
    } catch (err: any) {
      throw err;
    }
  }

  public static async isAdminExists(email: string) {
    try {
      //const lowercaseEmail = email.toLowerCase();
      const user = await Admin.findOne({
        where: { email: email },
      });
      if (!user) {
        throw { status: 404, message: "Admin Does not Exists" };
      }
      return user;
    } catch (err: any) {
      throw err;
    }
  }
  //jwt Token

  public static createToken(data: any) {
    const expirationTimeInSeconds = 5 * 24 * 60 * 60; // 5 days
    const key = configData.jwt.key;

    const token = jwt.sign({ data }, key, {
      expiresIn: expirationTimeInSeconds,
    });
    return token;
  }

  // set value in redis
  public static redisCaching(userData: any, token: string) {
    
    const expirationInSeconds = 5 * 24 * 60 * 60; // 5 days
    redisobj.set(token, JSON.stringify(userData), { EX: expirationInSeconds });
  }

  // //set refresh token redis
  // public static redisCachingauth(userData: any, token: any) {
    
  //   redisobj.set(
  //     token,
  //     JSON.stringify(userData)
  //     // RedisSessionExpires.UserLogin
  //   );
  // }
  // //

  public static async getredisData(token: any) {
    //const redisObj = RedisCache.connect();
    const data = await redisobj.get(token);
    return data;
  }

  //logout
  public static async deleteToken(Token: any, ctx: Context) {
    let [bearer, token] = Token.split(" ");
    //const redisObj = await RedisCache.connect();
    
    
    redisobj.del(token);
    
    console.log(token, "token...");
  }
  
  //set cookies
  public static async setCookieAndReturnToken(
    ctx: Context,
    name: string,
    value: any
  ) {
    const cookieOptions = {
      domain: process.env.CLIENT_URL,

      httpOnly: false,
      secure: false,
      signed: true,
      overwrite: true,
    };

    const cookiestoken = ctx.cookies.set(name, value, cookieOptions);
    return cookiestoken;
  }
}
