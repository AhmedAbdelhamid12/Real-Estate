import { Router } from "express";
import { db, leadsTable, usersTable, resaleUnitsTable, projectsTable } from "@workspace/db";
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
    const sid = l.salesId ?? "__unassigned__";
    if (!statsMap[sid]) statsMap[sid] = { won: 0, lost: 0, inProgress: 0 };
    if (l.status === "won") statsMap[sid].won++;
    else if (l.status === "lost") statsMap[sid].lost++;
    else statsMap[sid].inProgress++;
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
  const { from, to, userId } = req.query as Record<string, string>;

  let leads = await db
    .select({ status: leadsTable.status, source: leadsTable.source, createdAt: leadsTable.createdAt, salesId: leadsTable.primarySalesId })
    .from(leadsTable);

  if (from) leads = leads.filter((l) => l.createdAt >= new Date(from));
  if (to) leads = leads.filter((l) => l.createdAt <= new Date(to + "T23:59:59Z"));
  if (userId) leads = leads.filter((l) => l.salesId === userId);

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

// GET /reports/trends — daily lead creation over time
router.get("/reports/trends", requireAuth, async (req, res): Promise<void> => {
  const { from, to, userId } = req.query as Record<string, string>;

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDate = to ? new Date(to + "T23:59:59Z") : new Date();

  let query: string;
  if (userId) {
    query = `
      SELECT
        TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'won' THEN 1 END)::int AS won,
        COUNT(CASE WHEN status = 'lost' THEN 1 END)::int AS lost,
        COUNT(CASE WHEN status NOT IN ('won','lost') THEN 1 END)::int AS in_progress
      FROM leads
      WHERE created_at >= '${fromDate.toISOString()}' AND created_at <= '${toDate.toISOString()}'
        AND primary_sales_id = '${userId}'
      GROUP BY TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')
      ORDER BY date ASC
    `;
  } else {
    query = `
      SELECT
        TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'won' THEN 1 END)::int AS won,
        COUNT(CASE WHEN status = 'lost' THEN 1 END)::int AS lost,
        COUNT(CASE WHEN status NOT IN ('won','lost') THEN 1 END)::int AS in_progress
      FROM leads
      WHERE created_at >= '${fromDate.toISOString()}' AND created_at <= '${toDate.toISOString()}'
      GROUP BY TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')
      ORDER BY date ASC
    `;
  }

  const rows = await db.execute(sql.raw(query));

  const resultMap: Record<string, { date: string; total: number; won: number; lost: number; inProgress: number }> = {};
  for (const row of rows.rows as any[]) {
    resultMap[row.date] = {
      date: row.date,
      total: Number(row.total),
      won: Number(row.won),
      lost: Number(row.lost),
      inProgress: Number(row.in_progress),
    };
  }

  const days: typeof resultMap[string][] = [];
  const cur = new Date(fromDate);
  while (cur <= toDate) {
    const key = cur.toISOString().slice(0, 10);
    days.push(resultMap[key] ?? { date: key, total: 0, won: 0, lost: 0, inProgress: 0 });
    cur.setDate(cur.getDate() + 1);
  }

  res.json({ days });
});

// GET /reports/projects — leads performance per project
router.get("/reports/projects", requireAuth, async (req, res): Promise<void> => {
  const { from, to, userId } = req.query as Record<string, string>;

  const fromDate = from ? new Date(from) : new Date(0);
  const toDate = to ? new Date(to + "T23:59:59Z") : new Date();

  let query: string;
  if (userId) {
    query = `
      SELECT
        p.id,
        p.name,
        p.image_url AS "imageUrl",
        COUNT(l.id)::int AS total,
        COUNT(CASE WHEN l.status = 'won' THEN 1 END)::int AS won,
        COUNT(CASE WHEN l.status = 'lost' THEN 1 END)::int AS lost,
        COUNT(CASE WHEN l.status NOT IN ('won','lost') THEN 1 END)::int AS in_progress
      FROM projects p
      LEFT JOIN leads l ON l.project_id = p.id
        AND l.created_at >= '${fromDate.toISOString()}'
        AND l.created_at <= '${toDate.toISOString()}'
        AND l.primary_sales_id = '${userId}'
      GROUP BY p.id, p.name, p.image_url
      ORDER BY total DESC
    `;
  } else {
    query = `
      SELECT
        p.id,
        p.name,
        p.image_url AS "imageUrl",
        COUNT(l.id)::int AS total,
        COUNT(CASE WHEN l.status = 'won' THEN 1 END)::int AS won,
        COUNT(CASE WHEN l.status = 'lost' THEN 1 END)::int AS lost,
        COUNT(CASE WHEN l.status NOT IN ('won','lost') THEN 1 END)::int AS in_progress
      FROM projects p
      LEFT JOIN leads l ON l.project_id = p.id
        AND l.created_at >= '${fromDate.toISOString()}'
        AND l.created_at <= '${toDate.toISOString()}'
      GROUP BY p.id, p.name, p.image_url
      ORDER BY total DESC
    `;
  }

  const rows = await db.execute(sql.raw(query));

  const projects = (rows.rows as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    imageUrl: r.imageUrl,
    total: Number(r.total),
    won: Number(r.won),
    lost: Number(r.lost),
    inProgress: Number(r.in_progress),
    convRate: r.total > 0 ? Math.round((r.won / r.total) * 100) : 0,
  }));

  res.json({ projects });
});

export default router;
