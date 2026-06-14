import { db, auditLogsTable } from "@workspace/db";
import type { Request } from "express";

export async function auditLog(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
  req?: Request;
}): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      before: params.before ? JSON.parse(JSON.stringify(params.before)) : null,
      after: params.after ? JSON.parse(JSON.stringify(params.after)) : null,
      metadata: params.metadata ?? null,
      ipAddress:
        params.req?.headers?.["x-forwarded-for"]?.toString().split(",")[0] ??
        params.req?.socket?.remoteAddress ??
        null,
      userAgent: params.req?.headers?.["user-agent"] ?? null,
    });
  } catch (err) {
    console.error("[audit] Failed to write audit log:", err);
  }
}
