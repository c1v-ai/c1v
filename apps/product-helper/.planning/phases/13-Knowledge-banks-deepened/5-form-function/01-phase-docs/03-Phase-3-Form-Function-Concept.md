---
schema: phase-file.v1
phase_slug: phase-3-form-function-concept
module: 5
artifact_key: module_5/phase-3-form-function-concept
engine_story: m5-form-function
engine_path: apps/product-helper/.planning/engines/m5-form-function.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-5-form-function
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/5-form-function/01-phase-docs/03-Phase-3-Form-Function-Concept.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# phase-3-form-function-concept

## §1 Decision context

This phase contributes to **m5-form-function** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m5-form-function.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m5-form-function` (`apps/product-helper/.planning/engines/m5-form-function.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-3-form-function-concept` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 5, phase: phase-3-form-function-concept}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_5/phase-3-form-function-concept`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-5-form-function)

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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 5, phase: 'phase-3-form-function-concept' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

---
name: M5 Phase 3 — Form-Function Concept (Architecture Triad)
module: M5 Form-Function Mapping
phase_number: 3
phase_slug: "form-function-concept"
schema_version: "1.0.0"
zod_schema_id: "m5.phase-3-form-function-concept.v1"
zod_target_path: "apps/product-helper/lib/langchain/schemas/module-5/phase-3-form-function-concept.ts"
source_chapter: "Crawley, Cameron, Selva (2015), Ch 6 — System Architecture"
source_sections:
  - "§6.1 Boxes 6.1 + 6.2 System Architecture + Value-Architecture Principle"
  - "§6.1 Table 6.1 Seven questions for defining architecture"
  - "§6.2 Figure 6.5 a–f Six form-to-process mapping patterns"
  - "§6.3 Non-idealities, supporting layers, interfaces"
  - "§6.4 Operational Behavior (operator, sequence+timing, operations cost)"
  - "§6.5 Table 6.3 Full system DSM layout (PP/PO/PF / OP/OO/OF / FP/FO/FF)"
  - "§6.5 Table 6.4 Classes of operand interactions (matter × energy × information)"
page_range: "book_md lines 2535–2990"
validation_needed: true
derivation_source: "Crawley Ch 6 (primary source). mappingCardinalitySchema + operandInteractionKindSchema are phase-local Zod structures introduced here. Full DSM flagged as mathDerivationV2 candidate #2."
math_derivation_v2_candidate: true
nfr_engine_slot: "NFREngineInterpreter reads the full DSM for coupling analysis when resolving maintainability/modularity NFRs; consumes mapping_cardinality and operand_interaction data when scoring form-to-process fit."
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-21"
---

# Phase 3 — Form-Function Concept (Crawley Ch 6)

> **Scope.** Bridges the Phase 1 form taxonomy and Phase 2 function taxonomy into a single **architecture triad** (form ↔ process ↔ operand) with explicit mapping cardinality, layered supporting architecture, and the full DSM representation (Table 6.3). This is the first M5 phase that produces a matrix-valued derivation.
>
> **Curation note.** Quotations are verbatim from the parsed book MD. See `Citations` block at EOF. This phase depends on Phase 1 (`form_entity[]`) and Phase 2 (`internal_functions[]`, `functional_interactions[]`, `po_array[]`).

---

## Knowledge

### Box 6.1 — Definition: System Architecture (line 2535–2537)

> "System architecture is the embodiment of concept, the allocation of physical/informational function to the elements of form, and the definition of relationships among the elements and with the surrounding context."

Five key terms: **function, form, relationship, context, concept.**

### Box 6.2 — Principle of Value and Architecture (line 2549–2566)

Quotations on file: Steve Jobs — "Design is how it works"; Thoreau — cost = "the amount of … life which is required to be exchanged for it"; Frank Lloyd Wright — "Form and function should be one."

> "Value is benefit at cost. Architecture is function enabled by form. There is a very close relationship between these two statements, because benefit is delivered by function, and form is associated with cost. Therefore, developing good architectures (desired function for minimal form) will be nearly synonymous with the delivery of value (benefit at minimal cost)."

- "Benefit derives from the emergence of primary and secondary value-related function."
- "An axiom of lean manufacturing is that parts (form) attract cost."

### Table 6.1 — Seven Questions for Defining Architecture (line 2574–2584)

| # | Question | Produces |
|---|---|---|
| 6a | How are instrument objects mapped to internal processes? How does formal structure support functional interaction? How does it influence emergence? | Formal object-process-operand relationships of the idealized architecture |
| 6b | What non-idealities require additional operands, processes, and instrument objects along the realistic value path? | Realistic architecture — non-ideal additions |
| 6c | What supporting functions and their instruments support the instrument objects on the value creation path? | Architecture one or two layers away from value delivery |
| 6d | What are the interfaces at the system boundaries? | Formal + functional definition of interfaces |
| 6e | What is the sequence of execution of processes delivering primary/secondary functions? | Ordered set of actions |
| 6f | Are there parallel threads/strings? | Sequence diagram |
| 6g | Is actual clock time important? | Timing considerations/constraints |

### Form-to-Process Mapping Patterns (Figure 6.5 a–f, line 2620–2642)

Crawley enumerates **six patterns** of form-to-process mapping:

1. **(a) No instrument** — a process appears without an instrument. Crawley argues there must always be an instrument; re-examine. *c1v curator treatment: a validation FAILURE mode; emit with `mapping_cardinality: 'no_instrument'` only during review, never in a frozen phase.*
2. **(b) Operand as instrument** — an operand simultaneously satisfies the form definition (exists prior, is instrumental) and the operand definition (acted upon). Example: a person walking — the person is both the instrument and the operand. "The definitions of form objects and operand objects are not mutually exclusive."
3. **(c) One-to-one, same operand** — each form maps 1:1 to a process; processes act on attributes of a single operand (emergency instruction card).
4. **(d) One-to-one, multiple operands** — each form maps 1:1 but processes span multiple operands (circulatory system: heart/lung/capillaries all 1:1; oxygen-rich / oxygen-poor blood create/destroy).
5. **(e) One-to-many** — one instrument carries multiple processes (Team X: John develops options AND helps choose design).
6. **(f) Many-to-many** — multiple instruments ↔ multiple processes (kitchen: food prep happens in kitchen AND dining room; serving happens in dining room AND kitchen).

> "In reality, operands are created and destroyed not by elements of form but by processes. The mapping of form to function cannot be expected to be one-to-one." (line 2618)

### Procedure — Identifying Form-to-Process Mapping (line 2660–2666)

1. Identify all important elements of form (Ch 4).
2. Identify all value-related internal processes and operands (Ch 5).
3. Ask what element of form is needed to execute each process (may exist or lead to a new one).
4. Map the elements of form to the internal processes.
5. Identify remaining unassigned elements of form; reason about what process they might map to.

### Structure Enables Functional Interaction (line 2681–2692)

- **Connection** relationships (Ch 4 taxonomy) directly enable functional interactions.
- **Exceptions:** gravitational and electromagnetic interactions + "ballistic" interactions (particles, fields) happen without formal connections.
- **Location and intangible** relationships "do not directly enable interactions and emergence of function but, rather, inform and influence the nature of the interaction or the degree of performance."
- **Software special case:** "In software, however, location, sequence, and address can be enabling of function."

### §6.3 — Non-idealities (Question 6b, line 2733+)

Additional processes/instruments required by real-world operand management:
- Moving operands (pumps, valves).
- Containing operands (seals, O-rings, hulls).
- Storing operands while value processes act (reservoirs, buffers, document systems).
- Extra performance/robustness (monitoring, offsetting biases).
- In digital systems: error detection/correction; data movement and storage at runtime.

### §6.3 — Supporting Layers (Question 6c)

> "In general, the architecture of a system can be modeled in these layers: value operands, value processes, value instruments, and then several alternating layers of supporting processes and instruments."

Classic example: OSI 7-layer / Internet 4-layer — value is in application layers, all others are supporting.

### §6.3 — Interfaces (Question 6d, line 2777–2781)

An interface has both form AND function. At minimum, define:

- **The operand** that passes through the boundary (same on both sides).
- **The process** of passing the operand (shared/common at boundary).
- **Two interface instruments** with a formal relationship — either **androgynous** (identical on both sides) or **compatible** (different but fit together).

### §6.4 — Operational Behavior (line 2799–2852)

Three dimensions:

1. **Operator** — active / supervisory / absent-but-essential. "The human operator is so important that we will consider the human operator a product/system attribute."
2. **Behavior = Sequence + Dynamic timing** — sequence = process order + state changes; dynamic = clock time, start/duration/overlap (matters for real-time, closed-loop control, multi-threaded systems).
3. **Operations cost** — drives long-term competitiveness; built from operator cost + consumables + maintenance + upgrades + insurance.

### §6.5 — Full DSM (Table 6.3, line 2898)

| | Process | Operand | Form |
|---|---|---|---|
| **Process** | PP | PO | PF |
| **Operand** | OP | OO | OF |
| **Form** | FP | FO | FF |

- PP = identity, OO = identity, FF = identity (identifier on diagonal).
- PO per Box 5.7 (`c'` / `d` / `a` / `I`).
- OP per Box 5.8 rules.
- OF and FO are generally zero — operands connect to form only through an intervening process.
- **PF array** = process-form mapping (instrument link).

**Projection targets (§6.5, line 2905+):**
1. **Onto objects** (operands + form): OP × PP × PO, FP × PP × PF, plus cross terms.
2. **Onto form:** FP × PP × PF (direct single-process links) + FP × PP × PO × OO × OP × PP × PF (operand-mediated links, 6-way matrix chain). Equivalent to a classic product DSM.

### Table 6.4 — Classes of Operand Interactions (line 2972–2984)

| Category | Sub-category | Interaction | Example |
|---|---|---|---|
| Matter | Mechanical | Mass exchange | Passes flow to |
| Matter | Mechanical | Force/momentum | Pushes on |
| Matter | Biochemical | Chemical | Reacts with |
| Matter | Biochemical | Biological | Replicates |
| Energy | — | Work | Carries electricity |
| Energy | — | Thermal energy | Heats |
| Information | Signal | Data | Transfers file |
| Information | Signal | Commands | Triggers |
| Information | Thought | Cognitive | Exchanges ideas |
| Information | Thought | Affective | Imparts beliefs |

---

## Input Required

- `m5.phase-1-form-taxonomy.v1` output (`_phase_status: "complete"`).
- `m5.phase-2-function-taxonomy.v1` output (`_phase_status: "complete"`).
- `m1.system_scope_summary.v1` for boundary context.

---

## Instructions for the LLM

### Sub-phase A: Form ↔ Process Mapping (Question 6a)

For every Phase-2 `internal_function` emit a `form_function_map` entry:
- `process_id` (ref Phase-2 `internal_functions[]`)
- `instrument_form_ids: string[]` (ref Phase-1 `form_entities[]`)
- `operand_id` (ref Phase-2 functional_interactions shared_operand)
- `mapping_cardinality ∈ mappingCardinalitySchema` (6 values from Figure 6.5 a–f)
- `figure_6_5_pattern_quote` (short quote from Crawley text explaining the pattern match)

**Rejection rule:** `mapping_cardinality: 'no_instrument'` is allowed ONLY when `_phase_status === 'in_progress'`. On `complete`, every process MUST have at least one instrument_form_id (Crawley line 2620 "there must always be an instrument").

### Sub-phase B: Architecture Layering (Question 6c)

Emit the explicit 4-layer structure Crawley requires:
```
architecture_layers: {
  value_operands: string[],       // ref Phase-2 operands
  value_processes: string[],      // ref Phase-2 internal_functions (primary-pathway subset)
  value_instruments: string[],    // ref Phase-1 form_entities (primary-pathway subset)
  supporting_processes: [[...]],  // ordered list of supporting layers (process IDs per layer)
  supporting_instruments: [[...]],// parallel ordered list of supporting form IDs per layer
}
```

### Sub-phase C: Non-idealities (Question 6b)

Emit `non_idealities[]` — each with `{kind: 'moving' | 'containing' | 'storing' | 'monitoring' | 'error_correction' | 'data_movement' | 'other', description, added_operand_ids[], added_process_ids[], added_form_ids[]}`.

### Sub-phase D: Interfaces (Question 6d)

For each Phase-1 `interface` record emit an `interface_spec`:
```
interface_spec: {
  interface_id: string,           // ref Phase-1
  passing_operand_id: string,     // shared between both sides
  passing_process_id: string,     // shared/common
  self_instrument_id: string,     // this side form entity
  context_instrument_id: string,  // other side form entity (from Phase-1 accompanying_systems)
  interface_kind: 'androgynous' | 'compatible',
}
```

### Sub-phase E: Operational Behavior (Questions 6e–6g)

Emit `operational_behavior`:
```
operator: { kind: 'active' | 'supervisory' | 'absent_but_essential', role_description },
sequence: [process_id, process_id, ...],       // ordered
parallel_threads: [[process_id, ...], ...],    // optional
clock_time_critical: boolean,
timing_constraints: [...]                      // optional, only when clock_time_critical
```

### Sub-phase F: Full DSM + Operand Interactions (Question 6a + Table 6.4)

Emit the full DSM as three sub-matrices + operand-interaction labels:
- `full_dsm: { pp: Matrix, po: Matrix, pf: Matrix, op: Matrix, oo: Matrix, of: Matrix, fp: Matrix, fo: Matrix, ff: Matrix }`
- `operand_interactions[]` with the Table 6.4 discriminated-category structure.

Each full-DSM carries a `math_derivation` with `formula: "derived from Phase-2 po_array + Phase-1 formal_relationships + sub-phase A mapping"`, `kb_source: "inline"`, `kb_section: "Crawley Ch 6 Table 6.3 book_md line 2898"`, and `validation_needed: true` (matrix-valued → mathDerivationV2 candidate).

### STOP GAP — Value-architecture principle check

Before marking `_phase_status: "complete"`:

1. **Form-count ratio (Box 6.2 "desired function for minimal form"):** record `form_count_ratio = form_entities.length / (internal_functions.length + primary_function.length)`. Above 3× → flag for review. Rationale: "parts (form) attract cost," so redundant form implies architectural waste.
2. **Connection enables interaction invariant:** every `functional_interaction` (from Phase-2) MUST have a corresponding `formal_relationship` with `kind: "connection"` OR be marked as a Crawley exception (`exception: 'gravity' | 'electromagnetic' | 'ballistic' | 'software_sequence_address'`). Orphan interactions = BLOCK.
3. **Layer completeness:** `architecture_layers.supporting_processes.length` must equal `architecture_layers.supporting_instruments.length` (same number of layers).
4. **Interface completeness:** every `interface_spec` has all 5 required fields; `interface_kind` set.

---

## Zod Schema

```ts
// apps/product-helper/lib/langchain/schemas/module-5/phase-3-form-function-concept.ts

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
  mathDerivationSchema,
} from '@/lib/langchain/schemas/module-2/_shared';

// Phase-local — Crawley Figure 6.5 a–f six form-to-process mapping patterns.
export const mappingCardinalitySchema = z
  .enum([
    'no_instrument',             // (a) validation-failure state
    'operand_as_instrument',     // (b)
    'one_to_one_same_operand',   // (c)
    'one_to_one_multiple_operands', // (d)
    'one_to_many',               // (e)
    'many_to_many',              // (f)
  ])
  .describe(
    'x-ui-surface=section:Form-Function Concept > Mapping — Crawley Figure 6.5 a–f six form-to-process mapping patterns.',
  );
export type MappingCardinality = z.infer<typeof mappingCardinalitySchema>;

// Phase-local — Crawley Table 6.4 three-category × sub-category discriminated union.
export const operandInteractionKindSchema = z.discriminatedUnion('category', [
  z.object({
    category: z.literal('matter'),
    sub_category: z.enum(['mechanical', 'biochemical']),
    interaction: z.enum(['mass_exchange', 'force_momentum', 'chemical', 'biological']),
  }),
  z.object({
    category: z.literal('energy'),
    sub_category: z.literal('none'),
    interaction: z.enum(['work', 'thermal']),
  }),
  z.object({
    category: z.literal('information'),
    sub_category: z.enum(['signal', 'thought']),
    interaction: z.enum(['data', 'commands', 'cognitive', 'affective']),
  }),
]);
export type OperandInteractionKind = z.infer<typeof operandInteractionKindSchema>;

// Crawley Ch 6 line 2681–2692 + software special case line 2692.
export const structureExceptionSchema = z
  .enum([
    'gravity',
    'electromagnetic',
    'ballistic',
    'software_sequence',
    'software_address',
    'software_location',
    'none',
  ])
  .describe(
    'x-ui-surface=section:Form-Function Concept > Structure Exceptions — Crawley §6.2 non-connection interactions allowed.',
  );

export const formFunctionMapSchema = z
  .object({
    map_id: z.string(),
    process_id: z.string().describe(
      'x-ui-surface=internal:cross-phase-ref — Phase-2 internal_function.function_id.',
    ),
    instrument_form_ids: z.array(z.string()).describe(
      'x-ui-surface=internal:cross-phase-ref — Phase-1 form_entity.object_id list.',
    ),
    operand_id: z.string(),
    mapping_cardinality: mappingCardinalitySchema,
    figure_6_5_pattern_quote: z.string().describe(
      'x-ui-surface=section:Form-Function Concept > Mapping — short Crawley quote showing why this pattern applies.',
    ),
    structure_exception: structureExceptionSchema.default('none'),
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > Mapping — one form-to-process allocation (Q 6a).',
  );

export const architectureLayersSchema = z
  .object({
    value_operands: z.array(z.string()),
    value_processes: z.array(z.string()),
    value_instruments: z.array(z.string()),
    supporting_processes: z
      .array(z.array(z.string()))
      .describe(
        'x-ui-surface=section:Form-Function Concept > Layers — ordered list of supporting-process layers (Crawley §6.3 — alternating).',
      ),
    supporting_instruments: z
      .array(z.array(z.string()))
      .describe(
        'x-ui-surface=section:Form-Function Concept > Layers — ordered list of supporting-instrument layers paralleling supporting_processes.',
      ),
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > Layers — Crawley §6.3 layered architecture (value + alternating support).',
  );

export const nonIdealitySchema = z
  .object({
    kind: z.enum([
      'moving',
      'containing',
      'storing',
      'monitoring',
      'error_correction',
      'data_movement',
      'other',
    ]),
    description: z.string(),
    added_operand_ids: z.array(z.string()).default([]),
    added_process_ids: z.array(z.string()).default([]),
    added_form_ids: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > Non-Idealities — Q 6b additions along the realistic value path.',
  );

export const interfaceSpecSchema = z
  .object({
    interface_id: z.string().describe(
      'x-ui-surface=internal:cross-phase-ref — Phase-1 interface.interface_id.',
    ),
    passing_operand_id: z.string(),
    passing_process_id: z.string(),
    self_instrument_id: z.string(),
    context_instrument_id: z.string(),
    interface_kind: z.enum(['androgynous', 'compatible']).describe(
      'x-ui-surface=section:Form-Function Concept > Interfaces — Crawley §6.3 androgynous = identical, compatible = different-but-fit.',
    ),
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > Interfaces — Q 6d interface with full form + function spec.',
  );

export const operationalBehaviorSchema = z
  .object({
    operator: z
      .object({
        kind: z.enum(['active', 'supervisory', 'absent_but_essential']),
        role_description: z.string(),
      })
      .describe('x-ui-surface=section:Form-Function Concept > Operations — Q 6e operator.'),
    sequence: z
      .array(z.string())
      .describe('x-ui-surface=section:Form-Function Concept > Operations — Q 6e process execution order.'),
    parallel_threads: z
      .array(z.array(z.string()))
      .default([])
      .describe('x-ui-surface=section:Form-Function Concept > Operations — Q 6f parallel threads.'),
    clock_time_critical: z.boolean().describe(
      'x-ui-surface=section:Form-Function Concept > Operations — Q 6g clock time importance.',
    ),
    timing_constraints: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > Operations — Crawley §6.4 operational-behavior three dimensions.',
  );

// M5-local mathDerivationMatrixSchema import (team-lead ruling 2026-04-22 Option Y).
// Scoped to M5 per locality rule: only 2 sites need matrix derivation, both in M5.
// Proposed path: `apps/product-helper/lib/langchain/schemas/module-5/_matrix.ts`.
//
// import { mathDerivationMatrixSchema } from './_matrix';
//
// Shape (documented here for portability; implementation lives in _matrix.ts):
//   mathDerivationMatrixSchema = mathDerivationSchema.extend({
//     result_kind: z.literal('matrix'),
//     result_matrix: z.array(z.array(z.union([z.number(), z.string()]))),
//     result_shape: z.tuple([z.number().int(), z.number().int()]),
//     result_is_square: z.boolean(),
//   }).superRefine((val, ctx) => {
//     if (val.result_shape[0] !== val.result_matrix.length) {
//       ctx.addIssue({ code: 'custom', path: ['result_shape'],
//         message: `shape[0]=${val.result_shape[0]} ≠ matrix rows=${val.result_matrix.length}` });
//     }
//     const firstRowLen = val.result_matrix[0]?.length ?? 0;
//     if (val.result_shape[1] !== firstRowLen) {
//       ctx.addIssue({ code: 'custom', path: ['result_shape'],
//         message: `shape[1]=${val.result_shape[1]} ≠ matrix cols=${firstRowLen}` });
//     }
//   });

// Phase-local — nine named blocks of Crawley Table 6.3 full DSM.
export const dsmBlockKindSchema = z
  .enum(['pp', 'po', 'pf', 'op', 'oo', 'of', 'fp', 'fo', 'ff'])
  .describe(
    'x-ui-surface=section:Form-Function Concept > DSM — Crawley Table 6.3 nine block kinds (row×col of {process, operand, form}).',
  );
export type DsmBlockKind = z.infer<typeof dsmBlockKindSchema>;

// Data shape for a single block (record-of-record of cell notations).
// Separate from the derivation; the derivation wraps this via mathDerivationMatrixSchema.
export const dsmBlockSchema = z
  .record(z.string(), z.record(z.string(), z.string()))
  .describe('x-ui-surface=internal:dsm-block — row_id → col_id → cell notation.');

export const fullDsmSchema = z
  .object({
    pp: dsmBlockSchema,
    po: dsmBlockSchema,
    pf: dsmBlockSchema,
    op: dsmBlockSchema,
    oo: dsmBlockSchema,
    of: dsmBlockSchema,
    fp: dsmBlockSchema,
    fo: dsmBlockSchema,
    ff: dsmBlockSchema,
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > DSM — Crawley Table 6.3 full 9-block DSM (data shape, consumed by per-block mathDerivationMatrixSchema records).',
  );

export const phase3FormFunctionConceptSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-5.phase-3-form-function-concept.v1'),
    form_function_maps: z.array(formFunctionMapSchema).min(1),
    architecture_layers: architectureLayersSchema,
    non_idealities: z.array(nonIdealitySchema).default([]),
    interfaces: z.array(interfaceSpecSchema).default([]),
    operational_behavior: operationalBehaviorSchema,
    full_dsm: fullDsmSchema,
    // Per team-lead ruling 2026-04-22: decompose the 9-block DSM into 9 separate
    // matrix derivations (one per block kind) + 1 scalar projection-chain derivation.
    // This preserves Crawley's structural decomposition and keeps provenance clean.
    // Each entry uses `mathDerivationMatrixSchema` (M5-local, Option Y).
    full_dsm_block_derivations: z
      .array(
        z.object({
          block_kind: dsmBlockKindSchema,
          // Matrix derivation for this block — conceptually mathDerivationMatrixSchema.
          // Inline shape documented here; final import binds to module-5/_matrix.ts.
          derivation: z.object({
            formula: z.string().describe(
              'x-ui-surface=internal:math-derivation-resolver — per-block formula (e.g., "PP = identity", "PO per Box 5.7 cells c\'/a/d/I").',
            ),
            inputs: z.record(z.string(), z.union([z.number(), z.string()])).default({}),
            kb_source: z.literal('inline'),
            kb_section: z.string().describe(
              'x-ui-surface=internal:math-derivation-resolver — Crawley Ch 6 Table 6.3 book_md line 2898 + per-block reference (Box 5.7/5.8/etc).',
            ),
            result_kind: z.literal('matrix'),
            result_matrix: z.array(z.array(z.union([z.number(), z.string()]))),
            result_shape: z.tuple([z.number().int(), z.number().int()]),
            result_is_square: z.boolean(),
          }),
        }),
      )
      .length(9)
      .describe(
        'x-ui-surface=section:Form-Function Concept > DSM — 9 matrix derivations (one per Table 6.3 block kind). mathDerivationV2 candidates #2–#10.',
      ),
    // Projection chain PF × PP × PO × OO × OP × PP × PF (line 2905+) is a scalar
    // "chain descriptor" — the actual materialized output lives in whichever block(s)
    // the projection reduces to. Here we record provenance only.
    dsm_projection_chain_derivation: mathDerivationSchema
      .extend({
        formula: z.literal(
          'projection_onto_form = FP × PP × PF + FP × PP × PO × OO × OP × PP × PF (Crawley §6.5 line 2905+)',
        ),
        inputs: z
          .record(z.string(), z.union([z.number(), z.string()]))
          .default({})
          .describe(
            'x-ui-surface=internal:math-derivation-resolver — input block derivations by id (e.g., {fp_block_id: "fp", pp_block_id: "pp", ...}).',
          ),
        kb_source: z.literal('inline'),
        kb_section: z.literal('Crawley Ch 6 §6.5 projection onto form book_md line 2905+'),
      })
      .describe(
        'x-ui-surface=internal:math-derivation-resolver — SCALAR chain-descriptor derivation whose inputs reference the 9 block derivations by id (ruling 2026-04-22).',
      ),
    operand_interactions: z.array(operandInteractionKindSchema).default([]),
    form_count_ratio: z.number().nonneg(),
    crawley_glossary_refs: z.array(sourceRefSchema).default([]),
  })
  .describe('x-ui-surface=page-header — M5 Phase 3: form-function concept triad per Crawley Ch 6.');

export type Phase3FormFunctionConcept = z.infer<typeof phase3FormFunctionConceptSchema>;
```

### Refinement — Value-Architecture invariants

```ts
export const phase3WithInvariants = phase3FormFunctionConceptSchema.superRefine((val, ctx) => {
  // 1. Frozen phases must have an instrument for every process (line 2620).
  if (val._phase_status === 'complete') {
    const noInstrument = val.form_function_maps.filter(
      (m) => m.mapping_cardinality === 'no_instrument',
    );
    if (noInstrument.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['form_function_maps'],
        message: `Crawley line 2620: "there must always be an instrument." ${noInstrument.length} process(es) lack an instrument in a complete phase.`,
      });
    }
  }

  // 2. Supporting layers parallelism (§6.3).
  if (
    val.architecture_layers.supporting_processes.length !==
    val.architecture_layers.supporting_instruments.length
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['architecture_layers'],
      message: 'supporting_processes and supporting_instruments must have the same number of layers (Crawley §6.3 alternating layers).',
    });
  }

  // 3. Form-count ratio warning (Box 6.2).
  if (val.form_count_ratio > 3.0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['form_count_ratio'],
      message: `Crawley Box 6.2 "good architectures = desired function for minimal form": form_count_ratio=${val.form_count_ratio} > 3.0 — architectural waste suspected.`,
    });
  }
});
```

---

## NFREngineInterpreter boundary note

This phase produces the **full DSM and mapping-cardinality data** consumed by `NFREngineInterpreter` when an NFR resolver needs to evaluate coupling (maintainability, modularity) or operand-interaction compliance (safety, security, performance). No engine class is introduced here. The clustering and projection operations from §6.5 are data shapes; actual algorithms live inside `NFREngineInterpreter` or are invoked as tool calls it orchestrates.

---

## mathDerivationV2 resolution (team-lead ruling 2026-04-22)

**Ruling applied: Option Y — sibling `mathDerivationMatrixSchema` at M5-local scope.**

- **Scope:** schema lives at `apps/product-helper/lib/langchain/schemas/module-5/_matrix.ts`, NOT in `_shared.ts`. Locality rule (same as phase-local enums): only 2 phase files need matrix derivation, both in M5. Hoist to `_shared.ts` only if a 3rd non-M5 site emerges.
- **9-block decomposition:** the full DSM is NOT modeled as a single matrix. Instead, 9 separate `mathDerivationMatrixSchema` records (one per block — `pp`, `po`, `pf`, `op`, `oo`, `of`, `fp`, `fo`, `ff`) named via the new phase-local enum `dsmBlockKindSchema`. Field: `full_dsm_block_derivations[]` (length 9).
- **Projection chain:** 1 additional scalar `mathDerivationSchema` record (`dsm_projection_chain_derivation`) whose `inputs` reference the 9 block derivation ids. Preserves Crawley's structural decomposition (§6.5 line 2905+ "PF × PP × PF + FP × PP × PO × OO × OP × PP × PF") and keeps provenance clean.
- **Shape-drift invariant:** each matrix derivation's `.superRefine()` enforces `result_shape[0] === result_matrix.length && result_shape[1] === result_matrix[0]?.length`. Documented in the import-block comment at top of the Zod snippet above.

**Net V2 tally for this phase:** 9 matrix derivations (one per DSM block) + 1 scalar projection-chain derivation.

**Combined with phase-2 PO array:** total mathDerivationV2 surface = **10 matrix derivations + 1 scalar chain** across M5 phases 2 and 3.

**No `_shared.ts` change required.** `mathDerivationSchema` (scalar) stays as-is for the remaining ~99% of c1v fields. `mathDerivationMatrixSchema` is an M5-only extension.

---

## c1v applicability summary

| Methodology rule | Enforced by |
|---|---|
| Figure 6.5 six mapping patterns | `mappingCardinalitySchema` |
| Table 6.4 operand interactions | `operandInteractionKindSchema` discriminated union |
| "There must always be an instrument" on complete | `.superRefine()` no-instrument check |
| "Form attracts cost" ratio warning | `.superRefine()` form_count_ratio ≤ 3.0 |
| Layered architecture (§6.3) | `architecture_layers` 4-layer required field |
| Androgynous vs compatible interfaces | `interface_kind` enum on `interface_spec` |
| Non-connection exceptions (gravity/EM/ballistic/software) | `structure_exception` enum on `form_function_map` |

---

## Citations

- **Crawley, Cameron, Selva (2015).** Ch 6.
  - Box 6.1 — System Architecture definition (book_md line 2535–2537)
  - Box 6.2 — Principle of Value and Architecture (book_md line 2549–2566)
  - Table 6.1 — Seven Questions (book_md line 2574–2584)
  - Figure 6.5 a–f — Six mapping patterns (book_md line 2620–2642, quote line 2618)
  - Procedure for form-to-process mapping (book_md line 2660–2666)
  - Structure enables functional interaction (book_md line 2681–2692)
  - §6.3 Non-idealities (book_md line 2733+)
  - §6.3 Supporting layers (book_md line 2739+)
  - §6.3 Interfaces (book_md line 2777–2781)
  - §6.4 Operational behavior (book_md line 2799–2852)
  - Table 6.3 Full DSM (book_md line 2898)
  - §6.5 Projection targets (book_md line 2905+)
  - Table 6.4 Operand interactions (book_md line 2972–2984)

- **Cross-references:**
  - `./GLOSSARY-crawley.md` — System Architecture, Form, Function, Value, Interface, Boundary.
  - `./01-Phase-1-Form-Taxonomy.md` — form_entity, interface, accompanying_system consumed by this phase.
  - `./02-Phase-2-Function-Taxonomy.md` — internal_functions, functional_interactions, po_array consumed by this phase.
  - `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` — phaseEnvelopeSchema, mathDerivationSchema, sourceRefSchema.

**Ruling anchors:**
- Handoff §3 2026-04-21 ~14:30 — NFREngineInterpreter boundary respected; no standalone engine introduced.
- Handoff §3 2026-04-21 ~13:00 — Crawley Ch 6 is hybrid-direction IN SCOPE.
- Team-lead 2026-04-21 (this session) — Phase-local enum pattern green-lit.
- Full DSM tagged `mathDerivationV2 candidate #2`; batched escalation pending.

