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
