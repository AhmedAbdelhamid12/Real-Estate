import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// GET /notifications
router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const currentUser = req.currentUser!;

  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, currentUser.id));

  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json(notifications);
});

// PATCH /notifications/:notificationId/read
router.patch(
  "/notifications/:notificationId/read",
  requireAuth,
  async (req, res): Promise<void> => {
    const { notificationId } = req.params as { notificationId: string };
    const currentUser = req.currentUser!;

    const [updated] = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(
        and(
          eq(notificationsTable.id, notificationId),
          eq(notificationsTable.userId, currentUser.id)
        )
      )
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.json(updated);
  }
);

// POST /notifications/read-all
router.post(
  "/notifications/read-all",
  requireAuth,
  async (req, res): Promise<void> => {
    const currentUser = req.currentUser!;

    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, currentUser.id));

    res.json({ success: true });
  }
);

export default router;
