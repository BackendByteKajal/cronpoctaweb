import { Context } from "koa";
import { AuthServices } from "../Services/auth-services";
import { LoginUserDto } from "../dtos/request/user-login-dto";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
import passport from "koa-passport";

export class AuthController {
  public static async login(ctx: Context) {
    try {
      const body = ctx.request.body as LoginUserDto;
      console.log(body);
      const data: any = await AuthServices.loginUser(body.email, body.password);

      ctx.body = Utils.successResponse(Message.LoginSuccess, data);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }

  public static async loginAdmin(ctx: Context) {
    try {
      const body = ctx.request.body as LoginUserDto;
      const data: any = await AuthServices.loginAdmin(
        body.email,
        body.password
      );

      ctx.body = Utils.successResponse(Message.LoginSuccess, data);
    } catch (err: any) {
      const status = err.status || 400;
      ctx.status = status;
      ctx.body = Utils.errorResponse(status, err.message);
    }
  }
  //login with google
  public static async loginUserSuccess(ctx: Context) {
    if (ctx.state.user) {
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: "successfull",
        user: ctx.state.user,
      };
    }
  }

  
}
/*

import passport from "koa-passport";

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const GOOGLE_CLIENT_ID = "your id";
const GOOGLE_CLIENT_SECRET = "your id";
const GITHUB_CLIENT_ID = "your id";
const GITHUB_CLIENT_SECRET = "your id";
const FACEBOOK_APP_ID = "your id";
const FACEBOOK_APP_SECRET = "your id";

// Configure passport strategies
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken: any, refreshToken: any, profile: any, done: any) {
      done(null, profile);
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    function (accessToken: any, refreshToken: any, profile: any, done: any) {
      done(null, profile);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
    },
    function (accessToken: any, refreshToken: any, profile: any, done: any) {
      done(null, profile);
    }
  )
);

passport.serializeUser((user: any, done: any) => {
  done(null, user);
});

passport.deserializeUser((user: any, done: any) => {
  done(null, user);
});
*/