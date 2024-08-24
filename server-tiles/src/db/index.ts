import env from "../config/env";

import {drizzle, NodePgDatabase} from "drizzle-orm/node-postgres";
import {Client} from "pg";
import * as schema from "./schema";
const client = new Client({
  connectionString: env.DB_URL!,
  ssl: false,
});
export const db: NodePgDatabase<typeof schema> = drizzle(client, {
  schema,
  logger: true,
});
export const dbConnect = async () => {
  await client.connect();
};
