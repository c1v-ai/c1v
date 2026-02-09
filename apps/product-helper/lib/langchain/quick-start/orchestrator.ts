/**
 * Quick Start Pipeline Orchestrator (Phase 12 - Quick Start Mode)
 *
 * Purpose: Orchestrate the full Quick Start pipeline from a single sentence
 * to a complete PRD with validation, artifacts, and persistence.
 *
 * Pipeline Phases:
 * 1. Synthesis (sequential): Expand user input via synthesis agent
 * 2. Extraction (parallel): Run all specialist agents concurrently
 * 3. Validation: Run PRD-SPEC validation, generate warnings
 * 4. Artifacts: Generate Mermaid diagrams for ready artifacts
 * 5. Persistence: Save everything to database
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  projects,
  projectData,
  artifacts,
  userStories,
  conversations,
} from '@/lib/db/schema';
import type {
  ExtractionResult,
} from '../schemas';
import type { TechStackModel } from '@/lib/db/schema/v2-types';
import type { DatabaseSchemaModel } from '@/lib/db/schema/v2-types';
import type { APISpecification } from '@/lib/types/api-specification';
import type { GeneratedStory } from '../agents/user-stories-agent';

import {
  synthesizeProjectContext,
  type SynthesisResult,
} from '../agents/quick-start-synthesis-agent';
import { extractProjectData } from '../agents/extraction-agent';
import { recommendTechStack, type TechStackContext } from '../agents/tech-stack-agent';
import { generateUserStories, type UserStoriesContext } from '../agents/user-stories-agent';
import { extractDatabaseSchema, type SchemaExtractionContext } from '../agents/schema-extraction-agent';
import { generateAPISpecification } from '../agents/api-spec-agent';
import type { APISpecGenerationContext } from '@/lib/types/api-specification';
import { generateInfrastructureSpec, type InfrastructureContext } from '../agents/infrastructure-agent';
import { generateCodingGuidelines, type GuidelinesContext } from '../agents/guidelines-agent';
import type { InfrastructureSpec } from '@/lib/db/schema/v2-types';
import type { CodingGuidelines } from '@/lib/db/schema/v2-types';
import { validateProject } from '@/lib/validation/validator';
import type { ProjectValidationData } from '@/lib/validation/types';

// ============================================================
// Types
// ============================================================

/**
 * Progress callback for SSE streaming
 * Called at each step of the pipeline
 */
export type ProgressCallback = (
  step: QuickStartStep,
  status: StepStatus,
  message: string,
) => void;

/**
 * All steps in the Quick Start pipeline
 */
export type QuickStartStep =
  | 'synthesis'
  | 'extraction'
  | 'tech-stack'
  | 'user-stories'
  | 'db-schema'
  | 'api-spec'
  | 'validation'
  | 'artifacts'
  | 'persistence'
  | 'complete';

/**
 * Status of each step
 */
export type StepStatus = 'running' | 'complete' | 'error' | 'skipped';

/**
 * Configuration for the Quick Start pipeline
 */
export interface QuickStartConfig {
  projectId: number;
  teamId: number;
  userId: number;
  userInput: string;
  onProgress?: ProgressCallback;
}

/**
 * Result of an individual agent extraction
 */
interface AgentResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

/**
 * Validation warning for the Quick Start result
 */
export interface ValidationWarning {
  gate: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Statistics about what was generated
 */
export interface QuickStartStats {
  actors: number;
  useCases: number;
  features: number;
  dataEntities: number;
  userStories: number;
  techCategories: number;
  apiEndpoints: number;
  dbEntities: number;
  assumptions: number;
}

/**
 * Final result of the Quick Start pipeline
 */
export interface QuickStartResult {
  projectId: number;
  projectName: string;
  projectVision: string;
  completeness: number;
  validationScore: number;
  validationWarnings: ValidationWarning[];
  suggestGuidedMode: boolean;
  stats: QuickStartStats;
  /** Artifact types that were successfully generated */
  generatedArtifacts: string[];
  /** Assumptions the user should validate */
  assumptions: string[];
}

// ============================================================
// Synthetic Conversation Builder
// ============================================================

/**
 * Build a synthetic conversation string from synthesis output
 * This is what the extraction agents expect as "conversationHistory"
 */
function buildSyntheticConversation(synthesis: SynthesisResult): string {
  const { domainAnalysis, useCaseDerivation, userInput } = synthesis;

  const lines: string[] = [
    `user: ${userInput}`,
    '',
    `assistant: I understand you want to build "${domainAnalysis.projectName}". ${domainAnalysis.projectVision}`,
    '',
    `user: Yes, that captures it well. The main users would be ${domainAnalysis.actors.filter(a => a.type === 'human').map(a => a.name).join(', ')}.`,
    '',
    `assistant: Great! Let me outline what I understand about the system:`,
    '',
    `The system includes these internal components:`,
    ...domainAnalysis.systemBoundaries.internal.map(c => `- ${c}`),
    '',
    `And integrates with these external systems:`,
    ...domainAnalysis.systemBoundaries.external.map(c => `- ${c}`),
    '',
    `user: That looks right. What use cases do you see?`,
    '',
    `assistant: Based on the actors and system scope, here are the key use cases:`,
    ...useCaseDerivation.useCases.map(uc => `- ${uc.id}: ${uc.name} (${uc.actor}): ${uc.description}`),
    '',
    `The core data entities would be:`,
    ...useCaseDerivation.dataEntities.map(e => `- ${e.name}: ${e.attributes.join(', ')} [${e.relationships.join('; ')}]`),
    '',
    `Key features include:`,
    ...useCaseDerivation.features.map(f => `- ${f.name} (${f.category}): ${f.description}`),
    '',
    `user: This captures the project scope well. Let's proceed.`,
  ];

  return lines.join('\n');
}

// ============================================================
// Phase 2: Parallel Extraction
// ============================================================

/**
 * Run all extraction agents in parallel via Promise.allSettled
 * Handles partial failures gracefully
 */
async function runParallelExtractions(
  synthesis: SynthesisResult,
  conversationHistory: string,
  onProgress?: ProgressCallback,
): Promise<{
  extraction: AgentResult<ExtractionResult>;
  techStack: AgentResult<TechStackModel>;
  stories: AgentResult<GeneratedStory[]>;
  dbSchema: AgentResult<DatabaseSchemaModel>;
  apiSpec: AgentResult<APISpecification>;
}> {
  const { domainAnalysis, useCaseDerivation } = synthesis;
  const projectName = domainAnalysis.projectName;
  const projectVision = domainAnalysis.projectVision;

  // Build contexts for each agent
  const techStackContext: TechStackContext = {
    projectName,
    projectVision,
    useCases: useCaseDerivation.useCases.map(uc => ({
      name: uc.name,
      description: uc.description,
    })),
    dataEntities: useCaseDerivation.dataEntities.map(e => ({
      name: e.name,
    })),
  };

  const userStoriesContext: UserStoriesContext = {
    projectName,
    projectVision,
    useCases: useCaseDerivation.useCases.map(uc => ({
      id: uc.id,
      name: uc.name,
      description: uc.description,
      actor: uc.actor,
      trigger: uc.trigger,
      outcome: uc.outcome,
      preconditions: uc.preconditions,
      postconditions: uc.postconditions,
      priority: uc.priority,
    })),
    actors: domainAnalysis.actors.map(a => ({
      name: a.name,
      role: a.role,
    })),
  };

  const schemaContext: SchemaExtractionContext = {
    projectName,
    projectVision,
    dataEntities: useCaseDerivation.dataEntities.map(e => ({
      name: e.name,
      attributes: e.attributes,
      relationships: e.relationships,
    })),
    useCases: useCaseDerivation.useCases.map(uc => ({
      name: uc.name,
      description: uc.description,
    })),
  };

  const apiSpecContext: APISpecGenerationContext = {
    projectName,
    projectVision,
    useCases: useCaseDerivation.useCases.map(uc => ({
      id: uc.id,
      name: uc.name,
      description: uc.description,
      actor: uc.actor,
      preconditions: uc.preconditions,
      postconditions: uc.postconditions,
    })),
    dataEntities: useCaseDerivation.dataEntities.map(e => ({
      name: e.name,
      attributes: e.attributes,
      relationships: e.relationships,
    })),
  };

  // Signal start of parallel phase
  onProgress?.('extraction', 'running', 'Extracting project data...');
  onProgress?.('tech-stack', 'running', 'Recommending tech stack...');
  onProgress?.('user-stories', 'running', 'Generating user stories...');
  onProgress?.('db-schema', 'running', 'Designing database schema...');
  onProgress?.('api-spec', 'running', 'Generating API specification...');

  // Run all agents in parallel
  const [
    extractionResult,
    techStackResult,
    storiesResult,
    dbSchemaResult,
    apiSpecResult,
  ] = await Promise.allSettled([
    extractProjectData(conversationHistory, projectName, projectVision),
    recommendTechStack(techStackContext),
    generateUserStories(userStoriesContext),
    extractDatabaseSchema(schemaContext),
    generateAPISpecification(apiSpecContext),
  ]);

  // Process results
  const extraction = processSettledResult<ExtractionResult>(
    extractionResult, 'extraction', onProgress,
  );
  const techStack = processSettledResult<TechStackModel>(
    techStackResult, 'tech-stack', onProgress,
  );
  const stories = processSettledResult<GeneratedStory[]>(
    storiesResult, 'user-stories', onProgress,
  );
  const dbSchema = processSettledResult<DatabaseSchemaModel>(
    dbSchemaResult, 'db-schema', onProgress,
  );
  const apiSpec = processSettledResult<APISpecification>(
    apiSpecResult, 'api-spec', onProgress,
  );

  return { extraction, techStack, stories, dbSchema, apiSpec };
}

/**
 * Process a Promise.allSettled result into an AgentResult
 */
function processSettledResult<T>(
  result: PromiseSettledResult<T>,
  step: QuickStartStep,
  onProgress?: ProgressCallback,
): AgentResult<T> {
  if (result.status === 'fulfilled') {
    onProgress?.(step, 'complete', `${step} completed successfully`);
    return { success: true, data: result.value };
  }

  const errorMsg = result.reason instanceof Error
    ? result.reason.message
    : String(result.reason);
  console.error(`Quick Start ${step} agent failed:`, result.reason);
  onProgress?.(step, 'error', `${step} failed -- regenerate from project page`);
  return { success: false, data: null, error: errorMsg };
}

// ============================================================
// Phase 3: Validation
// ============================================================

/**
 * Run PRD-SPEC validation and generate warnings
 * Never blocks -- always returns results with warnings
 */
async function runValidation(
  projectId: number,
  synthesis: SynthesisResult,
  extraction: AgentResult<ExtractionResult>,
  onProgress?: ProgressCallback,
): Promise<{
  validationScore: number;
  validationWarnings: ValidationWarning[];
  suggestGuidedMode: boolean;
}> {
  onProgress?.('validation', 'running', 'Validating PRD completeness...');

  try {
    const { domainAnalysis, useCaseDerivation } = synthesis;

    // Build validation data from synthesis + extraction results
    const validationData: ProjectValidationData = {
      id: projectId,
      name: domainAnalysis.projectName,
      vision: domainAnalysis.projectVision,
      status: 'intake',
      actors: domainAnalysis.actors.map(a => ({
        name: a.name,
        role: a.role,
        description: a.role,
      })),
      useCases: useCaseDerivation.useCases.map(uc => ({
        id: uc.id,
        name: uc.name,
        description: uc.description,
        actor: uc.actor,
        trigger: uc.trigger,
        outcome: uc.outcome,
        preconditions: uc.preconditions,
        postconditions: uc.postconditions,
      })),
      systemBoundaries: {
        internal: domainAnalysis.systemBoundaries.internal,
        external: domainAnalysis.systemBoundaries.external,
        inScope: domainAnalysis.systemBoundaries.internal,
      },
      dataEntities: useCaseDerivation.dataEntities.map(e => ({
        name: e.name,
        attributes: e.attributes,
        relationships: e.relationships,
      })),
      completeness: extraction.success ? 50 : 20,
    };

    const result = await validateProject(validationData);

    // Convert hard gate failures to warnings
    const warnings: ValidationWarning[] = [];
    for (const gate of result.hardGates) {
      if (!gate.passed) {
        for (const check of gate.checks) {
          if (!check.passed) {
            warnings.push({
              gate: gate.gate,
              message: check.message,
              severity: check.severity,
            });
          }
        }
      }
    }

    // Add validation-level warnings
    for (const warning of result.warnings) {
      warnings.push({
        gate: 'consistency',
        message: warning,
        severity: 'warning',
      });
    }

    const suggestGuidedMode = result.overallScore < 60;

    onProgress?.('validation', 'complete',
      `Validation complete: ${result.overallScore}% compliance`);

    return {
      validationScore: result.overallScore,
      validationWarnings: warnings,
      suggestGuidedMode,
    };
  } catch (error) {
    console.error('Validation failed:', error);
    onProgress?.('validation', 'error', 'Validation could not complete');
    return {
      validationScore: 0,
      validationWarnings: [{
        gate: 'system',
        message: 'Validation engine encountered an error',
        severity: 'warning',
      }],
      suggestGuidedMode: true,
    };
  }
}

// ============================================================
// Phase 4: Artifact Generation
// ============================================================

/**
 * Generate Mermaid diagrams for ready artifacts
 * Skips generation if validation indicates data is not ready
 */
async function generateArtifacts(
  synthesis: SynthesisResult,
  extraction: AgentResult<ExtractionResult>,
  validationScore: number,
  onProgress?: ProgressCallback,
): Promise<string[]> {
  onProgress?.('artifacts', 'running', 'Generating diagrams...');

  // Skip artifact generation if data quality is too low
  if (validationScore < 30) {
    onProgress?.('artifacts', 'skipped', 'Skipped diagram generation due to low data quality');
    return [];
  }

  const generatedArtifacts: string[] = [];
  const { domainAnalysis, useCaseDerivation } = synthesis;

  // Use extraction data if available, otherwise build from synthesis
  const actorsData = extraction.data?.actors || domainAnalysis.actors.map(a => ({
    name: a.name,
    role: a.role,
    description: a.role,
  }));

  const useCasesData = extraction.data?.useCases || useCaseDerivation.useCases.map(uc => ({
    id: uc.id,
    name: uc.name,
    description: uc.description,
    actor: uc.actor,
  }));

  const boundariesData = extraction.data?.systemBoundaries || domainAnalysis.systemBoundaries;

  // Generate context diagram Mermaid
  try {
    const contextDiagramContent = generateContextDiagramMermaid(
      domainAnalysis.projectName,
      actorsData,
      boundariesData,
    );
    generatedArtifacts.push('context_diagram');

    // We store these in the artifact results for persistence
    (generateArtifacts as any).__contextDiagram = contextDiagramContent;
  } catch (error) {
    console.error('Context diagram generation failed:', error);
  }

  // Generate use case diagram Mermaid
  try {
    const useCaseDiagramContent = generateUseCaseDiagramMermaid(
      domainAnalysis.projectName,
      actorsData,
      useCasesData,
    );
    generatedArtifacts.push('use_case');

    (generateArtifacts as any).__useCaseDiagram = useCaseDiagramContent;
  } catch (error) {
    console.error('Use case diagram generation failed:', error);
  }

  onProgress?.('artifacts', 'complete',
    `Generated ${generatedArtifacts.length} diagram(s)`);

  return generatedArtifacts;
}

/**
 * Generate a Mermaid C4 Context diagram from actors and boundaries
 */
function generateContextDiagramMermaid(
  projectName: string,
  actors: Array<{ name: string; role: string; description?: string }>,
  boundaries: { internal: string[]; external: string[] },
): string {
  const lines: string[] = ['```mermaid', 'graph TB'];

  // Central system
  lines.push(`  SYS["${projectName}"]`);
  lines.push('');

  // Actors
  for (const actor of actors) {
    const id = actor.name.replace(/\s+/g, '_');
    lines.push(`  ${id}(("${actor.name}<br/>${actor.role}"))`);
    lines.push(`  ${id} --> SYS`);
  }
  lines.push('');

  // External systems
  for (const ext of boundaries.external) {
    const id = ext.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    lines.push(`  ${id}["${ext}"]`);
    lines.push(`  SYS -.-> ${id}`);
  }

  lines.push('```');
  return lines.join('\n');
}

/**
 * Generate a Mermaid Use Case diagram from actors and use cases
 */
function generateUseCaseDiagramMermaid(
  projectName: string,
  actors: Array<{ name: string; role: string }>,
  useCases: Array<{ id: string; name: string; actor: string }>,
): string {
  const lines: string[] = ['```mermaid', 'graph LR'];

  // Actors on the left
  for (const actor of actors) {
    const id = actor.name.replace(/\s+/g, '_');
    lines.push(`  ${id}(("${actor.name}"))`);
  }
  lines.push('');

  // System boundary
  lines.push(`  subgraph "${projectName}"`);
  for (const uc of useCases) {
    const id = uc.id.replace(/\s+/g, '_');
    lines.push(`    ${id}["${uc.name}"]`);
  }
  lines.push('  end');
  lines.push('');

  // Connect actors to use cases
  for (const uc of useCases) {
    const actorId = uc.actor.replace(/\s+/g, '_');
    const ucId = uc.id.replace(/\s+/g, '_');
    lines.push(`  ${actorId} --> ${ucId}`);
  }

  lines.push('```');
  return lines.join('\n');
}

// ============================================================
// Phase 5: Persistence
// ============================================================

/**
 * Save all generated data to the database
 */
async function persistResults(
  config: QuickStartConfig,
  synthesis: SynthesisResult,
  extraction: AgentResult<ExtractionResult>,
  techStack: AgentResult<TechStackModel>,
  stories: AgentResult<GeneratedStory[]>,
  dbSchema: AgentResult<DatabaseSchemaModel>,
  apiSpec: AgentResult<APISpecification>,
  generatedArtifactTypes: string[],
  validationScore: number,
  onProgress?: ProgressCallback,
): Promise<void> {
  onProgress?.('persistence', 'running', 'Saving project data...');

  const { projectId } = config;
  const { domainAnalysis, useCaseDerivation } = synthesis;

  try {
    // 1. Update project name/vision
    await db
      .update(projects)
      .set({
        name: domainAnalysis.projectName,
        vision: domainAnalysis.projectVision,
        status: 'in_progress',
        validationScore,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // 2. Upsert project data
    const existingData = await db.query.projectData.findFirst({
      where: eq(projectData.projectId, projectId),
    });

    // Build the actors from synthesis (more reliable for quick start)
    const actorsForDb = domainAnalysis.actors.map(a => ({
      name: a.name,
      role: a.role,
      description: a.role,
    }));

    // Build use cases from synthesis
    const useCasesForDb = useCaseDerivation.useCases.map(uc => ({
      id: uc.id,
      name: uc.name,
      description: uc.description,
      actor: uc.actor,
      trigger: uc.trigger,
      outcome: uc.outcome,
      preconditions: uc.preconditions,
      postconditions: uc.postconditions,
      priority: uc.priority,
      status: 'draft' as const,
    }));

    const dataPayload = {
      projectId,
      actors: actorsForDb,
      useCases: useCasesForDb,
      systemBoundaries: domainAnalysis.systemBoundaries,
      dataEntities: useCaseDerivation.dataEntities,
      databaseSchema: dbSchema.data || null,
      techStack: techStack.data || null,
      apiSpecification: apiSpec.data || null,
      completeness: Math.min(Math.round(validationScore * 0.8), 100),
      lastExtractedAt: new Date(),
      updatedAt: new Date(),
    };

    if (existingData) {
      await db
        .update(projectData)
        .set(dataPayload)
        .where(eq(projectData.projectId, projectId));
    } else {
      await db
        .insert(projectData)
        .values({
          ...dataPayload,
          createdAt: new Date(),
        });
    }

    // 3. Save user stories
    if (stories.success && stories.data && stories.data.length > 0) {
      const storyValues = stories.data.map((story, idx) => ({
        projectId,
        useCaseId: story.useCaseId,
        title: story.title,
        description: story.description,
        actor: story.actor,
        epic: story.epic,
        acceptanceCriteria: story.acceptanceCriteria,
        status: 'backlog' as const,
        priority: story.priority,
        estimatedEffort: story.estimatedEffort,
        order: idx,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await db.insert(userStories).values(storyValues);
    }

    // 4. Save artifacts (diagrams)
    const artifactData: Array<{
      projectId: number;
      type: string;
      content: unknown;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    if (generatedArtifactTypes.includes('context_diagram')) {
      artifactData.push({
        projectId,
        type: 'context_diagram',
        content: { mermaid: (generateArtifacts as any).__contextDiagram || '' },
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (generatedArtifactTypes.includes('use_case')) {
      artifactData.push({
        projectId,
        type: 'use_case',
        content: { mermaid: (generateArtifacts as any).__useCaseDiagram || '' },
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (artifactData.length > 0) {
      await db.insert(artifacts).values(artifactData);
    }

    // 5. Save the original user input as a conversation entry
    await db.insert(conversations).values({
      projectId,
      role: 'user',
      content: synthesis.userInput,
      createdAt: new Date(),
    });

    await db.insert(conversations).values({
      projectId,
      role: 'assistant',
      content: `Quick Start generated a complete PRD for "${domainAnalysis.projectName}" with ${useCaseDerivation.useCases.length} use cases, ${useCaseDerivation.features.length} features, and ${useCaseDerivation.dataEntities.length} data entities.`,
      createdAt: new Date(),
    });

    onProgress?.('persistence', 'complete', 'Project data saved successfully');
  } catch (error) {
    console.error('Persistence error:', error);
    onProgress?.('persistence', 'error', 'Failed to save some project data');
    throw error;
  }
}

// ============================================================
// Main Pipeline
// ============================================================

/**
 * Run the complete Quick Start pipeline
 *
 * Takes a single user sentence and produces a full PRD with:
 * - Project name and vision
 * - Actors and system boundaries
 * - Use cases (6-15) with triggers and outcomes
 * - Tech stack recommendation
 * - User stories with acceptance criteria
 * - Database schema
 * - API specification
 * - Mermaid diagrams (context, use case)
 * - PRD-SPEC validation with warnings
 *
 * @param config - Pipeline configuration including projectId, userInput, and callbacks
 * @returns QuickStartResult with completeness score, stats, and warnings
 *
 * @example
 * ```typescript
 * const result = await runQuickStartPipeline({
 *   projectId: 42,
 *   teamId: 1,
 *   userId: 1,
 *   userInput: "An e-commerce platform for handmade crafts",
 *   onProgress: (step, status, message) => {
 *     console.log(`[${step}] ${status}: ${message}`);
 *   },
 * });
 * ```
 */
export async function runQuickStartPipeline(
  config: QuickStartConfig,
): Promise<QuickStartResult> {
  const { projectId, userInput, onProgress } = config;

  // ---- Phase 1: Synthesis (sequential) ----
  onProgress?.('synthesis', 'running', 'Analyzing your project idea...');
  let synthesis: SynthesisResult;
  try {
    synthesis = await synthesizeProjectContext(userInput);
    onProgress?.('synthesis', 'complete',
      `Identified ${synthesis.domainAnalysis.actors.length} actors and ${synthesis.useCaseDerivation.useCases.length} use cases`);
  } catch (error) {
    console.error('Synthesis phase failed:', error);
    onProgress?.('synthesis', 'error', 'Failed to analyze project idea');
    throw new Error('Synthesis phase failed: unable to analyze project idea');
  }

  // ---- Phase 2: Extraction (parallel) ----
  const conversationHistory = buildSyntheticConversation(synthesis);
  const {
    extraction,
    techStack,
    stories,
    dbSchema,
    apiSpec,
  } = await runParallelExtractions(synthesis, conversationHistory, onProgress);

  // ---- Phase 3: Validation ----
  const {
    validationScore,
    validationWarnings,
    suggestGuidedMode,
  } = await runValidation(projectId, synthesis, extraction, onProgress);

  // ---- Phase 4: Artifacts ----
  const generatedArtifactTypes = await generateArtifacts(
    synthesis, extraction, validationScore, onProgress,
  );

  // ---- Phase 5: Persistence ----
  await persistResults(
    config,
    synthesis,
    extraction,
    techStack,
    stories,
    dbSchema,
    apiSpec,
    generatedArtifactTypes,
    validationScore,
    onProgress,
  );

  // ---- Build Final Result ----
  const stats: QuickStartStats = {
    actors: synthesis.domainAnalysis.actors.length,
    useCases: synthesis.useCaseDerivation.useCases.length,
    features: synthesis.useCaseDerivation.features.length,
    dataEntities: synthesis.useCaseDerivation.dataEntities.length,
    userStories: stories.data?.length || 0,
    techCategories: techStack.data?.categories?.length || 0,
    apiEndpoints: apiSpec.data?.endpoints?.length || 0,
    dbEntities: dbSchema.data?.entities?.length || 0,
    assumptions: synthesis.useCaseDerivation.assumptions.length,
  };

  const completeness = calculateCompleteness(stats, validationScore);

  const result: QuickStartResult = {
    projectId,
    projectName: synthesis.domainAnalysis.projectName,
    projectVision: synthesis.domainAnalysis.projectVision,
    completeness,
    validationScore,
    validationWarnings,
    suggestGuidedMode,
    stats,
    generatedArtifacts: generatedArtifactTypes,
    assumptions: synthesis.useCaseDerivation.assumptions,
  };

  onProgress?.('complete', 'complete',
    `PRD generated with ${completeness}% completeness`);

  return result;
}

// ============================================================
// Helpers
// ============================================================

/**
 * Calculate overall PRD completeness from stats and validation
 */
function calculateCompleteness(
  stats: QuickStartStats,
  validationScore: number,
): number {
  let score = 0;

  // Actors: 10 points
  if (stats.actors >= 3) score += 10;
  else if (stats.actors >= 2) score += 7;

  // Use cases: 20 points
  if (stats.useCases >= 8) score += 20;
  else if (stats.useCases >= 5) score += 15;
  else if (stats.useCases >= 3) score += 10;

  // Data entities: 10 points
  if (stats.dataEntities >= 3) score += 10;
  else if (stats.dataEntities >= 1) score += 5;

  // User stories: 15 points
  if (stats.userStories >= 10) score += 15;
  else if (stats.userStories >= 5) score += 10;
  else if (stats.userStories >= 1) score += 5;

  // Tech stack: 10 points
  if (stats.techCategories >= 4) score += 10;
  else if (stats.techCategories >= 2) score += 5;

  // API spec: 10 points
  if (stats.apiEndpoints >= 5) score += 10;
  else if (stats.apiEndpoints >= 1) score += 5;

  // DB schema: 10 points
  if (stats.dbEntities >= 3) score += 10;
  else if (stats.dbEntities >= 1) score += 5;

  // Validation score contributes 15 points
  score += Math.round(validationScore * 0.15);

  return Math.min(score, 100);
}
