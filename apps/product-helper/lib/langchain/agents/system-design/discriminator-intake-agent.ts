/**
 * Module 0 — Discriminator Intake Agent (rule-tree, deterministic).
 *
 * Pre-pipeline gate per v1 §5.0.3. Synthesizes the `intake_discriminators.v1`
 * artifact from:
 *   - Tier-0 binary gates G1 (decisions?) + G2 (PRD docs?) → pipeline_route
 *   - Tier-1 top-5 asked discriminators (D0/D4/D6/D7/D8)
 *   - Tier-2 inferred (D1/D3/D5/D9/D10/D12) with inference_audit[]
 *   - pruning_set[] — alternatives removed BEFORE M4 scoring fires
 *   - computed_constants — pre-computed numeric/string primes
 *
 * This is a pure function — no LLM calls, no DB reads. Callers (API route
 * handlers, tests) supply raw Tier-0/1 answers + optional user_profile
 * signals; the agent derives Tier-2 + pruning + constants via a rule
 * tree and returns a Zod-validated artifact.
 *
 * Deterministic-by-design rationale:
 *   - Intake must run in <2 min per §5.0.3; LLM round-trips blow the budget.
 *   - Every inference_audit row must cite concrete sources — rules map
 *     cleanly to sources, LLM output does not.
 *   - Audit-chain reproducibility: same inputs → same outputs, always.
 *
 * Spec: `plans/c1v-MIT-Crawley-Cornell.md` §5.0.3.
 *
 * @module lib/langchain/agents/system-design/discriminator-intake-agent
 */

import { z } from 'zod';

import {
  intakeDiscriminatorsSchema,
  type IntakeDiscriminators,
  type AskedDiscriminators,
  type TierZeroGates,
  type InferenceAuditRow,
  type PruningSetEntry,
  type ComputedConstants,
  type PipelineRoute,
  type Industry,
  type ProductArchetype,
  type DauBand,
  type BudgetBand,
  type BusinessModel,
  type ProjectTypeD3,
  PIPELINE_ROUTES,
} from '../../schemas/module-0/intake-discriminators';
import type { CompanySignals } from '../../schemas/module-0/user-profile';
import type { EntryPattern } from '../../schemas/module-0/project-entry';

// ─────────────────────────────────────────────────────────────────────
// Input envelope
// ─────────────────────────────────────────────────────────────────────

export interface DiscriminatorIntakeInput {
  project_id: string;
  /** G1 + G2 (Tier-0 gates); route derived by agent. */
  tier_0: {
    G1_decisions_needed: boolean;
    G2_prd_needed: boolean;
  };
  /**
   * Tier-1 answers. Any field can be `undefined` meaning the user
   * skipped it — the agent then infers a default and logs the source
   * to `inference_audit[]` with reduced confidence.
   */
  tier_1: Partial<AskedDiscriminators>;
  /** Drives D3 Tier-2 inference + pipeline-routing sanity check. */
  entry_pattern: EntryPattern;
  /** Optional signup enrichment; feeds D1/D5/D6/D8/D9 inference. */
  company_signals?: CompanySignals;
  /** Optional ISO-3166-1 region; feeds D9. */
  signup_geo?: string;
  /** Wall-clock intake duration (seconds) if measured by caller. */
  intake_duration_seconds?: number;
  /** Override for deterministic `created_at` in tests. */
  now?: () => Date;
}

// ─────────────────────────────────────────────────────────────────────
// Tier-0 route derivation
// ─────────────────────────────────────────────────────────────────────

export function deriveTierZeroRoute(gates: {
  G1_decisions_needed: boolean;
  G2_prd_needed: boolean;
}): PipelineRoute {
  const { G1_decisions_needed: g1, G2_prd_needed: g2 } = gates;
  if (g1 && g2) return 'full';
  if (g1 && !g2) return 'decisions-only';
  if (!g1 && g2) return 'prd-only';
  return 'browse-only';
}

// ─────────────────────────────────────────────────────────────────────
// Tier-1 fallback inference (when user skipped a question)
// ─────────────────────────────────────────────────────────────────────

/**
 * Reasonable greenfield defaults when a Tier-1 field was skipped.
 * These surface in `inference_audit[]` as asked-tier fallbacks with
 * lowered confidence so the UI can badge them.
 */
const TIER_1_FALLBACKS: Required<AskedDiscriminators> = {
  D0_product_archetype: 'SaaS',
  D4_dau_band: '1K-10K',
  D6_industry: 'b2b-saas-agnostic',
  D8_budget_band: '$1-10K',
  D7_transaction_pattern: 'mixed-CRUD',
};

interface FillAskedResult {
  asked: AskedDiscriminators;
  /** Rows to append to inference_audit for any skipped Tier-1 fields. */
  skipAuditRows: Array<{
    field: keyof AskedDiscriminators;
    value: string;
    sources: string[];
  }>;
}

function fillAskedWithFallbacks(
  tier1: Partial<AskedDiscriminators>,
  companySignals?: CompanySignals,
): FillAskedResult {
  const skipAuditRows: FillAskedResult['skipAuditRows'] = [];

  const D6 = tier1.D6_industry ?? (normalizeIndustry(companySignals?.industry) ??
    TIER_1_FALLBACKS.D6_industry);
  if (tier1.D6_industry === undefined) {
    skipAuditRows.push({
      field: 'D6_industry',
      value: D6,
      sources: companySignals?.industry
        ? [`user_profile.company_signals.industry=${companySignals.industry}`]
        : ['fallback:b2b-saas-agnostic'],
    });
  }

  const D8: BudgetBand = tier1.D8_budget_band ??
    (budgetFromFundingStage(companySignals?.funding_stage) ??
      TIER_1_FALLBACKS.D8_budget_band);
  if (tier1.D8_budget_band === undefined) {
    skipAuditRows.push({
      field: 'D8_budget_band',
      value: D8,
      sources: companySignals?.funding_stage
        ? [`user_profile.company_signals.funding_stage=${companySignals.funding_stage}`]
        : ['fallback:$1-10K'],
    });
  }

  const D0: ProductArchetype =
    tier1.D0_product_archetype ?? TIER_1_FALLBACKS.D0_product_archetype;
  if (tier1.D0_product_archetype === undefined) {
    skipAuditRows.push({
      field: 'D0_product_archetype',
      value: D0,
      sources: ['fallback:SaaS'],
    });
  }

  const D4: DauBand = tier1.D4_dau_band ?? TIER_1_FALLBACKS.D4_dau_band;
  if (tier1.D4_dau_band === undefined) {
    skipAuditRows.push({
      field: 'D4_dau_band',
      value: D4,
      sources: ['fallback:1K-10K'],
    });
  }

  const D7 =
    tier1.D7_transaction_pattern ??
    transactionFromArchetype(D0) ??
    TIER_1_FALLBACKS.D7_transaction_pattern;
  if (tier1.D7_transaction_pattern === undefined) {
    skipAuditRows.push({
      field: 'D7_transaction_pattern',
      value: D7,
      sources: [`D0=${D0}`],
    });
  }

  return {
    asked: {
      D0_product_archetype: D0,
      D4_dau_band: D4,
      D6_industry: D6,
      D8_budget_band: D8,
      D7_transaction_pattern: D7,
    },
    skipAuditRows,
  };
}

function normalizeIndustry(raw?: string): Industry | undefined {
  if (!raw) return undefined;
  const k = raw.toLowerCase();
  if (k.includes('health') || k.includes('medic')) return 'medical-healthcare';
  if (k.includes('financ') || k.includes('fintech') || k.includes('bank'))
    return 'financial-fintech';
  if (k.includes('gov') || k.includes('public')) return 'government-public';
  if (k.includes('educ') || k.includes('school')) return 'education';
  if (k.includes('legal') || k.includes('law')) return 'legal';
  if (k.includes('retail') || k.includes('ecomm') || k.includes('shop'))
    return 'ecommerce-retail';
  if (k.includes('media') || k.includes('content') || k.includes('news'))
    return 'content-media';
  if (k.includes('saas') || k.includes('b2b')) return 'b2b-saas-agnostic';
  if (k.includes('infra') || k.includes('hardware') || k.includes('iot'))
    return 'infrastructure-physical';
  return undefined;
}

function budgetFromFundingStage(stage?: string): BudgetBand | undefined {
  if (!stage) return undefined;
  const s = stage.toLowerCase();
  if (s.includes('bootstrap') || s.includes('pre-seed')) return '<$100';
  if (s.includes('seed')) return '$100-1K';
  if (s.includes('series a')) return '$1-10K';
  if (s.includes('series b') || s.includes('series c')) return '$10-100K';
  if (s.includes('public') || s.includes('late') || s.includes('series d'))
    return '$100K+';
  return undefined;
}

function transactionFromArchetype(
  archetype: ProductArchetype,
): AskedDiscriminators['D7_transaction_pattern'] | undefined {
  switch (archetype) {
    case 'E-Commerce':
    case 'Marketplace':
      return 'mixed-CRUD';
    case 'Mobile':
    case 'SaaS':
      return 'read-heavy';
    case 'API':
      return 'mixed-CRUD';
    case 'Internal-Tool':
      return 'read-heavy';
    case 'Open-Source':
      return 'read-heavy';
    default:
      return undefined;
  }
}

// ─────────────────────────────────────────────────────────────────────
// Tier-2 inference (6 discriminators; each produces an audit row)
// ─────────────────────────────────────────────────────────────────────

interface InferResult {
  D1: string;
  D3: ProjectTypeD3;
  D5: BusinessModel;
  D9: string;
  D10: string;
  D12: string;
  audit: InferenceAuditRow[];
}

function inferTier2(
  asked: AskedDiscriminators,
  entryPattern: EntryPattern,
  companySignals?: CompanySignals,
  signupGeo?: string,
): InferResult {
  const audit: InferenceAuditRow[] = [];

  // D1 team_size — company signals.employee_count_band OR D8 proxy.
  const D1_sources: string[] = [];
  let D1: string;
  if (companySignals?.employee_count_band) {
    D1 = companySignals.employee_count_band;
    D1_sources.push(`user_profile.company_signals.employee_count_band=${D1}`);
  } else {
    D1 = teamSizeFromBudget(asked.D8_budget_band);
    D1_sources.push(`D8=${asked.D8_budget_band}`);
  }
  audit.push({
    discriminator: 'D1',
    inferred_value: D1,
    confidence: companySignals?.employee_count_band ? 0.9 : 0.55,
    sources: D1_sources,
  });

  // D3 project_type — directly derived from entry_pattern.
  const D3: ProjectTypeD3 =
    entryPattern === 'existing' ? 'brownfield' : 'greenfield';
  audit.push({
    discriminator: 'D3',
    inferred_value: D3,
    confidence: 1.0,
    sources: [`project_entry.entry_pattern=${entryPattern}`],
  });

  // D5 business_model — D0 archetype + industry.
  const D5 = businessModelFromArchetypeAndIndustry(
    asked.D0_product_archetype,
    asked.D6_industry,
  );
  audit.push({
    discriminator: 'D5',
    inferred_value: D5,
    confidence: 0.7,
    sources: [`D0=${asked.D0_product_archetype}`, `D6=${asked.D6_industry}`],
  });

  // D9 geo — signup_geo IP default.
  const D9 = signupGeo ?? 'US';
  audit.push({
    discriminator: 'D9',
    inferred_value: D9,
    confidence: signupGeo ? 0.85 : 0.4,
    sources: signupGeo
      ? [`user_profile.signup_geo=${signupGeo}`]
      : ['fallback:US'],
  });

  // D10 SLA tier — from D5 + industry defaults.
  const D10 = slaTierFromBusinessModelAndIndustry(D5, asked.D6_industry);
  audit.push({
    discriminator: 'D10',
    inferred_value: D10,
    confidence: 0.65,
    sources: [`D5=${D5}`, `D6=${asked.D6_industry}`],
  });

  // D12 data_sensitivity — from D0 + industry.
  const D12 = dataSensitivityFromArchetypeAndIndustry(
    asked.D0_product_archetype,
    asked.D6_industry,
  );
  audit.push({
    discriminator: 'D12',
    inferred_value: D12,
    confidence: 0.7,
    sources: [`D0=${asked.D0_product_archetype}`, `D6=${asked.D6_industry}`],
  });

  return { D1, D3, D5, D9, D10, D12, audit };
}

function teamSizeFromBudget(b: BudgetBand): string {
  switch (b) {
    case '<$100':
      return '1-2';
    case '$100-1K':
      return '1-5';
    case '$1-10K':
      return '5-15';
    case '$10-100K':
      return '15-50';
    case '$100K+':
      return '50+';
  }
}

function businessModelFromArchetypeAndIndustry(
  a: ProductArchetype,
  i: Industry,
): BusinessModel {
  if (a === 'Internal-Tool') return 'internal-tool';
  if (a === 'Marketplace' || a === 'E-Commerce') return 'B2C';
  if (i === 'b2b-saas-agnostic' || i === 'infrastructure-physical') return 'B2B';
  if (i === 'ecommerce-retail' || i === 'content-media') return 'B2C';
  if (i === 'medical-healthcare' || i === 'financial-fintech') return 'B2B2C';
  return 'B2B';
}

function slaTierFromBusinessModelAndIndustry(m: BusinessModel, i: Industry): string {
  if (i === 'medical-healthcare' || i === 'financial-fintech') return '99.95';
  if (i === 'government-public') return '99.9';
  if (m === 'internal-tool') return '99.0';
  return '99.5';
}

function dataSensitivityFromArchetypeAndIndustry(
  a: ProductArchetype,
  i: Industry,
): string {
  if (i === 'medical-healthcare') return 'PHI';
  if (i === 'financial-fintech') return 'PCI';
  if (i === 'government-public') return 'CUI';
  if (i === 'legal') return 'privileged';
  if (a === 'Internal-Tool') return 'internal';
  return 'pii-basic';
}

// ─────────────────────────────────────────────────────────────────────
// Pruning set — remove non-viable alternatives BEFORE M4 scoring
// ─────────────────────────────────────────────────────────────────────

function computePruningSet(
  asked: AskedDiscriminators,
  inferred: { D10: string; D12: string },
): PruningSetEntry[] {
  const entries: PruningSetEntry[] = [];

  // Budget prunes expensive managed services.
  if (asked.D8_budget_band === '<$100' || asked.D8_budget_band === '$100-1K') {
    entries.push({
      decision_id: 'database-choice',
      removed_alternatives: [
        'aurora-multi-region',
        'cockroachdb-dedicated',
        'spanner',
      ],
      rationale: `D8=${asked.D8_budget_band} rules out dedicated cluster tiers (>$1k/mo floor).`,
    });
    entries.push({
      decision_id: 'observability-stack',
      removed_alternatives: ['datadog-enterprise', 'splunk-enterprise'],
      rationale: `D8=${asked.D8_budget_band} — enterprise observability tiers exceed budget.`,
    });
  }

  // Real-time transaction pattern prunes batch-only options.
  if (asked.D7_transaction_pattern === 'real-time') {
    entries.push({
      decision_id: 'data-pipeline',
      removed_alternatives: ['airflow-batch-only', 'daily-etl'],
      rationale: 'D7=real-time rules out batch-only data pipelines.',
    });
  }

  // Compliance-heavy industries prune non-compliant infra.
  if (inferred.D12 === 'PHI') {
    entries.push({
      decision_id: 'cloud-region',
      removed_alternatives: ['public-region-non-baa', 'consumer-saas-no-baa'],
      rationale: 'D12=PHI requires HIPAA BAA-eligible region + vendor only.',
    });
  }
  if (inferred.D12 === 'PCI') {
    entries.push({
      decision_id: 'payment-processor',
      removed_alternatives: ['raw-card-storage', 'self-hosted-hsm-v1'],
      rationale: 'D12=PCI forces tokenization-based processors only.',
    });
  }

  // Small-DAU prunes global multi-region distributions.
  if (asked.D4_dau_band === '<100' || asked.D4_dau_band === '100-1K') {
    entries.push({
      decision_id: 'region-strategy',
      removed_alternatives: ['multi-region-active-active', 'global-anycast'],
      rationale: `D4=${asked.D4_dau_band} — single-region is sufficient and cost-optimal.`,
    });
  }

  return entries;
}

// ─────────────────────────────────────────────────────────────────────
// Computed constants
// ─────────────────────────────────────────────────────────────────────

function computeConstants(
  asked: AskedDiscriminators,
  inferred: { D10: string },
): ComputedConstants {
  return {
    peakRpsFromDau: peakRpsFromDau(asked.D4_dau_band),
    monthlyInfraBudgetUsd: budgetBandMidpointUsd(asked.D8_budget_band),
    slaTier: inferred.D10,
    dauBandLabel: asked.D4_dau_band,
  };
}

function peakRpsFromDau(b: DauBand): number {
  // Little's-Law-ish order-of-magnitude: midpoint DAU × 10 reqs/day / 86400s × 3 peak-to-avg.
  const midpoint: Record<DauBand, number> = {
    '<100': 50,
    '100-1K': 500,
    '1K-10K': 5_000,
    '10K-100K': 50_000,
    '100K-1M': 500_000,
    '1M+': 2_000_000,
  };
  const dau = midpoint[b];
  return Math.ceil(((dau * 10) / 86_400) * 3);
}

function budgetBandMidpointUsd(b: BudgetBand): number {
  const midpoint: Record<BudgetBand, number> = {
    '<$100': 50,
    '$100-1K': 500,
    '$1-10K': 5_000,
    '$10-100K': 50_000,
    '$100K+': 250_000,
  };
  return midpoint[b];
}

// ─────────────────────────────────────────────────────────────────────
// Orchestrator
// ─────────────────────────────────────────────────────────────────────

/**
 * Run the rule tree. Returns a Zod-validated `intake_discriminators.v1`
 * artifact; throws `z.ZodError` if refines fail (invariant breach).
 */
export function runDiscriminatorIntake(
  input: DiscriminatorIntakeInput,
): IntakeDiscriminators {
  const now = input.now ?? (() => new Date());

  // Tier-0.
  const route = deriveTierZeroRoute(input.tier_0);
  const tier_0: TierZeroGates = {
    G1_decisions_needed: input.tier_0.G1_decisions_needed,
    G2_prd_needed: input.tier_0.G2_prd_needed,
    pipeline_route: route,
  };

  // Tier-1 (fill skips).
  const { asked, skipAuditRows } = fillAskedWithFallbacks(
    input.tier_1,
    input.company_signals,
  );

  // Tier-2.
  const tier2 = inferTier2(
    asked,
    input.entry_pattern,
    input.company_signals,
    input.signup_geo,
  );

  // Pruning + constants.
  const pruning_set = computePruningSet(asked, {
    D10: tier2.D10,
    D12: tier2.D12,
  });
  const computed_constants = computeConstants(asked, { D10: tier2.D10 });

  // NOTE: skipAuditRows are informational and not part of the Tier-2 audit
  // (which must be D1/D3/D5/D9/D10/D12 per the schema regex). We fold them
  // into computed_constants via a sidecar key so they're retrievable.
  if (skipAuditRows.length > 0) {
    computed_constants.tier1SkippedCount = skipAuditRows.length;
  }

  const artifact: IntakeDiscriminators = {
    _schema: 'intake_discriminators.v1',
    project_id: input.project_id,
    tier_0,
    asked,
    inferred: {
      D1_team_size: tier2.D1,
      D3_project_type: tier2.D3,
      D5_business_model: tier2.D5,
      D9_geo: tier2.D9,
      D10_sla_tier: tier2.D10,
      D12_data_sensitivity: tier2.D12,
    },
    inference_audit: tier2.audit,
    pruning_set,
    computed_constants,
    intake_duration_seconds: input.intake_duration_seconds,
    created_at: now().toISOString(),
  };

  // Zod-validate (throws on invariant breach).
  return intakeDiscriminatorsSchema.parse(artifact);
}

// Re-exports for caller convenience.
export { PIPELINE_ROUTES };
export type { IntakeDiscriminators, PipelineRoute };
