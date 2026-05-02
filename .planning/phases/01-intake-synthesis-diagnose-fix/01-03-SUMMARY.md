---
phase: 01-intake-synthesis-diagnose-fix
plan: 03
status: complete
completed: 2026-05-02
requirements: [INTK-03]
wave: 2
---

# Plan 03 Summary: Fix transformToValidationData

## One-liner
Exported `transformToValidationData` from `check-prd-spec.ts` and fixed the `outOfScope: []` hardcode and `inScope` semantic mismatch — real extraction data now flows through to the PRD validator.

## What Was Done

Three surgical edits to `apps/product-helper/lib/langchain/graphs/nodes/check-prd-spec.ts`:

1. **Export keyword** — `function transformToValidationData` → `export function transformToValidationData` (enables test import and future reuse)
2. **outOfScope fix** — `outOfScope: []` → `outOfScope: extractedData.systemBoundaries.outOfScope ?? []` (real data when present, empty array as fallback)
3. **inScope fix** — `inScope: extractedData.systemBoundaries.internal` → `inScope: extractedData.systemBoundaries.inScope ?? extractedData.systemBoundaries.internal` (prefers explicit field, falls back to internal for backward compat)

## Test Results
| File | Before | After |
|------|--------|-------|
| check-prd-spec.test.ts | 4 RED (no export) | **4/4 GREEN** |

## Commits
- `5e205d9` — fix(INTK-03): export transformToValidationData + fix outOfScope/inScope mappings

## Self-Check: PASSED
- [x] `export function transformToValidationData` present
- [x] `outOfScope: extractedData.systemBoundaries.outOfScope ?? []`
- [x] `inScope` uses `??` operator with internal fallback
- [x] check-prd-spec.test.ts: 4/4 passing
- [x] pnpm type-check exits 0
- [x] No other test regressions
