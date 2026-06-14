import { db, rolePermissionsTable, userPermissionOverridesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { DEFAULT_ROLE_PERMISSIONS } from "./constants";

const memCache = new Map<string, { value: boolean; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(userId: string, permissionKey: string): string {
  return `perm:${userId}:${permissionKey}`;
}

export function invalidateUserCache(userId: string): void {
  for (const key of memCache.keys()) {
    if (key.startsWith(`perm:${userId}:`)) memCache.delete(key);
  }
}

export function invalidateRoleCache(role: string): void {
  memCache.clear();
}

export async function resolvePermission(
  userId: string,
  permissionKey: string,
  userRole?: string
): Promise<boolean> {
  const cacheKey = getCacheKey(userId, permissionKey);
  const cached = memCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.value;

  let role = userRole;
  if (!role) {
    const [user] = await db
      .select({ role: usersTable.role, status: usersTable.status })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!user || user.status !== "active") return false;
    role = user.role;
  }

  const [override] = await db
    .select()
    .from(userPermissionOverridesTable)
    .where(
      and(
        eq(userPermissionOverridesTable.userId, userId),
        eq(userPermissionOverridesTable.permissionKey, permissionKey)
      )
    )
    .limit(1);

  let result: boolean;
  if (override?.override === "deny") {
    result = false;
  } else if (override?.override === "allow") {
    result = true;
  } else {
    const [rp] = await db
      .select()
      .from(rolePermissionsTable)
      .where(
        and(
          eq(rolePermissionsTable.role, role as any),
          eq(rolePermissionsTable.permissionKey, permissionKey)
        )
      )
      .limit(1);
    result = rp?.isEnabled ?? DEFAULT_ROLE_PERMISSIONS[role]?.[permissionKey] ?? false;
  }

  memCache.set(cacheKey, { value: result, expires: Date.now() + CACHE_TTL_MS });
  return result;
}

export async function resolvePermissions(
  userId: string,
  permissionKeys: string[],
  userRole?: string
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  await Promise.all(
    permissionKeys.map(async (key) => {
      results[key] = await resolvePermission(userId, key, userRole);
    })
  );
  return results;
}

export async function getUserPermissionMap(
  userId: string,
  userRole: string
): Promise<Record<string, boolean>> {
  const allKeys = Object.values(await import("./constants").then((m) => m.PERMISSIONS));
  return resolvePermissions(userId, allKeys as string[], userRole);
}
