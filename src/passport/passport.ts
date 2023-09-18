import mail from "@sendgrid/mail";
import { google } from "googleapis";
import passportmodule from "koa-passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { Console } from "console";
import cookies from "cookies";
import { User } from "../entities/user-entity";
import { AuthServices } from "../Services/auth-services";
import { AuthController } from "../controller/auth-controller";
import { UserServices } from "../Services/user-services";
import { UserLogin } from "../entities/userlogin-entity";
import { UserLoginObject } from "../dtos/response/userlogin-object-dto";
dotenv.config({ path: ".env" });
const GOOGLE_CLIENT_ID: any = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET: any = process.env.GOOGLE_CLIENT_SECRET;

passportmodule.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.URL}/google/callback`,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      const data = {
        
        userName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        authtoken: accessToken,
        is_varified: profile.emails[0].verified,
      };
      const userdata: UserLogin | null = await UserServices.Registeruser(data);
      console.log(userdata, "userdata");
      if(userdata){
      let user = UserLoginObject.convertToObj(userdata);
       console.log(profile);
      const token = AuthServices.createToken(user);
      AuthServices.redisCaching(user, token);
      done(null, user, token);
      }
    }
  )
);

// Passport serialization and deserialization
passportmodule.serializeUser<UserLogin, any>((user, done:any) => {
  done(null, user);
});
passportmodule.deserializeUser<UserLogin, any>((user, done:any) => {
  done(null, user);
});
export default passportmodule;
