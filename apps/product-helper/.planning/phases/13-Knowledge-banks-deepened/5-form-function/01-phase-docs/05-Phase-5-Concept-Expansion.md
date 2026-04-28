---
name: M5 Phase 5 — Concept Expansion (Level 1 → Level 2 + Modularization)
module: M5 Form-Function Mapping
phase_number: 5
phase_slug: "concept-expansion"
schema_version: "1.0.0"
zod_schema_id: "m5.phase-5-concept-expansion.v1"
zod_target_path: "apps/product-helper/lib/langchain/schemas/module-5/phase-5-concept-expansion.ts"
source_chapter: "Crawley, Cameron, Selva (2015), Ch 8 — From Concept to Architecture"
source_sections:
  - "§8.1 Table 8.1 Ordered synthesis question list (Ch 4–7 + 8a/8b)"
  - "§8.2 Figure 8.3 Level-0 → Level-1 procedure"
  - "§8.2 Function-goal reasoning + Zigzagging"
  - "§8.3 Level-2 decomposition rationale + 7±2 complexity cap"
  - "§8.4 Worked examples (air transport, home data network)"
  - "§8.5 Box 8.1 Clustering by interactions (Thebeau algorithm reference)"
page_range: "book_md lines 3508–3787"
validation_needed: false
derivation_source: "Crawley Ch 8 (primary source). decompositionLevelSchema + modularizationReviewStateSchema + clusteringBasisSchema are phase-local Zod enums introduced here. Thebeau clustering output = data shape; actual algorithm invocation lives in NFREngineInterpreter-orchestrated tool call."
nfr_engine_slot: "NFREngineInterpreter orchestrates the Thebeau-style clustering invocation (or equivalent) and reads the resulting clusters when resolving maintainability/modularity NFRs. This phase captures the clustering OUTPUT, not the algorithm."
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-21"
---

# Phase 5 — Concept Expansion (Crawley Ch 8)

> **Scope.** Expands the concept from Phase 4 down through Levels 1 and 2, using Crawley's **function-goal reasoning** (the specific function at level N becomes the functional intent at level N+1) and **zigzagging** (alternate between function and form domains). Produces the modularization-review-ready decomposition that M3 FFBD + M4 decision network consume.
>
> **Level cap:** explicitly stops at Level 2. Crawley (line 3676) forbids Level 3 on complexity grounds (would require hundreds of entities). **Schema enforces `decomposition_level ≤ 2`.**
>
> **Curator note on state-machine scope:** architect proposed adding `awaiting_modularization_review` to `phaseStatusSchema` in `_shared.ts`. Per curator rules (no cross-cutting `_shared.ts` changes without team-lead gate — handoff §3), this phase encodes the modularization-review semantics as a **phase-local field** `modularization_review_state` on this phase only. Blast radius: zero. Captured Crawley intent fully via `.superRefine()` that requires `modularization_review_state === 'approved'` when `_phase_status === 'complete'`.

---

## Knowledge

### Table 8.1 — Ordered synthesis question list (line 3508–3530)

Crawley's canonical synthesis order — reuses the Ch 4–7 questions + adds two Ch-8 questions:

1. **7a** — Beneficiaries, needs, solution-neutral operand + process + attributes.
2. **5a** — Primary externally delivered value-related function (specialized operand, process, and instrument) + *"What is the concept? What other concepts satisfy the solution-neutral function?"*
3. **5b** — Principal internal functions (operands + processes) + *"What are the specializations / concept fragments / integrated concept / concept of operation?"*
4. **5c** — Functional architecture (internal functions connect → value pathway → external function emerges).
5. **5d** — Secondary value-related external functions and their emergence.
6. **4a** — What is the system?
7. **4b** — Principal elements of form.
8. **4c** — Formal structure.
9. **4d** — Accompanying systems / whole product system.
10. **4e** — System boundaries / interfaces.
11. **4f** — Use context.
12. **6a** — Form↔process mapping, formal structure support, emergence influence.
13. **6b** — Non-idealities on the realistic value path.
14. **6c** — Supporting functions and their instruments.
15. **6d** — Interfaces at system boundaries.
16. **6e** — Sequence of execution.
17. **6f** — Parallel threads/strings.
18. **6g** — Clock-time importance; timing constraints.
19. **8a** — *NEW:* How does the architecture of Level 1 extend to Level 2?
20. **8b** — *NEW:* What is a possible modularization of the Level 2 objects?

### §8.2 — Function-goal reasoning (line 3589)

> "The specific function at one level becomes the functional intent at Level 1. This is a key point: The solution at one level becomes the problem statement at the next level. We call this function-goal reasoning."

### §8.2 — Zigzagging (line 3555)

> "Zigzagging is the idea that we reason in one domain [function/form] as long as is practical and then switch to the other."

### §8.2 — Procedure Level 0 → Level 1 (Figure 8.3, line 3587–3591)

Starting from Level 0: `(O_sn, P_sn)` solution-neutral + `(O_0, P_0, F_0)` concept + `OPS_0` ops concept.

Produce at Level 1:
1. Inherit intent from Level 0 → becomes functional intent at Level 1.
2. Specialize and zoom → operands + internal processes at Level 1 (P_11, P_12, …).
3. Decompose Level 0 form → Level 1 entities of form; map to Level 1 internal function (informed by OPS_0).
4. Fill in remaining architecture detail: non-idealities, supporting processes/form, interfaces.

**Worked example — air transport (line 3541):** Level 1 internal processes = purchasing, checking-in, loading, transporting, unloading, checking-out ("function timeline"). Primary operand = traveler; ticket = information object; baggage emerges as secondary operand.

### §8.3 — Why Level 2 (line 3598–3601)

> "The principal question is therefore 'Is this the right decomposition at Level 1, or at least a good one?' … The fact is that the real information about how the entities at Level 1 should be clustered or modularized is hidden at Level 2. We need to dive down one more level to see how the details really work, and then make decisions on how Level 1 is best structured."

### §8.3 — Stop at Level 2 (line 3676)

> "A typical Level 1 model will have about 7 ± 2 primary value processes, as well as non-idealities and supporting processes, and about as many entities of form, for about 20-30 entities in all. A full model at Level 2 might have 50-100 entities, and at Level 3 there would be hundreds. Three levels of hierarchy are hard to develop and too much to comprehend easily. We don't need to go to Level 3."

### §8.3 — Recursion (line 3605)

> "Each function at Level 1 becomes a statement of functional intent at Level 2."

### §8.4 — Layered emergence (air transport Level 2, line 3623–3628)

Ticket purchasing Level-1 process → Level-2 intent → specialized to online system → 5 internal processes + 3 new operands. Nine Level-1 value-delivery processes expand to 28 Level-2 internal processes + 16 states of 4 operands.

### §8.4 — Home data network Level 2 (line 3680–3713)

Layers follow the Internet protocol suite (physical / link / Internet), 24 internal processes.

> "This layered approach gives modern networks many of their desirable emergent properties, such as scalability, robustness, and flexibility."

### §8.5 — Box 8.1 — Clustering by Interactions (line 3722–3731)

> "When we examine clustering, there are three important tasks: choosing the basis of the clustering, representing that information, and computing the clusters."

**Three decisions:**
1. **Basis of clustering:**
   - **Process-centric** — link by operand interactions (Box 5.8).
   - **Form-centric** — link by processes-through-operands (interactions, §6.5) OR by structure (static relationships, §4.4).
2. **Representation:**
   - In PO/PF matrices, suppress interaction type (create/destroy/affect) and count connections only.
   - Replace any symbol with `1`; set PP, OO, FF diagonals to identity.
3. **Clustering algorithm:**
   - Arranges DSM rows/columns to group tightly-connected entities.
   - Result: blocks of highly coupled entities decoupled from other blocks.
   - Crawley uses **Thebeau algorithm** (Thebeau 2001 MIT master's thesis).

### Coupling rule (line 3732)

> "If two processes share a large number of operands, they are tightly coupled."

### The clustering doesn't "win" automatically (line 3776)

> "This clustering is not perfect — there are interactions among the blocks — but this will be the result for any clustering. By performing this clustering analysis, we are not saying that this Level 1 modularization (according to shared operands) is better than the first attempt … The two different decompositions simply represent two ways in which the airline service provider might be organized."

### Architecture development summary (line 3783–3787)

> "The main point is that there is a process to go from Level N to Level N+1, which can be applied in expanding the concept to Level 1, and equally well in expanding Level 1 to Level 2. Because the really important information about the relationships among the Level 1 entities are hidden at Level 2, we must probe down two levels, identify the relationships of interest, and then cluster at Level 1."

---

## Input Required

- `m5.phase-4-solution-neutral-concept.v1` output with `_phase_status: "complete"` (Level-0 concept).
- `m5.phase-3-form-function-concept.v1` output (form-function mapping + full DSM at Level 0/1).
- Access to the Thebeau-style clustering tool call via NFREngineInterpreter (curator note: this phase captures clustering OUTPUT, not the invocation — the tool call is orchestrator concern, not this schema's).

---

## Instructions for the LLM

### Sub-phase A: Table 8.1 ordered synthesis check

Emit `synthesis_question_coverage[]` — one row per Q in Table 8.1. Each row references the M5 phase + field where that question was answered. Missing coverage = `awaiting_input: true`. This enforces the zigzagging pattern: don't enter Level-2 until Ch 4–7 questions are addressed.

### Sub-phase B: Level 1 expansion (Q 8a)

For each Level-0 concept (from Phase 4), emit a `level_1_expansion`:
```
{
  source_concept_id: string,                    // ref Phase-4 concept.concept_id
  inherited_intent: string,                     // the Level-0 specific_process becoming Level-1 functional intent
  level_1_internal_processes: string[],         // the P_11..P_1N
  level_1_internal_operands: string[],
  level_1_form_decomposition: string[],         // refs Phase-1 level-1 form_entities
  non_idealities: string[],                     // refs Phase-3 non_idealities or new ones
  supporting_processes: string[],
  supporting_form: string[],
  interfaces: string[],                         // refs Phase-3 interface_specs
}
```

### Sub-phase C: Level 2 expansion (Q 8a recursion)

For **each** Level-1 internal process, emit a `level_2_expansion` with the same shape as B but with `source_process_id` (the Level-1 process becoming Level-2 functional intent). Expected entity count per §8.3: about 50–100 entities at Level 2 total (enforced as a soft warning, not a hard fail).

### Sub-phase D: Clustering (Q 8b + Box 8.1)

Emit `clustering_analysis`:
```
{
  basis: 'process_centric' | 'form_centric_interactions' | 'form_centric_structure',
  representation: {
    matrix_source: 'po' | 'pf' | 'ff',          // which DSM block was used
    cell_suppression_applied: boolean,           // true when interaction type collapsed to 1
  },
  algorithm: 'thebeau' | 'other',
  algorithm_reference: string,                   // e.g., "Thebeau 2001 MIT master's thesis"
  clusters: Array<{
    cluster_name: string,
    entity_ids: string[],
  }>,
  time_based_vs_coupling_comparison: {
    first_attempt_clusters: Array<{name, entity_ids[]}>,
    coupling_attempt_clusters: Array<{name, entity_ids[]}>,
    chosen: 'time_based' | 'coupling_based',
    chosen_rationale: string,                    // required — Crawley line 3776 "which to pick depends on what you optimize"
  }
}
```

### Sub-phase E: Modularization review

Emit `modularization_review_state ∈ modularizationReviewStateSchema`. States:
- `not_started` — initial.
- `first_pass_complete` — Level 1 timeline-based decomposition in place.
- `clustering_compared` — Level 2 expansion + clustering done; time-based vs coupling-based comparison filled in.
- `revised` — after `clustering_compared`, coupling analysis surfaced issues (or reviewer rejected first attempt); architect iterated on Level-1 modularization. Must transition back to `clustering_compared` (re-run comparison on the revised decomposition) before reaching `approved`. Rationale: Crawley §8.5 line 3776 — "this clustering is not perfect … two different decompositions simply represent two ways in which the system might be organized" — implies architect may re-modularize when optimization goal disagrees with first-attempt clustering.
- `approved` — reviewer (human or orchestrator) signed off on the final modularization.

**Allowed transitions:**
```
not_started → first_pass_complete → clustering_compared → approved
                                  ↘        ↙
                                   revised (loop → clustering_compared)
```

### STOP GAP — Level-cap + review-state invariants

Before marking `_phase_status: "complete"`:

1. **Level cap:** every `level_1_expansion` and `level_2_expansion` has `decomposition_level ∈ {1, 2}`. No Level-3 recursion (line 3676).
2. **Review completed:** `modularization_review_state === 'approved'` required when `_phase_status === 'complete'`. This is the Crawley-Ch-8 modularization-review rule captured as phase-local state (see front matter).
3. **Clustering comparison required:** `clustering_analysis.time_based_vs_coupling_comparison.chosen_rationale` must be non-empty (Crawley line 3776).
4. **Table 8.1 coverage:** every row of `synthesis_question_coverage` has `awaiting_input: false`.

---

## Zod Schema

```ts
// apps/product-helper/lib/langchain/schemas/module-5/phase-5-concept-expansion.ts

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
} from '@/lib/langchain/schemas/module-2/_shared';

// Phase-local — Crawley line 3676 explicit Level-3 forbidden.
export const decompositionLevelSchema = z
  .number()
  .int()
  .min(1)
  .max(2)
  .describe(
    'x-ui-surface=section:Concept Expansion > Level — Crawley §8.3 line 3676: "We don\'t need to go to Level 3." Hard cap at 2.',
  );

// Phase-local — Crawley Box 8.1 three clustering bases.
export const clusteringBasisSchema = z
  .enum(['process_centric', 'form_centric_interactions', 'form_centric_structure'])
  .describe(
    'x-ui-surface=section:Concept Expansion > Clustering — Crawley Box 8.1 three-way choice.',
  );

// Phase-local — captures Crawley-Ch-8 "awaiting modularization review" state
// WITHOUT modifying shared phaseStatusSchema. Blast radius zero.
// Includes `revised` to capture iterate-after-comparison per Crawley §8.5 line 3776
// ("this clustering is not perfect … two different decompositions simply represent
// two ways in which the airline service provider might be organized") — an
// architect may revise Level-1 modularization after coupling comparison shows
// issues, before approval.
export const modularizationReviewStateSchema = z
  .enum([
    'not_started',
    'first_pass_complete',
    'clustering_compared',
    'revised',
    'approved',
  ])
  .describe(
    'x-ui-surface=section:Concept Expansion > Modularization Review — Crawley §8.5 clustering-comparison review gate (phase-local; does not modify shared _phase_status enum). Sequence: not_started → first_pass_complete → clustering_compared → (optional: revised → clustering_compared loop) → approved.',
  );

export const synthesisQuestionCoverageRowSchema = z
  .object({
    question_id: z.string(), // "7a", "5a", ..., "8a", "8b"
    phase_source: z.string(),
    field_reference: z.string(),
    awaiting_input: z.boolean(),
    note: z.string().optional(),
  })
  .describe(
    'x-ui-surface=internal:table-8-1-coverage — one row of Crawley Table 8.1 synthesis checklist.',
  );

export const level1ExpansionSchema = z
  .object({
    expansion_id: z.string(),
    source_concept_id: z.string(),
    inherited_intent: z.string().describe(
      'x-ui-surface=section:Concept Expansion > Function-Goal — Level-0 specific_process becoming Level-1 functional intent.',
    ),
    decomposition_level: z.literal(1),
    level_1_internal_processes: z.array(z.string()).min(1),
    level_1_internal_operands: z.array(z.string()).default([]),
    level_1_form_decomposition: z.array(z.string()).default([]),
    non_idealities: z.array(z.string()).default([]),
    supporting_processes: z.array(z.string()).default([]),
    supporting_form: z.array(z.string()).default([]),
    interfaces: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Concept Expansion > Level 1 — Crawley §8.2 Level-0→Level-1 expansion record.',
  );

export const level2ExpansionSchema = z
  .object({
    expansion_id: z.string(),
    source_process_id: z.string().describe(
      'x-ui-surface=internal:cross-level-ref — Level-1 process becoming Level-2 functional intent (Crawley line 3605).',
    ),
    inherited_intent: z.string(),
    decomposition_level: z.literal(2),
    level_2_internal_processes: z.array(z.string()).min(1),
    level_2_internal_operands: z.array(z.string()).default([]),
    level_2_form_decomposition: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Concept Expansion > Level 2 — Crawley §8.3 Level-2 expansion record.',
  );

export const clusterRecordSchema = z
  .object({
    cluster_name: z.string(),
    entity_ids: z.array(z.string()).min(1),
  })
  .describe(
    'x-ui-surface=section:Concept Expansion > Clusters — one cluster/block from the clustering algorithm.',
  );

export const clusteringAnalysisSchema = z
  .object({
    basis: clusteringBasisSchema,
    representation: z.object({
      matrix_source: z.enum(['po', 'pf', 'ff']),
      cell_suppression_applied: z.boolean(),
    }),
    algorithm: z.enum(['thebeau', 'other']),
    algorithm_reference: z.string(),
    clusters: z.array(clusterRecordSchema).min(1),
    time_based_vs_coupling_comparison: z
      .object({
        first_attempt_clusters: z.array(clusterRecordSchema),
        coupling_attempt_clusters: z.array(clusterRecordSchema),
        chosen: z.enum(['time_based', 'coupling_based']),
        chosen_rationale: z.string().min(1).describe(
          'x-ui-surface=section:Concept Expansion > Clustering — required per Crawley line 3776: explain which optimization goal motivated the choice.',
        ),
      })
      .describe(
        'x-ui-surface=section:Concept Expansion > Clustering — Crawley line 3776 two-way modularization comparison.',
      ),
  })
  .describe(
    'x-ui-surface=section:Concept Expansion > Clustering — Crawley Box 8.1 three-decision clustering output.',
  );

export const phase5ConceptExpansionSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-5.phase-5-concept-expansion.v1'),
    synthesis_question_coverage: z
      .array(synthesisQuestionCoverageRowSchema)
      .min(20)
      .describe(
        'x-ui-surface=section:Concept Expansion > Synthesis Checklist — Crawley Table 8.1 20-question checklist.',
      ),
    level_1_expansions: z.array(level1ExpansionSchema).min(1),
    level_2_expansions: z.array(level2ExpansionSchema).min(1).describe(
      'x-ui-surface=section:Concept Expansion > Level 2 — required for non-trivial systems (Crawley §8.3 "hidden at Level 2").',
    ),
    clustering_analysis: clusteringAnalysisSchema,
    modularization_review_state: modularizationReviewStateSchema,
    crawley_glossary_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M5 Phase 5: concept expansion + modularization per Crawley Ch 8.',
  );

export type Phase5ConceptExpansion = z.infer<typeof phase5ConceptExpansionSchema>;
```

### Refinement — Level cap + review gate

```ts
export const phase5WithInvariants = phase5ConceptExpansionSchema.superRefine((val, ctx) => {
  // 1. Review gate on complete.
  if (val._phase_status === 'complete' && val.modularization_review_state !== 'approved') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['modularization_review_state'],
      message:
        'Crawley §8.5 (modularization review) — cannot mark _phase_status "complete" without modularization_review_state === "approved".',
    });
  }

  // 2. Table 8.1 coverage on complete.
  if (val._phase_status === 'complete') {
    const awaiting = val.synthesis_question_coverage.filter((r) => r.awaiting_input);
    if (awaiting.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['synthesis_question_coverage'],
        message: `Crawley Table 8.1: ${awaiting.length} question(s) still awaiting input — ${awaiting.map((r) => r.question_id).join(', ')}.`,
      });
    }
  }

  // 3. Level-2 entity soft-warning (line 3676: "50-100 entities").
  const totalLevel2Entities = val.level_2_expansions.reduce(
    (acc, e) =>
      acc +
      e.level_2_internal_processes.length +
      e.level_2_internal_operands.length +
      e.level_2_form_decomposition.length,
    0,
  );
  if (totalLevel2Entities > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['level_2_expansions'],
      message: `Crawley §8.3 line 3676 complexity warning: Level-2 total entities = ${totalLevel2Entities}, above the ~100 soft cap. Consider consolidation rather than going to Level 3 (forbidden).`,
    });
  }
});
```

---

## NFREngineInterpreter boundary note

**Critical:** the Thebeau clustering algorithm (Box 8.1) is **NOT implemented in this phase**. The phase captures clustering INPUT (which DSM block to use, which basis, which representation) and clustering OUTPUT (the cluster blocks). The actual algorithmic invocation happens inside `NFREngineInterpreter` or is orchestrated by it as a tool call to a clustering utility. No `ClusteringEngine`, `ThebeauSolver`, or similar class is introduced. This preserves the NFREngineInterpreter-is-sole-executor boundary (handoff §3 2026-04-21 ~14:30).

---

## State-machine resolution (finalized 2026-04-21)

Architect's extraction proposed adding `awaiting_modularization_review` to `phaseStatusSchema` in `_shared.ts`. Curator proposed **Option A** (phase-local, zero blast radius). **Team-lead approved Option A** with one refinement (adding `revised` state to capture iterate-after-comparison).

**Final resolution:**
- `modularizationReviewStateSchema` is local to this phase only. Values: `not_started | first_pass_complete | clustering_compared | revised | approved`.
- `_phase_status` enum in `_shared.ts` is unchanged (`planned | in_progress | complete | needs_revision`).
- The `.superRefine()` gate enforces `modularization_review_state === 'approved'` when `_phase_status === 'complete'`.

**Team-lead reasoning (for the record):**
1. Semantic mismatch — `_phase_status` models workflow state. `awaiting_modularization_review` is a sub-state of `in_progress`, not a peer workflow stage. Concerns separated.
2. Blast radius for Option B = 31 shipped phases + Drizzle + generated JSON + C4 discriminators + tests, purely to capture one phase's checkpoint. Wrong trade.
3. Locality rule (same as enum hoisting): promote to cross-cutting only if ≥2 phases need the state. Only M5 phase-5 does today.
4. Option A is reversible; Option B is expensive to retract.

**Architect note:** this isn't a rejection of the Ch 8 point — the semantics land in a phase-local field, not as a top-level state. The Crawley constraint is honored, just at the right layer.

---

## c1v applicability summary

| Methodology rule | Enforced by |
|---|---|
| Function-goal reasoning (Level N → intent at Level N+1) | `inherited_intent` required on every expansion |
| Level cap at 2 (Crawley line 3676) | `decompositionLevelSchema` `.max(2)` |
| 7±2 primary value processes | Soft convention; not hard-gated (Crawley's "typical") |
| Level 2 required for non-trivial | `level_2_expansions.min(1)` |
| Clustering comparison (time vs coupling) | Required subfield with mandatory `chosen_rationale` |
| Thebeau algorithm cite | `algorithm_reference` required |
| Modularization-review gate | Phase-local state + `.superRefine()` (Option A) |
| Table 8.1 coverage | 20-row `synthesis_question_coverage` array |
| Zigzagging (function ↔ form domains) | Expansions carry both `internal_processes` AND `form_decomposition` |

---

## Citations

- **Crawley, Cameron, Selva (2015).** Ch 8.
  - Table 8.1 — Ordered synthesis question list (book_md line 3508–3530)
  - §8.2 Function-goal reasoning (book_md line 3589)
  - §8.2 Zigzagging (book_md line 3555)
  - §8.2 Figure 8.3 Level 0 → 1 procedure (book_md line 3587–3591)
  - §8.2 Air transport example (book_md line 3541)
  - §8.3 Why Level 2 (book_md line 3598–3601)
  - §8.3 Level-3 forbidden / 7±2 cap (book_md line 3676)
  - §8.3 Recursion (book_md line 3605)
  - §8.4 Air transport Level 2 (book_md line 3623–3628)
  - §8.4 Home data network (book_md line 3680–3713)
  - §8.5 Box 8.1 Clustering (book_md line 3722–3731)
  - §8.5 Coupling rule (book_md line 3732)
  - §8.5 "Clustering doesn't win automatically" (book_md line 3776)
  - Summary (book_md line 3783–3787)

- **Thebeau, R. E. (2001).** *Knowledge Management of System Interfaces and Interactions for Product Development Processes.* MIT master's thesis. *(cited by Crawley at Box 8.1)*

- **Cross-references:**
  - `./GLOSSARY-crawley.md` — system, decomposition, formal/functional relationships.
  - `./03-Phase-3-Form-Function-Concept.md` — full DSM consumed by clustering_analysis.
  - `./04-Phase-4-Solution-Neutral-Concept.md` — Level-0 concepts consumed by level_1_expansions.
  - `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` — phaseEnvelopeSchema, sourceRefSchema (phaseStatusSchema deliberately NOT modified).

**Ruling anchors:**
- Handoff §3 2026-04-21 ~14:30 — NFREngineInterpreter is sole executor; no standalone `ClusteringEngine` introduced. Thebeau algorithm is data-shape only.
- Team-lead 2026-04-21 — phase-local enum pattern green-lit.
- Curator state-machine decision 2026-04-21 (this session) — Option A applied: `modularizationReviewStateSchema` is phase-local; `phaseStatusSchema` unchanged. Pending team-lead final decision on Option A vs B.
- Schema id renamed from architect's `m5.phase-concept-expansion.v1` → `m5.phase-5-concept-expansion.v1`.
