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
const path = require("path"); // Import the 'path' module

// Construct the absolute path to your YAML file
const yamlFilePath = path.join(__dirname, "api.yml");

// Load the YAML file using the absolute path
const swaggerJSDocs = YAML.load(yamlFilePath);

const app = new Koa();
const router = new Router();
app.keys = ["mrbskey"];

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

AppRoutes.initAppRoutes(router);
app.use(router.routes());
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Applistening on the port ${port}`);
});

PostgresDbConnection.connect();

app.use(swaggerUI.serve);
app.use(swaggerUI.setup(swaggerJSDocs));
export default app;
