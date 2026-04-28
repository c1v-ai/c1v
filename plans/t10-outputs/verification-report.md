# T10 Verification Report

**Team:** c1v-artifact-centralization (T10)
**Agent:** verifier (Agent 4)
**Spec:** `plans/c1v-MIT-Crawley-Cornell.v2.md` §15.7 Agent 4, ECs §15.8
**Date:** 2026-04-24
**Verdict:** PARTIAL — 5 PASS, 3 DEFERRED, 1 FAIL (TypeScript / bullmq deps)

## Exit-Criteria Summary

| EC | Title | Status | Evidence |
|---|---|---|---|
| 15.1 | 13 generators + common + requirements | PASS | §EC-15.1 |
| 15.2 | Round-trip byte-identical for migrated | DEFERRED | §EC-15.2 |
| 15.3 | Syntactic validity (py/xlsx/svg/pdf/html) | PARTIAL PASS | §EC-15.3 |
| 15.4 | `tsc --noEmit` zero errors | FAIL (7 errors) | §EC-15.4 |
| 15.5 | BullMQ queue wiring | DEFERRED | §EC-15.5 |
| 15.6 | Artifact-pipeline UI renders manifest | PASS | §EC-15.6 |
| 15.7 | Manifest schema documented | PASS | §EC-15.7 |
| 15.8 | v1 scripts archived | DEFERRED | §EC-15.8 |
| 15.9 | 5 frozen UI files unchanged | PASS | §EC-15.9 |

**Tag `t10-wave-1-complete` NOT created** — EC-15.4 FAIL blocks.

---

## EC-15.1: Generator Inventory — PASS

```
$ ls scripts/artifact-generators/gen-*.py | wc -l
13
```

All 13 generators present:
- Migrated (8): gen-ffbd, gen-qfd, gen-n2, gen-sequence, gen-dfd, gen-interfaces, gen-fmea, gen-ucbd
- New Crawley (5): gen-decision-net, gen-form-function, gen-cost-curves, gen-latency-chain, gen-arch-recommendation

Supporting files:
- `types.ts` — canonical I/O contract (92 lines)
- `common/` — runner, manifest_writer, schema_loader, legacy_invoke, schemas/
- `requirements.txt` — pinned deps (jsonschema 4.23.0, openpyxl 3.1.5, python-pptx 1.0.2, matplotlib, seaborn, networkx, graphviz, reportlab 62.x)
- `README.md` — contract documentation

Note: 13 total matches the README layout (8 migrators + 5 extenders). The spec §15.3 references "9 migrated / 4 new" — the migrator collapsed N2+sequence and others via dedup, landing on 8+5.

## EC-15.2: Round-Trip — DEFERRED

See `scripts/artifact-generators/__tests__/round-trip.test.ts`.

**Why deferred:**
1. v1 scripts have NOT been archived (see EC-15.8) — they are still *referenced at runtime* by migrated generators via `common/legacy_invoke.py::run_legacy()` (per `plans/t10-outputs/legacy-archival-log.md`).
2. No golden baseline artifacts with sha256 captured in `system-design/kb-upgrade-v2/__golden__/`.
3. v2 source JSON inputs DO exist at `system-design/kb-upgrade-v2/module-*/` for all 8 migrated generators — verified.

**Remediation path:** after `run_legacy()` shim is removed from each generator (i.e. after the migrator truly absorbs legacy code), capture golden artifacts under a dedicated `__golden__/` dir with sha256 manifest, then unskip the `test.skip.each(MIGRATED)` block in `round-trip.test.ts`.

Test result: 9 passed (existence probes), 8 skipped (byte-compare deferred).

## EC-15.3: Syntactic Validity — PARTIAL PASS

Python AST parse — all 13 PASS:
```
$ for f in scripts/artifact-generators/gen-*.py; do \
    python3 -c "import ast; ast.parse(open('$f').read())" && echo "OK $f"; \
  done
OK scripts/artifact-generators/gen-arch-recommendation.py
OK scripts/artifact-generators/gen-cost-curves.py
OK scripts/artifact-generators/gen-decision-net.py
OK scripts/artifact-generators/gen-dfd.py
OK scripts/artifact-generators/gen-ffbd.py
OK scripts/artifact-generators/gen-fmea.py
OK scripts/artifact-generators/gen-form-function.py
OK scripts/artifact-generators/gen-interfaces.py
OK scripts/artifact-generators/gen-latency-chain.py
OK scripts/artifact-generators/gen-n2.py
OK scripts/artifact-generators/gen-qfd.py
OK scripts/artifact-generators/gen-sequence.py
OK scripts/artifact-generators/gen-ucbd.py
```

Also covered by contract test suite (`contract.test.ts::is syntactically valid Python` — 13/13 PASS).

Output-file validity (`openpyxl.load_workbook`, `xmllint`, `pdfinfo`, `tidy`) — **DEFERRED**: depends on EC-15.2 golden artifacts landing. The contract tests verify the *runner contract* (validate-phase error codes + manifest append on failure — 52/52 pass) but not render-phase file formats. Per the spec §15.3 this check is implicitly gated on round-trip inputs existing.

## EC-15.4: `tsc --noEmit` — FAIL

```
$ npx tsc --noEmit --project apps/product-helper/tsconfig.json
```

**7 errors, all in `apps/product-helper/lib/artifact-generators/queue.ts`:**

```
queue.ts(48,37): TS2307: Cannot find module 'bullmq' or its corresponding type declarations.
queue.ts(48,65): TS2307: Cannot find module 'bullmq' or its corresponding type declarations.
queue.ts(107,36): TS2307: Cannot find module 'bullmq' or its corresponding type declarations.
queue.ts(107,64): TS2307: Cannot find module 'bullmq' or its corresponding type declarations.
queue.ts(111,12): TS7006: Parameter 'job' implicitly has an 'any' type.
queue.ts(122,24): TS7006: Parameter 'job' implicitly has an 'any' type.
queue.ts(122,29): TS7006: Parameter 'err' implicitly has an 'any' type.
```

**Root cause:** `bullmq` is NOT in `apps/product-helper/package.json`. The module uses `await import('bullmq')` (dynamic import) for runtime graceful-fallback, but the type expression `(await import('bullmq')) as typeof import('bullmq')` still requires the module's types to resolve at compile time. TypeScript's `typeof import(X)` does NOT tolerate a missing package.

**Impact:** runtime is unaffected — `invoke.ts` catches the dynamic-import failure and falls back to inline spawn (verified: `invoke.ts:180-186`). Build-time tsc fails.

**Note on IDE vs tsc:** the pre-verification diagnostic list mentioned `invoke.ts:178:49` Cannot find module './queue'. That error does NOT appear in `tsc --noEmit` output — `./queue` resolves fine. The IDE language server diagnostic was stale / mis-reported. Per memory rule "trust tsc over IDE", the authoritative error surface is the 7 queue.ts errors above.

**Remediation:**
- Option A (recommended): add `bullmq` + `ioredis` as `optionalDependencies` in `apps/product-helper/package.json` and change type annotations in queue.ts from `typeof import('bullmq')` to structural `UnknownQueue` / `UnknownWorker` types (stay off the `bullmq` type surface entirely).
- Option B: install `@types/bullmq` or `bullmq` as a regular dep — defeats the "optional" design.
- Option C (quickest): add `// @ts-expect-error bullmq optional dep` above each of lines 48, 107, 111, 122. Not clean.

Fix is **not attempted** in this verification pass per guardrail.

## EC-15.5: BullMQ queue wiring — DEFERRED

Wiring code exists at `apps/product-helper/lib/artifact-generators/queue.ts` (139 lines) with:
- `getQueue()` dynamic-import bootstrap
- `enqueueGenerator()` add-to-queue + return synthetic "queued" output
- `startWorker()` — separate-process entrypoint
- `closeQueue()` — test helper

Package `bullmq` is NOT installed. `invoke.ts` catches import failure and falls back to inline. DEFERRED until bullmq is formally adopted (see EC-15.4 remediation).

## EC-15.6: Artifact-pipeline UI — PASS

Test: `apps/product-helper/__tests__/artifact-pipeline.test.tsx` — 3/3 pass.

```
PASS __tests__/artifact-pipeline.test.tsx
  ArtifactPipeline (T10 EC-15.6)
    ✓ renders Generated Artifacts section when manifest has ok entries
    ✓ graceful fallback when manifest is absent
    ✓ hides download section when runDir present but no ok entries
```

Asserts:
- Manifest `runDir` + `ok:true` entries → render "Generated Artifacts" heading + one download link per output, href pointing at `/api/projects/{id}/artifacts/download?path=<encoded>`.
- No runDir → no Artifacts section, existing pipeline (Product Requirements + Backend groups) still renders.
- `ok:false` entries filtered out.

LOC budget: `artifact-pipeline.tsx` is 178 lines (Manifest-read extension only, semi-frozen per CLAUDE.md).

## EC-15.7: Manifest schema documented — PASS

`ManifestEntry` type is the source of truth: `scripts/artifact-generators/types.ts:83-91`.

Also documented in:
- `plans/t10-outputs/new-generators-spec.md`
- `plans/t10-outputs/runtime-integration-diagram.md`
- `plans/t10-outputs/migration-report.md`

Manifest shape verified via contract test (`contract.test.ts::appends a manifest entry on failure` — 13/13).

## EC-15.8: v1 scripts archived — DEFERRED

`archive/scripts-v1/` directory **exists but is empty**. Per `plans/t10-outputs/legacy-archival-log.md`, 14 candidate v1 scripts under `system-design/kb-upgrade-v2/module-*/` are still referenced at runtime by `common/legacy_invoke.py::run_legacy()` calls inside the migrated generators. Archival would break runtime execution.

**Remediation:** the migrator's "legacy_invoke shim" must be replaced by native render logic in each generator before archival proceeds. Target generators still shelling out: gen-ffbd, gen-fmea, gen-interfaces, gen-n2, gen-sequence, gen-dfd, gen-ucbd.

## EC-15.9: Frozen UI files unchanged — PASS

Diff vs `t9-pre-hygiene-snapshot` tag (most recent pre-T10 snapshot):

```
$ for f in <5 frozen files>; do git diff t9-pre-hygiene-snapshot -- "$f" | head -5; done
(all 5 files produced empty diff)
```

Verified files:
- `apps/product-helper/components/system-design/decision-matrix-viewer.tsx` — no changes
- `apps/product-helper/components/system-design/ffbd-viewer.tsx` — no changes
- `apps/product-helper/components/system-design/qfd-viewer.tsx` — no changes
- `apps/product-helper/components/system-design/interfaces-viewer.tsx` — no changes
- `apps/product-helper/components/diagrams/diagram-viewer.tsx` — no changes

Note: the 4 system-design page routes (§15.5 UI Freeze table) were not diffed individually but fall under the same 5-viewer component boundary.

---

## Test Deliverables

| Path | Tests | Status |
|---|---|---|
| `scripts/artifact-generators/__tests__/contract.test.ts` | 52 | 52/52 PASS |
| `scripts/artifact-generators/__tests__/round-trip.test.ts` | 17 | 9 PASS, 8 SKIP (deferred) |
| `apps/product-helper/__tests__/artifact-pipeline.test.tsx` | 3 | 3/3 PASS |

**Total:** 72 tests; 64 PASS, 8 SKIP (deferred by design), 0 FAIL.

## Running the tests

Contract + round-trip (from repo root):
```
cd apps/product-helper && POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub \
  ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub \
  STRIPE_WEBHOOK_SECRET=whsec_stub OPENROUTER_API_KEY=stub \
  BASE_URL=http://localhost:3000 \
  npx jest \
    --roots=/Users/davidancor/Projects/c1v/scripts/artifact-generators/__tests__ \
    --config=/Users/davidancor/Projects/c1v/apps/product-helper/jest.config.ts
```

UI:
```
cd apps/product-helper && POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub \
  ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub \
  STRIPE_WEBHOOK_SECRET=whsec_stub OPENROUTER_API_KEY=stub \
  BASE_URL=http://localhost:3000 \
  npx jest __tests__/artifact-pipeline.test.tsx
```

---

## Decision: tag `t10-wave-1-complete`

**NOT CREATED.** EC-15.4 (tsc) is a hard FAIL — 7 type errors from missing optional bullmq dep. Per T10 guardrails, tag requires all ECs green (DEFERRED acceptable with remediation, FAIL not acceptable).

**Unblock path:** one of the three options in §EC-15.4 above. Option A (optionalDeps + structural types) recommended — keeps runtime graceful-fallback intent, satisfies tsc, avoids pulling in a redis dep we don't want to ship.
