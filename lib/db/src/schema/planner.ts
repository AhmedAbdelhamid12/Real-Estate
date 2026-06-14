import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  date,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const plannerTasksTable = pgTable(
  "planner_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    notes: text("notes"),
    isDone: boolean("is_done").default(false).notNull(),
    priority: priorityEnum("priority").default("medium"),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("planner_tasks_user_date_idx").on(table.userId, table.date),
  ]
);

export const insertPlannerTaskSchema = createInsertSchema(plannerTasksTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPlannerTask = z.infer<typeof insertPlannerTaskSchema>;
export type PlannerTask = typeof plannerTasksTable.$inferSelect;
