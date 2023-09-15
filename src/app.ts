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
  "/home/cepl/Desktop/meet5/meeting-room-booking-system-backend-api/src/api.yml"
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
// app.use(
//   cors({
//     origin: "https://e13f-27-107-28-2.ngrok-free.app",
//     methods: "GET,POST,PUT,DELETE,PATCH",
//     credentials: true,
//   })
// );
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

AppRoutes.initAppRoutes(router);
app.use(router.routes());
const port = 3054;
app.listen(port, () => {
  console.log(`Applistening on the port ${port}`);
});

PostgresDbConnection.connect();

app.use(swaggerUI.serve);
app.use(swaggerUI.setup(swaggerJSDocs));
export default app;
