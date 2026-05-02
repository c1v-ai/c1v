# State: c1v v2.2.1+ QA

**Last updated:** 2026-05-02 (Phase 1 planned)

## Project Reference

**Core Value:** Intake chat must surface actors/constraints well enough for downstream synthesis to generate non-trivial NFRs and engineering constants.

**Current Focus:** Phase 1 — Intake Extraction Fix (top priority; root cause of the MAIN ISSUE)

## Current Position

- **Milestone:** v2.2.1+ QA pass (pre-traffic hardening)
- **Phase:** 1 (Intake Extraction Fix) — Planned, ready to execute
- **Plan:** 5 plans across 3 waves (next step: `/gsd-execute-phase 1`)
- **Status:** Plans verified; USE_LANGGRAPH=true confirmed in prod (PATH-A)
- **Progress:** 0/3 phases complete (Phase 1: 0/5 plans executed)

```
[░░░░░░░░░░] 0%   Phase 1
[░░░░░░░░░░] 0%   Phase 2
[░░░░░░░░░░] 0%   Phase 3
```

## Performance Metrics

| Metric                          | Baseline | Current | Target |
|---------------------------------|----------|---------|--------|
| Intake extraction → actors populated | 0% on test set | — | ≥ representative test cases pass |
| Intake extraction → outOfScope populated | 0% (always empty) | — | populated when conversation supplies it |
| Synthesis "insufficient upstream context" rate | High (qualitative) | — | 0 on representative dataset |
| `setSentryTransport` called at boot | No (no-op transport active) | — | Yes |
| `synthesis_metrics_total` counter in source | 0 occurrences | — | emits on LLM-only path |
| Prod `kb_chunks` row count            | ~0 (likely empty) | — | ≥ 1 with non-null embeddings |
| Local `kb_chunks` row count           | 4,990            | 4,990 | corpus-consistent after re-ingest |

## Accumulated Context

### Decisions
- Fix actors/constraints via intake prompt + extraction tuning (no architectural change). Source: PROJECT.md Key Decisions.
- ESLint/lint setup handled by CODEDEV — removed from manual v1 scope.
- Phase 2 is Observability Wiring (setSentryTransport + counter emission + baseline capture).
- Resolve E.8 by updating count gate to 14 (deferred; not in this milestone).
- v1 scope is 3 phases / 9 REQs; everything else is v2 deferred.

### Open TODOs (across phases)
- Phase 1: locate the actual extraction-agent prompt (`lib/langchain/agents/extraction-agent.ts` or where the extract_data logic lives) and `transformToValidationData` mapping in `check-prd-spec.ts`.
- Phase 1: re-use LangSmith eval dataset at `apps/product-helper/__tests__/v2.2/` as the regression harness.
- Phase 2: locate `setSentryTransport` call site in `lib/observability/synthesis-metrics.ts` and find the correct boot entry point (`instrumentation.ts`).
- Phase 2: identify the LLM-only synthesis execution path where the counter should be emitted.
- Phase 3: inspect `lib/db/schema/` for `kb_chunks` unique constraint definition; cross-check against `ingest-kbs.ts` chunk_hash computation.
- Phase 3: confirm prod project ID `yxginqyxtysjdkeymnon` is the correct ingest target before running.

### Blockers
- None.

### Known Hazards
- `drizzle-kit migrate` is broken (duplicate 0004 migrations) — use manual SQL or Supabase SQL Editor for any schema changes during Phase 3.
- Env validator is strict: `OPENROUTER_API_KEY` must start with `sk-or-`; `AUTH_SECRET` ≥ 32 chars; etc. (see `claude.md` "Env validator is strict").
- `~/node_modules/` can hold stale packages and silently break builds — check if Phase 2 lint shows weird Next.js errors.
- Stop-hook autosnapshot to `~/c1v-backups/` is active.

## Session Continuity

**Next session pickup:**
1. Read `.planning/ROADMAP.md` for phase structure.
2. Read `.planning/REQUIREMENTS.md` for REQ-IDs.
3. Read this file for current position.
4. Run `/gsd-plan-phase 1` to begin Phase 1 planning (Intake Extraction Fix is the priority — it's the MAIN ISSUE per PROJECT.md).

**Last session summary:**
Initialized `.planning/` artifacts (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md) for the v2.2.1+ QA pass. Defined 9 v1 requirements across 3 phases: intake extraction fix / observability wiring / pgvector ingest recovery. ESLint handled by CODEDEV (removed from manual scope). Coverage 9/9. No code changes yet.

---
*State initialized: 2026-05-02*
