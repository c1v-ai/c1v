# prod-swap-deploy.md — Wave-E EC-V21-E.12 / EC-V21-E.13 production runbook

> **Owner:** Coordinator (David). `engine-prod-swap` ships staging-green +
> the runbook + the measurement script; the production default-flip and
> 7-day measurement window are coordinator-owned.

---

## Pre-flight checks

Before running the production default-flip, confirm:

- [ ] `te1-prod-swap-staging-complete` tag exists on `wave-e/te1-engine-prod-swap`.
- [ ] All 9 deliverable agents' tags exist (`te1-engine-stories-complete`,
      `te1-engine-fail-closed-complete`, `te1-engine-pgvector-complete`,
      `te1-engine-context-complete`, `te1-engine-gap-fill-complete`,
      `te1-audit-writer-complete`, `te1-greenfield-refactor-complete`,
      `te1-kb-rewrite-complete`, `te1-provenance-ui-complete`).
- [ ] Staging has been smoke-tested with `nfrImpl: 'engine'` for at least
      one full intake flow (manual click-through covering M0 → M2 → M8).
- [ ] `plans/v21-outputs/observability/sentry-baseline-2026-04-27.json`
      has `status: 'captured'` (NOT `gap_surfaced`). If still
      `gap_surfaced`, run the baseline-capture sub-task FIRST per the
      file's `next_action` block.
- [ ] `@sentry/nextjs` is installed in `apps/product-helper/package.json`
      AND `SENTRY_DSN` is set in production env. (If missing, the
      `instrumentation.ts` Sentry block falls back to a no-op transport
      and no `synthesis_metrics_total` events ship to Sentry — the 7-day
      window cannot be evaluated. Coordinator must approve SDK adoption
      before flipping the default.)

---

## Default-flip (the swap)

**One-line change** in `apps/product-helper/lib/langchain/graphs/intake-graph.ts`:

```diff
 export function createIntakeGraph(options: CreateIntakeGraphOptions = {}) {
-  const nfrImpl: NfrImpl = options.nfrImpl ?? 'llm';
+  const nfrImpl: NfrImpl = options.nfrImpl ?? 'engine';
```

Steps:

1. Open a PR titled `chore(wave-e): flip nfrImpl default 'llm' -> 'engine'`.
2. Required reviewers: David + qa-e-verifier.
3. Body: link this runbook + paste the `te1-prod-swap-staging-complete`
   tag SHA + paste the `synthesis_metrics_total` baseline numbers.
4. Merge to `main` only after CI green AND staging-green confirmation.
5. Deploy via the standard Vercel flow (`vercel deploy --prod`).
6. Confirm the deploy lands by hitting `/api/health` (or equivalent) and
   verifying the build hash matches the merge commit.

The flip is atomic and reversible by reverting the one-line change. There
is no schema migration, no backfill, no data movement. Engine evaluation
is purely deterministic per-decision; no warm-up window required.

---

## Post-deploy 7-day measurement window

**Day 0 (deploy day):** Note the deploy timestamp. Reset (or note current
value of) the `synthesis_metrics_total{module="m2",impl="engine-first"}`
counter on the Sentry side so the post-swap window starts clean.

**Days 1–6:** Daily spot-check on Sentry that:
- `synthesis_metrics_total{module="m2",impl="engine-first"}` is incrementing.
- `synthesis_metrics_total{module="m2",impl="llm-only"}` is NOT
  incrementing on the M2 RE-WIRE path (the v2.1 LLM-only NFR/constants
  agents should no longer be invoked). Some impl=llm-only events may
  continue from the 4 pre-v2.1 nodes (qfd / interfaces / ffbd /
  decision-matrix); those are expected and labeled with their respective
  modules, not m2.
- No spike in `evaluateWaveE` errors (`WaveEAuditWriteError`,
  `WaveEAuditContextRequiredError`).

**Day 7:** Export Sentry counters to `postswap-export.json` (same JSON
shape as the baseline file — see `sentry-baseline-2026-04-27.json` for
schema). Required fields: `total_calls`, `projects_observed`, `label`
containing `impl=engine-first`, `status: 'captured'`.

Run the measurement:

```bash
cd apps/product-helper
pnpm tsx scripts/verify-llm-call-rate-drop.ts \
  --baseline=../../plans/v21-outputs/observability/sentry-baseline-2026-04-27.json \
  --postswap=../../path/to/postswap-export.json \
  --threshold=0.60
```

Exit codes:
- `0` — drop >= 60% AND non-overlapping 95% CIs. **Pass.**
- `1` — drop < 60% OR overlapping CIs. **Fail.** Investigate before
  declaring EC-V21-E.13 closed.
- `2` — input file unreadable / status='gap_surfaced' / total_calls null.
  Pre-condition not met; not a verdict.

---

## Rollback

If the 7-day window shows pass-rate degradation, error spike, or any
correctness regression flagged by qa-e-verifier:

1. Revert the default-flip PR (`git revert <sha>`).
2. Deploy the revert.
3. Confirm `synthesis_metrics_total{impl="llm-only"}` resumes.
4. File a `wave-e-followups.md` entry capturing the regression for
   investigation. Do NOT silently leave the engine path off — document
   the trigger.

The revert is idempotent and safe to apply at any point; engine evaluation
state is per-decision (no shared mutable state across requests).

---

## Acceptance — EC-V21-E.13

- Day 7 measurement script returns exit 0.
- Drop fraction reported in JSON output >= 0.60.
- Non-overlapping 95% CIs reported.
- qa-e-verifier signs off in `plans/v22-outputs/qa-e/closeout.md`.
- This file's "Acceptance" checkbox is checked off and committed.

- [ ] EC-V21-E.13 closed: drop = ____ %, baseline_label = ____, postswap_label = ____, qa-e-verifier sign-off SHA = ____.
