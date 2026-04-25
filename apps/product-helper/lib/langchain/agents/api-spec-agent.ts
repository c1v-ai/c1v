/**
 * API Specification Generator Agent (Phase 10.1)
 *
 * Purpose: Generate REST API specifications from use cases and data entities
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * Uses Claude Sonnet via central config for deterministic generation.
 * Analyzes use cases and data entities to produce:
 * - RESTful endpoints covering all use cases
 * - Request/response schemas based on data entities
 * - Authentication configuration
 * - Error handling patterns
 */

import { createClaudeAgent } from '../config';
import { z } from 'zod';
import type {
  APISpecification,
  APISpecGenerationContext,
} from '../../types/api-specification';
import { getAPISpecKnowledge } from '../../education/generator-kb';
import type {
  InterfaceMatrixRowProjection,
  SubsystemProjection,
} from '../schemas/projections';

// ============================================================
// Zod Schemas for LLM Structured Output
// ============================================================

const parameterSchema = z.object({
  name: z.string().describe('Parameter name (e.g., "id", "page")'),
  in: z.enum(['path', 'query', 'header']).describe('Parameter location'),
  required: z.boolean().describe('Whether the parameter is required'),
  description: z.string().describe('Parameter description'),
  type: z.enum(['string', 'number', 'integer', 'boolean', 'array', 'object']).describe('Data type'),
  format: z.string().optional().describe('Format hint (e.g., "uuid", "email", "date-time")'),
  example: z.unknown().optional().describe('Example value'),
});

const jsonSchemaPropertySchema = z.object({
  type: z.enum(['string', 'number', 'integer', 'boolean', 'array', 'object', 'null']).describe('Property type'),
  description: z.string().optional().describe('Property description'),
  format: z.string().optional().describe('Format hint'),
  example: z.unknown().optional().describe('Example value'),
  enum: z.array(z.string()).optional().describe('Enum values'),
  nullable: z.boolean().optional().describe('Whether the property can be null'),
});

/**
 * Items shape for jsonSchemaSchema.items. Flat by design — c1v's API-spec viewer
 * + OpenAPI export render top-level properties + array-of-primitives only;
 * nested array<object<array>> structure is intentionally unsupported.
 *
 * Keeping the 7-value type enum (matching the parent schema) means the LLM can
 * still declare items as array/null/object without parse rejection — only nested
 * structural recursion (items inside items) is dropped.
 *
 * Why flat: `z.lazy(() => jsonSchemaSchema)` produced a `$ref` self-loop in the
 * Anthropic tool-use input_schema, which destabilized structured-output
 * generation (see plans/v2-hotfix/plan.md §Cause A). Flattening eliminates the
 * recursion site without losing primitive-array expressiveness.
 */
const jsonSchemaItemsSchema = z.object({
  type: z.enum(['string', 'number', 'integer', 'boolean', 'array', 'object', 'null']).describe('Item type'),
  description: z.string().optional().describe('Item description'),
  example: z.unknown().optional().describe('Example value'),
});

const jsonSchemaSchema = z.object({
  type: z.enum(['string', 'number', 'integer', 'boolean', 'array', 'object', 'null']).describe('Schema type'),
  properties: z.record(jsonSchemaPropertySchema).optional().describe('Object properties'),
  required: z.array(z.string()).optional().describe('Required properties'),
  items: jsonSchemaItemsSchema.optional().describe('Array item schema (flat — primitives or single-level objects only)'),
  description: z.string().optional().describe('Schema description'),
  example: z.unknown().optional().describe('Example value'),
});

const requestBodySchema = z.object({
  contentType: z.string().default('application/json').describe('Content type'),
  required: z.boolean().describe('Whether the body is required'),
  description: z.string().optional().describe('Body description'),
  schema: jsonSchemaSchema.describe('Request body JSON schema'),
});

const errorCodeSchema = z.object({
  code: z.number().describe('HTTP status code'),
  name: z.string().describe('Error name (e.g., "NotFound")'),
  description: z.string().describe('When this error occurs'),
});

const endpointSchema = z.object({
  path: z.string().describe('URL path (e.g., "/users/{id}")'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).describe('HTTP method'),
  description: z.string().describe('Endpoint description'),
  authentication: z.boolean().describe('Whether auth is required'),
  operationId: z.string().describe('Operation ID for OpenAPI (e.g., "getUserById")'),
  tags: z.array(z.string()).describe('Tags for grouping'),
  pathParameters: z.array(parameterSchema).optional().describe('Path parameters'),
  queryParameters: z.array(parameterSchema).optional().describe('Query parameters'),
  requestBody: requestBodySchema.optional().describe('Request body'),
  responseBody: jsonSchemaSchema.describe('Response body schema'),
  errorCodes: z.array(errorCodeSchema).describe('Possible error codes'),
  rateLimit: z.string().optional().describe('Rate limit (e.g., "100/minute")'),
  sourceUseCases: z.array(z.string()).optional().describe('Source use case IDs'),
});

const authConfigSchema = z.object({
  type: z.enum(['none', 'api_key', 'bearer', 'oauth2', 'basic', 'jwt']).describe('Auth type'),
  description: z.string().describe('Auth description'),
  headerName: z.string().optional().describe('Header name'),
  tokenPrefix: z.string().optional().describe('Token prefix'),
  notes: z.string().optional().describe('Additional notes'),
});

const responseFormatSchema = z.object({
  wrapped: z.boolean().describe('Whether responses use an envelope'),
  contentType: z.string().default('application/json').describe('Content type'),
});

const errorConfigSchema = z.object({
  format: jsonSchemaSchema.describe('Error response format'),
  commonErrors: z.array(errorCodeSchema).describe('Common error codes'),
});

const apiSpecificationSchema = z.object({
  baseUrl: z.string().describe('Base URL (e.g., "/api/v1")'),
  version: z.string().describe('API version (e.g., "1.0.0")'),
  authentication: authConfigSchema.describe('Authentication config'),
  endpoints: z.array(endpointSchema).describe('All endpoints'),
  responseFormat: responseFormatSchema.describe('Response format config'),
  errorHandling: errorConfigSchema.describe('Error handling config'),
});

// ============================================================
// API Specification Prompt
// ============================================================

/**
 * Format the System Interface Matrix section (Step 6). Empty string when
 * neither interfaces nor subsystems are supplied — preserves pre-Phase-N
 * prompt shape for intakes that never ran Pipeline A.
 */
export function formatInterfaceMatrixSection(
  interfaces?: InterfaceMatrixRowProjection[],
  subsystems?: SubsystemProjection[],
): string {
  const hasInterfaces = interfaces && interfaces.length > 0;
  const hasSubsystems = subsystems && subsystems.length > 0;
  if (!hasInterfaces && !hasSubsystems) return '';

  const lines: string[] = ['## System Interface Matrix (Step 6)'];

  if (hasSubsystems) {
    lines.push('');
    lines.push('**Subsystems** (each becomes a resource/tag):');
    for (const s of subsystems) {
      lines.push(`- **${s.id}: ${s.name}** — ${s.description}`);
    }
  }

  if (hasInterfaces) {
    lines.push('');
    lines.push('**Interfaces:**');
    lines.push('| ID | Name | Source → Dest | Protocol | Frequency | Category | Payload |');
    lines.push('|---|---|---|---|---|---|---|');
    for (const i of interfaces) {
      lines.push(
        `| ${i.id} | ${i.name} | ${i.source} → ${i.destination} | ${i.protocol ?? '—'} | ${i.frequency ?? '—'} | ${i.category ?? '—'} | ${i.dataPayload} |`,
      );
    }
  }

  return lines.join('\n');
}

/**
 * Format the Steps-3-6 specific additions to the Coverage Requirements block.
 * Empty when no interfaces are supplied.
 */
function formatInterfaceInstructionAddendum(
  interfaces?: InterfaceMatrixRowProjection[],
): string {
  if (!interfaces || interfaces.length === 0) return '';
  return [
    '',
    '### Steps 3-6 Coverage (System Interface Matrix)',
    '- Each interface with `protocol: REST API` (or unspecified) MUST map to one or more endpoints.',
    '- SKIP interfaces with `protocol: WebSocket`, `Event`, `gRPC`, or `Message Queue` — they are not REST.',
    '- For interfaces with `category: auth`, emit auth/token endpoints (e.g., POST /auth/login, POST /auth/refresh).',
    '- For interfaces with `category: audit`, emit append-only log endpoints (POST only, no DELETE).',
    '- For interfaces with `category: critical`, add explicit rate-limit and SLA notes in the endpoint description.',
    '- Use the subsystem `name` as the endpoint `tag` (resource grouping) rather than the entity name where subsystems are defined.',
  ].join('\n');
}

function buildAPISpecPrompt(projectContext?: import('../../education/reference-data/types').KBProjectContext): string {
  return `You are an expert API architect generating REST API specifications from PRD data.

${getAPISpecKnowledge(projectContext)}

## Project Context
Project Name: {projectName}
Vision: {projectVision}

## Use Cases
{useCasesText}

## Data Entities
{dataEntitiesText}

## Tech Stack Context
{techStackText}
{interfaceMatrixSection}

## Required Output Structure

ALL of these top-level keys are REQUIRED — do NOT stop after authentication:
- baseUrl: string (e.g., "/api/v1")
- version: string (e.g., "1.0.0")
- authentication: { type, description, headerName?, tokenPrefix? }
- endpoints: array — CRUD per entity (~5 endpoints/entity), plus action endpoints for use cases
- responseFormat: { wrapped: boolean, contentType: string }
- errorHandling: { format: object, commonErrors: array of { code, name, description } }

## Instructions

Use the Knowledge Bank above as your primary reference for REST conventions, error codes, auth patterns, and endpoint design.

Generate a comprehensive REST API specification following the Knowledge Bank patterns:

### Coverage Requirements
- Generate endpoints for EVERY use case
- Include CRUD operations for each data entity (following KB endpoint generation rules)
- Add authentication endpoints if login/signup use cases exist
- Include list endpoints with cursor-based pagination for collections
- Add action endpoints for state transitions (POST /orders/{id}/cancel)
- Include GET /health endpoint
- Add search endpoints for entities with complex filtering needs{stepsCoverageAddendum}

### Endpoint Design
For each endpoint:
- Use descriptive operationId (camelCase, e.g., "createUser", "getUserOrders")
- Tag by resource type (e.g., "Users", "Orders")
- Follow KB naming rules: plural nouns, lowercase hyphens, max 2 nesting levels
- Include all relevant path and query parameters
- Define complete request/response schemas matching KB response patterns
- List appropriate error codes using KB error code standards
- Link to source use cases

### Authentication
- Use KB authentication patterns to infer auth type
- API keys for API-to-API, JWT Bearer for user sessions
- Mark protected endpoints as requiring authentication
- Public endpoints (signup, public listings) don't require auth

### Rate Limiting
- Include rate limit info using KB tier structure
- Add rate limit headers pattern to response format

### Error Handling
- Use KB error response format: { "error": { "code", "message", "details", "requestId" } }
- Use standard HTTP status codes from KB (400 vs 422 distinction)

Generate the complete API specification now.`;
}

// ============================================================
// Prompt Composition (exported for unit + snapshot testing)
// ============================================================

/**
 * Compose the full API Spec prompt from a context object. Pure function —
 * exported so tests can exercise the populated / undefined Steps 3-6 paths
 * without invoking the LLM.
 */
export function buildAPISpecPromptText(context: APISpecGenerationContext): string {
  const useCasesText = context.useCases
    .map((uc, idx) => {
      const preconditions = uc.preconditions?.length
        ? `\n   Preconditions: ${uc.preconditions.join(', ')}`
        : '';
      const postconditions = uc.postconditions?.length
        ? `\n   Postconditions: ${uc.postconditions.join(', ')}`
        : '';
      return `${idx + 1}. ${uc.id}: ${uc.name}\n   Actor: ${uc.actor}\n   Description: ${uc.description}${preconditions}${postconditions}`;
    })
    .join('\n\n');

  const dataEntitiesText = context.dataEntities
    .map((entity, idx) => {
      const attrs = entity.attributes.length > 0
        ? `Attributes: ${entity.attributes.join(', ')}`
        : 'Attributes: (none specified)';
      const rels = entity.relationships.length > 0
        ? `\n   Relationships: ${entity.relationships.join('; ')}`
        : '';
      return `${idx + 1}. ${entity.name}\n   ${attrs}${rels}`;
    })
    .join('\n\n');

  const techStackText = context.techStack
    ? `Backend: ${context.techStack.backend || 'Not specified'}\nDatabase: ${context.techStack.database || 'Not specified'}\nAuth: ${context.techStack.auth || 'JWT/Bearer (inferred)'}`
    : 'Not specified (use modern REST best practices with JWT authentication)';

  const visionText =
    context.projectVision.length > 1500
      ? context.projectVision.slice(0, 1500) + '...'
      : context.projectVision;

  const interfaceSection = formatInterfaceMatrixSection(
    context.interfaceMatrix,
    context.subsystems,
  );
  const interfaceMatrixSection = interfaceSection ? `\n\n${interfaceSection}` : '';

  const stepsCoverageAddendum = formatInterfaceInstructionAddendum(context.interfaceMatrix);

  return buildAPISpecPrompt(context.projectContext)
    .replace('{projectName}', context.projectName)
    .replace('{projectVision}', visionText)
    .replace('{useCasesText}', useCasesText || '(No use cases provided)')
    .replace('{dataEntitiesText}', dataEntitiesText || '(No data entities provided)')
    .replace('{techStackText}', techStackText)
    .replace('{interfaceMatrixSection}', interfaceMatrixSection)
    .replace('{stepsCoverageAddendum}', stepsCoverageAddendum);
}

// ============================================================
// Main Generation Function
// ============================================================

/**
 * Generate API specification from use cases and data entities
 *
 * @param context - Project context with use cases and data entities
 * @returns Complete API specification
 *
 * @example
 * ```typescript
 * const spec = await generateAPISpecification({
 *   projectName: "E-Commerce Platform",
 *   projectVision: "Modern online shopping experience",
 *   useCases: [{ id: "UC1", name: "Place Order", ... }],
 *   dataEntities: [{ name: "User", attributes: ["id", "email"], ... }],
 * });
 * ```
 */
export async function generateAPISpecification(
  context: APISpecGenerationContext
): Promise<APISpecification> {
  const structuredModel = createClaudeAgent(apiSpecificationSchema, 'generate_api_specification', {
    temperature: 0.2,
    maxTokens: 12000, // ~30 endpoints with nested response schemas; was 8000
  });

  const prompt = buildAPISpecPromptText(context);

  // Attempt 1
  try {
    const result = await structuredModel.invoke(prompt);
    const baseSpec = result as unknown as APISpecification;
    if (baseSpec.endpoints && baseSpec.endpoints.length > 0) {
      return {
        ...baseSpec,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatorVersion: '1.0.0',
          endpointCount: baseSpec.endpoints.length,
          useCasesCovered: context.useCases.map(uc => uc.id),
          entitiesReferenced: context.dataEntities.map(e => e.name),
        },
      };
    }
    console.warn('[APISpec] First attempt returned no endpoints, retrying...');
  } catch (error) {
    console.warn('[APISpec] First attempt failed, retrying...', (error as Error).message?.slice(0, 100));
  }

  // Attempt 2: Shorter, focused prompt emphasizing endpoints
  try {
    const retryPrompt = `Generate a complete REST API specification for "${context.projectName}".

Entities: ${context.dataEntities.map(e => e.name).join(', ')}
Use Cases: ${context.useCases.map(uc => `${uc.name} (${uc.actor})`).join(', ')}

ALL of these top-level keys are REQUIRED — do NOT stop after authentication:
- baseUrl: string (e.g., "/api/v1")
- version: string (e.g., "1.0.0")
- authentication: { type, description, headerName?, tokenPrefix? }
- endpoints: array — CRUD per entity (~5 endpoints/entity), plus action endpoints for use cases
- responseFormat: { wrapped: boolean, contentType: string }
- errorHandling: { format: object, commonErrors: array of { code, name, description } }

For each endpoint include: path, method, description, authentication (boolean), operationId, tags, responseBody (JSON schema), errorCodes.
Use REST conventions: plural nouns, proper HTTP methods, /api/v1 prefix.`;

    const result = await structuredModel.invoke(retryPrompt);
    const baseSpec = result as unknown as APISpecification;
    if (baseSpec.endpoints && baseSpec.endpoints.length > 0) {
      return {
        ...baseSpec,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatorVersion: '1.0.0',
          endpointCount: baseSpec.endpoints.length,
          useCasesCovered: context.useCases.map(uc => uc.id),
          entitiesReferenced: context.dataEntities.map(e => e.name),
        },
      };
    }
  } catch (error) {
    console.error('API specification generation error (retry):', error);
  }

  // Fallback: construct basic CRUD endpoints from entities
  console.warn('[APISpec] Both attempts failed, constructing CRUD endpoints from entities');
  const fallbackEndpoints = context.dataEntities.flatMap(entity => {
    const resource = entity.name.toLowerCase().replace(/\s+/g, '-') + 's';
    const tag = entity.name;
    return [
      {
        path: `/api/v1/${resource}`,
        method: 'GET' as const,
        description: `List all ${resource}`,
        authentication: true,
        operationId: `list${entity.name.replace(/\s+/g, '')}`,
        tags: [tag],
        queryParameters: [
          { name: 'page', in: 'query' as const, type: 'integer', required: false, description: 'Page number' },
          { name: 'limit', in: 'query' as const, type: 'integer', required: false, description: 'Items per page' },
        ],
        responseBody: { type: 'array' as const, description: `List of ${resource}` },
        errorCodes: [{ code: 401, name: 'Unauthorized', description: 'Missing authentication' }],
      },
      {
        path: `/api/v1/${resource}`,
        method: 'POST' as const,
        description: `Create a new ${entity.name.toLowerCase()}`,
        authentication: true,
        operationId: `create${entity.name.replace(/\s+/g, '')}`,
        tags: [tag],
        requestBody: {
          contentType: 'application/json',
          required: true,
          description: `${entity.name} data`,
          schema: {
            type: 'object' as const,
            properties: Object.fromEntries(
              entity.attributes.map(a => [a, { type: 'string' as const, description: a }])
            ),
          },
        },
        responseBody: { type: 'object' as const, description: `Created ${entity.name.toLowerCase()}` },
        errorCodes: [
          { code: 400, name: 'BadRequest', description: 'Invalid data' },
          { code: 401, name: 'Unauthorized', description: 'Missing authentication' },
        ],
      },
      {
        path: `/api/v1/${resource}/{id}`,
        method: 'GET' as const,
        description: `Get ${entity.name.toLowerCase()} by ID`,
        authentication: true,
        operationId: `get${entity.name.replace(/\s+/g, '')}ById`,
        tags: [tag],
        pathParameters: [{ name: 'id', in: 'path' as const, type: 'string', required: true, description: `${entity.name} ID` }],
        responseBody: { type: 'object' as const, description: entity.name },
        errorCodes: [
          { code: 401, name: 'Unauthorized', description: 'Missing authentication' },
          { code: 404, name: 'NotFound', description: `${entity.name} not found` },
        ],
      },
    ];
  });

  return {
    ...getDefaultAPISpecification(),
    endpoints: fallbackEndpoints as APISpecification['endpoints'],
    metadata: {
      generatedAt: new Date().toISOString(),
      generatorVersion: '1.0.0',
      endpointCount: fallbackEndpoints.length,
      useCasesCovered: context.useCases.map(uc => uc.id),
      entitiesReferenced: context.dataEntities.map(e => e.name),
    },
  };
}

/**
 * Get a default/empty API specification for error cases
 */
export function getDefaultAPISpecification(): APISpecification {
  return {
    baseUrl: '/api/v1',
    version: '1.0.0',
    authentication: {
      type: 'bearer',
      description: 'JWT Bearer token authentication',
      headerName: 'Authorization',
      tokenPrefix: 'Bearer',
    },
    endpoints: [],
    responseFormat: {
      wrapped: true,
      contentType: 'application/json',
    },
    errorHandling: {
      format: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Error code' },
          message: { type: 'string', description: 'Human-readable message' },
          details: { type: 'object', description: 'Additional error details', nullable: true },
        },
        required: ['error', 'message'],
      },
      commonErrors: [
        { code: 400, name: 'BadRequest', description: 'Invalid request data' },
        { code: 401, name: 'Unauthorized', description: 'Missing or invalid authentication' },
        { code: 403, name: 'Forbidden', description: 'Insufficient permissions' },
        { code: 404, name: 'NotFound', description: 'Resource not found' },
        { code: 500, name: 'InternalError', description: 'Unexpected server error' },
      ],
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      generatorVersion: '1.0.0',
      endpointCount: 0,
      useCasesCovered: [],
      entitiesReferenced: [],
    },
  };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Merge new API specification with existing data (incremental update)
 *
 * @param existing - Previously generated specification
 * @param newSpec - Newly generated specification
 * @returns Merged specification
 */
export function mergeAPISpecifications(
  existing: APISpecification,
  newSpec: APISpecification
): APISpecification {
  // Merge endpoints (newer endpoints override by operationId)
  const endpointMap = new Map(existing.endpoints.map(e => [e.operationId, e]));
  newSpec.endpoints.forEach(endpoint => {
    endpointMap.set(endpoint.operationId, endpoint);
  });

  return {
    ...newSpec,
    endpoints: Array.from(endpointMap.values()),
    metadata: {
      generatedAt: new Date().toISOString(),
      generatorVersion: '1.0.0',
      endpointCount: endpointMap.size,
      useCasesCovered: [
        ...new Set([
          ...(existing.metadata?.useCasesCovered || []),
          ...(newSpec.metadata?.useCasesCovered || []),
        ]),
      ],
      entitiesReferenced: [
        ...new Set([
          ...(existing.metadata?.entitiesReferenced || []),
          ...(newSpec.metadata?.entitiesReferenced || []),
        ]),
      ],
    },
  };
}

/**
 * Get a summary of the API specification
 */
export function getAPISpecSummary(spec: APISpecification): string {
  const endpointsByTag = new Map<string, number>();
  spec.endpoints.forEach(ep => {
    ep.tags.forEach(tag => {
      endpointsByTag.set(tag, (endpointsByTag.get(tag) || 0) + 1);
    });
  });

  const tagSummary = Array.from(endpointsByTag.entries())
    .map(([tag, count]) => `  - ${tag}: ${count} endpoints`)
    .join('\n');

  const methodCounts = {
    GET: spec.endpoints.filter(e => e.method === 'GET').length,
    POST: spec.endpoints.filter(e => e.method === 'POST').length,
    PUT: spec.endpoints.filter(e => e.method === 'PUT').length,
    PATCH: spec.endpoints.filter(e => e.method === 'PATCH').length,
    DELETE: spec.endpoints.filter(e => e.method === 'DELETE').length,
  };

  return [
    `API Specification Summary`,
    `Base URL: ${spec.baseUrl}`,
    `Version: ${spec.version}`,
    `Authentication: ${spec.authentication.type}`,
    ``,
    `Endpoints (${spec.endpoints.length} total):`,
    `  GET: ${methodCounts.GET}, POST: ${methodCounts.POST}, PUT: ${methodCounts.PUT}, PATCH: ${methodCounts.PATCH}, DELETE: ${methodCounts.DELETE}`,
    ``,
    `By Tag:`,
    tagSummary || '  (no tags)',
    ``,
    `Generated: ${spec.metadata?.generatedAt || 'unknown'}`,
  ].join('\n');
}

/**
 * Validate API specification structure
 */
export function validateAPISpecification(spec: APISpecification): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!spec.baseUrl) {
    errors.push('Missing baseUrl');
  }

  if (!spec.version) {
    errors.push('Missing version');
  }

  if (!spec.authentication?.type) {
    errors.push('Missing authentication configuration');
  }

  if (!spec.endpoints || spec.endpoints.length === 0) {
    errors.push('No endpoints defined');
  }

  // Validate each endpoint
  spec.endpoints.forEach((endpoint, idx) => {
    if (!endpoint.path) {
      errors.push(`Endpoint ${idx}: missing path`);
    }
    if (!endpoint.method) {
      errors.push(`Endpoint ${idx}: missing method`);
    }
    if (!endpoint.operationId) {
      errors.push(`Endpoint ${idx}: missing operationId`);
    }
    if (!endpoint.responseBody) {
      errors.push(`Endpoint ${idx} (${endpoint.operationId}): missing responseBody`);
    }

    // Check for duplicate operationIds
    const duplicates = spec.endpoints.filter(e => e.operationId === endpoint.operationId);
    if (duplicates.length > 1) {
      errors.push(`Duplicate operationId: ${endpoint.operationId}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors: [...new Set(errors)], // Remove duplicate errors
  };
}

// Export schema for testing
export { apiSpecificationSchema, endpointSchema };
