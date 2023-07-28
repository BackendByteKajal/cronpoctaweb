import Joi, { required } from "joi";
import { Context, Next } from "koa";
import { Utils } from "../utils/utils";
import { request } from "http";
import koaBody from "koa-body";

export class UserValidator {
  public static Register(ctx: Context, next: Next) {
    try {
      const createJSON = {
        body: Joi.object({
          userName: Joi.string()
            .pattern(/^[a-zA-Z]+$/)
            .trim()
            .required()
            .max(20)
            .min(3),
          lastName: Joi.string()
            .pattern(/^[a-zA-Z]+$/)
            .trim()
            .required()
            .max(20)
            .min(3),
          employeeId: Joi.string()
            .pattern(/^[a-zA-Z0-9]+$.*/)
            .required()
            .max(8),
          email: Joi.string()
            //  .pattern(/^[a-zA-Z]+[0-9]*@.*$/)
            .pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
            .required()
            .email(),
          password: Joi.string()
            // .pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).*$/)
            .required()
            .min(8)
            .max(15),
          repeat_password: Joi.ref("password"),
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
      ctx.status = 400;
      ctx.body = Utils.errorResponse(400, err.message);
    }
  }
}

export class AdminValidator {
  public static addMeetRoomValidation(ctx: Context, next: Next) {

    
   
    try {
      
      const createJSON = {
        body: Joi.object({
          meetRoomName: Joi.string().trim().required().max(20).min(3),
          capacity: Joi.number().integer(),
          imageurl: Joi.object({
            file: Joi.any()
              .custom((value, helpers) => {
                if (value && value.size > 10 * 1024 * 1024) {
                  return helpers.error('any.max');
                }
                return value;
              }),
          }).optional(), // Make the 'imageurl' object optional
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
      ctx.status = 400;
      ctx.body = Utils.errorResponse(400, err.message);
    }
  }

  //
  
}
