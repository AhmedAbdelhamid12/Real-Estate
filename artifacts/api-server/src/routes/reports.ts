import { Router } from "express";
import { db, leadsTable, usersTable, resaleUnitsTable } from "@workspace/db";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// GET /reports/sales
router.get("/reports/sales", requireAuth, async (req, res): Promise<void> => {
  const { from, to, userId } = req.query as Record<string, string>;

  let leads = await db
    .select({
      id: leadsTable.id,
      status: leadsTable.status,
      salesId: leadsTable.primarySalesId,
      createdAt: leadsTable.createdAt,
    })
    .from(leadsTable);

  if (from) leads = leads.filter((l) => l.createdAt >= new Date(from));
  if (to) leads = leads.filter((l) => l.createdAt <= new Date(to + "T23:59:59Z"));
  if (userId) leads = leads.filter((l) => l.salesId === userId);

  const users = await db
    .select({ id: usersTable.id, name: usersTable.name, avatarUrl: usersTable.avatarUrl, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.status, "active"));

  const statsMap: Record<string, { won: number; lost: number; inProgress: number }> = {};
  for (const l of leads) {
    if (!l.salesId) continue;
    if (!statsMap[l.salesId]) statsMap[l.salesId] = { won: 0, lost: 0, inProgress: 0 };
    if (l.status === "won") statsMap[l.salesId].won++;
    else if (l.status === "lost") statsMap[l.salesId].lost++;
    else statsMap[l.salesId].inProgress++;
  }

  const byUser = users
    .filter((u) => statsMap[u.id])
    .map((u) => ({
      userId: u.id,
      userName: u.name,
      avatarUrl: u.avatarUrl,
      role: u.role,
      won: statsMap[u.id]?.won ?? 0,
      lost: statsMap[u.id]?.lost ?? 0,
      inProgress: statsMap[u.id]?.inProgress ?? 0,
      total: (statsMap[u.id]?.won ?? 0) + (statsMap[u.id]?.lost ?? 0) + (statsMap[u.id]?.inProgress ?? 0),
    }));

  res.json({
    totalWon: leads.filter((l) => l.status === "won").length,
    totalLost: leads.filter((l) => l.status === "lost").length,
    totalLeads: leads.length,
    byUser,
  });
});

// GET /reports/leads
router.get("/reports/leads", requireAuth, async (req, res): Promise<void> => {
  const { from, to } = req.query as Record<string, string>;

  let leads = await db
    .select({ status: leadsTable.status, source: leadsTable.source, createdAt: leadsTable.createdAt })
    .from(leadsTable);

  if (from) leads = leads.filter((l) => l.createdAt >= new Date(from));
  if (to) leads = leads.filter((l) => l.createdAt <= new Date(to + "T23:59:59Z"));

  const sourceCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  for (const l of leads) {
    const src = l.source ?? "manual";
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
    statusCounts[l.status] = (statusCounts[l.status] ?? 0) + 1;
  }

  res.json({
    total: leads.length,
    bySource: Object.entries(sourceCounts).map(([source, count]) => ({ source, count })),
    byStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
  });
});

// GET /reports/resale
router.get("/reports/resale", requireAuth, async (req, res): Promise<void> => {
  const { from, to } = req.query as Record<string, string>;

  let units = await db
    .select({
      id: resaleUnitsTable.id,
      projectName: resaleUnitsTable.projectName,
      unitType: resaleUnitsTable.unitType,
      price: resaleUnitsTable.price,
      isActive: resaleUnitsTable.isActive,
      createdAt: resaleUnitsTable.createdAt,
    })
    .from(resaleUnitsTable);

  if (from) units = units.filter((u) => u.createdAt >= new Date(from));
  if (to) units = units.filter((u) => u.createdAt <= new Date(to + "T23:59:59Z"));

  const typeCounts: Record<string, number> = {};
  const projectCounts: Record<string, { count: number; totalValue: number }> = {};
  let totalValue = 0;
  let activeCount = 0;

  for (const u of units) {
    const type = u.unitType ?? "other";
    typeCounts[type] = (typeCounts[type] ?? 0) + 1;

    const proj = u.projectName;
    if (!projectCounts[proj]) projectCounts[proj] = { count: 0, totalValue: 0 };
    projectCounts[proj].count++;

    const price = parseFloat(u.price ?? "0");
    if (!isNaN(price)) {
      projectCounts[proj].totalValue += price;
      totalValue += price;
    }

    if (u.isActive) activeCount++;
  }

  res.json({
    total: units.length,
    activeCount,
    inactiveCount: units.length - activeCount,
    totalValue,
    byType: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
    byProject: Object.entries(projectCounts).map(([project, data]) => ({
      project,
      count: data.count,
      totalValue: data.totalValue,
    })).sort((a, b) => b.count - a.count).slice(0, 10),
  });
});

export default router;
