import { describe, it, expect, beforeEach } from '@jest/globals';
import { handleMCPRequest } from '../server';
import { registerTool, clearTools } from '../tool-registry';
import type { ToolCallResult } from '../types';
import { isErrorResponse } from '../types';

describe('MCP Server', () => {
  const projectId = 1;

  beforeEach(() => {
    clearTools();
  });

  describe('handleMCPRequest', () => {
    it('should reject invalid JSON-RPC requests', async () => {
      const response = await handleMCPRequest({}, { projectId });
      expect(isErrorResponse(response)).toBe(true);
      if (isErrorResponse(response)) {
        expect(response.error.code).toBe(-32700); // Parse error
      }
    });

    it('should reject requests without jsonrpc version', async () => {
      const response = await handleMCPRequest(
        { id: 1, method: 'test' },
        { projectId }
      );
      expect(isErrorResponse(response)).toBe(true);
    });

    it('should handle initialize request', async () => {
      const response = await handleMCPRequest(
        { jsonrpc: '2.0', id: 1, method: 'initialize' },
        { projectId }
      );
      expect('result' in response).toBe(true);
      if ('result' in response) {
        expect(response.result).toHaveProperty('protocolVersion');
        expect(response.result).toHaveProperty('capabilities');
        expect(response.result).toHaveProperty('serverInfo');
      }
    });

    it('should handle ping request', async () => {
      const response = await handleMCPRequest(
        { jsonrpc: '2.0', id: 1, method: 'ping' },
        { projectId }
      );
      expect('result' in response).toBe(true);
      if ('result' in response) {
        expect(response.result).toEqual({ pong: true });
      }
    });

    it('should handle tools/list request', async () => {
      registerTool(
        {
          name: 'test_tool',
          description: 'A test tool',
          inputSchema: { type: 'object', properties: {} },
        },
        async () => ({ content: [{ type: 'text', text: 'test' }] })
      );

      const response = await handleMCPRequest(
        { jsonrpc: '2.0', id: 1, method: 'tools/list' },
        { projectId }
      );

      expect('result' in response).toBe(true);
      if ('result' in response) {
        const result = response.result as { tools: Array<{ name: string }> };
        expect(result.tools).toHaveLength(1);
        expect(result.tools[0].name).toBe('test_tool');
      }
    });

    it('should handle tools/call request', async () => {
      registerTool(
        {
          name: 'echo',
          description: 'Echo back the input',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Message to echo' },
            },
          },
        },
        async (args: Record<string, unknown>): Promise<ToolCallResult> => ({
          content: [{ type: 'text', text: String(args.message) }],
        })
      );

      const response = await handleMCPRequest(
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: { name: 'echo', arguments: { message: 'Hello' } },
        },
        { projectId }
      );

      expect('result' in response).toBe(true);
      if ('result' in response) {
        const result = response.result as ToolCallResult;
        expect(result.content[0].text).toBe('Hello');
      }
    });

    it('should return error for unknown method', async () => {
      const response = await handleMCPRequest(
        { jsonrpc: '2.0', id: 1, method: 'unknown/method' },
        { projectId }
      );
      expect(isErrorResponse(response)).toBe(true);
      if (isErrorResponse(response)) {
        expect(response.error.code).toBe(-32601); // Method not found
      }
    });

    it('should return error for unknown tool', async () => {
      const response = await handleMCPRequest(
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: { name: 'nonexistent', arguments: {} },
        },
        { projectId }
      );
      expect(isErrorResponse(response)).toBe(true);
      if (isErrorResponse(response)) {
        expect(response.error.code).toBe(-32003); // Not found
      }
    });

    it('should preserve request id in response', async () => {
      const response = await handleMCPRequest(
        { jsonrpc: '2.0', id: 'test-123', method: 'ping' },
        { projectId }
      );
      expect(response.id).toBe('test-123');
    });

    it('should handle null id for notifications', async () => {
      const response = await handleMCPRequest(
        { jsonrpc: '2.0', id: null, method: 'ping' },
        { projectId }
      );
      expect(response.id).toBeNull();
    });
  });
});
