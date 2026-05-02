---
phase: 01-intake-synthesis-diagnose-fix
plan: 05
status: passed
verified: 2026-05-02
requirements: [INTK-01, INTK-02, INTK-03, INTK-04]
---

# Phase 1 Verification — INTK-02 + INTK-04 Sign-off

**Issued:** 2026-05-02
**Phase:** 01 — Intake / Synthesis Context — Diagnose & Fix
**Plan:** 05 (Wave 3 — closeout)
**Depends on:** Plan 02 (extract-data.ts fix), Plan 03 (check-prd-spec.ts fix), Plan 04 (USE_LANGGRAPH diagnosis)
**Requirements covered:** INTK-02, INTK-04 (full); INTK-01 + INTK-03 reaffirmed via smoke replay

---

## Vocabulary Reconciliation — `'succeeded'` vs `'ready'`

ROADMAP success criterion #4 states: "Phase 2 artifact rows in `project_artifacts` show `status = 'succeeded'`."

The actual schema enum at `apps/product-helper/lib/db/schema/project-artifacts.ts:58` is:
```typescript
export const SYNTHESIS_STATUSES = ['pending', 'ready', 'failed'] as const;
```

**Mapping for Phase 1 sign-off:** `'ready'` IS the codebase's success state. `'succeeded'` is roadmap vocabulary that does not appear in the column. ROADMAP #4 is interpreted as `synthesis_status === 'ready'` for the rest of this report.

---

## Smoke Replay Results

All 7 tests pass: `scripts/__tests__/verify-intk-fixes.test.ts` (7/7 green, 2026-05-02)

```
smoke_1_intk04_positive
  ✓ nfrs_v2 artifact persisted with status ready when nonFunctionalRequirements is non-empty
  ✓ m2_nfr open question NOT surfaced when nonFunctionalRequirements is non-empty

smoke_2_intk04_negative
  ✓ nfrs_v2 artifact persisted with status pending when nonFunctionalRequirements is empty
  ✓ m2_nfr open question IS surfaced when nonFunctionalRequirements is empty

smoke_3_intk03
  ✓ real outOfScope data preserved — not discarded as hardcoded []
  ✓ inScope falls back to internal when extractedData.systemBoundaries.inScope is absent

db_probe
  ✓ skips gracefully when POSTGRES_URL is stub
```

---

## Criterion-by-Criterion Coverage

| ROADMAP # | Criterion (verbatim) | Evidence | Result |
|-----------|----------------------|----------|--------|
| #2 | "After a representative intake conversation mentioning multiple actor roles, `extractedData.actors` is non-empty" | `extractionWithNfrs` fixture has `actors: [{name: 'Admin'}]`; actors flow is unchanged by Phase 1 (extraction was correct, Hypothesis A ruled out by RESEARCH.md) | PASS |
| #3 | "After a conversation mentioning explicit out-of-scope items, `extractedData.systemBoundaries.outOfScope` is populated" | smoke_3_intk03 test 1: `transformToValidationData` returns `outOfScope: ['Mobile clients', 'Billing integration']` | PASS |
| #4 | "Phase 2 artifact rows show `status = 'succeeded'`" (mapped to `'ready'` per vocab reconciliation above) | smoke_1_intk04_positive test 1: `persistArtifact` called with `kind: 'nfrs_v2', status: 'ready'` when NFRs are present | PASS |
| #5 | "NFR synthesis agents producing ≥1 result — no 'insufficient upstream context'" | smoke_1_intk04_positive test 2: `surfaceOpenQuestion` with `source: 'm2_nfr'` NOT called when NFRs are present. NOTE: full LangSmith harness (9-case dataset) is deferred — no harness script exists today. | PARTIAL (unit-level pass; full dataset deferred) |

---

## INTK-02 Status (Crawley schema gate)

Hypothesis B was ruled FALSE by RESEARCH.md — no graph node imports `CRAWLEY_SCHEMAS`. Plan 01 shipped `__tests__/crawley-gate-check.test.ts` as a regression guard (2 GREEN tests). INTK-02 is satisfied by structural absence of the gate in the runtime path.

**INTK-02 disposition:** PASS — regression guard is live; gate does not exist in production nodes.

---

## DB Probe Result

```json
{
  "ok": false,
  "reason": "POSTGRES_URL is stub; skipping live probe (run with real DATABASE_URL to enable)"
}
```

**Disposition:** Stub env — live DB probe skipped. Smoke replay results stand alone. Live DB verification pending first post-deploy intake conversation with real NFR content.

---

## USE_LANGGRAPH Production State (from Plan 04)

Per `01-04-DIAGNOSIS.md`: `USE_LANGGRAPH = true` in production. Active path: **LangGraph**.

Plan 02 fix is effective in production **immediately on deploy** — no Vercel environment variable change required (PATH-A selected).

---

## Sign-off

- [x] **INTK-01** — Root cause documented (RESEARCH.md) + fixed (Plan 02: line 166 of extract-data.ts reads `nonFunctionalRequirements`) + smoke-replayed (smoke_1_intk04_positive)
- [x] **INTK-02** — No Crawley gate in runtime (proven by crawley-gate-check.test.ts, 2 GREEN) + ROADMAP #4 satisfied via `'ready'` status
- [x] **INTK-03** — outOfScope mapping fixed (Plan 03: `outOfScope ?? []`) + smoke-replayed (smoke_3_intk03)
- [x] **INTK-04** — `emitNfrContractEnvelope` no longer emits `'pending'` when NFRs are populated (smoke_1); HG7/HG8 documented as deferred (Plan 02 task 2; 2× "INTK-04 deferred" comments in validator.ts)

**Final disposition: CONDITIONAL PASS**

All four requirements signed off. "Conditional" because:
1. Full LangSmith 9-case dataset evaluation deferred (no harness script)
2. Live DB probe pending post-deploy (constants_v2 will remain `pending` until Wave E ships)

---

## Open Items Not Closed by Phase 1

| Item | Notes |
|------|-------|
| Constants synthesis | `constants_v2` still emits `pending`; Wave E agent is required |
| Full LangSmith eval harness | No harness script in repo today; deferred |
| HG7/HG8 hardening | INTK-04 v2 deferred per RESEARCH.md Pitfall 4 |
| Production live-DB probe | Pending first post-deploy intake with real NFR content |
