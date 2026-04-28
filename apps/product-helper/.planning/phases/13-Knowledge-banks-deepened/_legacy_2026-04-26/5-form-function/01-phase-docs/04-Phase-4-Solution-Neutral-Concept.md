---
name: M5 Phase 4 — Solution-Neutral Function & Concept
module: M5 Form-Function Mapping
phase_number: 4
phase_slug: "solution-neutral-concept"
schema_version: "1.0.0"
zod_schema_id: "m5.phase-4-solution-neutral-concept.v1"
zod_target_path: "apps/product-helper/lib/langchain/schemas/module-5/phase-4-solution-neutral-concept.ts"
source_chapter: "Crawley, Cameron, Selva (2015), Ch 7 — Solution-Neutral Function and Concepts"
source_sections:
  - "§7.1 Box 7.1 Principle of Solution-Neutral Function"
  - "§7.2 Box 7.2 Definition of Concept + Table 7.3 solution-neutral→concept pairs"
  - "§7.2 Box 7.3 Specializing solution-neutral function to concept"
  - "§7.2 Figure 7.4 Template for deriving concept from solution-neutral intent"
  - "§7.3 Table 7.5 Naming conventions for concepts"
  - "§7.3 Organizing concept alternatives (Figure 7.5)"
  - "§7.3 Broader concepts + hierarchy of intent"
  - "§7.4 Integrated concepts + concept fragments (morphological matrix, Tables 7.6/7.7/7.8)"
  - "§7.5 Concept of operations (conops)"
page_range: "book_md lines 3030–3472"
validation_needed: false
derivation_source: "Crawley Ch 7 (primary source). conceptNamingConventionSchema + operandSpecializationKindSchema + processSpecializationKindSchema are phase-local Zod enums introduced here."
nfr_engine_slot: "NFREngineInterpreter consumes integrated_concepts as candidate design points when evaluating the morphological matrix against cost/performance NFRs; concept_of_operations informs operability/latency NFR resolution."
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-21"
---

# Phase 4 — Solution-Neutral Function & Concept (Crawley Ch 7)

> **Scope.** Forces architects to state the problem **before** the solution. Produces the solution-neutral functional intent, then specializes it via Box 7.3 patterns into a **concept triad** (operand + process + instrument). Builds the morphological matrix that M4 Decision Network consumes as its candidate design-point source.
>
> **Sacred quote (Einstein, cited by Crawley Box 7.1):** "We cannot solve our problems with the same thinking we used when we created them."

---

## Knowledge

### Box 7.1 — Principle of Solution-Neutral Function (line 3048–3056)

> "Poor system specifications frequently contain clues about an intended solution, function, or form, and these clues may lead the architect to a narrower set of potential options. Use solution-neutral functions where possible, and use the hierarchy of solution-neutral statements to scope how broad an exploration of the problem is to be undertaken."

**Definition (line 3046):**
> "Solution-neutral function is the function of a system stated without reference to how the function is achieved."

### Example hierarchy (Figure 7.2; line 3060–3070)

For wine: **accessing wine** → (opening bottle: remove / breach / break) → (removing: translate / destroy) → (translating: push / shear / pull) → (pulling + screw = corkscrew).

> "The breadth of concepts we generate is heavily dependent on the functional intent we pose. All else being equal, the more solution-neutral our expression of the functional intent of the system, the broader the set of concepts we will develop." (line 3062)

### Procedure — 7-field solution-neutral intent (Q 7a, line 3080–3089)

1. Consider the **beneficiary**.
2. Identify the **need** of the beneficiary you are trying to fill.
3. Identify the **solution-neutral operand** that, if acted upon, will yield the desired benefit.
4. Identify the **benefit-related attribute** of the solution-neutral operand.
5. Perhaps identify **other relevant attributes** of the solution-neutral operand.
6. Define the **solution-neutral process** that changes the benefit-related attribute.
7. Perhaps identify **attributes of the solution-neutral process**.

### Worked examples (Table 7.2, line 3101–3111)

| Question | Transportation service | Home network |
|---|---|---|
| Beneficiary | Traveler | Surfer |
| Need | "Visit a client in another city" | "Buy a cool book" |
| Solution-neutral operand | Traveler | Book |
| Benefit-related attribute | Location | Ownership |
| Other operand attributes | Alone with light luggage | Consistent with tastes |
| Solution-neutral process | Changing (transporting) | Buying |
| Attributes of process | Safely and on demand | Online |

### Box 7.2 — Definition of Concept (line 3136–3142)

> "Concept is a product or system vision, idea, notion, or mental image that maps function to form. It is a scheme for the system and how it works. It embodies a sense of how the system will function and an abstraction of the system form. It is a simplification of the system architecture that allows for high-level reasoning.
>
> Concept is not a product/system attribute but a notional mapping between two attributes: form and function."

**Five roles of concept (line 3128–3135):**
1. Transition point from solution-neutral to solution-specific.
2. Must allow value-related functions to be executed, enabled by form.
3. Establishes the vocabulary for the solution.
4. Implicitly sets the design parameters.
5. Implicitly sets the level of technology.

### Concept template (Figure 7.4; line 3162–3166)

A concept = **specific operand + specific process + specific instrument** (+ attributes). Reads as a full sentence.

### Table 7.3 — 5 worked pairs (line 3168–3177)

| Solution-neutral operand | Solution-neutral process | Specific operand | Specific process | Specific instrument |
|---|---|---|---|---|
| Fluid | Moving | Water | Pressurizing | Centrifugal pump |
| Array | Sorting | Array entries | Sequentially exchanging | Bubblesort |
| Cork | Translating | Cork | Pulling | Screw |
| Traveler | Transporting | Traveler | Flying | Airplane |
| Book | Buying | Internet | Accessing | Home DSL connection |

### Box 7.3 — Specializing solution-neutral function to concept (line 3180–3213)

**Operand specialization patterns:**
- **Entirely different operand + different process** (entertaining → watching a DVD; preserving memory → capturing image).
- **Entirely different operand, same process** (choosing leader → choosing president).
- **Part-of** (open bottle → remove cork; sort array → exchange entries).
- **Type-of** (move fluid → pressurize water; fix cars → fix sports cars).
- **Attribute-of / added attribute** (amplify signal → increase signal voltage; control pump → regulate pump speed).
- **Informational object of attribute** (evacuate people → inform task knowledge; check status → communicate signal).

**Process specialization patterns:**
- Specialized to different process (sheltering → housing).
- Specialized to type (transporting → flying; preserving → painting; cooking → boiling).
- Adding attribute (powering → electrically powering).

### Naming conventions (Table 7.5, line 3254–3273)

| Convention | Example |
|---|---|
| Operand-Process-Instrument | light-emitting-diode; data-storage-warehouse |
| Operand-Process | lawn-mow(er); hair-dry(er) |
| Operand-Instrument | cork-screw; fire-place; hat-rack; suit-case |
| Process-Instrument | dining room (food dining room); carrying case |
| Process | TV control(er); image project(er) |
| Instrument | hat; table; bicycle |

> "Concepts are not normally named for just the operand, because it doesn't contain enough information to describe a concept."

### Organizing concept alternatives (§7.3, line 3274–3292)

Three-layer tree:
1. **Operand layer** — fewest options.
2. **Process layer** — more options per operand.
3. **Instrument (form) layer** — most options per process.

### Broader Concepts and Hierarchy (§7.3, line 3294–3328)

> "The specific function at one level becomes the solution-neutral functional intent at the next level down the hierarchy."

Example (traveler): close a deal → learn client preferences → meet client → travel → fly.

> "It is very useful for the architect to understand the hierarchy of intent for the system 'up' through one or two levels."

### Integrated concepts + concept fragments (§7.4, line 3338–3388)

> "An integrated concept is made up of smaller concept fragments, each of which identifies how one of the internal processes is specialized. When we encounter a rich process, we expand it into internal processes and then identify concept fragments for each."

**Morphological matrix (Tables 7.6/7.7/7.8):**
- Rows: internal processes (e.g., lifting, propelling, guiding for transport).
- Columns: alternative instruments of form per process.
- Integrated concept = one column (or merged set) — e.g., car = wheels-wheels-wheels; jet = wings-jet-rudder.

**Rich/unpacked process rule:** when a process has multiple irreducible internal steps (visit = go+stay+return; transport = lift+propel+guide), each gets its own concept fragment.

### Concept of Operations (Conops) (§7.5, line 3444–3472)

- **Concept of operations** = how the system operates (who, when, coordinated with what).
- "The relationship between concept of operations and a detailed sequence of operations is the same as the relationship between system concept and system architecture."

**Good vs Service (line 3456–3466):**
> "If the enterprise transfers the instrument, it is called a good. If it transfers the function, it is a service."

Service ownership inversion: from aircraft conops, aircraft is the operand (loaded, flown); from service conops, aircraft is the instrument (transports the traveler).

> "A service is a system! The concept of operations contains information vital to understanding the system architecture."

---

## Input Required

- `m5.phase-2-function-taxonomy.v1` output (for `primary_external_function` + `internal_functions` if already extracted).
- `m1.system_scope_summary.v1` for beneficiary + need candidates.

---

## Instructions for the LLM

### Sub-phase A: Solution-neutral intent (7-field procedure)

Emit a `solution_neutral_function` record with all 7 fields as separate required keys. **Reject** a single narrative string like "build a web app to let users buy books" — must decompose to beneficiary / need / SN operand / benefit-related attribute / other attributes / SN process / process attributes.

### Sub-phase B: Specialization to concept

For each Phase-2 internal process (or the primary external function), emit a `concept` record with:
- `specific_operand`, `specific_process`, `specific_instrument` (all three required — no single-string concepts).
- `operand_specialization_kind ∈ operandSpecializationKindSchema` (6 values from Box 7.3).
- `process_specialization_kind ∈ processSpecializationKindSchema` (3 values from Box 7.3).
- `concept_naming_convention ∈ conceptNamingConventionSchema` (6 values from Table 7.5).
- `concept_name` (noun phrase following the chosen convention).

### Sub-phase C: Morphological matrix

Build `morphological_matrix`:
```
{
  internal_processes: string[],                      // row headers
  instruments_per_process: Record<processId, string[]>,
  integrated_concepts: Array<{
    concept_name: string,
    selections: Record<processId, instrumentId>,
    aggregate_rationale: string,
  }>
}
```

### Sub-phase D: Intent hierarchy

Emit `hierarchy_up` (1 level up — the broader intent this system contributes to) and `hierarchy_down` (1 level down — the solution-neutral intent of a sub-system). Both are optional but strongly recommended for non-trivial systems (Crawley §7.3 — "one or two levels" both directions).

### Sub-phase E: Concept of operations

Emit `concept_of_operations`:
```
{
  sequence: string[],                                // time-ordered phase labels
  operator_actions: Array<{actor: string, action: string, step_index: number}>,
  coordinated_systems: string[],
  good_or_service: 'good' | 'service',
  ownership_inversion_note: string,                  // required if good_or_service === 'service'
}
```

### STOP GAP — conops-vs-concept distinction

Before marking `_phase_status: "complete"`:

1. **Conops ≠ concept textual invariant:** `concept_of_operations.sequence` MUST have ≥2 entries; cannot literally equal the concept name. Rationale: conops adds time sequencing that concept omits.
2. **Solution-neutral ≠ specific invariant:** `solution_neutral_function.solution_neutral_process` MUST NOT literally equal any `concept.specific_process` in the same file. If they match, the user has prematurely committed to a solution (Box 7.1 warning).
3. **Concept naming invariant:** `concept_naming_convention` set; `concept_name` follows the chosen convention pattern.
4. **Morphological matrix completeness:** at least 2 `integrated_concepts` required — one alternative isn't exploration.

---

## Zod Schema

```ts
// apps/product-helper/lib/langchain/schemas/module-5/phase-4-solution-neutral-concept.ts

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
} from '@/lib/langchain/schemas/module-2/_shared';

// Phase-local — Crawley Table 7.5 six naming conventions.
export const conceptNamingConventionSchema = z
  .enum([
    'operand_process_instrument',
    'operand_process',
    'operand_instrument',
    'process_instrument',
    'process',
    'instrument',
  ])
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Naming — Crawley Table 7.5 six conventions.',
  );

// Phase-local — Crawley Box 7.3 six operand specialization patterns.
export const operandSpecializationKindSchema = z
  .enum([
    'different_operand_different_process',
    'different_operand_same_process',
    'part_of',
    'type_of',
    'attribute_of',
    'informational_object_of_attribute',
  ])
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Specialization — Crawley Box 7.3 operand patterns.',
  );

// Phase-local — Crawley Box 7.3 three process specialization patterns.
export const processSpecializationKindSchema = z
  .enum(['different_process', 'type_of_process', 'added_attribute'])
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Specialization — Crawley Box 7.3 process patterns.',
  );

export const solutionNeutralFunctionSchema = z
  .object({
    beneficiary: z.string().describe(
      'x-ui-surface=section:Solution-Neutral Concept > Intent — Q7a.1 beneficiary.',
    ),
    need: z.string().describe(
      'x-ui-surface=section:Solution-Neutral Concept > Intent — Q7a.2 need of beneficiary.',
    ),
    solution_neutral_operand: z.string(),
    benefit_related_attribute: z.string(),
    other_operand_attributes: z.array(z.string()).default([]),
    solution_neutral_process: z.string(),
    process_attributes: z.array(z.string()).default([]),
    intent_statement: z.string().describe(
      'x-ui-surface=section:Solution-Neutral Concept > Intent — composed single-sentence statement (Table 7.2 bottom row format).',
    ),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Intent — 7-field solution-neutral functional intent (Q 7a).',
  );

export const conceptSchema = z
  .object({
    concept_id: z.string(),
    specific_operand: z.string(),
    specific_process: z.string(),
    specific_instrument: z.string(),
    operand_specialization_kind: operandSpecializationKindSchema,
    process_specialization_kind: processSpecializationKindSchema,
    concept_naming_convention: conceptNamingConventionSchema,
    concept_name: z.string(),
    source_process_id: z.string().describe(
      'x-ui-surface=internal:cross-phase-ref — Phase-2 internal_function.function_id this concept specializes.',
    ),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Concept — one specific-operand/process/instrument triad (Box 7.2).',
  );

export const integratedConceptSchema = z
  .object({
    concept_name: z.string(),
    selections: z.record(z.string(), z.string()).describe(
      'x-ui-surface=section:Solution-Neutral Concept > Morphological Matrix — processId → instrumentId selection.',
    ),
    aggregate_rationale: z.string(),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Integrated Concepts — one column/merged-set of the morphological matrix (Tables 7.6–7.8).',
  );

export const morphologicalMatrixSchema = z
  .object({
    internal_processes: z.array(z.string()).min(1),
    instruments_per_process: z.record(z.string(), z.array(z.string())),
    integrated_concepts: z.array(integratedConceptSchema).min(2).describe(
      'x-ui-surface=section:Solution-Neutral Concept > Morphological Matrix — at least 2 alternatives (Crawley: exploration).',
    ),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Morphological Matrix — Crawley §7.4 concept fragments + integrated concepts.',
  );

export const conceptOfOperationsSchema = z
  .object({
    sequence: z.array(z.string()).min(2).describe(
      'x-ui-surface=section:Solution-Neutral Concept > Conops — time-ordered phase labels.',
    ),
    operator_actions: z.array(
      z.object({
        actor: z.string(),
        action: z.string(),
        step_index: z.number().int().nonneg(),
      }),
    ),
    coordinated_systems: z.array(z.string()).default([]),
    good_or_service: z.enum(['good', 'service']),
    ownership_inversion_note: z.string().optional(),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Conops — Crawley §7.5 concept of operations.',
  );

export const intentHierarchyLevelSchema = z
  .object({
    level_name: z.string(),
    functional_intent: z.string(),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Intent Hierarchy — one level in Crawley §7.3 up/down hierarchy.',
  );

export const phase4SolutionNeutralConceptSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-5.phase-4-solution-neutral-concept.v1'),
    solution_neutral_function: solutionNeutralFunctionSchema,
    concepts: z.array(conceptSchema).min(1),
    morphological_matrix: morphologicalMatrixSchema,
    hierarchy_up: intentHierarchyLevelSchema.optional(),
    hierarchy_down: intentHierarchyLevelSchema.optional(),
    concept_of_operations: conceptOfOperationsSchema,
    crawley_glossary_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M5 Phase 4: solution-neutral function + concept triad per Crawley Ch 7.',
  );

export type Phase4SolutionNeutralConcept = z.infer<typeof phase4SolutionNeutralConceptSchema>;
```

### Refinement — Solution-neutral ≠ specific + conops ≠ concept

```ts
export const phase4WithInvariants = phase4SolutionNeutralConceptSchema.superRefine((val, ctx) => {
  // 1. Solution-neutral process must NOT equal any specific_process (Box 7.1 warning).
  const snProc = val.solution_neutral_function.solution_neutral_process.toLowerCase().trim();
  for (const concept of val.concepts) {
    const sp = concept.specific_process.toLowerCase().trim();
    if (snProc === sp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['concepts'],
        message: `Crawley Box 7.1: solution-neutral process "${val.solution_neutral_function.solution_neutral_process}" literally equals specific_process of concept "${concept.concept_name}" — user prematurely committed to solution. Re-express solution-neutral intent more broadly.`,
      });
    }
  }
  // 2. Conops sequence cannot equal the concept name verbatim.
  const primaryConceptName = val.concepts[0]?.concept_name.toLowerCase().trim();
  const joined = val.concept_of_operations.sequence.join(' ').toLowerCase().trim();
  if (primaryConceptName && joined === primaryConceptName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['concept_of_operations', 'sequence'],
      message: 'Crawley §7.5: conops must add time-sequence information beyond the concept itself.',
    });
  }
  // 3. Service conops requires ownership_inversion_note.
  if (
    val.concept_of_operations.good_or_service === 'service' &&
    !val.concept_of_operations.ownership_inversion_note
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['concept_of_operations', 'ownership_inversion_note'],
      message: 'Crawley §7.5 (line 3456): a service transfers function — must document ownership inversion (what was operand becomes instrument, and vice versa).',
    });
  }
});
```

---

## NFREngineInterpreter boundary note

`morphological_matrix.integrated_concepts[]` is the canonical **candidate-design-point source** for M4 Decision Network. NFREngineInterpreter reads these as input when scoring alternatives against NFR targets. No engine class is introduced here. Concept specialization is a pure data transformation; actual generation (e.g., using KB-8 priors to rank alternatives) happens inside NFREngineInterpreter-orchestrated tool calls.

---

## c1v applicability summary

| Methodology rule | Enforced by |
|---|---|
| 7-field solution-neutral procedure (no narrative string) | Separate required Zod keys in `solutionNeutralFunctionSchema` |
| Concept is 3-tuple not single string | Separate `specific_operand`/`specific_process`/`specific_instrument` |
| Naming follows Table 7.5 convention | `concept_naming_convention` enum required |
| Conops adds time information beyond concept | `.superRefine()` textual inequality + sequence min 2 |
| Service inversion documented | `.superRefine()` ownership_inversion_note required when `good_or_service === 'service'` |
| Exploration requires ≥2 integrated concepts | `.min(2)` on `integrated_concepts` |
| Don't prematurely commit to solution | `.superRefine()` SN process ≠ specific process |

---

## Citations

- **Crawley, Cameron, Selva (2015).** Ch 7.
  - Box 7.1 — Principle of Solution-Neutral Function (book_md line 3048–3056; definition line 3046)
  - Figure 7.2 — wine example (book_md line 3060–3070, quote line 3062)
  - 7-field procedure (book_md line 3080–3089)
  - Table 7.2 — worked examples (book_md line 3101–3111)
  - Box 7.2 — Definition of Concept (book_md line 3136–3142)
  - Five roles of concept (book_md line 3128–3135)
  - Figure 7.4 + Table 7.3 (book_md line 3162–3177)
  - Box 7.3 — Specializing solution-neutral to concept (book_md line 3180–3213)
  - Table 7.5 — Naming conventions (book_md line 3254–3273)
  - Organizing concept alternatives (book_md line 3274–3292)
  - Broader Concepts and Hierarchy (book_md line 3294–3328)
  - Integrated Concepts + Concept Fragments (book_md line 3338–3388)
  - Morphological matrix (Tables 7.6/7.7/7.8)
  - Concept of Operations + Good vs Service (book_md line 3444–3472, service line 3456–3466)

- **Einstein, A.** *(cited Box 7.1)*

- **Cross-references:**
  - `./GLOSSARY-crawley.md` — operand, process, value, system.
  - `./02-Phase-2-Function-Taxonomy.md` — primary_external_function, internal_functions consumed here.
  - `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` — phaseEnvelopeSchema, sourceRefSchema.
  - M4 Decision Network consumes `morphological_matrix.integrated_concepts[]` as candidate options.

**Ruling anchors:**
- Handoff §3 2026-04-21 ~14:30 — NFREngineInterpreter is sole executor; no standalone engine here.
- Team-lead 2026-04-21 — phase-local enum pattern green-lit; `conceptNamingConventionSchema`, `operandSpecializationKindSchema`, `processSpecializationKindSchema` stay module-local.
- Schema id renamed from architect's `m5.phase-solution-neutral.v1` → `m5.phase-4-solution-neutral-concept.v1` for numeric phase consistency.
