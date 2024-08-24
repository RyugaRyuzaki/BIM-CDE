import {relations, sql} from "drizzle-orm";

import {
  varchar,
  serial,
  pgTable,
  uuid,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";
import {users} from "./users";
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
  },
  (t) => ({
    unq: unique().on(t.name),
  })
);
/**
 *
 */
export const projectMembers = pgTable(
  "projectMembers",
  {
    projectId: uuid("project_id")
      .references(() => projects.id, {onDelete: "cascade"})
      .notNull(),
    memberId: uuid("member_id")
      .references(() => users.id, {onDelete: "cascade"})
      .notNull(),
    role: varchar("role", {
      length: 255,
      enum: ["manager", "designer", "visiter"],
    })
      .notNull()
      .default("designer"),
  },
  (t) => ({
    pk: primaryKey({columns: [t.projectId, t.memberId]}),
  })
);

export const userRelations = relations(users, ({many}) => ({
  projects: many(projectMembers),
  models: many(models),
}));
/**
 *
 */
export const projectRelations = relations(projects, ({many}) => ({
  members: many(projectMembers),
  models: many(models),
}));

export const projectMemberRelations = relations(projectMembers, ({one}) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {fields: [projectMembers.memberId], references: [users.id]}),
}));
