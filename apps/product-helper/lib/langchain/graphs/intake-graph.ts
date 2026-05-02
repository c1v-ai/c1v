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
  routeAfterFFBD,
  routeAfterDecisionMatrix,
  routeAfterQFD,
  shouldForceEnd,
  type AnalyzeRouteTarget,
  type ExtractRouteTarget,
  type ValidationRouteTarget,
  type ArtifactRouteTarget,
  type FFBDRouteTarget,
  type DecisionMatrixRouteTarget,
  type QFDRouteTarget,
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
// Steps 3-6 Node Function Placeholders
// ============================================================

/**
 * Generate FFBD Node (Step 3)
 * Extracts Functional Flow Block Diagrams from conversation and extracted data
 */
async function generateFFBD(state: IntakeState): Promise<Partial<IntakeState>> {
  const { generateFFBD: generateFFBDImpl } = await import('./nodes/generate-ffbd');
  return generateFFBDImpl(state);
}

/**
 * Generate Decision Matrix Node (Step 4)
 * Extracts performance criteria and design alternatives
 */
async function generateDecisionMatrix(state: IntakeState): Promise<Partial<IntakeState>> {
  const { generateDecisionMatrix: generateDecisionMatrixImpl } = await import('./nodes/generate-decision-matrix');
  return generateDecisionMatrixImpl(state);
}

/**
 * Generate QFD House of Quality Node (Step 5)
 * Extracts customer needs, engineering characteristics, and relationships
 */
async function generateQFD(state: IntakeState): Promise<Partial<IntakeState>> {
  const { generateQFD: generateQFDImpl } = await import('./nodes/generate-qfd');
  return generateQFDImpl(state);
}

/**
 * Generate Interfaces Node (Step 6)
 * v2.1 Wave A: AUGMENTED to additionally invoke interface-specs-agent (M7.b).
 */
async function generateInterfaces(state: IntakeState): Promise<Partial<IntakeState>> {
  const { generateInterfaces: generateInterfacesImpl } = await import('./nodes/generate-interfaces');
  return generateInterfacesImpl(state);
}

// ============================================================
// v2.1 Wave A — 7 NEW node placeholders (langgraph-wirer)
// v2.1 Wave B (TB1 observability) — wrapped in `withNodeMetrics` to emit
// per-node start/end + cache_hit/miss events. Cache hit signal is read
// off `state.kbStepData.__cache_hit` if a sibling cache layer set it
// (TB1 cache-and-lazy-gen contract); absent ⇒ unknown.
// ============================================================

import { recordNodeStart, recordNodeEnd } from '@/lib/observability/synthesis-metrics';

function withNodeMetrics(
  nodeName: string,
  fn: (state: IntakeState) => Promise<Partial<IntakeState>>,
): (state: IntakeState) => Promise<Partial<IntakeState>> {
  return async (state) => {
    const project_id = state.projectId;
    const cacheRaw = (state.kbStepData as Record<string, unknown> | undefined)?.__cache_hit;
    const cache_hit = typeof cacheRaw === 'boolean' ? cacheRaw : undefined;
    recordNodeStart({ node: nodeName, project_id, cache_hit });
    const start = performance.now();
    try {
      const result = await fn(state);
      recordNodeEnd({
        node: nodeName,
        project_id,
        latency_ms: performance.now() - start,
        success: true,
        cache_hit,
      });
      return result;
    } catch (err) {
      recordNodeEnd({
        node: nodeName,
        project_id,
        latency_ms: performance.now() - start,
        success: false,
        cache_hit,
      });
      throw err;
    }
  };
}

const generateDataFlows = withNodeMetrics('generate_data_flows', async (state) => {
  const { generateDataFlows: impl } = await import('./nodes/generate-data-flows');
  return impl(state);
});

const generateFormFunction = withNodeMetrics('generate_form_function', async (state) => {
  const { generateFormFunction: impl } = await import('./nodes/generate-form-function');
  return impl(state);
});

const generateDecisionNetwork = withNodeMetrics('generate_decision_network', async (state) => {
  const { generateDecisionNetwork: impl } = await import('./nodes/generate-decision-network');
  return impl(state);
});

const generateN2 = withNodeMetrics('generate_n2', async (state) => {
  const { generateN2: impl } = await import('./nodes/generate-n2');
  return impl(state);
});

const generateFmeaEarly = withNodeMetrics('generate_fmea_early', async (state) => {
  const { generateFmeaEarly: impl } = await import('./nodes/generate-fmea-early');
  return impl(state);
});

const generateFmeaResidual = withNodeMetrics('generate_fmea_residual', async (state) => {
  const { generateFmeaResidual: impl } = await import('./nodes/generate-fmea-residual');
  return impl(state);
});

const generateSynthesis = withNodeMetrics('generate_synthesis', async (state) => {
  const { generateSynthesis: impl } = await import('./nodes/generate-synthesis');
  return impl(state);
});

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

  // Extracted data (shallow-merge under fan-out so parallel branches
  // adding distinct keys — ffbd/decisionMatrix/qfd/interfaces — don't drop)
  extractedData: Annotation<ExtractionResult>({
    reducer: (a, b) => {
      if (!b) return a;
      if (!a) return b;
      return { ...a, ...b };
    },
    default: createDefaultExtractionResult,
  }),
  completeness: Annotation<number>({
    reducer: (a, b) => Math.max(a ?? 0, b ?? 0),
    default: () => 0,
  }),
  artifactReadiness: Annotation<ArtifactReadiness>({
    reducer: (a, b) => {
      if (!b) return a;
      if (!a) return b;
      return { ...a, ...b };
    },
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
      const steps: KnowledgeBankStep[] = [
        'context-diagram', 'use-case-diagram', 'scope-tree', 'ucbd', 'functional-requirements', 'sysml-activity-diagram',
        // Steps 3-6
        'ffbd', 'decision-matrix', 'qfd-house-of-quality', 'interfaces',
      ];
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
/**
 * v2.2 Wave-E DI swap surface (LOCKED per team context).
 *
 * `createIntakeGraph({ nfrImpl })` returns the graph with the requested
 * GENERATE_nfr / GENERATE_constants impl wired:
 *   - `'llm'`    → v2.1 LLM-only path (default pre-swap; baseline window).
 *   - `'engine'` → v2.2 engine-first path (default post-swap, EC-V21-E.12).
 *
 * Both impls preserve the FROZEN Wave A↔E contract envelope
 * (`nfr_engine_contract_version: 'v1'`). qa-e-verifier's
 * implementation-independence proof asserts both pass the same fixtures.
 *
 * Production default-flip (coordinator-owned): swap the default of
 * `nfrImpl` from `'llm'` → `'engine'` in `intake-graph.ts`. The flip is
 * reversible by reverting that one-line change.
 */
import {
  createGenerateNfrNode,
  type NfrImpl,
  type GenerateNfrLlmAgent,
} from './nodes/generate-nfr';
import {
  createGenerateConstantsNode,
  type GenerateConstantsLlmAgent,
} from './nodes/generate-constants';

export interface CreateIntakeGraphOptions {
  /** Default `'llm'` (v2.1 baseline). Flip to `'engine'` post-swap. */
  nfrImpl?: NfrImpl;
  /** Required when `nfrImpl === 'llm'` and the caller wants real LLM emission. */
  nfrLlmAgent?: GenerateNfrLlmAgent;
  /** Required when `nfrImpl === 'llm'` and the caller wants real LLM emission. */
  constantsLlmAgent?: GenerateConstantsLlmAgent;
}

export function createIntakeGraph(options: CreateIntakeGraphOptions = {}) {
  const nfrImpl: NfrImpl = options.nfrImpl ?? 'llm';
  // Bind the impl now so the graph node is a stable reference.
  // Note: GENERATE_nfr / GENERATE_constants are exposed as bound nodes —
  // they aren't yet wired into the graph topology (no upstream graph
  // edges in v2.1 today), but the DI surface is the swap mechanism that
  // qa-e-verifier's implementation-independence proof consumes.
  const _generateNfr = createGenerateNfrNode({
    nfrImpl,
    llmAgent: options.nfrLlmAgent,
  });
  const _generateConstants = createGenerateConstantsNode({
    nfrImpl,
    llmAgent: options.constantsLlmAgent,
  });

  void _generateNfr;
  void _generateConstants;

  return buildIntakeGraph();
}

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
    // Steps 3-6 nodes
    .addNode('generate_ffbd', generateFFBD)
    .addNode('generate_decision_matrix', generateDecisionMatrix)
    .addNode('generate_qfd', generateQFD)
    .addNode('generate_interfaces', generateInterfaces)
    // v2.1 Wave A — 7 NEW nodes (langgraph-wirer; D-V21.25 coexistence preserved
    // for generate_decision_network alongside existing generate_decision_matrix).
    .addNode('generate_data_flows', generateDataFlows)
    .addNode('generate_form_function', generateFormFunction)
    .addNode('generate_decision_network', generateDecisionNetwork)
    .addNode('generate_n2', generateN2)
    .addNode('generate_fmea_early', generateFmeaEarly)
    .addNode('generate_fmea_residual', generateFmeaResidual)
    .addNode('generate_synthesis', generateSynthesis)
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
    // After artifact generation: continue, chain to Steps 3-6, or end
    .addConditionalEdges(
      'generate_artifact',
      routeAfterArtifact,
      ['check_prd_spec', 'generate_ffbd', END]
    )
    // Steps 3-6: FFBD fans out to (Decision Matrix -> QFD) AND Interfaces
    // in parallel. Interfaces runs concurrently with the DM->QFD chain.
    .addConditionalEdges(
      'generate_ffbd',
      routeAfterFFBD,
      ['generate_decision_matrix', 'generate_interfaces', END]
    )
    .addConditionalEdges(
      'generate_decision_matrix',
      routeAfterDecisionMatrix,
      ['generate_qfd', END]
    )
    // Legacy intake terminus.
    .addEdge('generate_qfd', END)
    // v2.1 Wave A — synthesis chain (7 NEW nodes). Routes from
    // `generate_interfaces` into the system-design fan: data_flows →
    // form_function (after FFBD/FMEA already on state) → decision_network →
    // n2 → fmea_early → fmea_residual → synthesis (keystone) → END.
    // This linear order is the dependency order; persistence to
    // project_artifacts happens in each node so partial chains still produce
    // observable rows.
    .addEdge('generate_interfaces', 'generate_data_flows')
    .addEdge('generate_data_flows', 'generate_form_function')
    .addEdge('generate_form_function', 'generate_decision_network')
    .addEdge('generate_decision_network', 'generate_n2')
    .addEdge('generate_n2', 'generate_fmea_early')
    .addEdge('generate_fmea_early', 'generate_fmea_residual')
    .addEdge('generate_fmea_residual', 'generate_synthesis')
    .addEdge('generate_synthesis', END)
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
  const { debug = false, maxIterations = 50 } = options;

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
    // 50 is too low for multi-artifact intake flows — each artifact generation
    // consumes ~5 nodes; 8 artifact phases × 5 + overhead = ~60 minimum.
    // 150 gives headroom without masking genuine infinite loops.
    recursionLimit: 150,
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
