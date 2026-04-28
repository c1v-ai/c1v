---
agent: qa-e-verifier
team: c1v-kb-runtime-engine
wave: E (TE1)
verdict_shape: staging-aware
parent_branch: wave-e/te1-engine-prod-swap @ 8d17c3d
verifier_branch: wave-e/te1-qa-verifier
created: 2026-04-27
---

# TE1 / Wave E Verification Report

> Per-EC verdict for EC-V21-E.0 through EC-V21-E.14 against the consolidated
> branch `wave-e/te1-engine-prod-swap` HEAD `8d17c3d`. Staging-aware shape:
> EC-V21-E.13 = `DEFERRED-COORDINATOR-OWNED` pending production deploy +
> 7-day window + `@sentry/nextjs` SDK adoption.

## Verdict matrix

| EC    | Verdict   | Summary |
|-------|-----------|---------|
| E.0   | PASS      | Source plan rewrite committed; tag `wave-e-pre-rewrite-2026-04-26` exists |
| E.1   | PASS      | Interpreter + DSL + clarification-detector revert + baseline JSON (gap_surfaced) all on disk |
| E.2   | PASS      | ContextResolver covers M1/M2/M4/M5/M8 (24/24 unit tests green) |
| E.3   | PASS      | `decision_audit` table + RLS + append-only; `writeAuditRow()` wired into evaluateWaveE; chain verifier shipped |
| E.4   | PASS      | fail-closed runner + schema + tests shipped (17/17 green) |
| E.5   | PASS      | `surface-gap.ts` + bridge wiring + multi-turn integration test (7/7 green) |
| E.6   | PASS      | pgvector + 0011a_kb_chunks + 0026 RLS + 7670 rows local; p95 = 86.2ms; HNSW SKIP documented |
| E.7   | PASS      | PII redactor + prompt-injection detector + model-router + openrouter-client all shipped |
| E.8   | PASS      | 13 engine.json files + 13 fixtures files (104 fixtures total, 8 each); 40/40 golden-rules green |
| E.9   | PASS      | 80 phase docs in 6-section shape (7+16+16+0+5+12+11+10+3); 1841/1841 conformance green |
| E.10  | PASS      | 0 schema extensions shipped per HANDOFF Correction 4 (TC1 covers everything Wave-E needs) |
| E.11  | PASS      | provenance UI: button + panel + override-form + types + 2 API routes + section-rationale wire-up; explain_decision LangGraph node shipped |
| E.12  | PASS      | DI factory `createIntakeGraph({ nfrImpl })` shipped; both `'llm'` + `'engine'` impls pass ta1-integration (17/17 green) |
| E.13  | **DEFERRED-COORDINATOR-OWNED** | Measurement script + runbook + baseline file all on disk; **production deploy + 7-day window + Sentry SDK adoption are coordinator-owned**. `verify-llm-call-rate-drop.ts` exits 2 on `status: gap_surfaced` (correct). |
| E.14  | PASS      | live-project test 2/2 green; 7 NEW v2.1 nodes wired to engine helper; `'given fixture intake'` literal present in all 7 node tests |

**Total:** 15 ECs; **14 PASS** + **1 DEFERRED-COORDINATOR-OWNED** + **0 FAIL** → **STAGING GREEN**.

## Per-EC evidence

### EC-V21-E.0 — PASS

- `plans/kb-runtime-architecture.md` exists (source plan path rewritten 2026-04-25 per stub).
- `git tag --list 'wave-e-pre-rewrite-2026-04-26'` returns the tag.

### EC-V21-E.1 — PASS

- `apps/product-helper/lib/langchain/engines/predicate-dsl.ts` ✓
- `apps/product-helper/lib/langchain/engines/nfr-engine-interpreter.ts` ✓
- `apps/product-helper/lib/langchain/engines/wave-e-evaluator.ts` ✓ (wraps with v2.2 contract envelope)
- `plans/v21-outputs/observability/sentry-baseline-2026-04-27.json` ✓ (`status: gap_surfaced` per engine-core's Day-0 capture; coordinator owns the captured-flip)
- `apps/product-helper/lib/langchain/agents/intake/clarification-detector.ts` reverted to pre-Wave-E heuristicCheck() form at commit `6be31ea`.

### EC-V21-E.2 — PASS

- `engine-context-coverage.md` declares 5 representative phase decisions covered (M1/M2/M4/M5/M8).
- `lib/langchain/engines/__tests__/{artifact-reader,context-resolver}.test.ts` 24/24 green during verifier run.
- M8-asymmetry note documented in coverage doc (`module-8-risk` folder slug not in MODULE_SLUGS enum; signals fallback path used).

### EC-V21-E.3 — PASS

- `0011b_decision_audit.sql` shipped 2026-04-22 (full EngineOutput shape; hash_chain_prev; RLS; append-only).
- `audit-writer.ts` ships `writeAuditRow()` + `auditInputFromEngineOutput()` mapper (34/34 unit tests green).
- `wave-e-evaluator.ts` wires `writeAuditRow` (grep confirms).
- `audit-writer-column-mapping.md` declares 0 schema gaps; no DELTA migration shipped (correct per Day-0 inventory line 119).
- `scripts/verify-decision-audit-chain.ts` walker present (exit codes 0/1/2/3 per docstring).

### EC-V21-E.4 — PASS (with soft-finding)

- `fail-closed-runner.ts` + `schemas/engines/fail-closed.ts` + 17/17 tests green.
- **Soft-finding:** `plans/v22-outputs/te1/fail-closed-audit.md` does NOT exist on disk in the consolidated branch, despite being referenced by:
  - kb-rewrite-summary.md `§1` (frontmatter `fail_closed_audit:` template).
  - prod-swap-completion.md.
  - 80 phase-file frontmatters (set during γ-rewrite).
- The runner + schema + tests + registry are sufficient for fail-closed gate to function. The audit catalog doc is documentation-only (does not block runtime). Verdict remains PASS but the doc gap is surfaced for `docs-e-and-closeout` to address before issuing the eventual `te1-wave-e-complete` (without `-staging`).

### EC-V21-E.5 — PASS

- `surface-gap.ts` + `lib/chat/system-question-bridge.ts` (BridgeAdapter wiring per `instrumentation.ts`).
- `wave-e-multi-turn-integration.test.ts` 7/7 green during verifier run.
- `surface-gap.test.ts` covers SurfaceGap producer + MaxTurnsExceededError path.

### EC-V21-E.6 — PASS

- Migrations: `0008_enable_pgvector.sql`, `0011a_kb_chunks.sql`, `0026_kb_chunks_rls.sql` (DELTA RLS).
- Runtime: `kb-embedder.ts` (7.4K) + `kb-search.ts` (3.1K) — NOT re-authored per Day-0 line 120.
- Local Supabase row count: 7670 across 11 module/source buckets.
- p95 = 86.2ms < 200ms target; HNSW upgrade SKIP per `engine-pgvector-decision.md` (recipe documented for re-engagement triggers).
- 8/8 RLS smoke tests green (`__tests__/db/kb-chunks-rls.test.ts`).

### EC-V21-E.7 — PASS

- `pii-redactor.ts` + `prompt-injection-detector.ts` (input-side guards).
- `model-router.ts` + `openrouter-client.ts` (dynamic routing for refine band).
- engine-stories doc-only confirmation: pre-shipped in plural; no re-author.

### EC-V21-E.8 — PASS

- 13/13 engine.json files at `.planning/engines/`: m1-data-flows, m2-constants, m2-nfr, m3-ffbd, m4-decision-network, m4-synthesis-keystone, m5-form-function, m5-form-function-morphological, m6-qfd, m7-interfaces, m7-n2, m8-fmea-early, m8-fmea-residual.
- 13/13 fixtures files; 104 fixtures total (≥5 per story).
- 40/40 `golden-rules.test.ts` green during verifier run.
- All 13 engine.json files Zod-validate against `engineDocSchema`.

### EC-V21-E.9 — PASS

- 80 phase files distributed: M1=7, M2=16, M3=16, M4=0 (by construction), M5=5, M6=12, M7=11, M8=10, M9=3.
- `_legacy_2026-04-26/` snapshot dir exists (rollback anchor for γ-rewrite).
- `__tests__/kb/phase-file-shape.test.ts` 1841/1841 green during verifier run.

### EC-V21-E.10 — PASS

- `kb-rewrite-summary.md` declares "0 schema extensions shipped" per HANDOFF-2026-04-27 Correction 4.
- TC1 schemas (11 from `tc1-wave-c-complete` @ `f5992639`) cover M2/M3/M4/M5; γ-shape does not require additional Zod gates.
- Future extensions are explicitly additive-only; no TC1 schema modification permitted.

### EC-V21-E.11 — PASS

- LangGraph data side: `lib/langchain/graphs/nodes/explain-decision.ts` (kb-rewrite scope).
- UI side (provenance-ui scope): button + panel + override-form + types + explain/override API routes.
- 5 EXTEND-target wires confirmed: section-rationale.tsx (verified by grep), recommendation-viewer.tsx, alternative-picker.tsx, architecture-diagram-pane.tsx, architecture-and-database-section.tsx.
- 5/5 `why-this-value-panel.test.tsx` green during verifier run.
- Append-row override pattern (Option A, locked 2026-04-27) honored — REVOKE UPDATE preserved.
- NO attachment to FROZEN-list viewers (per fix-up Correction 3). Verified via `git diff` zero-modifications check.

### EC-V21-E.12 — PASS

- `intake-graph.ts` ships `createIntakeGraph({ nfrImpl: 'llm' | 'engine' })` factory at commit `244e798`.
- `generate-nfr.ts` + `generate-constants.ts` thread `nfrImpl` (commit `d92caba`).
- `intake-graph.ta1-integration.test.ts` runs 17/17 green during verifier run (11 original + 6 implementation-independence proof tests; one describe block per impl).
- **Implementation-independence proof PASSES** — both `'llm'` and `'engine'` impls produce v1 envelope; engine impl deterministic (inputs_hash stable across runs).

### EC-V21-E.13 — DEFERRED-COORDINATOR-OWNED

- `apps/product-helper/scripts/verify-llm-call-rate-drop.ts` shipped + smoke-tested 3 paths during staging build (pass / fail / deferred).
- `plans/v21-outputs/observability/sentry-baseline-2026-04-27.json` on disk; `status: gap_surfaced` (correct — engine-core could not capture live metrics; coordinator-owned flip to `captured` after deploy).
- `plans/v22-outputs/te1/prod-swap-deploy.md` runbook documents 7-day window + Sentry SDK adoption pre-flight.
- Verifier run: `pnpm tsx scripts/verify-llm-call-rate-drop.ts --baseline=... --postswap=<gap_surfaced.json>` returns exit code 2 (deferred-not-failed) with the documented message — confirms the gate is wired correctly.
- **Coordinator decision items still outstanding:**
  1. `@sentry/nextjs` SDK adoption (David-owned).
  2. Production default-flip (`nfrImpl: 'llm' → 'engine'`) (David-owned).
  3. 7-day measurement window + scrape + baseline file flip to `status: captured` (post-deploy).
- **Verdict shape rationale:** the staging tag (`te1-wave-e-staging-complete`) accepts E.13 = DEFERRED. The eventual `te1-wave-e-complete` (without `-staging`) upgrades E.13 → PASS once production traffic confirms the ≥60% drop.

### EC-V21-E.14 — PASS

- `intake-graph.live-project.test.ts` 2/2 green during verifier run (7-of-7 NEW + 4 pre-v2.1 still green per p10-closure-evidence).
- All 7 NEW v2.1 generate-* nodes wired to `evaluateEngineStory()` (substrate-read, not stub-consumer).
- 7/7 node test files contain literal `'given fixture intake'` (success-path test enforcement per fix-up Correction 1).
- p10-closure-evidence.md captures `0 pending → 11 pending → 11 ready` framing (single integer count across NEW + pre-v2.1 nodes).

## Pre-existing test failures inherited from upstream branches

Per engine-prod-swap's flag (13/971 pre-existing failures, of which the verifier confirmed):

- `lib/langchain/engines/__tests__/engine-loader.test.ts` — 2 failures (`throws EngineValidationError for duplicate decision_ids` + `loadEngines fails fast on first bad slug`). Per p10-closure-evidence.md: schema doesn't yet enforce; orthogonal to P10 / Wave E. Pre-existing on the engine-stories deliverable branch and inherited at consolidation.

These pre-existing failures are **NOT** introduced by any Wave E deliverable and do **NOT** block the staging tag.

## Static-scan findings

- Dispatch rule #8 (every TE1 spawn-prompt body MUST contain literal `wave-e-day-0-inventory.md`): static-scan **deferred to coordinator-side review** — spawn prompts are not on disk in a single file accessible from this verifier worktree. Per spawn-prompt §3 explicit allowance.
- Success-path test enforcement (literal `'given fixture intake'` in all 7 NEW v2.1 node tests): **PASS** — 2 occurrences per file (describe block + test name), 14 total across 7 files.

## Coordinator-decision items still outstanding

1. **`@sentry/nextjs` SDK adoption** (David-owned). Required for E.13 measurement window. `instrumentation.ts` detects SDK at runtime and falls back to no-op transport per spawn-prompt guardrail.
2. **Production default-flip** of `nfrImpl` from `'llm'` → `'engine'` (David-owned, one-line change in `intake-graph.ts`'s default).
3. **7-day measurement window** post-production-deploy. Coordinator scrapes Sentry, overwrites `sentry-baseline-2026-04-27.json` with `status: captured`, then re-runs `verify-llm-call-rate-drop.ts`. On ≥60% drop, E.13 flips PASS and `te1-wave-e-complete` (without `-staging`) issues.
4. **`fail-closed-audit.md`** doc on disk — soft-finding under E.4. `docs-e-and-closeout` agent's scope.

## Tag policy

This verification work issues `te1-wave-e-staging-complete` against HEAD of `wave-e/te1-qa-verifier` (after `verify-te1.ts` + this report + the e2e evidence doc commit). The staging suffix mirrors `te1-prod-swap-staging-complete`'s explicit choice — production observability is required for the non-suffixed tag.

## Cross-references

- Master plan: `plans/c1v-MIT-Crawley-Cornell.v2.2.md` §Wave E
- Day-0 inventory: `plans/wave-e-day-0-inventory.md`
- Fix-up handoff: `plans/HANDOFF-2026-04-27-v2.2-fixup.md`
- Per-deliverable summaries: `plans/v22-outputs/te1/{audit-writer-column-mapping,engine-context-coverage,engine-pgvector-summary,engine-stories-summary,kb-rewrite-summary,p10-closure-evidence,prod-swap-completion,prod-swap-deploy,provenance-ui-summary}.md`
- Verifier script: `apps/product-helper/scripts/verify-te1.ts`
- E2E evidence: `plans/v22-outputs/te1/te1-e2e-evidence.md`
- Parent branch HEAD: `wave-e/te1-engine-prod-swap` @ `8d17c3d`
- Verifier branch: `wave-e/te1-qa-verifier`
