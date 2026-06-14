import {
  pgTable,
  uuid,
  integer,
  numeric,
  timestamp,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const salesTargetsTable = pgTable(
  "sales_targets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    period: varchar("period", { length: 7 }).notNull(),
    leadsTarget: integer("leads_target").default(0),
    dealsTarget: integer("deals_target").default(0),
    revenueTarget: numeric("revenue_target", { precision: 14, scale: 2 }).default("0"),
    leadsAchieved: integer("leads_achieved").default(0),
    dealsAchieved: integer("deals_achieved").default(0),
    revenueAchieved: numeric("revenue_achieved", { precision: 14, scale: 2 }).default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("sales_targets_user_idx").on(table.userId),
    index("sales_targets_period_idx").on(table.period),
  ]
);

export type SalesTarget = typeof salesTargetsTable.$inferSelect;
