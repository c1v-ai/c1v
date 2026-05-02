---
phase: 01-intake-synthesis-diagnose-fix
plan: 02
status: complete
completed: 2026-05-02
requirements: [INTK-01, INTK-04]
wave: 2
---

# Plan 02 Summary: Fix emitNfrContractEnvelope

## One-liner
Fixed two-line root cause in `emitNfrContractEnvelope` — reads `nonFunctionalRequirements` (not `nfrs`) from `mergedData`, coerces empty arrays to null, and gives constants its own `m2_constants` source tag.

## What Was Done

**Task 1 — Fix extract-data.ts (3 changes):**
- Line ~166: `ed?.['nfrs']` → `nfrsRaw?.length ? nfrsRaw : null` reading from `ed?.['nonFunctionalRequirements']`
- Line ~167: `ed?.['constants']` → `ed?.['constants'] ?? null` (explicit null for Wave E)
- Line ~199: `source: 'm2_nfr'` → `source: kind === 'nfr' ? 'm2_nfr' : 'm2_constants'` (fixes source collision)

**Task 2 — Document HG7/HG8 in validator.ts:**
- Added `// INTK-04 deferred:` comments to both soft-gate functions explaining why `const passed = true` is intentional

## Test Results
| File | Before | After |
|------|--------|-------|
| extract-data.test.ts | 2 RED / 2 GREEN | **4/4 GREEN** |
| validator tests | all pass | all pass (no regression) |

## Notable Finding
`emitOne` was using `source: 'm2_nfr'` for both nfr and constants calls. The test exposed this — filtering by source incorrectly caught constants-path calls. Fixed by making source kind-dependent.

## Commits
- `b18e5e6` — fix(INTK-01): read nonFunctionalRequirements in emitNfrContractEnvelope; fix constants source tag

## Self-Check: PASSED
- [x] `ed?.['nonFunctionalRequirements']` with empty-array→null coercion
- [x] constants source is now `m2_constants`
- [x] 2 INTK-04 deferred comments in validator.ts
- [x] extract-data.test.ts: 4/4 passing
- [x] pnpm type-check exits 0
