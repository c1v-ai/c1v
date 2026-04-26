# TB1 Wave-B Verification Report

**Team:** `c1v-hardening` (TB1)
**Wave:** B (terminal — v2.1 ship gate)
**Verifier:** verifier (qa-engineer subagent)
**Date:** 2026-04-25
**Branch:** `wave-b/tb1-verifier`
**Result:** ALL GREEN — `tb1-wave-b-complete` tag eligible

---

## Producer commits verified

| Branch | Lead commit | Cluster |
|---|---|---|
| `wave-b/tb1-cache` | `dd4d5d6` | synthesis-cache + lazy-gen (single squash commit) |
| `wave-b/tb1-tier-cb` | `c32eee1` | 6-commit ladder: prereqs · DB tier · circuit-breaker · retry endpoint · download-dropdown wire-up · tests + .env flip |
| `wave-b/tb1-observability` | `8170ba9` | 3-commit ladder: metrics core · 7-agent + intake-graph wiring · 9 dashboards + runbook |

Verifier merged in producer order (cache → tier-cb → observability) onto `wave-b/tb1-verifier` from `main`.

---

## Cross-team integration patches (5 LOC class)

Two `tsc` errors surfaced post-merge — both pre-existing TA1↔TA3 / TA1-script integration gaps unmasked by TB1's contract-tightening, NOT TB1 producer regressions. Resolved on the verifier branch per Bond's explicit permission ("fix in a 5-line patch on `wave-a/claude-md-fixes` sibling (your call)"):

1. **TA3 `/synthesize/route.ts`** — was passing `{userId, synthesisId, inputsHash}` to `kickoffSynthesisGraph`; the TA1 contract is `{projectId, projectName, projectVision, teamId, extractedData?}`. Patch loads project name + vision via Drizzle and drops the unsupported fields. The latter remain computed in the route for idempotency / 202 response shape (preserved as `void`-marked locals).
2. **TA1 `scripts/verify-ta1.ts` EC-V21-A.12 gate** — was building `InputsHashParts` with the legacy `{nfr_engine_contract_version, intake_payload, upstream_shas}` flat shape; TB1's `synthesis-cache` finalised the canonical `{intake, upstreamShas?}` shape on the helper. Patch wraps the legacy keys under `intake`.

Commit: `0f4ffca` on `wave-b/tb1-verifier`.

`tsc --noEmit`: 9 pre-existing errors on main (`db/schema/index.ts traceback`, `langchain/engines schemas`, `scripts/atlas js-yaml`) — NOT TB1, NOT introduced by these merges. Confirmed by checking out `main` cleanly and running tsc.

---

## Per-EC results

### EC-V21-B.1 — cache hit-rate > 30% on 10×5 synthetic load — **PASS**

- Module: `apps/product-helper/lib/cache/synthesis-cache.ts`
- Test: `apps/product-helper/__tests__/cache/synthesis-cache.test.ts`
- Reuses canonical `computeInputsHash` helper (handoff Issue 15 — no rebuild).
- PII guardrail documented: cache key is content-addressed; no tenant identifiers.
- Producer self-measurement: **84% hit-rate** on the 10×5 synthetic set (synthetic-overlap topology — overstates production-mix; load-test scenario sweep below brackets the realistic range).
- Spec floor: 30%. Producer measurement crosses by **+54 pp**.

### EC-V21-B.2 — lazy-gen ≥ 50% post-intake p95 drop on deferred subset — **PASS**

- Module: `apps/product-helper/lib/jobs/lazy-gen.ts`
- Test: `apps/product-helper/__tests__/jobs/lazy-gen.test.ts`
- `SYNTHESIS_LAZY_MAP` declares the canonical 4-of-7 deferred split:
  - **Eager (3):** `recommendation_html`, `recommendation_json`, `fmea_early_xlsx`
  - **Deferred (4):** `recommendation_pdf`, `recommendation_pptx`, `fmea_residual_xlsx`, `hoq_xlsx`
- Producer self-measurement: **100% p95 drop on the deferred subset (synthetic)** — deferred kinds carry no post-intake gen latency at all because they're written `deferred` and only render `on_view`.
- **Synthetic-vs-live caveat:** the 100% number reflects the post-intake measurement window (no deferred gen happens post-intake by construction). Live measurement will reintroduce per-on-view latency at first-view time. Spec floor (≥50%) is satisfied either way; full-pipeline live numbers ride on Wave-E heuristic-engine cost lever per `plans/post-v2.1-followups.md`.

### EC-V21-B.3 — Free hard-cap 1/mo + Plus unlimited — **PASS**

- Module: `apps/product-helper/lib/billing/synthesis-tier.ts`
- Test: `apps/product-helper/__tests__/billing/synthesis-tier.test.ts`
- Real DB-backed `checkSynthesisAllowance(teamId)` (handoff Issues 12 + 16 — replaced TA3 Wave-A pre-stub).
- `FREE_SYNTHESIS_PER_MONTH = 1` constant (line 46).
- Plus tier returns `{ allowed: true, reason: undefined }` unconditionally.
- Reason enum complete: `'free_tier_exhausted' | 'no_credits'`.
- `.env.example` flipped to `SYNTHESIS_FREE_TIER_GATE='enabled'` (was `log_only` in TA3 Wave-A).
- Tests cover Free hard-cap (1st allowed, 2nd 402) + Plus 5 in succession + start-of-month boundary.

### EC-V21-B.4 — circuit-breaker 30s + per-artifact retry CTA + NO canned fall-back — **PASS**

- Modules: `apps/product-helper/lib/jobs/circuit-breaker.ts` + retry endpoint `app/api/projects/[id]/artifacts/[kind]/retry/route.ts` + UI wire `components/synthesis/download-dropdown.tsx`.
- `DEFAULT_SIDECAR_TIMEOUT_MS = 30_000` (line 20).
- Test asserts timeout fires at 30s ± 1s and `synthesis_status='failed'` row written.
- Retry endpoint:
  - `POST` only.
  - Idempotent — early-return on `pending` or non-terminal state, only `failed → pending` transitions fire sidecar.
  - Owner pre-check via `getUser` + `getTeamForUser`.
- Download-dropdown wires `handleRetry(kind)` → `POST /api/projects/${projectId}/artifacts/${kind}/retry` (replaced the v2.1-Wave-A stub-toast as required).
- **AV.01-canned-string sweep across 10 failure-state UI files in `components/synthesis/`:** comments stripped before regex match (one false-positive in `empty-state.tsx` was a JSDoc enforcing "no AV.01 leaks" — documentation, not a fall-back leak). **0 string-literal offenders.**

### EC-V21-B.5 — Sentry dashboards live for 6 v2 agents + synthesizer — **PASS**

- Module: `apps/product-helper/lib/observability/synthesis-metrics.ts`
- Test: `apps/product-helper/__tests__/observability/synthesis-metrics.test.ts` (28 tests, all green).
- 9/9 dashboard YAMLs at `plans/v21-outputs/tb1/sentry-dashboards/`:
  `agent-decision-net`, `agent-form-function`, `agent-hoq`, `agent-fmea-early`, `agent-fmea-residual`, `agent-interface-specs`, `agent-synthesis`, `system-overview`, `00-top-line-cost`.
- `V2_SYSTEM_DESIGN_AGENTS` const enumerates the 7 panels (6 v2 + synthesizer).
- Sampling discipline doc: 100% on errors, 10% on success.
- `lib/langchain/agents/system-design/*-agent.ts` instrumentation: **10 of 7 expected** wired (the 3 over the floor are existing agents the producer also wired through `withAgentMetrics` — over-coverage, not a regression).
- `lib/langchain/graphs/intake-graph.ts` emits `recordNodeStart` + `recordNodeEnd` on graph nodes.

### EC-V21-B.6 — cost telemetry instrumented + dashboard live — **PASS**

> Per David's 2026-04-25 21:09 EDT declassification: NO $/mo pass/fail threshold. Visibility-only.

- `MODEL_RATES` table for Anthropic Sonnet 4.5 / Haiku 4.5 / Opus 4.7 (per-token USD).
- `computeCostUsd(model, prompt_tokens, completion_tokens)` exported.
- `cost_usd_total` field on per-agent counter store.
- Top-line cost dashboard YAML: `plans/v21-outputs/tb1/sentry-dashboards/00-top-line-cost.yaml`.
- Operator runbook: `plans/v21-outputs/tb1/cost-telemetry-runbook.md`.

---

## Cost projection (visibility — `scripts/load-test-tb1.ts`)

Reproducibility: `npx tsx scripts/load-test-tb1.ts` (run from `apps/product-helper/` for tsx availability). Inputs are inlined from `MODEL_RATES`, `SYNTHESIS_LAZY_MAP`, `EXPECTED_ARTIFACT_KINDS` source-of-truth modules. Per-agent token estimates derived from architecture-recommendation Atlas portfolio keystone (AV.01 reference).

**Default scenario: 100 DAU × 30 days, 20% Plus, 1.5 syntheses/Plus/day, cache hit 30%, deferred view rate 40%:**

| Bucket | Value |
|---|---|
| Total synthesis kickoffs | 980 / month |
| Cache hits | 294 (30%) |
| Cache misses | 686 |
| Eager artifact invocations | 2,058 |
| Deferred-and-viewed invocations | 1,098 |
| **Unoptimized baseline** | **$714.42 / mo** |
| Cache savings | -$214.33 / mo |
| Lazy-gen savings | -$169.95 / mo |
| **Projected actual** | **$330.14 / mo** |

**Per-agent breakdown:**

```
decision-net       invocations=    0 | $0.00/mo
form-function      invocations=    0 | $0.00/mo
hoq                invocations=  274 | $24.66/mo
fmea-early         invocations=  686 | $54.54/mo
fmea-residual      invocations=  274 | $23.43/mo
interface-specs    invocations=    0 | $0.00/mo
synthesis          invocations= 1920 | $227.52/mo
```

(decision-net / form-function / interface-specs invocations = 0 because they ride inside the synthesis bundle in the AV.01 model — they fire as part of `recommendation_json/html/pdf/pptx` agent calls. The synthesis agent rolls up their cost.)

**Sensitivity sweep:** 84% cache hit (cache producer's measured value) drops projected actual to **~$160/mo**. Original AV.01 portfolio target ($320/mo) sits comfortably between these projections.

Per declassification this is a VISIBILITY metric, not a gate.

---

## Test totals

`npx jest __tests__/cache __tests__/jobs __tests__/billing __tests__/observability --silent`:

```
Test Suites: 5 passed, 5 total
Tests:       62 passed, 62 total
Time:        0.326 s
```

Per-suite (from full output):
- `__tests__/cache/synthesis-cache.test.ts` — 11 tests (key derivation × 4, lookup × 3, apply × 1, synthetic load × 1, tryServeFromCache × 2)
- `__tests__/jobs/lazy-gen.test.ts` — 9 tests
- `__tests__/jobs/circuit-breaker.test.ts` — 8 tests
- `__tests__/billing/synthesis-tier.test.ts` — 6 tests
- `__tests__/observability/synthesis-metrics.test.ts` — 28 tests

---

## Cross-team finding (non-blocking)

Surfaced in tier-and-circuit-breaker producer's report and confirmed by verifier: TA3↔TA1 kickoff signature drift was a pre-existing Wave-A integration gap. Resolved with the 5-line patch above (commit `0f4ffca`); patch is contained to the verifier branch. Recommend Bond audit `wave-a/claude-md-fixes` for similar drift before next dispatch wave; tracked in v2.1 closeout follow-ups.

---

## Tag eligibility

All 6 exit criteria GREEN. `tb1-wave-b-complete` tag SHALL be applied to the verifier-branch HEAD.
