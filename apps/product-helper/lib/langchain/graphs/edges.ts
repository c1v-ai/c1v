import type {
  IntakeState,
  ArtifactPhase,
} from './types';

/**
 * LangGraph Edge Routing Functions for Product-Helper Intake System
 *
 * This module defines conditional edge routing functions that determine
 * the next node to execute based on current state.
 *
 * Graph Flow:
 * ```
 * START -> analyze_response
 * analyze_response -> extract_data (PROVIDE_INFO/STOP_TRIGGER)
 * analyze_response -> check_prd_spec (REQUEST_ARTIFACT)
 * analyze_response -> compute_next_question (DENY/UNKNOWN)
 * extract_data -> check_prd_spec (artifact_ready)
 * extract_data -> compute_next_question (need_more_data)
 * check_prd_spec -> generate_artifact (threshold_met)
 * check_prd_spec -> compute_next_question (below_threshold)
 * check_prd_spec -> END (is_complete)
 * generate_artifact -> check_prd_spec (continue)
 * generate_artifact -> END (all_complete)
 * compute_next_question -> generate_response
 * generate_response -> END
 * ```
 *
 * @module graphs/edges
 */

// ============================================================
// Route Target Types
// ============================================================

/**
 * Routing targets from analyze_response node
 */
export type AnalyzeRouteTarget =
  | 'extract_data'           // User provided info -> extract it
  | 'check_prd_spec'       // User requested artifact -> check if ready
  | 'compute_next_question'; // Need more data -> ask question

/**
 * Routing targets from extract_data node
 */
export type ExtractRouteTarget =
  | 'check_prd_spec'       // Artifact ready or stop trigger -> validate
  | 'compute_next_question'; // Need more data -> ask question

/**
 * Routing targets from check_prd_spec (validation) node
 */
export type ValidationRouteTarget =
  | 'generate_artifact'      // Threshold met -> generate
  | 'compute_next_question'  // Below threshold -> ask more
  | '__end__';               // 95%+ complete -> end conversation

/**
 * Routing targets from generate_artifact node
 */
export type ArtifactRouteTarget =
  | 'check_prd_spec'       // Continue to next phase
  | '__end__';               // All artifacts complete

// ============================================================
// Routing Functions
// ============================================================

/**
 * Route after analyzing user response
 *
 * Decision logic:
 * 1. STOP_TRIGGER or PROVIDE_INFO -> extract_data (extract info then proceed)
 * 2. REQUEST_ARTIFACT -> check_prd_spec (check if ready to generate)
 * 3. DENY or UNKNOWN -> compute_next_question (ask another question)
 *
 * @param state - Current intake state with lastIntent set
 * @returns Target node name
 *
 * @example
 * ```typescript
 * const target = routeAfterAnalysis(state);
 * // If lastIntent is 'PROVIDE_INFO' -> 'extract_data'
 * // If lastIntent is 'REQUEST_ARTIFACT' -> 'check_prd_spec'
 * // If lastIntent is 'DENY' -> 'compute_next_question'
 * ```
 */
export function routeAfterAnalysis(state: IntakeState): AnalyzeRouteTarget {
  const { lastIntent, artifactReadiness, currentPhase } = state;

  // Stop trigger - extract final data then proceed to validation
  if (lastIntent === 'STOP_TRIGGER') {
    return 'extract_data';
  }

  // User approved artifact generation (from KB approval flow)
  // Go directly to validation which will route to generate_artifact
  if (lastIntent === 'REQUEST_ARTIFACT') {
    return 'check_prd_spec';
  }

  // User confirmed while approval was pending — route to validation for generation
  if (lastIntent === 'CONFIRM' && state.approvalPending) {
    return 'check_prd_spec';
  }

  // User provided info or confirmed something
  if (lastIntent === 'PROVIDE_INFO' || lastIntent === 'CONFIRM') {
    // If artifact for current phase is ready, go to validation
    if (artifactReadiness[currentPhase]) {
      return 'check_prd_spec';
    }
    // Otherwise extract what they said
    return 'extract_data';
  }

  // User denied assumption - need to ask differently
  if (lastIntent === 'DENY') {
    return 'compute_next_question';
  }

  // User has a question - answer then continue
  if (lastIntent === 'ASK_QUESTION') {
    return 'compute_next_question';
  }

  // User wants to edit data - need to handle
  if (lastIntent === 'EDIT_DATA') {
    return 'compute_next_question';
  }

  // Unknown intent - try to extract any info and continue
  return 'extract_data';
}

/**
 * Route after data extraction
 *
 * Decision logic:
 * 1. If stop trigger was detected -> check_prd_spec (to generate)
 * 2. If artifact ready for current phase -> check_prd_spec
 * 3. If completeness >= 30% -> check_prd_spec (periodic validation)
 * 4. Otherwise -> compute_next_question (need more data)
 *
 * @param state - Current intake state with extractedData updated
 * @returns Target node name
 *
 * @example
 * ```typescript
 * const target = routeAfterExtraction(state);
 * // If lastIntent is 'STOP_TRIGGER' -> 'check_prd_spec'
 * // If artifactReadiness.context_diagram && currentPhase === 'context_diagram' -> 'check_prd_spec'
 * // Otherwise -> 'compute_next_question'
 * ```
 */
export function routeAfterExtraction(state: IntakeState): ExtractRouteTarget {
  const { lastIntent, artifactReadiness, currentPhase, completeness } = state;

  // After stop trigger, always proceed to validation/generation
  if (lastIntent === 'STOP_TRIGGER') {
    return 'check_prd_spec';
  }

  // If current artifact is ready, validate it
  if (artifactReadiness[currentPhase]) {
    return 'check_prd_spec';
  }

  // Periodic validation check at 30% and above
  // This helps track progress and can trigger early artifact generation
  if (completeness >= 30) {
    return 'check_prd_spec';
  }

  // Need more data - ask another question
  return 'compute_next_question';
}

/**
 * Route after PRD-SPEC validation
 *
 * Decision logic:
 * 1. If 95%+ complete (isComplete) -> __end__ (conversation complete)
 * 2. If stop trigger was detected -> generate_artifact (user wants it now)
 * 3. If current artifact threshold met -> generate_artifact
 * 4. Otherwise -> compute_next_question (need more data)
 *
 * @param state - Current intake state with validationResult set
 * @returns Target node name
 *
 * @example
 * ```typescript
 * const target = routeAfterValidation(state);
 * // If isComplete -> '__end__'
 * // If lastIntent === 'STOP_TRIGGER' -> 'generate_artifact'
 * // If validationResult.score >= threshold -> 'generate_artifact'
 * // Otherwise -> 'compute_next_question'
 * ```
 */
export function routeAfterValidation(state: IntakeState): ValidationRouteTarget {
  const {
    isComplete,
    validationResult,
    artifactReadiness,
    currentPhase,
    lastIntent,
    generatedArtifacts,
  } = state;

  // Full completion - conversation is done
  if (isComplete) {
    return '__end__';
  }

  // Check if all 6 core KB artifacts are already generated
  const coreArtifacts = [
    'context_diagram',
    'use_case_diagram',
    'scope_tree',
    'ucbd',
    'requirements_table',
    'sysml_activity_diagram',
  ];
  const allCoreComplete = coreArtifacts.every(a =>
    generatedArtifacts.includes(a as ArtifactPhase)
  );

  // If all core artifacts done, end intake — generation is separate
  if (allCoreComplete) {
    return '__end__';
  }

  // Stop trigger: generate current phase if not already done
  if (lastIntent === 'STOP_TRIGGER') {
    if (generatedArtifacts.includes(currentPhase)) {
      // Current phase already generated — end if all core done (checked above),
      // otherwise advance to next ungenerated phase
      return '__end__';
    }
    return 'generate_artifact';
  }

  // User explicitly requested artifact or confirmed approval
  if (lastIntent === 'REQUEST_ARTIFACT') {
    // Generate if artifact is ready OR if KB confidence is high enough
    if (artifactReadiness[currentPhase] || state.kbStepConfidence >= 80) {
      return 'generate_artifact';
    }
    // Otherwise need more data
    return 'compute_next_question';
  }

  // Approval was pending and KB confidence is sufficient — generate even if
  // artifactReadiness (based on extracted data counts) hasn't caught up yet
  if (state.approvalPending && state.kbStepConfidence >= 80) {
    return 'generate_artifact';
  }

  // Guard: if current phase was already generated, skip to next question.
  // This prevents re-entering generate_artifact for a completed phase.
  if (generatedArtifacts.includes(currentPhase)) {
    return 'compute_next_question';
  }

  // Check if current artifact meets threshold
  if (artifactReadiness[currentPhase]) {
    return 'generate_artifact';
  }

  // Check validation score against phase-specific threshold
  if (validationResult) {
    const phaseThreshold = getPhaseThreshold(currentPhase);
    if (validationResult.score >= phaseThreshold) {
      return 'generate_artifact';
    }
  }

  // Need more data to proceed
  return 'compute_next_question';
}

/**
 * Route after artifact generation
 *
 * Decision logic:
 * 1. If all 7 artifacts generated -> __end__
 * 2. If 95%+ validation (isComplete) -> __end__
 * 3. Otherwise -> check_prd_spec (move to next phase)
 *
 * @param state - Current intake state with artifact generated
 * @returns Target node name
 *
 * @example
 * ```typescript
 * const target = routeAfterArtifact(state);
 * // If generatedArtifacts.length >= 7 -> '__end__'
 * // If isComplete -> '__end__'
 * // Otherwise -> 'check_prd_spec'
 * ```
 */
export function routeAfterArtifact(state: IntakeState): ArtifactRouteTarget {
  const { generatedArtifacts, isComplete } = state;

  // All 7 PRD-SPEC artifacts generated
  if (generatedArtifacts.length >= 7) {
    return '__end__';
  }

  // 95%+ validation achieved
  if (isComplete) {
    return '__end__';
  }

  // All 6 core KB artifacts generated (context, use case, scope, ucbd, requirements, sysml)
  // End the intake graph — tech generation is handled by separate API routes
  const coreArtifacts = [
    'context_diagram',
    'use_case_diagram',
    'scope_tree',
    'ucbd',
    'requirements_table',
    'sysml_activity_diagram',
  ];
  const allCoreComplete = coreArtifacts.every(a =>
    generatedArtifacts.includes(a as ArtifactPhase)
  );
  if (allCoreComplete) {
    return '__end__';
  }

  // Continue to next phase - validate and possibly generate more
  return 'check_prd_spec';
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get the minimum validation score threshold for a phase
 *
 * These thresholds determine when an artifact can be generated.
 * Based on PRD-SPEC-PRD-95-V1 specification.
 *
 * @param phase - The artifact phase
 * @returns Minimum score required for this phase
 */
function getPhaseThreshold(phase: ArtifactPhase): number {
  const thresholds: Record<ArtifactPhase, number> = {
    context_diagram: 20,
    use_case_diagram: 35,
    scope_tree: 45,
    ucbd: 60,
    requirements_table: 75,
    constants_table: 85,
    sysml_activity_diagram: 90,
  };

  return thresholds[phase] ?? 50;
}

/**
 * Check if routing should consider error recovery
 *
 * If an error occurred in the previous node, routing may need adjustment.
 *
 * @param state - Current intake state
 * @returns True if error recovery is needed
 */
export function needsErrorRecovery(state: IntakeState): boolean {
  return state.error !== null;
}

/**
 * Get the safe route when an error has occurred
 *
 * Returns a route that allows recovery from error states.
 *
 * @param state - Current intake state with error
 * @returns Safe route for error recovery
 */
export function getErrorRecoveryRoute(
  state: IntakeState
): 'compute_next_question' | '__end__' {
  // If too many errors, end the conversation
  if (state.turnCount > 40) {
    return '__end__';
  }

  // Otherwise, try to continue with a new question
  return 'compute_next_question';
}

/**
 * Determine if the conversation should be forcibly ended
 *
 * Checks for conditions that require ending regardless of completeness.
 *
 * @param state - Current intake state
 * @returns True if conversation must end
 */
export function shouldForceEnd(state: IntakeState): boolean {
  // Maximum turn limit reached
  if (state.turnCount >= 50) {
    return true;
  }

  // All artifacts already generated
  if (state.generatedArtifacts.length >= 7) {
    return true;
  }

  // Explicitly marked complete
  if (state.isComplete) {
    return true;
  }

  return false;
}

/**
 * Get a human-readable description of the routing decision
 *
 * Useful for debugging and logging.
 *
 * @param from - Source node name
 * @param to - Target node name
 * @param state - Current state
 * @returns Description string
 */
export function describeRoute(
  from: string,
  to: string,
  state: IntakeState
): string {
  const reasons: string[] = [];

  if (state.lastIntent) {
    reasons.push(`intent=${state.lastIntent}`);
  }

  if (state.completeness > 0) {
    reasons.push(`completeness=${state.completeness}%`);
  }

  reasons.push(`phase=${state.currentPhase}`);
  reasons.push(`generated=${state.generatedArtifacts.length}/7`);

  return `Route: ${from} -> ${to} (${reasons.join(', ')})`;
}
