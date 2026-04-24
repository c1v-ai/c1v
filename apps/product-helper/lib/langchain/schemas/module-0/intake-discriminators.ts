/**
 * Module 0 — `intake_discriminators.v1` (Tier-0 gates + Tier-1 asked
 * + Tier-2 inferred + inference audit + pruning set + computed constants).
 *
 * Emitted by `discriminator-intake-agent.ts` after the per-project intake
 * flow. This is the single artifact that primes the decision-network
 * pipeline: it carries the routing gates (G1/G2), the minimum
 * discriminators (D0/D4/D6/D7/D8), Tier-2 inferred values with audit
 * trail, and the pruning_set that removes non-viable alternatives
 * BEFORE any scoring fires in M4.
 *
 * Invariants enforced by `.superRefine`:
 *   1. Every `inferred.*` field must appear as an `inference_audit[]`
 *      entry (one audit row per inference — tamper-detectable).
 *   2. Every `pruning_set[]` entry must carry a non-empty
 *      `removed_alternatives` array and a rationale.
 *   3. `computed_constants` keys are camelCase-or-snake_case identifiers.
 *
 * Spec: `plans/c1v-MIT-Crawley-Cornell.md` §5.0.3.
 *
 * @module lib/langchain/schemas/module-0/intake-discriminators
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────
// Tier-0 gate envelope
// ─────────────────────────────────────────────────────────────────────

/**
 * Pipeline routing derived from G1 × G2 truth table (2×2 = 4 routes):
 *   full           — G1=yes, G2=yes (default; full methodology + PRD)
 *   decisions-only — G1=yes, G2=no  (M4 only; ephemeral output)
 *   prd-only       — G1=no,  G2=yes (M1→M3 + synthesizer; skip M4)
 *   browse-only    — G1=no,  G2=no  (M1→M3 only, ephemeral)
 */
export const PIPELINE_ROUTES = [
  'full',
  'decisions-only',
  'prd-only',
  'browse-only',
] as const;
export type PipelineRoute = (typeof PIPELINE_ROUTES)[number];

export const tierZeroGatesSchema = z
  .object({
    G1_decisions_needed: z
      .boolean()
      .describe(
        'x-ui-surface=section:onboarding.intake-tier-0 | G1: Do you need help making system design decisions? YES fires the M4 decision-network pipeline.',
      ),
    G2_prd_needed: z
      .boolean()
      .describe(
        'x-ui-surface=section:onboarding.intake-tier-0 | G2: Do you want spec-tight PRD documentation? YES fires the synthesizer + export pipeline.',
      ),
    pipeline_route: z
      .enum(PIPELINE_ROUTES)
      .describe(
        'x-ui-surface=internal | Derived from G1×G2; enforced by the refine on the outer schema.',
      ),
  })
  .strict();

export type TierZeroGates = z.infer<typeof tierZeroGatesSchema>;

// ─────────────────────────────────────────────────────────────────────
// Tier-1 asked discriminators
// ─────────────────────────────────────────────────────────────────────

export const PRODUCT_ARCHETYPES = [
  'SaaS',
  'Mobile',
  'Marketplace',
  'API',
  'E-Commerce',
  'Internal-Tool',
  'Open-Source',
  'Other',
] as const;
export type ProductArchetype = (typeof PRODUCT_ARCHETYPES)[number];

export const DAU_BANDS = [
  '<100',
  '100-1K',
  '1K-10K',
  '10K-100K',
  '100K-1M',
  '1M+',
] as const;
export type DauBand = (typeof DAU_BANDS)[number];

export const BUDGET_BANDS = [
  '<$100',
  '$100-1K',
  '$1-10K',
  '$10-100K',
  '$100K+',
] as const;
export type BudgetBand = (typeof BUDGET_BANDS)[number];

export const TRANSACTION_PATTERNS = [
  'read-heavy',
  'write-heavy',
  'mixed-CRUD',
  'real-time',
  'batch',
] as const;
export type TransactionPattern = (typeof TRANSACTION_PATTERNS)[number];

/**
 * D6 industry taxonomy — aligned with the v1 §5.0.3 Tier-1 table.
 * Provider-enriched free-text from `user_profile.company_signals.industry`
 * gets normalized into one of these before landing here.
 */
export const INDUSTRIES = [
  'medical-healthcare',
  'financial-fintech',
  'government-public',
  'education',
  'legal',
  'ecommerce-retail',
  'content-media',
  'b2b-saas-agnostic',
  'infrastructure-physical',
  'emerging',
  'mission-driven',
  'other',
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const askedDiscriminatorsSchema = z
  .object({
    D0_product_archetype: z
      .enum(PRODUCT_ARCHETYPES)
      .describe(
        'x-ui-surface=section:onboarding.tier-1 | D0: What are you building? Auto-infers D5/D6/D7/D12 for ~80% of cases.',
      ),
    D4_dau_band: z
      .enum(DAU_BANDS)
      .describe(
        'x-ui-surface=section:onboarding.tier-1 | D4: target (new/exploring) or current (existing) DAU band.',
      ),
    D6_industry: z
      .enum(INDUSTRIES)
      .describe(
        'x-ui-surface=section:onboarding.tier-1 | D6: industry — auto-infers compliance posture + SLA defaults + data sensitivity.',
      ),
    D8_budget_band: z
      .enum(BUDGET_BANDS)
      .describe(
        'x-ui-surface=section:onboarding.tier-1 | D8: monthly infra budget band — prunes expensive alternatives.',
      ),
    D7_transaction_pattern: z
      .enum(TRANSACTION_PATTERNS)
      .describe(
        'x-ui-surface=section:onboarding.tier-1 | D7: dominant transaction shape — reshapes decision-network axis weighting.',
      ),
  })
  .strict();

export type AskedDiscriminators = z.infer<typeof askedDiscriminatorsSchema>;

// ─────────────────────────────────────────────────────────────────────
// Tier-2 inferred discriminators
// ─────────────────────────────────────────────────────────────────────

export const PROJECT_TYPES_D3 = ['greenfield', 'brownfield', 'hybrid'] as const;
export type ProjectTypeD3 = (typeof PROJECT_TYPES_D3)[number];

export const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'internal-tool'] as const;
export type BusinessModel = (typeof BUSINESS_MODELS)[number];

export const inferredDiscriminatorsSchema = z
  .object({
    D1_team_size: z
      .string()
      .min(1)
      .max(40)
      .describe(
        'x-ui-surface=internal | Inferred team size band (from company_signals.employee_count_band OR D8 proxy).',
      ),
    D3_project_type: z
      .enum(PROJECT_TYPES_D3)
      .describe(
        'x-ui-surface=internal | greenfield / brownfield / hybrid — directly derived from `project_entry.entry_pattern`.',
      ),
    D5_business_model: z
      .enum(BUSINESS_MODELS)
      .describe('x-ui-surface=internal | B2B / B2C / B2B2C / internal-tool.'),
    D9_geo: z
      .string()
      .min(2)
      .max(40)
      .describe(
        'x-ui-surface=internal | Geographic distribution hint (single-region default from signup_geo IP).',
      ),
    D10_sla_tier: z
      .string()
      .min(1)
      .max(40)
      .describe(
        'x-ui-surface=internal | SLA tier default from D5 + D6; only surfaced at M4 if in conflict with user input.',
      ),
    D12_data_sensitivity: z
      .string()
      .min(1)
      .max(40)
      .describe(
        'x-ui-surface=internal | Data-sensitivity class from D0 + D6 industry defaults.',
      ),
  })
  .strict();

export type InferredDiscriminators = z.infer<typeof inferredDiscriminatorsSchema>;

/**
 * Set of discriminator ids that must appear in `inference_audit[]`.
 * Kept in sync with `inferredDiscriminatorsSchema` keys.
 */
export const INFERRED_DISCRIMINATOR_IDS = [
  'D1',
  'D3',
  'D5',
  'D9',
  'D10',
  'D12',
] as const;
export type InferredDiscriminatorId = (typeof INFERRED_DISCRIMINATOR_IDS)[number];

// ─────────────────────────────────────────────────────────────────────
// Inference audit rows
// ─────────────────────────────────────────────────────────────────────

export const inferenceAuditRowSchema = z
  .object({
    discriminator: z
      .string()
      .regex(
        /^D(?:1|3|5|9|10|12)$/,
        'discriminator must be one of D1/D3/D5/D9/D10/D12 (Tier-2 only).',
      )
      .describe(
        'x-ui-surface=internal | Discriminator id (D1/D3/D5/D9/D10/D12).',
      ),
    inferred_value: z
      .string()
      .min(1)
      .max(160)
      .describe(
        'x-ui-surface=internal | The value we landed on (stringified for cross-type audit parity).',
      ),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'x-ui-surface=internal | Confidence in [0,1]. Values <0.60 SHOULD have surfaced a Tier-2 confirm prompt per §5.0.3.',
      ),
    sources: z
      .array(z.string().min(1).max(200))
      .min(1)
      .max(10)
      .describe(
        'x-ui-surface=internal | Source trail, e.g. ["D0=E-Commerce","user_profile.industry=retail"]. At least one source required.',
      ),
  })
  .strict();

export type InferenceAuditRow = z.infer<typeof inferenceAuditRowSchema>;

// ─────────────────────────────────────────────────────────────────────
// Pruning set
// ─────────────────────────────────────────────────────────────────────

export const pruningSetEntrySchema = z
  .object({
    decision_id: z
      .string()
      .min(1)
      .max(120)
      .describe(
        'x-ui-surface=internal | M4 decision node id the pruning applies to.',
      ),
    removed_alternatives: z
      .array(z.string().min(1).max(160))
      .min(1)
      .max(40)
      .describe(
        'x-ui-surface=internal | Alternatives removed from this decision node’s option set pre-scoring.',
      ),
    rationale: z
      .string()
      .min(1)
      .max(500)
      .describe(
        'x-ui-surface=internal | Plain-language reason (e.g. "D8=<$100 rules out dedicated Aurora cluster").',
      ),
  })
  .strict();

export type PruningSetEntry = z.infer<typeof pruningSetEntrySchema>;

// ─────────────────────────────────────────────────────────────────────
// Computed constants
// ─────────────────────────────────────────────────────────────────────

/**
 * Stable identifier regex for `computed_constants` keys. Accepts
 * camelCase and snake_case (plus digits); rejects spaces, dots, etc.
 * so downstream consumers can safely treat keys as JS identifiers.
 */
const CONSTANT_KEY_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const computedConstantsSchema = z
  .record(z.string(), z.union([z.number(), z.string()]))
  .describe(
    'x-ui-surface=internal | Pre-computed numeric/string constants keyed by identifier. Populated by the intake agent from Tier-1/2 answers (e.g. {peakRpsFromDau: 120, slaTier: "99.9"}).',
  );

export type ComputedConstants = z.infer<typeof computedConstantsSchema>;

// ─────────────────────────────────────────────────────────────────────
// Top-level intake_discriminators.v1
// ─────────────────────────────────────────────────────────────────────

export const intakeDiscriminatorsSchema = z
  .object({
    _schema: z
      .literal('intake_discriminators.v1')
      .describe('x-ui-surface=internal | Stable schema identifier.'),
    project_id: z
      .string()
      .min(1)
      .max(64)
      .describe(
        'x-ui-surface=internal | Matches `projects.id`; scopes RLS + join key to `project_entry_states`.',
      ),
    tier_0: tierZeroGatesSchema.describe(
      'x-ui-surface=internal | G1/G2 gates + derived route.',
    ),
    asked: askedDiscriminatorsSchema.describe(
      'x-ui-surface=internal | Tier-1: user-answered top-5 discriminators.',
    ),
    inferred: inferredDiscriminatorsSchema.describe(
      'x-ui-surface=internal | Tier-2: agent-inferred discriminators.',
    ),
    inference_audit: z
      .array(inferenceAuditRowSchema)
      .min(1)
      .max(20)
      .describe(
        'x-ui-surface=internal | One row per Tier-2 inference; the refine below enforces 1:1 coverage with `inferred.*`.',
      ),
    pruning_set: z
      .array(pruningSetEntrySchema)
      .max(100)
      .describe(
        'x-ui-surface=internal | Pre-M4 alternative pruning entries. Empty is permitted (no pruning applied).',
      ),
    computed_constants: computedConstantsSchema,
    intake_duration_seconds: z
      .number()
      .min(0)
      .max(600)
      .optional()
      .describe(
        'x-ui-surface=internal | Wall-clock intake duration. Target <120s per §5.0.3 design principle.',
      ),
    created_at: z
      .string()
      .datetime({ offset: true })
      .describe('x-ui-surface=internal | ISO-8601 creation timestamp.'),
  })
  .strict()
  .superRefine((value, ctx) => {
    // Invariant 1: tier_0 route matches G1×G2 truth table.
    const { G1_decisions_needed: g1, G2_prd_needed: g2, pipeline_route } =
      value.tier_0;
    const expectedRoute: PipelineRoute = g1 && g2
      ? 'full'
      : g1 && !g2
        ? 'decisions-only'
        : !g1 && g2
          ? 'prd-only'
          : 'browse-only';
    if (pipeline_route !== expectedRoute) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tier_0', 'pipeline_route'],
        message: `pipeline_route must be ${expectedRoute} for G1=${g1}, G2=${g2}; got ${pipeline_route}.`,
      });
    }

    // Invariant 2: every inferred.* has a matching inference_audit row.
    const auditIds = new Set(value.inference_audit.map((r) => r.discriminator));
    for (const id of INFERRED_DISCRIMINATOR_IDS) {
      if (!auditIds.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['inference_audit'],
          message: `inference_audit missing entry for ${id} — every Tier-2 inferred field requires an audit row.`,
        });
      }
    }

    // Invariant 3: computed_constants keys are valid identifiers.
    for (const key of Object.keys(value.computed_constants)) {
      if (!CONSTANT_KEY_REGEX.test(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['computed_constants', key],
          message: `computed_constants key "${key}" is not a valid identifier (expected /^[a-zA-Z_][a-zA-Z0-9_]*$/).`,
        });
      }
    }
  });

export type IntakeDiscriminators = z.infer<typeof intakeDiscriminatorsSchema>;
