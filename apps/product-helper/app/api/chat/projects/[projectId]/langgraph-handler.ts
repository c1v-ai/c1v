/**
 * LangGraph Chat Handler
 *
 * This module provides the LangGraph-based chat handling logic,
 * separated from the main route for cleaner code organization.
 *
 * Features:
 * - State persistence via checkpointing
 * - Conversation message storage in database
 * - Project data updates from extracted information
 * - Streaming response support
 *
 * @module api/chat/projects/[projectId]/langgraph-handler
 */

import { HumanMessage, AIMessage } from '@langchain/core/messages';
import {
  filterAIMessages,
  getLastAIMessage,
  getMessageContent,
  getMessageDiagnostics,
  isAIMessage,
} from '@/lib/langchain/message-utils';
import { db } from '@/lib/db/drizzle';
import { conversations, projectData, artifacts, projects, type NewArtifact } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cleanSequenceDiagramSyntax } from '@/lib/diagrams/generators';
import {
  getIntakeGraph,
  createInitialState,
  loadCheckpoint,
  saveCheckpoint,
  type IntakeState,
  type ArtifactPhase,
} from '@/lib/langchain/graphs';
import type { ExtractionResult } from '@/lib/langchain/schemas';
import { recommendTechStack, type TechStackContext } from '@/lib/langchain/agents/tech-stack-agent';
import { generateUserStories, type UserStoriesContext } from '@/lib/langchain/agents/user-stories-agent';
import { extractDatabaseSchema, type SchemaExtractionContext } from '@/lib/langchain/agents/schema-extraction-agent';
import { generateAPISpecification } from '@/lib/langchain/agents/api-spec-agent';
import type { APISpecGenerationContext } from '@/lib/types/api-specification';
import { generateInfrastructureSpec, type InfrastructureContext } from '@/lib/langchain/agents/infrastructure-agent';
import { generateCodingGuidelines, type GuidelinesContext } from '@/lib/langchain/agents/guidelines-agent';
import { userStories } from '@/lib/db/schema';
import type { KBProjectContext } from '@/lib/education/reference-data/types';

// ============================================================
// Types
// ============================================================

/**
 * Project context needed for LangGraph invocation
 */
export interface ProjectContext {
  id: number;
  name: string;
  vision: string;
  teamId: number;
  projectData?: {
    actors?: unknown;
    useCases?: unknown;
    systemBoundaries?: unknown;
    dataEntities?: unknown;
    completeness?: number;
  } | null;
}

/**
 * Result from LangGraph processing
 */
export interface LangGraphResult {
  response: string;
  state: IntakeState;
  error?: string;
}

// ============================================================
// Main Handler Function
// ============================================================

/**
 * Process a chat message using the LangGraph intake system
 *
 * This function:
 * 1. Loads or creates the graph state from checkpoint
 * 2. Adds the new user message
 * 3. Invokes the LangGraph state machine
 * 4. Saves the checkpoint
 * 5. Saves conversation messages to database
 * 6. Updates project data with extracted information
 *
 * @param project - Project context from database
 * @param userMessage - The user's message content
 * @returns The AI response and updated state
 *
 * @example
 * ```typescript
 * const result = await processWithLangGraph(project, "Add user authentication");
 * return new Response(result.response);
 * ```
 */
export async function processWithLangGraph(
  project: ProjectContext,
  userMessage: string
): Promise<LangGraphResult> {
  const { id: projectId, name: projectName, vision: projectVision, teamId } = project;

  // [STATE_DEBUG] Entry point
  console.log(`[STATE_DEBUG] processWithLangGraph called for project ${projectId}`);

  try {
    // 1. Load existing checkpoint or create initial state
    let state = await loadCheckpoint(projectId);

    // [STATE_DEBUG] Checkpoint load status
    console.log(`[STATE_DEBUG] Checkpoint loaded: ${state ? 'yes' : 'no'}`);
    if (state) {
      console.log(`[STATE_DEBUG] Loaded state - messages: ${state.messages?.length ?? 0}, currentKBStep: ${state.currentKBStep}, completeness: ${state.completeness}`);
    }

    if (!state) {
      // Create new state with existing project data if available
      const existingData = project.projectData
        ? {
            extractedData: parseExistingData(project.projectData),
            completeness: project.projectData.completeness ?? 0,
          }
        : undefined;

      state = createInitialState(
        projectId,
        projectName,
        projectVision,
        teamId,
        existingData
      );
    }

    // 2. Early exit: if all core KB artifacts are generated, intake is done
    const coreKBPhases = [
      'context_diagram',
      'use_case_diagram',
      'scope_tree',
      'ucbd',
      'requirements_table',
      'sysml_activity_diagram',
    ];
    const allCoreGenerated = state && state.generatedArtifacts?.length > 0 &&
      coreKBPhases.every(p => state!.generatedArtifacts.includes(p as ArtifactPhase));

    if (allCoreGenerated) {
      console.log(`[STATE_DEBUG] All core artifacts already generated (${state.generatedArtifacts.length}), skipping graph — intake complete`);

      // Save user message
      await db.insert(conversations).values({
        projectId,
        role: 'user',
        content: userMessage,
        tokens: estimateTokenCount(userMessage),
      });

      const completionMsg = await buildCompletionMessage(projectId);

      await db.insert(conversations).values({
        projectId,
        role: 'assistant',
        content: completionMsg,
        tokens: estimateTokenCount(completionMsg),
      });

      // Only mark as 'generated' if all backend artifacts exist
      const pd = await db.query.projectData.findFirst({
        where: eq(projectData.projectId, projectId),
      });
      const allBackendDone = pd?.techStack && pd?.databaseSchema && pd?.apiSpecification && pd?.infrastructureSpec && pd?.codingGuidelines;
      await db.update(projects)
        .set({ status: allBackendDone ? 'generated' : 'in_progress', updatedAt: new Date() })
        .where(eq(projects.id, projectId));

      return {
        response: completionMsg,
        state: state!,
      };
    }

    // 2b. Add user message to state
    state = {
      ...state,
      messages: [...state.messages, new HumanMessage(userMessage)],
      turnCount: state.turnCount + 1,
    };

    // 3. Save user message to conversations table
    await db.insert(conversations).values({
      projectId,
      role: 'user',
      content: userMessage,
      tokens: estimateTokenCount(userMessage),
    });

    // 4. Invoke the LangGraph state machine
    const graph = getIntakeGraph();
    const result = await graph.invoke(state, {
      recursionLimit: 20,
    });

    // [STATE_DEBUG] Graph invocation complete
    console.log(`[STATE_DEBUG] Graph invocation complete`);
    console.log(`[STATE_DEBUG] Result - messages: ${result.messages?.length ?? 0}, extractedData actors: ${result.extractedData?.actors?.length ?? 0}`);

    // 5. Extract AI response from result using defensive utilities
    // These work even when Turbopack module duplication breaks _getType()
    const lastAIMessage = getLastAIMessage(result.messages);

    // [STATE_DEBUG] Message diagnostics for debugging bundling issues
    if (!lastAIMessage) {
      console.log(`[STATE_DEBUG] No AI message found. Message diagnostics:`,
        result.messages.slice(-3).map(m => getMessageDiagnostics(m))
      );
    }

    let response = lastAIMessage
      ? getMessageContent(lastAIMessage)
      : 'I apologize, but I was unable to generate a response. Please try again.';

    // 6. Save AI response to conversations table
    await db.insert(conversations).values({
      projectId,
      role: 'assistant',
      content: response,
      tokens: estimateTokenCount(response),
    });

    // 6b. Extract and save any mermaid diagrams
    await saveMermaidDiagrams(projectId, response);

    // 7. Save checkpoint
    // [STATE_DEBUG] Saving checkpoint
    console.log(`[STATE_DEBUG] Saving checkpoint...`);
    await saveCheckpoint(projectId, result);

    // 8. Update project data with extracted information
    // [STATE_DEBUG] Updating project data
    console.log(`[STATE_DEBUG] Updating project data from state...`);
    await updateProjectDataFromState(projectId, result);

    // 9. Check if intake is complete and trigger post-intake generation
    const artifactCount = result.generatedArtifacts?.length ?? 0;
    if (artifactCount >= 4 && result.extractedData) {
      const existing = await db.query.projectData.findFirst({
        where: eq(projectData.projectId, projectId),
        columns: { techStack: true },
      });
      if (!existing?.techStack) {
        console.log(`[POST_INTAKE] Intake complete (${artifactCount} artifacts), triggering generation`);
        try {
          const genSummary = await triggerPostIntakeGeneration(
            projectId,
            result.extractedData,
            projectName,
            projectVision,
          );
          // Append generation summary to chat
          response += '\n\n---\n\n' + genSummary;
          await db.insert(conversations).values({
            projectId,
            role: 'assistant',
            content: `[Auto-Generation] ${genSummary}`,
            tokens: estimateTokenCount(genSummary),
          });
        } catch (genError) {
          console.error('[POST_INTAKE] Generation failed:', genError);
        }
      }
    }

    return {
      response,
      state: result,
    };
  } catch (error) {
    console.error('[LangGraph Handler] Error processing message:', error);

    // Return error response
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      response: `I encountered an error while processing your message. Please try again. (Error: ${errorMessage})`,
      state: createInitialState(projectId, projectName, projectVision, teamId),
      error: errorMessage,
    };
  }
}

/**
 * Stream a chat response using LangGraph
 *
 * Similar to processWithLangGraph but returns a streaming response.
 * Uses LangGraph's streamEvents for real-time token streaming.
 *
 * @param project - Project context from database
 * @param userMessage - The user's message content
 * @returns ReadableStream of response chunks
 */
export async function streamWithLangGraph(
  project: ProjectContext,
  userMessage: string
): Promise<ReadableStream<Uint8Array>> {
  const { id: projectId, name: projectName, vision: projectVision, teamId } = project;

  // Load or create state
  let state = await loadCheckpoint(projectId);

  if (!state) {
    const existingData = project.projectData
      ? {
          extractedData: parseExistingData(project.projectData),
          completeness: project.projectData.completeness ?? 0,
        }
      : undefined;

    state = createInitialState(
      projectId,
      projectName,
      projectVision,
      teamId,
      existingData
    );
  }

  // Early exit: if all core KB artifacts are generated, intake is done
  const coreKBPhases: ArtifactPhase[] = [
    'context_diagram',
    'use_case_diagram',
    'scope_tree',
    'ucbd',
    'requirements_table',
    'sysml_activity_diagram',
  ];
  const allCoreGenerated = state.generatedArtifacts?.length > 0 &&
    coreKBPhases.every(p => state!.generatedArtifacts.includes(p));

  if (allCoreGenerated) {
    console.log(`[STREAM] All core artifacts already generated, returning completion message`);

    await db.insert(conversations).values({
      projectId,
      role: 'user',
      content: userMessage,
      tokens: estimateTokenCount(userMessage),
    });

    const completionMsg = await buildCompletionMessage(projectId);

    await db.insert(conversations).values({
      projectId,
      role: 'assistant',
      content: completionMsg,
      tokens: estimateTokenCount(completionMsg),
    });

    const pd = await db.query.projectData.findFirst({
      where: eq(projectData.projectId, projectId),
    });
    const allBackendDone = pd?.techStack && pd?.databaseSchema && pd?.apiSpecification && pd?.infrastructureSpec && pd?.codingGuidelines;
    await db.update(projects)
      .set({ status: allBackendDone ? 'generated' : 'in_progress', updatedAt: new Date() })
      .where(eq(projects.id, projectId));

    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(completionMsg));
        controller.close();
      },
    });
  }

  // Add user message
  state = {
    ...state,
    messages: [...state.messages, new HumanMessage(userMessage)],
    turnCount: state.turnCount + 1,
  };

  // Save user message
  await db.insert(conversations).values({
    projectId,
    role: 'user',
    content: userMessage,
    tokens: estimateTokenCount(userMessage),
  });

  // Create streaming response
  const encoder = new TextEncoder();
  let fullResponse = '';

  const graph = getIntakeGraph();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Use graph.stream for intermediate state updates
        const eventStream = await graph.stream(state, {
          recursionLimit: 20,
        });

        // Track generated artifacts across all chunks
        const accumulatedArtifacts = new Set<string>(state.generatedArtifacts ?? []);
        let latestExtractedData: ExtractionResult | undefined;
        // Accumulate all non-message state fields across node outputs
        let accumulatedState: Partial<IntakeState> = {};

        for await (const chunk of eventStream) {
          // Each chunk is { nodeName: nodeOutput }
          for (const [nodeName, nodeOutput] of Object.entries(chunk)) {
            const output = nodeOutput as Partial<IntakeState>;

            // Inject stream status marker so frontend can show node-specific thinking content
            try {
              const markerPhase = output.currentPhase || accumulatedState.currentPhase || state.currentPhase;
              controller.enqueue(encoder.encode(
                `<!--status:${JSON.stringify({ node: nodeName, phase: markerPhase || '' })}-->\n`
              ));
            } catch (markerErr) {
              console.warn('[STREAM] Failed to inject status marker:', markerErr);
            }

            // Stream messages as they come in
            // Use defensive type checking for Turbopack compatibility
            if (output.messages && output.messages.length > 0) {
              for (const msg of output.messages) {
                if (isAIMessage(msg)) {
                  const content = getMessageContent(msg);

                  // Only send new content
                  const newContent = content.slice(fullResponse.length);
                  if (newContent) {
                    fullResponse = content;
                    controller.enqueue(encoder.encode(newContent));
                  }
                }
              }
            }

            // Track generated artifacts
            if (output.generatedArtifacts && Array.isArray(output.generatedArtifacts)) {
              for (const art of output.generatedArtifacts) {
                accumulatedArtifacts.add(art as string);
              }
            }

            // Merge node output into accumulated state (exclude messages
            // to prevent shorter partial arrays overwriting cumulative messages)
            const { messages: _msgs, ...rest } = output;
            accumulatedState = { ...accumulatedState, ...rest };

            if (output.extractedData) {
              latestExtractedData = output.extractedData;
            }
          }
        }

        // Persist after streaming completes
        if (fullResponse) {
          await db.insert(conversations).values({
            projectId,
            role: 'assistant',
            content: fullResponse,
            tokens: estimateTokenCount(fullResponse),
          });

          // Extract and save any mermaid diagrams
          await saveMermaidDiagrams(projectId, fullResponse);
        }

        // Save checkpoint with accumulated state from all node outputs
        const checkpointState: IntakeState = {
          ...state,
          ...accumulatedState,
          messages: [
            ...state.messages,
            new AIMessage(fullResponse || 'No response generated'),
          ],
          generatedArtifacts: Array.from(accumulatedArtifacts) as ArtifactPhase[],
        };
        await saveCheckpoint(projectId, checkpointState);

        if (accumulatedState.extractedData || accumulatedState.completeness !== undefined) {
          await updateProjectDataFromState(projectId, accumulatedState);
        }

        // Check if intake is complete and trigger post-intake generation
        const extractedData = latestExtractedData ?? accumulatedState.extractedData ?? state.extractedData;
        if (accumulatedArtifacts.size >= 4 && extractedData) {
          const existing = await db.query.projectData.findFirst({
            where: eq(projectData.projectId, projectId),
            columns: { techStack: true },
          });
          if (!existing?.techStack) {
            console.log(`[POST_INTAKE] Intake complete (stream, ${accumulatedArtifacts.size} artifacts), triggering generation`);
            // Fire generation in background — don't block the stream close
            triggerPostIntakeGeneration(projectId, extractedData, projectName, projectVision)
              .then(summary => {
                console.log(`[POST_INTAKE] Background generation complete: ${summary}`);
                // Save summary as conversation message
                return db.insert(conversations).values({
                  projectId,
                  role: 'assistant',
                  content: `[Auto-Generation] ${summary}`,
                  tokens: estimateTokenCount(summary),
                });
              })
              .catch(err => console.error('[POST_INTAKE] Background generation failed:', err));
          }
        }

        controller.close();
      } catch (error) {
        console.error('[LangGraph Stream] Error:', error);
        const errorMsg =
          error instanceof Error
            ? `Error: ${error.message}`
            : 'An error occurred';
        controller.enqueue(encoder.encode(errorMsg));
        controller.close();
      }
    },
  });

  return stream;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Build an honest completion message by checking which backend
 * artifacts actually exist in the database.
 */
async function buildCompletionMessage(projectId: number): Promise<string> {
  const pd = await db.query.projectData.findFirst({
    where: eq(projectData.projectId, projectId),
    columns: {
      techStack: true,
      databaseSchema: true,
      apiSpecification: true,
      infrastructureSpec: true,
      codingGuidelines: true,
    },
  });

  const storyCount = await db.query.userStories.findMany({
    where: eq(userStories.projectId, projectId),
    columns: { id: true },
  });

  const generated: string[] = [];
  const missing: string[] = [];

  if (pd?.techStack) generated.push('Tech Stack'); else missing.push('Tech Stack');
  if (storyCount.length > 0) generated.push('User Stories'); else missing.push('User Stories');
  if (pd?.databaseSchema) generated.push('Database Schema'); else missing.push('Database Schema');
  if (pd?.apiSpecification) generated.push('API Specification'); else missing.push('API Specification');
  if (pd?.infrastructureSpec) generated.push('Infrastructure'); else missing.push('Infrastructure');
  if (pd?.codingGuidelines) generated.push('Coding Guidelines'); else missing.push('Coding Guidelines');

  const parts: string[] = ['Your project requirements intake is complete!'];

  if (generated.length > 0) {
    parts.push(`\nGenerated successfully: **${generated.join('**, **')}**.`);
  }

  if (missing.length > 0) {
    parts.push(`\nStill generating or failed: **${missing.join('**, **')}**. You can regenerate these from the **Generate** page in the sidebar.`);
  } else {
    parts.push('\nAll artifacts are ready — explore them in the sidebar.');
  }

  return parts.join('');
}

/**
 * Extract mermaid code blocks from content
 */
function extractMermaidBlocks(content: string): string[] {
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = mermaidRegex.exec(content)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

/**
 * Detect diagram type from mermaid syntax
 */
function detectDiagramType(syntax: string): string {
  const firstLine = syntax.trim().split('\n')[0].toLowerCase();
  if (firstLine.includes('classdiagram')) return 'class_diagram';
  if (firstLine.includes('sequencediagram')) return 'sequence_diagram';
  if (firstLine.includes('graph lr') || firstLine.includes('usecase')) return 'use_case_diagram';
  if (firstLine.includes('flowchart') || firstLine.includes('statediagram')) return 'activity_diagram';
  return 'context_diagram';
}

/**
 * Extract and save mermaid diagrams from AI response content
 * Validates syntax with mermaid.parse() before saving to database
 */
async function saveMermaidDiagrams(projectId: number, content: string): Promise<void> {
  try {
    const mermaidBlocks = extractMermaidBlocks(content);
    if (mermaidBlocks.length > 0) {
      console.log(`[LangGraph Diagrams] Found ${mermaidBlocks.length} mermaid diagram(s)`);
      for (const mermaidSyntax of mermaidBlocks) {
        const cleanedSyntax = cleanSequenceDiagramSyntax(mermaidSyntax);

        const diagramType = detectDiagramType(cleanedSyntax);
        const newArtifact: NewArtifact = {
          projectId,
          type: diagramType,
          content: { mermaid: cleanedSyntax },
          status: 'draft',
        };
        await db.insert(artifacts).values(newArtifact);
        console.log(`[LangGraph Diagrams] Saved ${diagramType} diagram to artifacts`);
      }
    }
  } catch (error) {
    console.error('[LangGraph Diagrams] Error saving diagrams:', error);
  }
}

/**
 * Parse existing project data into ExtractionResult format
 */
function parseExistingData(data: ProjectContext['projectData']): ExtractionResult {
  if (!data) {
    return {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    };
  }

  return {
    actors: Array.isArray(data.actors) ? data.actors : [],
    useCases: Array.isArray(data.useCases) ? data.useCases : [],
    systemBoundaries:
      data.systemBoundaries &&
      typeof data.systemBoundaries === 'object' &&
      'internal' in (data.systemBoundaries as object)
        ? (data.systemBoundaries as { internal: string[]; external: string[] })
        : { internal: [], external: [] },
    dataEntities: Array.isArray(data.dataEntities) ? data.dataEntities : [],
  };
}

/**
 * Update project data in database from LangGraph state
 */
async function updateProjectDataFromState(
  projectId: number,
  state: IntakeState | Partial<IntakeState>
): Promise<void> {
  // [STATE_DEBUG] Function entry
  console.log(`[STATE_DEBUG] updateProjectDataFromState called for project ${projectId}`);

  try {
    const { extractedData, completeness } = state;

    // [STATE_DEBUG] Data presence check
    console.log(`[STATE_DEBUG] Has extractedData: ${!!extractedData}, completeness: ${completeness}`);
    if (extractedData) {
      console.log(`[STATE_DEBUG] Data to save - actors: ${extractedData.actors?.length ?? 0}, useCases: ${extractedData.useCases?.length ?? 0}`);
    }

    if (!extractedData && completeness === undefined) {
      console.log(`[STATE_DEBUG] Nothing to update, returning early`);
      return; // Nothing to update
    }

    // Check if project data exists
    const existing = await db.query.projectData.findFirst({
      where: eq(projectData.projectId, projectId),
    });

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (extractedData) {
      updateData.actors = extractedData.actors;
      updateData.useCases = extractedData.useCases;
      updateData.systemBoundaries = extractedData.systemBoundaries;
      updateData.dataEntities = extractedData.dataEntities;
      if (extractedData.problemStatement) {
        updateData.problemStatement = extractedData.problemStatement;
      }
      if (extractedData.goalsMetrics) {
        updateData.goalsMetrics = extractedData.goalsMetrics;
      }
      updateData.lastExtractedAt = new Date();
    }

    if (completeness !== undefined) {
      updateData.completeness = completeness;
    }

    if (existing) {
      await db
        .update(projectData)
        .set(updateData)
        .where(eq(projectData.projectId, projectId));
      // [STATE_DEBUG] Update success
      console.log(`[STATE_DEBUG] Project data updated successfully`);
    } else {
      await db.insert(projectData).values({
        projectId,
        ...updateData,
        createdAt: new Date(),
      });
      // [STATE_DEBUG] Insert success
      console.log(`[STATE_DEBUG] Project data inserted successfully`);
    }
  } catch (error) {
    // Log but don't throw - we don't want to fail the chat response
    console.error('[LangGraph Handler] Failed to update project data:', error);
  }
}

// ============================================================
// Post-Intake Generation
// ============================================================

/**
 * Trigger generation of backend artifacts after intake completes.
 *
 * Runs 6 generator agents:
 * - Phase 1 (parallel): tech stack, user stories, schema, API spec, infrastructure
 * - Phase 2 (sequential): coding guidelines (depends on tech stack result)
 *
 * Uses Promise.allSettled for graceful partial failures.
 * Persists results to projectData and userStories tables.
 */
async function triggerPostIntakeGeneration(
  projectId: number,
  extractedData: ExtractionResult,
  projectName: string,
  projectVision: string,
): Promise<string> {
  console.log(`[POST_INTAKE] Starting post-intake generation for project ${projectId}`);

  // Query project onboarding metadata and map to KBProjectContext
  let projectContext: Partial<KBProjectContext> = {};
  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      columns: { projectType: true, projectStage: true, budget: true },
    });
    if (project) {
      const typeMap: Record<string, KBProjectContext['projectType']> = {
        saas: 'saas', marketplace: 'marketplace', mobile: 'mobile',
        'api-platform': 'api-platform', 'ai-product': 'ai-product',
        'e-commerce': 'e-commerce', 'internal-tool': 'internal-tool',
        'open-source': 'open-source',
      };
      const stageMap: Record<string, KBProjectContext['stage']> = {
        idea: 'idea', prototype: 'mvp', mvp: 'mvp', growth: 'growth', mature: 'mature',
      };
      const budgetMap: Record<string, KBProjectContext['budget']> = {
        'bootstrap': 'bootstrap', 'seed': 'seed', 'series-a': 'series-a',
        'enterprise': 'enterprise', '$0-$100': 'bootstrap', '$100-$1K': 'seed',
        '$1K-$10K': 'series-a', '$10K+': 'enterprise',
      };
      if (project.projectType && typeMap[project.projectType]) {
        projectContext.projectType = typeMap[project.projectType];
      }
      if (project.projectStage && stageMap[project.projectStage]) {
        projectContext.stage = stageMap[project.projectStage];
      }
      if (project.budget && budgetMap[project.budget]) {
        projectContext.budget = budgetMap[project.budget];
      }
    }
  } catch (error) {
    console.warn('[POST_INTAKE] Failed to load project context, using generic:', error);
  }

  const actors = extractedData.actors ?? [];
  const useCases = extractedData.useCases ?? [];
  let dataEntities = extractedData.dataEntities ?? [];
  const systemBoundaries = extractedData.systemBoundaries;
  const problemStatement = extractedData.problemStatement;
  const goalsMetrics = extractedData.goalsMetrics ?? [];
  const nfrs = extractedData.nonFunctionalRequirements ?? [];

  // ── Derive entities from ALL available data when extraction left them empty ──
  if (dataEntities.length === 0) {
    console.log(`[POST_INTAKE] No dataEntities found, deriving from actors, use cases, and boundaries`);
    const entityMap = new Map<string, { attributes: string[]; relationships: string[] }>();

    // 1. Actors ARE entities — they interact with the system, so they need DB representation
    for (const actor of actors) {
      if (!actor.name || actor.role === 'To be determined') continue;
      // Strip parenthetical qualifiers: "AI Agent (Initiator)" → "AI Agent"
      const baseName = actor.name.replace(/\s*\(.*?\)\s*/g, '').trim();
      if (!baseName) continue;

      const existing = entityMap.get(baseName);
      const attrs = existing?.attributes ?? ['id', 'created_at', 'updated_at'];
      const rels = existing?.relationships ?? [];

      attrs.push('name', 'status', 'role', 'description');
      if (actor.demographics) attrs.push('demographics');
      if (actor.technicalProficiency) attrs.push('technical_proficiency');
      if (actor.usageContext) attrs.push('usage_context');
      // Actor goals suggest capability/permission attributes
      if (actor.goals?.length) {
        attrs.push('permissions', 'capabilities');
        for (const goal of actor.goals) {
          // "Securely authenticate identity" → authentication-related fields
          if (/authenticat/i.test(goal)) attrs.push('credentials', 'auth_token');
          if (/communicat|channel/i.test(goal)) attrs.push('communication_channel');
          if (/monitor|log|audit/i.test(goal)) attrs.push('audit_log');
          if (/config|manage|polic/i.test(goal)) attrs.push('configuration', 'policies');
        }
      }
      // Actor pain points suggest what the system must handle
      if (actor.painPoints?.length) {
        for (const pain of actor.painPoints) {
          if (/credential|identity/i.test(pain)) attrs.push('identity_verified', 'credential_type');
          if (/trust/i.test(pain)) attrs.push('trust_level', 'trust_score');
          if (/security|breach/i.test(pain)) attrs.push('security_level');
          if (/scale|overwhelm/i.test(pain)) attrs.push('rate_limit', 'max_concurrent');
        }
      }

      entityMap.set(baseName, { attributes: attrs, relationships: rels });
    }

    // 2. Use case mainFlow steps reveal resources, tokens, sessions, events
    for (const uc of useCases) {
      if (uc.mainFlow) {
        for (const step of uc.mainFlow) {
          const text = `${step.action ?? ''} ${step.systemResponse ?? ''}`.toLowerCase();
          // Direct object mentions become entities
          if (/token|certificate|credential/i.test(text)) {
            const e = entityMap.get('AuthToken') ?? { attributes: ['id', 'created_at', 'updated_at'], relationships: [] };
            e.attributes.push('token_value', 'token_type', 'issued_at', 'expires_at', 'issuer_id', 'subject_id', 'scope', 'is_revoked');
            entityMap.set('AuthToken', e);
          }
          if (/session|channel/i.test(text)) {
            const e = entityMap.get('Session') ?? { attributes: ['id', 'created_at', 'updated_at'], relationships: [] };
            e.attributes.push('initiator_id', 'responder_id', 'status', 'started_at', 'expires_at', 'session_type');
            entityMap.set('Session', e);
          }
          if (/request|attempt/i.test(text)) {
            const e = entityMap.get('AuthRequest') ?? { attributes: ['id', 'created_at', 'updated_at'], relationships: [] };
            e.attributes.push('requester_id', 'target_id', 'status', 'request_type', 'context', 'response_code', 'resolved_at');
            entityMap.set('AuthRequest', e);
          }
          if (/polic|rule|config/i.test(text)) {
            const e = entityMap.get('Policy') ?? { attributes: ['id', 'created_at', 'updated_at'], relationships: [] };
            e.attributes.push('name', 'description', 'rules', 'scope', 'priority', 'is_active', 'created_by');
            entityMap.set('Policy', e);
          }
          if (/log|audit|event|record/i.test(text)) {
            const e = entityMap.get('AuditEvent') ?? { attributes: ['id', 'created_at'], relationships: [] };
            e.attributes.push('event_type', 'actor_id', 'target_id', 'action', 'outcome', 'metadata', 'ip_address');
            entityMap.set('AuditEvent', e);
          }
          if (/alert|notif/i.test(text)) {
            const e = entityMap.get('Notification') ?? { attributes: ['id', 'created_at'], relationships: [] };
            e.attributes.push('recipient_id', 'type', 'title', 'message', 'severity', 'is_read', 'action_url');
            entityMap.set('Notification', e);
          }
        }
      }

      // Preconditions/postconditions reveal state transitions and entity fields
      for (const cond of [...(uc.preconditions ?? []), ...(uc.postconditions ?? [])]) {
        if (/trust|store|registry/i.test(cond)) {
          const e = entityMap.get('TrustRelationship') ?? { attributes: ['id', 'created_at', 'updated_at'], relationships: [] };
          e.attributes.push('source_id', 'target_id', 'trust_level', 'established_at', 'expires_at', 'evidence');
          entityMap.set('TrustRelationship', e);
        }
      }
    }

    // 3. System boundary internals = services/components that need entities
    if (systemBoundaries?.internal) {
      for (const item of systemBoundaries.internal) {
        // Skip vague requirement descriptions
        if (/requirement|performance|scalability|capacity/i.test(item)) continue;
        // Services like "Token generation and management" → "Token" entity already handled
        // But "Agent identity registry" → likely an entity
        if (/registry/i.test(item)) {
          const e = entityMap.get('IdentityRegistry') ?? { attributes: ['id', 'created_at', 'updated_at'], relationships: [] };
          e.attributes.push('agent_id', 'public_key', 'identity_type', 'registered_at', 'is_active', 'metadata');
          entityMap.set('IdentityRegistry', e);
        }
      }
    }

    // 4. System boundary externals = integration points
    if (systemBoundaries?.external) {
      for (const ext of systemBoundaries.external) {
        if (/certificate authority/i.test(ext)) {
          const e = entityMap.get('Certificate') ?? { attributes: ['id', 'created_at'], relationships: [] };
          e.attributes.push('subject', 'issuer', 'serial_number', 'valid_from', 'valid_until', 'public_key', 'is_revoked');
          entityMap.set('Certificate', e);
        }
      }
    }

    // Build cross-entity relationships
    const entityNames = Array.from(entityMap.keys());
    for (const [name, entity] of entityMap) {
      // Deduplicate attributes
      entity.attributes = [...new Set(entity.attributes)];
      // Link entities that reference each other via _id fields
      for (const attr of entity.attributes) {
        if (attr.endsWith('_id')) {
          const refName = attr.replace(/_id$/, '');
          const match = entityNames.find(n => n.toLowerCase().includes(refName));
          if (match && match !== name) {
            entity.relationships.push(`belongs to ${match}`);
          }
        }
      }
      // If no specific relationships, connect to core entities
      if (entity.relationships.length === 0 && name !== 'AuditEvent') {
        for (const other of entityNames) {
          if (other !== name && !['AuditEvent', 'Notification'].includes(other)) {
            entity.relationships.push(`associated with ${other}`);
            break; // Just one default relationship
          }
        }
      }
    }

    dataEntities = entityNames.map(name => ({
      name,
      attributes: entityMap.get(name)!.attributes,
      relationships: [...new Set(entityMap.get(name)!.relationships)],
    }));

    console.log(`[POST_INTAKE] Derived ${dataEntities.length} entities: ${entityNames.join(', ')}`);
  }

  // ── Build enriched vision from ALL available context ──
  const visionParts = [projectVision];

  if (problemStatement) {
    visionParts.push('');
    visionParts.push(`## Problem`);
    if (problemStatement.summary) visionParts.push(problemStatement.summary);
    if (problemStatement.context) visionParts.push(`Context: ${problemStatement.context}`);
    if (problemStatement.impact) visionParts.push(`Impact: ${problemStatement.impact}`);
    if (problemStatement.targetAudience) visionParts.push(`Target Audience: ${problemStatement.targetAudience}`);
    if (problemStatement.goals?.length) visionParts.push(`Goals: ${problemStatement.goals.join('; ')}`);
  }

  if (goalsMetrics.length > 0) {
    visionParts.push('');
    visionParts.push(`## Success Metrics`);
    for (const gm of goalsMetrics) {
      const parts = [`${gm.goal}: ${gm.metric}`];
      if (gm.target) parts.push(`target=${gm.target}`);
      if (gm.baseline) parts.push(`baseline=${gm.baseline}`);
      if (gm.timeframe) parts.push(`by ${gm.timeframe}`);
      visionParts.push(`- ${parts.join(', ')}`);
    }
  }

  if (systemBoundaries) {
    visionParts.push('');
    visionParts.push(`## System Scope`);
    if (systemBoundaries.inScope?.length) visionParts.push(`In scope: ${systemBoundaries.inScope.join('; ')}`);
    if (systemBoundaries.outOfScope?.length) visionParts.push(`Out of scope: ${systemBoundaries.outOfScope.join('; ')}`);
    if (systemBoundaries.internal?.length) visionParts.push(`Internal components: ${systemBoundaries.internal.join('; ')}`);
    if (systemBoundaries.external?.length) visionParts.push(`External systems: ${systemBoundaries.external.join('; ')}`);
  }

  if (nfrs.length > 0) {
    visionParts.push('');
    visionParts.push(`## Non-Functional Requirements`);
    for (const nfr of nfrs) {
      const parts = [`[${nfr.category}/${nfr.priority}] ${nfr.requirement}`];
      if (nfr.metric) parts.push(`metric: ${nfr.metric}`);
      if (nfr.target) parts.push(`target: ${nfr.target}`);
      visionParts.push(`- ${parts.join(' — ')}`);
    }
  }

  if (actors.length > 0) {
    visionParts.push('');
    visionParts.push(`## Key Actors (${actors.filter(a => a.role !== 'To be determined').length} detailed)`);
    for (const actor of actors) {
      if (actor.role === 'To be determined') continue;
      const parts = [`${actor.name} (${actor.role}): ${actor.description}`];
      if (actor.goals?.length) parts.push(`Goals: ${actor.goals.join('; ')}`);
      if (actor.painPoints?.length) parts.push(`Pain points: ${actor.painPoints.join('; ')}`);
      visionParts.push(`- ${parts.join('. ')}`);
    }
  }

  const enrichedVision = visionParts.join('\n');

  // ── Build enriched use case descriptions (include mainFlow, acceptance criteria) ──
  const enrichedUseCaseDescriptions = useCases.map(uc => {
    const parts = [uc.description];
    if (uc.trigger) parts.push(`Trigger: ${uc.trigger}`);
    if (uc.outcome) parts.push(`Outcome: ${uc.outcome}`);
    if (uc.mainFlow?.length) {
      parts.push('Flow: ' + uc.mainFlow.map(s =>
        `${s.stepNumber}. [${s.actor}] ${s.action} → ${s.systemResponse}`
      ).join(' | '));
    }
    if (uc.alternativeFlows?.length) {
      for (const af of uc.alternativeFlows) {
        parts.push(`Alt flow "${af.name}" (from step ${af.branchPoint}, when: ${af.condition}): ${af.steps.map(s => s.action).join(' → ')}`);
      }
    }
    if (uc.acceptanceCriteria?.length) {
      parts.push(`Acceptance: ${uc.acceptanceCriteria.join('; ')}`);
    }
    if (uc.preconditions?.length) parts.push(`Pre: ${uc.preconditions.join('; ')}`);
    if (uc.postconditions?.length) parts.push(`Post: ${uc.postconditions.join('; ')}`);
    return parts.join('\n');
  });

  // Build contexts for each generator
  const techStackCtx: TechStackContext = {
    projectName,
    projectVision: enrichedVision,
    useCases: useCases.map((uc, i) => ({ name: uc.name, description: enrichedUseCaseDescriptions[i] })),
    dataEntities: dataEntities.map(e => ({ name: e.name })),
    projectContext,
  };

  const userStoriesCtx: UserStoriesContext = {
    projectName,
    projectVision: enrichedVision,
    useCases: useCases.map((uc, i) => ({
      id: uc.id,
      name: uc.name,
      description: enrichedUseCaseDescriptions[i],
      actor: uc.actor,
      trigger: uc.trigger ?? undefined,
      outcome: uc.outcome ?? undefined,
      preconditions: uc.preconditions ?? undefined,
      postconditions: uc.postconditions ?? undefined,
      priority: uc.priority ?? undefined,
    })),
    actors: actors.map(a => ({
      name: a.name,
      role: a.role,
    })),
    projectContext,
  };

  const schemaCtx: SchemaExtractionContext = {
    projectName,
    projectVision: enrichedVision,
    dataEntities: dataEntities.map(e => ({
      name: e.name,
      attributes: e.attributes ?? [],
      relationships: e.relationships ?? [],
    })),
    useCases: useCases.map((uc, i) => ({ name: uc.name, description: enrichedUseCaseDescriptions[i] })),
    projectContext,
  };

  const apiSpecCtx: APISpecGenerationContext = {
    projectName,
    projectVision: enrichedVision,
    useCases: useCases.map((uc, i) => ({
      id: uc.id,
      name: uc.name,
      description: enrichedUseCaseDescriptions[i],
      actor: uc.actor,
      preconditions: uc.preconditions ?? undefined,
      postconditions: uc.postconditions ?? undefined,
    })),
    dataEntities: dataEntities.map(e => ({
      name: e.name,
      attributes: e.attributes ?? [],
      relationships: e.relationships ?? [],
    })),
    projectContext,
  };

  const infraCtx: InfrastructureContext = {
    projectName,
    projectDescription: enrichedVision,
    projectContext,
  };

  // Phase 1: Run 5 generators in parallel
  console.log(`[POST_INTAKE] Running 5 generators in parallel...`);
  const [techStackResult, storiesResult, schemaResult, apiSpecResult, infraResult] =
    await Promise.allSettled([
      recommendTechStack(techStackCtx),
      generateUserStories(userStoriesCtx),
      extractDatabaseSchema(schemaCtx),
      generateAPISpecification(apiSpecCtx),
      generateInfrastructureSpec(infraCtx),
    ]);

  // Phase 2: Guidelines depends on tech stack result
  console.log(`[POST_INTAKE] Running guidelines generator...`);
  let guidelinesResult: PromiseSettledResult<unknown>;
  if (techStackResult.status === 'fulfilled') {
    const guidelinesCtx: GuidelinesContext = {
      projectName,
      techStack: techStackResult.value,
      projectContext,
    };
    [guidelinesResult] = await Promise.allSettled([generateCodingGuidelines(guidelinesCtx)]);
  } else {
    guidelinesResult = {
      status: 'rejected' as const,
      reason: new Error('Skipped: tech stack generation failed'),
    };
  }

  // Collect results
  const succeeded: string[] = [];
  const failed: string[] = [];
  const allResults: [string, PromiseSettledResult<unknown>][] = [
    ['tech stack', techStackResult],
    ['user stories', storiesResult],
    ['database schema', schemaResult],
    ['API specification', apiSpecResult],
    ['infrastructure', infraResult],
    ['coding guidelines', guidelinesResult],
  ];

  for (const [name, result] of allResults) {
    if (result.status === 'fulfilled') {
      succeeded.push(name);
    } else {
      failed.push(name);
      console.error(`[POST_INTAKE] ${name} failed:`, (result as PromiseRejectedResult).reason);
    }
  }

  console.log(`[POST_INTAKE] Generation complete: ${succeeded.length}/6 succeeded`);

  // Persist results to database
  try {
    const updatePayload: Record<string, unknown> = { updatedAt: new Date() };

    if (techStackResult.status === 'fulfilled') {
      updatePayload.techStack = techStackResult.value;
    }
    if (schemaResult.status === 'fulfilled') {
      updatePayload.databaseSchema = schemaResult.value;
    }
    if (apiSpecResult.status === 'fulfilled') {
      updatePayload.apiSpecification = apiSpecResult.value;
    }
    if (infraResult.status === 'fulfilled') {
      updatePayload.infrastructureSpec = infraResult.value;
    }
    if (guidelinesResult.status === 'fulfilled') {
      updatePayload.codingGuidelines = guidelinesResult.value;
    }

    if (Object.keys(updatePayload).length > 1) {
      await db
        .update(projectData)
        .set(updatePayload)
        .where(eq(projectData.projectId, projectId));
      console.log(`[POST_INTAKE] Saved generated data to project_data`);
    }

    // Save user stories to separate table
    if (storiesResult.status === 'fulfilled' && Array.isArray(storiesResult.value) && storiesResult.value.length > 0) {
      const storyValues = storiesResult.value.map((story, idx) => ({
        projectId,
        useCaseId: story.useCaseId ?? null,
        title: story.title,
        description: story.description,
        actor: story.actor ?? 'User',
        epic: story.epic ?? null,
        acceptanceCriteria: story.acceptanceCriteria ?? [],
        status: 'backlog' as const,
        priority: story.priority ?? 'medium',
        estimatedEffort: story.estimatedEffort ?? null,
        order: idx,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.insert(userStories).values(storyValues);
      console.log(`[POST_INTAKE] Saved ${storyValues.length} user stories`);
    }

    // Update project status
    await db
      .update(projects)
      .set({ status: 'in_progress', updatedAt: new Date() })
      .where(eq(projects.id, projectId));
  } catch (error) {
    console.error(`[POST_INTAKE] Failed to persist results:`, error);
  }

  // Build summary
  if (succeeded.length === 0) {
    return 'Generation failed for all artifacts. You can regenerate from the project page.';
  }
  const parts = [`Generated ${succeeded.length} artifacts: ${succeeded.join(', ')}.`];
  if (failed.length > 0) {
    parts.push(`Failed: ${failed.join(', ')}.`);
  }
  return parts.join(' ');
}

/**
 * Simple token estimation (rough approximation)
 * GPT models use ~4 characters per token on average
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if LangGraph feature is enabled
 * Reads from environment variable for gradual rollout
 *
 * @returns true if LangGraph should be used
 */
export function isLangGraphEnabled(): boolean {
  const enabled = process.env.USE_LANGGRAPH === 'true';
  // [STATE_DEBUG] Feature flag check
  console.log(`[STATE_DEBUG] isLangGraphEnabled: ${enabled} (USE_LANGGRAPH=${process.env.USE_LANGGRAPH})`);
  return enabled;
}
