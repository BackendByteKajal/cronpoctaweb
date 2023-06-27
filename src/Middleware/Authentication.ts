import { Context } from "koa";
import { configData } from "../config/config";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";

const jwt = require("jsonwebtoken");

export class AuthenticateMiddleware {
  public static async AuthenticateUser(ctx: Context, next: any) {
    if (ctx.headers.authorization) {
      const token = ctx.headers.authorization.split(" ").pop();

      const decode = jwt.verify(token, configData.jwt.key);

      await next();
    } else {
      ctx.status = 401;
      ctx.body = Utils.errorResponse(401,Message.AuthenticationFailed);
    }
  }
}
