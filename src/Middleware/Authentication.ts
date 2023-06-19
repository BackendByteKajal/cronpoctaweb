import { Context } from "koa";
import { configData } from "../config/config";

const jwt = require("jsonwebtoken");

export class AuthenticateMiddleware {
  public static async AuthenticateUser(ctx: Context, next: any) {
    if (ctx.headers.authorization) {
      const token = ctx.headers.authorization.split(" ").pop();

      const decode = jwt.verify(token, configData.jwt.key);

      await next();
    } else {
      ctx.body = {
        status: 401,
        message: "Not Authenticated",
      };
    }
  }
}
