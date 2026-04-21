/**
 * API Spec Agent — prompt-builder tests.
 *
 * Covers both paths required by Phase N critique §5:
 *  - Undefined: interfaceMatrix / subsystems absent → no System Interface Matrix
 *    section, no Steps-3-6 Coverage addendum, pre-Phase-N prompt shape preserved.
 *  - Populated: interfaces + subsystems present → section appears between
 *    Tech Stack Context and Instructions, and the Coverage Requirements block
 *    gets the Steps 3-6 protocol/category rules appended.
 *
 * @module lib/langchain/agents/__tests__/api-spec-agent.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import {
  buildAPISpecPromptText,
  formatInterfaceMatrixSection,
} from '../api-spec-agent';
import type { APISpecGenerationContext } from '../../../types/api-specification';

function baseContext(): APISpecGenerationContext {
  return {
    projectName: 'Heat Guard',
    projectVision: 'Predictive heat-safety platform for field workers',
    useCases: [
      {
        id: 'UC1',
        name: 'Predict heat strain',
        description: 'Real-time risk scoring',
        actor: 'Worker',
      },
    ],
    dataEntities: [
      { name: 'Worker', attributes: ['id', 'name'], relationships: [] },
    ],
  };
}

describe('buildAPISpecPromptText — graceful degradation', () => {
  it('omits the System Interface Matrix section when no interfaces/subsystems supplied', () => {
    const prompt = buildAPISpecPromptText(baseContext());
    expect(prompt).not.toContain('## System Interface Matrix (Step 6)');
  });

  it('does not add the Steps-3-6 Coverage addendum when no interfaces supplied', () => {
    const prompt = buildAPISpecPromptText(baseContext());
    expect(prompt).not.toContain('Steps 3-6 Coverage');
    expect(prompt).not.toContain('protocol: WebSocket');
    expect(prompt).not.toContain('category: auth');
  });

  it('leaves no un-replaced markers in the undefined path', () => {
    const prompt = buildAPISpecPromptText(baseContext());
    expect(prompt).not.toContain('{interfaceMatrixSection}');
    expect(prompt).not.toContain('{stepsCoverageAddendum}');
  });
});

describe('buildAPISpecPromptText — populated Steps 3-6', () => {
  it('injects the System Interface Matrix section + Coverage addendum when interfaces present', () => {
    const ctx: APISpecGenerationContext = {
      ...baseContext(),
      interfaceMatrix: [
        {
          id: 'IF-01',
          name: 'Submit Reading',
          source: 'SS1',
          destination: 'SS2',
          dataPayload: 'worker_id, core_temp, hr',
          protocol: 'REST API',
          frequency: 'Per reading',
          category: 'critical',
        },
        {
          id: 'IF-02',
          name: 'Live Dashboard',
          source: 'SS2',
          destination: 'SS1',
          dataPayload: 'status stream',
          protocol: 'WebSocket',
          frequency: 'Real-time stream',
        },
        {
          id: 'IF-03',
          name: 'Audit Log Write',
          source: 'SS2',
          destination: 'SS3',
          dataPayload: 'event, actor_id, timestamp',
          protocol: 'REST API',
          category: 'audit',
        },
      ],
      subsystems: [
        { id: 'SS1', name: 'Worker App', description: 'Mobile client' },
        { id: 'SS2', name: 'Predictor', description: 'Inference service' },
        { id: 'SS3', name: 'Audit Store', description: 'Append-only log' },
      ],
    };

    const prompt = buildAPISpecPromptText(ctx);

    expect(prompt).toContain('## System Interface Matrix (Step 6)');
    expect(prompt).toContain('**SS1: Worker App** — Mobile client');
    expect(prompt).toContain('**SS2: Predictor** — Inference service');
    expect(prompt).toContain(
      '| IF-01 | Submit Reading | SS1 → SS2 | REST API | Per reading | critical | worker_id, core_temp, hr |',
    );
    expect(prompt).toContain(
      '| IF-02 | Live Dashboard | SS2 → SS1 | WebSocket | Real-time stream | — | status stream |',
    );

    // Coverage addendum fires with all 5 bullets
    expect(prompt).toContain('### Steps 3-6 Coverage (System Interface Matrix)');
    expect(prompt).toContain('Each interface with `protocol: REST API` (or unspecified) MUST map');
    expect(prompt).toContain('SKIP interfaces with `protocol: WebSocket`');
    expect(prompt).toContain('category: auth');
    expect(prompt).toContain('category: audit');
    expect(prompt).toContain('category: critical');
  });

  it('injects the section between Tech Stack Context and Instructions, not elsewhere', () => {
    const ctx: APISpecGenerationContext = {
      ...baseContext(),
      interfaceMatrix: [
        {
          id: 'IF-01',
          name: 'X',
          source: 'A',
          destination: 'B',
          dataPayload: 'x',
          protocol: 'REST API',
        },
      ],
    };
    const prompt = buildAPISpecPromptText(ctx);
    const techIdx = prompt.indexOf('## Tech Stack Context');
    const ifaceIdx = prompt.indexOf('## System Interface Matrix');
    const instructionsIdx = prompt.indexOf('## Instructions');
    expect(techIdx).toBeGreaterThan(-1);
    expect(ifaceIdx).toBeGreaterThan(techIdx);
    expect(instructionsIdx).toBeGreaterThan(ifaceIdx);
  });

  it('renders subsystems alone when no interfaces supplied', () => {
    const ctx: APISpecGenerationContext = {
      ...baseContext(),
      subsystems: [{ id: 'SS1', name: 'Monolith', description: 'Everything' }],
    };
    const prompt = buildAPISpecPromptText(ctx);
    expect(prompt).toContain('## System Interface Matrix (Step 6)');
    expect(prompt).toContain('**Subsystems** (each becomes a resource/tag):');
    expect(prompt).not.toContain('**Interfaces:**');
    // No interfaces → Coverage addendum stays OFF so we don't reference protocols
    // that aren't enumerated in the section.
    expect(prompt).not.toContain('### Steps 3-6 Coverage');
  });

  it('renders interfaces alone when no subsystems supplied', () => {
    const ctx: APISpecGenerationContext = {
      ...baseContext(),
      interfaceMatrix: [
        {
          id: 'IF-01',
          name: 'X',
          source: 'A',
          destination: 'B',
          dataPayload: 'payload',
          protocol: 'REST API',
        },
      ],
    };
    const prompt = buildAPISpecPromptText(ctx);
    expect(prompt).toContain('## System Interface Matrix (Step 6)');
    expect(prompt).not.toContain('**Subsystems** (each becomes a resource/tag):');
    expect(prompt).toContain('**Interfaces:**');
    expect(prompt).toContain('### Steps 3-6 Coverage');
  });
});

describe('api-spec format helpers — isolated', () => {
  it('formatInterfaceMatrixSection empty when both inputs are absent/empty', () => {
    expect(formatInterfaceMatrixSection(undefined, undefined)).toBe('');
    expect(formatInterfaceMatrixSection([], [])).toBe('');
  });

  it('formatInterfaceMatrixSection handles interface with no optional metadata', () => {
    const out = formatInterfaceMatrixSection(
      [
        {
          id: 'IF-01',
          name: 'Basic',
          source: 'A',
          destination: 'B',
          dataPayload: 'x',
          // protocol, frequency, category all omitted
        },
      ],
      undefined,
    );
    expect(out).toContain('| IF-01 | Basic | A → B | — | — | — | x |');
  });
});
