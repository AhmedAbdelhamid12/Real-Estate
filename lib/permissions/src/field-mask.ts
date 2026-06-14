import { resolvePermission } from "./resolver";

export async function maskLeadFields<T extends Record<string, unknown>>(
  lead: T,
  userId: string,
  userRole: string,
  assignmentHiddenFields: string[] = []
): Promise<Partial<T>> {
  const [canSeePhone, canSeeEmail, canSeeNotes] = await Promise.all([
    resolvePermission(userId, "leads.see_phone", userRole),
    resolvePermission(userId, "leads.see_email", userRole),
    resolvePermission(userId, "leads.see_notes", userRole),
  ]);

  const masked = { ...lead };

  if (!canSeePhone || assignmentHiddenFields.includes("phone")) {
    delete masked.phone;
  }
  if (!canSeeEmail || assignmentHiddenFields.includes("email")) {
    delete masked.email;
  }
  if (!canSeeNotes || assignmentHiddenFields.includes("notes")) {
    delete masked.notes;
  }

  return masked;
}

export function maskResaleOwnerFields<T extends Record<string, unknown>>(
  unit: T,
  canSeeOwner: boolean
): Partial<T> {
  if (canSeeOwner) return unit;
  const masked = { ...unit };
  delete masked.ownerName;
  delete masked.ownerPhone;
  delete masked.ownerEmail;
  return masked;
}
