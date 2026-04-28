---
name: M4 — Optimization Patterns (Crawley Ch 16)
module: M4 Decision Network (MIT/Crawley core)
phase_number: 3
phase_slug: "optimization-patterns"
schema_version: "1.0.0"
zod_schema_id: "m4.optimization.v1"
zod_target_path: "apps/product-helper/lib/langchain/schemas/module-4/optimization-patterns.ts"
source_chapter: "Crawley, Cameron, Selva (2015), Ch 16 — Formulating and Solving System Architecture Optimization Problems"
source_sections:
  - "§16.1 Table 16.1 Six Architect Tasks amenable to programmed decisions"
  - "§16.2 Generic optimization formulation (A* = argmin V(A))"
  - "§16.3 NEOSS worked example (DOWN-SELECTING + ASSIGNING + PERMUTING composed)"
  - "§16.4 Table 16.2 Six Patterns of architectural decisions"
  - "§16.4 Box 16.1 Interactions between System Elements (schemata)"
  - "§16.5 Channelized vs Fully Cross-Strapped architecture styles (Figures 16.8/16.9)"
  - "§16.6 Heuristic solvers (genetic algorithms, simulated annealing, knowledge-based)"
page_range: "book_md lines 7412–7697"
validation_needed: false
derivation_source: "Crawley Ch 16 (primary source). patternSchema + elementInteractionKindSchema + architectureStyleSchema + valueFunctionKindSchema + solverKindSchema + architectTaskSchema are phase-local Zod enums introduced here. Pareto set emitted as `non_dominated_architecture_ids: string[]` with scalar per-architecture metrics — NO V2 candidates."
nfr_engine_slot: "NFREngineInterpreter orchestrates solver tool calls (genetic algorithm / simulated annealing / full-factorial / knowledge-based) against the architecture space defined in this phase. This phase captures the PROBLEM FORMULATION, not the solver implementation."
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-22"
---

# M4 Phase 3 — Optimization Patterns (Crawley Ch 16)

> **Scope.** Consumes decisions + constraints + metrics from Phase 1 (Decision Network Foundations), the tradespace analysis from Phase 2 (Pareto + Sensitivity), and produces the **formal optimization formulation**: the 6 Patterns taxonomy (DECISION-OPTION / DOWN-SELECTING / ASSIGNING / PARTITIONING / PERMUTING / CONNECTING), architectural styles (channelized vs cross-strapped), hard/soft constraints, and the solver handoff. This is where c1v decides whether to enumerate, search, or ask a knowledge-based system to recommend.
>
> **NEOSS is the canonical composed example** — a real system typically involves multiple Patterns; this phase must support composition.

---

## Knowledge

### Table 16.1 — Six Architect Tasks Amenable to Programmed Decisions (line 7412–7421)

| # | Task | Consists of | Chapter refs |
|---|---|---|---|
| 1 | **Decomposing Form and Function** | Choosing a system decomposition — clustering elements of form or function | Ch 3, 4, 5, 6, 8, 13 |
| 2 | **Mapping Function to Form** | Defining concept by assigning elements of function to elements of form | Ch 6, 7, 8, 12 |
| 3 | **Specializing Form and Function** | Going from solution-neutral to solution-specific by choosing among alternatives | Ch 4, 7 |
| 4 | **Characterizing Form and Function** | Choosing alternatives for attributes of an element of form or function | Ch 7, 13, 14 |
| 5 | **Connecting Form and Function** | Defining system topology and interfaces | Ch 4, 5, 7 |
| 6 | **Selecting Goals** | Defining scope by choosing among a set of candidate goals | Ch 11 |

### §16.2 — Generic Optimization Formulation (line 7425–7469)

Architecture = an array of decision-option assignments:
```
A = {d_i ← d_ij}  where i = 1..N, j ∈ 1..m_i
```

Metrics: `M = [M_1, …, M_P]` computed by value function `V(A) → (M_1, …, M_P)`.

Multi-objective optimization:
```
A* = argmin_A  V(A)       subject to constraints on {d_i}
     (or argmax depending on metric direction)
returns the set of non-dominated architectures (Pareto set)
```

**Key observations:**
- Categorical variables preclude gradient-based optimization → **combinatorial**.
- Most are **NP-hard** (time grows exponentially with problem size).
- **Practical limit: roughly 7 ± 2 decisions with 7 ± 2 options each** before exact global optimum is infeasible.
- Number of metrics: **between 2 and 5, ideally 2 or 3** — "too many metrics, most architectures become non-dominated."

### Hard vs Soft Constraints (line 7465–7468)

- **Hard:** violations eliminate the architecture from the tradespace (e.g., `LOR=yes ∧ MoonArrival=direct` — nonsensical).
- **Soft:** violations are penalized (e.g., cost penalty) but not eliminated. Often used for weak goals.

### §16.4 — Table 16.2: Six Patterns of Architectural Decisions (line 7523–7534)

| # | Pattern | Core Idea | Tradespace Size | Primary Tasks |
|---|---|---|---|---|
| 1 | **DECISION-OPTION** | Each decision has its own **independent** discrete option set | `Π_i m_i` | 3, 4 |
| 2 | **DOWN-SELECTING** | Choose a subset from a candidate set | `2^m` | 3, 6 |
| 3 | **ASSIGNING** | Assign each element of a left-set to any subset of a right-set | `2^(m·n)` | 2, 5 |
| 4 | **PARTITIONING** | Partition a set of entities into mutually exclusive & exhaustive subsets | Bell numbers | 1 |
| 5 | **PERMUTING** | Map entities 1:1 to positions | `n!` | 5 |
| 6 | **CONNECTING** | Define connections between nodes in a graph | `2^(n·(n−1)/2)` undirected | 5 |

> "Patterns should be seen not as mutually exclusive, but rather as complementary. That having been said, one Pattern typically is more useful than the others, because it provides more insight and/or leads to more efficient optimization."

### Per-Pattern Specifics

**DECISION-OPTION (line 7538–7583)**
- Most intuitive; most flexible.
- Each decision has its own option set — values in decision A mean nothing for decision B.
- No sequence, pre-conditions, or relationships implicitly assumed.
- Best represented by a **morphological matrix**.
- Directly fits Apollo's 9-decision problem.

**DOWN-SELECTING (line 7585–7634)**
- Binary vector of length `m`; tradespace size `2^m`.
- Like 0/1 knapsack, **with interactions**: elements have synergies, redundancies, interferences.

### Box 16.1 — Interactions between System Elements (line 7629–7633)

> "Good architectures in DOWN-SELECTING problems contain subsets of elements that 'work well together' compared to others, either because they are very synergistic or because they minimize interferences, or both. These dominating subsets are sometimes called **schemata**, especially in the context of adaptive systems."

> "Finding a good architecture in a DOWN-SELECTING Pattern is all about finding good schemata that have high synergies, low interferences, and low redundancy."

**Example — toothpaste + toothbrush (line 7631):** value of 3 tubes of toothpaste << 3 × value of 1 tube (redundancy); value of toothpaste alone ≈ 0 (synergy requires toothbrush).

**ASSIGNING (line 7636–7697) — Two extreme styles:**

1. **Channelized** (Figure 16.8) — each left element → exactly one right element. Low coupling, low connection cost. Maps to Suh's *Principle of Functional Independence* (each function → one form; each form → one function). Saturn V-style.
2. **Fully Cross-Strapped** (Figure 16.9) — every left connected to every right. High throughput/reliability at the cost of complexity and cost. Space Shuttle avionics; "Total Football" (all 10 players do both defense and offense).

> "The channelized versus fully cross-strapped trade-off applies to function-to-form mapping, and connectivity of form and function. In the case of form-to-function mapping, we can re-state Suh's principle of functional independence as a channelized architecture, where each function is accomplished by one piece of form, and each piece of form performs only one function. In the connectivity case, the tradeoff is basically throughput and reliability versus cost."

**PARTITIONING / PERMUTING / CONNECTING (Table 16.2; brief)**
- **PARTITIONING:** architecture = a set partition. Tradespace = Bell numbers. Typical for Task 1 (decomposition).
- **PERMUTING:** 1:1 mapping between entity set and position set. Tradespace = `n!`. Typical for sequence-of-operations.
- **CONNECTING:** edges in a graph. Tradespace = `2^(edges)`. Typical for Task 5 (topology).

### §16.3 — NEOSS Running Example (line 7471–7497)

NASA Earth Observing Satellite System — 3-part decomposition demonstrating multiple Patterns simultaneously:

1. **Instrument selection** — `DOWN-SELECTING` (which of 8 candidate instruments).
2. **Instrument packaging** — `ASSIGNING` (each selected instrument × each orbit).
3. **Satellite scheduling** — `PERMUTING` + temporal coupling (data-continuity needs).

> Demonstrates that a single real system naturally involves multiple Patterns, which must be **composed**.

### §16.6 — Heuristic Solvers (brief)

Because NP-hard:
- **Full-factorial enumeration** for small spaces.
- **Heuristic search:** genetic algorithms (NSGA-II), simulated annealing, knowledge-based rule systems.
- **Architecture styles** act as soft constraints that pre-prune the space.

### Patterns as Rhetorical Tools (line 7512)

> "Our discussion of Patterns goes beyond programmed decisions and optimization. Studying these Patterns will lead us to discuss typical architectural tradeoffs, as well as the main options for those tradeoffs, which we will call architectural 'styles' (such as monolithic versus distributed architectures and channelized versus cross-strapped architectures). The Patterns effectively provide a common vocabulary for communicating and discussing trade-offs and corresponding styles."

---

## Input Required

- `module-4.decision-network-foundations.v1` output (Phase 1) — decisions + constraints + metrics.
- `module-4.tradespace-pareto-sensitivity.v1` output (Phase 2) — Pareto-analyzed architecture space (informs which Pattern to use).
- `module-5.phase-4-solution-neutral-concept.v1` output — morphological matrix for DECISION-OPTION Pattern.

---

## Instructions for the LLM

### Sub-phase A: Architect task mapping (Table 16.1)

For each decision in Phase 1, emit an `architect_task_assignment`:
```
architect_task_assignment: Array<{
  decision_id: string,
  task: architectTaskSchema,    // one of Table 16.1's 6 tasks
}>
```

This is not strictly required for optimization, but is a reviewer-navigation aid and grounds decisions in Crawley's canonical task taxonomy.

### Sub-phase B: Pattern selection (Table 16.2)

For each sub-problem emit a `sub_problem`:
```
sub_problem: {
  sub_problem_id: string,
  name: string,
  pattern: patternSchema,                  // 6 Crawley patterns
  decisions: string[],                     // decision_ids from Phase 1
  constraints: string[],                   // constraint_ids from Phase 1
  metrics: string[],                       // metric_ids from Phase 1
  tradespace_size_formula: string,         // e.g., "2^m" for DOWN-SELECTING
  element_interactions: elementInteractionRecord[] | null,   // required for DOWN-SELECTING
  architecture_style: architectureStyleSchema | null,        // required for ASSIGNING / CONNECTING
}
```

### Sub-phase C: NEOSS-style composition (§16.3)

When multiple Patterns coexist:
```
composition: {
  operator: 'sum' | 'product' | 'weighted_sum' | 'custom',
  sub_problem_order: string[],              // evaluation order
  cross_pattern_constraints: string[],      // constraints spanning sub-problems
  composite_value_function_description: string,
}
```

### Sub-phase D: Value function (§16.2)

```
value_function: {
  metrics: string[],
  computation: valueFunctionKindSchema,     // equation | lookup | rules | simulation
  formula_ref?: string,                     // required for computation='equation'
  derivation?: mathDerivationSchema,        // required for computation='equation', scalar result
  lookup_table_ref?: string,                // required for computation='lookup'
  rules_source_ref?: string,                // required for computation='rules'
  simulation_tool?: string,                 // required for computation='simulation'
}
```

### Sub-phase E: Constraint hardness (§16.2)

```
constraint_hardness: {
  hard_constraint_ids: string[],            // violations eliminate the architecture
  soft_constraint_ids: Array<{
    constraint_id: string,
    penalty_formula: string,
    penalty_scalar: number,                 // scalar penalty weight
  }>,
}
```

### Sub-phase F: Solver selection (§16.6)

```
solver: {
  kind: solverKindSchema,                   // full_factorial | genetic_algorithm | nsga_ii | simulated_annealing | knowledge_based
  parameters: Record<string, unknown>,      // solver-specific config
  expected_runtime_seconds: number,
  architecture_count_estimate: number,
  justification: string,                    // why this solver for this tradespace size
}
```

### STOP GAP — 7±2 cap + pattern validity

Before marking `_phase_status: "complete"`:

1. **7±2 decision cap:** for any `pattern === 'DECISION_OPTION'`, flag warning if decision count > 9 (soft; does not fail). Full-factorial with > 9 decisions is infeasible — require splitting into sub-problems OR selecting a heuristic solver.
2. **Pattern requires its metadata:**
   - `DOWN-SELECTING` → `element_interactions` required.
   - `ASSIGNING` / `CONNECTING` → `architecture_style` required.
3. **Composite composition:** if multiple sub-problems, `composition.operator` and `composition.sub_problem_order` required.
4. **Solver consistency:** if `tradespace_size > 1e6`, `solver.kind !== 'full_factorial'`.
5. **Metric count:** `value_function.metrics.length >= 2 AND <= 5` (Crawley "ideally 2 or 3"; above 5, most architectures become non-dominated).

---

## Zod Schema

```ts
// apps/product-helper/lib/langchain/schemas/module-4/optimization-patterns.ts

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
  mathDerivationSchema,
} from '@/lib/langchain/schemas/module-2/_shared';

// Phase-local — Crawley Table 16.2 six patterns.
export const patternSchema = z
  .enum([
    'DECISION_OPTION',
    'DOWN_SELECTING',
    'ASSIGNING',
    'PARTITIONING',
    'PERMUTING',
    'CONNECTING',
  ])
  .describe(
    'x-ui-surface=section:Optimization > Pattern — Crawley Table 16.2 six architectural patterns.',
  );
export type Pattern = z.infer<typeof patternSchema>;

// Phase-local — Box 16.1 schemata / element interaction kinds.
export const elementInteractionKindSchema = z
  .enum(['synergy', 'redundancy', 'interference'])
  .describe(
    'x-ui-surface=section:Optimization > Element Interactions — Box 16.1 schemata kinds.',
  );

// Phase-local — Figures 16.8 / 16.9 architecture styles.
export const architectureStyleSchema = z
  .enum(['channelized', 'fully_cross_strapped', 'hybrid', 'none'])
  .describe(
    'x-ui-surface=section:Optimization > Style — Figure 16.8 channelized (Suh) vs Figure 16.9 fully cross-strapped.',
  );

// Phase-local — Crawley §16.2 value function computation kinds.
export const valueFunctionKindSchema = z
  .enum(['equation', 'lookup', 'rules', 'simulation'])
  .describe(
    'x-ui-surface=section:Optimization > Value Function — Crawley Box 14.1 property 5 computation kinds.',
  );

// Phase-local — Crawley §16.6 heuristic solver taxonomy.
export const solverKindSchema = z
  .enum([
    'full_factorial',
    'genetic_algorithm',
    'nsga_ii',
    'simulated_annealing',
    'knowledge_based',
  ])
  .describe(
    'x-ui-surface=section:Optimization > Solver — Crawley §16.6 solver taxonomy.',
  );

// Phase-local — Table 16.1 six architect tasks.
export const architectTaskSchema = z
  .enum([
    'decomposing_form_and_function',
    'mapping_function_to_form',
    'specializing_form_and_function',
    'characterizing_form_and_function',
    'connecting_form_and_function',
    'selecting_goals',
  ])
  .describe(
    'x-ui-surface=section:Optimization > Architect Task — Crawley Table 16.1 six tasks amenable to programmed decisions.',
  );

// Phase-local — composition operator when multiple sub-problems (NEOSS style).
export const compositionOperatorSchema = z
  .enum(['sum', 'product', 'weighted_sum', 'custom'])
  .describe(
    'x-ui-surface=section:Optimization > Composition — Crawley §16.3 NEOSS pattern composition operator.',
  );

export const elementInteractionRecordSchema = z
  .object({
    e_i: z.string(),
    e_j: z.string(),
    kind: elementInteractionKindSchema,
    weight: z.number(),
  })
  .describe(
    'x-ui-surface=section:Optimization > Element Interactions — one Box 16.1 schemata entry.',
  );

export const architectTaskAssignmentSchema = z.object({
  decision_id: z.string(),
  task: architectTaskSchema,
});

export const subProblemSchema = z
  .object({
    sub_problem_id: z.string(),
    name: z.string(),
    pattern: patternSchema,
    decisions: z.array(z.string()).min(1),
    constraints: z.array(z.string()).default([]),
    metrics: z.array(z.string()).min(1),
    tradespace_size_formula: z.string().describe(
      'x-ui-surface=section:Optimization > Sub-Problem — Crawley Table 16.2 formula (e.g., "2^m", "n!").',
    ),
    element_interactions: z.array(elementInteractionRecordSchema).nullable(),
    architecture_style: architectureStyleSchema.nullable(),
  })
  .describe(
    'x-ui-surface=section:Optimization > Sub-Problem — one Crawley pattern in the composition.',
  );

export const compositionSchema = z
  .object({
    operator: compositionOperatorSchema,
    sub_problem_order: z.array(z.string()).min(1),
    cross_pattern_constraints: z.array(z.string()).default([]),
    composite_value_function_description: z.string(),
  })
  .describe(
    'x-ui-surface=section:Optimization > Composition — NEOSS-style multi-pattern composition.',
  );

export const valueFunctionSchema = z
  .object({
    metrics: z.array(z.string()).min(2).max(5).describe(
      'x-ui-surface=section:Optimization > Value Function — Crawley "ideally 2 or 3, up to 5" metric cap.',
    ),
    computation: valueFunctionKindSchema,
    formula_ref: z.string().optional(),
    derivation: mathDerivationSchema.optional(),
    lookup_table_ref: z.string().optional(),
    rules_source_ref: z.string().optional(),
    simulation_tool: z.string().optional(),
  })
  .describe(
    'x-ui-surface=section:Optimization > Value Function — Crawley §16.2 V(A) formulation.',
  );

export const constraintHardnessSchema = z
  .object({
    hard_constraint_ids: z.array(z.string()).default([]),
    soft_constraint_ids: z
      .array(
        z.object({
          constraint_id: z.string(),
          penalty_formula: z.string(),
          penalty_scalar: z.number(),
        }),
      )
      .default([]),
  })
  .describe(
    'x-ui-surface=section:Optimization > Constraint Hardness — Crawley §16.2 hard/soft classification.',
  );

export const solverSchema = z
  .object({
    kind: solverKindSchema,
    parameters: z.record(z.string(), z.unknown()).default({}),
    expected_runtime_seconds: z.number().nonneg(),
    architecture_count_estimate: z.number().int().nonneg(),
    justification: z.string(),
  })
  .describe(
    'x-ui-surface=section:Optimization > Solver — Crawley §16.6 solver selection.',
  );

export const optimizationPatternsSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-4.optimization-patterns.v1'),
    architect_task_assignments: z.array(architectTaskAssignmentSchema).default([]),
    sub_problems: z.array(subProblemSchema).min(1),
    composition: compositionSchema.optional().describe(
      'x-ui-surface=section:Optimization > Composition — required when sub_problems.length > 1.',
    ),
    value_function: valueFunctionSchema,
    constraint_hardness: constraintHardnessSchema,
    solver: solverSchema,
    non_dominated_architecture_ids: z.array(z.string()).default([]).describe(
      'x-ui-surface=section:Optimization > Pareto Set — scalar list; per-architecture metrics stay scalar via Phase-2 architecture_record.metric_values.',
    ),
    crawley_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M4 Phase 3: optimization patterns per Crawley Ch 16.',
  );

export type OptimizationPatterns = z.infer<typeof optimizationPatternsSchema>;
```

### Refinement — Pattern validity + solver consistency + metric count

```ts
export const optimizationPatternsWithInvariants =
  optimizationPatternsSchema.superRefine((val, ctx) => {
    // 1. Pattern metadata presence.
    for (const sp of val.sub_problems) {
      if (sp.pattern === 'DOWN_SELECTING' && !sp.element_interactions) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sub_problems'],
          message: `Crawley Box 16.1: sub-problem "${sp.name}" has pattern DOWN_SELECTING but no element_interactions. Schemata analysis (synergies / redundancies / interferences) is required.`,
        });
      }
      if (
        (sp.pattern === 'ASSIGNING' || sp.pattern === 'CONNECTING') &&
        !sp.architecture_style
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sub_problems'],
          message: `Crawley §16.4: sub-problem "${sp.name}" has pattern ${sp.pattern} but no architecture_style (channelized / fully_cross_strapped / hybrid). Required for the Suh functional-independence trade-off surface.`,
        });
      }
    }

    // 2. Composition required for multi-subproblem.
    if (val.sub_problems.length > 1 && !val.composition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['composition'],
        message: `Crawley §16.3 NEOSS: ${val.sub_problems.length} sub-problems present but composition is missing. Multi-pattern systems require explicit composition operator + order.`,
      });
    }

    // 3. 7±2 advisory on DECISION_OPTION with full_factorial solver.
    for (const sp of val.sub_problems) {
      if (
        sp.pattern === 'DECISION_OPTION' &&
        sp.decisions.length > 9 &&
        val.solver.kind === 'full_factorial'
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['solver', 'kind'],
          message: `Crawley §16.2 line 7455: 7±2 decision cap exceeded (${sp.decisions.length}) with full_factorial solver. NP-hard at this scale; switch to nsga_ii / genetic_algorithm / knowledge_based OR split into sub-problems.`,
        });
      }
    }

    // 4. Solver consistency for large tradespace.
    if (
      val.solver.architecture_count_estimate > 1_000_000 &&
      val.solver.kind === 'full_factorial'
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['solver', 'kind'],
        message: `Solver kind "full_factorial" infeasible for architecture_count_estimate=${val.solver.architecture_count_estimate}. Use heuristic solver (§16.6).`,
      });
    }

    // 5. Value function gating — equation requires derivation; lookup requires table; rules requires source; simulation requires tool.
    const vf = val.value_function;
    if (vf.computation === 'equation' && !vf.derivation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value_function'],
        message: 'value_function.computation === "equation" requires derivation (mathDerivationSchema).',
      });
    }
    if (vf.computation === 'lookup' && !vf.lookup_table_ref) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value_function'],
        message: 'value_function.computation === "lookup" requires lookup_table_ref.',
      });
    }
    if (vf.computation === 'rules' && !vf.rules_source_ref) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value_function'],
        message: 'value_function.computation === "rules" requires rules_source_ref.',
      });
    }
    if (vf.computation === 'simulation' && !vf.simulation_tool) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value_function'],
        message: 'value_function.computation === "simulation" requires simulation_tool.',
      });
    }
  });
```

---

## NFREngineInterpreter boundary note

**Critical:** this phase captures the **optimization problem formulation**, not the solver implementation. NFREngineInterpreter:
- **Reads** sub_problems + composition + value_function + constraint_hardness + solver config.
- **Orchestrates** the solver kind via a tool call (full_factorial = enumeration loop; nsga_ii / genetic / simulated_annealing = external library tool call; knowledge_based = LLM-grounded rules eval via Crawley-KB lookups).
- **Does NOT** implement genetic algorithms, simulated annealing, etc. as sibling engine classes.

No `OptimizationEngine`, `GeneticSolver`, `PatternSolver` introduced. All solver execution is orchestrator-invoked.

---

## mathDerivationV2 impact

**None.** Value function equations produce scalar V(A) outputs. Pareto set emitted as `non_dominated_architecture_ids: string[]` — a list of references, not a vector-valued derivation. Per-architecture metric values live in Phase-2 `architecture_record.metric_values: Record<metric_id, number>` — scalar per entry. Tally holds at 2.

---

## c1v applicability summary

| Methodology rule | Enforced by |
|---|---|
| 6 Crawley Patterns | `patternSchema` + `.superRefine()` metadata gates |
| DOWN-SELECTING schemata (Box 16.1) | `element_interactions[]` required when pattern is DOWN_SELECTING |
| ASSIGNING/CONNECTING styles (Suh channelized vs cross-strapped) | `architecture_style` required when pattern is ASSIGNING/CONNECTING |
| NEOSS multi-pattern composition | `composition` required when sub_problems.length > 1 |
| Hard vs soft constraints | `constraint_hardness` discriminator; soft requires penalty_scalar |
| 7±2 decision cap + full-factorial infeasibility | `.superRefine()` advisory |
| Metric count 2–5 (Crawley "ideally 2 or 3") | `.min(2).max(5)` on value_function.metrics |
| Solver consistency | `.superRefine()` blocks full_factorial at > 1M architectures |
| 6 architect tasks (Table 16.1) | `architect_task_assignments[]` optional reviewer-navigation aid |

---

## Citations

- **Crawley, Cameron, Selva (2015).** Ch 16.
  - Table 16.1 — Six Architect Tasks (book_md line 7412–7421)
  - §16.2 Generic Optimization Formulation (book_md line 7425–7469)
  - Hard vs Soft Constraints (book_md line 7465–7468)
  - §16.3 NEOSS Running Example (book_md line 7471–7497)
  - Patterns as rhetorical tools (book_md line 7512)
  - §16.4 Table 16.2 — Six Patterns (book_md line 7523–7534)
  - DECISION-OPTION specifics (book_md line 7538–7583)
  - DOWN-SELECTING specifics (book_md line 7585–7634)
  - Box 16.1 — Element Interactions / Schemata (book_md line 7629–7633)
  - ASSIGNING Figures 16.8 / 16.9 (book_md line 7636–7697)
  - §16.6 Heuristic Solvers (book_md §16.6)

- **Suh, N. P.** *Principle of Functional Independence.* *(cited Crawley §16.4 ASSIGNING)*

- **Deb, K., Pratap, A., Agarwal, S., & Meyarivan, T. (2002).** NSGA-II. *(cited §16.6)*

- **Cross-references:**
  - `./01-Decision-Network-Foundations.md` — sibling M4 Phase 1 (decisions + constraints + metrics consumed here).
  - `./02-Tradespace-Pareto-Sensitivity.md` — sibling M4 Phase 2 (Pareto + sensitivity analysis).
  - `../5-form-function-mapping/04-Phase-4-Solution-Neutral-Concept.md` — morphological matrix feeds DECISION-OPTION pattern.
  - `../5-form-function-mapping/03-Phase-3-Form-Function-Concept.md` — PF array feeds ASSIGNING pattern.
  - `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` — phaseEnvelopeSchema, mathDerivationSchema, sourceRefSchema.

**Ruling anchors:**
- Handoff §3 — M4 Crawley hybrid direction approved.
- Handoff §3 2026-04-21 ~14:30 — NFREngineInterpreter is sole executor; no `OptimizationEngine` introduced.
- Team-lead 2026-04-21 — phase-local enum pattern green-lit; 6 new enums stay module-local.
- Curator scalar-decomposition discipline: Pareto set = `string[]` + per-arch scalar metrics. No mathDerivationV2 candidate.
