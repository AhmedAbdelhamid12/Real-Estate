import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { projectsTable } from "./projects";

export const resaleUnitsTable = pgTable(
  "resale_units",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").references(() => projectsTable.id),
    projectName: varchar("project_name", { length: 200 }).notNull(),
    area: numeric("area", { precision: 10, scale: 2 }),
    price: numeric("price", { precision: 15, scale: 2 }),
    floor: integer("floor"),
    unitType: varchar("unit_type", { length: 100 }),
    description: text("description"),
    ownerName: varchar("owner_name", { length: 200 }),
    ownerPhone: varchar("owner_phone", { length: 30 }),
    ownerEmail: varchar("owner_email", { length: 255 }),
    ownerNotes: text("owner_notes"),
    isOwnerPhoneHidden: boolean("is_owner_phone_hidden").default(false).notNull(),
    isOwnerEmailHidden: boolean("is_owner_email_hidden").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    assignedTo: uuid("assigned_to").references(() => usersTable.id),
    createdBy: uuid("created_by").references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("resale_units_project_idx").on(table.projectId),
    index("resale_units_is_active_idx").on(table.isActive),
  ]
);

export const insertResaleUnitSchema = createInsertSchema(resaleUnitsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertResaleUnit = z.infer<typeof insertResaleUnitSchema>;
export type ResaleUnit = typeof resaleUnitsTable.$inferSelect;
