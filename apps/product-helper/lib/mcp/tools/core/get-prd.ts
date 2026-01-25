/**
 * get_prd MCP Tool
 *
 * Returns the full Product Requirements Document or a specific section.
 * Queries project_data table for extracted PRD data.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler, ToolContext } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Valid PRD sections that can be requested
 */
type PrdSection = 'full' | 'problem' | 'actors' | 'use_cases' | 'scope' | 'goals';

interface GetPrdArgs {
  section?: PrdSection;
  [key: string]: unknown;
}

const definition: ToolDefinition = {
  name: 'get_prd',
  description:
    'Get the Product Requirements Document (PRD) for the current project. ' +
    'Returns the full PRD by default, or a specific section if specified. ' +
    'Use this to understand what the product should do and who its users are.',
  inputSchema: {
    type: 'object',
    properties: {
      section: {
        type: 'string',
        enum: ['full', 'problem', 'actors', 'use_cases', 'scope', 'goals'],
        description:
          'Section to retrieve. Options: ' +
          'full (default, entire PRD), ' +
          'problem (problem statement and vision), ' +
          'actors (user types and personas), ' +
          'use_cases (feature workflows), ' +
          'scope (system boundaries), ' +
          'goals (project objectives)',
      },
    },
  },
};

const handler: ToolHandler<GetPrdArgs> = async (args, context) => {
  const section = args.section || 'full';

  // Fetch project and project data
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, context.projectId),
    with: {
      projectData: true,
    },
  });

  if (!project) {
    return createTextResult(`Project with ID ${context.projectId} not found`, true);
  }

  const data = project.projectData;

  // Build the PRD response based on requested section
  switch (section) {
    case 'problem': {
      const problemSection = {
        projectName: project.name,
        vision: project.vision,
        status: project.status,
      };
      return createJsonResult(problemSection);
    }

    case 'actors': {
      const actors = data?.actors ?? [];
      return createJsonResult({
        projectName: project.name,
        actors,
        count: Array.isArray(actors) ? actors.length : 0,
      });
    }

    case 'use_cases': {
      const useCases = data?.useCases ?? [];
      return createJsonResult({
        projectName: project.name,
        useCases,
        count: Array.isArray(useCases) ? useCases.length : 0,
      });
    }

    case 'scope': {
      const systemBoundaries = data?.systemBoundaries ?? { internal: [], external: [] };
      return createJsonResult({
        projectName: project.name,
        systemBoundaries,
      });
    }

    case 'goals': {
      // Goals can be derived from actors' goals and the project vision
      const actors = data?.actors as Array<{ name: string; goals?: string[] }> | undefined;
      const actorGoals: Record<string, string[]> = {};

      if (Array.isArray(actors)) {
        actors.forEach((actor) => {
          if (actor.goals && actor.goals.length > 0) {
            actorGoals[actor.name] = actor.goals;
          }
        });
      }

      return createJsonResult({
        projectName: project.name,
        vision: project.vision,
        actorGoals,
      });
    }

    case 'full':
    default: {
      const fullPrd = {
        project: {
          id: project.id,
          name: project.name,
          vision: project.vision,
          status: project.status,
          validationScore: project.validationScore,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
        actors: data?.actors ?? [],
        useCases: data?.useCases ?? [],
        systemBoundaries: data?.systemBoundaries ?? { internal: [], external: [] },
        dataEntities: data?.dataEntities ?? [],
        completeness: data?.completeness ?? 0,
        lastExtractedAt: data?.lastExtractedAt,
      };
      return createJsonResult(fullPrd);
    }
  }
};

/**
 * Register the get_prd tool with the MCP server
 */
export function registerGetPrd(): void {
  registerTool(definition, handler);
}

export { definition, handler };
