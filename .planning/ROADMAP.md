# Roadmap: c1v v2.2.1+ QA

**Created:** 2026-05-02
**Granularity:** coarse (3 phases)
**Mode:** interactive
**Coverage:** 7/7 v1 requirements mapped

## Core Value

The intake conversation must surface actors and constraints well enough that downstream synthesis agents can generate non-trivial NFRs, engineering constants, and system-design artifacts — otherwise the product fails its core promise.

## Phases

- [ ] **Phase 1: Intake / Synthesis Context — Diagnose & Fix** — trace whether Crawley schema gate or extraction pipeline is blocking NFR/constants synthesis, then fix
- [ ] **Phase 2: Observability Wiring** — `setSentryTransport` called at boot, counter emitting on LLM-only path, baseline captured
- [ ] **Phase 3: pgvector Phase B Ingest Recovery** — dedup-key collision diagnosed, ingest re-runs, prod `kb_chunks` populated

## Phase Details

### Phase 1: Intake / Synthesis Context — Diagnose & Fix
**Goal:** Determine the actual root cause of the "I don't have enough upstream context" failure seen in NFR derivation and engineering constants synthesis, then fix it. Two competing hypotheses must be investigated before any code is written.
**Depends on:** Nothing (highest priority — core product promise)
**Requirements:** INTK-01, INTK-02, INTK-03

**Two Competing Hypotheses — must be traced before fixing:**

**Hypothesis A — Extraction pipeline gap:**
The `extract_data` node doesn't correctly populate `actors` and `systemBoundaries.outOfScope` from conversation. Downstream synthesis agents receive a sparse `extractedData` blob and correctly report insufficient context.
- Evidence: `check-prd-spec.ts:224` has `outOfScope: []` hardcoded; `inScope`/`internal` are double-counted; HG7/HG8 are regex no-ops that always pass, allowing advancement without real constraint data.

**Hypothesis B — Crawley Zod schema gate silently blocking Phase 2 artifacts:**
The 11 Crawley Zod schemas gate Phase 2 artifact emissions. Agent emitters (`form-function-agent.ts`, etc.) still output pre-Crawley shapes that are missing the matrix derivation fields (`po_array_derivation`, `full_dsm_block_derivations`). If the schema gate fires before `persistArtifact`, Phase 2 artifacts silently fail to persist — leaving downstream synthesis with no upstream artifact data.
- Evidence: CLAUDE.md states "the schema gate already rejects future emissions that omit or mis-type these fields." `persistArtifact` is wrapped in try/catch and never throws, which could mask this failure silently.

**Diagnosis steps (must happen first):**
1. Locate where the Crawley Zod schema validation fires relative to `persistArtifact` — is it inside the generator node, before or after persistence?
2. Check `project_artifacts` table for a real project: do Phase 2 artifacts have `status = 'succeeded'` or `'failed'`? Are the rows even being created?
3. Inspect LangSmith eval dataset (`apps/product-helper/__tests__/v2.2/`) — do the failing cases have empty Phase 2 artifact rows, or is the failure happening in Phase 1 extraction?
4. Grep for where `CRAWLEY_SCHEMAS` / `CRAWLEY_MATRIX_KEYSTONE` are actually called/parsed in the generator nodes to find the validation boundary.

**Known contributing issues (regardless of root cause):**
- `outOfScope: []` hardcoded in `transformToValidationData` (`check-prd-spec.ts:224`)
- HG7 + HG8 are regex no-ops on `vision` string — always `passed: true`
- `kbStepConfidence` returns `0` for all Steps 3-6 (no deterministic floor)

**Files to investigate:**
| File | What to check |
|------|---------------|
| `lib/langchain/schemas/index.ts` | Where CRAWLEY_SCHEMAS is exported; who imports it |
| `lib/langchain/graphs/nodes/generate-form-function.ts` (and sibling generators) | Does the node call Zod parse/safeParse on output before `persistArtifact`? |
| `lib/langchain/graphs/nodes/_persist-artifact.ts` | Does it validate against Crawley schemas, or is validation upstream? |
| `lib/langchain/graphs/nodes/check-prd-spec.ts` | `transformToValidationData` — `outOfScope: []` hardcode, `inScope`/`internal` double-count |
| `lib/validation/validator.ts` | HG7/HG8 regex no-ops |
| `lib/langchain/agents/intake/kb-question-generator.ts` | `calculateStepConfidence` — missing Steps 3-6 cases |
| `apps/product-helper/__tests__/v2.2/` | LangSmith eval dataset — failing case shapes |

**Success Criteria** (what must be TRUE):
  1. Root cause is documented in writing: which hypothesis (A, B, or both) is confirmed, with evidence from code + DB state.
  2. After a representative intake conversation mentioning multiple actor roles, `extractedData.actors` is non-empty.
  3. After a conversation mentioning explicit out-of-scope items, `extractedData.systemBoundaries.outOfScope` is populated.
  4. Phase 2 artifact rows in `project_artifacts` show `status = 'succeeded'` (not silently missing or failed).
  5. LangSmith eval dataset shows NFR synthesis + engineering-constants agents producing ≥1 result — no "insufficient upstream context" on the representative test set.
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
