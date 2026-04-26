# TC1 EC-V21-C.0 — namespace resolution record

**Status:** GREEN
**Tags:** `tc1-c0-complete` + `tc1-preflight-complete` (alias) → both point at `3e2abdf`
**Branch:** `wave-b/tb1-docs` (TC1 work landed on top of v2.2 branch — no separate `wave-c/tc1-preflight` branch was cut)
**Date:** 2026-04-26

## Decision: Option A — two-bucket rename in `module-5/`

The spawn-prompt's default plan ("rename + absorb `form-function-map.ts` as `phase-3-form-function-concept.ts`") was rejected on reconciliation. `form-function-map.ts` does not exist as a separate file on disk; the `formFunctionMapV1Schema` is a top-level **composite** living inside `phase-7-form-function-handoff.ts` (with `_schema: 'module-5.form-function-map.v1'`). The "absorb" verb was a misread of the existing schema structure.

The chosen path (Option A — coordinator ruling 2026-04-26 ~22:25 EDT):

- Rename folder `module-5-form-function/` → `module-5/` (folder-level only).
- KEEP all 7 existing phase files at their existing filenames.
- Wave-C new schemas (owned by `crawley-schemas` agent) land alongside under distinct filenames (e.g. `phase-1-form-taxonomy.ts` coexists with `phase-1-form-inventory.ts` in the same folder) with distinct `_schema` literals.
- Single `MODULE_5_PHASE_SCHEMAS` registry exports both buckets; no duplicate keys (each file's distinct slug + each schema's distinct `_schema` literal).
- The phase-numbering "collision" between Cornell-shape (existing) and Crawley-shape (Wave-C new) phase files is purely numerological — distinct slugs and distinct schema keys mean no actual collision in the type system or registry.

The spawn-prompt's documented alternative (`module-5-crawley/` separate namespace) was not needed.

## Renamed paths (9 files, history preserved 100%)

```
apps/product-helper/lib/langchain/schemas/module-5-form-function/  →  module-5/
  _shared.ts
  index.ts
  phase-1-form-inventory.ts
  phase-2-function-inventory.ts
  phase-3-concept-mapping-matrix.ts
  phase-4-concept-quality-scoring.ts
  phase-5-operand-process-catalog.ts
  phase-6-concept-alternatives.ts
  phase-7-form-function-handoff.ts
```

Commit: `6be88b5 — refactor(schemas): git mv module-5-form-function/ -> module-5/ (EC-V21-C.0)`

## Importers updated (5 external files, +24 / -24 mechanical)

| File | Change |
|---|---|
| `apps/product-helper/lib/langchain/schemas/generate-all.ts` | import + `MODULE_5_OUTPUT_DIR` constant + 2 console-log labels |
| `apps/product-helper/lib/langchain/agents/system-design/form-function-agent.ts` | import |
| `apps/product-helper/lib/langchain/agents/system-design/__tests__/form-function-agent.test.ts` | type import |
| `apps/product-helper/__tests__/build-all-headless.test.ts` | import + module label |
| `apps/product-helper/scripts/verify-t5.ts` | import + `SCHEMA_DIR` + jsdoc + V5.4 success message |

Plus 9 intra-`module-5/` `@module` JSDoc tags + `scripts/__tests__/verify-tree-pair-consistency.test.ts` fixture (3 hardcoded references at lines 79, 175-176).

Commit: `3e2abdf — refactor(schemas): rewrite module-5-form-function -> module-5 importers + jsdoc + fixture (EC-V21-C.0)`

## Schema-key invariants

Zero changes to schema keys. `_schema: 'module-5.form-function-map.v1'` in `phase-7-form-function-handoff.ts` is byte-identical pre/post rename. Registry size = 8 entries, all distinct slugs. T5 self-application artifact `form_function_map.v1.json` consumes the unchanged key.

## Verification

| Check | Baseline (`main` @ `8ad1bb5`) | Post-rename (`3e2abdf`) | Verdict |
|---|---|---|---|
| `npx tsc --noEmit` apps/product-helper | 9 errors | **same 9 errors** | No new errors introduced |
| `npx jest form-function` | (not measured) | **8/8 pass** in 0.244s | Green |
| `verify-tree-pair-consistency.test.ts` | (not measured) | **8/8 fixture cases + helper unit tests pass** | Green |
| `pnpm tsx scripts/verify-t5.ts` | (not measured) | **V5.2b / V5.3 / V5.4 all pass** | Green |

The 9 baseline tsc errors are pre-existing on `main`:

- `lib/db/schema/index.ts` lines 46/123/130/135 (missing `./traceback`, `./traceback-validators`)
- `lib/langchain/engines/{artifact-reader,context-resolver,engine-loader}.ts` (missing `../schemas/engines/engine`)
- `lib/langchain/engines/engine-loader.ts:166` (implicit `any`)
- `scripts/atlas/validate-entries.ts` (missing `js-yaml` types)

Triage queue (post-TC1, NOT TC1 scope): see surfaces below.

## Surfaces flagged for post-TC1 triage

1. **9 baseline tsc errors** — likely Wave-E-related stubs (engines/engine module, traceback) left in by an earlier session; not introduced by TC1.
2. **`__tests__/build-all-headless.test.ts` script-not-found** — test imports `@/scripts/build-all-headless` but `apps/product-helper/scripts/build-all-headless.ts` does not exist on disk and `git log --all` confirms it was never committed. Test landed without its companion script in T6 Wave-4 close commit `94f6c0e`. Pre-existing failure, unrelated to TC1.
3. **`scripts/verify-t5.ts:27` — `system-design/kb-upgrade-v2/module-5-formfunction/form_function_map.v1.json`** — the v2-artifact tree path uses `module-5-formfunction` (no hyphen) which is different from the schema dir's `module-5-form-function`. Not in scope of namespace-resolver's rename; left untouched.
4. **IDE diagnostics for test-file imports** — IDE language server flagged test-file imports (form-function-agent.test.ts, build-all-headless.test.ts) as broken. tsc disagreed (`apps/product-helper/tsconfig.json` excludes test files; tests run only under jest). Per `feedback_tsc_over_ide_diagnostics.md` memory: stale IDE state, not a real break. Tests are jest-resolved at runtime and were verified green.

## Hand-off to Wave-C downstream agents

The `module-5/` namespace is clean and ready. Wave-C agents can land:

- 5 module-5 phase schemas (`crawley-schemas`) under distinct filenames alongside existing 7
- `module-5/_matrix.ts` (`mathDerivationMatrixSchema` Option Y, M5-local per REQUIREMENTS-crawley §5)
- Migrations against new tables (`crawley-migrations`)
- Eval datasets (`eval-harness`)
- Methodology page (`methodology-page`)

All 4 are unblocked by `tc1-preflight-complete`.
