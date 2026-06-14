import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { leadsTable } from "./leads";

export const delayStatusEnum = pgEnum("delay_status", [
  "pending",
  "approved",
  "rejected",
]);

export const leadDelaysTable = pgTable(
  "lead_delays",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").notNull().references(() => leadsTable.id, { onDelete: "cascade" }),
    requestedBy: uuid("requested_by").notNull().references(() => usersTable.id),
    reason: text("reason").notNull(),
    delayUntil: timestamp("delay_until", { withTimezone: true }).notNull(),
    status: delayStatusEnum("status").notNull().default("pending"),
    reviewedBy: uuid("reviewed_by").references(() => usersTable.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNote: text("review_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("lead_delays_lead_idx").on(table.leadId),
    index("lead_delays_status_idx").on(table.status),
    index("lead_delays_requested_by_idx").on(table.requestedBy),
  ]
);

export type LeadDelay = typeof leadDelaysTable.$inferSelect;
