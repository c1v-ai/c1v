/**
 * OpenAPI 3.0 Export (Phase 10.1)
 *
 * Converts APISpecification to OpenAPI 3.0 YAML format for interoperability
 * with tools like Swagger UI, Postman, and API gateways.
 */

import * as yaml from 'yaml';
import type {
  APISpecification,
  Endpoint,
  JSONSchema,
  Parameter,
} from '../../types/api-specification';

/**
 * OpenAPI 3.0 Document structure
 */
interface OpenAPI3Document {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
  security?: Array<Record<string, string[]>>;
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components: {
    securitySchemes?: Record<string, OpenAPISecurityScheme>;
    schemas?: Record<string, unknown>;
  };
  tags?: Array<{ name: string; description?: string }>;
}

interface OpenAPIOperation {
  operationId: string;
  summary: string;
  description?: string;
  tags?: string[];
  security?: Array<Record<string, string[]>>;
  parameters?: OpenAPIParameter[];
  requestBody?: {
    required: boolean;
    content: Record<string, { schema: unknown }>;
  };
  responses: Record<string, {
    description: string;
    content?: Record<string, { schema: unknown }>;
  }>;
}

interface OpenAPIParameter {
  name: string;
  in: string;
  required: boolean;
  description?: string;
  schema: {
    type: string;
    format?: string;
    example?: unknown;
    enum?: string[];
  };
}

interface OpenAPISecurityScheme {
  type: string;
  scheme?: string;
  bearerFormat?: string;
  name?: string;
  in?: string;
  description?: string;
}

/**
 * Convert APISpecification to OpenAPI 3.0 document
 *
 * @param spec - API specification
 * @param projectName - Project name for title
 * @param description - Optional description
 * @returns OpenAPI 3.0 document object
 */
export function convertToOpenAPI(
  spec: APISpecification,
  projectName: string,
  description?: string
): OpenAPI3Document {
  const doc: OpenAPI3Document = {
    openapi: '3.0.3',
    info: {
      title: `${projectName} API`,
      version: spec.version,
      description: description || `REST API for ${projectName}`,
    },
    servers: [
      {
        url: spec.baseUrl,
        description: 'API Server',
      },
    ],
    paths: {},
    components: {
      securitySchemes: {},
      schemas: {},
    },
    tags: [],
  };

  // Add security scheme
  if (spec.authentication.type !== 'none') {
    const securityScheme = convertAuthToSecurityScheme(spec.authentication);
    if (securityScheme) {
      doc.components.securitySchemes = {
        [spec.authentication.type]: securityScheme,
      };
      // Apply global security for authenticated APIs
      doc.security = [{ [spec.authentication.type]: [] }];
    }
  }

  // Collect unique tags
  const tags = new Set<string>();
  spec.endpoints.forEach(ep => ep.tags.forEach(t => tags.add(t)));
  doc.tags = Array.from(tags).map(name => ({ name }));

  // Convert endpoints to paths
  spec.endpoints.forEach(endpoint => {
    const path = endpoint.path;
    const method = endpoint.method.toLowerCase();

    if (!doc.paths[path]) {
      doc.paths[path] = {};
    }

    doc.paths[path][method] = convertEndpointToOperation(endpoint, spec);
  });

  // Add common error schemas
  doc.components.schemas = {
    Error: {
      type: 'object',
      properties: {
        error: { type: 'string', description: 'Error code' },
        message: { type: 'string', description: 'Human-readable error message' },
        details: { type: 'object', description: 'Additional error details', nullable: true },
      },
      required: ['error', 'message'],
    },
  };

  return doc;
}

/**
 * Convert authentication config to OpenAPI security scheme
 */
function convertAuthToSecurityScheme(auth: APISpecification['authentication']): OpenAPISecurityScheme | null {
  switch (auth.type) {
    case 'bearer':
    case 'jwt':
      return {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: auth.description,
      };
    case 'api_key':
      return {
        type: 'apiKey',
        name: auth.headerName || 'X-API-Key',
        in: 'header',
        description: auth.description,
      };
    case 'basic':
      return {
        type: 'http',
        scheme: 'basic',
        description: auth.description,
      };
    case 'oauth2':
      return {
        type: 'oauth2',
        description: auth.description,
      };
    default:
      return null;
  }
}

/**
 * Convert endpoint to OpenAPI operation
 */
function convertEndpointToOperation(
  endpoint: Endpoint,
  _spec: APISpecification
): OpenAPIOperation {
  const operation: OpenAPIOperation = {
    operationId: endpoint.operationId,
    summary: endpoint.description,
    tags: endpoint.tags,
    responses: {},
  };

  // Handle authentication
  if (!endpoint.authentication) {
    // Explicitly mark as no auth required
    operation.security = [];
  }

  // Add parameters
  const parameters: OpenAPIParameter[] = [];

  endpoint.pathParameters?.forEach(param => {
    parameters.push(convertParameter(param));
  });

  endpoint.queryParameters?.forEach(param => {
    parameters.push(convertParameter(param));
  });

  if (parameters.length > 0) {
    operation.parameters = parameters;
  }

  // Add request body
  if (endpoint.requestBody) {
    operation.requestBody = {
      required: endpoint.requestBody.required,
      content: {
        [endpoint.requestBody.contentType]: {
          schema: convertJSONSchemaForOpenAPI(endpoint.requestBody.schema),
        },
      },
    };
  }

  // Add success response
  operation.responses['200'] = {
    description: 'Successful response',
    content: {
      'application/json': {
        schema: convertJSONSchemaForOpenAPI(endpoint.responseBody),
      },
    },
  };

  // Add error responses
  endpoint.errorCodes.forEach(error => {
    operation.responses[String(error.code)] = {
      description: error.description,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    };
  });

  return operation;
}

/**
 * Convert parameter to OpenAPI format
 */
function convertParameter(param: Parameter): OpenAPIParameter {
  return {
    name: param.name,
    in: param.in,
    required: param.required,
    description: param.description,
    schema: {
      type: param.type,
      format: param.format,
      example: param.example,
      enum: param.enum,
    },
  };
}

/**
 * Convert JSONSchema to OpenAPI-compatible format
 */
function convertJSONSchemaForOpenAPI(schema: JSONSchema): unknown {
  const result: Record<string, unknown> = {
    type: schema.type,
  };

  if (schema.description) result.description = schema.description;
  if (schema.example !== undefined) result.example = schema.example;
  if (schema.nullable) result.nullable = schema.nullable;
  if (schema.required) result.required = schema.required;

  if (schema.properties) {
    result.properties = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      (result.properties as Record<string, unknown>)[key] = {
        type: value.type,
        description: value.description,
        format: value.format,
        example: value.example,
        enum: value.enum,
        nullable: value.nullable,
      };
    }
  }

  if (schema.items) {
    result.items = convertJSONSchemaForOpenAPI(schema.items);
  }

  return result;
}

/**
 * Export APISpecification to OpenAPI 3.0 YAML string
 *
 * @param spec - API specification
 * @param projectName - Project name
 * @param description - Optional description
 * @returns OpenAPI 3.0 YAML string
 *
 * @example
 * ```typescript
 * const yamlString = exportToOpenAPIYAML(spec, "My Project");
 * // Returns valid OpenAPI 3.0 YAML that can be used with Swagger UI
 * ```
 */
export function exportToOpenAPIYAML(
  spec: APISpecification,
  projectName: string,
  description?: string
): string {
  const openAPIDoc = convertToOpenAPI(spec, projectName, description);
  return yaml.stringify(openAPIDoc, { lineWidth: 0 });
}

/**
 * Export APISpecification to OpenAPI 3.0 JSON string
 *
 * @param spec - API specification
 * @param projectName - Project name
 * @param description - Optional description
 * @returns OpenAPI 3.0 JSON string
 */
export function exportToOpenAPIJSON(
  spec: APISpecification,
  projectName: string,
  description?: string
): string {
  const openAPIDoc = convertToOpenAPI(spec, projectName, description);
  return JSON.stringify(openAPIDoc, null, 2);
}
