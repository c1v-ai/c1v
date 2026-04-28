# Wave E Day-0 Inventory

> **Source spec:** [`c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md) §"Day-0 inventory" lines 55-64. EC-V21-E.0(ii) blocking artifact.
> **Status:** ✅ COMPLETE — Bond, 2026-04-26 18:05 EDT. All 4 tasks executed; output committed before Wave E start.
> **Net finding:** Wave E starts in a **substantially better state than the v2.2 stub assumed.** Three of the four investigations either (a) confirmed prior work fully shipped or (b) collapsed an open follow-up to ✅. P2 is effectively empty; P3 is resolved; G5/G8/G9 are partially-to-fully shipped on disk. Wave E scope shrinks accordingly.

---

## Task 1 — T9 dedup inventory (`apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_shared/`)

**Goal:** confirm what already shipped to `_shared/` so Wave E doesn't redo it.

**Method:** walked the `_shared/` directory; counted symlinks under each of the 9 module folders; spot-checked that no file-duplicates remain at known cross-cutting paths (api-design, caching, cap_theorem, cdn, data-model, etc.).

**Findings:**

| Metric | Value | Notes |
|---|---|---|
| `_shared/` cross-cutting KB files | **13** | api-design, caching, cap_theorem, cdn-networking, data-model, deployment-release-cicd, load-balancing, maintainability, message-queues, Multithreading-vs-Multiprocessing, observability, resiliency-patterns, software_architecture_system |
| `_shared/05-crawley/` chapter excerpts | **2** | ch03-complex-systems, ch07-solution-neutral-function |
| Symlinks per module folder | **13 each** | 1-defining-scope, 2-requirements, 3-ffbd, 4-decision-net-crawley-on-cornell, 5-form-function, 6-hoq, 7-interfaces, 8-risk, 9-stacks-atlas |
| **Total symlinks** | **9 × 13 = 117** | Matches CLAUDE.md state ("117 relative symlinks"); matches `find -type l` count |
| Remaining file-duplicates | **0** | Spot-checked 5 KBs — only one location each, all in `_shared/` |

**Verdict for Wave E:** T9's dedup work is **100% shipped**. EC-V21-E.10's "duplicate cross-cutting KBs deleted" sub-deliverable is **already done** — Wave E inherits a clean single-source-of-truth tree. Only the 5 schema extensions in E.10 remain.

---

## Task 2 — Migrations on-disk verification

**Goal:** confirm Wave E's delta-migration plan still holds against current `0008_enable_pgvector.sql` + `0011_kb_chunks.sql` + `0011_decision_audit.sql`.

**Files read:**
- `apps/product-helper/lib/db/migrations/0008_enable_pgvector.sql` (19 LOC, 2026-04-20)
- `apps/product-helper/lib/db/migrations/0011a_kb_chunks.sql` (78 LOC, 2026-04-21 — note: renamed from `0011_` per EC-V21-A.0(a))
- `apps/product-helper/lib/db/migrations/0011b_decision_audit.sql` (184 LOC, 2026-04-21, revised 2026-04-22 — note: renamed from `0011_`)
- `apps/product-helper/lib/db/migrations/0013_project_run_state.sql` (5992 bytes, 2026-04-24)

**On-disk state:**

| Migration | Wave-E Gap | Shipped? | Delta needed in Wave E |
|---|---|---|---|
| `0008_enable_pgvector.sql` | precondition for G8/G9 | ✅ | None |
| `0011a_kb_chunks.sql` | G8 (vector DB) + G9 (embeddings layer) | ✅ table + ivfflat index + (kb_source, chunk_hash) unique gate | (a) HNSW upgrade once corpus crosses ~10k rows (per pgvector docs); (b) **RLS policies for kb_chunks (currently has none)**; (c) embedder script if not yet shipped |
| `0011b_decision_audit.sql` | G5 (audit-db) | ✅ FULL EngineOutput shape (1:1 mapping, runtime peer 2026-04-22), hash_chain_prev for tamper detection, RLS (service + tenant SELECT/INSERT), append-only enforcement (REVOKE UPDATE/DELETE/TRUNCATE) | None — table is **production-shape**. Wave E only needs to wire `writeAuditRow()` from the engine to it. |
| `0013_project_run_state.sql` | unrelated to Wave E | ✅ | n/a |

**Verdict for Wave E:**
- **G5 is ~80% shipped.** The `decision_audit` table has the canonical shape from the runtime peer's 2026-04-22 spec. Wave E's EC-V21-E.3 collapses to: write the engine-side `writeAuditRow()` + verify hash chain works under load. **No new migration required.**
- **G8 + G9 are ~60% shipped.** `kb_chunks` table + ivfflat index + dedup gate exist; embedder script may already exist (T3 Phase B ingest landed 2026-04-24 per CLAUDE.md). Wave E's EC-V21-E.6 narrows to: (a) verify embeddings populated; (b) add RLS policies to `kb_chunks` (currently none); (c) HNSW upgrade once row count justifies it.
- **Net delta-migration cost:** 1 small migration for `kb_chunks` RLS, optional HNSW migration deferred until row count signal. Wave E's DB surface is way smaller than the source plan implied.

---

## Task 3 — R-v2.1.A inventory pickup (P2 table population)

**Goal:** populate [`plans/post-v2.1-followups.md`](post-v2.1-followups.md) P2 with each adapter-wrapped agent (file path, LOC delta estimate, adapter commit SHA, refactor ticket scope).

**Source:** [`plans/v21-outputs/ta1/agents-audit.md`](v21-outputs/ta1/agents-audit.md) — TA1's grep-based audit of 12 system-design agents for `fs.{write,read,append,mkdir,unlink}`, `writeFile`, `readFile`, etc.

**Findings (verbatim from agents-audit.md):**

| # | Agent | fs calls | Classification |
|---|---|---|---|
| 1-10 | data-flows, decision-net, ffbd, fmea-early, fmea-residual, form-function, hoq, interface-specs, n2, nfr-resynth | none | clean |
| 11 | synthesis-agent.ts | 1 (`readFileSync` in `loadUpstream()` L224-243) | **script-only** |
| 12 | architecture-recommendation-agent.ts | none | clean |

**Verdict for P2:**
- 12/12 agents audited; 1 fs call site found.
- Classification: **1 script-only / 0 shared-utility / 0 requires-refactor**.
- The 1 fs site (`synthesis-agent.ts:loadUpstream`) is invoked only by `scripts/build-synthesis*.ts` (offline path); the LangGraph node receives upstream artifacts via graph state. R-v2.1.A Option C wrapper handled it; underlying `loadUpstream` is preserved for the script path.
- **No agent requires the >200 LOC refactor escalation.**

**Action for post-v2.1-followups.md:** P2 should be **collapsed to ✅** (or removed entirely) with a one-line note: "Audited 2026-04-26 in `plans/wave-e-day-0-inventory.md` Task 3 — no >200 LOC refactors deferred; R-v2.1.A Option C wrapper sufficient for all 12 agents."

---

## Task 4 — TD1 fixture-vs-live drift check

**Goal:** read `plans/v21-outputs/td1/preflight-log-fixture.md` vs `preflight-log-live.md`. Capture divergence shape if any; collapse P3 to ✅ if not.

**Files read:**
- `preflight-log-fixture.md` (66 LOC, 2026-04-25) — offline replay, sizing only
- `preflight-log-live.md` (82 LOC, 2026-04-25) — live Anthropic API replay against project=33

**Method comparison:**

| Dimension | Fixture | Live |
|---|---|---|
| API calls | 0 (offline replay) | 1 (production key) |
| Schema | `apiSpecificationSchema` serialized to JSON Schema | `apiSpecificationSchema` bound as forced tool |
| Tokens (input) | 4916 (approx) | 6464 (actual) |
| Tokens (output) | n/a | 12000 (hit cap) |
| stop_reason | "Cannot determine from offline replay" | **"max_tokens"** (definitive) |
| Branch decision | "Provisional, fixture-only — consistent with cutoff hypothesis but does not exclude end_turn" | **CUTOFF (max_tokens) — split-only fix sufficient** |
| Endpoints emitted | n/a | 22 (5/6 top-level keys; missing `errorHandling` = truncation tail) |

**Drift analysis:**

The live log explicitly states under "Fixture-vs-live divergence":
> None. Fixture replay (offline sizing) was consistent with the cutoff hypothesis; live replay confirms it definitively. No drift carried into v2.2 followups.

**Verdict for P3:** ✅ **RESOLVED** — fixture and live agree on the cutoff (max_tokens) hypothesis. Fixture's "cannot determine stop_reason" caveat was an honest scope-of-method note (offline replay can't measure live API metadata), not a divergence. The CUTOFF branch decision holds.

**Action for post-v2.1-followups.md:** P3 collapses to ✅ with a one-line note: "Resolved 2026-04-26 in `plans/wave-e-day-0-inventory.md` Task 4 — fixture and live preflight both confirm CUTOFF (max_tokens). Zero drift."

**Bonus finding (not in original P3 scope):** Live preflight surfaces a **prompt-caching bug** — `cache_creation=0`, `cache_read=0` despite `cacheControl: true` in `lib/langchain/config.ts`. The `bindTools()` path (used by api-spec-agent's preflight) is not propagating cacheControl. Out of scope for Wave E itself but a real cost-lever miss for the AV.01 $320/mo target. **Recommend filing as new P-line in `post-v2.1-followups.md`** (P6 — prompt-caching not propagating through bindTools; affects every agent that uses bound-tool input_schema; potential 50-90% input-token reduction on cache hits).

---

## Net impact on Wave E scope

The v2.2 stub estimated Wave E at ~10-15 days. This inventory shrinks the surface materially:

| EC | Original scope | Adjusted scope after inventory |
|---|---|---|
| **EC-V21-E.0** | (i) source plan path rewrite + (ii) snapshot tag | (i) ✅ done 2026-04-25 (per stub); (ii) tag `wave-e-pre-rewrite-2026-04-26` still required |
| **EC-V21-E.3** | G5 — `decision_audit` extensions + writer + RLS + per-decision row | Table + RLS + append-only ✅ shipped. Remaining: write engine-side `writeAuditRow()` + verify hash chain. **~1 day instead of ~3.** |
| **EC-V21-E.6** | G8 + G9 — pgvector + embeddings + 313 KB files embedded + searchKB p95 < 200ms | Table + ivfflat ✅ shipped. T3 Phase B ingest already ran (per CLAUDE.md). Remaining: verify embeddings populated, add RLS to `kb_chunks`, optionally HNSW. **~1-2 days instead of ~4.** |
| **EC-V21-E.10** | KB rewrite δ — duplicate cross-cutting KBs deleted + 5 schema extensions | Dedup ✅ done by T9 (117 symlinks, 0 file-duplicates). Remaining: 5 schema extensions only. **~1 day instead of ~3.** |
| All other ECs (E.1, E.2, E.4, E.5, E.7, E.8, E.9, E.11, E.12, E.13) | unchanged | unchanged |

**Revised Wave E estimate:** ~7-10 days instead of ~10-15.

The P2 follow-up evaporates entirely (no >200 LOC refactors deferred). P3 collapses to ✅. P6 (prompt-caching bug) gets opened as a new follow-up worth investigating because it's a direct lever on the AV.01 cost target.

---

## Recommended next moves (post-Day-0)

1. **Update `plans/post-v2.1-followups.md`:**
   - P2 → ✅ resolved (no refactors deferred; cite this doc).
   - P3 → ✅ resolved (zero fixture-vs-live drift; cite this doc).
   - **New P6** — prompt-caching not propagating through `ChatAnthropic.bindTools()` path (cite `preflight-log-live.md` line 81).
2. **Tag the snapshot:** `git tag wave-e-pre-rewrite-2026-04-26 fdbfc54` (current tip of `wave-b/tb1-docs`) per EC-V21-E.0(ii). This is the rollback anchor before any Wave E phase-file edit.
3. **Write `plans/team-spawn-prompts-v2.2.md`** — mirroring v2.1's spawn-prompts pattern for Wave C + E. Wave E spawn prompts can now reflect the reduced scope per the table above.
4. **Defer P5 (stranded `kb-upgrade-v2/` partial trees)** to opportunistic cleanup; not blocking Wave E.

---

## Cross-references

- v2.2 stub (parent): [`c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md)
- Backlog being updated: [`post-v2.1-followups.md`](post-v2.1-followups.md)
- TA1 audit source: [`v21-outputs/ta1/agents-audit.md`](v21-outputs/ta1/agents-audit.md)
- TD1 preflight source: [`v21-outputs/td1/preflight-log-fixture.md`](v21-outputs/td1/preflight-log-fixture.md), [`preflight-log-live.md`](v21-outputs/td1/preflight-log-live.md)
- Wave E source plan: [`kb-runtime-architecture.md`](kb-runtime-architecture.md)
- Migration files: `apps/product-helper/lib/db/migrations/0008_enable_pgvector.sql`, `0011a_kb_chunks.sql`, `0011b_decision_audit.sql`
