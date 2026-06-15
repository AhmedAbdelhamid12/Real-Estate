# PropOS CRM — TIL Real Estate Group

A full-featured Real Estate CRM for managing leads, clients, projects, employees, and performance reporting.

## Run & Operate

- **Start app**: workflow runs `PORT=8080 api-server` + `PORT=5000 crm` in parallel
- `pnpm --filter @workspace/api-server run dev` — API server (port 8080)
- `pnpm --filter @workspace/crm run dev` — CRM frontend (port 5000, proxies /api → 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run seed` — seed database with test data
- Required env: `DATABASE_URL` — Postgres connection string (Replit-managed)

## Test Credentials

- CEO: `ceo@propos.app` / `Change@Me2026!`
- Admin: `admin@propos.app` / `Test1234!`
- Sales reps: `sales1@propos.app` through `sales5@propos.app` / `Test1234!`

## Stack

- pnpm workspaces monorepo, Node.js 20, TypeScript 5.9
- **API**: Express 5, Passport.js (Google/Facebook OAuth optional), bcryptjs sessions
- **DB**: PostgreSQL (Replit-managed) + Drizzle ORM, migrations via `drizzle-kit push`
- **CRM Web**: React 19, Vite 7, Wouter, TanStack Query v5, Tailwind CSS 4, Radix UI
- **Mobile**: Expo 54 / React Native (in `artifacts/mobile`)
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from `lib/api-spec/openapi.yaml`)
- **Email**: Resend (optional — falls back to console logging if `RESEND_API_KEY` not set)

## Where things live

- `artifacts/api-server/` — Express backend, routes, middleware, auth
- `artifacts/crm/` — React CRM web app
- `artifacts/mobile/` — Expo mobile app
- `lib/db/` — Drizzle schema, migrations, seed data
- `lib/api-spec/openapi.yaml` — source-of-truth API spec
- `lib/api-client-react/` — generated React Query hooks (from spec)
- `lib/api-zod/` — generated Zod schemas (from spec)
- `lib/permissions/` — shared RBAC logic

## Architecture decisions

- Auth is custom session-based (cookie `session` + DB sessions table) — not Supabase/Firebase/Clerk
- OAuth (Google/Facebook) is optional — configured via env vars, warnings shown if not set
- Vite dev server proxies `/api` and `/uploads` to `localhost:8080`
- API server must be built before starting (`pnpm run build` inside api-server)
- `lib/db/src/index.ts` checks `SUPABASE_DATABASE_URL` first, then `DATABASE_URL`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- API server build step is required before `start` — the dev script does `build && start`
- Seed script creates users with status `active` and `emailVerifiedAt` set so they can log in immediately
- Google/Facebook OAuth only works if env vars `GOOGLE_CLIENT_ID/SECRET` and `FACEBOOK_CLIENT_ID/SECRET` are set
- Resend email integration is optional — missing `RESEND_API_KEY` just logs emails to console
