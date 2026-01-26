/**
 * MCP Tools Index
 *
 * Central registration point for all MCP tools.
 * Call registerAllTools() at server initialization.
 */

import { registerAllCoreTools, CORE_TOOL_NAMES, type CoreToolName } from './core';
import {
  registerAllGeneratorTools,
  GENERATOR_TOOL_NAMES,
  type GeneratorToolName,
} from './generators';
import { registerAllUniqueTools, UNIQUE_TOOL_NAMES, type UniqueToolName } from './unique';

// Re-export tool names and types
export { CORE_TOOL_NAMES, type CoreToolName };
export { GENERATOR_TOOL_NAMES, type GeneratorToolName };
export { UNIQUE_TOOL_NAMES, type UniqueToolName };

// Re-export registration functions
export { registerAllCoreTools } from './core';
export { registerAllGeneratorTools } from './generators';
export { registerAllUniqueTools } from './unique';

/**
 * All available tool names
 */
export const ALL_TOOL_NAMES = [
  ...CORE_TOOL_NAMES,
  ...GENERATOR_TOOL_NAMES,
  ...UNIQUE_TOOL_NAMES,
] as const;

export type AllToolName = (typeof ALL_TOOL_NAMES)[number];

/**
 * Register all MCP tools (core + generators + unique)
 *
 * This function registers all 17 tools:
 * - 7 core tools (PRD, schema, tech stack, user stories, coding context, architecture, diagrams)
 * - 4 generator tools (API specs, infrastructure, coding guidelines, update story status)
 * - 6 unique tools (validation, GSD phases, CLEO tasks, invoke agent, Q&A, search)
 *
 * @example
 * ```typescript
 * import { registerAllTools } from '@/lib/mcp/tools';
 *
 * // At MCP server startup
 * registerAllTools();
 * ```
 */
export function registerAllTools(): void {
  registerAllCoreTools();
  registerAllGeneratorTools();
  registerAllUniqueTools();
  console.log(
    `[MCP] Registered ${ALL_TOOL_NAMES.length} tools ` +
      `(${CORE_TOOL_NAMES.length} core + ${GENERATOR_TOOL_NAMES.length} generator + ${UNIQUE_TOOL_NAMES.length} unique)`
  );
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use registerAllTools() instead
 */
export function registerCoreTools(): void {
  registerAllCoreTools();
  console.log(`[MCP] Registered ${CORE_TOOL_NAMES.length} core tools`);
}

/**
 * Get list of all available tool names
 */
export function getAvailableToolNames(): string[] {
  return [...ALL_TOOL_NAMES];
}
