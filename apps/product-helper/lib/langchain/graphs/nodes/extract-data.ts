/**
 * Extract Data Node
 *
 * Purpose: Deep extraction of structured PRD data from conversation history.
 * Uses the existing extraction agent with schema validation.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/extract-data
 */

import {
  IntakeState,
  ArtifactReadiness,
  computeArtifactReadiness,
  calculateCompleteness,
} from '../types';
import {
  extractProjectData,
  mergeExtractionData,
} from '../../agents/extraction-agent';
import { ExtractionResult } from '../../schemas';
import { formatMessagesAsText } from '../utils';
import { persistArtifact } from './_persist-artifact';
import {
  NFR_ENGINE_CONTRACT_VERSION,
  type NfrEngineContractV1,
} from '../contracts/nfr-engine-contract-v1';
import { computeInputsHash } from '../contracts/inputs-hash';
import { surfaceOpenQuestion } from '@/lib/chat/system-question-bridge';

// ============================================================
// Main Node Function
// ============================================================

/**
 * Extract structured PRD data from conversation
 *
 * This node:
 * 1. Formats the conversation history for the extraction LLM
 * 2. Runs extraction using the existing extraction agent
 * 3. Merges new data with existing data (incremental updates)
 * 4. Computes completeness score
 * 5. Computes artifact readiness for each PRD-SPEC artifact
 *
 * @param state - Current intake state with messages
 * @returns Partial state with updated extractedData, completeness, artifactReadiness
 *
 * @example
 * After extraction:
 * {
 *   extractedData: {
 *     actors: [{ name: 'Admin', role: 'Primary User', ... }],
 *     useCases: [{ id: 'UC1', name: 'Manage Users', ... }],
 *     systemBoundaries: { internal: [...], external: [...] },
 *     dataEntities: [...]
 *   },
 *   completeness: 45,
 *   artifactReadiness: { context_diagram: true, use_case_diagram: false, ... }
 * }
 */
export async function extractData(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  // [EXTRACT_DEBUG] Entry point logging
  console.log(`[EXTRACT_DEBUG] extractData node called`);
  console.log(`[EXTRACT_DEBUG] Messages: ${state.messages?.length ?? 0}, Current data - actors: ${state.extractedData?.actors?.length ?? 0}, useCases: ${state.extractedData?.useCases?.length ?? 0}`);

  try {
    // Format conversation for extraction
    const conversationText = formatMessagesAsText(state.messages);

    // [EXTRACT_DEBUG] Conversation text length
    console.log(`[EXTRACT_DEBUG] Conversation text length: ${conversationText.length} chars`);

    // Skip extraction if no messages
    if (!conversationText.trim()) {
      // [EXTRACT_DEBUG] Skipping extraction
      console.log(`[EXTRACT_DEBUG] Skipping extraction - no conversation text`);
      return {
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    // Skip expensive LLM extraction when data is already sufficiently complete.
    // This prevents 20K-token re-extractions on subsequent artifact generation loops.
    const hasCompleteData = (
      state.extractedData.actors.length >= 1 &&
      state.extractedData.useCases.length >= 2 &&
      state.extractedData.dataEntities.length >= 1
    );

    if (hasCompleteData) {
      console.log(`[EXTRACT_DEBUG] Skipping extraction — data already complete (actors: ${state.extractedData.actors.length}, useCases: ${state.extractedData.useCases.length})`);
      const completeness = calculateCompleteness(state.extractedData);
      const artifactReadiness = computeArtifactReadiness(state.extractedData);
      await emitNfrContractEnvelope(state, state.extractedData);
      return {
        extractedData: state.extractedData,
        completeness,
        artifactReadiness,
      };
    }

    // [EXTRACT_DEBUG] Before extraction call
    console.log(`[EXTRACT_DEBUG] Calling extractProjectData for project: ${state.projectName}`);

    // Run extraction using the existing extraction agent.
    // Threads currentKBStep + projectType so the v2 phase-staged selector
    // (gated by INTAKE_PROMPT_V2) can pick the right prompt slice.
    const newExtraction = await extractProjectData(
      conversationText,
      state.projectName,
      state.projectVision,
      state.currentKBStep,
      state.projectType,
    );

    // If extraction failed, preserve existing state
    if (!newExtraction) {
      console.warn(`[EXTRACT_DEBUG] Extraction returned null — preserving existing state`);
      return {
        extractedData: state.extractedData,
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    // [EXTRACT_DEBUG] After extraction
    console.log(`[EXTRACT_DEBUG] Extraction returned - actors: ${newExtraction.actors?.length ?? 0}, useCases: ${newExtraction.useCases?.length ?? 0}`);

    // Merge with existing data (incremental)
    const mergedData = mergeExtractionData(state.extractedData, newExtraction);

    // Calculate completeness using the types module function
    const completeness = calculateCompleteness(mergedData);

    // [EXTRACT_DEBUG] After merge
    console.log(`[EXTRACT_DEBUG] After merge - actors: ${mergedData.actors?.length ?? 0}, useCases: ${mergedData.useCases?.length ?? 0}, completeness: ${completeness}`);

    // Compute artifact readiness using the types module function
    const artifactReadiness = computeArtifactReadiness(mergedData);

    // Surface phase-leak / fabrication guards as warn-level logs so LangSmith
    // metadata captures regressions (e.g. an inference-mandate prompt that
    // reintroduces NFR extraction at the context-diagram phase).
    const guards = detectExtractionGuards(state, mergedData);
    for (const guard of guards) {
      console.warn(`[EXTRACT_GUARD] ${guard.kind}: ${guard.detail}`);
    }

    // v2.1 Wave A — extract_data augmentation: emit contract-pin envelope for
    // NFR / constants slices when stubs are on state. Failure path routes to
    // system-question-bridge instead of throwing (Wave A ↔ Wave E pin).
    await emitNfrContractEnvelope(state, mergedData);

    // [EXTRACT_DEBUG] Function exit
    console.log(`[EXTRACT_DEBUG] Returning state update with completeness: ${completeness}`);

    return {
      extractedData: mergedData,
      completeness,
      artifactReadiness,
    };
  } catch (error) {
    // [EXTRACT_DEBUG] Error logging
    console.error(`[EXTRACT_DEBUG] Extraction FAILED:`, error instanceof Error ? error.message : error);
    console.error('Data extraction error:', error);

    // Return error state without crashing the graph
    return {
      error: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ============================================================
// v2.1 Wave A — NFR/constants contract-pin envelope emitter
// ============================================================

/**
 * Emit the `nfr_engine_contract_version: 'v1'` envelope for NFR + constants
 * slices and persist to project_artifacts. Failure path emits a
 * `needs_user_input` envelope and surfaces an open question via the chat
 * bridge — NOT a thrown error (per master plan v2.1 §Wave A ↔ Wave E pin).
 *
 * Stubs land at `state.extractedData.nfrs` and `state.extractedData.constants`
 * (set offline by `nfr-resynth-agent` script today; v2.2 Wave E producer will
 * fill the same envelope from engine internals).
 */
async function emitNfrContractEnvelope(
  state: IntakeState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mergedData: any,
): Promise<void> {
  const phaseAllowsNfrSurfacing =
    state.currentKBStep === 'functional-requirements' ||
    state.currentKBStep === 'sysml-activity-diagram' ||
    state.currentKBStep === 'ffbd' ||
    state.currentKBStep === 'decision-matrix' ||
    state.currentKBStep === 'qfd-house-of-quality' ||
    state.currentKBStep === 'interfaces';
  if (!phaseAllowsNfrSurfacing) return;

  const ed = mergedData as Record<string, unknown> | undefined;
  const nfrsRaw = ed?.['nonFunctionalRequirements'] as unknown[] | undefined;
  const nfrs = nfrsRaw?.length ? nfrsRaw : null; // null → null-path (surfaceOpenQuestion); non-empty array → success-path (fixed INTK-01)
  const constants = ed?.['constants'] ?? null;    // constants: no extraction field maps here; stays null until Wave E constants agent
  const synthesizedAt = new Date().toISOString();
  const inputsHash = computeInputsHash({
    intake: { projectId: state.projectId, projectName: state.projectName, projectVision: state.projectVision },
    upstreamShas: {},
  });

  await emitOne('nfr', state, nfrs, synthesizedAt, inputsHash);
  await emitOne('constants', state, constants, synthesizedAt, inputsHash);
}

async function emitOne(
  kind: 'nfr' | 'constants',
  state: IntakeState,
  result: unknown,
  synthesizedAt: string,
  inputsHash: string,
): Promise<void> {
  const artifactKind = kind === 'nfr' ? 'nfrs_v2' : 'constants_v2';

  if (result === undefined || result === null) {
    // No stub — emit needs_user_input envelope to system-question-bridge.
    const envelope: NfrEngineContractV1 = {
      nfr_engine_contract_version: NFR_ENGINE_CONTRACT_VERSION,
      synthesized_at: synthesizedAt,
      inputs_hash: inputsHash,
      status: 'needs_user_input',
      computed_options: [],
      math_trace: `${kind} resynth: no upstream stub on state.extractedData.${kind === 'nfr' ? 'nfrs' : 'constants'}; user input required`,
    };
    try {
      await surfaceOpenQuestion({
        source: kind === 'nfr' ? 'm2_nfr' : 'm2_constants',
        question: `Help me synthesize the ${kind === 'nfr' ? 'non-functional requirements' : 'engineering constants'} for this project — I don't have enough upstream context to derive them.`,
        computed_options: envelope.computed_options,
        math_trace: envelope.math_trace,
        project_id: state.projectId,
      });
    } catch (e) {
      // Bridge failures must NEVER throw out of extract_data.
      console.warn(`[EXTRACT_DEBUG] surfaceOpenQuestion failed (non-fatal):`, e instanceof Error ? e.message : e);
    }
    await persistArtifact({
      projectId: state.projectId,
      kind: artifactKind,
      status: 'pending',
      inputsHash,
    });
    return;
  }

  // Success envelope.
  const envelope: NfrEngineContractV1 = {
    nfr_engine_contract_version: NFR_ENGINE_CONTRACT_VERSION,
    synthesized_at: synthesizedAt,
    inputs_hash: inputsHash,
    status: 'ok',
    result,
  };
  await persistArtifact({
    projectId: state.projectId,
    kind: artifactKind,
    status: 'ready',
    result: envelope,
    inputsHash,
  });
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if extraction produced meaningful new data
 * Useful for determining if we should proceed with validation
 *
 * @param before - Extraction result before update
 * @param after - Extraction result after update
 * @returns True if new data was extracted
 */
export function hasNewData(
  before: ExtractionResult,
  after: ExtractionResult
): boolean {
  // Compare counts
  const actorsDelta = after.actors.length - before.actors.length;
  const useCasesDelta = after.useCases.length - before.useCases.length;
  const internalDelta =
    after.systemBoundaries.internal.length -
    before.systemBoundaries.internal.length;
  const externalDelta =
    after.systemBoundaries.external.length -
    before.systemBoundaries.external.length;
  const entitiesDelta = after.dataEntities.length - before.dataEntities.length;

  return (
    actorsDelta > 0 ||
    useCasesDelta > 0 ||
    internalDelta > 0 ||
    externalDelta > 0 ||
    entitiesDelta > 0
  );
}

/**
 * Get a summary of extracted data for logging/debugging
 *
 * @param data - Extraction result
 * @returns Human-readable summary
 */
export function getExtractionSummary(data: ExtractionResult): string {
  return [
    `Actors: ${data.actors.length} (${data.actors.map(a => a.name).join(', ') || 'none'})`,
    `Use Cases: ${data.useCases.length} (${data.useCases.map(uc => uc.name).join(', ') || 'none'})`,
    `Internal Systems: ${data.systemBoundaries.internal.length}`,
    `External Systems: ${data.systemBoundaries.external.length}`,
    `Data Entities: ${data.dataEntities.length}`,
  ].join('\n');
}

// ============================================================
// Extraction guards — phase-leak + fabrication detection
// ============================================================

export type ExtractionGuard = {
  kind: 'phase_leak' | 'fabrication';
  detail: string;
};

/**
 * Detect signals that extraction is going off-rails:
 *
 * - **phase_leak**: extraction emitted artifacts that belong to a downstream
 *   phase (e.g. NFRs or goals at the `context-diagram` step). Indicates the
 *   prompt is over-eager and likely fabricating to fill schema slots.
 *
 * - **fabrication**: actor count grossly exceeds the user's substantive word
 *   count on a short conversation (e.g. 12 actors invented from a 4-word
 *   "an AI meal planner" input).
 *
 * Pure function — call from extractData() or unit tests with a fabricated
 * state object. Log-only in v1; future: surface via `state.guardrailFlags`.
 */
export function detectExtractionGuards(
  state: IntakeState,
  data: ExtractionResult,
): ExtractionGuard[] {
  const guards: ExtractionGuard[] = [];

  if (state.currentKBStep === 'context-diagram') {
    const nfrCount = data.nonFunctionalRequirements?.length ?? 0;
    if (nfrCount > 0) {
      guards.push({
        kind: 'phase_leak',
        detail: `${nfrCount} NFRs extracted at context-diagram step`,
      });
    }
    const goalsCount = data.goalsMetrics?.length ?? 0;
    if (goalsCount > 0) {
      guards.push({
        kind: 'phase_leak',
        detail: `${goalsCount} goals at context-diagram step`,
      });
    }
  }

  const userWords = (state.messages ?? [])
    .filter(m => {
      const anyM = m as unknown as {
        _getType?: () => string;
        type?: string;
        role?: string;
      };
      const t = anyM._getType?.() ?? anyM.type ?? anyM.role;
      return t === 'human' || t === 'user';
    })
    .reduce((sum, m) => {
      const content = typeof (m as { content: unknown }).content === 'string'
        ? ((m as { content: string }).content)
        : '';
      return sum + content.split(/\s+/).filter(Boolean).length;
    }, 0);

  const actorCount = data.actors?.length ?? 0;
  if (userWords < 30 && actorCount > userWords * 2) {
    guards.push({
      kind: 'fabrication',
      detail: `${actorCount} actors from ${userWords} user-words`,
    });
  }

  return guards;
}
