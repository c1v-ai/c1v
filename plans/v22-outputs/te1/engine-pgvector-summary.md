---
team: c1v-kb-runtime-engine
agent: engine-pgvector
ec: EC-V21-E.6
branch: wave-e/te1-engine-pgvector
created: 2026-04-27
---

# engine-pgvector — completion summary

EC-V21-E.6 (G8 + G9 — pgvector + embeddings + searchKB p95 < 200ms)
closed against the local Supabase instance.

## Day-0 status (per `plans/wave-e-day-0-inventory.md` line 120)

- `kb_chunks` table + ivfflat lists=100 index ✅ shipped
  (`0011a_kb_chunks.sql` 2026-04-21).
- pgvector extension ✅ enabled (`0008_enable_pgvector.sql`).
- Plural's `lib/langchain/engines/kb-embedder.ts` (7.4K, Apr 24) +
  `kb-search.ts` (3.1K, Apr 22) are the runtime. NOT re-authored.
- T3 Phase B ingest already ran. CLAUDE.md notes "0/3289 dedup no-op"
  which is a re-run signature, not a silent failure.

## Row-count verification

```
=== local-supabase (postgresql://postgres:***@localhost:54322/postgres) ===
   row count : 7670
   by module :
     1               224
     2               927
     3               861
     4               961
     5              1035
     6               734
     7               580
     8               375
     9               212
     _shared         272
     crawley-sys-arch-strat-prod-dev  1489
```

Eleven module/source buckets populated. `_shared` (T9 dedup pool) and
`crawley-sys-arch-strat-prod-dev` (Crawley book ingest) confirm both
the legacy 7-module corpus and the post-T9 reorg are present.

**Production verification deferred** — no live `POSTGRES_URL` in
the spawn context. Path-of-record documented in
`engine-pgvector-apply-log.md`.

## RLS policies applied

DELTA migration `0026_kb_chunks_rls.sql` (manual SQL apply per repo
convention; drizzle-kit broken).

| Policy | Verb | Subject | Condition |
|---|---|---|---|
| `kb_chunks_service_all` | ALL | service role | `current_setting('app.current_role') = 'service'` |
| `kb_chunks_authenticated_select` | SELECT | engine + tenant | `current_role IN ('engine','tenant') OR current_team_id IS NOT NULL` |

Plus role grants:

- `REVOKE INSERT, UPDATE, DELETE, TRUNCATE FROM PUBLIC` (and from
  `authenticated` if present).
- `GRANT SELECT TO authenticated`.
- `REVOKE ALL FROM anon` — anonymous traffic blocked at grant layer.

**Why GLOBAL-READ, not tenant-scoped:** KB corpus is reference content
(Crawley + eCornell + atlas + `_shared`); identical for every tenant.
Tenant-scoping it would break the engine's RAG path with zero privacy
benefit. D-V21.22 also locks RAG to KB chunks only — surface stays
narrow.

## RLS smoke tests

`__tests__/db/kb-chunks-rls.test.ts` — 8/8 green against local
Supabase. Coverage:

| # | Scenario | Expected | Result |
|---|---|---|---|
| 1 | service role INSERT + SELECT | rows visible | PASS |
| 2 | engine context (authenticated + role=engine) SELECT | rows visible | PASS |
| 3 | tenant context (authenticated + team_id=1) SELECT | rows visible | PASS |
| 4 | anon role SELECT | permission denied at grant layer | PASS |
| 5 | authenticated, no flags SELECT | 0 rows (RLS-masked) | PASS |
| 6 | engine context INSERT | denied | PASS |
| 7 | tenant context INSERT | denied | PASS |
| 8 | engine context UPDATE | 0 rows affected (no policy) | PASS |

Tests SKIP cleanly when local DB is unreachable (mirrors
`project-artifacts-rls.test.ts` pattern).

## HNSW upgrade decision: **SKIP**

`scripts/measure-searchkb-p95.ts` benched 50 production-shape queries
(5 warmup discarded) under stub embeddings to isolate the DB path.

```
n      : 50
min    : 1.7 ms
mean   : 36.3 ms
p50    : 26.7 ms
p95    : 86.2 ms
p99    : 246.3 ms
max    : 246.3 ms
```

**p95 = 86.2ms < 200ms target — 57% headroom.** Full rationale + re-
revisit triggers in `engine-pgvector-decision.md`.

The HNSW migration `0027_kb_chunks_hnsw_upgrade.sql` is **not
shipped**. Recipe is documented in the decision doc for paste-ready
re-engagement if corpus growth or eval drift fires the triggers.

## Files shipped on this branch

| File | Purpose |
|---|---|
| `apps/product-helper/scripts/verify-kb-chunks-populated.ts` | Row-count sanity script (local + env-supplied targets) |
| `apps/product-helper/lib/db/migrations/0026_kb_chunks_rls.sql` | RLS DELTA migration |
| `apps/product-helper/__tests__/db/kb-chunks-rls.test.ts` | 8 RLS smoke tests |
| `apps/product-helper/scripts/measure-searchkb-p95.ts` | Latency bench |
| `plans/v22-outputs/te1/engine-pgvector-apply-log.md` | Apply log + post-apply verification |
| `plans/v22-outputs/te1/engine-pgvector-decision.md` | HNSW skip decision + re-revisit triggers |
| `plans/v22-outputs/te1/engine-pgvector-summary.md` | This file |

**No re-authorship of `kb-embedder.ts` or `kb-search.ts`** — Day-0
inventory line 120 honored.

## Branch + tag policy

Final commits land on `wave-e/te1-engine-pgvector`. **No tag** per
spawn-prompt instruction. Coordinator owns the closeout tag for
EC-V21-E.6.

## Worktree note (for the coordinator)

This branch shares a worktree with `wave-e/te1-provenance-ui`,
`wave-e/te1-engine-stories`, and others (per repo CLAUDE.md
"Multiple claude-peer sessions share the working tree"). During
this session, two of my commits initially landed on
`provenance-ui` and one on `engine-stories` due to peer branch-
switching mid-session; cherry-picked back onto
`wave-e/te1-engine-pgvector` (commits `a931d9a` /
`5e8b90b` / `f5f6d16`). The originals remain on the sibling
branches as harmless duplicates — they touch only files owned by
this agent (scripts/, __tests__/db/, lib/db/migrations/0026, plans/
v22-outputs/te1/) so they should rebase or merge cleanly.

## Out of scope (unchanged from spawn-prompt)

- Re-authoring kb-embedder / kb-search.
- Re-running T3 Phase B ingest without coordinator approval.
- Tenant-scoping kb_chunks (KB is global by design).
- Switching embedding model from `text-embedding-3-small`.
- Production DB apply (deferred to coordinator decision).
