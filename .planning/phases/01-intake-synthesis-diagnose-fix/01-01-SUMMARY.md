---
phase: 01-intake-synthesis-diagnose-fix
plan: "01"
subsystem: intake-extraction
tags: [tdd, red-phase, unit-tests, nfr-envelope, outofscope-mapping, crawley-gate]
dependency_graph:
  requires: []
  provides:
    - acceptance-bar for INTK-01 (emitNfrContractEnvelope status:'ready')
    - acceptance-bar for INTK-02 (Crawley gate isolation confirmed)
    - acceptance-bar for INTK-03 (transformToValidationData outOfScope/inScope)
    - acceptance-bar for INTK-04 (surfaceOpenQuestion not called when NFRs present)
  affects:
    - plans/01-02 (extract-data source fix must turn Tests 1+2 GREEN)
    - plans/01-03 (check-prd-spec export + mapping fix must turn Tests 1+3 GREEN)
tech_stack:
  added: []
  patterns:
    - jest.mock hoisted before imports (module-level mock pattern)
    - env stubs as first lines before any import (strict env validator)
    - filesystem-scan test pattern (readdirSync/readFileSync, no dynamic imports)
key_files:
  created:
    - apps/product-helper/lib/langchain/graphs/nodes/__tests__/extract-data.test.ts
    - apps/product-helper/lib/langchain/graphs/nodes/__tests__/check-prd-spec.test.ts
    - apps/product-helper/__tests__/crawley-gate-check.test.ts
  modified: []
decisions:
  - "Tests import via public API (extractData) to test private emitNfrContractEnvelope — avoids export churn"
  - "check-prd-spec RED achieved via missing export — all 4 tests fail at runtime (not compile time) due to ts-jest"
  - "crawley-gate-check uses filesystem scan rather than dynamic import — avoids triggering env validator in production modules"
metrics:
  duration: "18m"
  completed: "2026-05-02"
  tasks_completed: 3
  files_created: 3
---

# Phase 1 Plan 01: TDD RED Scaffold Summary

Three test scaffold files that lock the acceptance bar for Phase 1 bug fixes. Bug-covering tests are RED against current source; baseline tests are GREEN.

## One-liner

TDD RED scaffold: 3 test files, 10 tests total — 6 RED pinning INTK-01/03/04 bugs, 4 GREEN confirming baselines + Hypothesis B false.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | extract-data.test.ts — RED for emitNfrContractEnvelope | 47410f6 | `lib/langchain/graphs/nodes/__tests__/extract-data.test.ts` |
| 2 | check-prd-spec.test.ts — RED for transformToValidationData | 089042a | `lib/langchain/graphs/nodes/__tests__/check-prd-spec.test.ts` |
| 3 | crawley-gate-check.test.ts — GREEN regression guard | ca94ac4 | `apps/product-helper/__tests__/crawley-gate-check.test.ts` |

## Test Results (against current source)

### extract-data.test.ts (4 tests: 2 RED, 2 GREEN)

| # | Test | Status | Why |
|---|------|--------|-----|
| 1 | does NOT surface m2_nfr question when NFRs non-empty | RED | `emitNfrContractEnvelope` reads `ed['nfrs']` (wrong field) — always undefined — always takes null-path → `surfaceOpenQuestion` called |
| 2 | persists nfrs_v2 with status 'ready' when NFRs non-empty | RED | same null-path bug → `persistArtifact` called with `status:'pending'` |
| 3 | surfaces m2_nfr question when NFRs empty | GREEN | correct null-path baseline |
| 4 | persists nfrs_v2 even when surfaceOpenQuestion throws | GREEN | try/catch in null-path is non-fatal |

### check-prd-spec.test.ts (4 tests: 4 RED)

| # | Test | Status | Why |
|---|------|--------|-----|
| 1 | maps real outOfScope when populated | RED | `transformToValidationData` not exported → TypeError at runtime |
| 2 | defaults outOfScope to [] when absent | RED | same import error (will pass once export added in plan 03) |
| 3 | maps explicit inScope instead of internal | RED | same import error (will remain RED until mapping fix) |
| 4 | falls back to internal when inScope absent | RED | same import error (will pass once export added in plan 03) |

### crawley-gate-check.test.ts (2 tests: 2 GREEN)

| # | Test | Status | Why |
|---|------|--------|-----|
| 1 | no graph node imports CRAWLEY_SCHEMAS | GREEN | Hypothesis B confirmed false — no production node imports the Crawley barrel |
| 2 | no graph node imports from schemas/index | GREEN | same — schemas/index is verifier/docs-only, not wired into production nodes |

## TDD Gate Compliance

RED gate: All three commits are `test(...)` commits — RED phase committed before any source changes.
GREEN gate: Will be achieved in plans 01-02 (extract-data fix) and 01-03 (check-prd-spec export + mapping fix).

## Deviations from Plan

None — plan executed exactly as written. The `__tests__/` subdirectory under nodes did not exist and was created as part of Task 1 (expected per plan instructions).

## Known Stubs

None. These are test-only files with no stub data flowing to UI rendering.

## Threat Flags

None. Test files only; no new network endpoints, auth paths, or schema changes.

## Self-Check: PASSED

Files exist:
- `apps/product-helper/lib/langchain/graphs/nodes/__tests__/extract-data.test.ts` — FOUND
- `apps/product-helper/lib/langchain/graphs/nodes/__tests__/check-prd-spec.test.ts` — FOUND
- `apps/product-helper/__tests__/crawley-gate-check.test.ts` — FOUND

Commits exist:
- `47410f6` — FOUND (test(phase-1): RED tests for emitNfrContractEnvelope)
- `089042a` — FOUND (test(phase-1): RED tests for transformToValidationData)
- `ca94ac4` — FOUND (test(phase-1): GREEN regression guard for Crawley gate)
