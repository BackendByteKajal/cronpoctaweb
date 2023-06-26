import { Context } from "koa";
import { User } from "../entities/user-entity";
import { UserServices } from "../Services/user-services";
import { UserObject } from "../dtos/response/user-object-dto";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import { AuthServices } from "../Services/auth-services";
import { UpdateUserDto } from "../dtos/request/user-update-dto";
import { RegisterUserDto } from "../dtos/request/user-register-dto";

export class UserController {
  public static async userRegister(ctx: Context) {
    try{
      const data: RegisterUserDto = ctx.request.body as RegisterUserDto;
  
      // AuthServices.SendEmail();
      const user = await UserServices.Register(data);
      const response = UserObject.convertToObj(user);
  
      ctx.status = 201;
      ctx.body = Utils.successResponse(Message.SuccessRegister, response);
    }catch(err:any){
      ctx.status = 409;
      ctx.body = Utils.errorResponse(409,err.message)
    }
  }

  public static async Users(ctx: Context) {
    try{
      const users = await UserServices.getAllUsers();
      const allUsers = users.map((ele) => {
        return UserObject.convertToObj(ele);
      });
      ctx.body = Utils.successResponse(Message.AllUsers, allUsers);

    }catch(err:any){
      throw err;
    }
  }
}
