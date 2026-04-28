/**
 * Module 0 — Signup Signals Agent (company-domain enrichment).
 *
 * Background job invoked post-signup for workplace-email users. Enriches
 * company domain → industry / employee band / funding stage / website
 * tech stack / compliance badges via Clearbit + LinkedIn + public-web
 * fetch, then caches the result into the `user_signals` Drizzle table.
 *
 * Design contract (guardrails from T7 spec):
 *   1. Non-blocking — any failure must NOT block the signup flow.
 *      Callers invoke this fire-and-forget; the webhook route short-circuits
 *      200 OK to Clerk regardless of scrape outcome.
 *   2. Consumer-email allow-list — domains in `CONSUMER_EMAIL_DOMAINS`
 *      bypass enrichment (status=skipped, no HTTP calls).
 *   3. Rate-limit — 1 req / 5s per domain, in-process token-bucket.
 *      Shared with the outer process so the whole signup fleet respects
 *      the provider's ToS even under burst.
 *   4. Deterministic: pure function of (email, domain-fetch results) —
 *      fetch layer is injectable for tests.
 *
 * Spec: `plans/c1v-MIT-Crawley-Cornell.md` §5.0.1 + v1 §5.0.4 (code-map row
 * "lib/langchain/agents/signup-signals-agent.ts").
 *
 * @module lib/langchain/agents/system-design/signup-signals-agent
 */

import {
  companySignalsSchema,
  CONSUMER_EMAIL_DOMAINS,
  type CompanySignals,
} from '../../schemas/module-0/user-profile';

// ─────────────────────────────────────────────────────────────────────
// Result envelope
// ─────────────────────────────────────────────────────────────────────

export type SignalsScrapeStatus =
  | 'success'
  | 'failed'
  | 'skipped' // consumer-email domain; no attempt made
  | 'rate-limited' // bucket deferred the call
  | 'pending';

export interface SignalsScrapeResult {
  status: SignalsScrapeStatus;
  user_id: number;
  domain?: string;
  signals?: CompanySignals;
  error?: string;
  /** Non-blocking attribute: scrape_confidence in [0,1] when status=success. */
  confidence?: number;
  scraped_at: string;
}

// ─────────────────────────────────────────────────────────────────────
// Domain utilities
// ─────────────────────────────────────────────────────────────────────

const CONSUMER_DOMAIN_SET = new Set<string>(CONSUMER_EMAIL_DOMAINS);

export function isConsumerEmail(email: string): boolean {
  const domain = extractDomain(email);
  if (!domain) return false;
  return CONSUMER_DOMAIN_SET.has(domain);
}

export function extractDomain(email: string): string | undefined {
  const at = email.lastIndexOf('@');
  if (at < 0 || at === email.length - 1) return undefined;
  return email.slice(at + 1).toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────
// Rate limiter — 1 req / 5s per domain
// ─────────────────────────────────────────────────────────────────────

export const DEFAULT_DOMAIN_RATE_LIMIT_MS = 5_000;

/**
 * Pluggable rate-limit store. Production uses a process-wide Map;
 * callers targeting a multi-process deploy should swap in a Redis impl.
 */
export interface DomainRateLimiter {
  /** Returns true iff the domain is currently allowed; marks it scraped. */
  tryAcquire(domain: string, now: number): boolean;
}

class InMemoryDomainRateLimiter implements DomainRateLimiter {
  private readonly lastAcquired = new Map<string, number>();
  constructor(private readonly minIntervalMs: number) {}
  tryAcquire(domain: string, now: number): boolean {
    const prev = this.lastAcquired.get(domain);
    if (prev !== undefined && now - prev < this.minIntervalMs) return false;
    this.lastAcquired.set(domain, now);
    return true;
  }
}

export const globalDomainRateLimiter: DomainRateLimiter =
  new InMemoryDomainRateLimiter(DEFAULT_DOMAIN_RATE_LIMIT_MS);

// ─────────────────────────────────────────────────────────────────────
// Provider adapters (pluggable + testable)
// ─────────────────────────────────────────────────────────────────────

export interface ProviderContext {
  domain: string;
  now: number;
  /** Default `fetch` unless the caller injects a test double. */
  fetchImpl?: typeof fetch;
  clearbitApiKey?: string;
}

export interface ClearbitLookupResult {
  company_name?: string;
  industry?: string;
  employee_count_band?: string;
  funding_stage?: string;
}

export interface LinkedInLookupResult {
  employee_count_band?: string;
  industry?: string;
}

export interface TechStackProbeResult {
  website_tech_stack?: string[];
  compliance_badges?: string[];
}

export interface EnrichmentProviders {
  clearbit(ctx: ProviderContext): Promise<ClearbitLookupResult>;
  linkedin(ctx: ProviderContext): Promise<LinkedInLookupResult>;
  techstack(ctx: ProviderContext): Promise<TechStackProbeResult>;
}

/**
 * Production providers. Each returns `{}` on failure (never throws); the
 * orchestrator treats missing fields as "no signal", not as errors.
 */
export const defaultProviders: EnrichmentProviders = {
  async clearbit(ctx) {
    if (!ctx.clearbitApiKey) return {};
    try {
      const res = await (ctx.fetchImpl ?? fetch)(
        `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(ctx.domain)}`,
        {
          headers: { Authorization: `Bearer ${ctx.clearbitApiKey}` },
          signal: AbortSignal.timeout(5_000),
        },
      );
      if (!res.ok) return {};
      const data = (await res.json()) as {
        name?: string;
        category?: { industry?: string };
        metrics?: { employeesRange?: string };
        fundingStage?: string;
      };
      return {
        company_name: data.name,
        industry: data.category?.industry,
        employee_count_band: data.metrics?.employeesRange,
        funding_stage: data.fundingStage,
      };
    } catch {
      return {};
    }
  },

  async linkedin(_ctx) {
    // LinkedIn scraping requires a proper integration; left as a stub so
    // the contract is honoured. Real provider will land in a follow-up.
    return {};
  },

  async techstack(ctx) {
    // Light public fetch: pull the homepage + sniff obvious markers.
    // Bounded 3s timeout — never block the signup pipeline.
    try {
      const res = await (ctx.fetchImpl ?? fetch)(`https://${ctx.domain}/`, {
        signal: AbortSignal.timeout(3_000),
        redirect: 'follow',
      });
      if (!res.ok) return {};
      const body = (await res.text()).slice(0, 100_000).toLowerCase();
      const stack: string[] = [];
      if (body.includes('next.js') || body.includes('_next/')) stack.push('next.js');
      if (body.includes('react')) stack.push('react');
      if (body.includes('vue')) stack.push('vue');
      if (body.includes('stripe')) stack.push('stripe');
      if (body.includes('shopify')) stack.push('shopify');

      const badges: string[] = [];
      if (body.includes('hipaa')) badges.push('HIPAA');
      if (body.includes('soc 2') || body.includes('soc2')) badges.push('SOC2');
      if (body.includes('pci')) badges.push('PCI');
      if (body.includes('gdpr')) badges.push('GDPR');
      if (body.includes('fedramp')) badges.push('FedRAMP');

      return {
        website_tech_stack: stack.length > 0 ? stack : undefined,
        compliance_badges: badges.length > 0 ? badges : undefined,
      };
    } catch {
      return {};
    }
  },
};

// ─────────────────────────────────────────────────────────────────────
// Orchestrator
// ─────────────────────────────────────────────────────────────────────

export interface ScrapeSignupSignalsInput {
  user_id: number;
  email: string;
  providers?: EnrichmentProviders;
  rateLimiter?: DomainRateLimiter;
  clearbitApiKey?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
}

/**
 * Main entry point. Returns a `SignalsScrapeResult` reflecting the
 * outcome. Never throws — callers rely on `status` to branch.
 */
export async function scrapeSignupSignals(
  input: ScrapeSignupSignalsInput,
): Promise<SignalsScrapeResult> {
  const nowFn = input.now ?? (() => new Date());
  const scraped_at = nowFn().toISOString();

  const domain = extractDomain(input.email);
  if (!domain) {
    return {
      status: 'failed',
      user_id: input.user_id,
      error: 'Could not extract domain from email.',
      scraped_at,
    };
  }

  if (CONSUMER_DOMAIN_SET.has(domain)) {
    return {
      status: 'skipped',
      user_id: input.user_id,
      domain,
      scraped_at,
    };
  }

  const limiter = input.rateLimiter ?? globalDomainRateLimiter;
  const acquired = limiter.tryAcquire(domain, Date.now());
  if (!acquired) {
    return {
      status: 'rate-limited',
      user_id: input.user_id,
      domain,
      error: `Rate-limited: 1 req/${DEFAULT_DOMAIN_RATE_LIMIT_MS}ms per domain.`,
      scraped_at,
    };
  }

  const providers = input.providers ?? defaultProviders;
  const ctx: ProviderContext = {
    domain,
    now: Date.now(),
    fetchImpl: input.fetchImpl,
    clearbitApiKey: input.clearbitApiKey ?? process.env.CLEARBIT_API_KEY,
  };

  try {
    const [clearbit, linkedin, techstack] = await Promise.all([
      providers.clearbit(ctx),
      providers.linkedin(ctx),
      providers.techstack(ctx),
    ]);

    const raw: CompanySignals = {
      domain,
      company_name: clearbit.company_name,
      industry: clearbit.industry ?? linkedin.industry,
      employee_count_band: clearbit.employee_count_band ?? linkedin.employee_count_band,
      funding_stage: clearbit.funding_stage,
      website_tech_stack: techstack.website_tech_stack,
      compliance_badges: techstack.compliance_badges,
      scraped_at,
      scrape_confidence: computeConfidence(clearbit, linkedin, techstack),
    };

    // Strip undefined so Zod strict() accepts the envelope.
    const compact = stripUndefined(raw);
    const validated = companySignalsSchema.parse(compact);

    const hasAnySignal =
      Object.keys(validated).filter(
        (k) => k !== 'domain' && k !== 'scraped_at' && k !== 'scrape_confidence',
      ).length > 0;

    return {
      status: hasAnySignal ? 'success' : 'failed',
      user_id: input.user_id,
      domain,
      signals: validated,
      confidence: validated.scrape_confidence,
      scraped_at,
      ...(hasAnySignal ? {} : { error: 'All providers returned empty.' }),
    };
  } catch (err) {
    return {
      status: 'failed',
      user_id: input.user_id,
      domain,
      error: err instanceof Error ? err.message : String(err),
      scraped_at,
    };
  }
}

function computeConfidence(
  c: ClearbitLookupResult,
  l: LinkedInLookupResult,
  t: TechStackProbeResult,
): number {
  // Naive weighted sum in [0,1]. Real tuning comes from telemetry.
  let score = 0;
  if (c.company_name) score += 0.25;
  if (c.industry || l.industry) score += 0.2;
  if (c.employee_count_band || l.employee_count_band) score += 0.2;
  if (c.funding_stage) score += 0.15;
  if (t.website_tech_stack && t.website_tech_stack.length > 0) score += 0.1;
  if (t.compliance_badges && t.compliance_badges.length > 0) score += 0.1;
  return Math.min(1, Math.max(0, Number(score.toFixed(3))));
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}
