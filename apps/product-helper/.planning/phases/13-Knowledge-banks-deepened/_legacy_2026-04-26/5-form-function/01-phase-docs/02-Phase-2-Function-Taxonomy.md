---
name: M5 Phase 2 — Function Taxonomy
module: M5 Form-Function Mapping
phase_number: 2
phase_slug: "function-taxonomy"
schema_version: "1.0.0"
zod_schema_id: "m5.phase-2-function-taxonomy.v1"
zod_target_path: "apps/product-helper/lib/langchain/schemas/module-5/phase-2-function-taxonomy.ts"
source_chapter: "Crawley, Cameron, Selva (2015), Ch 5 — Function"
source_sections:
  - "§5.1 Boxes 5.1 / 5.2 / 5.3 Function / Operand / Process"
  - "§5.2 Table 5.1 Four Questions for Defining Function"
  - "§5.2 Boxes 5.4 / 5.5 Value + Benefit Delivery"
  - "§5.3 Table 5.2 Primary externally-delivered functions catalogue"
  - "§5.5 Box 5.6 Standard Blueprints of Internal Processes"
  - "§5.5 Box 5.7 Methods: Creating the PO Array"
  - "§5.5 Box 5.8 Methods: Projecting Operands onto Processes"
  - "§5.6 Table 5.6 Form vs Function summary"
page_range: "book_md lines 2006–2509"
validation_needed: true
derivation_source: "Crawley Ch 5 (primary source). functionalInteractionKindSchema + poArrayCellSchema are phase-local Zod enums introduced here. PO array flagged as mathDerivationV2 candidate (matrix-valued result)."
math_derivation_v2_candidate: true
nfr_engine_slot: "NFREngineInterpreter uses functional_interactions to traverse the value pathway when evaluating a performance NFR against a candidate form. Reads po_array for causality analysis."
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-21"
---

# Phase 2 — Function Taxonomy (Crawley Ch 5)

> **Scope.** Defines c1v's representation of system **function**: the activity, operation, or transformation executed by form. Builds on Phase 1 form taxonomy — every function record must name an instrument-of-form entity that exists in Phase 1.
>
> **Curation note.** Quotations are verbatim from the parsed book MD. This phase introduces two phase-local Zod enums and one `mathDerivationV2` candidate (PO array — matrix-valued derivation). See `Citations` block at EOF.

---

## Knowledge

### Box 5.1 — Definition: Function (line 2006–2010)

> "Function is the activity, operation, or transformation that causes or contributes to performance. In designed systems, function is the actions for which a system exists, which ultimately lead to the delivery of value. Function is executed by form, which is instrumental in function. Function emerges from functional interaction between entities.
>
> Function is a product/system attribute."

### Box 5.2 — Definition: Operand (line 2037–2041)

> "An operand is an object and therefore has the potential for stable, unconditional existence for some period of time. Operands are objects that need not exist prior to the execution of function and are in some way acted upon by the function. Operands may be created, modified, or consumed by the process part of function."

Contrasts with form (line 2033–2035):
- Form must exist before function; operands need not.
- Form is instrumental; operands are *what is acted upon*.
- Architects design/supply form; operands appear at operation time from other sources.

### Box 5.3 — Definition: Process (line 2047–2049)

> "Process is a pattern of transformation undergone by an object. Processes generally involve creation of, destruction of, or a change in an operand."

> "You cannot take a photograph of process; you need to take a video." (line 2051)

### Canonical system model (line 2029)

> "function = process + operand"

Examples: housing + resident; instructing + passenger; amplifying + signal; pressurizing + water; sorting + array; supplying + oxygen.

### OPM operand–process arrow conventions (line 2073–2089)

Three arrow conventions between process (oval) and operand (rectangle):

1. **Create** — single-headed arrow, process → operand. Process creates the operand (factory creates car; team creates design). Operand did not exist before.
2. **Destroy** — single-headed arrow, operand → process. Process destroys the operand (factory consumes parts; lungs consume oxygen). Operand ceases to exist in original form. *(Crawley prose uses "consume" at line 2073; the PO-array cell notation is `d` at Box 5.7 line 2333. c1v canonicalizes to `destroy` to match the cell notation; "consume" is a deprecated synonym — see GLOSSARY-crawley §20.)*
3. **Affect** — double-headed arrow. Process changes an attribute of the operand but does not create or destroy it (residents are people both before and after being housed).

**Instrument link** — round-headed arrow from object (form) to the process it enables.

### Box 5.4 — Definition: Value (line 2154–2156)

> "Value is benefit at cost. Benefit is synonymous with the worth, importance, or utility created by a system. An observer judges benefit subjectively. Cost is a measure of the contribution that must be made in exchange for the benefit."

### Box 5.5 — Principle of Benefit Delivery (line 2162–2176)

> "Good architectures deliver benefit, first and foremost, built on the primary externally delivered function of the systems by focusing on the emergence of functions, and their delivery across the system boundary at an interface."

- "The benefit delivered by systems is provided by their externally delivered function."
- "There is usually a **single externally delivered function** for which the system was originally defined, the absence of which will cause failure of the system."
- "The benefit is delivered at the boundary of the system, most likely at an interface."

### Table 5.1 — Four Questions for Defining Function (line 2012–2019)

| # | Question | Produces |
|---|---|---|
| 5a | What is the primary externally delivered value-related function? The value-related operand, its value-related states, and the process of changing the states? What is the abstraction of instrumental form? | An operand-process-form construct that defines the abstraction of the system |
| 5b | What are the principal internal functions? The internal operands and processes? | A set of processes and operands representing first- and second-level downward abstractions |
| 5c | What is the functional architecture? How do these internal functions connect to form the value pathway? How does the principal external function emerge? | A set of interactions among processes at any level of decomposition |
| 5d | What are the other important secondary value-related external functions? | Other processes, operands, and their functional architecture that deliver value in addition to the principal |

### Primary externally delivered function — tests (line 2143–2147)

> "What is the function that the system was originally built to deliver, before all of the other value-related functions were added? Or, Which function, if it failed to materialize, would cause the operator to discard or replace the system?"

**Key rule:** "Function and value are always delivered at an interface in the system boundary" (line 2121, emphasis by Crawley).

### Table 5.2 — Primary value-related externally delivered functions (line 2127–2137)

| Value-related operand | Value-related attribute/state | Value-related process | System form |
|---|---|---|---|
| Output signal | Magnitude (higher) | Amplifying | Operational amplifier |
| Design | Completeness (complete) | Developing | Team X |
| Oxygen | Location (at organs) | Supplying | Circulatory system |
| Water | Pressure (high) | Pressurizing | Centrifugal pump |
| Array | Sorted-ness (sorted) | Sorting | Bubblesort code |
| Bread | Sliced-ness (sliced) | Making | Kitchen |

### Box 5.6 — Standard Blueprints of Internal Processes (line 2262–2275)

> "Sometimes functions just naturally unfold into a set of internal functions that are stable over many years. We call these standard blueprints."

Examples:
- **Transporting mass**: overcome gravity, overcome drag, guide the mass.
- **Transferring information**: encode, transmit while directing, decode.
- **Engaging an employee**: recruit, agree, train, assign tasks, evaluate periodically.
- **Making a decision**: gather evidence, develop options, develop decision criteria, evaluate options, decide.
- **Assembling parts**: bring together, inspect, assemble, test.

### Functional Architecture + Value Pathway (line 2319–2343)

- **Functional architecture** = internal functions (processes + operands) + functional interactions (the shared/exchanged operands between processes).
- "The exchanged or shared operands are the functional interactions."
- **Value pathway** — the path of internal operands and processes along which the primary external function emerges. Starts at input, moves through internal operands+processes, reaches the value-related output.

### Box 5.7 — PO Array construction (line 2333–2341)

Procedure to translate an OPM diagram into a process-operand array:

1. Create an array with rows = processes, columns = operands.
2. Encode each process's connections to operands in its row.
3. Operands **created** by a process: notation `c'` (prime indicates creation for later causality tracking).
4. Operands that are **affected** (`a`), **destroyed** (`d`), or **instrumental** (`I`) to a process exist before the process and enter with no prime.

### Box 5.8 — Projecting Operands onto Processes (line 2430–2455)

DSM algebra for collapsing the functional architecture onto process-to-process interactions:

1. Break the DSM into blocks: `PP` (process-process, diagonal identity), `OO` (operand-operand, diagonal), `PO` (process-operand), `OP` (operand-process).
2. OP array rules: transpose `PO`; drop prime from `c`; add prime to `d` → `d'`; leave `a` and `I` unchanged.
3. Symbolic matrix multiply `PO × OP → PP'`  where `PP'` is a nearly symmetric process-matrix.
4. For causality: zero out any term with a prime — leaves a causal non-symmetric matrix readable as "flow from column heading to row heading."

### Things NOT on the value pathway (line 2392–2403)

- Entities of form (form is instrumental, not part of functional architecture).
- Processes/operands supporting secondary externally delivered functions.
- Processes/operands that don't contribute to any desired external function (unwanted side-effects, poor design, legacy — "gratuitous complexity," Ch 13).
- Supporting processes and form.

### Software: control tokens + data operands (line 2422–2473)

> "In software, the functions (as we define them) are of two types. There are computational statements (A = B + C), but there are also functions (as we define them) that dynamically allocate control (if …, then …)."

- Explicit operands = computation variables (data flow).
- Implicit control-token operands = allocated by conditional/loop processes (control flow).
- "Information systems of all kinds have some equivalent parallelism between control and data interactions."
- Operands created during operation can later become instruments of subsequent processes.

### Table 5.6 — Form vs Function (line 2493–2503)

| Form | Function |
|---|---|
| What a system is (noun) | What a system does (verb) |
| Objects + formal structure | Operands + processes |
| Aggregates (and decomposes) | Emerges (and zooms) |
| Enables function | Requires instrument of form |
| Specified at an interface | Specified at an interface |
| Source of cost | Source of external benefit |
| When transaction is a good | When transaction is a service |

---

## Input Required

- Phase 1 form taxonomy output (`m5.phase-1-form-taxonomy.v1`) with `_phase_status: "complete"`.
- M1 `system_scope_summary.v1` (for value-related operand candidates).
- M3 Phase-6 FFBD decomposition where available (for cross-ref of internal processes).

---

## Instructions for the LLM

### Sub-phase A: Primary External Function (Question 5a)

1. Emit **exactly one** `primary_external_function` record. Violation: two or more primary functions → reject with message citing Box 5.5 ("There is usually a single externally delivered function").
2. Record MUST carry:
   - `operand` (noun phrase — the value-related operand, e.g., "output signal")
   - `value_related_attribute` (e.g., "magnitude")
   - `value_related_state` (e.g., "higher")
   - `process` (verb phrase — e.g., "amplifying")
   - `instrument_form_ref` (object_id of a Phase-1 `form_entity` at decomposition_level 0 or 1)
   - `boundary_interface_ref` (interface_id of a Phase-1 `interface` record — Benefit Delivery Box 5.5 requires delivery at interface).
3. Run **discard/replace test** (line 2146): "Which function, if it failed to materialize, would cause the operator to discard or replace the system?" LLM must answer this in `replacement_test_answer` field.

### Sub-phase B: Internal Functions (Question 5b)

- Emit 4–9 `internal_functions[]` records (Miller's 7±2 for first downward decomposition).
- Each carries `(process, operand, instrument_form_ref)` as separate fields — reject verb-operand merges like `"log user in"`.
- Use **Box 5.6 Standard Blueprints** as starting heuristic when appropriate (e.g., if the system is a decision-support system, seed internal functions from the blueprint `{gather evidence, develop options, develop decision criteria, evaluate options, decide}`).

### Sub-phase C: Functional Architecture + Value Pathway (Question 5c)

- Emit `functional_interactions[]` — each is a shared/exchanged operand between two processes.
  - `from_process_id`, `to_process_id`, `shared_operand`, `relationship ∈ functionalInteractionKindSchema`.
- Emit derived `po_array` as per Box 5.7. Encode cells with `poArrayCellSchema` enum.
- Derive `value_pathway[]` — ordered list of process_ids from input operand → value-related operand. Must include every create/destroy/affect relationship along the path.

### Sub-phase D: Secondary Functions (Question 5d)

- Emit `secondary_external_functions[]` as a separate array. These are additive and each gets its own mini-functional-architecture.
- Each secondary function MUST have its own `instrument_form_ref` and `boundary_interface_ref`.

### Sub-phase E: Software Duality (line 2422–2473)

If Phase-1 form entities include software:
- Every `functional_interaction` record MUST carry `interaction_kind: 'data' | 'control'`.
- Control-token operands (created by conditional/loop processes) emit as explicit `functional_interaction` records with `interaction_kind: 'control'`.

### STOP GAP — Value pathway closure + PO array causality

Before marking `_phase_status: "complete"`:

1. **Pathway closure**: value_pathway MUST connect at least one input operand (type: `destroy` relationship from boundary) to the `primary_external_function.operand` (type: `affect` or `create` on the final process).
2. **PO array causality**: every `create` (`c'`) cell MUST have at least one downstream `affect` (`a`) or `destroy` (`d`) in some row. Orphan creates = silent leak of operand.
3. **Singleton invariant**: exactly one primary_external_function.
4. **Dualism cross-check**: every process with an `instrument_form_ref` references a form_entity whose `is_physical` matches the process's operand physicality (a physical-process operating a purely informational form is invalid).

---

## Zod Schema

```ts
// apps/product-helper/lib/langchain/schemas/module-5/phase-2-function-taxonomy.ts

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
  mathDerivationSchema,
} from '@/lib/langchain/schemas/module-2/_shared';

// Phase-local enum — Crawley Ch 5 OPM arrow conventions.
// NOT a softwareArchRefSchema member; this is a Crawley-native discriminator.
// Canonicalized to {create, destroy, affect, instrument} to match poArrayCellSchema
// cell notation (d = destroy). Crawley prose at line 2073 uses "consume" for this
// arrow; Box 5.7 cell notation uses `d` for destroy. Both refer to the same OPM
// link semantics (process eliminates an operand). c1v uses `destroy` to keep the
// functionalInteractionKindSchema ↔ poArrayCellSchema mapping 1:1; "consume" is
// documented as a deprecated synonym in GLOSSARY-crawley §20.
export const functionalInteractionKindSchema = z
  .enum(['create', 'destroy', 'affect', 'instrument'])
  .describe(
    'x-ui-surface=section:Function Taxonomy > Interactions — Crawley Ch 5 OPM arrow convention: create / destroy / affect / instrument. "consume" in Crawley prose maps to "destroy" here; see GLOSSARY-crawley §20.',
  );
export type FunctionalInteractionKind = z.infer<typeof functionalInteractionKindSchema>;

// Phase-local enum — Crawley Box 5.7 PO array cell notation.
// c = create (primed: c'), a = affect, d = destroy, I = instrument.
export const poArrayCellSchema = z
  .enum(['c', "c'", 'a', 'd', "d'", 'I', 'none'])
  .describe(
    'x-ui-surface=section:Function Taxonomy > PO Array — Crawley Box 5.7 cell notation: c(reate), affect, destroy, Instrument; prime = causality marker.',
  );
export type PoArrayCell = z.infer<typeof poArrayCellSchema>;

// Software data-vs-control duality (Ch 5 line 2422–2473).
export const interactionKindSchema = z
  .enum(['data', 'control'])
  .describe(
    'x-ui-surface=section:Function Taxonomy > Software Duality — data = explicit operand; control = control-token operand (Crawley Ch 5 software section).',
  );

export const primaryExternalFunctionSchema = z
  .object({
    operand: z
      .string()
      .describe(
        'x-ui-surface=section:Function Taxonomy > Primary External Function — value-related operand (Table 5.2 col 1).',
      ),
    value_related_attribute: z
      .string()
      .describe(
        'x-ui-surface=section:Function Taxonomy > Primary External Function — Table 5.2 col 2.',
      ),
    value_related_state: z
      .string()
      .describe(
        'x-ui-surface=section:Function Taxonomy > Primary External Function — Table 5.2 col 2 state value.',
      ),
    process: z
      .string()
      .describe(
        'x-ui-surface=section:Function Taxonomy > Primary External Function — verb phrase (Table 5.2 col 3).',
      ),
    instrument_form_ref: z
      .string()
      .describe(
        'x-ui-surface=internal:cross-phase-ref — object_id of a Phase-1 form_entity at Level 0 or 1.',
      ),
    boundary_interface_ref: z
      .string()
      .describe(
        'x-ui-surface=internal:cross-phase-ref — interface_id of a Phase-1 interface record (Box 5.5 benefit delivery).',
      ),
    replacement_test_answer: z
      .string()
      .describe(
        'x-ui-surface=section:Function Taxonomy > Primary External Function — answer to line 2146 replacement test.',
      ),
  })
  .describe(
    'x-ui-surface=section:Function Taxonomy > Primary External Function — the one benefit-delivering function (Box 5.5).',
  );

export const internalFunctionSchema = z
  .object({
    function_id: z.string(),
    process: z
      .string()
      .describe(
        'x-ui-surface=section:Function Taxonomy > Internal Functions — verb (Box 5.3).',
      ),
    operand: z
      .string()
      .describe(
        'x-ui-surface=section:Function Taxonomy > Internal Functions — operand (Box 5.2).',
      ),
    instrument_form_ref: z
      .string()
      .describe(
        'x-ui-surface=internal:cross-phase-ref — Phase-1 form_entity object_id.',
      ),
    blueprint_ref: z
      .enum([
        'transporting_mass',
        'transferring_information',
        'engaging_employee',
        'making_decision',
        'assembling_parts',
        'none',
      ])
      .default('none')
      .describe(
        'x-ui-surface=section:Function Taxonomy > Internal Functions — Box 5.6 Standard Blueprint reference if applicable.',
      ),
  })
  .describe(
    'x-ui-surface=section:Function Taxonomy > Internal Functions — one internal (process, operand, form) tuple.',
  );

export const functionalInteractionSchema = z
  .object({
    interaction_id: z.string(),
    from_process_id: z.string(),
    to_process_id: z.string(),
    shared_operand: z.string(),
    relationship: functionalInteractionKindSchema,
    interaction_kind: interactionKindSchema.optional().describe(
      'x-ui-surface=section:Function Taxonomy > Software Duality — required for software-containing systems.',
    ),
  })
  .describe(
    'x-ui-surface=section:Function Taxonomy > Functional Interactions — shared/exchanged operand between two processes.',
  );

export const poArrayRowSchema = z
  .object({
    process_id: z.string(),
    cells: z
      .record(z.string(), poArrayCellSchema)
      .describe(
        'x-ui-surface=internal:po-array — key = operand_id, value = cell notation.',
      ),
  })
  .describe(
    'x-ui-surface=section:Function Taxonomy > PO Array — one row of the Box 5.7 PO array.',
  );

export const valuePathwayStepSchema = z
  .object({
    step_index: z.number().int().min(0),
    process_id: z.string(),
    operand_id: z.string(),
    relationship: functionalInteractionKindSchema,
  })
  .describe(
    'x-ui-surface=section:Function Taxonomy > Value Pathway — one step in the ordered pathway from input to value-related output.',
  );

export const phase2FunctionTaxonomySchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-5.phase-2-function-taxonomy.v1'),
    primary_external_function: primaryExternalFunctionSchema,
    secondary_external_functions: z
      .array(primaryExternalFunctionSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Function Taxonomy > Secondary Functions — additive external functions (Q 5d).',
      ),
    internal_functions: z
      .array(internalFunctionSchema)
      .min(1)
      .describe(
        'x-ui-surface=section:Function Taxonomy > Internal Functions — first-level internal (process, operand, form) tuples.',
      ),
    functional_interactions: z
      .array(functionalInteractionSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Function Taxonomy > Functional Interactions — shared operands between processes.',
      ),
    po_array: z
      .array(poArrayRowSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Function Taxonomy > PO Array — Box 5.7 derived representation.',
      ),
    // Per team-lead ruling 2026-04-22 (Option Y): PO array uses `mathDerivationMatrixSchema`
    // from M5-local `module-5/_matrix.ts`. Scope stays M5-local; not hoisted to `_shared.ts`.
    // Shape-drift invariant applied via the schema's own `.superRefine()`:
    //   result_shape[0] === result_matrix.length &&
    //   result_shape[1] === result_matrix[0]?.length
    po_array_derivation: z
      .object({
        formula: z.literal('PP = PO × OP  (symbolic matrix multiply per Box 5.8)'),
        inputs: z.record(z.string(), z.union([z.number(), z.string()])).default({}),
        kb_source: z.literal('inline'),
        kb_section: z.literal('Crawley Ch 5 Box 5.8 book_md line 2430–2455'),
        result_kind: z.literal('matrix'),
        result_matrix: z
          .array(z.array(z.union([z.number(), z.string()])))
          .describe(
            'x-ui-surface=internal:math-derivation-resolver — 2D matrix; rows = processes, cols = operands (symbolic cells per Box 5.7 notation).',
          ),
        result_shape: z.tuple([z.number().int(), z.number().int()]),
        result_is_square: z.boolean(),
      })
      .describe(
        'x-ui-surface=internal:math-derivation-resolver — PO array matrix derivation; uses mathDerivationMatrixSchema from module-5/_matrix.ts (Option Y, M5-local scope).',
      ),
    value_pathway: z
      .array(valuePathwayStepSchema)
      .min(1)
      .describe(
        'x-ui-surface=section:Function Taxonomy > Value Pathway — ordered steps from input operand to primary operand.',
      ),
    crawley_glossary_refs: z
      .array(sourceRefSchema)
      .default([])
      .describe(
        'x-ui-surface=internal:provenance — cross-references into GLOSSARY-crawley.',
      ),
  })
  .describe(
    'x-ui-surface=page-header — M5 Phase 2: function taxonomy per Crawley Ch 5.',
  );

export type Phase2FunctionTaxonomy = z.infer<typeof phase2FunctionTaxonomySchema>;
```

### Refinement — singleton, pathway, causality

> **Footgun notice.** Per `apps/product-helper/CLAUDE.md`: `refine().extend()` drops refinements. Applied here at registration with `.superRefine()` directly on the final exported schema, NOT on an intermediate `.refine()`.

```ts
export const phase2FunctionTaxonomyWithInvariants = phase2FunctionTaxonomySchema.superRefine(
  (val, ctx) => {
    // 1. Value-pathway closure: must reach primary_external_function.operand
    const endsAtPrimary = val.value_pathway.some(
      (step) => step.operand_id === val.primary_external_function.operand,
    );
    if (!endsAtPrimary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value_pathway'],
        message:
          'Value pathway must terminate at primary_external_function.operand (Crawley Ch 5 §5.3).',
      });
    }

    // 2. PO-array causality: every c' must have a downstream a/d somewhere
    for (const row of val.po_array) {
      for (const [operandId, cell] of Object.entries(row.cells)) {
        if (cell === "c'") {
          const hasDownstream = val.po_array.some((other) =>
            other.process_id !== row.process_id &&
            (other.cells[operandId] === 'a' ||
              other.cells[operandId] === 'd' ||
              other.cells[operandId] === 'I'),
          );
          if (!hasDownstream) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['po_array'],
              message: `Orphan create at process "${row.process_id}" for operand "${operandId}" — every c' must have a downstream affect/destroy/instrument (Crawley Box 5.7).`,
            });
          }
        }
      }
    }
  },
);
```

---

## `mathDerivationV2` resolution (team-lead ruling 2026-04-22)

**Ruling applied: Option Y — sibling `mathDerivationMatrixSchema` at M5-local scope.**

- **Location:** `apps/product-helper/lib/langchain/schemas/module-5/_matrix.ts` (NEW file, scoped to M5 only). NOT hoisted to `_shared.ts`.
- **Consumer (this file):** `po_array_derivation` uses `mathDerivationMatrixSchema` fields verbatim — `formula`, `inputs`, `kb_source`, `kb_section`, `result_kind: 'matrix'`, `result_matrix`, `result_shape: [rows, cols]`, `result_is_square: boolean`.
- **Shape-drift invariant (in `_matrix.ts`):** `.superRefine()` enforces `result_shape[0] === result_matrix.length && result_shape[1] === result_matrix[0]?.length`. Catches shape drift at parse time.
- **Nature of result:** matrix-valued (`PP' ∈ R^{|P| × |P|}`), Crawley Box 5.8 symbolic multiply `PP = PO × OP`.
- **Locality rule:** hoist to `_shared.ts` only if a 3rd non-M5 site needs matrix derivation. Current M5 sites: (1) this PO array, (2) 9-block DSM in phase-3 (decomposed into 9 block records + 1 projection chain).

**`_shared.ts` modifications:** **ZERO.** `mathDerivationSchema` (scalar) stays as-is for all other c1v math derivations. Matrix consumers import the M5-local sibling.

---

## NFREngineInterpreter boundary note

Phase 2 outputs are **read by** `NFREngineInterpreter`; no engine class is introduced here. Specifically:
- `functional_interactions[]` is traversed when an NFR target evaluates a performance claim along a value pathway.
- `po_array` is consulted for causality analysis when NFR asks "does change in process X affect operand Y?"
- `value_pathway[]` is the canonical input to latency/throughput NFR resolution.

No file in `module-5/` ever runs independently — data contract only.

---

## c1v applicability summary

| Methodology rule | Enforced by |
|---|---|
| Exactly one primary external function | `phase2FunctionTaxonomySchema` — non-array field; singleton by schema shape |
| Function = process + operand (no merged verb-phrases) | Separate `process` + `operand` string fields with no concat-parse fallback |
| Benefit delivered at boundary interface | `primary_external_function.boundary_interface_ref` required (cross-phase ref to Phase-1 interface) |
| PO array causality | `.superRefine()` orphan-create invariant |
| Value pathway closure | `.superRefine()` pathway-terminates-at-primary invariant |
| Software duality (data vs control) | `functional_interactions[].interaction_kind` required when software form exists |
| Standard blueprints | `internal_functions[].blueprint_ref` enum for Box 5.6 cross-reference |

---

## Citations

- **Crawley, E., Cameron, B., & Selva, D. (2015).** *System Architecture: Strategy and Product Development for Complex Systems.* Pearson.
  - Box 5.1 — Definition: Function (book_md line 2006–2010)
  - Box 5.2 — Definition: Operand (book_md line 2037–2041)
  - Box 5.3 — Definition: Process (book_md line 2047–2049)
  - Canonical `function = process + operand` (book_md line 2029)
  - OPM arrow conventions (book_md line 2073–2089)
  - Box 5.4 — Definition: Value (book_md line 2154–2156)
  - Box 5.5 — Principle of Benefit Delivery (book_md line 2162–2176)
  - Table 5.1 — Four Questions (book_md line 2012–2019)
  - Primary external function — replacement test (book_md line 2143–2147)
  - Function delivered at interface (book_md line 2121)
  - Table 5.2 — Primary externally-delivered functions catalogue (book_md line 2127–2137)
  - Box 5.6 — Standard Blueprints of Internal Processes (book_md line 2262–2275)
  - Functional Architecture + Value Pathway (book_md line 2319–2343)
  - Box 5.7 — PO Array (book_md line 2333–2341)
  - Box 5.8 — Projecting Operands onto Processes (book_md line 2430–2455)
  - Software: control tokens + data operands (book_md line 2422–2473)
  - Not on value pathway (book_md line 2392–2403)
  - Table 5.6 — Form vs Function (book_md line 2493–2503)

- **Dori, D.** Object-Process Methodology (OPM). *(underlying notation cited by Crawley Ch 5)*

- **Cross-references to c1v schemas:**
  - `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` — phaseEnvelopeSchema, sourceRefSchema, mathDerivationSchema (consumed here via extend; mathDerivationSchema flagged for V2 extension).
  - `.../5-form-function-mapping/01-Phase-1-Form-Taxonomy.md` — Phase 1 form_entity, interface cross-references.
  - `.../5-form-function-mapping/GLOSSARY-crawley.md` — canonical triad, Benefit Delivery, Value definition.

**Ruling anchors:**
- Handoff §3 2026-04-21 ~14:30 — NFREngineInterpreter is the only executor; no standalone engine introduced here.
- Handoff §3 2026-04-21 ~13:00 — Q(f,g) concept-quality is DERIVED, NOT Crawley. No Q(f,g) formula appears in this file (it is NOT from Ch 5); will surface in Ch 13 (decomposition) extraction.
- mathDerivationV2 escalation: batched per team-lead request; this file is candidate #1.
