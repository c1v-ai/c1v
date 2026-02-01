import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { recommendTechStack, validateTechStack, type TechStackContext } from '@/lib/langchain/agents/tech-stack-agent';
import { techStackModelSchema } from '@/lib/db/schema/v2-validators';
import type { TechStackModel } from '@/lib/db/schema/v2-types';

/**
 * GET /api/projects/[id]/tech-stack
 * Get the existing tech stack for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to team
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
      with: {
        projectData: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Return existing tech stack or null
    const techStack = project.projectData?.techStack as TechStackModel | null;

    return NextResponse.json({
      projectId,
      techStack: techStack || null,
      hasRecommendation: !!techStack,
    });
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/tech-stack
 * Generate a new tech stack recommendation
 *
 * Request body (optional):
 * {
 *   constraints?: string[],
 *   preferences?: string[]
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to team
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
      with: {
        projectData: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Parse optional request body
    let constraints: string[] = [];
    let preferences: string[] = [];

    try {
      const body = await request.json();
      if (body.constraints && Array.isArray(body.constraints)) {
        constraints = body.constraints.filter((c: unknown) => typeof c === 'string');
      }
      if (body.preferences && Array.isArray(body.preferences)) {
        preferences = body.preferences.filter((p: unknown) => typeof p === 'string');
      }
    } catch {
      // No body or invalid JSON - use defaults
    }

    // Build context from project data
    const existingData = project.projectData;
    const useCases = (existingData?.useCases as Array<{ name: string; description: string }>) || [];
    const dataEntities = (existingData?.dataEntities as Array<{ name: string }>) || [];

    const context: TechStackContext = {
      projectName: project.name,
      projectVision: project.vision,
      useCases,
      dataEntities,
      constraints,
      preferences,
    };

    // Generate tech stack recommendation
    const techStack = await recommendTechStack(context);

    // Validate the result
    const validated = validateTechStack(techStack);
    if (!validated) {
      return NextResponse.json(
        { error: 'Failed to generate valid tech stack' },
        { status: 500 }
      );
    }

    // Upsert project_data with tech stack
    if (existingData) {
      await db
        .update(projectData)
        .set({
          techStack: validated,
          updatedAt: new Date(),
        })
        .where(eq(projectData.projectId, projectId));
    } else {
      await db.insert(projectData).values({
        projectId,
        techStack: validated,
        completeness: 0,
      });
    }

    return NextResponse.json({
      projectId,
      techStack: validated,
      generated: true,
    });
  } catch (error) {
    console.error('Error generating tech stack:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
