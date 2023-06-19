import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export const configData = {
  pg: {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    userName: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    db: process.env.PG_DATABASE,
    sync: Boolean(process.env.PG_SYNCHRONIZE) || true,
    entities: [...["src/entities/**/*-entity.ts"]],
    schema: process.env.PG_SCHEMA,
  },
  jwt: {
    key: process.env.JWT_KEY
  }
};
