/**
 * get_infrastructure MCP Tool
 *
 * Returns infrastructure configuration from the project's infrastructure spec.
 * Can return full config or specific sections (hosting, database, caching, etc.).
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projectData } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { InfrastructureSpec } from '@/lib/db/schema/v2-types';

type InfraSection = 'full' | 'hosting' | 'database' | 'caching' | 'cicd' | 'monitoring' | 'security';

interface GetInfrastructureArgs {
  section?: InfraSection;
  [key: string]: unknown;
}

const definition: ToolDefinition = {
  name: 'get_infrastructure',
  description:
    'Get infrastructure configuration for the current project. ' +
    'Returns hosting, database, caching, CI/CD, monitoring, and security configuration. ' +
    'Use this to understand deployment requirements, environment setup, and DevOps configuration.',
  inputSchema: {
    type: 'object',
    properties: {
      section: {
        type: 'string',
        enum: ['full', 'hosting', 'database', 'caching', 'cicd', 'monitoring', 'security'],
        description:
          'Section to retrieve. Options: ' +
          'full (default, entire infrastructure spec), ' +
          'hosting (hosting provider and config), ' +
          'database (database infrastructure), ' +
          'caching (cache configuration), ' +
          'cicd (CI/CD pipeline setup), ' +
          'monitoring (observability and logging), ' +
          'security (security configuration)',
      },
    },
  },
};

const handler: ToolHandler<GetInfrastructureArgs> = async (args, context) => {
  const section = args.section || 'full';

  // Fetch project data
  const data = await db.query.projectData.findFirst({
    where: eq(projectData.projectId, context.projectId),
  });

  if (!data) {
    return createTextResult(`No project data found for project ID ${context.projectId}`, true);
  }

  if (!data.infrastructureSpec) {
    return createTextResult(
      'Infrastructure specification not yet generated. Run the infrastructure generator first.',
      true
    );
  }

  const infraSpec = data.infrastructureSpec as InfrastructureSpec;

  switch (section) {
    case 'hosting': {
      return createJsonResult({
        hosting: infraSpec.hosting,
        estimatedCost: infraSpec.estimatedMonthlyCost,
      });
    }

    case 'database': {
      return createJsonResult({
        database: infraSpec.database,
      });
    }

    case 'caching': {
      if (!infraSpec.caching) {
        return createTextResult('No caching configuration defined for this project.');
      }
      return createJsonResult({
        caching: infraSpec.caching,
      });
    }

    case 'cicd': {
      return createJsonResult({
        cicd: infraSpec.cicd,
      });
    }

    case 'monitoring': {
      return createJsonResult({
        monitoring: infraSpec.monitoring,
      });
    }

    case 'security': {
      return createJsonResult({
        security: infraSpec.security,
      });
    }

    case 'full':
    default: {
      return createJsonResult({
        infrastructure: infraSpec,
        summary: {
          hostingProvider: infraSpec.hosting?.provider,
          databaseProvider: infraSpec.database?.provider,
          cacheProvider: infraSpec.caching?.provider || 'none',
          cicdProvider: infraSpec.cicd?.provider,
          monitoringProvider: infraSpec.monitoring?.provider,
          estimatedMonthlyCost: infraSpec.estimatedMonthlyCost,
          generatedAt: infraSpec.generatedAt,
        },
      });
    }
  }
};

export function registerGetInfrastructure(): void {
  registerTool(definition, handler);
}

export { definition, handler };
