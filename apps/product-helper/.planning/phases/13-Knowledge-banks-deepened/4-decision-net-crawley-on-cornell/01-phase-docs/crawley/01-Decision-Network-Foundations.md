---
name: M4 — Decision Network Foundations (Crawley Ch 14)
module: M4 Decision Network (MIT/Crawley core)
phase_number: 1
phase_slug: "decision-network-foundations"
schema_version: "1.0.0"
zod_schema_id: "m4.decision-network.v1"
zod_target_path: "apps/product-helper/lib/langchain/schemas/module-4/decision-network-foundations.ts"
source_chapter: "Crawley, Cameron, Selva (2015), Ch 14 — System Architecture as a Decision-Making Process"
source_sections:
  - "§14.1 Box 14.1 Properties of Architectural Decisions and Metrics"
  - "§14.3 Simon's Four-Phase Process (intelligence/design/choice/review)"
  - "§14.3 Figure 14.3 Programmed vs Non-Programmed Decisions"
  - "§14.4 Four Main Tasks of Decision Support Systems (representing/structuring/simulating/viewing)"
  - "§14.5 Basic Decision Support Tools — Morphological Matrix / DSM of Decisions / Decision Trees / Decision Networks"
  - "§14.5 Apollo 9 Decisions (Figure 14.1, Tables 14.1/14.2/14.3–14.5)"
  - "§14.6 Decision Support for System Architecture"
page_range: "book_md lines 6620–6905"
validation_needed: false
derivation_source: "Crawley Ch 14 (primary source). decisionVariableTypeSchema + constraintKindSchema (discriminated union) + metricComputationKindSchema + simonPhaseSchema + dssTaskSchema are phase-local Zod primitives introduced here. Decision network is a DATA SHAPE (not an engine class); NFREngineInterpreter is the sole executor."
nfr_engine_slot: "NFREngineInterpreter reads decision_network + constraints + metric definitions as input when resolving architectural NFRs. Executes the four DSS tasks (representing/structuring/simulating/viewing) as orchestrated tool calls, not as sibling engine classes."
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-21"
---

# M4 Phase 1 — Decision Network Foundations (Crawley Ch 14)

> **Scope.** Defines c1v's **Decision Network** data model + the four-layer Decision Support System (DSS) structure. This is the core decision-support layer that replaces M4's legacy flat Decision Matrix per the hybrid-direction ruling (handoff §3 2026-04-21 ~13:00). NFREngineInterpreter remains the sole executor.
>
> **Architect's key insight preserved verbatim (line 6889):**
> > "Decision networks are a more general version of decision trees where the tree structure condition is relaxed to allow arbitrary topologies between decision nodes, chance nodes, and leaf nodes."
>
> **THIS IS THE CORE c1v M4 OBJECT.**

---

## Knowledge

### Box 14.1 — Six Properties of Architectural Decisions (line 6891–6901)

Distinguishes architectural decisions from design / general decisions:

1. **Modeling breadth vs depth** — "Architecture decision support focuses on modeling breadth — analyzing a large space of very different architectures at relatively low fidelity — whereas design decision support focuses on modeling depth — analyzing a smaller number of designs with higher fidelity."
2. **Ambiguity** — "Architecture problems suffer from larger and more varied sources of uncertainty and ambiguity simply because they occur early in the development process. This often makes the use of typical probabilistic techniques such as Monte Carlo simulation impractical or inadequate."
3. **Type of variable** — **categorical > discrete > continuous.** "Architectural decisions often consist of choosing among different entities of form or function, or among different mappings between function and form, which are inherently categorical in nature."
4. **Subjectivity** — leads to multi-attribute utility theory, fuzzy sets, and the need for traceability back to expert knowledge.
5. **Type of objective functions** — "relatively simple equations" + "simple look-up tables and if-then structures" (e.g., Apollo risk metric).
6. **Coupling and emergence** — "Architecture variables are often extremely coupled" due to combinatorial explosion. "Precludes the utilization of some very powerful methods that exploit decouplings in the structure of decision problems (for example, the Markov property in dynamic programming techniques)."

### Simon's Four-Phase Process (line 6722–6729)

1. **Intelligence Activity** — "Searching the environment for conditions calling for a decision."
2. **Design Activity** — "Inventing, developing, and analyzing possible courses of action."
3. **Choice Activity** — "Selecting a particular course of action from those available."
4. **Review Activity** — "Assessing past choices."

> "Decision makers tend to spend a large fraction of their resources in the Intelligence Activity phase, an even greater fraction of their resources in the Design Activity phase, and small fractions of their resources in the Choice Activity phase and the Review Activity phase."

### Programmed vs Non-Programmed Decisions (Figure 14.3, line 6731–6753)

- **Programmed / "structured":** "Routine, well-defined, can be modeled and optimized precisely, not a novel problem, can be solved by an established procedure." (Operations Research domain.) Examples: tipping; control-system gain tuning; air traffic routing.
- **Non-programmed / "unstructured":** "Non-routine, weakly defined, significant impact, solved by heuristic search or general problem solving methods. Models of the system are imprecise." (Management Science domain.) Examples: Apollo mission-mode; whether to go to war.

> "In many cases, decisions that have been thought to be non-programmed become programmed once someone is clever enough to invent a programmed method to solve that problem. Perhaps a better name for non-programmed decisions is 'not-yet-programmed decisions.'"

### §14.4 — Four Main Tasks of Decision Support Systems (line 6755–6771)

Crawley's canonical DSS decomposition (all of Simon's Design Activity):

1. **Representing** — encode the problem for the human AND for computation. Tools: matrices, trees, graphs, OPM, SysML.
2. **Structuring** — reason about the structure of the decision problem itself; determine ORDER of decisions and CONNECTIVITY. DSMs operate here.
3. **Simulating** — evaluate whether combinations of decisions satisfy constraints and compute metrics.
4. **Viewing** — present decision-support output (e.g., tradespace plots) in a human-understandable format.

### §14.5 — Basic Decision Support Tools

#### Morphological Matrix (Figure 14.1, line 6630–6644)

Table: rows = decisions, columns = alternatives per decision. An architecture = one alternative per row (alternatives from different rows need not be in the same column). Strengths: **representing**. Weaknesses: no **structuring, simulating, viewing**.

**Apollo 9 decisions (Figure 14.1):**

| shortID | Decision | alt A | alt B | alt C | alt D |
|---|---|---|---|---|---|
| EOR | Earth Orbit Rendezvous | no | yes | | |
| earthLaunch | Earth Launch Type | orbit | direct | | |
| LOR | Lunar Orbit Rendezvous | no | yes | | |
| moonArrival | Arrival at Moon | orbit | direct | | |
| moonDeparture | Departure from Moon | orbit | direct | | |
| cmCrew | Command Module Crew | 2 | 3 | | |
| lmCrew | Lunar Module Crew | 0 | 1 | 2 | 3 |
| smFuel | Service Module Fuel | cryogenic | storable | | |
| lmFuel | Lunar Module Fuel | NA | cryogenic | storable | |

#### DSM of Decisions (line 6789–6845, Tables 14.3–14.5)

> "When a DSM is used to study the interconnections between decisions, each row and column corresponds to one of the N decisions, and an entry in the matrix indicates the connections, if any, that exist between the two decisions. The connections could be logical constraints or 'reasonableness' constraints, or they could be connections through metrics."

**Three connection types:**
- **Logical constraints** — combinations of decisions that are not possible (e.g., EOR=yes & earthLaunch=direct → impossible).
- **Reasonableness constraints** — not logically impossible but foolish (e.g., two nations each building a separate lunar lander).
- **Metric-coupling connections** — e.g., both decisions feed into the IMLEO computation.

After sorting/partitioning (Table 14.5), tightly-coupled blocks emerge; these sets should be decided approximately simultaneously.

#### Decision Tree (line 6847–6881)

Three node types:
- **Decision nodes** — controllable, finite alternatives, branches.
- **Chance nodes** — uncontrollable random variables, finite alternatives, branches.
- **Leaf nodes** — endpoints; complete assignment of all variables.

**Limitations:**
- Size grows exponentially with decisions/options.
- Assumes payoffs and probabilities are **decision-independent** — often unrealistic for architecture problems.
- Utility aggregation via multi-attribute utility theory: `u = α·u(M1) + (1−α)·u(M2)` (Keeney & Raiffa 1976).

#### Decision Network (footnote, line 6889)

> "Decision networks are a more general version of decision trees where the tree structure condition is relaxed to allow arbitrary topologies between decision nodes, chance nodes, and leaf nodes."

**c1v M4 chooses decision networks over decision trees** per Box 14.1 coupling property (architecture variables are extremely coupled; trees enforce decoupling that isn't there).

### Apollo Metric Computation (Table 14.2)

- **Additive / multiplicative along path:** probability-of-success multiplies each decision's reliability.
- **Non-decomposable:** IMLEO via rocket equation.

### §14.6 — Decision Support for System Architecture (line 6883–6905)

> "In response to the characteristics listed in Box 14.1, architecture decision support systems are more interactive and less automatic, and they often employ tools from the fields of knowledge reasoning and engineering (such as knowledge-based systems for incorporation of expert knowledge and explanation)."

**Frameworks cited (for c1v precedent research):**
- Koo / Simmons / Crawley 2009 — Object Process Network metalanguage (simulating layer).
- Simmons 2008 MIT PhD — Architecture Decision Graph (structuring layer).
- Selva & Crawley 2013 — VASSAR (Value Assessment of System Architectures using Rules) — structuring + simulating.

---

## Input Required

- M5 Phase-4 `solution_neutral_function` + `morphological_matrix.integrated_concepts[]` — candidate architectures to decide between.
- M5 Phase-3 `full_dsm` — to seed the structuring-phase DSM of decisions.
- M5 Phase-5 `clustering_analysis` (optional) — informs decision grouping.

---

## Instructions for the LLM

### Sub-phase A: Decision enumeration (Representing — DSS Task 1)

Emit `decisions[]`:
```
decisions: Array<{
  decision_id: string,
  short_id: string,                   // e.g., "LOR" per Apollo convention
  name: string,
  variable_type: 'categorical' | 'discrete' | 'continuous',
  alternatives: Array<{
    alternative_id: string,
    label: string,
    description: string,
    source_concept_id?: string,       // optional ref to M5 Phase-4 integrated_concept
  }>,
  simon_phase: 'intelligence' | 'design' | 'choice' | 'review',
  programmed: boolean,                // default false (architectural decisions are not-yet-programmed)
}>
```

**Reject** `variable_type: 'continuous'` for a decision unless a numeric specification is provided (Box 14.1: categorical default).

### Sub-phase B: Constraint modeling (Representing — DSS Task 1)

Emit `constraints[]` using the 3-way discriminated union from §14.5:
```
constraints: Array<
  | { kind: 'logical', scope: string[], forbidden_combination: string[] }
  | { kind: 'reasonableness', scope: string[], penalty: number, rationale: string }
  | { kind: 'metric_coupling', scope: string[], coupled_metric: string, equation_ref: string }
>
```

### Sub-phase C: Metric definition (Representing + Simulating — DSS Tasks 1 + 3)

Emit `metrics[]`:
```
metrics: Array<{
  metric_id: string,
  name: string,
  unit: string,
  computation_kind: 'additive' | 'multiplicative' | 'lookup' | 'equation',
  equation_ref?: mathDerivationSchema,     // required if computation_kind === 'equation'
  lookup_table_ref?: string,               // required if computation_kind === 'lookup'
  higher_is_better: boolean,
}>
```

### Sub-phase D: DSM of decisions (Structuring — DSS Task 2)

Emit `decision_dsm`:
```
decision_dsm: {
  rows: string[],                          // decision_id list
  cells: Record<row_id, Record<col_id, {
    connection_kind: 'logical' | 'reasonableness' | 'metric_coupling' | 'none',
    constraint_ids: string[],
  }>>,
  partitioned_blocks: Array<{
    block_id: string,
    decisions: string[],
    decide_simultaneously: boolean,        // per Crawley §14.5 line 6815+
  }>,
}
```

### Sub-phase E: Decision network topology (Representing + Structuring)

Emit `decision_network`:
```
decision_network: {
  nodes: Array<{
    node_id: string,
    node_kind: 'decision' | 'chance' | 'leaf',
    decision_id?: string,                  // for decision nodes
    probability_dist?: Record<string, number>, // for chance nodes
    architecture_selection?: Record<decision_id, alternative_id>, // for leaf nodes
  }>,
  edges: Array<{
    edge_id: string,
    from_node: string,
    to_node: string,
    condition?: string,
  }>,
  topology_kind: 'tree' | 'dag' | 'general_graph',
}
```

Default `topology_kind: 'general_graph'` (Crawley line 6889: "arbitrary topologies"). `tree` only when explicitly requested and coupling is low.

### Sub-phase F: DSS task coverage

Emit `dss_task_coverage`:
```
dss_task_coverage: {
  representing: { covered: true, artifact_refs: [ ... ] },
  structuring: { covered: boolean, artifact_refs: [ ... ] },
  simulating: { covered: boolean, artifact_refs: [ ... ] },
  viewing: { covered: boolean, artifact_refs: [ ... ] },   // filled by Phase 2 (tradespace)
}
```

### STOP GAP — Box 14.1 + DSS task invariants

Before marking `_phase_status: "complete"`:

1. **Variable-type default:** ≥80% of decisions have `variable_type: 'categorical'` (Box 14.1 property 3). If more than 20% are continuous, emit advisory.
2. **Constraint taxonomy coverage:** each constraint has `kind` from the 3-way enum. No free-text constraint records.
3. **DSS tasks 1–3 covered:** `representing` + `structuring` + `simulating` all `covered: true`. Viewing is handled by the sibling Tradespace phase.
4. **Decision network vs tree:** if `topology_kind === 'tree'`, require an inline comment explaining why coupling is low (Crawley: decision-independent payoffs are unrealistic for architecture).

---

## Zod Schema

```ts
// apps/product-helper/lib/langchain/schemas/module-4/decision-network-foundations.ts

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
  mathDerivationSchema,
} from '@/lib/langchain/schemas/module-2/_shared';

// Phase-local — Crawley Box 14.1 variable type taxonomy.
export const decisionVariableTypeSchema = z
  .enum(['categorical', 'discrete', 'continuous'])
  .describe(
    'x-ui-surface=section:Decision Network > Decisions — Crawley Box 14.1 variable type. Categorical default.',
  );
export type DecisionVariableType = z.infer<typeof decisionVariableTypeSchema>;

// Phase-local — Crawley §14.5 three constraint kinds (line 6789+).
export const constraintKindSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('logical'),
    constraint_id: z.string(),
    scope: z.array(z.string()),
    forbidden_combination: z.array(z.string()),
  }),
  z.object({
    kind: z.literal('reasonableness'),
    constraint_id: z.string(),
    scope: z.array(z.string()),
    penalty: z.number(),
    rationale: z.string(),
  }),
  z.object({
    kind: z.literal('metric_coupling'),
    constraint_id: z.string(),
    scope: z.array(z.string()),
    coupled_metric: z.string(),
    equation_ref: z.string(),
  }),
]);
export type ConstraintKind = z.infer<typeof constraintKindSchema>;

// Phase-local — Crawley Table 14.2 metric computation kinds.
export const metricComputationKindSchema = z
  .enum(['additive', 'multiplicative', 'lookup', 'equation'])
  .describe(
    'x-ui-surface=section:Decision Network > Metrics — Crawley Table 14.2 computation kinds.',
  );

// Phase-local — Simon's Four Phases (line 6722).
export const simonPhaseSchema = z
  .enum(['intelligence', 'design', 'choice', 'review'])
  .describe(
    'x-ui-surface=section:Decision Network > Simon Phase — Crawley §14.3 four-phase process.',
  );

// Phase-local — Four DSS Tasks (§14.4 line 6755).
export const dssTaskSchema = z
  .enum(['representing', 'structuring', 'simulating', 'viewing'])
  .describe(
    'x-ui-surface=section:Decision Network > DSS Task — Crawley §14.4 four main tasks.',
  );

// Phase-local — Decision network node kinds.
export const decisionNetworkNodeKindSchema = z
  .enum(['decision', 'chance', 'leaf'])
  .describe(
    'x-ui-surface=section:Decision Network > Node Kind — Crawley §14.5 decision tree node types extended to networks.',
  );

// Phase-local — Decision network topology classification.
export const topologyKindSchema = z
  .enum(['tree', 'dag', 'general_graph'])
  .describe(
    'x-ui-surface=section:Decision Network > Topology — Crawley line 6889 "arbitrary topologies". General-graph default.',
  );

export const decisionAlternativeSchema = z.object({
  alternative_id: z.string(),
  label: z.string(),
  description: z.string(),
  source_concept_id: z.string().optional(),
});

export const decisionSchema = z
  .object({
    decision_id: z.string(),
    short_id: z.string(),
    name: z.string(),
    variable_type: decisionVariableTypeSchema,
    alternatives: z.array(decisionAlternativeSchema).min(2),
    simon_phase: simonPhaseSchema,
    programmed: z.boolean().default(false),
  })
  .describe(
    'x-ui-surface=section:Decision Network > Decisions — one architectural decision (Apollo 9 convention).',
  );

export const metricSchema = z
  .object({
    metric_id: z.string(),
    name: z.string(),
    unit: z.string(),
    computation_kind: metricComputationKindSchema,
    equation_ref: mathDerivationSchema.optional(),
    lookup_table_ref: z.string().optional(),
    higher_is_better: z.boolean(),
  })
  .describe(
    'x-ui-surface=section:Decision Network > Metrics — one architecture-level metric.',
  );

export const decisionDsmCellSchema = z.object({
  connection_kind: z.enum(['logical', 'reasonableness', 'metric_coupling', 'none']),
  constraint_ids: z.array(z.string()).default([]),
});

export const partitionedBlockSchema = z.object({
  block_id: z.string(),
  decisions: z.array(z.string()).min(1),
  decide_simultaneously: z.boolean(),
});

export const decisionDsmSchema = z
  .object({
    rows: z.array(z.string()),
    cells: z.record(z.string(), z.record(z.string(), decisionDsmCellSchema)),
    partitioned_blocks: z.array(partitionedBlockSchema).default([]),
  })
  .describe(
    'x-ui-surface=section:Decision Network > DSM — Crawley Tables 14.3–14.5 decision-decision coupling matrix.',
  );

export const decisionNetworkNodeSchema = z.object({
  node_id: z.string(),
  node_kind: decisionNetworkNodeKindSchema,
  decision_id: z.string().optional(),
  probability_dist: z.record(z.string(), z.number()).optional(),
  architecture_selection: z.record(z.string(), z.string()).optional(),
});

export const decisionNetworkEdgeSchema = z.object({
  edge_id: z.string(),
  from_node: z.string(),
  to_node: z.string(),
  condition: z.string().optional(),
});

export const decisionNetworkSchema = z
  .object({
    nodes: z.array(decisionNetworkNodeSchema).min(1),
    edges: z.array(decisionNetworkEdgeSchema).default([]),
    topology_kind: topologyKindSchema,
  })
  .describe(
    'x-ui-surface=section:Decision Network > Topology — the decision network data shape (NOT an engine).',
  );

export const dssTaskCoverageEntrySchema = z.object({
  covered: z.boolean(),
  artifact_refs: z.array(z.string()).default([]),
});

export const dssTaskCoverageSchema = z
  .object({
    representing: dssTaskCoverageEntrySchema,
    structuring: dssTaskCoverageEntrySchema,
    simulating: dssTaskCoverageEntrySchema,
    viewing: dssTaskCoverageEntrySchema,
  })
  .describe(
    'x-ui-surface=section:Decision Network > DSS Coverage — Crawley §14.4 task completeness.',
  );

export const decisionNetworkFoundationsSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-4.decision-network-foundations.v1'),
    decisions: z.array(decisionSchema).min(1),
    constraints: z.array(constraintKindSchema).default([]),
    metrics: z.array(metricSchema).min(1),
    decision_dsm: decisionDsmSchema,
    decision_network: decisionNetworkSchema,
    dss_task_coverage: dssTaskCoverageSchema,
    crawley_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M4 Phase 1: decision network foundations per Crawley Ch 14.',
  );

export type DecisionNetworkFoundations = z.infer<typeof decisionNetworkFoundationsSchema>;
```

### Refinement — Categorical default + DSS coverage

```ts
export const decisionNetworkFoundationsWithInvariants =
  decisionNetworkFoundationsSchema.superRefine((val, ctx) => {
    // 1. Box 14.1 categorical-default property.
    const continuousCount = val.decisions.filter(
      (d) => d.variable_type === 'continuous',
    ).length;
    const continuousPct = continuousCount / val.decisions.length;
    if (continuousPct > 0.2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['decisions'],
        message: `Crawley Box 14.1 property 3: architectural decisions are categorical > discrete > continuous. ${Math.round(continuousPct * 100)}% of decisions are continuous — re-examine whether these are actually design decisions, not architectural ones.`,
      });
    }

    // 2. DSS tasks 1–3 covered on complete (viewing handled by sibling Tradespace phase).
    if (val._phase_status === 'complete') {
      const coverage = val.dss_task_coverage;
      const missing = [];
      if (!coverage.representing.covered) missing.push('representing');
      if (!coverage.structuring.covered) missing.push('structuring');
      if (!coverage.simulating.covered) missing.push('simulating');
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dss_task_coverage'],
          message: `Crawley §14.4: DSS tasks ${missing.join(', ')} not covered. Viewing is covered by the sibling Tradespace phase.`,
        });
      }
    }

    // 3. Tree topology requires low-coupling justification (Crawley line 6881 — tree assumes independence).
    if (val.decision_network.topology_kind === 'tree') {
      const hasMetricCoupling = val.constraints.some(
        (c) => c.kind === 'metric_coupling',
      );
      if (hasMetricCoupling) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['decision_network', 'topology_kind'],
          message:
            'Crawley §14.5 line 6881: decision trees assume decision-independent payoffs. Cannot use topology_kind: "tree" when metric_coupling constraints exist — use "dag" or "general_graph".',
        });
      }
    }

    // 4. Metric equation gating — equation computation_kind requires equation_ref.
    for (const metric of val.metrics) {
      if (metric.computation_kind === 'equation' && !metric.equation_ref) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['metrics'],
          message: `Metric "${metric.name}" has computation_kind: "equation" but no equation_ref (mathDerivationSchema required).`,
        });
      }
      if (metric.computation_kind === 'lookup' && !metric.lookup_table_ref) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['metrics'],
          message: `Metric "${metric.name}" has computation_kind: "lookup" but no lookup_table_ref.`,
        });
      }
    }
  });
```

---

## NFREngineInterpreter boundary note

**Critical:** the decision network is a **data shape**, not an engine class. No `DecisionNetworkEngine`, `DssEngine`, `StructuringSolver` is introduced. NFREngineInterpreter:
- **Reads** decisions + constraints + metrics + DSM + network topology.
- **Orchestrates** tool calls for each DSS task (representing/structuring/simulating/viewing).
- **Does not** implement the tasks as sibling engine classes.

The four DSS tasks (§14.4) are listed in `dss_task_coverage` as a **completeness checklist** for reviewers, not as a map of engine subclasses. Each `artifact_refs` entry points to the Zod artifact that demonstrates coverage (e.g., `decision_network` demonstrates `representing`; `decision_dsm.partitioned_blocks` demonstrates `structuring`).

---

## mathDerivationV2 impact

**None.** Metric equations slot into the existing scalar `mathDerivationSchema.result`. The metric is always a scalar per architecture (utility, IMLEO, reliability, etc.). Pareto rank + sensitivity vectors are emitted in the sibling Tradespace phase, decomposed into N scalar records per my batch-3 plan. Tally unchanged at 2.

---

## c1v applicability summary

| Methodology rule | Enforced by |
|---|---|
| Decision network over decision tree (Box 14.1 coupling) | `topology_kind: 'general_graph'` default |
| Categorical > discrete > continuous variable type | `decisionVariableTypeSchema` + `.superRefine()` continuous-pct advisory |
| 3-way constraint taxonomy | `constraintKindSchema` discriminated union |
| Metric computation 4 kinds | `metricComputationKindSchema` + conditional refinement |
| Four DSS tasks coverage | `dss_task_coverage` required-completeness for `_phase_status: 'complete'` |
| Simon's four phases | `simon_phase` on every decision |
| Tree topology requires independence justification | `.superRefine()` blocks tree+metric_coupling combination |

---

## Citations

- **Crawley, Cameron, Selva (2015).** Ch 14.
  - Box 14.1 — Properties of Architectural Decisions (book_md line 6891–6901)
  - §14.3 Simon's Four-Phase Process (book_md line 6722–6729)
  - §14.3 Programmed vs Non-Programmed (book_md line 6731–6753)
  - §14.4 Four DSS Main Tasks (book_md line 6755–6771)
  - §14.5 Morphological Matrix + Apollo 9 decisions (book_md line 6630–6644)
  - §14.5 DSM of Decisions + 3 connection types (book_md line 6789–6845)
  - §14.5 Decision Tree limitations (book_md line 6847–6881)
  - §14.5 Decision Network definition (book_md line 6889)
  - §14.6 Decision Support for Architecture (book_md line 6883–6905)
  - Apollo metric computation (Table 14.2)
  - Apollo constraints (Table 14.1 book_md line 6658)

- **Simon, H. A.** Four-phase decision process. *(cited Crawley §14.3)*

- **Keeney, R. L. & Raiffa, H. (1976).** *Decisions with Multiple Objectives.* Multi-attribute utility theory. *(cited Crawley §14.5 line 6881)*

- **Koo, B. H. Y., Simmons, W. L., & Crawley, E. F. (2009).** Object Process Network metalanguage. *(cited §14.6 for simulating-layer precedent)*

- **Simmons, W. L. (2008).** *A Framework for Decision Support in Systems Architecting.* MIT PhD. Architecture Decision Graph. *(cited §14.6 for structuring-layer precedent)*

- **Selva, D. & Crawley, E. F. (2013).** VASSAR (Value Assessment of System Architectures using Rules). *(cited §14.6)*

- **Cross-references:**
  - `./02-Tradespace-Pareto-Sensitivity.md` — sibling M4 phase covering Ch 15 (viewing + choice support).
  - `../5-form-function-mapping/04-Phase-4-Solution-Neutral-Concept.md` — morphological_matrix.integrated_concepts[] = candidate architectures for this phase's decisions.
  - `../5-form-function-mapping/03-Phase-3-Form-Function-Concept.md` — full_dsm feeds the decision_dsm seeding.
  - `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` — phaseEnvelopeSchema, mathDerivationSchema, sourceRefSchema.

**Ruling anchors:**
- Handoff §3 2026-04-21 ~13:00 — M4 MIT/Crawley hybrid direction approved.
- Handoff §3 2026-04-21 ~14:30 — NFREngineInterpreter is sole executor; decision network is data shape only.
- Team-lead 2026-04-21 — phase-local enum pattern green-lit; 5 new enums stay module-local.
- Schema id: `module-4.decision-network-foundations.v1` (per architect `m4.decision-network.v1` intent; renamed for module-phase convention).
