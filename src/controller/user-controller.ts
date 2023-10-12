import { Context } from "koa";
//import { User } from "../entities/user-entity";
import { UserServices } from "../Services/user-services";
//import { UserObject } from "../dtos/response/user-object-dto";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import { AuthServices } from "../Services/auth-services";
//import { UpdateUserDto } from "../dtos/request/user-update-dto";
import { RegisterUserDto } from "../dtos/request/user-register-dto";
import { LoginUserDto } from "../dtos/request/user-login-dto";
import { UserLoginObject } from "../dtos/response/userlogin-object-dto";

export class UserController {
  // To Get All Users
  public static async Users(ctx: Context) {
    try {
      const users = await UserServices.getAllUsers();
      const allUsers = users.map((ele) => {
        return UserLoginObject.convertToObj(ele);
      });
      ctx.body = Utils.successResponse(Message.AllUsers, allUsers);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }

  //Get All Guests
  public static async getAllGuests(ctx: Context) {
    try {
      const users = await UserServices.getAllGuests();
      const allUsers = users.map((ele) => {
        return UserLoginObject.convertToObj1(ele);
      });

      ctx.body = Utils.successResponse(Message.AllGuests, allUsers);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }
  
//logout
  public static async removeToken(ctx: Context) {
    let Token = ctx.header.authorization;
    console.log(Token,"token")
    try {
      const response = await AuthServices.deleteToken(Token, ctx);
      ctx.body = Utils.successResponse("Logged Out Succesfully", {});
      ctx.response.status = 200;
    } catch (error: any) {
      ctx.body = Utils.errorResponse(400, error.message);
    }
  }
}
