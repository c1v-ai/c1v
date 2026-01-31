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
import { db } from '@/lib/db/drizzle';
import { conversations, projectData, artifacts, type NewArtifact } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cleanSequenceDiagramSyntax } from '@/lib/diagrams/generators';
import {
  getIntakeGraph,
  createInitialState,
  loadCheckpoint,
  saveCheckpoint,
  type IntakeState,
} from '@/lib/langchain/graphs';
import type { ExtractionResult } from '@/lib/langchain/schemas';

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

  try {
    // 1. Load existing checkpoint or create initial state
    let state = await loadCheckpoint(projectId);

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

    // 2. Add user message to state
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

    // 5. Extract AI response from result
    const aiMessages = result.messages.filter(
      (m) => m._getType() === 'ai'
    ) as AIMessage[];
    const lastAIMessage = aiMessages[aiMessages.length - 1];
    const response = lastAIMessage
      ? typeof lastAIMessage.content === 'string'
        ? lastAIMessage.content
        : JSON.stringify(lastAIMessage.content)
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
    await saveCheckpoint(projectId, result);

    // 8. Update project data with extracted information
    await updateProjectDataFromState(projectId, result);

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
  let finalState: IntakeState | null = null;

  const graph = getIntakeGraph();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Use graph.stream for intermediate state updates
        const eventStream = await graph.stream(state, {
          recursionLimit: 20,
        });

        for await (const chunk of eventStream) {
          // Each chunk is { nodeName: nodeOutput }
          for (const [nodeName, nodeOutput] of Object.entries(chunk)) {
            const output = nodeOutput as Partial<IntakeState>;

            // Stream messages as they come in
            if (output.messages && output.messages.length > 0) {
              for (const msg of output.messages) {
                if (msg._getType() === 'ai') {
                  const content =
                    typeof msg.content === 'string'
                      ? msg.content
                      : JSON.stringify(msg.content);

                  // Only send new content
                  const newContent = content.slice(fullResponse.length);
                  if (newContent) {
                    fullResponse = content;
                    controller.enqueue(encoder.encode(newContent));
                  }
                }
              }
            }

            // Capture final state
            if (output.extractedData || output.completeness !== undefined) {
              finalState = output as IntakeState;
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

        // Save checkpoint with accumulated state
        if (finalState) {
          await saveCheckpoint(projectId, {
            ...state,
            ...finalState,
            messages: [
              ...state.messages,
              new AIMessage(fullResponse || 'No response generated'),
            ],
          });

          await updateProjectDataFromState(projectId, finalState);
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
  try {
    const { extractedData, completeness } = state;

    if (!extractedData && completeness === undefined) {
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
    } else {
      await db.insert(projectData).values({
        projectId,
        ...updateData,
        createdAt: new Date(),
      });
    }
  } catch (error) {
    // Log but don't throw - we don't want to fail the chat response
    console.error('[LangGraph Handler] Failed to update project data:', error);
  }
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
  return process.env.USE_LANGGRAPH === 'true';
}
