import { Router } from "express";
import { db, rolePermissionsTable, userPermissionOverridesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { withPermission, withRole } from "@workspace/permissions";
import { invalidateUserCache, invalidateRoleCache, DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, getUserPermissionMap } from "@workspace/permissions";
import { auditLog } from "../lib/audit";

const router = Router();

// GET /permissions/matrix — full role→permission matrix (admin+)
router.get("/permissions/matrix", requireAuth, withPermission("permissions.manage"), async (req, res): Promise<void> => {
  const dbRolePerms = await db.select().from(rolePermissionsTable);
  const roles = ["ceo", "admin", "director", "team_leader", "sales"];
  const allKeys = Object.values(PERMISSIONS);

  const matrix: Record<string, Record<string, boolean>> = {};
  for (const role of roles) {
    matrix[role] = { ...DEFAULT_ROLE_PERMISSIONS[role] };
    for (const rp of dbRolePerms.filter((r) => r.role === role)) {
      matrix[role][rp.permissionKey] = rp.isEnabled;
    }
    for (const key of allKeys) {
      if (!(key in matrix[role])) matrix[role][key] = false;
    }
  }

  res.json({ matrix });
});

// PATCH /permissions/role/:role — update a role's permission
router.patch("/permissions/role/:role", requireAuth, withPermission("permissions.manage"), async (req, res): Promise<void> => {
  const { role } = req.params as { role: string };
  const { permissionKey, isEnabled } = req.body as { permissionKey: string; isEnabled: boolean };
  const currentUser = req.currentUser!;

  const validRoles = ["admin", "director", "team_leader", "sales"];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  await db
    .insert(rolePermissionsTable)
    .values({ role: role as any, permissionKey, isEnabled, updatedBy: currentUser.id })
    .onConflictDoUpdate({
      target: [rolePermissionsTable.role, rolePermissionsTable.permissionKey],
      set: { isEnabled, updatedBy: currentUser.id, updatedAt: new Date() },
    });

  invalidateRoleCache(role);

  await auditLog({
    userId: currentUser.id,
    action: "update_role_permission",
    entityType: "role_permission",
    after: { role, permissionKey, isEnabled },
    req,
  });

  res.json({ ok: true });
});

// GET /permissions/user/:userId — get user's effective permissions
router.get("/permissions/user/:userId", requireAuth, withPermission("permissions.manage"), async (req, res): Promise<void> => {
  const { userId } = req.params as { userId: string };

  const [user] = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [permMap, overrides] = await Promise.all([
    getUserPermissionMap(userId, user.role),
    db.select().from(userPermissionOverridesTable).where(eq(userPermissionOverridesTable.userId, userId)),
  ]);

  res.json({ permissions: permMap, overrides, role: user.role });
});

// POST /permissions/user/:userId/override — set override
router.post("/permissions/user/:userId/override", requireAuth, withPermission("permissions.manage"), async (req, res): Promise<void> => {
  const { userId } = req.params as { userId: string };
  const { permissionKey, override, reason } = req.body as { permissionKey: string; override: "allow" | "deny" | null; reason?: string };
  const currentUser = req.currentUser!;

  if (override === null) {
    await db
      .delete(userPermissionOverridesTable)
      .where(and(eq(userPermissionOverridesTable.userId, userId), eq(userPermissionOverridesTable.permissionKey, permissionKey)));
  } else {
    await db
      .insert(userPermissionOverridesTable)
      .values({ userId, permissionKey, override, reason: reason ?? null, setBy: currentUser.id })
      .onConflictDoUpdate({
        target: [userPermissionOverridesTable.userId, userPermissionOverridesTable.permissionKey],
        set: { override, reason: reason ?? null, setBy: currentUser.id, updatedAt: new Date() },
      });
  }

  invalidateUserCache(userId);

  await auditLog({
    userId: currentUser.id,
    action: "set_user_permission_override",
    entityType: "user_permission_override",
    entityId: userId,
    after: { permissionKey, override, reason },
    req,
  });

  res.json({ ok: true });
});

// GET /permissions/me — current user's permissions
router.get("/permissions/me", requireAuth, async (req, res): Promise<void> => {
  const currentUser = req.currentUser!;
  const permMap = await getUserPermissionMap(currentUser.id, currentUser.role);
  res.json({ permissions: permMap, role: currentUser.role });
});

export default router;
