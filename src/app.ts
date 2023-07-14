import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import { AppRoutes } from "./routes";
import json from "koa-json";
import { PostgresDbConnection } from "./connection/postgres-connection";
const cors = require("@koa/cors");
import cloudinary from "cloudinary";
import koaBody from "koa-body";

const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(json());
app.use(cors());

//app.use(koaBody({ multipart: true, urlencoded: true }));

AppRoutes.initAppRoutes(router);
app.use(router.routes());

app.listen(3006, () => {
  console.log(`Applistening on the port 4000`);
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

export default app;
