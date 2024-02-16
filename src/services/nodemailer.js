import nodemailer from "nodemailer";



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kajal.jagtap@techalchemy.com",
    pass: "gamu gvfy ardx ajaw",
  },
});




export default transporter;
