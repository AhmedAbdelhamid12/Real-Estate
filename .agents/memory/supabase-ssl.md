---
name: Supabase SSL connection
description: How to connect to Supabase from this project; pg SSL quirks and secret naming
---

# Supabase SSL Connection

**Rule:** Do NOT put `?sslmode=require` in the connection string when using `pg` v8+.

**Why:** pg v8 (and newer) treats `sslmode=require` in the URL as `verify-full`, which rejects Supabase's certificate chain ("self-signed certificate in certificate chain" error). Instead, strip the sslmode param from the URL and pass `ssl: { rejectUnauthorized: false }` directly to the Pool constructor.

**How to apply:**
```ts
export const pool = new Pool({
  connectionString,                   // plain URL, no ?sslmode=require
  ssl: process.env.SUPABASE_DATABASE_URL ? { rejectUnauthorized: false } : false,
});
```

For raw node scripts (e.g. seed), strip the param manually:
```js
const connStr = process.env.SUPABASE_DATABASE_URL.replace("?sslmode=require", "");
const pool = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
```

**Secret naming:** `DATABASE_URL` is Replit-managed (Replit PostgreSQL) and cannot be overridden via requestEnvVar. Use `SUPABASE_DATABASE_URL` as the secret name and prefer it in code: `process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL`.

**Supabase details:**
- Host: aws-0-eu-west-3.pooler.supabase.com (Shared Pooler, transaction mode)
- Port: 5432
- Database: postgres
- User: postgres.kfeziqfppixlwxgyyftd
- Schema push: `cd lib/db && SUPABASE_DATABASE_URL=... pnpm run push`
- Seed script: `/tmp/seed.mjs` (plain JS, uses absolute pnpm store paths for pg + bcryptjs)
