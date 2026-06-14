import { Router } from "express";
import { db, resaleUnitsTable, resalePhotosTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// GET /resale
router.get("/resale", requireAuth, async (req, res): Promise<void> => {
  const { projectId, unitType, status } = req.query as Record<string, string>;

  let units = await db.select().from(resaleUnitsTable);
  const photos = await db.select().from(resalePhotosTable);

  if (projectId) units = units.filter((u) => u.projectId === projectId);
  if (unitType) units = units.filter((u) => u.unitType === unitType);
  if (status === "active") units = units.filter((u) => u.isActive);
  else if (status === "inactive") units = units.filter((u) => !u.isActive);

  const photosMap: Record<string, typeof photos> = {};
  for (const p of photos) {
    if (!photosMap[p.unitId]) photosMap[p.unitId] = [];
    photosMap[p.unitId].push(p);
  }

  const result = units.map((u) => ({
    ...u,
    photos: (photosMap[u.id] ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  res.json(result);
});

// POST /resale
router.post("/resale", requireAuth, async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const currentUser = req.currentUser!;

  if (!body.projectName) {
    res.status(400).json({ error: "projectName is required" });
    return;
  }

  const [unit] = await db
    .insert(resaleUnitsTable)
    .values({
      projectId: (body.projectId as string) ?? null,
      projectName: body.projectName as string,
      area: (body.area as string) ?? null,
      price: (body.price as string) ?? null,
      floor: (body.floor as number) ?? null,
      unitType: (body.unitType as string) ?? null,
      description: (body.description as string) ?? null,
      ownerName: (body.ownerName as string) ?? null,
      ownerPhone: (body.ownerPhone as string) ?? null,
      ownerEmail: (body.ownerEmail as string) ?? null,
      ownerNotes: (body.ownerNotes as string) ?? null,
      isOwnerPhoneHidden: (body.isOwnerPhoneHidden as boolean) ?? false,
      isOwnerEmailHidden: (body.isOwnerEmailHidden as boolean) ?? false,
      createdBy: currentUser.id,
    })
    .returning();

  // Add initial photos if provided
  const photoUrls = body.photos as string[] | undefined;
  if (photoUrls && photoUrls.length > 0) {
    const photoInserts = photoUrls.slice(0, 5).map((url, i) => ({
      unitId: unit.id,
      url,
      sortOrder: i,
      uploadedBy: currentUser.id,
    }));
    await db.insert(resalePhotosTable).values(photoInserts);
  }

  const photos = await db.select().from(resalePhotosTable).where(eq(resalePhotosTable.unitId, unit.id));
  res.status(201).json({ ...unit, photos });
});

// GET /resale/:unitId
router.get("/resale/:unitId", requireAuth, async (req, res): Promise<void> => {
  const { unitId } = req.params as { unitId: string };

  const [unit] = await db
    .select()
    .from(resaleUnitsTable)
    .where(eq(resaleUnitsTable.id, unitId))
    .limit(1);

  if (!unit) {
    res.status(404).json({ error: "Resale unit not found" });
    return;
  }

  const photos = await db
    .select()
    .from(resalePhotosTable)
    .where(eq(resalePhotosTable.unitId, unitId));

  res.json({ ...unit, photos: photos.sort((a, b) => a.sortOrder - b.sortOrder) });
});

// PATCH /resale/:unitId
router.patch("/resale/:unitId", requireAuth, async (req, res): Promise<void> => {
  const { unitId } = req.params as { unitId: string };
  const body = req.body as Record<string, unknown>;

  const allowedFields: Record<string, string> = {
    projectId: "project_id",
    projectName: "project_name",
    area: "area",
    price: "price",
    floor: "floor",
    unitType: "unit_type",
    description: "description",
    ownerName: "owner_name",
    ownerPhone: "owner_phone",
    ownerEmail: "owner_email",
    ownerNotes: "owner_notes",
    isOwnerPhoneHidden: "is_owner_phone_hidden",
    isOwnerEmailHidden: "is_owner_email_hidden",
    isActive: "is_active",
  };

  const updateData: Record<string, unknown> = {};
  for (const [camel, _snake] of Object.entries(allowedFields)) {
    if (camel in body) updateData[camel] = body[camel];
  }

  const [updated] = await db
    .update(resaleUnitsTable)
    .set(updateData)
    .where(eq(resaleUnitsTable.id, unitId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Unit not found" });
    return;
  }

  const photos = await db
    .select()
    .from(resalePhotosTable)
    .where(eq(resalePhotosTable.unitId, unitId));

  res.json({ ...updated, photos: photos.sort((a, b) => a.sortOrder - b.sortOrder) });
});

// DELETE /resale/:unitId
router.delete("/resale/:unitId", requireAuth, async (req, res): Promise<void> => {
  const { unitId } = req.params as { unitId: string };
  await db.delete(resaleUnitsTable).where(eq(resaleUnitsTable.id, unitId));
  res.sendStatus(204);
});

// POST /resale/:unitId/photos
router.post("/resale/:unitId/photos", requireAuth, async (req, res): Promise<void> => {
  const { unitId } = req.params as { unitId: string };
  const currentUser = req.currentUser!;
  const { url, caption } = req.body as { url: string; caption?: string };

  if (!url) {
    res.status(400).json({ error: "url is required" });
    return;
  }

  const existingPhotos = await db
    .select()
    .from(resalePhotosTable)
    .where(eq(resalePhotosTable.unitId, unitId));

  if (existingPhotos.length >= 5) {
    res.status(400).json({ error: "Maximum 5 photos per unit" });
    return;
  }

  const [photo] = await db
    .insert(resalePhotosTable)
    .values({
      unitId,
      url,
      caption: caption ?? null,
      sortOrder: existingPhotos.length,
      uploadedBy: currentUser.id,
    })
    .returning();

  res.status(201).json(photo);
});

// DELETE /resale/:unitId/photos/:photoId
router.delete("/resale/:unitId/photos/:photoId", requireAuth, async (req, res): Promise<void> => {
  const { unitId, photoId } = req.params as { unitId: string; photoId: string };

  await db
    .delete(resalePhotosTable)
    .where(and(eq(resalePhotosTable.id, photoId), eq(resalePhotosTable.unitId, unitId)));

  res.sendStatus(204);
});

export default router;
