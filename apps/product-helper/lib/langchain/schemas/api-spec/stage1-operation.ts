/**
 * Stage-1 API Operation schema (Wave D Step D-1).
 *
 * Per Decision D-V21.12 and the EC-V21-D.1 preflight reconciliation
 * (`plans/v21-outputs/td1/preflight-log.md` — branch decision A. CUTOFF):
 *
 * Stage-1 emits a FLAT list of operation stubs — ≤ 8 scalar/scalar-array keys.
 * NO nested JSON-schemas (no requestBody.schema, no responseBody, no errorCodes).
 *
 * Why this matters: the production schema embeds `jsonSchemaSchema`
 * (api-spec-agent.ts:71) at three sites in `apiSpecificationSchema`
 * (line 127). The per-endpoint multiplier — primarily `responseBody` —
 * blew the 12000-token output cap on project=33 (live preflight observed
 * `stop_reason='max_tokens'`, only 22 of ~30 endpoints emitted, missing
 * the trailing `errorHandling` key entirely).
 *
 * Stage-2 (`stage2-deterministic-expansion` agent, separate Wave D step)
 * imports this schema and expands the flat list into the full nested
 * `apiSpecificationSchema` shape via deterministic CRUD-shape mapping —
 * no LLM call. The model produces a clean operation index; deterministic
 * code produces the bulky nested envelopes.
 *
 * The full `apiSpecificationSchema` at api-spec-agent.ts:127 is PRESERVED
 * for output validation only (never sent to the model after the refactor).
 */

import { z } from 'zod';

/**
 * One row of the flat operation list — what stage-1 actually emits.
 * Total scalar/scalar-array keys: 6 (path, method, description, auth,
 * tags, operationId) + optional `sourceUseCases` array of strings = 7.
 * Well under the ≤ 8-key budget specified in D-V21.12.
 */
export const stage1OperationSchema = z.object({
  path: z
    .string()
    .describe(
      'URL path with OpenAPI-style braces for path params (e.g. "/users/{id}", "/orders/{id}/cancel"). Plural nouns; lowercase hyphen-separated; max 2 nesting levels.',
    ),
  method: z
    .enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    .describe('HTTP method.'),
  operationId: z
    .string()
    .describe(
      'camelCase operation id, unique across the spec (e.g. "createUser", "listOrdersByCustomer"). Stage-2 uses this as the join key.',
    ),
  description: z
    .string()
    .describe(
      'One-line endpoint description. Stage-2 also uses this to disambiguate ambiguous CRUD-vs-action mappings.',
    ),
  auth: z
    .boolean()
    .describe(
      'Whether this endpoint requires authentication. Public endpoints (signup, /health) are false; everything else true by default.',
    ),
  tags: z
    .array(z.string())
    .describe(
      'Resource grouping tags (e.g. ["Users"], ["Orders"]). Use subsystem name when an Interface Matrix is present, otherwise the entity name.',
    ),
  sourceUseCases: z
    .array(z.string())
    .optional()
    .describe(
      'Optional list of source use-case ids (e.g. ["UC1", "UC4"]). Carries traceability into stage-2 without bloating stage-1 output.',
    ),
});

export type Stage1Operation = z.infer<typeof stage1OperationSchema>;

/**
 * Top-level stage-1 schema — what the LLM emits.
 *
 * Top-level scalars (baseUrl, version, authentication.type) are kept here
 * because they are O(1) in output size and stage-2 needs them as inputs;
 * the heavy parts (errorHandling format, responseFormat, per-endpoint
 * nested schemas) are deferred entirely.
 */
export const stage1ApiSpecSchema = z.object({
  baseUrl: z
    .string()
    .describe('API base URL prefix (e.g. "/api/v1").'),
  version: z
    .string()
    .describe('Semver-shaped version string (e.g. "1.0.0").'),
  authType: z
    .enum(['none', 'api_key', 'bearer', 'oauth2', 'basic', 'jwt'])
    .describe(
      'Top-level authentication scheme. Stage-2 expands this into the full authentication config.',
    ),
  operations: z
    .array(stage1OperationSchema)
    .describe(
      'Flat list of all operations. Cover every use case; CRUD per entity (~5 per entity); plus action endpoints, /health, and auth endpoints when applicable.',
    ),
});

export type Stage1ApiSpec = z.infer<typeof stage1ApiSpecSchema>;
