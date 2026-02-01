import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
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
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to validate projects' },
        { status: 401 }
      );
    }

    // Get team for authorization
    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found', message: 'No team associated with your account' },
        { status: 404 }
      );
    }

    // Parse project ID
    const { id: projectIdStr } = await params;
    const projectId = parseInt(projectIdStr, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID', message: 'Project ID must be a number' },
        { status: 400 }
      );
    }

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
    const validationData: ProjectValidationData = {
      id: project.id,
      name: project.name,
      vision: project.vision,
      status: project.status,
      actors: project.projectData?.actors as any,
      useCases: project.projectData?.useCases as any,
      systemBoundaries: project.projectData?.systemBoundaries as any,
      dataEntities: project.projectData?.dataEntities as any,
      artifacts: project.artifacts as any,
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
  } catch (error) {
    console.error('Project validation error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects/[id]/validate
 * Get the last validation results for a project
 *
 * Returns the validation scores stored in the project record
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get team for authorization
    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Parse project ID
    const { id: projectIdStr } = await params;
    const projectId = parseInt(projectIdStr, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error('Get validation error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
