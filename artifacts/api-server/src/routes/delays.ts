import { Router } from "express";
import { db, leadDelaysTable, leadsTable, notificationsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { withPermission } from "@workspace/permissions";
import { auditLog } from "../lib/audit";

const router = Router();

// GET /delays — admin sees all pending delay requests
router.get("/delays", requireAuth, withPermission("leads.assign"), async (req, res): Promise<void> => {
  const delays = await db
    .select({
      delay: leadDelaysTable,
      leadName: leadsTable.name,
      requesterName: usersTable.name,
    })
    .from(leadDelaysTable)
    .leftJoin(leadsTable, eq(leadDelaysTable.leadId, leadsTable.id))
    .leftJoin(usersTable, eq(leadDelaysTable.requestedBy, usersTable.id))
    .where(eq(leadDelaysTable.status, "pending"));

  res.json(delays.map((d) => ({ ...d.delay, leadName: d.leadName, requesterName: d.requesterName })));
});

// POST /leads/:leadId/delay — sales requests a delay
router.post("/leads/:leadId/delay", requireAuth, withPermission("leads.delay"), async (req, res): Promise<void> => {
  const { leadId } = req.params as { leadId: string };
  const { reason, delayUntil } = req.body as { reason: string; delayUntil: string };
  const currentUser = req.currentUser!;

  if (!reason || !delayUntil) {
    res.status(400).json({ error: "reason and delayUntil required" });
    return;
  }

  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, leadId)).limit(1);
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }

  const [delay] = await db
    .insert(leadDelaysTable)
    .values({
      leadId,
      requestedBy: currentUser.id,
      reason,
      delayUntil: new Date(delayUntil),
    })
    .returning();

  const admins = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "admin"));

  if (admins.length > 0) {
    await db.insert(notificationsTable).values(
      admins.map((a) => ({
        userId: a.id,
        titleEn: "Delay Request",
        bodyEn: `${currentUser.name} requested a delay for lead "${lead.name}"`,
        type: "delay_request",
        relatedId: leadId,
      }))
    );
  }

  await auditLog({
    userId: currentUser.id,
    action: "request_lead_delay",
    entityType: "lead",
    entityId: leadId,
    after: { reason, delayUntil },
    req,
  });

  res.status(201).json(delay);
});

// PATCH /delays/:delayId — admin approves/rejects
router.patch("/delays/:delayId", requireAuth, withPermission("leads.assign"), async (req, res): Promise<void> => {
  const { delayId } = req.params as { delayId: string };
  const { status, reviewNote } = req.body as { status: "approved" | "rejected"; reviewNote?: string };
  const currentUser = req.currentUser!;

  const [delay] = await db
    .update(leadDelaysTable)
    .set({ status, reviewedBy: currentUser.id, reviewedAt: new Date(), reviewNote: reviewNote ?? null })
    .where(eq(leadDelaysTable.id, delayId))
    .returning();

  if (!delay) { res.status(404).json({ error: "Delay not found" }); return; }

  if (status === "approved") {
    await db
      .update(leadsTable)
      .set({ delayedUntil: delay.delayUntil })
      .where(eq(leadsTable.id, delay.leadId));
  }

  await db.insert(notificationsTable).values({
    userId: delay.requestedBy,
    titleEn: status === "approved" ? "Delay Approved" : "Delay Rejected",
    bodyEn: status === "approved"
      ? `Your delay request was approved until ${delay.delayUntil.toLocaleDateString()}`
      : `Your delay request was rejected. ${reviewNote ?? ""}`,
    type: "delay_request",
    relatedId: delay.leadId,
  });

  await auditLog({
    userId: currentUser.id,
    action: `delay_${status}`,
    entityType: "lead_delay",
    entityId: delayId,
    after: { status, reviewNote },
    req,
  });

  res.json(delay);
});

export default router;
