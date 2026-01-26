import { StateGraph, END, START, Annotation, messagesStateReducer } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import type {
  IntakeState,
  ArtifactPhase,
  UserIntent,
  ArtifactReadiness,
  ValidationResult,
  PendingArtifact,
  StepStatus,
  GuessHistoryEntry,
} from './types';
import type { KnowledgeBankStep } from '@/lib/education/knowledge-bank';
import type { ExtractionResult } from '../schemas';
import {
  createDefaultExtractionResult,
  createDefaultArtifactReadiness,
} from './channels';
import {
  routeAfterAnalysis,
  routeAfterExtraction,
  routeAfterValidation,
  routeAfterArtifact,
  shouldForceEnd,
  type AnalyzeRouteTarget,
  type ExtractRouteTarget,
  type ValidationRouteTarget,
  type ArtifactRouteTarget,
} from './edges';

/**
 * LangGraph Intake Graph Assembly for Product-Helper
 *
 * This module assembles the complete intake workflow graph by combining
 * all node functions and edge routing logic.
 *
 * Graph Topology:
 * ```
 *                                    +-------------------+
 *                                    |      START        |
 *                                    +--------+----------+
 *                                             |
 *                                             v
 *                                    +-------------------+
 *                                    | analyze_response  |
 *                                    | (Intent Detection)|
 *                                    +--------+----------+
 *                                             |
 *                  +--------------------------+-------------------------+
 *                  |                          |                         |
 *                  v                          v                         v
 *        +---------+--------+      +----------+---------+     +---------+--------+
 *        |   extract_data   |      | check_prd_spec   |     | compute_next_    |
 *        | (Data Extraction)|      | (Validation)       |     | question         |
 *        +---------+--------+      +----------+---------+     +---------+--------+
 *                  |                          |                         |
 *                  v                          v                         v
 *        +---------+--------+      +----------+---------+     +---------+--------+
 *        | check_prd_spec |      | generate_artifact  |     | generate_response|
 *        | or compute_next  |      | (Diagram/Table)    |     | (AI Reply)       |
 *        +---------+--------+      +----------+---------+     +---------+--------+
 *                  |                          |                         |
 *                  v                          v                         v
 *              [routing]               [routing]                      END
 *                  |                          |
 *                  +----------+---------------+
 *                             |
 *                             v
 *                           END
 * ```
 *
 * @module graphs/intake-graph
 */

// ============================================================
// Node Function Types
// ============================================================

/**
 * Node function signature for the state graph
 * Each node takes the current state and returns a partial state update
 */
type NodeFunction = (state: IntakeState) => Promise<Partial<IntakeState>>;

// ============================================================
// Node Function Placeholders
// ============================================================

/**
 * Analyze Response Node
 * Detects user intent from the last message
 *
 * This is a placeholder - actual implementation in nodes/analyze-response.ts
 */
async function analyzeResponse(state: IntakeState): Promise<Partial<IntakeState>> {
  // Import dynamically to avoid circular dependencies
  const { analyzeResponse: analyzeResponseImpl } = await import('./nodes/analyze-response');
  return analyzeResponseImpl(state);
}

/**
 * Extract Data Node
 * Extracts structured PRD data from conversation
 *
 * This is a placeholder - actual implementation in nodes/extract-data.ts
 */
async function extractData(state: IntakeState): Promise<Partial<IntakeState>> {
  // Import dynamically to avoid circular dependencies
  const { extractData: extractDataImpl } = await import('./nodes/extract-data');
  return extractDataImpl(state);
}

/**
 * Compute Next Question Node
 * Generates the next question based on data gaps
 *
 * This is a placeholder - actual implementation in nodes/compute-next-question.ts
 */
async function computeNextQuestion(state: IntakeState): Promise<Partial<IntakeState>> {
  // Import dynamically to avoid circular dependencies
  const { computeNextQuestion: computeNextQuestionImpl } = await import('./nodes/compute-next-question');
  return computeNextQuestionImpl(state);
}

/**
 * Check PRD-SPEC Node
 * Validates extracted data against PRD-SPEC standards
 *
 * This is a placeholder - actual implementation in nodes/check-prd-spec.ts
 */
async function checkPRDSpec(state: IntakeState): Promise<Partial<IntakeState>> {
  // Import dynamically to avoid circular dependencies
  const { checkPRDSpec: checkPRDSpecImpl } = await import('./nodes/check-prd-spec');
  return checkPRDSpecImpl(state);
}

/**
 * Generate Artifact Node
 * Generates diagrams and tables for the current phase
 *
 * This is a placeholder - actual implementation in nodes/generate-artifact.ts
 */
async function generateArtifact(state: IntakeState): Promise<Partial<IntakeState>> {
  // Import dynamically to avoid circular dependencies
  const { generateArtifact: generateArtifactImpl } = await import('./nodes/generate-artifact');
  return generateArtifactImpl(state);
}

/**
 * Generate Response Node
 * Creates the conversational AI response
 *
 * This is a placeholder - actual implementation in nodes/generate-response.ts
 */
async function generateResponse(state: IntakeState): Promise<Partial<IntakeState>> {
  // Import dynamically to avoid circular dependencies
  const { generateResponse: generateResponseImpl } = await import('./nodes/generate-response');
  return generateResponseImpl(state);
}

// ============================================================
// State Annotation Definition
// ============================================================

/**
 * Artifacts array reducer - appends new artifacts while keeping uniqueness
 */
function artifactsReducer(
  left: ArtifactPhase[],
  right: ArtifactPhase | ArtifactPhase[] | undefined
): ArtifactPhase[] {
  if (!right) return left;
  const items = Array.isArray(right) ? right : [right];
  return Array.from(new Set([...left, ...items]));
}

/**
 * LangGraph Annotation definition for IntakeState
 *
 * Uses the Annotation.Root pattern for LangGraph 0.2+
 * Each field has a reducer (how to merge updates) and default value
 */
const IntakeStateAnnotation = Annotation.Root({
  // Accumulated fields (use custom reducers)
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  generatedArtifacts: Annotation<ArtifactPhase[]>({
    reducer: artifactsReducer,
    default: () => [],
  }),

  // Project context (last value wins)
  projectId: Annotation<number>,
  projectName: Annotation<string>,
  projectVision: Annotation<string>,
  teamId: Annotation<number>,

  // Extracted data (last value wins)
  extractedData: Annotation<ExtractionResult>({
    reducer: (a, b) => b ?? a,
    default: createDefaultExtractionResult,
  }),
  completeness: Annotation<number>,
  artifactReadiness: Annotation<ArtifactReadiness>({
    reducer: (a, b) => b ?? a,
    default: createDefaultArtifactReadiness,
  }),

  // Phase tracking
  currentPhase: Annotation<ArtifactPhase>,

  // Per-turn analysis
  lastIntent: Annotation<UserIntent>,
  validationResult: Annotation<ValidationResult | null>,
  pendingQuestion: Annotation<string | null>,
  pendingArtifact: Annotation<PendingArtifact | null>,

  // Knowledge bank tracking
  currentKBStep: Annotation<KnowledgeBankStep>,
  kbStepConfidence: Annotation<number>,
  kbStepData: Annotation<Record<string, unknown>>({
    reducer: (a, b) => b ? { ...a, ...b } : a,
    default: () => ({}),
  }),
  approvalPending: Annotation<boolean>,
  askedQuestions: Annotation<string[]>({
    reducer: (existing, incoming) => {
      if (!incoming) return existing;
      const items = Array.isArray(incoming) ? incoming : [incoming];
      return Array.from(new Set([...(existing || []), ...items]));
    },
    default: () => [],
  }),
  stepCompletionStatus: Annotation<Record<KnowledgeBankStep, StepStatus>>({
    reducer: (existing, incoming) => {
      if (!incoming) return existing;
      const result = { ...existing };
      for (const [key, val] of Object.entries(incoming)) {
        const prev = result[key as KnowledgeBankStep];
        if (prev && val) {
          result[key as KnowledgeBankStep] = {
            roundsAsked: val.roundsAsked ?? prev.roundsAsked,
            coveredTopics: Array.from(new Set([...prev.coveredTopics, ...(val.coveredTopics ?? [])])),
            confirmed: val.confirmed ?? prev.confirmed,
            generationApproved: val.generationApproved ?? prev.generationApproved,
          };
        } else if (val) {
          result[key as KnowledgeBankStep] = val;
        }
      }
      return result;
    },
    default: () => {
      const steps: KnowledgeBankStep[] = ['context-diagram', 'use-case-diagram', 'scope-tree', 'ucbd', 'functional-requirements', 'sysml-activity-diagram'];
      const status = {} as Record<KnowledgeBankStep, StepStatus>;
      for (const step of steps) {
        status[step] = { roundsAsked: 0, coveredTopics: [], confirmed: false, generationApproved: false };
      }
      return status;
    },
  }),
  guessHistory: Annotation<GuessHistoryEntry[]>({
    reducer: (existing, incoming) => {
      if (!incoming) return existing;
      const items = Array.isArray(incoming) ? incoming : [incoming];
      return [...(existing || []), ...items];
    },
    default: () => [],
  }),

  // Control flags
  isComplete: Annotation<boolean>,
  error: Annotation<string | null>,
  turnCount: Annotation<number>,
});

/**
 * Type alias for the state derived from the Annotation
 */
type GraphState = typeof IntakeStateAnnotation.State;

// ============================================================
// Graph Builder
// ============================================================

/**
 * Build the intake state graph
 *
 * Creates a LangGraph StateGraph with all nodes and edges configured.
 * The graph orchestrates the conversational PRD intake workflow.
 *
 * @returns Compiled state graph ready for invocation
 *
 * @example
 * ```typescript
 * const graph = buildIntakeGraph();
 *
 * // Create initial state
 * const state = createInitialState(projectId, name, vision, teamId);
 * state.messages.push(new HumanMessage(userInput));
 *
 * // Invoke the graph
 * const result = await graph.invoke(state);
 *
 * // Get AI response
 * const aiMessages = result.messages.filter(m => m._getType() === 'ai');
 * const response = aiMessages[aiMessages.length - 1]?.content;
 * ```
 */
export function buildIntakeGraph() {
  // Build the graph using method chaining to properly accumulate node types
  // Each addNode call returns a new graph type with the node added
  const graph = new StateGraph(IntakeStateAnnotation)
    // ============================================================
    // Add Nodes
    // ============================================================
    .addNode('analyze_response', analyzeResponse)
    .addNode('extract_data', extractData)
    .addNode('compute_next_question', computeNextQuestion)
    .addNode('check_prd_spec', checkPRDSpec)
    .addNode('generate_artifact', generateArtifact)
    .addNode('generate_response', generateResponse)
    // ============================================================
    // Add Entry Edge
    // ============================================================
    .addEdge(START, 'analyze_response')
    // ============================================================
    // Add Conditional Edges
    // ============================================================
    // After analysis: route based on detected intent
    .addConditionalEdges(
      'analyze_response',
      routeAfterAnalysis,
      ['extract_data', 'check_prd_spec', 'compute_next_question']
    )
    // After extraction: check validation or ask more questions
    .addConditionalEdges(
      'extract_data',
      routeAfterExtraction,
      ['check_prd_spec', 'compute_next_question']
    )
    // After validation: generate artifact, ask more, or end
    .addConditionalEdges(
      'check_prd_spec',
      routeAfterValidation,
      ['generate_artifact', 'compute_next_question', END]
    )
    // After artifact generation: continue or end
    .addConditionalEdges(
      'generate_artifact',
      routeAfterArtifact,
      ['check_prd_spec', END]
    )
    // ============================================================
    // Add Simple Edges
    // ============================================================
    // After computing question: always generate response
    .addEdge('compute_next_question', 'generate_response')
    // After response: end turn (await next user input)
    .addEdge('generate_response', END);

  // ============================================================
  // Compile and Return
  // ============================================================

  return graph.compile();
}

// ============================================================
// Graph Instance Management
// ============================================================

/**
 * Singleton graph instance
 * Reused across invocations for efficiency
 */
let _graphInstance: ReturnType<typeof buildIntakeGraph> | null = null;

/**
 * Get or create the intake graph instance
 *
 * Uses a singleton pattern to avoid rebuilding the graph on every request.
 * The graph is stateless - state is passed in on each invocation.
 *
 * @returns The compiled intake graph
 *
 * @example
 * ```typescript
 * const graph = getIntakeGraph();
 * const result = await graph.invoke(state);
 * ```
 */
export function getIntakeGraph(): ReturnType<typeof buildIntakeGraph> {
  if (!_graphInstance) {
    _graphInstance = buildIntakeGraph();
  }
  return _graphInstance;
}

/**
 * Reset the graph instance
 *
 * Forces the graph to be rebuilt on next access.
 * Useful for testing or when node implementations change.
 */
export function resetIntakeGraph(): void {
  _graphInstance = null;
}

// ============================================================
// Graph Execution Helpers
// ============================================================

/**
 * Invoke the intake graph with logging
 *
 * Wraps graph invocation with logging for debugging.
 *
 * @param state - The initial state for this invocation
 * @param options - Optional configuration
 * @returns The final state after graph execution
 *
 * @example
 * ```typescript
 * const result = await invokeIntakeGraph(state, {
 *   debug: true,
 *   maxIterations: 10,
 * });
 * ```
 */
export async function invokeIntakeGraph(
  state: IntakeState,
  options: {
    debug?: boolean;
    maxIterations?: number;
  } = {}
): Promise<IntakeState> {
  const { debug = false, maxIterations = 20 } = options;

  // Check for force end conditions before invoking
  if (shouldForceEnd(state)) {
    if (debug) {
      console.log('[IntakeGraph] Force end triggered, skipping invocation');
    }
    return state;
  }

  const graph = getIntakeGraph();

  if (debug) {
    console.log('[IntakeGraph] Starting invocation');
    console.log(`  Project: ${state.projectId} (${state.projectName})`);
    console.log(`  Phase: ${state.currentPhase}`);
    console.log(`  Completeness: ${state.completeness}%`);
    console.log(`  Messages: ${state.messages.length}`);
  }

  try {
    // Invoke the graph with recursion limit
    const result = await graph.invoke(state, {
      recursionLimit: maxIterations,
    });

    if (debug) {
      console.log('[IntakeGraph] Invocation complete');
      console.log(`  New completeness: ${result.completeness}%`);
      console.log(`  Generated artifacts: ${result.generatedArtifacts.length}`);
      console.log(`  Is complete: ${result.isComplete}`);
    }

    return result;
  } catch (error) {
    console.error('[IntakeGraph] Invocation error:', error);

    // Return state with error flag
    return {
      ...state,
      error: error instanceof Error ? error.message : 'Unknown error during graph execution',
    };
  }
}

/**
 * Stream the intake graph execution
 *
 * Yields intermediate states during graph execution.
 * Useful for showing progress to users.
 *
 * @param state - The initial state
 * @yields Intermediate states with node information
 *
 * @example
 * ```typescript
 * for await (const { node, state } of streamIntakeGraph(initialState)) {
 *   console.log(`Executed: ${node}`);
 *   // Update UI with intermediate state
 * }
 * ```
 */
export async function* streamIntakeGraph(
  state: IntakeState
): AsyncGenerator<{ node: string; state: IntakeState }> {
  const graph = getIntakeGraph();

  // Use LangGraph's streaming capability
  const stream = await graph.stream(state, {
    recursionLimit: 20,
  });

  for await (const chunk of stream) {
    // Each chunk is { nodeName: nodeOutput }
    for (const [node, nodeState] of Object.entries(chunk)) {
      yield {
        node,
        state: nodeState as IntakeState,
      };
    }
  }
}

// ============================================================
// Export the Annotation type for external use
// ============================================================

/**
 * Export the state annotation for use by other modules
 * that need to create compatible state objects
 */
export { IntakeStateAnnotation };
