/**
 * get_coding_context MCP Tool
 *
 * Generates coding rules (MUST DO / MUST NOT DO) from:
 * - Tech stack constraints
 * - Project coding guidelines
 * - Default best practices
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler, ToolContext } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projectData } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { TechStackModel, CodingGuidelines } from '@/lib/db/schema/v2-types';

interface GetCodingContextArgs {
  category?: 'all' | 'naming' | 'patterns' | 'testing' | 'security' | 'performance';
  format?: 'rules' | 'full';
  [key: string]: unknown;
}

interface CodingRule {
  rule: string;
  reason: string;
  category: string;
  source: 'guidelines' | 'tech-stack' | 'best-practice';
}

const definition: ToolDefinition = {
  name: 'get_coding_context',
  description:
    'Get coding rules and guidelines for the current project. ' +
    'Returns MUST DO and MUST NOT DO rules based on tech stack and project guidelines. ' +
    'Use this before writing code to ensure consistency.',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['all', 'naming', 'patterns', 'testing', 'security', 'performance'],
        description:
          'Category of rules to retrieve. Options: all (default), naming, patterns, testing, security, performance',
      },
      format: {
        type: 'string',
        enum: ['rules', 'full'],
        description:
          'Output format. Options: rules (concise DO/DON\'T format), full (includes all guideline details)',
      },
    },
  },
};

/**
 * Generate default best practice rules
 */
function getDefaultRules(): { mustDo: CodingRule[]; mustNotDo: CodingRule[] } {
  const mustDo: CodingRule[] = [
    {
      rule: 'Use TypeScript strict mode',
      reason: 'Catch type errors at compile time',
      category: 'patterns',
      source: 'best-practice',
    },
    {
      rule: 'Handle all error cases explicitly',
      reason: 'Prevent silent failures and improve debugging',
      category: 'patterns',
      source: 'best-practice',
    },
    {
      rule: 'Validate all external inputs',
      reason: 'Security and data integrity',
      category: 'security',
      source: 'best-practice',
    },
    {
      rule: 'Write unit tests for business logic',
      reason: 'Ensure correctness and enable refactoring',
      category: 'testing',
      source: 'best-practice',
    },
    {
      rule: 'Use environment variables for secrets',
      reason: 'Never commit secrets to version control',
      category: 'security',
      source: 'best-practice',
    },
  ];

  const mustNotDo: CodingRule[] = [
    {
      rule: 'Use any type',
      reason: 'Defeats the purpose of TypeScript',
      category: 'patterns',
      source: 'best-practice',
    },
    {
      rule: 'Commit sensitive data',
      reason: 'Security risk - use environment variables',
      category: 'security',
      source: 'best-practice',
    },
    {
      rule: 'Ignore error handling',
      reason: 'Silent failures cause hard-to-debug issues',
      category: 'patterns',
      source: 'best-practice',
    },
    {
      rule: 'Use synchronous blocking operations in async code',
      reason: 'Blocks the event loop and degrades performance',
      category: 'performance',
      source: 'best-practice',
    },
    {
      rule: 'Store passwords in plain text',
      reason: 'Major security vulnerability - always hash passwords',
      category: 'security',
      source: 'best-practice',
    },
  ];

  return { mustDo, mustNotDo };
}

/**
 * Extract rules from tech stack constraints
 */
function extractTechStackRules(techStack: TechStackModel): { mustDo: CodingRule[]; mustNotDo: CodingRule[] } {
  const mustDo: CodingRule[] = [];
  const mustNotDo: CodingRule[] = [];

  // Add constraint-based rules
  techStack.constraints?.forEach((constraint) => {
    mustDo.push({
      rule: constraint,
      reason: 'Project constraint',
      category: 'patterns',
      source: 'tech-stack',
    });
  });

  // Add tech-specific rules based on choices
  techStack.categories?.forEach((choice) => {
    switch (choice.category) {
      case 'frontend':
        if (choice.choice.toLowerCase().includes('next')) {
          mustDo.push({
            rule: 'Use Next.js App Router for new pages',
            reason: `Using ${choice.choice} - ${choice.rationale}`,
            category: 'patterns',
            source: 'tech-stack',
          });
          mustDo.push({
            rule: 'Prefer Server Components for non-interactive content',
            reason: 'Better performance and SEO with Next.js',
            category: 'performance',
            source: 'tech-stack',
          });
        }
        if (choice.choice.toLowerCase().includes('react')) {
          mustDo.push({
            rule: 'Use functional components with hooks',
            reason: 'Modern React pattern',
            category: 'patterns',
            source: 'tech-stack',
          });
          mustNotDo.push({
            rule: 'Use class components',
            reason: 'Deprecated pattern in modern React',
            category: 'patterns',
            source: 'tech-stack',
          });
        }
        break;

      case 'database':
        if (choice.choice.toLowerCase().includes('postgres')) {
          mustDo.push({
            rule: 'Use parameterized queries',
            reason: 'Prevent SQL injection',
            category: 'security',
            source: 'tech-stack',
          });
          mustDo.push({
            rule: 'Add indexes for frequently queried columns',
            reason: 'Query performance optimization',
            category: 'performance',
            source: 'tech-stack',
          });
        }
        break;

      case 'auth':
        mustDo.push({
          rule: `Use ${choice.choice} for authentication`,
          reason: choice.rationale,
          category: 'security',
          source: 'tech-stack',
        });
        mustNotDo.push({
          rule: 'Implement custom authentication logic',
          reason: `Using ${choice.choice} - avoid reinventing the wheel`,
          category: 'security',
          source: 'tech-stack',
        });
        break;

      case 'ai-ml':
        if (choice.choice.toLowerCase().includes('langchain')) {
          mustDo.push({
            rule: 'Use structured output parsing for LLM responses',
            reason: 'Ensure type safety with AI-generated content',
            category: 'patterns',
            source: 'tech-stack',
          });
          mustDo.push({
            rule: 'Implement token counting and limits',
            reason: 'Control costs and prevent timeout errors',
            category: 'performance',
            source: 'tech-stack',
          });
        }
        break;
    }
  });

  return { mustDo, mustNotDo };
}

/**
 * Extract rules from coding guidelines
 */
function extractGuidelineRules(guidelines: CodingGuidelines): { mustDo: CodingRule[]; mustNotDo: CodingRule[] } {
  const mustDo: CodingRule[] = [];
  const mustNotDo: CodingRule[] = [];

  // Naming conventions
  if (guidelines.naming) {
    const naming = guidelines.naming;
    mustDo.push({
      rule: `Use ${naming.variables} for variables`,
      reason: 'Naming convention',
      category: 'naming',
      source: 'guidelines',
    });
    mustDo.push({
      rule: `Use ${naming.functions} for functions`,
      reason: 'Naming convention',
      category: 'naming',
      source: 'guidelines',
    });
    mustDo.push({
      rule: `Use ${naming.classes} for classes`,
      reason: 'Naming convention',
      category: 'naming',
      source: 'guidelines',
    });
    if (naming.components) {
      mustDo.push({
        rule: `Use ${naming.components} for React components`,
        reason: 'Naming convention',
        category: 'naming',
        source: 'guidelines',
      });
    }
  }

  // Design patterns
  guidelines.patterns?.forEach((pattern) => {
    mustDo.push({
      rule: `Use ${pattern.name} pattern when ${pattern.when}`,
      reason: pattern.description,
      category: 'patterns',
      source: 'guidelines',
    });
  });

  // Forbidden patterns
  guidelines.forbidden?.forEach((forbidden) => {
    mustNotDo.push({
      rule: forbidden.name,
      reason: forbidden.reason + (forbidden.alternative ? `. Alternative: ${forbidden.alternative}` : ''),
      category: 'patterns',
      source: 'guidelines',
    });
  });

  // Testing requirements
  if (guidelines.testing) {
    const testing = guidelines.testing;
    mustDo.push({
      rule: `Use ${testing.framework} for testing`,
      reason: 'Project testing framework',
      category: 'testing',
      source: 'guidelines',
    });
    if (testing.coverage.enforced) {
      mustDo.push({
        rule: `Maintain ${testing.coverage.minimum}% code coverage`,
        reason: 'Enforced coverage requirement',
        category: 'testing',
        source: 'guidelines',
      });
    }
    testing.types?.forEach((testType) => {
      if (testType.required) {
        mustDo.push({
          rule: `Write ${testType.type} tests`,
          reason: `Required test type${testType.coverage ? ` with ${testType.coverage}% coverage` : ''}`,
          category: 'testing',
          source: 'guidelines',
        });
      }
    });
  }

  // Documentation
  if (guidelines.documentation?.codeComments) {
    if (guidelines.documentation.codeComments.required !== 'none') {
      mustDo.push({
        rule: `Add ${guidelines.documentation.codeComments.style} comments for ${guidelines.documentation.codeComments.required}`,
        reason: 'Documentation requirement',
        category: 'patterns',
        source: 'guidelines',
      });
    }
  }

  // Linting
  if (guidelines.linting) {
    mustDo.push({
      rule: `Use ${guidelines.linting.tool} for linting`,
      reason: 'Code quality',
      category: 'patterns',
      source: 'guidelines',
    });
    if (guidelines.linting.formatOnSave && guidelines.linting.formatter) {
      mustDo.push({
        rule: `Format code with ${guidelines.linting.formatter} on save`,
        reason: 'Consistent formatting',
        category: 'patterns',
        source: 'guidelines',
      });
    }
  }

  return { mustDo, mustNotDo };
}

const handler: ToolHandler<GetCodingContextArgs> = async (args, context) => {
  const categoryFilter = args.category || 'all';
  const format = args.format || 'rules';

  // Fetch project data
  const data = await db.query.projectData.findFirst({
    where: eq(projectData.projectId, context.projectId),
  });

  // Start with default rules
  const defaultRules = getDefaultRules();
  let allMustDo = [...defaultRules.mustDo];
  let allMustNotDo = [...defaultRules.mustNotDo];

  // Add tech stack rules if available
  const techStack = data?.techStack as TechStackModel | null;
  if (techStack) {
    const techRules = extractTechStackRules(techStack);
    allMustDo = [...allMustDo, ...techRules.mustDo];
    allMustNotDo = [...allMustNotDo, ...techRules.mustNotDo];
  }

  // Add coding guidelines rules if available
  const guidelines = data?.codingGuidelines as CodingGuidelines | null;
  if (guidelines) {
    const guidelineRules = extractGuidelineRules(guidelines);
    allMustDo = [...allMustDo, ...guidelineRules.mustDo];
    allMustNotDo = [...allMustNotDo, ...guidelineRules.mustNotDo];
  }

  // Filter by category
  if (categoryFilter !== 'all') {
    allMustDo = allMustDo.filter((r) => r.category === categoryFilter);
    allMustNotDo = allMustNotDo.filter((r) => r.category === categoryFilter);
  }

  // Deduplicate rules
  const seenMustDo = new Set<string>();
  allMustDo = allMustDo.filter((r) => {
    if (seenMustDo.has(r.rule)) return false;
    seenMustDo.add(r.rule);
    return true;
  });

  const seenMustNotDo = new Set<string>();
  allMustNotDo = allMustNotDo.filter((r) => {
    if (seenMustNotDo.has(r.rule)) return false;
    seenMustNotDo.add(r.rule);
    return true;
  });

  // Format output
  if (format === 'rules') {
    return createJsonResult({
      projectHasGuidelines: !!guidelines,
      projectHasTechStack: !!techStack,
      category: categoryFilter,
      mustDo: allMustDo.map((r) => `${r.rule} (${r.reason})`),
      mustNotDo: allMustNotDo.map((r) => `${r.rule} (${r.reason})`),
    });
  }

  // Full format with all details
  return createJsonResult({
    projectHasGuidelines: !!guidelines,
    projectHasTechStack: !!techStack,
    category: categoryFilter,
    mustDo: allMustDo,
    mustNotDo: allMustNotDo,
    ...(guidelines && {
      fullGuidelines: {
        naming: guidelines.naming,
        patterns: guidelines.patterns,
        forbidden: guidelines.forbidden,
        linting: guidelines.linting,
        testing: guidelines.testing,
        documentation: guidelines.documentation,
        imports: guidelines.imports,
        commits: guidelines.commits,
      },
    }),
  });
};

/**
 * Register the get_coding_context tool with the MCP server
 */
export function registerGetCodingContext(): void {
  registerTool(definition, handler);
}

export { definition, handler };
