import dotenv from "dotenv";
dotenv.config({ path: ".env" });

console.log("config", process.env.PG_HOST);
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
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  jwt: {
    key: process.env.JWT_KEY,
  },
};
