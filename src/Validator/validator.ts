import Joi from "joi";
import { Context, Next } from "koa";

export class UserValidator {
  public static Register(ctx: Context, next: Next) {
    try {
      const createJSON = {
        body: Joi.object({
          userName: Joi.string().required(),
          lastName : Joi.string().required(),
          employeeId: Joi.string().required(),
          email: Joi.string().required().email(),
          password: Joi.string().required(),
        }),
      };
      const req = ctx.request.body;
      const validationResponse = createJSON.body.validate(req);
      if (validationResponse && validationResponse.error) {
        console.log(validationResponse);
        throw validationResponse.error;
      }
      return next();
    } catch (err: any) {
      throw err;
    }
  }
}
