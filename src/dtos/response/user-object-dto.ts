import { Builder } from "builder-pattern";
import { User } from "../../entities/user-entity";

export class UserObject {
  id: number;
  userName: string;
  email: string;
  lastName:string;
  employeeId:string;
  isVerified:boolean

  public static convertToObj(userObj: User): UserObject {
    const resp = Builder<UserObject>()
      .id(userObj.id)
      .email(userObj.email)
      .userName(userObj.user_name)
      .lastName(userObj.last_name)
      .employeeId(userObj.employee_id)
      .isVerified(userObj.is_verified)


      return resp.build();
  }
}