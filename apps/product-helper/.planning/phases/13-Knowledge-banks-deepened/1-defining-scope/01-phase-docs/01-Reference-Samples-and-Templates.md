---
schema: phase-file.v1
phase_slug: reference-samples-and-templates
module: 1
artifact_key: module_1/reference-samples-and-templates
engine_story: m1-defining-scope
engine_path: apps/product-helper/.planning/engines/m1-defining-scope.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-1-defining-scope
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/1-defining-scope/01-phase-docs/01-Reference-Samples-and-Templates.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Reference Samples and Templates

## §1 Decision context

This phase contributes to **m1-defining-scope** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m1-defining-scope.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m1-defining-scope` (`apps/product-helper/.planning/engines/m1-defining-scope.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `reference-samples-and-templates` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 1, phase: reference-samples-and-templates}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_1/reference-samples-and-templates`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-1-defining-scope)

The STOP-GAP / Validation-Checklist text in the legacy educational body below has been audited by `engine-fail-closed` and converted into machine-readable rules registered under the `artifact_key` above. The runner default-FAILs if the artifact_key is queried with no rule set registered (conservative).

> Default severity is `error` (proceed-blocking). Only items phrased "advisory" / "soft check" / "warning" / "will NOT fail" are downgraded to `warn`.

## §5 Math derivation

This phase's quantitative outputs (if any) carry `mathDerivationSchema` (or `mathDerivationMatrixSchema` for M5 sites per TC1 `tc1-wave-c-complete`). Each derivation:

- references inputs by `source` (upstream artifact + field path);
- carries `formula` (LaTeX-safe ASCII) + `units` + `computed_value`;
- attaches `base_confidence` + `confidence_modifiers` consumed by NFREngineInterpreter step 6.

> Per-decision math traces are emitted into `decision_audit` (`0011b_decision_audit.sql`) on every Scoring pass per EC-V21-E.3 (audit-writer agent).

## §6 References (KB chunk IDs)

- **Frontmatter `kb_chunk_refs`:** populated by the embedding pipeline (`engine-pgvector` agent, G8/G9 — `apps/product-helper/lib/langchain/engines/kb-embedder.ts`).
- **Runtime retrieval:** `searchKB(query, top_k, { module: 1, phase: 'reference-samples-and-templates' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

All source materials live in `../course-lectures-master-md/` (sibling to this KB folder). The KB itself is methodology-authoritative; this file is the asset inventory.

## Course Material — Read in Order

| File | Purpose | Used by phase |
|------|---------|---------------|
| `Defining-Scope-Steps-Checklist.md` | The 11-step master checklist verbatim from eCornell | All phases (canonical step IDs) |
| `Defining-Your-System-Part-I-guide.md` | Long-form narrative guide | P0, P1 |
| `FULL-INSTRUCTIONS.md` | Full course transcript with all five fail-closed-rule sources | All phases (citations) |

## Context Diagram Assets

| File | Purpose | Used by phase |
|------|---------|---------------|
| `Context-Diagram-Visual-Guide.md` | Step-by-step visual walkthrough (vehicle example) | P1 |
| `Context_Diagram_Sample.md` | One-image worked sample | P1 (calibration) |
| `Context_Diagram_Template.md` | Blank template description | P1 |
| `Context_Diagram_Template (2).pptx` | Editable PPTX template (legacy reference; v1 emits Mermaid) | reference only |
| `Context_Diagram_Sample.pptx` | Filled sample PPTX (legacy reference) | reference only |
| `01-context-diagram-1.mmd` | **Mermaid template** for v1 emitter | P1 (clone-and-edit) |
| `01-context-diagram-1.png` / `.svg` | Rendered version of the .mmd | P1 (visual reference) |
| `context-diagram-example-1.png` … `-3.png`, `context-diagram-sample-1.png`, `-2.png` | Multiple worked PNG examples | P1 (visual reference) |
| `source_ContextDiagramExample.pptx` | Original eCornell example | reference only |
| `generate_context_diagram_pptx.py` | Legacy Python PPTX emitter (not used in v1) | deferred to v2 |

## Use Case Diagram Assets

| File | Purpose | Used by phase |
|------|---------|---------------|
| `UseCaseDiagram-visual-instructions.md` | Step-by-step build of the vehicle use-case diagram | P2 |
| `UseCaseDiagram-visual-instructions.pptx` | Slide version of above | reference only |
| `Use-Case-Diagram-Template (1).pptx` | Editable template (legacy) | reference only |
| `Use-Case-Diagram-Sample.pptx` | Worked sample (legacy) | reference only |
| `UseCaseDiagramExample.pptx` | Original eCornell example | reference only |
| `03-use-cases-1.mmd` | **Mermaid template** for v1 emitter | P2 (clone-and-edit) |
| `03-use-cases-1.png` | Rendered .mmd | P2 (visual reference) |
| `generate_use_case_diagram_pptx.py` | Legacy Python PPTX emitter (not used in v1) | deferred to v2 |

## Scope Tree Assets

| File | Purpose | Used by phase |
|------|---------|---------------|
| `scope-tree-visual-guide.md` | Long visual walkthrough (community-hall solar example) | P3 |
| `scope-tree-visual-guide.pptx` | Slide version of above | reference only |
| `ScopeTree_Defining_Deliverables.md` | Full text on growing the deliverable tree | P3 |
| `ScopeTree_Defining_Deliverables.docx` | Word version | reference only |
| `Scope-Tree-Template (1).pptx` | Editable template (legacy) | reference only |
| `source_ScopeTree_BuildingTheDeliverableTree.pptx`, `source_ScopeTree_DeliverableTreeGeneralFormExample.pptx` | Original eCornell examples | reference only |

> **Note:** No Mermaid template ships for the scope tree in source material. P3 includes a Mermaid template inline.

## KB-Internal Assets (this folder)

| File | Purpose |
|------|---------|
| `00-Defining-Scope-Master-Prompt.md` | Top-level orchestrator + 5 fail-closed rules |
| `02-JSON-Instance-Write-Protocol.md` | How to author phase artifacts |
| `03-Phase-0-Project-Intake-Unname.md` | P0 |
| `04-Phase-1-Context-Diagram.md` | P1 |
| `05-Phase-2-Use-Case-Diagram.md` | P2 |
| `06-Phase-3-Scope-Tree.md` | P3 |
| `07-Phase-4-Review-and-Module-2-Handoff.md` | P4 |
| `phase_artifact.schema.json` | Shared envelope schema |
| `system_scope_summary.schema.json` | Handoff payload schema (Module 2 compatible) |
| `GLOSSARY.md` | ~20 eCornell terms |
| `REVIEW-PLAN.md` | KB self-review checklist |

## What is NOT in this KB

The following live in the consumer adapter layer (e.g., product-helper), NOT in this methodology KB:

- Domain-specific inference rules (e.g., "If user mentions 'SaaS', infer these 7 actors")
- SaaS-specific examples and worked walkthroughs
- Thinking-state messages and progress UI copy
- Mistake-catcher heuristics tuned to particular domains
- Tooltip definitions for end-users

If a consumer needs those, it adds them as adapter modules around this KB. This KB stays portable across domains.

---

**Back:** [Master Prompt](00-Defining-Scope-Master-Prompt.md)

