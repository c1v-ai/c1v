/**
 * Module 0 — `user_profile.v1` (signup-time identity + signal envelope).
 *
 * Emitted by the signup flow. Two paths:
 *   - `type: 'individual'` — consumer-email domain (gmail/icloud/proton/etc.);
 *     no background scrape; `company_signals` absent.
 *   - `type: 'company'`   — workplace email; background scrape fills
 *     `company_signals` via Clearbit/LinkedIn/public fetch and caches
 *     to the `user_signals` Drizzle table.
 *
 * Consumed by `discriminator-intake-agent.ts` to auto-infer Tier-2
 * discriminators D1 (team_size), D5 (business_model), D6 (industry),
 * D8 (budget via funding stage), D9 (geo).
 *
 * Spec: `plans/c1v-MIT-Crawley-Cornell.md` §5.0.1.
 *
 * @module lib/langchain/schemas/module-0/user-profile
 */

import { z } from 'zod';

/**
 * Consumer-email allow-list. A signup email whose domain matches any
 * entry here is classified `type: 'individual'` and skipped by
 * `signup-signals-agent.ts`.
 *
 * Kept in the schema (rather than the agent) so every consumer of
 * `userProfileSchema` sees the same source-of-truth classification rule
 * at type-check time. Extend cautiously: adding a domain here permanently
 * opts users out of enrichment.
 */
export const CONSUMER_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'ymail.com',
  'aol.com',
  'fastmail.com',
  'tutanota.com',
  'zoho.com',
  'gmx.com',
  'mail.com',
  'duck.com',
] as const;

export type ConsumerEmailDomain = (typeof CONSUMER_EMAIL_DOMAINS)[number];

/**
 * Company enrichment envelope. All fields optional — enrichment is
 * best-effort, non-blocking, and may produce partial results.
 * Consumed downstream by Tier-2 inference (see `intake-discriminators.ts`).
 */
export const companySignalsSchema = z
  .object({
    domain: z
      .string()
      .min(1)
      .max(253)
      .optional()
      .describe(
        'x-ui-surface=internal | Email domain extracted from signup address. Used as the cache key in `user_signals` and as the primary input to Clearbit/LinkedIn enrichment.',
      ),
    company_name: z
      .string()
      .min(1)
      .max(255)
      .optional()
      .describe(
        'x-ui-surface=internal | Canonical company name from enrichment provider.',
      ),
    industry: z
      .string()
      .min(1)
      .max(120)
      .optional()
      .describe(
        'x-ui-surface=internal | Industry label — feeds D6 Tier-2 inference. Expected taxonomy overlaps Module-0 D6 enum but may contain provider-specific free-text.',
      ),
    employee_count_band: z
      .string()
      .min(1)
      .max(40)
      .optional()
      .describe(
        'x-ui-surface=internal | Headcount band (e.g. "1-10", "11-50"). Feeds D1 team_size Tier-2 inference.',
      ),
    funding_stage: z
      .string()
      .min(1)
      .max(40)
      .optional()
      .describe(
        'x-ui-surface=internal | Funding stage (Bootstrap/Seed/SeriesA/…). Feeds D8 budget Tier-2 inference.',
      ),
    website_tech_stack: z
      .array(z.string().min(1).max(80))
      .max(50)
      .optional()
      .describe(
        'x-ui-surface=internal | Detected frontend/backend tech fingerprint (Wappalyzer-style). Used by scope_tree prior weighting.',
      ),
    compliance_badges: z
      .array(z.string().min(1).max(40))
      .max(20)
      .optional()
      .describe(
        'x-ui-surface=internal | Public compliance signals (SOC2/HIPAA/PCI/GDPR/FedRAMP). Feeds D10 SLA tier + D12 data-sensitivity defaults.',
      ),
    scraped_at: z
      .string()
      .datetime({ offset: true })
      .optional()
      .describe(
        'x-ui-surface=internal | ISO-8601 timestamp the enrichment row was produced. Used with the 30-day TTL on `user_signals` to decide rescrape.',
      ),
    scrape_confidence: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe(
        'x-ui-surface=internal | Aggregate enrichment confidence in [0,1]. Downstream Tier-2 inference multiplies its own confidence by this.',
      ),
  })
  .strict();

export type CompanySignals = z.infer<typeof companySignalsSchema>;

/**
 * Top-level signup identity envelope. `type` discriminates whether
 * `company_signals` is meaningful (present + populated) or absent.
 */
export const userProfileSchema = z
  .object({
    _schema: z
      .literal('user_profile.v1')
      .describe('x-ui-surface=internal | Stable schema identifier.'),
    user_id: z
      .string()
      .min(1)
      .max(64)
      .describe(
        'x-ui-surface=internal | Primary key; matches `users.id` in the app DB. Used as RLS scope for `user_signals`.',
      ),
    type: z
      .enum(['individual', 'company'])
      .describe(
        'x-ui-surface=internal | `individual` iff email domain ∈ CONSUMER_EMAIL_DOMAINS; else `company`.',
      ),
    email: z
      .string()
      .email()
      .max(320)
      .describe('x-ui-surface=internal | Signup email (lowercased).'),
    name: z
      .string()
      .min(1)
      .max(255)
      .optional()
      .describe('x-ui-surface=internal | Display name from signup form.'),
    signup_geo: z
      .string()
      .min(2)
      .max(8)
      .optional()
      .describe(
        'x-ui-surface=internal | ISO-3166-1 alpha-2 (or alpha-3) region code from IP geolocation at signup. Feeds D9 geo inference.',
      ),
    company_signals: companySignalsSchema
      .optional()
      .describe(
        'x-ui-surface=internal | Present only when `type=company` AND the background scrape has landed. Absence is not an error.',
      ),
    created_at: z
      .string()
      .datetime({ offset: true })
      .describe('x-ui-surface=internal | ISO-8601 signup timestamp.'),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.type === 'individual' && value.company_signals) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['company_signals'],
        message:
          '`company_signals` must be absent when `type=individual` (consumer-email users are never scraped).',
      });
    }
  });

export type UserProfile = z.infer<typeof userProfileSchema>;
