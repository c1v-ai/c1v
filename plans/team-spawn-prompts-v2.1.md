# Team Spawn Prompts — v2.1 Amendment (c1v MIT-Crawley-Cornell)

> **Purpose:** Copy-paste-ready `TeamCreate` + `Agent` invocations for v2.1 Waves A + B + D.
> **Master plan:** [`plans/c1v-MIT-Crawley-Cornell.v2.1.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.1.md)
> **Predecessor (v2):** [`team-spawn-prompts-v2.md`](team-spawn-prompts-v2.md) — 12 teams, 47 agents, ✅ COMPLETE 2026-04-24 (`synthesizer-wave-4-complete`)
> **v2.2 stub (deferred):** [`plans/c1v-MIT-Crawley-Cornell.v2.2.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.2.md) — Waves C + E spawn prompts will land there
> **Created:** 2026-04-25
> **Author:** Bond
> **Status:** ✅ FIX-UP SWEEP APPLIED 2026-04-25 — all 21 critique-iter-1 issues + David's 5 R-v2.1 rulings resolved. `scripts/dispatch-helper.ts` shipped (8/8 tests green). `plans/post-v2.1-followups.md` seeded. D-V21.24 verified in master plan. Ready for Dispatch Wave 1 pending David's go-ahead OR optional critique iter 2.
> **Scope:** v2.1 ships **Waves A + B + D only**. Waves C (Crawley typed schemas + eval harness) and E (KB runtime architecture rewrite) are deferred to v2.2 — preserved-but-marked-deferred in the master plan, NOT spawned in v2.1.
> **Wave A ↔ Wave E handshake:** `lib/chat/system-question-bridge.ts` (transport) ships in v2.1 (TA1); `surface-gap.ts` (Wave-E producer) does NOT. The contract pin (`nfr_engine_contract_version: 'v1'` envelope on `GENERATE_nfr` / `GENERATE_constants` outputs) is honored in v2.1 so v2.2 can swap engine internals without a re-edit.

---

## Team inventory — v2.1 5-team roster

| # | Team slug | Wave | Agents | Lead subagent_type | Spawn prompt |
|---|---|---|---|---|---|
| TA1 | `c1v-runtime-wiring` | A | 6 | backend-architect | **This doc §TA1** |
| TA2 | `c1v-synthesis-ui` | A | 7 | ui-ux-engineer | **This doc §TA2** |
| TA3 | `c1v-cloudrun-sidecar` | A | 4 | devops-engineer | **This doc §TA3** |
| TB1 | `c1v-hardening` | B | 5 | cache-engineer | **This doc §TB1** |
| TD1 | `c1v-apispec-iter3` | D | 4 | langchain-engineer | **This doc §TD1** |

**Total: 5 teams, 26 agents, 2 dispatch waves.** (TA2 grew 6→7 agents 2026-04-25 21:55 EDT for EC-V21-A.16 empty-state work via dedicated `empty-section-state` agent.)

Per-team role coverage (mandated):
- **QA / verifier (every team):** `qa-engineer` agent gates that team's exit criteria from v2.1 and tags `t<slug>-wave-<N>-complete` on green. Non-fix verifier — log failures, surface, do NOT auto-fix.
- **Documentation (every team):** `documentation-engineer` agent updates README / CLAUDE.md / inline JSDoc / runbooks scoped to that team's surfaces. TB1's docs agent additionally writes the v2.1 release notes + plan closeout (folding the v2 `plan-updater` role into TB1 since TB1 is the last team to ship in the v2.1 cycle).

Per-team subagent_type composition:
| Team | Backend | DB | LangChain | UI/UX | Data-viz | DevOps | Cache | Obs | QA | Docs | **Total** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TA1 | 1 | 1 | 2 | — | — | — | — | — | 1 | 1 | **6** |
| TA2 | — | — | — | 4 | 1 | — | — | — | 1 | 1 | **7** |
| TA3 | 1 | — | — | — | — | 1 | — | — | 1 | 1 | **4** |
| TB1 | 1 | — | — | — | — | — | 1 | 1 | 1 | 1 | **5** |
| TD1 | 1 | — | 1 | — | — | — | — | — | 1 | 1 | **4** |
| **Total** | **4** | **1** | **3** | **3** | **1** | **1** | **1** | **1** | **5** | **5** | **25** |

---

## Dispatch rules

1. `TeamCreate` fires first; `Agent` calls in the immediately-following message. Both `TeamCreate` and all `Agent` calls for a single dispatch wave fire in **one coordinator message** to maximize parallelism.
2. One `Agent` call per teammate → parallel spawn unless an explicit `blocks` field forces sequencing (e.g. `migrations-and-agent-audit` blocks all other TA1 agents per EC-V21-A.0).
3. Teammates reference each other by `name`, never by agentId.
4. Permissions for every `subagent_type` listed above already exist in [`.claude/settings.json`](../settings.json) allow-list (verified 2026-04-25).
5. **Skill attachment mechanism:** `inline_skills: [...]` fields in spawn prompts below are documentation for humans reviewing the plan. At actual dispatch time, Bond translates each entry into literal `Skill('X')` invocation instructions via the canonical translator at [`scripts/dispatch-helper.ts`](../../scripts/dispatch-helper.ts) (handoff Group D / Issue 22 — `composePrompt({agentName, subagentType, inlineSkills, promptBody})` prepends `CANONICAL_SKILL_INJECTION_HEADER` to every Agent prompt body). Per-team verifiers MUST assert every spawned Agent prompt passes `hasCanonicalInjection()` — FAIL on missing header. Tests at [`scripts/__tests__/dispatch-helper.test.ts`](../../scripts/__tests__/dispatch-helper.test.ts).
6. **HARD-DEP tags:** Any agent with `HARD-DEP on <tag>` in its guardrails blocks at dispatch if the tag is absent from `origin/main`. Bond verifies via `git tag --list` before issuing the Agent call. v2.1 HARD-DEPs:
   - TA2 / TA3 SOFT-depend on TA1 internal commits (project_artifacts table, langgraph-wirer); coordinated via `name`-based blocking inside the same dispatch wave, NOT via tags.
   - TB1 HARD-DEPs on `ta1-wave-a-complete` + `ta2-wave-a-complete` + `ta3-wave-a-complete` (Wave-A gate; TD1 not gating).
   - TD1 has no HARD-DEPs (parallel with Wave A; independent codepath).
7. **Reference-from-master-plan:** Every team's `context.authoritative_spec` points at the relevant section of [`c1v-MIT-Crawley-Cornell.v2.1.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.1.md). Decision IDs (`D-V21.NN`) and exit-criterion IDs (`EC-V21-<wave>.NN`) are the canonical lock points; spawn-prompt deliverables map 1:1 to ECs.

---

## TA1 — c1v-runtime-wiring (Wave A)

**Scope:** Per-tenant LangGraph wiring of the 9 already-shipped agents into runtime nodes (D-V21.01 A2 TS-native) per master plan v2.1 §Wave A *Agent ↔ graph-node mapping* table (6 system-design agents — decision-net / form-function / hoq / fmea-early / fmea-residual / interface-specs — + 2 nav-route fillers — data-flows / n2 — + 1 keystone — architecture-recommendation). New `project_artifacts` Drizzle table with RLS from day-one (D-V21.04). EC-V21-A.0 preflight: 0011 migration collision reconciliation + agent fs-side-effects audit + canonical `intake-graph.ts` path verification + canonical `METHODOLOGY-CORRECTION.md` path resolution. Open-question chat-bridge transport (`lib/chat/system-question-bridge.ts`) + M2 NFR / hoq / fmea-residual emitter extensions per EC-V21-A.4. Atlas runtime ingest fix (`scripts/ingest-kbs.ts` path correction + Phase B re-run unblock) per EC-V21-A.8. Wave A ↔ Wave E contract pin (`nfr_engine_contract_version: 'v1'` envelope on `GENERATE_nfr` / `GENERATE_constants` outputs).

**Dependencies:** No external HARD-DEP. Internal sequencing: `migrations-and-agent-audit` agent runs FIRST and blocks all other TA1 agents until EC-V21-A.0 closes. Other TA1 agents then run in parallel.

**Honors:** D-V21.01, D-V21.04, D-V21.13 (defer Crawley schemas — v2.1 uses runtime envelopes, NOT typed Zod), D-V21.18-.23 (Wave-E contract pin only — no engine code in v2.1).

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-runtime-wiring",
  agent_type: "tech-lead",
  description: "Wire the 9 already-shipped v2 agents (6 system-design — decision-net, form-function, hoq, fmea-early, fmea-residual, interface-specs — + data-flows-agent + n2-agent + architecture-recommendation-agent) into the runtime LangGraph per master plan v2.1 §Wave A *Agent ↔ graph-node mapping* table — net 7 NEW nodes + 2 RE-WIRE of existing internals. Ship project_artifacts table + RLS. Build the system-question-bridge transport so M2/M6/M8 open-question emitters land in chat. Pin the Wave A ↔ Wave E handshake so v2.2 can swap NFR-engine internals without a re-edit.",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.v2.1.md §Wave A — Per-tenant runtime wiring + §Decisions D-V21.01/.04/.13/.18-.23 + §Wave E Contract pin",
    upstream_artifacts_already_shipped: [
      "apps/product-helper/lib/langchain/agents/system-design/decision-net-agent.ts (T4b — decision_network.v1)",
      "apps/product-helper/lib/langchain/agents/system-design/form-function-agent.ts (T5 — form_function_map.v1)",
      "apps/product-helper/lib/langchain/agents/system-design/hoq-agent.ts (T6 — hoq.v1)",
      "apps/product-helper/lib/langchain/agents/system-design/fmea-early-agent.ts (T4a — fmea_early.v1)",
      "apps/product-helper/lib/langchain/agents/system-design/fmea-residual-agent.ts (T6 — fmea_residual.v1)",
      "apps/product-helper/lib/langchain/agents/system-design/interface-specs-agent.ts (T4b — interface_specs.v1)",
      "apps/product-helper/lib/langchain/agents/system-design/data-flows-agent.ts (M1 phase-2.5 — data_flows.v1; required for End State Data Flows nav route per master plan v2.1 line 257)",
      "apps/product-helper/lib/langchain/agents/system-design/n2-agent.ts (M7.a — n2_matrix.v1; required for EC-V21-A.5 N2 promotion per master plan v2.1 line 258)",
      "apps/product-helper/lib/langchain/agents/architecture-recommendation-agent.ts (T6 keystone — architecture_recommendation.v1; 644 LOC; canonical synthesizer — synthesis-agent.ts is OUT-OF-SCOPE per master plan v2.1 line 262)"
    ],
    canonical_paths_to_verify: {
      langgraph: "apps/product-helper/lib/langchain/graphs/intake-graph.ts (NOT lib/langgraph/intake-graph.ts — that path does NOT exist; v2.1 critique iter-1 finding)",
      methodology: "Canonical home: plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md (locked 2026-04-25 per handoff Issue 1+2+20). The .claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md duplicate gets converted to a one-line redirect stub by `migrations-and-agent-audit`. NOTE: system-design/METHODOLOGY-CORRECTION.md does NOT exist — any CLAUDE.md cite to that path is stale and must be rewritten to plans/kb-upgrade-v2/.",
      kb_atlas: ".planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/ (post-T9 consolidated; legacy `8-stacks-and-priors-atlas/` is dead)"
    },
    pre_existing_migration_collision: "lib/db/migrations/0011_kb_chunks.sql AND 0011_decision_audit.sql share migration number 0011 — drizzle-kit apply order is nondeterministic until reconciled. EC-V21-A.0 fix is BLOCKING.",
    coordination: {
      with_TA2: "TA2 consumes the project_artifacts table shape + open_questions ledger keys (extractedData.openQuestions.{requirements|qfdResolved|riskResolved}) — TA1 publishes Drizzle types in lib/db/schema/index.ts; TA2 reads via @/lib/db/schema",
      with_TA3: "TA3 writes to project_artifacts (Cloud Run sidecar updates synthesis_status + sha256 + storage_url); TA1 owns table + RLS; TA3 owns writer pattern. Shared contract documented in JSDoc on the Drizzle table.",
      with_Wave_E_v2_2: "GENERATE_nfr + GENERATE_constants nodes carry nfr_engine_contract_version: 'v1' envelope. v2.2 increments to 'v2' only when the emitted Zod shape genuinely changes (forces a v2.1 re-edit at that point — explicit, not silent)."
    }
  },
  commit_policy: "one-commit-per-agent-per-deliverable; EC-V21-A.0 preflight fixes ship as their own atomic commits before any wiring code; Drizzle migration commit precedes table-consumer commits",
  wave: "A",
  blocks: ["wave-b-hardening"]
})
```

### Step 2: Spawn 6 teammates

`migrations-and-agent-audit` runs FIRST (blocks all other TA1 agents until EC-V21-A.0 green). After its tag posts, `project-artifacts-table` + `langgraph-wirer` + `open-questions-emitter` run in parallel. `verifier` blocks on those three. `docs` blocks on `verifier`.

```
Agent({
  name: "migrations-and-agent-audit",
  subagent_type: "backend-architect",
  team: "c1v-runtime-wiring",
  goal: "EC-V21-A.0 preflight (BLOCKING for the rest of TA1). Reconcile pre-existing 0011 migration-number collision; audit lib/langchain/agents/system-design/*-agent.ts + architecture-recommendation-agent.ts for filesystem side effects (any fs.writeFile/fs.readFile that must move to graph-node-driven persistence before LangGraph wire-up); verify lib/langchain/graphs/intake-graph.ts is the canonical graph path; pick ONE canonical METHODOLOGY-CORRECTION.md home; fix CLAUDE.md stale path claim (P10).",
  inline_skills: ["code-quality", "database-patterns", "security-patterns"],
  deliverables: [
    "apps/product-helper/lib/db/migrations/0011_kb_chunks.sql → renamed/numbered to resolve collision (e.g. 0011a_kb_chunks.sql) — preserve git history via git mv",
    "apps/product-helper/lib/db/migrations/0011_decision_audit.sql → renumbered to sibling (e.g. 0011b_decision_audit.sql) — preserve git history",
    "drizzle-kit apply order verification: run `pnpm --filter product-helper drizzle-kit migrate:dry-run` (or equivalent) and capture deterministic order in plans/v21-outputs/ta1/migrations-audit.md",
    "plans/v21-outputs/ta1/agents-audit.md — markdown report listing every fs.writeFile/fs.readFile call site in apps/product-helper/lib/langchain/agents/system-design/*-agent.ts AND architecture-recommendation-agent.ts AND scripts/build-t{4b,5,6}-self-application.ts; classify each as (a) script-only (must move to graph-node persistence) or (b) shared utility (already graph-safe)",
    "Resolve canonical METHODOLOGY-CORRECTION.md home: LOCKED to plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md (handoff Issue 1+2+20 — non-.claude working tree; intended for cross-Claude visibility. NOTE: BOTH plans/kb-upgrade-v2/ and .claude/plans/kb-upgrade-v2/ carry the full module 1-8 set and are byte-identical on METHODOLOGY-CORRECTION.md per disk verification 2026-04-25 21:40 EDT — the canonical pick is about tree convention, NOT about missing modules in the .claude/ copy). Convert .claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md to a one-line redirect stub pointing at plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md. Capture rationale in plans/v21-outputs/ta1/methodology-canonical.md.",
    "Edit apps/product-helper/CLAUDE.md path-claim row: `system-design/kb-upgrade-v2/module-{1..7}/` → `plans/kb-upgrade-v2/module-{1..8}/` (P10 close — handoff Issue 1+2+20)",
    "scripts/ingest-kbs.ts root-constant fix: `8-stacks-and-priors-atlas/` → `9-stacks-atlas/` (path-only fix; the actual Phase B re-run is owned by `open-questions-emitter` agent below — this commit just unblocks it)",
    "git tag `ta1-preflight-complete` on green; verifier consumes this tag for EC-V21-A.0 and EC-V21-A.7 ledger"
  ],
  guardrails: [
    "BLOCKING for `project-artifacts-table`, `langgraph-wirer`, `open-questions-emitter` — those agents block on `ta1-preflight-complete` tag. Do NOT skip the tag.",
    "Migration rename via `git mv` only (preserve history). Verify `pnpm --filter product-helper drizzle-kit migrate:dry-run` (or local supabase :54322 apply) produces a deterministic order matching the new filenames.",
    "Agent fs-side-effects audit is read-only — DO NOT refactor agents in this commit; audit findings drive `langgraph-wirer` agent's later refactor work.",
    "If the audit finds an agent that requires a non-trivial refactor (>200 LOC change to remove fs side effects), surface it to David as a finding rather than silently fixing — the choice between 'refactor in v2.1' vs 'wrap in graph-node adapter' is a decision, not a mechanical fix.",
    "METHODOLOGY-CORRECTION canonical pick MUST resolve P9 (drift between docs and on-disk module numbering) at least at the docs-citing-doc level — file-level drift between docs and folder structure is D-V21.14 (deferred to v2.2's Wave C `/about/methodology` page).",
    "Single feature branch (e.g. `wave-a/ta1-preflight`). Commits: one per deliverable. Tag final commit `ta1-preflight-complete`."
  ],
  blocks: ["project-artifacts-table", "langgraph-wirer", "open-questions-emitter", "verifier"]
})

Agent({
  name: "project-artifacts-table",
  subagent_type: "database-engineer",
  team: "c1v-runtime-wiring",
  goal: "Build the project_artifacts Drizzle table + migration + RLS policies + query helpers per D-V21.04. Stores per-tenant generated artifact metadata (path, format, sha256, synthesis_status, synthesized_at) — NOT the artifact bytes (those live in Supabase Storage with signed URLs per D-V21.08). RLS from day-one to T6 project_run_state pattern; do NOT mirror the documented `projects` table policies (R-V21.08).",
  inline_skills: ["database-patterns", "security-patterns", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/db/schema/project-artifacts.ts — Drizzle table: id (uuid PK), project_id (uuid FK → projects), artifact_kind (text — enum: 'recommendation_json' | 'recommendation_html' | 'recommendation_pdf' | 'recommendation_pptx' | 'fmea_early_xlsx' | 'fmea_residual_xlsx' | 'hoq_xlsx' | 'n2_matrix_xlsx' | 'mermaid_*' | 'bundle_zip' | ...), storage_path (text — Supabase Storage object path), format (text — 'json'|'html'|'pdf'|'pptx'|'xlsx'|'mmd'|'png'|'zip'), sha256 (text), synthesis_status (text — 'pending'|'ready'|'failed'), inputs_hash (text — for cache keying per EC-V21-A.12), synthesized_at (timestamp), failure_reason (text nullable), created_at (timestamp), updated_at (timestamp)",
    "apps/product-helper/lib/db/migrations/000<N>_project_artifacts.sql — number assigned by `migrations-and-agent-audit` agent's reconciled sequence (NOT hardcoded 0014). Manual SQL (drizzle-kit broken per memory). RLS policies: SELECT allowed for project.user_id match OR project.team_id membership; INSERT/UPDATE only via service role (sidecar uses service key); DELETE never (audit-only retention). Index on (project_id, artifact_kind) for synthesis-page reads; index on (project_id, synthesis_status) for status-polling.",
    "apps/product-helper/lib/db/schema/index.ts — export project_artifacts table + types",
    "apps/product-helper/lib/db/queries.ts — add getProjectArtifacts(projectId), getLatestSynthesis(projectId), getArtifactByKind(projectId, kind), upsertArtifactStatus(projectId, kind, status, fields). All queries use existing RLS-context helper.",
    "apps/product-helper/__tests__/db/project-artifacts-rls.test.ts — cross-tenant access blocked; service-role bypass works for sidecar writes; index plans verified via EXPLAIN",
    "Smoke test: insert + select via RLS context produces expected row shape; cross-tenant SELECT returns 0 rows; service-role INSERT succeeds; user INSERT denied"
  ],
  guardrails: [
    "HARD-DEP on `ta1-preflight-complete` tag (migrations renumbered).",
    "RLS from day-one — the policies above MUST land with the migration. Do NOT ship RLS-disabled and add policies later (R-V21.08 directly forbids mirroring `projects` table's documented gap).",
    "drizzle-kit broken — write SQL manually; verify against local Supabase (port 54322 per memory) before PR.",
    "JSDoc the table with the contract that TA3 sidecar writes synthesis_status — TA3 reads this contract; do NOT under-document.",
    "DO NOT add columns for the artifact bytes themselves (storage_path is the indirection per D-V21.08).",
    "Commit: 'feat(db): project_artifacts table + RLS' followed by 'feat(db): project_artifacts queries'"
  ]
})

Agent({
  name: "langgraph-wirer",
  subagent_type: "langchain-engineer",
  team: "c1v-runtime-wiring",
  goal: "AUGMENT 2 existing graph nodes (qfd→hoq-agent invocation, interfaces→interface-specs-agent invocation), ADD 7 NEW graph nodes (generate_data_flows, generate_form_function, generate_decision_network, generate_n2, generate_fmea_early, generate_fmea_residual, generate_synthesis), RE-WIRE existing extract_data node to additionally call nfr-resynth-agent for the M2 NFR slice. Net: 2 augment + 7 add + 1 extract-re-wire = 10 graph-node touches. (Handoff Issue 3+21 — NOT '7 new'; existing intake-graph already has generate_ffbd / generate_decision_matrix / generate_qfd / generate_interfaces at lib/langchain/graphs/intake-graph.ts:388-391.) Apply fs-side-effects refactors flagged by `migrations-and-agent-audit` per fail-forward semantics below. Honor the Wave A ↔ Wave E contract pin: `GENERATE_nfr` and `GENERATE_constants` outputs carry `nfr_engine_contract_version: 'v1'` envelope; failure-path `{status: 'needs_user_input', computed_options, math_trace}` routes to system-question-bridge.ts (NOT a thrown error).",
  inline_skills: ["langchain-patterns", "claude-api", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/langchain/graphs/intake-graph.ts — apply the agent ↔ graph-node disposition table below (handoff Issue 3+21):\n\n      | Agent file | Disposition | Graph node |\n      |---|---|---|\n      | data-flows-agent.ts | WIRE (NEW) | `generate_data_flows` |\n      | nfr-resynth-agent.ts | RE-WIRE existing extract_data → AUGMENT | (existing extract_data node augmented) |\n      | ffbd-agent.ts | already wired (do not modify) | `generate_ffbd` |\n      | form-function-agent.ts | WIRE (NEW) | `generate_form_function` |\n      | decision-net-agent.ts | WIRE (NEW — sibling to existing `generate_decision_matrix` per Issue 4 coexistence rule) | `generate_decision_network` |\n      | n2-agent.ts | WIRE (NEW) | `generate_n2` |\n      | interface-specs-agent.ts | RE-WIRE (replace `generate_interfaces` internals) | `generate_interfaces` |\n      | hoq-agent.ts | RE-WIRE (replace `generate_qfd` internals) | `generate_qfd` |\n      | fmea-early-agent.ts | WIRE (NEW) | `generate_fmea_early` |\n      | fmea-residual-agent.ts | WIRE (NEW) | `generate_fmea_residual` |\n      | synthesis-agent.ts | OUT-OF-SCOPE (sibling of architecture-recommendation-agent — pick ONE; keystone is architecture-recommendation-agent.ts because it's 644 LOC + has tests) | n/a |\n      | architecture-recommendation-agent.ts | WIRE (NEW keystone) | `generate_synthesis` |\n      | discriminator-intake-agent.ts, signup-signals-agent.ts | M0 (T7) — OUT-OF-SCOPE for v2.1 | n/a |\n\n      Existing `generate_decision_matrix` node STAYS UNCHANGED (Issue 4 coexistence — Cornell weighted-scoring view continues to drive frozen decision-matrix-viewer.tsx). New `generate_decision_network` ships as a sibling node writing `kind='decision_network_v1'` to project_artifacts; `generate_decision_matrix` writes `kind='decision_matrix_v1'`. Both run.",
    "apps/product-helper/lib/langchain/graphs/intake-graph.types.ts (or co-located type file) — Zod envelope types for each GENERATE_* node output: { result: <agent-specific-Zod-shape>, nfr_engine_contract_version: 'v1' | 'v2', synthesized_at: string, inputs_hash: string }",
    "apps/product-helper/lib/langchain/agents/system-design/*-agent.ts — adapt export signature for LangGraph node consumption (input/output graph-node-shaped, NOT script-shaped). Apply fs-side-effects refactor per `migrations-and-agent-audit` findings — any fs.writeFile/fs.readFile calls move to graph-node-driven persistence (graph node receives outputs, persists to project_artifacts via TA1's queries).",
    "apps/product-helper/lib/langchain/agents/architecture-recommendation-agent.ts — same adaptation. Verify it composes downstream of the 6 system-design agents in the LangGraph chain (this is the synthesizer / T6 keystone).",
    "Wave A ↔ Wave E contract pin spec: write apps/product-helper/lib/langchain/graphs/contracts/nfr-engine-contract-v1.ts — Zod envelope schemas for `GENERATE_nfr` (NFR slice of submodule-2-3-nfrs-constants.ts → nfrs[] field shape, derived from phase-6-requirements-table.ts) and `GENERATE_constants` (constants[] slice, derived from phase-8-constants-table.ts). Failure semantics: when an evaluation returns final_confidence < 0.90 AND no fallback rule matched → node emits `{ status: 'needs_user_input', computed_options: [...], math_trace: '...' }` and routes to lib/chat/system-question-bridge.ts (NOT a thrown error).",
    "apps/product-helper/__tests__/langchain/graphs/intake-graph.test.ts — 7 new GENERATE_* nodes invoke their agents; persist outputs to project_artifacts via the TA1 queries; honor the contract pin envelope on GENERATE_nfr / GENERATE_constants paths; failure path routes to chat-bridge mock without thrown error",
    "apps/product-helper/__tests__/langchain/agents/system-design/contract-pin.test.ts — fixture-based tests pinned to the Zod shape (not the implementation path) so v2.2 Wave E re-runs the same test with engine-first internals; both v2.1 (LLM-only) and v2.2 (engine-first) MUST pass"
  ],
  guardrails: [
    "HARD-DEP on `ta1-preflight-complete` tag.",
    "BLOCKING for `verifier`.",
    "Canonical graph path is `lib/langchain/graphs/intake-graph.ts` — DO NOT create `lib/langgraph/intake-graph.ts`. v2.1 critique iter-1 caught this as the most common path-claim error.",
    "DO NOT modify the system-design agents' core LLM logic — only adapt input/output to graph-node shape + remove fs side effects per the audit. Greenfield agent work is OUT OF SCOPE for v2.1 (D-V21.01 = wire EXISTING agents).",
    "Decision Matrix vs Decision Network coexistence (handoff Issue 4): two graph nodes coexist as siblings — `generate_decision_matrix` (existing, UNCHANGED) drives the FROZEN `decision-matrix-viewer.tsx` (Cornell weighted-scoring view) and writes project_artifacts.kind='decision_matrix_v1'; `generate_decision_network` (NEW, invokes decision-net-agent.ts) drives the new viewer that TA2 ships and writes kind='decision_network_v1'. Both run on every synthesis. DO NOT rename `generate_decision_matrix`.",
    "Fail-forward on >200 LOC fs-side-effects refactor (handoff Issue 5 — David ruling 2026-04-25 19:50 EDT, R-v2.1.A Option C): if the audit surfaces an agent requiring >200 LOC fs-side-effects refactor, ship a graph-node-adapter WRAPPER (NOT a refactor). Adapter pattern: graph-node receives the agent's existing fs-emit output via stdout capture + parses; persistence happens at the graph-node layer. JSDoc the adapter pattern. Append the deferred underlying refactor as a TODO in the agent file AND record in plans/post-v2.1-followups.md (for v2.2 day-0 pickup). Wave A does NOT block on the >200-LOC refactor decision — this is the explicit fail-forward semantic for R-v2.1.A Option C.",
    "EVERY GENERATE_* node MUST persist its output to project_artifacts via TA1's `upsertArtifactStatus` query — no fs.writeFile to disk in the runtime path.",
    "GENERATE_nfr + GENERATE_constants envelope: contract version is the canonical handshake. v2.2's Wave E producer fills the same envelope with engine-first internals; if v2.1 emits a different shape than the contract pin spec, the v2.2 re-edit is forced (and the version flag must bump to 'v2').",
    "Open-question failure path: when a node would otherwise throw on missing/low-confidence data, emit the `{ status: 'needs_user_input', ... }` shape and route via system-question-bridge.ts (built by `open-questions-emitter` agent). This is the failure semantics half of the contract pin.",
    "Test fixtures committed at apps/product-helper/__tests__/fixtures/intake-graph/ — at minimum: (a) one happy-path fixture (full intake → all 9 graph-node touches per disposition table — 7 NEW + 2 RE-WIRE — succeed and persist; synthesis emits), (b) one needs_user_input fixture (M2 NFR encounters low-confidence decision → contract-pin failure path fires → chat-bridge invoked), (c) one fs-side-effect regression fixture (asserts no fs.writeFile in runtime path).",
    "Commits: one per logical layer — agent-signature-adapter, contract-pin-spec, graph-node-additions, persistence-via-queries, tests."
  ]
})

Agent({
  name: "open-questions-emitter",
  subagent_type: "langchain-engineer",
  team: "c1v-runtime-wiring",
  goal: "Build lib/chat/system-question-bridge.ts (shared transport for v2.1 + v2.2 Wave E) — receives `open_question` events and pushes a `system`-authored pending-answer message into the project's chat thread within ≤ 2s of artifact emission per EC-V21-A.4. Extend M2 NFR agent + hoq-agent + fmea-residual-agent to emit `open_question` events via the bridge. Ledger emitted questions to extractedData.openQuestions.{requirements|qfdResolved|riskResolved} for TA2's archive page. Atlas runtime ingest fix: re-run scripts/ingest-kbs.ts against the corrected `9-stacks-atlas/` path (post-`migrations-and-agent-audit` path fix) and verify kb_chunks row-count > 0 per EC-V21-A.8.",
  inline_skills: ["langchain-patterns", "claude-api", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/chat/system-question-bridge.ts — single shared transport. Exports: `surfaceOpenQuestion({source: 'm2_nfr'|'m6_qfd'|'m8_residual'|'wave_e_engine', question: string, computed_options?: any[], math_trace?: string, project_id: string})`. Implementation: (a) insert chat-thread row with author='system', kind='pending_answer', body=question, options=computed_options, traceability=math_trace; (b) ledger to extractedData.openQuestions.<source-bucket> (read existing JSONB blob, append, write back atomically); (c) latency target ≤ 2s end-to-end (insert + ledger). Closes the loop on user reply: subscribe to chat-thread inserts where reply.parent_id = pending_answer.id and route reply.body back to the emitter callback.",
    "apps/product-helper/lib/chat/system-question-bridge.types.ts — Zod schemas for the OpenQuestion event shape; consumed by both Wave A (M2/M6/M8 emitters) and Wave E (surface-gap.ts producer in v2.2).",
    "apps/product-helper/lib/langchain/agents/system-design/hoq-agent.ts — extend to call `bridge.surfaceOpenQuestion({source: 'm6_qfd', ...})` whenever a relationship-matrix or target-value decision needs user input. Pattern: where today the agent emits a placeholder or skips, instead emit an OpenQuestion and proceed with the rest of the matrix (partial QFD is acceptable; missing rows surface in chat).",
    "apps/product-helper/lib/langchain/agents/system-design/fmea-residual-agent.ts — same pattern for M8.b residual decisions (e.g. severity rating ambiguous, mitigation owner unknown).",
    "apps/product-helper/lib/langchain/agents/system-design/nfr-resynth-agent.ts (verified path per handoff Issue 6) — extend per same pattern for M2 NFR decisions that hit ambiguity. Where today the agent emits a placeholder or skips on a low-confidence NFR/constant decision, instead emit `bridge.surfaceOpenQuestion({source: 'm2_nfr', question, computed_options, math_trace, project_id})` and proceed with the rest of the matrix; partial NFR/constant emissions are acceptable, missing rows surface in chat. Pattern: identical to hoq-agent extension above.",
    "scripts/ingest-kbs.ts re-run unblock: confirm path fix from `migrations-and-agent-audit` agent took effect; document the dedup-key logic in plans/v21-outputs/ta1/atlas-ingest-notes.md (the prior 0/3289 dedup no-op may indicate dedup-key bug — verify before re-run); run Phase B re-ingest against live Supabase with `set -a; source .env.local; set +a; pnpm tsx scripts/ingest-kbs.ts`; capture row counts before+after; assert `kb_chunks` table contains atlas-derived rows (row count > 0).",
    "apps/product-helper/__tests__/chat/system-question-bridge.test.ts — emit OpenQuestion → chat thread row inserted within 2s; ledger updated; user reply on the pending_answer row routes back to emitter callback; cross-tenant chat-thread inserts blocked by RLS",
    "apps/product-helper/__tests__/langchain/agents/open-questions-emission.test.ts — fixture-replay: M2/M6/M8 agents each fire OpenQuestion under specified ambiguity conditions; bridge ledger keys (extractedData.openQuestions.{requirements|qfdResolved|riskResolved}) populated correctly"
  ],
  guardrails: [
    "HARD-DEP on `ta1-preflight-complete` tag (atlas path fix is required for the re-ingest).",
    "BLOCKING for `verifier`.",
    "Bridge MUST be a single file/module — Wave-E's surface-gap.ts (v2.2) calls into this same bridge as a producer; do NOT duplicate the transport. The bridge IS the v2.1↔v2.2 surface contract.",
    "Latency target ≤ 2s — measure with synthetic test (insert + ledger round-trip); if slower, root-cause before merge (likely Supabase round-trip + JSONB read-modify-write).",
    "DO NOT modify the agents' core LLM emission logic beyond the OpenQuestion surface — just add the emit-on-ambiguity branches.",
    "Atlas re-ingest: if dedup logic still produces 0/N (no-op), DO NOT silently retry — capture the bug, surface to David, ship the path fix only and defer re-run as a follow-up. EC-V21-A.8 row count > 0 is the gate.",
    "Chat-thread insert must respect existing chat RLS policies — use the existing chat insert helper, NOT a raw SQL bypass.",
    "Commits: one per logical layer — bridge transport + types, M2 emitter, M6 emitter, M8 emitter, atlas re-ingest, tests."
  ]
})

Agent({
  name: "verifier",
  subagent_type: "qa-engineer",
  team: "c1v-runtime-wiring",
  goal: "Verify TA1 exit criteria from v2.1 Wave A: EC-V21-A.0 (preflight closed), EC-V21-A.4 (open-questions chat-first ≤ 2s), EC-V21-A.7 (CLAUDE.md path claims match disk), EC-V21-A.8 (kb_chunks atlas row count > 0), EC-V21-A.12 (inputs_hash stable across re-runs), EC-V21-A.13 (per-artifact synthesis_status ledgered), EC-V21-A.14 (signed URL RLS — table side; storage signing owned by TA3), and the Wave A ↔ Wave E contract pin envelope on GENERATE_nfr / GENERATE_constants.",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "apps/product-helper/scripts/verify-ta1.ts — TA1-specific verifier (CI-reusable). Asserts: (a) migrations apply in deterministic order, (b) lib/langchain/graphs/intake-graph.ts is the canonical path (grep returns 0 hits for lib/langgraph/intake-graph.ts), (c) project_artifacts table exists + RLS active, (d) chat-bridge insert latency p95 < 2s on 100 synthetic emissions, (e) inputs_hash deterministic across two identical-input runs, (f) GENERATE_nfr/GENERATE_constants outputs match contract-pin Zod envelope, (g) atlas kb_chunks row count > 0 (only if re-ingest landed; SKIP-with-fail-forward if blocked)",
    "plans/v21-outputs/ta1/verification-report.md — per-EC PASS/FAIL with evidence (commit SHA, log excerpt, query result)",
    "Integration test: spawn fixture project → trigger GENERATE_synthesis chain → assert all 9 graph-node touches per disposition table (7 NEW + 2 RE-WIRE) complete + persist to project_artifacts + (in failure-path fixture) OpenQuestion fires + chat thread receives row",
    "git tag `ta1-wave-a-complete` only if every EC green AND contract-pin envelope verified"
  ],
  guardrails: [
    "Depend on migrations-and-agent-audit + project-artifacts-table + langgraph-wirer + open-questions-emitter (block on names).",
    "Non-fix verifier: log failures, capture evidence, surface to coordinator. Do NOT auto-fix.",
    "EC-V21-A.8 (atlas row count > 0) carries SKIP-with-fail-forward semantic — if `open-questions-emitter` agent surfaced an atlas dedup bug rather than re-running, this EC marks SKIP with the bug-surface evidence; tag still lands if every other EC green. Bug carries forward to v2.2 day 0 inventory pass.",
    "Contract-pin envelope is non-negotiable: if GENERATE_nfr/GENERATE_constants emit a shape that doesn't match `nfr_engine_contract_version: 'v1'` schema, FAIL — v2.2 Wave E swap will break otherwise.",
    "Tag only on full green (modulo SKIP-with-fail-forward on EC-V21-A.8)."
  ]
})

Agent({
  name: "docs",
  subagent_type: "documentation-engineer",
  team: "c1v-runtime-wiring",
  goal: "Document TA1's surfaces for downstream teams + future contributors. Update apps/product-helper/CLAUDE.md with the new project_artifacts table + chat-bridge + GENERATE_* node graph. Write inline JSDoc on the Drizzle table + bridge transport contract. Author the Wave A ↔ Wave E handshake doc that v2.2 will consume verbatim.",
  inline_skills: ["code-quality"],
  deliverables: [
    "apps/product-helper/CLAUDE.md — Add `Project Artifacts Table` section under `Architecture`: shape, RLS contract, sidecar writer pattern, query helpers. Add `Open-Question Chat Bridge` section: bridge contract, M2/M6/M8 emitters, ledger keys (extractedData.openQuestions.{requirements|qfdResolved|riskResolved}), latency target. Update `System-Design Data Path` section: note that synthesis artifacts now live in project_artifacts (not the extractedData blob) post-Wave-A.",
    "apps/product-helper/lib/db/schema/project-artifacts.ts — JSDoc-document each column + RLS contract + the sidecar writer pattern (TA3 owns writes; TA1 owns reads). Cross-reference TA3's services/python-sidecar/orchestrator.py.",
    "apps/product-helper/lib/chat/system-question-bridge.ts — JSDoc the OpenQuestion event shape + the v2.1 (Wave A producers) ↔ v2.2 (Wave E surface-gap.ts producer) handshake.",
    "apps/product-helper/lib/langchain/graphs/intake-graph.ts — JSDoc each new GENERATE_* node with: which agent it invokes, its input/output Zod shape, its position in the chain, contract-pin envelope (for GENERATE_nfr/GENERATE_constants only).",
    "plans/v21-outputs/ta1/handshake-spec.md — Authoritative Wave A ↔ Wave E handshake doc consumed by v2.2 spawn prompts. Mirror the spec from c1v-MIT-Crawley-Cornell.v2.1.md §`Contract pin (Wave A ↔ Wave E handshake)` but expand each bullet to executable detail (Zod file paths, import names, version-flag bump rules, failure-path test fixtures). v2.2's Wave E spawn-prompts file will reference this doc instead of re-deriving.",
    "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_dev-runbooks/atlas-reingest-runbook.md (new) — operator runbook for the atlas re-ingest: env-var setup, path fix verification, dedup-bug check, expected row-count delta. Picked up by future maintainers if the v2.1 re-run hit SKIP-with-fail-forward."
  ],
  guardrails: [
    "Depend on verifier (block on `ta1-wave-a-complete` tag).",
    "CLAUDE.md edits require explicit David authorization per file-safety rule (memory: `feedback_no_scope_doubt.md`) — surface the proposed CLAUDE.md diff in plans/v21-outputs/ta1/claude-md-diff.md FIRST and wait for David's go-ahead before applying. Other doc surfaces (JSDoc, runbook, handshake-spec.md) ship without gating.",
    "DO NOT introduce new section headers in CLAUDE.md beyond the two named above (Project Artifacts Table, Open-Question Chat Bridge) — keep CLAUDE.md additions minimal.",
    "Handshake-spec.md is the v2.2 contract — write it as if you won't be there to clarify. Include actual import paths, actual Zod file refs, actual fixture file names.",
    "Single commit (or two if CLAUDE.md goes in a separate commit pending authorization): 'docs(ta1): runtime-wiring documentation + handshake spec'"
  ]
})
```

---

## TA2 — c1v-synthesis-ui (Wave A)

**Scope:** All 18 React components for the synthesis UX + nav-config rewrite + archive pages + the merged Architecture & Database section with alternative-picker + DBML approval gate. Reuses existing brand tokens (`app/theme.css` + `app/globals.css`: Firefly/Porcelain/Tangerine/Danube) + existing shadcn/ui primitives + existing layout patterns from `components/projects/sections/*.tsx`, `components/system-design/*.tsx`, `components/chat/*.tsx`, `components/diagrams/diagram-viewer.tsx` per EC-V21-A.11 (no Figma blocker, locked 2026-04-25 16:06 EDT). Per D-V21.17, NO canned exemplar — pre-synthesis state is empty-state CTA.

**Dependencies:** SOFT-depends on TA1's project_artifacts table shape (consumes via `@/lib/db/schema`) and chat-bridge ledger keys (`extractedData.openQuestions.{requirements|qfdResolved|riskResolved}`). Both are typed exports from TA1 — TA2's components import the types and consume; tests use TA2's own fixtures so TA2 can land in parallel with TA1's runtime work.

**Honors:** D-V21.03 (React shell + raw Mermaid), D-V21.11 (bundle ZIP UX), D-V21.15 (FMEA route promotion to nav), D-V21.17 (no canned exemplar).

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-synthesis-ui",
  agent_type: "tech-lead",
  description: "Build the user-facing synthesis story. 18 React components covering the 5-section synthesis viewer + sub-sections + provenance accordion + download dropdown + empty-state. Rewrite nav-config to add Recommendation/Open Questions/Data Flows/FMEA/Form-Function/Decision Network entries; absorb Infrastructure Mermaid into Tech Stack; merge Architecture Diagram + Database Schema into a single interactive Architecture & Database section with alternative-picker (renders different architectures from decision_network alternatives) + schema-approval-gate (DBML export). Promote N2 chart to first sub-tab in Interfaces. Reuse existing brand tokens + existing components per EC-V21-A.11 — extend, don't invent.",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.v2.1.md §End State (Left-rail nav after v2.1, Synthesis section UX, Open Questions UX, iter-3 API-spec fix UX) + §Wave A — Files added/edited (synthesis components and section renames) + §Decisions D-V21.03/.11/.15/.17",
    visual_style_locked: "EC-V21-A.11 (locked 2026-04-25 16:06 EDT): use current style + reuse existing components. Bond consumes existing brand tokens at app/theme.css + app/globals.css (Firefly/Porcelain/Tangerine/Danube); reuses existing shadcn/ui primitives + layout patterns from components/projects/sections/*.tsx, components/system-design/*.tsx, components/chat/*.tsx, components/diagrams/diagram-viewer.tsx. Extend, don't invent. Where a new surface needs novel composition, follow the closest existing analog. NO Figma blocker. NO new design tokens. NO new typography scale. David reviews per-pixel before merge.",
    ui_freeze_v2_carryover: "FROZEN list (5 files, byte-identical in v2.1): components/system-design/decision-matrix-viewer.tsx, components/system-design/ffbd-viewer.tsx, components/system-design/qfd-viewer.tsx, components/system-design/interfaces-viewer.tsx, components/diagrams/diagram-viewer.tsx. MODIFIABLE-IN-V21 (handoff Issue 8 — added by T10/T6 in v2 cycle, not at FROZEN bar yet): components/system-design/fmea-viewer.tsx. The 4 system-design page.tsx files + artifact-pipeline.tsx STAY frozen unless this team explicitly inherits an edit. v2.1 EXTENDS via new files; FROZEN components stay byte-identical.",
    typed_data_consumption: "Read project_artifacts via @/lib/db/queries.getLatestSynthesis(projectId) and @/lib/db/queries.getProjectArtifacts(projectId) — both shipped by TA1.project-artifacts-table. Read open-questions ledger via project.projectData.intakeState.extractedData.openQuestions.{requirements|qfdResolved|riskResolved} (TA1.open-questions-emitter populates).",
    coordination: {
      with_TA1: "Component fixtures use TA1's published Drizzle types — import from @/lib/db/schema/project-artifacts. Wait on TA1's commit `feat(db): project_artifacts table + RLS` before importing types live; until then, use a local mirror in __tests__/fixtures/.",
      with_TA3: "Download dropdown URLs come from TA3's /api/projects/[id]/artifacts/manifest extension — TA2 mocks the manifest response shape in tests; live integration lands in TA1+TA3 tests."
    }
  },
  commit_policy: "one-commit-per-component-or-tight-cluster; nav-config and FMEA-data-wire are separate commits; brand-token consumption verified via dark-mode parity test before each merge",
  wave: "A",
  blocks: ["wave-b-hardening"]
})
```

### Step 2: Spawn 7 teammates (parallel — all 5 producer agents independent; verifier blocks on producers; docs blocks on verifier)

```
Agent({
  name: "synthesis-viewer",
  subagent_type: "ui-ux-engineer",
  team: "c1v-synthesis-ui",
  goal: "Build the keystone RecommendationViewer + 6 sub-section components + provenance accordion + download dropdown + empty-state. Renders the same 5-section structure as .planning/runs/self-application/synthesis/architecture_recommendation.html but per-tenant from the project's own architecture_recommendation.v1.json. NO canned exemplar fall-back per D-V21.17.",
  inline_skills: ["react-best-practices", "nextjs-best-practices", "code-quality"],
  deliverables: [
    "apps/product-helper/app/(dashboard)/projects/[id]/synthesis/page.tsx — RecommendationViewer host. Server component reads via getLatestSynthesis(projectId); empty-state branch when no synthesis row; populated branch renders RecommendationViewer with the per-tenant data.",
    "apps/product-helper/components/synthesis/recommendation-viewer.tsx — 5-section orchestrator. Composes sub-section components in order: callout → rationale → references → risks → tradeoffs → figures, plus chrome (provenance accordion, download dropdown).",
    "apps/product-helper/components/synthesis/section-callout.tsx — Winning Alternative card. Orange-bordered (Tangerine #F18F01 brand token). Reads architecture_recommendation.winning_alternative.{id, label, summary} + 4-decision summary chips.",
    "apps/product-helper/components/synthesis/section-rationale.tsx — 4-paragraph derivation chain (D-01..D-04). Reads architecture_recommendation.derivation_chain[].",
    "apps/product-helper/components/synthesis/section-references-table.tsx — Module outputs table with clickable links to each module artifact + sibling viewer chips. Reads architecture_recommendation.referenced_modules[].",
    "apps/product-helper/components/synthesis/section-risks.tsx — Risk table from fmea_residual flagged subset. Reads architecture_recommendation.embedded_fmea_flags[]. Severity-classified rows (red/amber/green).",
    "apps/product-helper/components/synthesis/section-tradeoffs.tsx — Pareto frontier table (winner + 2 dominated alternatives). Reads architecture_recommendation.alternatives_summary[]. Highlight winner row.",
    "apps/product-helper/components/synthesis/section-figures.tsx — Mermaid blocks rendered via existing components/diagrams/diagram-viewer.tsx (FROZEN — import only, do NOT modify). Reads architecture_recommendation.embedded_artifacts[].content where format='mermaid'.",
    "apps/product-helper/components/synthesis/provenance-accordion.tsx — Show JSON / Mermaid source / Derivation chain disclosures (Dimension L). Reads architecture_recommendation.{inputs_hash, synthesized_at, next_steps[], full_payload}.",
    "apps/product-helper/components/synthesis/download-dropdown.tsx — Wired to /api/projects/[id]/artifacts/manifest (TA3 owns the route). Renders: JSON / HTML / PDF / PPTX / Bundle ZIP. Each entry → signed-URL download. Loading state during sidecar gen. Per-artifact retry button on synthesis_status='failed' (Wave B owns the retry handler; v2.1 v.1 of this dropdown shows the button as disabled with 'available in v2.1 Wave B' tooltip — OR ships disabled and TB1 enables. Pick one — recommend ship enabled with stub action that toasts 'Wave B'.).",
    "apps/product-helper/components/synthesis/empty-state.tsx — Pre-synthesis CTA to /synthesis per D-V21.17. NO canned data. **PER EC-V21-A.16 LOCK (2026-04-25 21:21 EDT, master plan critique iter-2 Issue 14):** the synthesis page's empty state composes the unified `<EmptySectionState>` shared component (built by `empty-section-state` agent below — see new agent assignment) for each of its 5 sub-sections (recommendation / decision-network / fmea / qfd / architecture-and-database). NO blurred-tile-grid pattern (the iter-1 'methodology pillar tiles' recommendation was REJECTED in iter-2 in favor of per-section consistency, informed by project=32 UI review showing populated pages are section-specific — matrix/cards/tables/diagrams). This component is a thin wrapper that maps the synthesis page's 5 sub-sections to the right `<EmptySectionState>` instances + an over-arching CTA banner. Methodology copy (1 line per sub-section) is generic — no exemplar values like 'AV.01' / 'Sonnet 4.5' / 'pgvector' leak.",
    "apps/product-helper/__tests__/synthesis/recommendation-viewer.test.tsx — 5-section render + downloads visible + empty state pre-synthesis (per D-V21.17, NO canned data renders) + dark-mode parity"
  ],
  guardrails: [
    "DO NOT modify components/diagrams/diagram-viewer.tsx — frozen per UI freeze.",
    "Brand tokens ONLY from app/theme.css + app/globals.css — NO new color hex values. Tangerine accent for callout border = use existing token.",
    "Empty state per D-V21.17 + EC-V21-A.16 (locked 2026-04-25 21:21 EDT): zero canned-c1v data leaks; pattern = unified per-section `<EmptySectionState>` (NOT a blurred 5-pillar tile grid — iter-2 reject). Fixture test asserts no 'AV.01' / 'Sonnet 4.5' / 'pgvector' / 'Vercel' strings present in the empty state output. Coordinate with new sibling agent `empty-section-state` below — that agent owns the shared component; this agent consumes it.",
    "Section components are layout-only — no data fetching inside (parent server component does it). Easier to test + clearer responsibility.",
    "Download dropdown stub-toast for retry is FINE for v2.1 — TB1 wires the live retry. Mark with `// TODO(TB1): wire retry endpoint` comment.",
    "Commits: one per sub-component or tight cluster (e.g. all 6 section-*.tsx in one commit if they're co-developed; recommend: one commit per component for clean review)."
  ]
})

Agent({
  name: "nav-and-pages",
  subagent_type: "ui-ux-engineer",
  team: "c1v-synthesis-ui",
  goal: "Rewrite components/project/nav-config.ts to match v2.1 §End State left-rail. Add page.tsx hosts for new routes. Wire FMEA route data source (orphaned route per P2 — page exists, data wire missing). Inline Infrastructure Mermaid into Tech Stack section per P4. Promote FMEA to nav per D-V21.15. Decision Network preserved as sibling to Decision Matrix — do NOT rename Decision Matrix (locked in critique iter-1).",
  inline_skills: ["react-best-practices", "nextjs-best-practices", "code-quality"],
  deliverables: [
    "apps/product-helper/components/project/nav-config.ts — extend with: Recommendation (top-level, NEW), Scope & Requirements > Data Flows (NEW), Scope & Requirements > Open Questions (NEW), System Architecture > Form-Function Map (NEW), System Architecture > Decision Network (NEW — sibling to existing Decision Matrix; DO NOT rename Decision Matrix), System Architecture > FMEA (PROMOTED to nav — page already exists at app/(dashboard)/projects/[id]/system-design/fmea/page.tsx). Backwards-compat: keep `Diagrams` route deprecated-not-deleted; `hasDiagrams` flag computation includes legacy projects per critique iter-1 EC-V21-A nav back-compat note. Absorb Infrastructure Mermaid into Tech Stack.",
    "apps/product-helper/app/(dashboard)/projects/[id]/synthesis/page.tsx — created by `synthesis-viewer` agent above; this agent ensures nav-config wires it.",
    "apps/product-helper/app/(dashboard)/projects/[id]/requirements/data-flows/page.tsx — DataFlows surface host. Server component reads project.projectData.intakeState.extractedData.dataFlows (M1 phase-2.5 data_flows.v1). Empty state if missing.",
    "apps/product-helper/app/(dashboard)/projects/[id]/requirements/open-questions/page.tsx — Archive surface (3-source aggregation per EC-V21-A.4 secondary). Reads project.projectData.intakeState.extractedData.openQuestions.{requirements|qfdResolved|riskResolved}. Renders read-only collapsible-accordion view with status pill (`open`/`resolved`/`deferred`), 'Resolved by' link, 'Jump to chat thread' deep link to the originating message in components/chat/.",
    "apps/product-helper/app/(dashboard)/projects/[id]/system-design/fmea/page.tsx — EDIT existing orphaned page to read from project_artifacts via getProjectArtifacts(projectId) for fmea_early + fmea_residual artifacts. Legible empty state pre-synthesis (NO exemplar fall-back per D-V21.17).",
    "apps/product-helper/components/projects/sections/tech-stack-section.tsx — EDIT to absorb Infrastructure Mermaid block (today rendered in components/projects/sections/architecture-section.tsx or in the Diagrams page). Render via the existing FROZEN components/diagrams/diagram-viewer.tsx — import only.",
    "apps/product-helper/components/project/__tests__/nav-config.test.tsx — back-compat: a project with legacy `extractedData.diagrams.infrastructure` content has `hasDiagrams=true` (Diagrams route still navigable); a project with no synthesis has the synthesis page accessible (empty state); FMEA nav entry only renders when fmea_early or fmea_residual artifact exists in project_artifacts (or always — your call; recommend 'always' per the 'show your work' pillar)"
  ],
  guardrails: [
    "DO NOT rename `Decision Matrix` to `Decision Network` — both coexist as siblings per critique iter-1 line 154-155 resolution.",
    "DO NOT delete the Diagrams route — deprecated-not-deleted; `hasDiagrams` flag back-compat is required.",
    "FMEA page edit MUST honor the empty-state-no-exemplar rule (D-V21.17).",
    "Tech Stack absorb of Infrastructure Mermaid must NOT break the existing Tech Stack section's other content — pure additive integration.",
    "Open-questions archive page deep-link to chat-thread message: use the existing chat URL convention; if no convention, surface as a query param `?messageId=<uuid>` and let TA1's chat-bridge author the URL when emitting.",
    "Commits: one per logical surface (nav-config + back-compat test in one commit; each new page.tsx in its own commit; FMEA data-wire as its own commit; Tech Stack absorb as its own commit)."
  ]
})

Agent({
  name: "architecture-and-database",
  subagent_type: "ui-ux-engineer",
  team: "c1v-synthesis-ui",
  goal: "Merge components/projects/sections/architecture-section.tsx + schema-section.tsx into a single architecture-and-database-section.tsx with two interactive sub-panes per EC-V21-A.6: (a) Architecture Diagram pane with alternative-picker (user selects which architecture to render from decision_network alternatives — typically AV.01/.02/.03 Pareto frontier); (b) Database Schema pane with read-only schema render + Approve CTA + DBML export. Approval persists per-project (extractedData.schema.approvedAt). Re-extraction prompts re-approval.",
  inline_skills: ["react-best-practices", "nextjs-best-practices", "code-quality"],
  deliverables: [
    "apps/product-helper/components/projects/sections/architecture-and-database-section.tsx — the merged section host. Two sub-panes (Architecture Diagram + Database Schema), each a child component below. Replaces architecture-section.tsx + schema-section.tsx (delete both after consumers migrate).",
    "apps/product-helper/components/projects/architecture-alternative-picker.tsx — pane (a). Reads project.projectData.intakeState.extractedData.decisionNetwork.alternatives[] / Pareto frontier. Renders a tab-strip or dropdown of AV.01/.02/.03; each selection drives the Mermaid render (delegated to existing FROZEN diagram-viewer.tsx — import only). Default = winning alternative (AV.01 in self-app; per-tenant winner in production).",
    "apps/product-helper/components/projects/schema-approval-gate.tsx — pane (b). Read-only schema render + Approve CTA. On click: transpile via lib/db/dbml-transpiler.ts (below), present DBML as copy-paste block + download .dbml file, persist extractedData.schema.approvedAt. If already approved, show 'Approved at <timestamp>' + 'Re-approve' button (which clears approvedAt and re-runs the gate).",
    "apps/product-helper/lib/db/dbml-transpiler.ts — TS transpiler from internal schema shape (Drizzle-style entities + relations) to DBML syntax. Dependency LOCKED (handoff Issue 9): `@dbml/core` (NPM, MIT-licensed) — use the programmatic API. Supported subset (locked): tables with primary keys + single-column foreign keys, composite PKs, enum types, unique indexes, optional FK relationships. NOT SUPPORTED in v2.1: views, stored procedures, partitions, complex indexes (functional, partial). Unsupported construct → emit DBML comment with source SQL inline. Round-trip tested against fixture schemas at apps/product-helper/lib/db/__tests__/fixtures/dbml/.",
    "apps/product-helper/components/projects/sections/__tests__/architecture-and-database-section.test.tsx — happy-path render with 3-alternative decisionNetwork; alternative-picker switches the rendered Mermaid; schema-approval-gate persists approvedAt to extractedData; DBML transpile output matches fixture",
    "apps/product-helper/lib/db/__tests__/dbml-transpiler.test.ts — round-trip tests: fixture schema in → DBML out → known-good DBML string; edge cases (composite PKs, optional FKs, enum types)",
    "Update apps/product-helper/components/project/nav-config.ts — Implementation > Architecture Diagram + Database Schema entries collapse into a single 'Architecture & Database' entry pointing at the merged section (coordinate with `nav-and-pages` agent — both touch nav-config.ts; resolve via name-based blocking — `nav-and-pages` lands its commit FIRST, then `architecture-and-database` rebases this single-line edit)"
  ],
  guardrails: [
    "DO NOT modify FROZEN diagram-viewer.tsx — import only.",
    "Coordinate with `nav-and-pages` on nav-config.ts edits — that agent owns the broader nav rewrite; this agent only adds the merged Architecture & Database entry.",
    "DBML transpile is OFFLINE / pure-TS — must NOT call any external API. If a fixture schema fails to round-trip, surface as a bug, do NOT silently emit invalid DBML.",
    "Approve CTA is per-project — persist via existing project-update server action; do NOT add a new endpoint.",
    "Re-approval flow: changing the underlying schema shape clears approvedAt; the section signals to the user 'Schema updated; re-approve to download new DBML'.",
    "Old architecture-section.tsx + schema-section.tsx deleted in the SAME commit that adds the merged section, so consumers never reach a broken intermediate state.",
    "Commits: one per file or tight cluster — merged section + alternative-picker (cluster), schema-approval-gate, dbml-transpiler + tests, nav-config single-line edit (rebased after nav-and-pages)."
  ]
})

Agent({
  name: "interfaces-and-archive-pages",
  subagent_type: "data-viz-engineer",
  team: "c1v-synthesis-ui",
  goal: "Promote N2 chart to first sub-tab in Interfaces page per EC-V21-A.5 + add 'Why incomplete?' disclosure for sequence diagram safety-net per P3. Build the open-questions-archive view component (consumed by app/(dashboard)/projects/[id]/requirements/open-questions/page.tsx from `nav-and-pages`). Build the data-flows-viewer component (consumed by data-flows page). Build the bundle ZIP UX entry on Connections page per D-V21.11.",
  inline_skills: ["react-best-practices", "code-quality"],
  deliverables: [
    "apps/product-helper/app/(dashboard)/projects/[id]/system-design/interfaces/page.tsx — EDIT to promote N2 chart to first sub-tab. Tab order: N2 Matrix → Sequence Diagrams → Interface Specs. N2 reads project_artifacts kind='n2_matrix_xlsx' OR extractedData.interfaces.n2Matrix (data path TBD by TA1; document inline). DO NOT modify the existing FROZEN components/system-design/interfaces-viewer.tsx — wrap it in the new tab structure or extract N2 rendering to a sibling component.",
    "apps/product-helper/components/system-design/n2-matrix-tab.tsx — new sibling component to FROZEN interfaces-viewer.tsx. Renders the N2 producer-consumer cross-grid from n2_matrix.v1.json. Cell-level interactions: click a cell to scroll to the relevant interface spec.",
    "apps/product-helper/components/system-design/sequence-diagram-disclosure.tsx — new sibling. 'Why incomplete?' disclosure chip on sequence diagrams that fail validation (the safety-net case at components/diagrams/diagram-viewer.tsx:88-110). Reads sequence-diagram-failure metadata if surfaced (else generic explainer).",
    "apps/product-helper/components/requirements/data-flows-viewer.tsx — surfaces M1 phase-2.5 data_flows.v1.json. Renders DE.NN entries as a bipartite-style or list-of-flows component. Style consistent with existing components/projects/sections/.",
    "apps/product-helper/components/requirements/open-questions-viewer.tsx — archive view component for the page from `nav-and-pages`. Read-only collapsible-accordion. 3 sources rolled up (requirements/qfdResolved/riskResolved) with status pill + 'Resolved by' link + 'Jump to chat thread' deep link.",
    "apps/product-helper/app/api/projects/[id]/export/bundle/route.ts — streamed ZIP via `archiver` package. Bundles JSON + HTML + PDF + PPTX + xlsx for every project_artifacts row + Mermaid sources. Returns presigned URL or stream. Mirrors system-design/kb-upgrade-v2/module-N/ layout per Dimension M.3.",
    "apps/product-helper/components/connections/bundle-zip-entry.tsx — Connections-page extension component per D-V21.11 — 'Show your work' pillar entry that links to /api/projects/[id]/export/bundle. Per-section dropdown (download specific module subset) is OPTIONAL for v2.1 (defer to TB1 if scope tight).",
    "apps/product-helper/__tests__/components/system-design/n2-matrix-tab.test.tsx — render + cell click → scroll to interface spec",
    "apps/product-helper/__tests__/components/requirements/open-questions-viewer.test.tsx — empty state + 3-source aggregation + status pill + deep-link"
  ],
  guardrails: [
    "DO NOT modify FROZEN components/system-design/interfaces-viewer.tsx + components/diagrams/diagram-viewer.tsx — wrap or extract.",
    "N2 promotion test: tab order is N2-first; default tab on initial load is N2 (NOT Sequence Diagrams).",
    "Sequence-diagram disclosure must NOT replace the safety-net — the safety-net at diagram-viewer.tsx:88-110 stays; disclosure is an additive UI hint.",
    "Bundle ZIP route: stream via `archiver`; downscale Mermaid PNGs to 1200×800 max per R-V21.07. If bundle size > 50MB, split or surface a warning.",
    "Open-questions-viewer 'Jump to chat thread' deep link: use the URL convention agreed with TA1 (`?messageId=<uuid>` or whatever TA1 picks).",
    "Per-section dropdown on Connections bundle entry: ship if time, defer to TB1 if not. Mark with TODO either way.",
    "Commits: one per logical surface (interfaces page tabs + N2 component + disclosure as one cluster; data-flows-viewer alone; open-questions-viewer alone; bundle ZIP route + Connections entry as one cluster)."
  ]
})

Agent({
  name: "empty-section-state",
  subagent_type: "ui-ux-engineer",
  team: "c1v-synthesis-ui",
  goal: "Build the shared `<EmptySectionState>` component + apply it across all 13 section components + 5 system-design viewer wrappers + the synthesis page's 5 sub-sections, per EC-V21-A.16 (locked 2026-04-25 21:21 EDT, master plan critique iter-2 Issue 14). Replaces the current inconsistent failure modes: 13 red `[INSUFFICIENT (found:X, all:Y)]` rows on `/system-design/interfaces` Sequence Diagrams tab, raw-Mermaid-source-as-text on `/backend/infrastructure` Activity Diagram card, bare entity-table dump on `/requirements/architecture` when no ER diagram exists yet. Honors D-V21.17 (no canned data — methodology copy is generic). FROZEN viewers (decision-matrix-viewer / ffbd-viewer / qfd-viewer / interfaces-viewer / diagram-viewer) honor this via WRAPPER component, NOT via internal edit.",
  inline_skills: ["react-best-practices", "code-quality"],
  deliverables: [
    "apps/product-helper/components/projects/sections/empty-section-state.tsx — shared component. Props: `{ sectionName: string; methodologyCopy: string; ctaLabel?: string; ctaHref?: string; icon?: ReactNode }`. Pattern (locked): section icon + '<sectionName> not generated yet' headline + 1-line methodology copy + `[Run Deep Synthesis →]` CTA (default href: `/projects/[id]/synthesis`). Uses brand tokens only (Firefly/Porcelain/Tangerine/Danube via app/theme.css + app/globals.css). Dark-mode parity. WCAG 2.1 AA: keyboard-accessible CTA, ARIA labels.",
    "apps/product-helper/components/projects/sections/empty-section-state.config.ts — methodology copy catalog. Object keyed on section name → 1-line copy. Examples: `{ qfd: 'Run Deep Synthesis to map customer needs to engineering characteristics with weighted correlations and a roof correlation matrix', fmea: 'Run Deep Synthesis to identify failure modes, score severity/occurrence/detection, and surface mitigations', decisionNetwork: 'Run Deep Synthesis to evaluate architecture alternatives across the Pareto frontier and surface the recommended winner', ... }` — copy is generic; NO exemplar values like 'AV.01' / 'Sonnet 4.5' / 'pgvector' / 'Vercel'.",
    "apps/product-helper/components/projects/sections/{problem-statement,goals-metrics,user-stories,system-overview,non-functional-requirements,architecture,schema,api-spec,infrastructure,coding-guidelines,...}-section.tsx — EDIT each to render `<EmptySectionState sectionName=... methodologyCopy={EMPTY_SECTION_COPY[...]} />` when underlying data is missing OR `synthesis_status !== 'ready'`. Replaces ad-hoc empty branches today. ~13 section files touched.",
    "apps/product-helper/components/system-design/{decision-matrix,ffbd,qfd,interfaces,diagram}-viewer-empty-wrapper.tsx — 5 NEW sibling wrapper components, ONE per FROZEN viewer. Pattern: `if (data missing) return <EmptySectionState ... />; else return <FrozenViewer .../>`. Page-level consumers swap from importing the FROZEN viewer directly to importing the wrapper. FROZEN viewers stay byte-identical (handoff Issue 8 + EC-V21-A.10).",
    "apps/product-helper/app/(dashboard)/projects/[id]/system-design/{ffbd,decision-matrix,qfd,interfaces,fmea}/page.tsx — EDIT each page.tsx to swap the direct FROZEN-viewer import for the new `*-viewer-empty-wrapper.tsx` import. Pure import path swap; no logic change in the page.",
    "Coordinate with `synthesis-viewer` agent: the synthesis page's `empty-state.tsx` composes 5 instances of `<EmptySectionState>` (one per sub-section: recommendation / decision-network / fmea / qfd / architecture-and-database). DO NOT duplicate the component there.",
    "apps/product-helper/components/projects/sections/__tests__/empty-section-state.test.tsx — render with sample props (light + dark mode), CTA href correct, axe-core WCAG 2.1 AA pass, regex sweep on rendered output asserts no canned-c1v strings.",
    "apps/product-helper/__tests__/empty-state-coverage.test.ts — meta-test: assert all 13 section components import `<EmptySectionState>`; assert 5 viewer-wrappers exist; assert synthesis page's empty-state composes 5 instances."
  ],
  guardrails: [
    "DO NOT modify the 5 FROZEN viewers (decision-matrix-viewer.tsx / ffbd-viewer.tsx / qfd-viewer.tsx / interfaces-viewer.tsx / diagram-viewer.tsx) — wrap via sibling component only.",
    "Methodology copy is GENERIC — no exemplar values like 'AV.01' / 'Sonnet 4.5' / 'pgvector' / 'Vercel' / 'LangGraph' leak. Verifier regex-sweeps for these.",
    "Brand tokens ONLY — same rule as `synthesis-viewer` agent.",
    "FROZEN convention is sacred: `git diff` of the 5 FROZEN files = empty by tag time.",
    "Per-pixel sign-off: David reviews the empty-state pattern across one populated + one empty page (light + dark) before merge; the cross-page consistency is part of EC-V21-A.16's spirit.",
    "Coordinate with `synthesis-viewer` (consumes the shared component) and `nav-and-pages` (FMEA page-level swap). Name-block on `synthesis-viewer` so the shared component lands first; `nav-and-pages` rebases the FMEA import path swap after this agent's commit lands.",
    "Commits: shared component + copy catalog (cluster), 13-section import sweep (cluster), 5 viewer wrappers + page imports (cluster), tests."
  ]
})

Agent({
  name: "verifier",
  subagent_type: "qa-engineer",
  team: "c1v-synthesis-ui",
  goal: "Verify TA2 exit criteria from v2.1 Wave A: EC-V21-A.3 (FMEA route surfaces in nav + reads from project_artifacts), EC-V21-A.5 (N2 promoted to first sub-tab), EC-V21-A.6 (Architecture & Database is interactive — alternative-picker + DBML approval gate), EC-V21-A.9 (Bundle ZIP downloads from Connections), EC-V21-A.10 (shadcn-styled + brand-token compliant + dark-mode parity), EC-V21-A.11 (visual approach uses current style + reuses components — no novel tokens, no Figma blocker), **EC-V21-A.16** (empty-state-as-teaching-surface — unified `<EmptySectionState>` adopted across all 13 section components + 5 system-design viewer wrappers + synthesis page sub-sections; zero canned-c1v string leaks; locked 2026-04-25 21:21 EDT per master-plan critique iter-2 Issue 14).",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "apps/product-helper/scripts/verify-ta2.ts — TA2-specific verifier. Asserts: (a) every new component imports brand tokens from app/theme.css or app/globals.css (NO inline hex values), (b) dark-mode parity test renders each component in light + dark, (c) no FROZEN file (decision-matrix-viewer, ffbd-viewer, qfd-viewer, interfaces-viewer, diagram-viewer) was modified, (d) nav-config back-compat: legacy `extractedData.diagrams.infrastructure` projects still navigable, (e) FMEA page reads from project_artifacts when present, empty-state otherwise, (f) D-V21.17 + EC-V21-A.16 empty-state: zero canned-c1v strings (regex sweep for 'AV.01', 'Sonnet 4.5', 'pgvector', 'Vercel'), (g) `<EmptySectionState>` adopted across all 13 section components in `components/projects/sections/` (grep import path), (h) `<EmptySectionState>` wrapper present for the 5 system-design viewers (FROZEN viewers honor via wrapper, NOT internal edit), (i) synthesis page's 5 sub-sections each render `<EmptySectionState>` pre-synthesis, (j) Bundle ZIP under 50MB on fixture project, (k) accessibility (axe-core sweep) on synthesis page + open-questions archive + a representative empty-state — WCAG 2.1 AA",
    "plans/v21-outputs/ta2/verification-report.md — per-EC PASS/FAIL with screenshot evidence (dark-mode parity, brand-token compliance) + axe-core report",
    "Visual regression: Playwright snapshot of synthesis page (populated + empty), Architecture & Database section, open-questions archive, interfaces N2 tab",
    "git tag `ta2-wave-a-complete` only if every EC green AND no FROZEN file modified AND axe-core WCAG 2.1 AA pass"
  ],
  guardrails: [
    "Depend on synthesis-viewer + nav-and-pages + architecture-and-database + interfaces-and-archive-pages + empty-section-state (block on names).",
    "Non-fix verifier.",
    "FROZEN-file modification = automatic FAIL on the 5-file list (decision-matrix-viewer, ffbd-viewer, qfd-viewer, interfaces-viewer, diagram-viewer). DO NOT include fmea-viewer.tsx in the auto-FAIL set — it's MODIFIABLE-IN-V21 per handoff Issue 8 (TA2.nav-and-pages edits its data wire). Run `git diff --name-only` against the 5-file FROZEN list before tag.",
    "Brand-token compliance (handoff Issue 10 — positive allowlist): run `rg -n '#[0-9A-Fa-f]{6}' --type ts --type tsx <diff-paths>`. ALLOWED hits: file ∈ {app/theme.css, app/globals.css}, OR enclosed in /* */ or // comment, OR in *.test.{ts,tsx} fixture string. FAIL on any hit outside the allowlist.",
    "axe-core: run via @axe-core/playwright on the populated synthesis page + open-questions archive at minimum. WCAG 2.1 AA.",
    "Tag only on full green."
  ]
})

Agent({
  name: "docs",
  subagent_type: "documentation-engineer",
  team: "c1v-synthesis-ui",
  goal: "Document TA2's component surfaces + brand-token usage convention + accessibility notes. Update apps/product-helper/CLAUDE.md `Deployed Features` section with the new synthesis routes + nav-config changes. Author a component-reuse cheatsheet for future contributors so the EC-V21-A.11 'extend, don't invent' rule survives v2.1.",
  inline_skills: ["code-quality"],
  deliverables: [
    "apps/product-helper/CLAUDE.md — Update `Deployed Features` section: new entry `Synthesis Viewer (v2.1 Wave A) — /projects/[id]/synthesis with 5-section RecommendationViewer + provenance accordion + download dropdown; data source: project_artifacts kind='recommendation_*'`. Update entry for `Requirements & Backend Section Viewers` to add `data-flows`, `open-questions` routes. Update `System-Design Viewers` entry to note FMEA promotion to nav.",
    "apps/product-helper/components/synthesis/README.md — Component family overview: composition rules (RecommendationViewer = orchestrator; section-* = layout-only, no fetch), prop contracts, brand-token list used, dark-mode considerations, fixture pattern for tests.",
    "apps/product-helper/components/projects/sections/architecture-and-database-section.tsx — top-of-file JSDoc covering: the merge rationale (P3 dedup), alternative-picker contract (reads decisionNetwork.alternatives[]), schema-approval-gate contract (extractedData.schema.approvedAt persistence), DBML transpile semantics.",
    "apps/product-helper/lib/db/dbml-transpiler.ts — JSDoc with input/output spec + supported subset of DBML syntax + limitations.",
    "apps/product-helper/.planning/dev-runbooks/component-reuse-cheatsheet.md (NEW) — codified EC-V21-A.11 'extend, don't invent' rule with concrete examples: 'For a new card-style surface, see components/projects/cards/*.tsx as the analog'; 'For a new tab-strip, see components/system-design/interfaces-viewer.tsx pattern'; 'Brand tokens are CSS variables — see app/theme.css'. Future contributors read this before adding components.",
    "Accessibility notes: per-component JSDoc lists keyboard interactions + ARIA labels + dark-mode contrast ratios verified."
  ],
  guardrails: [
    "Depend on verifier (block on `ta2-wave-a-complete` tag).",
    "CLAUDE.md edits require explicit David authorization (file-safety rule) — surface diff in plans/v21-outputs/ta2/claude-md-diff.md FIRST.",
    "Component-reuse cheatsheet is authored from scratch; reference EC-V21-A.11 verbatim as the source of authority.",
    "JSDoc is the primary surface — keep README.md files lean (overview + entry points only); JSDoc carries the contract details.",
    "Single commit per doc surface (CLAUDE.md edit pending authorization in its own commit; cheatsheet + README + JSDoc cluster as 'docs(ta2): synthesis-ui documentation')."
  ]
})
```

---

## TA3 — c1v-cloudrun-sidecar (Wave A)

**Scope:** Python sidecar for **per-artifact rendering only** per **D-V21.24** (locked 2026-04-25 19:50 EDT) — orchestrator.py + Dockerfile + Cloud Run config + `mmdc` Mermaid PNG pre-render dependency. **Vercel hosts the LangGraph orchestration (TA1's intake-graph.ts) and runs all LLM calls; Cloud Run sidecar receives `POST /run-render` with `{project_id, artifact_kind, agent_output_payload}` per-artifact and renders via canonical Python generators (`gen-arch-recommendation.py`, `gen-qfd.py`, `gen-fmea.py`, etc. under `scripts/artifact-generators/`).** Same generator code path produces every tenant project. weasyprint for PDF (D-V21.05) + python-pptx for PPTX (D-V21.06) + Supabase Storage signed URLs (D-V21.08). Three API routes: POST /synthesize (deducts 1000 credits per D-V21.10, kicks off the Vercel-side LangGraph asynchronously, returns 202 immediately — does NOT itself fire Cloud Run; the LangGraph's GENERATE_* nodes individually POST /run-render per artifact as their outputs complete), GET /synthesize/status (polls per-artifact synthesis_status from project_artifacts), /api/projects/[id]/artifacts/manifest extension (extends existing route with PDF/PPTX/Bundle URLs from project_artifacts). BullMQ deferred — Vercel async kick-off + per-artifact Cloud Run renders is the v2.1 transport.

**Dependencies:** SOFT-depends on TA1's project_artifacts table (writes synthesis_status from sidecar; queries from API routes). Coordinated via name-based blocking inside Wave A.

**Honors:** D-V21.02, D-V21.05, D-V21.06, D-V21.07, D-V21.08, D-V21.10, **D-V21.24** (Vercel ↔ Cloud Run boundary lock — sidecar is render-only), R-V21.02 (Mermaid PNG pre-render), R-V21.12 (cold-start warm-up).

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-cloudrun-sidecar",
  agent_type: "tech-lead",
  description: "Build the Python sidecar (per-artifact rendering only per D-V21.24 — Vercel hosts LangGraph + LLM calls; sidecar receives POST /run-render per artifact) + the Vercel trigger/poll routes. Run the canonical Python artifact generators (`gen-arch-recommendation.py`, `gen-qfd.py`, `gen-fmea.py`, etc.) that produced the c1v self-application — same code path produces every tenant project. weasyprint + python-pptx + mmdc + Supabase Storage signed URLs.",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.v2.1.md §Wave A — Files added (services/python-sidecar/*, app/api/projects/[id]/synthesize/*, /export/bundle, manifest extension) + §Decisions D-V21.02/.05/.06/.07/.08/.10/.24 (D-V21.24 = Vercel ↔ Cloud Run boundary lock; sidecar = render-only; LangGraph stays on Vercel)",
    canonical_python_generators: "scripts/artifact-generators/ — 13 Python generators shipped by T10 in v2 (9 migrated + 4 new Crawley). gen-arch-recommendation.py renders the html standalone + pdf + json-enriched; gen-qfd.py renders the HoQ xlsx; gen-fmea.py renders early/residual xlsx with stoplight. The sidecar invokes these generators directly.",
    pre_existing_warm_up_concern: "R-V21.12 Cloud Run cold-start exceeds 30s on first request — mitigate via 5-min warm-up cron + cold-start p95 < 15s acceptance criterion in EC-V21-A.2",
    coordination: {
      with_TA1: "Sidecar writes to project_artifacts via TA1's upsertArtifactStatus query — service-role key bypasses RLS for writes; reads stay on user-context. TA1's docs agent JSDocs the writer pattern; TA3 follows it.",
      with_TA2: "TA2's download-dropdown reads from /api/projects/[id]/artifacts/manifest — TA3 extends this route with the PDF/PPTX/Bundle URLs."
    }
  },
  commit_policy: "one-commit-per-agent-per-deliverable; Dockerfile + Cloud Run config in their own atomic commits; mmdc dependency added separately from the orchestrator code",
  wave: "A",
  blocks: ["wave-b-hardening"]
})
```

### Step 2: Spawn 4 teammates (parallel — verifier + docs block on producers)

```
Agent({
  name: "python-sidecar",
  subagent_type: "devops-engineer",
  team: "c1v-cloudrun-sidecar",
  goal: "Build services/python-sidecar/ — orchestrator.py (Cloud Run task entrypoint for per-artifact rendering ONLY per D-V21.24 — Vercel hosts LangGraph orchestration; sidecar receives `POST /run-render` with `{project_id, artifact_kind, agent_output_payload}` and renders via canonical Python generators). NO LangGraph orchestration on sidecar (handoff Issue 11 — locked by D-V21.24). Dockerfile installs weasyprint + python-pptx + mmdc + chromium-headless + the canonical Python generators from scripts/artifact-generators/. Cloud Run config (cpu/memory/timeouts/concurrency). Warm-up cron pings sidecar every 5 min to keep cold-start p95 < 15s per R-V21.12.",
  inline_skills: ["security-patterns", "code-quality"],
  deliverables: [
    "services/python-sidecar/orchestrator.py — Cloud Run entrypoint. POST /run-render (per D-V21.24): receives `{project_id, artifact_kind, agent_output_payload}`; renders via canonical Python generator (gen-arch-recommendation / gen-qfd / gen-fmea / etc.); writes per-artifact row to project_artifacts via service-role Supabase client (synthesis_status='pending' → 'ready' or 'failed' on completion). NO LangGraph orchestration — that lives on Vercel side per D-V21.24. Each generator wraps in try/except per Wave-B circuit-breaker pattern (write 'failed' with failure_reason).",
    "services/python-sidecar/run-single-artifact.py — Cloud Run task variant for per-artifact retry from the UI (no BullMQ — Cloud Run handles retry via Gen2 task semantics). Receives {project_id, artifact_kind}; re-runs the relevant generator; updates project_artifacts.",
    "services/python-sidecar/Dockerfile — base python:3.12-slim. Install: weasyprint + python-pptx + chromium-headless + npm + @mermaid-js/mermaid-cli (for `mmdc` Mermaid → PNG pre-render per D-V21.07 + R-V21.02 mitigation). Copy scripts/artifact-generators/ into /app/generators/. Set entrypoint to orchestrator.py.",
    "services/python-sidecar/scripts/render-mermaid.sh — `mmdc` invocation per diagram type; called from the sidecar before weasyprint hits raw `<div class='mermaid'>` (avoids R-V21.02 silent-PNG-loss).",
    "services/python-sidecar/cloud-run.yaml (or terraform) — Cloud Run service config: cpu=2, memory=4Gi, timeout=900s, max-instances=10, concurrency=1 (since the pipeline is per-tenant and bursty). IAM: invoker role for the Vercel service account.",
    "services/python-sidecar/warm-up.yaml (or scripts/warmup.ts) — Cloud Scheduler cron pings /healthz every 5 min to keep min-instance hot. Cold-start p95 target < 15s.",
    "services/python-sidecar/__tests__/orchestrator.test.py — fixture-replay (per D-V21.24 input shape): for each of the 7 artifact families, POST /run-render with a stub `{project_id, artifact_kind, agent_output_payload}` payload (NOT raw project intake — agent outputs are pre-computed by Vercel-side LangGraph in production); assert generator invokes correctly, project_artifacts row writes with synthesis_status='ready', sha256 + storage_path populated. Per-artifact failure path (broken generator) writes status='failed' + failure_reason without halting the test fixture for other artifact families.",
    "services/python-sidecar/.env.example — required env vars (SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY for sidecar-side LLM if applicable, etc.)",
    "infra/docker/python-sidecar.Dockerfile (or apps/web reference) — same as services/python-sidecar/Dockerfile; pick one canonical home (recommend services/python-sidecar/Dockerfile)"
  ],
  guardrails: [
    "DO NOT modify the canonical scripts/artifact-generators/ — Dockerfile copies them in; sidecar invokes; if a generator needs a fix, that's a separate v2.1 follow-up, not in scope.",
    "Service-role key is sidecar-only — NEVER expose to Vercel client-side or to any v2.1 React component. Reads from secret manager / Cloud Run secret.",
    "weasyprint on raw Mermaid → silent PNG loss is R-V21.02. The render-mermaid.sh pre-render step is REQUIRED — verifier asserts every PDF render included pre-rendered PNGs (no raw `<div class='mermaid'>` in the input HTML).",
    "Cold-start p95 < 15s per EC-V21-A.2 — verify with a synthetic 100-request burst after a 30-min idle. If > 15s, increase min-instance from 0 to 1 (cost: $3/mo).",
    "Per-artifact try/except in orchestrator: any single artifact failure writes 'failed' to project_artifacts row, captures failure_reason; pipeline does NOT halt on single-artifact failure — partial-success is the contract that TA2's per-artifact retry button consumes.",
    "Commits: one per logical layer — orchestrator entrypoint, Dockerfile, Cloud Run config, warm-up cron, single-artifact retry variant, tests."
  ]
})

Agent({
  name: "synthesis-api-routes",
  subagent_type: "backend-architect",
  team: "c1v-cloudrun-sidecar",
  goal: "Build the Vercel-side API routes that kick off the Vercel-side LangGraph + poll project_artifacts + extend the existing manifest endpoint. Per **D-V21.24**: POST /api/projects/[id]/synthesize deducts 1000 credits (D-V21.10), pre-creates 'pending' rows in project_artifacts for the 7 known artifact kinds, and kicks off the Vercel-side LangGraph (TA1's intake-graph.ts) asynchronously — does NOT itself POST anything to Cloud Run. The LangGraph's GENERATE_* nodes are responsible for firing `POST /run-render` per artifact as their outputs complete (TA1 owns that integration). Returns 202 with status_url. GET /api/projects/[id]/synthesize/status returns per-artifact synthesis_status from project_artifacts. /api/projects/[id]/artifacts/manifest extends to include PDF + PPTX + Bundle ZIP signed URLs.",
  inline_skills: ["api-design", "security-patterns", "code-quality"],
  deliverables: [
    "apps/product-helper/app/api/projects/[id]/synthesize/route.ts — POST handler. Pre-checks: user owns project (auth middleware); user has ≥ 1000 credits (calls existing checkAndDeductCredits per credit-system pattern in CLAUDE.md `Credit System`); free-tier hard-cap pre-stub (TA3 ships log_only default per Issue 12+16 lock below); pre-creates 'pending' rows in project_artifacts for the 7 known artifact kinds (idempotent on duplicate POST). **Kicks off the Vercel-side LangGraph asynchronously per D-V21.24** — does NOT POST to Cloud Run. Mechanism: invoke the intake-graph (TA1's wired graph) via a fire-and-forget pattern (Vercel `waitUntil()` for short pipelines, or push to a Vercel-compatible async queue/QStash if intake exceeds Vercel function ceiling — coordinator-time decision; TA1's langgraph-wirer + TA3 align on the dispatch mechanism before merge). LangGraph's GENERATE_* nodes individually fire `POST /run-render` to Cloud Run sidecar with `{project_id, artifact_kind, agent_output_payload}` (TA1 owns the per-node integration; TA3 owns sidecar invoker IAM via Google service account). Returns 202 with {synthesis_id, expected_artifacts, status_url}.",
    "apps/product-helper/app/api/projects/[id]/synthesize/status/route.ts — GET handler. Reads project_artifacts via getProjectArtifacts(projectId); returns per-artifact synthesis_status + signed_url (when ready) + failure_reason (when failed). UI polls every 3s until all artifacts ready or terminal-failure.",
    "apps/product-helper/app/api/projects/[id]/artifacts/manifest/route.ts — EDIT existing route. Extend response to include PDF, PPTX, Bundle ZIP URLs (today returns JSON + HTML + Mermaid only). Each URL = signed Supabase Storage URL with 30-day TTL.",
    "apps/product-helper/lib/storage/supabase-storage.ts (NEW or extend existing) — helper: getSignedUrl(storage_path, ttl_seconds) using Supabase service-role client. Caches signed URLs in-memory per request to avoid re-signing on repeated reads.",
    "apps/product-helper/__tests__/api/synthesize-status.test.ts — Cloud Run trigger + status-polling lifecycle (mocked): POST → 202 + pending rows; GET → pending statuses; mock sidecar callback updates rows; GET again → ready statuses with signed URLs",
    "apps/product-helper/__tests__/api/manifest.test.ts — manifest returns PDF/PPTX URLs from project_artifacts; cross-tenant manifest call returns 403 (RLS verified)",
    "apps/product-helper/__tests__/api/synthesize-credits.test.ts — POST without credits returns 402 with upgrade prompt; POST with credits deducts 1000 and returns 202; rate-limit / duplicate-POST behavior is idempotent"
  ],
  guardrails: [
    "1000-credit deduction MUST go through existing checkAndDeductCredits — DO NOT introduce a parallel path. Race-safe per CLAUDE.md credit-system pattern.",
    "Cloud Run invoker IAM is service-account based — NEVER use a static API key.",
    "Signed URL TTL: 30 days per D-V21.08; cache in-memory per request to avoid Supabase round-trips on repeated reads.",
    "Idempotent POST /synthesize: if project_artifacts already has 'pending' rows for the same project_id within the last N minutes, return 202 with the existing synthesis_id rather than re-firing Cloud Run.",
    "Free-tier 1/mo cap (D-V21.10 + EC-V21-B.3) — handoff Issue 12+16 LOCK: env var `SYNTHESIS_FREE_TIER_GATE = 'log_only' | 'enabled' | 'disabled'`. TA3 Wave A pre-stubs `checkSynthesisAllowance` import + invocation in /synthesize route. Stub returns `{allowed: true}` if `SYNTHESIS_FREE_TIER_GATE !== 'enabled'`; logs the would-be 402 to Sentry when `SYNTHESIS_FREE_TIER_GATE === 'log_only'` (default in TA3). TB1 replaces the stub with the real DB-backed implementation and flips the default to `'enabled'`.",
    "Status route should NOT do heavy work — pure DB query + response shape. Latency target < 100ms p95.",
    "Commits: one per route or tight cluster — synthesize POST, status GET, manifest extension, storage helper, tests."
  ]
})

Agent({
  name: "verifier",
  subagent_type: "qa-engineer",
  team: "c1v-cloudrun-sidecar",
  goal: "Verify TA3 exit criteria from v2.1 Wave A: EC-V21-A.2 (PDF + PPTX + Bundle ZIP gen works per-tenant for all 7 artifact families; rendered via Cloud Run Python sidecar; cold-start p95 < 15s), EC-V21-A.13 (per-artifact synthesis_status / synthesized_at / sha256 / format ledgered correctly), EC-V21-A.14 (Storage paths return signed URLs; RLS prevents cross-tenant access; TTL 30 days).",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "apps/product-helper/scripts/verify-ta3.ts — TA3-specific verifier. Asserts: (a) Cloud Run service is deployed and healthcheck returns 200, (b) cold-start p95 measured via 100-request burst after 30-min idle, (c) all 7 artifact families generate end-to-end on a fixture project (fixture project = stub-project.json from v2's build-all-headless), (d) each generated artifact has synthesis_status='ready' + synthesized_at + sha256 + format populated, (e) signed URLs return 200 within 30 days, (f) cross-tenant signed-URL request returns 403, (g) PDF render contains pre-rendered Mermaid PNGs (no raw `<div class='mermaid'>` in source — grep PDF text-extracted source).",
    "plans/v21-outputs/ta3/verification-report.md — per-EC PASS/FAIL with cold-start latency histogram + sample artifacts checked into plans/v21-outputs/ta3/sample-artifacts/ for visual review",
    "Integration test: fire POST /synthesize on a fixture project → poll /status → verify 7 artifacts ready within target time → download PDF + PPTX → verify content fidelity (PDF page count, PPTX slide count, xlsx sheet names)",
    "git tag `ta3-wave-a-complete` only if every EC green AND cold-start p95 < 15s AND no raw Mermaid leaks into PDF"
  ],
  guardrails: [
    "Depend on python-sidecar + synthesis-api-routes (block on names).",
    "Non-fix verifier.",
    "Cold-start measurement: 100-request burst with 30-min preceding idle — record p95 separately from p50/p99. If > 15s, FAIL and recommend min-instance=1 trade-off.",
    "Mermaid PNG check: extract PDF source text + grep for `<div class='mermaid'>` — any hit = FAIL (R-V21.02 mitigation broken).",
    "Tag only on full green."
  ]
})

Agent({
  name: "docs",
  subagent_type: "documentation-engineer",
  team: "c1v-cloudrun-sidecar",
  goal: "Document TA3's sidecar deployment + API routes + manifest contract. Write the operator runbook for the sidecar (deploy / rollback / debug). Update apps/product-helper/CLAUDE.md with the new API endpoints + sidecar reference. Author the manifest-contract spec that TA2's download-dropdown + future external integrations consume.",
  inline_skills: ["code-quality"],
  deliverables: [
    "services/python-sidecar/README.md — operator runbook: prerequisites (gcloud, Cloud Run, Supabase service-role key); deploy commands; rollback procedure; debug guide (how to reproduce a per-tenant rendering failure locally with the same Dockerfile); env-var reference; secret-management guide.",
    "services/python-sidecar/orchestrator.py — top-of-file docstring covering: the LangGraph-Vercel-vs-sidecar boundary (Vercel does graph orchestration; sidecar does rendering only — or whichever the python-sidecar agent picked); the project_artifacts writer contract (status state machine pending→ready/failed); failure semantics (per-artifact try/except, no whole-pipeline halt); the canonical generator invocation pattern.",
    "apps/product-helper/CLAUDE.md — Update `Deployed Features` with `Per-Tenant Synthesis Pipeline (v2.1 Wave A) — POST /api/projects/[id]/synthesize triggers Cloud Run sidecar; GET /api/projects/[id]/synthesize/status polls per-artifact status; /api/projects/[id]/artifacts/manifest returns signed URLs for JSON/HTML/PDF/PPTX/Bundle ZIP. Cost: 1000 credits/synthesis. Sidecar at services/python-sidecar/.`",
    "apps/product-helper/app/api/projects/[id]/synthesize/route.ts — top-of-file JSDoc with idempotency contract, credit-deduction rationale, sidecar trigger semantics, status_url contract.",
    "apps/product-helper/app/api/projects/[id]/synthesize/status/route.ts — JSDoc with the response shape + polling cadence recommendation (3s) + terminal-state semantics.",
    "apps/product-helper/app/api/projects/[id]/artifacts/manifest/route.ts — JSDoc on the manifest response shape — pin the contract version (`manifest_contract_version: 'v1'`, aligned with `nfr_engine_contract_version: 'v1'` envelope convention) so external integrations (MCP server, future API consumers) can detect breakage. Per handoff Issue 13.",
    "plans/v21-outputs/ta3/manifest-contract.md — canonical manifest contract spec for external consumers (MCP server, IDE integrations, future API clients). Versioned at v1. Document version-bump rule: MAJOR bump (v1 → v2) on shape break (field removal, type change); MINOR bump (v1 → v1.1) on additive fields. Pinned to TA2's download-dropdown consumption."
  ],
  guardrails: [
    "Depend on verifier (block on `ta3-wave-a-complete` tag).",
    "CLAUDE.md edits require explicit David authorization (file-safety rule).",
    "README.md operator runbook: write for someone who has NEVER deployed this sidecar. Include exact commands, expected outputs, common errors.",
    "manifest-contract.md is the external surface — do NOT under-document. Include example response, field semantics, version-bump rules.",
    "Single commit per doc surface (CLAUDE.md edit pending authorization in its own commit)."
  ]
})
```

---

## TB1 — c1v-hardening (Wave B)

**Scope:** Make per-tenant gen reliable + observable + scalable per v2.1 Wave B. Cache (`inputs_hash` cache hit > 30%), lazy-gen (defer 4-of-7 artifacts to first viewer hit), tier gating (Free=1/mo, Plus∞ — product-shape, not cost-control), circuit breaker (30s timeout → per-artifact retry CTA, NO canned fall-back), Sentry observability (latency p95, token cost/day, failure rate per agent — instrumented for visibility, NOT for ship-blocking). **Cost is NOT a v2.1 ship-blocker** per David 2026-04-25 21:09 EDT: "we are moving forward regardless of cost." Cache + lazy-gen ship for performance + scale; observability ships for debuggability; tier gating ships for product shape.

**Dependencies:** HARD-DEP on `ta1-wave-a-complete` + `ta2-wave-a-complete` + `ta3-wave-a-complete` (Wave-A gate). TD1's `td1-wave-d-complete` is NOT a TB1 gate — Wave D ships independently.

**Honors:** D-V21.10 (credit gating), ~~R-V21.05~~ (declassified 2026-04-25 21:09 EDT — cost no longer a blocker), R-V21.11 (UX cliff via lazy-gen), R-V21.12 (cold-start), EC-V21-B.1-.5 (B.6 reframed to instrumentation-only).

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-hardening",
  agent_type: "tech-lead",
  description: "Harden the v2.1 Wave-A per-tenant synthesis pipeline. Cache + lazy-gen + tier gating + circuit breaker + Sentry — for reliability, scale, and observability. NOT for cost control (cost-as-blocker DECLASSIFIED 2026-04-25 21:09 EDT per David: 'we are moving forward regardless of cost'). Per-artifact retry on sidecar timeout (no canned fall-back).",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.v2.1.md §Wave B — Hardening + observability (cost-as-blocker DECLASSIFIED 2026-04-25 21:09 EDT per David) + §Decisions D-V21.10 + §Risks R-V21.11/.12 (R-V21.05 declassified) + §Exit Criteria EC-V21-B.1-.5 (B.6 reframed to instrumentation-only)",
    wave_a_artifacts_to_consume: [
      "apps/product-helper/lib/db/schema/project-artifacts.ts (TA1) — cache lookup keyed on inputs_hash",
      "apps/product-helper/lib/langchain/graphs/intake-graph.ts (TA1) — gate GENERATE_* nodes behind cache + tier check",
      "services/python-sidecar/orchestrator.py (TA3) — wrap each generator in try/except for circuit-breaker semantics",
      "apps/product-helper/app/api/projects/[id]/synthesize/route.ts (TA3) — pre-check tier + credits"
    ],
    coordination: {
      gate_on: "ta1-wave-a-complete + ta2-wave-a-complete + ta3-wave-a-complete (Wave-A gate)",
      not_gating: "td1-wave-d-complete (independent)"
    }
  },
  commit_policy: "one-commit-per-agent-per-deliverable; cache + lazy-gen as separate commits; tier-gating + circuit-breaker as separate commits; Sentry instrumentation as a single commit per agent (6 v2 agents instrumented)",
  wave: "B",
  blocks: []
})
```

### Step 2: Spawn 5 teammates (parallel)

```
Agent({
  name: "cache-and-lazy-gen",
  subagent_type: "cache-engineer",
  team: "c1v-hardening",
  goal: "Build inputs_hash cache (skip regen when hash matches a prior project) + lazy-gen (defer 4-of-7 artifacts to first viewer hit instead of post-intake). Per EC-V21-B.1: cache hit-rate > 30% on synthetic load test (10 projects × 5 re-runs). Per EC-V21-B.2: lazy-gen reduces post-intake p95 latency by ≥ 50% on artifacts not viewed in first session.",
  inline_skills: ["database-patterns", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/cache/synthesis-cache.ts — consume the EXISTING `inputsHash()` helper (handoff Issue 15 — already shipped in v2 at lib/langchain/agents/architecture-recommendation-agent.ts:174 + :605, lib/langchain/agents/system-design/synthesis-agent.ts:391+:420; Zod regex validates `^[0-9a-f]{64}$/u` at lib/langchain/schemas/synthesis/architecture-recommendation.ts:745). DO NOT rebuild the hash logic. Implementation: (1) compute new project's inputs_hash via existing `inputsHash(mods)` helper (sha256 of canonical intake payload + upstream module shas); (2) `SELECT * FROM project_artifacts WHERE inputs_hash = $1 AND synthesis_status = 'ready' LIMIT 1`; (3) on hit: COPY cached storage_path into new project's row (same blob, new project_id) — no blob duplication; mark synthesis_status='ready'; (4) on miss: fall through to normal generation. NO duplicate storage cost on cache hit.",
    "apps/product-helper/lib/jobs/lazy-gen.ts — defer artifact generation. Configurable per artifact: SYNTHESIS_LAZY_MAP={'recommendation_pdf': 'on_view', 'recommendation_pptx': 'on_view', 'fmea_residual_xlsx': 'on_view', 'hoq_xlsx': 'on_view', 'recommendation_html': 'eager', 'recommendation_json': 'eager', 'fmea_early_xlsx': 'eager'}. Eager artifacts gen post-intake; on_view artifacts gen on first /api/projects/[id]/artifacts/[kind] hit (TA3 status route extends to trigger gen on demand).",
    "apps/product-helper/lib/langchain/graphs/intake-graph.ts — EDIT to gate GENERATE_* nodes behind synthesis-cache lookup. Cache hit → write project_artifacts rows pointing at cached blobs + skip downstream generators.",
    "apps/product-helper/__tests__/cache/synthesis-cache.test.ts — cache hit + miss paths; 30%+ hit-rate on 10×5 synthetic load test",
    "apps/product-helper/__tests__/jobs/lazy-gen.test.ts — eager artifacts gen post-intake; on_view artifacts gen on first hit; 50%+ post-intake latency drop on the deferred subset"
  ],
  guardrails: [
    "HARD-DEP on `ta1-wave-a-complete` + `ta3-wave-a-complete`.",
    "Cache hit must NOT produce a stale result — inputs_hash includes intake payload + agent versions; bumping any agent version invalidates cache.",
    "Lazy-gen on_view path: TA3's /api/projects/[id]/artifacts/[kind] route extends to fire sidecar single-artifact retry when project_artifacts.synthesis_status='deferred' (new state). TA3 owns the route extension; TB1 specifies the contract.",
    "DO NOT cache PII or tenant-specific identifiers in inputs_hash — hash should be content-addressed on the canonical intake shape, not user identifiers.",
    "EC-V21-B.2 wording precision: 50% reduction is on the DEFERRED SUBSET (4-of-7 artifacts not viewed in first session), not the overall p95. Verifier asserts the precise metric.",
    "Commits: synthesis-cache + cache-keyed flow + lazy-gen + intake-graph integration + tests."
  ]
})

Agent({
  name: "tier-and-circuit-breaker",
  subagent_type: "backend-architect",
  team: "c1v-hardening",
  goal: "Build synthesis-tier gating (Free=1 synthesis/mo, Plus=unlimited per D-V21.10/EC-V21-B.3) + circuit-breaker (30s sidecar timeout → graceful degradation per EC-V21-B.4: per-artifact retry CTA, NO canned fall-back). Hook the per-artifact retry endpoint TA3's `python-sidecar` agent already scaffolded.",
  inline_skills: ["api-design", "security-patterns", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/billing/synthesis-tier.ts — REAL DB-backed `checkSynthesisAllowance(teamId): { allowed: boolean, reason?: 'free_tier_exhausted'|'no_credits', remaining_this_month?: number, plan_name }` (handoff Issue 12+16 — replaces TA3's Wave-A pre-stub). Reads existing team plan from DB; counts project_artifacts rows with kind LIKE 'recommendation_%' AND created_at >= start-of-month for the team. Flip env var default `SYNTHESIS_FREE_TIER_GATE='enabled'` as part of `tb1-wave-b-complete` tag commit. Document in apps/product-helper/.env.example.",
    "apps/product-helper/app/api/projects/[id]/synthesize/route.ts — EDIT (TA3 owns; TB1 extends) to call checkSynthesisAllowance BEFORE checkAndDeductCredits. 402 with upgrade prompt on free-tier exhaustion.",
    "apps/product-helper/lib/jobs/circuit-breaker.ts — wraps each sidecar invocation. 30s timeout per generator; on timeout/failure, write project_artifacts.synthesis_status='failed' + failure_reason; UI shows per-artifact retry CTA (TA2's download-dropdown stub from Wave A becomes live here).",
    "apps/product-helper/app/api/projects/[id]/artifacts/[kind]/retry/route.ts — POST handler. Pre-check: user owns project + artifact is in 'failed' state. Fires Cloud Run single-artifact retry (TA3's run-single-artifact.py task). Returns 202.",
    "apps/product-helper/components/synthesis/download-dropdown.tsx — EDIT (TA2 owns; TB1 extends) — wire the per-artifact retry CTA to the new endpoint. Replace the v2.1-Wave-A stub-toast with live action.",
    "apps/product-helper/__tests__/billing/synthesis-tier.test.ts — Free hard-cap, Plus unlimited, edge cases (start-of-month boundary, plan upgrade mid-month)",
    "apps/product-helper/__tests__/jobs/circuit-breaker.test.ts — 30s timeout fires; per-artifact failure does not halt other artifacts; retry endpoint resumes per-artifact"
  ],
  guardrails: [
    "HARD-DEP on `ta1-wave-a-complete` + `ta2-wave-a-complete` + `ta3-wave-a-complete`.",
    "Free hard-cap is enforced server-side in /synthesize route — UI may pre-warn, but the gate lives on the server.",
    "Circuit-breaker MUST NOT fall back to canned data per D-V21.17 — 'failed' is the right state; retry button is the right UX.",
    "Per-artifact retry endpoint: idempotent (multiple POSTs while in 'pending' don't re-fire the sidecar).",
    "Coordinate retry-CTA wire-up with TA2's `synthesis-viewer` agent — TA2's download-dropdown left a TODO comment; TB1 closes it.",
    "Commits: tier helper + tier integration in /synthesize + circuit-breaker + retry route + download-dropdown wiring + tests."
  ]
})

Agent({
  name: "observability",
  subagent_type: "observability-engineer",
  team: "c1v-hardening",
  goal: "Sentry instrumentation for the 6 v2 agents (decision-net, form-function, hoq, fmea-early, fmea-residual, interface-specs) + the synthesizer. Per EC-V21-B.5: latency p95, token cost/day, failure rate live in Sentry dashboard. Per EC-V21-B.6 (reframed 2026-04-25 21:09 EDT): cost telemetry instrumented + dashboard live for visibility — NOT a ship-blocker (cost-as-blocker declassified per David: 'we are moving forward regardless of cost'). Token-cost tracking continues for debuggability + future v2.2 lever; no $/mo gate.",
  inline_skills: ["code-quality"],
  deliverables: [
    "apps/product-helper/lib/observability/synthesis-metrics.ts — Sentry + structured-log instrumentation: per-agent counters (latency p50/p95/p99, prompt_tokens, completion_tokens, cost_usd, success/failure), per-route counters (synthesize POST count, status GET count, manifest GET count), system metrics (Cloud Run cold-starts, cache hit rate, deferred artifacts gen-on-view count).",
    "apps/product-helper/lib/langchain/agents/system-design/*-agent.ts — EDIT each (decision-net, form-function, hoq, fmea-early, fmea-residual, interface-specs) + architecture-recommendation-agent.ts to wrap LLM calls in synthesis-metrics — capture model, prompt_tokens, completion_tokens, cost_usd, latency.",
    "apps/product-helper/lib/langchain/graphs/intake-graph.ts — EDIT to emit per-node start/end + cache_hit/miss events to synthesis-metrics.",
    "Sentry dashboards (config-as-code or YAML in plans/v21-outputs/tb1/sentry-dashboards/): one panel per agent (latency p95, daily cost, failure rate) + a top-line cost telemetry dashboard (monthly burn — informational, no budget gate).",
    "apps/product-helper/__tests__/observability/synthesis-metrics.test.ts — instrumentation fires on every agent invocation; counters increment correctly; Sentry transport is mocked (no real Sentry traffic in tests)",
    "plans/v21-outputs/tb1/cost-telemetry-runbook.md — operator runbook: where to find the cost dashboard, how to drill into a per-agent token spend, how to tie cost spikes back to specific failing agents. NO alert thresholds in v2.1 (cost-as-blocker declassified per David); future v2.2 may add alerts when the heuristic-engine cost lever lands."
  ],
  guardrails: [
    "HARD-DEP on `ta1-wave-a-complete` (intake-graph + agents must exist).",
    "DO NOT instrument the FROZEN UI components — only the LangGraph + agents + API routes.",
    "Cost capture: token usage from each LLM call (Anthropic SDK provides usage block); convert to USD via per-model rate table; aggregate per agent per day in Sentry.",
    "Sentry sampling: 100% on errors; 10% sampling on success (cost mgmt for Sentry itself).",
    "Cost telemetry runbook is INFORMATIONAL ONLY — NO alert thresholds in v2.1 (cost-as-blocker DECLASSIFIED 2026-04-25 21:09 EDT per David: 'we are moving forward regardless of cost'). The runbook documents where to find the cost dashboard + how to drill into per-agent spend, NOT alert/escalation thresholds. Future v2.2 may add alerts when the heuristic-engine cost lever lands.",
    "Commits: synthesis-metrics core + per-agent wrapping + intake-graph events + Sentry dashboards + tests + runbook."
  ]
})

Agent({
  name: "verifier",
  subagent_type: "qa-engineer",
  team: "c1v-hardening",
  goal: "Verify TB1 exit criteria from v2.1 Wave B: EC-V21-B.1 (cache hit-rate > 30% on 10×5 synthetic load test), EC-V21-B.2 (lazy-gen reduces post-intake p95 by ≥ 50% on deferred subset), EC-V21-B.3 (Free hard-capped at 1/mo + Plus unlimited), EC-V21-B.4 (sidecar circuit-breaker trips at 30s timeout with per-artifact retry CTA, NO canned fall-back), EC-V21-B.5 (Sentry dashboard live for 6 v2 agents), EC-V21-B.6 (cost telemetry instrumentation present + dashboard live — NOT a $/mo gate; cost-as-blocker declassified per David 2026-04-25 21:09 EDT).",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "apps/product-helper/scripts/verify-tb1.ts — TB1-specific verifier. Asserts: (a) synthetic load test 10 projects × 5 re-runs achieves cache-hit-rate > 30%, (b) lazy-gen post-intake p95 measured against the 4 deferred artifacts shows ≥ 50% drop vs Wave-A baseline, (c) Free tier hard-capped at 1 synthesis/mo (test: Free user runs 1, second attempt 402), (d) Plus unlimited (test: Plus user runs 5 in succession), (e) sidecar circuit-breaker fires at 30s (test: sidecar mock that hangs; assert project_artifacts row hits 'failed' at 30s ± 1s; assert UI download-dropdown shows retry CTA), (f) Sentry dashboards exist + populate (sample 7 agent panels), (g) cost telemetry instrumented — load-test-tb1.ts produces a monthly-burn projection, captured in the verification report for visibility; NO $/mo pass/fail threshold (cost-as-blocker declassified per David 2026-04-25 21:09 EDT)",
    "plans/v21-outputs/tb1/verification-report.md — per-EC PASS/FAIL with cost-projection math (informational), cache-hit histogram, latency drop measurement",
    "Synthetic load test: 100 DAU × 30 days simulated; capture aggregate cost projection (informational; no gate)",
    "git tag `tb1-wave-b-complete` only if every EC green (B.6 = telemetry instrumented + dashboard live; NO $/mo cost gate)"
  ],
  guardrails: [
    "Depend on cache-and-lazy-gen + tier-and-circuit-breaker + observability (block on names).",
    "Non-fix verifier.",
    "Cost calculation MUST be reproducible — capture the synthetic-load script in scripts/load-test-tb1.ts so anyone can re-run.",
    "EC-V21-B.4 'NO canned fall-back' check: regex sweep for any 'AV.01' / canned-c1v strings in failure-state UI; FAIL on any hit.",
    "Tag only on full green."
  ]
})

Agent({
  name: "docs",
  subagent_type: "documentation-engineer",
  team: "c1v-hardening",
  goal: "Document TB1's hardening surfaces + write the v2.1 release notes + close the v2.1 plan doc (DRAFT → SHIPPED) + update post-v2-followups.md. Folds the v2 `plan-updater` role into TB1 since TB1 is the last team to ship in the v2.1 cycle.",
  inline_skills: ["code-quality"],
  deliverables: [
    "apps/product-helper/lib/cache/synthesis-cache.ts — JSDoc with the inputs_hash contract + invalidation rules.",
    "apps/product-helper/lib/jobs/lazy-gen.ts — JSDoc with the eager-vs-on_view classification + how to add new artifact kinds.",
    "apps/product-helper/lib/billing/synthesis-tier.ts — JSDoc + a top-of-file Tier matrix (Free/Plus rules, hard-caps, plan upgrade flow).",
    "apps/product-helper/lib/jobs/circuit-breaker.ts — JSDoc with the 30s timeout rule, retry semantics, NO-canned-fall-back pillar reference.",
    "apps/product-helper/lib/observability/synthesis-metrics.ts — JSDoc with the metrics catalog + Sentry dashboard URLs (TB1 captures from Sentry config).",
    "apps/product-helper/CLAUDE.md — Update `Deployed Features` with v2.1 Wave-B entry: `Synthesis Hardening (v2.1 Wave B) — inputs_hash cache (≥30% hit), lazy-gen (defer 4-of-7 artifacts), tier gating (Free 1/mo, Plus∞ — product shape), circuit-breaker (30s timeout → per-artifact retry, no canned fall-back), Sentry per-agent observability + cost telemetry (informational, no $/mo gate per David's 2026-04-25 cost-as-blocker declassification).`",
    "plans/v2-release-notes.md — APPEND a v2.1 summary block per EC-V21.6: what shipped (Waves A + B + D), what was deferred (Waves C + E to v2.2), the portfolio artifact path (architecture_recommendation.v1.json + per-tenant equivalents), per-EC commit SHAs, cost figures, latency figures.",
    "plans/c1v-MIT-Crawley-Cornell.v2.1.md — flip DRAFT → SHIPPED per EC-V21.5; append a CLOSEOUT section listing per-EC commit SHAs across TA1/TA2/TA3/TB1/TD1; archive the DEFERRED-TO-V2.2 sections by adding a one-line forward-pointer to plans/c1v-MIT-Crawley-Cornell.v2.2.md.",
    "plans/post-v2-followups.md — EDIT per EC-V21.7: close items shipped in v2.1 (P1 synthesis invisible, P2 FMEA orphaned, P3 Interfaces partial, P4 Diagrams disconnect, P5 Open Questions, P6 PPTX + XLSX, P8 iter-3, P10 stale CLAUDE.md path); leave open items deferred to v2.2 (P7 Crawley schemas, P9 methodology drift); add new follow-ups discovered during v2.1 (e.g. atlas re-ingest dedup-bug if SKIP-with-fail-forward landed).",
    "plans/v21-outputs/release/v2.1-shipped.md (NEW) — single-page authoritative summary of v2.1 ship. Cited from CLAUDE.md, README, MEMORY.md."
  ],
  guardrails: [
    "Depend on verifier (block on `tb1-wave-b-complete` tag).",
    "CLAUDE.md edits require explicit David authorization (file-safety rule) — surface diff in plans/v21-outputs/tb1/claude-md-diff.md FIRST.",
    "v2.1 plan flip DRAFT → SHIPPED is the canonical ship gate marker — only flip if every per-EC commit SHA is captured (run `git log --grep` to verify).",
    "Release notes: factual, no marketing fluff per v2 plan-updater rule. What shipped, what deferred, what the portfolio artifacts are.",
    "Single commit per doc surface: 'docs(v2.1): release notes + plan closeout + JSDoc' — except CLAUDE.md edits which gate on authorization."
  ]
})
```

---

## TD1 — c1v-apispec-iter3 (Wave D, parallel with Wave A)

**Scope:** iter-3 API-spec two-stage refactor unblocking production project=33 from auth-only emission per v2.1 §Wave D. Step D-0 preflight (capture stop_reason); branch on result; ship two-stage extraction. Per D-V21.12: stage-1 schema is flat operation list; stage-2 deterministic CRUD-shape mapper; preserve existing `apiSpecificationSchema` for output validation.

**Dependencies:** No HARD-DEP. Independent of Wave A. Fires in parallel with Wave A. Completion not gating Wave B.

**Honors:** D-V21.12, R-V21.04, R-V21.10, EC-V21-D.1-.5.

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-apispec-iter3",
  agent_type: "tech-lead",
  description: "Fix the api-spec-agent.ts iter-3 regression where production project=33 emits 3-of-6 top-level keys (auth-only). Two-stage extraction: stage-1 LLM emits flat operation list (≤8 scalar keys per op); stage-2 deterministic CRUD-shape mapper produces requestBody/responseBody from (method, resource) rules + project entity schema; final assembly still parses against existing apiSpecificationSchema for output validation.",
  context: {
    authoritative_spec: "plans/c1v-MIT-Crawley-Cornell.v2.1.md §Wave D — iter-3 API-spec two-stage refactor + §Decisions D-V21.12 + §Risks R-V21.04/.10 + §Exit Criteria EC-V21-D.1-.5",
    diagnosis: "apps/product-helper/lib/langchain/agents/api-spec-agent.ts:71-127 embeds jsonSchemaSchema at three sites (requestBody.schema:84, endpoint.responseBody:103, errorHandling.format:123). Per-endpoint responseBody is the multiplier (× 30 endpoints in production). Symptom: Sonnet 4.5 emits 3-of-6 top-level keys, satisfies tool-use early. Already-applied fixes (transform, flat items, maxTokens=12000, prompt enumerations) — none addressed root cause.",
    preflight_branch_logic: "If preflight stop_reason === 'max_tokens' || 'tool_use' → confirms cutoff hypothesis → ship D-1..D-4. If 'end_turn' → instruction-bias not bloat → split-only fix won't suffice; ALSO trim stage-1 schema down to (path, method, operationId only) so 'auth-only' isn't a valid completion.",
    coordination: {
      not_gating: "TD1 ships when it ships; does NOT gate TB1 or any TA*.",
      regression_fixture: "Production project=33 input is the canonical regression fixture per EC-V21-D.4 — must be committed to apps/product-helper/__tests__/fixtures/api-spec/project-33-input.json"
    }
  },
  commit_policy: "one-commit-per-agent-per-deliverable; preflight log capture is its own commit before any refactor; each of D-1..D-4 is its own commit",
  wave: "D",
  blocks: []
})
```

### Step 2: Spawn 4 teammates (sequential ordering on Step D-0; rest parallel)

```
Agent({
  name: "preflight-and-stage1-schema",
  subagent_type: "langchain-engineer",
  team: "c1v-apispec-iter3",
  goal: "Step D-0 preflight + Step D-1 stage-1 schema. Re-run a failing project's API-spec gen with `console.log({usage: response.usage, stop_reason: response.stop_reason})` injected; capture in REVIEW.md per EC-V21-D.1. Branch on result. Ship stage-1 schema (flat operation list ≤ 8 scalar keys) + flat-list emission. Conditionally trim stage-1 floor to (path, method, operationId only) if stop_reason='end_turn'.",
  inline_skills: ["langchain-patterns", "claude-api", "code-quality"],
  deliverables: [
    "plans/v21-outputs/td1/preflight-log-fixture.md — Step 1 fixture replay locally against project=33 input. Captured stop_reason + usage. Commit before any code change.",
    "plans/v21-outputs/td1/preflight-log-live.md — Step 2 live re-run against Anthropic API (production model ID + temp + maxTokens) for the same project=33 input. Captured stop_reason + usage. ~$0.20 cost is trivial vs mis-branching cost (handoff Issue 18).",
    "plans/v21-outputs/td1/preflight-log.md (= the REVIEW.md cited in EC-V21-D.1) — Steps 3-4 reconciliation. If fixture and live agree: proceed with shared branch decision. If divergent: pick LIVE branch decision (production = reality) and document the divergence as known fixture-vs-live drift carried into v2.2 follow-ups. Captured branch decision (max_tokens/tool_use vs end_turn) + rationale.",
    "apps/product-helper/lib/langchain/schemas/api-spec/stage1-operation.ts — Zod schema for stage-1 emission. Default: { path, method, description, auth, tags, operationId } (≤ 8 scalar keys). Conditional trim: if preflight branch = 'end_turn', shrink to { path, method, operationId } only.",
    "apps/product-helper/lib/langchain/agents/api-spec-agent.ts — EDIT to add stage-1 emission path. createClaudeAgent(stage1OperationSchema, ...) returns flat list. Existing apiSpecificationSchema at line 127 (NOT line 71 — line 71 is jsonSchemaSchema, the embedded bloat source per P8; handoff Issue 17) preserved for output validation only (D-4 lands later).",
    "apps/product-helper/__tests__/fixtures/api-spec/project-33-input.json — captured production project=33 input fixture per EC-V21-D.4.",
    "apps/product-helper/__tests__/api-spec-agent.stage1.test.ts — fixture-replay: project=33 input → stage-1 emits all expected operations (no auth-only truncation) + stop_reason='end_turn' (or 'max_tokens' depending on branch); regression-pinned"
  ],
  guardrails: [
    "BLOCKING for `stage2-deterministic-expansion`: stage-1 schema ships first; stage-2 imports it.",
    "DO NOT remove apps/product-helper/lib/langchain/agents/api-spec-agent.ts:127 apiSpecificationSchema yet — preserved for output validation per D-4 (handoff Issue 17 — line 71 is jsonSchemaSchema; apiSpecificationSchema is at :127).",
    "Preflight log MUST be committed to REVIEW.md / preflight-log.md AND surfaced in TD1's verification-report — EC-V21-D.1 explicit.",
    "Branch decision documented in preflight-log.md: which stop_reason was observed, which stage-1 floor was chosen, rationale.",
    "Capture BOTH fixture and live preflight per handoff Issue 18 — fixture-only would mask a real fixture-vs-live drift bug. ~$0.20 of API cost vs the cost of mis-branching the entire two-stage refactor. Production = reality on divergence.",
    "Commits: preflight-log-fixture + preflight-log-live + preflight-log reconciliation + stage1 schema + agent stage1 path + fixture + tests."
  ],
  blocks: ["stage2-deterministic-expansion", "verifier"]
})

Agent({
  name: "stage2-deterministic-expansion",
  subagent_type: "backend-architect",
  team: "c1v-apispec-iter3",
  goal: "Step D-2 + D-3 + D-4. Build stage2ExpansionEngine — deterministic CRUD-shape mapper from (method, resource) rules + project entity schema. Replace api-spec-agent.ts:353 createClaudeAgent(apiSpecificationSchema, ...) with two sequential calls: createClaudeAgent(stage1OperationSchema, ...) followed by deterministic stage-2 expansion. Keep apiSpecificationSchema for output validation only (final assembled spec must still parse against it).",
  inline_skills: ["api-design", "code-quality"],
  deliverables: [
    "apps/product-helper/lib/langchain/agents/api-spec/stage2-expansion.ts — stage2ExpansionEngine(operations: Stage1Operation[], projectEntities: EntitySchema[]): ApiSpecification. Deterministic mapping rules: GET /:resource → response = entity[]; GET /:resource/:id → response = entity; POST /:resource → request = entity (omit id), response = entity; PATCH /:resource/:id → request = Partial<entity>, response = entity; DELETE /:resource/:id → response = void. Errors mapped from existing errorConfigSchema.",
    "apps/product-helper/lib/langchain/agents/api-spec-agent.ts — EDIT to replace line 353 with two-stage flow. Feature flag API_SPEC_TWO_STAGE controls rollout (default ON for new projects, OFF for existing per EC-V21-D.2). apiSpecificationSchema preserved for output validation.",
    "apps/product-helper/__tests__/api-spec-agent.regression.test.ts — fixture replay of project=33 input through full two-stage flow; assert all 6 top-level keys present in stage-1+stage-2 assembled output (per EC-V21-D.3); CI green",
    "apps/product-helper/__tests__/api-spec/stage2-expansion.test.ts — stage-2 deterministic mapping unit tests: each (method, resource) rule produces expected schema; edge cases (composite resources, non-CRUD verbs, custom error shapes)",
    "Token-cost measurement: capture tokens for stage-1 schema (small) vs single-call legacy schema (bloated); document drop in plans/v21-outputs/td1/token-cost-delta.md per EC-V21-D.5"
  ],
  guardrails: [
    "HARD-DEP on `preflight-and-stage1-schema` (block on name) — stage1OperationSchema must exist.",
    "BLOCKING for `verifier`.",
    "Feature flag API_SPEC_TWO_STAGE: default ON for new projects, OFF for existing per EC-V21-D.2 — avoid silently regressing existing projects until they re-gen.",
    "DO NOT remove apiSpecificationSchema (line 127, NOT 71 — line 71 is jsonSchemaSchema; handoff Issue 17) — preserved for output validation per D-4. The stage-1+stage-2 assembled output MUST parse against it.",
    "Stage-2 is DETERMINISTIC — no LLM calls. Per EC-V21-D.5: stage-2 zero LLM tokens for first version; optional stage-3 LLM refinement on flagged projects only is a Wave-B+ follow-up (R-V21.10 mitigation), NOT in Wave D scope.",
    "Project entity schema discovery: read from project.projectData.intakeState.extractedData.schema (existing path) or project_artifacts kind='schema_*' (post-Wave-A path) — pick the path that exists at TD1's dispatch time and document choice in JSDoc.",
    "Commits: stage2 expansion engine + agent two-stage flow + feature flag + regression test + token-cost-delta doc."
  ]
})

Agent({
  name: "verifier",
  subagent_type: "qa-engineer",
  team: "c1v-apispec-iter3",
  goal: "Verify TD1 exit criteria from v2.1 Wave D: EC-V21-D.1 (preflight log captured + recorded in REVIEW.md), EC-V21-D.2 (two-stage flow shipped behind feature flag with default-on-new / default-off-existing), EC-V21-D.3 (project=33 re-gen succeeds with all 6 keys + deterministic CRUD fallback no longer rendered), EC-V21-D.4 (Wave-D regression test pinned to project=33 fixture + CI green), EC-V21-D.5 (token cost drops measurably).",
  inline_skills: ["testing-strategies"],
  deliverables: [
    "apps/product-helper/scripts/verify-td1.ts — TD1-specific verifier. Asserts: (a) preflight-log.md committed in plans/v21-outputs/td1/, (b) feature flag default state correct (new projects ON, existing OFF), (c) project=33 fixture replay through two-stage flow produces all 6 top-level keys, (d) token cost on stage-1+stage-2 < legacy single-call by ≥ 30% (synthetic measurement), (e) apiSpecificationSchema still validates the assembled output (no regression), (f) regression test pinned + CI green",
    "plans/v21-outputs/td1/verification-report.md — per-EC PASS/FAIL with token-cost histogram + project=33 before/after comparison + feature-flag state machine",
    "git tag `td1-wave-d-complete` only if every EC green"
  ],
  guardrails: [
    "Depend on preflight-and-stage1-schema + stage2-deterministic-expansion (block on names).",
    "Non-fix verifier.",
    "Project=33 fixture replay MUST run in CI — not just locally; lock the fixture path in jest config.",
    "Tag only on full green."
  ]
})

Agent({
  name: "docs",
  subagent_type: "documentation-engineer",
  team: "c1v-apispec-iter3",
  goal: "Document TD1's two-stage architecture + feature flag rollout + regression-test pattern. Write the api-spec-agent architecture note for future contributors so the two-stage pattern is reused for any future schema-bloat regressions.",
  inline_skills: ["code-quality"],
  deliverables: [
    "apps/product-helper/lib/langchain/agents/api-spec-agent.ts — top-of-file JSDoc with the two-stage architecture: stage-1 LLM emission, stage-2 deterministic CRUD expansion, output-validation-only role of apiSpecificationSchema, feature flag rollout rule.",
    "apps/product-helper/lib/langchain/agents/api-spec/stage2-expansion.ts — JSDoc with the (method, resource) → schema mapping rules + extension points (how to add a non-CRUD verb mapping).",
    "apps/product-helper/__tests__/fixtures/api-spec/README.md — fixture catalog: project-33-input.json contract + how to add new regression fixtures + when to bump the fixture (e.g. agent contract version change).",
    "apps/product-helper/CLAUDE.md — Update `Deployed Features` with `iter-3 API-Spec Two-Stage (v2.1 Wave D) — Stage-1 flat operation emit + Stage-2 deterministic CRUD expansion; feature flag API_SPEC_TWO_STAGE; regression-pinned to project=33 fixture.`",
    "plans/v21-outputs/td1/two-stage-pattern.md — pattern doc for future contributors: when to apply two-stage extraction, how to identify schema-bloat regressions, how to ship behind feature flag."
  ],
  guardrails: [
    "Depend on verifier (block on `td1-wave-d-complete` tag).",
    "CLAUDE.md edits require explicit David authorization (file-safety rule).",
    "Pattern doc is a future-contributor surface — write for someone who hasn't seen the iter-3 incident.",
    "Single commit per doc surface (CLAUDE.md edit pending authorization)."
  ]
})
```

---

## Wave gate procedure (git-tag mechanism)

Same mechanism as v2 §14.3 (per-team verifier tags + Bond polls). v2.1-specific tag matrix:

1. **Team verifier tags.** Each team's `verifier` agent creates a git tag `t<slug>-wave-<wave>-complete` on the commit where all team ECs pass. No tag = team not done. Tags:
   - TA1 → `ta1-wave-a-complete`
   - TA2 → `ta2-wave-a-complete`
   - TA3 → `ta3-wave-a-complete`
   - TB1 → `tb1-wave-b-complete`
   - TD1 → `td1-wave-d-complete`
2. **Wave-gate condition.** Bond advances from one dispatch wave to the next iff ALL required tags are present on `origin/main`. v2.1 dispatch waves:
   - **Dispatch Wave 1 (Wave A + D fire together):** TA1 + TA2 + TA3 + TD1 — required tags for advancing: `ta1-wave-a-complete` AND `ta2-wave-a-complete` AND `ta3-wave-a-complete`. (TD1 is parallel/independent — Bond surfaces TD1's tag as a separate ship signal but does NOT gate Wave 2 on it.)
   - **Dispatch Wave 2 (Wave B):** TB1 — terminal. No further dispatch. v2.1 ships when `tb1-wave-b-complete` lands AND TD1 has shipped (or TD1 surfaces as an open follow-up if it hasn't, but doesn't block the v2.1 doc-flip).
3. **Optional human gate.** If David sets tag `wave-a-approved` manually (via `git tag wave-a-approved <sha> && git push --tags`), Bond blocks Wave 2 dispatch on its presence in addition to the verifier tags. If David does not set it, verifier-tag-only path auto-advances.
4. **TD1 ship signal.** TD1 carries no Wave-2 gate. When `td1-wave-d-complete` lands, Bond surfaces a one-line "TD1 shipped — iter-3 fix live behind feature flag" notification. If TD1 hasn't tagged by the time Wave-2 closes, plan-updater (TB1.docs) captures it as an open v2.1 follow-up.
5. **Polling.** `git fetch --tags && git tag --list 't*-wave-*-complete'` every 270 seconds via `ScheduleWakeup` (handoff Issue 19 — 270s keeps the prompt cache warm; 300s is the worst-of-both-worlds boundary that pays the cache-miss without amortizing it). When all required tags present, Bond dispatches next wave in a single coordinator message. After 30 min of idle polling with no tag movement, optionally back off to 1200s (one cache miss buys 20+ min of further idle). If 60 min elapsed without all tags, Bond surfaces "Wave stuck — missing tags: X, Y" to David.
6. **Rollback.** Each team's first agent that modifies state creates a snapshot tag (`t<slug>-pre-wave-a-snapshot` or similar). Rollback = `git checkout <tag> -- <scoped-path>`.

---

## Dispatch order (canonical, copy-paste sequence)

**Mechanism:** All `TeamCreate` + `Agent` calls for a single dispatch wave fire in ONE coordinator message to maximize parallelism. v2 dropped the prior 2-min stagger; v2.1 inherits.

### Dispatch Wave 1 (4 teams, 21 agents — single message)

```
# One coordinator message contains:
TeamCreate(c1v-runtime-wiring)     + 6× Agent  # TA1
TeamCreate(c1v-synthesis-ui)       + 7× Agent  # TA2 (5 producers — incl. empty-section-state for EC-V21-A.16 — + verifier + docs)
TeamCreate(c1v-cloudrun-sidecar)   + 4× Agent  # TA3
TeamCreate(c1v-apispec-iter3)      + 4× Agent  # TD1
```

Internal sequencing within teams:
- TA1: `migrations-and-agent-audit` BLOCKS the other 5 TA1 agents (EC-V21-A.0 preflight is sequential).
- TA2: 5 producer agents parallel (synthesis-viewer / nav-and-pages / architecture-and-database / interfaces-and-archive-pages / empty-section-state); name-blocks: synthesis-viewer ships shared empty-state composer AFTER empty-section-state lands the shared component; nav-and-pages rebases FMEA page-import swap AFTER empty-section-state's page-imports cluster lands. verifier blocks on producers; docs blocks on verifier.
- TA3: 2 producer agents parallel; verifier + docs after.
- TD1: `preflight-and-stage1-schema` BLOCKS `stage2-deterministic-expansion` (stage-1 schema must exist before stage-2 imports it); verifier + docs after.

### Wave-A Gate (verifier polling, no manual approval required)

After Bond observes `ta1-wave-a-complete` AND `ta2-wave-a-complete` AND `ta3-wave-a-complete` on `origin/main`, dispatch Wave 2.
TD1's `td1-wave-d-complete` is surfaced as a ship signal but does NOT gate Wave 2.

### Dispatch Wave 2 (1 team, 5 agents — single message)

```
TeamCreate(c1v-hardening) + 5× Agent  # TB1
```

Internal sequencing within TB1: 3 producer agents parallel; verifier blocks on producers; docs blocks on verifier (and writes the v2.1 release notes + plan closeout).

### Total

**5 teams · 26 agents · 2 dispatch waves.** Estimated 8-14 days wall-clock (Wave A 8-12 days conservative / 5-7 day stretch per master plan v2.1 line 243+805; Wave B 3-5 days post-Wave-A; Wave D parallel with Wave A). TA2 grew from 6→7 agents 2026-04-25 21:55 EDT to absorb EC-V21-A.16 empty-state work via dedicated `empty-section-state` agent (master plan critique iter-2 Issue 14 lock).

---

## Dispatch blockers (must resolve before Dispatch Wave 1)

### Resolved

1. ✅ Master plan v2.1 scope cut applied 2026-04-25 16:31 EDT — Waves C + E deferred to v2.2; v2.1 ships A + B + D only.
2. ✅ Visual-style locked — EC-V21-A.11 (no Figma blocker); reuse existing brand tokens + components per locked 2026-04-25 16:06 EDT.
3. ✅ Empty-state locked — D-V21.17 (no canned exemplar); per-tenant from day one.
4. ✅ Wave A ↔ Wave E handshake locked — `nfr_engine_contract_version: 'v1'` envelope on `GENERATE_nfr` / `GENERATE_constants` outputs; `system-question-bridge.ts` ships in v2.1 (TA1) as shared transport; `surface-gap.ts` producer deferred to v2.2.
5. ✅ Subagent_type permissions — every type used (backend-architect, database-engineer, langchain-engineer, ui-ux-engineer, data-viz-engineer, devops-engineer, cache-engineer, observability-engineer, qa-engineer, documentation-engineer) is in the `.claude/settings.json` allow-list (verified 2026-04-25).
6. ✅ Skill-attachment mechanism — `inline_skills: [...]` translates to `Skill()` calls at dispatch time per v2 convention.
7. ✅ Migration collision (0011_kb_chunks.sql + 0011_decision_audit.sql) — assigned to TA1.migrations-and-agent-audit as EC-V21-A.0 preflight.
8. ✅ Path-claim defects (`lib/langgraph/intake-graph.ts` doesn't exist; canonical is `lib/langchain/graphs/intake-graph.ts`) — assigned to TA1.migrations-and-agent-audit + enforced in TA1.langgraph-wirer guardrails.
9. ✅ FROZEN UI components — listed in apps/product-helper/CLAUDE.md `UI Freeze` table; TA2 verifier asserts no modifications.
10. ✅ Every team has both QA and Documentation roles per David's 2026-04-25 16:45 EDT directive — verifier (qa-engineer) + docs (documentation-engineer) per team.

### Resolved David rulings (locked 2026-04-25 19:50 EDT)

- ✅ **R-v2.1.A** Wave A timeline — **Option C resolved**: keep 5-7 day target with explicit fail-forward semantic per handoff Issue 5 — any agent fs-side-effects refactor >200 LOC ships as a graph-node-adapter wrapper in v2.1; underlying refactor defers to v2.2 day-0. Documented in TA1.langgraph-wirer guardrails. No A1/A2 split.
- ✅ **R-v2.1.B** Chat-bridge — **Bond default held**: folded into TA1.open-questions-emitter.
- ✅ **R-v2.1.C** Sidecar + API routes — **Bond default held**: together in TA3.
- ✅ **R-v2.1.D** ~~Cost ceiling~~ — **STRUCK / DECLASSIFIED 2026-04-25 21:09 EDT per David: "we are moving forward regardless of cost."** EC-V21-B.6 reframed to instrumentation-only (telemetry + dashboard live, no $/mo gate). R-V21.05 declassified. Cost figures ($924/mo Wave A, $647/mo Wave B) tracked in master plan §Systems-Engineering Math §Cost table for visibility. Free-tier hard-cap (1 synthesis/mo) still ships per D-V21.10 for product shape (not for cost control). AV.01 alignment ($320/mo) is an aspirational v2.2 lever, not a v2.1 gate.
- ~~**R-v2.1.E** Methodology-correction canonical path~~ — **RESOLVED 2026-04-25** per handoff Issue 1+2+20: `system-design/METHODOLOGY-CORRECTION.md` does NOT exist (handoff fact-check); only `plans/kb-upgrade-v2/` and `.claude/plans/kb-upgrade-v2/` have it. Locked to `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`; `.claude/plans/` copy becomes a redirect stub. Non-decision.

### Still open (plan-doc work before Dispatch Wave 1)

- [ ] Master plan v2.1 (`plans/c1v-MIT-Crawley-Cornell.v2.1.md`) flipped DRAFT → ready-for-execution. Currently DRAFT awaiting David's review.
- [ ] This spawn-prompts doc reviewed and approved (post-fix-up critique iter 2 — optional).
- [x] Five R-v2.1 rulings above resolved (locked 2026-04-25 19:50 EDT + 21:09 EDT cost-as-blocker declassification; A=Option C / B=held / C=held / D=STRUCK (cost not a blocker) / E=non-decision).

**Dispatch unblocked when:** Master plan ready-for-execution + this doc approved (or fix-up sweep accepted as-is).

---

## References

- v2.1 master plan: [`plans/c1v-MIT-Crawley-Cornell.v2.1.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.1.md)
- v2.1 critique iter 1: [`plans/c1v-MIT-Crawley-Cornell.v2.1.critique.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.1.critique.md)
- v2.2 stub (deferred work): [`plans/c1v-MIT-Crawley-Cornell.v2.2.md`](../../plans/c1v-MIT-Crawley-Cornell.v2.2.md)
- v2 spawn prompts (predecessor): [`team-spawn-prompts-v2.md`](team-spawn-prompts-v2.md)
- v2 release notes: [`plans/v2-release-notes.md`](../../plans/v2-release-notes.md)
- v2 handoff: [`plans/HANDOFF-2026-04-24-c1v-MIT-Crawley-Cornell-v2.md`](../../plans/HANDOFF-2026-04-24-c1v-MIT-Crawley-Cornell-v2.md)
- post-v2 backlog: [`plans/post-v2-followups.md`](../../plans/post-v2-followups.md)
- Teams index: [`.claude/teams/index.md`](../teams/index.md)
- Project conventions: [`apps/product-helper/CLAUDE.md`](../../apps/product-helper/CLAUDE.md)
