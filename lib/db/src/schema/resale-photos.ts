import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { resaleUnitsTable } from "./resale";

export const resalePhotosTable = pgTable(
  "resale_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    unitId: uuid("unit_id").notNull().references(() => resaleUnitsTable.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    caption: text("caption"),
    sortOrder: integer("sort_order").default(0).notNull(),
    uploadedBy: uuid("uploaded_by").references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("resale_photos_unit_idx").on(table.unitId),
  ]
);

export type ResalePhoto = typeof resalePhotosTable.$inferSelect;
