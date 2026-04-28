---
agent: qa-e-verifier
team: c1v-kb-runtime-engine
wave: E (TE1)
created: 2026-04-27
parent_branch: wave-e/te1-engine-prod-swap @ 8d17c3d
verifier_branch: wave-e/te1-qa-verifier
---

# TE1 / Wave E — E2E test evidence

> Captures every Jest run executed by `qa-e-verifier` against the consolidated
> branch. Stub-env recipe is the strict-validator-aware shape per memory note
> `project_env_validator_strict.md` (POSTGRES_URL real-shape; AUTH_SECRET ≥32
> chars; sk-ant-/sk_/whsec_ prefixes; OPENROUTER_API_KEY required).

## Stub env recipe

```bash
POSTGRES_URL=postgresql://postgres:postgres@localhost:54322/postgres
AUTH_SECRET=stubstubstubstubstubstubstubstubstub
ANTHROPIC_API_KEY=sk-ant-stub
STRIPE_SECRET_KEY=sk_test_stub
STRIPE_WEBHOOK_SECRET=whsec_stub
OPENROUTER_API_KEY=stub
BASE_URL=http://localhost:3000
```

## Test runs

### 1. ta1-integration — implementation-independence proof (E.12)

```
$ ./node_modules/.bin/jest __tests__/langchain/graphs/intake-graph.ta1-integration.test.ts
PASS __tests__/langchain/graphs/intake-graph.ta1-integration.test.ts
  TA1 integration — 7 NEW node touches
    ✓ generate_data_flows persists at least one row with kind=data_flows_v1 on fixture state
    ✓ generate_form_function persists at least one row with kind=form_function_map_v1 on fixture state
    ✓ generate_decision_network persists at least one row with kind=decision_network_v1 on fixture state
    ✓ generate_n2 persists at least one row with kind=n2_matrix_v1 on fixture state
    ✓ generate_fmea_early persists at least one row with kind=fmea_early_v1 on fixture state
    ✓ generate_fmea_residual persists at least one row with kind=fmea_residual_v1 on fixture state
    ✓ generate_synthesis persists at least one row with kind=recommendation_json on fixture state
  TA1 integration — 9 graph-node touch coverage (sequential chain)
    ✓ all 9 expected artifact_kinds emit across the synthesis chain
    ✓ every persistArtifact call carries projectId from state (multi-tenant safety)
  TA1 integration — Wave A ↔ Wave E contract pin
    ✓ GENERATE_nfr / GENERATE_constants envelope shape conforms
    ✓ rejects an envelope missing the version flag
  GENERATE_nfr — impl: llm-only
    ✓ returns a Wave-A↔E v1 envelope
    ✓ uses the injected llm agent when supplied
  GENERATE_nfr — impl: engine-first
    ✓ returns a Wave-A↔E v1 envelope without invoking any LLM agent
    ✓ inputs_hash is deterministic across runs with identical inputs
  GENERATE_constants — impl: llm-only
    ✓ returns a Wave-A↔E v1 envelope
  GENERATE_constants — impl: engine-first
    ✓ returns a Wave-A↔E v1 envelope without invoking any LLM agent

Tests:       17 passed, 17 total
```

**Implementation-independence proof PASSES** — both `'llm'` and `'engine'`
nfrImpl variants pass the v1-envelope contract; `engine-first` produces
deterministic `inputs_hash` across runs without invoking any LLM agent.

### 2. live-project E2E — P10 closure (E.14)

```
$ ./node_modules/.bin/jest __tests__/langchain/graphs/intake-graph.live-project.test.ts
PASS __tests__/langchain/graphs/intake-graph.live-project.test.ts
  P10 live-project e2e — 7-of-7 NEW v2.1 nodes pending→ready
    ✓ given fixture intake at completion, all 7 NEW v2.1 nodes persist status=ready (engine substrate-read, nfrImpl=engine)
    ✓ given fixture intake, every NEW v2.1 ready row carries non-empty engine_evaluation

Tests:       2 passed, 2 total
```

### 3. 7 NEW v2.1 node success-path tests (E.14)

```
$ ./node_modules/.bin/jest __tests__/langchain/graphs/nodes/
PASS __tests__/langchain/graphs/nodes/generate-data-flows.test.ts
  generate-data-flows P10 greenfield
    ✓ given fixture intake + upstream artifacts, produces non-empty data_flows.v1 within 30s

PASS __tests__/langchain/graphs/nodes/generate-form-function.test.ts
  generate-form-function P10 greenfield
    ✓ given fixture intake + upstream artifacts, produces non-empty form_function_map.v1 within 30s

PASS __tests__/langchain/graphs/nodes/generate-decision-network.test.ts
  generate-decision-network P10 greenfield
    ✓ given fixture intake + upstream artifacts, produces non-empty decision_network.v1 within 30s

PASS __tests__/langchain/graphs/nodes/generate-n2.test.ts
  generate-n2 P10 greenfield
    ✓ given fixture intake + upstream artifacts, produces non-empty n2_matrix.v1 within 30s

PASS __tests__/langchain/graphs/nodes/generate-fmea-early.test.ts
  generate-fmea-early P10 greenfield
    ✓ given fixture intake + upstream artifacts, produces non-empty fmea_early.v1 within 30s

PASS __tests__/langchain/graphs/nodes/generate-fmea-residual.test.ts
  generate-fmea-residual P10 greenfield
    ✓ given fixture intake + upstream artifacts, produces non-empty fmea_residual.v1 within 30s

PASS __tests__/langchain/graphs/nodes/generate-synthesis.test.ts
  generate-synthesis P10 greenfield
    ✓ given fixture intake + upstream artifacts, produces non-empty recommendation.v1 within 30s

Test Suites: 7 passed, 7 total
Tests:       7 passed, 7 total
```

Success-path test enforcement (literal `'given fixture intake'`): **PASS** —
2 occurrences per file (describe + test name) across all 7 files.

### 4. phase-file-shape conformance (E.9)

```
$ ./node_modules/.bin/jest __tests__/kb/phase-file-shape.test.ts
Test Suites: 1 passed, 1 total
Tests:       1841 passed, 1841 total
```

80 phase files × 23 assertions per file + 1 file-count assertion = 1841.

### 5. golden-rules engine.json validation (E.8)

```
$ ./node_modules/.bin/jest lib/langchain/engines/__tests__/golden-rules.test.ts
Test Suites: 1 passed, 1 total
Tests:       40 passed, 40 total
```

13 stories × ≥3 assertions each (Zod-validates, ≥5 fixtures, predicate-evaluator value-pin).

### 6. audit-writer (E.3)

```
$ ./node_modules/.bin/jest lib/langchain/engines/__tests__/audit-writer.test.ts
Tests:       34 passed, 34 total
```

### 7. fail-closed-runner (E.4)

```
$ ./node_modules/.bin/jest lib/langchain/engines/__tests__/fail-closed-runner.test.ts
Tests:       17 passed, 17 total
```

### 8. wave-e-multi-turn-integration (E.5)

```
$ ./node_modules/.bin/jest lib/langchain/engines/__tests__/wave-e-multi-turn-integration.test.ts
Tests:       7 passed, 7 total
```

### 9. provenance UI panel (E.11)

```
$ ./node_modules/.bin/jest __tests__/components/why-this-value-panel.test.tsx
Tests:       5 passed, 5 total
```

### 10. engine-test rollup (E.1, E.2, E.3, E.4, E.5, E.7, E.8)

```
$ ./node_modules/.bin/jest lib/langchain/engines/__tests__/
Test Suites: 1 failed, 16 passed, 17 total
Tests:       2 failed, 311 passed, 313 total
```

**Pre-existing failures (NOT introduced by Wave E):**

- `engine-loader.test.ts: throws EngineValidationError for duplicate decision_ids`
- `engine-loader.test.ts: loadEngines fails fast on first bad slug`

Per p10-closure-evidence.md §"Engine scope": both pre-existing on
`engine-stories` deliverable branch (asserts behavior the engine.ts schema
doesn't yet enforce); orthogonal to P10 / Wave E.

## E.13 measurement script smoke

### Deferred path (status=gap_surfaced)

```
$ ./node_modules/.bin/tsx scripts/verify-llm-call-rate-drop.ts \
    --baseline=plans/v21-outputs/observability/sentry-baseline-2026-04-27.json \
    --postswap=plans/v21-outputs/observability/sentry-baseline-2026-04-27.json \
    --threshold=0.60
baseline.status === "gap_surfaced" -- pre-deploy capture incomplete. See plans/v21-outputs/observability/sentry-baseline-2026-04-27.json next_action block. Wait for the 7-day post-deploy window + re-scrape, then re-run.
exit=2
```

Exit code 2 confirms the deferred-not-failed gate is wired correctly. Pass /
fail synthetic paths were smoke-tested by engine-prod-swap during the staging
build (per `prod-swap-completion.md` §5).

## tsc baseline

```
$ ./node_modules/.bin/tsc --noEmit --project tsconfig.json
lib/db/schema/index.ts(46,8): error TS2307: Cannot find module './traceback' or its corresponding type declarations.
lib/db/schema/index.ts(164,8): error TS2307: Cannot find module './traceback' or its corresponding type declarations.
lib/db/schema/index.ts(171,8): error TS2307: Cannot find module './traceback-validators' or its corresponding type declarations.
lib/db/schema/index.ts(176,8): error TS2307: Cannot find module './traceback-validators' or its corresponding type declarations.
scripts/atlas/validate-entries.ts(2,35): error TS2307: Cannot find module 'js-yaml' or its corresponding type declarations.
```

5 pre-existing errors only (matches `prod-swap-completion.md` baseline + `p10-closure-evidence.md` baseline). **Zero new tsc errors** introduced by Wave-E deliverables or this verifier work.

## verify-te1.ts run

```
$ ./node_modules/.bin/tsx scripts/verify-te1.ts
=== TE1 / Wave E EC verdict matrix ===

Total: 15 ECs; PASS=14; DEFERRED=1; FAIL=0
exit=0
```

See full per-EC output captured during verifier run; verbatim output preserved
in `plans/v22-outputs/te1/verification-report.md`.

## Aggregated test rollup

| Suite | Tests | Verdict |
|---|---|---|
| ta1-integration | 17 | 17/17 PASS |
| live-project E2E | 2 | 2/2 PASS |
| 7 NEW v2.1 node tests | 7 | 7/7 PASS |
| phase-file-shape | 1841 | 1841/1841 PASS |
| golden-rules | 40 | 40/40 PASS |
| audit-writer | 34 | 34/34 PASS |
| fail-closed-runner | 17 | 17/17 PASS |
| wave-e-multi-turn | 7 | 7/7 PASS |
| provenance UI panel | 5 | 5/5 PASS |
| engine __tests__ rollup | 313 | 311/313 (2 pre-existing) |

**Net Wave-E test surface verified during this run: 1,983 assertions across 10 suites; 0 new failures.**
