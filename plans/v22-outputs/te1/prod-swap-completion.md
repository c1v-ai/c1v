# prod-swap-completion.md — staging-green sign-off

> **Tag:** `te1-prod-swap-staging-complete` (push at completion).
> **NOT** `te1-prod-swap-complete` — the latter implies the post-7-day-window
> EC-V21-E.13 verdict, which is impossible to ship synchronously.
> Production deploy + 7-day measurement window are coordinator-owned per
> `prod-swap-deploy.md`.

---

## What shipped (staging-green)

### 1. Consolidation merge — 8 deliverable branches

Merged onto `wave-e/te1-engine-integration` base (which already carried
the schema + `wave-e-evaluator` + barrel + clarification-detector revert
+ drop-singular). Per-merge SHAs:

| # | Branch                              | Merge commit |
|---|-------------------------------------|--------------|
| 1 | `wave-e/te1-engine-stories`         | `f6ec4f7`    |
| 2 | `wave-e/te1-engine-fail-closed`     | `d8bd616`    |
| 3 | `wave-e/te1-engine-context`         | `6bf0085`    |
| 4 | `wave-e/te1-engine-pgvector`        | `fd3c11b`    |
| 5 | `wave-e/te1-engine-gap-fill`        | `2bf0a93` (1 conflict resolved: `surface-gap.ts` — kept gap-fill's complete version with `MaxTurnsExceededError` + `bridgeConvToKey`) |
| 6 | `wave-e/te1-audit-writer`           | `4c3b36b`    |
| 7 | `wave-e/te1-greenfield-refactor`    | `e7389bb` (no conflict; agent-greenfield-refactor's task #53 already threaded `auditContext` through 7 nodes pre-merge) |
| 8 | `wave-e/te1-kb-rewrite`             | `5fa89bd` (1 conflict resolved: `m4-synthesis-keystone.fixtures.json` — kept engine-stories' predicate-fix version) |
| 9 | `wave-e/te1-provenance-ui`          | `3cbf3b4`    |

### 2. ta1-integration test verdict

```
Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
```

11 original (TA1 disposition coverage + Wave A↔E pin) + 6 new
implementation-independence proof tests (3 `llm` + 3 `engine` describe
blocks).

### 3. DI swap delivered

| Deliverable                                     | Commit |
|-------------------------------------------------|--------|
| `synthesis_metrics_total` counter helper        | `0b687f5` |
| `lib/langchain/graphs/nodes/generate-nfr.ts`    | `d92caba` |
| `lib/langchain/graphs/nodes/generate-constants.ts` | `d92caba` |
| `createIntakeGraph({ nfrImpl })` factory in `intake-graph.ts` | `244e798` |
| Implementation-independence proof tests         | `a782406` |

The DI factory exposes `nfrImpl: 'llm' | 'engine'` per the team-context
LOCKED swap mechanism. Default is `'llm'` (v2.1 baseline). The
production default-flip is the one-line change in `prod-swap-deploy.md`
under coordinator ownership.

### 4. Boot-time wiring

`apps/product-helper/instrumentation.ts` (commit `504fcc6`) registers
on Node runtime boot:

- `setBridgeAdapter({ surfaceOpenQuestion })` — wires the v2.1 bridge
  into the Wave-E `surfaceGap` producer.
- `onOpenQuestionReply('wave_e_engine', waveEReplyHandler)` — settles
  user replies on `pending_answer` rows.
- `setSentryTransport(...)` — installs a Sentry-shaped transport that
  forwards to `@sentry/nextjs` IF the SDK is installed; otherwise the
  in-process counter remains the only source of truth (production
  observability requires SDK adoption — see "Open coordinator decisions"
  below).

### 5. Measurement script

`apps/product-helper/scripts/verify-llm-call-rate-drop.ts` (commit
`8c4b18f`). CLI:

```bash
pnpm tsx scripts/verify-llm-call-rate-drop.ts \
  --baseline=plans/v21-outputs/observability/sentry-baseline-2026-04-27.json \
  --postswap=path/to/postswap-export.json \
  --threshold=0.60
```

Exit codes: 0 = pass, 1 = fail (drop or overlapping CIs), 2 = deferred
(input file unreadable / `status: gap_surfaced` / null counts).

Smoke-tested all 3 paths during the staging build:
- Baseline-with-gap-surfaced → exit 2 (correct).
- Synthetic 80% drop, 100 projects, non-overlapping CIs → exit 0.
- Synthetic 20% drop → exit 1.

### 6. tsc + jest baseline

- `npx tsc --noEmit --project tsconfig.json` → 5 baseline errors only
  (pre-existing: `lib/db/schema/index.ts` traceback imports +
  `scripts/atlas/validate-entries.ts` js-yaml). No new errors introduced
  by the consolidation merge or any deliverable.
- ta1-integration: 17/17 green.

---

## Open coordinator decisions (NOT in this commit)

1. **`@sentry/nextjs` SDK adoption.** Per spawn-prompt guardrail, this
   agent did NOT silently add the dependency. `instrumentation.ts`
   detects the SDK at runtime (`tryImportSentry()` returns null if not
   installed) and falls back to a no-op transport. The 7-day measurement
   window REQUIRES production observability — coordinator must approve
   the dependency add before flipping the default. Pre-flight checklist
   in `prod-swap-deploy.md` blocks the flip until this is resolved.

2. **Production default-flip + 7-day measurement window.** Coordinator
   owns the one-line change to flip `nfrImpl` default from `'llm'` to
   `'engine'`. Runbook in `prod-swap-deploy.md`.

3. **`sentry-baseline-2026-04-27.json` flip from `gap_surfaced` to
   `captured`.** Engine-core surfaced the gap in Day-0 capture.
   Coordinator-owned: pick a 48h window post-v2.1.1 deploy, scrape Sentry,
   overwrite the file. Until this lands, `verify-llm-call-rate-drop.ts`
   exits 2 on the baseline file (verified during smoke-test).

---

## What's NOT in scope here

- Production default-flip (coordinator-owned).
- 7-day measurement window evaluation (coordinator-owned; gated on the
  `@sentry/nextjs` decision above).
- Adding new LLMs to model-router (engine-stories' G11 pinned the
  existing set).
- Modifying the v2.1 contract pin envelope (`nfr_engine_contract_version: 'v1'`).
- Re-authoring any deliverable branch's work.

---

## Acceptance signal

- [x] Consolidation merge complete: 9 commits across 8 branches.
- [x] ta1-integration 11/11 (original) + 6 new = 17/17 green.
- [x] Both `'llm'` and `'engine'` impls pass the implementation-independence proof.
- [x] Chat-route init wiring shipped via `instrumentation.ts`.
- [x] Sentry transport wiring shipped (with documented no-op fallback).
- [x] Measurement script shipped + smoke-tested.
- [x] `prod-swap-deploy.md` runbook shipped.
- [x] Tag `te1-prod-swap-staging-complete` ready to push.

EC-V21-E.12 (DI swap shipped) — staging-green: **CLOSED**.
EC-V21-E.13 (≥60% LLM-call-rate drop) — measurement script shipped, gate
not yet evaluable. **Path-of-record documented.**
EC-V21-E.14 (11-of-11 click-through) — greenfield-refactor closed 7-of-7
NEW + 4 pre-v2.1 still green per their P10 closure evidence
(`plans/v22-outputs/te1/p10-closure-evidence.md`). **Verified at
consolidation.**
