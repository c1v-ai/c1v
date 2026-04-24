---
name: Crawley Ch 11 — Needs-to-Goals (M2 requirements supplement)
module: M2 Dev System Requirements (Crawley supplement)
supplement_for_module: "M2 requirements phase (extends phase-6-requirements-table)"
host_folder: "2-dev-sys-reqs-for-kb-llm-software/"
phase_number: null
phase_slug: "needs-to-goals"
schema_version: "1.0.0"
zod_schema_id: "m2.requirements-crawley-extension.v1"
zod_target_path: "apps/product-helper/lib/langchain/schemas/module-2/requirements-crawley-extension.ts"
source_chapter: "Crawley, Cameron, Selva (2015), Ch 11 — Translating Needs into Goals"
source_sections:
  - "§11.1 Box 11.1 Principle of the Beginning"
  - "§11.2 Beneficiaries vs Stakeholders + 3 cross-categories + operator distinction"
  - "§11.2 Box 11.2 Definition of Needs + Latent needs"
  - "§11.3 Six dimensions of stakeholder needs"
  - "§11.3 Kano analysis (Must/Should/Might have)"
  - "§11.3 Stakeholder system: value flows + value loops + indirect transactions"
  - "§11.4 Box 11.3 Principle of Balance"
  - "§11.4 Box 11.4 Definition of Goals (Goals ≠ Requirements ≠ Needs)"
  - "§11.4 Five Criteria for Goals"
  - "§11.4 Problem-statement crafting (F-16 example — over-specification warning)"
page_range: "book_md lines 4770–5195"
validation_needed: false
derivation_source: "Crawley Ch 11 (primary source). stakeholderCategorySchema + kanoCategorySchema + flowKindSchema + goalCriteriaKeySchema are phase-local Zod enums introduced here."
nfr_engine_slot: "NFREngineInterpreter reads stakeholders + needs + goals when resolving any NFR that depends on beneficiary identity, Kano prioritization, or value-flow structure. Feeds the M5 solution-neutral phase-4 via the prioritized need's operand + attribute + process."
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-22"
---

# Crawley Ch 11 — Needs-to-Goals

> **Host folder.** Housed in `2-dev-sys-reqs-for-kb-llm-software/` per team-lead ruling (M2/M3 Crawley content → supplement existing folders). Attribution via `crawley-*` filename prefix + Citations block at EOF.
>
> **Scope.** Supplements the shipped M2 requirements module (`module-2/phase-6-requirements-table.ts`) with Crawley's **beneficiary vs stakeholder** distinction, Kano analysis, 6 dimensions of needs, value-loop analysis, and the **5 criteria for goals**. Crawley explicitly **rejects the term "requirements"** in favor of "goals" with a `tradable` field — this supplement honors that framing while remaining schema-compatible with the existing M2 module.
>
> **Critical framing (Box 11.4 line 5139):** "Needs exist in the mind and heart of the stakeholders, but goals are defined by the producing enterprise with the intent of meeting them." c1v enforces: needs ≠ goals ≠ requirements. Three distinct record types with explicit links.
>
> **Curation note.** Quotations are verbatim from the parsed book MD. See `Citations` block at EOF.

---

## Knowledge

### §11.2 — Beneficiaries vs Stakeholders (line 4770–4788)

Crawley explicitly separates two concepts often conflated:

- **Beneficiary** — "those who benefit from your actions. Your architecture produces an outcome or output that addresses their needs. You are important to them. … It is beneficiaries whom we must examine in order to list the needs of the system."
- **Stakeholder** — "those who have a stake in your product or enterprise. They have an outcome or output that addresses your needs. They are important to you."

**Three cross-categories:**
- **Beneficial stakeholders** — overlap: receive valued outputs from us AND provide valued inputs to us.
- **Charitable beneficiaries** — beneficiaries who are not stakeholders (no return to the firm).
- **Problem stakeholders** — stakeholders who are not beneficiaries (you need something from them; they need nothing you can provide).

**Operator** is distinct from beneficiary and stakeholder: e.g., taxi — driver = operator, passenger = primary beneficiary, firm = primary stakeholder.

### Two identification questions (line 4790)

- **Stakeholders:** "Who provides inputs that are required to make this project successful?"
- **Beneficiaries:** "Who benefits from the outputs of this project?"

### Box 11.1 — Principle of the Beginning (line 4806–4820)

> "The list of stakeholders (internal and external to the enterprise) that are included in the early stages of product definition will have an outsized impact on the architecture. Be very careful about who is involved at the beginning and how they shape the architecture."

### Setting analysis bounds (line 4798–4804)

Two critical parameters:
1. **Bounds** — how far from the system/enterprise does analysis extend?
2. **Granularity** — abstractions for stakeholders (individual supplier vs "Suppliers" abstraction).

**Test for architectural impact (line 4804):** "whether the choice among architectures under consideration could be important to the stakeholder or beneficiary. If all architectures will deliver the same benefit to them, they will still need to be managed as stakeholders, but they may not merit consideration in making the architectural decisions."

### Box 11.2 — Definition of Needs (line 4841–4851)

A need may be defined as:
- A necessity.
- An overall desire or want.
- A wish for something that is lacking.

> "Needs exist in the mind (or heart) of the beneficiary, and they are often expressed in fuzzy or general (ambiguous) terms. Needs can be unexpressed or even unrecognized by the beneficiary. Needs are primarily outside of the producing enterprise; they are owned by a beneficiary. Needs are a product/system attribute. They are interpreted (in part) by the architect."

### Latent needs (line 4875–4886)

> "Latent needs — those needs that are not yet served by current products. This is a challenge in synthesis of architectures."

**Methods:** Dichter's 1950s in-depth consumer interviews; IDEO's **empathic design** (observe users in context). No systematic procedure — "a procedure that identified needs with accuracy through analysis would contravene the idea of latency."

**Warnings (line 4885):**
- Edison 1922: "The radio craze will die out in time."
- Olson 1977: "There is no reason anyone would want a computer in their home."

### §11.3 — Six Dimensions of Needs (line 4964–4972)

1. **Benefit intensity** — how much utility/worth/benefit fulfillment brings.
2. **Detriment** — adverse reaction if unmet.
3. **Urgency** — how quickly it must be fulfilled.
4. **Awareness** — how aware stakeholders are of the need.
5. **Coupling** — degree to which fulfilling one need relieves or intensifies another.
6. **Supply availability** — whether other suppliers could fulfill it.

### Kano Analysis (line 4975–4992)

Three categories (per Kano):
- **Must have** — "Its presence is absolutely essential, and I would regret its absence." (e.g., braking)
- **Should have** — "I would be satisfied by its presence, and I would regret its absence." (e.g., fuel efficiency)
- **Might have** — "I would be satisfied by its presence, but I would not regret its absence." (e.g., self-parking — may migrate to 'Must' over time.)

**Pair-wise comparison alternatives:** Conjoint analysis; Analytic Hierarchy Process (AHP).

### Stakeholder System + Value Flows (line 4993–5040)

**Principle:** Stakeholder relationships = exchanges. The set of exchanges forms a **system**. Three-step construction:

1. "Who could satisfy the needs of each stakeholder?" → maps suppliers.
2. "What are the outputs of the project, and to whom are they provided?" → maps customers.
3. Pairwise: "are there relevant transactions that play out between them?" → closes loops.

**Value flow (line 5011):**
> "A unidirectional connection of an output to an input in the model … the provision of value from one stakeholder to another. An individual value flow is unidirectional and does not necessarily imply a return transaction."

**Value loop (line 5029):**
> "A series of value flows that return to the starting stakeholder … Value loops are at the heart of this system in that they illustrate which stakeholder needs are satisfied by strong feedback loops, and which needs are not well satisfied."

**Indirect transactions (line 5070–5095):** trace backwards from the firm's important inputs → to stakeholders providing them → to outputs the firm gives those stakeholders. Cameron's metric: "multiply the importance of the needs on each of the links in a value loop together, to produce a metric by which we compare all value loops."

### Box 11.3 — Principle of Balance (line 5121–5133)

Quotations: Obi-Wan Kenobi ("Bring balance to the Force"); Eberhardt Rechtin ("No complex system can be optimized to all parties concerned.")

> "Many factors influence and act on the conception, design, implementation, and operation of a system. One must find a balance among the factors that satisfies the most important stakeholders. … The system must be balanced as a whole, and not just the sum of balanced elements. In particular, an architect is always balancing optimality with flexibility."

### Box 11.4 — Definition of Goals (line 5143–5154)

> "Goals are defined as:
> - What is planned to be accomplished.
> - What the producing enterprise hopes to achieve.
>
> Goals are a product/system attribute."

**Critical distinction (line 5139):**
> "Needs exist in the mind and heart of the stakeholders, but goals are defined by the producing enterprise with the intent of meeting them. … Goals are under the control of the producing enterprise."

Crawley explicitly **avoids the term "requirements"** (line 5146):
> "Many engineering organizations do not use the prioritization 'shall, should' for goals, and, further, do not view requirements as tradable. System architecture fundamentally represents tradeoffs among competing objectives."

### Five Criteria for Goals (line 5162–5172)

1. **Representative** — "Goals are representative of stakeholder needs, so that a system that meets the goals will in turn meet those needs."
2. **Complete** — "Satisfying all the goals will satisfy all prioritized stakeholder needs."
3. **Humanly Solvable** — "Goals are comprehensible and enhance the problem solver's ability to find a solution."
4. **Consistent** — "Goals do not conflict with each other."
5. **Attainable** — "Goals can be accomplished with the available resources."

**Mapping to INCOSE's 8 criteria (line 5174):**
- Crawley "Representative" = INCOSE Necessary + Traceable + Verifiable.
- Crawley "Humanly Solvable" = INCOSE Implementation-independent + Clear-and-Concise.
- Rest equivalent.

### Problem Statement Crafting (line 5178–5195)

Four principles for "humanly solvable" problem statements:
1. **Clear and minimalist** — additional info is hard to eliminate.
2. **Watch for omitted information** — information not contained "may be ignored or, worse, used to reason about priorities."
3. **Solution-neutral** — cross-reference Box 7.1.
4. **Herb Simon's caution** — "Problems are more complex than our brains can handle, so we oversimplify."

**F-16 example (line 5190):** Original problem statement was "build a Mach2+ fighter" — but underlying need was "exit a dogfight quickly." Better: "build a Mach1.4 fighter with a high thrust-to-weight ratio." The original overcommitted to a specific metric — over-specification warning.

---

## Input Required

- M1 `system_scope_summary.v1` for baseline stakeholder + beneficiary lists.
- M5 Phase-4 `solution_neutral_function` (bi-directional: feeds into and is fed by this phase).

---

## Instructions for the LLM

### Sub-phase A: Beneficiary + Stakeholder enumeration

Emit separate `beneficiaries[]` and `stakeholders[]` arrays:
```
beneficiaries: Array<{
  id: string,
  name: string,
  is_operator: boolean,
  charitable_only: boolean,                     // true = no return to firm
  needs: string[],                               // need_ids
}>

stakeholders: Array<{
  id: string,
  name: string,
  category: stakeholderCategorySchema,          // beneficial_stakeholder | charitable_beneficiary | problem_stakeholder | operator
  inputs_needed: string[],
  outputs_provided: string[],
  needs: string[],                               // need_ids (some may overlap with beneficiary needs if beneficial_stakeholder)
}>
```

### Sub-phase B: Need enumeration

For each identified need emit:
```
needs: Array<{
  need_id: string,
  description: string,
  owner_beneficiary_id: string,
  solution_neutral_operand: string,             // feeds M5 Phase-4
  benefit_related_attribute: string,
  solution_neutral_process: string,
  kano_category: kanoCategorySchema,            // must_have | should_have | might_have
  dimensions: {
    benefit_intensity: number (0-1),
    detriment: number (0-1),
    urgency: number (0-1),
    awareness: number (0-1),
    coupling: number (0-1),
    supply_availability: number (0-1),
  },
  is_latent: boolean,                            // Crawley §11.2.latent_needs flag
  precedent_source: string | null,              // if non-latent: known-product reference
}>
```

### Sub-phase C: Value flow + value loop

For each pairwise stakeholder relationship emit a `value_flow`:
```
value_flows: Array<{
  flow_id: string,
  from_stakeholder_id: string,
  to_stakeholder_id: string,
  flow_kind: flowKindSchema,                    // money | goods | service | information | regulatory | social
  solution_neutral_description: string,
  weight: number (0-1),                          // importance per Cameron's multiplication metric
}>
```

Then emit computed `value_loops`:
```
value_loops: Array<{
  loop_id: string,
  path: string[],                                // stakeholder_ids in order
  flow_ids: string[],                            // traversed value_flows in order
  total_weight: number,                          // product of flow weights (Cameron's metric line 5083)
  closes_at_stakeholder_id: string,              // must equal path[0]
}>
```

### Sub-phase D: Goal enumeration

For each prioritized need, emit a goal:
```
goals: Array<{
  goal_id: string,
  description: string,
  source_need_ids: string[],                    // traceability
  tradable: boolean,                             // default true per Crawley §11.4
  priority: number (integer, 1 = highest),
  criteria: {
    representative: boolean,                     // maps to ≥1 need
    complete: boolean,                           // all prioritized needs covered by some goal
    humanly_solvable: boolean,
    consistent: boolean,                         // no conflicts with other goals
    attainable: boolean,                         // resources available
  },
  overspecification_check: {
    numeric_value_is_need_grounded: boolean,   // F-16 check — numeric goals must tie to a need
    need_grounded_note: string,
  },
}>
```

### Sub-phase E: Problem statement

Emit one `problem_statement`:
```
problem_statement: {
  statement: string,
  is_solution_neutral: boolean,                  // xref Box 7.1
  overspecification_warnings: string[],
  f_16_check_passed: boolean,                    // no numeric goals without need-grounding
}
```

### STOP GAP — Goals completeness + tradability

Before marking `_phase_status: "complete"`:

1. **5 criteria all true** on every goal.
2. **Traceability:** every goal's `source_need_ids.length >= 1`.
3. **Completeness coverage:** every need with `kano_category === 'must_have'` has at least one goal referencing it.
4. **Value-loop check:** every stakeholder appearing in the stakeholder list participates in at least one value_flow (otherwise they're dangling and should be removed OR flagged as pre-operational — e.g., regulatory that acts only post-shipment).
5. **Box 11.3 balance advisory:** if `goals.length > 7` AND > 30% of goals have `consistent: false`, emit an advisory pointing at the Principle of Balance — "optimality vs flexibility requires fewer, broader goals."

---

## Zod Schema

```ts
// apps/product-helper/lib/langchain/schemas/module-2/requirements-crawley-extension.ts

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
} from '@/lib/langchain/schemas/module-2/_shared';

// Phase-local — Crawley §11.2 stakeholder cross-category taxonomy.
export const stakeholderCategorySchema = z
  .enum([
    'beneficial_stakeholder',
    'charitable_beneficiary',
    'problem_stakeholder',
    'operator',
  ])
  .describe(
    'x-ui-surface=section:Requirements > Stakeholders — Crawley §11.2 cross-categories.',
  );
export type StakeholderCategory = z.infer<typeof stakeholderCategorySchema>;

// Phase-local — Kano categorization.
export const kanoCategorySchema = z
  .enum(['must_have', 'should_have', 'might_have'])
  .describe(
    'x-ui-surface=section:Requirements > Needs — Kano analysis (Crawley §11.3 line 4975).',
  );

// Phase-local — value flow kinds (Crawley §11.3 examples).
export const flowKindSchema = z
  .enum(['money', 'goods', 'service', 'information', 'regulatory', 'social'])
  .describe(
    'x-ui-surface=section:Requirements > Value Flows — Crawley §11.3 stakeholder-exchange kinds.',
  );

// Phase-local — Crawley Box 11.4 five goal criteria.
export const goalCriteriaKeySchema = z
  .enum([
    'representative',
    'complete',
    'humanly_solvable',
    'consistent',
    'attainable',
  ])
  .describe(
    'x-ui-surface=section:Requirements > Goals — Crawley §11.4 five criteria for goals.',
  );

export const needDimensionsSchema = z.object({
  benefit_intensity: z.number().min(0).max(1),
  detriment: z.number().min(0).max(1),
  urgency: z.number().min(0).max(1),
  awareness: z.number().min(0).max(1),
  coupling: z.number().min(0).max(1),
  supply_availability: z.number().min(0).max(1),
});

export const needSchema = z
  .object({
    need_id: z.string(),
    description: z.string(),
    owner_beneficiary_id: z.string(),
    solution_neutral_operand: z.string(),
    benefit_related_attribute: z.string(),
    solution_neutral_process: z.string(),
    kano_category: kanoCategorySchema,
    dimensions: needDimensionsSchema,
    is_latent: z.boolean().default(false),
    precedent_source: z.string().nullable(),
  })
  .describe(
    'x-ui-surface=section:Requirements > Needs — one Crawley Box 11.2 need with Kano + 6 dimensions + SN operand triad.',
  );

export const beneficiarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    is_operator: z.boolean().default(false),
    charitable_only: z.boolean().default(false),
    need_ids: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Requirements > Beneficiaries — Crawley §11.2 beneficiary (may also be a stakeholder).',
  );

export const stakeholderSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    category: stakeholderCategorySchema,
    inputs_needed: z.array(z.string()).default([]),
    outputs_provided: z.array(z.string()).default([]),
    need_ids: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Requirements > Stakeholders — Crawley §11.2 stakeholder with cross-category.',
  );

export const valueFlowSchema = z
  .object({
    flow_id: z.string(),
    from_stakeholder_id: z.string(),
    to_stakeholder_id: z.string(),
    flow_kind: flowKindSchema,
    solution_neutral_description: z.string(),
    weight: z.number().min(0).max(1),
  })
  .describe(
    'x-ui-surface=section:Requirements > Value Flows — one unidirectional value flow (Crawley line 5011).',
  );

export const valueLoopSchema = z
  .object({
    loop_id: z.string(),
    path: z.array(z.string()).min(2).describe(
      'x-ui-surface=section:Requirements > Value Loops — stakeholder_ids in order.',
    ),
    flow_ids: z.array(z.string()).min(2),
    total_weight: z.number().min(0).max(1).describe(
      'x-ui-surface=section:Requirements > Value Loops — Cameron metric: product of flow weights (line 5083).',
    ),
    closes_at_stakeholder_id: z.string(),
  })
  .describe(
    'x-ui-surface=section:Requirements > Value Loops — Crawley line 5029 closed value loop.',
  );

export const overspecificationCheckSchema = z.object({
  numeric_value_is_need_grounded: z.boolean(),
  need_grounded_note: z.string(),
});

export const goalSchema = z
  .object({
    goal_id: z.string(),
    description: z.string(),
    source_need_ids: z.array(z.string()).min(1).describe(
      'x-ui-surface=section:Requirements > Goals — traceability to need(s) this goal addresses.',
    ),
    tradable: z.boolean().default(true).describe(
      'x-ui-surface=section:Requirements > Goals — Crawley §11.4: goals are tradable (unlike "requirements").',
    ),
    priority: z.number().int().min(1),
    criteria: z
      .object({
        representative: z.boolean(),
        complete: z.boolean(),
        humanly_solvable: z.boolean(),
        consistent: z.boolean(),
        attainable: z.boolean(),
      })
      .describe(
        'x-ui-surface=section:Requirements > Goals — Crawley §11.4 five criteria; all must be true on complete.',
      ),
    overspecification_check: overspecificationCheckSchema,
  })
  .describe(
    'x-ui-surface=section:Requirements > Goals — one Crawley Box 11.4 goal with 5-criteria gate.',
  );

export const problemStatementSchema = z
  .object({
    statement: z.string(),
    is_solution_neutral: z.boolean(),
    overspecification_warnings: z.array(z.string()).default([]),
    f_16_check_passed: z.boolean().describe(
      'x-ui-surface=section:Requirements > Problem Statement — Crawley line 5190 F-16 example: no numeric goal without need-grounding.',
    ),
  })
  .describe(
    'x-ui-surface=section:Requirements > Problem Statement — Crawley §11.4 "humanly solvable" problem statement.',
  );

export const requirementsCrawleyExtensionSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-2.requirements-crawley-extension.v1'),
    beneficiaries: z.array(beneficiarySchema).min(1),
    stakeholders: z.array(stakeholderSchema).default([]),
    needs: z.array(needSchema).min(1),
    value_flows: z.array(valueFlowSchema).default([]),
    value_loops: z.array(valueLoopSchema).default([]),
    goals: z.array(goalSchema).min(1),
    problem_statement: problemStatementSchema,
    crawley_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M2 Requirements Crawley Extension (Ch 11).',
  );

export type RequirementsCrawleyExtension = z.infer<typeof requirementsCrawleyExtensionSchema>;
```

### Refinement — Goal criteria + traceability + coverage

```ts
export const requirementsCrawleyExtensionWithInvariants =
  requirementsCrawleyExtensionSchema.superRefine((val, ctx) => {
    if (val._phase_status === 'complete') {
      // 1. 5 criteria all true on every goal.
      for (const goal of val.goals) {
        const failed: string[] = [];
        if (!goal.criteria.representative) failed.push('representative');
        if (!goal.criteria.complete) failed.push('complete');
        if (!goal.criteria.humanly_solvable) failed.push('humanly_solvable');
        if (!goal.criteria.consistent) failed.push('consistent');
        if (!goal.criteria.attainable) failed.push('attainable');
        if (failed.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['goals'],
            message: `Crawley §11.4 Five Criteria: goal "${goal.description}" failed criteria [${failed.join(', ')}]. Cannot mark _phase_status "complete".`,
          });
        }
      }

      // 2. Must-have coverage: every must-have need has at least one goal referencing it.
      const mustHaveNeedIds = new Set(
        val.needs.filter((n) => n.kano_category === 'must_have').map((n) => n.need_id),
      );
      const referencedNeedIds = new Set(
        val.goals.flatMap((g) => g.source_need_ids),
      );
      for (const mhId of mustHaveNeedIds) {
        if (!referencedNeedIds.has(mhId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['goals'],
            message: `Kano must-have coverage violated: need "${mhId}" is must_have but no goal references it.`,
          });
        }
      }

      // 3. F-16 overspecification check.
      for (const goal of val.goals) {
        if (
          /\d+(?:\.\d+)?/.test(goal.description) &&
          !goal.overspecification_check.numeric_value_is_need_grounded
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['goals'],
            message: `Crawley line 5190 F-16 warning: goal "${goal.description}" contains a numeric value but is not grounded in a specific need. Re-examine (original "build a Mach2+ fighter" → corrected "build a Mach1.4 fighter with thrust-to-weight ratio").`,
          });
        }
      }

      // 4. Box 11.3 balance advisory.
      const inconsistentCount = val.goals.filter((g) => !g.criteria.consistent).length;
      if (val.goals.length > 7 && inconsistentCount / val.goals.length > 0.3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['goals'],
          message: `Crawley Box 11.3 Principle of Balance: ${val.goals.length} goals with ${inconsistentCount} inconsistent (>30%). Consider consolidating to fewer, broader goals.`,
        });
      }
    }

    // 5. Value-loop closure (always, not just on complete).
    for (const loop of val.value_loops) {
      if (loop.path[0] !== loop.closes_at_stakeholder_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value_loops'],
          message: `Value loop "${loop.loop_id}" does not close: path[0]="${loop.path[0]}" but closes_at_stakeholder_id="${loop.closes_at_stakeholder_id}".`,
        });
      }
    }
  });
```

---

## NFREngineInterpreter boundary note

Consumes `beneficiaries` + `stakeholders` + `needs` + `goals` + `value_loops` when:
- Resolving any NFR that depends on Kano prioritization (e.g., "must-have latency < 100ms").
- Scoring tradespace architectures against goal-criteria-weighted objectives.
- Feeding M5 Phase-4's `solution_neutral_function` via prioritized-need operand + attribute + process.

No `StakeholderEngine` / `GoalEngine` introduced. Data contract only.

---

## c1v applicability summary

| Methodology rule | Enforced by |
|---|---|
| Beneficiary ≠ Stakeholder | Separate `beneficiaries[]` and `stakeholders[]` arrays |
| 3 stakeholder cross-categories + operator | `stakeholderCategorySchema` enum |
| Kano classification | `kanoCategorySchema` enum |
| 6 dimensions of needs | `needDimensionsSchema` record |
| Value flows + value loops | Separate schemas with Cameron's multiplicative weight metric |
| Box 11.4 — Goals ≠ Requirements | `tradable: boolean` default true; term "requirements" avoided in field names |
| 5 goal criteria | `goalCriteriaKeySchema` + `.superRefine()` all-true gate |
| F-16 overspecification warning | `.superRefine()` numeric-regex + grounding check |
| Box 11.3 Balance advisory | `.superRefine()` goal-count + consistency advisory |
| Must-have coverage | `.superRefine()` every Kano must_have need has ≥1 referencing goal |

---

## Citations

- **Crawley, Cameron, Selva (2015).** Ch 11.
  - §11.2 Beneficiaries vs Stakeholders (book_md line 4770–4788)
  - Stakeholder/beneficiary identification questions (book_md line 4790)
  - Test for architectural impact (book_md line 4804)
  - Box 11.1 — Principle of the Beginning (book_md line 4806–4820)
  - Box 11.2 — Definition of Needs (book_md line 4841–4851)
  - Latent needs + Edison/Olson warnings (book_md line 4875–4886)
  - §11.3 Six Dimensions of Needs (book_md line 4964–4972)
  - Kano analysis (book_md line 4975–4992)
  - Stakeholder system + value flows (book_md line 4993–5040)
  - Value flow definition (book_md line 5011)
  - Value loop definition (book_md line 5029)
  - Indirect transactions + Cameron metric (book_md line 5070–5095)
  - Box 11.3 — Principle of Balance (book_md line 5121–5133)
  - Box 11.4 — Definition of Goals (book_md line 5143–5154)
  - Needs vs Goals distinction (book_md line 5139)
  - Crawley's rejection of "requirements" (book_md line 5146)
  - §11.4 Five Criteria for Goals (book_md line 5162–5172)
  - Mapping to INCOSE 8 criteria (book_md line 5174)
  - Problem-statement crafting (book_md line 5178–5195)
  - F-16 example (book_md line 5190)

- **Kano, N.** Kano analysis. *(cited Crawley §11.3)*

- **Dichter, E.** 1950s consumer interviews. *(cited Crawley §11.2 latent needs)*

- **IDEO.** Empathic design. *(cited Crawley §11.2 latent needs)*

- **Rechtin, E.** *(cited Box 11.3)*

- **Simon, H. A.** *(cited §11.4 problem-statement oversimplification)*

- **INCOSE.** Requirements criteria. *(cited §11.4 Crawley's 5 ↔ INCOSE's 8 mapping)*

- **Cross-references:**
  - `../5-form-function-mapping/GLOSSARY-crawley.md` — needs, goals, beneficiary, stakeholder definitions.
  - `../5-form-function-mapping/04-Phase-4-Solution-Neutral-Concept.md` — solution_neutral_function bi-directional linkage (prioritized need → SN operand/process/attribute).
  - `apps/product-helper/lib/langchain/schemas/module-2/phase-6-requirements-table.ts` — shipped M2 phase this supplement extends.
  - `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` — phaseEnvelopeSchema, sourceRefSchema (consumed; NOT modified).

**Ruling anchors:**
- Handoff §3 — Crawley Ch 11 IN SCOPE for M2 hybrid methodology.
- Team-lead 2026-04-21 — phase-local enum pattern green-lit; `stakeholderCategorySchema`, `kanoCategorySchema`, `flowKindSchema`, `goalCriteriaKeySchema` stay module-local.
- Team-lead 2026-04-22 — M2 Crawley content houses in `2-dev-sys-reqs-for-kb-llm-software/` with `crawley-*` filename prefix, NOT in a new sibling folder.
- `_shared.ts` untouched; `phaseStatusSchema` unchanged (Option A discipline applied).
- Architect 2026-04-21 — preserved Q(f,g) DERIVED discipline throughout all 11 extractions including this one.
