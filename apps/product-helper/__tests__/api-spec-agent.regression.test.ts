/**
 * api-spec-agent end-to-end regression — full two-stage replay (Wave D Step D-3).
 *
 * Anchors EC-V21-D.3: against the captured project=33 input, the full
 * `generateAPISpecification` two-stage path emits all 6 required top-level
 * keys (`baseUrl`, `version`, `authentication`, `endpoints`, `responseFormat`,
 * `errorHandling`) and the assembled output round-trip parses against the
 * preserved `apiSpecificationSchema`.
 *
 * The LLM is mocked at the stage-1 boundary — stage-2 is deterministic, so
 * once stage-1 emits a healthy flat operation index, the assembled spec is
 * a pure function of that index plus the entity schemas.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../lib/langchain/config', () => ({
  createClaudeAgent: jest.fn(),
}));

import { generateAPISpecification, apiSpecificationSchema } from '../lib/langchain/agents/api-spec-agent';
import type { Stage1ApiSpec } from '../lib/langchain/schemas/api-spec/stage1-operation';
import { createClaudeAgent } from '../lib/langchain/config';
import type { APISpecGenerationContext } from '../lib/types/api-specification';

const mockedCreateClaudeAgent = createClaudeAgent as jest.MockedFunction<
  typeof createClaudeAgent
>;

/** Project=33 input — same shape as the stage-1 test, structured form
 *  rather than the rendered prompt (so the prompt builder is exercised). */
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

/** Healthy stage-1 emission — 31 operations, mirrors production target. */
function healthyStage1(): Stage1ApiSpec {
  // Use kebab-pluralization that matches stage-2's `entityToResourceSegment`
  // heuristic so owning-entity discovery succeeds for every CRUD op.
  const entityResources: Array<[string, string, string]> = [
    ['Worker', 'workers', 'Workers'],
    ['Organization', 'organizations', 'Organizations'],
    ['EnvironmentalData', 'environmental-datas', 'EnvironmentalData'],
    ['HeatStressAssessment', 'heat-stress-assessments', 'HeatStressAssessments'],
    ['Alert', 'alerts', 'Alerts'],
    ['WorkLocation', 'work-locations', 'WorkLocations'],
  ];
  const operations: Stage1ApiSpec['operations'] = [];
  for (const [sing, resource, tag] of entityResources) {
    operations.push(
      { path: `/api/v1/${resource}`, method: 'GET', operationId: `list${tag}`, description: `List ${resource}`, auth: true, tags: [tag] },
      { path: `/api/v1/${resource}`, method: 'POST', operationId: `create${sing}`, description: `Create ${sing}`, auth: true, tags: [tag] },
      { path: `/api/v1/${resource}/{id}`, method: 'GET', operationId: `get${sing}ById`, description: `Get ${sing}`, auth: true, tags: [tag] },
      { path: `/api/v1/${resource}/{id}`, method: 'PATCH', operationId: `update${sing}`, description: `Update ${sing}`, auth: true, tags: [tag] },
      { path: `/api/v1/${resource}/{id}`, method: 'DELETE', operationId: `delete${sing}`, description: `Delete ${sing}`, auth: true, tags: [tag] },
    );
  }
  operations.push(
    { path: '/api/v1/heat-stress-assessments/predict', method: 'POST', operationId: 'predictHeatStressRisk', description: 'UC1 calc', auth: true, tags: ['HeatStressAssessments'], sourceUseCases: ['UC1'] },
    { path: '/api/v1/alerts/{id}/acknowledge', method: 'POST', operationId: 'acknowledgeAlert', description: 'UC5 ack', auth: true, tags: ['Alerts'], sourceUseCases: ['UC5'] },
    { path: '/api/v1/auth/login', method: 'POST', operationId: 'login', description: 'Login', auth: false, tags: ['Auth'] },
    { path: '/health', method: 'GET', operationId: 'getHealth', description: 'Health', auth: false, tags: ['System'] },
    { path: '/api/v1/reports/compliance', method: 'POST', operationId: 'generateComplianceReport', description: 'UC3', auth: true, tags: ['Reports'], sourceUseCases: ['UC3'] },
  );
  return { baseUrl: '/api/v1', version: '1.0.0', authType: 'bearer', operations };
}

describe('generateAPISpecification — full two-stage regression (project=33)', () => {
  beforeEach(() => {
    mockedCreateClaudeAgent.mockReset();
    delete process.env.API_SPEC_TWO_STAGE;
  });

  it('emits all 6 required top-level keys (EC-V21-D.3)', async () => {
    const stage1 = healthyStage1();
    const fakeStage1Model = { invoke: jest.fn(async () => stage1) };
    mockedCreateClaudeAgent.mockReturnValue(fakeStage1Model as never);

    const spec = await generateAPISpecification(project33Context(), { twoStage: true });

    // EC-V21-D.3: all 6 top-level keys present in stage-1+stage-2 assembled output.
    const required = [
      'baseUrl',
      'version',
      'authentication',
      'endpoints',
      'responseFormat',
      'errorHandling',
    ];
    for (const key of required) {
      expect(spec).toHaveProperty(key);
    }
  });

  it('assembled spec round-trip parses against apiSpecificationSchema', async () => {
    const stage1 = healthyStage1();
    const fakeStage1Model = { invoke: jest.fn(async () => stage1) };
    mockedCreateClaudeAgent.mockReturnValue(fakeStage1Model as never);

    const spec = await generateAPISpecification(project33Context(), { twoStage: true });

    // Strip metadata before parse (apiSpecificationSchema doesn't include it).
    const { metadata: _metadata, ...specForParse } = spec;
    void _metadata;
    expect(() => apiSpecificationSchema.parse(specForParse)).not.toThrow();
  });

  it('endpoint count matches stage-1 operation count (no truncation)', async () => {
    const stage1 = healthyStage1();
    const fakeStage1Model = { invoke: jest.fn(async () => stage1) };
    mockedCreateClaudeAgent.mockReturnValue(fakeStage1Model as never);

    const spec = await generateAPISpecification(project33Context(), { twoStage: true });
    expect(spec.endpoints.length).toBe(stage1.operations.length);
    // Anti-regression: production observed only 22/30 endpoints under
    // stop_reason='max_tokens'. Healthy two-stage clears ≥ 25.
    expect(spec.endpoints.length).toBeGreaterThanOrEqual(25);
  });

  it('stage-1 invoked exactly once (no fallback to legacy single-call)', async () => {
    const stage1 = healthyStage1();
    const fakeStage1Model = { invoke: jest.fn(async () => stage1) };
    mockedCreateClaudeAgent.mockReturnValue(fakeStage1Model as never);

    await generateAPISpecification(project33Context(), { twoStage: true });
    // Stage-1 model invoked exactly once; legacy path never triggered.
    expect(fakeStage1Model.invoke).toHaveBeenCalledTimes(1);
    // createClaudeAgent called exactly once for stage-1 — legacy would
    // call it again for the fallback.
    expect(mockedCreateClaudeAgent).toHaveBeenCalledTimes(1);
  });

  it('feature flag API_SPEC_TWO_STAGE=off uses legacy single-call path', async () => {
    process.env.API_SPEC_TWO_STAGE = 'off';
    // Legacy path: createClaudeAgent gets called with apiSpecificationSchema.
    // Mock a successful legacy emission so we can observe the flag honored.
    const legacySpec = {
      baseUrl: '/api/v1',
      version: '1.0.0',
      authentication: { type: 'bearer', description: 'JWT' },
      endpoints: [
        {
          path: '/api/v1/workers',
          method: 'GET',
          description: 'List',
          authentication: true,
          operationId: 'listWorkers',
          tags: ['Workers'],
          responseBody: { type: 'array', description: 'Workers' },
          errorCodes: [{ code: 401, name: 'Unauthorized', description: 'auth' }],
        },
      ],
      responseFormat: { wrapped: true, contentType: 'application/json' },
      errorHandling: {
        format: { type: 'object' },
        commonErrors: [{ code: 500, name: 'InternalError', description: 'err' }],
      },
    };
    const fakeLegacyModel = { invoke: jest.fn(async () => legacySpec) };
    mockedCreateClaudeAgent.mockReturnValue(fakeLegacyModel as never);

    const spec = await generateAPISpecification(project33Context());
    // Spec returned via legacy path.
    expect(spec.endpoints.length).toBe(1);
    expect(fakeLegacyModel.invoke).toHaveBeenCalledTimes(1);
  });
});
