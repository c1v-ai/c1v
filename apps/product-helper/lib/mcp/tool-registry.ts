/**
 * MCP Tool Registry
 *
 * Manages registration and lookup of MCP tools.
 * Tools are registered at server startup and looked up during request handling.
 */

import type { ToolDefinition, RegisteredTool, ToolHandler } from './types';

// Global tool registry
const toolRegistry = new Map<string, RegisteredTool>();

/**
 * Register a tool with the MCP server
 */
export function registerTool<TArgs extends Record<string, unknown> = Record<string, unknown>>(
  definition: ToolDefinition,
  handler: ToolHandler<TArgs>
): void {
  if (toolRegistry.has(definition.name)) {
    console.warn(`Tool "${definition.name}" is already registered. Overwriting.`);
  }

  toolRegistry.set(definition.name, {
    definition,
    handler: handler as ToolHandler,
  });
}

/**
 * Get a registered tool by name
 */
export function getTool(name: string): RegisteredTool | undefined {
  return toolRegistry.get(name);
}

/**
 * Check if a tool is registered
 */
export function hasTool(name: string): boolean {
  return toolRegistry.has(name);
}

/**
 * Get all registered tool definitions
 */
export function listTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values()).map((tool) => tool.definition);
}

/**
 * Get the number of registered tools
 */
export function getToolCount(): number {
  return toolRegistry.size;
}

/**
 * Unregister a tool (mainly for testing)
 */
export function unregisterTool(name: string): boolean {
  return toolRegistry.delete(name);
}

/**
 * Clear all registered tools (mainly for testing)
 */
export function clearTools(): void {
  toolRegistry.clear();
}

/**
 * Get all tool names
 */
export function getToolNames(): string[] {
  return Array.from(toolRegistry.keys());
}
