import { Router } from "express";
import { db, plannerTasksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// GET /planner
router.get("/planner", requireAuth, async (req, res): Promise<void> => {
  const { date, userId } = req.query as { date?: string; userId?: string };
  const currentUser = req.currentUser!;

  const targetUserId = userId ?? currentUser.id;

  let tasks = await db
    .select()
    .from(plannerTasksTable)
    .where(eq(plannerTasksTable.userId, targetUserId));

  if (date) {
    tasks = tasks.filter((t) => t.date === date);
  }

  tasks.sort((a, b) => a.position - b.position);

  res.json(tasks);
});

// POST /planner
router.post("/planner", requireAuth, async (req, res): Promise<void> => {
  const { date, title, notes, priority, userId } = req.body as Record<string, string | null>;
  const currentUser = req.currentUser!;

  if (!date || !title) {
    res.status(400).json({ error: "date and title required" });
    return;
  }

  const existingTasks = await db
    .select()
    .from(plannerTasksTable)
    .where(
      and(
        eq(plannerTasksTable.userId, userId ?? currentUser.id),
        eq(plannerTasksTable.date, date)
      )
    );

  const [task] = await db
    .insert(plannerTasksTable)
    .values({
      userId: userId ?? currentUser.id,
      date,
      title,
      notes: notes ?? null,
      priority: (priority as "medium") ?? "medium",
      position: existingTasks.length,
    })
    .returning();

  res.status(201).json(task);
});

// PATCH /planner/:taskId
router.patch("/planner/:taskId", requireAuth, async (req, res): Promise<void> => {
  const { taskId } = req.params as { taskId: string };
  const body = req.body as Record<string, unknown>;

  const updateData: Record<string, unknown> = {};
  if ("title" in body) updateData.title = body.title;
  if ("notes" in body) updateData.notes = body.notes;
  if ("isDone" in body) updateData.is_done = body.isDone;
  if ("priority" in body) updateData.priority = body.priority;
  if ("position" in body) updateData.position = body.position;

  const [updated] = await db
    .update(plannerTasksTable)
    .set(updateData)
    .where(eq(plannerTasksTable.id, taskId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(updated);
});

// DELETE /planner/:taskId
router.delete("/planner/:taskId", requireAuth, async (req, res): Promise<void> => {
  const { taskId } = req.params as { taskId: string };
  await db.delete(plannerTasksTable).where(eq(plannerTasksTable.id, taskId));
  res.sendStatus(204);
});

export default router;
