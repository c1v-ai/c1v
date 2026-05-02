# Roadmap: c1v v2.2.1+ QA

**Created:** 2026-05-02
**Granularity:** coarse (3 phases)
**Mode:** interactive
**Coverage:** 7/7 v1 requirements mapped

## Core Value

The intake conversation must surface actors and constraints well enough that downstream synthesis agents can generate non-trivial NFRs, engineering constants, and system-design artifacts — otherwise the product fails its core promise.

## Phases

- [ ] **Phase 1: Intake Extraction Fix** — `extract_data` reliably populates `actors` + `outOfScope`, unblocking downstream NFR/constants synthesis
- [ ] **Phase 2: Observability Wiring** — `setSentryTransport` called at boot, counter emitting on LLM-only path, baseline captured
- [ ] **Phase 3: pgvector Phase B Ingest Recovery** — dedup-key collision diagnosed, ingest re-runs, prod `kb_chunks` populated

## Phase Details

### Phase 1: Intake Extraction Fix
**Goal:** The LangGraph intake extraction pipeline reliably surfaces `actors` and `systemBoundaries.outOfScope` from natural-language conversation, so downstream synthesis agents (NFR derivation, engineering constants) receive enough structured upstream context to produce non-trivial output instead of "I don't have enough upstream context."
**Depends on:** Nothing (independent QA fix on the core product path)
**Requirements:** INTK-01, INTK-02, INTK-03

**Root Causes (from architecture trace):**

1. **`outOfScope` never populated** — `check-prd-spec.ts:224` has `outOfScope: []` hardcoded in `transformToValidationData`. The field is typed in `ProjectValidationData.systemBoundaries.outOfScope` but the extraction pipeline never writes to it. HG1 can't verify the out-of-scope boundary. `inScope` and `internal` are mapped to the same array (double-counted).

2. **HG7 + HG8 soft gates are regex no-ops** — HG7 (success criteria) and HG8 (constraints) run regex against the `vision` string. Any reasonable project description passes them. They always contribute `passed: true` to the score, artificially inflating `overallScore` and allowing the system to reach synthesis without real constraint data. The `overallScore` denominator includes their sub-checks, which never fail.

3. **`kbStepConfidence` floor is 0 for Steps 3-6** — `calculateStepConfidence` in `kb-question-generator.ts` has no cases for `ffbd`, `decision-matrix`, `qfd-house-of-quality`, or `interfaces` — falls through to `default: return 0`. For Phase 2 (Steps 3-6), the KB confidence override gate relies on LLM-only signal with no deterministic floor, making it unreliable.

4. **Downstream synthesis context gap** — NFR derivation and engineering-constants agents receive the `extractedData` blob. If `actors` is sparse/empty and `systemBoundaries.outOfScope` is always empty, those agents correctly report "insufficient upstream context." The fix is upstream (make extraction richer), not in the synthesis agents themselves.

**Files to touch:**
| File | Change |
|------|--------|
| `lib/langchain/graphs/nodes/check-prd-spec.ts` | Fix `transformToValidationData` to map `outOfScope` from extracted data; decouple `inScope`/`internal` double-count |
| `lib/validation/validator.ts` | Harden HG7 + HG8 to check actual `extractedData` constraint/criteria fields, not regex on `vision` string |
| `lib/langchain/agents/intake/kb-question-generator.ts` | Add `calculateStepConfidence` cases for `ffbd`, `decision-matrix`, `qfd-house-of-quality`, `interfaces` (deterministic floor for Steps 3-6) |
| `lib/langchain/agents/extraction-agent.ts` (or equivalent) | Ensure extraction prompt explicitly asks for out-of-scope items and maps them to `systemBoundaries.outOfScope` |
| `apps/product-helper/__tests__/v2.2/` | LangSmith eval dataset — use as regression baseline |

**Success Criteria** (what must be TRUE):
  1. After a representative intake conversation that mentions multiple actor roles, `extractedData.actors` in the persisted project state contains those actor entries (not empty, not single-element placeholder).
  2. After a representative intake conversation that mentions explicit out-of-scope items (e.g. "we won't handle X"), `extractedData.systemBoundaries.outOfScope` is populated with those items (currently always empty).
  3. The LangSmith eval dataset at `apps/product-helper/__tests__/v2.2/` shows the NFR synthesis agent and engineering-constants synthesis agent producing structured output (≥1 NFR / ≥1 constant) on test projects, no "insufficient upstream context" rejection.
  4. `transformToValidationData` in `lib/langchain/graphs/nodes/check-prd-spec.ts` carries `actors` + `outOfScope` through to the validator without being lost in the mapping.
  5. The fix is verifiable by re-running an existing failing case from the LangSmith dataset and observing the synthesis output flip from "insufficient context" to substantive content.
**Plans:** TBD
**UI hint:** no

### Phase 2: Observability Wiring
**Goal:** The Sentry + metrics instrumentation spec'd in Wave E actually emits data in production — `setSentryTransport` wired at boot, `synthesis_metrics_total` counter firing on the LLM-only path, and the Sentry baseline JSON capturing a real `total_calls` value.
**Depends on:** Nothing (independent of Phase 1 and Phase 3; can run in parallel)
**Requirements:** OBS-01, OBS-02, OBS-03

**Root Cause (Wave E postmortem):**
- `setSentryTransport` in `lib/observability/synthesis-metrics.ts` is never called at boot — the default no-op transport is active; all metric calls silently discard
- `synthesis_metrics_total{module="m2",impl="llm-only"}` counter has zero occurrences in any source file — specced but never implemented on the LLM-only execution path
- `sentry-baseline-2026-04-27.json` has `status: "gap_surfaced"` and `total_calls: null` — no real baseline was ever captured
- `SENTRY_AUTH_TOKEN` and `LANGCHAIN_API_KEY` were unset in the engine-core agent env when this was written
- E.13 is DEFERRED not because the 7-day production window is running, but because the instrumentation was never shipped

**Files to touch:**
| File | Change |
|------|--------|
| `lib/observability/synthesis-metrics.ts` | Wire `setSentryTransport` call — invoke at boot via `instrumentation.ts` or equivalent entry point |
| LLM-only synthesis path | Emit `synthesis_metrics_total{module="m2",impl="llm-only"}` counter on each invocation |
| `sentry-baseline-2026-04-27.json` | Update `total_calls` with real scraped value after ≥48h prod traffic; flip `status` from `gap_surfaced` |
| Vercel env / `.env.local` | Confirm `SENTRY_AUTH_TOKEN` and `LANGCHAIN_API_KEY` are set in the production environment |

**Success Criteria** (what must be TRUE):
  1. `setSentryTransport` is called during application startup — no longer the default no-op transport.
  2. `synthesis_metrics_total{module="m2",impl="llm-only"}` appears in at least one source file and increments on the LLM-only synthesis path.
  3. After ≥48h of production traffic, `sentry-baseline-2026-04-27.json` is updated with a real `total_calls` integer (not null) and `status` is no longer `gap_surfaced`.
**Plans:** TBD
**UI hint:** no

### Phase 3: pgvector Phase B Ingest Recovery
**Goal:** The root cause of the `kb_source + chunk_hash` unique-constraint collision in `ingest-kbs.ts` is diagnosed and fixed, ingest is re-run successfully, and production `kb_chunks` actually contains real embeddings (not just local Supabase).
**Depends on:** Nothing (diagnostic + DB op; independent of Phase 1 and Phase 2)
**Requirements:** VEC-01, VEC-02, VEC-03
**Success Criteria** (what must be TRUE):
  1. The dedup-key collision root cause is documented in writing (which records collide on `kb_source + chunk_hash`, why, and what the correct dedup key is).
  2. A re-run of the Phase B ingest against an empty target inserts >0 of the 3,289 candidate chunks (no silent 0/3289 no-op).
  3. Local Supabase (`postgresql://postgres:postgres@localhost:54322/postgres`) `kb_chunks` table reports a row count consistent with the corpus after ingest.
  4. Production Supabase project `yxginqyxtysjdkeymnon` `kb_chunks` table reports `count(*) ≥ 1` with `embedding IS NOT NULL`.
  5. Re-running ingest a second time after a successful run is an idempotent no-op (does not error, does not double-insert) — the dedup logic works as intended once the key is correct.
**Plans:** TBD
**UI hint:** no

## Progress

| Phase | Plans Complete | Status      | Completed |
|-------|----------------|-------------|-----------|
| 1. Intake Extraction Fix         | 0/0 | Not started | -         |
| 2. Observability Wiring          | 0/0 | Not started | -         |
| 3. pgvector Phase B Ingest Recovery | 0/0 | Not started | -         |

## Out of Scope (this milestone)

- CI lint setup — handled by CODEDEV installation (no longer a manual item)
- Wave E eval E.1 / E.8 fixes (deferred — EVAL-01, EVAL-02)
- Soft-gate hardening for HG7/HG8 and `kbStepConfidence` floor for Steps 3-6 (deferred — INTK-04, INTK-05)
- E.13 observability 7-day window — can only start after OBS-01/02 ship and ≥48h traffic accumulates
- HNSW upgrade, Crawley emitter migration, marketing/billing/UI changes

---
*Roadmap created: 2026-05-02*
