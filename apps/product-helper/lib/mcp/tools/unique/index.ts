/**
 * Unique MCP Tools Index
 *
 * Barrel export and registration for all unique tools that differentiate
 * the product-helper from competitors:
 * - SR-CORNELL validation status
 * - GSD workflow phases
 * - CLEO task management integration
 * - 17-agent system invocation
 * - RAG-powered Q&A
 * - Semantic search across project data
 */

import { registerGetValidationStatus } from './get-validation-status';
import { registerGetGsdPhases } from './get-gsd-phases';
import { registerGetCleoTasks } from './get-cleo-tasks';
import { registerInvokeAgent } from './invoke-agent';
import { registerAskQuestion } from './ask-question';
import { registerSearchContext } from './search-context';

/**
 * Unique tool names
 */
export const UNIQUE_TOOL_NAMES = [
  'get_validation_status',
  'get_gsd_phases',
  'get_cleo_tasks',
  'invoke_agent',
  'ask_project_question',
  'search_project_context',
] as const;

export type UniqueToolName = (typeof UNIQUE_TOOL_NAMES)[number];

/**
 * Register all unique MCP tools
 *
 * This function registers all 6 unique tools that provide competitive advantage:
 * - get_validation_status: SR-CORNELL validation scores and gates
 * - get_gsd_phases: GSD workflow phases and progress
 * - get_cleo_tasks: CLEO-style task management integration
 * - invoke_agent: 17-agent system invocation
 * - ask_project_question: RAG-powered Q&A
 * - search_project_context: Keyword search across project data
 */
export function registerAllUniqueTools(): void {
  registerGetValidationStatus();
  registerGetGsdPhases();
  registerGetCleoTasks();
  registerInvokeAgent();
  registerAskQuestion();
  registerSearchContext();
}

// Re-export registration functions only
export { registerGetValidationStatus } from './get-validation-status';
export { registerGetGsdPhases } from './get-gsd-phases';
export { registerGetCleoTasks } from './get-cleo-tasks';
export { registerInvokeAgent } from './invoke-agent';
export { registerAskQuestion } from './ask-question';
export { registerSearchContext } from './search-context';
