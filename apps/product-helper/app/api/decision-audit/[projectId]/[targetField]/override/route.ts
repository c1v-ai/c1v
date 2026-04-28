/**
 * POST /api/decision-audit/[projectId]/[targetField]/override
 *
 * Manual user override of an auto-filled value.
 *
 * Append-row pattern (see `components/synthesis/why-this-value-types.ts`):
 *   The `decision_audit` table is APPEND-ONLY (REVOKE UPDATE). An override
 *   INSERTs a NEW audit row with `agent_id='user'`, `auto_filled=false`,
 *   `value=<new>`, `math_trace=<rationale>`, and a `hash_chain_prev` linking
 *   to the prior row in the same `(project_id, target_field)` stream.
 *
 * Engine policy: only proceeds when the prior row carried
 * `user_overrideable=true`. Otherwise 409 conflict.
 *
 * Tenant isolation: session → team_id → projects.team_id ownership check.
 * RLS provides defense-in-depth; the route layer is the primary gate.
 *
 * Validation:
 *   - `rationale` must be ≥10 chars after trim. Without it, override history
 *     loses context per the deliverable spec.
 *
 * @module app/api/decision-audit/[projectId]/[targetField]/override/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { getLatestDecisionAuditRow } from '@/lib/db/decision-audit-queries';
import { writeAuditRow } from '@/lib/langchain/engines/audit-writer';

const MIN_RATIONALE_CHARS = 10;
const USER_OVERRIDE_AGENT_ID = 'user';
const USER_OVERRIDE_MODEL_VERSION = 'user-override';

const overrideBodySchema = z.object({
  decisionId: z.string().min(1),
  storyId: z.string().min(1),
  engineVersion: z.string().min(1),
  newValue: z.unknown(),
  rationale: z.string().min(MIN_RATIONALE_CHARS),
});

interface RouteParams {
  params: Promise<{ projectId?: string; targetField?: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { projectId: projectIdRaw, targetField: targetFieldRaw } =
    await params;
  const projectId = Number(projectIdRaw);
  if (!projectId || Number.isNaN(projectId)) {
    return NextResponse.json({ error: 'invalid_project_id' }, { status: 400 });
  }
  const targetField = targetFieldRaw
    ? decodeURIComponent(targetFieldRaw)
    : '';
  if (!targetField) {
    return NextResponse.json(
      { error: 'invalid_target_field' },
      { status: 400 },
    );
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const team = await getTeamForUser();
  if (!team) {
    return NextResponse.json({ error: 'no_team' }, { status: 403 });
  }

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.teamId, team.id)))
    .limit(1);
  if (!project) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 403 });
  }

  let body: z.infer<typeof overrideBodySchema>;
  try {
    body = overrideBodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      {
        error: 'invalid_body',
        detail: err instanceof Error ? err.message : 'parse_failed',
      },
      { status: 400 },
    );
  }

  const prior = await getLatestDecisionAuditRow(projectId, targetField);
  if (!prior) {
    return NextResponse.json(
      { error: 'no_prior_decision' },
      { status: 404 },
    );
  }
  if (prior.decisionId !== body.decisionId) {
    return NextResponse.json(
      {
        error: 'decision_id_mismatch',
        expected: prior.decisionId,
        got: body.decisionId,
      },
      { status: 409 },
    );
  }
  if (!prior.userOverrideable) {
    return NextResponse.json(
      { error: 'not_user_overrideable' },
      { status: 409 },
    );
  }

  // The new row keeps the prior's identity columns (decisionId, targetField,
  // targetArtifact, storyId, engineVersion, units, userOverrideable) and
  // replaces value + disposition + math_trace + agent_id + model_version.
  // RAG is not re-attempted on user-override rows (the user owns the choice).
  const result = await writeAuditRow({
    projectId,
    decisionId: prior.decisionId,
    targetField: prior.targetField,
    targetArtifact: prior.targetArtifact,
    storyId: body.storyId || prior.storyId,
    engineVersion: body.engineVersion || prior.engineVersion,
    value: body.newValue,
    units: prior.units,
    inputsUsed: {},
    modifiersApplied: [],
    baseConfidence: 1,
    finalConfidence: 1,
    matchedRuleId: null,
    autoFilled: false,
    needsUserInput: false,
    computedOptions: null,
    mathTrace: `User override: ${body.rationale}`,
    missingInputs: [],
    modelVersion: USER_OVERRIDE_MODEL_VERSION,
    ragAttempted: false,
    kbChunkIds: [],
    userOverrideable: prior.userOverrideable,
    overrideHistory: [],
    agentId: USER_OVERRIDE_AGENT_ID,
  });

  return NextResponse.json(
    {
      status: 'override_written',
      audit_id: result.id,
      hash_chain_prev: result.hashChainPrev,
    },
    { status: 201 },
  );
}
