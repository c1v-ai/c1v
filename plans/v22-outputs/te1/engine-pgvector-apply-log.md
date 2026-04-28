---
team: c1v-kb-runtime-engine
agent: engine-pgvector
ec: EC-V21-E.6
created: 2026-04-27
---

# 0026_kb_chunks_rls.sql — apply log

Local Supabase apply (`postgresql://postgres:***@localhost:54322/postgres`).

```
$ PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres \
    -v ON_ERROR_STOP=1 \
    -f apps/product-helper/lib/db/migrations/0026_kb_chunks_rls.sql

REVOKE
DO
ALTER TABLE
CREATE POLICY
CREATE POLICY
COMMENT
COMMENT
```

Exit 0. No drizzle-kit invocation (broken in this repo per CLAUDE.md;
manual SQL apply per the standing pattern).

## Post-apply verification

```sql
-- RLS enabled on the table
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename='kb_chunks';
--  schemaname | tablename | rowsecurity
-- ------------+-----------+-------------
--  public     | kb_chunks | t
-- (1 row)

-- Both policies present, correct verbs
SELECT policyname, cmd FROM pg_policies WHERE tablename='kb_chunks' ORDER BY policyname;
--           policyname           |  cmd
-- --------------------------------+--------
--  kb_chunks_authenticated_select | SELECT
--  kb_chunks_service_all          | ALL
-- (2 rows)
```

## Production apply — DEFERRED

Production apply is a coordinator decision (no live POSTGRES_URL in
the spawn context, and we don't run untested migrations against prod
mid-wave). Path-of-record:

1. `pnpm tsx scripts/verify-kb-chunks-populated.ts` (env-supplied prod
   URL) — confirm row count matches local before applying.
2. Apply `0026_kb_chunks_rls.sql` via Supabase SQL editor (drizzle-kit
   migrate is broken; CLAUDE.md notes manual SQL is the path).
3. Re-run `verify-kb-chunks-populated.ts` to confirm RLS doesn't mask
   the count under service-role context.

## Pre-existing state (Day-0)

`kb_chunks` had RLS *disabled* before this migration (table created in
`0011a_kb_chunks.sql` 2026-04-21 with no `ALTER TABLE … ENABLE ROW
LEVEL SECURITY`). The 7,670 rows already populated by T3 Phase B
ingest (verified via `verify-kb-chunks-populated.ts`) remain visible
under service-role context post-apply.
