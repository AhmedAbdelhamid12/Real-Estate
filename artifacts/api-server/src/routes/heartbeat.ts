import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const lastDbUpdate = new Map<string, number>();
const DB_SYNC_INTERVAL = 5 * 60 * 1000;

// POST /heartbeat — client pings every 30s
router.post("/heartbeat", requireAuth, async (req, res): Promise<void> => {
  const userId = req.currentUser!.id;
  const now = Date.now();
  const lastUpdate = lastDbUpdate.get(userId) ?? 0;

  if (now - lastUpdate > DB_SYNC_INTERVAL) {
    await db
      .update(usersTable)
      .set({ isOnline: true, lastActiveAt: new Date() })
      .where(eq(usersTable.id, userId));
    lastDbUpdate.set(userId, now);
  }

  res.json({ ok: true, timestamp: now });
});

// Background job: mark users offline if no heartbeat in 35s
setInterval(async () => {
  const cutoff = new Date(Date.now() - 35_000);
  try {
    await db
      .update(usersTable)
      .set({ isOnline: false })
      .where(eq(usersTable.lastActiveAt, cutoff));
  } catch {
    // ignore
  }
}, 30_000);

export default router;
