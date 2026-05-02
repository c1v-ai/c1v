/**
 * KB-8 Atlas — Prior shapes (cost curves, latency priors, availability priors,
 * utility-weight hints).
 *
 * These primitives are the "prior store" half of KB-8. Each prior carries a
 * citation (kb_source + url + source_tier + publish_date + SHA256 of fetched
 * bytes) so downstream M4/M5 math derivations can cite the exact evidence
 * page that produced the number.
 *
 * Shape layer:
 *   - `result_shape` is a 5-variant discriminated union (scalar | vector |
 *     matrix | graph | piecewise). Every prior declares which shape it
 *     carries so `mathDerivationSchema.v2` (owned by T3 c1v-runtime-prereqs)
 *     can consume it directly.
 *   - This module intentionally does NOT extend `mathDerivationSchema` — T3
 *     will merge a v2 upgrade; in the meantime the Atlas priors are
 *     self-contained and addressable via `atlas_prior_ref`.
 *
 * Security (per security-review.md F1-F4):
 *   - `source_tier` Zod-refined — priors may cite only tiers A / B / E / G
 *     per plan §6.3. Dual-C is permitted for non-prior quant claims but
 *     NEVER rescues a tier-C citation for a math prior.
 *   - `citation.sha256` required — tamper detection.
 *   - `citation.source_url` validated HTTPS + allowlisted host (allowlist
 *     enforced by the scraper, not Zod — Zod validates shape only).
 *   - `citation.publish_date` required — staleness gate (>18 months = warn).
 *
 * @module lib/langchain/schemas/atlas/priors
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────
// Source-tier taxonomy (SOURCES.md)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Source-tier enum. Priors (cost/latency/availability) may cite only A, B,
 * E, or G per Atlas plan §6.3; other tiers are accepted on descriptive
 * frontmatter fields (DAU, revenue) but rejected on math priors. Dual-C
 * is permitted for non-prior quant claims only.
 */
export const sourceTierSchema = z.enum([
  'A_sec_filing',
  'B_official_blog',
  'C_press_analyst',
  'D_stackshare',
  'E_conference',
  'F_github',
  'G_model_card',
  'H_social_flagged',
]);
export type SourceTier = z.infer<typeof sourceTierSchema>;

/**
 * Tiers acceptable as citation for a numeric prior. Per plan §6.3: priors
 * must cite B/E/G — C/D are rejected even with corroboration. A (10-K) is
 * included here because 10-Ks are strictly stronger grounding than B when
 * they happen to disclose the figure. H is always flagged-only.
 *
 * Dual-C corroboration is separately permitted for *non-prior* quant claims
 * (e.g., `revenue_usd_annual` on AI-private) — that lives in a different
 * refinement, NOT in `citationIsPriorAcceptable`.
 */
export const PRIOR_ACCEPTABLE_TIERS: readonly SourceTier[] = [
  'A_sec_filing',
  'B_official_blog',
  'E_conference',
  'G_model_card',
] as const;

// ─────────────────────────────────────────────────────────────────────────
// Citation — provenance attached to every prior
// ─────────────────────────────────────────────────────────────────────────

/**
 * SHA-256 hex string — 64 lowercase hex chars. Computed over the fetched
 * response body at ingest time. Detects tampering and enables re-ingest
 * dedupe (security-review F4 + F2).
 */
export const sha256HexSchema = z
  .string()
  .regex(/^[a-f0-9]{64}$/i, 'must be a 64-char lowercase hex SHA-256 digest')
  .describe(
    'x-ui-surface=internal:provenance-hash — SHA-256 (hex) of the fetched source body. Re-compute on refetch; mismatch flags the entry for review.',
  );

/**
 * ISO-8601 date string (YYYY-MM-DD or full timestamp). Used for publish_date
 * and last_verified. Enables the 18-month staleness gate.
 */
export const isoDateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/,
    'must be ISO-8601 date (YYYY-MM-DD) or timestamp',
  );

export const citationSchema = z
  .object({
    kb_source: z
      .string()
      .describe(
        'x-ui-surface=section:Entry > Sources — slug of the Atlas entry that owns this citation (e.g., "anthropic", "shopify").',
      ),
    source_url: z
      .string()
      .url()
      .startsWith('https://', 'citation URLs must be HTTPS')
      .describe(
        'x-ui-surface=section:Entry > Sources — canonical source URL. HTTPS only; must resolve under the ingest domain allowlist (enforced at fetch time).',
      ),
    source_tier: sourceTierSchema.describe(
      'x-ui-surface=section:Entry > Sources — tier per SOURCES.md taxonomy.',
    ),
    publish_date: isoDateSchema.describe(
      'x-ui-surface=section:Entry > Sources — publication date of the cited source (not fetch date). Drives staleness gate.',
    ),
    retrieved_at: isoDateSchema.describe(
      'x-ui-surface=internal:provenance-hash — ISO-8601 timestamp of the fetch that produced sha256.',
    ),
    sha256: sha256HexSchema,
    /**
     * Integrity tag for the bytes hashed by `sha256`. When ≠ `clean`, the
     * per-URL bytes are NOT the article content (e.g., a Cloudflare Turnstile
     * wall served to non-browser clients; a paywall stub; a geoblock page).
     * In those cases the article text was retrieved via WebFetch and
     * consumers MUST verify via `content_sha256` rather than `sha256`.
     * Defaults to `clean`.
     */
    bytes_integrity: z
      .enum([
        'clean',
        'captcha_wall_content_via_webfetch',
        'paywall_content_via_webfetch',
        'cdn_geoblock_content_via_webfetch',
        'webfetch_only_no_raw_html',
      ])
      .default('clean')
      .describe(
        'x-ui-surface=internal:provenance-hash — tag describing what `sha256` actually hashes. `clean` = sha matches article bytes. `captcha_wall` / `paywall` / `cdn_geoblock` = sha covers a wall, content retrieved via WebFetch. `webfetch_only_no_raw_html` = SPA shell / JS-rendered page where raw HTML carries no article body (e.g., stripe.com/blog SPA); content extracted via WebFetch only. When ≠ `clean`, `content_sha256` is REQUIRED.',
      ),
    /**
     * SHA-256 of the extracted Markdown body (article text), stable across
     * captcha-wall variants. REQUIRED when `bytes_integrity` ≠ `clean`.
     * Optional otherwise; when present it provides a content-level integrity
     * check independent of the transport-level `sha256`.
     */
    content_sha256: sha256HexSchema
      .optional()
      .describe(
        'x-ui-surface=internal:provenance-hash — SHA-256 of extracted MD body. Stable across captcha/paywall variants. REQUIRED when `bytes_integrity` ≠ `clean`; when `bytes_integrity` = `clean`, optional.',
      ),
    is_ic: z
      .boolean()
      .optional()
      .describe(
        'x-ui-surface=section:Entry > Sources — TRUE iff the speaker/author is an individual contributor (not exec, VP, marketing, or vendor partner). REQUIRED true for E_conference to qualify as a prior source per plan §6.3 ("E is B-equivalent only when speaker is IC"). Default undefined; refinement treats undefined as false for tier E.',
      ),
    anchor: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Entry > Sources — optional heading/section anchor within the source (e.g., "§6.1 Availability").',
      ),
    corroborated_by: z
      .array(
        z.object({
          source_url: z
            .string()
            .url()
            .startsWith('https://'),
          source_tier: sourceTierSchema,
        }),
      )
      .default([])
      .describe(
        'x-ui-surface=section:Entry > Sources — secondary citations. For NON-PRIOR quant claims only (e.g., revenue on AI-private where dual-C is permitted per plan §6.3). Does NOT rescue tier C/D for math priors — priors still require B/E/G per `citationIsPriorAcceptable`.',
      ),
  })
  .superRefine((c, ctx) => {
    if (c.bytes_integrity !== 'clean' && !c.content_sha256) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content_sha256'],
        message: `content_sha256 is REQUIRED when bytes_integrity='${c.bytes_integrity}' (sha256 hashes the wall, not the article)`,
      });
    }
  })
  .describe(
    'x-ui-surface=section:Entry > Sources — provenance record. Every numeric prior carries one.',
  );
export type Citation = z.infer<typeof citationSchema>;

/**
 * Zod refinement: priors must cite a tier in PRIOR_ACCEPTABLE_TIERS (A/B/E/G).
 * Per plan §6.3: tiers C and D are rejected for priors *even with
 * corroboration*. Corroboration is separately permitted for non-prior quant
 * claims (e.g., `revenue_usd_annual` on AI-private) — that's a different
 * refinement, not this one.
 *
 * Tier-E additional gate: plan §6.3 says E is B-equivalent "only when
 * speaker is IC." So E_conference without `citation.is_ic === true` is
 * rejected for priors. Undefined is treated as false (conservative).
 *
 * A is included (strictly stronger grounding than B when 10-K discloses).
 * H is always flagged-only and excluded.
 */
export function citationIsPriorAcceptable(citation: Citation): boolean {
  if (!PRIOR_ACCEPTABLE_TIERS.includes(citation.source_tier)) return false;
  if (citation.source_tier === 'E_conference' && citation.is_ic !== true) {
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────
// Result-shape discriminated union (5 variants per Atlas plan §4.2)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Scalar — single numeric/string value. The back-compat shape for v1
 * `mathDerivationSchema.result`. Used by Little's Law, availability,
 * p95 chain.
 */
export const scalarShapeSchema = z
  .object({
    kind: z.literal('scalar'),
    value: z.union([z.number(), z.string()]),
    units: z.string().optional(),
  })
  .describe(
    "x-ui-surface=section:Math > Result — scalar value (Little's Law, availability, p95 chain).",
  );

/**
 * Vector — labeled per-alternative values. Used by M4 decision utility
 * U(a) = Σ wᵢ·scoreᵢ. `components` lets each alternative break its score
 * into per-criterion parts for Pareto + sensitivity analysis.
 */
export const vectorShapeSchema = z
  .object({
    kind: z.literal('vector'),
    dim_label: z
      .string()
      .describe(
        "x-ui-surface=section:Math > Result — dimension name (e.g., 'alternative_id').",
      ),
    values: z.array(
      z.object({
        label: z.string(),
        value: z.number(),
        components: z.record(z.string(), z.number()).optional(),
      }),
    ),
    units: z.string().optional(),
  })
  .describe(
    'x-ui-surface=section:Math > Result — per-alternative utility vector.',
  );

/**
 * Graph — Pareto-dominance graph across architecture alternatives. Nodes
 * are alternatives with per-axis coordinates; edges carry a dominance
 * relation. Consumed by M4 Pareto phase.
 */
export const graphShapeSchema = z
  .object({
    kind: z.literal('graph'),
    nodes: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        coords: z.record(z.string(), z.number()),
        is_frontier: z.boolean(),
      }),
    ),
    edges: z.array(
      z.object({
        from: z.string(),
        to: z.string(),
        relation: z.enum(['dominates', 'incomparable', 'dominated_by']),
      }),
    ),
    axes: z.array(z.string()),
  })
  .describe(
    'x-ui-surface=section:Math > Result — Pareto dominance graph across alternatives.',
  );

/**
 * Matrix — row-major 2-D matrix for M5 QFD Q(f,g) = s·(1-k). Rows are
 * functions, columns are forms. `cells` is a 2-D array of numeric scores
 * in [0,1] (convention documented in `cell_semantics`).
 */
export const matrixShapeSchema = z
  .object({
    kind: z.literal('matrix'),
    row_labels: z.array(z.string()),
    col_labels: z.array(z.string()),
    cells: z.array(z.array(z.number())),
    cell_semantics: z.string(),
  })
  .describe('x-ui-surface=section:Math > Result — concept-quality matrix Q(f,g).');

/**
 * Piecewise — piecewise-linear (or step) function. Cost curves are the
 * archetypal example: free tier flat, then linear, then volume discount.
 * Consumed by every cost-scoring decision node.
 */
export const piecewiseShapeSchema = z
  .object({
    kind: z.literal('piecewise'),
    x_label: z.string(),
    y_label: z.string(),
    breakpoints: z
      .array(
        z.object({
          x: z.number(),
          y: z.number(),
          regime_label: z.string().optional(),
        }),
      )
      .min(2, 'piecewise requires at least 2 breakpoints'),
    slope_left: z.number().optional(),
    slope_right: z.number().optional(),
  })
  .describe(
    'x-ui-surface=section:Math > Result — piecewise function (cost curves, tiered pricing).',
  );

export const resultShapeSchema = z.discriminatedUnion('kind', [
  scalarShapeSchema,
  vectorShapeSchema,
  graphShapeSchema,
  matrixShapeSchema,
  piecewiseShapeSchema,
]);
export type ResultShape = z.infer<typeof resultShapeSchema>;
export type ResultShapeKind = ResultShape['kind'];

/**
 * Result-shape kind as a plain enum — useful at envelope level when the
 * full payload isn't yet available (e.g., for indexes).
 */
export const resultShapeKindSchema = z.enum([
  'scalar',
  'vector',
  'graph',
  'matrix',
  'piecewise',
]);

// ─────────────────────────────────────────────────────────────────────────
// Prior envelopes — cost_curves, latency_priors, availability_priors
// ─────────────────────────────────────────────────────────────────────────

/**
 * Base shape common to every prior. Carries the citation + confidence +
 * result-shape kind + semantic anchor so a `math-resolver` can fetch the
 * entry, pluck the right prior by anchor, and hand it to the decision agent.
 */
export const priorBaseSchema = z.object({
  anchor: z
    .string()
    .regex(/^[a-z][a-z0-9_]*$/, 'anchor must be snake_case')
    .describe(
      'x-ui-surface=internal:math-resolver — snake_case identifier unique within the entry (e.g., "api_usd_per_1m_tokens_sonnet_input").',
    ),
  description: z
    .string()
    .describe(
      'x-ui-surface=section:Math Priors — one-line human description of what this prior represents.',
    ),
  citation: citationSchema,
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'x-ui-surface=section:Math Priors — [0,1] — reviewer-assigned confidence in this prior.',
    ),
  verification_status: z
    .enum(['verified', 'partial', 'inferred'])
    .describe(
      'x-ui-surface=section:Math Priors — verification state (AI-private entries commonly "partial").',
    ),
});

/**
 * Refine helper — priors must cite A/B/E/G per plan §6.3. C/D are rejected
 * even with corroboration (dual-C is a non-prior affordance). Applied via
 * `superRefine` on every prior envelope so the error carries the anchor
 * in its path.
 */
function refinePriorTier<T extends { citation: Citation; anchor: string }>(
  ctx: z.RefinementCtx,
  value: T,
): void {
  if (!citationIsPriorAcceptable(value.citation)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['citation', 'source_tier'],
      message:
        value.citation.source_tier === 'E_conference'
          ? `prior '${value.anchor}': E_conference citation requires is_ic=true per plan §6.3 (E is B-equivalent only when speaker is IC)`
          : `prior '${value.anchor}': tier ${value.citation.source_tier} rejected; priors require A/B/E/G (see SOURCES.md)`,
    });
  }
}

/**
 * Latency prior — scalar-kind, value carries a latency in ms (or ns/μs).
 * Example: `chat_completion_stream_first_token_p95_ms = 800`.
 */
export const latencyPriorSchema = priorBaseSchema
  .extend({
    result_kind: z.literal('scalar'),
    value: z
      .number()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Math Priors > Latency — latency value (non-negative).',
      ),
    units: z
      .enum(['ns', 'us', 'ms', 's'])
      .describe('x-ui-surface=section:Math Priors > Latency — time unit.'),
    percentile: z
      .enum(['p50', 'p90', 'p95', 'p99', 'mean'])
      .describe('x-ui-surface=section:Math Priors > Latency — latency percentile.'),
  })
  .superRefine((v, ctx) => refinePriorTier(ctx, v))
  .describe(
    'x-ui-surface=section:Math Priors > Latency — scalar latency budget (p50/p95/p99).',
  );
export type LatencyPrior = z.infer<typeof latencyPriorSchema>;

/**
 * Availability prior — scalar-kind, value is a fraction of uptime in [0,1].
 * Used for serial/parallel availability composition (A = ∏Aᵢ).
 */
export const availabilityPriorSchema = priorBaseSchema
  .extend({
    result_kind: z.literal('scalar'),
    value: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'x-ui-surface=section:Math Priors > Availability — fraction of uptime in [0,1] (e.g., 0.999 = three nines).',
      ),
    units: z.literal('fraction_uptime'),
    window: z
      .enum(['monthly', 'quarterly', 'annual'])
      .describe('x-ui-surface=section:Math Priors > Availability — measurement window.'),
  })
  .superRefine((v, ctx) => refinePriorTier(ctx, v))
  .describe(
    'x-ui-surface=section:Math Priors > Availability — scalar uptime prior.',
  );
export type AvailabilityPrior = z.infer<typeof availabilityPriorSchema>;

/**
 * Throughput prior — scalar-kind, value is a request-rate number. Sibling
 * to `latencyPriorSchema`; covers observations like "BFCM peak 284M req/min"
 * that are categorically throughput, not latency. Units + measurement enum
 * are deliberately distinct from latency's time-units to prevent confusion.
 *
 * Measurement semantics:
 *   - `peak_burst`      — observed maximum over a short window (seconds).
 *   - `sustained`       — steady-state average over a longer window (minutes+).
 *   - `p95_window` / `p99_window` — tail throughput over a rolling window
 *     (useful for capacity planning in bursty workloads).
 *
 * Optional context:
 *   - `window` — human-readable window label (e.g., "1s", "5m", "BFCM 2025").
 *   - `concurrency` — typical concurrent clients/connections producing this rate.
 *   - `replicas` — backend fleet size at the time of measurement.
 */
export const throughputPriorSchema = priorBaseSchema
  .extend({
    result_kind: z.literal('scalar'),
    value: z
      .number()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Math Priors > Throughput — rate value (non-negative).',
      ),
    units: z
      .enum([
        // Request/query rate
        'rps',
        'rpm',
        'rph',
        'qps',
        // Data-rate (bytes/time) — storage ingest, egress, CDN throughput.
        // Pick the unit that keeps values in a human-reasonable range
        // (e.g., LinkedIn 20 TB/day → tb_per_day, not gb_per_second).
        'bytes_per_second',
        'kb_per_second',
        'mb_per_second',
        'gb_per_second',
        'tb_per_second',
        'gb_per_hour',
        'gb_per_day',
        'tb_per_day',
        'pb_per_day',
        // Message/event rate (Kafka, PubSub, WebSocket fanout)
        'messages_per_second',
        'events_per_second',
      ])
      .describe(
        'x-ui-surface=section:Math Priors > Throughput — rate unit. Request-rate (rps/rpm/rph/qps), data-rate (bytes_per_second .. pb_per_day), or message/event-rate (messages_per_second, events_per_second). Choose the unit that keeps `value` in a human-reasonable range.',
      ),
    measurement: z
      .enum(['peak_burst', 'sustained', 'p95_window', 'p99_window'])
      .describe(
        'x-ui-surface=section:Math Priors > Throughput — what this rate represents (peak burst, sustained average, or tail window).',
      ),
    window: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Math Priors > Throughput — optional window label (e.g., "1s", "5m", "BFCM 2025").',
      ),
    concurrency: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe(
        'x-ui-surface=section:Math Priors > Throughput — typical concurrent clients/connections producing this rate.',
      ),
    replicas: z
      .number()
      .int()
      .positive()
      .optional()
      .describe(
        'x-ui-surface=section:Math Priors > Throughput — backend fleet size at the time of measurement.',
      ),
  })
  .superRefine((v, ctx) => refinePriorTier(ctx, v))
  .describe(
    'x-ui-surface=section:Math Priors > Throughput — scalar throughput observation (peak/sustained/tail).',
  );
export type ThroughputPrior = z.infer<typeof throughputPriorSchema>;

/**
 * Cost curve — piecewise-kind. `breakpoints` are (x, y) pairs; `y` is the
 * monetary cost at workload `x`. Drop-in for result_shape.piecewise.
 */
export const costCurveSchema = priorBaseSchema
  .extend({
    result_kind: z.literal('piecewise'),
    x_label: z
      .string()
      .describe(
        'x-ui-surface=section:Math Priors > Cost — x-axis label (e.g., "requests_per_month").',
      ),
    y_label: z
      .string()
      .describe(
        'x-ui-surface=section:Math Priors > Cost — y-axis label (e.g., "usd_per_month").',
      ),
    units: z.string().describe(
      'x-ui-surface=section:Math Priors > Cost — unit string (e.g., "usd_per_1m_tokens").',
    ),
    breakpoints: z
      .array(
        z.object({
          x: z.number().nonnegative(),
          y: z.number().nonnegative(),
          regime_label: z
            .string()
            .optional()
            .describe(
              'x-ui-surface=section:Math Priors > Cost — regime label (e.g., "free_tier", "linear", "volume_discount").',
            ),
        }),
      )
      .min(2, 'cost curve requires ≥2 breakpoints'),
    slope_left: z.number().optional(),
    slope_right: z.number().optional(),
  })
  .superRefine((v, ctx) => refinePriorTier(ctx, v))
  .describe(
    'x-ui-surface=section:Math Priors > Cost — piecewise cost curve.',
  );
export type CostCurve = z.infer<typeof costCurveSchema>;

/**
 * Utility-weight hints — what criteria a company appears to optimize.
 * Reported as a normalized bag of weights summing to ~1.0. Used by M4
 * decision utility to seed wᵢ for AI-native companies (M4 learns the
 * category prior from the mean of all AI-native entries' hints).
 */
export const utilityWeightHintsSchema = z
  .object({
    latency: z.number().min(0).max(1).default(0),
    cost: z.number().min(0).max(1).default(0),
    quality_bench: z.number().min(0).max(1).default(0),
    availability: z.number().min(0).max(1).default(0),
    safety: z.number().min(0).max(1).default(0),
    developer_velocity: z.number().min(0).max(1).default(0),
    security_compliance: z.number().min(0).max(1).default(0),
  })
  .describe(
    'x-ui-surface=section:Math Priors > Utility Weights — criterion-weight hints for M4 decision utility.',
  );
export type UtilityWeightHints = z.infer<typeof utilityWeightHintsSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Prior reference — the pointer stored on math-derivation results
// ─────────────────────────────────────────────────────────────────────────

/**
 * A typed pointer into KB-8. Every `mathDerivationSchema.v2` (once T3 ships
 * it) may carry one `atlas_prior_ref` — the resolver reads the entry_slug,
 * plucks the prior_path (e.g., `cost_curves.api_usd_per_1m_tokens_sonnet_input`),
 * and returns the corresponding result_shape.
 */
export const atlasPriorRefSchema = z
  .object({
    entry_slug: z
      .string()
      .regex(/^[a-z][a-z0-9-]*$/, 'entry_slug must be lowercase-kebab')
      .describe(
        'x-ui-surface=internal:math-resolver — Atlas entry slug (e.g., "anthropic").',
      ),
    prior_path: z
      .string()
      .regex(
        /^(cost_curves|latency_priors|availability_priors|throughput_priors|utility_weight_hints)(\.[a-z0-9_]+)?$/,
        'prior_path must start with a prior category and optionally name an anchor',
      )
      .describe(
        'x-ui-surface=internal:math-resolver — dotted path into the entry frontmatter (e.g., "cost_curves.api_usd_per_1m_tokens_sonnet_input").',
      ),
    expected_kind: resultShapeKindSchema
      .optional()
      .describe(
        'x-ui-surface=internal:math-resolver — expected result_shape.kind; resolver fails closed if mismatch.',
      ),
  })
  .describe(
    'x-ui-surface=internal:math-resolver — typed pointer from a mathDerivation into KB-8 priors.',
  );
export type AtlasPriorRef = z.infer<typeof atlasPriorRefSchema>;
