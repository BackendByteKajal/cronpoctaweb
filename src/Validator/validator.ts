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
                    .pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)
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

// import joi from "joi";
// import { Context, Next } from "koa";
// import { Utils } from "../utils/util";
// export class UserValidator {
//   public static register(ctx: Context, next: Next) {
//     // object
//     try {
//       const schema = {
//         body: joi.object({
//           firstName: joi
//             .string()
//             .pattern(/^[a-zA-Z]+$/)
//             .trim()
//             .required()
//             .max(20)
//             .min(3),
//           lastName: joi
//             .string()
//             .pattern(/^[a-zA-Z]+$/)
//             .trim()
//             .required()
//             .max(20)
              // .min(3)
              // .pattern(/^[a-zA-Z]*/),
              // email: joi
              // .string()
              // .pattern(/^[a-zA-Z]+[0-9]*@.*$/)
              // .required()
              // .email(),
              // password: joi
              // .string()
              // .pattern(
              //   /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/
              // )
              // .required()
              // .min(8)
              // .max(16),
              // employeeId: joi
              // .string()
  //             .pattern(/^ta[0-9]+$.*/)
  //             .required()
  //             .max(8),
  //         }),
  //       };
  //       const data = ctx.request.body;
  //       const validated = schema.body.validate(data);
  //       if (validated && validated.error) {
  //         throw validated.error;
  //       }
  //       return next();
  //     } catch (error: any) {
  //       ctx.body = Utils.errorResponse(422, error.message, error.details);
  //     }
  //   }
  // }
