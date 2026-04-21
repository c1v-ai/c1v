/**
 * Steps 3-6 Projection Tests
 *
 * These tests validate two things at once:
 *
 *  1. Compile-time: the `Pick<z.infer<typeof X>, ...>` projections in
 *     `../projections.ts` still refer to fields that exist on the source
 *     Zod schemas. If a field is renamed or removed in `schemas.ts`,
 *     this file fails to compile — catching drift before it ships.
 *
 *  2. Runtime: a minimal Zod-parsed fixture of each source schema can be
 *     assigned to the projection type, confirming shape compatibility.
 *     Not about LLM behavior — about type-to-runtime coherence.
 *
 * @module lib/langchain/schemas/__tests__/projections.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import {
  ffbdBlockSchema,
  performanceCriterionSchema,
  engineeringCharSchema,
  subsystemSchema,
  interfaceSpecSchema,
} from '../../schemas';
import type {
  DecisionCriterionProjection,
  EngineeringTargetProjection,
  FunctionalBlockProjection,
  InterfaceMatrixRowProjection,
  SubsystemProjection,
} from '../projections';

describe('Steps 3-6 projection types', () => {
  it('DecisionCriterionProjection accepts a parsed performanceCriterion', () => {
    const parsed = performanceCriterionSchema.parse({
      id: 'PC-01',
      name: 'P95 Latency',
      unit: 'ms',
      weight: 0.4,
      minAcceptable: '< 800ms',
      targetValue: '< 500ms',
      measurementMethod: 'k6 load test',
    });

    const projection: DecisionCriterionProjection = {
      name: parsed.name,
      unit: parsed.unit,
      weight: parsed.weight,
      minAcceptable: parsed.minAcceptable,
      targetValue: parsed.targetValue,
    };

    expect(projection.name).toBe('P95 Latency');
    expect(projection.weight).toBe(0.4);
    expect(projection.minAcceptable).toBe('< 800ms');
  });

  it('EngineeringTargetProjection accepts a parsed engineeringChar', () => {
    const parsed = engineeringCharSchema.parse({
      id: 'EC-01',
      name: 'Availability',
      unit: '%',
      directionOfImprovement: 'higher',
      designTarget: '>= 99.9%',
      technicalDifficulty: 3,
      estimatedCost: 4,
    });

    const projection: EngineeringTargetProjection = {
      name: parsed.name,
      unit: parsed.unit,
      directionOfImprovement: parsed.directionOfImprovement,
      designTarget: parsed.designTarget,
      technicalDifficulty: parsed.technicalDifficulty,
      estimatedCost: parsed.estimatedCost,
    };

    expect(projection.directionOfImprovement).toBe('higher');
    expect(projection.designTarget).toBe('>= 99.9%');
    expect(projection.technicalDifficulty).toBe(3);
  });

  it('FunctionalBlockProjection accepts a parsed ffbdBlock (top-level + decomposed)', () => {
    const topLevel = ffbdBlockSchema.parse({
      id: 'F.1',
      name: 'Authenticate User',
      isCoreValue: true,
      description: 'Verify identity before any privileged action',
    });
    const decomposed = ffbdBlockSchema.parse({
      id: 'F.1.2',
      name: 'Issue JWT',
      parentId: 'F.1',
    });

    const topProj: FunctionalBlockProjection = {
      id: topLevel.id,
      name: topLevel.name,
      parentId: topLevel.parentId,
      isCoreValue: topLevel.isCoreValue,
      description: topLevel.description,
    };
    const subProj: FunctionalBlockProjection = {
      id: decomposed.id,
      name: decomposed.name,
      parentId: decomposed.parentId,
      isCoreValue: decomposed.isCoreValue,
      description: decomposed.description,
    };

    expect(topProj.isCoreValue).toBe(true);
    expect(subProj.parentId).toBe('F.1');
  });

  it('InterfaceMatrixRowProjection accepts a parsed interfaceSpec', () => {
    const parsed = interfaceSpecSchema.parse({
      id: 'IF-01',
      name: 'Prediction Request',
      source: 'SS1',
      destination: 'SS2',
      dataPayload: 'activity, clothing, profile ID',
      protocol: 'REST API',
      frequency: 'Per prediction',
      category: 'critical',
    });

    const projection: InterfaceMatrixRowProjection = {
      id: parsed.id,
      name: parsed.name,
      source: parsed.source,
      destination: parsed.destination,
      dataPayload: parsed.dataPayload,
      protocol: parsed.protocol,
      frequency: parsed.frequency,
      category: parsed.category,
    };

    expect(projection.category).toBe('critical');
    expect(projection.protocol).toBe('REST API');
  });

  it('InterfaceMatrixRowProjection tolerates optional fields being absent', () => {
    const parsed = interfaceSpecSchema.parse({
      id: 'IF-02',
      name: 'Audit Log Write',
      source: 'SS2',
      destination: 'SS3',
      dataPayload: 'event, actor_id, timestamp',
      // protocol / frequency / category omitted — all optional on the schema
    });

    const projection: InterfaceMatrixRowProjection = {
      id: parsed.id,
      name: parsed.name,
      source: parsed.source,
      destination: parsed.destination,
      dataPayload: parsed.dataPayload,
      protocol: parsed.protocol,
      frequency: parsed.frequency,
      category: parsed.category,
    };

    expect(projection.protocol).toBeUndefined();
    expect(projection.category).toBeUndefined();
  });

  it('SubsystemProjection accepts a parsed subsystem and omits allocatedFunctions', () => {
    const parsed = subsystemSchema.parse({
      id: 'SS1',
      name: 'Prediction Engine',
      description: 'Runs ML predictions on incoming worker telemetry',
      allocatedFunctions: ['F.1', 'F.2.1'],
    });

    const projection: SubsystemProjection = {
      id: parsed.id,
      name: parsed.name,
      description: parsed.description,
    };

    expect(projection.name).toBe('Prediction Engine');
    // allocatedFunctions is intentionally not on the projection type; Pipeline
    // B generators don't need the FFBD linkage.
    expect('allocatedFunctions' in projection).toBe(false);
  });
});
