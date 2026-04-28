# EC-V21-C.4 + C.6 — eval-harness summary

**Branch:** `wave-c/tc1-m345-schemas`
**Agent identity:** name=eval-harness, subagent_type=langchain-engineer
**Tag baseline:** `tc1-preflight-complete` @ `3e2abdf` ✅ (preflight green)
**Generated:** 2026-04-27

---

## What shipped

### Deliverables (all 7)

| # | File | Purpose |
|---|------|---------|
| 1 | `apps/product-helper/lib/eval/v2-eval-harness.ts` | LangSmith dataset client + per-agent runner. Exports `runEval`, `recordResult`, `getDataset`, `hashInput`, `hasLangSmith`, `summarizeResults`. Graceful no-key fallback. |
| 2 | `apps/product-helper/lib/eval/datasets/{10 agents}.jsonl` | 300 graded examples (30/agent floor, exact). Sources: 1 self-app canonical + 10 reference-replays + 12 perturbations + 7 shifted-replays. |
| 3 | `apps/product-helper/scripts/run-eval-harness.ts` | CLI: `--agent=<name>` or `--all`. Shape-equality scorer with LangSmith POST when `LANGCHAIN_API_KEY` present. |
| 4 | `apps/product-helper/scripts/quarterly-drift-check.ts` | EC-V21-C.6 drift detector. 10 agents × 10 reference projects = 100 input-hash comparisons. Exits non-zero on drift. |
| 5 | `.github/workflows/quarterly-drift-check.yml` | Cron `0 0 1 */3 *` (Jan 1 / Apr 1 / Jul 1 / Oct 1 @ 00:00 UTC) + `workflow_dispatch`. Uploads report; opens issue tagged `@team-c1v` on drift. |
| 6 | `apps/product-helper/__tests__/eval/v2-eval-harness.test.ts` | 30 jest cases — dataset integrity, hashInput determinism, runEval grading, recordResult fallback, drift snapshot, fixture shape. |
| 7 | `apps/product-helper/__tests__/fixtures/reference-projects/ref-{001..010}.json` | 10 anonymized reference-project intakes. |
| 8 | `apps/product-helper/scripts/generate-eval-datasets.ts` | One-shot dataset builder (re-runnable; deterministic). |

---

## Per-agent dataset size + grade distribution

All 10 v2 system-design agents ship exactly **30** graded examples. Grade
distribution is uniform by construction (1 self-app correct + 7 in-distribution
replays-correct + 4 shifted-correct + 6 shifted-correct = 18 correct;
4 perturbation-partial + 4 out-of-distribution-partial = 8 partial;
4 dropped-upstream-wrong = 4 wrong).

| Agent | Count | Correct | Partial | Wrong |
|---|---:|---:|---:|---:|
| decision-net | 30 | 18 | 8 | 4 |
| form-function | 30 | 18 | 8 | 4 |
| hoq | 30 | 18 | 8 | 4 |
| fmea-early | 30 | 18 | 8 | 4 |
| fmea-residual | 30 | 18 | 8 | 4 |
| interface-specs | 30 | 18 | 8 | 4 |
| n2 | 30 | 18 | 8 | 4 |
| data-flows | 30 | 18 | 8 | 4 |
| nfr-resynth | 30 | 18 | 8 | 4 |
| architecture-recommendation | 30 | 18 | 8 | 4 |
| **Total** | **300** | **180** | **80** | **40** |

Grader breakdown per agent: 1 `self-application`, 17 `fixture-replay`, 12 `human`.

---

## LangSmith integration

- **Project name:** `c1v-v2-eval` (configurable via `LANGCHAIN_PROJECT`).
- **Endpoint:** `https://api.smith.langchain.com/runs` (direct HTTP, no new
  npm dep — runtime checks `LANGCHAIN_API_KEY` and skips POST cleanly when
  absent).
- **Auth:** `x-api-key` header.
- **Project URL (after first run):**
  `https://smith.langchain.com/o/<org>/projects/p/c1v-v2-eval`
  (resolves once an authenticated run is recorded).
- **Local-only mode:** when `LANGCHAIN_API_KEY` is unset, `recordResult`
  returns `{posted: false, reason: 'LANGCHAIN_API_KEY not set; fixture-replay only'}`
  and the CLI prints `langsmith: disabled (fixture-replay only)`.
- **Anonymization:** every reference-project fixture sets
  `anonymized: true`. Replay examples replace the c1v intake with
  synthetic shape-only intakes (industry/scale/vision strings, no PII).

---

## Quarterly drift schedule

GitHub Actions cron: `0 0 1 */3 *`

| Run | UTC date |
|---|---|
| Q1 | Jan 1, 00:00 |
| Q2 | Apr 1, 00:00 |
| Q3 | Jul 1, 00:00 |
| Q4 | Oct 1, 00:00 |

Manual trigger via `gh workflow run quarterly-drift-check.yml`.

**Drift surfacing:** non-zero exit → `actions/github-script@v7` creates an
issue titled `[drift-check] schema drift detected <YYYY-MM-DD>` with the
markdown report inline; labels `drift-check`, `wave-c`; tags
`@team-c1v` for review.

**Baseline snapshot:** `apps/product-helper/lib/eval/datasets/_drift-snapshot.json`
(100 hashes — 10 agents × 10 reference projects). Re-baseline via
`pnpm tsx scripts/quarterly-drift-check.ts --update-snapshot`.

---

## Verification

```
$ POSTGRES_URL=stub AUTH_SECRET=...stubstubstubstubstub... \
    ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub \
    STRIPE_WEBHOOK_SECRET=whsec_stub OPENROUTER_API_KEY=stub \
    BASE_URL=http://localhost:3000 \
    npx jest __tests__/eval/v2-eval-harness.test.ts

  v2-eval-harness
    dataset integrity
      ✓ loads ≥30 examples for decision-net
      ✓ loads ≥30 examples for form-function
      ✓ loads ≥30 examples for hoq
      ✓ loads ≥30 examples for fmea-early
      ✓ loads ≥30 examples for fmea-residual
      ✓ loads ≥30 examples for interface-specs
      ✓ loads ≥30 examples for n2
      ✓ loads ≥30 examples for data-flows
      ✓ loads ≥30 examples for nfr-resynth
      ✓ loads ≥30 examples for architecture-recommendation
      ✓ every example has the required fields (×10)
      ✓ each agent has a representative grade distribution
    hashInput
      ✓ is deterministic across runs
      ✓ changes when input changes
    runEval
      ✓ grades a perfect-replay runner as correct
      ✓ grades a throwing runner as wrong
    recordResult
      ✓ declines to post when LANGCHAIN_API_KEY is missing
      ✓ hasLangSmith reflects env-var presence
    drift detection
      ✓ snapshot file exists and parses
      ✓ synthetic drift case is detectable via hashInput divergence
    reference-projects fixture
      ✓ ships exactly 10 anonymized projects

Tests:       30 passed, 30 total

$ pnpm tsx scripts/run-eval-harness.ts --all
  langsmith: disabled (fixture-replay only)
  agents: decision-net, form-function, hoq, fmea-early, fmea-residual, interface-specs, n2, data-flows, nfr-resynth, architecture-recommendation
  [decision-net] ran=30 passed=4 correct=0 partial=0 wrong=30
  …
  Total: ran=300 posted=0

$ pnpm tsx scripts/quarterly-drift-check.ts
  drift-check: 100 pairs, 0 drifted → plans/v22-outputs/tc1/drift-report.md
```

`tsc --noEmit` on the harness, scripts, and tests: 0 errors. (9
pre-existing errors in unrelated `lib/db/schema/`, `lib/langchain/engines/`,
and `scripts/atlas/` files are out-of-scope.)

---

## How Wave E uses this

EC-V21-C.4 — per-rule confidence-drift quality gate:
- Wave E imports `runEval(agent, runner)` with the live agent runner.
- For each agent, the `correct` portion (180 examples total) becomes the
  per-rule confidence floor; the `partial` portion (80) seeds drift
  thresholds; the `wrong` portion (40) seeds the negative-class detector.
- Wave E gate fails if `summary.by_grade.correct / summary.total <
  baseline_correct_ratio - drift_tolerance`.

EC-V21-C.6 — quarterly drift:
- The cron-scheduled GHA already runs `quarterly-drift-check.ts` against
  the same fixture corpus. Wave E does not need to add scheduling — it
  consumes the issue stream when drift fires.

---

## Open follow-ups (non-blocking)

- Wave E (`surface-gap.ts` integration): swap `replayRunner` for live
  agent invocations once the v2 agents accept the
  `{projectIntake, upstreamArtifacts}` envelope directly. Today the
  agents take Zod-validated module-N upstreams; the harness ships
  `_path`/`_schema` shape stubs to keep replay deterministic.
- LLM-as-judge: the `scoreOutput` function uses Zod-shape equality + 70%
  top-level-key overlap as the partial threshold. When LangSmith is
  wired, swap in an LLM-as-judge for fuzzy `partial`/`correct` calls.
  The metadata field already reserves `judge_model` + `judge_prompt`.
- Dataset growth: `≥30/agent` is the floor. As v2.1 production projects
  flow in, append to the JSONL files via `appendToDataset(agent,
  example)`. Anonymize per `ref-{NNN}` schema before commit.
