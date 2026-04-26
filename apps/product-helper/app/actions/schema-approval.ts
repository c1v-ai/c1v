'use server';

/**
 * Schema-approval server action (TA2 Wave A, EC-V21-A.6).
 *
 * Persists `extractedData.schema.{approvedAt, approvedBy, approvedSha}` into
 * the legacy `project_data.intake_state` jsonb blob. Re-extraction (a
 * subsequent schema generation that bumps the SHA) drops the approval — the
 * gate compares stored `approvedSha` against current schema digest at read
 * time.
 */

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { projectData, projects } from '@/lib/db/schema';
import { getUser, getTeamForUser } from '@/lib/db/queries';

interface ApproveResult {
  ok: true;
  approvedAt: string;
}
interface ErrorResult {
  ok: false;
  error: string;
}

export async function approveSchema(
  projectId: number,
  schemaSha: string,
): Promise<ApproveResult | ErrorResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  const team = await getTeamForUser();
  if (!team) return { ok: false, error: 'Team not found' };

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
  });
  if (!project) return { ok: false, error: 'Project not found' };

  const existing = await db.query.projectData.findFirst({
    where: eq(projectData.projectId, projectId),
  });

  const prevIntake = (existing?.intakeState ?? {}) as Record<string, unknown>;
  const prevExtracted = (prevIntake.extractedData ?? {}) as Record<string, unknown>;
  const prevSchemaState = (prevExtracted.schema ?? {}) as Record<string, unknown>;
  const approvedAt = new Date().toISOString();

  const nextIntake = {
    ...prevIntake,
    extractedData: {
      ...prevExtracted,
      schema: {
        ...prevSchemaState,
        approvedAt,
        approvedBy: user.id,
        approvedSha: schemaSha,
      },
    },
  };

  if (existing) {
    await db
      .update(projectData)
      .set({ intakeState: nextIntake, updatedAt: new Date() })
      .where(eq(projectData.projectId, projectId));
  } else {
    await db.insert(projectData).values({
      projectId,
      intakeState: nextIntake,
    });
  }

  revalidatePath(`/projects/${projectId}/backend/schema`);
  revalidatePath(`/projects/${projectId}/architecture-and-database`);

  return { ok: true, approvedAt };
}
