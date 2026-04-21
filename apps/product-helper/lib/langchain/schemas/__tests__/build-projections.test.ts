/**
 * Builder Tests — `buildSteps36Projections`
 *
 * Covers the five cases called out in the Phase N critique §3:
 *   1. One test per projection dimension (criteria, targets, blocks, matrix, subsystems)
 *   2. Undefined / absent Steps 3-6 path
 *   3. Full `extractionSchema.parse()` roundtrip → all six projections populated
 *
 * @module lib/langchain/schemas/__tests__/build-projections.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import { extractionSchema } from '../../schemas';
import { buildSteps36Projections } from '../build-projections';
import type { ExtractionResult } from '../../schemas';

// ─────────────────────────────────────────────────────────────────────────
// Fixture helpers
// ─────────────────────────────────────────────────────────────────────────

/**
 * Minimal parse-clean `ExtractionResult` — no Steps 3-6 data.
 * Used as a base; tests selectively populate one blob at a time.
 */
function baseExtracted(): ExtractionResult {
  return extractionSchema.parse({
    actors: [],
    useCases: [],
    systemBoundaries: { internal: [], external: [] },
    dataEntities: [],
    problemStatement: { summary: '', context: '', impact: '', goals: [] },
    goalsMetrics: [],
    nonFunctionalRequirements: [],
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Graceful-degradation path
// ─────────────────────────────────────────────────────────────────────────

describe('buildSteps36Projections — graceful degradation', () => {
  it('returns {} when input is undefined', () => {
    expect(buildSteps36Projections(undefined)).toEqual({});
  });

  it('returns {} when all Steps 3-6 blobs are absent', () => {
    expect(buildSteps36Projections(baseExtracted())).toEqual({});
  });

  it('omits (not empty-stubs) individual fields when the corresponding blob is missing', () => {
    const extracted: ExtractionResult = {
      ...baseExtracted(),
      ffbd: { topLevelBlocks: [{ id: 'F.1', name: 'Authenticate' }], decomposedBlocks: [], connections: [] },
    };
    const out = buildSteps36Projections(extracted);
    expect(out.functionalBlocks).toBeDefined();
    expect(out.decisionCriteria).toBeUndefined();
    expect(out.decisionRecommendation).toBeUndefined();
    expect(out.engineeringTargets).toBeUndefined();
    expect(out.interfaceMatrix).toBeUndefined();
    expect(out.subsystems).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Per-projection population
// ─────────────────────────────────────────────────────────────────────────

describe('buildSteps36Projections — individual projections', () => {
  it('decisionMatrix.criteria → decisionCriteria (preserves weight + thresholds)', () => {
    const extracted: ExtractionResult = {
      ...baseExtracted(),
      decisionMatrix: {
        criteria: [
          { id: 'PC-01', name: 'Latency', unit: 'ms', weight: 0.4, minAcceptable: '< 800ms', targetValue: '< 500ms' },
          { id: 'PC-02', name: 'Cost', unit: 'USD/mo', weight: 0.3 },
        ],
        alternatives: [],
        recommendation: 'ALT-01 — serverless stack',
      },
    };
    const out = buildSteps36Projections(extracted);
    expect(out.decisionCriteria).toHaveLength(2);
    expect(out.decisionCriteria?.[0]).toEqual({
      name: 'Latency', unit: 'ms', weight: 0.4, minAcceptable: '< 800ms', targetValue: '< 500ms',
    });
    expect(out.decisionCriteria?.[1].minAcceptable).toBeUndefined();
    expect(out.decisionRecommendation).toBe('ALT-01 — serverless stack');
  });

  it('decisionMatrix.recommendation alone surfaces without criteria', () => {
    const extracted: ExtractionResult = {
      ...baseExtracted(),
      decisionMatrix: { criteria: [], alternatives: [], recommendation: 'Hold on infra decision' },
    };
    const out = buildSteps36Projections(extracted);
    expect(out.decisionCriteria).toBeUndefined();
    expect(out.decisionRecommendation).toBe('Hold on infra decision');
  });

  it('qfd.engineeringCharacteristics → engineeringTargets (carries units + direction)', () => {
    const extracted: ExtractionResult = {
      ...baseExtracted(),
      qfd: {
        customerNeeds: [],
        engineeringCharacteristics: [
          {
            id: 'EC-01',
            name: 'Availability',
            unit: '%',
            directionOfImprovement: 'higher',
            designTarget: '>= 99.9%',
            technicalDifficulty: 3,
            estimatedCost: 4,
          },
        ],
        relationships: [],
        roof: [],
        competitors: [],
      },
    };
    const out = buildSteps36Projections(extracted);
    expect(out.engineeringTargets).toHaveLength(1);
    expect(out.engineeringTargets?.[0].directionOfImprovement).toBe('higher');
    expect(out.engineeringTargets?.[0].designTarget).toBe('>= 99.9%');
    expect(out.engineeringTargets?.[0].technicalDifficulty).toBe(3);
  });

  it('ffbd → functionalBlocks (concatenates top-level and decomposed)', () => {
    const extracted: ExtractionResult = {
      ...baseExtracted(),
      ffbd: {
        topLevelBlocks: [
          { id: 'F.1', name: 'Authenticate', isCoreValue: true, description: 'verify identity' },
          { id: 'F.2', name: 'Predict' },
        ],
        decomposedBlocks: [{ id: 'F.1.1', name: 'Verify JWT', parentId: 'F.1' }],
        connections: [],
      },
    };
    const out = buildSteps36Projections(extracted);
    expect(out.functionalBlocks).toHaveLength(3);
    expect(out.functionalBlocks?.find((b) => b.id === 'F.1')?.isCoreValue).toBe(true);
    expect(out.functionalBlocks?.find((b) => b.id === 'F.1.1')?.parentId).toBe('F.1');
  });

  it('ffbd with empty arrays omits functionalBlocks entirely', () => {
    const extracted: ExtractionResult = {
      ...baseExtracted(),
      ffbd: { topLevelBlocks: [], decomposedBlocks: [], connections: [] },
    };
    const out = buildSteps36Projections(extracted);
    expect(out.functionalBlocks).toBeUndefined();
  });

  it('interfaces.interfaces → interfaceMatrix (carries protocol + category)', () => {
    const extracted: ExtractionResult = {
      ...baseExtracted(),
      interfaces: {
        subsystems: [],
        interfaces: [
          {
            id: 'IF-01',
            name: 'Prediction Request',
            source: 'SS1',
            destination: 'SS2',
            dataPayload: 'activity, profile ID',
            protocol: 'REST API',
            frequency: 'Per prediction',
            category: 'critical',
          },
          {
            id: 'IF-02',
            name: 'Audit Write',
            source: 'SS2',
            destination: 'SS3',
            dataPayload: 'event, actor',
          },
        ],
        n2Chart: {},
      },
    };
    const out = buildSteps36Projections(extracted);
    expect(out.interfaceMatrix).toHaveLength(2);
    expect(out.interfaceMatrix?.[0].protocol).toBe('REST API');
    expect(out.interfaceMatrix?.[0].category).toBe('critical');
    expect(out.interfaceMatrix?.[1].protocol).toBeUndefined();
  });

  it('interfaces.subsystems → subsystems (strips allocatedFunctions)', () => {
    const extracted: ExtractionResult = {
      ...baseExtracted(),
      interfaces: {
        subsystems: [
          { id: 'SS1', name: 'Prediction Engine', description: 'ML inference', allocatedFunctions: ['F.1'] },
        ],
        interfaces: [],
        n2Chart: {},
      },
    };
    const out = buildSteps36Projections(extracted);
    expect(out.subsystems).toHaveLength(1);
    expect(out.subsystems?.[0]).toEqual({
      id: 'SS1',
      name: 'Prediction Engine',
      description: 'ML inference',
    });
    expect('allocatedFunctions' in (out.subsystems?.[0] ?? {})).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Full roundtrip — Zod parse + full-population
// ─────────────────────────────────────────────────────────────────────────

describe('buildSteps36Projections — full parse roundtrip', () => {
  it('populates all six projection fields from a fully-populated extractionSchema.parse()', () => {
    const parsed: ExtractionResult = extractionSchema.parse({
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
      problemStatement: { summary: '', context: '', impact: '', goals: [] },
      goalsMetrics: [],
      nonFunctionalRequirements: [],
      ffbd: {
        topLevelBlocks: [{ id: 'F.1', name: 'Onboard', isCoreValue: true }],
        decomposedBlocks: [{ id: 'F.1.1', name: 'Collect email', parentId: 'F.1' }],
        connections: [],
      },
      decisionMatrix: {
        criteria: [{ id: 'PC-01', name: 'Cost', unit: 'USD/mo', weight: 1.0 }],
        alternatives: [],
        recommendation: 'Start bootstrap tier',
      },
      qfd: {
        customerNeeds: [],
        engineeringCharacteristics: [
          { id: 'EC-01', name: 'Latency', unit: 'ms', directionOfImprovement: 'lower', designTarget: '<= 200ms' },
        ],
        relationships: [],
        roof: [],
        competitors: [],
      },
      interfaces: {
        subsystems: [{ id: 'SS1', name: 'Web', description: 'User-facing', allocatedFunctions: [] }],
        interfaces: [
          { id: 'IF-01', name: 'Login', source: 'SS1', destination: 'SS1', dataPayload: 'email, pw' },
        ],
        n2Chart: {},
      },
    });

    const out = buildSteps36Projections(parsed);
    expect(out.decisionCriteria).toHaveLength(1);
    expect(out.decisionRecommendation).toBe('Start bootstrap tier');
    expect(out.engineeringTargets).toHaveLength(1);
    expect(out.functionalBlocks).toHaveLength(2);
    expect(out.interfaceMatrix).toHaveLength(1);
    expect(out.subsystems).toHaveLength(1);
  });
});
