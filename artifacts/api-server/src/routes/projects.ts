import { Router } from "express";
import { db, projectsTable, leadsTable, clientsTable } from "@workspace/db";
import { eq, isNotNull } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { sql } from "drizzle-orm";

const router = Router();

// GET /projects
router.get("/projects", requireAuth, async (req, res): Promise<void> => {
  const projects = await db
    .select({
      project: projectsTable,
      leadsCount: sql<number>`(SELECT COUNT(*) FROM leads WHERE leads.project_id = ${projectsTable.id})`.as("leadsCount"),
    })
    .from(projectsTable);

  res.json(
    projects.map((r) => ({
      ...r.project,
      leadsCount: Number(r.leadsCount),
    }))
  );
});

// POST /projects
router.post("/projects", requireAuth, async (req, res): Promise<void> => {
  const { name, ownerName, location, description, avgPrice, imageUrl } = req.body as Record<string, string | null>;
  const currentUser = req.currentUser!;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const [project] = await db
    .insert(projectsTable)
    .values({
      name,
      ownerName: ownerName ?? null,
      location: location ?? null,
      description: description ?? null,
      avgPrice: avgPrice ?? null,
      imageUrl: imageUrl ?? null,
      createdBy: currentUser.id,
    })
    .returning();

  res.status(201).json({ ...project, leadsCount: 0 });
});

// GET /projects/:projectId
router.get("/projects/:projectId", requireAuth, async (req, res): Promise<void> => {
  const { projectId } = req.params as { projectId: string };

  const [row] = await db
    .select({
      project: projectsTable,
      leadsCount: sql<number>`(SELECT COUNT(*) FROM leads WHERE leads.project_id = ${projectsTable.id})`.as("leadsCount"),
    })
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json({ ...row.project, leadsCount: Number(row.leadsCount) });
});

// PATCH /projects/:projectId
router.patch("/projects/:projectId", requireAuth, async (req, res): Promise<void> => {
  const { projectId } = req.params as { projectId: string };
  const body = req.body as Record<string, unknown>;

  const updateData: Record<string, unknown> = {};
  const fields = ["name", "ownerName", "location", "description", "avgPrice", "imageUrl", "isActive"];
  for (const f of fields) {
    if (f in body) updateData[f] = body[f] === null ? null : body[f];
  }

  const [updated] = await db
    .update(projectsTable)
    .set(updateData)
    .where(eq(projectsTable.id, projectId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json({ ...updated, leadsCount: 0 });
});

// DELETE /projects/:projectId
router.delete("/projects/:projectId", requireAuth, async (req, res): Promise<void> => {
  const { projectId } = req.params as { projectId: string };

  // Detach leads and clients before deleting to avoid FK constraint errors
  await db.update(leadsTable).set({ projectId: null }).where(eq(leadsTable.projectId, projectId));
  await db.update(clientsTable).set({ projectId: null }).where(eq(clientsTable.projectId, projectId));

  await db.delete(projectsTable).where(eq(projectsTable.id, projectId));
  res.sendStatus(204);
});

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export default router;
