/**
 * POST /api/projects/[id]/synthesize
 *
 * Kicks off a per-tenant synthesis run. Per D-V21.24 (locked 2026-04-25):
 *   - This route triggers the Vercel-side LangGraph (TA1's intake-graph)
 *     asynchronously via Next.js `after()`. It does NOT POST to Cloud Run
 *     directly — each GENERATE_* node fires its own `POST /run-render` to
 *     the sidecar with `{project_id, artifact_kind, agent_output_payload}`.
 *   - This route deducts 1000 credits up-front (D-V21.10) and pre-creates
 *     `synthesis_status='pending'` rows in project_artifacts for the 7
 *     known artifact kinds (idempotent on duplicate POST).
 *   - Free-tier hard-cap (D-V21.10 + EC-V21-B.3) goes through
 *     checkSynthesisAllowance — Wave-A pre-stub; TB1 ships the real
 *     DB-backed implementation and flips the env-var default to 'enabled'.
 *
 * Returns 202 with { synthesis_id, expected_artifacts, status_url }.
 *
 * Idempotency: if any 'pending' row exists for this project that was
 * created within the last IDEMPOTENCY_WINDOW_MS, we return the existing
 * synthesis_id rather than re-firing the graph. This protects against
 * double-clicks + at-most-once-per-window Vercel retries.
 *
 * Status polling: clients GET /api/projects/[id]/synthesize/status to
 * watch per-artifact synthesis_status transition pending → ready/failed.
 *
 * Credit semantics: the 1000 credits deduct up-front. Failed-synthesis
 * refund logic is OUT OF SCOPE for v2.1 (TB1 owns retry); failed runs
 * still consumed user intent (tokens were spent in the graph).
 */

import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { randomUUID, createHash } from 'crypto';

import { withProjectAuth } from '@/lib/api/with-project-auth';
import { checkAndDeductCredits } from '@/lib/db/queries';
import { checkSynthesisAllowance } from '@/lib/billing/synthesis-tier';
import {
  EXPECTED_ARTIFACT_KINDS,
  getProjectArtifacts,
  upsertArtifactStatus,
} from '@/lib/synthesis/artifacts-bridge';
import { kickoffSynthesisGraph } from '@/lib/synthesis/kickoff';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const SYNTHESIS_CREDIT_COST = 1000; // D-V21.10
const IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000; // 5 min

function buildStatusUrl(projectId: number): string {
  return `/api/projects/${projectId}/synthesize/status`;
}

function computeInputsHash(projectId: number, teamId: number): string {
  // TA1's langgraph-wirer will replace this with a content-addressed hash
  // over the actual intake state per EC-V21-A.12. Wave-A placeholder hashes
  // (project_id, team_id, day-bucket) so re-runs within the same day cache.
  const day = new Date().toISOString().slice(0, 10);
  return createHash('sha256')
    .update(`${projectId}::${teamId}::${day}`)
    .digest('hex')
    .slice(0, 32);
}

export const POST = withProjectAuth(async (_req, { user, team, projectId }) => {
  // 1. Free-tier allowance gate (Wave-A pre-stub; TB1 replaces).
  const allowance = await checkSynthesisAllowance(team.id);
  if (!allowance.allowed) {
    return NextResponse.json(
      {
        error: 'synthesis_not_allowed',
        reason: allowance.reason,
        upgrade_url: '/pricing',
        plan_name: allowance.plan_name,
        remaining_this_month: allowance.remaining_this_month,
      },
      { status: 402 }
    );
  }

  // 2. Idempotency check — if a recent run exists, return its synthesis_id.
  const existingRows = await getProjectArtifacts(projectId);
  const recentPending = existingRows.find(
    (r) =>
      r.synthesisStatus === 'pending' &&
      Date.now() - new Date(r.createdAt).getTime() < IDEMPOTENCY_WINDOW_MS
  );
  if (recentPending && recentPending.inputsHash) {
    return NextResponse.json(
      {
        synthesis_id: recentPending.inputsHash,
        expected_artifacts: EXPECTED_ARTIFACT_KINDS,
        status_url: buildStatusUrl(projectId),
        idempotent_replay: true,
      },
      { status: 202 }
    );
  }

  // 3. Atomic credit deduction (existing CLAUDE.md credit-system pattern).
  const creditResult = await checkAndDeductCredits(team.id, SYNTHESIS_CREDIT_COST);
  if (!creditResult.allowed) {
    return NextResponse.json(
      {
        error: 'insufficient_credits',
        reason: 'no_credits',
        upgrade_url: '/pricing',
        credits_used: creditResult.creditsUsed,
        credit_limit: creditResult.creditLimit,
      },
      { status: 402 }
    );
  }

  // 4. Pre-create 'pending' rows for the 7 known artifact kinds.
  const synthesisId = randomUUID();
  const inputsHash = computeInputsHash(projectId, team.id);
  for (const kind of EXPECTED_ARTIFACT_KINDS) {
    await upsertArtifactStatus({
      projectId,
      kind,
      status: 'pending',
      inputsHash,
    });
  }

  // 5. Load project metadata for kickoff signature (TA1↔TA3 integration —
  // kickoffSynthesisGraph requires {projectId, projectName, projectVision,
  // teamId}; userId/synthesisId/inputsHash are not part of the contract).
  const [proj] = await db
    .select({ name: projects.name, vision: projects.vision })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!proj) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 });
  }

  // 6. Fire the Vercel-side LangGraph asynchronously (D-V21.24). We do NOT
  // post to Cloud Run from here; the graph's GENERATE_* nodes do that.
  void user.id;
  void synthesisId;
  void inputsHash;
  after(async () => {
    await kickoffSynthesisGraph({
      projectId,
      projectName: proj.name,
      projectVision: proj.vision,
      teamId: team.id,
    });
  });

  return NextResponse.json(
    {
      synthesis_id: synthesisId,
      expected_artifacts: EXPECTED_ARTIFACT_KINDS,
      status_url: buildStatusUrl(projectId),
      credits_used: creditResult.creditsUsed,
      credit_limit: creditResult.creditLimit,
    },
    { status: 202 }
  );
});
