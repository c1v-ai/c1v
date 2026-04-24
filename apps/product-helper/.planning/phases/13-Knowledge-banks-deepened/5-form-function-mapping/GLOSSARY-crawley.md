---
name: GLOSSARY-crawley
module: M5 Form-Function Mapping (cross-cutting)
source_chapter: "Crawley, Cameron, Selva (2015), Ch 2 — System Thinking"
source_sections:
  - "§2.1–2.7 including Boxes 2.1–2.8 and Table 2.1"
page_range: "book_md lines 520–998"
zod_target_schema: "cross-cutting glossary — no new Zod primitives. Cross-references sourceLensSchema (kind:lens) + metadataHeaderSchema (for citation provenance) + sourceRefSchema (for also_appears_in)"
validation_needed: false
derivation_source: "Crawley Ch 2 (primary source)"
schema_version: "1.0.0"
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-21"
---

# Crawley Canonical Glossary — System Thinking (Ch 2)

> **Scope.** This glossary is the **cross-cutting term dictionary** for Crawley-derived terminology used throughout M5 (Form-Function Mapping) and referenced by supplements into M2/M3/M4. It supplies the instrument–process–operand vocabulary, Four Tasks of System Thinking, and the formal↔functional duality that every c1v schema downstream depends on.
>
> **Curation note.** Quotations are verbatim from the parsed book MD at `.../crawley-sys-arch-strat-prod-dev/System architecture strategy and product development for complex systems.md`. Line numbers in parentheses correspond to that file, NOT printed-book page numbers (book was ingested via docling, not OCR-paginated). The `Citations` block at EOF maps these to Ch/§/Box identifiers for cross-tool use.

---

## 1. System (Box 2.1 — line 520)

> "A system is a set of entities and their relationships, whose functionality is greater than the sum of the individual entities."

**Two defining parts (line 524–527):**
1. A system is made up of entities that interact or are interrelated.
2. When the entities interact, there appears a function that is greater than, or other than, the functions of the individual entities.

**c1v usage.** Every Module-0/Module-2 `system_scope_summary.json` instance MUST satisfy both clauses — artifact that names a single isolated entity with no interaction relationships is a validation failure at the M1→M2 boundary.

---

## 2. Architecture (line 539)

> "In its simplest form, architecture can be defined as 'an abstract description of the entities of a system and the relationships between those entities.'" *(citing Crawley et al., 2004 Engineering Systems Monograph)*

---

## 3. Form (Ch 4 anchor; defined here as glossary — line 619)

> "Form is what a system is; it is the physical or informational embodiment that exists or has the potential to exist. Form has shape, configuration, arrangement, or layout. Over some period of time, form is static and perseverant … Form is not function, but form is necessary to deliver function."

**c1v usage.** Drives the `m5.phase-1-form-taxonomy.v1` schema. See `01-Phase-1-Form-Taxonomy.md` for the full Zod shape.

---

## 4. Function (Ch 5 anchor; defined here as glossary — line 639)

> "Function is what a system does; it is the activities, operations, and transformations that cause, create, or contribute to performance. Function is the action for which a thing exists or is employed. Function is not form, but function requires an instrument of form. Emergence occurs in the functional domain."

---

## 5. Process + Operand (line 641)

> "Function consists of a process and an operand. The process is the part of function that is pure action or transformation, and thus it is the part that changes the state of the operand. The operand is the thing whose state is changed by that process. Function is inherently transient; it involves change in the state of the operand (creation, destruction, or alteration of some aspect of status of the operand)."

### Canonical triad (Instrument–Process–Operand, line 674–676)

> "In each of the four systems … one can always identify the canonical characteristics of the system: the instrument of form (something that is) and the function (what it does), which in turn is composed of a process (the transformation) and the operand (what is transformed)."

Parallel to Chomsky's deep structure: **noun (instrument) – verb (process) – noun (operand)**. Crawley asserts this is "either fundamental to all systems or fundamental to the way the human brain understands all systems." (line 676–680)

**c1v usage.** Enforces decomposition of function fields into `{process, operand}` pairs in `m5.phase-2-function-taxonomy.v1`. A record like `"process: log user in"` is invalid per this triad; must decompose to `process: "logging", operand: "user session"`.

---

## 6. Emergence (Box 2.2 — lines 552, 576–590)

> "Emergence refers to what appears, materializes, or surfaces when a system operates. Obtaining the desired emergence is why we build systems. Understanding emergence is the goal — and the art — of system thinking."

### Principle of Emergence (Box 2.2, line 576–590)

- Quotations on file: *"The whole is more than the sum of the parts."* (Aristotle, *Metaphysics*); *"A system is not the sum of its parts, but the product of the interactions of those parts."* (Russell Ackoff)
- Descriptive/prescriptive clauses:
  - The interaction of entities leads to emergence.
  - Change propagates in unpredictable ways as a consequence of emergence.
  - It is difficult to predict how a change in one entity will influence the emergent properties.
  - **System success** occurs when the anticipated properties emerge. **System failure** occurs when the anticipated emergent properties fail to appear or when unanticipated undesirable emergent properties appear.

### Table 2.1 — Types of emergent function (line 541–546)

| | Anticipated | Unanticipated |
|---|---|---|
| **Desirable** | Cars transport people; cars keep people warm/cool | Cars create a sense of personal freedom |
| **Undesirable** | Cars burn hydrocarbons | Cars can kill people |

**c1v usage.** The Success/Failure framing is the textual basis for M4 feasibility flags. The 2×2 is directly representable as a `z.enum(['desirable_anticipated','desirable_unanticipated','undesirable_anticipated','undesirable_unanticipated'])` on emergent-function records.

---

## 7. Value (Box 5.4 — line 2154; definition echoed here for cross-cutting use)

> "Value is benefit at cost. Benefit is synonymous with the worth, importance, or utility created by a system. An observer judges benefit subjectively. Cost is a measure of the contribution that must be made in exchange for the benefit."

---

## 8. Performance / 'ilities' (lines 558, 570)

- **Performance** — "how well a system operates or executes its function(s). It is an attribute of the function of the system."
- **'ilities'** — reliability, maintainability, operability, safety, robustness. "In contrast with functional and performance emergence, which tend to create value immediately, the emergent value created by these 'ilities' tends to emerge over the lifecycle of the system."

**c1v usage.** Maps to `sourceLensSchema` with `kind: "category"` enum members {performance, reliability, scalability, maintainability, security, usability, compliance, cost, portability, testability, observability} in `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts`.

---

## 9. Entity / Element (line 712–713)

> "We will sometimes use the word 'element' (whose synonyms include 'part' and 'piece') when we want to emphasize some aspect of the form of the system. The word 'entity' (whose synonyms include 'unit' and 'thing') tends to more generically evoke both form and function."

---

## 10. Zooming / Aggregation / Decomposition (line 715–719)

- **Decomposition** (right→left in Table 2.3): breaking a system into smaller pieces of form.
- **Aggregation** (left→right): collecting pieces into the form of the system.
- **Zooming**: breaking function into constituents.

> "All systems are composed of entities that are also systems, and all systems are entities of larger systems." (line 725)

---

## 11. Holism (Box 2.5 — line 753–768)

> "Holism holds that all things exist and act as wholes, not just as the sum of their parts. Its sense is the opposite of that of reductionism, which suggests that things can be understood by carefully explaining their parts."

- Eliel Saarinen: "Always design a thing by considering it in its next larger context."
- John Donne: "No man is an island."

---

## 12. Focus (Box 2.6 — line 799–815)

> "At any given time, there are tens or even hundreds of issues identified by holistic thinking that could impact the system under consideration. … To sustain close consideration of the important issues at any moment, one must be prepared to leave others behind. Failure rarely occurs in aspects on which you focus."

**Miller's limit (line 818):** "This manageable number is conventionally thought of as seven +/- two."

**c1v usage.** Documented rationale for capping M4 decision-matrix option sets at ≤ 7 without invoking Miller directly — cite this line instead.

---

## 13. Abstraction (line 828, 836–841)

> "An abstraction is defined as 'expression of quality apart from the object' or as a representation 'having only the intrinsic nature rather than the detail.'"

**Guidelines (line 838–841):**
- Put important information on the surface; conceal the rest.
- Allow representation of appropriate relationships.
- Use the right level of decomposition/aggregation.
- Use the minimum number of abstractions that effectively represent the aspects at hand.

---

## 14. Boundary / Context (line 853–868)

- **Boundary** — separates what is in "the system" from what is outside.
- **Context** — "what surrounds the system … the entities that are 'just on the outside of the system' but are relevant to it."
- **External interface** — a relationship that crosses the boundary.

**Criteria for drawing the boundary (line 860–866):**
1. Entities to be analyzed
2. What is necessary to create the design
3. What we are responsible for implementing and operating
4. Formal legal/contractual boundaries
5. Traditions/conventions
6. Interface definitions or standards

---

## 15. Formal vs Functional Relationships (line 892–898)

- **Functional relationship (interaction)** — "relationships between entities that do something; they involve operations, transfers, or exchanges of something between the entities … we sometimes call functional relationships *interactions* to emphasize their dynamic nature."
- **Formal relationship (structure)** — "relationships among the entities that exist or could exist stably for some period of time … we sometimes call formal relationships *structure* to emphasize their static nature."
- **Duality principle:** "A functional relationship usually requires a formal relationship. The formal relationship is the instrument of the functional relationship."

**c1v usage.** Validator rule: every flow arrow (functional) in an M3 FFBD presumes an underlying structural connection (formal). Flag functional interaction without corresponding formal relationship as incomplete.

---

## 16. Four Tasks of System Thinking (Boxes 2.3, 2.4, 2.7, 2.8 — lines 645, 690, 916, 988)

1. **Task 1 (Box 2.3 — line 645):** Identify the system, its form, and its function.
2. **Task 2 (Box 2.4 — line 690):** Identify the entities of the system, their form and function, and the system boundary and context.
3. **Task 3 (Box 2.7 — line 916):** Identify the relationships among the entities in the system and at the boundary, as well as their form and function.
4. **Task 4 (Box 2.8 — line 988):** Based on the function of the entities, and their functional interactions, identify the emergent properties of the system.

**c1v usage.** The Four Tasks map 1:1 to M1–M5 module outputs:
- Task 1 → M1 `system_scope_summary.v1`
- Task 2 → M1 Phase-3 `scope-tree.v1` + M5 phase-1 form taxonomy
- Task 3 → M3 FFBD (functional) + M5 phase-1 formal_relationships (formal)
- Task 4 → M4 decision network + M5 emergence predictions

---

## 17. Predicting Emergence — three methods (line 994–998)

1. **Precedent** — look for identical or similar solutions in past experience.
2. **Experiment** — build/prototype to observe emergent behavior.
3. **Modeling** — model the function of entities + functional interactions and compute emergence.

> "What do you do if you need to predict emergence for systems that are without precedent, cannot be experimented on, and cannot be reliably modeled? … we are left to reason about what will emerge." (line 998)

**c1v usage.** KB-8 Public Stacks Atlas supplies the **precedent** track. NFREngineInterpreter supplies the **modeling** track. No c1v track for Experiment (out of scope for system-design phase).

---

## 18. Goods / Services framing (line 670)

> "Goods are products that are tangible (what we would call form). Services are products that are less tangible and more process-oriented (what we would call function)."

---

## 19. Modular / Integral decomposition (line 741–745)

- **Discrete** — obvious decomposition (fleet of ships, herd of horses).
- **Modular** — modules relatively independent in function; dense internal relationships, weak inter-module relationships.
- **Integral** — "cannot be easily divided with their function intact … highly interconnected systems."

**c1v usage.** Represented as `z.enum(['discrete','modular','integral'])` on form entities in `m5.phase-1-form-taxonomy.v1`. See `01-Phase-1-Form-Taxonomy.md`.

---

## 20. OPM arrow vocabulary — `consume` ≡ `destroy` (canonicalization note)

Crawley Ch 5 uses two different terms for the **same** OPM arrow semantics (process eliminates an operand):

- **"Consume"** — appears in **prose** at book_md line 2073 describing the operand → process single-headed arrow: *"Process consumes the operand (factory consumes parts; lungs consume oxygen). Operand ceases to exist in original form."*
- **"Destroy" / `d`** — appears in the **PO-array cell notation** at Box 5.7 book_md line 2333 (cell values `c`/`a`/`d`/`I`) and in Box 5.3 line 2047 prose describing the process effect: *"Processes generally involve creation of, destruction of, or a change in an operand."*

Both refer to identical OPM link semantics. The difference is textual, not conceptual.

### c1v canonicalization

- **Canonical term:** `destroy` (matches the PO-cell `d` notation; matches Box 5.3 "destruction").
- **Deprecated synonym:** `consume` — NOT a member of `functionalInteractionKindSchema` or `poArrayCellSchema` in any c1v schema. Use `destroy` everywhere.
- **Validator rule for downstream agents:** any emitted `consume` value in a functional_interaction record MUST be rewritten to `destroy` before writing the artifact. If the agent cannot determine which sense was meant (prose vs cell), fail closed and ask.

### Mapping table (for prompt-writer rubrics + LLM prompts)

| Crawley prose term | Crawley PO-cell notation | c1v canonical value |
|---|---|---|
| "consume" (line 2073) | `d` (Box 5.7 line 2333) | `destroy` |
| "destruction" (Box 5.3 line 2047) | `d` (Box 5.7 line 2333) | `destroy` |
| "creation" (Box 5.3 line 2047) | `c` / `c'` (Box 5.7 line 2333) | `create` |
| "change / modify" (Box 5.3 line 2047) | `a` (Box 5.7 line 2333) | `affect` |
| "instrumental" (Box 4.1 line 1412; Ch 5 line 2073–2089) | `I` (Box 5.7 line 2333) | `instrument` |

**c1v usage.** Enforced by `functionalInteractionKindSchema ∈ {create, destroy, affect, instrument}` in `m5.phase-2-function-taxonomy.v1`. See `02-Phase-2-Function-Taxonomy.md` §Knowledge "OPM operand–process arrow conventions" and the Zod block.

---

## Cross-references (sourceRefSchema usage)

Downstream Zod schemas referencing this glossary should use:

```ts
import { sourceRefSchema } from '@/lib/langchain/schemas/module-2/_shared';

// Example field on an M5 form entity schema
crawley_glossary_ref: sourceRefSchema
  .extend({
    phase: z.literal('glossary-crawley'),
    artifact: z.enum([
      'system', 'architecture', 'form', 'function', 'process', 'operand',
      'emergence', 'value', 'performance', 'ilities', 'boundary', 'context',
      'formal_relationship', 'functional_relationship', 'four_tasks',
      'modular_integral', 'opm_arrow_vocabulary'
    ]),
  })
  .describe('x-ui-surface=internal:provenance — pointer back to the glossary term this field is grounded in.');
```

**No new Zod primitives introduced** — this file is pure glossary, consumed by other M5 files via cross-reference.

---

## c1v applicability summary

| Term | Referenced by c1v schema | Enforcement rule |
|---|---|---|
| Canonical triad (instrument–process–operand) | `m5.phase-2-function-taxonomy.v1` | Function record must decompose to `{process, operand}` pair |
| Formal↔Functional duality | `m5.phase-1-form-taxonomy.v1` + M3 FFBD | Every functional interaction implies a formal relationship |
| System success/failure framing | M4 feasibility flags | Emergent-function records carry 2×2 anticipated/desirable classification |
| Miller's 7±2 | M4 decision-matrix option cap | Cited as rationale for `.max(7)` on option arrays |
| Modular/Integral taxonomy | `m5.phase-1-form-taxonomy.v1` | `z.enum(['discrete','modular','integral'])` on form entities |
| Four Tasks of System Thinking | Module 1–5 output ordering | Runtime orchestrator emits outputs in Task-1–4 order |
| OPM arrow vocabulary (consume ≡ destroy) | `m5.phase-2-function-taxonomy.v1` | `functionalInteractionKindSchema ∈ {create, destroy, affect, instrument}`; "consume" rewritten to "destroy" at write time |

---

## Citations

All line numbers reference the parsed book MD at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/crawley-sys-arch-strat-prod-dev/System architecture strategy and product development for complex systems.md`.

- **Crawley, E., Cameron, B., & Selva, D. (2015).** *System Architecture: Strategy and Product Development for Complex Systems.* Pearson. Ch 2 §2.1–2.7.
  - Box 2.1 — Definition: System (line 520–527)
  - Box 2.2 — Principle of Emergence (line 576–590)
  - Box 2.3 — Methods: Task 1 of System Thinking (line 645)
  - Box 2.4 — Methods: Task 2 of System Thinking (line 690)
  - Box 2.5 — Principle of Holism (line 753–768)
  - Box 2.6 — Principle of Focus (line 799–815)
  - Box 2.7 — Methods: Task 3 of System Thinking (line 916)
  - Box 2.8 — Methods: Task 4 of System Thinking (line 988)
  - Table 2.1 — Types of emergent function (line 541–546)

- **Crawley, E., Cameron, B., & Selva, D. (2015).** *System Architecture.* Ch 5 §5.1–5.5 — cited for §20 OPM arrow vocabulary canonicalization.
  - Box 5.2 — Operand "created, modified, or consumed" (line 2037–2041)
  - Box 5.3 — Process "creation of, destruction of, or a change in an operand" (line 2047–2049)
  - OPM arrow prose using "consume" (line 2073–2089)
  - Box 5.7 — PO array cell notation `c`/`a`/`d`/`I` (line 2333–2341)

- **Crawley, E. F., et al. (2004).** Engineering Systems Monograph. *(cited inline at Ch 2 line 539 for the definition of architecture)*

- **Aristotle.** *Metaphysics.* *(cited Box 2.2 line 576)*

- **Ackoff, R.** *(cited Box 2.2 line 585)*

- **Miller, G. A. (1956).** The Magical Number Seven, Plus or Minus Two. *(cited by Crawley at line 818 as precedent for 7±2)*

- **Saarinen, E.** *(cited Box 2.5 line 755)*

- **Donne, J.** *(cited Box 2.5 line 760)*

- **Chomsky, N.** *Deep structure parallel (cited inline at line 676)*

**Source ingest:** docling-parse via `apps/product-helper/.planning/phases/13-.../crawley-sys-arch-strat-prod-dev/`. MD at 10,051 lines, 604 headings.

**Ruling anchor:** handoff §3 locked decision 2026-04-21 ~13:00 — "Docling-parse Crawley Ch14/15/16 + 12 ESD.34 lectures. Book is ALREADY parsed as MD. T1 team extracts, does not parse."
