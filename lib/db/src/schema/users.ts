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

export const roleEnum = pgEnum("role", [
  "ceo",
  "admin",
  "director",
  "team_leader",
  "sales",
]);

export const userStatusEnum = pgEnum("user_status", [
  "pending",
  "active",
  "rejected",
  "suspended",
]);

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash"),
    role: roleEnum("role").notNull().default("sales"),
    status: userStatusEnum("status").notNull().default("pending"),
    avatarUrl: text("avatar_url"),
    title: varchar("title", { length: 100 }),
    phone: varchar("phone", { length: 20 }),
    bio: text("bio"),
    teamLeaderId: uuid("team_leader_id"),
    isOnline: boolean("is_online").default(false).notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    // Email verification
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    verifyToken: varchar("verify_token", { length: 10 }),
    verifyTokenExpires: timestamp("verify_token_expires", { withTimezone: true }),
    // Password reset
    resetToken: text("reset_token"),
    resetTokenExpires: timestamp("reset_token_expires", { withTimezone: true }),
    // Social links
    instagramUrl: text("instagram_url"),
    facebookUrl: text("facebook_url"),
    whatsappNumber: varchar("whatsapp_number", { length: 30 }),
    // OAuth
    oauthProvider: varchar("oauth_provider", { length: 20 }),
    oauthId: varchar("oauth_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("users_role_idx").on(table.role),
    index("users_status_idx").on(table.status),
    index("users_team_leader_idx").on(table.teamLeaderId),
    index("users_oauth_idx").on(table.oauthProvider, table.oauthId),
  ]
);

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
