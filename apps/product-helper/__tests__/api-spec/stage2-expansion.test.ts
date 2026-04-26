/**
 * Stage-2 deterministic expansion — unit tests (Wave D Step D-2).
 *
 * Each (method, resource-shape) rule from Decision D-V21.12 is exercised
 * directly. NO LLM mocking required — stage-2 is a pure function (per
 * EC-V21-D.5 zero-LLM-tokens guarantee).
 */

import { describe, it, expect } from '@jest/globals';
import {
  stage2ExpansionEngine,
  expandOperation,
  entityToResourceSegment,
  findOwningEntity,
  trailingPathParam,
  entityToJsonSchema,
  entityToCreateRequestSchema,
  entityToPatchRequestSchema,
  entityToListResponseSchema,
  type EntitySchema,
} from '../../lib/langchain/agents/api-spec/stage2-expansion';
import type { Stage1ApiSpec } from '../../lib/langchain/schemas/api-spec/stage1-operation';
import { apiSpecificationSchema } from '../../lib/langchain/agents/api-spec-agent';

const workerEntity: EntitySchema = {
  name: 'Worker',
  attributes: ['worker_id', 'name', 'age'],
  relationships: ['belongs to Organization'],
};

const envDataEntity: EntitySchema = {
  name: 'EnvironmentalData',
  attributes: ['reading_id', 'temperature', 'humidity'],
  relationships: ['belongs to WorkLocation'],
};

const entities: EntitySchema[] = [workerEntity, envDataEntity];

describe('entityToResourceSegment — kebab + plural', () => {
  it('plural-pluralizes singular CamelCase entity name', () => {
    expect(entityToResourceSegment('Worker')).toBe('workers');
  });

  it('kebab-cases multi-word CamelCase', () => {
    expect(entityToResourceSegment('EnvironmentalData')).toBe('environmental-datas');
  });

  it('does not double-pluralize already-plural inputs', () => {
    expect(entityToResourceSegment('Workers')).toBe('workers');
  });
});

describe('findOwningEntity', () => {
  it('matches collection path against pluralized entity name', () => {
    const e = findOwningEntity('/api/v1/workers', entities);
    expect(e?.name).toBe('Worker');
  });

  it('matches detail path with id parameter', () => {
    const e = findOwningEntity('/api/v1/workers/{id}', entities);
    expect(e?.name).toBe('Worker');
  });

  it('returns undefined for non-CRUD action paths', () => {
    expect(findOwningEntity('/health', entities)).toBeUndefined();
    expect(findOwningEntity('/api/v1/auth/login', entities)).toBeUndefined();
  });
});

describe('trailingPathParam', () => {
  it('extracts trailing braced param', () => {
    expect(trailingPathParam('/workers/{id}')).toBe('id');
  });

  it('returns null when path ends in static segment after a brace (action)', () => {
    expect(trailingPathParam('/orders/{id}/cancel')).toBeNull();
  });

  it('returns null for collection paths', () => {
    expect(trailingPathParam('/workers')).toBeNull();
  });
});

describe('entity → schema helpers', () => {
  it('entityToJsonSchema requires every attribute', () => {
    const s = entityToJsonSchema(workerEntity);
    expect(s.type).toBe('object');
    expect(Object.keys(s.properties || {}).sort()).toEqual(['age', 'name', 'worker_id']);
    expect(s.required).toEqual(['worker_id', 'name', 'age']);
  });

  it('entityToCreateRequestSchema omits id-shaped fields', () => {
    const s = entityToCreateRequestSchema(workerEntity);
    expect(Object.keys(s.properties || {}).sort()).toEqual(['age', 'name']);
    expect(s.required).toEqual(['name', 'age']);
  });

  it('entityToPatchRequestSchema has no required fields (partial)', () => {
    const s = entityToPatchRequestSchema(workerEntity);
    expect(s.required).toBeUndefined();
    // But the property set still excludes id-shaped fields.
    expect(Object.keys(s.properties || {})).not.toContain('worker_id');
  });

  it('entityToListResponseSchema is array-of-object', () => {
    const s = entityToListResponseSchema(workerEntity);
    expect(s.type).toBe('array');
    expect(s.items?.type).toBe('object');
  });
});

describe('expandOperation — per-rule mapping (Decision D-V21.12)', () => {
  function op(overrides: Partial<Parameters<typeof expandOperation>[0]> = {}) {
    return {
      path: '/api/v1/workers',
      method: 'GET' as const,
      operationId: 'listWorkers',
      description: 'List workers',
      auth: true,
      tags: ['Workers'],
      ...overrides,
    };
  }

  it('GET /:resource → list response (array of entity) + cursor pagination', () => {
    const ep = expandOperation(op({ method: 'GET' }), entities);
    expect(ep.responseBody.type).toBe('array');
    expect(ep.queryParameters?.map((p) => p.name).sort()).toEqual(['cursor', 'limit']);
    expect(ep.requestBody).toBeUndefined();
    // GET 401 + 429 + 500 (no 400, no 404 on collection).
    const codes = ep.errorCodes.map((c) => c.code).sort();
    expect(codes).toEqual([401, 429, 500]);
  });

  it('GET /:resource/{id} → read-one response (entity)', () => {
    const ep = expandOperation(
      op({ path: '/api/v1/workers/{id}', method: 'GET', operationId: 'getWorkerById' }),
      entities,
    );
    expect(ep.responseBody.type).toBe('object');
    expect(ep.pathParameters?.[0].name).toBe('id');
    // 404 added when path-param present.
    expect(ep.errorCodes.find((c) => c.code === 404)).toBeDefined();
  });

  it('POST /:resource → create (request omits id, response = entity)', () => {
    const ep = expandOperation(
      op({ path: '/api/v1/workers', method: 'POST', operationId: 'createWorker' }),
      entities,
    );
    expect(ep.requestBody).toBeDefined();
    expect(Object.keys(ep.requestBody!.schema.properties || {})).not.toContain('worker_id');
    expect(ep.responseBody.type).toBe('object');
    // 422 added for create.
    expect(ep.errorCodes.find((c) => c.code === 422)).toBeDefined();
  });

  it('PATCH /:resource/{id} → request = Partial<entity>', () => {
    const ep = expandOperation(
      op({ path: '/api/v1/workers/{id}', method: 'PATCH', operationId: 'updateWorker' }),
      entities,
    );
    expect(ep.requestBody).toBeDefined();
    expect(ep.requestBody!.schema.required).toBeUndefined();
    expect(ep.responseBody.type).toBe('object');
  });

  it('PUT /:resource/{id} → request = full entity (excluding id)', () => {
    const ep = expandOperation(
      op({ path: '/api/v1/workers/{id}', method: 'PUT', operationId: 'replaceWorker' }),
      entities,
    );
    expect(ep.requestBody).toBeDefined();
    expect(ep.requestBody!.schema.required).toEqual(['name', 'age']);
  });

  it('DELETE /:resource/{id} → void response (empty object envelope)', () => {
    const ep = expandOperation(
      op({ path: '/api/v1/workers/{id}', method: 'DELETE', operationId: 'deleteWorker' }),
      entities,
    );
    expect(ep.requestBody).toBeUndefined();
    expect(ep.responseBody.description).toMatch(/Deleted/);
  });
});

describe('expandOperation — non-CRUD edge cases', () => {
  it('action endpoint (POST /:resource/{id}/cancel) gets generic envelope', () => {
    const ep = expandOperation(
      {
        path: '/api/v1/orders/{id}/cancel',
        method: 'POST',
        operationId: 'cancelOrder',
        description: 'Cancel an order',
        auth: true,
        tags: ['Orders'],
      },
      entities, // no Order entity in the test set — falls to generic
    );
    expect(ep.responseBody.type).toBe('object');
    expect(ep.requestBody).toBeDefined(); // POST → generic body
  });

  it('GET /health falls through to generic shape with auth=false', () => {
    const ep = expandOperation(
      {
        path: '/health',
        method: 'GET',
        operationId: 'getHealth',
        description: 'Health check',
        auth: false,
        tags: ['System'],
      },
      entities,
    );
    expect(ep.authentication).toBe(false);
    expect(ep.responseBody.type).toBe('object');
  });

  it('POST /auth/login → generic envelope, auth=false', () => {
    const ep = expandOperation(
      {
        path: '/api/v1/auth/login',
        method: 'POST',
        operationId: 'login',
        description: 'Login',
        auth: false,
        tags: ['Auth'],
      },
      entities,
    );
    expect(ep.authentication).toBe(false);
    expect(ep.requestBody).toBeDefined();
  });

  it('composite resource path with kebab-case entity matches', () => {
    const ep = expandOperation(
      {
        path: '/api/v1/environmental-datas',
        method: 'GET',
        operationId: 'listEnvironmentalData',
        description: 'List env data',
        auth: true,
        tags: ['EnvironmentalData'],
      },
      entities,
    );
    expect(ep.responseBody.type).toBe('array');
  });
});

describe('stage2ExpansionEngine — full assembly', () => {
  const stage1: Stage1ApiSpec = {
    baseUrl: '/api/v1',
    version: '1.0.0',
    authType: 'bearer',
    operations: [
      { path: '/api/v1/workers', method: 'GET', operationId: 'listWorkers', description: 'List', auth: true, tags: ['Workers'] },
      { path: '/api/v1/workers', method: 'POST', operationId: 'createWorker', description: 'Create', auth: true, tags: ['Workers'] },
      { path: '/api/v1/workers/{id}', method: 'GET', operationId: 'getWorker', description: 'Get', auth: true, tags: ['Workers'] },
      { path: '/api/v1/workers/{id}', method: 'PATCH', operationId: 'updateWorker', description: 'Update', auth: true, tags: ['Workers'] },
      { path: '/api/v1/workers/{id}', method: 'DELETE', operationId: 'deleteWorker', description: 'Delete', auth: true, tags: ['Workers'] },
      { path: '/health', method: 'GET', operationId: 'getHealth', description: 'Health', auth: false, tags: ['System'] },
    ],
  };

  it('produces all 6 top-level keys (EC-V21-D.3)', () => {
    const out = stage2ExpansionEngine(stage1, entities);
    expect(Object.keys(out).sort()).toEqual([
      'authentication',
      'baseUrl',
      'endpoints',
      'errorHandling',
      'responseFormat',
      'version',
    ]);
  });

  it('default authentication block follows authType', () => {
    const out = stage2ExpansionEngine(stage1, entities);
    expect(out.authentication.type).toBe('bearer');
    expect(out.authentication.headerName).toBe('Authorization');
  });

  it('output round-trip parses against apiSpecificationSchema', () => {
    const out = stage2ExpansionEngine(stage1, entities);
    expect(() => apiSpecificationSchema.parse(out)).not.toThrow();
  });

  it('options override authentication / responseFormat / errorHandling', () => {
    const out = stage2ExpansionEngine(stage1, entities, {
      authentication: { type: 'api_key', description: 'custom', headerName: 'X-Custom' },
      responseFormat: { wrapped: false, contentType: 'application/json' },
    });
    expect(out.authentication.headerName).toBe('X-Custom');
    expect(out.responseFormat.wrapped).toBe(false);
  });

  it('endpoint count equals stage-1 operation count (1:1 mapping)', () => {
    const out = stage2ExpansionEngine(stage1, entities);
    expect(out.endpoints.length).toBe(stage1.operations.length);
  });
});
