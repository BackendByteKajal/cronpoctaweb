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
          startTime: Joi.string().pattern(/^[0-2][0-3]:[0-5][0-9]$/).required(),
          endTime: Joi.string().pattern(/^[0-2][0-3]:[0-5][0-9]$/).required(),
        }),
      };
      const meetRoomDetails: any = ctx.request.body;
      const validationResponse = createJSON.body.validate(meetRoomDetails);
      if (validationResponse && validationResponse.error) {
        // console.log(validationResponse);
        throw validationResponse.error;
      }

      const result = BookMeetRoomValidations.dateValidation(meetRoomDetails.date);
      if(result == -1){
        throw new Error("Please Enter Valid Date")
      }

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

      const todayDateObj = new Date(`${year1}-${month1}-${day1}`);
      const bookingDateObj = new Date(`${year2}-${month2}-${day2}`);

      if (todayDateObj > bookingDateObj) {
        // throw new Error("Please Enter Valid Date");
        return -1;
      }else if(todayDateObj < bookingDateObj){
        return 1
      }
      return 0;
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
