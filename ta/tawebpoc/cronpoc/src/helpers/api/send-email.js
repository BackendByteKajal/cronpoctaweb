
import transporter from "../../services/nodemailer";

export { sendEmailClientData };
async function sendEmailClientData(data, token, param) {
  try {
    let verified;
    const sender_name = data.Name;
    const sender_email = data.email;
    const sender_contact = data.contact_no;
    const sender_country_calling_code = data.countryCallingCode;
    const sender_country_name = data.countryName;
    const sender_budget = data.budget;
    const sender_message = data.message;
    let drop_off_point = data.submit;
    if (drop_off_point === "submit") {
      drop_off_point = "Part 1 & 2 complete";
    }
    if (drop_off_point === "?lastexit") {
      drop_off_point = "Part 1 complete, part 2 Q5";
    }
    if (drop_off_point === "null" || drop_off_point === null) {
      drop_off_point = "Part 1";
    }
    if (drop_off_point === "categories") {
      drop_off_point = "Part 1 complete, Part 2 Q1";
    }
    if (drop_off_point === "needs") {
      drop_off_point = "part 1 complete,Part 2 Q2";
    }
    if (drop_off_point === "deadline") {
      drop_off_point = "part 1 complete,Part 2 Q4";
    }
    if (drop_off_point === "funding") {
      drop_off_point = "part 1 complete,Part 2 Q3";
    }
    let sender_categories = data.categories;
    if (data.categories == undefined) {
      sender_categories = " ";
    }
    // const sender_categories = data.categories;
    let sender_needs = data.needs;
    if (data.needs == undefined) {
      sender_needs = " ";
    }
    let sender_funding = data.funding;
    if (data.funding == undefined) {
      sender_funding = " ";
    }
    let sender_deadline = data.deadline;
    if (data.deadline == undefined) {
      sender_deadline = " ";
    }
    let sender_lastmessage = data.lastMessage;
    if (data.lastMessage == undefined) {
      sender_lastmessage = " ";
    }
    
    const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } =
      data;

    if (1) {
      const response = await transporter.sendMail({
        from: "Tech Alchemy <no-reply@techalchemy.co>",
        to: "kajal.jagtap@techalchemy.com",
        subject: `You have a new form submission - ${sender_name}`,
        replyTo: sender_email,
        html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">
    <html>
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>
    <div style="padding:20px;">
    <div style="max-width: 500px;">
    <p>
    Hi there,<br/><br/>
    You have a new form submission: <br/><br/>
    Name: ${sender_name}<br/>
    Email Address: ${sender_email}<br/>
    Country Calling Code: +${sender_country_calling_code}, ${sender_country_name}<br/>
    Contact Number: ${sender_contact}<br/>
    What are you interested in building?: ${sender_message}<br/>
    Budget: ${sender_budget}<br/>
    What is the category of the software you wish to build?:  ${sender_categories}<br/>
    Which of these best describe your needs?: ${sender_needs}<br/>
    How are you funding your app?: ${sender_funding}<br/>
    Do you have a set timeline and  delivery deadline?: ${sender_deadline}<br/>
    Message: ${sender_lastmessage}<br/>
    Status: ${drop_off_point}<br/><br/>
    utm_source: ${utm_source}<br/>
    utm_medium: ${utm_medium}<br/>
    utm_campaign: ${utm_campaign}<br/>
    utm_term: ${utm_term}<br/>
    utm_content: ${utm_content}<br/><br/>
    Regards.
    </p>
    </div>
    </div>
    </body>
    </html>
    `,

        attachments: data?.uploadedFiles,
      });

      return true;
    } else {
      console.error("not verified ");
      throw new Error(
        "Failed to send email.Not varified. Please try again later."
      );
      return false;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email. Please try again later.");
    return false;
  }
}
