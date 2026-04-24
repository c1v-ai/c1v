/**
 * KB-8 Atlas — Company entry schema.
 *
 * Canonical shape every entry under
 *   `.planning/phases/13-.../New-knowledge-banks/8-stacks-and-priors-atlas/companies/*.md`
 * MUST conform to. Stored as YAML frontmatter + markdown body; this schema
 * validates the frontmatter half.
 *
 * Three entry kinds (Atlas plan §4.3):
 *   - `public`              — SEC-filing-eligible public company.
 *   - `ai_infra_public`     — public AI/data/ML-infra co. (Palantir, Snowflake).
 *   - `frontier_ai_private` — private frontier-AI labs (OpenAI, Anthropic).
 *
 * Stricter rules apply to AI entries:
 *   - `ai_stack` block REQUIRED.
 *   - `utility_weight_hints` REQUIRED.
 *   - `scale.source_tier`: relaxed — B/G acceptable (no 10-K exists).
 *
 * Security (per security-review.md F1-F4):
 *   - Every numeric prior is Zod-refined at the priors layer to reject
 *     tier-D/F/H-only citations.
 *   - `source_url` is HTTPS-only; domain allowlist enforced at ingest.
 *   - `last_verified` + citation.publish_date drive an 18-month staleness
 *     gate (not enforced here — consumer agents receive a warning).
 *
 * @module lib/langchain/schemas/atlas/entry
 */

import { z } from 'zod';
import {
  atlasPriorRefSchema,
  availabilityPriorSchema,
  citationSchema,
  costCurveSchema,
  isoDateSchema,
  latencyPriorSchema,
  sourceTierSchema,
  throughputPriorSchema,
  utilityWeightHintsSchema,
} from './priors';

// ─────────────────────────────────────────────────────────────────────────
// Entry-kind + stack-slot primitives
// ─────────────────────────────────────────────────────────────────────────

/**
 * Entry-kind discriminator.
 *
 * Four variants:
 *   - `public`              — SEC-filing-eligible public company.
 *   - `ai_infra_public`     — public AI/data/ML-infra co. (Palantir, Snowflake).
 *   - `frontier_ai_private` — private frontier-AI labs (OpenAI, Anthropic).
 *   - `private_consumer`    — private non-AI-frontier company (discord,
 *     reddit-pre-IPO, canva, notion, figma-pre-IPO, stripe, miro, linear).
 *     Scale tier: B (own company page) acceptable, narrower than frontier_ai_private's
 *     dual-C press rule. Priors remain strict B/E-IC/G. `ai_stack` optional.
 */
export const entryKindSchema = z.enum([
  'public',
  'ai_infra_public',
  'frontier_ai_private',
  'private_consumer',
]);
export type EntryKind = z.infer<typeof entryKindSchema>;

export const verificationStatusSchema = z.enum([
  'verified',
  'partial',
  'inferred',
]);
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

/**
 * Scale metric. Consumer-facing apps report DAU/MAU; AI APIs report requests.
 */
export const scaleMetricSchema = z.enum([
  'daily_active_users',
  'monthly_active_users',
  'api_calls_per_day_est',
  'paying_subscribers',
  'registered_members',
  'gmv_usd_annual',
  'repositories_count',
  'seats_active',
]);
export type ScaleMetric = z.infer<typeof scaleMetricSchema>;

/**
 * Scale band — structured scale claim with citation. `value` permits a
 * range (two numbers) for press-estimated figures.
 */
export const scaleBandSchema = z
  .object({
    metric: scaleMetricSchema.describe(
      'x-ui-surface=section:Entry > Scale — which scale metric is reported.',
    ),
    value: z
      .union([
        z.number().nonnegative(),
        z
          .tuple([z.number().nonnegative(), z.number().nonnegative()])
          .refine((t) => t[0] <= t[1], 'range low must be ≤ range high'),
      ])
      .describe(
        'x-ui-surface=section:Entry > Scale — point estimate or [low, high] range.',
      ),
    as_of: z
      .string()
      .regex(
        /^\d{4}(-Q[1-4]|-\d{2})?$/,
        'as_of must be YYYY, YYYY-MM, or YYYY-Q[1-4]',
      )
      .describe(
        'x-ui-surface=section:Entry > Scale — reporting period (e.g., "2025-Q4").',
      ),
    citation: citationSchema,
  })
  .describe('x-ui-surface=section:Entry > Scale — cited scale claim.');
export type ScaleBand = z.infer<typeof scaleBandSchema>;

/**
 * DAU / MAU bucket for index lookups (`indexes/by-dau.json`). Atlas-plan
 * §4.3 vocab: lets the `atlasLookup(dauRange)` helper bucket-match without
 * numeric comparisons.
 */
export const dauBandSchema = z.enum([
  'under_10k',
  '10k_100k',
  '100k_1m',
  '1m_10m',
  '10m_100m',
  'over_100m',
  'unknown',
]);
export type DauBand = z.infer<typeof dauBandSchema>;

export const costBandSchema = z.enum([
  'under_100k_usd',
  '100k_1m_usd',
  '1m_10m_usd',
  '10m_100m_usd',
  '100m_1b_usd',
  'over_1b_usd',
  'undisclosed',
]);
export type CostBand = z.infer<typeof costBandSchema>;

/**
 * Stack slots — flat arrays of string tokens. We deliberately do NOT
 * enum-lock these; the taxonomy drifts faster than the schema should. The
 * `indexes/by-primary-lang.json` + `by-db.json` scripts normalize into the
 * stable vocabulary. Keep tokens short, snake_case preferred, underscores
 * for versions (e.g., `postgres_managed`, `TPU_v5`).
 */
export const stackSlotArraySchema = z
  .array(z.string().min(1).max(60))
  .default([]);

export const frontendStackSchema = z
  .object({
    web: stackSlotArraySchema,
    mobile: stackSlotArraySchema,
    desktop: stackSlotArraySchema.optional(),
  })
  .describe('x-ui-surface=section:Entry > Frontend — frontend stack slots.');

export const backendStackSchema = z
  .object({
    primary_langs: stackSlotArraySchema,
    frameworks: stackSlotArraySchema,
    runtimes: stackSlotArraySchema.optional(),
  })
  .describe('x-ui-surface=section:Entry > Backend — backend stack slots.');

export const dataStackSchema = z
  .object({
    oltp: stackSlotArraySchema,
    cache: stackSlotArraySchema,
    warehouse: stackSlotArraySchema,
    vector: stackSlotArraySchema.optional(),
    search: stackSlotArraySchema.optional(),
    queue: stackSlotArraySchema.optional(),
  })
  .describe('x-ui-surface=section:Entry > Data — data-tier stack slots.');

export const infraStackSchema = z
  .object({
    cloud: stackSlotArraySchema,
    compute: stackSlotArraySchema,
    cdn: stackSlotArraySchema.optional(),
    observability: stackSlotArraySchema.optional(),
    security: stackSlotArraySchema.optional(),
  })
  .describe('x-ui-surface=section:Entry > Infra — infrastructure stack slots.');

/**
 * AI-specific stack block. REQUIRED on entries with kind ∈ {ai_infra_public,
 * frontier_ai_private} — enforced by `companyAtlasEntrySchema.superRefine`.
 */
export const aiStackSchema = z
  .object({
    training_framework: stackSlotArraySchema,
    serving: stackSlotArraySchema,
    evals: stackSlotArraySchema,
    fine_tune: stackSlotArraySchema.optional(),
    rag: stackSlotArraySchema.optional(),
  })
  .describe('x-ui-surface=section:Entry > AI Stack — training/serving/evals slots.');

/**
 * Index-facet enums used by `indexes/by-gpu-exposure.json` +
 * `by-inference-pattern.json`. AI-specific; `null` allowed on non-AI
 * entries so the indexer emits a consistent key.
 */
export const gpuExposureSchema = z.enum([
  'owns_cluster',
  'rents_long_term',
  'rents_spot',
  'serverless',
  'none',
]);
export type GpuExposure = z.infer<typeof gpuExposureSchema>;

export const inferencePatternSchema = z.enum([
  'edge',
  'batch',
  'streaming',
  'fine_tune_service',
  'training_only',
  'none',
]);
export type InferencePattern = z.infer<typeof inferencePatternSchema>;

/**
 * Archetype tags — cross-cut groupings (`archetypes/*.md`). Enum-gated
 * because the archetype set is small and stable; adding a new archetype
 * requires a schema PR (intentional friction).
 *
 * Multi-archetype is EXPECTED for hybrid companies — `archetype_tags` is an
 * array for exactly this reason. Cloudflare, for example, legitimately carries
 * `['globally-distributed-edge-network', 'ai-native-inference-edge',
 * 'developer-platform-saas']` because it is simultaneously an edge CDN,
 * an AI-inference edge platform, and a developer-facing SaaS. Fastly,
 * Vercel, and Akamai exhibit the same hybrid pattern. Carrying multiple
 * tags is not an anomaly; it is the correct representation.
 */
export const archetypeTagSchema = z.enum([
  'rails-majestic-monolith',
  'go-microservices-at-scale',
  'php-hyperscale',
  'python-data-heavy',
  'scala-jvm-platform',
  'fintech-secure-core',
  'ai-native-inference-edge',
  'ai-training-gpu-fleet',
  'ai-inference-as-a-service',
  'data-warehouse-and-ml-platform',
  // Edge / CDN hybrid platforms (cloudflare, fastly, vercel, akamai).
  'globally-distributed-edge-network',
  // Developer-facing SaaS (cloudflare Workers/Pages/R2/D1, vercel, netlify).
  'developer-platform-saas',
  // Process-per-entity / actor-model concurrency platforms (discord's
  // Elixir/BEAM, also akka, orleans, vert.x).
  'elixir-beam-actor-platform',
]);
export type ArchetypeTag = z.infer<typeof archetypeTagSchema>;

/**
 * Corpus-readiness gate. Emitted by `scripts/atlas/build-indexes.ts` into
 * `indexes/index.json`; M4/M5 agents must check this before consuming priors
 * (security-review F2 minimum-corpus gate).
 *
 * Definition (plan §6.3 + README §4): `corpus_ready = ≥20 entries that
 * Zod-parse clean AND carry ≥1 math prior satisfying §6.3 tier rules`.
 * The letter tiers (A-H) apply to citations, not to the gate itself —
 * don't call this a "T1 gate."
 */
export const MIN_CORPUS_READY_SIZE = 20;

/** @deprecated — old name, aliased for callers mid-migration. */
export const MIN_T1_CORPUS_SIZE = MIN_CORPUS_READY_SIZE;

// ─────────────────────────────────────────────────────────────────────────
// Data-quality grade (entry-level, orthogonal to tier)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Entry-level data-quality grade, curator-assigned. Numeric prefix (Q1/Q2/Q3)
 * is intentionally distinct from citation-tier letters (A-H) so the two
 * axes are never confused in prose.
 *
 *   Q1 — Zod-clean + zero NEEDS_RESEARCH on mandatory + all priors A/B/E/G
 *        + `last_verified` < 18 months
 *   Q2 — Zod-clean + zero NEEDS_RESEARCH on mandatory + §6.3-compliant
 *        priors (dual-C allowed for AI-private quant)
 *   Q3 — Zod-clean but ≥1 NEEDS_RESEARCH on mandatory (usually rejected)
 */
export const dataQualityGradeSchema = z.enum(['Q1', 'Q2', 'Q3']);
export type DataQualityGrade = z.infer<typeof dataQualityGradeSchema>;

/**
 * Summary pointer to the strongest-tier citation for this entry. Same A-H
 * enum as `citationSchema.source_tier`. Emitted as a convenience for the
 * index builder + curator UI — not a replacement for per-citation tiers.
 */
export const primarySourceSchema = z
  .object({
    tier: sourceTierSchema.describe(
      'x-ui-surface=section:Entry > Lineage — strongest tier among this entry\'s citations.',
    ),
    source_url: z
      .string()
      .url()
      .startsWith('https://')
      .describe(
        'x-ui-surface=section:Entry > Lineage — URL of the strongest-tier citation.',
      ),
    anchor: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Entry > Lineage — optional section anchor within the primary source.',
      ),
  })
  .describe(
    'x-ui-surface=section:Entry > Lineage — strongest-tier citation pointer (summary, not enforcement).',
  );
export type PrimarySource = z.infer<typeof primarySourceSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Top-level entry schema
// ─────────────────────────────────────────────────────────────────────────

const companyAtlasEntryBaseObject = z.object({
  // ─── Identity ──────────────────────────────────────────────────────────
  slug: z
    .string()
    .regex(/^[a-z][a-z0-9-]*$/, 'slug must be lowercase-kebab')
    .describe(
      'x-ui-surface=page-header — file-matching slug (matches filename in companies/).',
    ),
  name: z
    .string()
    .min(1)
    .describe('x-ui-surface=page-header — display name (e.g., "Anthropic").'),
  kind: entryKindSchema.describe(
    'x-ui-surface=page-header — entry-kind discriminator.',
  ),
  hq: z
    .string()
    .describe('x-ui-surface=section:Entry > Identity — headquarters city/region.'),
  website: z
    .string()
    .url()
    .startsWith('https://')
    .optional()
    .describe('x-ui-surface=section:Entry > Identity — canonical website URL.'),

  // ─── Verification lineage ──────────────────────────────────────────────
  last_verified: isoDateSchema.describe(
    'x-ui-surface=page-header — ISO date of last human review. Drives 18-month staleness gate.',
  ),
  verification_status: verificationStatusSchema.describe(
    'x-ui-surface=page-header — overall entry verification state.',
  ),
  reviewer: z
    .string()
    .describe(
      'x-ui-surface=section:Entry > Lineage — human/agent that signed off on the entry.',
    ),
  data_quality_grade: dataQualityGradeSchema.describe(
    'x-ui-surface=page-header — curator-assigned entry-level grade (Q1/Q2/Q3). Orthogonal to citation tier.',
  ),
  primary_source: primarySourceSchema.describe(
    'x-ui-surface=section:Entry > Lineage — strongest-tier citation pointer (convenience; not enforcement).',
  ),

  // ─── Scale + economics (cited) ─────────────────────────────────────────
  scale: scaleBandSchema,
  dau_band: dauBandSchema.describe(
    'x-ui-surface=section:Entry > Scale — index bucket (feeds by-dau.json).',
  ),
  revenue_usd_annual: z
    .union([z.number().nonnegative(), z.null()])
    .describe(
      'x-ui-surface=section:Entry > Economics — annual revenue USD; null when undisclosed.',
    ),
  infra_cost_usd_annual: z
    .union([z.number().nonnegative(), z.null()])
    .describe(
      'x-ui-surface=section:Entry > Economics — annual infra cost USD; null when undisclosed.',
    ),
  cost_band: costBandSchema,
  headcount_est: z
    .union([z.number().int().nonnegative(), z.null()])
    .describe(
      'x-ui-surface=section:Entry > Economics — estimated FTE headcount; null when undisclosed.',
    ),
  economics_citations: z
    .array(citationSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Entry > Economics — backing citations for revenue/cost/headcount claims.',
    ),

  // ─── Stack slots ───────────────────────────────────────────────────────
  frontend: frontendStackSchema,
  backend: backendStackSchema,
  data: dataStackSchema,
  infra: infraStackSchema,
  ai_stack: aiStackSchema
    .optional()
    .describe(
      'x-ui-surface=section:Entry > AI Stack — REQUIRED for kind ∈ {ai_infra_public, frontier_ai_private}.',
    ),

  // ─── AI-specific facets ────────────────────────────────────────────────
  gpu_exposure: gpuExposureSchema.default('none').describe(
    'x-ui-surface=section:Entry > AI Stack — GPU ownership pattern (default none).',
  ),
  inference_pattern: inferencePatternSchema.default('none').describe(
    'x-ui-surface=section:Entry > AI Stack — inference deployment pattern (default none).',
  ),

  // ─── Math priors ───────────────────────────────────────────────────────
  latency_priors: z
    .array(latencyPriorSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Math Priors > Latency — scalar latency priors (p50/p95/p99).',
    ),
  availability_priors: z
    .array(availabilityPriorSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Math Priors > Availability — scalar availability priors.',
    ),
  throughput_priors: z
    .array(throughputPriorSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Math Priors > Throughput — scalar throughput priors (rps/rpm/rph/qps; peak/sustained/tail).',
    ),
  cost_curves: z
    .array(costCurveSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Math Priors > Cost — piecewise cost curves.',
    ),
  utility_weight_hints: utilityWeightHintsSchema
    .optional()
    .describe(
      'x-ui-surface=section:Math Priors > Utility Weights — REQUIRED for AI-kind entries.',
    ),

  // ─── Citation refs + archetypes ────────────────────────────────────────
  archetype_tags: z
    .array(archetypeTagSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Entry > Archetypes — cross-cut archetype tags.',
    ),
  related_refs: z
    .array(atlasPriorRefSchema)
    .default([])
    .describe(
      'x-ui-surface=internal:math-resolver — optional cross-entry prior refs (sibling companies, archetypes).',
    ),

  // ─── Security gates ────────────────────────────────────────────────────
  nda_clean: z
    .literal(true)
    .describe(
      'x-ui-surface=internal:ingest-gate — NDA screen MUST pass before commit. Hard-literal true.',
    ),
  ingest_script_version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'semver (x.y.z)')
    .describe(
      'x-ui-surface=internal:ingest-gate — version of scripts/atlas/structure-to-entry.ts that produced the entry.',
    ),
});

/**
 * Company Atlas entry — canonical shape for every file under
 * `companies/*.md` frontmatter.
 *
 * Uses `refine`-then-`innerType()` pattern per CLAUDE.md (Zod `.refine()`
 * + `.extend()` drops the refinement).
 */
export const companyAtlasEntrySchema = companyAtlasEntryBaseObject.superRefine(
  (entry, ctx) => {
    // AI-kind entries MUST provide ai_stack + utility_weight_hints
    if (
      entry.kind === 'frontier_ai_private' ||
      entry.kind === 'ai_infra_public'
    ) {
      if (!entry.ai_stack) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ai_stack'],
          message: `ai_stack is REQUIRED for kind=${entry.kind}`,
        });
      }
      if (!entry.utility_weight_hints) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['utility_weight_hints'],
          message: `utility_weight_hints is REQUIRED for kind=${entry.kind}`,
        });
      }
    }

    // Scale tier relaxation: AI-private may cite B/G; public must cite A/B/C
    if (entry.kind === 'public') {
      const scaleTier = entry.scale.citation.source_tier;
      const corrob = entry.scale.citation.corroborated_by.length;
      const ok =
        scaleTier === 'A_sec_filing' ||
        scaleTier === 'B_official_blog' ||
        (scaleTier === 'C_press_analyst' && corrob >= 1);
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scale', 'citation', 'source_tier'],
          message: `public-kind scale requires A/B or dual-C; got ${scaleTier} with ${corrob} corroborations`,
        });
      }
    }

    // private_consumer: scale tier strict B (company's own page) — narrower
    // than frontier_ai_private's dual-C press rule. Priors still require
    // B/E-IC/G per PRIOR_ACCEPTABLE_TIERS (enforced in priors.ts).
    if (entry.kind === 'private_consumer') {
      const scaleTier = entry.scale.citation.source_tier;
      if (scaleTier !== 'B_official_blog') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scale', 'citation', 'source_tier'],
          message: `private_consumer-kind scale requires B_official_blog (company's own page); got ${scaleTier}`,
        });
      }
      // private_consumer cannot cite A_sec_filing (no filings exist)
      for (const [i, c] of entry.economics_citations.entries()) {
        if (c.source_tier === 'A_sec_filing') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['economics_citations', i, 'source_tier'],
            message:
              'private_consumer cannot cite A_sec_filing (no 10-K exists)',
          });
        }
      }
    }

    // Utility-weight-hints must sum to roughly 1.0 when present (tolerance 0.05)
    if (entry.utility_weight_hints) {
      const h = entry.utility_weight_hints;
      const sum =
        h.latency +
        h.cost +
        h.quality_bench +
        h.availability +
        h.safety +
        h.developer_velocity +
        h.security_compliance;
      if (Math.abs(sum - 1.0) > 0.05) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['utility_weight_hints'],
          message: `utility_weight_hints must sum to ~1.0 (±0.05); got ${sum.toFixed(3)}`,
        });
      }
    }

    // Frontier-AI: every economics citation should be tier B/C/G (no 10-K)
    if (entry.kind === 'frontier_ai_private') {
      for (const [i, c] of entry.economics_citations.entries()) {
        if (c.source_tier === 'A_sec_filing') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['economics_citations', i, 'source_tier'],
            message: 'frontier_ai_private cannot cite A_sec_filing (no 10-K exists)',
          });
        }
      }
    }

    // Prior anchors must be unique within each prior category
    const checkAnchorUnique = (
      arr: Array<{ anchor: string }>,
      field: string,
    ) => {
      const seen = new Set<string>();
      for (const [i, p] of arr.entries()) {
        if (seen.has(p.anchor)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field, i, 'anchor'],
            message: `duplicate anchor '${p.anchor}' within ${field}`,
          });
        }
        seen.add(p.anchor);
      }
    };
    checkAnchorUnique(entry.latency_priors, 'latency_priors');
    checkAnchorUnique(entry.availability_priors, 'availability_priors');
    checkAnchorUnique(entry.throughput_priors, 'throughput_priors');
    checkAnchorUnique(entry.cost_curves, 'cost_curves');
  },
);

export type CompanyAtlasEntry = z.infer<typeof companyAtlasEntrySchema>;

/**
 * Exposed so downstream tests / indexers can use the unrefined base shape
 * (e.g., to partial-parse staged entries before the human-review step).
 */
export { companyAtlasEntryBaseObject };

/**
 * Schema version stamp — bumped on breaking changes. Emitted alongside the
 * entry in `generate-all.ts` output JSON Schema `title`.
 */
export const ATLAS_ENTRY_SCHEMA_VERSION = '1.1.0';
