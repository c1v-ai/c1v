/**
 * User Stories Agent — prompt-builder tests.
 *
 * Covers the two paths required by Phase N critique §5:
 *  - Undefined: `functionalBlocks` absent → no FFBD section, no epic/priority
 *    instruction block, pre-Phase-N prompt shape preserved.
 *  - Populated: top-level + decomposed FFBD blocks (with `isCoreValue` flag)
 *    → section + instruction block appear, core-value lift is instructed.
 *
 * @module lib/langchain/agents/__tests__/user-stories-agent.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import {
  buildUserStoriesPromptText,
  formatFunctionalDecompositionSection,
  type UserStoriesContext,
} from '../user-stories-agent';

function baseContext(): UserStoriesContext {
  return {
    projectName: 'Heat Guard',
    projectVision: 'Predictive heat-safety platform',
    useCases: [
      {
        id: 'UC1',
        name: 'Predict strain',
        description: 'Real-time scoring',
        actor: 'Worker',
        priority: 'must',
      },
    ],
    actors: [{ name: 'Worker', role: 'Field User' }],
  };
}

describe('buildUserStoriesPromptText — graceful degradation', () => {
  it('omits the Functional Decomposition section when functionalBlocks absent', () => {
    const prompt = buildUserStoriesPromptText(baseContext());
    expect(prompt).not.toContain('## Functional Decomposition (FFBD)');
  });

  it('omits the Steps-3-6 epic/priority guidance when functionalBlocks absent', () => {
    const prompt = buildUserStoriesPromptText(baseContext());
    expect(prompt).not.toContain('Steps 3-6 Epic + Priority Guidance');
    expect(prompt).not.toContain('core value');
  });

  it('leaves no un-replaced markers', () => {
    const prompt = buildUserStoriesPromptText(baseContext());
    expect(prompt).not.toContain('{ffbdSectionBlock}');
    expect(prompt).not.toContain('{ffbdInstructionBlock}');
  });
});

describe('buildUserStoriesPromptText — populated FFBD', () => {
  it('injects the FFBD section + epic/priority guidance when blocks present', () => {
    const ctx: UserStoriesContext = {
      ...baseContext(),
      functionalBlocks: [
        {
          id: 'F.1',
          name: 'Authenticate User',
          isCoreValue: true,
          description: 'Verify identity',
        },
        { id: 'F.2', name: 'Predict Strain' },
        { id: 'F.1.1', name: 'Issue JWT', parentId: 'F.1' },
      ],
    };

    const prompt = buildUserStoriesPromptText(ctx);

    expect(prompt).toContain('## Functional Decomposition (FFBD)');
    expect(prompt).toContain('**Top-level functions (candidate epics):**');
    expect(prompt).toContain('**F.1: Authenticate User** ⭐ (core value) — Verify identity');
    expect(prompt).toContain('**F.2: Predict Strain**');
    expect(prompt).toContain('**Sub-functions (candidate story boundaries):**');
    expect(prompt).toContain('**F.1.1: Issue JWT** (parent F.1)');

    expect(prompt).toContain('### Steps 3-6 Epic + Priority Guidance (from FFBD)');
    expect(prompt).toContain('Use the top-level F.x functions above as `epic`');
    expect(prompt).toContain('core value');
    expect(prompt).toContain('low→medium, medium→high, high→critical');
  });

  it('renders top-level-only when no decomposed blocks are supplied', () => {
    const ctx: UserStoriesContext = {
      ...baseContext(),
      functionalBlocks: [{ id: 'F.1', name: 'Do the thing' }],
    };
    const out = formatFunctionalDecompositionSection(ctx.functionalBlocks);
    expect(out).toContain('**Top-level functions (candidate epics):**');
    expect(out).not.toContain('**Sub-functions (candidate story boundaries):**');
  });

  it('renders decomposed-only when all blocks have parentId', () => {
    const out = formatFunctionalDecompositionSection([
      { id: 'F.1.1', name: 'Thing A', parentId: 'F.1' },
      { id: 'F.1.2', name: 'Thing B', parentId: 'F.1' },
    ]);
    expect(out).not.toContain('**Top-level functions (candidate epics):**');
    expect(out).toContain('**Sub-functions (candidate story boundaries):**');
  });

  it('does not add the core-value star when isCoreValue is falsy or absent', () => {
    const out = formatFunctionalDecompositionSection([
      { id: 'F.1', name: 'Plain' },
      { id: 'F.2', name: 'Also Plain', isCoreValue: false },
    ]);
    expect(out).not.toContain('⭐');
  });

  it('injects FFBD section between Use Cases and Instructions, not elsewhere', () => {
    const ctx: UserStoriesContext = {
      ...baseContext(),
      functionalBlocks: [{ id: 'F.1', name: 'X' }],
    };
    const prompt = buildUserStoriesPromptText(ctx);
    const useCasesIdx = prompt.indexOf('## Use Cases to Transform');
    const ffbdIdx = prompt.indexOf('## Functional Decomposition (FFBD)');
    const instructionsIdx = prompt.indexOf('## Instructions');
    expect(useCasesIdx).toBeGreaterThan(-1);
    expect(ffbdIdx).toBeGreaterThan(useCasesIdx);
    expect(instructionsIdx).toBeGreaterThan(ffbdIdx);
  });
});

describe('user-stories format helper — isolated', () => {
  it('formatFunctionalDecompositionSection empty on undefined/empty', () => {
    expect(formatFunctionalDecompositionSection(undefined)).toBe('');
    expect(formatFunctionalDecompositionSection([])).toBe('');
  });
});
