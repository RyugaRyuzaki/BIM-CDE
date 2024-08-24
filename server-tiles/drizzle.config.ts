import {defineConfig} from "drizzle-kit";
import env from "./src/config/env";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DB_URL,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
