import {
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { leadsTable } from "./leads";

export const leadAssignmentsTable = pgTable(
  "lead_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").notNull().references(() => leadsTable.id, { onDelete: "cascade" }),
    assignedTo: uuid("assigned_to").notNull().references(() => usersTable.id),
    assignedBy: uuid("assigned_by").references(() => usersTable.id),
    isActive: boolean("is_active").notNull().default(true),
    hiddenFields: jsonb("hidden_fields").$type<string[]>().default([]),
    note: text("note"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
    unassignedAt: timestamp("unassigned_at", { withTimezone: true }),
  },
  (table) => [
    index("lead_assignments_lead_idx").on(table.leadId),
    index("lead_assignments_user_idx").on(table.assignedTo),
    index("lead_assignments_active_idx").on(table.isActive),
  ]
);

export type LeadAssignment = typeof leadAssignmentsTable.$inferSelect;
