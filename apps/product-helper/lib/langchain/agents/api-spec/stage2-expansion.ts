/**
 * Stage-2 deterministic expansion engine (Wave D Step D-2).
 *
 * Per Decision D-V21.12 and EC-V21-D.5: this module is a pure, deterministic
 * mapper — NO LLM calls. It consumes the flat operation index from stage-1
 * (`Stage1ApiSpec` from `../../schemas/api-spec/stage1-operation`) plus the
 * project's data-entity schemas, and emits the full nested
 * `apiSpecificationSchema` shape (`APISpecification`) — the same shape that
 * was previously asked of the LLM in a single call. The assembled output
 * MUST round-trip parse against `apiSpecificationSchema` (preserved at
 * `api-spec-agent.ts:131` for output validation only).
 *
 * Mapping rules (CRUD-shape per HTTP method × path-param presence):
 *
 *   GET    /:resource         → response = entity[]   (list)
 *   GET    /:resource/{id}    → response = entity     (read one)
 *   POST   /:resource         → request  = entity     (omit id-style fields)
 *                              response = entity     (create)
 *   PATCH  /:resource/{id}    → request  = Partial<entity>
 *                              response = entity     (partial update)
 *   PUT    /:resource/{id}    → request  = entity
 *                              response = entity     (full update)
 *   DELETE /:resource/{id}    → response = void (no body, 204)
 *
 * Non-CRUD verbs (action endpoints like `POST /orders/{id}/cancel`,
 * `POST /auth/login`, `GET /health`) fall through to a generic
 * "object" envelope; the description is preserved verbatim, request/response
 * stay shape-permissive because the deterministic engine cannot infer their
 * payload shape from an entity schema. Stage-3 LLM refinement (a Wave-B+
 * follow-up per R-V21.10) is the place to fill those — NOT here.
 *
 * ### Project entity schema source (JSDoc per dispatch-spec guardrail)
 *
 * `EntitySchema` corresponds to one row in `dataEntities` on
 * `APISpecGenerationContext` — the existing path
 * `project.projectData.intakeState.extractedData.schema` (entity name +
 * attributes + relationships). The post-Wave-A `project_artifacts kind='schema_*'`
 * path is NOT yet present at dispatch time (Wave A still in flight on the
 * shared branch); when it lands the call site can populate `entities` from
 * either source. This module is agnostic to source — it only sees the array.
 */

import type {
  APISpecification,
  Endpoint,
  HTTPMethod,
  JSONSchema,
  JSONSchemaProperty,
  Parameter,
  RequestBody,
  ErrorCode,
  ErrorConfig,
  AuthConfig,
  ResponseFormat,
} from '../../../types/api-specification';
import type {
  Stage1ApiSpec,
  Stage1Operation,
} from '../../schemas/api-spec/stage1-operation';

// ============================================================
// Public Types
// ============================================================

/**
 * Project entity schema input — the deterministic shape this engine knows
 * how to expand. Mirrors `dataEntities[i]` on `APISpecGenerationContext`.
 */
export interface EntitySchema {
  /** Singular CamelCase name (e.g. "Worker"). The path-resource matcher
   *  pluralizes + lowercases + hyphenates this to find owning paths. */
  name: string;
  /** Flat attribute names. Stage-2 maps each to a `string` JSON-schema
   *  property by default — typed inference is a stage-3 follow-up (R-V21.10). */
  attributes: string[];
  /** Plain-text relationship strings (e.g. "belongs to Organization"). Not
   *  consumed by the deterministic mapper — preserved here for parity with
   *  upstream context shape and for stage-3 enrichment. */
  relationships: string[];
}

/** Engine options. Authentication + responseFormat fall through to defaults
 *  when stage-1 omits them; the caller may override here for tests. */
export interface Stage2ExpansionOptions {
  /** Override the assembled `authentication` block. Defaults derive from
   *  `stage1.authType`. */
  authentication?: AuthConfig;
  /** Override the assembled `responseFormat` block. Default is
   *  `{ wrapped: true, contentType: 'application/json' }`. */
  responseFormat?: ResponseFormat;
  /** Override `errorHandling`. Default = standard 4xx/5xx envelope. */
  errorHandling?: ErrorConfig;
}

// ============================================================
// Internal helpers (entity ↔ path resource)
// ============================================================

/**
 * Map a singular entity name to its REST path-segment (plural,
 * lowercase, hyphen-separated). E.g. "EnvironmentalData" → "environmental-data".
 *
 * Two transforms:
 *   1. CamelCase → kebab-case (insert hyphen before each uppercase boundary).
 *   2. Append "s" if not already plural-form (heuristic: no trailing 's').
 *
 * Heuristic-pluralization is intentionally simple — stage-1 emits the path
 * verbatim from the LLM, so the matcher only needs to recognize the LLM's
 * naming, not invent novel pluralizations.
 */
export function entityToResourceSegment(name: string): string {
  const kebab = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
  return kebab.endsWith('s') ? kebab : `${kebab}s`;
}

/**
 * Find the entity whose pluralized resource segment matches the leading
 * collection segment of the operation path. Returns undefined for non-CRUD
 * paths (e.g. /auth/login, /health, /reports/compliance) — the caller falls
 * back to generic envelopes.
 */
export function findOwningEntity(
  path: string,
  entities: EntitySchema[],
): EntitySchema | undefined {
  // Strip leading /api/v1 prefix (if any) and split.
  const segments = path
    .replace(/^\/api\/v\d+\//, '/')
    .split('/')
    .filter(Boolean);
  if (segments.length === 0) return undefined;
  const head = segments[0];
  // Direct singular-collection match: /workers, /workers/{id}.
  for (const e of entities) {
    if (entityToResourceSegment(e.name) === head) return e;
  }
  return undefined;
}

/**
 * Detect whether a path ends in a path-parameter braces segment (e.g.
 * "/workers/{id}" or "/orders/{orderId}/cancel" — the latter is an action).
 * Returns the braced parameter name when the path ends in `/{...}` exactly,
 * else null. Action endpoints (trailing non-brace segment after a brace)
 * return null and fall through to the action path.
 */
export function trailingPathParam(path: string): string | null {
  const m = path.match(/\/\{([^}]+)\}\/?$/);
  return m ? m[1] : null;
}

/**
 * Convert one entity to a JSON-schema object describing all its attributes.
 * Each attribute becomes a `string` property with a description echoing
 * the attribute name. Required = all attributes (deterministic — schema
 * inference for which fields are nullable is a stage-3 LLM refinement,
 * out of scope for Wave D per EC-V21-D.5).
 */
export function entityToJsonSchema(entity: EntitySchema): JSONSchema {
  const properties: Record<string, JSONSchemaProperty> = {};
  for (const attr of entity.attributes) {
    properties[attr] = {
      type: 'string',
      description: attr,
    };
  }
  return {
    type: 'object',
    description: entity.name,
    properties,
    required: [...entity.attributes],
  };
}

/**
 * Same as `entityToJsonSchema` but for create-style request bodies: omit
 * id-shaped fields. Heuristic: drop attributes named `id` or matching
 * `<entity_lower>_id` — the rest of the platform's data layer assigns
 * those server-side. This is deterministic and non-controversial.
 */
export function entityToCreateRequestSchema(entity: EntitySchema): JSONSchema {
  const idShaped = new Set([
    'id',
    `${entity.name.toLowerCase()}_id`,
    `${entityToResourceSegment(entity.name).replace(/s$/, '')}_id`,
  ]);
  const properties: Record<string, JSONSchemaProperty> = {};
  const required: string[] = [];
  for (const attr of entity.attributes) {
    if (idShaped.has(attr.toLowerCase())) continue;
    properties[attr] = { type: 'string', description: attr };
    required.push(attr);
  }
  return {
    type: 'object',
    description: `${entity.name} (create payload — id assigned server-side)`,
    properties,
    required,
  };
}

/**
 * Partial<entity> for PATCH bodies — same property set as create, but no
 * properties are required (partial update semantics).
 */
export function entityToPatchRequestSchema(entity: EntitySchema): JSONSchema {
  const base = entityToCreateRequestSchema(entity);
  return {
    type: 'object',
    description: `Partial<${entity.name}>`,
    properties: base.properties,
    // Required intentionally omitted — partial update.
  };
}

/** Array-of-entity envelope for list endpoints. */
export function entityToListResponseSchema(entity: EntitySchema): JSONSchema {
  return {
    type: 'array',
    description: `Array of ${entity.name}`,
    items: {
      type: 'object',
      description: entity.name,
    },
  };
}

/** Generic empty/unknown response — DELETE 204 and fallback action paths. */
function genericObjectSchema(description: string): JSONSchema {
  return {
    type: 'object',
    description,
    properties: {},
  };
}

// ============================================================
// Default config blocks (stage-1 emits authType only)
// ============================================================

const DEFAULT_AUTH: Record<Stage1ApiSpec['authType'], AuthConfig> = {
  none: { type: 'none', description: 'No authentication required.' },
  api_key: {
    type: 'api_key',
    description: 'API key authentication via X-API-Key header.',
    headerName: 'X-API-Key',
  },
  bearer: {
    type: 'bearer',
    description: 'JWT Bearer token authentication.',
    headerName: 'Authorization',
    tokenPrefix: 'Bearer',
  },
  oauth2: {
    type: 'oauth2',
    description: 'OAuth 2.0 authorization code flow.',
    headerName: 'Authorization',
    tokenPrefix: 'Bearer',
  },
  basic: {
    type: 'basic',
    description: 'HTTP Basic authentication.',
    headerName: 'Authorization',
    tokenPrefix: 'Basic',
  },
  jwt: {
    type: 'jwt',
    description: 'JWT token authentication.',
    headerName: 'Authorization',
    tokenPrefix: 'Bearer',
  },
};

const DEFAULT_RESPONSE_FORMAT: ResponseFormat = {
  wrapped: true,
  contentType: 'application/json',
};

const COMMON_ERRORS: ErrorCode[] = [
  { code: 400, name: 'BadRequest', description: 'Invalid request data.' },
  { code: 401, name: 'Unauthorized', description: 'Missing or invalid authentication.' },
  { code: 403, name: 'Forbidden', description: 'Insufficient permissions.' },
  { code: 404, name: 'NotFound', description: 'Resource not found.' },
  { code: 422, name: 'UnprocessableEntity', description: 'Semantic validation failed.' },
  { code: 429, name: 'TooManyRequests', description: 'Rate limit exceeded.' },
  { code: 500, name: 'InternalError', description: 'Unexpected server error.' },
];

const DEFAULT_ERROR_HANDLING: ErrorConfig = {
  format: {
    type: 'object',
    description: 'Standard error envelope.',
    properties: {
      error: {
        type: 'object',
        description: 'Error details.',
      },
    },
    required: ['error'],
  },
  commonErrors: COMMON_ERRORS,
};

// ============================================================
// Per-method endpoint expander
// ============================================================

/**
 * Pick the per-endpoint error code subset based on (method, has-path-param).
 * Subset of `COMMON_ERRORS` so stage-2 output stays consistent with
 * `errorHandling.commonErrors`.
 */
function errorCodesFor(method: HTTPMethod, hasPathParam: boolean, auth: boolean): ErrorCode[] {
  const codes: ErrorCode[] = [];
  if (method !== 'GET') {
    codes.push(COMMON_ERRORS[0]); // 400
  }
  if (auth) {
    codes.push(COMMON_ERRORS[1]); // 401
  }
  if (hasPathParam) {
    codes.push(COMMON_ERRORS[3]); // 404
  }
  if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
    codes.push(COMMON_ERRORS[4]); // 422
  }
  // 429 + 500 always.
  codes.push(COMMON_ERRORS[5], COMMON_ERRORS[6]);
  // De-dup by code (in case auth + path-param overlap).
  const seen = new Set<number>();
  return codes.filter((c) => (seen.has(c.code) ? false : (seen.add(c.code), true)));
}

/**
 * Build path parameters for a stage-1 op. Extracts each `{name}` segment
 * and emits a Parameter row.
 */
function pathParamsFor(path: string): Parameter[] {
  const matches = Array.from(path.matchAll(/\{([^}]+)\}/g));
  return matches.map((m) => ({
    name: m[1],
    in: 'path' as const,
    required: true,
    description: `${m[1]} path parameter`,
    type: 'string' as const,
  }));
}

/**
 * Default query-parameter set for list endpoints (cursor-paginated per KB).
 */
function listQueryParams(): Parameter[] {
  return [
    { name: 'cursor', in: 'query', required: false, description: 'Opaque pagination cursor.', type: 'string' },
    { name: 'limit', in: 'query', required: false, description: 'Page size.', type: 'integer' },
  ];
}

/**
 * Expand one stage-1 operation into a fully-shaped `Endpoint`.
 *
 * Decision matrix (method, has-path-param, owning-entity-found):
 *
 *   | method  | hasParam | entity | shape            |
 *   |---------|----------|--------|------------------|
 *   | GET     | no       | yes    | list             |
 *   | GET     | yes      | yes    | read-one         |
 *   | POST    | no       | yes    | create           |
 *   | PATCH   | yes      | yes    | partial-update   |
 *   | PUT     | yes      | yes    | full-update      |
 *   | DELETE  | yes      | yes    | delete (204)     |
 *   | *       | *        | no     | generic action   |
 *
 * The "generic action" path covers /auth/login, /health,
 * /orders/{id}/cancel — anything where the leading path segment doesn't
 * match an entity or where the verb is non-CRUD-shaped.
 */
export function expandOperation(
  op: Stage1Operation,
  entities: EntitySchema[],
): Endpoint {
  const owningEntity = findOwningEntity(op.path, entities);
  const trailingParam = trailingPathParam(op.path);
  const hasPathParam = op.path.includes('{');
  const pathParameters = pathParamsFor(op.path);

  let requestBody: RequestBody | undefined;
  let responseBody: JSONSchema;
  let queryParameters: Parameter[] | undefined;

  if (owningEntity) {
    switch (op.method) {
      case 'GET':
        if (trailingParam) {
          // GET /:resource/{id} — read one.
          responseBody = entityToJsonSchema(owningEntity);
        } else {
          // GET /:resource — list.
          responseBody = entityToListResponseSchema(owningEntity);
          queryParameters = listQueryParams();
        }
        break;
      case 'POST':
        if (trailingParam) {
          // POST /:resource/{id} — atypical; treat as action with entity envelope.
          responseBody = entityToJsonSchema(owningEntity);
        } else {
          requestBody = {
            contentType: 'application/json',
            required: true,
            description: `Create ${owningEntity.name}.`,
            schema: entityToCreateRequestSchema(owningEntity),
          };
          responseBody = entityToJsonSchema(owningEntity);
        }
        break;
      case 'PATCH':
        requestBody = {
          contentType: 'application/json',
          required: true,
          description: `Partial<${owningEntity.name}>.`,
          schema: entityToPatchRequestSchema(owningEntity),
        };
        responseBody = entityToJsonSchema(owningEntity);
        break;
      case 'PUT':
        requestBody = {
          contentType: 'application/json',
          required: true,
          description: `Full update of ${owningEntity.name}.`,
          schema: entityToCreateRequestSchema(owningEntity),
        };
        responseBody = entityToJsonSchema(owningEntity);
        break;
      case 'DELETE':
        // 204 No Content — `responseBody` still required by the schema, so
        // emit an empty object envelope with a description signaling void.
        responseBody = genericObjectSchema(`Deleted (no content). ${owningEntity.name}`);
        break;
      default: {
        // Exhaustiveness check — `op.method` is a closed enum so this is
        // dead code, but keeping the never-cast catches future enum drift.
        const _exhaustive: never = op.method;
        void _exhaustive;
        responseBody = genericObjectSchema('Unknown method.');
      }
    }
  } else {
    // Non-CRUD action / auth / health endpoint — generic envelopes.
    if (op.method === 'POST' || op.method === 'PUT' || op.method === 'PATCH') {
      requestBody = {
        contentType: 'application/json',
        required: false,
        description: 'Action payload.',
        schema: genericObjectSchema('Action request body.'),
      };
    }
    responseBody = genericObjectSchema(op.description);
  }

  const endpoint: Endpoint = {
    path: op.path,
    method: op.method,
    description: op.description,
    authentication: op.auth,
    operationId: op.operationId,
    tags: op.tags,
    responseBody,
    errorCodes: errorCodesFor(op.method, hasPathParam, op.auth),
  };

  if (pathParameters.length > 0) endpoint.pathParameters = pathParameters;
  if (queryParameters) endpoint.queryParameters = queryParameters;
  if (requestBody) endpoint.requestBody = requestBody;
  if (op.sourceUseCases && op.sourceUseCases.length > 0) {
    endpoint.sourceUseCases = op.sourceUseCases;
  }

  return endpoint;
}

// ============================================================
// Top-level engine
// ============================================================

/**
 * Deterministic CRUD-shape mapper from (Stage1ApiSpec, EntitySchema[]) →
 * APISpecification. Pure function — no LLM calls. Idempotent.
 *
 * Per EC-V21-D.3: the assembled output carries all 6 top-level keys
 * (`baseUrl`, `version`, `authentication`, `endpoints`, `responseFormat`,
 * `errorHandling`) and parses against `apiSpecificationSchema`.
 */
export function stage2ExpansionEngine(
  stage1: Stage1ApiSpec,
  entities: EntitySchema[],
  options?: Stage2ExpansionOptions,
): APISpecification {
  const endpoints = stage1.operations.map((op) => expandOperation(op, entities));
  return {
    baseUrl: stage1.baseUrl,
    version: stage1.version,
    authentication: options?.authentication ?? DEFAULT_AUTH[stage1.authType],
    endpoints,
    responseFormat: options?.responseFormat ?? DEFAULT_RESPONSE_FORMAT,
    errorHandling: options?.errorHandling ?? DEFAULT_ERROR_HANDLING,
  };
}
