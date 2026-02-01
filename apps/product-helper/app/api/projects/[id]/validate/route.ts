import { NextRequest, NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateProject } from '@/lib/validation/validator';
import type { ProjectValidationData } from '@/lib/validation/types';

/**
 * POST /api/projects/[id]/validate
 * Run PRD-SPEC validation on a project
 *
 * This endpoint:
 * 1. Loads project with all related data
 * 2. Runs the 10 hard gate validation checks
 * 3. Updates the project's validation scores
 * 4. Returns detailed validation results
 *
 * Response: ValidationResult object with detailed gate results
 */
export const POST = withProjectAuth(
  async (req, { team, projectId }) => {
    // Load project with all related data
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
      with: {
        projectData: true,
        artifacts: true,
        conversations: {
          limit: 10, // Just need to know if conversations exist
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found', message: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Transform project data into validation format
    // Using proper types from ProjectValidationData interface
    const validationData: ProjectValidationData = {
      id: project.id,
      name: project.name,
      vision: project.vision,
      status: project.status,
      actors: (project.projectData?.actors ?? []) as ProjectValidationData['actors'],
      useCases: (project.projectData?.useCases ?? []) as ProjectValidationData['useCases'],
      systemBoundaries: (project.projectData?.systemBoundaries ?? {
        internal: [],
        external: [],
      }) as ProjectValidationData['systemBoundaries'],
      dataEntities: (project.projectData?.dataEntities ?? []) as ProjectValidationData['dataEntities'],
      artifacts: (project.artifacts ?? []) as ProjectValidationData['artifacts'],
      completeness: project.projectData?.completeness || 0,
      validationScore: project.validationScore || 0,
    };

    // Run validation
    const validationResult = await validateProject(validationData);

    // Update project with validation results
    await db
      .update(projects)
      .set({
        validationScore: validationResult.overallScore,
        validationPassed: validationResult.passedChecks,
        validationFailed: validationResult.failedChecks,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // Return validation results
    return NextResponse.json(validationResult, { status: 200 });
  }
);

/**
 * GET /api/projects/[id]/validate
 * Get the last validation results for a project
 *
 * Returns the validation scores stored in the project record
 */
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    // Load project
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Return validation summary
    return NextResponse.json({
      projectId: project.id,
      validationScore: project.validationScore || 0,
      validationPassed: project.validationPassed || 0,
      validationFailed: project.validationFailed || 0,
      hasBeenValidated: (project.validationScore || 0) > 0,
    });
  }
);
