/**
 * Tech Influencer Recommendations (February 2026)
 *
 * Maps technology choices to who recommends them, why,
 * and counter-arguments for when NOT to use them.
 */

import type { TechInfluencer } from './types';

export const influencers: TechInfluencer[] = [
  {
    name: 'Lee Robinson',
    platform: 'Ex-Vercel VP, now Cursor',
    recommendations: [
      'Next.js 16 for any production React app — RSC + React Compiler eliminates the performance ceiling',
      'Server Components by default, client only for interactivity',
    ],
  },
  {
    name: 'Theo Browne',
    platform: 'T3 Stack, 500K+ YouTube',
    recommendations: [
      'Next.js + tRPC + Tailwind + Drizzle is the winning SaaS combo — type safety from DB to UI',
      'Drizzle over Prisma for new projects — SQL-like API, better serverless support',
    ],
  },
  {
    name: 'Kent C. Dodds',
    platform: 'Epic Web Dev',
    recommendations: [
      'React Router v7 (Remix) for web-standards-first — server functions, not server components',
      'Testing Library for behavior-driven tests — test what users see, not implementation',
    ],
  },
  {
    name: 'Rich Harris',
    platform: 'Svelte creator, Vercel',
    recommendations: [
      'SvelteKit 5 with Runes is the Rails/Laravel of JavaScript — convention over configuration',
      'Compiled frameworks eliminate runtime overhead entirely',
    ],
  },
  {
    name: 'Tanner Linsley',
    platform: 'TanStack creator',
    recommendations: [
      'TanStack Start gives 30-35% smaller bundles than Next.js with Vite tooling',
      'TanStack Query for server state management — eliminates most global state needs',
    ],
  },
  {
    name: 'Gergely Orosz',
    platform: 'Pragmatic Engineer, #1 tech Substack',
    recommendations: [
      'Don\'t over-engineer — most startups need one DB, one framework, one hosting provider',
      'Self-hosting renaissance: Coolify on Hetzner gives Vercel-like DX at 10-20% cost',
      'Add complexity only when metrics demand it',
    ],
  },
  {
    name: 'Hussein Nasser',
    platform: 'Backend educator, 1M+ YouTube',
    recommendations: [
      'PostgreSQL for everything — search, vectors, time-series, queues, caching',
      'Stop adding databases — pgvector, pg_cron, pg_net, pg_graphql cover most needs',
    ],
  },
  {
    name: 'Jeff Delaney',
    platform: 'Fireship, 3M+ YouTube',
    recommendations: [
      'Ship fast — Supabase + Next.js + Vercel is the fastest path from idea to paying customers',
      'Simplicity wins — pick boring technology that works',
    ],
  },
];

/** Counter-arguments for popular technology choices */
export const counterArguments: Record<string, string[]> = {
  'Next.js': [
    'NOT when you need web-standards-first (use React Router v7/Remix)',
    'NOT when bundle size is critical (use TanStack Start or SvelteKit)',
    'NOT when team is small and Vercel costs concern you (use Astro or self-hosted Vite)',
    'NOT when you need a simple static site (use Astro)',
  ],
  'PostgreSQL': [
    'NOT when you need pure time-series at massive scale (use TimescaleDB)',
    'NOT when graph queries are the primary access pattern (use Neo4j)',
    'NOT when you need global edge reads with minimal latency (use Turso/D1)',
  ],
  'Supabase': [
    'NOT when you need full infrastructure control (self-host with Coolify)',
    'NOT when mobile-first with offline sync is required (use Firebase)',
    'NOT when self-hosted is a hard requirement (use Appwrite)',
  ],
  'Stripe': [
    'NOT when you\'re in a regulated market requiring local payment rails',
    'NOT when marketplace fees make Stripe Connect too expensive at scale',
    'NOT when you need crypto/web3 payments',
  ],
  'Vercel': [
    'NOT when your bill exceeds $200/mo (consider Coolify on Hetzner for 80-90% savings)',
    'NOT when you need long-running processes (use Railway or dedicated server)',
    'NOT when you need data sovereignty in specific regions',
  ],
};

/**
 * Get influencer recommendations relevant to a specific technology.
 */
export function getInfluencerQuotes(technology: string): string[] {
  const quotes: string[] = [];
  for (const inf of influencers) {
    for (const rec of inf.recommendations) {
      if (rec.toLowerCase().includes(technology.toLowerCase())) {
        quotes.push(`${inf.name} (${inf.platform}): "${rec}"`);
      }
    }
  }
  return quotes;
}
