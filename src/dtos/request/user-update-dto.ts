import { Builder } from "builder-pattern";
import { User } from "../../entities/user-entity";

export class UpdateUserDto {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;

  public static UpdatedObj(obj: UpdateUserDto) : User {
    const resp = Builder<User>()
      .id(obj.id)
      .email(obj.email)
      .password(obj.password)
      .build();
      return resp;
  }
}
