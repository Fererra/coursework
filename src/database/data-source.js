import dotenv from "dotenv";

import { DataSource } from "typeorm";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isTest = process.env.NODE_ENV === "test";
const envFile = isTest ? ".env.test" : ".env";
dotenv.config({ path: envFile });

const AppDataSource = new DataSource({
  type: process.env.DB_TYPE || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "testcinemadb",
  entities: [__dirname + "/entities/*.entity.js"],
  migrations: [__dirname + "/migrations/*.js"],
  synchronize: isTest ? true : false,
  logging: true,
  migrationsRun: true,
});

export default AppDataSource;
