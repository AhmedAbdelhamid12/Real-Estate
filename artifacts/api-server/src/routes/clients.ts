import { Router } from "express";
import { db, clientsTable, usersTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const DEAL_FIELDS = [
  "name", "phone", "email", "dealValue", "projectId", "assignedSalesId", "notes",
  "unitNumber", "unitType", "area", "paymentMethod", "downPayment",
  "contractDate", "numberOfInstallments", "installmentAmount",
];

// GET /clients
router.get("/clients", requireAuth, async (req, res): Promise<void> => {
  const { search } = req.query as { search?: string };

  const rows = await db
    .select({
      client: clientsTable,
      projectName: projectsTable.name,
      assignedSalesName: usersTable.name,
    })
    .from(clientsTable)
    .leftJoin(projectsTable, eq(clientsTable.projectId, projectsTable.id))
    .leftJoin(usersTable, eq(clientsTable.assignedSalesId, usersTable.id));

  let enriched = rows.map((r) => ({
    ...r.client,
    projectName: r.projectName ?? null,
    assignedSalesName: r.assignedSalesName ?? null,
  }));

  if (search) {
    const q = search.toLowerCase();
    enriched = enriched.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
    );
  }

  res.json(enriched);
});

// POST /clients
router.post("/clients", requireAuth, async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;

  if (!body.name) {
    res.status(400).json({ error: "name required" });
    return;
  }

  const [client] = await db
    .insert(clientsTable)
    .values({
      name: body.name as string,
      phone: (body.phone as string) ?? null,
      email: (body.email as string) ?? null,
      dealValue: (body.dealValue as string) ?? null,
      projectId: (body.projectId as string) ?? null,
      assignedSalesId: (body.assignedSalesId as string) ?? null,
      notes: (body.notes as string) ?? null,
      unitNumber: (body.unitNumber as string) ?? null,
      unitType: (body.unitType as string) ?? null,
      area: (body.area as string) ?? null,
      paymentMethod: (body.paymentMethod as string) ?? null,
      downPayment: (body.downPayment as string) ?? null,
      contractDate: body.contractDate ? new Date(body.contractDate as string) : null,
      numberOfInstallments: body.numberOfInstallments ? Number(body.numberOfInstallments) : null,
      installmentAmount: (body.installmentAmount as string) ?? null,
    })
    .returning();

  res.status(201).json({ ...client, projectName: null, assignedSalesName: null });
});

// GET /clients/:clientId
router.get("/clients/:clientId", requireAuth, async (req, res): Promise<void> => {
  const { clientId } = req.params as { clientId: string };

  const [row] = await db
    .select({
      client: clientsTable,
      projectName: projectsTable.name,
      assignedSalesName: usersTable.name,
    })
    .from(clientsTable)
    .leftJoin(projectsTable, eq(clientsTable.projectId, projectsTable.id))
    .leftJoin(usersTable, eq(clientsTable.assignedSalesId, usersTable.id))
    .where(eq(clientsTable.id, clientId))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  res.json({ ...row.client, projectName: row.projectName ?? null, assignedSalesName: row.assignedSalesName ?? null });
});

// PATCH /clients/:clientId
router.patch("/clients/:clientId", requireAuth, async (req, res): Promise<void> => {
  const { clientId } = req.params as { clientId: string };
  const body = req.body as Record<string, unknown>;

  const updateData: Record<string, unknown> = {};
  for (const f of DEAL_FIELDS) {
    if (f in body) {
      if (f === "contractDate") {
        updateData[camelToSnake(f)] = body[f] ? new Date(body[f] as string) : null;
      } else if (f === "numberOfInstallments") {
        updateData[camelToSnake(f)] = body[f] ? Number(body[f]) : null;
      } else {
        updateData[camelToSnake(f)] = body[f];
      }
    }
  }

  const [updated] = await db
    .update(clientsTable)
    .set(updateData)
    .where(eq(clientsTable.id, clientId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  res.json({ ...updated, projectName: null, assignedSalesName: null });
});

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export default router;
