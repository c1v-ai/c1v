/**
 * POST /api/projects/[id]/artifacts/[kind]/retry
 *
 * Per-artifact retry endpoint (EC-V21-B.4). Pre-checks owner + state, then
 * fires a Cloud Run single-artifact retry (TA3's run-single-artifact.py
 * task) by calling the sidecar `/run-render` with the latest agent payload
 * for that kind.
 *
 * Idempotent: if the artifact is already in a non-terminal state (`pending`)
 * the endpoint returns 202 without re-firing. Only `failed` rows transition
 * back to `pending`.
 *
 * NO canned fall-back per D-V21.17 — the only allowed degradation path is
 * `failed → pending → ready|failed` driven by an explicit retry CTA.
 */

import { NextRequest, NextResponse } from 'next/server';

import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { projectArtifacts } from '@/lib/db/schema/project-artifacts';
import { upsertArtifactStatus } from '@/lib/synthesis/artifacts-bridge';
import { and, desc, eq } from 'drizzle-orm';

const SIDECAR_RETRY_PATH = '/run-render';

interface RouteParams {
  params: Promise<{ id?: string; kind?: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id, kind } = await params;
  const projectId = Number(id);
  if (!projectId || Number.isNaN(projectId)) {
    return NextResponse.json({ error: 'invalid_project_id' }, { status: 400 });
  }
  if (!kind || typeof kind !== 'string') {
    return NextResponse.json({ error: 'invalid_artifact_kind' }, { status: 400 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const team = await getTeamForUser();
  if (!team) {
    return NextResponse.json({ error: 'no_team' }, { status: 404 });
  }

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.teamId, team.id)))
    .limit(1);
  if (!project) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 });
  }

  const [artifact] = await db
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

  if (!artifact) {
    return NextResponse.json({ error: 'artifact_not_found' }, { status: 404 });
  }

  // Idempotency: a row that's already retrying should not re-fire.
  if (artifact.synthesisStatus === 'pending') {
    return NextResponse.json(
      {
        status: 'already_pending',
        artifact_kind: kind,
        artifact_id: artifact.id,
      },
      { status: 202 },
    );
  }

  if (artifact.synthesisStatus !== 'failed') {
    return NextResponse.json(
      {
        error: 'artifact_not_retriable',
        current_status: artifact.synthesisStatus,
      },
      { status: 409 },
    );
  }

  // Flip to pending; clear failure_reason so UI doesn't show stale text.
  await upsertArtifactStatus({
    projectId,
    kind,
    status: 'pending',
    failureReason: null,
  });

  // Fire-and-forget Cloud Run sidecar dispatch. When RENDER_SIDECAR_URL is
  // unset (local dev / Wave-A pre-deploy), this is a no-op — the row stays
  // 'pending' and TA3's run-single-artifact.py picks it up on next sweep.
  const sidecarBase = process.env.RENDER_SIDECAR_URL;
  if (sidecarBase) {
    void fetch(`${sidecarBase}${SIDECAR_RETRY_PATH}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        artifact_kind: kind,
        // run-single-artifact.py is responsible for fetching the latest
        // agent_output_payload for (project_id, kind) from project_artifacts.
        retry: true,
      }),
    }).catch((err) => {
      console.error(
        `[artifact-retry] sidecar dispatch failed (project=${projectId} kind=${kind}):`,
        err instanceof Error ? err.message : err,
      );
    });
  }

  return NextResponse.json(
    {
      status: 'retry_queued',
      artifact_kind: kind,
      artifact_id: artifact.id,
    },
    { status: 202 },
  );
}
