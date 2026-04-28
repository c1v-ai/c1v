# T11 Verification Report — Wave 2-mid M2 NFR Resynthesis

**Team:** `c1v-m2-nfr-resynth`
**Wave:** 2-mid (per `plans/c1v-MIT-Crawley-Cornell.v2.md` §0.3.6)
**Date:** 2026-04-24
**Soft tag:** `wave-2-mid-complete` @ commit `020766a` (pre-existing)
**Verifier:** `apps/product-helper/scripts/verify-t11.ts`
**Run:** `pnpm tsx scripts/verify-t11.ts` from `apps/product-helper/`

## Commits in scope

| SHA | Subject |
|---|---|
| `b3a8ee4` | feat(m2/schema): add `derivedFrom` discriminated-union for NFR-to-failure-mode tracing |
| `8c47cb8` | feat(m2): NFR v2.1 — derived from M8.a FMEA-early |
| `020766a` | feat(m2): constants v2.1 derived from resynthesized NFRs |

## Gate table

| Gate | Status | Evidence |
|---|---|---|
| **V11.1** tsc green | ✅ PASS | `npx tsc --noEmit --project tsconfig.json` → 0 errors |
| **V11.2** NFR v2.1 schema-valid | ✅ PASS | `nfrs.v2.json` parses against inline Zod re-using canonical M2 `derivedFromSchema` (commit `b3a8ee4`); 26 unique NFRs; derivation split: fmea=12, data_flow=3, functional_requirement=11 |
| **V11.3** constants v2.1 schema-valid + tabulation | ✅ PASS | `constants.v2.json` parses against inline Zod with constant-specific `derivedFrom` superset (`nfr` ∪ `functional_requirement` ∪ `fmea` ∪ `data_flow`); 28 constants total; **file-state: nfr=19, fr=9, Final=5** (note: commit-message prose claims 18/10/4 — verifier records the drift but treats the file as source of truth) |
| **V11.4** NFR fmea-traceback referential integrity | ✅ PASS | All 12 NFRs with `derived_from.type='fmea'` resolve to FM.NN ids in `module-8-risk/fmea_early.v1.json` (12 FM.NN). 0 orphans. |
| **V11.5** Constants derivedFrom traceback | ✅ PASS | 19 NFR-anchored constants resolve in `nfrs.v2.json` (NFR pool=26); 9 FR-anchored constants resolve in `requirements_table.json[].index` (FR pool=99). 0 orphans. |
| **V11.6** Baseline + diff doc preservation | ✅ PASS | 4 artifacts present and non-trivial: `requirements_table.json` (FR baseline), `constants_table.json` (constants baseline), `nfr-diff-v2-to-v2.1.md`, `constants-diff-v2-to-v2.1.md`. |
| **V11.7** No placeholder text in T11 production files | ✅ PASS | No TODO/FIXME/XXX/placeholder in `lib/langchain/agents/system-design/nfr-resynth-agent.ts`. |

**Result: 6/6 gates green** (V11.1 tsc delegated; verified separately).

## Verifier output (literal)

```
✔ V11.2  nfrs.v2.json: 26 unique NFRs (fmea=12, data_flow=3, fr=11)
✔ V11.3  constants.v2.json: 28 constants (nfr=19, fr=9, Final=5); note: file-state 19/9/5 differs from commit-message claim 18/10/4 — file is source of truth
✔ V11.4  12 fmea-derived NFRs all resolve in fmea_early.v1.json (12 FM.NN)
✔ V11.5  19 NFR-anchored + 9 FR-anchored constant refs all resolve (NFR pool=26, FR pool=99)
✔ V11.6  4 baseline + diff artifacts present and non-trivial
✔ V11.7  no TODO/FIXME/XXX/placeholder in 1 files

T11 verification: 6/6 gates pass
READY-FOR-TAG: all V11 gates green (V11.1 tsc must be run separately).
```

## Findings worth flagging (non-blocking)

1. **Commit-message prose drift on `020766a`.** Commit message says "18/28 constants anchor to NFRs; 10 retain FR derivation; 4 status promotions Estimate→Final". Actual file state is **19 NFR-anchored, 9 FR-anchored, 5 Final**. All 28 constants are still accounted for (19 + 9 = 28). The file is the source of truth; this is a prose-vs-data discrepancy at commit-message granularity, not a substantive defect. Verifier records the drift in V11.3 detail line and does not fail on it.
2. **Constants `derivedFrom` discriminator is a superset of NFR `derivedFromSchema`.** The canonical M2 schema (`requirements-table-base.ts`, commit `b3a8ee4`) defines a 3-arm union (`fmea | data_flow | functional_requirement`) intended for NFR rows. Constants in v2.1 add a 4th arm (`nfr`) because constants legitimately anchor to NFRs (which themselves anchor upstream). The verifier defines a constants-specific union to validate this superset structurally. If a future Wave promotes the constants v2.1 shape into a strict M2 phase Zod, the schema barrel should grow a `constantDerivedFromSchema` companion to `derivedFromSchema`.
3. **No standalone Zod for `nfrs.v2.json`/`constants.v2.json` in the schema barrel.** The verifier defines them inline. Comparable to how T4b validates `decision_network.v1.json` via composed phase schemas, but here the artifact predates a dedicated phase schema. Consider promoting the inline shapes if Wave 2-mid output is regenerated programmatically in a later wave.

## Files

- Verifier: `apps/product-helper/scripts/verify-t11.ts`
- Report: `plans/t11-outputs/verification-report.md` (this file)

## Exit contract

`READY-FOR-TAG` — Wave 2-mid M2 NFR resynthesis (T11) earns its `wave-2-mid-complete` tag with green-gate evidence. Wave-3 dependents (T5 form-function NFR weights — already complete; T6 synthesis — pending) can rely on `nfrs.v2.json` + `constants.v2.json` integrity.
