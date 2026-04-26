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

Tracked in [`plans/post-v2-followups.md`](post-v2-followups.md). `projects` has `ENABLE ROW LEVEL SECURITY` but ships zero tenant policies; downstream EXISTS-gated policies (e.g., on `project_run_state`) cannot fire from non-owner Postgres roles. Not actively bleeding — Clerk auth gates routes (defense-in-depth, not the only barrier). Pre-dates T6. Recommended for the post-v2 P3 security pass.

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

