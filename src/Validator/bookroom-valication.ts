// import Joi from "joi";
import { Context, Next } from "koa";
import { Utils } from "../utils/utils";
import { BookingRoomDto } from "../dtos/request/booking-dto";
const moment = require("moment");
const Joi = require("joi").extend(require("@joi/date"));

export class BookMeetRoomValidations {
  public static bookMeetRoom(ctx: Context, next: Next) {
    try {
      const createJSON = {
        body: Joi.object({
          userId: Joi.required(),
          meetRoomId: Joi.required(),
          title: Joi.string().required().trim().min(1).max(100),
          date: Joi.date().format("DD/MM/YYYY").required(),
          startTime: Joi.required(),
          endTime: Joi.required(),
        }),
      };
      const meetRoomDetails: any = ctx.request.body;
      const validationResponse = createJSON.body.validate(meetRoomDetails);
      if (validationResponse && validationResponse.error) {
        // console.log(validationResponse);
        throw validationResponse.error;
      }
      BookMeetRoomValidations.dateValidation(meetRoomDetails.date);

      BookMeetRoomValidations.timeValidation(
        meetRoomDetails.startTime,
        meetRoomDetails.endTime
      );

      return next();
    } catch (err: any) {
      ctx.body = Utils.errorResponse(400, err.message);
    }
  }

  public static dateValidation(bookingDate: string) {
    try {
      const todays_date = moment().format("DD/MM/YYYY");
      const [day1, month1, year1] = todays_date.split("/");
      const [day2, month2, year2] = bookingDate.split("/");

      const dateObj1 = new Date(`${year1}-${month1}-${day1}`);
      const dateObj2 = new Date(`${year2}-${month2}-${day2}`);

      if (dateObj1 > dateObj2) {
        throw new Error("Please Enter Valid Date");
      }
      return;
    } catch (err: any) {
      throw err;
    }
  }

  public static timeValidation(startTime: string, endTime: string) {
    try {
      const start_time = startTime.replace(":", ".");
      const end_time = endTime.replace(":", ".");
      console.log(start_time, end_time);
      if (end_time <= start_time) {
        throw new Error("Please enter valid timing");
      }
      return;
    } catch (err: any) {
      throw err;
    }
  }
}
