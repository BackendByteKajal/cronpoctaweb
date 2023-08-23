import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import { AppRoutes } from "./routes";
import json from "koa-json";
import { PostgresDbConnection } from "./connection/postgres-connection";
const cors = require("@koa/cors");
import cloudinary from "cloudinary";
import koaBody from "koa-body";
const swaggerUI = require("swagger-ui-koa");
const YAML = require("yamljs");

const swaggerJSDocs = YAML.load(
  "/home/cepl/Desktop/meeting clone1/meeting-room-booking-system-backend-api/src/api.yml"
);

const app = new Koa();
const router = new Router();
app.keys = ["mrbskey"];

//import passport from "./passport";
import session from "koa-session";

import passportmodule from "koa-passport";
app.use(bodyParser());
app.use(json());
app.use(cors());

app.use(session(app)); // Use koa-session
app.use(passportmodule.initialize());
app.use(passportmodule.session());
app.use(
  session(
    {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      renew: true,
    },
    app
  )
);

//app.use(cors({ origin: config.clientUrl, credentials: true }));

/*app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 10 * 1024 * 1024, // Set the maximum file size allowed in bytes (10 MB in this example)
    keepExtensions: true, // Keep the file extensions on uploaded files
  },
  onError: (error:any , ctx) => {
    if (error.status === 413) {
      ctx.status = 413;
      ctx.body = 'File size is too large.';
    } else {
      ctx.throw(error);
    }
  },
}));*/


AppRoutes.initAppRoutes(router);
app.use(router.routes());
const port = 5005;
app.listen(port, () => {
  console.log(`Applistening on the port ${port}`);
});

PostgresDbConnection.connect();

// pgConnection
// .initialize()
// .then(() => {
//   console.log("DB Connection is Successful");
// })
// .catch((error: any) => {
//   console.log("Error in Connection DB Connection is Successful");

// });

/*cloudinary.v2.config({
  cloud_name: 'dveklqhi8',
  api_key: '466274367117952',
  api_secret: 'OGsq0bXQZBLBgP2L4_6j-WCTzJI',
  secure: true,
});*/
//app.use(passport.initialize());
//app.use(passport.session());
app.use(swaggerUI.serve);
app.use(swaggerUI.setup(swaggerJSDocs));
export default app;
