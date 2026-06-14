import type { User } from "@workspace/db";

const SENSITIVE_FIELDS = [
  "passwordHash",
  "verifyToken",
  "verifyTokenExpires",
  "resetToken",
  "resetTokenExpires",
  "oauthId",
] as const;

export function sanitizeUser(user: User | Record<string, unknown>) {
  const result = { ...user } as Record<string, unknown>;
  for (const field of SENSITIVE_FIELDS) {
    delete result[field];
  }
  return result;
}
