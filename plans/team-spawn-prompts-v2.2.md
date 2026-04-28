# Team Spawn Prompts — v2.2 (c1v MIT-Crawley-Cornell)

> **Purpose:** Copy-paste-ready `TeamCreate` + `Agent` invocations for v2.2 Waves C + E. Day-0 inventory completed 2026-04-26 — Wave E surface materially smaller than the v2.2 stub assumed; spawn prompts below reflect the reduced scope.
> **Master plan:** [`plans/c1v-MIT-Crawley-Cornell.v2.2.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.2.md)
> **Day-0 inventory:** [`plans/wave-e-day-0-inventory.md`](../../plans/wave-e-day-0-inventory.md) — 4/4 tasks executed; net findings table at §"Net impact on Wave E scope".
> **v2.1 inheritance:** [`team-spawn-prompts-v2.1.md`](team-spawn-prompts-v2.1.md) — 5 teams / 25 agents / ✅ SHIPPED 2026-04-26. v2.2 inherits the dispatch-helper + canonical-skill-injection-header + per-team verifier pattern verbatim.
> **Snapshot anchor:** `wave-e-pre-rewrite-2026-04-26` @ `a7f8a7c` — rollback point before any Wave E phase-file edit (per EC-V21-E.0(ii)).
> **Created:** 2026-04-26
> **Author:** Bond
> **Status:** 📝 DRAFT — not yet dispatched. Pending David's go-ahead OR optional critique iter 1.

---

## What changed since v2.1 spawn prompts

The v2.2 stub at [`c1v-MIT-Crawley-Cornell.v2.2.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.2.md) estimated Wave E at ~10-15 days. The Day-0 inventory shrinks the surface materially (verbatim from inventory §"Net impact on Wave E scope"):

| EC | v2.2 stub assumption | After Day-0 inventory |
|---|---|---|
| **EC-V21-E.0(i)** | Source plan path rewrite | ✅ done 2026-04-25 |
| **EC-V21-E.0(ii)** | Snapshot tag | ✅ done 2026-04-26 (`wave-e-pre-rewrite-2026-04-26` @ `a7f8a7c`) |
| **EC-V21-E.3** | Build `decision_audit` table + writer + RLS (~3d) | Table + RLS + append-only ✅ shipped. Remaining: `writeAuditRow()` engine wiring + verify hash chain. **~1 day.** |
| **EC-V21-E.6** | Build `kb_chunks` + index + embedder + searchKB (~4d) | Table + ivfflat ✅ shipped + T3 Phase B ingest already ran. Remaining: verify embeddings populated + add RLS to `kb_chunks` + optional HNSW upgrade. **~1-2 days.** |
| **EC-V21-E.10** | Delete duplicate cross-cutting KBs + 5 schema extensions (~3d) | Dedup ✅ done by T9 (117 symlinks, 0 file-duplicates). Remaining: 5 schema extensions only. **~1 day.** |
| All other ECs (E.1, E.2, E.4, E.5, E.7, E.8, E.9, E.11, E.12, E.13) | unchanged | unchanged |

**Revised Wave E estimate: ~7-10 days** (was ~10-15).

P2 (deferred fs-side-effects refactors) collapsed to ✅ — 0 agents required refactor. P3 (TD1 fixture-vs-live drift) collapsed to ✅ — zero drift. New P6 filed (prompt-caching not propagating through `bindTools()`) — direct AV.01 cost lever, but out of scope for Wave E itself.

---

## Team inventory — v2.2 2-team roster

| # | Team slug | Wave | Agents | Lead subagent_type | Spawn prompt |
|---|---|---|---|---|---|
| TC1 | `c1v-crawley-schema-closeout` | C | 5 | langchain-engineer | **This doc §TC1** |
| TE1 | `c1v-kb-runtime-engine` | E | 7 | langchain-engineer | **This doc §TE1** |

**Total: 2 teams, 19 agents, 2 dispatch waves (TC1 first, TE1 second — see §Sequencing below).**

Per-team role coverage (mandated, mirrors v2.1 pattern):
- **QA / verifier (every team):** `qa-engineer` agent gates that team's exit criteria from v2.2 master plan and tags `t<slug>-wave-<N>-complete` on green. Non-fix verifier — log failures, surface, do NOT auto-fix.
- **Documentation (every team):** `documentation-engineer` agent updates README / CLAUDE.md / inline JSDoc / runbooks scoped to that team's surfaces. TE1's docs agent additionally writes the v2.2 release notes + plan closeout (folding the v2.1 `plan-updater` role into TE1 since TE1 is the last team to ship in v2.2).

Per-team subagent_type composition (matches actual Step 2 rosters below):
| Team | LangChain | DB | Backend | UI/UX | QA | Docs | **Total** |
|---|---|---|---|---|---|---|---|
| TC1 | 3 | 1 | — | — | 2 | 1 | **7** |
| TE1 | 6 | 2 | 1 | 1 | 1 | 1 | **12** |
| **Total** | **9** | **3** | **1** | **1** | **3** | **2** | **19** |

(No `cache-engineer` or `observability-engineer` slots in v2.2 — Wave B already shipped that surface in v2.1. The prompt-caching bug P6 is filed as a separate cost-lever investigation, not a v2.2 team. TC1's 2 QA = `methodology-page` (qa-engineer per Step 2 row) + `qa-c-verifier`.)

---

## Sequencing

Wave C and Wave E are independent (no shared files). Recommended **serial dispatch** (Wave C first, then Wave E) for two reasons:

1. **LangSmith eval harness from Wave C becomes Wave E quality gate.** EC-V21-C.4 lands ≥30 graded examples per agent — Wave E's per-rule confidence drift can be measured against this dataset.
2. **Single-stream owner load.** Per the v2.2 stub §Sequencing — recommended if owner is single-threaded.

If owner has 2 streams, parallel is fine — the Wave A↔E handshake contract pin (v2.1 lines 498-504, honored verbatim by v2.2) prevents drift between the streams.

**Dispatch waves:**
- **Wave 1 (this doc):** TC1 alone. Estimated ~5-7 days. Ship gate: tag `tc1-wave-c-complete`.
- **Wave 2 (this doc):** TE1 alone. HARD-DEP on `tc1-wave-c-complete` (consumes Wave C's typed schemas + LangSmith dataset). Estimated ~7-10 days. Ship gate: tag `te1-wave-e-complete`.
- **Closeout (this doc):** TE1's docs agent writes v2.2 release notes + plan flip + post-v2.1-followups update + closeout. Mirrors v2.1's TB1 closeout pattern.

**Aggregate v2.2 timeline (serial — recommended for single-stream owner):** ~12-17 days (TC1 5-7 + TE1 7-10).
**Aggregate v2.2 timeline (parallel — if 2 streams available):** ~7-10 days (TE1 alone is critical path; TC1 finishes before TE1 since Wave E HARD-DEPs on TC1's typed schemas + LangSmith dataset). Wave A↔E contract pin (v2.1 lines 498-504, FROZEN) prevents drift between parallel streams. Day-0 inventory's "~7-10 days" estimate refers to Wave E alone — see §"What changed since v2.1 spawn prompts" table.

---

## Dispatch rules (inherited from v2.1 verbatim)

1. `TeamCreate` fires first; `Agent` calls in the immediately-following message. Both `TeamCreate` and all `Agent` calls for a single dispatch wave fire in **one coordinator message** to maximize parallelism.
2. One `Agent` call per teammate → parallel spawn unless an explicit `blocks` field forces sequencing.
3. Teammates reference each other by `name`, never by agentId.
4. Permissions for every `subagent_type` listed already exist in [`.claude/settings.json`](../settings.json) allow-list (verified 2026-04-25 during v2.1 dispatch).
5. **Skill attachment mechanism:** `inline_skills: [...]` in spawn prompts below are documentation. At dispatch time, Bond translates each entry into literal `Skill('X')` invocation instructions via [`scripts/dispatch-helper.ts`](../../scripts/dispatch-helper.ts) (shipped 2026-04-25 per v2.1 fix-up sweep). Per-team verifiers MUST assert every spawned Agent prompt passes `hasCanonicalInjection()` — FAIL on missing header.
6. **HARD-DEP tags:**
   - TC1: no HARD-DEPs (parallel with anything that doesn't touch `lib/langchain/schemas/module-{2,3,4,5}/`).
   - TE1: HARD-DEPs on `tc1-wave-c-complete` (consumes typed schemas + eval dataset) AND `wave-e-pre-rewrite-2026-04-26` (snapshot anchor).
7. **Reference-from-master-plan:** Every team's `context.authoritative_spec` points at the relevant section of [`c1v-MIT-Crawley-Cornell.v2.2.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.2.md) (which inherits-by-reference from v2.1 §Wave C / §Wave E). Decision IDs (`D-V21.NN`) and exit-criterion IDs (`EC-V21-<wave>.NN`) are the canonical lock points; spawn-prompt deliverables map 1:1 to ECs.
8. **Day-0 inventory required-reading (TE1 only):** Every TE1 agent prompt MUST include the Day-0 inventory path (`plans/wave-e-day-0-inventory.md`) in `context.required_reading[]`. `qa-e-verifier` asserts every TE1 Agent prompt body contains the literal substring `wave-e-day-0-inventory.md` — FAIL on missing. (This was previously framed as EC-V21-E.0(iii); moved here per critique #4 — it's dispatch policy, not a checkable artifact.)

---

## TC1 — c1v-crawley-schema-closeout (Wave C)

**Scope:** Typed-schema layer for Crawley discipline (D-V21.13). 10 new module-{2,3,4,5} schemas + `mathDerivationMatrixSchema` (Option Y per [REQUIREMENTS-crawley §5](../../plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md)) + 10 Drizzle migrations + LangSmith eval harness (≥30 graded examples per agent) + `/about/methodology` page surfacing METHODOLOGY-CORRECTION.md (closes v2.1 P9). Honors v2.1 §Wave C verbatim (lines 362-400).

> **D-V21.13 scope clarification:** The decision is named "Module-5 schema delivery" but the 10-schema deliverable spans M2/3/4/5 per [REQUIREMENTS-crawley §5](../../plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md). The matrix schema lives in `module-5/_matrix.ts` but is consumed cross-module; `module-2/3/4` extensions are the consumers. Locked decision ID is inviolable — wording stays; scope is broader than the name.

**EC-V21-C.0 preflight (BLOCKING):** Namespace resolution. `module-5-form-function/` exists on disk and contains the existing form-function-map schema. Default plan: rename `module-5-form-function/` → `module-5/` and absorb the existing `form-function-map.ts` as `phase-3-form-function-concept.ts`. All importers updated; tsc green; `register schemas` returns no duplicate keys. Alternative if rename rejected: namespace new work as `module-5-crawley/`. **`namespace-resolver` agent runs FIRST** and blocks the other 4 TC1 agents until C.0 closes.

**Dependencies:** No external HARD-DEP. Internal sequencing per EC-V21-C.0.

**Honors:** D-V21.13. Inherits-by-reference from v2.1 §Wave C content + ECs.

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-crawley-schema-closeout",
  agent_type: "tech-lead",
  description: "Ship 10 typed Crawley schemas + mathDerivationMatrixSchema + 10 Drizzle migrations + LangSmith eval harness + methodology page. Resolve module-5 namespace collision before parallel work begins. Lock the typed-schema discipline so Wave E can consume it.",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.v2.2.md §Wave C (inherits v2.1 §Wave C lines 362-400 verbatim) + §Locked decisions D-V21.13",
    upstream_artifacts_already_shipped: [
      "apps/product-helper/lib/langchain/schemas/module-5-form-function/form-function-map.ts (T5 — to be absorbed by namespace-resolver)",
      "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/4-system-design/ (M5 KB phase files — Crawley schema source-of-truth)",
      "plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md (Curator's 10-schema pack spec, esp. §5 mathDerivationMatrixSchema + §6 migrations + §7 round-trip tests)"
    ],
    snapshot_anchor: "wave-e-pre-rewrite-2026-04-26 @ a7f8a7c (also rollback point for TC1)",
    out_of_scope: [
      "Any Wave E engine code (TE1 territory)",
      "M2 NFR/constants emission changes (frozen v2.1 surface; runtime envelopes still authoritative until Wave E swaps internals)",
      "FROZEN viewers (decision-matrix-viewer.tsx, fmea-viewer.tsx, etc. per v2.1 EC-V21-A.10)"
    ]
  }
})
```

### Step 2: Spawn 7 teammates

**Dispatch sequence:**
- **T0:** `TeamCreate` + spawn `namespace-resolver`.
- **T0+ε** (after `namespace-resolver` green): spawn `crawley-schemas`, `crawley-migrations`, `eval-harness`, `methodology-page` in parallel.
- **T1** (after all 4 above green): spawn `qa-c-verifier` + `docs-c` in parallel.

```
Agent({
  name: "namespace-resolver",
  subagent_type: "langchain-engineer",
  team: "c1v-crawley-schema-closeout",
  goal: "EC-V21-C.0 preflight (BLOCKING for the rest of TC1). Resolve the `module-5-form-function/` namespace collision so the 10-schema Crawley deliverable can land under a single `module-5/` namespace. Rename `apps/product-helper/lib/langchain/schemas/module-5-form-function/` → `module-5/` and absorb the existing `form-function-map.ts` as `phase-3-form-function-concept.ts` (or whichever Crawley phase aligns per REQUIREMENTS-crawley §5). All importers updated; tsc green; schema registry returns no duplicate keys.",
  inline_skills: ["code-quality", "testing-strategies"],
  deliverables: [
    "git mv apps/product-helper/lib/langchain/schemas/module-5-form-function/ → module-5/ (preserve git history)",
    "apps/product-helper/lib/langchain/schemas/module-5/phase-3-form-function-concept.ts — renamed from `form-function-map.ts`; export name preserved if importers consume it; if export name changes, all importers updated in same commit",
    "apps/product-helper/lib/langchain/schemas/index.ts — registry path updated; tsc green; `register schemas` returns no duplicate keys (run via existing schema-registry test or write a new __tests__/schemas/registry.test.ts assertion)",
    "All importers of the old path updated — grep `apps/product-helper/` for `module-5-form-function` and replace; verify with `pnpm --filter product-helper tsc --noEmit` clean",
    "plans/v22-outputs/tc1/namespace-resolution.md — record what was renamed, what was absorbed, what importers changed (line counts), and any non-obvious decisions (e.g. if rename rejected, fall back to `module-5-crawley/` namespace per master plan §Wave C C-0 alternative)",
    "git tag `tc1-preflight-complete` on green; verifier consumes this tag for EC-V21-C.0 ledger"
  ],
  guardrails: [
    "BLOCKING for `crawley-schemas`, `crawley-migrations`, `eval-harness`, `methodology-page` — those agents block on `tc1-preflight-complete` tag. Do NOT skip the tag.",
    "Rename via `git mv` only (preserve history). Do NOT copy + delete — that loses git blame.",
    "DO NOT add new schemas in this commit — `crawley-schemas` agent owns the 10-schema authoring. namespace-resolver only resolves the existing collision.",
    "If the rename is rejected (e.g. by a coordinator decision to keep both folders), namespace new work as `module-5-crawley/` per master plan alternative AND record the decision in `plans/v22-outputs/tc1/namespace-resolution.md` so `crawley-schemas` knows where to author.",
    "Verify NO test imports the old path before merging (jest globs may pick up stale paths and fail at run-time, not tsc-time).",
    "Single feature branch (e.g. `wave-c/tc1-preflight`). One commit per logical layer (rename, importer fixups, registry update, test verification). Tag final commit `tc1-preflight-complete`."
  ],
  blocks: ["crawley-schemas", "crawley-migrations", "eval-harness", "methodology-page", "qa-c-verifier"]
})

Agent({
  name: "crawley-schemas",
  subagent_type: "langchain-engineer",
  team: "c1v-crawley-schema-closeout",
  goal: "Ship the 10 typed Crawley schemas (D-V21.13) per REQUIREMENTS-crawley §5 — the typed-schema layer that locks the Crawley discipline portfolio narrative. The matrix schema is the keystone (Option Y per REQUIREMENTS-crawley §5); the 9 phase/concept/decision schemas extend M2/M3/M4/M5. Round-trip + x-ui-surface coverage tests per REQUIREMENTS-crawley §7. Honors v2.1 §Wave C lines 372-383 verbatim. EC-V21-C.1 + EC-V21-C.2 gates here.",
  inline_skills: ["langchain-patterns", "code-quality", "testing-strategies"],
  deliverables: [
    "apps/product-helper/lib/langchain/schemas/module-5/_matrix.ts — `mathDerivationMatrixSchema` (Option Y) — Zod schema for the math derivation matrix consumed by 10 matrix sites + 1 scalar chain (EC-V21-C.2). Export `MathDerivationMatrix` TS type + `mathDerivationMatrixSchema` Zod object.",
    "apps/product-helper/lib/langchain/schemas/module-5/phase-1-form-taxonomy.ts — Zod schema for form taxonomy phase",
    "apps/product-helper/lib/langchain/schemas/module-5/phase-2-function-taxonomy.ts — Zod schema for function taxonomy phase",
    "apps/product-helper/lib/langchain/schemas/module-5/phase-3-form-function-concept.ts — already exists post-namespace-resolver (absorbed from form-function-map.ts); extend to align with Crawley phase-3 shape if drift exists",
    "apps/product-helper/lib/langchain/schemas/module-5/phase-4-solution-neutral-concept.ts — Zod schema for solution-neutral concept phase",
    "apps/product-helper/lib/langchain/schemas/module-5/phase-5-concept-expansion.ts — Zod schema for concept-expansion phase",
    "apps/product-helper/lib/langchain/schemas/module-3/decomposition-plane.ts — Zod schema for M3 decomposition plane",
    "apps/product-helper/lib/langchain/schemas/module-4/decision-network-foundations.ts — Zod schema extending v2.1's decision_network.v1 with Crawley foundations fields",
    "apps/product-helper/lib/langchain/schemas/module-4/tradespace-pareto-sensitivity.ts — Zod schema for tradespace + Pareto + sensitivity analysis",
    "apps/product-helper/lib/langchain/schemas/module-4/optimization-patterns.ts — Zod schema for optimization-pattern catalog",
    "apps/product-helper/lib/langchain/schemas/module-2/requirements-crawley-extension.ts — Zod schema extending v2.1's NFR/constants table with Crawley discipline fields",
    "apps/product-helper/lib/langchain/schemas/module-{2,3,4,5}/__tests__/*.test.ts — round-trip + x-ui-surface coverage per REQUIREMENTS-crawley §7. Each schema gets ≥1 round-trip test (parse → stringify → parse must be identity) + ≥1 fixture-replay test against a known-good emission.",
    "apps/product-helper/lib/langchain/schemas/index.ts — register all 10 new schemas + `mathDerivationMatrixSchema`; verify NO duplicate keys via existing registry test (or new __tests__/schemas/registry-no-dupes.test.ts)",
    "10 matrix sites + 1 scalar chain consume `mathDerivationMatrixSchema` (per EC-V21-C.2): grep the agent layer for matrix shapes that should now type-check against the new schema; refactor in same commit if straightforward, or open a follow-up if shape adaptation is non-trivial (defer adapters to v2.3 if so).",
    "plans/v22-outputs/tc1/schemas-shipped.md — markdown table listing each schema, its source-of-truth phase in REQUIREMENTS-crawley.md, the consumer files (matrix sites), test coverage count"
  ],
  guardrails: [
    "HARD-DEP on `tc1-preflight-complete` tag (namespace-resolver must finish first).",
    "BLOCKING for `qa-c-verifier`.",
    "DO NOT modify v2.1 module-2 `_shared.ts` per REQUIREMENTS-crawley curator decision (v2.1 line 390): 0 modifications. Extend via `requirements-crawley-extension.ts` instead.",
    "All schemas are Zod objects — match the existing v2.1 pattern (e.g. `submodule-2-3-nfrs-constants.ts` for shape conventions). DO NOT introduce a different schema library.",
    "Round-trip tests are non-negotiable per REQUIREMENTS-crawley §7 — without them, schema drift will surface in production silently.",
    "If a 10-schema row would require breaking changes to v2.1's shipped agent emissions, FAIL the commit and surface to coordinator — Wave A's contract pin (FROZEN per master plan) must not break.",
    "Commits: one per module ({2,3,4,5}) for the schemas, plus one for `_matrix.ts` keystone, plus one for tests, plus one for registry update."
  ]
})

Agent({
  name: "crawley-migrations",
  subagent_type: "database-engineer",
  team: "c1v-crawley-schema-closeout",
  goal: "Ship the 10 Drizzle migrations per REQUIREMENTS-crawley §6 that persist the Crawley typed-schema deliverables. drizzle-kit migrate is broken (memory: stale 0004 collision); write SQL manually and verify against local Supabase :54322 before merge. RLS from day-one (mirror v2.1 T6 project_run_state pattern, NOT v2.1 projects-table gap). EC-V21-C.3 gate.",
  inline_skills: ["database-patterns", "security-patterns", "code-quality"],
  deliverables: [
    "10 numbered SQL migrations under `apps/product-helper/lib/db/migrations/` — numbers assigned by reading current max + adding sequential. (Pre-v2.2 max: 0011a/0011b/0012/0013 per v2.1 closeout; verify on disk before numbering.) One migration per Crawley schema landing; some may collapse logically (e.g. M3 decomposition + M5 form/function may share a single migration if columns interleave) — document the mapping in `plans/v22-outputs/tc1/migrations-mapping.md`",
    "Each migration adds: (a) the table or extension columns matching the Zod schema's fields, (b) RLS policies — SELECT/INSERT/UPDATE allowed via `app.current_role IN ('service','user')` with project_id-tenant filter, DELETE never (audit retention), (c) indexes per query pattern (project_id always; secondary by phase/module where applicable)",
    "apps/product-helper/lib/db/schema/*.ts — Drizzle table definitions matching the SQL (consumed by lib/db/queries.ts; types must round-trip with the Zod schemas from `crawley-schemas` agent)",
    "apps/product-helper/lib/db/queries.ts — add typed query helpers for each new table: `getCrawley<Module>(projectId)` + `upsertCrawley<Module>(projectId, payload)`. All queries respect existing RLS-context helper.",
    "apps/product-helper/__tests__/db/crawley-rls.test.ts — cross-tenant access blocked across all 10 tables; service-role bypass works; user role with wrong project_id returns 0 rows; index plans verified via EXPLAIN",
    "Local apply verified: run each migration via `psql postgresql://postgres:postgres@localhost:54322/postgres` (per memory: drizzle-kit broken). Capture apply log in `plans/v22-outputs/tc1/migrations-apply-log.md`; assert all 10 land cleanly + RLS smoke tests pass.",
    "plans/v22-outputs/tc1/migrations-mapping.md — table mapping each migration file to its Crawley schema source + RLS policy summary + index choices"
  ],
  guardrails: [
    "HARD-DEP on `tc1-preflight-complete` tag.",
    "BLOCKING for `qa-c-verifier`.",
    "drizzle-kit migrate is BROKEN per memory — write SQL manually. DO NOT attempt `pnpm drizzle-kit generate` or rely on auto-migration generation.",
    "RLS from day-one — policies MUST land in the same migration as the table create. No `ALTER TABLE` to retroactively add RLS. v2.1 P1 (projects table RLS gap) is the explicit anti-pattern to avoid.",
    "Verify against local Supabase :54322 BEFORE PR — production migration on a broken file is the kind of mistake that costs a day to undo.",
    "If a migration file conflicts with a number already on disk (e.g. another peer's WIP), increment and document — do NOT collide.",
    "Commits: one per migration file (10 commits). Tests as separate commit. Mapping doc as separate commit.",
    "Cross-tenant RLS is non-negotiable — if any test shows row leak across tenants, FAIL the commit."
  ]
})

Agent({
  name: "eval-harness",
  subagent_type: "langchain-engineer",
  team: "c1v-crawley-schema-closeout",
  goal: "Ship the LangSmith eval harness — the dataset that becomes Wave E's per-rule confidence-drift quality gate (EC-V21-C.4) AND the quarterly drift-check job (EC-V21-C.6). ≥30 graded examples per agent across the v2 system-design agents (decision-net, form-function, hoq, fmea-early, fmea-residual, interface-specs, n2, data-flows, nfr-resynth, architecture-recommendation = 10 agents). Total dataset ≥300 graded examples. Quarterly job scheduled to detect schema drift via `inputs_hash` divergence on a fixed corpus of 10 reference projects.",
  inline_skills: ["langchain-patterns", "testing-strategies", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/eval/v2-eval-harness.ts — LangSmith dataset client + per-agent evaluator runners. Exports: `runEval(agentName, fixturePath)`, `recordResult(agentName, fixture, result, grade)`, `getDataset(agentName)`. Uses LANGCHAIN_API_KEY + LANGCHAIN_PROJECT env vars.",
    "apps/product-helper/lib/eval/datasets/{decision-net,form-function,hoq,fmea-early,fmea-residual,interface-specs,n2,data-flows,nfr-resynth,architecture-recommendation}.jsonl — ≥30 graded examples each. Each example: `{input: {projectIntake, upstreamArtifacts}, expected_output: <Zod-validated agent output>, grade: 'correct'|'partial'|'wrong', graded_at: timestamp, grader: 'human'|'fixture-replay'|'self-application'}`. Sources: (a) replay v2 self-application runs (already-graded by virtue of v2 closeout), (b) replay v2.1 production projects with anonymization, (c) hand-grade gaps to reach 30/agent.",
    "apps/product-helper/scripts/run-eval-harness.ts — CLI entrypoint to run a full eval pass: loads dataset, invokes agent on each input, scores against expected_output via Zod equality + LLM-as-judge for fuzzy matches, posts results to LangSmith project `c1v-v2-eval`. Usage: `pnpm tsx scripts/run-eval-harness.ts --agent=<name> [--all]`.",
    "apps/product-helper/scripts/quarterly-drift-check.ts — fixed-corpus drift detector (EC-V21-C.6). Loads 10 reference projects from `apps/product-helper/__tests__/fixtures/reference-projects/`; runs each agent; computes `inputs_hash`; compares against last-quarter snapshot. Surfaces drift as a markdown report.",
    ".github/workflows/quarterly-drift-check.yml — GitHub Actions workflow scheduled `0 0 1 */3 *` (first day of every quarter); runs `quarterly-drift-check.ts`; opens issue if drift detected; tags `@team-c1v` for review.",
    "apps/product-helper/__tests__/eval/v2-eval-harness.test.ts — smoke test: dataset loads, schema validates, eval client connects (mock LangSmith in tests), drift detector identifies a synthetic drift case",
    "plans/v22-outputs/tc1/eval-harness-summary.md — per-agent dataset size + grade distribution (correct/partial/wrong) + LangSmith project URL + quarterly job schedule confirmation"
  ],
  guardrails: [
    "HARD-DEP on `tc1-preflight-complete` tag.",
    "BLOCKING for `qa-c-verifier`.",
    "≥30/agent is the floor, not the ceiling — if v2 self-application gives more, ship more (better dataset = better Wave E gate).",
    "Anonymize any v2.1 production project replay — strip user identifiers, project names, user-content text fields. The dataset goes to LangSmith (third-party); David's privacy policy applies.",
    "DO NOT block on perfect grading — 'correct' = exact Zod-shape match; 'partial' = Zod-valid but content drift; 'wrong' = invalid emission. LLM-as-judge for fuzzy matches is acceptable; record the judge model + prompt in the dataset metadata.",
    "If LANGCHAIN_API_KEY is missing in dev, fail gracefully — eval harness must be runnable locally without LangSmith for fixture-replay-only mode.",
    "Quarterly job schedule: `0 0 1 */3 *` (Jan 1, Apr 1, Jul 1, Oct 1 at midnight UTC). Document in the workflow YAML + in the eval-harness-summary.md doc."
  ]
})

Agent({
  name: "methodology-page",
  subagent_type: "qa-engineer",
  team: "c1v-crawley-schema-closeout",
  goal: "Build `/about/methodology` — the user-facing surface that explains the three-pass methodology correction (FMEA instrumental, not terminal — supersedes linear eCornell M1→M7) per D-V21.14 + closes v2.1 P9. Reads canonical METHODOLOGY-CORRECTION.md from `system-design/kb-upgrade-v2/` (locked 2026-04-26 per ta1/methodology-canonical.md). Add nav entry under About. Mirror existing `/about/*` page conventions. EC-V21-C.5 gate.",
  inline_skills: ["nextjs-best-practices", "react-best-practices", "code-quality"],
  deliverables: [
    "apps/product-helper/app/(dashboard)/about/methodology/page.tsx — server component reads `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` at build time (or runtime if simpler) and renders as MDX/markdown via existing markdown-renderer component (likely `components/markdown-viewer.tsx` or equivalent — verify on disk). Page hierarchy: H1 'Methodology', intro paragraph, 3-pass overview diagram (Mermaid), per-pass detail sections, references.",
    "apps/product-helper/components/about/methodology-renderer.tsx (only if existing markdown-renderer doesn't fit) — minimal wrapper that renders the markdown source with brand-token styling (Firefly/Porcelain/Tangerine/Danube) + Mermaid block rendering via existing `components/diagrams/diagram-viewer.tsx` (FROZEN — import only).",
    "apps/product-helper/components/about/about-nav.ts (or equivalent — verify existing about-section nav config) — add 'Methodology' entry pointing to /about/methodology. Place it after any existing entries (e.g. About / Privacy / Terms).",
    "apps/product-helper/__tests__/app/about/methodology.test.tsx — snapshot test: page renders 3-pass copy + Mermaid blocks + nav entry visible; dark-mode parity verified (Firefly bg vs Porcelain bg).",
    "plans/v22-outputs/tc1/methodology-page-summary.md — record the canonical source path consumed (`system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`), the route URL, the screenshot/diff against the source markdown for sanity-check"
  ],
  guardrails: [
    "HARD-DEP on `tc1-preflight-complete` tag.",
    "BLOCKING for `qa-c-verifier`.",
    "DO NOT relabel folders to match v2.1 §0.4.2 renumber — D-V21.14 is 'document drift, do not relabel' (locked per David 2026-04-24 02:24 EDT). Page renders the methodology correction as DOCUMENTATION, not code.",
    "Reuse existing brand tokens from app/theme.css + app/globals.css — NO new design tokens. NO new typography scale. EC-V21-A.11 visual-style lock applies here too.",
    "Reuse existing markdown-renderer component if one exists; do NOT introduce a new MDX library if not needed. Verify on disk first via `find apps/product-helper/components -name 'markdown*'` and `grep -l 'next-mdx' apps/product-helper/`.",
    "Mermaid blocks render via the FROZEN diagram-viewer.tsx — import only, do NOT modify.",
    "Page path is `/about/methodology` per master plan v2.1 line 385. DO NOT route to `/methodology` or `/docs/methodology`.",
    "Single feature branch (e.g. `wave-c/tc1-methodology`). Two commits max: page + nav update; component or styling tweaks if needed."
  ]
})

Agent({
  name: "qa-c-verifier",
  subagent_type: "qa-engineer",
  team: "c1v-crawley-schema-closeout",
  goal: "Verify TC1 exit criteria EC-V21-C.0 through EC-V21-C.6 against the deliverables shipped by the other 5 TC1 agents. CI-reusable verifier script. Tags `tc1-wave-c-complete` only on full green. Non-fix verifier — log failures, capture evidence, surface to coordinator.",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "apps/product-helper/scripts/verify-tc1.ts — TC1-specific verifier (CI-reusable). Asserts: (a) EC-V21-C.0 — namespace-resolver tag exists + `module-5/` exists + `module-5-form-function/` does NOT exist + tsc green + no duplicate registry keys; (b) EC-V21-C.1 — all 10 Crawley schemas present at expected paths + round-trip jest tests pass + total ≥10 schema files; (c) EC-V21-C.2 — `mathDerivationMatrixSchema` exists in `module-5/_matrix.ts` AND ≥10 matrix sites + ≥1 scalar chain consume it (grep + import-graph check); (d) EC-V21-C.3 — all 10 Drizzle migrations applied locally + `crawley-rls.test.ts` green + EXPLAIN plans verified; (e) EC-V21-C.4 — LangSmith dataset ≥30 examples per agent (grep dataset jsonl files); (f) EC-V21-C.5 — `/about/methodology` page renders (snapshot test) + nav entry exists + canonical METHODOLOGY-CORRECTION.md path matches; (g) EC-V21-C.6 — quarterly drift-check workflow YAML exists + cron schedule `0 0 1 */3 *`.",
    "plans/v22-outputs/tc1/verification-report.md — per-EC PASS/FAIL with evidence (commit SHA, log excerpt, query result, screenshot link if applicable). Mirror v2.1's per-team verification-report.md format.",
    "Integration test: spawn fixture project → invoke each Crawley schema's agent path (where applicable) → assert all 10 schemas validate the agent emissions → assert no duplicate-key warnings in the schema registry on boot",
    "git tag `tc1-wave-c-complete` only if every EC green. Push tag to origin."
  ],
  guardrails: [
    "Depend on namespace-resolver + crawley-schemas + crawley-migrations + eval-harness + methodology-page (block on agent names).",
    "Non-fix verifier — log failures, capture evidence, surface to coordinator. Do NOT auto-fix any deliverable.",
    "All 7 EC sub-points (C.0 + C.1 + C.2 + C.3 + C.4 + C.5 + C.6) must be green to tag. Partial green = NO TAG; surface the failed EC(s) to coordinator with evidence; let coordinator decide whether to dispatch fixer agent or carry forward.",
    "Tag MUST point to the head commit of the TC1 feature branch (a merge or rebase commit if branches were squashed). Verify via `git log --oneline -5` before tagging.",
    "Push tag with `git push origin tc1-wave-c-complete`. Do NOT skip the push — TE1 HARD-DEPs on the remote tag.",
    "Single commit: 'test(tc1/verifier): verify-tc1.ts + verification-report.md + tc1-wave-c-complete tag'."
  ]
})

Agent({
  name: "docs-c",
  subagent_type: "documentation-engineer",
  team: "c1v-crawley-schema-closeout",
  goal: "Document TC1's surfaces for downstream teams + future contributors. Update `apps/product-helper/CLAUDE.md` with the new schema-folder section. Write inline JSDoc on each new schema (file-level: source-of-truth phase in REQUIREMENTS-crawley.md; export-level: shape, consumers, drift policy). Append Wave C entry to `plans/v2-release-notes.md`. Coordinate with David on CLAUDE.md edits per file-safety rule.",
  inline_skills: ["code-quality"],
  deliverables: [
    "apps/product-helper/CLAUDE.md — Add `Crawley Typed Schemas (Wave C, v2.2)` section under `Architecture`: lists the 10 new schemas + their REQUIREMENTS-crawley §X source-of-truth, the matrix keystone, the drift policy (quarterly check via `quarterly-drift-check.ts`), the LangSmith eval project URL.",
    "apps/product-helper/lib/langchain/schemas/module-{2,3,4,5}/*.ts — file-level JSDoc on each new schema: `@source REQUIREMENTS-crawley §X`, `@consumers <list of agent files / matrix sites>`, `@drift-policy quarterly via scripts/quarterly-drift-check.ts`. Export-level JSDoc on the Zod schema: shape summary + 1-line description per top-level key.",
    "apps/product-helper/lib/eval/v2-eval-harness.ts — JSDoc the public exports (`runEval`, `recordResult`, `getDataset`) with usage examples + LangSmith project URL.",
    "plans/v2-release-notes.md — append `## Wave C — Crawley schema closeout (v2.2 Wave 1, 2026-XX-XX)` section listing TC1's deliverables, exit-criterion gates, tag SHA. Mirror the v2.1 closeout-section pattern (per-team table, what shipped, deferred items if any).",
    "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_dev-runbooks/crawley-schema-runbook.md (new) — operator runbook for adding/extending Crawley schemas: when to extend an existing schema vs add a new one, how to update the eval dataset, how to gate via the quarterly drift-check job."
  ],
  guardrails: [
    "Depend on qa-c-verifier (block on `tc1-wave-c-complete` tag).",
    "CLAUDE.md edits require explicit David authorization per file-safety rule (memory: `feedback_no_scope_doubt.md`) — surface the proposed CLAUDE.md diff in `plans/v22-outputs/tc1/claude-md-diff.md` FIRST and wait for David's go-ahead before applying. Other doc surfaces (JSDoc, runbook, release-notes-append) ship without gating.",
    "DO NOT introduce new section headers in CLAUDE.md beyond the one named above (`Crawley Typed Schemas (Wave C, v2.2)`) — keep CLAUDE.md additions minimal.",
    "Release-notes append goes to `plans/v2-release-notes.md` in this v2.2 doc set — TE1's `docs-e-and-closeout` will write the standalone `plans/v22-release-notes.md` after Wave E ships. v2-release-notes.md is the v2 cumulative log.",
    "JSDoc is non-negotiable on every new schema file — without it, Wave E's engine-stories agent + future contributors will re-derive shape conventions from code.",
    "Runbook is for the post-Wave-C maintenance posture — write it as if you won't be there to clarify.",
    "Single commit (or two if CLAUDE.md goes in a separate commit pending authorization): 'docs(tc1): crawley-schema-closeout documentation + release-notes append'."
  ]
})
```

---

## TE1 — c1v-kb-runtime-engine (Wave E)

**Scope:** Replace LLM-only NFR + constants synthesis with deterministic-rule-tree-first engine (G1-G11 per [`kb-runtime-architecture.md`](../../plans/kb-runtime-architecture.md)). Per-decision audit trail, multi-turn gap-fill, "why this value?" provenance UI, KB rewrite to schema-first 6-section shape (γ phase). Day-0 inventory shrinks scope: G5 (~80% shipped), G8/G9 (~60% shipped), δ-dedup (✅ shipped by T9). Honors v2.1 §Wave E verbatim (lines 439-523) + Wave A↔E handshake contract pin (lines 498-504).

**P10 absorption (2026-04-27 fix-up — Path B):** Per [`HANDOFF-2026-04-27-v2.2-fixup.md`](../../plans/HANDOFF-2026-04-27-v2.2-fixup.md) Correction 1 + master plan §D-V22.01: Wave E owns the 7-agent re-validator → greenfield-generator refactor. The 7 NEW v2.1 LangGraph nodes (`generate_data_flows`, `generate_form_function`, `generate_decision_network`, `generate_n2`, `generate_fmea_early`, `generate_fmea_residual`, `generate_synthesis`) drop their `if (!stub) return pending` branch and read directly from intake + upstream artifacts (substrate-read pattern per [`methodology-rosetta.md`](../../plans/methodology-rosetta.md) §9). Owns ECs E.1-E.13 + the new EC-V21-E.14 (live-project 11-of-11 ready). New agent `agent-greenfield-refactor` (langchain-engineer) added to Step 2 between `kb-rewrite` and `provenance-ui`.

**EC-V21-E.0 preflight (BLOCKING):**
- (i) ✅ done 2026-04-25 (source plan path rewrite committed)
- (ii) ✅ done 2026-04-26 (`wave-e-pre-rewrite-2026-04-26` @ `a7f8a7c`)
- Day-0 inventory consumption is enforced as **dispatch rule #8**, not an EC (process, not artifact — moved per critique #4).

**TE1 Day-0 prereq (UPDATED 2026-04-27 fix-up — blocks `engine-prod-swap`):**
- **Baseline-capture sub-task** — before `engine-prod-swap` runs, scrape `synthesis_metrics_total{module="m2",impl="llm-only"}` from the **post-v2.1.1, pre-engine-swap** rolling Sentry window (window starts 2026-04-27 v2.1.1 ship; ends at engine-prod-swap deploy date) and freeze to `plans/v21-outputs/observability/sentry-baseline-2026-04-27.json`. The JSON's `baseline_window` field MUST capture the framing: *"post-v2.1.1, pre-engine-swap; impl=llm-only refers to (a) the M2 NFR/constants RE-WIRE path through GENERATE_nfr/GENERATE_constants pre-engine-first, AND (b) the 4 pre-v2.1 nodes (qfd/interfaces/ffbd/decision-matrix) that DO produce output. The 7 NEW v2.1 nodes refactored under EC-V21-E.14 are NOT part of this baseline (they had ZERO output pre-Wave-E; they're separately gated by EC-V21-E.14)."* If that file does not yet exist on disk, `engine-core` writes it as part of EC-V21-E.1 setup before any engine wiring lands. `qa-e-verifier` consumes this file as the EC-V21-E.13 baseline source-of-truth.

**Dependencies:**
- HARD-DEP on `tc1-wave-c-complete` (typed schemas + LangSmith dataset)
- HARD-DEP on `wave-e-pre-rewrite-2026-04-26` (snapshot anchor)
- Internal sequencing: `engine-core` (G1+G3) blocks `engine-context` (G4) blocks `audit-writer` (G5 finish). `engine-stories` runs parallel with `audit-writer` (rationale: golden tests can snapshot expected EngineOutput shape directly without invoking a live engine — critique #10). Other agents run parallel post-`engine-core`.

**Honors:** D-V21.18 through D-V21.23. Inherits-by-reference from v2.1 §Wave E content + ECs + Wave A↔E handshake contract pin.

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-kb-runtime-engine",
  agent_type: "tech-lead",
  description: "Wire the NFR engine: rule-tree interpreter + predicate DSL + ArtifactReader + decision_audit writer (extends shipped table) + fail-closed rules + multi-turn gap-fill (consumes v2.1 system-question-bridge) + PII redaction + dynamic model routing + pgvector search (extends shipped index) + 13 engine.json story trees + 'why this value?' provenance UI. KB rewrite γ phase: 80 phase files in schema-first 6-section shape. Swap GENERATE_nfr / GENERATE_constants internals behind v2.1's frozen contract pin.",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.v2.2.md §Wave E (inherits v2.1 §Wave E lines 439-523 verbatim) + §Wave A↔E handshake (v2.1 lines 498-504 verbatim) + §Locked decisions D-V21.18-.23",
    day_0_inventory: "plans/wave-e-day-0-inventory.md — REQUIRED READING for every agent; surfaces what already ships in 0011a_kb_chunks.sql + 0011b_decision_audit.sql + T9 _shared/ symlinks",
    upstream_artifacts_already_shipped: [
      "apps/product-helper/lib/db/migrations/0008_enable_pgvector.sql (pgvector extension enabled)",
      "apps/product-helper/lib/db/migrations/0011a_kb_chunks.sql (kb_chunks table + ivfflat lists=100 + dedup gate; T3 Phase B ingest already ran)",
      "apps/product-helper/lib/db/migrations/0011b_decision_audit.sql (full EngineOutput shape, hash_chain_prev for tamper detection, RLS, append-only enforcement)",
      "apps/product-helper/lib/chat/system-question-bridge.ts (v2.1 TA1 — Wave-E surface-gap.ts producer routes through this)",
      "apps/product-helper/lib/langchain/agents/intake/clarification-detector.ts (v2.1 — refactored to consume engine in EC-V21-E.1)",
      "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_shared/ (T9 dedup; 13 KBs, 117 symlinks across 9 modules)",
      "tc1-wave-c-complete (typed schemas under module-{2,3,4,5}/ — engine consumes for output validation)",
      "tc1-wave-c-complete (LangSmith dataset — Wave E per-rule confidence drift measured against)"
    ],
    snapshot_anchor: "wave-e-pre-rewrite-2026-04-26 @ a7f8a7c (rollback point — see EC-V21-E.0(ii))",
    contract_pin_FROZEN: [
      "v2.1 lines 498-504 — DO NOT EDIT during TE1 execution",
      "GENERATE_nfr output: NFR slice of submodule-2-3-nfrs-constants.ts (Zod-pinned)",
      "GENERATE_constants output: constants slice of same file (Zod-pinned)",
      "nfr_engine_contract_version: 'v1' on each node's output envelope",
      "Failure semantics: final_confidence < 0.90 + decision.llm_assist false + no fallback rule → emit { status: 'needs_user_input', computed_options, math_trace } and route to system-question-bridge.ts (NOT thrown error)",
      "Implementation independence: __tests__/langchain/graphs/intake-graph.ta1-integration.test.ts must pass with both v2.1 LLM-only agent AND v2.2 nfrEngineInterpreter.evaluate(...) behind GENERATE_nfr (test filename verified against on-disk reality 2026-04-26 — supersedes v2.1 line 504's stale `intake-graph.test.ts` reference)"
    ],
    nfr_node_swap_mechanism_LOCKED: [
      "Choice: DI pattern — intake-graph.ts accepts nfrImpl?: 'llm' | 'engine' arg with default 'llm' (v2.1) → 'engine' (v2.2 post-swap)",
      "Test consequence: __tests__/langchain/graphs/intake-graph.ta1-integration.test.ts runs both implementations explicitly via the param (one describe block per impl)",
      "Rationale: env-var swap is module-load-time and brittle under jest module-cache; fixture-override + _setNfrImpl() test-only hooks pollute the public surface; DI is the cleanest swap and consumed identically by qa-e-verifier's implementation-independence proof",
      "engine-prod-swap consumes this as a hard constraint — agent does NOT improvise an alternative pattern"
    ],
    out_of_scope: [
      "P6 prompt-caching bug investigation (separate cost-lever track, not Wave E)",
      "Any v2.1 Wave A/B/D content (FROZEN — no edits)",
      "RAG broadening to chat history + upstream artifacts (D-V21.22 — KB chunks only in v1)",
      "Decision_audit schema changes that break v2.1's shipped shape (Wave E adds fields via DELTA migration only — append-only honored)"
    ]
  }
})
```

### Step 2: Spawn 13 teammates

**Dispatch sequence (updated 2026-04-27 fix-up — adds `agent-greenfield-refactor` for P10 closure):**
- **T0:** `TeamCreate` + spawn `engine-core` (gates the rest of TE1).
- **T0+ε** (after `engine-core` green): spawn `engine-context`, `engine-fail-closed`, `engine-gap-fill`, `engine-pgvector`, `engine-stories`, `kb-rewrite`, `provenance-ui` in parallel. (`engine-stories` no longer blocks on `audit-writer` per critique #10 — golden tests snapshot expected EngineOutput shape directly.)
- **T1** (after `engine-context` green): spawn `audit-writer`.
- **T1+ε** (after `engine-context` green AND `engine-stories` green): spawn `agent-greenfield-refactor` (NEW per fix-up Correction 1 — owns P10 closure; HARD-DEPs on engine-context for `EvalContext` substrate-reads + engine-stories for the 7 P10-closure rule trees).
- **T2** (after all 10 above green): spawn `engine-prod-swap` (LAST deliverable — consumes everything; HARD-DEPs on `agent-greenfield-refactor`).
- **T3** (after `engine-prod-swap` green): spawn `qa-e-verifier`.
- **T4** (FAIL-CLOSED — only if `qa-e-verifier` reports all ECs green): spawn `docs-e-and-closeout`.

```
Agent({
  name: "engine-core",
  subagent_type: "langchain-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Ship G1 (NFREngineInterpreter) + G3 (Predicate DSL) — the deterministic-rule-tree-first engine core. Refactor `lib/langchain/agents/intake/clarification-detector.ts` to consume the engine instead of being the de-facto engine (clarification-detector becomes the FIRST consumer pattern, not the engine itself). Also captures the EC-V21-E.13 baseline at `plans/v21-outputs/observability/sentry-baseline-2026-04-25.json` if not yet on disk (TE1 Day-0 prereq from §TE1 §TE1 Day-0 prereq). EC-V21-E.1 gate. **BLOCKING for the rest of TE1.**",
  inline_skills: ["langchain-patterns", "code-quality", "testing-strategies"],
  required_reading: ["plans/wave-e-day-0-inventory.md"],
  deliverables: [
    "apps/product-helper/lib/langchain/engine/nfr-engine-interpreter.ts — G1 generalized from `clarification-detector.heuristicCheck()` pattern. Exports: `nfrEngineInterpreter.evaluate(decision: EngineDecision, context: EvalContext): Promise<EngineOutput>`. Where `EngineDecision = { matched_rule_id, predicates, modifiers, fallback }`, `EngineOutput = { value, confidence, matched_rule_id, math_trace, status: 'ready' | 'needs_user_input' | 'failed', computed_options? }`. Heuristic-first: try predicate-DSL match against `EvalContext`; if confidence ≥ 0.90, return `ready` with auto-fill value. If 0.60 ≤ confidence < 0.90, route to LLM-refine fallback (consumed by engine-prod-swap later). If confidence < 0.60, return `needs_user_input` with `computed_options` derived from rule fallback paths.",
    "apps/product-helper/lib/langchain/engine/predicate-dsl.ts — G3 DSL evaluator. Exports: `evalPredicate(predicate: Predicate, context: EvalContext): boolean`. Operators: `_contains(haystack, needle)`, `_in(value, set)`, `_range(value, min, max)`, `_gt(a, b)`, `_lt(a, b)`, `_eq(a, b)`, `_and(...preds)`, `_or(...preds)`, `_not(pred)`. JSON-shaped predicates (so engine.json files can author them as data, not code).",
    "apps/product-helper/lib/langchain/engine/types.ts — Zod schemas for `EngineDecision`, `EvalContext`, `EngineOutput`, `Predicate`. Round-trip-tested.",
    "apps/product-helper/lib/langchain/agents/intake/clarification-detector.ts — refactor `heuristicCheck()` to call `nfrEngineInterpreter.evaluate(...)` instead of inline rule logic. clarification-detector becomes the FIRST consumer of the engine, not the de-facto engine. Existing test suite must continue to pass (regression gate).",
    "apps/product-helper/__tests__/engine/interpreter.test.ts — heuristic-first → llm-refine fallback paths; confidence thresholds verified at 0.90 / 0.60 boundaries; output shape Zod-valid",
    "apps/product-helper/__tests__/engine/predicate-dsl.test.ts — every operator tested; nested predicates evaluate correctly; type errors on malformed predicates",
    "**Day-0 baseline-capture (EC-V21-E.13 prereq, UPDATED 2026-04-27 fix-up Correction 2):** if `plans/v21-outputs/observability/sentry-baseline-2026-04-27.json` does NOT exist on disk, write it by scraping the **post-v2.1.1, pre-engine-swap** rolling Sentry window for `synthesis_metrics_total{module=\"m2\",impl=\"llm-only\"}`. Window starts 2026-04-27 (v2.1.1 ship); ends at engine-prod-swap deploy date. File shape: `{ baseline_window: 'post-v2.1.1, pre-engine-swap; 2026-04-27 to <deploy-date>', baseline_framing: 'impl=llm-only covers (a) M2 NFR/constants RE-WIRE path through GENERATE_nfr/GENERATE_constants pre-engine-first AND (b) the 4 pre-v2.1 nodes producing output today (qfd/interfaces/ffbd/decision-matrix). The 7 NEW v2.1 nodes refactored under EC-V21-E.14 are NOT part of this baseline.', counter: 'synthesis_metrics_total', label: 'module=m2,impl=llm-only', total_calls: <int>, projects_observed: <int>, captured_at: <iso8601>, captured_by: 'engine-core' }`. If file already exists, verify shape + skip rewrite.",
    "git tag `te1-engine-core-complete` on green; verifier consumes this tag for EC-V21-E.1 ledger AND for blocking the other 9 deliverable agents"
  ],
  guardrails: [
    "HARD-DEP on `tc1-wave-c-complete` tag (TE1 consumes typed schemas + LangSmith dataset).",
    "HARD-DEP on `wave-e-pre-rewrite-2026-04-26` tag (snapshot anchor).",
    "BLOCKING for ALL other TE1 deliverable agents — they cannot start until `te1-engine-core-complete` tag posts. Do NOT skip the tag.",
    "DO NOT modify clarification-detector's existing public API — Wave A's chat flow consumes it; signature changes break v2.1 production.",
    "Predicate DSL operators MUST be JSON-shaped (e.g. `{op: '_contains', args: ['ai', tags]}`) — engine.json files (authored by `engine-stories`) consume the DSL as data. JS-shaped predicates (e.g. closures) defeat the purpose.",
    "Confidence thresholds 0.90 (auto-fill) / 0.60 (refine) / <0.60 (user-surface) are LOCKED per master plan v2.1 line 445. Do NOT tune without coordinator approval.",
    "Day-0 baseline JSON path is the canonical EC-V21-E.13 source-of-truth — qa-e-verifier reads it via `scripts/verify-llm-call-rate-drop.ts`. Do NOT relocate.",
    "If LangSmith / Sentry export tooling isn't available locally, surface to coordinator — DO NOT fabricate baseline numbers. Baseline must be real.",
    "Single feature branch (e.g. `wave-e/te1-engine-core`). Commits: types + predicate-dsl + interpreter + clarification-detector-refactor + tests + baseline-capture. Tag final commit `te1-engine-core-complete`."
  ],
  blocks: ["engine-context", "engine-fail-closed", "engine-gap-fill", "engine-pgvector", "engine-stories", "kb-rewrite", "provenance-ui", "audit-writer", "engine-prod-swap", "qa-e-verifier"]
})

Agent({
  name: "engine-context",
  subagent_type: "langchain-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Ship G4 (ArtifactReader + ContextResolver) — typed upstream-artifact resolution that feeds the engine's `EvalContext`. ArtifactReader reads from `project_artifacts` (v2.1 TA1 shipped) + extractedData JSONB; ContextResolver composes a typed `EvalContext` per phase decision (intake fields + upstream artifacts + project-state flags). Tested against 5 representative phase decisions across M2/M6/M8 to prove the shape generalizes. EC-V21-E.2 gate.",
  inline_skills: ["langchain-patterns", "code-quality", "testing-strategies"],
  required_reading: ["plans/wave-e-day-0-inventory.md"],
  deliverables: [
    "apps/product-helper/lib/langchain/engine/artifact-reader.ts — typed reader. Exports: `readArtifact(projectId, kind: ArtifactKind): Promise<ArtifactPayload | null>`. Consumes `project_artifacts` table via TA1's `lib/db/queries.getArtifactByKind(projectId, kind)`; deserializes JSONB to typed shape based on `artifact_kind` discriminator.",
    "apps/product-helper/lib/langchain/engine/context-resolver.ts — composes `EvalContext` for a phase decision. Exports: `resolveContext(projectId: string, decisionRef: DecisionRef): Promise<EvalContext>`. Where `DecisionRef = { module: 'm2'|'m6'|'m8'|..., phase: <phase-id>, decision_id: string }`. Resolver loads: (a) project intake fields, (b) upstream artifacts referenced in the decision's predicates, (c) project-state flags (e.g. `is_synthesized`, `has_residual_fmea`).",
    "apps/product-helper/lib/langchain/engine/__tests__/artifact-reader.test.ts — typed shape resolution for 6 artifact kinds (recommendation_json, fmea_early, fmea_residual, hoq, decision_network, decision_matrix); cross-tenant access blocked via RLS",
    "apps/product-helper/lib/langchain/engine/__tests__/context-resolver.test.ts — 5 representative phase decisions: (a) M2 NFR availability target (reads intake.expectedTraffic), (b) M2 constants budget (reads project.tier + intake.startDate), (c) M6 QFD weight (reads decision_network winner + intake.priorities), (d) M8 residual severity (reads fmea_early + decision_network), (e) M8 mitigation owner (reads project.team_id + extractedData.team). Each test asserts `EvalContext` shape matches Zod + values match expected.",
    "git tag `te1-engine-context-complete` on green; consumed by `audit-writer` (which needs ContextResolver to resolve audit-row inputs)"
  ],
  guardrails: [
    "HARD-DEP on `te1-engine-core-complete` tag.",
    "BLOCKING for `audit-writer`. Does NOT block `engine-stories` (decoupled per critique #10 — golden test fixtures snapshot expected `EngineOutput` shape directly without invoking ContextResolver).",
    "ArtifactReader MUST consume TA1's `getArtifactByKind` — do NOT bypass to raw SQL. RLS context is enforced at the query layer.",
    "ContextResolver caches reads within a single `resolveContext` call — same project + same decision refers to the same upstream artifacts; do NOT re-read per-predicate evaluation.",
    "5-decision test coverage is the floor; if a 6th decision pattern emerges during authorship, add a 6th test (better generalization proof).",
    "Commits: artifact-reader + context-resolver + tests. Tag final commit `te1-engine-context-complete`."
  ],
  blocks: ["audit-writer"]
})

Agent({
  name: "audit-writer",
  subagent_type: "database-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Finish G5 — extend the SHIPPED `decision_audit` table (v2.1 `0011b_decision_audit.sql`) with NFR-engine fields via DELTA migration. Implement engine-side `writeAuditRow()` that fires on every `nfrEngineInterpreter.evaluate()` call. Verify hash chain (`hash_chain_prev` → `hash_chain_curr` integrity) under append-only enforcement (RLS already shipped — DO NOT re-create). Day-0 inventory confirms ~80% of G5 already shipped; this agent finishes the engine-side wiring + ~1 day of work, NOT a 3-day from-scratch build. EC-V21-E.3 gate.",
  inline_skills: ["database-patterns", "security-patterns", "code-quality"],
  required_reading: ["plans/wave-e-day-0-inventory.md", "apps/product-helper/lib/db/migrations/0011b_decision_audit.sql"],
  deliverables: [
    "apps/product-helper/lib/db/migrations/000<N>_decision_audit_engine_extensions.sql — DELTA migration extending the SHIPPED `decision_audit` table with NFR-engine columns (NOT a new table). Add columns if not already present (verify against on-disk shape per Day-0 inventory): `matched_rule_id text`, `inputs_used jsonb`, `modifiers_applied jsonb`, `final_confidence numeric(4,3)`, `override_history jsonb DEFAULT '[]'`. Number assigned by reading current max + adding sequential. Manual SQL (drizzle-kit broken). Append-only enforcement (RLS) UNCHANGED — do NOT re-create the trigger or policy.",
    "apps/product-helper/lib/db/schema/decision-audit.ts — Drizzle table definition matching the shipped + delta-extended SQL. Round-trips with `EngineOutput` Zod shape from `engine-core`.",
    "apps/product-helper/lib/langchain/engine/audit-writer.ts — engine-side writer. Exports: `writeAuditRow(projectId: string, decision: EngineDecision, output: EngineOutput, context: EvalContext): Promise<{ id: string; hash_chain_curr: string }>`. Behavior: (a) compute `hash_chain_curr = sha256(prev_hash || row_payload)`, (b) insert via service-role client (RLS bypass for writes), (c) verify the chain via `scripts/verify-decision-audit-chain.ts` (one row's `hash_chain_curr` must equal the next row's `hash_chain_prev`).",
    "apps/product-helper/scripts/verify-decision-audit-chain.ts — chain integrity verifier. Reads all `decision_audit` rows for a project ordered by `created_at`; asserts `row[i].hash_chain_curr === row[i+1].hash_chain_prev` for all i. CLI: `pnpm tsx scripts/verify-decision-audit-chain.ts --projectId=<uuid>`. Used by qa-e-verifier for EC-V21-E.3 gate.",
    "apps/product-helper/lib/langchain/engine/nfr-engine-interpreter.ts — wire `writeAuditRow()` call into `evaluate()` flow: every successful evaluation writes an audit row before returning the `EngineOutput`. (engine-core agent ships the interpreter without this wire-up; audit-writer agent adds it.) Add a `skipAudit?: boolean` opt-out for unit tests that don't have a DB.",
    "apps/product-helper/__tests__/engine/audit-trail.test.ts — every `evaluate()` call writes an audit row (mock DB); override history queryable; hash chain verified across N=10 evaluations.",
    "apps/product-helper/__tests__/db/decision-audit-extensions-rls.test.ts — DELTA migration applies cleanly; new columns visible; RLS unchanged (cross-tenant SELECT still returns 0 rows; service-role INSERT still works); append-only trigger still rejects UPDATE/DELETE.",
    "Local apply verified: run delta migration via `psql postgresql://postgres:postgres@localhost:54322/postgres` (drizzle-kit broken). Capture log in `plans/v22-outputs/te1/audit-writer-apply-log.md`."
  ],
  guardrails: [
    "HARD-DEP on `te1-engine-core-complete` tag (consumes interpreter) AND `te1-engine-context-complete` tag (consumes EvalContext to resolve audit-row inputs).",
    "DO NOT re-create the `decision_audit` table — extend in place via DELTA migration. Day-0 inventory line 119: 'Table + RLS + append-only ✅ shipped.' Re-creation breaks v2.1 audit history.",
    "DO NOT modify the existing append-only trigger or RLS policies — Day-0 confirms they ship; re-shaping breaks v2.1's audit-trail tamper-detection contract.",
    "`writeAuditRow()` MUST run inside the engine's evaluation hot path (NOT in a deferred queue) — audit must land synchronously with the decision; async-write opens a window where the chain can break.",
    "Hash chain is the tamper-detection mechanism — verify at write time + read time. Any chain break is a security incident, NOT a recoverable state.",
    "If the existing SQL on disk already includes some of the new columns, SKIP those in the DELTA migration (don't double-add) — verify against `0011b_decision_audit.sql` on disk first.",
    "Single feature branch. Commits: delta migration + drizzle schema update + audit-writer + interpreter wire-up + tests + chain-verifier script."
  ]
})

Agent({
  name: "engine-fail-closed",
  subagent_type: "langchain-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Ship G6 — fail-closed rules loader + runner. Every phase file's STOP GAP checklist becomes machine-readable: when a STOP GAP rule matches the project's state, the engine REFUSES to proceed (returns `status: 'failed'` with a structured error) instead of falling through to a fuzzy LLM-fill. This is the deterministic-rule-tree's safety mechanism: better to refuse than to hallucinate. EC-V21-E.4 gate.",
  inline_skills: ["langchain-patterns", "code-quality", "testing-strategies"],
  required_reading: ["plans/wave-e-day-0-inventory.md"],
  deliverables: [
    "apps/product-helper/lib/langchain/engine/fail-closed-rules.ts — loader + runner. Exports: `loadFailClosedRules(modulePhase: string): FailClosedRule[]` (loads from per-phase engine.json files authored by `engine-stories`), `runFailClosedRules(rules: FailClosedRule[], context: EvalContext): { status: 'pass' | 'failed', failed_rules: string[] }`. Where `FailClosedRule = { rule_id, predicate: Predicate, error_message, severity: 'block' | 'warn' }`.",
    "apps/product-helper/lib/langchain/engine/types.ts — extend with `FailClosedRule` Zod schema; round-trip-tested.",
    "apps/product-helper/lib/langchain/engine/nfr-engine-interpreter.ts — wire `runFailClosedRules()` BEFORE the heuristic-match step. If any `block` rule matches, return `EngineOutput { status: 'failed', failed_rules: [...] }` immediately; if any `warn` rule matches, log + proceed. (engine-core ships interpreter without this wire-up; engine-fail-closed adds it.)",
    "apps/product-helper/__tests__/engine/fail-closed-rules.test.ts — STOP GAP rule enforcement: (a) blocking rule → engine refuses, returns failed status; (b) warn rule → engine logs, proceeds; (c) no rules match → engine proceeds normally; (d) malformed rule → loader rejects with typed error.",
    "**Phase-file STOP GAP audit:** read all 80 phase files under `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/` (per Day-0 inventory: post-T9 home, 80 phase files M1-M7 + 9 `_shared/` symlinks). For each phase file, identify any STOP GAP language in the markdown; convert to a machine-readable rule shape; surface the conversion in `plans/v22-outputs/te1/fail-closed-audit.md`. (engine-stories agent authors the actual `engine.json` files based on this audit; this agent surfaces the inventory.)"
  ],
  guardrails: [
    "HARD-DEP on `te1-engine-core-complete` tag.",
    "Fail-closed semantics are LOCKED — better to refuse than to fall through. Do NOT add a 'try LLM-fill anyway' fallback for blocking rules.",
    "Severity is `block` | `warn` ONLY — no `silent` or `info` levels. Either enforce or proceed.",
    "STOP GAP audit is read-only on phase files — DO NOT edit phase files. `kb-rewrite` agent owns the γ-phase rewrite; engine-fail-closed surfaces what STOP GAP rules exist for engine-stories to author.",
    "Wire-up into the interpreter MUST be before heuristic-match — fail-closed runs first, always. This is the safety contract.",
    "Commits: types + loader + runner + interpreter wire-up + tests + audit doc."
  ]
})

Agent({
  name: "engine-gap-fill",
  subagent_type: "langchain-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Ship G7 — `surface-gap.ts` producer that fires when the NFR engine returns `status: 'needs_user_input'`. Routes the open-question through v2.1's SHIPPED `lib/chat/system-question-bridge.ts` (shared transport, NOT a duplicate). Multi-turn flow: user reply on the chat-thread pending-answer row routes back into `EvalContext` so the engine can re-evaluate with the new value. EC-V21-E.5 gate. **NOT collapsed into system-question-bridge** — surface-gap is the Wave-E producer; bridge is the shared transport per v2.1 contract pin (master plan v2.1 lines 458 + Wave A↔E handshake §).",
  inline_skills: ["langchain-patterns", "code-quality", "testing-strategies"],
  required_reading: ["plans/wave-e-day-0-inventory.md", "apps/product-helper/lib/chat/system-question-bridge.ts"],
  deliverables: [
    "apps/product-helper/lib/langchain/engine/surface-gap.ts — producer. Exports: `surfaceGap(decision: EngineDecision, output: EngineOutput, context: EvalContext): Promise<GapFillResult>`. Behavior: (a) call `bridge.surfaceOpenQuestion({ source: 'wave_e_engine', question: <derived from decision>, computed_options: output.computed_options, math_trace: output.math_trace, project_id: context.project_id })` (the v2.1-shipped bridge), (b) wait for chat reply via subscription on `chat_messages` where `parent_id = pending_answer.id`, (c) parse reply value back into `EvalContext` shape, (d) return `GapFillResult { status: 'resolved' | 'timeout', resolved_value?: any, evaluations_remaining: number }`. Multi-turn loop: if reply doesn't satisfy the decision (e.g. user provides one of N decision params; rest still missing), re-fire `surfaceGap` for the next missing param (max 5 turns to prevent infinite loop).",
    "apps/product-helper/lib/langchain/engine/nfr-engine-interpreter.ts — wire `surfaceGap()` into the `needs_user_input` path: when interpreter returns `needs_user_input`, caller can opt-in to `await surfaceGap(...)` for synchronous gap-fill (used by `engine-prod-swap` in production); or short-circuit return for tests / batch jobs.",
    "apps/product-helper/__tests__/engine/surface-gap.test.ts — gap-fill loop completes without infinite recursion: (a) single-turn: 1 missing param → user provides → resolved; (b) multi-turn: 3 missing params → user provides over 3 turns → resolved; (c) timeout: user doesn't reply within configurable window → returns `status: 'timeout'`; (d) infinite-loop guard: max 5 turns enforced; 6th would-be turn throws `MaxTurnsExceededError`.",
    "apps/product-helper/__tests__/engine/multi-turn-integration.test.ts — end-to-end fixture: engine evaluates → returns needs_user_input → surface-gap fires → mock chat-bridge inserts pending_answer row → mock user reply → engine re-evaluates → returns ready"
  ],
  guardrails: [
    "HARD-DEP on `te1-engine-core-complete` tag.",
    "DO NOT modify `lib/chat/system-question-bridge.ts` — it's the v2.1-shipped shared transport. surface-gap is a CONSUMER of the bridge, not an alternative.",
    "Multi-turn cap = 5 turns. After 5, throw `MaxTurnsExceededError` — better to fail loudly than spin forever.",
    "Reply parsing is value-extraction, NOT free-form NLP — the bridge stores `computed_options` on the pending_answer row; user picks one (or types a value that matches the predicate's domain); surface-gap parses the chosen option, NOT arbitrary chat text.",
    "Subscription mechanism: use the existing chat-thread realtime channel if Supabase realtime is wired in v2.1; otherwise poll `chat_messages` with a 1s interval + 60s timeout. Verify against on-disk `lib/chat/` setup before choosing.",
    "If subscription mechanism is unclear, surface to coordinator — DO NOT fabricate a realtime layer. Polling is the safe fallback.",
    "Commits: surface-gap + interpreter wire-up + tests."
  ]
})

Agent({
  name: "engine-pgvector",
  subagent_type: "database-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Finish G8 + G9 — pgvector + embeddings layer. Day-0 inventory: `kb_chunks` table + ivfflat lists=100 + dedup gate ✅ shipped (v2.1 `0011a_kb_chunks.sql`); T3 Phase B ingest already ran. Remaining work: (a) verify embeddings actually populated (row count > 0), (b) add RLS to `kb_chunks` (currently global per audit), (c) optional HNSW upgrade if ivfflat p95 > 200ms, (d) `searchKB(...)` cosine-similarity helper. Day-0 estimate: ~1-2 days (was ~4 days pre-inventory). EC-V21-E.6 gate.",
  inline_skills: ["database-patterns", "security-patterns", "code-quality"],
  required_reading: ["plans/wave-e-day-0-inventory.md", "apps/product-helper/lib/db/migrations/0011a_kb_chunks.sql", "apps/product-helper/lib/db/migrations/0008_enable_pgvector.sql"],
  deliverables: [
    "apps/product-helper/scripts/verify-kb-chunks-populated.ts — sanity check: connect to local Supabase :54322 + production via service role; assert `SELECT COUNT(*) FROM kb_chunks` > 0; report row count + chunk-source breakdown (per-module count). If row count = 0, surface as a Day-0 finding to coordinator (Phase B ingest may have silently no-op'd). CLI usage: `pnpm tsx scripts/verify-kb-chunks-populated.ts`.",
    "apps/product-helper/lib/db/migrations/000<N>_kb_chunks_rls.sql — DELTA migration adding RLS to `kb_chunks`: (a) SELECT allowed for any authenticated user (KB content is global, not tenant-scoped — chunks are de-duplicated reference content, not user data), (b) INSERT/UPDATE only via service role (ingest path), (c) DELETE never. Number assigned by reading current max + adding sequential. Manual SQL.",
    "apps/product-helper/__tests__/db/kb-chunks-rls.test.ts — authenticated user can SELECT (KB is global); anon role blocked from SELECT (no public KB exposure); service-role can INSERT; user role blocked from INSERT.",
    "apps/product-helper/lib/langchain/engine/search-kb.ts — `searchKB(query: string, topK: number = 5, filter?: { module?: string; phase?: string }): Promise<KBChunk[]>`. Behavior: (a) embed query via OpenAI `text-embedding-3-small` (1536 dim per D-V21.21), (b) cosine-similarity search via pgvector `<=>` operator on `kb_chunks.embedding`, (c) apply optional metadata filter (module + phase), (d) return top-K chunks ordered by similarity desc.",
    "apps/product-helper/__tests__/db/pgvector-search.test.ts — kb_chunks similarity returns expected top-K: (a) seed 10 chunks with known embeddings, (b) query for chunk #5's source text, (c) assert chunk #5 ranks #1 in returned top-K. Filter by module narrows correctly. p95 latency < 200ms on the seeded corpus.",
    "**HNSW upgrade decision (optional):** measure `searchKB` p95 against ivfflat (current). If p95 > 200ms, ship `000<N>_kb_chunks_hnsw_upgrade.sql` migration: `CREATE INDEX kb_chunks_embedding_hnsw_idx ON kb_chunks USING hnsw (embedding vector_cosine_ops);` then `DROP INDEX kb_chunks_embedding_ivfflat_idx;`. If p95 ≤ 200ms, document the decision to skip in `plans/v22-outputs/te1/pgvector-decision.md`.",
    "plans/v22-outputs/te1/pgvector-summary.md — record: row count after verification, RLS policies applied, HNSW upgrade decision (yes/no + measured p95), `searchKB` p95 on production-shape query"
  ],
  guardrails: [
    "HARD-DEP on `te1-engine-core-complete` tag.",
    "DO NOT re-create `kb_chunks` table — extend in place. Day-0 inventory line 120: 'Table + ivfflat ✅ shipped.' Re-creation drops the T3-ingested chunks.",
    "DO NOT re-enable `pgvector` extension — `0008_enable_pgvector.sql` already enables it (Day-0 inventory line 121). Re-enable is a no-op but signals confusion.",
    "RLS on `kb_chunks` is GLOBAL-READ, NOT tenant-scoped — KB content is reference, not user data. Tenant-scoping the KB would require separate ingestion per project (out of scope for v2.2).",
    "If row count = 0 (Phase B ingest no-op'd), surface to coordinator — DO NOT silently re-run ingest. The dedup-key bug from v2.1 may still be live; investigate first.",
    "Embedding model is `text-embedding-3-small` (1536 dim) per D-V21.21 LOCKED. DO NOT use `text-embedding-3-large` or `ada-002` without coordinator approval.",
    "OpenAI API key consumed via `EMBEDDINGS_API_KEY` env var per D-V21.21. If env var missing in dev, fail gracefully with a typed error (not a stack trace).",
    "p95 < 200ms is the EC-V21-E.6 latency target — if ivfflat misses, ship HNSW. Don't claim green without the measurement.",
    "Commits: verify-script + RLS migration + searchKB + tests + (optional) HNSW migration + summary doc."
  ]
})

Agent({
  name: "engine-stories",
  subagent_type: "langchain-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Ship G10 (PII redaction) + G11 (dynamic model routing) + the 13 `engine.json` rule trees per story. PII redaction is regex-level input scrubbing before LLM calls (G10). Dynamic model routing picks `heuristic` (no LLM) / `llm_refine` (cheap LLM) / `user_surface` (streaming LLM) based on engine output status (G11). 13 engine.json files = one per phase decision tree across M1-M8 (authored content, not code; Zod-validated by engine-fail-closed's loader). Golden tests ≥5 fixtures each — fixtures snapshot expected `EngineOutput` shape directly (no live engine call required at authorship time per critique #10). EC-V21-E.7 + EC-V21-E.8 gates. **P10-closure scope (per 2026-04-27 fix-up Correction 1):** 7 of the 13 stories — `m1-data-flows`, `m5-form-function`, `m4-decision-network`, `m7-n2`, `m8-fmea-early`, `m8-fmea-residual`, `m4-synthesis-keystone` — MUST be authored as **greenfield-generation** rule trees (predicates that produce non-empty output from intake + upstream artifacts WITHOUT depending on a pre-populated stub). These 7 rule trees are consumed by `agent-greenfield-refactor` (NEW agent) when it refactors the corresponding LangGraph node-agents from re-validators → generators. The other 6 stories (M2 NFR / M2 constants / M3 FFBD / M5 form-function-morphological / M6 QFD / M7 interfaces) keep refinement-from-existing-data shape.",
  inline_skills: ["langchain-patterns", "claude-api", "code-quality", "testing-strategies"],
  required_reading: ["plans/wave-e-day-0-inventory.md", "plans/v22-outputs/te1/fail-closed-audit.md"],
  deliverables: [
    "apps/product-helper/lib/langchain/engine/redact-input.ts — G10 regex-level PII redaction. Exports: `redactInput(input: string): { redacted: string; replacements: Array<{ pattern: string; count: number }> }`. Patterns: emails (`\\b[\\w.-]+@[\\w.-]+\\.\\w+\\b` → `[EMAIL]`), phone (`\\b\\+?\\d[\\d\\-\\s]{7,}\\b` → `[PHONE]`), SSN-like (`\\b\\d{3}-\\d{2}-\\d{4}\\b` → `[SSN]`), credit-card-like (`\\b\\d{13,19}\\b` → `[CC]`). Configurable additional patterns via env or config file.",
    "apps/product-helper/lib/langchain/engine/pick-model.ts — G11 dynamic model routing. Exports: `pickModel(decision: EngineDecision, output: EngineOutput): { model: 'heuristic' | 'llm_refine' | 'user_surface'; concrete_model_id?: string }`. Routing: (a) `output.status === 'ready'` (heuristic carried) → `heuristic` (no LLM), (b) `output.status === 'needs_refine'` (0.60 ≤ confidence < 0.90) → `llm_refine` (cheap model: Haiku 4.5 default), (c) `output.status === 'needs_user_input'` → `user_surface` (streaming model: Sonnet 4.6 default for natural-language follow-up).",
    "apps/product-helper/lib/langchain/engine/engine-stories/m2-nfr.engine.json — rule tree for M2 NFR decisions: availability target, latency target, throughput target, security tier, etc. Authored as JSON with predicate-DSL operators from G3.",
    "apps/product-helper/lib/langchain/engine/engine-stories/m2-constants.engine.json — rule tree for M2 constants decisions: budget, deadline, team-size, tier, etc.",
    "apps/product-helper/lib/langchain/engine/engine-stories/{m3-ffbd,m3-data-flows,m4-decision-network,m5-form-function,m6-qfd,m7-interfaces,m7-n2,m8-fmea-early,m8-fmea-residual,m8-mitigations,m1-data-flows}.engine.json — 11 more rule trees, one per phase decision area. Authored content, not code; Zod-validated by `loadFailClosedRules` AND a new schema-registry validator at boot.",
    "apps/product-helper/lib/langchain/engine/engine-stories/_schema.ts — Zod schema for the engine.json shape: `{ module, phase, decisions: [{ decision_id, predicates, fallback, fail_closed_rules }] }`. Round-trip-tested.",
    "apps/product-helper/lib/langchain/engine/__tests__/golden-rules.test.ts — golden tests pinning each rule-tree's expected outputs against fixture inputs. ≥5 fixtures per engine.json file (13 × 5 = 65 fixtures minimum). Fixture shape: `{ input: <EvalContext>, expected_output: <EngineOutput> }`. Fixtures snapshot the EXPECTED shape directly — golden tests run the predicate evaluator (not the full engine), so no DB/LLM dependency. (Per critique #10: this decoupling unblocks parallel work with `audit-writer`.)",
    "apps/product-helper/lib/langchain/engine/__tests__/redact-input.test.ts — every PII pattern tested: matches found + replaced + replacement count reported; no false positives on URLs / hex strings / version numbers.",
    "apps/product-helper/lib/langchain/engine/__tests__/pick-model.test.ts — routing decisions for all 3 status branches; concrete model IDs match v2.1 `lib/langchain/config.ts` named LLMs.",
    "plans/v22-outputs/te1/engine-stories-summary.md — table mapping each engine.json to its module + phase + decision count + fixture count + grade-source (was a v2 self-application emission graded? Hand-graded?)"
  ],
  guardrails: [
    "HARD-DEP on `te1-engine-core-complete` tag (consumes Predicate DSL).",
    "engine.json files are AUTHORED CONTENT — they encode the deterministic-rule-tree-first portfolio narrative. Author with the same care as a Zod schema; tinkering breaks the moat.",
    "Golden fixtures snapshot expected `EngineOutput` shape — DO NOT invoke the live engine at authorship time. The decoupling is what unblocks parallel work with `audit-writer` (critique #10).",
    "PII redaction is regex-level only — DO NOT add NLP-based PII detection. Regex is fast + auditable; NLP is opaque.",
    "Dynamic model routing consumes v2.1's `lib/langchain/config.ts` named LLMs — DO NOT introduce new LLMs without coordinator approval.",
    "If a decision in an engine.json file requires shape that the schema-registry validator rejects, FIX the engine.json (not the validator) — the validator IS the contract.",
    "≥5 fixtures per file is the floor; ≥10 is the goal. The LangSmith dataset from `eval-harness` (TC1) gives a starting corpus — replay graded examples as golden fixtures where applicable.",
    "Commits: redact + pick-model + types/_schema + 13 engine.json files (1 per commit) + tests."
  ]
})

Agent({
  name: "kb-rewrite",
  subagent_type: "backend-architect",
  team: "c1v-kb-runtime-engine",
  goal: "Rewrite 80 phase files under `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/` (post-T9 home; 9 modules M1-M7 + `_shared/`) into the schema-first 6-section shape (γ phase per master plan v2.1 line 474). Snapshot legacy under `_legacy_2026-04-26/` for rollback. Land 5 schema extensions in the engine for any new shape elements (δ phase per v2.1 line 475). Wire LangGraph nodes for 'why this value?' provenance UI (ε phase per v2.1 line 476 — `provenance-ui` agent owns the UI shell, kb-rewrite owns the LangGraph nodes that feed it). Day-0 inventory: T9 dedup ✅ done (117 symlinks, 0 file-duplicates) — kb-rewrite does NOT redo the dedup, only the γ-shape rewrite. EC-V21-E.9 + EC-V21-E.10 + EC-V21-E.11 gates.",
  inline_skills: ["code-quality", "testing-strategies"],
  required_reading: ["plans/wave-e-day-0-inventory.md", "system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md"],
  deliverables: [
    "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/ — snapshot of all 80 phase files BEFORE rewrite (preserves rollback path; mirrors v2.1 'wave-e-pre-rewrite-2026-04-26' tag at the file-content level). git commit message: 'snapshot: pre-Wave-E phase files (rollback anchor)'.",
    "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/[1-7]-*/[phase-files].md — 80 phase files rewritten to schema-first 6-section shape. Sections: (1) Decision context — what's being decided + why; (2) Predicates — machine-readable rules in DSL form (referenced from `engine-stories/*.engine.json`); (3) Fallback rules — what to do if no predicate matches; (4) STOP GAP rules — fail-closed conditions (machine-readable, consumed by engine-fail-closed); (5) Math derivation — formulas + units + sources; (6) References — KB chunk IDs (consumed by `searchKB`).",
    "0-5 schema extensions in `apps/product-helper/lib/langchain/schemas/` (UPDATED 2026-04-27 fix-up Correction 4) — TC1 shipped 11 Crawley schemas in `module-{2,3,4,5}/` post-`tc1-wave-c-complete`; `kb-rewrite` MUST read these BEFORE authoring any extension. If TC1's `module-2/requirements-crawley-extension.ts` already covers the M2 engine-shape needs, EXTEND in place — DO NOT add a sibling `nfr-engine-extension.ts`. Likely revised list: `module-6/qfd-engine-extension.ts`, `module-8/fmea-engine-extension.ts`, plus 0-1 cross-cutting depending on TC1 coverage. **0 extensions is acceptable** if TC1 covers everything Wave-E needs — surface the finding in `kb-rewrite-summary.md` and proceed.",
    "apps/product-helper/lib/langchain/graphs/intake-graph.ts — add LangGraph nodes for 'why this value?' provenance: `explain_decision(decisionRef): { matched_rule_id, math_trace, override_history, kb_references }`. UI shell consumed by `provenance-ui` agent.",
    "apps/product-helper/__tests__/kb/phase-file-shape.test.ts — every phase file matches the 6-section schema; markdown headings present; predicate blocks parse as valid DSL; STOP GAP blocks load as machine-readable rules.",
    "plans/v22-outputs/te1/kb-rewrite-summary.md — per-module table: phase-file count, lines changed, schema extensions added, KB chunk references count. Diff stats vs `_legacy_2026-04-26/` snapshot."
  ],
  guardrails: [
    "HARD-DEP on `te1-engine-core-complete` tag.",
    "DO NOT re-do T9 dedup — Day-0 confirms 117 symlinks already in place. kb-rewrite is γ-shape rewrite ONLY; δ-dedup is ✅ done.",
    "Snapshot to `_legacy_2026-04-26/` BEFORE any phase-file edit — without it, rollback requires git-time-travel which is messier than a parallel directory.",
    "6-section shape is LOCKED per master plan v2.1 line 474 — DO NOT add a 7th section without coordinator approval.",
    "Predicate blocks in section 2 reference engine.json rules (authored by `engine-stories`) — DO NOT inline predicates in markdown; the markdown points to the JSON.",
    "If a phase file is a `_shared/` symlink (T9 dedup), edit the SOURCE in `_shared/`, not the symlink — otherwise the 9 consumers lose alignment.",
    "Schema extensions coordinate with TC1's `crawley-schemas` shipped output (UPDATED 2026-04-27 fix-up Correction 4) — if a Crawley schema already covers the shape, EXTEND in place rather than adding a v2.2 sibling. tsc-green + no-duplicate-keys at the schema-registry level is the integration gate. If overlap requires changing a TC1 schema, FAIL the commit and surface to coordinator (analog of v2's projects-table double-authoring gap).",
    "Commits: snapshot (1 commit) + per-module rewrite (7 commits, M1-M7) + schema extensions (5 commits) + LangGraph node + tests + summary doc."
  ]
})

Agent({
  name: "agent-greenfield-refactor",
  subagent_type: "langchain-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Close P10 (NEW per 2026-04-27 fix-up Correction 1 + master plan §D-V22.01). Refactor the 7 NEW v2.1 LangGraph node-agents from re-validators (consume stub) to greenfield generators (read intake + upstream artifacts; produce output). Each agent drops its `if (!stub) return pending` branch and reads from `EvalContext` (composed by G4 ContextResolver from engine-context). Aligns with Wave E's deterministic-rule-tree-first narrative ([`methodology-rosetta.md`](../../plans/methodology-rosetta.md) §9 substrate-vs-feeder pattern). EC-V21-E.14 gate. Consumes the 7 P10-closure rule trees authored by `engine-stories` (m1-data-flows, m5-form-function-greenfield, m4-decision-network, m7-n2, m8-fmea-early, m8-fmea-residual, m4-synthesis-keystone).",
  inline_skills: ["langchain-patterns", "code-quality", "testing-strategies"],
  required_reading: ["plans/wave-e-day-0-inventory.md", "plans/post-v2.1-followups.md", "plans/HANDOFF-2026-04-27-v2.2-fixup.md"],
  deliverables: [
    "apps/product-helper/lib/langchain/graphs/nodes/generate-data-flows.ts — drop `if (!stub) return pending` branch; read from `state.intakeMessages` + `state.extractedData` (the upstream M1 artifact extraction); produce non-empty `data_flows.v1.json`. Persist via existing `persistArtifact({ ..., status: 'ready' })` pattern. Optionally invoke `searchKB(...)` (Wave-E G8/G9 from engine-pgvector) for KB-9 atlas priors when intake mentions known archetypes.",
    "apps/product-helper/lib/langchain/graphs/nodes/generate-form-function.ts — same shape. Reads from intake + M3 FFBD artifact (when available) + M5 phase-1/phase-2 taxonomy schemas (TC1 shipped) for typed shape.",
    "apps/product-helper/lib/langchain/graphs/nodes/generate-decision-network.ts — same shape. Reads from intake + M5 morphological matrix artifact (alternative space) + KB-9 atlas priors via `searchKB(...)`. Produces `decision_network.v1.json` with `bound_to.source` provenance per Rosetta §9.",
    "apps/product-helper/lib/langchain/graphs/nodes/generate-n2.ts — same shape. Reads from intake + M3 FFBD artifact.",
    "apps/product-helper/lib/langchain/graphs/nodes/generate-fmea-early.ts — same shape. Reads from intake + M3 FFBD + M1 data flows.",
    "apps/product-helper/lib/langchain/graphs/nodes/generate-fmea-residual.ts — same shape. Reads from M4 decision network winner + M8 fmea_early.",
    "apps/product-helper/lib/langchain/graphs/nodes/generate-synthesis.ts (architecture-recommendation keystone) — same shape. Reads from all 10 prior artifacts + KB-9 priors via `searchKB(...)`. Owns the keystone derivation chain end-to-end. Emits `architecture_recommendation.v1.json` with full `derivation_chain` populated.",
    "apps/product-helper/__tests__/langchain/graphs/nodes/<each-node>.test.ts — for each of 7 nodes: success-path test pattern per P10 resolution recommendation. Test shape: `it('given fixture intake + upstream artifacts, produces non-empty <kind>.v1 within N seconds', ...)`. NOT just `it('persists pending row when no stub on state', ...)` — the inverse of v2.1's verifier mistake. The literal substring `'given fixture intake'` is enforced by `qa-e-verifier`.",
    "apps/product-helper/__tests__/langchain/graphs/intake-graph.live-project.test.ts — end-to-end: fixture project with intake complete → run intake graph with `nfrImpl: 'engine'` → assert all 11 `project_artifacts` rows transition pending → ready (NOT 4-of-11; **11-of-11**). Uses fixture LLM mocks for determinism (matches v2.1.1 e2e mock pattern).",
    "plans/v22-outputs/te1/p10-closure-evidence.md — per-node before/after diff (LOC removed: `if (!stub)` branch + lines added: greenfield generation code path); test result captures; rough token-cost-per-node measurement against fixture intake; cross-reference to the 7 consumed engine.json story rule trees from `engine-stories`.",
    "git tag `te1-greenfield-refactor-complete` on green; verifier consumes this tag for EC-V21-E.14 ledger AND `engine-prod-swap` HARD-DEPs on it."
  ],
  guardrails: [
    "HARD-DEP on `te1-engine-context-complete` tag (consumes ContextResolver / EvalContext for substrate reads).",
    "HARD-DEP on `te1-engine-stories-complete` tag (consumes the 7 P10-closure greenfield rule trees from `engine-stories`).",
    "BLOCKING for `engine-prod-swap` (which gates the prod swap on EC-V21-E.14 — 11-of-11 ready click-through).",
    "Greenfield generators MUST NOT introduce a NEW upstream stub-population dependency (Path A is explicitly rejected per master plan D-V22.01 + HANDOFF Correction 1). Read from intake + upstream artifacts directly via `EvalContext`.",
    "Each refactor PRESERVES the v2.1 contract pin envelope (Wave A↔E handshake) — agent emissions stay Zod-pinned to the same output schema. Implementation independence proof: both `nfrImpl: 'llm'` and `nfrImpl: 'engine'` paths must continue passing fixtures (per `engine-prod-swap` agent's TWO describe blocks pattern).",
    "DO NOT modify the 4 pre-v2.1 nodes (`generate_qfd`, `generate_interfaces`, `generate_ffbd`, `generate_decision_matrix`) — they already produce output today (per P10 diagnosis). Only the 7 NEW v2.1 nodes are in scope.",
    "DO NOT modify v2.1 contract envelope (`nfr_engine_contract_version: 'v1'`) — output shape stays Zod-pinned to the same submodule schemas.",
    "Per-file atomic commits (memory: feedback_commit_per_file_immediately.md). One commit per refactored agent; one commit per test file.",
    "Branch: wave-e/te1-greenfield-refactor (sibling to other Wave E feature branches).",
    "Success-path test pattern is non-negotiable per P10 resolution recommendation #3 — without it, this fix-up reproduces v2.1's verifier mistake. `qa-e-verifier` enforces a literal substring scan."
  ],
  blocks: ["engine-prod-swap"]
})

Agent({
  name: "provenance-ui",
  subagent_type: "ui-ux-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Build the 'why this value?' provenance UI — every auto-filled NFR/constant/decision exposes the matched rule + math trace + override-history button. Reuses existing `components/chat/`-style panels per D-V21.23. NO new design tokens, NO Figma blocker (EC-V21-A.11 visual-style lock applies). Consumes `kb-rewrite`'s `explain_decision` LangGraph node for the data. EC-V21-E.11 gate (UI shell finish — kb-rewrite owns the data side).",
  inline_skills: ["react-best-practices", "nextjs-best-practices", "code-quality"],
  required_reading: ["plans/wave-e-day-0-inventory.md"],
  deliverables: [
    "apps/product-helper/components/synthesis/why-this-value-button.tsx — small button placed next to every auto-filled value in the synthesis viewer (NFRs, constants, decision-network choices, QFD weights, FMEA severities). Click → opens side-panel. **Attachment surfaces (UPDATED 2026-04-27 fix-up Correction 3):** rendered inside `recommendation-viewer.tsx` + `architecture-and-database-section.tsx` (per existing deliverables below) AND any non-FROZEN M2/M6/M8 viewer surface consumed by the v2.1.1-shipped synthesis page (`app/(dashboard)/projects/[id]/synthesis/page.tsx`). DO NOT attach to `components/synthesis/pending-state.tsx` (transient polling-state UI, no value to render). DO NOT modify `components/synthesis/run-synthesis-button.tsx` (the trigger; provenance is for filled values).",
    "apps/product-helper/components/synthesis/why-this-value-panel.tsx — side-panel (slides in from right; reuses existing chat-panel layout from `components/chat/chat-window.tsx`). Sections: (1) Matched rule — rule_id + plain-language summary, (2) Math trace — formula + values + result, (3) KB references — links to chunk source files (resolved via `searchKB`), (4) Override history — table of past overrides with timestamp + user + value + rationale, (5) Override CTA — button to manually override the value.",
    "apps/product-helper/components/synthesis/override-form.tsx — modal form for manual override. Fields: new value, rationale (required, ≥10 chars). On submit: writes to `decision_audit.override_history` JSONB array via TA1's queries.ts pattern; refreshes the panel.",
    "apps/product-helper/components/projects/sections/architecture-and-database-section.tsx — extend with `<WhyThisValueButton />` next to each architecture/db value (alternative-pick, schema choice, etc.). Verify NO modification to FROZEN viewers.",
    "apps/product-helper/components/synthesis/recommendation-viewer.tsx — extend with `<WhyThisValueButton />` next to every section's auto-filled value. Verify NO new design tokens.",
    "apps/product-helper/__tests__/components/why-this-value-panel.test.tsx — panel renders all 5 sections; override form validates rationale length; override submit writes audit row; cross-tenant access blocked (RLS).",
    "plans/v22-outputs/te1/provenance-ui-summary.md — list of components added/edited; brand-token usage verified (Firefly/Porcelain/Tangerine/Danube only); FROZEN-list compliance verified."
  ],
  guardrails: [
    "HARD-DEP on `te1-engine-core-complete` tag (consumes EngineOutput shape).",
    "SOFT-depends on `kb-rewrite` (consumes `explain_decision` LangGraph node) — if kb-rewrite hasn't shipped its node yet, mock the node response shape in tests; live integration lands in qa-e-verifier's integration test.",
    "Reuse existing brand tokens from app/theme.css + app/globals.css — NO new color hex values. EC-V21-A.11 visual-style lock applies.",
    "Reuse existing `components/chat/`-style panel layout per D-V21.23 — DO NOT introduce a new side-panel pattern.",
    "FROZEN viewers (decision-matrix-viewer.tsx, ffbd-viewer.tsx, qfd-viewer.tsx, interfaces-viewer.tsx, diagram-viewer.tsx) MUST NOT be edited — wrap them with the `<WhyThisValueButton />` externally if needed, do NOT modify their internals.",
    "Override form rationale ≥10 chars enforced — without rationale, override-history loses context.",
    "Override submit writes via service role + RLS check — tenant isolation honored.",
    "Commits: button + panel + override-form + section integrations + tests + summary doc."
  ]
})

Agent({
  name: "engine-prod-swap",
  subagent_type: "langchain-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Swap `GENERATE_nfr` + `GENERATE_constants` graph-node internals from v2.1's LLM-only agents to `nfrEngineInterpreter.evaluate(...)` via the **DI pattern locked in TE1's `nfr_node_swap_mechanism_LOCKED`** (`intake-graph.ts` accepts `nfrImpl?: 'llm' | 'engine'` arg with default 'engine' post-swap). NOT env-var, NOT fixture-override — agent does NOT improvise an alternative. Verify ≥60% LLM call rate drop on M2 against the baseline at `plans/v21-outputs/observability/sentry-baseline-2026-04-27.json` (written by `engine-core` Day-0 prereq; baseline framing is post-v2.1.1, pre-engine-swap). Both `intake-graph.ta1-integration.test.ts` describe blocks (one per impl: llm-only and engine-first) must pass with new internals. EC-V21-E.12 + EC-V21-E.13 gates. **EC-V21-E.14 gate (NEW per 2026-04-27 fix-up Correction 5):** extend v2.1.1-shipped `tests/e2e/synthesis-clickthrough.spec.ts` to assert all 11 `project_artifacts` rows transition to `ready` within the 30s circuit-breaker window (replaces v2.1.1-era P10-aware 4-of-11 split). Capture in `plans/v22-outputs/te1/p10-closure-clickthrough-evidence.md`: row-count timeline `0 pending → 11 pending → 11 ready` (single integer, not split). **LAST deliverable agent — runs after all 10 above (now includes `agent-greenfield-refactor`).**",
  inline_skills: ["langchain-patterns", "claude-api", "code-quality", "testing-strategies"],
  required_reading: ["plans/wave-e-day-0-inventory.md", "plans/v21-outputs/observability/sentry-baseline-2026-04-27.json"],
  deliverables: [
    "apps/product-helper/lib/langchain/graphs/intake-graph.ts — accept `nfrImpl?: 'llm' | 'engine'` parameter (default `'engine'` post-swap; backwards-compat path: `'llm'` invokes v2.1's NFR agent unchanged). DI surface: `createIntakeGraph({ nfrImpl })` returns the graph with the requested impl wired. Both impls preserve the v2.1 contract pin envelope (`nfr_engine_contract_version: 'v1'`).",
    "apps/product-helper/lib/langchain/graphs/nodes/generate-nfr.ts (or wherever the GENERATE_nfr node lives — verify on disk) — refactor to consume `nfrImpl` parameter. When `'engine'`, calls `nfrEngineInterpreter.evaluate(decision, context)` for each NFR row; when `'llm'`, falls through to v2.1 NFR agent.",
    "apps/product-helper/lib/langchain/graphs/nodes/generate-constants.ts (or equivalent) — same refactor.",
    "apps/product-helper/__tests__/langchain/graphs/intake-graph.ta1-integration.test.ts — extend with TWO describe blocks: `describe('GENERATE_nfr — impl: llm-only')` and `describe('GENERATE_nfr — impl: engine-first')`. Both run the same fixture; both assert the same Zod-pinned output shape. Implementation independence proven by both passing.",
    "apps/product-helper/scripts/verify-llm-call-rate-drop.ts — measurement script. Reads baseline JSON; scrapes a 7-day rolling Sentry window for `synthesis_metrics_total{module=\"m2\",impl=\"engine-first\"}`; computes `(baseline_calls - postswap_calls) / baseline_calls`; passes if ≥ 0.60 with non-overlapping confidence intervals. CLI: `pnpm tsx scripts/verify-llm-call-rate-drop.ts --baseline=<path> --postswap=<live-or-export> --threshold=0.60`. Used by qa-e-verifier for EC-V21-E.13 gate.",
    "Production swap deployment: change default `nfrImpl` from 'llm' to 'engine' in `lib/langchain/graphs/intake-graph.ts` after staging green. Document the deploy in `plans/v22-outputs/te1/prod-swap-deploy.md`.",
    "Post-swap measurement window: run `verify-llm-call-rate-drop.ts` on day +7 after deploy; capture results in `plans/v22-outputs/te1/llm-rate-drop-evidence.md`. If gate misses, surface to coordinator (engine-stories may need additional rule-tree authoring; do NOT silently revert).",
    "git tag `te1-prod-swap-complete` on green (deploy successful + 7-day measurement passes the ≥60% gate)"
  ],
  guardrails: [
    "HARD-DEP on ALL other 10 deliverable agents' tags (engine-context, audit-writer, engine-fail-closed, engine-gap-fill, engine-pgvector, engine-stories, kb-rewrite, **agent-greenfield-refactor** [NEW per fix-up Correction 1], provenance-ui).",
    "BLOCKING for `qa-e-verifier`.",
    "DI pattern is LOCKED — DO NOT improvise env-var or fixture-override swap. The lock prevents test-suite re-patterning (critique #3).",
    "Backwards-compat path (`nfrImpl: 'llm'`) MUST stay green — qa-e-verifier's implementation-independence proof asserts both impls pass the same fixtures.",
    "Default-flip from 'llm' to 'engine' is the production swap — DO NOT flip until staging is green AND the 7-day measurement window completes the ≥60% gate.",
    "Baseline JSON path is `plans/v21-outputs/observability/sentry-baseline-2026-04-27.json` per the Day-0 prereq (UPDATED 2026-04-27 fix-up Correction 2 — file renamed to reflect post-v2.1.1 baseline framing) — DO NOT change.",
    "≥60% drop is the EC-V21-E.13 gate — measured over a 7-day rolling window post-deploy with non-overlapping CIs. Anything else is a miss; surface to coordinator.",
    "Commits: graph-node refactor + intake-graph DI surface + tests (both impls) + verify-script + staging deploy + prod swap + measurement evidence."
  ]
})

Agent({
  name: "qa-e-verifier",
  subagent_type: "qa-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Verify TE1 exit criteria EC-V21-E.0 through EC-V21-E.14 (UPDATED 2026-04-27 fix-up — added EC-V21-E.14 P10 closure) against the deliverables shipped by the other 11 TE1 agents (now includes `agent-greenfield-refactor`). Includes the Wave A↔E implementation-independence proof (both `'llm'` and `'engine'` impls pass the same fixtures via DI pattern locked by `engine-prod-swap`). Tags `te1-wave-e-complete` only on full green. Non-fix verifier — log failures, capture evidence, surface to coordinator. Also enforces dispatch rule #8 (TE1 prompt-body inventory-path inclusion check) AND new success-path test enforcement (per 2026-04-27 fix-up).",
  inline_skills: ["testing-strategies"],
  required_reading: ["plans/wave-e-day-0-inventory.md", "plans/v21-outputs/observability/sentry-baseline-2026-04-27.json"],
  deliverables: [
    "apps/product-helper/scripts/verify-te1.ts — TE1-specific verifier (CI-reusable). Asserts: (a) EC-V21-E.0(i) source plan path rewrite ✅ from 2026-04-25 (re-verify on disk), (b) EC-V21-E.0(ii) snapshot tag `wave-e-pre-rewrite-2026-04-26` exists locally + on origin, (c) EC-V21-E.1 — interpreter + DSL + clarification-detector refactor green; existing clarification-detector test suite green (regression), (d) EC-V21-E.2 — ContextResolver tested against ≥5 representative phase decisions, (e) EC-V21-E.3 — DELTA migration applied; `writeAuditRow()` fires; hash chain verified via `verify-decision-audit-chain.ts`, (f) EC-V21-E.4 — fail-closed rules enforced; STOP GAP audit doc exists, (g) EC-V21-E.5 — gap-fill loop completes; max-turns guard fires; multi-turn integration test green, (h) EC-V21-E.6 — kb_chunks row count > 0; RLS migration applied; `searchKB` p95 < 200ms (ivfflat or HNSW), (i) EC-V21-E.7 — PII redaction + dynamic model routing green, (j) EC-V21-E.8 — 13 engine.json files present + ≥5 fixtures each + golden tests green; 7 P10-closure stories include greenfield-generation predicate blocks (per fix-up Correction 1), (k) EC-V21-E.9 — 80 phase files in 6-section shape; `_legacy_2026-04-26/` snapshot exists, (l) EC-V21-E.10 — 0-5 schema extensions landed (TC1 reconciliation per fix-up Correction 4 — verifier reads TC1 schemas first; 0 extensions acceptable if TC1 covers everything), (m) EC-V21-E.11 — provenance-ui components shipped + LangGraph `explain_decision` node wired; attachment surfaces match v2.1.1-shipped synthesis page (per fix-up Correction 3 — NO attachment to `pending-state.tsx` or `run-synthesis-button.tsx`), (n) EC-V21-E.12 — DI swap shipped; both `'llm'` and `'engine'` impls pass implementation-independence proof on `intake-graph.ta1-integration.test.ts`, (o) EC-V21-E.13 — `verify-llm-call-rate-drop.ts` reports ≥0.60 drop with non-overlapping CIs against post-v2.1.1 baseline at `sentry-baseline-2026-04-27.json`, (p) **EC-V21-E.14 (NEW per fix-up Correction 1)** — extended `synthesis-clickthrough.spec.ts` reports 11/11 ready (not 4/11); `intake-graph.live-project.test.ts` green; `p10-closure-evidence.md` captured per-node before/after; `p10-closure-clickthrough-evidence.md` captures `0 pending → 11 pending → 11 ready` (single integer, not split).",
    "**Success-path test enforcement (NEW per 2026-04-27 fix-up Correction 1 + P10 verifier process learning #3):** for every test file under `apps/product-helper/__tests__/langchain/graphs/nodes/<node>.test.ts` for the 7 NEW v2.1 nodes (`generate_data_flows`, `generate_form_function`, `generate_decision_network`, `generate_n2`, `generate_fmea_early`, `generate_fmea_residual`, `generate_synthesis`), verifier scans for the literal substring `'given fixture intake'` (or equivalent success-path pattern). If a node test only asserts the failure-path (`'persists pending row when no stub'`) without a success-path counterpart, FAIL the EC. Same shape as v2.1.1's dispatch rule #8 enforcement (literal-substring scan). This is the structural fix preventing v2.1's verifier mistake from recurring.",
    "**Dispatch rule #8 enforcement (per critique #4):** every TE1 Agent prompt body (the 12 prompts in §TE1 §Step 2) MUST contain the literal substring `wave-e-day-0-inventory.md` in its `required_reading` list. Verifier scans this spawn-prompts doc + cross-checks against the `Agent({...})` blocks. FAIL on missing.",
    "plans/v22-outputs/te1/verification-report.md — per-EC PASS/FAIL with evidence (commit SHA, log excerpt, query result, screenshot link if applicable). Mirror v2.1 per-team verification-report.md format.",
    "Integration test: spawn fixture project → trigger full intake → assert engine fires → audit row written + hash chain valid → searchKB returns top-K → provenance panel renders → override path writes audit row → multi-turn gap-fill resolves",
    "git tag `te1-wave-e-complete` ONLY if every EC green AND implementation-independence proof passes AND ≥60% LLM-call-rate drop verified. Push to origin (docs-e-and-closeout HARD-DEPs on the remote tag)."
  ],
  guardrails: [
    "Depend on engine-prod-swap (block on `te1-prod-swap-complete` tag) AND all 10 other deliverable agents (block on agent names — now includes `agent-greenfield-refactor` per fix-up Correction 1).",
    "Non-fix verifier — log failures, capture evidence, surface to coordinator. Do NOT auto-fix any deliverable.",
    "All 15 EC sub-points (E.0-E.14) must be green to tag. Partial green = NO TAG; surface failed EC(s) to coordinator with evidence.",
    "EC-V21-E.13 ≥60% gate is measured over 7-day rolling window post-deploy — engine-prod-swap owns the deploy + measurement; verifier consumes the evidence file (`llm-rate-drop-evidence.md`) and re-runs `verify-llm-call-rate-drop.ts` against current Sentry data as a sanity check.",
    "Implementation-independence proof is non-negotiable: BOTH `nfrImpl: 'llm'` AND `nfrImpl: 'engine'` must pass the same `intake-graph.ta1-integration.test.ts` fixtures. If only `'engine'` passes, the v2.1 backwards-compat path is broken — FAIL the EC.",
    "Tag MUST point to the head commit of the TE1 feature branch (after engine-prod-swap's prod swap deploy commit lands). Push to origin via `git push origin te1-wave-e-complete`.",
    "Dispatch rule #8 enforcement is a STATIC scan of the spawn-prompts doc — NOT runtime. If a TE1 Agent prompt was authored without the inventory-path string, FAIL the EC and surface the gap to coordinator (then dispatch a fixer or accept the gap with explicit waiver).",
    "Single commit: 'test(te1/verifier): verify-te1.ts + verification-report.md + te1-wave-e-complete tag'."
  ]
})

Agent({
  name: "docs-e-and-closeout",
  subagent_type: "documentation-engineer",
  team: "c1v-kb-runtime-engine",
  goal: "Document TE1's surfaces + execute v2.2 closeout. Updates `apps/product-helper/CLAUDE.md` with the engine section. Writes JSDoc on G1-G11 modules. Appends Wave E entry to `plans/v2-release-notes.md`. Writes the standalone `plans/v22-release-notes.md` mirroring v2.1 release-notes pattern. Flips `plans/c1v-MIT-Crawley-Cornell.v2.2.md` DRAFT → SHIPPED with CLOSEOUT section listing tag SHAs. Updates `plans/post-v2.1-followups.md` (resolves P5 stranded trees + files any new findings). Creates roll-up tag `v2.2-shipped`. **HARD-DEP on `te1-wave-e-complete` tag from `qa-e-verifier` (FAIL-CLOSED — does NOT run if any EC red).**",
  inline_skills: ["code-quality"],
  required_reading: ["plans/wave-e-day-0-inventory.md"],
  deliverables: [
    "apps/product-helper/CLAUDE.md — Add `KB Runtime Engine (Wave E, v2.2)` section under `Architecture`: G1-G11 module list, engine.json story-tree count, `nfrImpl` DI surface, `searchKB` usage, `decision_audit` extension shape, provenance UI entry-points. Add `Quarterly Drift Check (v2.2)` cross-reference to TC1's quarterly-drift-check workflow.",
    "apps/product-helper/lib/langchain/engine/*.ts — file-level JSDoc on each G1-G11 module: `@gn G<N>` source-of-truth, public exports, consumers, drift policy. Export-level JSDoc on every public function.",
    "plans/v2-release-notes.md — append `## Wave E — KB runtime architecture rewrite (v2.2 Wave 2, 2026-XX-XX)` section: TE1's deliverables, exit-criterion gates, tag SHAs (`te1-engine-core-complete`, `te1-engine-context-complete`, `te1-prod-swap-complete`, `te1-wave-e-complete`), measured ≥60% LLM-call-rate drop figure.",
    "plans/v22-release-notes.md (NEW) — standalone v2.2 release notes mirroring `v2-release-notes.md` pattern: per-team table (TC1 + TE1), what shipped, deferred items, cost figures (post-Wave-E projection ≤ $320/mo target — verify via `load-test-tb1.ts`), latency figures (`searchKB` p95, gap-fill end-to-end), portfolio artifact updates, verification reports cross-references.",
    "plans/c1v-MIT-Crawley-Cornell.v2.2.md — flip `Status: 📝 DRAFT` → `Status: ✅ SHIPPED 2026-XX-XX`. Append `CLOSEOUT` section at end: tag SHAs, ship-gate checklist completion, link to `v22-release-notes.md`, post-v2.1-followups status (P5 resolved? new follow-ups?).",
    "plans/post-v2.1-followups.md — resolve P5 (stranded `kb-upgrade-v2/` partial trees) per master plan stub recommendation Option (a) `rm -rf` both partial trees OR Option (b) replace with single-line README. Pick + execute. Document any NEW follow-ups surfaced during TE1 execution (e.g. unresolved engine-stories edge cases, unconfirmed Sentry instrumentation, etc.).",
    "Roll-up tag `v2.2-shipped` @ TE1's final commit (the closeout commit itself). `git tag v2.2-shipped <closeout-sha> -m 'v2.2 closeout — Wave C + Wave E shipped'`. Push to origin.",
    "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_dev-runbooks/wave-e-engine-runbook.md (new) — operator runbook for the KB runtime engine: how to add a new engine.json story, how to extend `decision_audit` (DELTA migration pattern), how to debug a `needs_user_input` flow, how the implementation-independence proof gates v3 future swaps."
  ],
  guardrails: [
    "**HARD-DEP on green `te1-wave-e-complete` tag — FAIL-CLOSED.** If ANY EC is red, docs-e-and-closeout MUST NOT run. Master plan stays DRAFT. Failed ECs file as v2.3 carry-over per §Closeout rollback semantics.",
    "CLAUDE.md edits require explicit David authorization per file-safety rule (memory: `feedback_no_scope_doubt.md`) — surface the proposed CLAUDE.md diff in `plans/v22-outputs/te1/claude-md-diff.md` FIRST and wait for David's go-ahead before applying. Other doc surfaces (JSDoc, runbook, release-notes) ship without gating.",
    "DO NOT introduce new section headers in CLAUDE.md beyond the two named above (`KB Runtime Engine (Wave E, v2.2)`, `Quarterly Drift Check (v2.2)`).",
    "v22-release-notes.md is the v2.2 standalone doc — mirror v2-release-notes.md structure exactly (per-team table, what shipped, deferred items, cost/latency figures, portfolio artifact, verification-reports cross-references).",
    "Master plan flip is the ONLY way to mark v2.2 SHIPPED — do NOT update PROJECT.md or any other doc to claim ship before this flip lands.",
    "P5 resolution: pick Option (a) or (b) PER MASTER PLAN STUB — coordinator-default is (a) (`rm -rf both partial trees`) since the symlink `.claude/plans → ../plans` collapses both with one delete. If (b) is preferred (single-line README pointing at `system-design/kb-upgrade-v2/`), document the rationale.",
    "Roll-up tag `v2.2-shipped` is the closeout SHA — NOT the engine-prod-swap commit. The closeout commit lands AFTER all ECs green AND closeout doc updates ship.",
    "Single commit (or two if CLAUDE.md goes in a separate commit pending authorization): 'docs(te1): kb-runtime-engine documentation + v2.2 closeout + release notes'."
  ]
})
```

---

## Closeout

When `te1-wave-e-complete` tag green:

1. `docs-e-and-closeout` flips [`c1v-MIT-Crawley-Cornell.v2.2.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.2.md) DRAFT → SHIPPED with CLOSEOUT section listing tag SHAs.
2. `docs-e-and-closeout` writes [`plans/v22-release-notes.md`](../../plans/v22-release-notes.md) mirroring [`v2-release-notes.md`](../../plans/v2-release-notes.md) pattern (per-team table, what shipped, deferred items, cost figures, latency figures, portfolio artifact).
3. `docs-e-and-closeout` updates [`plans/v2-release-notes.md`](../../plans/v2-release-notes.md) §"What was deferred to v2.2" — collapse the forward-reference into ✅ resolved with closeout-tag SHAs.
4. `docs-e-and-closeout` updates [`plans/post-v2.1-followups.md`](../../plans/post-v2.1-followups.md):
   - P5 (stranded `kb-upgrade-v2/` partial trees) → resolve via Option (a) or (b) per stub recommendation
   - Any new follow-ups surfaced during TE1 execution
5. Roll-up tag: `v2.2-shipped` @ TE1's final commit. Push to origin.

**Rollback semantics (if `qa-e-verifier` reports any EC red — per critique #8):**
- Master plan `c1v-MIT-Crawley-Cornell.v2.2.md` stays DRAFT — NO flip.
- `docs-e-and-closeout` does NOT run (HARD-DEP on green `te1-wave-e-complete` tag).
- Failed EC(s) get filed in [`plans/post-v2.1-followups.md`](../../plans/post-v2.1-followups.md) as v2.3 carry-over with the failure shape captured.
- Branch state preserved; no rollback to `wave-e-pre-rewrite-2026-04-26` snapshot tag unless explicit human decision (the snapshot tag is a recovery option, not an automatic trigger).
- v2.2 release notes (`v22-release-notes.md`) NOT written — partial-green doc-state must not lie about completeness.
- Roll-up tag `v2.2-shipped` NOT created.
6. Cost-target gate: `scripts/load-test-tb1.ts` projection ≤ $320/mo at 100 DAU verified by `qa-e-verifier`. If miss, file as v2.3 follow-up (P6 cache-bug investigation gets priority bump in v2.3).

---

## Cross-references

- v2.2 master plan: [`c1v-MIT-Crawley-Cornell.v2.2.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.2.md)
- Day-0 inventory: [`wave-e-day-0-inventory.md`](../../plans/wave-e-day-0-inventory.md)
- v2.1 spawn prompts (inheritance source): [`team-spawn-prompts-v2.1.md`](team-spawn-prompts-v2.1.md)
- v2.1 master plan (Wave C + Wave E source content): [`c1v-MIT-Crawley-Cornell.v2.1.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.1.md)
- KB runtime architecture source plan: [`kb-runtime-architecture.md`](../../plans/kb-runtime-architecture.md)
- Crawley requirements: [`crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md`](../../plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md)
- Post-v2.1 backlog: [`post-v2.1-followups.md`](../../plans/post-v2.1-followups.md)
- Dispatch helper: [`scripts/dispatch-helper.ts`](../../scripts/dispatch-helper.ts) (v2.1 fix-up sweep)
- Snapshot anchor: tag `wave-e-pre-rewrite-2026-04-26` @ `a7f8a7c`
