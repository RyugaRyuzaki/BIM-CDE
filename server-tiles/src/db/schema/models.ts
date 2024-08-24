import {relations, sql} from "drizzle-orm";
import {varchar, pgTable, uuid} from "drizzle-orm/pg-core";
import {users} from "./users";
import {projects} from "./projects";

/**
 *
 */
export const models = pgTable("models", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", {length: 255}).notNull(),
  versionId: uuid("version_id")
    .notNull()
    .default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id),
  ownerHistory: uuid("owner_history").references(() => users.id),
});
export const modelRelations = relations(models, ({one}) => ({
  // one model belong one project
  project: one(projects, {
    fields: [models.projectId],
    references: [projects.id],
  }),

  // one model belong one user
  owner: one(users, {
    fields: [models.ownerHistory],
    references: [users.id],
  }),
}));
