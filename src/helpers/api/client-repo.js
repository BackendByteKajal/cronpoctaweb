import { connectToDatabase } from "../../util/mongodb";
import { ObjectId } from "mongodb";
// import { formMiddleware } from "./middleware.js";
import { sendEmailClientData } from "./send-email.js";

export const clientRepo = {
  createClientData,
  scheduleEmail,
  checkAndUpdateStatusDifference,
  sendEMailToAdmin,
};

// Function to create client data
async function createClientData(row, param) {
  try {
    if (param != "cancel") {
      // formMiddleware.validateGetStartedForm(row);
    }
    const newContent = {
      // Construct the new client data document
      Name: row.Name,
      email: row.email,
      countryCode: row.countryCode,
      countryCallingCode: row.countryCallingCode,
      contact_no: row.contact_no,
      countryName: row.countryName,
      message: row.message,
      budget: row.budget,
      created_time: new Date(),
      status: "Active",
      submit: "part 1 complete",

      updated_time: new Date(),
    };
    if (param === "cancel") {
      newContent.submit = "part 1";
    }
    const { db } = await connectToDatabase();
    // Insert the new client data document into the database
    const insertData = await db.collection("client").insertOne(newContent);
    // Ensure the document was successfully inserted
    const id = insertData.insertedId;

    // Query "client" collection using the _id
    const clientData = await db.collection("client").findOne({
      _id: id,
    });
    console.log(clientData, "**444444444444444444444444444");
    // Schedule the email job for the new client data
    scheduleEmail(clientData, db);
    return {
      success: true,
      message: "Data Inserted Successfully",
      clientdata: clientData,
    };
  } catch (error) {
    return {
      message: new Error(error).message,
      success: false,
      status: error.status,
    };
  }
}

// Function to schedule email sending
function scheduleEmail(clientData, db) {
  const clientId = clientData._id;
  console.log("set interval");
  // Set an interval to run every 10 minutes (600,000 milliseconds)
  let interval = setInterval(async () => {
    console.log("Schedule After 10 min......");
    // Execute the email sending task
    await executeScheduledTask(clientId, interval, db);
  }, 100000); // 10 minutes in milliseconds
}
// Function to execute tasks when scheduled
async function executeScheduledTask(clientId, interval, db) {
  try {
    // const { db } = await connectToDatabase();
    // Find the active client data with the given _id
    const collection = await db
      .collection("client")
      .find({ status: "Active", _id: clientId })

      .toArray();
    console.log(collection, "collection");
    // Check if there is active client data
    if (collection.length) {
      // Check and update status based on time difference
      let sendEmail = await checkAndUpdateStatusDifference(collection, db);
          if (sendEmail) {
            // If no active client data, stop the scheduled task
            console.log("stop");
            clearInterval(interval);
          }
    } else {
      // If no active client data, stop the scheduled task
      console.log("stop");
      clearInterval(interval);
    }

    return {
      data: JSON.parse(JSON.stringify(clientId)),
      message: "",
      success: true,
    };
  } catch (error) {
    // Handle errors
    return {
      data: [],
      message: new Error(error).message,
      success: false,
    };
  }
}

// Function to check conditions and call email function
async function checkAndUpdateStatusDifference(doc, db) {
  const currentTime = new Date();
  // Calculate the time difference in milliseconds
  const timeDifference = currentTime - doc[0].updated_time;
  // Check conditions
  if (timeDifference > 1 * 60 * 1000) {
    console.log("9 min diff");
    // Call your email sending function
    const sendEmailResult = await sendEmailClientData(doc[0], "token");
    if (sendEmailResult) {
      // Update status to "inActive" if email is sent successfully
      const updatedData = await db.collection("client").updateOne(
        {
          _id: new ObjectId(doc[0]._id),
        },
        { $set: { status: "inActive" } }
      );

      if (updatedData.modifiedCount === 1) {
        return true;
      } else {
        return false;
      }
    } else {
        console.error("Error sending email:", error);
       throw new Error("Failed to send email. Please try again later.....");
        return false;
    }
  } else {
      console.log("No action needed, time difference is within 10 minute");
    return false;
  }
}

//send Email to Admin with client information
async function sendEMailToAdmin(id, token, param) {
  try {
    const { db } = await connectToDatabase();
    const clientData = await db.collection("client").findOne({
      _id: new ObjectId(id),
    });
    console.log(clientData, "***********************");
    const email = await sendEmailClientData(clientData, token, param);
    await db.collection("client").updateOne(
      {
        _id: new ObjectId(id),
      },
      { $set: { status: "Inactive" } }
    );

    const clientDataupdated = await db.collection("client").findOne({
      _id: new ObjectId(id),
    });
    console.log(clientDataupdated, "clientData..............");
    if (email) {
      return {
        data: JSON.parse(JSON.stringify(clientDataupdated)),
        message: "Email to admin sent succesfully...",
        success: true,
      };
    }
    return {
      message: " Error in sending Email ...",
      success: false,
    };
  } catch (error) {
    // return the error
    return {
      data: {},
      message: new Error(error).message,
      success: false,
    };
  }
}
