/**
 * API Specification Types (Phase 10.1)
 *
 * TypeScript interfaces for REST API specifications generated from use cases
 * and data entities. These types are used for the api_specification JSONB
 * column in project_data table.
 *
 * @see ROADMAP-2.0.md Phase 10.1 for requirements
 */

// ============================================================
// Core API Specification Types
// ============================================================

/**
 * Complete API specification for a project
 * Stored in project_data.api_specification JSONB column
 */
export interface APISpecification {
  /** Base URL for the API (e.g., "/api/v1") */
  baseUrl: string;

  /** API version string (e.g., "1.0.0") */
  version: string;

  /** Authentication configuration */
  authentication: AuthConfig;

  /** All API endpoints */
  endpoints: Endpoint[];

  /** Standard response format */
  responseFormat: ResponseFormat;

  /** Error handling configuration */
  errorHandling: ErrorConfig;

  /** Generation metadata */
  metadata?: APIMetadata;
}

/**
 * Authentication configuration for the API
 */
export interface AuthConfig {
  /** Authentication type */
  type: AuthType;

  /** Description of the authentication method */
  description: string;

  /** Header name for authentication (e.g., "Authorization") */
  headerName?: string;

  /** Token prefix for bearer tokens (e.g., "Bearer") */
  tokenPrefix?: string;

  /** OAuth2 scopes if applicable */
  scopes?: OAuthScope[];

  /** Additional authentication notes */
  notes?: string;
}

export type AuthType =
  | 'none'
  | 'api_key'
  | 'bearer'
  | 'oauth2'
  | 'basic'
  | 'jwt';

/**
 * OAuth2 scope definition
 */
export interface OAuthScope {
  name: string;
  description: string;
}

// ============================================================
// Endpoint Types
// ============================================================

/**
 * API Endpoint definition
 */
export interface Endpoint {
  /** URL path (e.g., "/users/{id}") */
  path: string;

  /** HTTP method */
  method: HTTPMethod;

  /** Human-readable description */
  description: string;

  /** Whether authentication is required */
  authentication: boolean;

  /** Required authentication scopes (if any) */
  requiredScopes?: string[];

  /** Operation ID for OpenAPI (e.g., "getUserById") */
  operationId: string;

  /** Tags for grouping endpoints */
  tags: string[];

  /** Path parameters */
  pathParameters?: Parameter[];

  /** Query parameters */
  queryParameters?: Parameter[];

  /** Request body schema */
  requestBody?: RequestBody;

  /** Response body schema */
  responseBody: JSONSchema;

  /** Error codes and their descriptions */
  errorCodes: ErrorCode[];

  /** Rate limit configuration */
  rateLimit?: string;

  /** Link to source use case(s) */
  sourceUseCases?: string[];

  /** Additional notes or examples */
  notes?: string;
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * URL or query parameter definition
 */
export interface Parameter {
  /** Parameter name */
  name: string;

  /** Where the parameter is located */
  in: 'path' | 'query' | 'header';

  /** Whether the parameter is required */
  required: boolean;

  /** Parameter description */
  description: string;

  /** Data type */
  type: JSONSchemaType;

  /** Format (e.g., "uuid", "email", "date-time") */
  format?: string;

  /** Default value if optional */
  default?: unknown;

  /** Example value */
  example?: unknown;

  /** Enum values if restricted */
  enum?: string[];
}

/**
 * Request body definition
 */
export interface RequestBody {
  /** Content type (usually "application/json") */
  contentType: string;

  /** Whether the body is required */
  required: boolean;

  /** Description of the request body */
  description?: string;

  /** JSON Schema for the request body */
  schema: JSONSchema;
}

// ============================================================
// JSON Schema Types (OpenAPI compatible)
// ============================================================

/**
 * JSON Schema for request/response bodies
 * Compatible with OpenAPI 3.0 schema specification
 */
export interface JSONSchema {
  /** Schema type */
  type: JSONSchemaType;

  /** For objects: property definitions */
  properties?: Record<string, JSONSchemaProperty>;

  /** Required properties for objects */
  required?: string[];

  /** For arrays: item schema */
  items?: JSONSchema;

  /** Description of the schema */
  description?: string;

  /** Example value */
  example?: unknown;

  /** Reference to another schema */
  $ref?: string;

  /** Nullable flag */
  nullable?: boolean;

  /** One of multiple schemas */
  oneOf?: JSONSchema[];

  /** All of multiple schemas */
  allOf?: JSONSchema[];

  /** Any of multiple schemas */
  anyOf?: JSONSchema[];

  /** Additional properties allowed */
  additionalProperties?: boolean | JSONSchema;
}

export type JSONSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null';

/**
 * Property definition within a JSON Schema
 */
export interface JSONSchemaProperty {
  type: JSONSchemaType;
  description?: string;
  format?: string;
  example?: unknown;
  enum?: string[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  items?: JSONSchema;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  $ref?: string;
}

// ============================================================
// Error Handling Types
// ============================================================

/**
 * Error code definition for an endpoint
 */
export interface ErrorCode {
  /** HTTP status code */
  code: number;

  /** Error name (e.g., "NotFound", "Unauthorized") */
  name: string;

  /** Description of when this error occurs */
  description: string;

  /** Example error response */
  example?: ErrorResponseExample;
}

/**
 * Example error response
 */
export interface ErrorResponseExample {
  error: string;
  message: string;
  details?: unknown;
}

/**
 * Global error handling configuration
 */
export interface ErrorConfig {
  /** Standard error response format */
  format: JSONSchema;

  /** Common error codes used across all endpoints */
  commonErrors: ErrorCode[];

  /** Error localization support */
  localization?: boolean;

  /** Whether to include stack traces in development */
  includeStackTrace?: boolean;
}

// ============================================================
// Response Format Types
// ============================================================

/**
 * Standard response format configuration
 */
export interface ResponseFormat {
  /** Whether responses are wrapped in a standard envelope */
  wrapped: boolean;

  /** Envelope structure if wrapped */
  envelope?: ResponseEnvelope;

  /** Pagination format for list endpoints */
  pagination?: PaginationFormat;

  /** Content type (usually "application/json") */
  contentType: string;
}

/**
 * Response envelope structure
 */
export interface ResponseEnvelope {
  /** Field name for the data */
  dataField: string;

  /** Field name for metadata */
  metaField?: string;

  /** Example envelope */
  example?: unknown;
}

/**
 * Pagination format for list endpoints
 */
export interface PaginationFormat {
  /** Pagination style */
  style: 'offset' | 'cursor' | 'page';

  /** Default page size */
  defaultPageSize: number;

  /** Maximum page size */
  maxPageSize: number;

  /** Query parameter names */
  parameters: {
    page?: string;
    pageSize?: string;
    cursor?: string;
    offset?: string;
    limit?: string;
  };

  /** Response metadata fields */
  responseFields: {
    total?: string;
    page?: string;
    pageSize?: string;
    hasMore?: string;
    nextCursor?: string;
  };
}

// ============================================================
// Metadata Types
// ============================================================

/**
 * API specification metadata
 */
export interface APIMetadata {
  /** When the spec was generated */
  generatedAt: string;

  /** Source project ID */
  projectId?: number;

  /** Version of the generator */
  generatorVersion?: string;

  /** Number of endpoints */
  endpointCount: number;

  /** Use cases covered */
  useCasesCovered: string[];

  /** Data entities referenced */
  entitiesReferenced: string[];
}

// ============================================================
// Helper Types
// ============================================================

/**
 * Input context for API spec generation
 */
export interface APISpecGenerationContext {
  projectName: string;
  projectVision: string;
  useCases: Array<{
    id: string;
    name: string;
    description: string;
    actor: string;
    preconditions?: string[];
    postconditions?: string[];
  }>;
  dataEntities: Array<{
    name: string;
    attributes: string[];
    relationships: string[];
  }>;
  techStack?: {
    backend?: string;
    database?: string;
    auth?: string;
  };
}

/**
 * Type guard to check if an object is a valid APISpecification
 */
export function isAPISpecification(obj: unknown): obj is APISpecification {
  if (!obj || typeof obj !== 'object') return false;
  const spec = obj as Record<string, unknown>;
  return (
    typeof spec.baseUrl === 'string' &&
    typeof spec.version === 'string' &&
    spec.authentication !== undefined &&
    Array.isArray(spec.endpoints) &&
    spec.responseFormat !== undefined &&
    spec.errorHandling !== undefined
  );
}

/**
 * Type guard to check if an object is a valid Endpoint
 */
export function isEndpoint(obj: unknown): obj is Endpoint {
  if (!obj || typeof obj !== 'object') return false;
  const endpoint = obj as Record<string, unknown>;
  return (
    typeof endpoint.path === 'string' &&
    typeof endpoint.method === 'string' &&
    typeof endpoint.description === 'string' &&
    typeof endpoint.authentication === 'boolean' &&
    typeof endpoint.operationId === 'string' &&
    Array.isArray(endpoint.tags) &&
    endpoint.responseBody !== undefined &&
    Array.isArray(endpoint.errorCodes)
  );
}
