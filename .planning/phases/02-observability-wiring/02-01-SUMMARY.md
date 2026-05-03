---
phase: 02-observability-wiring
plan: 01
status: complete
completed: 2026-05-02
requirements: [OBS-01, OBS-02]
wave: 1
---

# Plan 02-01 Summary: OBS-01/02 Confirmed Wired; OBS-03 Human Gate Documented

## One-liner
Wave E already shipped `setSentryTransport` and `synthesis_metrics_total` emission — Phase 2 tracking was stale; OBS-03 is the only remaining gate (48h prod traffic).

## What Was Done

Verified both OBS-01 and OBS-02 are already implemented in source:

**OBS-01 — setSentryTransport at boot:**
- `instrumentation.ts:56` calls `setSentryTransport({ captureMessage, captureException })` wired to `@sentry/nextjs`
- Committed in Wave E feat `504fcc6`
- Evidence: `grep -n "setSentryTransport" apps/product-helper/instrumentation.ts` → line 56

**OBS-02 — synthesis_metrics_total on LLM-only path:**
- `generate-nfr.ts:92`: `recordSynthesisMetricsTotal({ module: 'm2', impl: 'llm-only', llm_invoked: true })`
- `generate-constants.ts:56`: same call on constants path
- `intake-graph.ts:488`: `const nfrImpl: NfrImpl = options.nfrImpl ?? 'llm'` — llm-only is the active default
- Evidence: grep confirms presence on both paths

**Tracking updates:**
- REQUIREMENTS.md: OBS-01 and OBS-02 marked `[x]` with evidence references
- ROADMAP.md: Phase 2 description corrected from stale postmortem to actual state
- STATE.md: Phase 2 marked in-progress (OBS-03 pending), focus shifted to Phase 3 (can run in parallel)
- `sentry-baseline-2026-04-27.json`: status updated from `gap_surfaced` → `wired_awaiting_traffic`

## OBS-03 Remaining Work (Human Gate)

After ≥48h of production traffic (earliest 2026-05-04 ~19:35 EDT):
1. Query Sentry for `synthesis_metrics_total` events filtered by `module=m2,impl=llm-only`
2. Update `plans/v21-outputs/observability/sentry-baseline-2026-04-27.json` with real `total_calls`, `status: "captured"`, `captured_at`
3. Mark OBS-03 `[x]` in REQUIREMENTS.md

## Self-Check: PASSED
- [x] OBS-01 confirmed in instrumentation.ts:56
- [x] OBS-02 confirmed in generate-nfr.ts:92 + generate-constants.ts:56
- [x] REQUIREMENTS.md updated
- [x] ROADMAP.md corrected
- [x] STATE.md advanced
- [x] sentry-baseline status = wired_awaiting_traffic

## Key Files
- `apps/product-helper/instrumentation.ts:56` — setSentryTransport call site
- `apps/product-helper/lib/langchain/graphs/nodes/generate-nfr.ts:92` — llm-only counter
- `apps/product-helper/lib/langchain/graphs/nodes/generate-constants.ts:56` — llm-only counter
- `plans/v21-outputs/observability/sentry-baseline-2026-04-27.json` — updated baseline
