import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { usersTable, roleEnum } from "./users";

export const overrideTypeEnum = pgEnum("override_type", ["allow", "deny"]);

export const permissionsTable = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 100 }).notNull().unique(),
    label: varchar("label", { length: 200 }).notNull(),
    description: text("description"),
    module: varchar("module", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("permissions_key_idx").on(table.key),
    index("permissions_module_idx").on(table.module),
  ]
);

export const rolePermissionsTable = pgTable(
  "role_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    role: roleEnum("role").notNull(),
    permissionKey: varchar("permission_key", { length: 100 }).notNull(),
    isEnabled: boolean("is_enabled").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    updatedBy: uuid("updated_by").references(() => usersTable.id),
  },
  (table) => [
    index("role_permissions_role_idx").on(table.role),
    index("role_permissions_key_idx").on(table.permissionKey),
    unique("role_permissions_role_key_unique").on(table.role, table.permissionKey),
  ]
);

export const userPermissionOverridesTable = pgTable(
  "user_permission_overrides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    permissionKey: varchar("permission_key", { length: 100 }).notNull(),
    override: overrideTypeEnum("override").notNull(),
    reason: text("reason"),
    setBy: uuid("set_by").references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("user_perm_overrides_user_idx").on(table.userId),
    index("user_perm_overrides_key_idx").on(table.permissionKey),
  ]
);

export type Permission = typeof permissionsTable.$inferSelect;
export type RolePermission = typeof rolePermissionsTable.$inferSelect;
export type UserPermissionOverride = typeof userPermissionOverridesTable.$inferSelect;
