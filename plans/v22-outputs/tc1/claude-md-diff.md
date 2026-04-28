# `apps/product-helper/CLAUDE.md` — proposed diff (TC1 / Wave C / v2.2)

**Status:** AWAITING DAVID'S AUTHORIZATION before applying.
**Author:** docs-c (documentation-engineer subagent), Wave C of v2.2.
**Branch:** `wave-c/tc1-m345-schemas`.
**Tag:** `tc1-wave-c-complete` @ `f5992639`.

Per docs-c spawn-prompt: "DO NOT introduce new section headers in CLAUDE.md beyond the one named below — keep CLAUDE.md additions minimal."

## Proposed change

Insert ONE new H3 subsection under the existing `## Architecture` H2 (between `### Synthesis Pipeline (v2.1 — Wave A shipped Apr 25, 2026)` at line 104 and `## Conventions` at line 122).

## Diff

```diff
--- a/apps/product-helper/CLAUDE.md
+++ b/apps/product-helper/CLAUDE.md
@@ -119,6 +119,29 @@ Vercel-side kickoff + status surface for the Cloud Run sidecar (`services/python
 **Manifest contract version:** if you change the `/artifacts/manifest` response shape, follow the bump rules in `plans/v21-outputs/ta3/manifest-contract.md` §2 — TA2's download dropdown pins to `v1` and breaks loudly on a `v2` shape change.

+### Crawley Typed Schemas (Wave C, v2.2)
+
+Eleven Zod schemas at `lib/langchain/schemas/{module-2,module-3,module-4,module-5}/` that gate Crawley-discipline phase artifacts. Source-of-truth: `plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md`.
+
+- **10 phase artifacts** + **1 matrix keystone** primitive (`mathDerivationMatrixSchema` at `module-5/_matrix.ts`, sibling type to scalar `mathDerivationSchema`). Per REQUIREMENTS-crawley §5 locality rule, the keystone stays M5-local until a 3rd non-M5 site emerges (Option Y).
+- **Schema map:** see `plans/v22-outputs/tc1/schemas-shipped.md` for the 11-row schema-id ↔ source-file ↔ Crawley-chapter ↔ test-coverage table.
+- **Registry:** `CRAWLEY_SCHEMAS` (10 phase artifacts) + `CRAWLEY_MATRIX_KEYSTONE` (1 primitive) exports from `lib/langchain/schemas/index.ts`. Gated by `__tests__/schemas/registry-no-dupes.test.ts` (no duplicate `schemaId`s, no duplicate `sourcePath`s, keystone separate from phase set).
+- **Drift policy:** quarterly snapshot via `apps/product-helper/scripts/quarterly-drift-check.ts` (cron `0 0 1 */3 *` per `.github/workflows/quarterly-drift-check.yml`). Non-zero exit opens an issue tagged `@team-c1v`.
+- **Eval gate:** LangSmith project `c1v-v2-eval`; 300 graded examples (30/agent × 10 v2 agents) at `apps/product-helper/lib/eval/datasets/<agent>.jsonl`. Harness at `apps/product-helper/lib/eval/v2-eval-harness.ts` falls back to fixture-replay when `LANGCHAIN_API_KEY` is unset.
+- **Runbook:** operator guide for adding/extending schemas at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_dev-runbooks/crawley-schema-runbook.md`.
+
+**Schema-barrel shadowing (known drift):** the legacy `lib/langchain/schemas.ts` file shadows the new `lib/langchain/schemas/index.ts` for `'../schemas'` imports under bundler resolution. Reach the new barrel via explicit subpath, e.g. `import { CRAWLEY_SCHEMAS } from '@/lib/langchain/schemas/index'`. Cleanup deferred (optional).
+
+**Agent-emitter sites NOT YET refactored:** the 10 matrix sites (`po_array_derivation`, 9 × `full_dsm_block_derivations`) are gated at the schema-author level only. Agent emitters (`form-function-agent.ts`, etc.) still emit pre-Crawley shapes; migration to populate the new matrix-derivation fields is deferred to v2.2 Wave D / agent-rewrite. The schema gate already rejects future emissions that omit or mis-type these fields.
+
+**postgres-js jsonb gotcha:** when persisting Zod-validated artifact JSON to a `jsonb` column via `postgres-js`, bind the JS object directly (the driver serializes). Do NOT do `JSON.stringify(obj)::jsonb` — it yields jsonb-of-string and breaks `jsonb_typeof = 'object'` constraint checks. See runbook §5.
+
 ## Conventions
```

## Why these specific bullets

- **Schema map pointer (line: "see `schemas-shipped.md`"):** keeps CLAUDE.md a thin index — the 11-row table lives once in `plans/v22-outputs/tc1/schemas-shipped.md` (single source of truth).
- **Registry + drift-policy:** quarterly cron + LangSmith project name are the two operational facts a future contributor needs to find without reading the runbook.
- **Schema-barrel shadowing:** non-obvious gotcha that bit reviewers — the new `index.ts` barrel exists but `'../schemas'` resolves to the legacy file. Documenting it once here saves a 10-minute debug.
- **Agent-emitter NOT YET refactored:** the schema gate IS the matrix-site refactor today; the agent layer is deferred. Future contributors hitting `mathDerivationMatrixSchema` parse failures need to know it's because their agent emits the pre-Crawley shape.
- **postgres-js jsonb:** verifier surfaced this as a real pitfall during TC1 migrations (per `plans/v22-outputs/tc1/migrations-mapping.md`). Belongs alongside other Dev Quirks-grade facts.

## What was deliberately NOT included

- Per-agent eval grade distributions (lives in `eval-harness-summary.md`).
- Per-migration RLS + index summaries (lives in `migrations-mapping.md`).
- Verification-report contents (lives in `verification-report.md`).
- Methodology canonical-source pointer (already covered elsewhere; methodology page is a thin viewer).
- Any mention of v2.2 Wave D / Wave E surfaces (those are different teams' deliverables).

## Apply this diff

After David's go-ahead, the docs-c agent (or coordinator) applies the diff above with a single commit on branch `wave-c/tc1-m345-schemas`:

```bash
# from repo root
git checkout wave-c/tc1-m345-schemas
# apply the patch above to apps/product-helper/CLAUDE.md
git add apps/product-helper/CLAUDE.md
git commit -m "docs(tc1): document Crawley typed schemas in apps/product-helper/CLAUDE.md"
```
