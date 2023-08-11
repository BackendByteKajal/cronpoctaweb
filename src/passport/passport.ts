import mail from "@sendgrid/mail";
import passportmodule from "koa-passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
const GOOGLE_CLIENT_ID =
  "995937983126-3np3l4625dm5hdsv39lb9itfth1gag1n.apps.googleusercontent.com";

const GOOGLE_CLIENT_SECRET = "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";
// Passport Google strategy for authentication
/*const GOOGLE_CLIENT_ID =
  "995937983126-3np3l4625dm5hdsv39lb9itfth1gag1n.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";*/
passportmodule.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "https://ce67-27-107-28-2.ngrok-free.app/google/callback",
      // callbackURL: "https://localhost:5002/google/callback",
    },
    (accessToken: string, refreshToken: string, profile: any, done: any) => {
      console.log(profile);
      console.log("accestoken", accessToken);
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
      };
      done(null, profile, mail);
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
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20");
// const GOOGLE_CLIENT_ID =
//   "441391630221-1b5r4tc3cdskb2rj4rrodvsjmjbhgf97.apps.googleusercontent.com";
// const GOOGLE_CLIENT_SECRET = "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";
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: GOOGLE_CLIENT_ID,
//       clientSecret: GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//     },
//     function (accessToken, refreshToken, profile, done) {
//       done(null, profile);
//     }
//   )
// );
// passport.serializeUser((user, done) => {
//   done(null, user);
// });
// passport.deserializeUser((user, done) => {
//   done(null, user);
// });
