import { DataSource } from "typeorm";
import { configData } from "../config/config";

export class PostgresDbConnection {
  public static connect() {
    const pgConnection: DataSource = new DataSource({
      type: "postgres",
      host: configData.pg.host,
      port: configData.pg.port,
      username: configData.pg.userName,
      password: configData.pg.password,
      database: configData.pg.db,
      synchronize: configData.pg.sync,
      entities: configData.pg.entities,
      // logging: true,
      schema: configData.pg.schema,
      //ssl:true
    });
    console.log(typeof pgConnection);
    pgConnection
      .initialize()
      .then(() => {
        console.log("DB Connection is Successful");
      })
      .catch((error: any) => {
        throw error;
        // console.log("Error in Connection DB Connection is Successful");
      });
  }
}
