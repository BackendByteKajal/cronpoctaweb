import { Context } from "koa";
import { BookingRoomDto } from "../dtos/request/booking-dto";
import { BookingServices } from "../Services/booking-services";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import { User } from "../entities/user-entity";

export class BookingController {
 /* public static async addBooking(ctx: Context) {
    try {
      const roomDetails = ctx.request.body as BookingRoomDto;
      const response = await BookingServices.bookMeetRoom(roomDetails,ctx);

      ctx.body = Utils.successResponse(Message.SuccessBooking, response);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status,err.message)
    }
  }*/


  
    public static async addBooking(ctx: Context) {
      try {
        console.log("addBookingServices");
        const roomDetails = ctx.request.body as BookingRoomDto;
        console.log(roomDetails)
        const response = await BookingServices.bookMeetRoom(roomDetails,ctx);
  
        ctx.body = Utils.successResponse(Message.SuccessBooking, response);
      } catch (err: any) {
        const status = err.status || 400;
        ctx.status = status;
        ctx.body = Utils.errorResponse(status,err.message)
      }
    }


  

  public static async fetchBookingWithId(ctx: Context) {
    try {
      const id = ctx.params.id;
      const Response = await BookingServices.fetchBookingWithId(
        Number(id)
      );

      ctx.body = Utils.successResponse(
        Message.FetchBooking,
        Response
      );
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status,err.message)
    }
    
  }
  public static async activeBookings(ctx: Context) {
    try {
      const allBookings = await BookingServices.getAllBookings(ctx);

      if (
        allBookings.todays_bookings.length == 0 &&
        allBookings.upcoming_bookings.length == 0
      ) {
        throw { status:400, message:'No meetings found'}
      }

      ctx.body = Utils.successResponse(Message.ActiveBookings, allBookings);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status,err.message)
    }
  }

  public static async bookingHistory(ctx: Context) {
    try {
      // const data = ctx.request.body as BookingRoomDto;

      // const { userId } = data;
      // console.log(userId);
      const userId = ctx.state.me.id;
      const bookingData = await BookingServices.getBookingHistory(userId);

      ctx.body = Utils.successResponse(Message.BookingHistory, bookingData);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status,err.message)
    }
  }

  public static async editBooking(ctx: Context) {
    try {
      console.log("editbooking..");
      const id = ctx.params.id;
      console.log(id)
      const editedData = ctx.request.body as BookingRoomDto;
      console.log(editedData)
      const editedResponse = await BookingServices.doEditBookings(
        Number(id),
        editedData
      );

      ctx.body = Utils.successResponse(Message.EditedBooking, editedResponse);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status,err.message)
    }
  }

  public static async deleteBooking(ctx: Context) {
    try {
      const id = ctx.params.id;
      const deletedDataResponse = await BookingServices.doDeleteBooking(
        Number(id)
      );

      ctx.body = Utils.successResponse(
        Message.DeletedBooking,
        deletedDataResponse
      );
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status,err.message)
    }
  }
//delete booking
/*public static async bookingdelete(ctx: Context) {
  const bookid = ctx.params.id;
  //const vendorData = ctx.request.body;


  const response = await BookingServices.bookingdelete(bookid);
  //const response  = UserObject.convertToObj(user);
  //ctx.body = Utils.successResponse(Message.Registrationdfind(), response);

}*/

public static async deletebooking(ctx: Context) {
  // Fetch Data from Body;
  const bookid = ctx.params.id ;
  const response = await BookingServices.bookingDelete(bookid);
  console.log(response);
}






}
