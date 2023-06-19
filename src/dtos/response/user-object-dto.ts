import { Builder } from "builder-pattern";
import { User } from "../../entities/user-entity";

export class UserObject {
  id: number;
  firstName: string;
  email: string;

  public static convertToObj(userObj: User): UserObject {
    const resp = Builder<UserObject>()
      .id(userObj.id)
      .email(userObj.email)
      // .firstName(userObj.first_name)


      return resp.build();
  }
}