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
dotenv.config({ path: ".env" });
const GOOGLE_CLIENT_ID =
  "1017054341407-11tc242vn4scpfqujfc90t341to7mffl.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passportmodule.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "https://f9ad-27-107-28-2.ngrok-free.app/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      const data = {
        googleid: profile.id,
        userName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        authtoken: accessToken,
        is_varified: profile.emails[0].verified,
      };
      const userdata: UserLogin | null = await UserServices.Registeruser(data);
      console.log("data", data);
      console.log(profile);
      const authemail = profile.emails[0].value;
      const token = AuthServices.createToken(userdata);
      AuthServices.redisCaching(userdata, token);

      done(null, userdata, token);
    }
  )
);

// Passport serialization and deserialization
passportmodule.serializeUser<any, any>((user, done: any) => {
  done(null, user);
});
passportmodule.deserializeUser<any, any>((user, done) => {
  done(null, user);
});
export default passportmodule;
