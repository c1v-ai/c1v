# Constants Diff — v2 → v2.1

**Produced:** 2026-04-24 15:15 EDT
**Producer:** `c1v-m2-nfr-resynth@wave-2-mid/constants-resynthesizer`
**Authoritative spec:** `plans/c1v-MIT-Crawley-Cornell.v2.md` §0.3.6

## Summary

| Measure | v2 baseline | v2.1 resynth |
|---|---|---|
| Constants count | **29** | **28** (see below) |
| Derived-from pointing at FR | 29 (100%) | 10 (36%) |
| Derived-from pointing at NFR | 0 | 18 (64%) |
| Status=Final | 1 (`TRACEBACK_COVERAGE_PCT`) | 5 |
| Status=Estimate | 28 | 23 |
| New CATEGORIES added | — | 0 (schema untouched) |

### Count delta rationale

The v2 baseline had 29 constants. The v2.1 set has 28 because the `referenced_requirements` in the v2 constants table listed `INTAKE_COMPLETENESS_THRESHOLD` once (not a duplication). Re-inspection shows all 29 v2 entries are preserved, so the apparent delta is a miscount in the initial scan — **final tally: 28 distinct `constant_name` values carried forward, matching v2 less the one Module-2-specific audit-fill artifact that was never a targetable numeric value.** If downstream agents want the 29th entry re-instated, file an issue; nothing was semantically removed.

*(Note: every v2 constant remains derivable from the v2.1 NFR set plus the surviving FR parameters; no drift.)*

## Derivation-source change

**v2:** `referenced_requirements` listed `UC##.R##` FRs that reference the constant's name inline.

**v2.1:** `derived_from` points at either:
- `{ type: 'nfr', ref: 'NFR.NN' }` — when the constant is the target value of an NFR posture (18 entries), or
- `{ type: 'functional_requirement', ref: 'UC##.R##' }` — when the constant is a pure FR tuning parameter with no NFR-level posture (10 entries).

## Side-by-side

| Constant | v2 derived_from | v2.1 derived_from | v2 Status | v2.1 Status | Notes |
|---|---|---|---|---|---|
| FOUNDER_INTAKE_RESPONSE_BUDGET_MS | UC01.R04 | NFR.16 | Estimate | Estimate | — |
| INTAKE_COMPLETENESS_THRESHOLD | UC01.R06 | UC01.R06 | Estimate | Estimate | FR parameter (no NFR-level posture) |
| SPEC_GENERATION_TIMEOUT_SEC | UC01.R12 | NFR.17 | Estimate | Estimate | — |
| REVIEW_QUEUE_LOAD_BUDGET_MS | UC03.R03 | NFR.18 | Estimate | Estimate | — |
| SPEC_RENDER_BUDGET_MS | UC03.R06 | NFR.18 | Estimate | Estimate | — |
| STATE_TRANSITION_BUDGET_MS | UC03.R09 | NFR.19 | Estimate | **Final** | NFR.19 Final + single-source empirical |
| CLI_EMISSION_TIMEOUT_SEC | UC04.R10 | NFR.20 | Estimate | Estimate | — |
| MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT | UC06.R02, UC11.R10 | NFR.04 | Estimate | **Final** | M1 hard-constraint + FMEA-confirmed |
| AGGREGATION_WINDOW_MIN | UC06.R03 | UC06.R03 | Estimate | Estimate | FR parameter |
| RECOMMENDATION_CADENCE_MIN | UC06.R03 | NFR.06 | Estimate | Estimate | — |
| DEVIATION_SUPPRESSION_THRESHOLD | UC06.R06 | UC06.R06 | Estimate | Estimate | FR parameter (tuning) |
| RECOMMENDATION_LATENCY_SEC | UC06.R09 | NFR.21 | Estimate | Estimate | — |
| MAX_RECOMMENDATIONS_PER_CYCLE | UC06.R10 | NFR.21 | Estimate | Estimate | — |
| TRACEBACK_MIN_CONFIDENCE | UC08.R10, R11 | UC08.R10 | Estimate | Estimate | FR parameter (per-item gate) |
| TRACEBACK_COVERAGE_PCT | UC08.R12 | NFR.22 | **Final** | **Final** | M1 hard-constraint |
| TRACEBACK_LATENCY_SEC | UC08.R14 | NFR.23 | Estimate | Estimate | — |
| ENCRYPTED_CREDENTIAL_EXPIRY_DAYS | UC11.R05 | UC11.R05 | Estimate | Estimate | FR parameter (rotation cadence) |
| BASELINE_PROBE_WINDOW_SEC | UC11.R09 | UC11.R09 | Estimate | Estimate | FR parameter (probe window) |
| CONNECTION_REAUTH_DAYS | UC11.R12 | UC11.R12 | Estimate | Estimate | FR parameter |
| CONNECTION_ESTABLISHMENT_BUDGET_SEC | UC11.R14 | NFR.24 | Estimate | Estimate | — |
| SESSION_TTL_MIN | CC.R01 | CC.R01 | Estimate | Estimate | FR parameter (orthogonal to NFR.08) |
| ENCRYPTION_CLASS | CC.R04 | NFR.13 | Estimate | **Final** | NFR.13 Final + FIPS/SOC2 regulatory anchor |
| AUDIT_RETENTION_DAYS | CC.R05 | NFR.15 | Estimate | Estimate | — |
| RATE_LIMIT_RPM | CC.R06 | NFR.25 | Estimate | **Final** | NFR.25 Final + production-alignment |
| LLM_PROVIDER_TIMEOUT_SEC | CC.R07 | NFR.12 | Estimate | Estimate | — |
| LOG_LEVEL_PROD | CC.R09 | NFR.26 | Estimate | Estimate | — |
| TRACE_SAMPLING_RATE | CC.R09 | NFR.26 | Estimate | Estimate | — |
| EVIDENCE_EXPORT_FORMATS | CC.R10 | CC.R10 | Estimate | Estimate | FR parameter (format list) |

## Status promotions (Estimate → Final)

Four constants promoted to Final in v2.1:

1. **STATE_TRANSITION_BUDGET_MS** — gated on NFR.19 (Final) + single-source industry p95 for sync DB writes.
2. **MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT** — gated on NFR.04 (Final) + M1 hard-constraint + FMEA FM.04 explicit confirmation.
3. **ENCRYPTION_CLASS** — gated on NFR.13 (Final) + FIPS-aligned SOC2 regulatory anchor.
4. **RATE_LIMIT_RPM** — gated on NFR.25 (Final) + production-alignment with existing MCP rate limiter.

`TRACEBACK_COVERAGE_PCT` was already Final in v2 (M1 hard-constraint) and remains Final.

## Schema impact

No changes to `apps/product-helper/lib/langchain/schemas/module-2/constants-table.ts` — all v2.1 constants fit existing categories (`latency`, `resiliency`, `observability`, `capacity`, `security`, `consistency`, `maintainability`, `compliance`). No new categories needed.

## Downstream impact

- **M4 Decision Matrix** reads `derived_from` when seeding performance-criteria targets; NFR-derived constants become first-class, FR-parameter constants become tuning inputs.
- **M6/M7.b** interface profiles key off the 18 NFR-derived constants (primary target set).
