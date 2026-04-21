# Schema Drift Report — Zod ↔ Hand-Written JSON Schemas

**Status:** Observation-only. No hand-written schemas were modified.
**Produced by:** Peer 3 (Phase A.5 prep — Zod→JSON auto-gen utility).
**Date:** 2026-04-21.
**Generator:** `apps/product-helper/lib/langchain/schemas/zod-to-json.ts`
**Run with:** `npm run schemas:generate` (from `apps/product-helper/`).

---

## TL;DR

The repo has **two disjoint families of `*.schema.json` files** living in `apps/product-helper/.planning/phases/`:

1. **True JSON Schema (draft-07) documents** — 2 files — envelope/handoff contracts for the Defining Scope module. These CAN be drift-compared against Zod output once a corresponding Zod schema exists (none does today).
2. **Excel template metadata** — 5 files — describe how to write `.xlsx` artifact files (cell ranges, merged regions, formula patterns). They are NOT JSON Schema documents. Drift comparison is **structural**, not validation-equivalence: each documents the same *domain concept* as a Zod schema (requirements, constants, UCBD, decision matrix, QFD) but at a different abstraction layer (cells vs. data).

Net: the Zod layer and the hand-written-schema layer model the same domain but **do not share a ground truth today**. Phase A.5 proper should pick one authoritative shape per concept, regenerate the other from it, and close the loop.

---

## What this report is (and isn't)

**This report is:**

- A structural audit of the 9 auto-generated JSON Schemas (produced by `zodToStrictJsonSchema`) against every `*.schema.json` file already in the repo that could plausibly be a validation artifact.
- A drift inventory — where does Zod say one thing and the hand-written schema say another?
- A map pointing at the decisions Phase A.5 proper will need to make.

**This report is not:**

- A fix. Nothing in the hand-written schemas was modified. The generator does not emit over them.
- A judgment that either side is "wrong." In several cases the Excel template intentionally captures concerns (cell formulas, merged ranges) that the Zod schema cannot and should not model.
- Exhaustive. It skips node_modules, .venv, cleo internal schemas (`.cleo/schemas/`), and `packages/cleo-validator/schemas/` — those are tooling infrastructure, not product-domain artifacts.

---

## Inventory

### Zod-generated outputs (9 files)

Generated into `apps/product-helper/lib/langchain/schemas/generated/`:

| # | Zod symbol | Generated file | Source |
|---|---|---|---|
| 1 | `useCaseSchema` | `use-case.schema.json` | `lib/langchain/schemas.ts` |
| 2 | `enhancedUseCaseSchema` | `enhanced-use-case.schema.json` | `lib/langchain/schemas.ts` |
| 3 | `ffbdSchema` | `ffbd.schema.json` | `lib/langchain/schemas.ts` |
| 4 | `decisionMatrixSchema` | `decision-matrix.schema.json` | `lib/langchain/schemas.ts` |
| 5 | `qfdSchema` | `qfd.schema.json` | `lib/langchain/schemas.ts` |
| 6 | `interfacesSchema` | `interfaces.schema.json` | `lib/langchain/schemas.ts` |
| 7 | `extractionSchema` | `extraction.schema.json` | `lib/langchain/schemas.ts` |
| 8 | `requirementsTableSchema` | `requirements-table.schema.json` | `lib/langchain/schemas.ts` |
| 9 | `constantsTableSchema` | `constants-table.schema.json` | `lib/langchain/schemas.ts` |

### Hand-written `*.schema.json` files in scope

Under `apps/product-helper/.planning/phases/` (scanned both `13-Knowledge-banks-deepened/` and `14-artifact-publishing-json-excel-ppt-pdf/`; phase 13 contains an older duplicate of each phase-14 file):

**Family 1 — Real JSON Schemas (draft-07):**

| File | Purpose |
|---|---|
| `…/14-…/1-defining-scope-kb-for-software/phase_artifact.schema.json` | Shared envelope for Module-1 phase outputs (status, stop-gap, fail-closed checks) |
| `…/14-…/1-defining-scope-kb-for-software/system_scope_summary.schema.json` | Module-1 → Module-2 handoff payload (system name, boundary, use cases, scope tree) |

**Family 2 — Excel template metadata (NOT JSON Schema):**

| File | Target .xlsx |
|---|---|
| `…/14-…/2-dev-sys-reqs-for-kb-llm-software/Requirements-table.schema.json` | `Requirements-table.xlsx` |
| `…/14-…/2-dev-sys-reqs-for-kb-llm-software/Requirement_Constants_Definition_Template.schema.json` | `Requirement_Constants_Definition_Template.xlsx` |
| `…/14-…/2-dev-sys-reqs-for-kb-llm-software/UCBD_Template_and_Sample.schema.json` | `UCBD_Template_and_Sample.xlsx` |
| `…/14-…/4-assess-software-performance-kb/decision-matrix-template.schema.json` | `decision-matrix-template.xlsx` |
| `…/14-…/5-HoQ_for_software_sys_design/QFD-Template.schema.json` | `QFD-Template.xlsx` |

Out-of-scope (tooling, not product domain): `.cleo/schemas/*`, `packages/cleo-validator/schemas/*`, `node_modules/**`, `.venv/**`.

---

## Drift Table

| Schema concept | Hand-written source | Zod source | Family | Drift summary |
|---|---|---|---|---|
| Module-1 phase envelope | `phase_artifact.schema.json` | — (none) | 1 | **Missing Zod counterpart.** Hand-written schema defines an `_schema`/`phase_id`/`status`/`stop_gap_cleared`/`fail_closed_check` envelope that has no representation in `schemas.ts`. Closest neighbor is `extractionSchema` but that has no envelope. |
| Module-1→2 handoff | `system_scope_summary.schema.json` | — (none) | 1 | **Missing Zod counterpart.** Hand-written captures `system_name`/`boundary`/`use_cases`/`scope_tree_functions`/`project_metadata`. `systemBoundariesSchema` + `useCaseSchema` cover pieces but there is no top-level handoff schema. |
| Requirements table | `Requirements-table.schema.json` | `requirementsTableSchema` / `requirementsTableRowSchema` | 2 | **Severe drift.** Excel template has a 3-column table (`index`, `requirement`, `abstract_function_name`) plus ~17 metadata fields (project_name, document_id, author, stakeholders, …). Zod has 8 row fields (`id`, `name`, `description`, `source`, `priority`, `testability`, `status`, `category`) and a thin `metadata` object. Field names do not overlap except semantically. Either the Excel template needs 5 more columns or the Zod schema needs to be narrowed to what the Excel artifact publishes. |
| Constants table | `Requirement_Constants_Definition_Template.schema.json` | `constantsTableSchema` / `constantsTableRowSchema` | 2 | **Moderate drift.** Excel has 9 columns (`constant`, `value`, `units`, `estimate_final`, `date_update`, `final_date`, `source`, `owned_by`, `notes`). Zod has 5 (`name`, `value`, `units`, `description`, `category`). Excel tracks operational provenance (estimate vs. final, owner, dates) that Zod omits. Zod adds a `category` enum the Excel template doesn't. Name alignment: Excel `constant` ↔ Zod `name` (trivial rename); Excel `notes` ↔ Zod `description` (semantic overlap, not identical). |
| UCBD (Use Case Behavioral Diagram) | `UCBD_Template_and_Sample.schema.json` | `useCaseSchema` / `enhancedUseCaseSchema` | 2 | **Different conceptual shape.** UCBD is swimlane-organized (4 actor columns — `primary_actor`, `the_system`, `other_actors`, `extra_actor_col` — × 16 step rows) with `initial_conditions` / `ending_conditions` as separate numbered lists. Zod use case is step-list-organized (`mainFlow[]` of `{actor, action, systemResponse}` records + `alternativeFlows[]` + `preconditions[]` + `postconditions[]` + `acceptanceCriteria[]`). These are two ways of visualizing the same content. Mapping a Zod use case to a UCBD template requires pivoting step-list → swimlane grid (transpose actors to columns), which is a rendering concern, not a validation concern. |
| Decision matrix | `decision-matrix-template.schema.json` | `decisionMatrixSchema` | 2 | **Shape mismatch at the cardinality layer.** Excel is hard-coded to 3 options (A/B/C) × up to 8 criteria, with separate Value / Normalized-Value / Final-Score / Weight columns and pre-seeded `=H*K` / `=SUM` formulas. Zod supports N alternatives × N criteria via `scores: Record<criterionId, number>`. Excel also has a dedicated `scale_measure_block` for subjective 1–5 scale definitions that Zod does not model. Excel's normalization is explicit; Zod's is left to the caller. Populating the Excel template from a Zod `DecisionMatrix` will require: (a) truncating/padding to 3 alternatives × ≤8 criteria, (b) computing normalized values, (c) skipping the formula columns L/M/N. |
| QFD (House of Quality) | `QFD-Template.schema.json` | `qfdSchema` | 2 | **Semantic match, encoding mismatch.** Both capture the same HoQ concepts: customer needs (PCs), engineering characteristics (ECs), relationship matrix, roof, competitive scoring, basement targets/difficulty/cost. Encoding differs: Excel uses signed integers `{-2,-1,0,1,2}` in the matrix and roof; Zod uses string enums (`strong`/`moderate`/`weak` for relationships, `strong-positive`/`positive`/`negative`/`strong-negative` for roof). Excel also supports asymmetric values (`-1/+1` strings) that Zod does not. Excel bounds: ≤12 PCs, ≤26 ECs. Zod is unbounded. Excel has a hard constraint (PC weights sum to 1.0 ±0.01) Zod does not enforce. |
| FFBD | — (no hand-written equivalent) | `ffbdSchema` | — | No drift to report. FFBD artifacts are emitted as Mermaid diagrams, not .xlsx. |
| Interfaces (N² chart, interface matrix) | — (no hand-written equivalent) | `interfacesSchema` | — | No drift to report. Similarly Mermaid-targeted. |
| Extraction bundle | — (no hand-written equivalent) | `extractionSchema` | — | No direct hand-written counterpart; `extractionSchema` is the LangChain extraction-agent output envelope, not an artifact shape. |

---

## Cross-cutting observations

1. **No file was both hand-written JSON Schema AND matched a Zod symbol.** The two Family-1 schemas (phase_artifact, system_scope_summary) have no Zod counterpart. All Zod symbols with drift candidates are matched against Family-2 (Excel template) files, which is an apples-to-oranges comparison.

2. **Metadata header duplication.** Every Family-2 schema repeats the same ~17 header fields (project_name, document_id, document_type, status, last_update, target_release, target_release_2, confidentiality, created_date, author, approvers, stakeholders, supersedes, linked_ticket, parent_okr, regulatory_refs) and the same three "known_issues" notes (duplicate "Target Release", "Aprovers" typo, truncated "Parent OKR" label). None of these fields are modeled in Zod. A shared Zod `artifactMetadataSchema` would let the `.xlsx` writers render these once instead of being documented five times.

3. **Phase 13 vs. Phase 14 duplication.** Every Family-2 schema under `.planning/phases/14-…/` has an identical (or near-identical) sibling under `.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/`. Phase 14 is the current authoritative copy per project memory. Phase 13 duplicates are not covered here and should be de-duplicated before this drift report is acted on — otherwise any fix has to be applied twice.

4. **`.passthrough()` status.** None of the Zod schemas in `schemas.ts` use `.passthrough()` today. Every generated schema ends up with `additionalProperties: false` on every object node. If Phase A.5 proper introduces any extension points (open-ended metadata, agent-emitted extras), switching those Zod objects to `.passthrough()` will emit `additionalProperties: true` and the generator will preserve that (see `zod-to-json.ts` — the strict pass only fills absent slots, never overwrites an explicit true).

---

## Recommendations for Phase A.5 proper

(Not done in this pass — listed so Phase A.5 executor has a starting point.)

1. **Add Zod counterparts for the two Family-1 schemas.** Model `phase_artifact.v1` and `system_scope_summary.v1` in `schemas.ts` (or a new `schemas/module-1.ts`). Regenerate; diff. This is the only case where a strict JSON-Schema-vs-JSON-Schema diff is meaningful today.

2. **Pick a direction for each Family-2 concept.** For every Family-2 drift row above, decide: is the Excel template the authority (Zod must widen/rename to match) or is the Zod schema the authority (Excel template must be regenerated from it)? Both options are valid; pick deliberately.

3. **Extract an `artifactMetadataSchema`.** The ~17 shared header fields are a copy-paste across all Family-2 files. Model once in Zod, compose into the Excel writer.

4. **De-duplicate Phase 13 vs. Phase 14 hand-written schemas** before any code tries to treat one as authoritative.

5. **Consider validating LangChain agent outputs against the generated JSON Schemas in CI.** The generator already emits draft-07. Wiring an ajv-based check into the Jest suite would catch runtime agent-output drift for free.

---

## How to re-run / extend

```bash
cd apps/product-helper
npm run schemas:generate      # regenerates all 9 outputs
npx jest lib/langchain/schemas/__tests__/zod-to-json.test.ts  # unit tests
```

To add a schema to the generator, edit the `SCHEMAS` array in `apps/product-helper/lib/langchain/schemas/generate-all.ts`.
