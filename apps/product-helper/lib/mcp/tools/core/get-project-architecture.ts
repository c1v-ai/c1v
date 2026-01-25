/**
 * get_project_architecture MCP Tool
 *
 * Returns an aggregated overview of the project architecture including:
 * - System type and description
 * - Tech stack summary
 * - Key entities
 * - Main use cases
 * - Architecture decisions
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler, ToolContext } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type {
  TechStackModel,
  DatabaseSchemaModel,
  APISpecification,
  InfrastructureSpec,
} from '@/lib/db/schema/v2-types';
import type { Actor, UseCase, DataEntity } from '@/lib/langchain/schemas';

interface GetProjectArchitectureArgs {
  include?: ('tech' | 'data' | 'api' | 'infra' | 'actors' | 'use_cases')[];
  [key: string]: unknown;
}

const definition: ToolDefinition = {
  name: 'get_project_architecture',
  description:
    'Get a high-level overview of the project architecture. ' +
    'Combines system type, tech stack, entities, use cases, and architecture decisions. ' +
    'Use this for quick context before diving into specifics.',
  inputSchema: {
    type: 'object',
    properties: {
      include: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['tech', 'data', 'api', 'infra', 'actors', 'use_cases'],
        },
        description:
          'Optional: specific sections to include. If not provided, includes all. ' +
          'Options: tech (tech stack), data (database entities), api (API overview), ' +
          'infra (infrastructure), actors (user types), use_cases (main workflows)',
      },
    },
  },
};

/**
 * Infer system type from project data
 */
function inferSystemType(
  techStack: TechStackModel | null,
  useCases: UseCase[] | null
): { type: string; description: string } {
  const types: string[] = [];
  let description = '';

  if (techStack?.categories) {
    const categories = techStack.categories;

    // Check for web app indicators
    const hasFrontend = categories.some((c) => c.category === 'frontend');
    const hasBackend = categories.some((c) => c.category === 'backend');
    const hasAuth = categories.some((c) => c.category === 'auth');
    const hasAI = categories.some((c) => c.category === 'ai-ml');
    const hasPayments = categories.some((c) => c.category === 'payments');
    const hasSearch = categories.some((c) => c.category === 'search');
    const hasQueue = categories.some((c) => c.category === 'queue');

    if (hasFrontend && hasBackend) {
      types.push('Full-Stack Web Application');
    } else if (hasFrontend) {
      types.push('Frontend Application');
    } else if (hasBackend) {
      types.push('Backend Service');
    }

    if (hasAI) types.push('AI-Powered');
    if (hasPayments) types.push('Commerce/Payments');
    if (hasAuth) types.push('Authenticated');
    if (hasSearch) types.push('Search-Enabled');
    if (hasQueue) types.push('Event-Driven');
  }

  // Analyze use cases for additional context
  if (useCases && useCases.length > 0) {
    const ucNames = useCases.map((uc) => uc.name.toLowerCase()).join(' ');

    if (ucNames.includes('login') || ucNames.includes('register') || ucNames.includes('auth')) {
      if (!types.includes('Authenticated')) {
        types.push('Authenticated');
      }
    }

    if (ucNames.includes('dashboard') || ucNames.includes('report')) {
      types.push('Data Dashboard');
    }

    if (ucNames.includes('create') && ucNames.includes('edit') && ucNames.includes('delete')) {
      types.push('CRUD Application');
    }
  }

  const type = types.length > 0 ? types.slice(0, 3).join(' + ') : 'Web Application';

  // Build description
  if (types.includes('AI-Powered')) {
    description = 'An AI-powered application that uses machine learning or LLM capabilities';
  } else if (types.includes('Full-Stack Web Application')) {
    description = 'A complete web application with frontend and backend components';
  } else {
    description = 'A software application';
  }

  return { type, description };
}

/**
 * Summarize tech stack into key categories
 */
function summarizeTechStack(techStack: TechStackModel): object {
  const summary: Record<string, { choice: string; version?: string }> = {};

  const keyCategories = ['frontend', 'backend', 'database', 'auth', 'hosting', 'ai-ml'];

  techStack.categories?.forEach((choice) => {
    if (keyCategories.includes(choice.category)) {
      summary[choice.category] = {
        choice: choice.choice,
        version: choice.version,
      };
    }
  });

  return {
    summary,
    constraints: techStack.constraints,
    estimatedCost: techStack.estimatedCost,
    scalability: techStack.scalability,
  };
}

/**
 * Summarize database entities
 */
function summarizeEntities(
  schema: DatabaseSchemaModel | null,
  entities: DataEntity[] | null
): object {
  if (schema?.entities) {
    return {
      source: 'v2_schema',
      entityCount: schema.entities.length,
      entities: schema.entities.map((e) => ({
        name: e.name,
        tableName: e.tableName,
        fieldCount: e.fields.length,
        relationships: e.relationships.map((r) => `${r.type} -> ${r.targetEntity}`),
      })),
      hasEnums: (schema.enums?.length || 0) > 0,
    };
  }

  if (entities && entities.length > 0) {
    return {
      source: 'legacy_entities',
      entityCount: entities.length,
      entities: entities.map((e) => ({
        name: e.name,
        attributeCount: e.attributes.length,
        relationships: e.relationships,
      })),
    };
  }

  return { source: 'none', entityCount: 0, entities: [] };
}

/**
 * Summarize API specification
 */
function summarizeApi(apiSpec: APISpecification): object {
  const endpointsByTag: Record<string, number> = {};
  const methodCounts: Record<string, number> = {};

  apiSpec.endpoints?.forEach((endpoint) => {
    // Count by tag
    endpoint.tags.forEach((tag) => {
      endpointsByTag[tag] = (endpointsByTag[tag] || 0) + 1;
    });

    // Count by method
    methodCounts[endpoint.method] = (methodCounts[endpoint.method] || 0) + 1;
  });

  return {
    title: apiSpec.title,
    version: apiSpec.version,
    baseUrl: apiSpec.baseUrl,
    authentication: apiSpec.authentication.type,
    endpointCount: apiSpec.endpoints?.length || 0,
    endpointsByTag,
    methodCounts,
    responseFormat: apiSpec.responseFormat?.envelope ? 'envelope' : 'direct',
  };
}

/**
 * Summarize infrastructure
 */
function summarizeInfra(infraSpec: InfrastructureSpec): object {
  return {
    hosting: {
      provider: infraSpec.hosting.provider,
      region: infraSpec.hosting.region,
      domains: infraSpec.hosting.domains,
    },
    database: {
      provider: infraSpec.database.provider,
      type: infraSpec.database.type,
    },
    caching: infraSpec.caching
      ? {
          provider: infraSpec.caching.provider,
          strategy: infraSpec.caching.strategy,
        }
      : null,
    cicd: {
      provider: infraSpec.cicd.provider,
      branches: infraSpec.cicd.branches,
    },
    monitoring: {
      provider: infraSpec.monitoring.provider,
      logging: infraSpec.monitoring.logging.level,
    },
    estimatedCost: infraSpec.estimatedMonthlyCost,
  };
}

const handler: ToolHandler<GetProjectArchitectureArgs> = async (args, context) => {
  const include = args.include || ['tech', 'data', 'api', 'infra', 'actors', 'use_cases'];

  // Fetch project with all related data
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

  // Extract typed data
  const techStack = data?.techStack as TechStackModel | null;
  const databaseSchema = data?.databaseSchema as DatabaseSchemaModel | null;
  const dataEntities = data?.dataEntities as DataEntity[] | null;
  const apiSpec = data?.apiSpecification as APISpecification | null;
  const infraSpec = data?.infrastructureSpec as InfrastructureSpec | null;
  const actors = data?.actors as Actor[] | null;
  const useCases = data?.useCases as UseCase[] | null;

  // Build the architecture overview
  const systemInfo = inferSystemType(techStack, useCases);

  const result: Record<string, unknown> = {
    project: {
      id: project.id,
      name: project.name,
      vision: project.vision,
      status: project.status,
      validationScore: project.validationScore,
    },
    systemType: systemInfo.type,
    systemDescription: systemInfo.description,
    completeness: data?.completeness ?? 0,
  };

  // Include requested sections
  if (include.includes('tech')) {
    result.techStack = techStack
      ? summarizeTechStack(techStack)
      : { available: false, message: 'Tech stack not defined' };
  }

  if (include.includes('data')) {
    result.dataModel = summarizeEntities(databaseSchema, dataEntities);
  }

  if (include.includes('api')) {
    result.api = apiSpec
      ? summarizeApi(apiSpec)
      : { available: false, message: 'API specification not defined' };
  }

  if (include.includes('infra')) {
    result.infrastructure = infraSpec
      ? summarizeInfra(infraSpec)
      : { available: false, message: 'Infrastructure specification not defined' };
  }

  if (include.includes('actors')) {
    result.actors =
      actors && actors.length > 0
        ? {
            count: actors.length,
            list: actors.map((a) => ({
              name: a.name,
              role: a.role,
              goalCount: a.goals?.length || 0,
            })),
          }
        : { available: false, message: 'No actors defined' };
  }

  if (include.includes('use_cases')) {
    result.useCases =
      useCases && useCases.length > 0
        ? {
            count: useCases.length,
            list: useCases.map((uc) => ({
              id: uc.id,
              name: uc.name,
              actor: uc.actor,
            })),
          }
        : { available: false, message: 'No use cases defined' };
  }

  // Add recommendations based on completeness
  const recommendations: string[] = [];
  if (!techStack) recommendations.push('Define tech stack for better context');
  if (!databaseSchema && !dataEntities) recommendations.push('Add data entities to define data model');
  if (!apiSpec) recommendations.push('Add API specification for endpoint guidance');
  if (!actors || actors.length === 0) recommendations.push('Define actors/users for use case clarity');
  if (!useCases || useCases.length === 0) recommendations.push('Add use cases to define functionality');

  if (recommendations.length > 0) {
    result.recommendations = recommendations;
  }

  return createJsonResult(result);
};

/**
 * Register the get_project_architecture tool with the MCP server
 */
export function registerGetProjectArchitecture(): void {
  registerTool(definition, handler);
}

export { definition, handler };
