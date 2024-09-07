import {sql} from "drizzle-orm";
import {text, serial, pgTable, uuid} from "drizzle-orm/pg-core";
import {models} from "./models";

/**
 *
 */
export const bcf = pgTable("bcf", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  modelId: uuid("model_id").references(() => models.id),
  versionId: uuid("version_id").default(sql`gen_random_uuid()`),
  createById: text("create_by_id"),
  issueById: text("issue_by_id"),
  url: text("url").notNull(),
});
