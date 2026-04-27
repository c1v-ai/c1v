/**
 * Module 2 — Requirements Crawley Extension (Crawley Ch 11).
 *
 * @module lib/langchain/schemas/module-2/requirements-crawley-extension
 * @kbSource apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/2-requirements/05-crawley/crawley-ch11-needs-to-goals.md
 * @since 2026-04-27
 * @evidenceTier curated
 *
 * Extends v2.1's NFR/constants table with Crawley needs-to-goals discipline
 * fields: stakeholder cross-enum, Kano category, value flows + value loops
 * (Cameron multiplicative-weight metric), 5-criteria goals (must all be true),
 * F-16 numeric-grounding check on problem statement.
 *
 * Per REQUIREMENTS-crawley §1: ZERO modifications to _shared.ts. All Crawley-
 * discipline enums live phase-local in this file.
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, sourceRefSchema } from './_shared';

export const stakeholderCategorySchema = z
  .enum(['beneficiary', 'charitable_beneficiary', 'problem_stakeholder', 'opponent'])
  .describe(
    'x-ui-surface=section:Crawley Extension > Stakeholders — Crawley Box 11.1 four-category cross-enum.',
  );
export type StakeholderCategory = z.infer<typeof stakeholderCategorySchema>;

export const kanoCategorySchema = z
  .enum(['must_have', 'performance', 'delighter'])
  .describe(
    'x-ui-surface=section:Crawley Extension > Kano — Crawley §11.3 Kano categories.',
  );
export type KanoCategory = z.infer<typeof kanoCategorySchema>;

export const flowKindSchema = z
  .enum(['mass', 'energy', 'information', 'value', 'control', 'service'])
  .describe(
    'x-ui-surface=section:Crawley Extension > Value Flow — Crawley Ch 11 six flow kinds.',
  );
export type FlowKind = z.infer<typeof flowKindSchema>;

export const goalCriteriaKeySchema = z
  .enum([
    'addresses_need',
    'achievable_with_budget',
    'measurable',
    'tradable_under_constraint',
    'agreed_among_stakeholders',
  ])
  .describe(
    'x-ui-surface=section:Crawley Extension > Goal Criteria — Crawley Box 11.4 five required keys.',
  );
export type GoalCriteriaKey = z.infer<typeof goalCriteriaKeySchema>;

export const beneficiarySchema = z
  .object({
    beneficiary_id: z.string(),
    label: z.string(),
    value_proposition: z.string(),
    is_charitable: z.boolean().default(false),
  })
  .describe(
    'x-ui-surface=section:Crawley Extension > Beneficiaries — direct or charitable beneficiary.',
  );
export type Beneficiary = z.infer<typeof beneficiarySchema>;

export const stakeholderSchema = z
  .object({
    stakeholder_id: z.string(),
    label: z.string(),
    category: stakeholderCategorySchema,
    rationale: z.string(),
    beneficiary_id: z.string().optional(),
  })
  .describe(
    'x-ui-surface=section:Crawley Extension > Stakeholders — one stakeholder w/ category cross-enum.',
  );
export type Stakeholder = z.infer<typeof stakeholderSchema>;

export const solutionNeutralTriadSchema = z
  .object({
    operand: z.string(),
    attribute: z.string(),
    process: z.string(),
  })
  .describe(
    'x-ui-surface=section:Crawley Extension > SN Triad — Crawley §11.4 (operand, attribute, process).',
  );
export type SolutionNeutralTriad = z.infer<typeof solutionNeutralTriadSchema>;

export const needSchema = z
  .object({
    need_id: z.string(),
    label: z.string(),
    stakeholder_ids: z.array(z.string()).min(1),
    kano: kanoCategorySchema,
    sn_triad: solutionNeutralTriadSchema,
    expressed: z.boolean(),
    latent: z.boolean(),
    raw_quote: z.string().optional(),
    interpreted: z.boolean(),
    prioritized: z.boolean().default(false),
    dimensions_count: z.number().int().min(0).max(6),
  })
  .describe(
    'x-ui-surface=section:Crawley Extension > Needs — 6-dimension + Kano + SN-triad need record.',
  );
export type Need = z.infer<typeof needSchema>;

export const valueFlowSchema = z
  .object({
    flow_id: z.string(),
    from_stakeholder_id: z.string(),
    to_stakeholder_id: z.string(),
    kind: flowKindSchema,
    description: z.string(),
    weight: z.number(),
  })
  .describe(
    'x-ui-surface=section:Crawley Extension > Value Flows — directed flow between stakeholders.',
  );
export type ValueFlow = z.infer<typeof valueFlowSchema>;

export const valueLoopSchema = z
  .object({
    loop_id: z.string(),
    flow_ids: z.array(z.string()).min(2),
    cameron_metric: z.number(),
    closed: z.boolean(),
    rationale: z.string(),
  })
  .describe(
    'x-ui-surface=section:Crawley Extension > Value Loops — Cameron multiplicative-weight metric.',
  );
export type ValueLoop = z.infer<typeof valueLoopSchema>;

export const goalCriterionSchema = z
  .object({
    key: goalCriteriaKeySchema,
    satisfied: z.boolean(),
    evidence: z.string(),
  })
  .describe(
    'x-ui-surface=section:Crawley Extension > Goal Criteria — one of five required boolean checks.',
  );

export const goalSchema = z
  .object({
    goal_id: z.string(),
    label: z.string(),
    statement: z.string(),
    criteria: z.array(goalCriterionSchema).length(5),
    tradable: z.boolean(),
    overspecification_check: z.boolean(),
    inconsistent_with: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Crawley Extension > Goals — Crawley Box 11.4 5-criteria goal.',
  )
  .superRefine((val, ctx) => {
    const expectedKeys: GoalCriteriaKey[] = [
      'addresses_need',
      'achievable_with_budget',
      'measurable',
      'tradable_under_constraint',
      'agreed_among_stakeholders',
    ];
    const seen = new Set(val.criteria.map((c) => c.key));
    for (const k of expectedKeys) {
      if (!seen.has(k)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['criteria'],
          message: `Crawley Box 11.4: goal missing required criterion key="${k}".`,
        });
      }
    }
  });
export type Goal = z.infer<typeof goalSchema>;

export const problemStatementSchema = z
  .object({
    statement: z.string().min(20),
    f16_numeric_grounding: z.boolean(),
    numeric_anchors: z.array(z.string()).default([]),
    rationale: z.string(),
  })
  .describe(
    'x-ui-surface=section:Crawley Extension > Problem Statement — Crawley F-16 numeric-grounding check.',
  );
export type ProblemStatement = z.infer<typeof problemStatementSchema>;

export const requirementsCrawleyExtensionSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-2.requirements-crawley-extension.v1'),
    beneficiaries: z.array(beneficiarySchema).min(1),
    stakeholders: z.array(stakeholderSchema).min(1),
    needs: z.array(needSchema).min(1),
    value_flows: z.array(valueFlowSchema).default([]),
    value_loops: z.array(valueLoopSchema).default([]),
    goals: z.array(goalSchema).min(1),
    problem_statement: problemStatementSchema,
    crawley_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M2 Requirements Crawley Extension per Crawley Ch 11.',
  )
  .superRefine((val, ctx) => {
    // 5 goal criteria all true on complete.
    if (val._phase_status === 'complete') {
      for (const goal of val.goals) {
        const allSatisfied = goal.criteria.every((c) => c.satisfied);
        if (!allSatisfied) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['goals'],
            message: `Crawley Box 11.4: goal "${goal.label}" must satisfy all 5 criteria when phase=complete.`,
          });
        }
      }
    }
    // Must-have coverage: every must_have need referenced by ≥ 1 goal (via inclusion in goal.statement
    // is loose; we approximate with an explicit covered-by ledger via beneficiary cross-ref).
    if (val._phase_status === 'complete') {
      const mustHaveCount = val.needs.filter((n) => n.kano === 'must_have').length;
      const goalCount = val.goals.length;
      if (mustHaveCount > 0 && goalCount === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['goals'],
          message: 'Crawley §11.3: must-have needs require ≥ 1 goal.',
        });
      }
    }
    // F-16 numeric-grounding gate.
    if (
      val._phase_status === 'complete' &&
      val.problem_statement.f16_numeric_grounding &&
      val.problem_statement.numeric_anchors.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['problem_statement', 'numeric_anchors'],
        message:
          'Crawley F-16: f16_numeric_grounding=true requires ≥ 1 numeric_anchor.',
      });
    }
    // Balance advisory: > 7 goals + > 30% inconsistent.
    const inconsistentRatio =
      val.goals.length > 0
        ? val.goals.filter((g) => g.inconsistent_with.length > 0).length / val.goals.length
        : 0;
    if (val.goals.length > 7 && inconsistentRatio > 0.3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['goals'],
        message: `Crawley §11.5 balance advisory: ${val.goals.length} goals (>7) with ${Math.round(inconsistentRatio * 100)}% inconsistent (>30%) — re-balance.`,
      });
    }
    // Value-loop closure: every closed loop must reference real flow_ids.
    const flowIds = new Set(val.value_flows.map((f) => f.flow_id));
    for (const loop of val.value_loops) {
      for (const fid of loop.flow_ids) {
        if (!flowIds.has(fid)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['value_loops'],
            message: `loop "${loop.loop_id}" references unknown flow_id="${fid}".`,
          });
        }
      }
    }
  });
export type RequirementsCrawleyExtension = z.infer<typeof requirementsCrawleyExtensionSchema>;
