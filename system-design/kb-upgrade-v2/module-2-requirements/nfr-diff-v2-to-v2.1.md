# NFR Diff — v2 → v2.1

**Produced:** 2026-04-24 15:00 EDT
**Producer:** `c1v-m2-nfr-resynth@wave-2-mid/nfr-resynthesizer`
**Authoritative spec:** `plans/c1v-MIT-Crawley-Cornell.v2.md` §0.3.6
**Methodology:** `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` §2 Pass 2

## Summary

| Measure | v2 baseline | v2.1 resynth |
|---|---|---|
| Distinct NFR entries | **0** (as NFR.NN rows) | **26** |
| NFR-ish content embedded as FR rows | ~13 (numeric budgets inside UC##.R## FRs) | promoted to standalone NFRs with `derived_from` |
| NFR-ish content embedded as constants | 29 constants | 29 retained (see `constants-diff-v2-to-v2.1.md`) |
| Entries with upstream provenance | 0 | 26 (100%) |
| FMEA-derived | 0 | 12 |
| Data-flow-derived | 0 | 3 |
| FR-derived | 0 | 11 |

## Methodology change

**v2:** NFRs were implicit — embedded inside FRs (as numeric budgets) and inside constants (as target values). No standalone NFR.NN namespace existed. Constants were the only place performance/reliability targets had a stable id.

**v2.1:** NFRs promoted to a standalone namespace (`NFR.01`..`NFR.NN`). Every NFR carries `derived_from` pointing at the upstream artifact that demanded it — one of:
- `{ type: 'fmea', ref: 'FM.NN' }`
- `{ type: 'data_flow', ref: 'DE.NN' }`
- `{ type: 'functional_requirement', ref: 'UC##.R##' | 'CC.R##' }`

Constants remain in `constants.v2.json` as the place numeric values live; their `derived_from` now points at an `NFR.NN` rather than at an `UC##.R##` FR (see companion diff).

## Side-by-side

### FMEA-derived (NEW — 12 entries, 1:1 with FM.01–FM.12)

| v2 | v2.1 | Rationale |
|---|---|---|
| — | **NFR.01** citation-floor enforcement | FM.01 rpn=12 mitigation M1/M2 promoted |
| — | **NFR.02** compliance-policy digest gate | FM.02 rpn=8 hard-gate mitigation |
| — | **NFR.03** content-addressed spec handoff | FM.03 rpn=6 version-skew mitigation |
| — | **NFR.04** adapter overhead ≤ 2% | FM.04 rpn=12; preserves v2 `MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT` value |
| — | **NFR.05** metric-stream gap markers | FM.05 rpn=12; heartbeat + stale-window refuse |
| — | **NFR.06** recommendation cadence budget | FM.06 rpn=9; promotes `RECOMMENDATION_CADENCE_MIN` to NFR status |
| — | **NFR.07** traceback fail-closed | FM.07 rpn=9; citation-chain completeness |
| — | **NFR.08** session-token project binding | FM.08 rpn=8; cross-tenant replay prevention |
| — | **NFR.09** CLI-bundle secret redaction | FM.09 rpn=8; `credentials_ref` handles only |
| — | **NFR.10** audit-wrapping lint rule | FM.10 rpn=6; enforces CC.R02 coverage on ffbd.v1 |
| — | **NFR.11** recommendation-triggered spec versioning | FM.11 rpn=9; lineage tracking |
| — | **NFR.12** multi-provider LLM fallback | FM.12 rpn=6; circuit-breaker timeout = `LLM_PROVIDER_TIMEOUT_SEC` |

### Data-flow-derived (NEW — 3 entries)

| v2 source | v2.1 | Rationale |
|---|---|---|
| CC.R04 (mixed FR/NFR) | **NFR.13** encryption at rest + in transit | Consolidates encryption_at_rest_required/encryption_in_transit_required flags across 15 DEs |
| (implicit) | **NFR.14** direct-PII handling for DE.12 | DE.12 pii_class=direct is unique in scope |
| CC.R05 (mixed FR/NFR) | **NFR.15** audit retention 2555 days | DE.11 criticality=critical + regulatory union |

### FR-derived (NEW — 11 entries; numeric budgets promoted out of FR rows)

| v2 FR with embedded budget | v2.1 NFR | Target value |
|---|---|---|
| UC01.R04 | **NFR.16** intake first-question latency | 2000 ms |
| UC01.R12 | **NFR.17** spec-generation timeout | 300 sec |
| UC03.R03 + UC03.R06 | **NFR.18** review-queue + spec-render latency | 800 ms / 1500 ms |
| UC03.R09 | **NFR.19** state transition budget | 500 ms (Final) |
| UC04.R10 | **NFR.20** CLI emission timeout | 60 sec |
| UC06.R09 + UC06.R10 | **NFR.21** recommendation latency + cap | 120 sec / 10 entries |
| UC08.R12 | **NFR.22** traceback coverage | 100% (Final — M1 hard constraint) |
| UC08.R14 | **NFR.23** traceback latency | 5 sec |
| UC11.R14 | **NFR.24** connection-establishment budget | 120 sec |
| CC.R06 | **NFR.25** rate limit | 100 req/min (Final) |
| CC.R09 | **NFR.26** observability signals | log=info, trace=0.1 |

### Orphaned (flagged — NOT carried forward)

**Zero.** Because v2 had no standalone NFR namespace, there were no orphan NFRs to flag. Every numeric budget in v2 had a derivable upstream (either a numeric FR or an FMEA failure mode), so all were carried forward with derivation metadata.

## Target-value changes

All numeric targets carry forward unchanged from the v2 baseline `constants_table.json`. FMEA-early did NOT invalidate any existing target value; FM.04 explicitly confirms `MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT = 2%` which matches v2.

## Status changes

**v2.1 Final (13):** FMEA-grounded mitigations (NFR.01–05, NFR.07–11), M1 hard constraints (NFR.22 traceback-coverage, NFR.04 non-invasiveness), encryption class (NFR.13), direct-PII handling (NFR.14), single-source empirical (NFR.19 state-transition, NFR.25 rate-limit).

**v2.1 Estimate (13):** FR-derived performance budgets awaiting Module-4 Decision Matrix tightening (NFR.06, 12, 15–18, 20, 21, 23, 24, 26).

## Downstream impact

- **M4 Decision Matrix** now seeds performance-criteria from `nfrs.v2.json` rather than from constants directly.
- **M6/M7.b** consume NFR.13/14/15 (security/compliance class) for interface profile selection.
- **M8.b FMEA-late** back-references NFR.01–12 to verify every high-rpn FM has a corresponding NFR mitigation.
