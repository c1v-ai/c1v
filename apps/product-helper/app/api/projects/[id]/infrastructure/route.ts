import { NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { checkAndDeductCredits } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  generateInfrastructureSpec,
  validateInfrastructureSpec,
  type InfrastructureContext,
  type ScaleRequirements,
} from '@/lib/langchain/agents/infrastructure-agent';
import type { InfrastructureSpec, TechStackModel } from '@/lib/db/schema/v2-types';
import { checkAndDeductCredits } from '@/lib/db/queries';

/**
 * GET /api/projects/[id]/infrastructure
 * Get the existing infrastructure specification for a project
 */
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
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

    // Return existing infrastructure spec or null
    const infrastructureSpec = project.projectData?.infrastructureSpec as InfrastructureSpec | null;

    return NextResponse.json({
      projectId,
      infrastructureSpec: infrastructureSpec || null,
      hasSpecification: !!infrastructureSpec,
    });
  }
);

/**
 * POST /api/projects/[id]/infrastructure
 * Generate a new infrastructure specification
 *
 * Request body (optional):
 * {
 *   scaleRequirements?: {
 *     expectedUsers?: number,
 *     peakConcurrentUsers?: number,
 *     dataVolumeGb?: number,
 *     requestsPerSecond?: number,
 *     globalDistribution?: boolean
 *   },
 *   complianceRequirements?: string[],
 *   budgetConstraints?: string
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

    // Credit gate: Infrastructure generation costs 100 credits
    const creditResult = await checkAndDeductCredits(team.id, 100);
    if (!creditResult.allowed) {
      return NextResponse.json(
        {
          error: 'Credit limit reached',
          creditsUsed: creditResult.creditsUsed,
          creditLimit: creditResult.creditLimit,
        },
        { status: 402 }
      );
    }

    // Parse optional request body
    let scaleRequirements: ScaleRequirements | undefined;
    let complianceRequirements: string[] = [];
    let budgetConstraints: string | undefined;

    try {
      const body = await req.json();

      if (body.scaleRequirements && typeof body.scaleRequirements === 'object') {
        scaleRequirements = {
          expectedUsers: typeof body.scaleRequirements.expectedUsers === 'number'
            ? body.scaleRequirements.expectedUsers : undefined,
          peakConcurrentUsers: typeof body.scaleRequirements.peakConcurrentUsers === 'number'
            ? body.scaleRequirements.peakConcurrentUsers : undefined,
          dataVolumeGb: typeof body.scaleRequirements.dataVolumeGb === 'number'
            ? body.scaleRequirements.dataVolumeGb : undefined,
          requestsPerSecond: typeof body.scaleRequirements.requestsPerSecond === 'number'
            ? body.scaleRequirements.requestsPerSecond : undefined,
          globalDistribution: typeof body.scaleRequirements.globalDistribution === 'boolean'
            ? body.scaleRequirements.globalDistribution : undefined,
        };
      }

      if (body.complianceRequirements && Array.isArray(body.complianceRequirements)) {
        complianceRequirements = body.complianceRequirements.filter(
          (c: unknown) => typeof c === 'string'
        );
      }

      if (body.budgetConstraints && typeof body.budgetConstraints === 'string') {
        budgetConstraints = body.budgetConstraints;
      }
    } catch {
      // No body or invalid JSON - use defaults
    }

    // Get existing tech stack from project data
    const existingData = project.projectData;
    const techStack = existingData?.techStack as TechStackModel | undefined;

    // Build context for infrastructure generation
    const context: InfrastructureContext = {
      projectName: project.name,
      projectDescription: project.vision,
      techStack,
      scaleRequirements,
      complianceRequirements,
      budgetConstraints,
    };

    // Generate infrastructure specification
    const infrastructureSpec = await generateInfrastructureSpec(context);

    // Validate the result
    const validated = validateInfrastructureSpec(infrastructureSpec);
    if (!validated) {
      return NextResponse.json(
        { error: 'Failed to generate valid infrastructure specification' },
        { status: 500 }
      );
    }

    // Upsert project_data with infrastructure spec
    if (existingData) {
      await db
        .update(projectData)
        .set({
          infrastructureSpec: validated,
          updatedAt: new Date(),
        })
        .where(eq(projectData.projectId, projectId));
    } else {
      await db.insert(projectData).values({
        projectId,
        infrastructureSpec: validated,
        completeness: 0,
      });
    }

    return NextResponse.json({
      projectId,
      infrastructureSpec: validated,
      generated: true,
    });
  }
);
