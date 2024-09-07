import {defineConfig} from "drizzle-kit";
import env from "./src/config/env";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    host: env.POSTGRES_HOST,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    port: env.POSTGRES_PORT,
    database: env.POSTGRES_DB,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
