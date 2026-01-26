/**
 * LangGraph Node Functions Index
 *
 * This module exports all node functions for the intake state machine.
 * Each node represents a step in the PRD intake workflow.
 *
 * @module graphs/nodes
 */

// ============================================================
// Node Function Exports
// ============================================================

export { analyzeResponse } from './analyze-response';
export { extractData, hasNewData, getExtractionSummary } from './extract-data';
export {
  computeNextQuestion,
  identifyDataGaps,
  getMostCriticalGap,
} from './compute-next-question';
export {
  checkSRindustry-standard,
  ARTIFACT_THRESHOLDS,
  isArtifactReady,
  getMissingRequirements,
} from './check-prd-spec';
export {
  generateArtifact,
  DIAGRAM_TEMPLATES,
  formatDataForArtifact,
  validateArtifactContent,
} from './generate-artifact';
export {
  generateResponse,
  generateProgressUpdate,
  generateAcknowledgment,
  generateClarificationRequest,
} from './generate-response';

// ============================================================
// Node Names (for graph construction)
// ============================================================

/**
 * Node identifiers used in the state graph
 * These match the function names for clarity
 */
export const NODE_NAMES = {
  ANALYZE_RESPONSE: 'analyze_response',
  EXTRACT_DATA: 'extract_data',
  COMPUTE_NEXT_QUESTION: 'compute_next_question',
  CHECK_SR_CORNELL: 'check_sr_industry-standard',
  GENERATE_ARTIFACT: 'generate_artifact',
  GENERATE_RESPONSE: 'generate_response',
} as const;

export type NodeName = typeof NODE_NAMES[keyof typeof NODE_NAMES];
