import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import { AppRoutes } from "./routes";
import json from 'koa-json';
// import { pgConnection } from "./connection/postgres-connection";
import { PostgresDbConnection } from "./connection/postgres-connection";


const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(json());

AppRoutes.initAppRoutes(router);
app.use(router.routes());

app.listen(4000, () => {
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


export default app;
