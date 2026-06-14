---
name: PropOS CRM stack decisions
description: Key constraints and non-obvious decisions for the PropOS Real Estate CRM monorepo
---

- `customFetch` from `@workspace/api-client-react` returns parsed body and throws on errors — NOT a raw Response. Use `apiFetch` export for raw Response.
- Notifications schema uses `titleEn`/`bodyEn` columns (not `title`/`body`).
- Permissions: in-memory cache, falls back to DEFAULT_ROLE_PERMISSIONS if DB has no entry; `ceo`/`admin` roles always return true in `can()`.
- `useAssignLead()` hook — call with no args, mutate with `{leadId, data: {salesId}}`.
- `useListUsers` takes `params?: {role?: string, status?: string}`.
- multer + xlsx installed in api-server for bulk import.
- CEO seed script at `lib/db/src/seed/seed.ts`.
- `lib/permissions/package.json` has `@workspace/db` dependency; pnpm-workspace.yaml covers `lib/*` automatically.
- All mutation hooks (useUpdateLeadStatus, useCreateLeadActivity, etc.) take NO leadId arg — pass leadId inside the mutate() call data object.

**Why:** These were discovered through runtime errors and type mismatches during initial build.
