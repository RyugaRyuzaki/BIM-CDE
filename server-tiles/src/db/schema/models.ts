import {relations, sql} from "drizzle-orm";
import {
  varchar,
  pgTable,
  uuid,
  integer,
  json,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import {projects} from "./projects";

/**
 *
 */
export const models = pgTable("models", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", {length: 255}).notNull(),
  projectId: uuid("project_id").references(() => projects.id),
});
/**
 *
 */
export const modelProperties = pgTable(
  "modelProperties",
  {
    modelId: uuid("model_id").references(() => models.id),
    expressID: integer("express_id").notNull(),
    data: json("element_data").notNull(),
  },
  (t) => ({
    pk: primaryKey({columns: [t.expressID, t.modelId]}),
    modelIdx: index("model_id_idx").on(t.modelId),
  })
);

export const modelRelations = relations(models, ({one, many}) => ({
  // one model belong one project
  project: one(projects, {
    fields: [models.projectId],
    references: [projects.id],
  }),
}));
