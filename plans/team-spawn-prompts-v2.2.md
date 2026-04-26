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

**Total: 2 teams, 12 agents, 2 dispatch waves (TC1 first, TE1 second — see §Sequencing below).**

Per-team role coverage (mandated, mirrors v2.1 pattern):
- **QA / verifier (every team):** `qa-engineer` agent gates that team's exit criteria from v2.2 master plan and tags `t<slug>-wave-<N>-complete` on green. Non-fix verifier — log failures, surface, do NOT auto-fix.
- **Documentation (every team):** `documentation-engineer` agent updates README / CLAUDE.md / inline JSDoc / runbooks scoped to that team's surfaces. TE1's docs agent additionally writes the v2.2 release notes + plan closeout (folding the v2.1 `plan-updater` role into TE1 since TE1 is the last team to ship in v2.2).

Per-team subagent_type composition:
| Team | LangChain | DB | Backend | UI/UX | Cache | Obs | QA | Docs | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| TC1 | 2 | 1 | — | — | — | — | 1 | 1 | **5** |
| TE1 | 3 | 1 | 1 | 1 | — | — | 1 | 1 | **7** |
| **Total** | **5** | **2** | **1** | **1** | **0** | **0** | **2** | **2** | **12** |

(No `cache-engineer` or `observability-engineer` slots in v2.2 — Wave B already shipped that surface in v2.1. The prompt-caching bug P6 is filed as a separate cost-lever investigation, not a v2.2 team.)

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

---

## TC1 — c1v-crawley-schema-closeout (Wave C)

**Scope:** Typed-schema layer for Crawley discipline (D-V21.13). 10 new module-{2,3,4,5} schemas + `mathDerivationMatrixSchema` (Option Y per [REQUIREMENTS-crawley §5](../../plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md)) + 10 Drizzle migrations + LangSmith eval harness (≥30 graded examples per agent) + `/about/methodology` page surfacing METHODOLOGY-CORRECTION.md (closes v2.1 P9). Honors v2.1 §Wave C verbatim (lines 362-400).

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

### Step 2: Spawn agents (5 parallel, with namespace-resolver blocking the other 4)

| Agent name | subagent_type | Role | Blocks |
|---|---|---|---|
| `namespace-resolver` | langchain-engineer | EC-V21-C.0 preflight: rename `module-5-form-function/` → `module-5/`; absorb existing schema; tsc green; no duplicate keys | blocks `crawley-schemas`, `crawley-migrations`, `eval-harness`, `methodology-page` until done |
| `crawley-schemas` | langchain-engineer | EC-V21-C.1 + C.2: ship 10 schemas (`_matrix.ts` + 5 module-5 phases + 3 module-4 + 1 module-3 + 1 module-2 extension) + round-trip tests | — |
| `crawley-migrations` | database-engineer | EC-V21-C.3: 10 Drizzle migrations applied; RLS verified; `drizzle-kit migrate` deterministic | — |
| `eval-harness` | langchain-engineer | EC-V21-C.4: LangSmith dataset per agent; ≥30 graded examples each; quarterly drift-check job scheduled (C.6) | — |
| `methodology-page` | qa-engineer | EC-V21-C.5: `/about/methodology` page renders METHODOLOGY-CORRECTION.md (canonical at `system-design/kb-upgrade-v2/`); nav entry under About | — |
| `qa-c-verifier` | qa-engineer | Gates EC-V21-C.0–.6; tags `tc1-wave-c-complete` on green | runs after all 5 above |
| `docs-c` | documentation-engineer | Updates `apps/product-helper/CLAUDE.md` schema-folder section + JSDoc on each new schema; appends Wave C entry to v2-release-notes.md | runs after all 5 above |

(Agent count: 7 listed but only 5 are net-new TC1 surface; QA + Docs are mandated per-team coverage, not Wave-C deliverables. Total team size = 7, scope-deliverable agents = 5.)

**Per-agent prompt template:** mirror v2.1 [TA1 agent prompts](team-spawn-prompts-v2.1.md) — `name`, `subagent_type`, `inline_skills: [code-quality, langchain-patterns, testing-strategies]`, `prompt` body with EC pin + canonical-skill-injection-header (auto-applied via `dispatch-helper.ts`).

---

## TE1 — c1v-kb-runtime-engine (Wave E)

**Scope:** Replace LLM-only NFR + constants synthesis with deterministic-rule-tree-first engine (G1-G11 per [`kb-runtime-architecture.md`](../../plans/kb-runtime-architecture.md)). Per-decision audit trail, multi-turn gap-fill, "why this value?" provenance UI, KB rewrite to schema-first 6-section shape (γ phase). Day-0 inventory shrinks scope: G5 (~80% shipped), G8/G9 (~60% shipped), δ-dedup (✅ shipped by T9). Honors v2.1 §Wave E verbatim (lines 439-523) + Wave A↔E handshake contract pin (lines 498-504).

**EC-V21-E.0 preflight (BLOCKING):**
- (i) ✅ done 2026-04-25 (source plan path rewrite committed)
- (ii) ✅ done 2026-04-26 (`wave-e-pre-rewrite-2026-04-26` @ `a7f8a7c`)
- (iii) **Day-0 inventory consumption** — every TE1 agent reads [`plans/wave-e-day-0-inventory.md`](../../plans/wave-e-day-0-inventory.md) BEFORE writing any code; honors the existing `decision_audit` shape, the existing `kb_chunks` + ivfflat index, and the existing T9 `_shared/` symlink graph. Do NOT re-create what already ships.

**Dependencies:**
- HARD-DEP on `tc1-wave-c-complete` (typed schemas + LangSmith dataset)
- HARD-DEP on `wave-e-pre-rewrite-2026-04-26` (snapshot anchor)
- Internal sequencing: `engine-core` (G1+G3) blocks `engine-context` (G4) blocks `audit-writer` (G5 finish) — the rest run parallel.

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
      "Implementation independence: __tests__/langchain/graphs/intake-graph.test.ts must pass with both v2.1 LLM-only agent AND v2.2 nfrEngineInterpreter.evaluate(...) behind GENERATE_nfr"
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

### Step 2: Spawn agents (9 total — 7 deliverable + QA + Docs)

| Agent name | subagent_type | Role (EC pinned) | Blocks |
|---|---|---|---|
| `engine-core` | langchain-engineer | EC-V21-E.1: G1 NFREngineInterpreter + G3 PredicateDSL; refactor `clarification-detector.heuristicCheck()` to consume engine | blocks `engine-context`, `engine-fail-closed`, `engine-gap-fill` |
| `engine-context` | langchain-engineer | EC-V21-E.2: G4 ArtifactReader + ContextResolver; tested against 5 representative phase decisions | blocks `audit-writer`, `engine-stories` |
| `audit-writer` | database-engineer | EC-V21-E.3 finish: extend shipped `decision_audit` table via DELTA migration with NFR-engine fields (`matched_rule_id`, `inputs_used`, `modifiers_applied`, `final_confidence`, `override_history`); engine-side `writeAuditRow()`; verify hash chain; RLS unchanged | blocks `engine-stories` |
| `engine-fail-closed` | langchain-engineer | EC-V21-E.4: G6 fail-closed rules loader + runner; all phase files' STOP GAP checklists machine-readable | — |
| `engine-gap-fill` | langchain-engineer | EC-V21-E.5: G7 surface-gap.ts producer (NOT collapsed into system-question-bridge.ts — surface-gap is producer, bridge is shared transport per v2.1 contract pin) | — |
| `engine-pgvector` | database-engineer | EC-V21-E.6: verify embeddings populated in shipped `kb_chunks` + add RLS to `kb_chunks` + optional HNSW upgrade; `searchKB(query, topK, filter?) → KBChunk[]` p95 < 200ms | — |
| `engine-stories` | langchain-engineer | EC-V21-E.7 + .8: G10 PII redaction + G11 dynamic model routing + 13 engine.json rule trees authored + golden tests ≥5 fixtures each | — |
| `kb-rewrite` | backend-architect | EC-V21-E.9 + .10 + .11: 80 phase files rewritten to schema-first 6-section shape across M1-M7 with `_legacy_2026-04-26/` snapshot for rollback; 5 schema extensions landed (delegate to TC1 if shape overlap) | — |
| `provenance-ui` | ui-ux-engineer | EC-V21-E.11 finish: LangGraph nodes for "why this value?" UI; every auto-filled NFR/constant exposes matched rule + math trace + override-history button (reuses existing `components/chat/`-style panels per D-V21.23) | — |
| `engine-prod-swap` | langchain-engineer | EC-V21-E.12 + .13: swap `GENERATE_nfr` + `GENERATE_constants` internals to `nfrEngineInterpreter.evaluate(...)` behind v2.1's frozen contract pin; verify ≥60% LLM call rate drop on M2; both intake-graph.test.ts assertions pass with new internals | runs LAST among deliverable agents |
| `qa-e-verifier` | qa-engineer | Gates EC-V21-E.0–.13; tags `te1-wave-e-complete` on green; runs Wave A↔E implementation-independence proof | runs after all 9 above |
| `docs-e-and-closeout` | documentation-engineer | Updates `apps/product-helper/CLAUDE.md` engine section + JSDoc on G1-G11; appends Wave E entry to v2-release-notes.md; flips v2.2 master plan DRAFT → SHIPPED with CLOSEOUT section; updates [`post-v2.1-followups.md`](post-v2.1-followups.md) (P5 stranded trees + any new findings); writes `plans/v22-release-notes.md` mirroring v2.1 release-notes pattern | runs after `qa-e-verifier` green |

(Total team size = 11; scope-deliverable agents = 9; QA + Docs = 2.)

**Per-agent prompt template:** mirror v2.1 [TA1 agent prompts](team-spawn-prompts-v2.1.md) — `name`, `subagent_type`, `inline_skills: [code-quality, langchain-patterns, testing-strategies, database-patterns]` (DB-anchored agents add `security-patterns`), `prompt` body with EC pin + Day-0 inventory required-reading + canonical-skill-injection-header (auto-applied via `dispatch-helper.ts`).

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
