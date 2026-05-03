---
phase: 03-pgvector-ingest-recovery
plan: 01
type: diagnosis
created: 2026-05-02
---

# VEC-01: pgvector Phase B Ingest Collision — Root Cause

## Root Cause

**Phase A ran with `EMBEDDINGS_STUB=1`.** The `stubEmbed()` function in `kb-embedder.ts` generates deterministic fake vectors from SHA-256(content) — no OpenAI API call. These stub-embedded rows were written to local `kb_chunks` with the same `(kb_source, chunk_hash)` dedup key that Phase B would produce.

**Phase B used `ON CONFLICT DO NOTHING`.** When Phase B tried to ingest the same chunks with real OpenAI embeddings, every row already existed (same kbSource + same content = same chunkHash). ON CONFLICT DO NOTHING silently skipped all 3,289 inserts. The embedding vectors were never replaced.

This is documented in `kb-embedder.ts` itself (line ~86):
> "Rows written with stub vectors SHOULD be re-embedded under the real model before Phase B — delete them via `DELETE FROM kb_chunks WHERE kb_source IN (...);` then rerun without the flag."

## Evidence

| Source | Value |
|--------|-------|
| Local `kb_chunks` row count | 4,990 rows (stub-embedded from Phase A) |
| T3 Phase B result (2026-04-24) | 0/3,289 inserted (all skipped by ON CONFLICT) |
| Prod `kb_chunks` row count | 0 (Phase B was never run against prod) |
| `EMBEDDINGS_STUB` flag | present in Phase A run environment |
| Dedup key | `(kb_source, chunk_hash)` — identical for stub and real embeddings of same content |

## Secondary Bug: Walker Includes Internal Dirs

Current dry-run (2026-05-02) shows 4,840 chunks across 12 sources. Two sources are internal artifacts that should not be in the vector store:

| Source | Chunks | Why to skip |
|--------|--------|-------------|
| `_legacy_2026-04-26` | 1,378 | Archived pre-T9 content — superseded by numbered KB folders |
| `_dev-runbooks` | 10 | Developer operational guides, not KB knowledge-bank content |

After excluding these: ~3,452 meaningful chunks from 10 sources (numbered KBs 1-9 + `_shared`).

The original T3 Phase B walked 3,289 chunks — close to 3,452, with the delta attributable to T9 KB content changes since April 2026.

## Fix Required

1. Add `_legacy_` and `_dev-runbooks` to `SKIP_DIR_PATTERNS` in `ingest-kbs.ts`
2. Delete local stub rows: `DELETE FROM kb_chunks`
3. Re-ingest local with real `OPENAI_API_KEY` (no EMBEDDINGS_STUB flag)
4. Run against prod — prod is empty, no delete needed
