import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { projectsTable } from "./projects";
import { leadsTable } from "./leads";

export const clientsTable = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").references(() => leadsTable.id),
    name: varchar("name", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    email: varchar("email", { length: 255 }),
    dealValue: numeric("deal_value", { precision: 15, scale: 2 }),
    projectId: uuid("project_id").references(() => projectsTable.id),
    assignedSalesId: uuid("assigned_sales_id").references(() => usersTable.id),
    notes: text("notes"),
    unitNumber: varchar("unit_number", { length: 50 }),
    unitType: varchar("unit_type", { length: 50 }),
    area: numeric("area", { precision: 10, scale: 2 }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    downPayment: numeric("down_payment", { precision: 15, scale: 2 }),
    contractDate: timestamp("contract_date", { withTimezone: true }),
    numberOfInstallments: integer("number_of_installments"),
    installmentAmount: numeric("installment_amount", { precision: 15, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("clients_assigned_sales_idx").on(table.assignedSalesId),
    index("clients_project_idx").on(table.projectId),
  ]
);

export const insertClientSchema = createInsertSchema(clientsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clientsTable.$inferSelect;
