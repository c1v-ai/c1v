# Atlas Re-Ingest Runbook

**Operator:** future maintainer running atlas re-ingest after v2.1 SKIP-with-fail-forward, or any time `kb_chunks` atlas row count drops to zero.
**Owner:** TA1 (`open-questions-emitter` agent in v2.1; ongoing maintenance thereafter).
**Anchors:** EC-V21-A.8 (atlas runtime ingest fix), `plans/v21-outputs/ta1/atlas-ingest-notes.md` (dedup-key audit).

---

## 1. When to run this

Run this runbook when ANY of the following is true:

- `verify-ta1.ts` reports `EC-V21-A.8 SKIP-with-fail-forward` because the v2.1 re-ingest was deferred.
- Live Supabase shows `select count(*) from kb_chunks where source like 'atlas/%'` = 0 (or implausibly low).
- The Atlas KB folder layout changed (new company added under `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/`).
- A previous run reported `0/N inserted` despite N source rows (the dedup-bug signature flagged in T3 Wave-1).

---

## 2. Prerequisites

### 2.1 Environment

A `.env.local` file at `apps/product-helper/.env.local` with at minimum:

```bash
POSTGRES_URL=postgres://postgres:postgres@localhost:54322/postgres   # local Supabase Docker
# OR for production:
POSTGRES_URL=<from Supabase project yxginqyxtysjdkeymnon>

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...   # required for embeddings; v2.1 leaves this unused if pgvector not yet wired
AUTH_SECRET=<≥32 chars>
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENROUTER_API_KEY=...
BASE_URL=http://localhost:3000
```

The strict env validator (`lib/config/env.ts`) rejects all-`stub` values.

### 2.2 Path-fix verification

The pre-v2.1 ingest script pointed at a stale folder name. Before re-running, verify the path fix from `migrations-and-agent-audit` landed:

```bash
grep -n "13-Knowledge-banks-deepened\|9-stacks-atlas" \
  apps/product-helper/scripts/ingest-kbs.ts
```

Expected: the script reads from `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/`. If it still references `8-public-company-stacks-atlas/` or `New-knowledge-banks/`, the path fix did NOT land — STOP and re-open the EC-V21-A.0 preflight ticket.

### 2.3 Dedup-bug audit

T3 Wave-1 surfaced a `0/3289 inserted` no-op. That signature usually means the dedup key is over-broad (e.g. hashing on stable identifiers that already exist from a prior partial ingest). Before re-running:

```bash
psql "$POSTGRES_URL" -c "select source, count(*) from kb_chunks group by source order by 2 desc limit 20;"
```

If atlas-source rows ARE present but stale, decide between:

- **Soft re-ingest (preferred):** keep existing rows; let the dedup logic skip duplicates. Use this when the corpus is unchanged.
- **Hard re-ingest:** delete atlas rows first, then re-insert.

  ```sql
  delete from kb_chunks where source like 'atlas/%';
  ```

  Use this when source content changed (new company added, schema migration, etc.).

If atlas rows are absent AND prior runs reported 0 inserts, the dedup-key is the suspect. Check `scripts/ingest-kbs.ts` for the line that builds the dedup key — should be a hash of `(source, content_hash)` or `(source, chunk_index)`. Document the audit in `plans/v21-outputs/ta1/atlas-ingest-notes.md` before any re-run.

---

## 3. Run

### 3.1 Local Supabase (Docker)

```bash
cd apps/product-helper

# Source env strictly (env validator is strict — see project memory)
set -a; source .env.local; set +a

# Capture row count before
psql "$POSTGRES_URL" -c "select count(*) from kb_chunks where source like 'atlas/%';" \
  | tee /tmp/atlas-rows-before.txt

# Run ingest
pnpm tsx scripts/ingest-kbs.ts 2>&1 | tee /tmp/atlas-ingest.log

# Capture row count after
psql "$POSTGRES_URL" -c "select count(*) from kb_chunks where source like 'atlas/%';" \
  | tee /tmp/atlas-rows-after.txt
```

### 3.2 Production Supabase

Same as §3.1 with `POSTGRES_URL` pointing at the prod project (`yxginqyxtysjdkeymnon`). Coordinate with David before running against prod — re-ingests are idempotent under correct dedup logic but `delete then insert` is not.

---

## 4. Expected row-count delta

| Scenario | Expected delta | Interpretation |
|---|---|---|
| First-ever atlas ingest, fresh DB | rows_after ≈ N (chunk count of all KB-9 atlas files) | Healthy. Snapshot N for future runs. |
| Soft re-ingest, unchanged corpus | rows_after = rows_before | Healthy. Dedup working. |
| Soft re-ingest after corpus update | rows_after > rows_before | Healthy if delta matches new chunks added. |
| 0 inserted, rows_before = 0 | rows_after = 0 | **DEDUP BUG.** Stop. Audit dedup-key per §2.3. |
| 0 inserted, rows_before > 0 | rows_after = rows_before | Healthy under soft re-ingest. |

The pre-v2.1 baseline was `0/3289 dedup no-op` against an empty `kb_chunks` table — that's the failure signature. Healthy behavior on a fresh DB is `N inserted` where N matches the chunk count.

---

## 5. Verification

After §3, check:

```bash
psql "$POSTGRES_URL" -c "
  select source, count(*) as chunks
  from kb_chunks
  where source like 'atlas/%'
  group by source
  order by 1;
"
```

Expected: one row per atlas company under `9-stacks-atlas/` (anthropic, supabase, langchain, vercel, …). Each company should show > 0 chunks.

Then re-run the verifier:

```bash
pnpm tsx apps/product-helper/scripts/verify-ta1.ts
```

EC-V21-A.8 should flip from `SKIP-with-fail-forward` to `PASS`.

---

## 6. Rollback

If the re-ingest produced bad data (wrong embeddings, wrong source paths, corrupted chunks):

```sql
-- Captures the rollback target before any destructive op
create temp table _atlas_backup as
  select * from kb_chunks where source like 'atlas/%';

delete from kb_chunks where source like 'atlas/%';
-- Then either restore from `_atlas_backup` or re-run §3 with the fix.
```

---

## 7. Cross-references

- Path-fix EC: `plans/v21-outputs/ta1/agents-audit.md` (where the stale path was first flagged).
- Dedup audit notes: `plans/v21-outputs/ta1/atlas-ingest-notes.md`.
- Pre-v2.1 baseline: `plans/t3-outputs/verification-report.md` (the original `0/3289 no-op` evidence).
- Verifier: `apps/product-helper/scripts/verify-ta1.ts` EC-V21-A.8 assertion.
- KB layout reference: `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/`.
