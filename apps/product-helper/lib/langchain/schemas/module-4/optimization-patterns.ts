/**
 * Module 4 — Optimization Patterns (Crawley Ch 16).
 *
 * @module lib/langchain/schemas/module-4/optimization-patterns
 * @source REQUIREMENTS-crawley §3 (M4 supplements)
 * @kbSource apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/4-decision-net-crawley-on-cornell/01-phase-docs/crawley/03-Optimization-Patterns.md
 * @since 2026-04-27
 * @evidenceTier curated
 * @consumers TBD — agent-emitter wiring deferred to v2.2 (Wave D agent rewrite). Schema gate is closed and rejects emissions that omit/mis-type fields. Registered in `lib/langchain/schemas/index.ts` `CRAWLEY_SCHEMAS`.
 * @driftPolicy quarterly (Jan 1 / Apr 1 / Jul 1 / Oct 1 @ 00:00 UTC) via `apps/product-helper/scripts/quarterly-drift-check.ts`; LangSmith project `c1v-v2-eval`. See `.github/workflows/quarterly-drift-check.yml` for the cron expression.
 *
 * Six optimization Patterns (DOWN_SELECTING, ASSIGNING, etc.), per-Pattern
 * sub-problems, NEOSS-style composition operator for multi-subproblem cases,
 * value-function + constraint-hardness + solver kind, architect-task
 * assignments, and the non-dominated set ref into Phase-2 architectures.
 */

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
  mathDerivationSchema,
} from '../module-2/_shared';

export const patternSchema = z
  .enum([
    'down_selecting',
    'assigning',
    'partitioning',
    'permuting',
    'connecting',
    'standards_definition',
  ])
  .describe(
    'x-ui-surface=section:Optimization Patterns > Pattern — Crawley Box 16.1 six Patterns.',
  );
export type Pattern = z.infer<typeof patternSchema>;

export const elementInteractionKindSchema = z
  .enum(['compatibility', 'synergy', 'interference'])
  .describe(
    'x-ui-surface=section:Optimization Patterns > Element Interactions — Crawley §16.2 kinds.',
  );
export type ElementInteractionKind = z.infer<typeof elementInteractionKindSchema>;

export const architectureStyleSchema = z
  .enum(['integral', 'modular', 'platform', 'product_family'])
  .describe(
    'x-ui-surface=section:Optimization Patterns > Architecture Style — Crawley §16.3 styles.',
  );
export type ArchitectureStyle = z.infer<typeof architectureStyleSchema>;

export const valueFunctionKindSchema = z
  .enum(['weighted_sum', 'multiplicative', 'lexicographic', 'satisficing'])
  .describe(
    'x-ui-surface=section:Optimization Patterns > Value Function — Crawley Box 16.3 kinds.',
  );
export type ValueFunctionKind = z.infer<typeof valueFunctionKindSchema>;

export const solverKindSchema = z
  .enum(['exhaustive', 'branch_and_bound', 'genetic_algorithm', 'simulated_annealing', 'mip'])
  .describe(
    'x-ui-surface=section:Optimization Patterns > Solver — Crawley §16.5 solver kinds.',
  );
export type SolverKind = z.infer<typeof solverKindSchema>;

export const architectTaskSchema = z
  .enum([
    'frame_problem',
    'select_pattern',
    'compose_subproblems',
    'tune_value_function',
    'verify_constraints',
    'choose_solver',
  ])
  .describe(
    'x-ui-surface=section:Optimization Patterns > Architect Task — Crawley Table 16.1 six tasks.',
  );
export type ArchitectTask = z.infer<typeof architectTaskSchema>;

export const compositionOperatorSchema = z
  .enum(['cartesian_product', 'sequential', 'hierarchical', 'shared_resource'])
  .describe(
    'x-ui-surface=section:Optimization Patterns > Composition — NEOSS-style operators.',
  );
export type CompositionOperator = z.infer<typeof compositionOperatorSchema>;

export const elementInteractionSchema = z
  .object({
    from_element_id: z.string(),
    to_element_id: z.string(),
    kind: elementInteractionKindSchema,
    weight: z.number(),
  })
  .describe(
    'x-ui-surface=section:Optimization Patterns > Element Interactions — sparse triple.',
  );
export type ElementInteraction = z.infer<typeof elementInteractionSchema>;

export const subProblemSchema = z
  .object({
    sub_problem_id: z.string(),
    pattern: patternSchema,
    decision_ids: z.array(z.string()).min(1),
    element_interactions: z.array(elementInteractionSchema).default([]),
    architecture_style: architectureStyleSchema.optional(),
    description: z.string(),
  })
  .describe(
    'x-ui-surface=section:Optimization Patterns > Sub-Problems — one Pattern instance.',
  )
  .superRefine((val, ctx) => {
    // Pattern metadata gating.
    if (val.pattern === 'down_selecting' && val.element_interactions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['element_interactions'],
        message:
          'Crawley §16.2: Pattern=down_selecting requires ≥ 1 element_interactions entry.',
      });
    }
    if (
      (val.pattern === 'assigning' || val.pattern === 'connecting') &&
      val.architecture_style === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['architecture_style'],
        message: `Crawley §16.3: Pattern=${val.pattern} requires architecture_style.`,
      });
    }
  });
export type SubProblem = z.infer<typeof subProblemSchema>;

export const compositionSchema = z
  .object({
    operator: compositionOperatorSchema,
    sub_problem_ids: z.array(z.string()).min(2),
    rationale: z.string(),
  })
  .describe(
    'x-ui-surface=section:Optimization Patterns > Composition — multi-subproblem operator.',
  );
export type Composition = z.infer<typeof compositionSchema>;

export const valueFunctionSchema = z
  .object({
    kind: valueFunctionKindSchema,
    weights: z.record(z.string(), z.number()).optional(),
    equation_ref: mathDerivationSchema.optional(),
    description: z.string(),
  })
  .describe(
    'x-ui-surface=section:Optimization Patterns > Value Function — V(A) per architecture.',
  )
  .superRefine((val, ctx) => {
    // weighted_sum/multiplicative require weights map.
    if ((val.kind === 'weighted_sum' || val.kind === 'multiplicative') && !val.weights) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['weights'],
        message: `Crawley Box 16.3: kind=${val.kind} requires weights record.`,
      });
    }
  });
export type ValueFunction = z.infer<typeof valueFunctionSchema>;

export const constraintHardnessSchema = z
  .object({
    hard_constraint_ids: z.array(z.string()).default([]),
    soft_constraint_ids: z.array(z.string()).default([]),
    penalty_scalar: z.number().nonnegative(),
  })
  .describe(
    'x-ui-surface=section:Optimization Patterns > Constraint Hardness — hard/soft + penalty scalar.',
  );
export type ConstraintHardness = z.infer<typeof constraintHardnessSchema>;

export const solverSchema = z
  .object({
    kind: solverKindSchema,
    parameters: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).default({}),
    justification: z.string(),
  })
  .describe(
    'x-ui-surface=section:Optimization Patterns > Solver — solver choice + tuning.',
  );
export type Solver = z.infer<typeof solverSchema>;

export const architectTaskAssignmentSchema = z
  .object({
    task: architectTaskSchema,
    assignee: z.string(),
    completed: z.boolean().default(false),
    notes: z.string().optional(),
  })
  .describe(
    'x-ui-surface=section:Optimization Patterns > Architect Tasks — Table 16.1 assignment.',
  );
export type ArchitectTaskAssignment = z.infer<typeof architectTaskAssignmentSchema>;

/**
 * M4 Phase-3 envelope (Crawley Ch 16). Top-level shape:
 * - `_schema`: literal `module-4.optimization-patterns.v1`.
 * - `architect_task_assignments`: Crawley Table 16.1 architect-task assignment rows.
 * - `sub_problems`: ≥ 1 per-Pattern sub-problems (one of six Patterns: DOWN_SELECTING, ASSIGNING, PARTITIONING, PERMUTING, CONNECTING, STANDARDS_DEFINITION).
 * - `composition`: NEOSS-style operator; required when `sub_problems.length > 1` (enforced via superRefine).
 * - `value_function` / `constraint_hardness` / `solver`: solver-config triad.
 * - `non_dominated_architecture_ids`: refs into Phase-2 architectures.
 * - `crawley_refs`: source-of-truth provenance.
 */
export const optimizationPatternsSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-4.optimization-patterns.v1'),
    architect_task_assignments: z.array(architectTaskAssignmentSchema).default([]),
    sub_problems: z.array(subProblemSchema).min(1),
    composition: compositionSchema.optional(),
    value_function: valueFunctionSchema,
    constraint_hardness: constraintHardnessSchema,
    solver: solverSchema,
    non_dominated_architecture_ids: z.array(z.string()).default([]),
    crawley_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M4 Phase 3: optimization Patterns per Crawley Ch 16.',
  )
  .superRefine((val, ctx) => {
    // Composition required for multi-subproblem cases.
    if (val.sub_problems.length > 1 && !val.composition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['composition'],
        message:
          'Crawley §16.4: composition required when sub_problems.length > 1 (NEOSS operator).',
      });
    }
    // 7±2 advisory on sub-problems.
    if (val.sub_problems.length > 9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sub_problems'],
        message: `Crawley line 7889: sub_problems.length=${val.sub_problems.length} exceeds 7±2 advisory cap (9).`,
      });
    }
    // Solver consistency: exhaustive solver requires ≤ 1 sub-problem with element_interactions.
    if (val.solver.kind === 'exhaustive') {
      const total = val.sub_problems.reduce(
        (acc, sp) => acc + sp.element_interactions.length,
        0,
      );
      if (total > 64) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['solver', 'kind'],
          message: `Crawley §16.5: solver=exhaustive infeasible for ${total} element_interactions; choose branch_and_bound or genetic_algorithm.`,
        });
      }
    }
    // Composition operator must reference real sub-problem IDs.
    if (val.composition) {
      const knownIds = new Set(val.sub_problems.map((sp) => sp.sub_problem_id));
      for (const id of val.composition.sub_problem_ids) {
        if (!knownIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['composition', 'sub_problem_ids'],
            message: `composition references unknown sub_problem_id="${id}".`,
          });
        }
      }
    }
  });
export type OptimizationPatterns = z.infer<typeof optimizationPatternsSchema>;
