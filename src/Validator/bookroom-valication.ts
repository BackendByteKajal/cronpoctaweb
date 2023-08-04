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
     // const id = ctx.params.id;

//let Bookings = await Booking.findBy({ id: id });
      console.log(ctx.request.body);
      const createJSON = {
        body: Joi.object({
          // userId: Joi.required(),
          meetRoomId: Joi.required(),
          title: Joi.string()
            .pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]([\w ]+)*$/)
            .required()
            .min(1)
            .max(100),
          //^[a-zA-Z]+(?:[ \t]+[a-zA-Z]+)*[0-9!@#$%^&*()\-_=+[\]{}\\|;:'",.<>/?]*$/
          date: Joi.date().format("DD/MM/YYYY").required(),
          startTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          // guests:  Joi.array().items(Joi.array().items(Joi.string())).required(),
          guests: Joi.array()
            .items(
              Joi.object({
                guests: Joi.string().required(),
              })
            )
            .required(),

          description: Joi.string().min(0).required(),
        }),
      };
       const id = ctx.params.id;
       let Bookings = await Booking.findBy({ id: id });
      const meetRoomDetails: any = ctx.request.body;
      const validationResponse = createJSON.body.validate(meetRoomDetails);
      if (validationResponse && validationResponse.error) {
        // console.log(validationResponse);
        throw validationResponse.error;
      }
      //

      const result = BookMeetRoomValidations.dateValidation(
        meetRoomDetails.date
      );
      const currentTime = AccessValidation.getCurrentTime();
      console.log("currentTime", currentTime);
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
      console.log(ctx.request.body);
      const createJSON = {
        body: Joi.object({
          // userId: Joi.required(),
          meetRoomId: Joi.required(),
          title: Joi.string()
            .pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]([\w ]+)*$/)
            .required()
            .min(1)
            .max(100),
          //^[a-zA-Z]+(?:[ \t]+[a-zA-Z]+)*[0-9!@#$%^&*()\-_=+[\]{}\\|;:'",.<>/?]*$/
          date: Joi.date().format("DD/MM/YYYY").required(),
          startTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          // guests:  Joi.array().items(Joi.array().items(Joi.string())).required(),
          guests: Joi.array()
            .items(
              Joi.object({
                guests: Joi.string().required(),
              })
            )
            .required(),

          description: Joi.string().min(0).required(),
        }),
      };
      const meetRoomDetails: any = ctx.request.body;
      const validationResponse = createJSON.body.validate(meetRoomDetails);
      if (validationResponse && validationResponse.error) {
        // console.log(validationResponse);
        throw validationResponse.error;
      }
      //

      const result = BookMeetRoomValidations.dateValidation(
        meetRoomDetails.date
      );
      const currentTime = AccessValidation.getCurrentTime();
      console.log("currentTime", currentTime);
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
        // throw new Error("Please Enter Valid Date");
        return -1;
      } else if (todayDateObj < bookingDateObj) {
        return 1;
      }
      return 0;
    } catch (err: any) {
      throw err;
    }
  }

  // public static timeValidation(startTime: string, endTime: string,currentTime: string,bdate:string) {
  //   try {

  //     const todays_date = moment().format("DD/MM/YYYY");
  //     const [day1, month1, year1] = todays_date.split("/");
  //     const [day2, month2, year2] = bdate.split("/");

  //     const todayDateObj = new Date(`${year1}-${month1}-${day1}`);
  //     const bookingDateObj = new Date(`${year2}-${month2}-${day2}`);
  //     console.log("this.timeValidation")
  //     console.log(endTime)
  //     console.log(startTime)
  //     console.log(currentTime)
  //     const currentTimeParts = currentTime.split(":");
  //     const startTimeParts = startTime.split(":");
  //     const endTimeParts = endTime.split(":");
  //     //console.log(startTimeParts,"parts")
  //     const CurrentHour = parseInt(currentTimeParts[0]);
  //     const startHour = parseInt(startTimeParts[0]);
  //     console.log(startHour,"startHour");
  //     const startMinute = parseInt(startTimeParts[1]);
  //     const endHour = parseInt(endTimeParts[0]);
  //     console.log(endHour,"endhour")
  //     const endMinute = parseInt(endTimeParts[1]);
  //     const CurrentMinute = parseInt(currentTimeParts[1]);
  //     console.log(CurrentHour,"currenthour")
  //     console.log(CurrentMinute,"currentminute")
  //     console.log(todayDateObj,"today")
  //     console.log(bookingDateObj,"boo")

  //      if(todayDateObj.toString() === bookingDateObj.toString() ){
  //       console.log("func..")
  //    if (startHour < CurrentHour || (startHour === CurrentHour && startMinute <= CurrentMinute)) {
  //       //Start time is less than or equal to the current time
  //       return false;
  //     }
  //  }

  //     if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
  //       return false;
  //     }
  //     return true;
  //   } catch (err: any) {
  //     throw err;
  //   }
  // }

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
      console.log("this.timeValidation");
      console.log(endTime);
      console.log(startTime);
      console.log(currentTime);
      const currentTimeParts = currentTime.split(":");
      const startTimeParts = startTime.split(":");
      const endTimeParts = endTime.split(":");
      //console.log(startTimeParts,"parts")
      const CurrentHour = parseInt(currentTimeParts[0]);
      const startHour = parseInt(startTimeParts[0]);
      console.log(startHour, "startHour");
      const startMinute = parseInt(startTimeParts[1]);
      const endHour = parseInt(endTimeParts[0]);
      console.log(endHour, "endhour");
      const endMinute = parseInt(endTimeParts[1]);
      const CurrentMinute = parseInt(currentTimeParts[1]);
      console.log(CurrentHour, "currenthour");
      console.log(CurrentMinute, "currentminute");
      console.log(todayDateObj, "today");
      console.log(bookingDateObj, "boo");

      if (todayDateObj.toString() === bookingDateObj.toString()) {
        // const currentTimeHourMinute = CurrentHour * 60 + CurrentMinute;
        //onst startTimeHourMinute = startHour * 60 + startMinute;

        // Check if the booking's start time is less than 1 hour from the current time
        /*if (startTimeHourMinute <= currentTimeHourMinute + 60) {
          console.log("cannot edit before 1 hour")
          throw new Error("cannot edit before 1 hour")
            return false;
        }*/
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
      console.log("this.timeValidation");
      console.log(endTime);
      console.log(startTime);
      console.log(currentTime);
      const currentTimeParts = currentTime.split(":");
      const startTimeParts = startTime.split(":");
      const endTimeParts = endTime.split(":");
      //console.log(startTimeParts,"parts")
      const CurrentHour = parseInt(currentTimeParts[0]);
      const startHour = parseInt(startTimeParts[0]);
      console.log(startHour, "startHour");
      const startMinute = parseInt(startTimeParts[1]);
      const endHour = parseInt(endTimeParts[0]);
      console.log(endHour, "endhour");
      const endMinute = parseInt(endTimeParts[1]);
      const CurrentMinute = parseInt(currentTimeParts[1]);
      console.log(CurrentHour, "currenthour");
      console.log(CurrentMinute, "currentminute");
      console.log(todayDateObj, "today");
      console.log(bookingDateObj, "boo");

      if (todayDateObj.toString() === bookingDateObj.toString()) {
        const currentTimeHourMinute = CurrentHour * 60 + CurrentMinute;
        const startTimeHourMinute = startHour * 60 + startMinute;

         //Check if the booking's start time is less than 1 hour from the current time
        if (startTimeHourMinute <= currentTimeHourMinute + 60) {
          console.log("cannot edit before 1 hour")
          throw new Error("cannot edit before 1 hour")
            return false;
        }
        
      }

    } catch (err: any) {
      throw err;
    }
  }
}
