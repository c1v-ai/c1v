/**
 * Core MCP Tools Index
 *
 * Barrel export for all core MCP tools that expose project data
 * through the Model Context Protocol.
 */

// Tool exports
export { registerGetPrd, definition as getPrdDefinition, handler as getPrdHandler } from './get-prd';
export {
  registerGetDatabaseSchema,
  definition as getDatabaseSchemaDefinition,
  handler as getDatabaseSchemaHandler,
} from './get-database-schema';
export {
  registerGetTechStack,
  definition as getTechStackDefinition,
  handler as getTechStackHandler,
} from './get-tech-stack';
export {
  registerGetUserStories,
  definition as getUserStoriesDefinition,
  handler as getUserStoriesHandler,
} from './get-user-stories';
export {
  registerGetCodingContext,
  definition as getCodingContextDefinition,
  handler as getCodingContextHandler,
} from './get-coding-context';
export {
  registerGetProjectArchitecture,
  definition as getProjectArchitectureDefinition,
  handler as getProjectArchitectureHandler,
} from './get-project-architecture';
export {
  registerGetDiagrams,
  definition as getDiagramsDefinition,
  handler as getDiagramsHandler,
} from './get-diagrams';

/**
 * Register all core MCP tools
 *
 * Call this function at server startup to register all core tools
 * with the MCP tool registry.
 *
 * @example
 * ```typescript
 * import { registerAllCoreTools } from '@/lib/mcp/tools/core';
 *
 * // At server startup
 * registerAllCoreTools();
 * ```
 */
export function registerAllCoreTools(): void {
  // Import and register each tool
  const { registerGetPrd } = require('./get-prd');
  const { registerGetDatabaseSchema } = require('./get-database-schema');
  const { registerGetTechStack } = require('./get-tech-stack');
  const { registerGetUserStories } = require('./get-user-stories');
  const { registerGetCodingContext } = require('./get-coding-context');
  const { registerGetProjectArchitecture } = require('./get-project-architecture');
  const { registerGetDiagrams } = require('./get-diagrams');

  registerGetPrd();
  registerGetDatabaseSchema();
  registerGetTechStack();
  registerGetUserStories();
  registerGetCodingContext();
  registerGetProjectArchitecture();
  registerGetDiagrams();
}

/**
 * List of all core tool names
 */
export const CORE_TOOL_NAMES = [
  'get_prd',
  'get_database_schema',
  'get_tech_stack',
  'get_user_stories',
  'get_coding_context',
  'get_project_architecture',
  'get_diagrams',
] as const;

export type CoreToolName = (typeof CORE_TOOL_NAMES)[number];
