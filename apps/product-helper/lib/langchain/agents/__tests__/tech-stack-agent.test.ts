/**
 * Tech Stack Agent — prompt-builder tests.
 *
 * Exercises the pure prompt-composition function (`buildTechStackPromptText`)
 * without invoking the LLM. Two paths covered per Phase N critique §5:
 *
 *   - Undefined path: no Steps 3-6 fields → prompt matches pre-Phase-N behavior
 *     (no new sections, no new instructions). Protects graceful degradation.
 *   - Populated path: decision criteria + engineering targets present →
 *     new sections appear in the expected positions, instruction line
 *     references them.
 *
 * @module lib/langchain/agents/__tests__/tech-stack-agent.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import {
  buildTechStackPromptText,
  formatDecisionMatrixSection,
  formatEngineeringTargetsSection,
  type TechStackContext,
} from '../tech-stack-agent';

function baseContext(): TechStackContext {
  return {
    projectName: 'Heat Guard',
    projectVision: 'Predictive heat-safety platform for field workers',
    useCases: [
      { name: 'Predict heat strain', description: 'Real-time worker risk scoring' },
    ],
    dataEntities: [{ name: 'Worker' }, { name: 'Reading' }],
  };
}

describe('buildTechStackPromptText — graceful degradation (undefined Steps 3-6)', () => {
  it('omits Trade-off Criteria section when decisionCriteria is absent', () => {
    const prompt = buildTechStackPromptText(baseContext());
    expect(prompt).not.toContain('## Trade-off Criteria');
  });

  it('omits Engineering Targets section when engineeringTargets is absent', () => {
    const prompt = buildTechStackPromptText(baseContext());
    expect(prompt).not.toContain('## Engineering Targets');
  });

  it('does not add the Steps-3-6 instruction line when no signals are present', () => {
    const prompt = buildTechStackPromptText(baseContext());
    expect(prompt).not.toContain('weighted Trade-off Criteria');
    expect(prompt).not.toContain('Engineering Targets above');
  });

  it('still transitions cleanly from Preferences to Instructions without a gap marker', () => {
    const prompt = buildTechStackPromptText(baseContext());
    // The template substitutes {stepsContextSections} → '' and
    // {stepsInstructionLine} → '' — there should be no un-replaced markers.
    expect(prompt).not.toContain('{stepsContextSections}');
    expect(prompt).not.toContain('{stepsInstructionLine}');
  });
});

describe('buildTechStackPromptText — populated Steps 3-6', () => {
  it('injects both sections and the instruction line when criteria + targets present', () => {
    const ctx: TechStackContext = {
      ...baseContext(),
      decisionCriteria: [
        {
          name: 'P95 Latency',
          unit: 'ms',
          weight: 0.4,
          minAcceptable: '< 800ms',
          targetValue: '< 500ms',
        },
        { name: 'Monthly Cost', unit: 'USD', weight: 0.3 },
      ],
      decisionRecommendation: 'ALT-01 serverless stack',
      engineeringTargets: [
        {
          name: 'Availability',
          unit: '%',
          directionOfImprovement: 'higher',
          designTarget: '>= 99.9%',
          technicalDifficulty: 3,
          estimatedCost: 4,
        },
      ],
    };
    const prompt = buildTechStackPromptText(ctx);

    expect(prompt).toContain('## Trade-off Criteria (from Decision Matrix)');
    expect(prompt).toContain('**P95 Latency** (ms, weight 0.40) — min: < 800ms, target: < 500ms');
    expect(prompt).toContain('**Monthly Cost** (USD, weight 0.30)');
    expect(prompt).toContain('**Prior recommendation:** ALT-01 serverless stack');

    expect(prompt).toContain('## Engineering Targets (from QFD House of Quality)');
    expect(prompt).toContain('| Availability | higher | >= 99.9% | % | 3 | 4 |');

    expect(prompt).toContain('weighted Trade-off Criteria');
    expect(prompt).toContain('Engineering Targets above');

    // Sections are injected between Preferences and Instructions, not elsewhere.
    const preferencesIdx = prompt.indexOf('## Preferences');
    const tradeoffIdx = prompt.indexOf('## Trade-off Criteria');
    const targetsIdx = prompt.indexOf('## Engineering Targets');
    const instructionsIdx = prompt.indexOf('## Instructions');
    expect(preferencesIdx).toBeLessThan(tradeoffIdx);
    expect(tradeoffIdx).toBeLessThan(targetsIdx);
    expect(targetsIdx).toBeLessThan(instructionsIdx);
  });

  it('injects only the Decision Matrix section when only criteria are present', () => {
    const ctx: TechStackContext = {
      ...baseContext(),
      decisionCriteria: [
        { name: 'Cost', unit: 'USD', weight: 1.0 },
      ],
    };
    const prompt = buildTechStackPromptText(ctx);

    expect(prompt).toContain('## Trade-off Criteria');
    expect(prompt).not.toContain('## Engineering Targets');
    expect(prompt).toContain('weighted Trade-off Criteria');
    expect(prompt).not.toContain('Engineering Targets above');
  });

  it('injects only the QFD section + partial instruction when only targets are present', () => {
    const ctx: TechStackContext = {
      ...baseContext(),
      engineeringTargets: [
        {
          name: 'Latency',
          unit: 'ms',
          directionOfImprovement: 'lower',
          designTarget: '<= 200ms',
        },
      ],
    };
    const prompt = buildTechStackPromptText(ctx);

    expect(prompt).not.toContain('## Trade-off Criteria');
    expect(prompt).toContain('## Engineering Targets');
    expect(prompt).not.toContain('weighted Trade-off Criteria');
    expect(prompt).toContain('Engineering Targets above');
  });

  it('surfaces a standalone recommendation even without criteria', () => {
    const prompt = buildTechStackPromptText({
      ...baseContext(),
      decisionRecommendation: 'Hold on infra pending compliance review',
    });
    expect(prompt).toContain('## Trade-off Criteria');
    expect(prompt).toContain('**Prior recommendation:** Hold on infra pending compliance review');
  });
});

describe('format helpers — isolated', () => {
  it('formatDecisionMatrixSection returns empty string on undefined/empty', () => {
    expect(formatDecisionMatrixSection(undefined, undefined)).toBe('');
    expect(formatDecisionMatrixSection([], undefined)).toBe('');
  });

  it('formatEngineeringTargetsSection returns empty string on undefined/empty', () => {
    expect(formatEngineeringTargetsSection(undefined)).toBe('');
    expect(formatEngineeringTargetsSection([])).toBe('');
  });

  it('formatDecisionMatrixSection handles missing min/target bounds', () => {
    const out = formatDecisionMatrixSection(
      [{ name: 'Cost', unit: 'USD', weight: 0.5 }],
      undefined,
    );
    expect(out).toContain('**Cost** (USD, weight 0.50)');
    expect(out).not.toContain('min:');
    expect(out).not.toContain('target:');
  });

  it('formatEngineeringTargetsSection renders — for missing difficulty/cost', () => {
    const out = formatEngineeringTargetsSection([
      {
        name: 'Throughput',
        unit: 'req/s',
        directionOfImprovement: 'higher',
        designTarget: '>= 10k',
      },
    ]);
    expect(out).toContain('| Throughput | higher | >= 10k | req/s | — | — |');
  });
});
