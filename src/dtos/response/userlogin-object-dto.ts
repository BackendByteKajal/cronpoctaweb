import { Builder } from "builder-pattern";
//import { User } from "../../entities/user-entity";
import { userInfo } from "os";
import { User } from "../../entities/user-entity";

export class UserLoginObject {
  id: number;
  userName: string;
  email: string;
  last_name: string;
  is_verified: boolean;
  authtoken: string;
  googleid: number;
  guestName: string;
  refreshtoken:string;

  public static convertToObj(userObj: User): UserLoginObject {
    const resp = Builder<UserLoginObject>()
      .id(userObj.id)
      .email(userObj.email)
      .userName(userObj.user_name)
      .last_name(userObj.last_name)
      .is_verified(userObj.is_verified)
      .refreshtoken(userObj.refreshtoken);

    return resp.build();
  }
  public static convertToObj1(userObj: User): UserLoginObject {
    const resp = Builder<UserLoginObject>()
      //.guestName(`${userObj.user_name} ${userObj.last_name}`)
      .guestName(userObj.email);

    return resp.build();
  }
}
