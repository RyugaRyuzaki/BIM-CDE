import {sql} from "drizzle-orm";
import {
  text,
  varchar,
  timestamp,
  pgTable,
  uuid,
  unique,
  index,
} from "drizzle-orm/pg-core";

/**
 *
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    username: varchar("username", {length: 255}).notNull(),
    email: varchar("email", {length: 255}).notNull(),
    password: varchar("password", {length: 255}).notNull(),
    phone: varchar("phone", {length: 255}),
    avatar: text("avatar"),
    role: text("role", {enum: ["manager", "member", "owner"]})
      .notNull()
      .default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    unq: unique().on(t.username, t.email),
    emailIdx: index("users_email_idx").on(t.email),
    usernameIdx: index("users_username_idx").on(t.username),
  })
);
