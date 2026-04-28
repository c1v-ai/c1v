import { desc, and, eq, isNull, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users } from './schema';
import {
  projectArtifacts,
  type ProjectArtifactRow,
  type SynthesisStatus,
} from './schema/project-artifacts';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { resolvePlanTier, PLAN_LIMITS } from '@/lib/constants';

// Re-export the row types so the TA3 artifacts-bridge collapses to a static
// re-export once this module is the source of truth.
export type { ProjectArtifactRow, SynthesisStatus } from './schema/project-artifacts';

// Wave C — Crawley artifact query helpers (REQUIREMENTS-crawley §6).
// Re-exported here so callers have a single canonical entry point.
export {
  getCrawleyM5FormTaxonomy,
  upsertCrawleyM5FormTaxonomy,
  getCrawleyM5FunctionTaxonomy,
  upsertCrawleyM5FunctionTaxonomy,
  getCrawleyM5FormFunctionConcept,
  upsertCrawleyM5FormFunctionConcept,
  getCrawleyM5SolutionNeutralConcept,
  upsertCrawleyM5SolutionNeutralConcept,
  getCrawleyM5ConceptExpansion,
  upsertCrawleyM5ConceptExpansion,
  getCrawleyM3DecompositionPlane,
  upsertCrawleyM3DecompositionPlane,
  getCrawleyM4DecisionNetwork,
  upsertCrawleyM4DecisionNetwork,
  getCrawleyM4Tradespace,
  upsertCrawleyM4Tradespace,
  getCrawleyM4Optimization,
  upsertCrawleyM4Optimization,
  getCrawleyM2RequirementsExtension,
  upsertCrawleyM2RequirementsExtension,
} from './crawley-queries';
export type {
  CrawleyUpsertPayload,
  CrawleyM3UpsertPayload,
} from './crawley-queries';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
    creditsUsed?: number;
    creditLimit?: number;
    teamMemberLimit?: number;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

export async function checkAndDeductCredits(
  teamId: number,
  amount: number
): Promise<{ allowed: boolean; creditsUsed: number; creditLimit: number }> {
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: { creditsUsed: true, creditLimit: true, subscriptionStatus: true, planName: true },
  });

  if (!team) return { allowed: false, creditsUsed: 0, creditLimit: 0 };

  const tier = resolvePlanTier(team.planName);

  // Plus tier with active sub: unlimited — always allow, track for analytics
  if (tier === 'plus' && (team.subscriptionStatus === 'active' || team.subscriptionStatus === 'trialing')) {
    await db.update(teams).set({
      creditsUsed: sql`${teams.creditsUsed} + ${amount}`,
      updatedAt: new Date(),
    }).where(eq(teams.id, teamId));
    return { allowed: true, creditsUsed: team.creditsUsed + amount, creditLimit: team.creditLimit };
  }

  // Free & Base: atomic check-and-deduct with 10% grace
  const grace = PLAN_LIMITS[tier].creditGrace;
  const result = await db.update(teams).set({
    creditsUsed: sql`${teams.creditsUsed} + ${amount}`,
    updatedAt: new Date(),
  }).where(
    and(
      eq(teams.id, teamId),
      sql`${teams.creditsUsed} + ${amount} <= ${grace}`
    )
  ).returning({
    creditsUsed: teams.creditsUsed,
    creditLimit: teams.creditLimit,
  });

  if (result.length === 0) {
    return { allowed: false, creditsUsed: team.creditsUsed, creditLimit: team.creditLimit };
  }

  return { allowed: true, creditsUsed: result[0].creditsUsed, creditLimit: result[0].creditLimit };
}

export async function getTeamCredits(teamId: number) {
  return db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: { creditsUsed: true, creditLimit: true, subscriptionStatus: true },
  });
}

// ─────────────────────────────────────────────────────────────────────
// project_artifacts queries (TA1 v2.1 Wave A — D-V21.04)
//
// All queries respect existing RLS context (`app.current_role` and
// `app.current_team_id`). Service role (sidecar writers) bypasses tenant
// gates via the `project_artifacts_service_all` policy; tenant callers
// see only rows whose parent project.team_id matches `app.current_team_id`.
// ─────────────────────────────────────────────────────────────────────

/**
 * All artifacts (any kind, any status) for a project, newest first.
 * Used by the synthesis viewer + manifest endpoint.
 */
export async function getProjectArtifacts(
  projectId: number,
): Promise<ProjectArtifactRow[]> {
  return db
    .select()
    .from(projectArtifacts)
    .where(eq(projectArtifacts.projectId, projectId))
    .orderBy(desc(projectArtifacts.createdAt));
}

/**
 * Latest `recommendation_json` row (the synthesis keystone). Returns
 * null if synthesis has never run for this project. The synthesis page
 * uses this to branch between empty-state and populated-state.
 */
export async function getLatestSynthesis(
  projectId: number,
): Promise<ProjectArtifactRow | null> {
  const rows = await db
    .select()
    .from(projectArtifacts)
    .where(
      and(
        eq(projectArtifacts.projectId, projectId),
        eq(projectArtifacts.artifactKind, 'recommendation_json'),
      ),
    )
    .orderBy(desc(projectArtifacts.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Latest row of a given artifact_kind for a project. Returns null when
 * no row of that kind exists (e.g. PDF still pending generation).
 */
export async function getArtifactByKind(
  projectId: number,
  kind: string,
): Promise<ProjectArtifactRow | null> {
  const rows = await db
    .select()
    .from(projectArtifacts)
    .where(
      and(
        eq(projectArtifacts.projectId, projectId),
        eq(projectArtifacts.artifactKind, kind),
      ),
    )
    .orderBy(desc(projectArtifacts.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Object-shaped upsert called by the TA3 sidecar (matches the
 * `UpsertArtifactStatusInput` contract in `lib/synthesis/artifacts-bridge.ts`).
 *
 * Semantics:
 *   - If a row already exists for `(projectId, kind)` AND that row is the
 *     newest of its kind, the row is updated in place (single-row UPDATE).
 *     This is the common case during a synthesis run — kickoff inserts a
 *     `pending` row and subsequent emit/failure events mutate it to
 *     `ready`/`failed`.
 *   - If no row exists, a new row is inserted (the kickoff path).
 *
 * `inputsHash` may be a placeholder until langgraph-wirer ships the real
 * content-addressed hash; the column accepts any hex string per the
 * migration's CHECK constraint.
 */
export async function upsertArtifactStatus(input: {
  projectId: number;
  kind: string;
  status: SynthesisStatus;
  storagePath?: string | null;
  format?: string | null;
  sha256?: string | null;
  inputsHash?: string | null;
  synthesizedAt?: Date | null;
  failureReason?: string | null;
}): Promise<ProjectArtifactRow> {
  const existing = await getArtifactByKind(input.projectId, input.kind);

  if (existing) {
    const updates: Partial<typeof projectArtifacts.$inferInsert> = {
      synthesisStatus: input.status,
    };
    if (input.storagePath !== undefined) updates.storagePath = input.storagePath;
    if (input.format !== undefined) updates.format = input.format;
    if (input.sha256 !== undefined) updates.sha256 = input.sha256;
    if (input.inputsHash !== undefined) updates.inputsHash = input.inputsHash;
    if (input.synthesizedAt !== undefined) updates.synthesizedAt = input.synthesizedAt;
    if (input.failureReason !== undefined) updates.failureReason = input.failureReason;

    const [row] = await db
      .update(projectArtifacts)
      .set(updates)
      .where(eq(projectArtifacts.id, existing.id))
      .returning();
    return row;
  }

  const [row] = await db
    .insert(projectArtifacts)
    .values({
      projectId: input.projectId,
      artifactKind: input.kind,
      synthesisStatus: input.status,
      storagePath: input.storagePath ?? null,
      format: input.format ?? null,
      sha256: input.sha256 ?? null,
      inputsHash: input.inputsHash ?? null,
      synthesizedAt: input.synthesizedAt ?? null,
      failureReason: input.failureReason ?? null,
    })
    .returning();
  return row;
}
