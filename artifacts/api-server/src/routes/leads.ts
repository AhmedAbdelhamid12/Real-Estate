import { Router } from "express";
import { db, leadsTable, leadActivitiesTable, usersTable, projectsTable, notificationsTable } from "@workspace/db";
import { eq, ilike, and, isNull } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import multer from "multer";
import XLSX from "xlsx";
import { sendLeadAssignedEmail, sendLeadStatusChangedEmail } from "../lib/email";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

const STATUSES = ["new", "called", "qualified", "proposal", "negotiation", "won", "lost"] as const;

function getAppUrl(req: { headers: { host?: string } }): string {
  if (process.env["APP_URL"]) return process.env["APP_URL"];
  const protocol = process.env["NODE_ENV"] === "production" ? "https" : "http";
  return `${protocol}://${req.headers.host ?? "localhost"}`;
}

// GET /leads
router.get("/leads", requireAuth, async (req, res): Promise<void> => {
  const { status, projectId, search } = req.query as Record<string, string>;

  let allLeads = await db
    .select({
      lead: leadsTable,
      projectName: projectsTable.name,
      primarySalesName: usersTable.name,
    })
    .from(leadsTable)
    .leftJoin(projectsTable, eq(leadsTable.projectId, projectsTable.id))
    .leftJoin(usersTable, eq(leadsTable.primarySalesId, usersTable.id));

  if (status) allLeads = allLeads.filter((r) => r.lead.status === status);
  if (projectId) allLeads = allLeads.filter((r) => r.lead.projectId === projectId);
  if (search) {
    const q = search.toLowerCase();
    allLeads = allLeads.filter(
      (r) =>
        r.lead.name.toLowerCase().includes(q) ||
        (r.lead.phone ?? "").includes(q)
    );
  }

  res.json(
    allLeads.map((r) => ({
      ...r.lead,
      projectName: r.projectName ?? null,
      primarySalesName: r.primarySalesName ?? null,
    }))
  );
});

// GET /leads/kanban
router.get("/leads/kanban", requireAuth, async (req, res): Promise<void> => {
  const allLeads = await db
    .select({
      lead: leadsTable,
      projectName: projectsTable.name,
      primarySalesName: usersTable.name,
    })
    .from(leadsTable)
    .leftJoin(projectsTable, eq(leadsTable.projectId, projectsTable.id))
    .leftJoin(usersTable, eq(leadsTable.primarySalesId, usersTable.id));

  const enriched = allLeads.map((r) => ({
    ...r.lead,
    projectName: r.projectName ?? null,
    primarySalesName: r.primarySalesName ?? null,
  }));

  const columns = STATUSES.map((status) => ({
    status,
    leads: enriched.filter((l) => l.status === status),
  }));

  res.json({ columns });
});

// POST /leads
router.post("/leads", requireAuth, async (req, res): Promise<void> => {
  const { name, phone, email, source, status, projectId, notes, deadline, primarySalesId } = req.body as Record<string, string | null>;
  const currentUser = req.currentUser!;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const [lead] = await db
    .insert(leadsTable)
    .values({
      name,
      phone: phone ?? null,
      email: email ?? null,
      source: (source as "manual") ?? "manual",
      status: (status as "new") ?? "new",
      projectId: projectId ?? null,
      notes: notes ?? null,
      deadline: deadline ? new Date(deadline) : null,
      primarySalesId: primarySalesId ?? null,
      createdBy: currentUser.id,
    })
    .returning();

  // Notify assigned sales rep
  if (primarySalesId) {
    const appUrl = getAppUrl(req);
    const [salesUser, project] = await Promise.all([
      db.select().from(usersTable).where(eq(usersTable.id, primarySalesId)).limit(1).then(r => r[0]),
      projectId ? db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1).then(r => r[0]) : Promise.resolve(null),
    ]);

    if (salesUser) {
      // In-app notification
      db.insert(notificationsTable).values({
        userId: salesUser.id,
        type: "lead_assigned",
        titleEn: "New Lead Assigned",
        bodyEn: `You have been assigned a new lead: ${name}.`,
        link: `/leads/${lead.id}`,
      }).catch(() => {});

      // Email notification
      sendLeadAssignedEmail(
        salesUser.email,
        salesUser.name,
        name,
        phone ?? "N/A",
        project?.name ?? null,
        appUrl
      ).catch(() => {});
    }
  }

  res.status(201).json({ ...lead, projectName: null, primarySalesName: null });
});

// GET /leads/:leadId
router.get("/leads/:leadId", requireAuth, async (req, res): Promise<void> => {
  const { leadId } = req.params as { leadId: string };

  const [row] = await db
    .select({
      lead: leadsTable,
      projectName: projectsTable.name,
      primarySalesName: usersTable.name,
    })
    .from(leadsTable)
    .leftJoin(projectsTable, eq(leadsTable.projectId, projectsTable.id))
    .leftJoin(usersTable, eq(leadsTable.primarySalesId, usersTable.id))
    .where(eq(leadsTable.id, leadId))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  res.json({ ...row.lead, projectName: row.projectName ?? null, primarySalesName: row.primarySalesName ?? null });
});

// PATCH /leads/:leadId
router.patch("/leads/:leadId", requireAuth, async (req, res): Promise<void> => {
  const { leadId } = req.params as { leadId: string };
  const body = req.body as Record<string, unknown>;
  const appUrl = getAppUrl(req);

  // Get old lead to detect assignment/status changes
  const [oldLead] = await db.select().from(leadsTable).where(eq(leadsTable.id, leadId)).limit(1);
  if (!oldLead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  const fields = ["name", "phone", "email", "source", "status", "projectId", "notes", "nextAction", "nextActionAt", "deadline", "primarySalesId", "outcome"];
  for (const f of fields) {
    if (f in body) updateData[camelToSnake(f)] = body[f] === null ? null : body[f];
  }
  if ("name" in body) updateData.name = body.name;

  const [updated] = await db
    .update(leadsTable)
    .set(updateData)
    .where(eq(leadsTable.id, leadId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  // Notify on assignment change
  const newSalesId = updated.primarySalesId;
  if (newSalesId && newSalesId !== oldLead.primarySalesId) {
    const [salesUser, project] = await Promise.all([
      db.select().from(usersTable).where(eq(usersTable.id, newSalesId)).limit(1).then(r => r[0]),
      updated.projectId ? db.select().from(projectsTable).where(eq(projectsTable.id, updated.projectId)).limit(1).then(r => r[0]) : Promise.resolve(null),
    ]);
    if (salesUser) {
      db.insert(notificationsTable).values({
        userId: salesUser.id,
        type: "lead_assigned",
        titleEn: "New Lead Assigned",
        bodyEn: `You have been assigned a new lead: ${updated.name}.`,
        link: `/leads/${leadId}`,
      }).catch(() => {});
      sendLeadAssignedEmail(salesUser.email, salesUser.name, updated.name, updated.phone ?? "N/A", project?.name ?? null, appUrl).catch(() => {});
    }
  }

  // Notify on status change
  if (updated.status !== oldLead.status && newSalesId) {
    const [salesUser] = await db.select().from(usersTable).where(eq(usersTable.id, newSalesId)).limit(1);
    if (salesUser) {
      db.insert(notificationsTable).values({
        userId: salesUser.id,
        type: updated.status === "won" ? "lead_won" : "lead_status_changed",
        titleEn: updated.status === "won" ? "Deal Closed! 🎉" : "Lead Status Updated",
        bodyEn: `${updated.name} moved from ${oldLead.status} to ${updated.status}.`,
        link: `/leads/${leadId}`,
      }).catch(() => {});
      sendLeadStatusChangedEmail(salesUser.email, salesUser.name, updated.name, oldLead.status, updated.status, appUrl).catch(() => {});
    }
  }

  res.json({ ...updated, projectName: null, primarySalesName: null });
});

// DELETE /leads/:leadId
router.delete("/leads/:leadId", requireAuth, async (req, res): Promise<void> => {
  const { leadId } = req.params as { leadId: string };
  await db.delete(leadsTable).where(eq(leadsTable.id, leadId));
  res.sendStatus(204);
});

// POST /leads/:leadId/assign
router.post("/leads/:leadId/assign", requireAuth, async (req, res): Promise<void> => {
  const { leadId } = req.params as { leadId: string };
  const { salesId } = req.body as { salesId?: string };
  const appUrl = getAppUrl(req);

  if (!salesId) {
    res.status(400).json({ error: "salesId required" });
    return;
  }

  const [oldLead] = await db.select().from(leadsTable).where(eq(leadsTable.id, leadId)).limit(1);

  const [updated] = await db
    .update(leadsTable)
    .set({ primarySalesId: salesId })
    .where(eq(leadsTable.id, leadId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const [salesUser, project] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, salesId)).limit(1).then(r => r[0]),
    updated.projectId ? db.select().from(projectsTable).where(eq(projectsTable.id, updated.projectId)).limit(1).then(r => r[0]) : Promise.resolve(null),
  ]);

  // Notify newly assigned sales rep
  if (salesUser && salesId !== oldLead?.primarySalesId) {
    db.insert(notificationsTable).values({
      userId: salesUser.id,
      type: "lead_assigned",
      titleEn: "New Lead Assigned",
      bodyEn: `You have been assigned a new lead: ${updated.name}.`,
      link: `/leads/${leadId}`,
    }).catch(() => {});
    sendLeadAssignedEmail(salesUser.email, salesUser.name, updated.name, updated.phone ?? "N/A", project?.name ?? null, appUrl).catch(() => {});
  }

  res.json({ ...updated, projectName: null, primarySalesName: salesUser?.name ?? null });
});

// PATCH /leads/:leadId/status
router.patch("/leads/:leadId/status", requireAuth, async (req, res): Promise<void> => {
  const { leadId } = req.params as { leadId: string };
  const { status } = req.body as { status?: string };
  const appUrl = getAppUrl(req);

  if (!status) {
    res.status(400).json({ error: "status required" });
    return;
  }

  const [oldLead] = await db.select().from(leadsTable).where(eq(leadsTable.id, leadId)).limit(1);

  const [updated] = await db
    .update(leadsTable)
    .set({ status: status as "new", lastActionAt: new Date() })
    .where(eq(leadsTable.id, leadId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  // Notify assigned sales rep on status change
  if (oldLead && updated.status !== oldLead.status && updated.primarySalesId) {
    const [salesUser] = await db.select().from(usersTable).where(eq(usersTable.id, updated.primarySalesId)).limit(1);
    if (salesUser) {
      db.insert(notificationsTable).values({
        userId: salesUser.id,
        type: updated.status === "won" ? "lead_won" : "lead_status_changed",
        titleEn: updated.status === "won" ? "Deal Closed! 🎉" : "Lead Status Updated",
        bodyEn: `${updated.name} moved from ${oldLead.status} to ${updated.status}.`,
        link: `/leads/${leadId}`,
      }).catch(() => {});
      sendLeadStatusChangedEmail(salesUser.email, salesUser.name, updated.name, oldLead.status, updated.status, appUrl).catch(() => {});
    }
  }

  res.json({ ...updated, projectName: null, primarySalesName: null });
});

// GET /leads/:leadId/activities
router.get("/leads/:leadId/activities", requireAuth, async (req, res): Promise<void> => {
  const { leadId } = req.params as { leadId: string };

  const activities = await db
    .select({
      activity: leadActivitiesTable,
      userName: usersTable.name,
    })
    .from(leadActivitiesTable)
    .leftJoin(usersTable, eq(leadActivitiesTable.userId, usersTable.id))
    .where(eq(leadActivitiesTable.leadId, leadId));

  res.json(
    activities.map((r) => ({
      ...r.activity,
      userName: r.userName ?? null,
    }))
  );
});

// POST /leads/:leadId/activities
router.post("/leads/:leadId/activities", requireAuth, async (req, res): Promise<void> => {
  const { leadId } = req.params as { leadId: string };
  const { type, notes, outcome, nextAction, nextActionAt, duration } = req.body as Record<string, unknown>;
  const currentUser = req.currentUser!;

  if (!type) {
    res.status(400).json({ error: "type required" });
    return;
  }

  const [activity] = await db
    .insert(leadActivitiesTable)
    .values({
      leadId,
      userId: currentUser.id,
      type: type as "call",
      notes: notes as string ?? null,
      outcome: outcome as string ?? null,
      nextAction: nextAction as string ?? null,
      nextActionAt: nextActionAt ? new Date(nextActionAt as string) : null,
      duration: duration ? String(duration) : null,
    })
    .returning();

  await db
    .update(leadsTable)
    .set({ lastActionAt: new Date() })
    .where(eq(leadsTable.id, leadId));

  res.status(201).json({ ...activity, userName: currentUser.name });
});

// POST /leads/bulk — Excel/CSV bulk import
router.post("/leads/bulk", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  const currentUser = req.currentUser!;

  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, string>[];

  const errors: Array<{ row: number; message: string }> = [];
  const values: typeof leadsTable.$inferInsert[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const name = String(row["Name"] ?? row["name"] ?? "").trim();
    if (!name) {
      errors.push({ row: rowNum, message: "Name is required" });
      continue;
    }
    values.push({
      name,
      phone: String(row["Phone"] ?? row["phone"] ?? "").trim() || null,
      email: String(row["Email"] ?? row["email"] ?? "").trim() || null,
      source: (String(row["Source"] ?? row["source"] ?? "manual").trim() as "manual") || "manual",
      status: (String(row["Status"] ?? row["status"] ?? "new").trim() as "new") || "new",
      notes: String(row["Notes"] ?? row["notes"] ?? "").trim() || null,
      createdBy: currentUser.id,
    });
  }

  let imported = 0;
  if (values.length > 0) {
    await db.insert(leadsTable).values(values).onConflictDoNothing();
    imported = values.length;
  }

  res.json({ imported, errors });
});

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export default router;
