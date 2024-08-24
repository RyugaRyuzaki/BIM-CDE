import {sql} from "drizzle-orm";
import {text, serial, pgTable, uuid} from "drizzle-orm/pg-core";
import {users} from "./users";

/**
 *
 */
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  avatarUrl: text("avatar_url").notNull(),
});
