import { Context } from "koa";
import { configData } from "../config/config";
import { User } from "../entities/user-entity";
import { Utils } from "../utils/utils";
import { Message } from "../constants/message";
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

export class AuthServices {
  public static async LoginUser(email: string, password: string) {
    try {
      const user: any = await this.isUserExists(email);

      const result = await bcrypt.compare(password,user.password)
      if (result) {
        const token = this.createToken(user);
        // console.log(password, user.password, token);
        return Utils.successResponse(Message.LoginSuccess, token);
      } else {
        return Utils.errorResponse(400, Message.LoginFailed);
      }
    } catch (err: any) {
      throw err;
    }
  }

  public static async isUserExists(email: string) {
    try {
      const user = await User.findOne({
        where: { email: email },
      });
      if (!user) {
        throw Error("User Does not Exists");
      }
      return user;
    } catch (err: any) {
      throw err;
    }
  }

  public static createToken(data: any) {
    const { email, password } = data;
    const key = configData.jwt.key;

    // console.log(key);
    const token = jwt.sign(
      {
        email,
        password,
      },
      key
    );
    return token;
  }

  public static async SendEmail() {
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      // service:'Gmail',
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "cassandre.jones@ethereal.email",
        pass: "vb1TCekQhdEmN9bTrZ",
      },
    });
    let info = await transporter.sendMail({
      from: "fernotanu@gmail.com", // sender address
      to: "patil99.pratik@gmail.com", // list of receivers
      subject: "To Verify Registered User ", // Subject line
      text: "mail verified",
    });

    console.log("Message sent: %s", info.messageId);

    console.log((error: any) => error);
  }
}
