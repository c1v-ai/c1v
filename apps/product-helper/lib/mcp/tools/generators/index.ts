/**
 * Generator Tools Index
 *
 * MCP tools that serve data from Phase 10 generators:
 * - API specifications (REST endpoints)
 * - Infrastructure configuration (hosting, database, CI/CD)
 * - Coding guidelines (naming, patterns, linting, testing)
 * - User story status updates (WRITE operation)
 */

import { registerGetApiSpecs } from './get-api-specs';
import { registerGetInfrastructure } from './get-infrastructure';
import { registerGetCodingGuidelines } from './get-coding-guidelines';
import { registerUpdateUserStoryStatus } from './update-story-status';

/**
 * Tool names for type safety
 */
export const GENERATOR_TOOL_NAMES = [
  'get_api_specs',
  'get_infrastructure',
  'get_coding_guidelines',
  'update_user_story_status',
] as const;

export type GeneratorToolName = (typeof GENERATOR_TOOL_NAMES)[number];

/**
 * Register all generator-based MCP tools
 */
export function registerAllGeneratorTools(): void {
  registerGetApiSpecs();
  registerGetInfrastructure();
  registerGetCodingGuidelines();
  registerUpdateUserStoryStatus();
}

// Re-export registration functions
export { registerGetApiSpecs } from './get-api-specs';
export { registerGetInfrastructure } from './get-infrastructure';
export { registerGetCodingGuidelines } from './get-coding-guidelines';
export { registerUpdateUserStoryStatus } from './update-story-status';
