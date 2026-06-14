import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq, gt } from "drizzle-orm";
import type { Request } from "express";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessionsTable).values({ userId, token, expiresAt });
  return token;
}

export async function getUserFromRequest(req: Request) {
  const token =
    req.cookies?.["session"] ??
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) return null;

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      eq(sessionsTable.token, token)
    )
    .limit(1);

  if (!session) return null;
  if (session.expiresAt < new Date()) return null;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);

  return user ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
}
