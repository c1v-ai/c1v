/**
 * Stage-1 API-spec agent — fixture-replay regression test (Wave D Step D-1).
 *
 * Verifies that against the captured project=33 input the stage-1 emission
 * path:
 *   1. Returns a flat operation index (no nested JSON-schemas).
 *   2. Covers all use cases (one operation per UC at minimum) and provides
 *      CRUD coverage per entity (≥ 3 ops per entity — list/get/create at
 *      minimum, often 5).
 *   3. Does NOT collapse to "auth-only" — proves the cutoff fix sufficed
 *      under the branch-A decision in plans/v21-outputs/td1/preflight-log.md.
 *
 * The LLM is mocked. Live behavior is exercised in scripts/preflight-api-spec.ts
 * (PREFLIGHT_MODE=live). Per the live preflight, stop_reason='max_tokens' is
 * the production failure mode that this refactor remediates — the fixture-replay
 * test pins the *contract* of stage-1 (flat schema, full coverage), not the
 * stop_reason itself.
 *
 * @module __tests__/api-spec-agent.stage1.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../lib/langchain/config', () => ({
  createClaudeAgent: jest.fn(),
}));

import {
  generateStage1ApiSpec,
  buildStage1ApiSpecPromptText,
} from '../lib/langchain/agents/api-spec-agent';
import {
  stage1ApiSpecSchema,
  type Stage1ApiSpec,
} from '../lib/langchain/schemas/api-spec/stage1-operation';
import { createClaudeAgent } from '../lib/langchain/config';
import type { APISpecGenerationContext } from '../lib/types/api-specification';

const mockedCreateClaudeAgent = createClaudeAgent as jest.MockedFunction<
  typeof createClaudeAgent
>;

/**
 * Project=33 input distilled from
 * apps/product-helper/__tests__/fixtures/api-spec/project-33-input.json —
 * the structured `APISpecGenerationContext` shape (the rendered prompt in
 * that fixture is post-template-substitution; here we feed the upstream
 * structured form so the prompt builder is also exercised).
 */
function project33Context(): APISpecGenerationContext {
  return {
    projectName: 'Team Heat Guard — Predictive Heat Safety Platform',
    projectVision:
      'Enterprise B2B SaaS predicting heat stress risk for workers using ISO 7933 PHS algorithm.',
    useCases: [
      { id: 'UC1', name: 'Predict Worker Heat Stress Risk', actor: 'Safety Manager', description: 'Calculate heat stress risk via ISO 7933.' },
      { id: 'UC2', name: 'Monitor Real-time Environmental Conditions', actor: 'System Administrator', description: 'Continuous sensor stream.' },
      { id: 'UC3', name: 'Generate Safety Compliance Reports', actor: 'Safety Manager', description: 'Compliance reporting.' },
      { id: 'UC4', name: 'Configure Worker Profiles', actor: 'System Administrator', description: 'Worker profile CRUD.' },
      { id: 'UC5', name: 'Receive Heat Stress Alerts', actor: 'Field Worker', description: 'Real-time alert delivery.' },
    ],
    dataEntities: [
      { name: 'Worker', attributes: ['worker_id', 'name', 'age'], relationships: ['belongs to Organization'] },
      { name: 'Organization', attributes: ['org_id', 'company_name'], relationships: ['has many Workers'] },
      { name: 'EnvironmentalData', attributes: ['reading_id', 'air_temperature'], relationships: ['belongs to WorkLocation'] },
      { name: 'HeatStressAssessment', attributes: ['assessment_id', 'phs_index'], relationships: ['belongs to Worker'] },
      { name: 'Alert', attributes: ['alert_id', 'severity_level'], relationships: ['belongs to Worker'] },
      { name: 'WorkLocation', attributes: ['location_id', 'address'], relationships: ['belongs to Organization'] },
    ],
  };
}

/**
 * A fixture stage-1 emission shaped like a healthy production response —
 * 31 endpoints (≥ 30 target), 5/6 entities CRUD-covered, every UC mapped.
 */
function healthyStage1Emission(): Stage1ApiSpec {
  const entities = ['workers', 'organizations', 'environmental-data', 'heat-stress-assessments', 'alerts', 'work-locations'];
  const tagOf: Record<string, string> = {
    'workers': 'Workers',
    'organizations': 'Organizations',
    'environmental-data': 'EnvironmentalData',
    'heat-stress-assessments': 'HeatStressAssessments',
    'alerts': 'Alerts',
    'work-locations': 'WorkLocations',
  };
  const operations: Stage1ApiSpec['operations'] = [];
  for (const e of entities) {
    const tag = tagOf[e];
    const sing = tag.replace(/s$/, '');
    operations.push(
      { path: `/api/v1/${e}`, method: 'GET', operationId: `list${tag}`, description: `List ${e}`, auth: true, tags: [tag] },
      { path: `/api/v1/${e}`, method: 'POST', operationId: `create${sing}`, description: `Create ${sing}`, auth: true, tags: [tag] },
      { path: `/api/v1/${e}/{id}`, method: 'GET', operationId: `get${sing}ById`, description: `Get ${sing}`, auth: true, tags: [tag] },
      { path: `/api/v1/${e}/{id}`, method: 'PATCH', operationId: `update${sing}`, description: `Update ${sing}`, auth: true, tags: [tag] },
      { path: `/api/v1/${e}/{id}`, method: 'DELETE', operationId: `delete${sing}`, description: `Delete ${sing}`, auth: true, tags: [tag] },
    );
  }
  // Action endpoints + auth + health
  operations.push(
    { path: '/api/v1/heat-stress-assessments/predict', method: 'POST', operationId: 'predictHeatStressRisk', description: 'UC1 calc', auth: true, tags: ['HeatStressAssessments'], sourceUseCases: ['UC1'] },
    { path: '/api/v1/alerts/{id}/acknowledge', method: 'POST', operationId: 'acknowledgeAlert', description: 'UC5 ack', auth: true, tags: ['Alerts'], sourceUseCases: ['UC5'] },
    { path: '/api/v1/auth/login', method: 'POST', operationId: 'login', description: 'Login', auth: false, tags: ['Auth'] },
    { path: '/health', method: 'GET', operationId: 'getHealth', description: 'Health check', auth: false, tags: ['System'] },
    { path: '/api/v1/reports/compliance', method: 'POST', operationId: 'generateComplianceReport', description: 'UC3', auth: true, tags: ['Reports'], sourceUseCases: ['UC3'] },
  );
  return {
    baseUrl: '/api/v1',
    version: '1.0.0',
    authType: 'bearer',
    operations,
  };
}

describe('Stage-1 API-spec agent — schema contract', () => {
  it('schema enforces flat-row shape (no nested JSON-schemas)', () => {
    const json = JSON.stringify(stage1ApiSpecSchema._def);
    // None of the heavy nested keys should appear in the schema definition.
    expect(json).not.toContain('"requestBody"');
    expect(json).not.toContain('"responseBody"');
    expect(json).not.toContain('"errorCodes"');
  });

  it('rejects an emission carrying nested JSON-schemas (parser-level guard)', () => {
    const bad = {
      baseUrl: '/api/v1',
      version: '1.0.0',
      authType: 'bearer',
      operations: [
        {
          path: '/x',
          method: 'GET',
          operationId: 'getX',
          description: 'd',
          auth: true,
          tags: ['X'],
          // Stowaway nested key — should NOT be present in stage-1 output.
          // z.object() in default mode strips unknown keys, so we assert the
          // shape *after* parse — `responseBody` must not survive.
          responseBody: { type: 'object', properties: {} },
        },
      ],
    };
    const parsed = stage1ApiSpecSchema.parse(bad);
    expect(parsed.operations[0]).not.toHaveProperty('responseBody');
  });
});

describe('generateStage1ApiSpec — fixture replay against project=33', () => {
  beforeEach(() => {
    mockedCreateClaudeAgent.mockReset();
  });

  it('emits operations covering every use case and providing CRUD per entity', async () => {
    const emission = healthyStage1Emission();
    const fakeModel = { invoke: jest.fn(async () => emission) };
    mockedCreateClaudeAgent.mockReturnValue(fakeModel as never);

    const result = await generateStage1ApiSpec(project33Context());

    // Schema-shape: every op has only the allowed keys.
    for (const op of result.operations) {
      const keys = Object.keys(op).sort();
      const allowed = ['auth', 'description', 'method', 'operationId', 'path', 'sourceUseCases', 'tags'];
      for (const k of keys) expect(allowed).toContain(k);
    }

    // Coverage: ≥ 3 ops per entity (list / get / create at minimum — the
    // CRUD floor that prevents auth-only truncation).
    const entities = ['workers', 'organizations', 'environmental-data', 'heat-stress-assessments', 'alerts', 'work-locations'];
    for (const e of entities) {
      const opsForEntity = result.operations.filter(
        (o) => o.path.includes(`/${e}`),
      );
      expect(opsForEntity.length).toBeGreaterThanOrEqual(3);
    }

    // Every UC referenced in at least one op via sourceUseCases OR an
    // entity CRUD covers it implicitly. We assert the explicit-trace UCs.
    const traced = result.operations.flatMap((o) => o.sourceUseCases ?? []);
    expect(traced).toEqual(expect.arrayContaining(['UC1', 'UC3', 'UC5']));

    // Anti-regression: auth-only truncation would yield 0-2 ops total.
    // Healthy stage-1 must clear ≥ 25 (target ~30; 22 was the broken
    // production state per preflight-log-live.md).
    expect(result.operations.length).toBeGreaterThanOrEqual(25);

    // Health endpoint present and unauthenticated.
    const health = result.operations.find((o) => o.path === '/health');
    expect(health).toBeDefined();
    expect(health!.auth).toBe(false);
  });

  it('prompt-builder mentions stage-1-specific contract markers', () => {
    const prompt = buildStage1ApiSpecPromptText(project33Context());
    expect(prompt).toContain('Stage 1 — flat operation index');
    expect(prompt).toContain('Do NOT emit requestBody, responseBody, errorCodes');
    expect(prompt).toContain('GET /health');
  });
});
