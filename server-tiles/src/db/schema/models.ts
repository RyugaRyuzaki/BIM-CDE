import {relations, sql} from "drizzle-orm";
import {
  varchar,
  pgTable,
  uuid,
  integer,
  json,
  primaryKey,
  index,
  numeric,
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
export const modelMetadata = pgTable("modelMetadata", {
  modelId: uuid("model_id")
    .references(() => models.id)
    .primaryKey()
    .notNull(),
  xCoord: numeric("x_coord", {precision: 100}).notNull(),
  yCoord: numeric("y_coord", {precision: 100}).notNull(),
  zCoord: numeric("z_coord", {precision: 100}).notNull(),
  rotation: numeric("rotation", {precision: 100}).notNull(),
  lng: numeric("lng", {precision: 100}).notNull(),
  lat: numeric("lat", {precision: 100}).notNull(),
});

export const modelRelations = relations(models, ({one}) => ({
  // one model belong one project
  project: one(projects, {
    fields: [models.projectId],
    references: [projects.id],
  }),
  meta: one(modelMetadata, {
    fields: [models.id],
    references: [modelMetadata.modelId],
  }),
}));
