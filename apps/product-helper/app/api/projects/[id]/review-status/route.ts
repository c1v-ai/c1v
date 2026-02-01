import { NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_STATUSES = ['draft', 'awaiting-review', 'approved'] as const;
type ReviewStatus = (typeof VALID_STATUSES)[number];

/**
 * GET /api/projects/[id]/review-status
 * Get the review status map for a project
 */
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const data = await db.query.projectData.findFirst({
      where: eq(projectData.projectId, projectId),
      columns: { reviewStatus: true },
    });

    return NextResponse.json({
      projectId,
      reviewStatus: (data?.reviewStatus as Record<string, string>) ?? {},
    });
  }
);

/**
 * PATCH /api/projects/[id]/review-status
 * Update a single section's review status
 *
 * Request body:
 * {
 *   sectionKey: string,       // e.g. 'tech-stack', 'guidelines'
 *   status: 'draft' | 'awaiting-review' | 'approved'
 * }
 */
export const PATCH = withProjectAuth(
  async (req, { team, projectId }) => {
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const { sectionKey, status } = body as { sectionKey: string; status: string };

    if (!sectionKey || typeof sectionKey !== 'string') {
      return NextResponse.json({ error: 'sectionKey is required' }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status as ReviewStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Load existing review status
    const existing = await db.query.projectData.findFirst({
      where: eq(projectData.projectId, projectId),
      columns: { reviewStatus: true },
    });

    const currentStatuses = (existing?.reviewStatus as Record<string, string>) ?? {};
    const updatedStatuses = { ...currentStatuses, [sectionKey]: status };

    if (existing) {
      await db
        .update(projectData)
        .set({ reviewStatus: updatedStatuses, updatedAt: new Date() })
        .where(eq(projectData.projectId, projectId));
    } else {
      await db.insert(projectData).values({
        projectId,
        reviewStatus: updatedStatuses,
        completeness: 0,
      });
    }

    return NextResponse.json({
      projectId,
      sectionKey,
      status,
      reviewStatus: updatedStatuses,
    });
  }
);
