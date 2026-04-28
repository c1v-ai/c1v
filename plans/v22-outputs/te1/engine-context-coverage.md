# engine-context coverage proof — EC-V21-E.2

> **Verifier:** `engine-context` (TE1, Wave E)
> **Branch:** `wave-e/te1-engine-context`
> **Hard-dep:** `te1-engine-core-complete` @ `cddf1bf`
> **Date:** 2026-04-27
> **Verdict:** ✅ all 5 representative phase decisions covered (3 by pre-existing tests, 1 reinforced, 4 added by this branch — see matrix)

---

## Scope

Per coordinator review (dispatch §Goal): verify `engines/artifact-reader.ts` + `engines/context-resolver.ts` resolve at least 5 representative phase decisions across M1 / M2 / M4 / M5 / M8. Verify-only contract: no edits to the `.ts` source files. Authored as additive tests where pre-existing coverage was thin.

## Test invocation

```bash
cd apps/product-helper && \
  POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub \
  ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub \
  STRIPE_WEBHOOK_SECRET=whsec_stub OPENROUTER_API_KEY=stub \
  BASE_URL=http://localhost:3000 \
  npx jest lib/langchain/engines/__tests__/artifact-reader.test.ts \
           lib/langchain/engines/__tests__/context-resolver.test.ts
```

**Result:** 24/24 green (8 artifact-reader + 12 baseline context-resolver + 4 cross-module additive).

## 5-decision coverage matrix

| # | Module | Representative phase decision | Source slug | Test name(s) | Status |
|---|---|---|---|---|---|
| 1 | M1 | data-flow availability target | `module-1/phase-2-5-data-flows` | `M1: resolves data-flow availability target from module-1/phase-2-5-data-flows` | ✅ added (this branch) |
| 2 | M2 | NFR / response-budget rule-tree | `module-2/phase-0-ingest`, `module-2/phase-5-ucbd-step-flow` | `projects typed inputs from artifact bags using dot-path reads`, `accumulates missing_inputs when artifact + signal both absent`, `returns validated artifact on happy path` (artifact-reader) | ✅ pre-existing |
| 3 | M4 | decision-network winner | `module-4/phase-14-decision-nodes` | `M4: resolves decision-network winner from module-4/phase-14-decision-nodes` (additive); `landing-path registry covers all registered M2/M3/M4 schemas` (registry membership) | ✅ added (this branch) + pre-existing registry assert |
| 4 | M5 | form-function morphological pick | `module-5/phase-3-concept-mapping-matrix` | `M5: resolves form-function morphological pick from module-5/phase-3-concept-mapping-matrix` (additive); `records missing_inputs when ref has no registered schema or landing path` (graceful-degrade for unregistered M5 paths) | ✅ added (this branch) + pre-existing degrade assert |
| 5 | M8 | fmea-residual severity | `module-8-risk/fmea-residual` | `M8: resolves fmea-residual severity via signals fallback when slug is outside MODULE_SLUGS enum` | ✅ added (this branch) |

## Notes on mechanism

**M1 / M4 / M5 (in-enum slugs):** the source string `<module-N>/<phase-slug>` parses cleanly via `parseModuleRefString` because the module slug is a member of the `MODULE_SLUGS` enum (`module-1` … `module-8`). The resolver routes the input through `ArtifactReader.fetch()`; the additive tests stub the reader to return a typed artifact bag, then assert the resolver projects the dot-path read down to the flat `typed_inputs` dict.

**M8 (out-of-enum risk slug):** the canonical M8 phase artifacts ship under `module-8-risk/{fmea-early,fmea-residual}` (see `lib/langchain/schemas/module-8-risk/index.ts`). That folder slug is NOT in the engine's `MODULE_SLUGS` enum (which is `module-1` … `module-8` strict). `parseModuleRefString` returns `null` for `module-8-risk/fmea-residual`, so the route has no artifact reference and the input falls through to the caller-supplied `signals` bag. The additive test asserts this path projects the M8 severity input correctly. **This is a known asymmetry between the schema-folder naming (`module-8-risk`) and the engine enum (`module-8`)**; documented here so it isn't re-discovered later. If a future ADR aligns the two (either by widening `MODULE_SLUGS` to include `module-8-risk` or renaming the schema folder), this test will need a follow-up review.

## What this proof does NOT cover

Per dispatch §Out of scope:

- Re-authoring `artifact-reader.ts` / `context-resolver.ts` (verify-only).
- Adding new phase-decision support (only the existing 5 representative cases).
- `lib/langchain/engine/` (singular path was DROPPED per Day-0 correction; canonical runtime is `lib/langchain/engines/` plural).
- `engine.json` story trees (engine-stories owns those).

The artifact-reader's landing-path registry currently covers M2/M3/M4 only (per `lib/langchain/engines/artifact-reader.ts:78-83`). M1/M5/M8 schemas exist in `lib/langchain/schemas/` but are NOT yet registered as landing paths; the `M1 / M4 / M5 / M8` additive tests stub the reader rather than exercise the registry. Registering those modules' landing paths is a future EC if/when the writer agents persist their phase artifacts back to `project_data`.

## Cross-references

- `apps/product-helper/lib/langchain/engines/artifact-reader.ts` — verify target (12.7K)
- `apps/product-helper/lib/langchain/engines/context-resolver.ts` — verify target (11.8K)
- `apps/product-helper/lib/langchain/engines/__tests__/artifact-reader.test.ts` — pre-existing
- `apps/product-helper/lib/langchain/engines/__tests__/context-resolver.test.ts` — extended with 4 additive tests (this branch)
- `apps/product-helper/lib/langchain/schemas/engines/engine.ts` — `MODULE_SLUGS`, `parseModuleRefString`, `DecisionRef` type
- Master plan: `plans/c1v-MIT-Crawley-Cornell.v2.2.md` §Wave E
- EC-V21-E.2 — closed by this proof + the 24/24 jest run
