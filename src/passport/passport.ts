import mail from "@sendgrid/mail";
import { google } from "googleapis";
import passportmodule from "koa-passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { Console } from "console";
import cookies from "cookies";

import { AuthServices } from "../Services/auth-services";
import { AuthController } from "../controller/auth-controller";
import { UserServices } from "../Services/user-services";
import { User } from "../entities/user-entity";
import { UserLoginObject } from "../dtos/response/userlogin-object-dto";
dotenv.config({ path: ".env" });
const GOOGLE_CLIENT_ID: any = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET: any = process.env.GOOGLE_CLIENT_SECRET;
const Google_callbackURL: any = process.env.BACKEND_URL;

passportmodule.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      //callbackURL: `${Google_callbackURL}/google/callback`,
      callbackURL: "/google/callback",
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
        //authtoken: accessToken,
        is_varified: profile.emails[0].verified,
      };
      const userdata: User | null = await UserServices.Registeruser(data);

      if (userdata) {
        let user = UserLoginObject.convertToObj(userdata);
        console.log(profile);
        const token = AuthServices.createToken(user);
        AuthServices.redisCaching(user, token);
        const Authemail = user.email;
        AuthServices.redisCaching(accessToken, Authemail);
        console.log(token, "token");
        done(null, user, token);
      }
    }
  )
);

// Passport serialization and deserialization
passportmodule.serializeUser<User, any>((user, done: any) => {
  done(null, user);
});
passportmodule.deserializeUser<User, any>((user, done: any) => {
  done(null, user);
});
export default passportmodule;
