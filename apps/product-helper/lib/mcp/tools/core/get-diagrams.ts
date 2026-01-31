/**
 * get_diagrams MCP Tool
 *
 * Returns Mermaid diagrams for the current project.
 * Uses existing diagram generators from lib/diagrams/generators.ts.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler, ToolContext } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  generateContextDiagram,
  generateUseCaseDiagram,
  generateClassDiagram,
  generateSystemArchitectureDiagram,
} from '@/lib/diagrams/generators';
import { renderDiagramAscii } from '@/lib/diagrams/beautiful-mermaid';
import type { Actor, UseCase, DataEntity, SystemBoundaries } from '@/lib/langchain/schemas';
import type { TechStackModel, APISpecification, InfrastructureSpec } from '@/lib/db/schema/v2-types';

type DiagramType =
  | 'context'
  | 'use_case'
  | 'class'
  | 'system_architecture'
  | 'all';

interface GetDiagramsArgs {
  type?: DiagramType;
  format?: 'mermaid' | 'json' | 'ascii';
  [key: string]: unknown;
}

interface DiagramResult {
  type: string;
  title: string;
  description: string;
  mermaid: string;
  available: boolean;
  missingData?: string[];
}

const definition: ToolDefinition = {
  name: 'get_diagrams',
  description:
    'Get Mermaid diagrams for the current project. ' +
    'Returns various diagram types including context, use case, class, and system architecture. ' +
    'Use this to visualize the system structure and workflows.',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['context', 'use_case', 'class', 'system_architecture', 'all'],
        description:
          'Diagram type to generate. Options: ' +
          'context (system boundary diagram), ' +
          'use_case (actor-use case relationships), ' +
          'class (data model/entities), ' +
          'system_architecture (tech stack layers), ' +
          'all (generate all available diagrams)',
      },
      format: {
        type: 'string',
        enum: ['mermaid', 'json', 'ascii'],
        description:
          'Output format. Options: mermaid (default, raw Mermaid syntax), ' +
          'json (structured with metadata), ' +
          'ascii (text-based diagram for terminal/CLI display)',
      },
    },
  },
};

/**
 * Check if data is available for a diagram type
 */
function checkDataAvailability(
  diagramType: DiagramType,
  data: {
    actors: Actor[] | null;
    useCases: UseCase[] | null;
    systemBoundaries: SystemBoundaries | null;
    dataEntities: DataEntity[] | null;
    techStack: TechStackModel | null;
  }
): { available: boolean; missingData: string[] } {
  const missing: string[] = [];

  switch (diagramType) {
    case 'context':
      if (!data.systemBoundaries) {
        missing.push('systemBoundaries');
      } else {
        if (data.systemBoundaries.external.length === 0) {
          missing.push('external systems');
        }
      }
      break;

    case 'use_case':
      if (!data.actors || data.actors.length === 0) {
        missing.push('actors');
      }
      if (!data.useCases || data.useCases.length === 0) {
        missing.push('useCases');
      }
      break;

    case 'class':
      if (!data.dataEntities || data.dataEntities.length === 0) {
        missing.push('dataEntities');
      }
      break;

    case 'system_architecture':
      if (!data.techStack) {
        missing.push('techStack');
      }
      break;
  }

  return {
    available: missing.length === 0,
    missingData: missing,
  };
}

/**
 * Generate a single diagram
 */
function generateDiagram(
  diagramType: DiagramType,
  projectName: string,
  data: {
    actors: Actor[] | null;
    useCases: UseCase[] | null;
    systemBoundaries: SystemBoundaries | null;
    dataEntities: DataEntity[] | null;
    techStack: TechStackModel | null;
    apiSpecification: APISpecification | null;
    infrastructureSpec: InfrastructureSpec | null;
  }
): DiagramResult {
  const availability = checkDataAvailability(diagramType, data);

  const baseResult = {
    type: diagramType,
    available: availability.available,
    missingData: availability.missingData.length > 0 ? availability.missingData : undefined,
  };

  if (!availability.available) {
    return {
      ...baseResult,
      title: getDiagramTitle(diagramType),
      description: getDiagramDescription(diagramType),
      mermaid: `graph TD\n  NoData["Missing: ${availability.missingData.join(', ')}"]`,
    };
  }

  switch (diagramType) {
    case 'context': {
      const mermaid = generateContextDiagram(
        projectName,
        data.systemBoundaries?.internal || [],
        data.systemBoundaries?.external || []
      );
      return {
        ...baseResult,
        title: 'System Context Diagram',
        description: 'Shows what is inside vs outside the system boundary',
        mermaid,
      };
    }

    case 'use_case': {
      const mermaid = generateUseCaseDiagram(
        data.actors || [],
        data.useCases || [],
        {
          systemName: projectName,
          useSystemBoundary: true,
          showActorRoles: true,
        }
      );
      return {
        ...baseResult,
        title: 'Use Case Diagram',
        description: 'Shows actors and their interactions with the system',
        mermaid,
      };
    }

    case 'class': {
      const mermaid = generateClassDiagram(data.dataEntities || []);
      return {
        ...baseResult,
        title: 'Class/Entity Diagram',
        description: 'Shows data entities with attributes and relationships',
        mermaid,
      };
    }

    case 'system_architecture': {
      const result = generateSystemArchitectureDiagram(
        data.techStack,
        data.apiSpecification,
        data.infrastructureSpec
      );
      return {
        ...baseResult,
        title: 'System Architecture Diagram',
        description: 'Shows the layered architecture and technology components',
        mermaid: result.mermaidSyntax,
      };
    }

    default:
      return {
        ...baseResult,
        title: 'Unknown Diagram',
        description: 'Unknown diagram type',
        mermaid: 'graph TD\n  Error["Unknown diagram type"]',
      };
  }
}

/**
 * Get diagram title
 */
function getDiagramTitle(type: DiagramType): string {
  const titles: Record<string, string> = {
    context: 'System Context Diagram',
    use_case: 'Use Case Diagram',
    class: 'Class/Entity Diagram',
    system_architecture: 'System Architecture Diagram',
  };
  return titles[type] || 'Diagram';
}

/**
 * Get diagram description
 */
function getDiagramDescription(type: DiagramType): string {
  const descriptions: Record<string, string> = {
    context: 'Shows what is inside vs outside the system boundary',
    use_case: 'Shows actors and their interactions with the system',
    class: 'Shows data entities with attributes and relationships',
    system_architecture: 'Shows the layered architecture and technology components',
  };
  return descriptions[type] || '';
}

const handler: ToolHandler<GetDiagramsArgs> = async (args, context) => {
  const diagramType = args.type || 'all';
  const format = args.format || 'mermaid';

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
  const diagramData = {
    actors: data?.actors as Actor[] | null,
    useCases: data?.useCases as UseCase[] | null,
    systemBoundaries: data?.systemBoundaries as SystemBoundaries | null,
    dataEntities: data?.dataEntities as DataEntity[] | null,
    techStack: data?.techStack as TechStackModel | null,
    apiSpecification: data?.apiSpecification as APISpecification | null,
    infrastructureSpec: data?.infrastructureSpec as InfrastructureSpec | null,
  };

  // Generate requested diagrams
  const diagrams: DiagramResult[] = [];

  if (diagramType === 'all') {
    const allTypes: DiagramType[] = ['context', 'use_case', 'class', 'system_architecture'];
    allTypes.forEach((type) => {
      diagrams.push(generateDiagram(type, project.name, diagramData));
    });
  } else {
    diagrams.push(generateDiagram(diagramType, project.name, diagramData));
  }

  // Format output

  // ASCII format: render as text-based diagram for terminal/CLI
  if (format === 'ascii' && diagrams.length === 1) {
    const diagram = diagrams[0];
    if (!diagram.available) {
      return createTextResult(
        `Cannot generate ${diagram.title}: missing ${diagram.missingData?.join(', ')}`,
        true
      );
    }

    try {
      const ascii = renderDiagramAscii(diagram.mermaid);
      return createTextResult(
        `${diagram.title}\n${'='.repeat(diagram.title.length)}\n\n${ascii}`
      );
    } catch (err) {
      return createTextResult(
        `Failed to render ASCII diagram: ${err instanceof Error ? err.message : 'Unknown error'}`,
        true
      );
    }
  }

  // ASCII format for 'all' type: render each diagram
  if (format === 'ascii') {
    const asciiDiagrams = diagrams
      .filter((d) => d.available)
      .map((d) => {
        try {
          const ascii = renderDiagramAscii(d.mermaid);
          return `${d.title}\n${'='.repeat(d.title.length)}\n\n${ascii}`;
        } catch {
          return `${d.title}: [Render failed]`;
        }
      });

    return createTextResult(asciiDiagrams.join('\n\n' + '-'.repeat(60) + '\n\n'));
  }

  if (format === 'mermaid' && diagrams.length === 1) {
    // Return just the Mermaid syntax for single diagram requests
    const diagram = diagrams[0];
    if (!diagram.available) {
      return createTextResult(
        `Cannot generate ${diagram.title}: missing ${diagram.missingData?.join(', ')}`,
        true
      );
    }
    return createJsonResult({
      type: diagram.type,
      title: diagram.title,
      mermaid: diagram.mermaid,
    });
  }

  // Return structured response for multiple diagrams or json format
  const availableDiagrams = diagrams.filter((d) => d.available);
  const unavailableDiagrams = diagrams.filter((d) => !d.available);

  return createJsonResult({
    projectName: project.name,
    requestedType: diagramType,
    totalRequested: diagrams.length,
    availableCount: availableDiagrams.length,
    diagrams: diagrams.map((d) => ({
      type: d.type,
      title: d.title,
      description: d.description,
      available: d.available,
      missingData: d.missingData,
      mermaid: d.mermaid,
    })),
    unavailable:
      unavailableDiagrams.length > 0
        ? unavailableDiagrams.map((d) => ({
            type: d.type,
            missingData: d.missingData,
          }))
        : undefined,
  });
};

/**
 * Register the get_diagrams tool with the MCP server
 */
export function registerGetDiagrams(): void {
  registerTool(definition, handler);
}

export { definition, handler };
