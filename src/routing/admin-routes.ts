import Router from "koa-router";
import {
  AdminApiRoutes,
  MeetingRoomApiRoute,
  UserApiRoutes,
} from "../routes/route-constant";
import { AdminController } from "../controller/admin-controller";
import { UserController } from "../controller/user-controller";
import { AdminValidator } from "../Validator/validator";
import koaBody from "koa-body";

import { fileSizeErrorHandler } from "../Middleware/customerror";
import { AuthenticateMiddleware } from "../Middleware/Authentication";

export class AdminRoute {
  public static routes(router: Router) {
    //router.post(MeetingRoomApiRoute.MeetRoom,AdminValidator.addMeetRoomValidation,AdminController.AddMeetRoom);

    router.post(
      MeetingRoomApiRoute.MeetRoom,
      koaBody({
        multipart: true,
        formidable: {
          maxFileSize: 10 * 1024 * 1024, // Set the maximum file size allowed in bytes (10 MB in this example)
          keepExtensions: true, // Keep the file extensions on uploaded files
        },
      }),
      AdminValidator.addMeetRoomValidation,
      AdminController.AddMeetRoom
    );
    router.get(MeetingRoomApiRoute.MeetRoom, AdminController.getAllMeetRooms);
    router.patch(AdminApiRoutes.MeetRoom, AdminController.editMeetRoom);
    router.patch(
      AdminApiRoutes.EditRoom,
      koaBody({
        multipart: true,
        formidable: {
          maxFileSize: 10 * 1024 * 1024, // Set the maximum file size allowed in bytes (10 MB in this example)
          keepExtensions: true, // Keep the file extensions on uploaded files
        },
      }),
      AdminValidator.addMeetRoomValidation,
      AdminController.editRoom
    );
    router.get(AdminApiRoutes.MeetRoom, AdminController.meetRoomHistory);
  }
}
