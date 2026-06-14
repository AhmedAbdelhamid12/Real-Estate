import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { projectsTable } from "./projects";

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "called",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);

export const leadSourceEnum = pgEnum("lead_source", [
  "manual",
  "import",
  "campaign",
  "referral",
  "website",
  "social",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "call",
  "message",
  "meeting",
  "email",
  "note",
  "status_change",
]);

export const leadsTable = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    email: varchar("email", { length: 255 }),
    source: leadSourceEnum("source").default("manual"),
    status: leadStatusEnum("status").notNull().default("new"),
    projectId: uuid("project_id").references(() => projectsTable.id),
    primarySalesId: uuid("primary_sales_id").references(() => usersTable.id),
    notes: text("notes"),
    outcome: text("outcome"),
    nextAction: text("next_action"),
    nextActionAt: timestamp("next_action_at", { withTimezone: true }),
    deadline: timestamp("deadline", { withTimezone: true }),
    delayedUntil: timestamp("delayed_until", { withTimezone: true }),
    lastActionAt: timestamp("last_action_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("leads_status_idx").on(table.status),
    index("leads_project_idx").on(table.projectId),
    index("leads_primary_sales_idx").on(table.primarySalesId),
    index("leads_created_at_idx").on(table.createdAt),
  ]
);

export const leadActivitiesTable = pgTable(
  "lead_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leadsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id),
    type: activityTypeEnum("type").notNull(),
    notes: text("notes"),
    outcome: text("outcome"),
    nextAction: text("next_action"),
    nextActionAt: timestamp("next_action_at", { withTimezone: true }),
    duration: text("duration"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("lead_activities_lead_idx").on(table.leadId),
    index("lead_activities_user_idx").on(table.userId),
    index("lead_activities_created_at_idx").on(table.createdAt),
  ]
);

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
export type LeadActivity = typeof leadActivitiesTable.$inferSelect;
