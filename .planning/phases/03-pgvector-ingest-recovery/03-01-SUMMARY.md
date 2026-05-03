---
phase: 03-pgvector-ingest-recovery
plan: 01
status: complete
completed: 2026-05-02
requirements: [VEC-01, VEC-02, VEC-03]
wave: 1
---

# Plan 03-01 Summary: pgvector Ingest Recovery — All 3 VEC Requirements Met

## One-liner
Root cause diagnosed (Phase A stub embeddings blocked Phase B ON CONFLICT), walker fixed to skip legacy dirs, local and prod both re-ingested with 3,355 real OpenAI embeddings — idempotent on second run.

## Root Cause (VEC-01)

Phase A ingest ran with `EMBEDDINGS_STUB=1`, writing 7,681 rows to local `kb_chunks` with stub-seeded fake vectors. Phase B tried to ingest the same content with real OpenAI embeddings, but `ON CONFLICT DO NOTHING` on `(kb_source, chunk_hash)` skipped all 3,289 insertions — the hash is content-only (no embedding model tag), so stub and real embeddings of identical text produce the same dedup key.

Secondary bug: `SKIP_DIR_PATTERNS` in `ingest-kbs.ts` was not excluding internal dirs `_legacy_2026-04-26` (1,378 chunks — archived pre-T9 content) and `_dev-runbooks` (10 chunks — developer guides). These were being ingested as KB content.

## What Was Done

### Fix 1: Walker exclusions (ingest-kbs.ts)
Added `/_legacy_/` and `/^_dev-runbooks$/` to `SKIP_DIR_PATTERNS`. Walker now produces **3,452 chunks** across **10 sources** (numbered KBs 1-9 + `_shared`), down from 4,840.

### Fix 2: Clear local stub rows
`DELETE FROM kb_chunks` on local Supabase (port 54322) — cleared 7,681 stale rows.

### Fix 3: Re-ingest local with real embeddings
Ran `ingest-kbs.ts` with `OPENAI_API_KEY` against local Supabase.
Result: **3,355 rows** inserted (97 intra-source deduped by ON CONFLICT). IVFFLAT cosine index present.

### Fix 4: Apply migrations to prod
Prod `kb_chunks` table didn't exist — applied:
- `0008_enable_pgvector.sql` (extension)
- `0011a_kb_chunks.sql` (table + indexes)
- `0026_kb_chunks_rls.sql` (RLS policies)

### Fix 5: Ingest prod with real embeddings
Ran `ingest-kbs.ts` with `OPENAI_API_KEY` against prod Supabase (`yxginqyxtysjdkeymnon`).
Result: **3,355 rows** inserted. IVFFLAT cosine index present.

### Idempotency verified
Second prod run: `inserted=0, skipped=3452` — ON CONFLICT correctly no-ops on unchanged content.

## Verification Results

| Check | Local | Prod |
|-------|-------|------|
| `kb_chunks` row count | 3,355 | 3,355 |
| Vector index | IVFFLAT ✓ | IVFFLAT ✓ |
| Embedding type | Real OpenAI | Real OpenAI |
| Second run idempotent | ✓ | ✓ |
| kb_source='1-defining-scope' spot-check | 168 rows | 168 rows |

## Self-Check: PASSED
- [x] VEC-01: Root cause documented in 03-01-DIAGNOSIS.md
- [x] VEC-02: Phase B ingest successful — >0 rows in both local and prod
- [x] VEC-03: Prod `kb_chunks` count = 3,355 with real OpenAI embeddings (embedding IS NOT NULL)
- [x] Idempotency: second run is 0 inserts / 3,452 skipped
- [x] _legacy_ and _dev-runbooks excluded from walker

## Key Files Changed
- `apps/product-helper/scripts/ingest-kbs.ts` — added `_legacy_` + `_dev-runbooks` to SKIP_DIR_PATTERNS
- `.planning/phases/03-pgvector-ingest-recovery/03-01-DIAGNOSIS.md` — root cause documentation
