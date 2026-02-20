/**
 * Centralized Application Constants
 *
 * Purpose: Extract magic numbers and configuration values to named constants
 * for improved maintainability and consistency across the codebase.
 *
 * @module lib/constants
 */

// ============================================================
// Time Constants
// ============================================================

export const TIME_CONSTANTS = {
  /** One day in milliseconds (24 * 60 * 60 * 1000) */
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  /** Session expiry duration in hours */
  SESSION_EXPIRY_HOURS: 24,
  /** Rate limit window in milliseconds (1 minute) */
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
  /** Cleanup interval in milliseconds (5 minutes) */
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000,
} as const;

// ============================================================
// Infrastructure Cost Estimates
// ============================================================

export const INFRASTRUCTURE_COSTS = {
  VERCEL: { min: 20, max: 100 },
  AWS: { min: 50, max: 500 },
  GCP: { min: 50, max: 500 },
  AZURE: { min: 50, max: 500 },
  RAILWAY: { min: 5, max: 50 },
  RENDER: { min: 7, max: 85 },
  HEROKU: { min: 7, max: 250 },
  DIGITAL_OCEAN: { min: 5, max: 200 },
  FLY_IO: { min: 5, max: 100 },
  SUPABASE: { min: 0, max: 25 },
} as const;

// ============================================================
// Scoring Constants (Completeness Calculation)
// ============================================================

export const SCORING = {
  /** Actor contribution to completeness score */
  ACTOR_SCORE: { MULTIPLE: 25, SINGLE: 12 },
  /** Use case contribution to completeness score */
  USE_CASE_SCORE: { FIVE_PLUS: 35, THREE_PLUS: 25, ONE_PLUS: 15 },
  /** Data entity contribution to completeness score */
  DATA_ENTITY_SCORE: { THREE_PLUS: 15, ONE_PLUS: 8 },
  /** PRD-SPEC completion threshold */
  COMPLETION_THRESHOLD: 95,
} as const;

// ============================================================
// Token Estimation Constants
// ============================================================

export const TOKEN_ESTIMATION = {
  /** Average characters per token (for rough estimation) */
  AVG_CHARS_PER_TOKEN: 4,
  /** Maximum context window tokens for Claude models */
  MAX_CONTEXT_TOKENS: 128000,
  /** Buffer tokens reserved for response */
  RESPONSE_BUFFER_TOKENS: 4000,
} as const;

// ============================================================
// LLM Configuration Defaults
// ============================================================

export const LLM_DEFAULTS = {
  /** Timeout in milliseconds for LLM API calls */
  TIMEOUT_MS: 30000,
  /** Maximum tokens for extraction tasks */
  MAX_TOKENS_EXTRACTION: 4000,
  /** Maximum tokens for chat responses */
  MAX_TOKENS_CHAT: 2000,
  /** Maximum tokens for cheap/simple tasks */
  MAX_TOKENS_CHEAP: 1000,
  /** Temperature for structured/deterministic outputs */
  TEMPERATURE_STRUCTURED: 0.2,
  /** Temperature for conversational/creative responses */
  TEMPERATURE_CHAT: 0.7,
} as const;

// ============================================================
// Rate Limiting Defaults
// ============================================================

export const RATE_LIMIT_DEFAULTS = {
  /** MCP API: requests per minute */
  MCP_REQUESTS_PER_MINUTE: 100,
  /** Chat API: requests per minute per user */
  CHAT_REQUESTS_PER_MINUTE: 20,
} as const;

// ============================================================
// Validation Constants
// ============================================================

export const VALIDATION = {
  /** Minimum actors for use case diagram */
  MIN_ACTORS_FOR_USE_CASE_DIAGRAM: 2,
  /** Minimum use cases for use case diagram */
  MIN_USE_CASES_FOR_USE_CASE_DIAGRAM: 3,
  /** Minimum use cases for requirements table */
  MIN_USE_CASES_FOR_REQUIREMENTS: 5,
} as const;

// ============================================================
// Plan / Subscription Tier Limits
// ============================================================

export type TierName = 'free' | 'base' | 'plus';

export const PLAN_LIMITS = {
  free: {
    creditLimit: 2500,
    creditGrace: 2750,   // 10% overage
    teamMemberLimit: 2,  // owner + 1 invite
  },
  base: {
    creditLimit: 5000,
    creditGrace: 5500,   // 10% overage
    teamMemberLimit: 2,
  },
  plus: {
    creditLimit: 999999,
    creditGrace: 999999,
    teamMemberLimit: 999999,
  },
} as const;

/** Maps Stripe product name to tier key */
export function resolvePlanTier(planName: string | null): TierName {
  if (planName === 'Base') return 'base';
  if (planName === 'Plus') return 'plus';
  return 'free';
}

/** Returns true when a member limit value means "unlimited" */
export function isUnlimitedMembers(limit: number): boolean {
  return limit >= 999999;
}
