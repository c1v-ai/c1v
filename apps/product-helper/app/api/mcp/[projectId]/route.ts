/**
 * MCP Server Route
 *
 * Main endpoint for Model Context Protocol requests.
 * Handles JSON-RPC 2.0 over HTTP POST.
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleMCPRequest } from '@/lib/mcp/server';
import {
  validateApiKey,
  extractKeyFromHeader,
  extractKeyPrefix,
} from '@/lib/mcp/auth';
import {
  checkRateLimit,
  getRateLimitHeaders,
  getRateLimitStatus,
} from '@/lib/mcp/rate-limit';
import {
  createErrorResponse,
  McpErrorCode,
  createParseError,
} from '@/lib/mcp/types';
import { registerAllTools } from '@/lib/mcp/tools';

// Register all MCP tools at module load time
// This runs once when the route module is first imported
registerAllTools();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId: projectIdStr } = await params;

  // Parse project ID
  const projectId = parseInt(projectIdStr, 10);
  if (isNaN(projectId)) {
    return NextResponse.json(
      createErrorResponse(null, McpErrorCode.NOT_FOUND, 'Invalid project ID'),
      { status: 400 }
    );
  }

  // Extract and validate API key
  const authHeader = request.headers.get('Authorization');
  const apiKey = extractKeyFromHeader(authHeader);

  if (!apiKey) {
    return NextResponse.json(
      createErrorResponse(null, McpErrorCode.UNAUTHORIZED, 'API key required'),
      { status: 401 }
    );
  }

  // Validate API key
  const isValid = await validateApiKey(apiKey, projectId);
  if (!isValid) {
    return NextResponse.json(
      createErrorResponse(null, McpErrorCode.UNAUTHORIZED, 'Invalid API key'),
      { status: 401 }
    );
  }

  // Check rate limit
  const keyPrefix = extractKeyPrefix(apiKey);
  if (keyPrefix) {
    const rateLimitResult = checkRateLimit(keyPrefix);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        createErrorResponse(null, McpErrorCode.RATE_LIMITED, 'Rate limit exceeded'),
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }
  }

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(createParseError(), { status: 400 });
  }

  // Handle MCP request
  const response = await handleMCPRequest(body, { projectId });

  // Add rate limit headers to response
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (keyPrefix) {
    const rateLimitStatus = getRateLimitStatus(keyPrefix);
    if (rateLimitStatus) {
      Object.assign(headers, getRateLimitHeaders(rateLimitStatus));
    }
  }

  return NextResponse.json(response, { headers });
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.BASE_URL || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
