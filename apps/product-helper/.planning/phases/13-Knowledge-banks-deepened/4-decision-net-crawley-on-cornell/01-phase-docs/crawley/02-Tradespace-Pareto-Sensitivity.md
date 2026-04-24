---
name: M4 — Tradespace, Pareto Frontier & Sensitivity (Crawley Ch 15)
module: M4 Decision Network (MIT/Crawley core)
phase_number: 2
phase_slug: "tradespace-pareto-sensitivity"
schema_version: "1.0.0"
zod_schema_id: "m4.tradespace.v1"
zod_target_path: "apps/product-helper/lib/langchain/schemas/module-4/tradespace-pareto-sensitivity.ts"
source_chapter: "Crawley, Cameron, Selva (2015), Ch 15 — Reasoning about Architectural Tradespaces"
source_sections:
  - "§15.1 Tradespace definition + metric guidance"
  - "§15.3 The Pareto Frontier and Dominance (strong/weak/non-dominated)"
  - "§15.3 The Fuzzy Pareto Frontier (rank cutoff + Euclidean threshold)"
  - "§15.3 Utopia Point"
  - "§15.3 Mining the Pareto frontier (Table 15.2 relative-frequency)"
  - "§15.4 Structure of the Tradespace (clusters / stratification / holes)"
  - "§15.5 Sensitivity Analysis (three regions; Latin hypercubes)"
  - "§15.5 Box 15.1 Principle of Robustness of Architectures"
  - "§15.6 Organizing Architectural Decisions (sensitivity vs connectivity 4-quadrant view)"
  - "§15.6 Box 15.2 Principle of Coupling and Organization of Architectural Decisions"
  - "§15.6 Apollo decision hierarchy (Figure 15.16)"
page_range: "book_md lines 6966–7359"
validation_needed: false
derivation_source: "Crawley Ch 15 (primary source). dominanceKindSchema + fuzzyParetoStrategySchema + sensitivityRegionSchema + decisionQuadrantSchema are phase-local Zod enums introduced here. All Pareto math fits scalar mathDerivationSchema via per-architecture / per-decision / per-metric decomposition; NO V2 candidates from this phase."
nfr_engine_slot: "NFREngineInterpreter reads tradespace + sensitivity + robustness analysis when resolving architectural NFRs (e.g., 'robust to demand variation', 'Pareto-optimal under budget X'). Handles the 'viewing' DSS task (Crawley §14.4 task 4)."
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-21"
---

# M4 Phase 2 — Tradespace, Pareto & Sensitivity (Crawley Ch 15)

> **Scope.** Consumes `decisions[]` + `metrics[]` + architecture enumeration from Phase 1 (Decision Network Foundations) and produces the **tradespace analysis**: Pareto frontier (+ fuzzy), dominance classification, clustering/stratification, sensitivity analysis with 3-region robustness assessment, and the sensitivity-vs-connectivity **4-quadrant decision-organization view** that drives decision ordering.
>
> **This phase handles the "viewing" DSS task** (Crawley §14.4 task 4) deferred from Phase 1.
>
> **Box 15.1 is the sacred gate:** *"Optimal architectures, in the Pareto sense, are often the least robust."* c1v's recommendation must surface both Pareto-rank AND fuzzy-Pareto robustness.

---

## Knowledge

### Tradespace definition (line 6966)

> "In general, a tradespace is a representation of a set of architectures in a space defined by two or more metrics."

**Metric guidance (line 6974–6984):**
- Keep all metrics **transparent** (avoid aggregated stakeholder-satisfaction scores).
- **Avoid single aggregate metrics** that hide weightings.
- Identify the **2–3 metrics** representing important tradeoffs.
- Don't present a long list of undifferentiated metrics; use high-priority metrics for tradeoffs and lower-priority metrics to differentiate remaining options.

### §15.3 — Pareto Frontier and Dominance (line 7024–7140)

**Dominance (line 7038):**
- **Strong dominance:** `A1` strongly dominates `A2` if `A1` is better than `A2` in **all** metrics.
- **Weak dominance:** `A1` is at least as good as `A2` in all metrics, and strictly better in at least one.
- **Non-dominated:** no architecture dominates it → on the **Pareto frontier**.

**Pareto ranking (non-dominated sorting, line 7130–7138):**
- Rank-1 architectures = Pareto frontier of the full set.
- Rank-2 = Pareto frontier after removing rank-1.
- Recursively until all architectures are ranked.
- Worst-case complexity: `O(N × (N²)·M)` for `M` metrics and `N` architectures. Faster via Deb et al. 2002 (NSGA-II).

**Utopia point (line 7072):**
> "When analyzing a Pareto plot, our first instinct must be to look for the Utopia point, an imaginary point on the tradespace that would have the best possible scores in all metrics."

Warning: "Numerical distance from an architecture to the Utopia point cannot be used to determine whether one architecture dominates another."

### Fuzzy Pareto Frontier (line 7084–7088)

> "Some slightly dominated architectures may actually outperform non-dominated ones, judging on the basis of other metrics or constraints not shown in the plot, and this makes them excellent candidates for further study."

**Two implementations:**
1. All architectures with Pareto rank ≤ 3.
2. All architectures within some Euclidean distance threshold (e.g., 10% in fully normalized objective space) to the rank-1 frontier.

### Mining the Pareto frontier (Table 15.2, line 7092–7126)

Compute **relative frequency** of an architectural feature `D1` inside vs outside the Pareto front.
- Feature is "dominant" if it appears at much higher frequency on the Pareto front than in the full tradespace.
- Table 15.2 example:
  - "Fully cross-strapped" — 2% of tradespace, 100% of Pareto front → **necessary condition** for Pareto.
  - "Homogeneous" — 7% of tradespace, 33% of Pareto front → **not necessary** but over-represented.
  - "Has sensor of type C" — 59% in tradespace, 56% in Pareto front → **no effect**.

### §15.4 — Structure of the Tradespace (line 7140–7174)

> "Pareto analysis is an important part of tradespace analysis, but it is by no means sufficient. There is a great deal to be learned from looking at the structure and features of the tradespace as a whole."

Three structural features:
1. **Clusters** — "accumulation of architectures in relatively small regions in the objective space." Distance in objective-space ≠ distance in architecture-space.
2. **Stratification** — groups where one metric is constant while the other varies (vertical/horizontal lines with gaps). Appears when metrics are discrete OR when combinations produce only a few distinct metric values.
3. **Holes / subgroups / fronts** — caused by "discrete metrics, different dynamic ranges of metrics, and physical laws limiting certain metrics."

> "When a tradespace is stratified, most of the architectures are dominated by a handful of N non-dominated architectures, where N is typically equal to the number of strata."

### §15.5 — Sensitivity Analysis (line 7178–7247)

Re-run the model under different scenarios (each scenario = one set of modeling assumptions), then compute how much the Pareto front / key architectural features shift.

**Result-robustness sanity check (Figure 15.12–15.13):** GNC example — "100% cross-strapped on the Pareto front" held only for connection-weight=0. At connection-weight=0.02 (a 2% change), the percentage dropped below 30% → the "cross-strapped dominates" result is **NOT robust**.

**Three sensitivity regions (line 7190–7195):**
1. **Low-sensitivity low end** — feature percentage near 0 across a range.
2. **Sensitive middle region** — percentage varies smoothly.
3. **Low-sensitivity high end** — percentage near 100 across a range.

A result in the **sensitive middle region is NOT robust** to assumptions.

**Design of experiments:** full-factorial sweeps grow fast. Use **Latin hypercubes** and **orthogonal arrays** (Ch 16) for representative subset of scenarios.

### Box 15.1 — Principle of Robustness of Architectures (line 7226–7240)

> "Good architectures need to respond to all manner of variations. They can respond to these variations by being robust (capable of dealing with variations in the environment) or by being adaptable (able to adapt to changes in the environment). Optimal architectures, in the Pareto sense, are often the least robust."

> "Using the fuzzy Pareto frontier instead of the Pareto frontier in the context of architecture optimization can also help identify the more robust architectures."

### §15.6 — Organizing Architectural Decisions (line 7248–7347)

**Two axes of "decision impact":**
1. **Sensitivity** — how much the metric changes when a decision flips.
2. **Connectivity** — how many other decisions this decision is coupled to (via logical/reasonableness/metric constraints).

**Sensitivity (main effect, line 7270–7282):**

For a binary decision `i`:
```
main_effect_i = |mean(metric | decision_i = 1) − mean(metric | decision_i = 0)|
```

For a decision with `k` values:
```
sensitivity_i = Σ_k |mean(metric | decision_i = k) − mean(metric | decision_i ≠ k)|
```

Calculate sensitivity over the **full tradespace** (initial exploration) or the **fuzzy Pareto front** (later-stage refinement).

**Connectivity:** count the number of logical (and/or reasonableness, and/or metric) constraints involving the decision. In Apollo: LOR appears in 4 constraints → connectivity = 4.

### Decision-Space View — 4 quadrants (Figure 15.15, line 7290–7308)

Plot: **sensitivity (Y) vs connectivity (X).**

| Quadrant | Interpretation | Priority |
|---|---|---|
| **I** (high sens + high conn) | Impacts both metric and downstream decisions | **Decide FIRST** |
| **II** (high sens + low conn) | Strong metric impact, analyzable independently | Decide second |
| **III** (low sens + high conn) | "Classic detailed design decisions" | Decide late |
| **IV** (low sens + low conn) | Neither impactful nor coupled | Decide in parallel or at the end |

### Box 15.2 — Principle of Coupling and Organization (line 7318–7329)

> "Architecture can be thought of as the outcome of a relatively small number of important decisions. These decisions are highly coupled, and the sequence in which they are made is important. The sequence of architectural decisions can be chosen by considering the sensitivity of the metrics to the decisions and the degree of connectivity of decisions."

**Additional sequencing rules:**
- Weakly coupled decisions should be treated **in parallel** (avoid cost of waiting).
- Highly coupled decisions should be **combined in a single trade study** (to capture interaction effects).
- **Maximize intra-group interdependency, minimize inter-group dependency.**

### Apollo decision hierarchy (Figure 15.16, line 7336–7341)

- Root = `LOR` (most coupled + most sensitive).
- Three parallel clusters below: `{lmCrew, lmFuel}`, `{moonArrival, moonDeparture}`, `{smFuel, cmCrew}`.
- Leaf = `EOR` (least coupled — decide last).

### Formulation-dependent connectivity (line 7262–7268)

> "This definition of connectivity depends on the formulation of the decisions in the architectural model. … If a set of decisions are highly coupled, such as the five binary mission-mode decisions, it is usually preferable to replace them with a single decision. This makes the model simpler by reducing the number of decisions and removing unnecessary constraints."

---

## Input Required

- `module-4.decision-network-foundations.v1` output with `_phase_status: "complete"`.
- Enumerated architectures list (candidates from morphological matrix).
- Metric evaluation function (or tool call) per architecture.

---

## Instructions for the LLM

### Sub-phase A: Architecture evaluation

For each enumerated architecture, emit an `architecture_record`:
```
architecture_record: {
  architecture_id: string,
  decision_assignments: Record<decision_id, alternative_id>,
  metric_values: Record<metric_id, number>,
  violates_logical_constraint: boolean,
  reasonableness_penalty: number,
}
```

Exclude `violates_logical_constraint: true` records from Pareto analysis.

### Sub-phase B: Pareto ranking (dominance)

Emit `pareto_analysis`:
```
pareto_analysis: {
  architectures_by_rank: Array<{
    architecture_id: string,
    pareto_rank: int,                    // 1 = Pareto frontier
    dominance_kind: 'strong' | 'weak' | 'non_dominated',
  }>,
  utopia_point: Record<metric_id, number>,  // best-possible per metric
  non_dominated_ids: string[],
}
```

### Sub-phase C: Fuzzy Pareto frontier

Emit `fuzzy_pareto`:
```
fuzzy_pareto: {
  strategy: 'rank_cutoff' | 'euclidean_threshold',
  rank_cutoff?: int,                     // default 3 (Crawley line 7086)
  euclidean_threshold?: number,          // default 0.10 (10% normalized)
  fuzzy_pareto_ids: string[],
}
```

### Sub-phase D: Frontier mining (Table 15.2 relative frequency)

Emit `frontier_mining`:
```
frontier_mining: Array<{
  feature_description: string,
  frequency_in_tradespace: number (0–1),
  frequency_in_pareto: number (0–1),
  classification: 'necessary_condition' | 'over_represented' | 'no_effect' | 'under_represented',
}>
```

Classification rule per Crawley Table 15.2:
- `frequency_in_pareto >= 0.95 AND frequency_in_tradespace < 0.5` → `necessary_condition`
- `frequency_in_pareto > frequency_in_tradespace * 1.5` → `over_represented`
- `|frequency_in_pareto − frequency_in_tradespace| < 0.05` → `no_effect`
- `frequency_in_pareto < frequency_in_tradespace * 0.5` → `under_represented`

### Sub-phase E: Tradespace structure

Emit `tradespace_structure`:
```
tradespace_structure: {
  clusters: Array<{cluster_id, metric_range: Record<metric_id, [min, max]>, member_architecture_ids}>,
  strata: Array<{metric_id, value, architecture_count}>,
  holes_detected: boolean,
  holes_notes: string | null,
}
```

### Sub-phase F: Sensitivity analysis (§15.5)

Emit `sensitivity_analysis`:
```
sensitivity_analysis: {
  scenarios_tested: int,
  design_of_experiments: 'full_factorial' | 'latin_hypercube' | 'orthogonal_array' | 'manual',
  per_decision_sensitivity: Array<{
    decision_id: string,
    metric_id: string,
    main_effect: number,                 // scalar per decision-metric pair
    region: 'low_sensitivity_low' | 'sensitive_middle' | 'low_sensitivity_high',
    robust_across_scenarios: number (0–1),
  }>,
  pareto_frontier_shift_under_scenarios: number (0–1),  // fraction of rank-1 architectures that change rank across scenarios
}
```

**Emit each `main_effect` as a separate scalar `mathDerivation` record** (one per decision-metric pair). Avoids record-valued result → not a V2 candidate.

### Sub-phase G: Decision organization (§15.6 4-quadrant view)

For each decision emit a `decision_organization` entry:
```
decision_organization: Array<{
  decision_id: string,
  sensitivity: number,                   // aggregated across metrics
  connectivity: int,                     // from Phase-1 decision_dsm
  quadrant: 'i_high_sens_high_conn' | 'ii_high_sens_low_conn' | 'iii_low_sens_high_conn' | 'iv_low_sens_low_conn',
  decide_order: int,                     // 1 = first; derived from quadrant per Figure 15.15
}>
```

### Sub-phase H: Refactor suggestions (line 7265)

Emit `refactor_suggestions[]` as lint-style advisories (NOT hard fails):
```
refactor_suggestions: Array<{
  kind: 'merge_coupled_decisions' | 'split_uncoupled_decision' | 'eliminate_no_effect_variable',
  decision_ids: string[],
  rationale: string,
}>
```

### STOP GAP — Robustness + 4-quadrant ordering invariants

Before marking `_phase_status: "complete"`:

1. **Sensitivity analysis performed:** `sensitivity_analysis.scenarios_tested >= 3` (minimum viable coverage).
2. **Box 15.1 robustness check:** for every non-dominated architecture, `robust_across_scenarios >= 0.8` OR it appears in `fuzzy_pareto.fuzzy_pareto_ids` (robust alternative exists nearby).
3. **4-quadrant ordering:** every decision in `decision_organization` has `quadrant` assigned AND `decide_order` such that Quadrant-I decisions precede Quadrant-II which precede Quadrant-III which precede Quadrant-IV.
4. **Metric transparency:** no single aggregated metric; at least 2 visible metrics in `pareto_analysis` (Crawley line 6974: "avoid single aggregate metrics").

---

## Zod Schema

```ts
// apps/product-helper/lib/langchain/schemas/module-4/tradespace-pareto-sensitivity.ts

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
  mathDerivationSchema,
} from '@/lib/langchain/schemas/module-2/_shared';

// Phase-local — Crawley §15.3 three dominance classifications.
export const dominanceKindSchema = z
  .enum(['strong', 'weak', 'non_dominated'])
  .describe(
    'x-ui-surface=section:Tradespace > Pareto — Crawley §15.3 dominance classification.',
  );

// Phase-local — Crawley §15.3 fuzzy Pareto strategies.
export const fuzzyParetoStrategySchema = z
  .enum(['rank_cutoff', 'euclidean_threshold'])
  .describe(
    'x-ui-surface=section:Tradespace > Fuzzy Pareto — Crawley line 7086 two strategies.',
  );

// Phase-local — Crawley §15.5 three sensitivity regions.
export const sensitivityRegionSchema = z
  .enum(['low_sensitivity_low', 'sensitive_middle', 'low_sensitivity_high'])
  .describe(
    'x-ui-surface=section:Tradespace > Sensitivity — Crawley §15.5 three-region robustness classifier.',
  );

// Phase-local — Figure 15.15 sensitivity-vs-connectivity 4 quadrants.
export const decisionQuadrantSchema = z
  .enum([
    'i_high_sens_high_conn',
    'ii_high_sens_low_conn',
    'iii_low_sens_high_conn',
    'iv_low_sens_low_conn',
  ])
  .describe(
    'x-ui-surface=section:Tradespace > Decision Organization — Figure 15.15 4-quadrant view.',
  );

// Phase-local — Table 15.2 frontier mining classification.
export const frontierMiningClassSchema = z
  .enum(['necessary_condition', 'over_represented', 'no_effect', 'under_represented'])
  .describe(
    'x-ui-surface=section:Tradespace > Frontier Mining — Table 15.2 feature-frequency classification.',
  );

// Phase-local — Design-of-experiments methods (Crawley line 7200+).
export const designOfExperimentsSchema = z
  .enum(['full_factorial', 'latin_hypercube', 'orthogonal_array', 'manual'])
  .describe(
    'x-ui-surface=section:Tradespace > Sensitivity — Crawley §15.5 DoE methods.',
  );

export const architectureRecordSchema = z.object({
  architecture_id: z.string(),
  decision_assignments: z.record(z.string(), z.string()),
  metric_values: z.record(z.string(), z.number()),
  violates_logical_constraint: z.boolean().default(false),
  reasonableness_penalty: z.number().default(0),
});

export const paretoAnalysisEntrySchema = z.object({
  architecture_id: z.string(),
  pareto_rank: z.number().int().min(1),
  dominance_kind: dominanceKindSchema,
});

export const paretoAnalysisSchema = z
  .object({
    architectures_by_rank: z.array(paretoAnalysisEntrySchema).min(1),
    utopia_point: z.record(z.string(), z.number()),
    non_dominated_ids: z.array(z.string()).min(1),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Pareto — full Pareto analysis with utopia point.',
  );

export const fuzzyParetoSchema = z
  .object({
    strategy: fuzzyParetoStrategySchema,
    rank_cutoff: z.number().int().min(1).optional(),
    euclidean_threshold: z.number().min(0).max(1).optional(),
    fuzzy_pareto_ids: z.array(z.string()),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Fuzzy Pareto — Crawley line 7084 extension to rank-1 frontier.',
  );

export const frontierMiningEntrySchema = z
  .object({
    feature_description: z.string(),
    frequency_in_tradespace: z.number().min(0).max(1),
    frequency_in_pareto: z.number().min(0).max(1),
    classification: frontierMiningClassSchema,
  })
  .describe(
    'x-ui-surface=section:Tradespace > Frontier Mining — one feature-frequency row (Table 15.2).',
  );

export const clusterSchema = z.object({
  cluster_id: z.string(),
  metric_range: z.record(z.string(), z.tuple([z.number(), z.number()])),
  member_architecture_ids: z.array(z.string()),
});

export const stratumSchema = z.object({
  metric_id: z.string(),
  value: z.number(),
  architecture_count: z.number().int().nonneg(),
});

export const tradespaceStructureSchema = z
  .object({
    clusters: z.array(clusterSchema).default([]),
    strata: z.array(stratumSchema).default([]),
    holes_detected: z.boolean(),
    holes_notes: z.string().nullable(),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Structure — Crawley §15.4 clusters + strata + holes.',
  );

export const perDecisionSensitivitySchema = z.object({
  decision_id: z.string(),
  metric_id: z.string(),
  main_effect: z.number().nonneg(),
  main_effect_derivation: mathDerivationSchema.extend({
    formula: z.literal(
      '|mean(metric | decision_i = k) − mean(metric | decision_i ≠ k)| summed over k',
    ),
    kb_source: z.literal('inline'),
    kb_section: z.literal('Crawley Ch 15 §15.6 book_md line 7270–7282'),
  }),
  region: sensitivityRegionSchema,
  robust_across_scenarios: z.number().min(0).max(1),
});

export const sensitivityAnalysisSchema = z
  .object({
    scenarios_tested: z.number().int().min(1),
    design_of_experiments: designOfExperimentsSchema,
    per_decision_sensitivity: z.array(perDecisionSensitivitySchema).min(1),
    pareto_frontier_shift_under_scenarios: z.number().min(0).max(1),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Sensitivity — Crawley §15.5 full sensitivity analysis.',
  );

export const decisionOrganizationEntrySchema = z.object({
  decision_id: z.string(),
  sensitivity: z.number().nonneg(),
  connectivity: z.number().int().nonneg(),
  quadrant: decisionQuadrantSchema,
  decide_order: z.number().int().min(1),
});

export const refactorSuggestionSchema = z.object({
  kind: z.enum([
    'merge_coupled_decisions',
    'split_uncoupled_decision',
    'eliminate_no_effect_variable',
  ]),
  decision_ids: z.array(z.string()),
  rationale: z.string(),
});

export const tradespaceParetoSensitivitySchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-4.tradespace-pareto-sensitivity.v1'),
    architectures: z.array(architectureRecordSchema).min(2).describe(
      'x-ui-surface=section:Tradespace > Architectures — ≥2 architectures required for meaningful comparison.',
    ),
    pareto_analysis: paretoAnalysisSchema,
    fuzzy_pareto: fuzzyParetoSchema,
    frontier_mining: z.array(frontierMiningEntrySchema).default([]),
    tradespace_structure: tradespaceStructureSchema,
    sensitivity_analysis: sensitivityAnalysisSchema,
    decision_organization: z.array(decisionOrganizationEntrySchema).min(1),
    refactor_suggestions: z.array(refactorSuggestionSchema).default([]),
    crawley_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M4 Phase 2: tradespace + Pareto + sensitivity per Crawley Ch 15.',
  );

export type TradespaceParetoSensitivity = z.infer<typeof tradespaceParetoSensitivitySchema>;
```

### Refinement — Box 15.1 robustness gate + 4-quadrant ordering + metric transparency

```ts
export const tradespaceParetoSensitivityWithInvariants =
  tradespaceParetoSensitivitySchema.superRefine((val, ctx) => {
    // 1. Box 15.1 robustness gate.
    if (val._phase_status === 'complete') {
      if (val.sensitivity_analysis.scenarios_tested < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sensitivity_analysis', 'scenarios_tested'],
          message: `Crawley Box 15.1: fewer than 3 scenarios tested (got ${val.sensitivity_analysis.scenarios_tested}). Robustness cannot be evaluated.`,
        });
      }

      // Every non-dominated architecture must be robust OR have a fuzzy-Pareto alternative.
      for (const archId of val.pareto_analysis.non_dominated_ids) {
        const sensitivitiesForArch = val.sensitivity_analysis.per_decision_sensitivity
          .filter((s) => s.robust_across_scenarios !== undefined);
        const minRobust = sensitivitiesForArch.length > 0
          ? Math.min(...sensitivitiesForArch.map((s) => s.robust_across_scenarios))
          : 0;
        const hasFuzzyAlt = val.fuzzy_pareto.fuzzy_pareto_ids.length > val.pareto_analysis.non_dominated_ids.length;
        if (minRobust < 0.8 && !hasFuzzyAlt) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['pareto_analysis', 'non_dominated_ids'],
            message: `Crawley Box 15.1: non-dominated architecture "${archId}" has robustness ${minRobust.toFixed(2)} < 0.8 AND fuzzy-Pareto has no additional alternatives. Optimal-but-fragile warning.`,
          });
          break;
        }
      }
    }

    // 2. 4-quadrant ordering invariant.
    const quadrantPriority: Record<string, number> = {
      i_high_sens_high_conn: 1,
      ii_high_sens_low_conn: 2,
      iii_low_sens_high_conn: 3,
      iv_low_sens_low_conn: 4,
    };
    const sorted = [...val.decision_organization].sort(
      (a, b) => a.decide_order - b.decide_order,
    );
    for (let i = 1; i < sorted.length; i++) {
      const prev = quadrantPriority[sorted[i - 1].quadrant];
      const curr = quadrantPriority[sorted[i].quadrant];
      if (prev > curr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['decision_organization'],
          message: `Crawley Figure 15.15 / Box 15.2: quadrant priority violated — decision "${sorted[i - 1].decision_id}" (quadrant ${sorted[i - 1].quadrant}, order ${sorted[i - 1].decide_order}) precedes "${sorted[i].decision_id}" (quadrant ${sorted[i].quadrant}, order ${sorted[i].decide_order}).`,
        });
        break;
      }
    }

    // 3. Metric transparency.
    const metricsInPareto = Object.keys(val.pareto_analysis.utopia_point);
    if (metricsInPareto.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pareto_analysis', 'utopia_point'],
        message: `Crawley line 6974: "avoid single aggregate metrics." At least 2 visible metrics required for tradespace. Got ${metricsInPareto.length}.`,
      });
    }
  });
```

---

## NFREngineInterpreter boundary note

NFREngineInterpreter orchestrates:
- **Architecture enumeration** via Phase-1 decision assignments (tool call).
- **Metric evaluation per architecture** via per-metric `computation_kind` tool calls (equation / lookup / additive / multiplicative).
- **Pareto ranking** as a data transformation (tool call invoking NSGA-II-style sorter) — NOT a sibling `ParetoEngine` class.
- **Sensitivity analysis** as repeated architecture enumeration under varied scenarios — tool-call loop.
- **Viewing** — rendering tradespace plots, decision hierarchy diagrams — output of this phase.

No `TradespaceEngine`, `ParetoSolver`, `SensitivityEngine` introduced. Every algorithmic step is a tool call orchestrated by NFREngineInterpreter; this phase captures inputs + outputs as Zod data.

---

## mathDerivationV2 impact

**None.** Sensitivity `main_effect` is scalar per (decision, metric) pair — decomposed into N separate `mathDerivation` records (one per pair) rather than a single record with `Record<metric, number>` result. Pareto rank is `int` per architecture (scalar). Dominance is enum (scalar). Fuzzy Pareto threshold is `number` (scalar). Tally unchanged at 2 (PO array + 9-block DSM).

**Curator note:** deliberately decomposed `sensitivity_per_metric` into N records to avoid widening shared schema. See `perDecisionSensitivitySchema` — each row emits its own `main_effect_derivation` field instead of emitting one derivation with a record-valued result.

---

## c1v applicability summary

| Methodology rule | Enforced by |
|---|---|
| Pareto frontier + ranking | `pareto_analysis` with `dominanceKindSchema` |
| Fuzzy Pareto (Box 15.1 robustness) | `fuzzy_pareto` with two-strategy enum |
| Utopia-distance warning | Curator note; no direct schema (Crawley warns against using it) |
| Frontier mining Table 15.2 | `frontier_mining[]` with 4-class enum |
| Tradespace structure (clusters/strata/holes) | `tradespace_structure` |
| Sensitivity 3-region classification | `sensitivityRegionSchema` |
| Box 15.1 robustness ≥ 0.8 or fuzzy alternative | `.superRefine()` robustness gate |
| 4-quadrant decision ordering | `decisionQuadrantSchema` + `.superRefine()` ordering invariant |
| Metric transparency (≥2 metrics) | `.superRefine()` metric-count check |
| Merge-coupled-decisions refactor (line 7265) | `refactor_suggestions` lint-style array |

---

## Citations

- **Crawley, Cameron, Selva (2015).** Ch 15.
  - Tradespace definition (book_md line 6966)
  - Metric guidance (book_md line 6974–6984)
  - §15.3 Dominance (book_md line 7024–7140, dominance types line 7038)
  - Pareto ranking complexity (book_md line 7130–7138)
  - Utopia point (book_md line 7072)
  - Fuzzy Pareto frontier (book_md line 7084–7088)
  - Mining the Pareto frontier, Table 15.2 (book_md line 7092–7126)
  - §15.4 Structure of the tradespace (book_md line 7140–7174)
  - §15.5 Sensitivity analysis (book_md line 7178–7247)
  - Three sensitivity regions (book_md line 7190–7195)
  - Box 15.1 — Principle of Robustness of Architectures (book_md line 7226–7240)
  - §15.6 Organizing Architectural Decisions (book_md line 7248–7347)
  - Sensitivity main-effect formula (book_md line 7270–7282)
  - Decision-space 4-quadrant view Figure 15.15 (book_md line 7290–7308)
  - Box 15.2 — Principle of Coupling and Organization (book_md line 7318–7329)
  - Apollo decision hierarchy Figure 15.16 (book_md line 7336–7341)
  - Formulation-dependent connectivity / merge-coupled-decisions hint (book_md line 7262–7268)
  - Industry dynamics dominant-architecture note (book_md line 7359)

- **Deb, K., Pratap, A., Agarwal, S., & Meyarivan, T. (2002).** NSGA-II. IEEE Transactions on Evolutionary Computation. *(cited Crawley §15.3 for faster Pareto ranking)*

- **Cross-references:**
  - `./01-Decision-Network-Foundations.md` — sibling M4 phase supplying decisions + metrics + decision_dsm.
  - `../5-form-function-mapping/04-Phase-4-Solution-Neutral-Concept.md` — morphological matrix feeds architecture enumeration.
  - `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` — phaseEnvelopeSchema, mathDerivationSchema, sourceRefSchema.

**Ruling anchors:**
- Handoff §3 — M4 MIT/Crawley hybrid direction approved.
- Handoff §3 2026-04-21 ~14:30 — NFREngineInterpreter is sole executor; no Pareto/Sensitivity engine class.
- Team-lead 2026-04-21 — phase-local enum pattern green-lit; 6 new enums stay module-local.
- Curator note on mathDerivationV2 avoidance: sensitivity emitted as N scalar records, not one record-valued derivation. Tally held at 2.
- `_shared.ts` untouched; `phaseStatusSchema` unchanged (Option A discipline applied).
