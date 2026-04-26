/**
 * Free-tier synthesis allowance gate (D-V21.10 + EC-V21-B.3).
 *
 * Real DB-backed implementation shipped by TB1 (handoff Issue 12+16). Reads
 * the team's plan from `teams.plan_name`, resolves it to a tier, and:
 *
 *   - `plus` (active subscription): unlimited synthesis runs.
 *   - `base` (active subscription): unlimited synthesis runs (parity with
 *     `plus` for synthesis specifically; per D-V21.10 only Free is hard-capped).
 *   - `free` (or any inactive subscription): hard-capped at
 *     `FREE_SYNTHESIS_PER_MONTH` keystone runs per calendar month.
 *
 * Counting rule: a "synthesis run" is one row in `project_artifacts` with
 * `artifact_kind LIKE 'recommendation_%'` AND `created_at >= start-of-month`
 * where the parent `projects.team_id = $teamId`. We count any
 * recommendation_* row regardless of `synthesis_status` (a started run is
 * a started run; failed runs already burned tokens).
 *
 * Env var: SYNTHESIS_FREE_TIER_GATE = 'log_only' | 'enabled' | 'disabled'
 *   - `enabled`  (TB1 default) — gate active; Free hard-capped.
 *   - `log_only` — always allow; emit a warn line when the gate WOULD have
 *     blocked. Useful for observing fire-rate before flipping to enforcement.
 *   - `disabled` — feature flag off; never deny.
 *
 * @module lib/billing/synthesis-tier
 */

import { and, eq, gte, like, sql } from 'drizzle-orm';

import { db } from '@/lib/db/drizzle';
import { teams, projects } from '@/lib/db/schema';
import { projectArtifacts } from '@/lib/db/schema/project-artifacts';
import { resolvePlanTier, type TierName } from '@/lib/constants';

export type SynthesisAllowanceReason = 'free_tier_exhausted' | 'no_credits';

export interface SynthesisAllowance {
  allowed: boolean;
  reason?: SynthesisAllowanceReason;
  remaining_this_month?: number;
  plan_name?: string;
}

type GateMode = 'log_only' | 'enabled' | 'disabled';

export const FREE_SYNTHESIS_PER_MONTH = 1;

function getGateMode(): GateMode {
  const raw = process.env.SYNTHESIS_FREE_TIER_GATE?.toLowerCase();
  if (raw === 'log_only' || raw === 'disabled') return raw;
  return 'enabled';
}

function startOfCurrentMonthUtc(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

interface TierResolution {
  tier: TierName;
  planName: string;
  hasActiveSubscription: boolean;
}

async function resolveTeamTier(teamId: number): Promise<TierResolution | null> {
  const row = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: { planName: true, subscriptionStatus: true },
  });
  if (!row) return null;
  const tier = resolvePlanTier(row.planName);
  const hasActiveSubscription =
    row.subscriptionStatus === 'active' || row.subscriptionStatus === 'trialing';
  return {
    tier,
    planName: row.planName ?? 'Free',
    hasActiveSubscription,
  };
}

async function countRecommendationRunsThisMonth(teamId: number): Promise<number> {
  const monthStart = startOfCurrentMonthUtc();
  const rows = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(projectArtifacts)
    .innerJoin(projects, eq(projectArtifacts.projectId, projects.id))
    .where(
      and(
        eq(projects.teamId, teamId),
        like(projectArtifacts.artifactKind, 'recommendation_%'),
        gte(projectArtifacts.createdAt, monthStart),
      ),
    );
  return rows[0]?.value ?? 0;
}

/**
 * Check whether a team is allowed to start a new synthesis run.
 *
 * Tier semantics:
 *   - Plus/Base with active subscription: unlimited.
 *   - Free (or any inactive sub): hard-capped at `FREE_SYNTHESIS_PER_MONTH`
 *     per calendar month, counted via `recommendation_%` artifacts.
 */
export async function checkSynthesisAllowance(
  teamId: number,
): Promise<SynthesisAllowance> {
  const mode = getGateMode();

  if (mode === 'disabled') {
    return { allowed: true };
  }

  const resolution = await resolveTeamTier(teamId);
  if (!resolution) {
    // Unknown team — fail closed under `enabled`, allow under `log_only`.
    if (mode === 'log_only') {
      console.warn(
        `[synthesis-tier] log_only: unknown team=${teamId}; would-be 402.`,
      );
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'free_tier_exhausted',
      remaining_this_month: 0,
      plan_name: 'unknown',
    };
  }

  const { tier, planName, hasActiveSubscription } = resolution;

  // Paid + active sub → unlimited.
  if ((tier === 'plus' || tier === 'base') && hasActiveSubscription) {
    return { allowed: true, plan_name: planName };
  }

  // Free path (or paid w/ inactive sub treated as Free for this gate).
  const used = await countRecommendationRunsThisMonth(teamId);
  const remaining = Math.max(0, FREE_SYNTHESIS_PER_MONTH - used);

  if (used < FREE_SYNTHESIS_PER_MONTH) {
    return {
      allowed: true,
      remaining_this_month: remaining,
      plan_name: planName,
    };
  }

  if (mode === 'log_only') {
    console.warn(
      `[synthesis-tier] log_only: team=${teamId} (${planName}) would-be 402 — used=${used}/${FREE_SYNTHESIS_PER_MONTH}`,
    );
    return {
      allowed: true,
      remaining_this_month: 0,
      plan_name: planName,
    };
  }

  return {
    allowed: false,
    reason: 'free_tier_exhausted',
    remaining_this_month: 0,
    plan_name: planName,
  };
}
