import { NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { checkAndDeductCredits } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  generateCodingGuidelines,
  validateCodingGuidelines,
  type GuidelinesContext,
} from '@/lib/langchain/agents/guidelines-agent';
import type { CodingGuidelines, TechStackModel } from '@/lib/db/schema/v2-types';

/**
 * GET /api/projects/[id]/guidelines
 * Get the existing coding guidelines for a project
 */
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    // Verify project exists and belongs to team
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
      with: {
        projectData: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Return existing coding guidelines or null
    const guidelines = project.projectData
      ?.codingGuidelines as CodingGuidelines | null;

    return NextResponse.json({
      projectId,
      guidelines: guidelines || null,
      hasGuidelines: !!guidelines,
    });
  }
);

/**
 * POST /api/projects/[id]/guidelines
 * Generate new coding guidelines based on tech stack and preferences
 *
 * Request body (optional):
 * {
 *   teamSize?: 'solo' | 'small' | 'medium' | 'large',
 *   experienceLevel?: 'junior' | 'mixed' | 'senior',
 *   projectType?: 'startup' | 'enterprise' | 'open-source' | 'internal-tool',
 *   preferences?: {
 *     paradigm?: 'functional' | 'oop' | 'mixed',
 *     strictness?: 'relaxed' | 'moderate' | 'strict',
 *     testCoverage?: number,
 *     commitStyle?: 'conventional' | 'gitmoji' | 'custom'
 *   }
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
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
      with: {
        projectData: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if tech stack exists - required for generating guidelines
    const existingData = project.projectData;
    const techStack = existingData?.techStack as TechStackModel | null;

    if (!techStack || !techStack.categories || techStack.categories.length === 0) {
      return NextResponse.json(
        {
          error:
            'Tech stack required. Please generate a tech stack recommendation first.',
          hint: 'POST /api/projects/[id]/tech-stack',
        },
        { status: 400 }
      );
    }

    // Parse optional request body
    let teamSize: GuidelinesContext['teamSize'];
    let experienceLevel: GuidelinesContext['experienceLevel'];
    let projectType: GuidelinesContext['projectType'];
    let preferences: GuidelinesContext['preferences'];

    try {
      const body = await req.json();

      if (
        body.teamSize &&
        ['solo', 'small', 'medium', 'large'].includes(body.teamSize)
      ) {
        teamSize = body.teamSize;
      }

      if (
        body.experienceLevel &&
        ['junior', 'mixed', 'senior'].includes(body.experienceLevel)
      ) {
        experienceLevel = body.experienceLevel;
      }

      if (
        body.projectType &&
        ['startup', 'enterprise', 'open-source', 'internal-tool'].includes(
          body.projectType
        )
      ) {
        projectType = body.projectType;
      }

      if (body.preferences && typeof body.preferences === 'object') {
        preferences = {};
        if (
          body.preferences.paradigm &&
          ['functional', 'oop', 'mixed'].includes(body.preferences.paradigm)
        ) {
          preferences.paradigm = body.preferences.paradigm;
        }
        if (
          body.preferences.strictness &&
          ['relaxed', 'moderate', 'strict'].includes(body.preferences.strictness)
        ) {
          preferences.strictness = body.preferences.strictness;
        }
        if (
          typeof body.preferences.testCoverage === 'number' &&
          body.preferences.testCoverage >= 0 &&
          body.preferences.testCoverage <= 100
        ) {
          preferences.testCoverage = body.preferences.testCoverage;
        }
        if (
          body.preferences.commitStyle &&
          ['conventional', 'gitmoji', 'custom'].includes(
            body.preferences.commitStyle
          )
        ) {
          preferences.commitStyle = body.preferences.commitStyle;
        }
      }
    } catch {
      // No body or invalid JSON - use defaults
    }

    // Build context from project data
    const context: GuidelinesContext = {
      projectName: project.name,
      techStack,
      teamSize,
      experienceLevel,
      projectType,
      preferences,
    };

    // Generate coding guidelines
    const guidelines = await generateCodingGuidelines(context);

    // Validate the result
    const validated = validateCodingGuidelines(guidelines);
    if (!validated) {
      return NextResponse.json(
        { error: 'Failed to generate valid coding guidelines' },
        { status: 500 }
      );
    }

    // Upsert project_data with coding guidelines
    if (existingData) {
      await db
        .update(projectData)
        .set({
          codingGuidelines: validated,
          updatedAt: new Date(),
        })
        .where(eq(projectData.projectId, projectId));
    } else {
      await db.insert(projectData).values({
        projectId,
        codingGuidelines: validated,
        completeness: 0,
      });
    }

    return NextResponse.json({
      projectId,
      guidelines: validated,
      generated: true,
    });
  }
);
