/**
 * get_tech_stack MCP Tool
 *
 * Returns the technology stack choices with rationales.
 * Queries project_data.tech_stack JSONB column.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler, ToolContext } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projectData } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { TechStackModel, TechCategory } from '@/lib/db/schema/v2-types';

interface GetTechStackArgs {
  category?: TechCategory;
  include_alternatives?: boolean;
  [key: string]: unknown;
}

const definition: ToolDefinition = {
  name: 'get_tech_stack',
  description:
    'Get the technology stack for the current project. ' +
    'Returns chosen technologies with rationales and considered alternatives. ' +
    'Use this to understand what technologies to use and why.',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: [
          'frontend',
          'backend',
          'database',
          'auth',
          'hosting',
          'cache',
          'queue',
          'monitoring',
          'testing',
          'ci-cd',
          'container',
          'cdn',
          'email',
          'payments',
          'analytics',
          'search',
          'storage',
          'ai-ml',
          'other',
        ],
        description:
          'Optional: filter by technology category. If not provided, returns all categories.',
      },
      include_alternatives: {
        type: 'boolean',
        description:
          'Include considered alternatives for each choice. Default: true',
      },
    },
  },
};

const handler: ToolHandler<GetTechStackArgs> = async (args, context) => {
  const categoryFilter = args.category;
  const includeAlternatives = args.include_alternatives !== false;

  // Fetch project data
  const data = await db.query.projectData.findFirst({
    where: eq(projectData.projectId, context.projectId),
  });

  if (!data) {
    return createTextResult(`No project data found for project ID ${context.projectId}`, true);
  }

  const techStack = data.techStack as TechStackModel | null;

  if (!techStack || !techStack.categories || techStack.categories.length === 0) {
    return createTextResult(
      'No tech stack defined for this project. ' +
        'The PRD may need more details about technology requirements.',
      true
    );
  }

  // Filter by category if specified
  let choices = techStack.categories;
  if (categoryFilter) {
    choices = choices.filter((c) => c.category === categoryFilter);

    if (choices.length === 0) {
      const availableCategories = [...new Set(techStack.categories.map((c) => c.category))];
      return createTextResult(
        `Category "${categoryFilter}" not found. Available categories: ${availableCategories.join(', ')}`,
        true
      );
    }
  }

  // Format the response
  const formattedChoices = choices.map((choice) => {
    const base = {
      category: choice.category,
      choice: choice.choice,
      version: choice.version,
      rationale: choice.rationale,
      documentation: choice.documentation,
      license: choice.license,
    };

    if (includeAlternatives && choice.alternatives?.length > 0) {
      return {
        ...base,
        alternatives: choice.alternatives,
      };
    }

    return base;
  });

  // Group by category for better readability
  const groupedByCategory: Record<string, typeof formattedChoices> = {};
  formattedChoices.forEach((choice) => {
    if (!groupedByCategory[choice.category]) {
      groupedByCategory[choice.category] = [];
    }
    groupedByCategory[choice.category].push(choice);
  });

  return createJsonResult({
    overallRationale: techStack.rationale,
    constraints: techStack.constraints,
    estimatedCost: techStack.estimatedCost,
    scalability: techStack.scalability,
    generatedAt: techStack.generatedAt,
    categoryCount: Object.keys(groupedByCategory).length,
    choiceCount: formattedChoices.length,
    categories: groupedByCategory,
  });
};

/**
 * Register the get_tech_stack tool with the MCP server
 */
export function registerGetTechStack(): void {
  registerTool(definition, handler);
}

export { definition, handler };
