---
name: Per-Destination Zod Shape Specifications (Crawley Curated)
purpose: "Reviewer reference for every Crawley-derived Zod schema. Cross-index of schema id → destination file → Zod shape → extension points."
companion_to: "./MAPPING-crawley.md (high-level routing)"
inherits: "apps/product-helper/lib/langchain/schemas/module-2/_shared.ts — phaseEnvelopeSchema, metadataHeaderSchema, mathDerivationSchema, sourceRefSchema, softwareArchDecisionSchema, phaseStatusSchema, columnPlanSchema, insertionSchema"
shared_ts_modifications: "ZERO. _shared.ts was NOT modified during Crawley curation. All Crawley-specific enums are phase-local (35 enums across destinations)."
math_derivation_v2_resolution: "Option Y (team-lead 2026-04-22). M5-local `mathDerivationMatrixSchema` at `module-5/_matrix.ts` (NEW). Not hoisted to _shared.ts. V2 surface: 10 matrix derivations (1 PO array + 9 DSM blocks) + 1 scalar projection-chain descriptor."
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-22"
---

# Per-Destination Zod Shape Specifications

> **Purpose.** Companion to `MAPPING-crawley.md`. Where MAPPING answers "which chapter lives where", this doc answers "what is the Zod shape of that destination". Every destination file has a TS Zod snippet in its own body; this doc is the cross-reference.
>
> **Convention reminder (project CLAUDE.md):** every Zod field carries `.describe("x-ui-surface=page-header|section:<path>|internal:<label> — <human>")`. `refine().extend()` drops refinements — use `.innerType().extend().superRefine()` pattern. Schema ids follow `module-<n>.<phase-slug>.v<X>`. Types are PascalCase; fields are snake_case.

---

## 1. Schema Registry (all Crawley-sourced Zod schemas)

| Schema ID | Destination File | Extends | Phase-Local Enums | superRefine Invariants |
|---|---|---|---|---|
| `module-5.phase-1-form-taxonomy.v1` | `5-form-function-mapping/01-Phase-1-Form-Taxonomy.md` | `phaseEnvelopeSchema` | `formalRelationshipKindSchema`, `decomposabilitySchema` | Dualism (≥1 physical entity), Level-0 singleton |
| `module-5.phase-2-function-taxonomy.v1` | `5-form-function-mapping/02-Phase-2-Function-Taxonomy.md` | `phaseEnvelopeSchema` | `functionalInteractionKindSchema` (4 values post-reconcile), `poArrayCellSchema` (7 values), `interactionKindSchema` | Primary-external singleton, value-pathway closure, PO-array causality |
| `module-5.phase-3-form-function-concept.v1` | `5-form-function-mapping/03-Phase-3-Form-Function-Concept.md` | `phaseEnvelopeSchema` | `mappingCardinalitySchema` (6 values), `operandInteractionKindSchema` (discriminatedUnion on category), `structureExceptionSchema` | No-instrument on complete; supporting_processes ↔ supporting_instruments layer parity; form_count_ratio ≤ 3.0 |
| `module-5.phase-4-solution-neutral-concept.v1` | `5-form-function-mapping/04-Phase-4-Solution-Neutral-Concept.md` | `phaseEnvelopeSchema` | `conceptNamingConventionSchema` (6 values), `operandSpecializationKindSchema` (6 values), `processSpecializationKindSchema` (3 values) | SN process ≠ specific process; conops ≠ concept verbatim; service requires ownership_inversion_note; ≥2 integrated_concepts |
| `module-5.phase-5-concept-expansion.v1` | `5-form-function-mapping/05-Phase-5-Concept-Expansion.md` | `phaseEnvelopeSchema` | `decompositionLevelSchema` (min 1 max 2), `clusteringBasisSchema` (3 values), `modularizationReviewStateSchema` (5 values including `revised`) | Modularization review approved on complete; Table 8.1 20-question coverage; Level-2 entity soft cap warning |
| `module-3.decomposition-plane.v1` | `2-dev-sys-reqs-for-kb-llm-software/crawley-ch13-decomposition-heuristics.md` | (supplement shape, NOT phaseEnvelopeSchema — see §3 below) | `decompositionPlaneSchema` (13 values), `complexityKindSchema` (3 values) | 2-Down-1-Up gate on complete; 7±2 hard cap 9; plane alignment ≥ 0.5 |
| `module-4.decision-network-foundations.v1` | `4-decision-network-mit-crawley/01-Decision-Network-Foundations.md` | `phaseEnvelopeSchema` | `decisionVariableTypeSchema` (3 values), `constraintKindSchema` (3-way discriminatedUnion), `metricComputationKindSchema` (4 values), `simonPhaseSchema` (4 values), `dssTaskSchema` (4 values), `decisionNetworkNodeKindSchema` (3 values), `topologyKindSchema` (3 values) | Categorical default (>20% continuous advisory); DSS tasks 1-3 covered on complete; tree topology ≠ metric_coupling; metric equation gating |
| `module-4.tradespace-pareto-sensitivity.v1` | `4-decision-network-mit-crawley/02-Tradespace-Pareto-Sensitivity.md` | `phaseEnvelopeSchema` | `dominanceKindSchema` (3 values), `fuzzyParetoStrategySchema` (2 values), `sensitivityRegionSchema` (3 values), `decisionQuadrantSchema` (4 values), `frontierMiningClassSchema` (4 values), `designOfExperimentsSchema` (4 values) | Sensitivity ≥ 3 scenarios; robustness ≥ 0.8 OR fuzzy alternative; Q-I → Q-IV precedence; ≥ 2 visible metrics |
| `module-4.optimization-patterns.v1` | `4-decision-network-mit-crawley/03-Optimization-Patterns.md` | `phaseEnvelopeSchema` | `patternSchema` (6 values), `elementInteractionKindSchema` (3 values), `architectureStyleSchema` (4 values), `valueFunctionKindSchema` (4 values), `solverKindSchema` (5 values), `architectTaskSchema` (6 values), `compositionOperatorSchema` (4 values) | Pattern metadata presence (DOWN_SELECTING → element_interactions; ASSIGNING/CONNECTING → architecture_style); composition required for multi-subproblem; 7±2 advisory; solver consistency; value-function gating |
| `module-2.requirements-crawley-extension.v1` | `2-dev-sys-reqs-for-kb-llm-software/crawley-ch11-needs-to-goals.md` | `phaseEnvelopeSchema` | `stakeholderCategorySchema` (4 values), `kanoCategorySchema` (3 values), `flowKindSchema` (6 values), `goalCriteriaKeySchema` (5 values) | 5 goal criteria all true; must-have coverage; F-16 numeric-grounding; balance advisory (> 7 goals + > 30% inconsistent); value-loop closure |

**Total phase-local enums: 35** across 10 schemas (includes new `dsmBlockKindSchema` added to phase-3 per Option Y decomposition ruling). `_shared.ts` modifications: **0**. M5-local `_matrix.ts` file NEW (holds `mathDerivationMatrixSchema`).

---

## 2. Extension-Point Matrix (what-feeds-what)

For each schema, the fields consumed from upstream + emitted to downstream:

### `module-5.phase-1-form-taxonomy.v1`
- **Consumes:** M1 `system_scope_summary.v1` (scope bounds), M1 Phase-3 `scope-tree.v1` (Level-1 entities).
- **Emits:** `form_entities[]` (Level 0–2), `interfaces[]`, `accompanying_systems[]`, `use_context_entities[]`.
- **Downstream consumers:** phase-2 function taxonomy (instrument_form_ref), phase-3 form-function concept (formal_relationships DSM), phase-5 concept expansion (level_1_form_decomposition).

### `module-5.phase-2-function-taxonomy.v1`
- **Consumes:** phase-1 `form_entities[]`, M1 `system_scope_summary.v1`, M3 Phase-6 FFBD cross-ref.
- **Emits:** `primary_external_function`, `internal_functions[]`, `functional_interactions[]`, `po_array[]`, `po_array_derivation` (uses **`mathDerivationMatrixSchema`** from M5-local `_matrix.ts`; 1 matrix derivation — Option Y resolved 2026-04-22), `value_pathway[]`.
- **Downstream:** phase-3 full_dsm (PO block), phase-4 concept generation (process+operand+instrument triad).

### `module-5.phase-3-form-function-concept.v1`
- **Consumes:** phase-1 form entities, phase-2 function taxonomy outputs.
- **Emits:** `form_function_maps[]` (with 6-enum mapping_cardinality), `architecture_layers`, `non_idealities[]`, `interfaces[]` (spec), `operational_behavior`, `full_dsm` (9-block data shape), `full_dsm_block_derivations[]` (9 matrix derivations keyed by **`dsmBlockKindSchema`**, using `mathDerivationMatrixSchema` — Option Y), `dsm_projection_chain_derivation` (scalar chain descriptor whose `inputs` reference the 9 block ids), `operand_interactions[]` (Table 6.4 discriminated union).
- **Downstream:** M4 phase-1 decision_dsm seeding, phase-5 clustering.

### `module-5.phase-4-solution-neutral-concept.v1`
- **Consumes:** phase-2 function taxonomy, M1 `system_scope_summary.v1`.
- **Emits:** `solution_neutral_function` (7 fields), `concepts[]`, `morphological_matrix` (≥ 2 integrated_concepts), `concept_of_operations`, optional intent hierarchy (up + down).
- **Downstream:** M4 phase-1 `decisions[].alternatives` (integrated_concepts become candidates), phase-5 inherited_intent.

### `module-5.phase-5-concept-expansion.v1`
- **Consumes:** phase-3 full_dsm (clustering input), phase-4 concepts (Level-0 seed).
- **Emits:** `level_1_expansions[]`, `level_2_expansions[]` (≥ 1), `clustering_analysis` (basis + algorithm + clusters + time-vs-coupling comparison), `modularization_review_state`, `synthesis_question_coverage[]` (20 rows).
- **Downstream:** M4 phase-1 decisions (Level-1 clusters as decisions), M3 decomposition supplement (coupling scores).

### `module-3.decomposition-plane.v1`
- **Consumes:** M3 FFBD Level-1 clusters + Level-2 expansion (2-Down-1-Up evidence).
- **Emits:** `decomposition_plane` (13-enum), `complexity_measures` (N1–N4 + C scalar), `complexity_derivations` (scalar mathDerivation records), `level_1_clusters[]`, `conway_law_alignment`, `plane_alignment_score`.
- **Downstream:** M4 phase-1 decision-coupling seeding.

### `module-4.decision-network-foundations.v1`
- **Consumes:** M5 phase-4 morphological matrix (alternatives), M5 phase-3 full_dsm (DSM seeding), M5 phase-5 clusters (decision grouping).
- **Emits:** `decisions[]` (with variable_type ∈ {categorical, discrete, continuous}), `constraints[]` (3-way discriminated union), `metrics[]` (4-kind computation), `decision_dsm`, `decision_network` (topology: tree / dag / general_graph), `dss_task_coverage` (4-task checklist).
- **Downstream:** M4 phase-2 Pareto (decisions + metrics consumed), M4 phase-3 optimization (decisions grouped into sub-problems by pattern).

### `module-4.tradespace-pareto-sensitivity.v1`
- **Consumes:** M4 phase-1 decisions + metrics + constraints + decision_dsm.
- **Emits:** `architectures[]` (evaluated), `pareto_analysis`, `fuzzy_pareto` (rank cutoff OR Euclidean threshold), `frontier_mining[]` (Table 15.2 4-class), `tradespace_structure` (clusters + strata + holes), `sensitivity_analysis` (N scalar mathDerivation records per decision-metric), `decision_organization[]` (4-quadrant), `refactor_suggestions[]`.
- **Downstream:** M4 phase-3 optimization (non-dominated set + sensitivity feeds Pattern selection + solver choice).

### `module-4.optimization-patterns.v1`
- **Consumes:** M4 phase-1 + phase-2.
- **Emits:** `architect_task_assignments[]`, `sub_problems[]` (one per Pattern), `composition` (NEOSS-style operator for multi-subproblem), `value_function`, `constraint_hardness` (hard IDs + soft + penalty_scalar), `solver` (kind + parameters + justification), `non_dominated_architecture_ids: string[]`.
- **Downstream:** M5 phase-5 Level-2 expansion (chosen architecture drives expansion); closes the Pass-3-to-Pass-2 feedback loop.

### `module-2.requirements-crawley-extension.v1`
- **Consumes:** M1 `system_scope_summary.v1`.
- **Emits:** `beneficiaries[]`, `stakeholders[]` (4-category cross-enum), `needs[]` (6-dimension + Kano + SN triad), `value_flows[]`, `value_loops[]` (Cameron multiplicative-weight metric), `goals[]` (5-criteria required booleans + tradable + overspecification_check), `problem_statement` (F-16 check).
- **Downstream:** M5 phase-4 solution-neutral (prioritized need's operand/attribute/process feeds SN function).

---

## 3. Deviation: `module-3.decomposition-plane.v1` supplement shape

Team-lead ruling 2026-04-22 — M3 supplement uses a **lighter envelope** than `phaseEnvelopeSchema`. Rationale: supplements aren't phases. Existing M3 KB pattern (`00-Requirements-Builder-Master-Prompt.md`, `01-Reference-Samples-and-Templates.md` etc.) is prose + embedded schema snippets, not envelope-wrapped phase artifacts.

**Supplement shape (minimal):**
```ts
export const decompositionPlaneArtifactSchema = z
  .object({
    _schema: z.literal('module-3.decomposition-plane.v1'),
    _phase_status: z.enum(['planned', 'in_progress', 'complete', 'needs_revision']),
    // ...phase-local fields
  });
```

No `metadata`, `_output_path`, `_columns_plan`, `_insertions` (those are phase-only envelope fields). If this supplement is ever promoted to a full phase, refactor to extend `phaseEnvelopeSchema`.

---

## 4. Scalar-decomposition discipline (mathDerivationV2 avoidance)

### Preserved as scalar (no V2 needed)

| Site | Decomposition approach |
|---|---|
| M5 phase-4 integrated_concepts scoring | `selections: Record<processId, instrumentId>` — each entry is a string, not a derivation |
| M3 decomposition complexity `C` | Scalar `C = N1+N2+N3+N4`; emitted as single mathDerivation record |
| M3 Boothroyd-Dewhurst alternative | Scalar `(N1·N2·N3)^(1/3)`; emitted as second mathDerivation record |
| M4 phase-2 sensitivity `main_effect` per decision-metric pair | N separate scalar mathDerivation records in `per_decision_sensitivity[]` |
| M4 phase-2 Pareto rank | `pareto_rank: int` per architecture (scalar) |
| M4 phase-2 fuzzy Euclidean threshold | Scalar |
| M4 phase-3 Pareto set | `non_dominated_architecture_ids: string[]` (list of refs, not vector) |
| M4 phase-3 element_interactions[] | Sparse array-of-triples, each weight is scalar |
| M4 phase-3 value_function (equation) | Scalar V(A) output per architecture |

### Matrix-valued (V2 candidates)

| Site | Reason decomposition is not viable |
|---|---|
| M5 phase-2 `po_array_derivation` | 1 × matrix derivation. Uses `mathDerivationMatrixSchema`. PO array is an inherent matrix; zero-out-primes causality rule requires matrix ops |
| M5 phase-3 `full_dsm_block_derivations[]` (length 9) | 9 × matrix derivations, one per `dsmBlockKindSchema` value. Each block is 2D (rows × cols). Decomposed per team-lead 2026-04-22 ruling to preserve Crawley's structural per-block provenance |
| M5 phase-3 `dsm_projection_chain_derivation` | 1 × **scalar** chain-descriptor (uses base `mathDerivationSchema`). `inputs` field references the 9 block derivation ids. Describes `FP × PP × PF + FP × PP × PO × OO × OP × PP × PF` from Crawley §6.5 line 2905+ without materializing a separate matrix output |

---

## 5. `_shared.ts` interaction matrix

Zero modifications applied to `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` during Crawley curation. All 10 new schemas **consume** primitives from `_shared.ts`:

| Primitive | Used by |
|---|---|
| `phaseEnvelopeSchema` | All 9 full-phase schemas (not the M3 supplement) |
| `phaseStatusSchema` | All 10 schemas via envelope or direct field |
| `metadataHeaderSchema` | 9 full-phase schemas via envelope |
| `mathDerivationSchema` | M5 phase-2 (PO array), phase-3 (full DSM), M3 supplement (complexity), M4 phase-1 (metrics), M4 phase-2 (sensitivity), M4 phase-3 (value_function) |
| `sourceRefSchema` | All 10 schemas (Crawley citations) |
| `softwareArchDecisionSchema` | Not consumed by Crawley schemas (applies to M2 NFR records) |
| `columnPlanSchema`, `insertionSchema` | Consumed via envelope when needed |

### `mathDerivationMatrixSchema` — RESOLVED (Option Y, M5-local, team-lead 2026-04-22)

**Final shape (lives at `apps/product-helper/lib/langchain/schemas/module-5/_matrix.ts`, NOT in `_shared.ts`):**
```ts
export const mathDerivationMatrixSchema = mathDerivationSchema
  .extend({
    result_kind: z.literal('matrix'),
    result_matrix: z.array(z.array(z.union([z.number(), z.string()]))),
    result_shape: z.tuple([z.number().int(), z.number().int()]),
    result_is_square: z.boolean(),
  })
  .superRefine((val, ctx) => {
    // Shape-drift invariant (team-lead ruling 2026-04-22).
    if (val.result_shape[0] !== val.result_matrix.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['result_shape'],
        message: `shape[0]=${val.result_shape[0]} ≠ matrix rows=${val.result_matrix.length}`,
      });
    }
    const firstRowLen = val.result_matrix[0]?.length ?? 0;
    if (val.result_shape[1] !== firstRowLen) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['result_shape'],
        message: `shape[1]=${val.result_shape[1]} ≠ matrix cols=${firstRowLen}`,
      });
    }
  });
export type MathDerivationMatrix = z.infer<typeof mathDerivationMatrixSchema>;
```

**Consumer sites (10 matrix + 1 scalar chain):**

| # | Site | Schema used |
|---|---|---|
| 1 | M5 phase-2 `po_array_derivation` | `mathDerivationMatrixSchema` |
| 2–10 | M5 phase-3 `full_dsm_block_derivations[0..8]` (keyed by `dsmBlockKindSchema`) | 9 × `mathDerivationMatrixSchema` |
| 11 | M5 phase-3 `dsm_projection_chain_derivation` | 1 × `mathDerivationSchema` (scalar chain descriptor; inputs reference the 9 block ids) |

**Blast radius applied:** 0 to shipped schemas. New file is `module-5/_matrix.ts` only; no `_shared.ts` modification. Sibling type pattern; scalar `mathDerivationSchema` consumers entirely unaffected.

**Locality rule:** hoist to `_shared.ts` only if a 3rd non-M5 site emerges.

---

## 6. Drizzle migration surface (separate-team concern)

All Crawley destinations propose Drizzle tables with typed JSONB columns:

| Zod schema id | Proposed Drizzle table | Notes |
|---|---|---|
| `module-5.phase-1-form-taxonomy.v1` | `m5_phase_1_form_taxonomy` | JSONB column for form_entities + formal_relationships arrays |
| `module-5.phase-2-function-taxonomy.v1` | `m5_phase_2_function_taxonomy` | JSONB for po_array + functional_interactions |
| `module-5.phase-3-form-function-concept.v1` | `m5_phase_3_form_function_concept` | JSONB for full_dsm (9 blocks) |
| `module-5.phase-4-solution-neutral-concept.v1` | `m5_phase_4_solution_neutral_concept` | JSONB for morphological_matrix |
| `module-5.phase-5-concept-expansion.v1` | `m5_phase_5_concept_expansion` | JSONB for level expansions + clustering_analysis |
| `module-3.decomposition-plane.v1` | `m3_ffbd_decomposition_plane` (new col on existing m3 table) OR `m3_decomposition_plane` new table | Curator's call — schema-owner team should decide. |
| `module-4.decision-network-foundations.v1` | `m4_decision_network_foundations` | JSONB for decisions + constraints + metrics + decision_dsm + decision_network |
| `module-4.tradespace-pareto-sensitivity.v1` | `m4_tradespace_pareto_sensitivity` | JSONB for architectures + per_decision_sensitivity |
| `module-4.optimization-patterns.v1` | `m4_optimization_patterns` | JSONB for sub_problems + composition + solver |
| `module-2.requirements-crawley-extension.v1` | Extension columns on existing `m2_phase_6_requirements_table` OR new `m2_requirements_crawley_extension` | Curator's call. |

**Curator position:** These Drizzle migrations are the separate-team concern. My destination KB files are **schema-source-of-truth** (Zod + TS types), not migration specs. The team owning M2/M3/M4/M5 schema modules should run:
```bash
cd apps/product-helper && pnpm tsx lib/langchain/schemas/generate-all.ts
```
after adding each Zod file to its module's `index.ts`, then author Drizzle migrations from the generated JSON schemas.

---

## 7. Test requirements (curator's expectation from consumers)

Per `apps/product-helper/CLAUDE.md` Jest+ts-jest convention:

- **Round-trip fixture:** every new schema should have a `__tests__/` directory with an emit → parse → emit stability test. Missing any required env var (`POSTGRES_URL`, `AUTH_SECRET`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BASE_URL`) fails at import time.
- **`x-ui-surface=` annotation coverage:** CI test should grep `.describe(` across all new schema files and assert every call starts with `x-ui-surface=page-header|section:|internal:`.
- **Crawley citation coverage:** every Zod field introduced from a Crawley chapter should have a corresponding `sourceRefSchema` reference — either on the field directly (via `z.object({ crawley_ref: sourceRefSchema })`) or documented in the destination file's Citations block.
- **`.refine()` footgun check:** any file with `.refine()` followed by `.extend()` should fail CI. Use `.innerType().extend().superRefine()` pattern from `requirements-table-base.ts:applyNumericMathGate`.

---

## 8. Summary

| Count | Category |
|---|---|
| 10 | Curated destination Zod schemas |
| 9 | Schemas extending `phaseEnvelopeSchema` (M3 supplement uses lighter shape) |
| 35 | Phase-local Zod enums introduced (incl. new `dsmBlockKindSchema` for 9-block decomposition) |
| 1 | NEW M5-local file (`module-5/_matrix.ts` — holds `mathDerivationMatrixSchema` per Option Y) |
| 0 | Modifications to `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` |
| 0 | Standalone engine classes introduced |
| 10 | Matrix derivations across M5 (1 PO array in phase-2 + 9 DSM blocks in phase-3) |
| 1 | Scalar chain-descriptor derivation (phase-3 projection, references the 9 block ids via `inputs`) |
| 11 | Crawley chapter-content extractions validated (Ch 2, 4, 5, 6, 7, 8, 11, 13, 14, 15, 16) |
| 2 | Reviewer-navigation docs (this file + MAPPING-crawley.md) |
| 13 | Total architect → curator files processed (11 + MAPPING + REQUIREMENTS) |

**mathDerivationV2 resolved:** Option Y approved 2026-04-22. Schema at `module-5/_matrix.ts`; shape-drift invariant via `.superRefine()`; 9-block DSM decomposition preserves Crawley's structural provenance.

See `MAPPING-crawley.md` for chapter → destination routing. See each destination file's own `Zod Schema` section for the full shape (this doc is the cross-reference, not the source).
