/**
 * MCP Server
 *
 * Handles JSON-RPC 2.0 requests for the Model Context Protocol.
 * Routes requests to appropriate handlers based on method name.
 */

import { randomUUID } from 'crypto';
import {
  type MCPRequest,
  type MCPResponse,
  type ToolCallParams,
  type ToolCallResult,
  type ToolListResult,
  type ToolContext,
  mcpRequestSchema,
  toolCallParamsSchema,
  createSuccessResponse,
  createParseError,
  createInvalidRequestError,
  createMethodNotFoundError,
  createInvalidParamsError,
  createInternalError,
  createErrorResponse,
  McpErrorCode,
} from './types';
import { getTool, listTools } from './tool-registry';

// MCP Protocol Methods
const MCP_METHODS = {
  TOOLS_LIST: 'tools/list',
  TOOLS_CALL: 'tools/call',
  INITIALIZE: 'initialize',
  PING: 'ping',
} as const;

export interface MCPServerOptions {
  projectId: number;
}

/**
 * Handle an MCP JSON-RPC request
 */
export async function handleMCPRequest(
  rawRequest: unknown,
  options: MCPServerOptions
): Promise<MCPResponse> {
  const requestId = randomUUID();
  const startTime = Date.now();

  // Parse and validate request
  const parseResult = mcpRequestSchema.safeParse(rawRequest);
  if (!parseResult.success) {
    return createParseError();
  }

  const request = parseResult.data as MCPRequest;

  try {
    switch (request.method) {
      case MCP_METHODS.INITIALIZE:
        return handleInitialize(request);

      case MCP_METHODS.PING:
        return handlePing(request);

      case MCP_METHODS.TOOLS_LIST:
        return handleToolsList(request);

      case MCP_METHODS.TOOLS_CALL:
        return await handleToolsCall(request, {
          projectId: options.projectId,
          requestId,
          startTime,
        });

      default:
        return createMethodNotFoundError(request.id, request.method);
    }
  } catch (error) {
    console.error(`MCP request error [${requestId}]:`, error);
    return createInternalError(
      request.id,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Handle initialize request
 */
function handleInitialize(request: MCPRequest): MCPResponse {
  return createSuccessResponse(request.id, {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: 'product-helper-mcp',
      version: '1.0.0',
    },
  });
}

/**
 * Handle ping request
 */
function handlePing(request: MCPRequest): MCPResponse {
  return createSuccessResponse(request.id, { pong: true });
}

/**
 * Handle tools/list request
 */
function handleToolsList(request: MCPRequest): MCPResponse<ToolListResult> {
  const tools = listTools();
  return createSuccessResponse(request.id, { tools });
}

/**
 * Handle tools/call request
 */
async function handleToolsCall(
  request: MCPRequest,
  context: ToolContext
): Promise<MCPResponse<ToolCallResult>> {
  // Validate params
  const paramsResult = toolCallParamsSchema.safeParse(request.params);
  if (!paramsResult.success) {
    return createInvalidParamsError(
      request.id,
      paramsResult.error.errors.map((e) => e.message).join(', ')
    );
  }

  const params = paramsResult.data as ToolCallParams;

  // Get tool
  const tool = getTool(params.name);
  if (!tool) {
    return createErrorResponse(
      request.id,
      McpErrorCode.NOT_FOUND,
      `Tool not found: ${params.name}`
    );
  }

  try {
    // Execute tool
    const result = await tool.handler(params.arguments, context);
    return createSuccessResponse(request.id, result);
  } catch (error) {
    console.error(`Tool execution error [${params.name}]:`, error);
    return createErrorResponse(
      request.id,
      McpErrorCode.TOOL_ERROR,
      error instanceof Error ? error.message : 'Tool execution failed'
    );
  }
}

/**
 * Get server info
 */
export function getServerInfo() {
  return {
    name: 'product-helper-mcp',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    toolCount: listTools().length,
  };
}
