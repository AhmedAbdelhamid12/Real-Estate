import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { sanitizeUser } from "../lib/sanitize";

const router = Router();

// GET /users
router.get("/users", requireAuth, async (req, res): Promise<void> => {
  const { role, status } = req.query as { role?: string; status?: string };

  let users = await db.select().from(usersTable);

  if (role) users = users.filter((u) => u.role === role);
  if (status) users = users.filter((u) => u.status === status);

  res.json(users.map(sanitizeUser));
});

// GET /users/pending
router.get("/users/pending", requireAuth, async (req, res): Promise<void> => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.status, "pending"));

  res.json(users.map(sanitizeUser));
});

// GET /users/:userId
router.get("/users/:userId", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req.params as { userId: string };

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(sanitizeUser(user));
});

// PATCH /users/:userId
router.patch("/users/:userId", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req.params as { userId: string };
  const { name, phone, title, bio, role, status, teamLeaderId, avatarUrl, instagramUrl, facebookUrl, whatsappNumber } = req.body as Record<string, string | null>;

  const updateData: Record<string, unknown> = {};
  if (name != null) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (title !== undefined) updateData.title = title;
  if (bio !== undefined) updateData.bio = bio;
  if (role != null) updateData.role = role;
  if (status != null) updateData.status = status;
  if (teamLeaderId !== undefined) updateData.teamLeaderId = teamLeaderId;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
  if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
  if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl;
  if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;

  const [updated] = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(sanitizeUser(updated));
});

// DELETE /users/:userId
router.delete("/users/:userId", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req.params as { userId: string };

  await db.delete(usersTable).where(eq(usersTable.id, userId));
  res.sendStatus(204);
});

// POST /users/:userId/approve
router.post("/users/:userId/approve", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req.params as { userId: string };
  const currentUser = req.currentUser!;

  const [updated] = await db
    .update(usersTable)
    .set({
      status: "active",
      approvedBy: currentUser.id,
      approvedAt: new Date(),
    })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(sanitizeUser(updated));
});

// POST /users/:userId/reject
router.post("/users/:userId/reject", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req.params as { userId: string };
  const { reason } = req.body as { reason?: string };

  const [updated] = await db
    .update(usersTable)
    .set({
      status: "rejected",
      rejectedAt: new Date(),
      rejectionReason: reason ?? null,
    })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(sanitizeUser(updated));
});

export default router;
