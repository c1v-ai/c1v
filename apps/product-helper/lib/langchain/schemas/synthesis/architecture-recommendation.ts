/**
 * Synthesis — Architecture Recommendation v1 (capstone schema).
 *
 * Shape of `architecture_recommendation.v1` — the single JSON artifact the
 * synthesizer agent emits after ingesting completed M2..M7 phase outputs +
 * KB-8 atlas empirical priors for a project.
 *
 * Composition:
 *   - Extends `phaseEnvelopeSchema` from `module-2/_shared.ts` so the
 *     dual-surface metadata + envelope contract carries through.
 *   - Consumes the Atlas primitives (`resultShapeSchema`, `costCurveSchema`,
 *     `latencyPriorSchema`, `availabilityPriorSchema`, `atlasPriorRefSchema`)
 *     as the citation substrate for Pareto derivations — no new numeric
 *     primitives introduced (per synthesizer brief "Do NOT add new Zod
 *     primitives outside the phaseEnvelopeSchema family").
 *
 * Sentinel policy (T2 remediation §9 Q4 — load-bearing):
 *   When kb-search returns no §6.3-compliant prior for a required primitive
 *   (`cost_curve | latency_prior | availability_prior`), the synthesizer
 *   emits the decision with `needs_prior_sentinel: true` and records which
 *   primitive was missing in `missing_prior_kinds[]`. The decision is NOT
 *   blocked; downstream consumers can see the gap + the sentinel ranges used.
 *
 * @module lib/langchain/schemas/synthesis/architecture-recommendation
 */

import { z } from 'zod';
import { phaseEnvelopeSchema } from '../module-2/_shared';
import {
  atlasPriorRefSchema,
  availabilityPriorSchema,
  costCurveSchema,
  latencyPriorSchema,
} from '../atlas/priors';

// ─────────────────────────────────────────────────────────────────────────
// Mermaid diagram bundle
// ─────────────────────────────────────────────────────────────────────────

/**
 * Mermaid sources for the five recommendation-view diagrams. Each value is a
 * raw Mermaid string (client renders with mermaid.js). Kinds are fixed so
 * the UI can slot them deterministically.
 */
export const mermaidDiagramKindSchema = z.enum([
  'context',
  'use_case',
  'class',
  'sequence',
  'decision_network',
]);
export type MermaidDiagramKind = z.infer<typeof mermaidDiagramKindSchema>;

export const mermaidBundleSchema = z
  .object({
    context: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Diagrams > Context — Mermaid source for the system-context diagram (actors + boundary).',
      ),
    use_case: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Diagrams > Use Case — Mermaid source for the use-case diagram.',
      ),
    class: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Diagrams > Class — Mermaid source for the class/data-entity diagram.',
      ),
    sequence: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Diagrams > Sequence — Mermaid source for the primary-flow sequence diagram.',
      ),
    decision_network: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Diagrams > Decision Network — Mermaid source for the Crawley decision-network graph.',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Diagrams — five canonical Mermaid sources (context, use-case, class, sequence, decision-network).',
  );
export type MermaidBundle = z.infer<typeof mermaidBundleSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Prior reference (what the decision cites from KB-8 atlas)
// ─────────────────────────────────────────────────────────────────────────

export const priorKindSchema = z.enum([
  'cost_curve',
  'latency_prior',
  'availability_prior',
  'throughput_prior',
  'utility_weight_hints',
]);
export type PriorKind = z.infer<typeof priorKindSchema>;

/**
 * Reference to a KB-8 atlas prior consumed by a decision node. `prior_ref` is
 * the atlas pointer (company slug + prior id); `kind` narrows which prior
 * primitive it addresses so the UI can render the right shape.
 */
export const decisionPriorRefSchema = z
  .object({
    kind: priorKindSchema.describe(
      'x-ui-surface=section:Recommendation > Decision > Priors — which atlas prior primitive this refers to.',
    ),
    prior_ref: atlasPriorRefSchema.describe(
      'x-ui-surface=section:Recommendation > Decision > Priors — atlas pointer (company + prior id).',
    ),
    note: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Recommendation > Decision > Priors — reviewer-facing note on how this prior was used.',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Decision > Priors — atlas prior consumed by a decision.',
  );
export type DecisionPriorRef = z.infer<typeof decisionPriorRefSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Decision node
// ─────────────────────────────────────────────────────────────────────────

/**
 * A single architectural decision surfaced by the synthesizer. Every node
 * carries full provenance:
 *   - `nfr_engine_trace_id` → the decision_audit row written by audit-writer
 *   - `kb_chunk_ids[]`      → pgvector RAG chunks that grounded the choice
 *   - `prior_refs[]`        → KB-8 atlas priors consumed
 *   - `needs_prior_sentinel` + `missing_prior_kinds[]` → Q4 sentinel policy
 */
export const decisionAlternativeSchema = z
  .object({
    name: z
      .string()
      .describe(
        'x-ui-surface=section:Recommendation > Decision > Alternatives — alternative option considered.',
      ),
    reason_rejected: z
      .string()
      .describe(
        'x-ui-surface=section:Recommendation > Decision > Alternatives — one-line reason this option was not chosen.',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Decision > Alternatives — alternative considered and rejected.',
  );

export const decisionNodeSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Decision — decision id (e.g., "D-01"). Stable across runs.',
      ),
    claim: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Decision > Claim — one-sentence claim this decision resolves (e.g., "Persist user sessions").',
      ),
    chosen_option: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Decision > Chosen Option — selected option (e.g., "Redis with 30-day TTL").',
      ),
    alternatives: z
      .array(decisionAlternativeSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Recommendation > Decision > Alternatives — alternatives considered.',
      ),
    rationale: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Decision > Rationale — prose reason for the choice, grounded in priors + NFR math.',
      ),
    nfr_engine_trace_id: z
      .string()
      .uuid()
      .describe(
        'x-ui-surface=internal:decision-audit-link — UUID of the decision_audit row written via audit-writer for this decision.',
      ),
    kb_chunk_ids: z
      .array(z.string().uuid())
      .default([])
      .describe(
        'x-ui-surface=internal:rag-provenance — UUIDs of kb_chunks rows retrieved for this decision.',
      ),
    prior_refs: z
      .array(decisionPriorRefSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Recommendation > Decision > Priors — atlas priors consumed (empty allowed only if sentinel fires).',
      ),
    needs_prior_sentinel: z
      .boolean()
      .default(false)
      .describe(
        'x-ui-surface=section:Recommendation > Decision > Gaps — true iff no §6.3-compliant prior was available for ≥1 required primitive (Q4 policy).',
      ),
    missing_prior_kinds: z
      .array(priorKindSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Recommendation > Decision > Gaps — primitives for which no compliant prior existed; non-empty iff needs_prior_sentinel=true.',
      ),
    final_confidence: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'x-ui-surface=section:Recommendation > Decision — NFR interpreter final confidence (0..1).',
      ),
  })
  .superRefine((v, ctx) => {
    if (v.needs_prior_sentinel && v.missing_prior_kinds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'missing_prior_kinds must be non-empty when needs_prior_sentinel=true',
        path: ['missing_prior_kinds'],
      });
    }
    if (!v.needs_prior_sentinel && v.missing_prior_kinds.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'missing_prior_kinds must be empty when needs_prior_sentinel=false',
        path: ['missing_prior_kinds'],
      });
    }
  })
  .describe(
    'x-ui-surface=section:Recommendation > Decision — single decision node with full provenance.',
  );
export type DecisionNode = z.infer<typeof decisionNodeSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Pareto frontier
// ─────────────────────────────────────────────────────────────────────────

/**
 * A Pareto-frontier alternative — an end-to-end architecture choice scored
 * across the three canonical axes (cost / latency / availability). Each axis
 * carries its own math derivation (formula + inputs + KB cite) OR a sentinel
 * range when no compliant prior exists.
 */
export const paretoAxisSchema = z
  .object({
    value: z
      .union([z.number(), z.string()])
      .describe(
        'x-ui-surface=section:Recommendation > Pareto > Axis — computed point value (or sentinel string like "NEEDS_PRIOR").',
      ),
    units: z
      .string()
      .describe(
        'x-ui-surface=section:Recommendation > Pareto > Axis — units (e.g., "USD/month", "ms p95", "% uptime").',
      ),
    derivation: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Pareto > Axis — plain-English or LaTeX formula used (e.g., "cost = fixed + var * DAU").',
      ),
    prior_ref: atlasPriorRefSchema
      .optional()
      .describe(
        'x-ui-surface=section:Recommendation > Pareto > Axis — atlas prior that sourced the inputs (omitted when sentinel fires).',
      ),
    sentinel: z
      .boolean()
      .default(false)
      .describe(
        'x-ui-surface=section:Recommendation > Pareto > Axis — true iff no §6.3-compliant prior existed; value is a best-effort range, not a grounded number.',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Pareto > Axis — one axis of a Pareto alternative (cost / latency / availability).',
  );
export type ParetoAxis = z.infer<typeof paretoAxisSchema>;

export const paretoAlternativeSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Pareto — alternative id (e.g., "A1").',
      ),
    name: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Pareto — alternative name (e.g., "Serverless + managed Postgres").',
      ),
    summary: z
      .string()
      .describe(
        'x-ui-surface=section:Recommendation > Pareto — one-sentence description of the architecture shape.',
      ),
    cost: paretoAxisSchema.describe(
      'x-ui-surface=section:Recommendation > Pareto > Cost — cost axis for this alternative.',
    ),
    latency: paretoAxisSchema.describe(
      'x-ui-surface=section:Recommendation > Pareto > Latency — latency axis for this alternative.',
    ),
    availability: paretoAxisSchema.describe(
      'x-ui-surface=section:Recommendation > Pareto > Availability — availability axis for this alternative.',
    ),
    dominates: z
      .array(z.string())
      .default([])
      .describe(
        'x-ui-surface=section:Recommendation > Pareto — ids of alternatives this one strictly dominates.',
      ),
    is_recommended: z
      .boolean()
      .default(false)
      .describe(
        'x-ui-surface=section:Recommendation > Pareto — true iff this alternative is the synthesizer-chosen frontier point.',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Pareto — one Pareto-frontier alternative (cost × latency × availability).',
  );
export type ParetoAlternative = z.infer<typeof paretoAlternativeSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Risk (F-numbered, sourced from M7 FMEA)
// ─────────────────────────────────────────────────────────────────────────

export const riskSchema = z
  .object({
    id: z
      .string()
      .regex(/^F\d+$/u, 'Risk id must be F-numbered (e.g., F01, F12).')
      .describe(
        'x-ui-surface=section:Recommendation > Risks — F-numbered id sourced from M7 FMEA.',
      ),
    title: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Risks — short title.',
      ),
    severity: z
      .enum(['low', 'medium', 'high', 'critical'])
      .describe(
        'x-ui-surface=section:Recommendation > Risks — severity classification.',
      ),
    mitigation: z
      .string()
      .describe(
        'x-ui-surface=section:Recommendation > Risks — planned mitigation.',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Risks — single risk (F-numbered from M7).',
  );
export type Risk = z.infer<typeof riskSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Top-level architecture (prose + citations)
// ─────────────────────────────────────────────────────────────────────────

export const topLevelArchitectureSchema = z
  .object({
    summary: z
      .string()
      .min(1)
      .max(500 * 8)
      .describe(
        'x-ui-surface=section:Recommendation > Summary — prose summary (≤500 words) of the recommended architecture.',
      ),
    cited_priors: z
      .array(atlasPriorRefSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Recommendation > Summary — §6.3 atlas priors cited in the summary prose.',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Summary — top-level architecture prose + cited priors.',
  );
export type TopLevelArchitecture = z.infer<typeof topLevelArchitectureSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Derivation chain (T6 portfolio guardrail #1)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Per-decision derivation_chain entry — REQUIRED by T6 spec §Guardrails:
 * every top-level decision must cite (a) decision_network node id (e.g.,
 * "DN.01-A"), (b) NFR.NN ids driving the choice, (c) kb_chunk_ids[] for RAG
 * evidence, (d) atlas empirical_priors citations.
 *
 * This is the ML-engineer-portfolio differentiator: every architectural
 * commitment is reproducible from upstream module artifacts + KB-8 atlas.
 */
export const derivationChainEntrySchema = z
  .object({
    decision_id: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Derivation — D-NN id of the decision this chain links (matches decisions[].id).',
      ),
    decision_network_node: z
      .string()
      .regex(/^DN\.\d+(-[A-Z])?$/u, 'must be DN.NN or DN.NN-X (e.g., DN.01-A)')
      .describe(
        'x-ui-surface=section:Recommendation > Derivation — M4 decision_network.v1.json node id (e.g., DN.01-A = node.alternative).',
      ),
    nfrs_driving_choice: z
      .array(
        z
          .string()
          .regex(/^NFR\.\d{2}$/u, 'must be NFR.NN'),
      )
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Derivation — NFR.NN ids from M2 nfrs.v2.json that drove this choice.',
      ),
    kb_chunk_ids: z
      .array(z.string().min(1))
      .default([])
      .describe(
        'x-ui-surface=internal:rag-provenance — kb_chunks ids (uuid or path#fragment) retrieved via RAG to ground this decision.',
      ),
    empirical_priors: z
      .array(
        z.object({
          atlas_entry_id: z
            .string()
            .min(1)
            .describe(
              'x-ui-surface=section:Recommendation > Derivation > Priors — KB-8 atlas entry id (e.g., "company-atlas/anthropic#latency-prior").',
            ),
          kind: priorKindSchema.describe(
            'x-ui-surface=section:Recommendation > Derivation > Priors — which prior primitive this cites.',
          ),
          quote: z
            .string()
            .optional()
            .describe(
              'x-ui-surface=section:Recommendation > Derivation > Priors — short quote / summary of the prior used.',
            ),
        }),
      )
      .default([])
      .describe(
        'x-ui-surface=section:Recommendation > Derivation > Priors — KB-8 atlas empirical priors cited (per T6 guardrail).',
      ),
    fmea_refs: z
      .array(
        z
          .string()
          .regex(/^FM\.\d{2}(\.M\d+)?$/u, 'must be FM.NN or FM.NN.MN'),
      )
      .default([])
      .describe(
        'x-ui-surface=section:Recommendation > Derivation > FMEA — FM.NN failure-mode refs from M8 fmea_early or fmea_residual.',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Derivation — single derivation_chain entry per top-level decision (T6 portfolio guardrail).',
  );
export type DerivationChainEntry = z.infer<typeof derivationChainEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────
// Tail-latency budget (T6 portfolio guardrail #3)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Architecture-level p99 tail-latency claim, reconciled against
 * `interface_specs.v1.json` chain_budgets[]. The synthesizer computes
 * `computed_chain_p95_ms` from per-IF specs and asserts equality with the
 * claimed value; mismatch fails verify-t6.ts gate V6.4.
 */
export const tailLatencyBudgetSchema = z
  .object({
    chain_id: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Tail Latency — chain id from interface_specs.v1.json (e.g., AUTHORING_SPEC_EMIT).',
      ),
    user_facing_p95_ms: z
      .number()
      .positive()
      .describe(
        'x-ui-surface=section:Recommendation > Tail Latency — user-facing NFR p95 budget in ms.',
      ),
    sum_per_if_p95_ms: z
      .number()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Recommendation > Tail Latency — sum of per-IF p95 latencies along the chain (computed).',
      ),
    budget_ok: z
      .boolean()
      .describe(
        'x-ui-surface=section:Recommendation > Tail Latency — true iff sum_per_if_p95_ms ≤ user_facing_p95_ms.',
      ),
    derivation_source: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=internal:provenance — upstream artifact path (interface_specs.v1.json#chain_budgets[chain_id]).',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Tail Latency — chain-level p95 reconciliation per T6 guardrail.',
  );
export type TailLatencyBudget = z.infer<typeof tailLatencyBudgetSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Residual risk (T6 portfolio guardrail #4 — verbatim from fmea_residual)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Verbatim embed of fmea_residual.v1.json `flags[]` (the high-RPN modes).
 * `predecessor_ref` MUST be preserved so consumers can trace each residual
 * back to its fmea_early predecessor.
 */
export const residualFlagSchema = z
  .object({
    id: z
      .string()
      .regex(/^FM\.\d{2}$/u, 'must be FM.NN')
      .describe(
        'x-ui-surface=section:Recommendation > Residual Risk — FM.NN id from fmea_residual.',
      ),
    predecessor_ref: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Residual Risk — predecessor FM id from fmea_early (preserved verbatim).',
      ),
    failure_mode: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Residual Risk — failure-mode description.',
      ),
    rpn: z
      .number()
      .describe(
        'x-ui-surface=section:Recommendation > Residual Risk — raw RPN (severity × likelihood × detectability).',
      ),
    weighted_rpn: z
      .number()
      .describe(
        'x-ui-surface=section:Recommendation > Residual Risk — weighted RPN (mitigation-status weighted).',
      ),
    criticality_category: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Residual Risk — LOW | MEDIUM LOW | MEDIUM | MEDIUM HIGH | HIGH.',
      ),
    open_residual_risk: z
      .string()
      .optional()
      .default('')
      .describe(
        'x-ui-surface=section:Recommendation > Residual Risk — open residual risk text (may be empty when mitigation has fully landed).',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Residual Risk — verbatim flag from fmea_residual.v1.json (T6 guardrail).',
  );
export type ResidualFlag = z.infer<typeof residualFlagSchema>;

export const residualRiskSchema = z
  .object({
    threshold: z
      .number()
      .describe(
        'x-ui-surface=section:Recommendation > Residual Risk — high_rpn_flag_threshold from fmea_residual.',
      ),
    flag_count: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Recommendation > Residual Risk — number of high-RPN flags surfaced.',
      ),
    flags: z
      .array(residualFlagSchema)
      .describe(
        'x-ui-surface=section:Recommendation > Residual Risk — verbatim flags[] from fmea_residual.v1.json.',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > Residual Risk — embedded residual-risk section per T6 guardrail.',
  );
export type ResidualRisk = z.infer<typeof residualRiskSchema>;

// ─────────────────────────────────────────────────────────────────────────
// HoQ summary (T6 portfolio guardrail #5)
// ─────────────────────────────────────────────────────────────────────────

/**
 * House-of-Quality summary embedded into the recommendation:
 * target-values table snapshot + relationship-matrix sparsity stats +
 * flagged ECs (from hoq.v1.json).
 */
export const hoqTargetValueRowSchema = z
  .object({
    ec_id: z
      .number()
      .int()
      .describe(
        'x-ui-surface=section:Recommendation > HoQ > Targets — engineering characteristic id.',
      ),
    target: z
      .union([z.number(), z.string()])
      .describe(
        'x-ui-surface=section:Recommendation > HoQ > Targets — target value (number or label).',
      ),
    unit: z
      .string()
      .describe(
        'x-ui-surface=section:Recommendation > HoQ > Targets — unit string.',
      ),
    constant_ref: z
      .string()
      .nullable()
      .describe(
        'x-ui-surface=section:Recommendation > HoQ > Targets — constant id (M2 constants.v2.json) or null.',
      ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > HoQ > Targets — single target-values row.',
  );

export const hoqSummarySchema = z
  .object({
    pc_count: z.number().int().describe('x-ui-surface=section:Recommendation > HoQ — # customer requirements.'),
    ec_count: z.number().int().describe('x-ui-surface=section:Recommendation > HoQ — # engineering characteristics.'),
    matrix_nonzero: z.number().int().describe('x-ui-surface=section:Recommendation > HoQ — # nonzero relationship cells.'),
    matrix_total: z.number().int().describe('x-ui-surface=section:Recommendation > HoQ — # total relationship cells.'),
    matrix_sparsity_pct: z.number().describe('x-ui-surface=section:Recommendation > HoQ — sparsity % (nonzero/total).'),
    roof_pairs_nonzero: z.number().int().describe('x-ui-surface=section:Recommendation > HoQ — # nonzero roof correlations.'),
    flagged_ecs: z.array(z.number().int()).default([]).describe(
      'x-ui-surface=section:Recommendation > HoQ — EC ids with no PC lever (flagged_ec_no_pc).',
    ),
    target_values: z.array(hoqTargetValueRowSchema).describe(
      'x-ui-surface=section:Recommendation > HoQ > Targets — target-values table snapshot.',
    ),
  })
  .describe(
    'x-ui-surface=section:Recommendation > HoQ — embedded HoQ summary per T6 guardrail.',
  );
export type HoqSummary = z.infer<typeof hoqSummarySchema>;

// ─────────────────────────────────────────────────────────────────────────
// Capstone envelope
// ─────────────────────────────────────────────────────────────────────────

/**
 * `architecture_recommendation.v1` — the capstone synthesizer artifact.
 *
 * Composition: extends `phaseEnvelopeSchema` (module-2 base) + payload.
 * Superrefinement: `pareto_frontier.length >= 3` (brief §Deliverables 1).
 *
 * T6 envelope additions (over base phaseEnvelopeSchema):
 *   _upstream_refs[]   — paths to all 11 upstream artifacts (v2 convention)
 *   derivation_chain[] — REQUIRED per top-level decision (guardrail #1)
 *   tail_latency_budgets[] — chain p95 reconciliation (guardrail #3)
 *   residual_risk      — verbatim flags from fmea_residual (guardrail #4)
 *   hoq                — embedded HoQ summary (guardrail #5)
 */
export const architectureRecommendationSchema = phaseEnvelopeSchema
  .extend({
    _upstream_refs: z
      .array(z.string().min(1))
      .min(11)
      .describe(
        'x-ui-surface=internal:provenance — paths to upstream artifacts (T6 envelope: ≥11 per spec — all M1..M8 inputs).',
      ),
    top_level_architecture: topLevelArchitectureSchema.describe(
      'x-ui-surface=section:Recommendation > Summary — prose + citations.',
    ),
    mermaid_diagrams: mermaidBundleSchema.describe(
      'x-ui-surface=section:Recommendation > Diagrams — five canonical Mermaid sources.',
    ),
    pareto_frontier: z
      .array(paretoAlternativeSchema)
      .describe(
        'x-ui-surface=section:Recommendation > Pareto — architecture alternatives on the cost × latency × availability frontier (>=3 required).',
      ),
    decisions: z
      .array(decisionNodeSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Recommendation > Decisions — decision nodes with full provenance (nfr trace, kb chunks, priors).',
      ),
    risks: z
      .array(riskSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Recommendation > Risks — F-numbered risks sourced from M7 FMEA.',
      ),
    derivation_chain: z
      .array(derivationChainEntrySchema)
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Derivation — one entry per top-level decision (T6 guardrail #1).',
      ),
    tail_latency_budgets: z
      .array(tailLatencyBudgetSchema)
      .min(1)
      .describe(
        'x-ui-surface=section:Recommendation > Tail Latency — chain-level p95 budgets reconciled against interface_specs.v1 (T6 guardrail #3).',
      ),
    residual_risk: residualRiskSchema.describe(
      'x-ui-surface=section:Recommendation > Residual Risk — verbatim from fmea_residual.v1.json (T6 guardrail #4).',
    ),
    hoq: hoqSummarySchema.describe(
      'x-ui-surface=section:Recommendation > HoQ — embedded HoQ summary (T6 guardrail #5).',
    ),
    next_steps: z
      .array(z.string())
      .default([])
      .describe(
        'x-ui-surface=section:Recommendation > Next Steps — ordered follow-on actions.',
      ),
    inputs_hash: z
      .string()
      .regex(/^[0-9a-f]{64}$/u, 'inputs_hash must be a SHA-256 hex digest.')
      .describe(
        'x-ui-surface=internal:synthesis-repro — SHA-256 of canonicalized M2..M7 inputs + atlas slug list (reproducibility key).',
      ),
    model_version: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=internal:synthesis-repro — LLM model id used for prose/diagram synthesis (deterministic-rule-tree if pure).',
      ),
    synthesized_at: z
      .string()
      .datetime()
      .describe(
        'x-ui-surface=internal:synthesis-repro — ISO-8601 timestamp of synthesis.',
      ),
  })
  .superRefine((v, ctx) => {
    if (v.pareto_frontier.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 3,
        type: 'array',
        inclusive: true,
        message: 'pareto_frontier must contain at least 3 alternatives',
        path: ['pareto_frontier'],
      });
    }
    // T6 guardrail #1: every top-level decision MUST have a derivation_chain entry
    const chainIds = new Set(v.derivation_chain.map((c) => c.decision_id));
    const missing = v.decisions.filter((d) => !chainIds.has(d.id)).map((d) => d.id);
    if (missing.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `decisions missing derivation_chain entry: ${missing.join(', ')}`,
        path: ['derivation_chain'],
      });
    }
    // T6 guardrail: residual_risk.flags count MUST equal flag_count
    if (v.residual_risk.flag_count !== v.residual_risk.flags.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `residual_risk.flag_count (${v.residual_risk.flag_count}) != flags.length (${v.residual_risk.flags.length})`,
        path: ['residual_risk', 'flag_count'],
      });
    }
  })
  .describe(
    'x-ui-surface=page:/projects/[id]/recommendation — capstone architecture_recommendation.v1 artifact.',
  );
export type ArchitectureRecommendation = z.infer<
  typeof architectureRecommendationSchema
>;

// Re-export composable primitives for downstream Atlas consumers.
export { costCurveSchema, latencyPriorSchema, availabilityPriorSchema };

/**
 * Registry entry — parallel shape to MODULE_{2,3,4}_PHASE_SCHEMAS + atlas.
 * Consumed by `generate-all.ts` to emit the JSON Schema into
 * `lib/langchain/schemas/generated/synthesis/architecture-recommendation.schema.json`.
 */
export interface SynthesisSchemaEntry {
  slug: string;
  name: string;
  zodSchema: z.ZodType;
}

export const SYNTHESIS_SCHEMAS: readonly SynthesisSchemaEntry[] = [
  {
    slug: 'architecture-recommendation',
    name: 'ArchitectureRecommendation',
    zodSchema: architectureRecommendationSchema,
  },
] as const;
