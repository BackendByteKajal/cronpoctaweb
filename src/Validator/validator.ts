import Joi from "joi";
import { Context, Next } from "koa";
import { Utils } from "../utils/utils";

export class UserValidator {
  public static Register(ctx: Context, next: Next) {
    try {
      const createJSON = {
        body: Joi.object({
          userName: Joi
                    .string()
                    .pattern(/^[a-zA-Z]+$/)
                    .trim()
                    .required()
                    .max(20)
                    .min(3),
          lastName : Joi
                    .string()
                    .pattern(/^[a-zA-Z]+$/)
                    .trim()
                    .required()
                    .max(20)
                    .min(3),
          employeeId: Joi
                    .string()
                    .pattern(/^[a-zA-Z0-9]+$.*/)
                    .required()
                    .max(8),
          email: Joi
                 .string()
                 .pattern(/^[a-zA-Z]+[0-9]*@.*$/)
                 .required()
                 .email(),
          password: Joi
                    .string()
                    // .pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)
                    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).*$/)
                    .required()
                    .min(8)
                    .max(15),
          repeat_password : Joi.ref('password')
        }),
      };
      const req = ctx.request.body;
      const validationResponse = createJSON.body.validate(req);
      if (validationResponse && validationResponse.error) {
        // console.log(validationResponse);
        throw validationResponse.error;
      }
      return next();
    } catch (err: any) {
      ctx.body = Utils.errorResponse(400,err.message);
    }
  }
}
