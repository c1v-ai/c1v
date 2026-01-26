/**
 * get_gsd_phases MCP Tool
 *
 * Returns GSD (Get Stuff Done) workflow phases for the project.
 * Provides phase status and task breakdown.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface GetGsdPhasesArgs {
  includeCompleted?: boolean;
  [key: string]: unknown;
}

interface GSDPhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'complete';
  progress: number;
  order: number;
}

const definition: ToolDefinition = {
  name: 'get_gsd_phases',
  description:
    'Get GSD (Get Stuff Done) workflow phases for the project. ' +
    'Returns the current phase, phase progress, and task breakdown. ' +
    'Use this to understand the project workflow and what phase to work on next.',
  inputSchema: {
    type: 'object',
    properties: {
      includeCompleted: {
        type: 'boolean',
        description: 'Include completed phases in the response (default: true)',
      },
    },
  },
};

/**
 * Determine GSD phases based on project state
 */
function determinePhases(project: {
  status: string;
  validationScore: number | null;
  projectData: {
    actors?: unknown[];
    useCases?: unknown[];
    dataEntities?: unknown[];
    techStack?: unknown;
    apiSpecification?: unknown;
    infrastructureSpec?: unknown;
    codingGuidelines?: unknown;
    completeness?: number;
  } | null;
  userStories?: { status: string }[];
}): GSDPhase[] {
  const data = project.projectData;

  const phases: GSDPhase[] = [
    {
      id: 'discovery',
      name: 'Discovery',
      description: 'Define actors, goals, and initial requirements',
      status: 'pending',
      progress: 0,
      order: 1,
    },
    {
      id: 'requirements',
      name: 'Requirements',
      description: 'Define use cases, system boundaries, and data entities',
      status: 'pending',
      progress: 0,
      order: 2,
    },
    {
      id: 'technical',
      name: 'Technical Specification',
      description: 'Define tech stack, database schema, and API specifications',
      status: 'pending',
      progress: 0,
      order: 3,
    },
    {
      id: 'architecture',
      name: 'Architecture',
      description: 'Define infrastructure, coding guidelines, and system architecture',
      status: 'pending',
      progress: 0,
      order: 4,
    },
    {
      id: 'validation',
      name: 'Validation',
      description: 'Validate requirements and ensure PRD-SPEC compliance',
      status: 'pending',
      progress: 0,
      order: 5,
    },
    {
      id: 'implementation',
      name: 'Implementation',
      description: 'Implement user stories and build the product',
      status: 'pending',
      progress: 0,
      order: 6,
    },
  ];

  // Calculate progress for each phase

  // Discovery: actors defined
  const actorCount = Array.isArray(data?.actors) ? data.actors.length : 0;
  if (actorCount >= 2) {
    phases[0].progress = 100;
    phases[0].status = 'complete';
  } else if (actorCount > 0) {
    phases[0].progress = 50;
    phases[0].status = 'in-progress';
  }

  // Requirements: use cases + boundaries + entities
  const useCaseCount = Array.isArray(data?.useCases) ? data.useCases.length : 0;
  const entityCount = Array.isArray(data?.dataEntities) ? data.dataEntities.length : 0;
  const hasRequirements = useCaseCount >= 3 && entityCount >= 2;
  if (hasRequirements) {
    phases[1].progress = 100;
    phases[1].status = 'complete';
  } else if (useCaseCount > 0 || entityCount > 0) {
    phases[1].progress = Math.min(90, ((useCaseCount + entityCount) / 5) * 100);
    phases[1].status = 'in-progress';
  }

  // Technical: tech stack + API spec
  const hasTechStack = !!data?.techStack;
  const hasApiSpec = !!data?.apiSpecification;
  if (hasTechStack && hasApiSpec) {
    phases[2].progress = 100;
    phases[2].status = 'complete';
  } else if (hasTechStack || hasApiSpec) {
    phases[2].progress = 50;
    phases[2].status = 'in-progress';
  }

  // Architecture: infrastructure + guidelines
  const hasInfra = !!data?.infrastructureSpec;
  const hasGuidelines = !!data?.codingGuidelines;
  if (hasInfra && hasGuidelines) {
    phases[3].progress = 100;
    phases[3].status = 'complete';
  } else if (hasInfra || hasGuidelines) {
    phases[3].progress = 50;
    phases[3].status = 'in-progress';
  }

  // Validation: based on validation score
  const validationScore = project.validationScore ?? 0;
  if (validationScore >= 80) {
    phases[4].progress = 100;
    phases[4].status = 'complete';
  } else if (validationScore > 0) {
    phases[4].progress = validationScore;
    phases[4].status = 'in-progress';
  }

  // Implementation: based on user story completion
  const stories = project.userStories ?? [];
  const totalStories = stories.length;
  const doneStories = stories.filter((s) => s.status === 'done').length;
  if (totalStories > 0) {
    phases[5].progress = Math.round((doneStories / totalStories) * 100);
    phases[5].status = phases[5].progress === 100 ? 'complete' : 'in-progress';
  }

  return phases;
}

const handler: ToolHandler<GetGsdPhasesArgs> = async (args, context) => {
  const includeCompleted = args.includeCompleted ?? true;

  // Fetch project with related data
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, context.projectId),
    with: {
      projectData: true,
      userStories: true,
    },
  });

  if (!project) {
    return createTextResult(`Project with ID ${context.projectId} not found`, true);
  }

  // Determine phases
  const allPhases = determinePhases({
    status: project.status,
    validationScore: project.validationScore,
    projectData: project.projectData as {
      actors?: unknown[];
      useCases?: unknown[];
      dataEntities?: unknown[];
      techStack?: unknown;
      apiSpecification?: unknown;
      infrastructureSpec?: unknown;
      codingGuidelines?: unknown;
      completeness?: number;
    } | null,
    userStories: project.userStories,
  });

  const phases = includeCompleted ? allPhases : allPhases.filter((p) => p.status !== 'complete');

  // Find current phase (first non-complete)
  const currentPhase = allPhases.find((p) => p.status !== 'complete') || allPhases[allPhases.length - 1];

  // Calculate overall progress
  const overallProgress = Math.round(
    allPhases.reduce((sum, p) => sum + p.progress, 0) / allPhases.length
  );

  return createJsonResult({
    projectId: project.id,
    projectName: project.name,
    currentPhase: {
      id: currentPhase.id,
      name: currentPhase.name,
      status: currentPhase.status,
    },
    overallProgress,
    completedPhases: allPhases.filter((p) => p.status === 'complete').length,
    totalPhases: allPhases.length,
    phases,
  });
};

export function registerGetGsdPhases(): void {
  registerTool(definition, handler);
}

export { definition, handler };
