import {sql} from "drizzle-orm";
import {text, serial, pgTable, uuid} from "drizzle-orm/pg-core";
import {models} from "./models";
import {users} from "./users";

/**
 *
 */
export const bcf = pgTable("bcf", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  modelId: uuid("model_id").references(() => models.id),
  versionId: uuid("version_id").default(sql`gen_random_uuid()`),
  createById: uuid("create_by_id").references(() => users.id),
  issueById: uuid("issue_by_id").references(() => users.id),
  url: text("url").notNull(),
});
