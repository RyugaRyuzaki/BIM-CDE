import {createClient, SetOptions} from "redis";
import {createClerkClient} from "@clerk/backend";
import {drizzle, NodePgDatabase} from "drizzle-orm/node-postgres";
import {Webhook} from "svix";
import mongoose from "mongoose";
import {Client} from "pg";
import env from "../config/env";
import * as schema from "./schema";
import {createClerkExpressWithAuth} from "@clerk/clerk-sdk-node";
const client = new Client({
  connectionString: env.DB_URL!,
  ssl: false,
});
/**
 *
 */
export const db: NodePgDatabase<typeof schema> = drizzle(client, {
  schema,
  logger: true,
});
/**
 *
 */
export const redisClient = createClient({
  legacyMode: false,
  socket: {
    host: env.REDIS_HOST,
    port: +env.REDIS_PORT,
    connectTimeout: 5000,
  },
});
export const configRedis: SetOptions = {
  EX: 60 * 60 * 24 * 7,
};
/**
 *
 */
export const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
});

export const clerkMiddleware = createClerkExpressWithAuth({
  clerkClient,
});
/**
 *
 */
export const svixWh = new Webhook(env.CLERK_WEBHOOK_SECRET_KEY);
/**
 *
 */
export const dbConnect = async () => {
  await client.connect();
  await redisClient.connect();
  await mongoose.connect(
    `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/bimtiles`,
    {connectTimeoutMS: 3000}
  );
};
