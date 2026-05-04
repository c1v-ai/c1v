/**
 * prompts.ts v2 unit tests
 *
 * Verifies shared utilities + phase-staged extraction prompts. The
 * cascade-removal regression assertions enforce plan §9 acceptance test #6
 * (no MUST/REQUIRED-minimum/Every-X mandates survive the rewrite).
 */

import {
  escapeBraces,
  buildProjectContextPreamble,
  summarizeUpstream,
  EXTRACTION_PROMPTS,
  FFBD_RULES,
  QFD_RULES,
  DECISION_MATRIX_RULES,
  INTERFACES_RULES,
  extractionPromptLegacy,
} from '../prompts';
import { PromptTemplate } from '@langchain/core/prompts';

describe('escapeBraces', () => {
  it('doubles both opening and closing braces', () => {
    expect(escapeBraces('{')).toBe('{{');
    expect(escapeBraces('}')).toBe('}}');
    expect(escapeBraces('{"a": 1}')).toBe('{{"a": 1}}');
  });

  it('handles strings with no braces', () => {
    expect(escapeBraces('plain text')).toBe('plain text');
  });
});

describe('buildProjectContextPreamble', () => {
  it('includes project name and vision', () => {
    const out = buildProjectContextPreamble({
      projectName: 'My App',
      projectVision: 'Help users plan meals',
    });
    expect(out).toContain('My App');
    expect(out).toContain('Help users plan meals');
  });

  it('handles null projectType gracefully', () => {
    const out = buildProjectContextPreamble({
      projectName: 'X',
      projectVision: 'Y',
      projectType: null,
    });
    expect(out).toContain('not specified');
  });

  it('includes projectType when provided', () => {
    const out = buildProjectContextPreamble({
      projectName: 'X',
      projectVision: 'Y',
      projectType: 'saas',
    });
    expect(out).toContain('saas');
  });
});

describe('summarizeUpstream', () => {
  it('returns "(none yet)" placeholder when all deps are empty', () => {
    const out = summarizeUpstream({ extractedData: {} }, ['actors']);
    expect(out).toContain('none yet');
  });

  it('renders actors when present', () => {
    const out = summarizeUpstream(
      {
        extractedData: {
          actors: [{ name: 'Admin', role: 'primary', description: '' }],
        } as never,
      },
      ['actors'],
    );
    expect(out).toContain('Admin');
    expect(out).toContain('Actors');
  });

  it('returns empty string when deps array is empty', () => {
    const out = summarizeUpstream({ extractedData: {} }, []);
    expect(out).toBe('');
  });

  it('skips deps with empty data and renders only populated ones', () => {
    const out = summarizeUpstream(
      {
        extractedData: {
          actors: [{ name: 'User', role: 'primary', description: '' }],
          useCases: [],
        } as never,
      },
      ['actors', 'useCases'],
    );
    expect(out).toContain('User');
    expect(out).not.toContain('### Use Cases');
  });
});

describe('EXTRACTION_PROMPTS', () => {
  const requiredKeys = [
    'context-diagram',
    'use-case-diagram',
    'scope-tree',
    'functional-requirements',
  ] as const;

  it.each(requiredKeys)('exports %s as a PromptTemplate', (key) => {
    const p = EXTRACTION_PROMPTS[key];
    expect(p).toBeDefined();
    expect(p).toBeInstanceOf(PromptTemplate);
  });
});

describe('cascade-removal regression', () => {
  const stubInputs = {
    projectName: 'Demo',
    projectVision: 'demo vision',
    conversationHistory: 'user: hi',
    educationBlock: '',
  };

  const cascadePattern =
    /MUST\s+(infer|include|return|have)|Do NOT return empty|REQUIRED.*minimum|Every (project|system|actor)/i;

  const promptKeys = [
    'context-diagram',
    'use-case-diagram',
    'scope-tree',
    'functional-requirements',
  ] as const;

  it.each(promptKeys)(
    '%s prompt contains no MUST/REQUIRED/Every-X cascade language',
    async (key) => {
      const p = EXTRACTION_PROMPTS[key]!;
      const rendered = await p.format(stubInputs);
      expect(rendered).not.toMatch(cascadePattern);
    },
  );
});

describe('industry-standard purge', () => {
  const stubInputs = {
    projectName: 'Demo',
    projectVision: 'demo vision',
    conversationHistory: 'user: hi',
    educationBlock: '',
  };

  const promptKeys = [
    'context-diagram',
    'use-case-diagram',
    'scope-tree',
    'functional-requirements',
  ] as const;

  it.each(promptKeys)('%s prompt does not contain "industry-standard"', async (key) => {
    const p = EXTRACTION_PROMPTS[key]!;
    const rendered = await p.format(stubInputs);
    expect(rendered).not.toContain('industry-standard');
  });

  const ruleBlocks: Array<[string, string]> = [
    ['FFBD_RULES', FFBD_RULES],
    ['QFD_RULES', QFD_RULES],
    ['DECISION_MATRIX_RULES', DECISION_MATRIX_RULES],
    ['INTERFACES_RULES', INTERFACES_RULES],
  ];

  it.each(ruleBlocks)('%s does not contain "industry-standard"', (_name, body) => {
    expect(body).not.toContain('industry-standard');
  });
});

describe('legacy back-compat', () => {
  it('extractionPromptLegacy is still exported as a PromptTemplate', () => {
    expect(extractionPromptLegacy).toBeInstanceOf(PromptTemplate);
  });
});
