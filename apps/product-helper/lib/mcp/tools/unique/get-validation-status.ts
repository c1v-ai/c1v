/**
 * get_validation_status MCP Tool
 *
 * Returns SR-CORNELL validation score and individual check results.
 * Shows PRD completeness and quality metrics.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface GetValidationStatusArgs {
  verbose?: boolean;
  [key: string]: unknown;
}

interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  weight: number;
  details?: string;
}

const definition: ToolDefinition = {
  name: 'get_validation_status',
  description:
    'Get SR-CORNELL validation score and individual check results. ' +
    'Shows PRD completeness, quality metrics, and which validation gates are passing or failing. ' +
    'Use this to understand the quality and completeness of the project requirements.',
  inputSchema: {
    type: 'object',
    properties: {
      verbose: {
        type: 'boolean',
        description: 'Include detailed check results and recommendations (default: false)',
      },
    },
  },
};

/**
 * SR-CORNELL validation checks
 */
function runValidationChecks(project: {
  name: string;
  vision: string | null;
  validationScore: number | null;
  projectData: {
    actors?: unknown[];
    useCases?: unknown[];
    dataEntities?: unknown[];
    systemBoundaries?: { internal?: unknown[]; external?: unknown[] };
    completeness?: number;
  } | null;
}): ValidationCheck[] {
  const data = project.projectData;
  const checks: ValidationCheck[] = [];

  // HG1: Minimum Actors (at least 2)
  const actorCount = Array.isArray(data?.actors) ? data.actors.length : 0;
  checks.push({
    id: 'HG1',
    name: 'Minimum Actors',
    description: 'Project must have at least 2 actors defined',
    passed: actorCount >= 2,
    weight: 15,
    details: `Found ${actorCount} actor(s)`,
  });

  // HG2: Minimum Use Cases (at least 3)
  const useCaseCount = Array.isArray(data?.useCases) ? data.useCases.length : 0;
  checks.push({
    id: 'HG2',
    name: 'Minimum Use Cases',
    description: 'Project must have at least 3 use cases defined',
    passed: useCaseCount >= 3,
    weight: 15,
    details: `Found ${useCaseCount} use case(s)`,
  });

  // HG3: System Boundaries Defined
  const hasBoundaries =
    data?.systemBoundaries &&
    ((Array.isArray(data.systemBoundaries.internal) && data.systemBoundaries.internal.length > 0) ||
      (Array.isArray(data.systemBoundaries.external) && data.systemBoundaries.external.length > 0));
  checks.push({
    id: 'HG3',
    name: 'System Boundaries',
    description: 'Project must have system boundaries defined',
    passed: !!hasBoundaries,
    weight: 10,
    details: hasBoundaries ? 'Boundaries defined' : 'No boundaries defined',
  });

  // HG4: Data Entities (at least 2)
  const entityCount = Array.isArray(data?.dataEntities) ? data.dataEntities.length : 0;
  checks.push({
    id: 'HG4',
    name: 'Data Entities',
    description: 'Project must have at least 2 data entities defined',
    passed: entityCount >= 2,
    weight: 10,
    details: `Found ${entityCount} entity/entities`,
  });

  // HG5: Project Vision
  checks.push({
    id: 'HG5',
    name: 'Project Vision',
    description: 'Project must have a vision statement',
    passed: !!project.vision && project.vision.length > 10,
    weight: 10,
    details: project.vision ? `Vision: ${project.vision.substring(0, 50)}...` : 'No vision set',
  });

  // HG6: Actor Goals
  const actorsWithGoals = Array.isArray(data?.actors)
    ? (data.actors as Array<{ goals?: unknown[] }>).filter(
        (a) => Array.isArray(a.goals) && a.goals.length > 0
      ).length
    : 0;
  checks.push({
    id: 'HG6',
    name: 'Actor Goals',
    description: 'At least 50% of actors must have goals defined',
    passed: actorCount === 0 || actorsWithGoals >= actorCount * 0.5,
    weight: 10,
    details: `${actorsWithGoals}/${actorCount} actors have goals`,
  });

  // HG7: Use Case Steps
  const useCasesWithSteps = Array.isArray(data?.useCases)
    ? (data.useCases as Array<{ steps?: unknown[] }>).filter(
        (uc) => Array.isArray(uc.steps) && uc.steps.length > 0
      ).length
    : 0;
  checks.push({
    id: 'HG7',
    name: 'Use Case Steps',
    description: 'At least 50% of use cases must have steps defined',
    passed: useCaseCount === 0 || useCasesWithSteps >= useCaseCount * 0.5,
    weight: 10,
    details: `${useCasesWithSteps}/${useCaseCount} use cases have steps`,
  });

  // HG8: Entity Attributes
  const entitiesWithAttributes = Array.isArray(data?.dataEntities)
    ? (data.dataEntities as Array<{ attributes?: unknown[] }>).filter(
        (e) => Array.isArray(e.attributes) && e.attributes.length > 0
      ).length
    : 0;
  checks.push({
    id: 'HG8',
    name: 'Entity Attributes',
    description: 'At least 50% of entities must have attributes defined',
    passed: entityCount === 0 || entitiesWithAttributes >= entityCount * 0.5,
    weight: 10,
    details: `${entitiesWithAttributes}/${entityCount} entities have attributes`,
  });

  // HG9: Completeness Score
  const completeness = data?.completeness ?? 0;
  checks.push({
    id: 'HG9',
    name: 'Completeness Score',
    description: 'Overall completeness must be at least 60%',
    passed: completeness >= 60,
    weight: 5,
    details: `Completeness: ${completeness}%`,
  });

  // HG10: Project Name
  checks.push({
    id: 'HG10',
    name: 'Project Name',
    description: 'Project must have a meaningful name',
    passed: !!project.name && project.name.length >= 3,
    weight: 5,
    details: `Name: "${project.name}"`,
  });

  return checks;
}

const handler: ToolHandler<GetValidationStatusArgs> = async (args, context) => {
  const verbose = args.verbose ?? false;

  // Fetch project with data
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, context.projectId),
    with: {
      projectData: true,
    },
  });

  if (!project) {
    return createTextResult(`Project with ID ${context.projectId} not found`, true);
  }

  // Run validation checks
  const checks = runValidationChecks({
    name: project.name,
    vision: project.vision,
    validationScore: project.validationScore,
    projectData: project.projectData as {
      actors?: unknown[];
      useCases?: unknown[];
      dataEntities?: unknown[];
      systemBoundaries?: { internal?: unknown[]; external?: unknown[] };
      completeness?: number;
    } | null,
  });

  // Calculate score
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const passedWeight = checks.filter((c) => c.passed).reduce((sum, c) => sum + c.weight, 0);
  const score = Math.round((passedWeight / totalWeight) * 100);

  const passing = checks.filter((c) => c.passed).length;
  const failing = checks.filter((c) => !c.passed).length;

  const response: Record<string, unknown> = {
    projectId: project.id,
    projectName: project.name,
    score,
    passing,
    failing,
    total: checks.length,
    status: score >= 80 ? 'passing' : score >= 60 ? 'needs_work' : 'failing',
  };

  if (verbose) {
    response.checks = checks;
    response.recommendations = checks
      .filter((c) => !c.passed)
      .map((c) => `[${c.id}] ${c.name}: ${c.description}`);
  } else {
    response.failingChecks = checks.filter((c) => !c.passed).map((c) => c.id);
  }

  return createJsonResult(response);
};

export function registerGetValidationStatus(): void {
  registerTool(definition, handler);
}

export { definition, handler };
