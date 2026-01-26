/**
 * MCP (Model Context Protocol) Server Types
 *
 * Type definitions for the MCP HTTP server that exposes
 * project data to Claude Code, Cursor, and VS Code.
 *
 * @see .planning/phases/phase-11/MCP-ARCHITECTURE.md
 */

import { z } from 'zod';

// ============================================================
// Core MCP Types
// ============================================================

/**
 * MCP tool request from client
 */
export interface MCPToolRequest {
  /** Tool name to invoke */
  tool: string;
  /** Project ID (from URL path) */
  projectId: number;
  /** Tool-specific parameters */
  parameters?: Record<string, unknown>;
}

/**
 * MCP tool response to client
 */
export interface MCPToolResponse<T = unknown> {
  /** Whether the tool executed successfully */
  success: boolean;
  /** Tool output data (if success=true) */
  data?: T;
  /** Error information (if success=false) */
  error?: MCPError;
  /** Response metadata */
  meta?: MCPResponseMeta;
}

/**
 * MCP error details
 */
export interface MCPError {
  /** Error code for programmatic handling */
  code: MCPErrorCode;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: unknown;
  /** Request ID for debugging */
  requestId: string;
}

/**
 * Response metadata
 */
export interface MCPResponseMeta {
  /** Tool that was invoked */
  tool: string;
  /** Project ID */
  projectId: number;
  /** Execution time in milliseconds */
  executionMs: number;
  /** Response timestamp */
  timestamp: string;
  /** API version */
  version: string;
}

/**
 * MCP error codes
 */
export enum MCPErrorCode {
  // Authentication (401)
  INVALID_API_KEY = 'INVALID_API_KEY',
  EXPIRED_API_KEY = 'EXPIRED_API_KEY',
  REVOKED_API_KEY = 'REVOKED_API_KEY',
  INSUFFICIENT_SCOPE = 'INSUFFICIENT_SCOPE',

  // Authorization (403)
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  PROJECT_ACCESS_DENIED = 'PROJECT_ACCESS_DENIED',

  // Validation (400)
  INVALID_TOOL = 'INVALID_TOOL',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  MISSING_REQUIRED_PARAM = 'MISSING_REQUIRED_PARAM',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  AGENT_ERROR = 'AGENT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

// ============================================================
// Tool Definition Types
// ============================================================

/**
 * MCP tool definition
 */
export interface MCPToolDefinition<TParams = Record<string, unknown>, TResult = unknown> {
  /** Unique tool name (snake_case) */
  name: string;
  /** Human-readable description */
  description: string;
  /** Parameter schema */
  parameters: MCPParameterSchema[];
  /** Required API key scopes */
  requiredScopes: ApiKeyScope[];
  /** Tool handler function */
  handler: MCPToolHandler<TParams, TResult>;
}

/**
 * Parameter schema for a tool
 */
export interface MCPParameterSchema {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /** Whether the parameter is required */
  required: boolean;
  /** Parameter description */
  description: string;
  /** Default value */
  default?: unknown;
  /** Allowed values (for enums) */
  enum?: string[];
  /** Item schema (for arrays) */
  items?: MCPParameterSchema;
  /** Properties (for objects) */
  properties?: MCPParameterSchema[];
}

/**
 * Tool handler function type
 */
export type MCPToolHandler<TParams = Record<string, unknown>, TResult = unknown> = (
  request: MCPToolRequest & { parameters: TParams },
  context: MCPToolContext
) => Promise<MCPToolResponse<TResult>>;

/**
 * Context provided to tool handlers
 */
export interface MCPToolContext {
  /** Validated API key info */
  apiKey: ValidatedApiKey;
  /** Database client */
  db: unknown; // Type as your Drizzle client
  /** Request ID for logging */
  requestId: string;
  /** Start time for execution tracking */
  startTime: number;
}

// ============================================================
// Authentication Types
// ============================================================

/**
 * API key scopes
 */
export type ApiKeyScope =
  | 'read:prd'
  | 'read:schema'
  | 'read:api'
  | 'read:stories'
  | 'write:stories'
  | 'read:validation'
  | 'invoke:agents'
  | 'admin';

/**
 * Validated API key information
 */
export interface ValidatedApiKey {
  /** API key database ID */
  id: number;
  /** Project ID the key belongs to */
  projectId: number;
  /** Key name */
  name: string;
  /** Granted scopes */
  scopes: ApiKeyScope[];
  /** When the key was created */
  createdAt: Date;
  /** When the key expires (if set) */
  expiresAt?: Date;
}

/**
 * API key validation result
 */
export interface ApiKeyValidationResult {
  /** Whether the key is valid */
  valid: boolean;
  /** Validated key info (if valid) */
  key?: ValidatedApiKey;
  /** Error code (if invalid) */
  errorCode?: MCPErrorCode;
  /** Error message (if invalid) */
  errorMessage?: string;
}

// ============================================================
// Rate Limiting Types
// ============================================================

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in window */
  remaining: number;
  /** When the limit resets */
  resetAt: Date;
  /** Headers to include in response */
  headers: Record<string, string>;
}

/**
 * Rate limit configuration by plan
 */
export interface RateLimitConfig {
  /** Requests per minute */
  requestsPerMinute: number;
  /** Requests per day */
  requestsPerDay: number;
  /** Maximum concurrent requests */
  maxConcurrent: number;
}

// ============================================================
// Tool-Specific Output Types
// ============================================================

// --- get_prd ---
export interface GetPRDParams {
  section?: 'vision' | 'actors' | 'use_cases' | 'scope' | 'data';
  format?: 'json' | 'markdown';
}

export interface PRDContent {
  projectName: string;
  vision: string;
  actors: Array<{
    name: string;
    role: string;
    description: string;
    permissions?: string[];
  }>;
  useCases: Array<{
    id: string;
    name: string;
    description: string;
    actor: string;
    trigger?: string;
    outcome?: string;
    preconditions?: string[];
    postconditions?: string[];
    acceptanceCriteria?: string[];
    priority?: string;
  }>;
  systemBoundaries: {
    internal: string[];
    external: string[];
    inScope?: string[];
    outOfScope?: string[];
  };
  dataEntities: Array<{
    name: string;
    attributes: string[];
    relationships: string[];
  }>;
  constraints?: string[];
  successCriteria?: string[];
}

// --- get_database_schema ---
export interface GetDatabaseSchemaParams {
  entity?: string;
  includeIndexes?: boolean;
  format?: 'json' | 'sql' | 'drizzle' | 'prisma';
}

export interface DatabaseSchemaOutput {
  entities: Array<{
    name: string;
    description: string;
    tableName?: string;
    fields: Array<{
      name: string;
      type: string;
      nullable: boolean;
      defaultValue?: string;
      constraints: string[];
      description?: string;
    }>;
    relationships: Array<{
      type: 'one-to-one' | 'one-to-many' | 'many-to-many';
      targetEntity: string;
      foreignKey: string;
      onDelete?: string;
    }>;
    indexes: Array<{
      name: string;
      columns: string[];
      unique?: boolean;
      type?: string;
    }>;
  }>;
  enums?: Array<{
    name: string;
    values: string[];
    description?: string;
  }>;
  generatedAt: string;
  exportFormat?: string;
}

// --- get_api_specs ---
export interface GetAPISpecsParams {
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  tag?: string;
  format?: 'json' | 'openapi';
}

export interface APISpecsOutput {
  baseUrl: string;
  version: string;
  authentication: {
    type: string;
    description: string;
  };
  endpoints: Array<{
    path: string;
    method: string;
    description: string;
    authentication: boolean;
    operationId: string;
    tags: string[];
    requestBody?: unknown;
    responseBody: unknown;
    errorCodes: Array<{
      code: number;
      name: string;
      description: string;
    }>;
  }>;
  totalCount: number;
  openApiSpec?: object;
}

// --- get_tech_stack ---
export interface GetTechStackParams {
  category?: string;
}

export interface TechStackOutput {
  categories: Array<{
    category: string;
    choice: string;
    version?: string;
    rationale: string;
    alternatives: Array<{
      name: string;
      whyNot: string;
    }>;
    documentation?: string;
  }>;
  constraints: string[];
  rationale: string;
  estimatedCost?: string;
}

// --- get_user_stories ---
export interface GetUserStoriesParams {
  status?: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  epic?: string;
  limit?: number;
  offset?: number;
}

export interface UserStoriesOutput {
  stories: Array<{
    id: number;
    title: string;
    description: string;
    actor: string;
    epic?: string;
    acceptanceCriteria: string[];
    status: string;
    priority: string;
    estimatedEffort: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  }>;
  totalCount: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  summary: {
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
}

// --- get_diagrams ---
export interface GetDiagramsParams {
  type?: 'context' | 'use_case' | 'class' | 'sequence' | 'activity' | 'system';
  format?: 'mermaid' | 'svg_url';
}

export interface DiagramsOutput {
  diagrams: Array<{
    id: number;
    type: string;
    title: string;
    mermaidCode: string;
    imageUrl?: string;
    status: string;
    createdAt: string;
  }>;
  count: number;
}

// --- get_coding_guidelines ---
export interface GetCodingGuidelinesParams {
  category?: 'naming' | 'patterns' | 'testing' | 'documentation' | 'linting';
}

export interface CodingGuidelinesOutput {
  naming?: {
    files: string;
    components: string;
    functions: string;
    variables: string;
    constants: string;
  };
  patterns: Array<{
    name: string;
    description: string;
    example?: string;
  }>;
  forbidden: Array<{
    practice: string;
    reason: string;
  }>;
  linting?: {
    tool: string;
    config: string;
    rules: string[];
  };
  testing?: {
    framework: string;
    coverage: string;
    patterns: string[];
  };
  documentation?: {
    style: string;
    requirements: string[];
  };
}

// --- get_infrastructure ---
export interface GetInfrastructureParams {
  component?: 'hosting' | 'database' | 'cache' | 'cicd' | 'monitoring' | 'security';
}

export interface InfrastructureOutput {
  hosting?: {
    provider: string;
    service: string;
    region: string;
    scaling: string;
  };
  database?: {
    type: string;
    provider: string;
    version: string;
    configuration: string;
  };
  caching?: {
    provider: string;
    strategy: string;
  };
  cicd?: {
    platform: string;
    triggers: string[];
    stages: string[];
  };
  monitoring?: {
    logging: string;
    metrics: string;
    alerting: string;
  };
  security?: {
    authentication: string;
    authorization: string;
    secrets: string;
  };
  estimatedCost?: string;
}

// --- get_project_architecture ---
export interface GetProjectArchitectureParams {
  includeInfrastructure?: boolean;
  includeDiagrams?: boolean;
}

export interface ProjectArchitectureOutput {
  overview: string;
  techStack: TechStackOutput;
  services: Array<{
    name: string;
    type: string;
    description: string;
    dependencies: string[];
  }>;
  dataFlow?: string;
  infrastructure?: InfrastructureOutput;
  diagrams?: DiagramsOutput;
}

// --- get_coding_context ---
export interface GetCodingContextParams {
  category?: 'frontend' | 'backend' | 'database' | 'testing' | 'general';
}

export interface CodingContextOutput {
  mustDo: Array<{
    id: string;
    category: string;
    rule: string;
    rationale: string;
    examples?: Array<{
      code: string;
      language: string;
    }>;
  }>;
  mustNotDo: Array<{
    id: string;
    category: string;
    rule: string;
    rationale: string;
    examples?: Array<{
      code: string;
      language: string;
    }>;
  }>;
  bestPractices: Array<{
    id: string;
    category: string;
    rule: string;
    rationale: string;
  }>;
}

// --- update_user_story_status ---
export interface UpdateUserStoryStatusParams {
  storyId: number;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  notes?: string;
}

export interface UpdateStoryResult {
  success: boolean;
  story: UserStoriesOutput['stories'][0];
  previousStatus: string;
  updatedAt: string;
}

// --- ask_project_question ---
export interface AskProjectQuestionParams {
  question: string;
  context?: string[];
}

export interface QuestionAnswerResult {
  answer: string;
  confidence: number;
  sources: Array<{
    type: string;
    id: string;
    excerpt: string;
  }>;
  relatedTopics: string[];
}

// --- get_validation_status (UNIQUE) ---
export interface GetValidationStatusParams {
  includeDetails?: boolean;
  gateId?: string;
}

export interface ValidationStatusOutput {
  projectId: number;
  overallScore: number;
  passed: boolean;
  threshold: number;
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
  hardGates: Array<{
    id: string;
    name: string;
    description: string;
    passed: boolean;
    checks?: Array<{
      id: string;
      name: string;
      description: string;
      passed: boolean;
      message: string;
      severity: 'error' | 'warning';
    }>;
  }>;
  artifacts?: Array<{
    artifactType: string;
    present: boolean;
    passed: boolean;
  }>;
  errors: string[];
  warnings: string[];
  validatedAt: string;
}

// --- get_gsd_phases (UNIQUE) ---
export interface GetGSDPhasesParams {
  includeTaskCounts?: boolean;
}

export interface GSDPhasesOutput {
  currentPhase: string;
  phases: Array<{
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'active' | 'completed';
    order: number;
    taskCount?: number;
    completedTaskCount?: number;
  }>;
  progress: {
    overall: number;
    byPhase: Record<string, number>;
  };
}

// --- get_cleo_tasks (UNIQUE) ---
export interface GetCLEOTasksParams {
  status?: string;
  phase?: string;
  parentId?: string;
  limit?: number;
}

export interface CLEOTasksOutput {
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    phase: string;
    parentId?: string;
    labels?: string[];
    createdAt: string;
    updatedAt: string;
  }>;
  totalCount: number;
  summary: {
    byStatus: Record<string, number>;
    byPhase: Record<string, number>;
  };
}

// --- invoke_agent (UNIQUE) ---
export interface InvokeAgentParams {
  agentType:
    | 'backend-architect'
    | 'database-engineer'
    | 'devops-engineer'
    | 'ui-ux-engineer'
    | 'langchain-engineer'
    | 'qa-engineer'
    | 'product-manager'
    | 'documentation-engineer';
  prompt: string;
  context?: Record<string, unknown>;
}

export interface InvokeAgentResult {
  success: boolean;
  agentType: string;
  response: string;
  artifacts?: Array<{
    type: string;
    content: unknown;
    format: string;
  }>;
  executionMs: number;
  tokensUsed?: number;
}

// --- search_project_context (UNIQUE) ---
export interface SearchProjectContextParams {
  query: string;
  sources?: Array<'prd' | 'stories' | 'schema' | 'api' | 'diagrams' | 'guidelines'>;
  limit?: number;
}

export interface SearchResultsOutput {
  query: string;
  results: Array<{
    source: string;
    id: string;
    title: string;
    excerpt: string;
    relevanceScore: number;
    path?: string;
  }>;
  totalCount: number;
  executionMs: number;
}

// ============================================================
// MCP Configuration Types
// ============================================================

/**
 * MCP server configuration (for client setup)
 */
export interface MCPServerConfig {
  name: string;
  version: string;
  description: string;
  transport: {
    type: 'http';
    url: string;
  };
  authentication: {
    type: 'bearer';
    description: string;
  };
  tools: MCPToolConfigEntry[];
}

/**
 * Tool configuration entry
 */
export interface MCPToolConfigEntry {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, MCPSchemaProperty>;
    required?: string[];
  };
}

/**
 * JSON Schema property for tool config
 */
export interface MCPSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: MCPSchemaProperty;
  properties?: Record<string, MCPSchemaProperty>;
}

// ============================================================
// Zod Validators
// ============================================================

export const mcpToolRequestSchema = z.object({
  tool: z.string().min(1),
  parameters: z.record(z.unknown()).optional(),
});

export const apiKeyScopeSchema = z.enum([
  'read:prd',
  'read:schema',
  'read:api',
  'read:stories',
  'write:stories',
  'read:validation',
  'invoke:agents',
  'admin',
]);

export const getPRDParamsSchema = z.object({
  section: z.enum(['vision', 'actors', 'use_cases', 'scope', 'data']).optional(),
  format: z.enum(['json', 'markdown']).optional().default('json'),
});

export const getDatabaseSchemaParamsSchema = z.object({
  entity: z.string().optional(),
  includeIndexes: z.boolean().optional().default(true),
  format: z.enum(['json', 'sql', 'drizzle', 'prisma']).optional().default('json'),
});

export const getAPISpecsParamsSchema = z.object({
  endpoint: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
  tag: z.string().optional(),
  format: z.enum(['json', 'openapi']).optional().default('json'),
});

export const getTechStackParamsSchema = z.object({
  category: z.string().optional(),
});

export const getUserStoriesParamsSchema = z.object({
  status: z.enum(['backlog', 'todo', 'in-progress', 'review', 'done', 'blocked']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  epic: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export const getDiagramsParamsSchema = z.object({
  type: z.enum(['context', 'use_case', 'class', 'sequence', 'activity', 'system']).optional(),
  format: z.enum(['mermaid', 'svg_url']).optional().default('mermaid'),
});

export const getCodingGuidelinesParamsSchema = z.object({
  category: z.enum(['naming', 'patterns', 'testing', 'documentation', 'linting']).optional(),
});

export const getInfrastructureParamsSchema = z.object({
  component: z.enum(['hosting', 'database', 'cache', 'cicd', 'monitoring', 'security']).optional(),
});

export const getProjectArchitectureParamsSchema = z.object({
  includeInfrastructure: z.boolean().optional().default(true),
  includeDiagrams: z.boolean().optional().default(false),
});

export const getCodingContextParamsSchema = z.object({
  category: z.enum(['frontend', 'backend', 'database', 'testing', 'general']).optional(),
});

export const updateUserStoryStatusParamsSchema = z.object({
  storyId: z.number().int().positive(),
  status: z.enum(['backlog', 'todo', 'in-progress', 'review', 'done', 'blocked']),
  notes: z.string().max(500).optional(),
});

export const askProjectQuestionParamsSchema = z.object({
  question: z.string().min(5).max(1000),
  context: z.array(z.string()).optional(),
});

export const getValidationStatusParamsSchema = z.object({
  includeDetails: z.boolean().optional().default(false),
  gateId: z.string().optional(),
});

export const getGSDPhasesParamsSchema = z.object({
  includeTaskCounts: z.boolean().optional().default(false),
});

export const getCLEOTasksParamsSchema = z.object({
  status: z.string().optional(),
  phase: z.string().optional(),
  parentId: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
});

export const invokeAgentParamsSchema = z.object({
  agentType: z.enum([
    'backend-architect',
    'database-engineer',
    'devops-engineer',
    'ui-ux-engineer',
    'langchain-engineer',
    'qa-engineer',
    'product-manager',
    'documentation-engineer',
  ]),
  prompt: z.string().min(10).max(5000),
  context: z.record(z.unknown()).optional(),
});

export const searchProjectContextParamsSchema = z.object({
  query: z.string().min(2).max(200),
  sources: z.array(z.enum(['prd', 'stories', 'schema', 'api', 'diagrams', 'guidelines'])).optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

// ============================================================
// Tool Registry Types
// ============================================================

/**
 * Tool registry for managing all MCP tools
 */
export interface MCPToolRegistry {
  /** Register a new tool */
  register<TParams, TResult>(tool: MCPToolDefinition<TParams, TResult>): void;
  /** Get a tool by name */
  get(name: string): MCPToolDefinition | undefined;
  /** Get all registered tools */
  getAll(): MCPToolDefinition[];
  /** Check if a tool exists */
  has(name: string): boolean;
  /** Get tool names */
  getNames(): string[];
  /** Generate MCP config for all tools */
  generateConfig(projectId: number, baseUrl: string): MCPServerConfig;
}

// ============================================================
// Audit Log Types
// ============================================================

/**
 * MCP request audit log entry
 */
export interface MCPAuditLog {
  id: string;
  projectId: number;
  apiKeyId: number;
  tool: string;
  parameters: Record<string, unknown>;
  success: boolean;
  errorCode?: MCPErrorCode;
  executionMs: number;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
