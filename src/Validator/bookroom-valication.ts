// import Joi from "joi";
import { Context, Next } from "koa";
import { Utils } from "../utils/utils";
import { BookingRoomDto } from "../dtos/request/booking-dto";
import { AccessValidation } from "./access-validation";
import { Booking } from "../entities/booking-entity";
const moment = require("moment");
const Joi = require("joi").extend(require("@joi/date"));

export class BookMeetRoomValidations {
  //edit
  public static async EditRoomboking(ctx: Context, next: Next) {
    try {
      const createJSON = {
        body: Joi.object({
          meetRoomId: Joi.required(),
          title: Joi.string()
            .pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]([\w ]+)*$/)
            .required()
            .min(1)
            .max(100),

          date: Joi.date().format("DD/MM/YYYY").required(),
          startTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),

          guests: Joi.array()
            .items(
              Joi.object({
                guests: Joi.string().required(),
              })
            )
            .required(),

          description: Joi.string().min(0).required(),
          clstartTime: Joi.string(),
          clendTime: Joi.string(),
        }),
      };
      const id = ctx.params.id;
      let Bookings = await Booking.findBy({ id: id });
      const meetRoomDetails: any = ctx.request.body;
      const validationResponse = createJSON.body.validate(meetRoomDetails);
      if (validationResponse && validationResponse.error) {
        throw validationResponse.error;
      }
      //

      const result = BookMeetRoomValidations.dateValidation(
        meetRoomDetails.date
      );
      const currentTime = AccessValidation.getCurrentTime();

      const timeResult = BookMeetRoomValidations.timeValidationEdit(
        meetRoomDetails.startTime,
        meetRoomDetails.endTime,
        currentTime,
        meetRoomDetails.date
      );
      if (result == -1) {
        throw new Error("Please Enter Valid Date");
      }
      if (timeResult == false) {
        throw new Error("Please Enter Valid Time");
      }
      const timePossibility = BookMeetRoomValidations.timeValidationEdit(
        meetRoomDetails.startTime,
        meetRoomDetails.endTime,
        currentTime,
        meetRoomDetails.date
      );
      if (timePossibility == false) {
        throw new Error("Please Enter Valid Time");
      }

      return next();
    } catch (err: any) {
      ctx.status = 400;
      ctx.body = Utils.errorResponse(400, err.message);
    }
  }

  public static bookMeetRoom(ctx: Context, next: Next) {
    try {
      const createJSON = {
        body: Joi.object({
          meetRoomId: Joi.required(),
          title: Joi.string()
            .pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]([\w ]+)*$/)
            .required()
            .min(1)
            .max(100),

          date: Joi.date().format("DD/MM/YYYY").required(),
          startTime: Joi.string()
            //.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            //.pattern(/^^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),

          guests: Joi.array()
            .items(
              Joi.object({
                guests: Joi.string().required(),
              })
            )
            .required(),

          description: Joi.string().min(0).required(),
          clstartTime: Joi.string(),
          clendTime: Joi.string(),
        }),
      };
      const meetRoomDetails: any = ctx.request.body;
      const validationResponse = createJSON.body.validate(meetRoomDetails);
      if (validationResponse && validationResponse.error) {
        throw validationResponse.error;
      }
      //

      const result = BookMeetRoomValidations.dateValidation(
        meetRoomDetails.date
      );
      const currentTime = AccessValidation.getCurrentTime();

      const timeResult = BookMeetRoomValidations.timeValidation(
        meetRoomDetails.startTime,
        meetRoomDetails.endTime,
        currentTime,
        meetRoomDetails.date
      );
      if (result == -1) {
        throw new Error("Please Enter Valid Date");
      }
      if (timeResult == false) {
        throw new Error("Please Enter Valid Time");
      }
      const timePossibility = BookMeetRoomValidations.timeValidation(
        meetRoomDetails.startTime,
        meetRoomDetails.endTime,
        currentTime,
        meetRoomDetails.date
      );
      if (timePossibility == false) {
        throw new Error("Please Enter Valid Time");
      }

      return next();
    } catch (err: any) {
      ctx.status = 400;
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
        return -1;
      } else if (todayDateObj < bookingDateObj) {
        return 1;
      }
      return 0;
    } catch (err: any) {
      throw err;
    }
  }

  public static timeValidation(
    startTime: string,
    endTime: string,
    currentTime: string,
    bdate: string
  ) {
    try {
      const todays_date = moment().format("DD/MM/YYYY");
      const [day1, month1, year1] = todays_date.split("/");
      const [day2, month2, year2] = bdate.split("/");

      const todayDateObj = new Date(`${year1}-${month1}-${day1}`);
      const bookingDateObj = new Date(`${year2}-${month2}-${day2}`);

      const currentTimeParts = currentTime.split(":");
      const startTimeParts = startTime.split(":");
      const endTimeParts = endTime.split(":");

      const CurrentHour = parseInt(currentTimeParts[0]);
      const startHour = parseInt(startTimeParts[0]);

      const startMinute = parseInt(startTimeParts[1]);
      const endHour = parseInt(endTimeParts[0]);

      const endMinute = parseInt(endTimeParts[1]);
      const CurrentMinute = parseInt(currentTimeParts[1]);

      if (todayDateObj.toString() === bookingDateObj.toString()) {
        if (
          startHour < CurrentHour ||
          (CurrentHour === startHour && CurrentMinute >= startMinute)
        ) {
          return false;
        }
      }

      if (
        endHour < startHour ||
        (endHour === startHour && endMinute <= startMinute)
      ) {
        return false;
      }
      return true;
    } catch (err: any) {
      throw err;
    }
  }

  public static timeValidationEdit(
    startTime: string,
    endTime: string,
    currentTime: string,
    bdate: string
  ) {
    try {
      const todays_date = moment().format("DD/MM/YYYY");
      const [day1, month1, year1] = todays_date.split("/");
      const [day2, month2, year2] = bdate.split("/");

      const todayDateObj = new Date(`${year1}-${month1}-${day1}`);
      const bookingDateObj = new Date(`${year2}-${month2}-${day2}`);

      const currentTimeParts = currentTime.split(":");
      const startTimeParts = startTime.split(":");
      const endTimeParts = endTime.split(":");

      const CurrentHour = parseInt(currentTimeParts[0]);
      const startHour = parseInt(startTimeParts[0]);

      const startMinute = parseInt(startTimeParts[1]);
      const endHour = parseInt(endTimeParts[0]);

      const endMinute = parseInt(endTimeParts[1]);
      const CurrentMinute = parseInt(currentTimeParts[1]);

      if (todayDateObj.toString() === bookingDateObj.toString()) {
        const currentTimeHourMinute = CurrentHour * 60 + CurrentMinute;
        const startTimeHourMinute = startHour * 60 + startMinute;

        //Check if the booking's start time is less than 1 hour from the current time
        if (startTimeHourMinute <= currentTimeHourMinute + 60) {
          throw new Error("cannot edit before 1 hour");
          return false;
        }
      }
    } catch (err: any) {
      throw err;
    }
  }
}
