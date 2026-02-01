import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { SectionStatuses } from '@/lib/db/schema/v2-types';

/**
 * Valid section keys for PRD review workflow.
 */
const SECTION_KEYS = [
  'problem-statement',
  'system-overview',
  'architecture',
  'tech-stack',
  'user-stories',
  'schema',
  'api-spec',
  'infrastructure',
  'guidelines',
  'nfr',
] as const;

/**
 * Valid review statuses for each section.
 */
const REVIEW_STATUSES = ['draft', 'awaiting-review', 'approved'] as const;

const updateSectionStatusSchema = z.object({
  section: z.enum(SECTION_KEYS),
  status: z.enum(REVIEW_STATUSES),
});

/**
 * GET /api/projects/[id]/sections/status
 * Returns the review status for all sections of a project.
 *
 * @returns {{ sectionStatuses: SectionStatuses }}
 */
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    // Verify project exists and belongs to team
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
      columns: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch section statuses from projectData
    const data = await db.query.projectData.findFirst({
      where: eq(projectData.projectId, projectId),
      columns: {
        reviewStatus: true,
      },
    });

    const sectionStatuses: SectionStatuses =
      (data?.reviewStatus as SectionStatuses) ?? {};

    return NextResponse.json({ sectionStatuses });
  }
);

/**
 * PUT /api/projects/[id]/sections/status
 * Update the review status of a single PRD section.
 *
 * @body {{ section: SectionKey, status: SectionReviewStatus }}
 * @returns {{ success: true, sectionStatuses: SectionStatuses }}
 */
export const PUT = withProjectAuth(
  async (req, { team, projectId }) => {
    // Verify project exists and belongs to team
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
      columns: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Validate request body
    const body = await req.json();
    const parsed = updateSectionStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    const { section, status } = parsed.data;

    // Read current section statuses
    const existingData = await db.query.projectData.findFirst({
      where: eq(projectData.projectId, projectId),
      columns: {
        id: true,
        reviewStatus: true,
      },
    });

    const currentStatuses: SectionStatuses =
      (existingData?.reviewStatus as SectionStatuses) ?? {};

    // Merge the new status
    const updatedStatuses: SectionStatuses = {
      ...currentStatuses,
      [section]: status,
    };

    if (existingData) {
      // Update existing row
      await db
        .update(projectData)
        .set({
          reviewStatus: updatedStatuses,
          updatedAt: new Date(),
        })
        .where(eq(projectData.projectId, projectId));
    } else {
      // Create projectData row if it does not exist
      await db.insert(projectData).values({
        projectId,
        reviewStatus: updatedStatuses,
      });
    }

    return NextResponse.json({
      success: true,
      sectionStatuses: updatedStatuses,
    });
  }
);
