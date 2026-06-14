import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const projectsTable = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    ownerName: varchar("owner_name", { length: 200 }),
    location: text("location"),
    description: text("description"),
    avgPrice: numeric("avg_price", { precision: 15, scale: 2 }),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: uuid("created_by").references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("projects_is_active_idx").on(table.isActive),
  ]
);

export const insertProjectSchema = createInsertSchema(projectsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
