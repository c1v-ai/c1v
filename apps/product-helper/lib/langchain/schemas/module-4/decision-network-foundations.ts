/**
 * Module 4 — Decision Network Foundations (Crawley Ch 14).
 *
 * @module lib/langchain/schemas/module-4/decision-network-foundations
 * @kbSource apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/4-decision-net-crawley-on-cornell/01-phase-docs/crawley/01-Decision-Network-Foundations.md
 * @since 2026-04-26
 * @evidenceTier curated
 *
 * Crawley DSS foundations: decisions (categorical default per Box 14.1),
 * 3-way constraint discriminated union (§14.5), metrics with computation kinds,
 * decision DSM, decision network topology, DSS task coverage checklist.
 */

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
  mathDerivationSchema,
} from '../module-2/_shared';

export const decisionVariableTypeSchema = z
  .enum(['categorical', 'discrete', 'continuous'])
  .describe(
    'x-ui-surface=section:Decision Network > Decisions — Crawley Box 14.1 variable type. Categorical default.',
  );
export type DecisionVariableType = z.infer<typeof decisionVariableTypeSchema>;

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

export const metricComputationKindSchema = z
  .enum(['additive', 'multiplicative', 'lookup', 'equation'])
  .describe(
    'x-ui-surface=section:Decision Network > Metrics — Crawley Table 14.2 computation kinds.',
  );
export type MetricComputationKind = z.infer<typeof metricComputationKindSchema>;

export const simonPhaseSchema = z
  .enum(['intelligence', 'design', 'choice', 'review'])
  .describe(
    'x-ui-surface=section:Decision Network > Simon Phase — Crawley §14.3 four-phase process.',
  );
export type SimonPhase = z.infer<typeof simonPhaseSchema>;

export const dssTaskSchema = z
  .enum(['representing', 'structuring', 'simulating', 'viewing'])
  .describe(
    'x-ui-surface=section:Decision Network > DSS Task — Crawley §14.4 four main tasks.',
  );
export type DssTask = z.infer<typeof dssTaskSchema>;

export const decisionNetworkNodeKindSchema = z
  .enum(['decision', 'chance', 'leaf'])
  .describe(
    'x-ui-surface=section:Decision Network > Node Kind — Crawley §14.5 node types.',
  );
export type DecisionNetworkNodeKind = z.infer<typeof decisionNetworkNodeKindSchema>;

export const topologyKindSchema = z
  .enum(['tree', 'dag', 'general_graph'])
  .describe(
    'x-ui-surface=section:Decision Network > Topology — Crawley line 6889 "arbitrary topologies".',
  );
export type TopologyKind = z.infer<typeof topologyKindSchema>;

export const decisionAlternativeSchema = z.object({
  alternative_id: z.string(),
  label: z.string(),
  description: z.string(),
  source_concept_id: z.string().optional(),
});
export type DecisionAlternative = z.infer<typeof decisionAlternativeSchema>;

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
export type Decision = z.infer<typeof decisionSchema>;

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
export type Metric = z.infer<typeof metricSchema>;

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
  )
  .superRefine((val, ctx) => {
    // Box 14.1 categorical-default property advisory.
    const continuousCount = val.decisions.filter(
      (d) => d.variable_type === 'continuous',
    ).length;
    const continuousPct = continuousCount / val.decisions.length;
    if (continuousPct > 0.2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['decisions'],
        message: `Crawley Box 14.1 property 3: ${Math.round(continuousPct * 100)}% of decisions are continuous (>20%) — re-examine whether these are architectural.`,
      });
    }
    // DSS tasks 1–3 covered on complete (viewing handled by Tradespace).
    if (val._phase_status === 'complete') {
      const cov = val.dss_task_coverage;
      const missing: string[] = [];
      if (!cov.representing.covered) missing.push('representing');
      if (!cov.structuring.covered) missing.push('structuring');
      if (!cov.simulating.covered) missing.push('simulating');
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dss_task_coverage'],
          message: `Crawley §14.4: DSS tasks ${missing.join(', ')} not covered.`,
        });
      }
    }
    // Tree topology requires no metric_coupling constraints.
    if (val.decision_network.topology_kind === 'tree') {
      const hasMetricCoupling = val.constraints.some((c) => c.kind === 'metric_coupling');
      if (hasMetricCoupling) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['decision_network', 'topology_kind'],
          message:
            'Crawley §14.5 line 6881: cannot use topology_kind: "tree" when metric_coupling constraints exist.',
        });
      }
    }
    // Metric equation/lookup gating.
    for (const metric of val.metrics) {
      if (metric.computation_kind === 'equation' && !metric.equation_ref) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['metrics'],
          message: `Metric "${metric.name}" computation_kind="equation" but no equation_ref.`,
        });
      }
      if (metric.computation_kind === 'lookup' && !metric.lookup_table_ref) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['metrics'],
          message: `Metric "${metric.name}" computation_kind="lookup" but no lookup_table_ref.`,
        });
      }
    }
  });
export type DecisionNetworkFoundations = z.infer<typeof decisionNetworkFoundationsSchema>;
