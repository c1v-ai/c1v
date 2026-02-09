/**
 * Tech Stack Recommendation Agent (Phase 9.3)
 *
 * Purpose: Recommend technology choices based on project context
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * Uses Claude Sonnet via central config for consistent but slightly
 * creative tech recommendations. Analyzes project vision, use cases,
 * and data entities to recommend an appropriate tech stack.
 */

import { createClaudeAgent } from '../config';
import { z } from 'zod';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  techCategorySchema,
  techAlternativeSchema,
  techChoiceSchema,
  techStackModelSchema,
} from '../../db/schema/v2-validators';
import type { TechStackModel, TechChoice, TechCategory } from '../../db/schema/v2-types';
import { getTechStackKnowledge } from '../../education/generator-kb';

// ============================================================
// Context Interface
// ============================================================

/**
 * Context provided to the tech stack recommendation agent
 */
export interface TechStackContext {
  projectName: string;
  projectVision: string;
  useCases: Array<{ name: string; description: string }>;
  dataEntities: Array<{ name: string }>;
  constraints?: string[];
  preferences?: string[];
}

// ============================================================
// LLM Configuration
// ============================================================

/**
 * Structured output LLM with Zod schema validation
 * Uses Claude Sonnet via central config
 * Temperature: 0.3 for consistent but slightly creative suggestions
 */
const structuredTechStackLLM = createClaudeAgent(techStackModelSchema, 'recommend_tech_stack', {
  temperature: 0.3,
});

// ============================================================
// Prompt Template
// ============================================================

const techStackPrompt = PromptTemplate.fromTemplate(`
You are a senior software architect recommending a technology stack for a new project.
Analyze the project requirements and provide well-reasoned technology choices.

${getTechStackKnowledge()}

## Project Context
**Name:** {projectName}
**Vision:** {projectVision}

## Use Cases
{useCasesFormatted}

## Data Entities
{dataEntitiesFormatted}

## Constraints
{constraintsFormatted}

## Preferences
{preferencesFormatted}

## Instructions

Use the Knowledge Bank above as your primary reference for current (February 2026) technology recommendations.
Match the project type to the recommended stacks, then customize based on specific constraints and preferences.

Recommend technologies for the following REQUIRED categories:
1. **frontend** - UI framework and libraries
2. **backend** - Server framework and runtime
3. **database** - Primary data store
4. **auth** - Authentication/authorization solution
5. **hosting** - Cloud platform and deployment
6. **testing** - Testing frameworks and tools

Also consider these OPTIONAL categories if relevant to the project:
- **cache** - If high-performance caching is needed
- **queue** - If async job processing is needed
- **monitoring** - For observability and logging
- **ci-cd** - For deployment pipelines
- **payments** - If handling transactions
- **email** - If sending transactional emails
- **storage** - If handling file uploads
- **ai-ml** - If AI/ML features are needed
- **search** - If full-text search is needed
- **analytics** - If user analytics are needed

For EACH technology choice, provide:
1. **choice** - The recommended technology (e.g., "Next.js 16", "PostgreSQL 18")
2. **version** - Recommended version using current 2026 versions
3. **rationale** - WHY this technology fits the project (2-3 sentences)
4. **alternatives** - 1-2 alternatives with "whyNot" explanations
5. **documentation** - Official docs URL (optional)
6. **license** - License type (e.g., "MIT", "Apache-2.0")

Also provide:
- **Overall rationale** - How the stack works together as a cohesive whole
- **Estimated monthly cost** - Infrastructure cost estimate for production (use Knowledge Bank cost data)
- **Scalability notes** - How the stack handles growth
`);

// ============================================================
// Main Function
// ============================================================

/**
 * Recommend a tech stack based on project context
 *
 * @param context - Project context including vision, use cases, and entities
 * @returns TechStackModel with validated recommendations
 */
export async function recommendTechStack(
  context: TechStackContext
): Promise<TechStackModel> {
  try {
    // Format use cases for prompt
    const useCasesFormatted = context.useCases.length > 0
      ? context.useCases
          .map((uc, i) => `${i + 1}. **${uc.name}**: ${uc.description}`)
          .join('\n')
      : 'No use cases provided';

    // Format data entities for prompt
    const dataEntitiesFormatted = context.dataEntities.length > 0
      ? context.dataEntities.map(e => `- ${e.name}`).join('\n')
      : 'No data entities provided';

    // Format constraints for prompt
    const constraintsFormatted = context.constraints && context.constraints.length > 0
      ? context.constraints.map(c => `- ${c}`).join('\n')
      : 'No specific constraints';

    // Format preferences for prompt
    const preferencesFormatted = context.preferences && context.preferences.length > 0
      ? context.preferences.map(p => `- ${p}`).join('\n')
      : 'No specific preferences';

    // Build prompt
    const promptText = await techStackPrompt.format({
      projectName: context.projectName,
      projectVision: context.projectVision,
      useCasesFormatted,
      dataEntitiesFormatted,
      constraintsFormatted,
      preferencesFormatted,
    });

    // Invoke structured LLM
    const result = await structuredTechStackLLM.invoke(promptText);

    // Add generation timestamp
    return {
      ...result,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Tech stack recommendation error:', error);

    // Return a minimal fallback stack on failure
    return getDefaultTechStack(context.projectName);
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get a default tech stack when LLM call fails
 * Provides a sensible modern web stack as fallback
 */
function getDefaultTechStack(projectName: string): TechStackModel {
  return {
    categories: [
      {
        category: 'frontend',
        choice: 'Next.js',
        version: '16.x',
        rationale: 'Full-stack React framework with React Compiler, RSC, and the largest ecosystem',
        alternatives: [
          { name: 'TanStack Start', whyNot: 'Newer, smaller ecosystem but 30-35% smaller bundles' },
          { name: 'SvelteKit 5', whyNot: 'Different paradigm, smaller community' },
        ],
        documentation: 'https://nextjs.org/docs',
        license: 'MIT',
      },
      {
        category: 'backend',
        choice: 'Next.js API Routes + tRPC',
        version: '16.x',
        rationale: 'Unified framework with end-to-end type safety via tRPC for internal APIs',
        alternatives: [
          { name: 'Hono', whyNot: 'Better for edge/standalone APIs, separate deployment' },
          { name: 'Fastify', whyNot: 'Separate deployment, more infrastructure' },
        ],
        documentation: 'https://nextjs.org/docs',
        license: 'MIT',
      },
      {
        category: 'database',
        choice: 'PostgreSQL',
        version: '18',
        rationale: 'Most popular database (55.6% adoption), native UUIDv7, async I/O with 3x performance',
        alternatives: [
          { name: 'MySQL', whyNot: 'PostgreSQL has better JSON, vector, and extension support' },
          { name: 'MongoDB', whyNot: 'Relational model better fits structured data with ACID guarantees' },
        ],
        documentation: 'https://www.postgresql.org/docs/',
        license: 'PostgreSQL License',
      },
      {
        category: 'auth',
        choice: 'Better Auth',
        version: 'latest',
        rationale: 'Framework-agnostic, data in YOUR database, MIT licensed, 15k+ GitHub stars',
        alternatives: [
          { name: 'Clerk', whyNot: 'Managed service adds cost but provides pre-built UI and SOC2 compliance' },
          { name: 'Auth.js', whyNot: 'More community maturity but fewer features than Better Auth' },
        ],
        documentation: 'https://www.better-auth.com/',
        license: 'MIT',
      },
      {
        category: 'hosting',
        choice: 'Vercel',
        version: 'latest',
        rationale: 'Optimal for Next.js with edge functions and automatic scaling',
        alternatives: [
          { name: 'AWS Amplify', whyNot: 'More complex configuration' },
          { name: 'Railway', whyNot: 'Less Next.js optimization' },
        ],
        documentation: 'https://vercel.com/docs',
        license: 'Proprietary',
      },
      {
        category: 'testing',
        choice: 'Vitest + Playwright',
        version: 'latest',
        rationale: 'Fast unit tests with Vitest, reliable E2E with Playwright',
        alternatives: [
          { name: 'Jest + Cypress', whyNot: 'Slower test execution' },
        ],
        documentation: 'https://vitest.dev/',
        license: 'MIT',
      },
    ],
    constraints: [],
    rationale: `Default modern web stack recommended for ${projectName}. This stack provides excellent developer experience, performance, and scalability for most web applications.`,
    estimatedCost: '$20-100/month for small to medium traffic',
    scalability: 'Vercel handles auto-scaling; PostgreSQL can be upgraded as needed',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Validate a tech stack model against the schema
 */
export function validateTechStack(data: unknown): TechStackModel | null {
  const result = techStackModelSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error('Tech stack validation failed:', result.error);
  return null;
}

/**
 * Get choices for a specific category from a tech stack
 */
export function getTechChoiceByCategory(
  techStack: TechStackModel,
  category: TechCategory
): TechChoice | undefined {
  return techStack.categories.find(c => c.category === category);
}

/**
 * Check if all required categories are present in a tech stack
 */
export function hasRequiredCategories(techStack: TechStackModel): boolean {
  const requiredCategories: TechCategory[] = [
    'frontend',
    'backend',
    'database',
    'auth',
    'hosting',
    'testing',
  ];

  const presentCategories = new Set(techStack.categories.map(c => c.category));
  return requiredCategories.every(cat => presentCategories.has(cat));
}

/**
 * Merge user preferences into an existing tech stack
 * Useful for updating recommendations with new constraints
 */
export function mergeTechStackPreferences(
  existing: TechStackModel,
  newConstraints?: string[],
  newCategories?: TechChoice[]
): TechStackModel {
  const categoryMap = new Map(existing.categories.map(c => [c.category, c]));

  // Override with new categories
  if (newCategories) {
    for (const newChoice of newCategories) {
      categoryMap.set(newChoice.category, newChoice);
    }
  }

  return {
    ...existing,
    categories: Array.from(categoryMap.values()),
    constraints: [
      ...existing.constraints,
      ...(newConstraints || []),
    ],
    generatedAt: new Date().toISOString(),
  };
}
