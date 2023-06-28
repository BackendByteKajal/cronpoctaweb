import { Context } from "koa";
const sgMail = require("@sendgrid/mail");

export class UserVerification{
    public static verifyUser(ctx:Context){
        const API_KEY = "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"

        sgMail.setApiKey(API_KEY);

        const message = {
            to:'pratik.35.patil@gmail.com',
            from:"pratik.patil@techalchemy.com",
            subject:"Hello from sendgrid",
            text:"Hello from sendgrid"
        }

        sgMail.send(message)
        .then(() => console.log("Email has been send"))
        .catch((error: { message: any; }) => console.log(error.message));
    }
}