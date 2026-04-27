/**
 * Module 4 — Tradespace, Pareto Frontier, Sensitivity (Crawley Ch 15).
 *
 * @module lib/langchain/schemas/module-4/tradespace-pareto-sensitivity
 * @source REQUIREMENTS-crawley §3 (M4 supplements)
 * @kbSource apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/4-decision-net-crawley-on-cornell/01-phase-docs/crawley/02-Tradespace-Pareto-Sensitivity.md
 * @since 2026-04-27
 * @evidenceTier curated
 * @consumers TBD — agent-emitter wiring deferred to v2.2 (Wave D agent rewrite). Schema gate is closed and rejects emissions that omit/mis-type fields. Registered in `lib/langchain/schemas/index.ts` `CRAWLEY_SCHEMAS`.
 * @driftPolicy quarterly (Jan 1 / Apr 1 / Jul 1 / Oct 1 @ 00:00 UTC) via `apps/product-helper/scripts/quarterly-drift-check.ts`; LangSmith project `c1v-v2-eval`. See `.github/workflows/quarterly-drift-check.yml` for the cron expression.
 *
 * Consumes M4 phase-1 decisions + metrics + constraints + decision_dsm. Emits
 * evaluated architectures, Pareto analysis (with optional fuzzy variant),
 * frontier mining (Table 15.2 4-class), tradespace structure (clusters/strata/
 * holes), per-decision sensitivity (N scalar mathDerivation records), 4-quadrant
 * decision organization, refactor suggestions.
 */

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
  mathDerivationSchema,
} from '../module-2/_shared';

export const dominanceKindSchema = z
  .enum(['dominated', 'non_dominated', 'weakly_dominated'])
  .describe(
    'x-ui-surface=section:Tradespace > Pareto — Crawley §15.2 Pareto dominance kinds.',
  );
export type DominanceKind = z.infer<typeof dominanceKindSchema>;

export const fuzzyParetoStrategySchema = z
  .enum(['rank_cutoff', 'euclidean_threshold'])
  .describe(
    'x-ui-surface=section:Tradespace > Fuzzy Pareto — Crawley §15.4 fuzzy strategy choice.',
  );
export type FuzzyParetoStrategy = z.infer<typeof fuzzyParetoStrategySchema>;

export const sensitivityRegionSchema = z
  .enum(['low', 'moderate', 'high'])
  .describe(
    'x-ui-surface=section:Tradespace > Sensitivity — Crawley Box 15.3 sensitivity regions.',
  );
export type SensitivityRegion = z.infer<typeof sensitivityRegionSchema>;

export const decisionQuadrantSchema = z
  .enum([
    'q1_high_impact_high_sensitivity',
    'q2_high_impact_low_sensitivity',
    'q3_low_impact_high_sensitivity',
    'q4_low_impact_low_sensitivity',
  ])
  .describe(
    'x-ui-surface=section:Tradespace > Decision Organization — Crawley Fig 15.6 four-quadrant.',
  );
export type DecisionQuadrant = z.infer<typeof decisionQuadrantSchema>;

export const frontierMiningClassSchema = z
  .enum(['driver', 'passenger', 'fellow_traveler', 'opposed'])
  .describe(
    'x-ui-surface=section:Tradespace > Frontier Mining — Crawley Table 15.2 four-class.',
  );
export type FrontierMiningClass = z.infer<typeof frontierMiningClassSchema>;

export const designOfExperimentsSchema = z
  .enum(['full_factorial', 'fractional_factorial', 'lhs', 'monte_carlo'])
  .describe(
    'x-ui-surface=section:Tradespace > Sampling — Crawley §15.3 DOE sampling strategies.',
  );
export type DesignOfExperiments = z.infer<typeof designOfExperimentsSchema>;

export const evaluatedArchitectureSchema = z
  .object({
    architecture_id: z.string(),
    decision_selections: z.record(z.string(), z.string()),
    metric_values: z.record(z.string(), z.number()),
    feasible: z.boolean(),
    pareto_rank: z.number().int().nonnegative(),
    dominance: dominanceKindSchema,
  })
  .describe(
    'x-ui-surface=section:Tradespace > Architecture — one evaluated point in tradespace.',
  );
export type EvaluatedArchitecture = z.infer<typeof evaluatedArchitectureSchema>;

export const paretoAnalysisSchema = z
  .object({
    visible_metric_ids: z.array(z.string()).min(2),
    non_dominated_architecture_ids: z.array(z.string()).default([]),
    dominated_count: z.number().int().nonnegative(),
    feasible_count: z.number().int().nonnegative(),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Pareto — Pareto analysis result (≥ 2 visible metrics).',
  );
export type ParetoAnalysis = z.infer<typeof paretoAnalysisSchema>;

export const fuzzyParetoSchema = z
  .object({
    strategy: fuzzyParetoStrategySchema,
    rank_cutoff: z.number().int().positive().optional(),
    euclidean_threshold: z.number().positive().optional(),
    additional_architecture_ids: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Fuzzy Pareto — robustness via rank cutoff OR distance.',
  )
  .superRefine((val, ctx) => {
    if (val.strategy === 'rank_cutoff' && val.rank_cutoff === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rank_cutoff'],
        message: "strategy=rank_cutoff requires rank_cutoff.",
      });
    }
    if (val.strategy === 'euclidean_threshold' && val.euclidean_threshold === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['euclidean_threshold'],
        message: "strategy=euclidean_threshold requires euclidean_threshold.",
      });
    }
  });
export type FuzzyPareto = z.infer<typeof fuzzyParetoSchema>;

export const frontierMiningEntrySchema = z
  .object({
    decision_id: z.string(),
    classification: frontierMiningClassSchema,
    rationale: z.string(),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Frontier Mining — per-decision classification.',
  );
export type FrontierMiningEntry = z.infer<typeof frontierMiningEntrySchema>;

export const tradespaceStructureSchema = z
  .object({
    clusters: z
      .array(
        z.object({
          cluster_id: z.string(),
          architecture_ids: z.array(z.string()).min(1),
          centroid_metric_values: z.record(z.string(), z.number()),
        }),
      )
      .default([]),
    strata: z
      .array(
        z.object({
          stratum_id: z.string(),
          dimension: z.string(),
          architecture_ids: z.array(z.string()).min(1),
        }),
      )
      .default([]),
    holes: z
      .array(
        z.object({
          hole_id: z.string(),
          metric_region: z.record(z.string(), z.tuple([z.number(), z.number()])),
          rationale: z.string(),
        }),
      )
      .default([]),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Structure — Crawley Fig 15.5 clusters/strata/holes.',
  );
export type TradespaceStructure = z.infer<typeof tradespaceStructureSchema>;

export const decisionSensitivityEntrySchema = z
  .object({
    decision_id: z.string(),
    metric_id: z.string(),
    main_effect: z.number(),
    region: sensitivityRegionSchema,
    derivation: mathDerivationSchema,
  })
  .describe(
    'x-ui-surface=section:Tradespace > Sensitivity — per-(decision, metric) main effect.',
  );
export type DecisionSensitivityEntry = z.infer<typeof decisionSensitivityEntrySchema>;

export const sensitivityScenarioSchema = z
  .object({
    scenario_id: z.string(),
    label: z.string(),
    sampling: designOfExperimentsSchema,
    sample_count: z.number().int().positive(),
    description: z.string(),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Sensitivity Scenarios — Crawley Box 15.2 scenario record.',
  );

export const sensitivityAnalysisSchema = z
  .object({
    scenarios: z.array(sensitivityScenarioSchema).min(3),
    per_decision_sensitivity: z.array(decisionSensitivityEntrySchema).min(1),
    robustness_score: z.number().min(0).max(1),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Sensitivity — Crawley §15.5 sensitivity analysis.',
  );
export type SensitivityAnalysis = z.infer<typeof sensitivityAnalysisSchema>;

export const decisionOrganizationEntrySchema = z
  .object({
    decision_id: z.string(),
    impact_score: z.number().min(0).max(1),
    sensitivity_score: z.number().min(0).max(1),
    quadrant: decisionQuadrantSchema,
  })
  .describe(
    'x-ui-surface=section:Tradespace > Decision Organization — quadrant assignment per decision.',
  );
export type DecisionOrganizationEntry = z.infer<typeof decisionOrganizationEntrySchema>;

export const refactorSuggestionSchema = z
  .object({
    suggestion_id: z.string(),
    target_decision_ids: z.array(z.string()).min(1),
    rationale: z.string(),
    expected_impact: z.string(),
  })
  .describe(
    'x-ui-surface=section:Tradespace > Refactor — Crawley line 7521 refactor suggestion.',
  );
export type RefactorSuggestion = z.infer<typeof refactorSuggestionSchema>;

/**
 * M4 Phase-2 envelope (Crawley Ch 15). Top-level shape:
 * - `_schema`: literal `module-4.tradespace-pareto-sensitivity.v1`.
 * - `architectures`: ≥ 1 evaluated architectures (utility + metric values).
 * - `pareto_analysis`: dominance partition + visible_metric_ids (≥ 2 enforced via superRefine).
 * - `fuzzy_pareto`: optional fuzzy variant; required when `sensitivity_analysis.robustness_score < 0.8`.
 * - `frontier_mining`: Crawley Table 15.2 4-class entries.
 * - `tradespace_structure`: clusters / strata / holes.
 * - `sensitivity_analysis`: scenarios (≥ 3 enforced) + robustness_score.
 * - `decision_organization`: 4-quadrant ordering (Q1 must precede Q4 in array order).
 * - `refactor_suggestions`: optional Crawley line-7521 refactor proposals.
 * - `crawley_refs`: source-of-truth provenance.
 */
export const tradespaceParetoSensitivitySchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-4.tradespace-pareto-sensitivity.v1'),
    architectures: z.array(evaluatedArchitectureSchema).min(1),
    pareto_analysis: paretoAnalysisSchema,
    fuzzy_pareto: fuzzyParetoSchema.optional(),
    frontier_mining: z.array(frontierMiningEntrySchema).default([]),
    tradespace_structure: tradespaceStructureSchema,
    sensitivity_analysis: sensitivityAnalysisSchema,
    decision_organization: z.array(decisionOrganizationEntrySchema).default([]),
    refactor_suggestions: z.array(refactorSuggestionSchema).default([]),
    crawley_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M4 Phase 2: tradespace + Pareto + sensitivity per Crawley Ch 15.',
  )
  .superRefine((val, ctx) => {
    // ≥ 2 visible metrics on Pareto.
    if (val.pareto_analysis.visible_metric_ids.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pareto_analysis', 'visible_metric_ids'],
        message: 'Crawley §15.2: Pareto requires ≥ 2 visible metrics.',
      });
    }
    // Robustness ≥ 0.8 OR fuzzy alternative supplied.
    if (val._phase_status === 'complete') {
      if (val.sensitivity_analysis.robustness_score < 0.8 && !val.fuzzy_pareto) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sensitivity_analysis', 'robustness_score'],
          message:
            'Crawley §15.4: robustness_score < 0.8 requires fuzzy_pareto alternative.',
        });
      }
    }
    // Q-I → Q-IV precedence: every q1 decision must appear before any q4 decision in array order.
    const quadrants = val.decision_organization.map((d) => d.quadrant);
    const lastQ1 = quadrants.lastIndexOf('q1_high_impact_high_sensitivity');
    const firstQ4 = quadrants.indexOf('q4_low_impact_low_sensitivity');
    if (lastQ1 >= 0 && firstQ4 >= 0 && lastQ1 > firstQ4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['decision_organization'],
        message:
          'Crawley Fig 15.6: Q-I (high/high) decisions must precede Q-IV (low/low) in organization order.',
      });
    }
    // Sensitivity scenarios must include ≥ 3.
    if (val.sensitivity_analysis.scenarios.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sensitivity_analysis', 'scenarios'],
        message: 'Crawley Box 15.2: sensitivity requires ≥ 3 scenarios.',
      });
    }
  });
export type TradespaceParetoSensitivity = z.infer<typeof tradespaceParetoSensitivitySchema>;
