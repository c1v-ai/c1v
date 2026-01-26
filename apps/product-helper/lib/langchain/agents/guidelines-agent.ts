/**
 * Coding Guidelines Agent (Phase 10.3)
 *
 * Purpose: Generate coding guidelines based on tech stack and team preferences
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * Uses Claude Sonnet via central config for consistent, opinionated
 * coding guidelines. Analyzes the project's tech stack and team context
 * to generate appropriate conventions, patterns, and tooling configurations.
 */

import { createClaudeAgent } from '../config';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  codingGuidelinesSchema,
} from '../../db/schema/v2-validators';
import type {
  CodingGuidelines,
  TechStackModel,
  NamingStyle,
} from '../../db/schema/v2-types';

// ============================================================
// Context Interface
// ============================================================

/**
 * Context provided to the coding guidelines agent
 */
export interface GuidelinesContext {
  projectName: string;
  techStack: TechStackModel;
  teamSize?: 'solo' | 'small' | 'medium' | 'large';
  experienceLevel?: 'junior' | 'mixed' | 'senior';
  projectType?: 'startup' | 'enterprise' | 'open-source' | 'internal-tool';
  preferences?: {
    paradigm?: 'functional' | 'oop' | 'mixed';
    strictness?: 'relaxed' | 'moderate' | 'strict';
    testCoverage?: number;
    commitStyle?: 'conventional' | 'gitmoji' | 'custom';
  };
}

// ============================================================
// LLM Configuration
// ============================================================

/**
 * Structured output LLM with Zod schema validation
 * Uses Claude Sonnet via central config
 * Temperature: 0.2 for very consistent, opinionated output
 */
const structuredGuidelinesLLM = createClaudeAgent(codingGuidelinesSchema, 'generate_coding_guidelines', {
  temperature: 0.2,
  maxTokens: 5000,
});

// ============================================================
// Prompt Template
// ============================================================

const guidelinesPrompt = PromptTemplate.fromTemplate(`
You are a senior software architect creating coding guidelines for a development team.
Generate comprehensive, practical guidelines tailored to the project's tech stack and team context.

## Project Context
**Name:** {projectName}
**Team Size:** {teamSize}
**Experience Level:** {experienceLevel}
**Project Type:** {projectType}

## Tech Stack
{techStackFormatted}

## Team Preferences
{preferencesFormatted}

## Instructions

Generate comprehensive coding guidelines covering all the following areas:

### 1. Naming Conventions
Define naming styles for:
- **variables**: Variable naming (e.g., camelCase)
- **functions**: Function naming (e.g., camelCase)
- **classes**: Class naming (e.g., PascalCase)
- **constants**: Constant naming (e.g., SCREAMING_SNAKE_CASE)
- **files**: File naming (e.g., kebab-case or PascalCase for components)
- **directories**: Directory naming
- **components**: React/Vue component naming (if applicable)
- **hooks**: React hook naming (if applicable)
- **types**: TypeScript type naming (if applicable)
- **interfaces**: TypeScript interface naming (if applicable)
- **enums**: Enum naming (if applicable)
- **database.tables**: Database table naming
- **database.columns**: Database column naming

Use only these values: "camelCase", "PascalCase", "snake_case", "SCREAMING_SNAKE_CASE", "kebab-case"

### 2. Design Patterns (3-5 patterns)
For each pattern, provide:
- **name**: Pattern name (e.g., "Repository Pattern")
- **description**: What the pattern does (1-2 sentences)
- **when**: When to use it
- **example**: Brief code example or usage scenario

### 3. Forbidden Patterns (3-5 anti-patterns)
For each forbidden pattern, provide:
- **name**: Pattern name (e.g., "any type", "God class")
- **reason**: Why it's forbidden
- **alternative**: What to use instead
- **lintRule**: ESLint/Biome rule that catches this (optional)

### 4. Linting Configuration
- **tool**: "eslint" | "biome" | "oxlint"
- **extends**: Array of config presets to extend
- **rules**: 5-10 important rules with level (off/warn/error)
- **ignorePatterns**: Files/dirs to ignore
- **formatOnSave**: true/false
- **formatter**: "prettier" | "biome" | "dprint" | "none"

### 5. Testing Strategy
- **framework**: "vitest" | "jest" | "mocha"
- **coverage.minimum**: Minimum coverage percentage (60-90)
- **coverage.enforced**: Whether to fail builds on low coverage
- **coverage.excludePatterns**: Patterns to exclude from coverage
- **types**: Array of test types, each with type, required flag, coverage, and tools
- **patterns**: File location preferences and naming conventions
- **ci**: Run on push, PR, parallelization settings

### 6. Documentation Strategy
- **codeComments.style**: "jsdoc" | "tsdoc"
- **codeComments.required**: "all-public" | "complex-only" | "none"
- **apiDocs**: API documentation tool and auto-generation settings
- **readme**: Required sections for README files
- **changelog**: Changelog format settings
- **adr**: Architecture Decision Records settings (optional)

### 7. Import Configuration (optional but recommended)
- **style**: "absolute" | "relative" | "aliases"
- **aliases**: Path aliases mapping (e.g., {"@/*": "./src/*"})
- **sortOrder**: Import sort order preferences

### 8. Commit Conventions (optional but recommended)
- **style**: "conventional" | "gitmoji" | "custom"
- **enforced**: Whether to enforce with hooks
- **scopes**: Valid commit scopes for the project

Consider these factors when generating guidelines:
- Tech stack compatibility (e.g., TypeScript strict mode for TS projects)
- Team size and experience (stricter for larger/junior teams)
- Project type (enterprise needs more documentation, startups need flexibility)
- Modern best practices for 2024-2025
- Developer experience and productivity
`);

// ============================================================
// Main Function
// ============================================================

/**
 * Generate coding guidelines based on project context
 *
 * @param context - Project context including tech stack and team preferences
 * @returns CodingGuidelines with validated configuration
 */
export async function generateCodingGuidelines(
  context: GuidelinesContext
): Promise<CodingGuidelines> {
  try {
    // Format tech stack for prompt
    const techStackFormatted = context.techStack.categories
      .map(tc => `- **${tc.category}**: ${tc.choice}${tc.version ? ` (${tc.version})` : ''}`)
      .join('\n');

    // Format preferences for prompt
    const preferencesFormatted = context.preferences
      ? Object.entries(context.preferences)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `- **${key}**: ${value}`)
          .join('\n')
      : 'No specific preferences';

    // Build prompt
    const promptText = await guidelinesPrompt.format({
      projectName: context.projectName,
      teamSize: context.teamSize || 'small',
      experienceLevel: context.experienceLevel || 'mixed',
      projectType: context.projectType || 'startup',
      techStackFormatted,
      preferencesFormatted,
    });

    // Invoke structured LLM
    const result = await structuredGuidelinesLLM.invoke(promptText);

    // Add generation timestamp
    return {
      ...result,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Coding guidelines generation error:', error);

    // Return default guidelines based on tech stack
    return getDefaultGuidelines(context);
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get default coding guidelines when LLM call fails
 * Provides sensible defaults based on modern TypeScript/React practices
 */
function getDefaultGuidelines(context: GuidelinesContext): CodingGuidelines {
  const isTypeScript = context.techStack.categories.some(
    tc => tc.choice.toLowerCase().includes('typescript') ||
          tc.choice.toLowerCase().includes('next') ||
          tc.choice.toLowerCase().includes('react')
  );

  const isReact = context.techStack.categories.some(
    tc => tc.choice.toLowerCase().includes('react') ||
          tc.choice.toLowerCase().includes('next')
  );

  return {
    naming: {
      variables: 'camelCase',
      functions: 'camelCase',
      classes: 'PascalCase',
      constants: 'SCREAMING_SNAKE_CASE',
      files: isReact ? 'kebab-case' : 'kebab-case',
      directories: 'kebab-case',
      ...(isReact && {
        components: 'PascalCase' as NamingStyle,
        hooks: 'camelCase' as NamingStyle,
      }),
      ...(isTypeScript && {
        types: 'PascalCase' as NamingStyle,
        interfaces: 'PascalCase' as NamingStyle,
        enums: 'PascalCase' as NamingStyle,
      }),
      database: {
        tables: 'snake_case',
        columns: 'snake_case',
      },
    },
    patterns: [
      {
        name: 'Repository Pattern',
        description: 'Abstract data access logic behind a repository interface',
        when: 'When accessing databases or external APIs',
        example: 'const userRepo = new UserRepository(db); await userRepo.findById(id);',
      },
      {
        name: 'Factory Pattern',
        description: 'Create objects without specifying exact class',
        when: 'When object creation is complex or varies by context',
        example: 'const notification = NotificationFactory.create(type, data);',
      },
      {
        name: 'Composition over Inheritance',
        description: 'Build complex functionality by combining simpler pieces',
        when: 'Always prefer composition when designing components or classes',
        example: 'const EnhancedComponent = withAuth(withLogging(BaseComponent));',
      },
    ],
    forbidden: [
      {
        name: 'any type',
        reason: 'Defeats the purpose of TypeScript type safety',
        alternative: 'Use unknown, generics, or proper type definitions',
        lintRule: '@typescript-eslint/no-explicit-any',
      },
      {
        name: 'console.log in production',
        reason: 'Clutters logs and may leak sensitive information',
        alternative: 'Use structured logging with proper log levels',
        lintRule: 'no-console',
      },
      {
        name: 'Magic numbers',
        reason: 'Makes code hard to understand and maintain',
        alternative: 'Use named constants with descriptive names',
        lintRule: 'no-magic-numbers',
      },
    ],
    linting: {
      tool: 'eslint',
      extends: [
        'eslint:recommended',
        ...(isTypeScript ? ['plugin:@typescript-eslint/recommended'] : []),
        ...(isReact ? ['plugin:react/recommended', 'plugin:react-hooks/recommended'] : []),
      ],
      rules: [
        { name: 'no-unused-vars', level: 'error' },
        { name: 'no-console', level: 'warn' },
        { name: 'prefer-const', level: 'error' },
        { name: 'eqeqeq', level: 'error', options: ['always'] },
        ...(isTypeScript ? [
          { name: '@typescript-eslint/no-explicit-any', level: 'error' as const },
          { name: '@typescript-eslint/explicit-function-return-type', level: 'warn' as const },
        ] : []),
      ],
      ignorePatterns: ['node_modules/', 'dist/', '.next/', 'coverage/'],
      formatOnSave: true,
      formatter: 'prettier',
    },
    testing: {
      framework: 'vitest',
      coverage: {
        minimum: context.projectType === 'enterprise' ? 80 : 70,
        enforced: context.projectType === 'enterprise',
        excludePatterns: ['**/*.d.ts', '**/types/**', '**/mocks/**'],
      },
      types: [
        { type: 'unit', required: true, coverage: 80, tools: ['vitest'] },
        { type: 'integration', required: true, coverage: 60, tools: ['vitest'] },
        { type: 'e2e', required: false, tools: ['playwright'] },
      ],
      patterns: {
        unitTestLocation: 'co-located',
        testFileSuffix: '.test.ts',
        mockNaming: '__mocks__',
      },
      ci: {
        runOnPush: true,
        runOnPr: true,
        parallelization: true,
      },
    },
    documentation: {
      codeComments: {
        style: isTypeScript ? 'tsdoc' : 'jsdoc',
        required: context.projectType === 'enterprise' ? 'all-public' : 'complex-only',
      },
      apiDocs: {
        tool: 'swagger',
        autoGenerate: true,
      },
      readme: {
        required: true,
        sections: ['Overview', 'Installation', 'Usage', 'API Reference', 'Contributing'],
      },
      changelog: {
        enabled: true,
        format: 'conventional',
      },
    },
    imports: {
      style: 'aliases',
      aliases: {
        '@/*': './src/*',
        '@/components/*': './src/components/*',
        '@/lib/*': './src/lib/*',
        '@/utils/*': './src/utils/*',
      },
      sortOrder: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    },
    commits: {
      style: 'conventional',
      enforced: context.projectType === 'enterprise',
      scopes: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Validate coding guidelines against the schema
 */
export function validateCodingGuidelines(data: unknown): CodingGuidelines | null {
  const result = codingGuidelinesSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error('Coding guidelines validation failed:', result.error);
  return null;
}

/**
 * Merge user preferences into existing guidelines
 */
export function mergeGuidelinesPreferences(
  existing: CodingGuidelines,
  updates: Partial<CodingGuidelines>
): CodingGuidelines {
  return {
    ...existing,
    ...updates,
    naming: {
      ...existing.naming,
      ...(updates.naming || {}),
    },
    patterns: updates.patterns || existing.patterns,
    forbidden: updates.forbidden || existing.forbidden,
    linting: {
      ...existing.linting,
      ...(updates.linting || {}),
    },
    testing: {
      ...existing.testing,
      ...(updates.testing || {}),
    },
    documentation: {
      ...existing.documentation,
      ...(updates.documentation || {}),
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Check if guidelines are complete (have all required sections)
 */
export function hasCompleteGuidelines(guidelines: CodingGuidelines): boolean {
  return !!(
    guidelines.naming &&
    guidelines.patterns.length > 0 &&
    guidelines.forbidden.length > 0 &&
    guidelines.linting &&
    guidelines.testing &&
    guidelines.documentation
  );
}

/**
 * Extract ESLint config from guidelines
 * Useful for generating .eslintrc files
 */
export function extractEslintConfig(guidelines: CodingGuidelines): object {
  const rules: Record<string, unknown> = {};
  for (const rule of guidelines.linting.rules) {
    rules[rule.name] = rule.options
      ? [rule.level, rule.options]
      : rule.level;
  }

  return {
    extends: guidelines.linting.extends,
    rules,
    ignorePatterns: guidelines.linting.ignorePatterns,
  };
}

/**
 * Extract Prettier config from guidelines
 * Useful for generating .prettierrc files
 */
export function extractPrettierConfig(guidelines: CodingGuidelines): object {
  // Default Prettier config based on common conventions
  return {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 100,
    bracketSpacing: true,
    arrowParens: 'avoid',
  };
}
