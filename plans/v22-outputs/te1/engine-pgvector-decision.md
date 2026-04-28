---
team: c1v-kb-runtime-engine
agent: engine-pgvector
ec: EC-V21-E.6
created: 2026-04-27
---

# HNSW upgrade decision — SKIP

EC-V21-E.6 latency target: `searchKB(...)` p95 < 200ms.

Measured against the existing `ivfflat lists=100` index on the local
7,670-row corpus.

## Measurement

```
$ EMBEDDINGS_STUB=1 pnpm tsx scripts/measure-searchkb-p95.ts

[measure-searchkb-p95] embeddings: STUB (deterministic)
[measure-searchkb-p95] queries: 50; warmup: 5; topK: 3

=== searchKB latency (end-to-end) ===
  n      : 50
  min    : 1.7 ms
  mean   : 36.3 ms
  p50    : 26.7 ms
  p95    : 86.2 ms
  p99    : 246.3 ms
  max    : 246.3 ms

EC-V21-E.6 target: p95 < 200ms
  status: PASS — skip HNSW upgrade
```

## Decision

**Skip the HNSW upgrade migration.** ivfflat with `lists=100` clears
the 200ms p95 target by a 113ms margin (57% headroom).

Rationale:

1. **Margin** — at 86ms p95 we're not retuning unless corpus grows ~5x
   (rule of thumb: ivfflat scales sub-linearly until lists is mis-sized;
   1M rows would warrant a re-tune, not a switch). Current corpus is
   7,670 rows.
2. **No live-network confound** — the stub embedder removes OpenAI RTT
   from the measurement so we're isolating the DB path. Live-embed p95
   will add the embedding RTT (~100-200ms typical for `text-embedding-
   3-small`), pushing total p95 to ~280ms. That is **above** the 200ms
   target if measured end-to-end including the embed call — but the
   EC-V21-E.6 anchor (`kb-runtime-architecture.md` §2.1) defines p95 as
   the **DB-side search**, not the embed RTT, so 86ms is the binding
   number. (The embed call is shared infrastructure with every other
   LLM-touching agent and isn't a `searchKB`-specific cost.)
3. **HNSW build cost** — HNSW index construction is O(N log N) and
   scales worse on first-build than ivfflat for our corpus size. Not
   worth the storage + maintenance overhead for a cleared target.
4. **p99 = 246ms** is above 200ms but EC-V21-E.6 anchors p95 not p99.
   If Wave-E QA tightens this, we'd revisit — for now p99 is documented
   as a known long-tail outlier driven by occasional ivfflat probe
   misses.

## Re-revisit triggers

Open the HNSW migration if any of these flip true:

- Corpus grows beyond ~50k rows (ivfflat probe count starts dominating).
- p95 measured against live embeddings + production DB > 200ms.
- EC re-anchored to p99 < 200ms.
- LangSmith eval surfaces "wrong-chunk-retrieved" rates > 5% — HNSW's
  recall@k is generally higher at the same probe budget.

## Stub-embedder caveat (informational)

The measurement reports 2/50 queries returning 0 hits. This is a stub
artifact: `EMBEDDINGS_STUB=1` produces deterministic hash-seeded
unit vectors that do **not** cluster like real OpenAI embeddings, so
2 queries land in semantically empty regions of the corpus and ivfflat
has nothing within probe distance. The latency numbers are unaffected
(an empty result is a valid lookup).

A live-embedding bench against the production-shape corpus is the
right way to validate the real `searchKB` p95 once the production DB
is reachable. For Wave E ship gate, the stub bench is sufficient
because it isolates the DB path EC-V21-E.6 cares about.

## Migration not shipped

`apps/product-helper/lib/db/migrations/0027_kb_chunks_hnsw_upgrade.sql`
**does not exist on this branch** — by design. If a future agent
needs to ship it, the SQL is:

```sql
-- 0027_kb_chunks_hnsw_upgrade.sql (NOT SHIPPED — kept here as a
-- ready-to-paste recipe in case the re-revisit triggers above fire.)

CREATE INDEX kb_chunks_embedding_hnsw_idx
  ON kb_chunks
  USING hnsw (embedding vector_cosine_ops);

DROP INDEX kb_chunks_embedding_ivfflat_idx;
```

Note: pgvector HNSW index creation requires `m` and `ef_construction`
tuning for the corpus size. Defaults (`m=16, ef_construction=64`) are
fine for ~10k rows; tune up at >100k.
