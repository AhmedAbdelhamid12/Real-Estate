import { Router } from "express";
import { db, leadsTable, usersTable, projectsTable, resaleUnitsTable, clientsTable, leadActivitiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const PIPELINE_LABELS: Record<string, string> = {
  new: "New",
  called: "Called",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

// GET /dashboard/stats
router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const [leads, users, projects, resaleUnits, clients] = await Promise.all([
    db.select().from(leadsTable),
    db.select().from(usersTable),
    db.select().from(projectsTable).where(eq(projectsTable.isActive, true)),
    db.select().from(resaleUnitsTable).where(eq(resaleUnitsTable.isActive, true)),
    db.select().from(clientsTable),
  ]);

  const wonLeads = leads.filter((l) => l.status === "won").length;
  const lostLeads = leads.filter((l) => l.status === "lost").length;
  const activeLeads = leads.filter((l) => !["won", "lost"].includes(l.status)).length;
  const onlineUsers = users.filter((u) => u.isOnline).length;

  res.json({
    totalLeads: leads.length,
    activeLeads,
    wonLeads,
    lostLeads,
    totalClients: clients.length,
    totalProjects: projects.length,
    totalResaleUnits: resaleUnits.length,
    onlineUsers,
    totalUsers: users.filter((u) => u.status === "active").length,
  });
});

// GET /dashboard/pipeline
router.get("/dashboard/pipeline", requireAuth, async (req, res): Promise<void> => {
  const leads = await db.select({ status: leadsTable.status }).from(leadsTable);

  const counts: Record<string, number> = {};
  for (const l of leads) {
    counts[l.status] = (counts[l.status] ?? 0) + 1;
  }

  const statuses = ["new", "called", "qualified", "proposal", "negotiation", "won", "lost"];
  res.json(
    statuses.map((status) => ({
      status,
      count: counts[status] ?? 0,
      label: PIPELINE_LABELS[status] ?? status,
    }))
  );
});

// GET /dashboard/top-performers
router.get("/dashboard/top-performers", requireAuth, async (req, res): Promise<void> => {
  const leads = await db
    .select({ salesId: leadsTable.primarySalesId, status: leadsTable.status })
    .from(leadsTable)
    .where(sql`${leadsTable.primarySalesId} IS NOT NULL`);

  const users = await db.select().from(usersTable).where(eq(usersTable.status, "active"));

  const statsMap: Record<string, { won: number; total: number }> = {};
  for (const l of leads) {
    if (!l.salesId) continue;
    if (!statsMap[l.salesId]) statsMap[l.salesId] = { won: 0, total: 0 };
    statsMap[l.salesId].total++;
    if (l.status === "won") statsMap[l.salesId].won++;
  }

  const performers = users
    .filter((u) => statsMap[u.id])
    .map((u) => ({
      userId: u.id,
      userName: u.name,
      avatarUrl: u.avatarUrl,
      wonLeads: statsMap[u.id]?.won ?? 0,
      totalLeads: statsMap[u.id]?.total ?? 0,
      conversionRate:
        statsMap[u.id]?.total
          ? Math.round(((statsMap[u.id]?.won ?? 0) / (statsMap[u.id]?.total ?? 1)) * 100) / 100
          : 0,
    }))
    .sort((a, b) => b.wonLeads - a.wonLeads)
    .slice(0, 10);

  res.json(performers);
});

// GET /dashboard/recent-activity
router.get("/dashboard/recent-activity", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select({
      activity: leadActivitiesTable,
      leadName: leadsTable.name,
      userName: usersTable.name,
    })
    .from(leadActivitiesTable)
    .leftJoin(leadsTable, eq(leadActivitiesTable.leadId, leadsTable.id))
    .leftJoin(usersTable, eq(leadActivitiesTable.userId, usersTable.id));

  const sorted = rows
    .sort((a, b) => new Date(b.activity.createdAt).getTime() - new Date(a.activity.createdAt).getTime())
    .slice(0, 20);

  res.json(
    sorted.map((r) => ({
      id: r.activity.id,
      leadId: r.activity.leadId,
      leadName: r.leadName ?? "Unknown Lead",
      userId: r.activity.userId,
      userName: r.userName ?? "Unknown User",
      type: r.activity.type,
      notes: r.activity.notes,
      createdAt: r.activity.createdAt,
    }))
  );
});

export default router;
