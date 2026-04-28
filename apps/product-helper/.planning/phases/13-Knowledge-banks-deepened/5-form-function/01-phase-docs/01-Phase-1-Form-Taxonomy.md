---
schema: phase-file.v1
phase_slug: phase-1-form-taxonomy
module: 5
artifact_key: module_5/phase-1-form-taxonomy
engine_story: m5-form-function
engine_path: apps/product-helper/.planning/engines/m5-form-function.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-5-form-function
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/5-form-function/01-phase-docs/01-Phase-1-Form-Taxonomy.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# phase-1-form-taxonomy

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-1-form-taxonomy` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 5, phase: phase-1-form-taxonomy}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_5/phase-1-form-taxonomy`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 5, phase: 'phase-1-form-taxonomy' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

---
name: M5 Phase 1 — Form Taxonomy
module: M5 Form-Function Mapping
phase_number: 1
phase_slug: "form-taxonomy"
schema_version: "1.0.0"
zod_schema_id: "m5.phase-1-form-taxonomy.v1"
zod_target_path: "apps/product-helper/lib/langchain/schemas/module-5/phase-1-form-taxonomy.ts"
source_chapter: "Crawley, Cameron, Selva (2015), Ch 4 — Form"
source_sections:
  - "§4.1 Box 4.1 Definition of Form"
  - "§4.2 Box 4.2 Definition of Object"
  - "§4.3 Table 4.1 Six Questions for Defining Form"
  - "§4.5 Box 4.4 Formal Relationships / Structure"
  - "§4.5.3 Box 4.6 Design Structure Matrix (DSM)"
  - "§4.7 Box 4.7 Principle of Dualism"
  - "§4.7 Form in Software"
page_range: "book_md lines 1401–1976"
validation_needed: false
derivation_source: "Crawley Ch 4 (primary source); formalRelationshipKindSchema is a phase-local Zod enum introduced here"
nfr_engine_slot: "NFREngineInterpreter consumes form entities when resolving an 'ility' target to a form-decomposition constraint (e.g., maintainability → modular decomposition preference)"
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-21"
---

# Phase 1 — Form Taxonomy (Crawley Ch 4)

> **Scope.** Defines the c1v representation of system **form**: the physical or informational embodiment of a system. This is the first structured phase of M5; it produces a form taxonomy that downstream phases (function taxonomy, concept mapping, concept expansion) reference as the instrument of function.
>
> **Curation note.** Quotations are verbatim from the parsed book MD. Line numbers match that MD, not printed-book pages. See `Citations` block at EOF.

---

## Knowledge

### Box 4.1 — Definition: Form (line 1412–1420)

> "Form is the physical or informational embodiment of a system that exists or has the potential for stable, unconditional existence, for some period of time, and is instrumental in the execution of function. Form includes the entities of form and the formal relationships among the entities. Form exists prior to the execution of function.
>
> Form is a product/system attribute."

**Two tests for form (line 1397–1399):**
1. It exists.
2. It is instrumental in the execution of function.

### Box 4.2 — Definition: Object (line 1462)

> "An object is that which has the potential for stable, unconditional existence for some period of time."

Notes (line 1460, 1468–1472):
- Objects are the representational primitive for form, drawn from Dori's OPM (Object-Process Methodology).
- Generally, names of objects are **nouns**.
- **Informational objects**: "anything that can be comprehended intellectually" — ideas, thoughts, arguments, instructions, conditions, data.
- Objects have **attributes** (physical / electrical / logical). Some attributes are **states** an object can be in for a duration. A process can change an object's state.
- OPM graphical convention: object = rectangle. An attribute is connected by a "double-triangle" line reading "is characterized by."

### Table 4.1 — Six questions for defining form (line 1401–1410)

| # | Question | Produces |
|---|---|---|
| 4a | What is the system? | An object that defines the abstraction of form for the system |
| 4b | What are the principal elements of form? | A set of objects that represent the first- and second-level downward abstractions of the decomposed system |
| 4c | What is the formal structure? | A set of spatial and connectivity relationships among the objects at any level of decomposition |
| 4d | What are the accompanying systems? / What is the whole product system? | Objects in the whole product system essential for delivery of value + relationships to those accompanying systems |
| 4e | What are the system boundaries? / What are the interfaces? | A clear definition of the boundary + interfaces |
| 4f | What is the use context? | Objects not essential to value delivery but that establish place, inform function, and influence design |

### Decomposition of Form (line 1484–1499)

- Decomposition of form is represented in OPM by a tree diagram; **black triangle** = decomposition symbol.
- System 0 at Level 0 decomposes into Level-1 objects; Level-1 objects aggregate into System 0.
- "Form can be decomposed into smaller entities of form, which in turn aggregate into larger entities of form."

### Box 4.4 — Definition: Formal Relationships / Structure (line 1611–1615)

> "Formal relationships, or structure, are the relationships between objects of form that have the potential for stable, unconditional existence for some duration of time and may be instrumental in the execution of functional interactions."

### Three-tier taxonomy of formal relationships (line 1811–1814)

1. **Connection** — relationships that create the formal connection over which functional interaction can take place.
2. **Location and placement** — including spatial/topological relations, address, and sequence.
3. **Intangible** — membership, ownership, human relationship, and so on.

#### Spatial / Topological (line 1629–1641)

- **Spatial:** absolute/relative location or orientation — above/below, ahead/behind, left/right, aligned, concentric, near/far, absolute geodetic reference.
- **Topological:** placement — within, contained in, surrounded by, overlapping, adjacent, touching, outside of, encircling.
- Identification rule: "Is this spatial or topological relationship key to some important functional interaction or to the successful emergence of function and performance?"

#### Connectivity (line 1734–1754)

- Answers "What is connected, linked, or joined to what?"
- "Connectivity relationships are often instruments of functional interaction, so they directly support the emergence of function and performance."
- Encodes implementation history: "If two things are connected now, there was a process of connecting them in the past."
- **Exceptions** (functional interaction without explicit formal connection): electromagnetic spectrum, gravity, "ballistic" flow of particles/continua.

#### Other formal relationships (line 1796–1805)

- **Address** — encoded spatial location; may be virtual (software registers, shared addresses).
- **Sequence** — static order. "A is always after B" — in imperative languages, statement 2 after statement 1 implies 2 executes after 1 (a functional statement); the fact that 2 follows 1 in code is a formal statement in both imperative and declarative.
- **Membership** — being in a group or class.
- **Ownership** — static relationship between owner and owned item (e.g., land, money).
- **Human relationships** — bonds, knowledge, trust; not necessarily reciprocal.

All formal relationships are static at any given time but can change.

### Box 4.6 — Definition: Design Structure Matrix (line 1704–1707)

> "DSM is an acronym that generally stands for Design Structure Matrix but sometimes stands for Decision Structure Matrix or Dependency Structure Matrix. A DSM is an N-Squared matrix that is used to map the connections between one element of a system and others. It's called N-Squared because it is constructed with N rows and N columns, where N is the number of elements. The normal convention, used in this text, is that one reads down the column to the relationship to the row heading, and that things 'flow' from column heading to row heading."

### Whole product system + use context (line 1820–1864)

- **Accompanying systems** — objects that are not part of the product/system but are essential for the system to deliver value.
- **Whole product system** = product/system + accompanying systems.
- **System boundary** runs between the product/system and the accompanying systems; each crossing is an **interface**.
- **Use context** — objects normally present when the whole product system operates but not necessary for value delivery. Establishes place, informs function, influences design.
- Heuristic (line 1856): "Just as it is important for an architect to understand about two levels down in decomposition, it is important for him or her to understand about two levels out in context — the whole product system and the use context."

### Box 4.7 — Principle of Dualism (line 1888–1900)

> "All built systems inherently and simultaneously exist in the physical domain and the informational domain. It is sometimes useful to explicitly consider both the physical and the informational views of a system."

- Informational form must always be represented by physical form (poems in print, thoughts in neural patterns, DVDs as optical markings, images as pixels).
- "Systems that we usefully think of as information systems are just abstractions of physical objects that store and process the information."
- "Systems that we think of as physical store all the information about their form, but not necessarily about their function."

### Form in Software (line 1866–1976)

- **The code is form**: it exists, exists prior to execution of function, is instrumental in execution.
- Decomposition: program → modules → procedures → lines of code.
- Spatial/topological structure in imperative code = **sequence** (precedes/follows) + **containment** (within/contains). Informs flow of control.
- Connectivity structure = connections carrying variable/data exchange.
- **Whole product system for software**: compiler + calling routine + processor + system software + I/O + power + network + operator.
- In information systems, spatial/topological and connectivity structure can be made more distinct than in physical systems.

### Form classes by decomposability (Ch 2 line 741–745, echoed in Ch 4)

- **Discrete** — obvious decomposition.
- **Modular** — internally dense, externally weak relationships.
- **Integral** — cannot be divided with function intact.

---

## Input Required

- M1 `system_scope_summary.v1` with `stop_gap_cleared: true`
- M1 Phase-3 `scope-tree.v1` (downward decomposition — at minimum Level-1 entities)
- PM availability for Crawley-style "two levels down + two levels out" checkpoint

---

## Instructions for the LLM

### Sub-phase A: Form Identification (Questions 4a–4b)

1. **Emit Level-0 form entity** — a single `form_entity` record with `decomposition_level: 0`, `parent_entity_id: null`, `name` = noun-phrase naming the system. Refuse to emit multiple Level-0 entities (violates Box 4.1 — form is *a* system's embodiment).
2. **Emit Level-1 entities** — 4–9 `form_entity` records (Miller's 7±2) each with `decomposition_level: 1`, `parent_entity_id: <Level-0 id>`.
3. **Emit Level-2 entities where non-trivial** — heuristic rule: if a Level-1 entity has any declared `formal_relationships[]` to more than one other Level-1 entity, decompose it to Level 2.
4. Each entity's `name` MUST be a noun phrase (Box 4.2 line 1471). Reject verb-phrases; route the LLM to emit the action as a function record in Phase 2.

### Sub-phase B: Formal Structure (Question 4c)

For every pair of entities with a declared relationship, emit a `formal_relationship` record on the source entity with:
- `target_entity_id` (must reference an existing entity at same or adjacent decomposition level)
- `kind` ∈ **formalRelationshipKindSchema** enum (see Zod below)
- `label` (short lowercase noun-phrase describing the relationship)
- `is_physical` (Box 4.7 Dualism: mark `true` for physical, `false` for purely informational — but reject pure-informational architectures with zero physical-form entities, per Dualism Principle)

### Sub-phase C: Boundary + Interfaces (Question 4e)

- Emit exactly one `boundary` record naming the set of entities inside.
- Every `formal_relationship` crossing the boundary MUST emit a corresponding `interface` record.
- Every external entity referenced by an interface MUST also appear as an `accompanying_system_entity` (per Question 4d).

### Sub-phase D: Whole Product System + Use Context (Questions 4d + 4f)

- Emit `accompanying_systems[]` covering the "two levels out" heuristic.
- Emit `use_context_entities[]` for non-essential context that informs design but is not in the value pathway.

### Sub-phase E: Decomposability Classification

For each form entity, assign `decomposability: "discrete" | "modular" | "integral"`. Rule:
- `discrete` iff entity has ≤1 formal_relationship to others at same level.
- `modular` iff entity has dense internal relationships (≥3 between children) and ≤2 cross-entity relationships at same level.
- `integral` otherwise.

### STOP GAP — Dualism check before exit

Before marking `_phase_status: "complete"`:

1. Count `form_entity` records with `is_physical: true` — if zero and system is not declared as purely informational-abstraction, FAIL per Box 4.7.
2. Confirm every `formal_relationship` has a `kind` value drawn from the enum (not free-text).
3. Confirm the "two levels down" rule — Level-2 entities exist where warranted.
4. Confirm every boundary-crossing relationship emits an `interface` record.

---

## Zod Schema

```ts
// apps/product-helper/lib/langchain/schemas/module-5/phase-1-form-taxonomy.ts

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
} from '@/lib/langchain/schemas/module-2/_shared';

// Phase-local enum — Crawley Ch 4 §4.5 three-tier formal-relationship taxonomy.
// NOT a softwareArchRefSchema member; this is an OPM / Crawley-native discriminator.
export const formalRelationshipKindSchema = z
  .enum([
    'connection',
    'spatial',
    'topological',
    'address',
    'sequence',
    'membership',
    'ownership',
    'human',
  ])
  .describe(
    'x-ui-surface=section:Form Taxonomy > Formal Relationships — Crawley Ch 4 §4.5 three-tier taxonomy (connection / location+placement / intangible flattened to 8 values).',
  );
export type FormalRelationshipKind = z.infer<typeof formalRelationshipKindSchema>;

export const decomposabilitySchema = z
  .enum(['discrete', 'modular', 'integral'])
  .describe(
    'x-ui-surface=section:Form Taxonomy > Decomposability — Crawley Ch 2 line 741–745 classification.',
  );

export const formalRelationshipRecordSchema = z
  .object({
    target_entity_id: z
      .string()
      .describe(
        'x-ui-surface=section:Form Taxonomy > Formal Relationships — id of the target form_entity; MUST reference an existing entity at same or adjacent decomposition_level.',
      ),
    kind: formalRelationshipKindSchema,
    label: z
      .string()
      .describe(
        'x-ui-surface=section:Form Taxonomy > Formal Relationships — lowercase noun-phrase naming the relationship (e.g., "mounted on", "adjacent to", "shares address space").',
      ),
    is_physical: z
      .boolean()
      .describe(
        'x-ui-surface=section:Form Taxonomy > Dualism — true for physical-form relationships, false for purely informational (Box 4.7).',
      ),
    crawley_glossary_ref: sourceRefSchema.optional().describe(
      'x-ui-surface=internal:provenance — pointer back to GLOSSARY-crawley "formal_relationship" when useful.',
    ),
  })
  .describe(
    'x-ui-surface=section:Form Taxonomy > Formal Relationships — one edge in the form-entity graph.',
  );

export const formEntitySchema = z
  .object({
    object_id: z
      .string()
      .describe(
        'x-ui-surface=section:Form Taxonomy > Entities — stable unique id for the form entity.',
      ),
    name: z
      .string()
      .regex(/^[A-Z]/, 'Form entity name must be a noun phrase (Crawley Box 4.2 line 1471)')
      .describe(
        'x-ui-surface=section:Form Taxonomy > Entities — noun phrase naming the entity (Box 4.2 — no verbs).',
      ),
    decomposition_level: z
      .number()
      .int()
      .min(0)
      .max(4)
      .describe(
        'x-ui-surface=section:Form Taxonomy > Entities — 0 = system, 1 = principal elements, 2+ = lower decompositions.',
      ),
    parent_entity_id: z
      .string()
      .nullable()
      .describe(
        'x-ui-surface=internal:tree-render — parent form_entity.object_id; null for Level-0 only.',
      ),
    attributes: z
      .record(
        z.string(),
        z.object({
          states: z.array(z.string()).default([]),
          category: z.enum(['physical', 'electrical', 'logical']).optional(),
        }),
      )
      .default({})
      .describe(
        'x-ui-surface=section:Form Taxonomy > Attributes — Crawley Box 4.2: attributes with optional state enumerations.',
      ),
    formal_relationships: z
      .array(formalRelationshipRecordSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Form Taxonomy > Formal Relationships — edges to other form_entity objects.',
      ),
    is_physical: z
      .boolean()
      .describe(
        'x-ui-surface=section:Form Taxonomy > Dualism — true = physical embodiment, false = informational. At least one true required per Box 4.7.',
      ),
    decomposability: decomposabilitySchema,
    notes: z.string().optional(),
  })
  .describe(
    'x-ui-surface=section:Form Taxonomy > Entities — a single object in the form of the system (Crawley Box 4.2).',
  );

export const interfaceRecordSchema = z
  .object({
    interface_id: z.string(),
    boundary_side_entity_id: z.string(),
    external_entity_id: z.string(),
    formal_relationship_ref: z
      .string()
      .describe(
        'x-ui-surface=internal:provenance — id of the formal_relationship crossing the boundary (Box 4.4).',
      ),
    description: z.string(),
  })
  .describe(
    'x-ui-surface=section:Form Taxonomy > Interfaces — a formal relationship that crosses the system boundary.',
  );

export const accompanyingSystemSchema = z
  .object({
    entity_id: z.string(),
    name: z.string(),
    role: z
      .string()
      .describe(
        'x-ui-surface=section:Form Taxonomy > Whole Product System — why this accompanying system is essential to value delivery (Q 4d).',
      ),
  })
  .describe(
    'x-ui-surface=section:Form Taxonomy > Whole Product System — Crawley §4.6 accompanying system.',
  );

export const useContextEntitySchema = z
  .object({
    entity_id: z.string(),
    name: z.string(),
    establishes: z
      .enum(['place', 'informs_function', 'influences_design'])
      .describe(
        'x-ui-surface=section:Form Taxonomy > Use Context — which of the three roles Crawley §4.6 names for use-context entities.',
      ),
  })
  .describe(
    'x-ui-surface=section:Form Taxonomy > Use Context — Crawley §4.6 use-context entity.',
  );

export const phase1FormTaxonomySchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-5.phase-1-form-taxonomy.v1'),
    form_entities: z
      .array(formEntitySchema)
      .min(2, 'At least Level-0 + one Level-1 entity required')
      .describe(
        'x-ui-surface=section:Form Taxonomy > Entities — all form entities at all decomposition levels.',
      ),
    interfaces: z
      .array(interfaceRecordSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Form Taxonomy > Interfaces — boundary-crossing relationships (Box 4.4 + §4.6).',
      ),
    accompanying_systems: z
      .array(accompanyingSystemSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Form Taxonomy > Whole Product System — Q 4d accompanying systems.',
      ),
    use_context_entities: z
      .array(useContextEntitySchema)
      .default([])
      .describe(
        'x-ui-surface=section:Form Taxonomy > Use Context — Q 4f non-essential context entities.',
      ),
    crawley_glossary_refs: z
      .array(sourceRefSchema)
      .default([])
      .describe(
        'x-ui-surface=internal:provenance — cross-references into GLOSSARY-crawley terms.',
      ),
  })
  .describe(
    'x-ui-surface=page-header — M5 Phase 1: form taxonomy per Crawley Ch 4.',
  );

export type Phase1FormTaxonomy = z.infer<typeof phase1FormTaxonomySchema>;
```

### Refinement — Dualism invariant (Box 4.7)

> **Footgun notice.** Per `apps/product-helper/CLAUDE.md` dev quirks: `refine().extend()` drops the refinement. Use the `.innerType().extend().superRefine()` pattern as in `requirements-table-base.ts`. The schema above is written as plain `.extend()` so it remains safely extensible; the dualism invariant is applied at registration:

```ts
// Applied at schema registration time, not in the base definition.
export const phase1FormTaxonomyWithDualism = phase1FormTaxonomySchema.superRefine((val, ctx) => {
  const hasPhysical = val.form_entities.some((e) => e.is_physical === true);
  if (!hasPhysical) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['form_entities'],
      message:
        'Crawley Box 4.7 Principle of Dualism: every built system must have at least one physical-form entity. Informational entities must be grounded in physical form.',
    });
  }
  // Level-0 singleton check
  const level0 = val.form_entities.filter((e) => e.decomposition_level === 0);
  if (level0.length !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['form_entities'],
      message: 'Exactly one Level-0 form_entity required (Crawley Box 4.1 — form is "a" system\'s embodiment).',
    });
  }
});
```

---

## NFREngineInterpreter boundary note

This phase produces **data consumed by** `NFREngineInterpreter` — NOT a standalone engine. When an NFR target (e.g., maintainability, latency) is resolved to a form-decomposition constraint, the interpreter reads:
- `form_entities[].decomposability` (preference: maintainability → modular)
- `formal_relationships[].kind` (coupling density across modules)

No code in this phase file is ever invoked independently of `NFREngineInterpreter`. The Zod schema is a data contract only.

---

## c1v applicability summary

| Methodology rule | Enforced by |
|---|---|
| Form is noun, function is verb | `formEntitySchema.name` regex `/^[A-Z]/` + curator reject-on-verb |
| Two levels down heuristic | Validator rule at Sub-phase A.3 (decompose Level-1 with multiple relationships) |
| Dualism (at least one physical entity) | `superRefine` dualism invariant above |
| Single Level-0 entity | `superRefine` Level-0 singleton check |
| Three-tier formal-relationship taxonomy | `formalRelationshipKindSchema` enum (8 flattened values) |
| Boundary-crossing → interface | Runtime validator: each cross-boundary formal_relationship emits interfaceRecord |

---

## Citations

- **Crawley, E., Cameron, B., & Selva, D. (2015).** *System Architecture: Strategy and Product Development for Complex Systems.* Pearson.
  - Box 4.1 — Definition: Form (book_md line 1412–1420)
  - Box 4.2 — Definition: Object (book_md line 1462, notes 1460/1468–1472)
  - Table 4.1 — Six Questions for Defining Form (book_md line 1401–1410)
  - Box 4.4 — Formal Relationships / Structure (book_md line 1611–1615)
  - Three-tier formal-relationship taxonomy (book_md line 1811–1814)
  - Spatial / Topological / Connectivity definitions (book_md lines 1629–1641, 1734–1754)
  - Box 4.6 — Design Structure Matrix (book_md line 1704–1707)
  - Whole Product System + Use Context (book_md line 1820–1864)
  - Box 4.7 — Principle of Dualism (book_md line 1888–1900)
  - Form in Software (book_md line 1866–1976)
  - Discrete / Modular / Integral taxonomy (Ch 2 book_md line 741–745, echoed in Ch 4)

- **Dori, D.** Object-Process Methodology (OPM). *(underlying notation cited by Crawley Ch 4)*

- **Cross-references to c1v schemas:**
  - `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` — phaseEnvelopeSchema, sourceRefSchema (consumed here via extend).
  - `apps/product-helper/.planning/phases/13-.../5-form-function-mapping/GLOSSARY-crawley.md` — glossary terms referenced.

**Ruling anchors:**
- Handoff §3 2026-04-21 ~14:30 — "Crawley math MUST slot into NFREngineInterpreter. Standalone `DecisionNetworkEngine` class is FORBIDDEN." Complied: no engine introduced; data contract only.
- Team-lead approval pending on phase-local enum pattern (`formalRelationshipKindSchema`) — introduced conservatively at module scope, NOT in `_shared.ts`.

