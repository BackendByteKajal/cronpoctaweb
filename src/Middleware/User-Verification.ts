import { Context } from "koa";
const sgMail = require("@sendgrid/mail");

export class UserVerification{
    public static verifyUser(email:string,id:number){
        const API_KEY = "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"

        sgMail.setApiKey(API_KEY);

        const message = {
            to:email,
            from:"pratik.patil@techalchemy.com",
            subject:"User Verification",
            text:`Let's verify user so you can login in MEETING ROOM BOOKING SYSTEM "https://fd04-27-107-28-2.ngrok-free.app/user/${id}/verify`
        }

        sgMail.send(message)
        .then(() => console.log("Email has been send"))
        .catch((error: { message: any; }) => console.log(error.message));
    }
}