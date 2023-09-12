import { Context } from "koa";
import { User } from "../entities/user-entity";
import { UserServices } from "../Services/user-services";
import { UserObject } from "../dtos/response/user-object-dto";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import { AuthServices } from "../Services/auth-services";
import { UpdateUserDto } from "../dtos/request/user-update-dto";
import { RegisterUserDto } from "../dtos/request/user-register-dto";
import { LoginUserDto } from "../dtos/request/user-login-dto";
import { UserLoginObject } from "../dtos/response/userlogin-object-dto";

export class UserController {
  public static async userRegister(ctx: Context) {
    try {
      const data: RegisterUserDto = ctx.request.body as RegisterUserDto;

      // AuthServices.SendEmail();
      const user = await UserServices.Register(data);
      const response = UserObject.convertToObj(user);

      ctx.status = 201;
      ctx.body = Utils.successResponse(Message.SuccessRegister, response);
    } catch (err: any) {
      const status = err.status || 408;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }

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

  public static async userVerification(ctx: Context) {
    try {
      const param = ctx.params.id;
      console.log(param);
      await UserServices.verifyUser(param);
      ctx.body = Utils.successResponse(Message.UserVerified, {});
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }
}
