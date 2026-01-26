/**
 * MCP (Model Context Protocol) JSON-RPC 2.0 Types
 *
 * These types implement the JSON-RPC 2.0 specification for the MCP protocol,
 * enabling communication between Claude Code/Cursor and the Product Helper server.
 */

import { z } from 'zod';

// ============================================================
// JSON-RPC 2.0 Core Types
// ============================================================

export interface MCPRequest<TParams = unknown> {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: TParams;
}

export interface MCPSuccessResponse<TResult = unknown> {
  jsonrpc: '2.0';
  id: string | number | null;
  result: TResult;
}

export interface MCPErrorResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  error: MCPError;
}

export type MCPResponse<TResult = unknown> =
  | MCPSuccessResponse<TResult>
  | MCPErrorResponse;

export interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

// Error codes
export enum JsonRpcErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
}

export enum McpErrorCode {
  UNAUTHORIZED = -32001,
  FORBIDDEN = -32002,
  NOT_FOUND = -32003,
  RATE_LIMITED = -32004,
  TOOL_ERROR = -32005,
  VALIDATION_ERROR = -32006,
}

// Tool Types
export interface JsonSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, JsonSchemaProperty>;
    required?: string[];
  };
}

export interface ToolListResult {
  tools: ToolDefinition[];
}

export interface ToolCallParams {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolContentItem {
  type: 'text' | 'image' | 'resource';
  text?: string;
  mimeType?: string;
  data?: string;
}

export interface ToolCallResult {
  content: ToolContentItem[];
  isError?: boolean;
}

export interface ToolContext {
  projectId: number;
  requestId: string;
  startTime: number;
}

export type ToolHandler<TArgs extends Record<string, unknown> = Record<string, unknown>> = (
  args: TArgs,
  context: ToolContext
) => Promise<ToolCallResult>;

export interface RegisteredTool<TArgs extends Record<string, unknown> = Record<string, unknown>> {
  definition: ToolDefinition;
  handler: ToolHandler<TArgs>;
}

// Zod Schemas
export const mcpRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number(), z.null()]),
  method: z.string().min(1),
  params: z.unknown().optional(),
});

export const toolCallParamsSchema = z.object({
  name: z.string().min(1),
  arguments: z.record(z.unknown()).default({}),
});

// Type Guards
export function isErrorResponse(response: MCPResponse): response is MCPErrorResponse {
  return 'error' in response;
}

export function isSuccessResponse<T>(response: MCPResponse<T>): response is MCPSuccessResponse<T> {
  return 'result' in response;
}

// Helper Functions
export function createSuccessResponse<T>(id: string | number | null, result: T): MCPSuccessResponse<T> {
  return { jsonrpc: '2.0', id, result };
}

export function createErrorResponse(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
): MCPErrorResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: { code, message, ...(data !== undefined && { data }) },
  };
}

export function createParseError(): MCPErrorResponse {
  return createErrorResponse(null, JsonRpcErrorCode.PARSE_ERROR, 'Parse error');
}

export function createInvalidRequestError(id: string | number | null, details?: string): MCPErrorResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.INVALID_REQUEST,
    details ? `Invalid request: ${details}` : 'Invalid request'
  );
}

export function createMethodNotFoundError(id: string | number | null, method: string): MCPErrorResponse {
  return createErrorResponse(id, JsonRpcErrorCode.METHOD_NOT_FOUND, `Method not found: ${method}`);
}

export function createInvalidParamsError(id: string | number | null, details?: string): MCPErrorResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.INVALID_PARAMS,
    details ? `Invalid params: ${details}` : 'Invalid params'
  );
}

export function createInternalError(id: string | number | null, details?: string): MCPErrorResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.INTERNAL_ERROR,
    details ? `Internal error: ${details}` : 'Internal error'
  );
}

export function createTextResult(text: string, isError = false): ToolCallResult {
  return { content: [{ type: 'text', text }], isError };
}

export function createJsonResult<T>(data: T, isError = false): ToolCallResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2), mimeType: 'application/json' }],
    isError,
  };
}
