import { NextRequest, NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { checkAndDeductCredits } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { recommendTechStack, validateTechStack, type TechStackContext } from '@/lib/langchain/agents/tech-stack-agent';
import type { TechStackModel } from '@/lib/db/schema/v2-types';

/**
 * GET /api/projects/[id]/tech-stack
 * Get the existing tech stack for a project
 */
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    // Fetch project with projectData
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
  }
);

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
export const POST = withProjectAuth(
  async (req, { team, projectId }) => {
    // Credit check
    const creditResult = await checkAndDeductCredits(team.id, 100);
    if (!creditResult.allowed) {
      return NextResponse.json(
        { error: 'credit_limit_reached', creditsUsed: creditResult.creditsUsed, creditLimit: creditResult.creditLimit },
        { status: 402 }
      );
    }

    // Fetch project with projectData
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
      const body = await req.json();
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
  }
);
