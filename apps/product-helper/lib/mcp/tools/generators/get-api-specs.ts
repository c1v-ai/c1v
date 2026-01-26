/**
 * get_api_specs MCP Tool
 *
 * Returns API endpoint specifications from the project's API specification.
 * Supports both JSON and OpenAPI export formats.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { APISpecification, Endpoint, AuthConfig } from '@/lib/db/schema/v2-types';

type ApiSpecFormat = 'json' | 'openapi';

interface GetApiSpecsArgs {
  format?: ApiSpecFormat;
  endpoint?: string;
  [key: string]: unknown;
}

export const definition: ToolDefinition = {
  name: 'get_api_specs',
  description:
    'Get API endpoint specifications for the current project. ' +
    'Returns the full API specification by default (JSON format), or can export as OpenAPI 3.0. ' +
    'Use this to understand the REST API design, endpoints, request/response schemas, and authentication.',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['json', 'openapi'],
        description:
          'Output format. Options: ' +
          'json (default, structured API spec), ' +
          'openapi (OpenAPI 3.0 compatible format)',
      },
      endpoint: {
        type: 'string',
        description: 'Optional: Filter to a specific endpoint path (e.g., "/users/{id}")',
      },
    },
  },
};

/**
 * Convert internal APISpecification to OpenAPI 3.0 format
 */
function toOpenAPI(spec: APISpecification, projectName: string): object {
  const openapi: Record<string, unknown> = {
    openapi: '3.0.0',
    info: {
      title: projectName || 'API',
      version: spec.version || '1.0.0',
      description: spec.description || 'Auto-generated API specification',
    },
    servers: spec.servers?.map((s) => ({
      url: s.url,
      description: s.description,
    })) || [
      {
        url: spec.baseUrl || '/api/v1',
        description: 'API base URL',
      },
    ],
    paths: {} as Record<string, Record<string, unknown>>,
    components: {
      securitySchemes: {} as Record<string, unknown>,
      schemas: {} as Record<string, unknown>,
    },
  };

  const paths = openapi.paths as Record<string, Record<string, unknown>>;
  const components = openapi.components as { securitySchemes: Record<string, unknown> };

  // Add authentication scheme
  if (spec.authentication) {
    addSecurityScheme(spec.authentication, components.securitySchemes);
  }

  // Convert endpoints to OpenAPI paths
  if (spec.endpoints) {
    spec.endpoints.forEach((ep) => {
      addEndpointToOpenAPI(ep, paths, spec.authentication);
    });
  }

  return openapi;
}

function addSecurityScheme(auth: AuthConfig, securitySchemes: Record<string, unknown>): void {
  switch (auth.type) {
    case 'bearer':
      securitySchemes.bearerAuth = {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Bearer token authentication',
      };
      break;
    case 'api-key':
      securitySchemes.apiKeyAuth = {
        type: 'apiKey',
        in: 'header',
        name: auth.headerName || 'X-API-Key',
        description: 'API Key authentication',
      };
      break;
    case 'oauth2':
      securitySchemes.oauth2 = {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: auth.oauth?.authorizationUrl || '/oauth/authorize',
            tokenUrl: auth.oauth?.tokenUrl || '/oauth/token',
            scopes: auth.oauth?.scopes?.reduce(
              (acc, scope) => ({ ...acc, [scope]: scope }),
              {}
            ) || {},
          },
        },
        description: 'OAuth 2.0 authentication',
      };
      break;
    case 'basic':
      securitySchemes.basicAuth = {
        type: 'http',
        scheme: 'basic',
        description: 'Basic authentication',
      };
      break;
  }
}

function addEndpointToOpenAPI(
  endpoint: Endpoint,
  paths: Record<string, Record<string, unknown>>,
  auth?: AuthConfig
): void {
  const path = endpoint.path;
  const method = endpoint.method.toLowerCase();

  if (!paths[path]) {
    paths[path] = {};
  }

  const operation: Record<string, unknown> = {
    operationId: endpoint.operationId,
    summary: endpoint.summary,
    description: endpoint.description,
    tags: endpoint.tags || [],
    parameters: [] as unknown[],
    responses: {} as Record<string, unknown>,
  };

  // Add security requirement if endpoint has security
  if (endpoint.security && endpoint.security.length > 0 && auth) {
    const securityRequirement: Record<string, string[]> = {};
    if (auth.type === 'bearer') {
      securityRequirement.bearerAuth = [];
    } else if (auth.type === 'api-key') {
      securityRequirement.apiKeyAuth = [];
    } else if (auth.type === 'oauth2') {
      securityRequirement.oauth2 = auth.oauth?.scopes || [];
    } else if (auth.type === 'basic') {
      securityRequirement.basicAuth = [];
    }
    operation.security = [securityRequirement];
  }

  // Add parameters
  if (endpoint.parameters) {
    endpoint.parameters.forEach((param) => {
      (operation.parameters as unknown[]).push({
        name: param.name,
        in: param.location,
        required: param.required,
        description: param.description,
        schema: param.schema || { type: param.type },
        example: param.example,
      });
    });
  }

  // Add request body
  if (endpoint.requestBody) {
    operation.requestBody = {
      required: endpoint.requestBody.required,
      content: {
        [endpoint.requestBody.contentType || 'application/json']: {
          schema: endpoint.requestBody.schema,
          example: endpoint.requestBody.example,
        },
      },
    };
  }

  // Add responses
  const responses = operation.responses as Record<string, unknown>;
  if (endpoint.responses) {
    endpoint.responses.forEach((resp) => {
      responses[resp.statusCode.toString()] = {
        description: resp.description,
        content: {
          [resp.contentType || 'application/json']: {
            schema: resp.schema,
            example: resp.example,
          },
        },
      };
    });
  }

  // Default 200 response if none specified
  if (Object.keys(responses).length === 0) {
    responses['200'] = {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: { type: 'object' },
        },
      },
    };
  }

  paths[path][method] = operation;
}

export const handler: ToolHandler<GetApiSpecsArgs> = async (args, context) => {
  const format = args.format || 'json';
  const endpointFilter = args.endpoint;

  // Fetch project and project data
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, context.projectId),
    with: {
      projectData: true,
    },
  });

  if (!project) {
    return createTextResult(`Project with ID ${context.projectId} not found`, true);
  }

  const data = project.projectData;

  if (!data?.apiSpecification) {
    return createTextResult(
      'API specification not yet generated. Run the API spec generator first.',
      true
    );
  }

  const apiSpec = data.apiSpecification as APISpecification;

  // Filter by endpoint if specified
  let filteredSpec = apiSpec;
  if (endpointFilter && apiSpec.endpoints) {
    const matchingEndpoints = apiSpec.endpoints.filter((ep) => ep.path === endpointFilter);
    if (matchingEndpoints.length === 0) {
      return createTextResult(
        `No endpoint found matching path "${endpointFilter}". Available paths: ${apiSpec.endpoints.map((e) => e.path).join(', ')}`,
        true
      );
    }
    filteredSpec = {
      ...apiSpec,
      endpoints: matchingEndpoints,
    };
  }

  // Return in requested format
  if (format === 'openapi') {
    const openApiSpec = toOpenAPI(filteredSpec, project.name);
    return createJsonResult(openApiSpec);
  }

  // Default: JSON format
  return createJsonResult({
    projectName: project.name,
    apiSpecification: filteredSpec,
    metadata: {
      endpointCount: filteredSpec.endpoints?.length ?? 0,
      authentication: filteredSpec.authentication?.type,
      generatedAt: filteredSpec.generatedAt,
    },
  });
};

export function registerGetApiSpecs(): void {
  registerTool(definition, handler);
}
