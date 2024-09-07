import {relations, sql} from "drizzle-orm";

import {varchar, pgTable, uuid, index} from "drizzle-orm/pg-core";
import {models} from "./models";

/**
 *
 */
export const projects = pgTable(
  "projects",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", {length: 255}).notNull(),
    address: varchar("address", {length: 255}),
    userId: varchar("user_id", {length: 255}).notNull(),
  },
  (t) => ({
    userIdx: index("user_id_idx").on(t.userId),
  })
);
/**
 *
 */
export const projectRelations = relations(projects, ({many}) => ({
  models: many(models),
}));
