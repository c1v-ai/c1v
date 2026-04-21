/**
 * Infrastructure Agent — prompt-builder tests.
 *
 * Covers both paths required by the Phase N critique §5:
 *  - Undefined: no Steps 3-6 fields → prompt matches pre-Phase-N behavior
 *    (no new sections, no new instruction lines, no un-replaced markers).
 *  - Populated: criteria + targets + subsystems + interfaces present →
 *    three sections appear plus the three conditional instruction lines
 *    fire independently based on which signals were supplied.
 *
 * @module lib/langchain/agents/__tests__/infrastructure-agent.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import {
  buildInfrastructurePromptText,
  formatWeightedCriteriaSection,
  formatEngineeringTargetsSection,
  formatSubsystemTopologySection,
  type InfrastructureContext,
} from '../infrastructure-agent';

function baseContext(): InfrastructureContext {
  return {
    projectName: 'Heat Guard',
    projectDescription: 'Predictive heat-safety platform for field workers',
  };
}

describe('buildInfrastructurePromptText — graceful degradation', () => {
  it('omits all three Steps 3-6 sections when no projections are supplied', () => {
    const prompt = buildInfrastructurePromptText(baseContext());
    expect(prompt).not.toContain('## Weighted Criteria');
    expect(prompt).not.toContain('## Engineering Targets');
    expect(prompt).not.toContain('## Subsystem Topology');
  });

  it('adds no conditional instruction lines when no signals are present', () => {
    const prompt = buildInfrastructurePromptText(baseContext());
    expect(prompt).not.toContain('multi-region or edge compute');
    expect(prompt).not.toContain('persistent-connection tier');
    expect(prompt).not.toContain('one deploy pipeline per subsystem');
  });

  it('leaves no un-replaced template markers', () => {
    const prompt = buildInfrastructurePromptText(baseContext());
    expect(prompt).not.toContain('{stepsContextSections}');
    expect(prompt).not.toContain('{stepsInstructionLines}');
  });
});

describe('buildInfrastructurePromptText — populated Steps 3-6', () => {
  it('injects all three sections when criteria + targets + topology are present', () => {
    const ctx: InfrastructureContext = {
      ...baseContext(),
      weightedCriteria: [
        { name: 'Cost', unit: 'USD/mo', weight: 0.4 },
        { name: 'Reliability', unit: 'nines', weight: 0.6, minAcceptable: '3', targetValue: '4' },
      ],
      engineeringTargets: [
        {
          name: 'API p95 latency',
          unit: 'ms',
          directionOfImprovement: 'lower',
          designTarget: '<= 150ms',
        },
      ],
      subsystems: [
        { id: 'SS1', name: 'Web UI', description: 'User-facing' },
        { id: 'SS2', name: 'Predictor', description: 'ML inference service' },
      ],
      interfaceProtocols: [
        {
          id: 'IF-01',
          name: 'Prediction Stream',
          source: 'SS1',
          destination: 'SS2',
          dataPayload: 'telemetry frames',
          protocol: 'WebSocket',
          frequency: 'Real-time stream',
        },
      ],
    };

    const prompt = buildInfrastructurePromptText(ctx);

    expect(prompt).toContain('## Weighted Criteria (from Decision Matrix)');
    expect(prompt).toContain('**Reliability** (nines, weight 0.60) — min: 3, target: 4');

    expect(prompt).toContain('## Engineering Targets (from QFD)');
    expect(prompt).toContain('| API p95 latency | lower | <= 150ms | ms | — | — |');

    expect(prompt).toContain('## Subsystem Topology & Interface Protocols (from Step 6)');
    expect(prompt).toContain('**SS1: Web UI**');
    expect(prompt).toContain('**SS2: Predictor**');
    expect(prompt).toContain('| IF-01 | Prediction Stream | SS1 → SS2 | WebSocket | Real-time stream | — |');

    // Three instruction lines all fire
    expect(prompt).toContain('multi-region or edge compute');
    expect(prompt).toContain('persistent-connection tier');
    expect(prompt).toContain('2 subsystems');
  });

  it('latency-triggered hosting rule fires only when target <= 200ms on ms unit', () => {
    const tightCtx: InfrastructureContext = {
      ...baseContext(),
      engineeringTargets: [
        { name: 'Lat', unit: 'ms', directionOfImprovement: 'lower', designTarget: '<= 150ms' },
      ],
    };
    const looseCtx: InfrastructureContext = {
      ...baseContext(),
      engineeringTargets: [
        { name: 'Lat', unit: 'ms', directionOfImprovement: 'lower', designTarget: '<= 500ms' },
      ],
    };

    expect(buildInfrastructurePromptText(tightCtx)).toContain('multi-region or edge compute');
    expect(buildInfrastructurePromptText(looseCtx)).not.toContain('multi-region or edge compute');
  });

  it('latency rule also fires on sub-second (s) targets <= 0.2', () => {
    const ctx: InfrastructureContext = {
      ...baseContext(),
      engineeringTargets: [
        { name: 'Lat', unit: 's', directionOfImprovement: 'lower', designTarget: '<= 0.15s' },
      ],
    };
    expect(buildInfrastructurePromptText(ctx)).toContain('multi-region or edge compute');
  });

  it('persistent-tier rule fires on Event protocol as well as WebSocket', () => {
    const wsCtx: InfrastructureContext = {
      ...baseContext(),
      interfaceProtocols: [
        {
          id: 'IF-01',
          name: 'Stream',
          source: 'A',
          destination: 'B',
          dataPayload: 'x',
          protocol: 'WebSocket',
        },
      ],
    };
    const evCtx: InfrastructureContext = {
      ...baseContext(),
      interfaceProtocols: [
        {
          id: 'IF-01',
          name: 'Notify',
          source: 'A',
          destination: 'B',
          dataPayload: 'x',
          protocol: 'Event',
        },
      ],
    };
    const freqCtx: InfrastructureContext = {
      ...baseContext(),
      interfaceProtocols: [
        {
          id: 'IF-01',
          name: 'Rpt',
          source: 'A',
          destination: 'B',
          dataPayload: 'x',
          frequency: 'Real-time stream',
        },
      ],
    };
    expect(buildInfrastructurePromptText(wsCtx)).toContain('persistent-connection tier');
    expect(buildInfrastructurePromptText(evCtx)).toContain('persistent-connection tier');
    expect(buildInfrastructurePromptText(freqCtx)).toContain('persistent-connection tier');
  });

  it('CI/CD rule pluralizes subsystems correctly', () => {
    const single: InfrastructureContext = {
      ...baseContext(),
      subsystems: [{ id: 'SS1', name: 'Monolith', description: 'Everything' }],
    };
    expect(buildInfrastructurePromptText(single)).toContain('has 1 subsystem.');

    const multi: InfrastructureContext = {
      ...baseContext(),
      subsystems: [
        { id: 'SS1', name: 'A', description: '' },
        { id: 'SS2', name: 'B', description: '' },
        { id: 'SS3', name: 'C', description: '' },
      ],
    };
    expect(buildInfrastructurePromptText(multi)).toContain('has 3 subsystems.');
  });

  it('injects topology section with interfaces alone, no subsystems', () => {
    const ctx: InfrastructureContext = {
      ...baseContext(),
      interfaceProtocols: [
        {
          id: 'IF-01',
          name: 'API Call',
          source: 'SS1',
          destination: 'SS2',
          dataPayload: 'request',
          protocol: 'REST API',
        },
      ],
    };
    const prompt = buildInfrastructurePromptText(ctx);
    expect(prompt).toContain('## Subsystem Topology & Interface Protocols (from Step 6)');
    expect(prompt).not.toContain('**Subsystems:**');
    expect(prompt).toContain('**Interfaces:**');
  });
});

describe('infrastructure format helpers — isolated', () => {
  it('formatWeightedCriteriaSection empty on undefined/empty', () => {
    expect(formatWeightedCriteriaSection(undefined)).toBe('');
    expect(formatWeightedCriteriaSection([])).toBe('');
  });

  it('formatEngineeringTargetsSection empty on undefined/empty', () => {
    expect(formatEngineeringTargetsSection(undefined)).toBe('');
    expect(formatEngineeringTargetsSection([])).toBe('');
  });

  it('formatSubsystemTopologySection empty when both subsystems and interfaces are absent', () => {
    expect(formatSubsystemTopologySection(undefined, undefined)).toBe('');
    expect(formatSubsystemTopologySection([], [])).toBe('');
  });

  it('formatSubsystemTopologySection renders with only subsystems', () => {
    const out = formatSubsystemTopologySection(
      [{ id: 'SS1', name: 'Web', description: 'UI' }],
      undefined,
    );
    expect(out).toContain('**Subsystems:**');
    expect(out).not.toContain('**Interfaces:**');
  });
});
