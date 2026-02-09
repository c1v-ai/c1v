/**
 * Market-Specific Architectural Patterns
 *
 * B2B vs B2C vs B2B2C differences in auth, billing,
 * architecture, and key entities.
 */

import type { MarketPattern } from './types';

export const marketPatterns: Record<string, MarketPattern> = {
  b2b: {
    market: 'b2b',
    authPatterns: [
      'RBAC (Role-Based Access Control) with organization-scoped permissions',
      'SSO/SAML integration (Okta, Azure AD, Google Workspace)',
      'Organization management with invite-based onboarding',
      'API key authentication for programmatic access',
      'Audit logging on all admin actions',
      'Session management with configurable timeout per org',
    ],
    billingPatterns: [
      'Subscription billing (Stripe) with per-seat or usage-based pricing',
      'Organization-level billing with multiple payment methods',
      'Invoice generation and NET-30/60 payment terms',
      'Usage metering for API calls, storage, or compute',
      'Plan tiers with feature gating (free, pro, enterprise)',
      'Annual vs monthly pricing with discount incentive',
    ],
    architecturePatterns: [
      'Multi-tenancy: organization_id on every table with RLS',
      'Workspace isolation: data never leaks between organizations',
      'Admin panel for org management (users, roles, billing)',
      'Webhook system for integration with customer tools',
      'API-first architecture: every feature accessible via API',
      'Data export/portability (GDPR compliance)',
    ],
    keyEntities: [
      'Organization', 'User', 'Membership', 'Role', 'Permission',
      'Invitation', 'ApiKey', 'AuditLog', 'Subscription', 'Invoice',
    ],
  },

  b2c: {
    market: 'b2c',
    authPatterns: [
      'Social auth (Google, Apple, GitHub) — minimize friction',
      'Magic link / passwordless email login',
      'Push notification opt-in during onboarding',
      'Progressive profiling (collect info gradually, not upfront)',
      'Account deletion (GDPR right-to-erasure)',
    ],
    billingPatterns: [
      'One-time purchases or simple subscriptions',
      'In-app purchases for mobile (Apple/Google IAP)',
      'Freemium model with conversion funnel tracking',
      'Simple checkout flow (minimize cart abandonment)',
      'Coupon/promo code system for acquisition',
    ],
    architecturePatterns: [
      'CDN-first: aggressive edge caching for static content',
      'Mobile-responsive or mobile-first design',
      'A/B testing framework (PostHog feature flags)',
      'Push notification infrastructure (FCM, APNs)',
      'Personalization engine (recommendations, recently viewed)',
      'SEO optimization (SSR/SSG, meta tags, sitemap)',
    ],
    keyEntities: [
      'User', 'Profile', 'Preferences', 'Notification',
      'Device', 'Session', 'PushToken', 'ActivityLog',
    ],
  },

  b2b2c: {
    market: 'b2b2c',
    authPatterns: [
      'All B2B auth patterns (SSO, RBAC, org management)',
      'Plus B2C auth for end consumers (social login, passwordless)',
      'Partner/reseller portal with separate permissions',
      'White-label authentication (partner branding on login)',
      'Delegated admin: partners manage their own users',
    ],
    billingPatterns: [
      'Per-partner billing with custom pricing',
      'Revenue sharing / commission model',
      'White-label billing (partner\'s brand on invoices)',
      'Usage aggregation across partner\'s end users',
      'Partner self-service billing dashboard',
    ],
    architecturePatterns: [
      'White-label theming per partner (colors, logos, domains)',
      'Partner API for programmatic integration',
      'Tenant isolation at partner level AND end-user level',
      'Custom domain support per partner (CNAME + SSL)',
      'Data segregation: partner can only see their end users',
      'Partner onboarding workflow with approval process',
    ],
    keyEntities: [
      'Partner', 'Organization', 'EndUser', 'PartnerConfig',
      'WhiteLabelTheme', 'CommissionRate', 'PartnerApiKey',
      'DelegatedAdmin', 'RevenueShare',
    ],
  },
};

/** Marketplace-specific patterns (subset of B2B2C but distinct enough) */
export const marketplacePatterns = {
  authPatterns: [
    'Separate buyer and seller registration flows',
    'Seller identity verification (KYC) during onboarding',
    'Buyer social auth for minimal friction',
    'Seller dashboard with separate permission set',
  ],
  billingPatterns: [
    'Stripe Connect for multi-party payments',
    'Escrow: hold buyer payment until delivery confirmed',
    'Platform commission per transaction',
    'Seller payouts on configurable schedule',
    'Dispute resolution and refund workflows',
  ],
  architecturePatterns: [
    'Two-sided user model: Buyer and Seller as distinct entities',
    'Search/discovery with faceted filtering (Meilisearch/Algolia)',
    'Trust and safety: fraud detection, content moderation',
    'Review and rating system (bidirectional)',
    'Seller onboarding with verification pipeline',
    'Inventory management across multiple sellers',
  ],
  keyEntities: [
    'Buyer', 'Seller', 'Product', 'Order', 'Escrow',
    'Review', 'Dispute', 'Payout', 'Commission', 'SellerVerification',
  ],
};

/**
 * Get market-specific patterns.
 */
export function getMarketPattern(
  market: string | undefined,
): MarketPattern | undefined {
  if (!market) return undefined;
  return marketPatterns[market];
}
