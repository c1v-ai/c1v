/**
 * Budget-Tier Stack Recommendations (February 2026)
 *
 * Full stack recommendations per budget × stage combination.
 * Version numbers are isolated here for quarterly updates.
 */

import type { BudgetStack } from './types';

export const budgetStacks: BudgetStack[] = [
  {
    tier: 'bootstrap',
    stage: 'idea',
    monthlyCost: '$0',
    stack: {
      framework: 'Next.js 16',
      database: 'Supabase Free (500MB, 50K MAU)',
      hosting: 'Vercel Free',
      auth: 'Supabase Auth (free tier)',
      css: 'Tailwind CSS v4 + shadcn/ui',
      orm: 'Drizzle ORM',
    },
    tradeoffs: [
      'Free tier limits on database and hosting',
      'No custom domain on Vercel free',
      'Limited to 100K function invocations/month',
    ],
  },
  {
    tier: 'bootstrap',
    stage: 'mvp',
    monthlyCost: '$45-100',
    stack: {
      framework: 'Next.js 16',
      database: 'Supabase Pro ($25/mo, 8GB, 100K MAU)',
      hosting: 'Vercel Pro ($20/mo)',
      auth: 'Better Auth (free, self-hosted)',
      css: 'Tailwind CSS v4 + shadcn/ui',
      orm: 'Drizzle ORM',
      payments: 'Stripe',
      monitoring: 'Sentry Free (5K errors/mo)',
    },
    tradeoffs: [
      'No dedicated backend for background jobs',
      'Vercel function timeout limits (60s hobby, 300s pro)',
      'No Redis caching layer',
    ],
  },
  {
    tier: 'bootstrap',
    stage: 'growth',
    monthlyCost: '$20-60',
    stack: {
      framework: 'Next.js 16',
      database: 'Supabase Pro ($25/mo)',
      hosting: 'Coolify on Hetzner CX22 ($5-10/mo)',
      auth: 'Better Auth (free)',
      css: 'Tailwind CSS v4 + shadcn/ui',
      orm: 'Drizzle ORM',
      payments: 'Stripe',
      monitoring: 'BetterStack Free + Sentry Free',
    },
    tradeoffs: [
      'Self-managed server (Coolify handles most ops)',
      'No automatic edge CDN (add Cloudflare free tier)',
      '80-90% savings vs Vercel at this stage',
    ],
  },
  {
    tier: 'seed',
    stage: 'mvp',
    monthlyCost: '$100-300',
    stack: {
      framework: 'Next.js 16',
      database: 'Supabase Pro or Neon Pro',
      hosting: 'Railway ($20/mo) or Vercel Pro',
      auth: 'Clerk ($25/mo, pre-built UI, org management)',
      css: 'Tailwind CSS v4 + shadcn/ui',
      orm: 'Drizzle ORM',
      payments: 'Stripe',
      monitoring: 'Sentry Team ($26/mo)',
      email: 'Resend ($20/mo)',
    },
    tradeoffs: [
      'Team onboarding costs increase with Clerk',
      'Multiple service bills to manage',
      'Consider whether Clerk org management justifies cost vs Better Auth',
    ],
  },
  {
    tier: 'seed',
    stage: 'growth',
    monthlyCost: '$300-800',
    stack: {
      framework: 'Next.js 16',
      database: 'Supabase Pro + Upstash Redis',
      hosting: 'Railway ($20/mo base) + Vercel (frontend)',
      auth: 'Clerk Growth',
      css: 'Tailwind CSS v4 + shadcn/ui',
      orm: 'Drizzle ORM',
      payments: 'Stripe',
      monitoring: 'Sentry Team + BetterStack ($25/mo)',
      analytics: 'PostHog Cloud (free up to 1M events)',
      backgroundJobs: 'Inngest or Trigger.dev',
    },
    tradeoffs: [
      'Monitoring costs scale with traffic',
      'Redis adds operational complexity',
      'Consider Coolify migration when costs exceed $500/mo',
    ],
  },
  {
    tier: 'series-a',
    stage: 'growth',
    monthlyCost: '$1,000-5,000',
    stack: {
      framework: 'Next.js 16',
      database: 'AWS RDS PostgreSQL or Supabase Team',
      hosting: 'AWS ECS or Railway Team',
      auth: 'Clerk Enterprise or custom (Better Auth + custom RBAC)',
      css: 'Tailwind CSS v4 + shadcn/ui + custom design system',
      orm: 'Drizzle ORM',
      payments: 'Stripe',
      monitoring: 'Datadog or Sentry Business + BetterStack',
      analytics: 'PostHog Cloud or self-hosted',
      cache: 'AWS ElastiCache (Redis)',
      cdn: 'Cloudflare Pro',
      ci: 'GitHub Actions (included)',
    },
    tradeoffs: [
      'Significant ops complexity — need part-time DevOps',
      'AWS bill management becomes a skill',
      'Worth the investment for reliability and compliance needs',
    ],
  },
  {
    tier: 'enterprise',
    stage: 'mature',
    monthlyCost: '$5,000-50,000+',
    stack: {
      framework: 'Next.js 16 or custom React',
      database: 'AWS Aurora PostgreSQL (multi-AZ)',
      hosting: 'Kubernetes (EKS/GKE)',
      auth: 'Custom SSO/SAML + RBAC',
      monitoring: 'Datadog APM + PagerDuty',
      analytics: 'PostHog self-hosted or Amplitude',
      cache: 'ElastiCache Redis Cluster',
      cdn: 'Cloudflare Enterprise or CloudFront',
      ci: 'GitHub Actions + custom pipelines',
      security: 'Snyk + SonarQube + WAF',
      compliance: 'SOC2 + HIPAA/PCI as needed',
    },
    tradeoffs: [
      'Requires dedicated DevOps/Platform team',
      'Kubernetes complexity is real — only if needed',
      'Compliance costs (SOC2 audit: $30-100K/year)',
    ],
  },
];

/**
 * Get the recommended stack for a budget × stage combination.
 * Falls back to nearest match if exact combination not found.
 */
export function getBudgetStack(
  budget: string | undefined,
  stage: string | undefined,
): BudgetStack | undefined {
  if (!budget) return undefined;

  // Try exact match first
  const exact = budgetStacks.find(s => s.tier === budget && s.stage === stage);
  if (exact) return exact;

  // Fall back to any match for the budget tier
  return budgetStacks.find(s => s.tier === budget);
}
