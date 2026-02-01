/**
 * get_coding_guidelines MCP Tool
 *
 * Returns coding guidelines from the project's coding guidelines spec.
 * Can return full guidelines or specific sections (naming, patterns, testing, etc.).
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projectData } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { CodingGuidelines } from '@/lib/db/schema/v2-types';

type GuidelineSection =
  | 'full'
  | 'naming'
  | 'patterns'
  | 'forbidden'
  | 'linting'
  | 'testing'
  | 'documentation';

interface GetCodingGuidelinesArgs {
  section?: GuidelineSection;
  [key: string]: unknown;
}

const definition: ToolDefinition = {
  name: 'get_coding_guidelines',
  description:
    'Get coding guidelines and conventions for the current project. ' +
    'Returns naming conventions, design patterns, forbidden patterns, linting rules, testing strategy, and documentation standards. ' +
    'Use this when writing code to ensure consistency with project standards.',
  inputSchema: {
    type: 'object',
    properties: {
      section: {
        type: 'string',
        enum: ['full', 'naming', 'patterns', 'forbidden', 'linting', 'testing', 'documentation'],
        description:
          'Section to retrieve. Options: ' +
          'full (default, complete guidelines), ' +
          'naming (naming conventions for variables, functions, classes, etc.), ' +
          'patterns (recommended design patterns), ' +
          'forbidden (anti-patterns to avoid), ' +
          'linting (ESLint/linter configuration), ' +
          'testing (testing strategy and requirements), ' +
          'documentation (documentation standards)',
      },
    },
  },
};

const handler: ToolHandler<GetCodingGuidelinesArgs> = async (args, context) => {
  const section = args.section || 'full';

  // Fetch project data
  const data = await db.query.projectData.findFirst({
    where: eq(projectData.projectId, context.projectId),
  });

  if (!data) {
    return createTextResult(`No project data found for project ID ${context.projectId}`, true);
  }

  if (!data.codingGuidelines) {
    return createTextResult(
      'Coding guidelines not yet generated. Run the guidelines generator first.',
      true
    );
  }

  const guidelines = data.codingGuidelines as CodingGuidelines;

  switch (section) {
    case 'naming': {
      return createJsonResult({
        naming: guidelines.naming,
        imports: guidelines.imports,
      });
    }

    case 'patterns': {
      return createJsonResult({
        patterns: guidelines.patterns,
        patternCount: guidelines.patterns?.length ?? 0,
      });
    }

    case 'forbidden': {
      return createJsonResult({
        forbidden: guidelines.forbidden,
        forbiddenCount: guidelines.forbidden?.length ?? 0,
      });
    }

    case 'linting': {
      return createJsonResult({
        linting: guidelines.linting,
      });
    }

    case 'testing': {
      return createJsonResult({
        testing: guidelines.testing,
      });
    }

    case 'documentation': {
      return createJsonResult({
        documentation: guidelines.documentation,
      });
    }

    case 'full':
    default: {
      return createJsonResult({
        guidelines,
        summary: {
          patternCount: guidelines.patterns?.length ?? 0,
          forbiddenCount: guidelines.forbidden?.length ?? 0,
          testFramework: guidelines.testing?.framework,
          lintTool: guidelines.linting?.tool,
          generatedAt: guidelines.generatedAt,
        },
      });
    }
  }
};

export function registerGetCodingGuidelines(): void {
  registerTool(definition, handler);
}

export { definition, handler };
