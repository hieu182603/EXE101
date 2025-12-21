import path from "path";
import "dotenv/config";
import { DataSourceOptions } from "typeorm";

export default {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Admin123",

  database: process.env.DB_NAME || "TechnicalStore",

  synchronize: process.env.DB_SYNCHRONIZE || true,

  extra: {
    timezone: "+07:00",
  },

  entities: [path.join(__dirname, "../*/**/*.entity.{ts,js}")],

  cli: {
    entitiesDir: "src",
  },

  useGlobalDataConnection: true,
} as DataSourceOptions;
