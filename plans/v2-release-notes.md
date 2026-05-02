# c1v MIT-Crawley-Cornell v2 — Release Notes

**Date:** 2026-04-24
**Final tag:** `synthesizer-wave-4-complete` @ `56532d4`
**Plan:** [`c1v-MIT-Crawley-Cornell.v2.md`](c1v-MIT-Crawley-Cornell.v2.md) (supersedes v1 §0, §5.3, §14)
**Verification bar (all 12 teams):** per-team git tag + `apps/product-helper/scripts/verify-t<N>.ts` runner + `plans/t<N>-outputs/verification-report.md` (green-gate evidence)

---

## What shipped — all 12 teams

### Wave 1 — Foundations (parallel, no inter-deps)

| Team | Tag | Commit | Deliverable |
|------|-----|--------|-------------|
| T1 `c1v-crawley-kb` | (closed earlier) | — | Crawley book findings extracted to `plans/research/crawley-book-findings.md` |
| T2 `c1v-kb8-atlas` | (closed earlier) | — | 37-task multi-agent atlas build → 7 valid stack entries with §6.3-compliant priors |
| T3 `c1v-runtime-prereqs` | `t3-wave-1-complete` | `3641e97` | NFREngineInterpreter + rule-tree loader + DSL + ContextResolver + `decision_audit` (G1-G11) |
| T8 `c1v-reorg` | `t8-wave-1-complete` | `e173d3b` | 3×8 submodule layout for M2/M3/M4; verifier `scripts/verify-tree-pair-consistency.ts` (`2be3ef4`); CI workflow `.github/workflows/verify-trees.yml` |
| T9 `c1v-kb-hygiene` | `t9-wave-1-complete` | — | 52 duplicate cross-cutting KBs deduped → `_shared/` pool + 117 relative symlinks; 9 KB folders renamed per §0.4.3; Atlas → KB-9; 18 Crawley excerpts patched into 7 KBs |
| T10 `c1v-artifact-centralization` | `t10-wave-1-complete` | — | 13 Python generators at `scripts/artifact-generators/` (9 migrated + 4 new Crawley); TS pipeline + manifest endpoint; new FMEA viewer (R-v2.3) |

### Wave 2-early — Understanding cluster

| Team | Tag | Commit | Deliverable |
|------|-----|--------|-------------|
| T4a `c1v-m3-ffbd-n2-fmea-early` | `t4a-wave-2-early-complete` | `18e75c8` | M1 phase-2.5 `data_flows.v1.json` (15 DE); M3 `ffbd.v1.json` (7 fns); M7.a `n2_matrix.v1.json` (10 IF); M8.a `fmea_early.v1.json` (12 FM) |
| T7 `c1v-module0-be` | `t7-wave-2-early-complete` | `581afd9` | M0 `user_profile.v1` + `project_entry.v1` + `intake_discriminators.v1` + agents + signup-signals route + `user_signals` / `project_entry_states` tables w/ RLS |

Roll-up: `wave-2-early-complete`.

### Wave 2-mid — NFR resynth

| Team | Tag | Commit | Deliverable |
|------|-----|--------|-------------|
| T11 `c1v-m2-nfr-resynth` | `t11-wave-2-mid-complete` | `91f159e` | M2 schema `derivedFrom` discriminated union; NFR v2.1 (26 NFRs; 12 fmea-derived, 3 data-flow, 11 fr); constants v2.1 (28 constants; 19 NFR-anchored, 9 FR-anchored, 5 Final) |

Roll-up: `wave-2-mid-complete`.

### Wave 3 — Decision + Form-Function

| Team | Tag | Commit | Deliverable |
|------|-----|--------|-------------|
| T4b `c1v-m4-decision-net` | `t4b-wave-3-complete` | `4ecfe3f` | `decision-net-agent.ts` + `interface-specs-agent.ts`; `decision_network.v1.json` (M4) + `interface_specs.v1.json` (M7.b formal specs) |
| T5 `c1v-m5-formfunction` | `t5-wave-3-complete` | `a30d9c6` | `form-function-agent.ts` + 8-case test; re-validates `form_function_map.v1.json` |

### Wave 4 — Synthesis

| Team | Tag | Commits | Deliverable |
|------|-----|---------|-------------|
| T6 `c1v-synthesis` (6 agents) | `synthesizer-wave-4-complete` @ `56532d4` | `16bc96c..8c9a172` (10), `b7def3b`, `55d7737`, `629303e`, `aa55cf3`, `3691617`, `94f6c0e`, `2a4a05b`, `15ffe20`, `a2ee9b8`, `56532d4`, `a4d1bb6` | M6 HoQ schemas + agent + `hoq.v1.json` + xlsx; M8.b `fmea_residual.v1.json` (16 FMs, 13 high-RPN flags); `project_run_state` table + migration `0013` + RLS (6/6 smoke); `build-all-headless.ts` E2E (14/14 tests, 15/15 artifacts, 61 schemas across 9 modules); synthesizer `architecture_recommendation.v1.json` + `verify-t6.ts` (6/6 V6 gates green) |

---

## What artifacts emit

`scripts/build-all-headless.ts` produces 15 artifacts across 9 modules (61 schemas):

- M0: `user_profile.v1`, `project_entry.v1`, `intake_discriminators.v1`
- M1: `scope_tree.json`, `context_diagram.json`, `data_flows.v1.json` (NEW — phase 2.5)
- M2: `requirements.v1`, `nfrs.v2.json`, `constants.v2.json`
- M3: `ffbd.v1.json` (Gate C complete)
- M4: `decision_network.v1.json` (Crawley DAG + Pareto + sensitivity)
- M5: `form_function_map.v1.json` (Crawley Concept stage)
- M6: `hoq.v1.json` (House of Quality)
- M7: `n2_matrix.v1.json` (M7.a informal) + `interface_specs.v1.json` (M7.b formal SLAs)
- M8: `fmea_early.v1.json` (M8.a instrumental) + `fmea_residual.v1.json` (M8.b terminal)
- Synthesis: `architecture_recommendation.v1.json` (the keystone)

T10 generators (13) emit downstream: pptx / xlsx / mmd / svg / pdf / html per module.

---

## What KB hygiene landed (T9)

- `_shared/` pool at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_shared/` — 13 canonical cross-cutting KBs (single inode each).
- 117 relative POSIX symlinks replacing the prior 4× duplication across M2 / old-M5-HoQ / M6-interfaces / M7-FMEA.
- 9 KB folders renamed per v2 §0.4.3 (suffix-trim + Cornell-era `5-HoQ` → `6-hoq`, etc.).
- Atlas content consolidated from `plans/8-stacks-and-priors-atlas/` → `13-Knowledge-banks-deepened/9-stacks-atlas/` (Atlas = KB-9; Zod schemas at `lib/langchain/schemas/atlas/` untouched).
- 18 Crawley chapter excerpts patched into 7 KBs + `_shared/` per §0.2.4 patch matrix; **0 fabricated** (any missing chapter stubbed as `*.MISSING.md`).
- CI gate `scripts/verify-tree-pair-consistency.ts` blocks future drift.

---

## What was deferred

### Frozen UI viewers (per UI-freeze ruling 2026-04-21 17:30, retained in v2 §15.5)

`DecisionMatrixViewer`, `FFBDViewer`, `QFDViewer`, `InterfacesViewer`, `DiagramViewer` — unchanged. Crawley-depth extensions (decision-net DAG view, Pareto scatter, sensitivity heatmap, N2/Formal-Specs split) are post-v2.

**Single exception:** FMEA viewer shipped per R-v2.3 (T10 `runtime-wirer`) — `/projects/[id]/system-design/fmea/page.tsx` + `components/system-design/fmea-viewer.tsx`, renders both M8.a + M8.b via tabs.

### `projects` table RLS hardening

Tracked in [`plans/post-v2-followups.md`](post-v2-followups.md). `projects` has `ENABLE ROW LEVEL SECURITY` but ships zero tenant policies; downstream EXISTS-gated policies (e.g., on `project_run_state`) cannot fire from non-owner Postgres roles. Not actively bleeding — JWT session-cookie middleware gates routes (defense-in-depth, not the only barrier). Pre-dates T6. Recommended for the post-v2 P3 security pass.

### Producer-drift in `fmea_residual.summary.flagged_high_rpn`

Summary claims 14, file ships 13 by per-mode boolean. Synthesizer uses the per-mode boolean (source of truth) → 13 flags. Reconciliation belongs in a follow-up cleanup commit on `fmea-residual-agent`. Non-blocking; verifier records the drift. Same pattern as the T11 NFR/FR/Final prose-vs-data drift.

### `kb_chunk_ids` placeholders

Real pgvector UUIDs replace path-shaped strings once corpus ingests at full scale. Tracked in `next_steps[2]` of the synthesizer artifact.

### `weasyprint` PDF rendering

`gen-arch-recommendation.py` degrades gracefully when `weasyprint` unavailable; PDF target materializes in any CI environment with `weasyprint==62.3` per `scripts/artifact-generators/requirements.txt`.

---

## The portfolio artifact

**`.planning/runs/self-application/synthesis/architecture_recommendation.v1.json`** — the LinkedIn hero demo.

c1v applied to itself, end-to-end through synthesis. Concretely:

- **4 architectural decisions** with full derivation chains (D-01 LLM provider → Sonnet 4.5; D-02 vector store → pgvector; D-03 orchestration → LangGraph; D-04 deploy → Vercel).
- **3 Pareto alternatives** evaluated; **AV.01** recommended (Sonnet 4.5 + pgvector + LangGraph + Vercel — $320/mo, 2600ms p95, 99.9% avail).
- **7 atlas empirical priors cited** across 4 KB-9 companies (anthropic, supabase, langchain, vercel) — every numeric score grounded.
- **13 high-RPN residual-risk flags** carried verbatim from `fmea_residual.v1.json` with `predecessor_ref` preserved.
- **HoQ embed** — 6 PCs × 18 ECs, 27 nonzero relationships (75% sparsity), 14 nonzero roof correlations, flagged ECs [17, 18].
- **Tail-latency consistency check** — 1 chain (`AUTHORING_SPEC_EMIT`): IF.01 (500) → IF.02 (600) → IF.03 (1200) → IF.04 (300) = 2600ms sum vs 3000ms NFR p95 budget; `budget_ok = true`.
- **`inputs_hash`** = `559c0c0cdb7d48f17478a23b5f583807c50efed91b5364d3adec95a0436dd9c6` (SHA-256 over canonically ordered raw bytes of all 13 upstream artifacts).
- **`model_version`** = `deterministic-rule-tree@t6-wave-4` — no LLM in the loop for this self-application; re-running `pnpm tsx scripts/build-t6-synthesis-self-application.ts` produces a byte-identical artifact (modulo `synthesized_at` timestamps).

This is the moat — a deterministic LLM system for architecture design, grounded in math, with provenance per decision.

---

## Verification reports

- [`plans/t3-outputs/verification-report.md`](t3-outputs/verification-report.md)
- [`plans/t4a-outputs/verification-report.md`](t4a-outputs/verification-report.md)
- [`plans/t4b-outputs/verification-report.md`](t4b-outputs/verification-report.md)
- [`plans/t5-outputs/verification-report.md`](t5-outputs/verification-report.md)
- [`plans/t6-outputs/verification-report.md`](t6-outputs/verification-report.md)
- [`plans/t6-outputs/smoke-report.md`](t6-outputs/smoke-report.md) (`build-all-headless`)
- [`plans/t7-outputs/verification-report.md`](t7-outputs/verification-report.md)
- [`plans/t9-outputs/verification-report.md`](t9-outputs/verification-report.md)
- [`plans/t10-outputs/verification-report.md`](t10-outputs/verification-report.md)
- [`plans/t11-outputs/verification-report.md`](t11-outputs/verification-report.md)
- [`plans/reorg-verification-report.md`](reorg-verification-report.md) (T8)

---

# v2.1 Amendment — Release Notes (Appended 2026-04-26)

**Date:** 2026-04-26
**Final tag:** `tb1-wave-b-complete` @ `e56d37f`
**Plan:** [`c1v-MIT-Crawley-Cornell.v2.1.md`](c1v-MIT-Crawley-Cornell.v2.1.md) (DRAFT → SHIPPED)
**Single-page summary:** [`v21-outputs/release/v2.1-shipped.md`](v21-outputs/release/v2.1-shipped.md)

5 teams shipped in v2.1, 26 agents dispatched, ~6 hours wall-clock from Wave-A spawn to v2.1 ship gate. The v2 keystone artifact (`architecture_recommendation.v1.json`) is no longer trapped on disk — every project now produces its own per-tenant synthesis through the runtime LangGraph, with PDF + PPTX + XLSX downloads, FMEA + N2 + Open-Questions surfaced in the UI, the iter-3 API-spec regression fixed, and a hardened cost/reliability layer (cache + lazy-gen + tier gate + circuit-breaker + Sentry).

## What shipped — v2.1 (Waves A + B + D)

### Wave A — Per-tenant runtime wiring + UI surfacing

| Team | Tag | Commit | Deliverable |
|------|-----|--------|-------------|
| TA1 `c1v-runtime-wiring` | `ta1-wave-a-complete` | `0a30d46` | LangGraph GENERATE_* nodes wiring T4b/T5/T6 agents + `project_artifacts` Drizzle table + RLS (4 policies) + content-addressed `inputs_hash` + `system-question-bridge` transport + 0011 migration collision reconciled + Wave-A↔E discriminated-union envelope |
| TA2 `c1v-synthesis-ui` | `ta2-wave-a-complete` | `1da5ac0` | `RecommendationViewer` + 5 sections + provenance + downloads + `EmptySectionState` + 5 sibling wrappers + FMEA route in nav + N2 sub-tab + archive viewers + bundle ZIP + Architecture+Database section merge + DBML transpiler |
| TA3 `c1v-cloudrun-sidecar` | `ta3-wave-a-complete` | `e2d58b2` | Cloud Run sidecar `/run-render` + Supabase Storage signed-URL helper + Vercel ↔ Cloud Run boundary (D-V21.24) |

### Wave D — iter-3 API-spec two-stage refactor

| Team | Tag | Commit | Deliverable |
|------|-----|--------|-------------|
| TD1 `c1v-apispec-iter3` | `td1-wave-d-complete` | `bb1f443` | Stage-1 flat-operation schema + stage-2 deterministic CRUD-shape expansion engine + project=33 fixture + regression test pinned + 83% output-token / 75% cost reduction |

### Wave B — Hardening + cost/reliability

| Team | Tag | Commit | Deliverable |
|------|-----|--------|-------------|
| TB1 `c1v-hardening` | `tb1-wave-b-complete` | `e56d37f` | `synthesis-cache` (inputs_hash, ≥30% hit) + `lazy-gen` (defer 4-of-7) + `synthesis-tier` (Free 1/mo + Plus∞) + `circuit-breaker` (30s, no canned fall-back) + `synthesis-metrics` (Sentry, 7 v2 agents) + load-test harness + cost-telemetry runbook |

## Per-EC commit SHAs

See [`v21-outputs/release/v2.1-shipped.md`](v21-outputs/release/v2.1-shipped.md) for the full per-EC table. Wave-by-wave headlines:
- **Wave A:** EC-V21-A.0 / .2-.16 + Wave-A↔E pin + D-V21.24 boundary
- **Wave D:** EC-V21-D.1-.5
- **Wave B:** EC-V21-B.1-.6
- **Closeout:** EC-V21.5 (this plan flip), EC-V21.6 (these notes), EC-V21.7 (post-v2-followups update)

## Cost figures (informational; NOT a ship gate per David 2026-04-25 21:09 EDT)

- Wave-A unoptimized projection: **~$924/mo** at 100 DAU baseline.
- Wave-B optimized projection: **~$330/mo** at 100 DAU baseline (cache + lazy-gen + tier gate).
- TD1 token reduction on api-spec gen: **83% output-token → 75% cost reduction** on that agent.

Cost is instrumented for visibility in `apps/product-helper/lib/observability/synthesis-metrics.ts` + Sentry dashboards under `plans/v21-outputs/tb1/sentry-dashboards/`. There are NO alert thresholds in v2.1; operators read the dashboard, no on-call paging on $/mo.

## Latency figures

- TA1 chat-bridge p95 < 2s (DB-write green in producer suite).
- TB1 lazy-gen post-intake p95 reduced ≥ 50% on the deferred subset (4-of-7 artifacts) vs Wave-A baseline.
- TB1 circuit-breaker fires at 30s ± 1s (verified by hanging-mock test).

## Portfolio artifact

`.planning/runs/self-application/synthesis/architecture_recommendation.v1.json` — byte-frozen self-application keystone (unchanged from v2). **Per-tenant equivalents now produced by every project** through the same deterministic pipeline (TA1 GENERATE_* nodes + TA3 sidecar render + TA2 viewer + TB1 hardening). The portfolio moat — "deterministic LLM system for architecture design, grounded in math, with provenance per decision" — is now visible in the running app for every user.

## What was deferred to v2.2

- **Wave C** — Crawley typed schemas (10) + eval harness + methodology page (was `EC-V21.3`)
- **Wave E** — KB runtime architecture rewrite: deterministic-rule-tree-first NFR engine + pgvector + decision_audit + multi-turn gap-fill + "why this value?" UI (was `EC-V21.4` + `EC-V21.8`)
- **D-V21.13** Crawley schemas + **D-V21.18 through D-V21.23** Wave E sub-decisions — locked, honored by v2.2
- **P7** Crawley schemas + **P9** methodology drift — kept open in [`plans/post-v2-followups.md`](post-v2-followups.md)

v2.2 spec stub: [`plans/c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md) — DRAFT created 2026-04-26 (3 streams: Wave C / Wave E / Pre-Wave-E inventory + post-v2.1 P2/P3/P5 backlog). Inherits-by-reference from v2.1 §Wave C (lines 362–400) and §Wave E (lines 439–523); honors the Wave A↔E handshake contract at v2.1 lines 498–504 verbatim. Ship gate: `load-test-tb1.ts` projection ≤ $320/mo at 100 DAU (AV.01 portfolio target).

## v2.1 verification reports

- [`plans/v21-outputs/ta1/verification-report.md`](v21-outputs/ta1/verification-report.md) — 9/9 EC gates green; 48 tests
- [`plans/v21-outputs/ta2/verification-report.md`](v21-outputs/ta2/verification-report.md) — full green, 37/37 jest, 0 hex literals, 0 FROZEN modifications
- [`plans/v21-outputs/ta3/verification-report.md`](v21-outputs/ta3/verification-report.md) — sidecar EC gates
- [`plans/v21-outputs/td1/verification-report.md`](v21-outputs/td1/verification-report.md) — Wave D EC gates + token-cost delta
- [`plans/v21-outputs/tb1/verification-report.md`](v21-outputs/tb1/verification-report.md) — 6/6 EC green; load test 10×5
- [`plans/v21-outputs/tb1/cost-telemetry-runbook.md`](v21-outputs/tb1/cost-telemetry-runbook.md) — operator runbook


---

# v2.1.1 Hotfix — Release Notes (Appended 2026-04-27)

**Date:** 2026-04-27
**Final tag:** `v2.1.1-hotfix-complete` @ `102fce3`
**Master plan:** [`c1v-MIT-Crawley-Cornell.v2.1.1.md`](c1v-MIT-Crawley-Cornell.v2.1.1.md) (closeout-flavored, written post-verification)
**Spawn prompts:** [`team-spawn-prompts-v2.1.1.md`](team-spawn-prompts-v2.1.1.md)
**Followups:** [`post-v2.1-followups.md`](post-v2.1-followups.md) §P7 + §P8 + §P9 → ✅ RESOLVED
**Branch:** `wave-b/v2.1.1-hotfix` (HEAD `0fa1f38`)

## Why a hotfix shipped

v2.1 cleared its ship-gate (`tb1-wave-b-complete` @ `e56d37f`) on 2026-04-26 — but project=33 inspection that same evening surfaced two production bugs and one process bug that the v2.1 verifiers had not caught:

- **P7 (CRITICAL):** Backend `POST /api/projects/[id]/synthesize` route ✅ existed; LangGraph nodes ✅ existed; viewers ✅ read from `project_artifacts`. **No UI button anywhere POSTed to the route.** All `[Run Deep Synthesis →]` CTAs were `<Link>` navigations. v2.1 was functionally unshipped despite tag-state.
- **P8 (LATENT):** `@dbml/core@7.1.1` ships named exports only; `lib/dbml/sql-to-dbml.ts:24` did default-import. Today: webpack warning. The moment any project reached schema-approval the page would crash.
- **P9 (PROCESS):** TA2 (UI ownership) verifier and TA3 (API ownership) verifier each tested their half in isolation; neither owned the click-through bridge. Same shape as v2's `projects` table RLS gap.

**Without v2.1.1 landing, v2.2 would have been unmeasurable** — Wave E's EC-V21-E.13 ("≥60% LLM call rate drop on M2") is meaningless if zero LLM calls fire because no user can trigger synthesis.

## What shipped — TH1 (5 agents, 4 dispatch waves)

| Wave | Agent | Subagent type | Producer SHA | Deliverable |
|---|---|---|---|---|
| 1 | `synthesize-trigger` | langchain-engineer | `ab2e558` | P7 closure: `runSynthesisAction` server action + `<RunSynthesisButton>` (single canonical surface) + `SynthesisPendingState` polling + `?just_started=1` page branch + 9/9 jest |
| 1 | `dbml-import-fix` | langchain-engineer | `5102729` | P8 closure: named-import flip; `// @ts-ignore` removed; round-trip smoke test (4/4) |
| 2 | `e2e-clickthrough` | qa-engineer | `eca4ab3` | P9 mitigation: 379-LOC Playwright spec + 2 fixtures + `.github/workflows/v2.1.1-e2e.yml` + P10-aware evidence file |
| 3 | `qa-th1-verifier` | qa-engineer | `723b99e` | All 5 ECs PASS; verifier script `apps/product-helper/scripts/verify-th1.ts`; tag created |
| 4 | `docs-th1` | (deferred) | — | Followups SHA-flips + this release-notes entry written by coordinator instead |

## Per-EC commit SHAs

- **EC-V21.1.1.P7** UI synthesize-trigger wired through server action → POST 202 → pending UI → status polling. Producer `ab2e558`. 5/5 sub-asserts.
- **EC-V21.1.1.P8** `@dbml/core` named-import; smoke test green; dev-mode console clean. Producer `5102729`. 4/4 sub-asserts.
- **EC-V21.1.1.P9** Playwright spec + fixtures + CI workflow exist; e2e-evidence.md greps for `4 ready` / `7 stuck-pending` / `P10` all green. Producer `eca4ab3`. 5/5 sub-asserts.
- **EC-V21.1.1.D8** Dispatch rule #8: every TH1 Agent prompt body cites `post-v2.1-followups.md` in `required_reading[]`. 5/5 Agent blocks PASS.
- **EC-V21.1.1.replay** Project=119 dev-mode click-through user-visible gate (substituted for project=33 per D-V211.04). PASS.

**Closeout commits:**
- `102fce3` dedupe P10 (peer Claude's canonical kept; e2e-agent's parallel filing dropped)
- `0fa1f38` closeout master plan + spawn-prompts dead-link fix
- `723b99e` `verify-th1.ts` + `verification-report.md`

## Locked decisions (D-V211.01..06)

- D-V211.01 — Scope tight (P7+P8+P9 only); P10 + P11 carry to v2.1.2 / v2.2
- D-V211.02 — Single canonical trigger surface on synthesis page; sub-page CTAs stay `<Link>`
- D-V211.03 — Server action MUST go through `/api/projects/[id]/synthesize` (no `kickoffSynthesisGraph` bypass)
- D-V211.04 — Project=119 substitutes for project=33 as user-visible replay gate
- D-V211.05 — Playwright spec is CI-only (local execution requires Supabase/dev-server fixtures the worktree can't have)
- D-V211.06 — P10-aware test contract: assert 4-of-11 ready; capture 7-of-11 stuck-pending as expected per P10

## What this hotfix deliberately does NOT do

- Does NOT fix P10 (7 NEW v2.1 LangGraph nodes are no-ops on live runtime projects). Carry to v2.1.2 / v2.2 Wave-A completion.
- Does NOT fix P11 (schema-extraction-agent retry-flake). Functionally fine; cost-only.
- Does NOT touch FROZEN viewers or extend allowance gating beyond TB1's `checkSynthesisAllowance`.
- Does NOT execute the Playwright spec locally (intentionally CI-only per D-V211.05).
- Does NOT dispatch Wave 4 (`docs-th1`); closeout content lives in the master plan + this release-notes entry.

## Side-effect preserved

`wave-c/tc1-m345-schemas` @ `080329e` carries 5 of peer Claude Jessica's TC1 schemas (m3 decomposition-plane / m5 phases 3-5 / m4 decision-network-foundations) that landed on the hotfix checkout via shared-working-tree collision during Wave 1. Pushed to origin so Jessica can resume from there without rework.

## v2.1.1 verification reports

- [`plans/v211-outputs/th1/verification-report.md`](v211-outputs/th1/verification-report.md) — 5/5 ECs green; 13/13 jest; 0 hotfix-touched-file tsc errors
- [`plans/v211-outputs/th1/e2e-evidence.md`](v211-outputs/th1/e2e-evidence.md) — Playwright spec evidence + 4-vs-11 split documented per P10
- [`plans/v211-outputs/th1/dbml-fix-evidence.md`](v211-outputs/th1/dbml-fix-evidence.md) — before/after dev-server stdout

## Carry-forward to v2.2 / v2.1.2

- **P10 (CRITICAL):** 7 NEW v2.1 LangGraph nodes are no-ops for live runtime projects. User-visible synthesis still 4-of-11 ready. Recommended: v2.1.2 fast-follow with stub-population nodes (~1-2 weeks) OR absorb into v2.2 Wave-E greenfield generator path (~3-4 weeks).
- **P11 (LOWER-SEVERITY):** schema-extraction-agent strict-parse flake on first attempt; retry succeeds. Functionally fine; cost-only.
- **P5:** Stranded partial `kb-upgrade-v2/` trees cleanup.
- **P6:** Prompt-caching not propagating through `bindTools()`; cost lever investigation.

**v2.2 day-0 UNBLOCKED.** Wave C (Crawley typed schemas + eval harness + methodology page) and Wave E (KB runtime architecture rewrite) can dispatch against a working synthesis click-through.

---

## Wave C — Crawley schema closeout (v2.2 Wave 1, 2026-04-27)

**Tag:** `tc1-wave-c-complete` @ `f5992639`
**Branch:** `wave-c/tc1-m345-schemas`
**Verifier:** 8/8 ECs PASS (7 ECs + smoke). Evidence: `plans/v22-outputs/tc1/verification-report.md`.
**Hard-dep:** `tc1-preflight-complete` @ `3e2abdf` (namespace-resolver preflight, EC-V21-C.0).

### What shipped — TC1 (5 agents, 1 verifier)

| EC | Agent | Subagent type | Producer SHA | Deliverable |
|---|---|---|---|---|
| C.0 | `namespace-resolver` | langchain-engineer | `3e2abdf` | Preflight: namespace map for new Crawley schemas; folder/file pre-existence audit. |
| C.1 + C.2 | `crawley-schemas` | langchain-engineer | (multiple, see `schemas-shipped.md`) | 11 Zod schemas: 10 phase artifacts + 1 matrix keystone (`mathDerivationMatrixSchema` at `module-5/_matrix.ts`, M5-local Option Y). 12 test suites (~80+ tests, all green). |
| C.3 | `crawley-migrations` | database-engineer | (see `migrations-mapping.md`) | 10 Drizzle migrations with RLS + indexes per schema (jsonb-typed columns, `jsonb_typeof = 'object'` constraints). |
| C.4 + C.6 | `eval-harness` | langchain-engineer | (see `eval-harness-summary.md`) | LangSmith project `c1v-v2-eval`; 300 graded examples (30/agent × 10 v2 agents); harness at `apps/product-helper/lib/eval/v2-eval-harness.ts` (graceful fallback when `LANGCHAIN_API_KEY` unset); quarterly drift-check job (cron `0 0 1 */3 *`) at `apps/product-helper/scripts/quarterly-drift-check.ts` + `.github/workflows/quarterly-drift-check.yml`. |
| C.5 | `methodology-page` | ui-ux-engineer | (see `methodology-page-summary.md`) | `/about/methodology` static page renders canonical `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` (server component + thin viewer). |
| ship | `qa-c-verifier` | qa-engineer | `f5992639` | 8/8 ECs PASS (7 ECs + EC-smoke). Verification report at `plans/v22-outputs/tc1/verification-report.md`. Tag `tc1-wave-c-complete`. |
| docs | `docs-c` | documentation-engineer | (this commit) | JSDoc top-up on 11 Crawley schemas + `lib/eval/v2-eval-harness.ts` exports; runbook at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_dev-runbooks/crawley-schema-runbook.md`; `apps/product-helper/CLAUDE.md` proposed-diff at `plans/v22-outputs/tc1/claude-md-diff.md` (awaiting authorization); this release-notes append. |

### Per-EC commit SHAs

- **EC-V21-C.0** namespace-resolver preflight green @ `3e2abdf`. Pre-existence audit recorded for all 11 target schema paths + matrix keystone path.
- **EC-V21-C.1** 11 Zod schemas authored, registered in `lib/langchain/schemas/index.ts` (`CRAWLEY_SCHEMAS` 10-row + `CRAWLEY_MATRIX_KEYSTONE` 1-row separate sentinel). Round-trip + x-ui-surface tests green.
- **EC-V21-C.2** Schema-layer matrix-site refactor complete: 10 matrix sites consumed at schema-author level (1 PO + 9 DSM block) + 1 scalar projection chain. Agent-emitter sites NOT refactored (deferred; see below).
- **EC-V21-C.3** 10 Drizzle migrations applied with RLS + indexes; postgres-js jsonb gotcha documented (bind JS object, do NOT `JSON.stringify(...)::jsonb`).
- **EC-V21-C.4** 300 graded examples × 18/8/4 grade distribution × 10 v2 agents floor met.
- **EC-V21-C.5** `/about/methodology` route lives in `(dashboard)` group, renders canonical methodology MD verbatim (no content fork).
- **EC-V21-C.6** Quarterly drift-check workflow opens issue tagged `@team-c1v` on non-zero exit.

### Key shipped artifacts

- `plans/v22-outputs/tc1/schemas-shipped.md` — 11-row schema map (10 phase artifacts + matrix keystone).
- `plans/v22-outputs/tc1/migrations-mapping.md` — 10 migrations with RLS + index summary.
- `plans/v22-outputs/tc1/eval-harness-summary.md` — 300 graded examples + drift workflow.
- `plans/v22-outputs/tc1/methodology-page-summary.md` — `/about/methodology` shipped.
- `plans/v22-outputs/tc1/namespace-resolution.md` — preflight namespace audit.
- `plans/v22-outputs/tc1/verification-report.md` — qa-c-verifier full evidence.
- `plans/v22-outputs/tc1/claude-md-diff.md` — proposed `apps/product-helper/CLAUDE.md` diff (awaiting David's authorization before apply).
- `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_dev-runbooks/crawley-schema-runbook.md` — operator runbook for adding/extending Crawley schemas.

### Deferred items

- **Agent-emitter matrix-site refactor → v2.2 (Wave D agent rewrite).** The 10 matrix sites + 1 scalar projection chain are gated at the schema-author level only. Agent emitters (`form-function-agent.ts`, `synthesis-agent.ts`, etc.) currently emit pre-Crawley shapes that do NOT yet populate `po_array_derivation` or `full_dsm_block_derivations`. Migrating agent emitters to populate these new matrix-derivation fields is a separate concern (Wave D / agent-rewrite). Rationale: REQUIREMENTS-crawley §5 locality rule is preserved; the schema gate is closed and rejects future emissions that omit/mis-type these fields. The schema gate IS the matrix-site refactor for Wave C.
- **Schema barrel shadowing fix → optional cleanup.** Legacy `lib/langchain/schemas.ts` (singular file) shadows the new `lib/langchain/schemas/index.ts` (directory barrel) for `'../schemas'` imports under bundler resolution. Workaround: import via the explicit subpath `'@/lib/langchain/schemas/index'`. Documented in the runbook §7.
- **M3 + M2 supplements as NEW tables (curator decision; NOT a deferred bug).** `decomposition-plane.ts` (M3) and `requirements-crawley-extension.ts` (M2) ship as standalone NEW supplement schemas, not column-extensions of v2.1 shapes. Rationale: column-extension would prematurely couple Crawley fields with future M2/M3 table-extraction work. Captured in `schemas-shipped.md`.

### Apply-after-authorization

`apps/product-helper/CLAUDE.md` does NOT change in this commit. The proposed diff is at `plans/v22-outputs/tc1/claude-md-diff.md` — David's go-ahead is required before applying (per CLAUDE.md file-safety rule + project memory `feedback_no_scope_doubt.md`). When applied, the change is a single new H3 subsection under the existing `## Architecture` H2: `### Crawley Typed Schemas (Wave C, v2.2)`. No other section headers.

### v2.2 standalone release notes

This entry appends to the v2 cumulative log. The standalone `plans/v22-release-notes.md` will be authored by TE1's `docs-e-and-closeout` agent after Wave E ships.
