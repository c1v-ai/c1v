import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Deep-mock ../../config so pulling model-router doesn't trip env validation
// at import time (env.ts otherwise requires OPENROUTER_API_KEY etc.).
jest.mock('../../config', () => ({
  cheapLLM: { __name: 'cheap' },
  streamingLLM: { __name: 'streaming' },
}));

import {
  pickModel,
  guardContextSize,
  roleOfModel,
  MODEL_CONTEXT_BUDGETS,
  OPENROUTER_MODELS,
} from '../model-router';

// ──────────────────────────────────────────────────────────────────────────
// pickModel — rule-path mapping (default CHEAP_MODE off)
// ──────────────────────────────────────────────────────────────────────────

describe('pickModel — rule path mapping (CHEAP_MODE off)', () => {
  const d = { decision_id: 'D_TEST' };
  const prev = process.env.CHEAP_MODE;
  beforeEach(() => {
    delete process.env.CHEAP_MODE;
  });
  afterEach(() => {
    if (prev === undefined) delete process.env.CHEAP_MODE;
    else process.env.CHEAP_MODE = prev;
  });

  it('heuristic → null (no LLM)', () => {
    expect(pickModel(d, 'heuristic')).toBeNull();
  });

  it('llm_refine → classify (haiku-4-5)', () => {
    expect(pickModel(d, 'llm_refine')).toBe(OPENROUTER_MODELS.classify);
    expect(pickModel(d, 'llm_refine')).toBe('anthropic/claude-haiku-4-5');
  });

  it('user_surface → extract (sonnet-4-6)', () => {
    expect(pickModel(d, 'user_surface')).toBe(OPENROUTER_MODELS.extract);
    expect(pickModel(d, 'user_surface')).toBe('anthropic/claude-sonnet-4-6');
  });

  it('never auto-routes to Opus', () => {
    for (const p of ['heuristic', 'llm_refine', 'user_surface'] as const) {
      expect(pickModel(d, p)).not.toBe(OPENROUTER_MODELS.synthesize);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────
// pickModel — CHEAP_MODE downgrade
// ──────────────────────────────────────────────────────────────────────────

describe('pickModel — CHEAP_MODE=true downgrades', () => {
  const d = { decision_id: 'D' };
  const prev = process.env.CHEAP_MODE;
  beforeEach(() => {
    process.env.CHEAP_MODE = 'true';
  });
  afterEach(() => {
    if (prev === undefined) delete process.env.CHEAP_MODE;
    else process.env.CHEAP_MODE = prev;
  });

  it('llm_refine → cheap_classify (gemini-2.5-flash)', () => {
    expect(pickModel(d, 'llm_refine')).toBe(OPENROUTER_MODELS.cheap_classify);
  });

  it('user_surface → cheap_classify (gemini-2.5-flash)', () => {
    expect(pickModel(d, 'user_surface')).toBe(
      OPENROUTER_MODELS.cheap_classify,
    );
  });

  it('heuristic → still null', () => {
    expect(pickModel(d, 'heuristic')).toBeNull();
  });

  it('explicit synthesize override is NOT downgraded', () => {
    expect(
      pickModel(
        { decision_id: 'D', model_role_override: 'synthesize' },
        'llm_refine',
      ),
    ).toBe(OPENROUTER_MODELS.synthesize);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// pickModel — per-decision override
// ──────────────────────────────────────────────────────────────────────────

describe('pickModel — per-decision override', () => {
  const prev = process.env.CHEAP_MODE;
  beforeEach(() => {
    delete process.env.CHEAP_MODE;
  });
  afterEach(() => {
    if (prev === undefined) delete process.env.CHEAP_MODE;
    else process.env.CHEAP_MODE = prev;
  });

  it("override='none' forces null regardless of rule path", () => {
    expect(
      pickModel({ decision_id: 'D', model_role_override: 'none' }, 'llm_refine'),
    ).toBeNull();
    expect(
      pickModel(
        { decision_id: 'D', model_role_override: 'none' },
        'user_surface',
      ),
    ).toBeNull();
  });

  it("override='classify' → haiku even on user_surface path", () => {
    expect(
      pickModel(
        { decision_id: 'D', model_role_override: 'classify' },
        'user_surface',
      ),
    ).toBe(OPENROUTER_MODELS.classify);
  });

  it("override='synthesize' → opus even on heuristic path", () => {
    expect(
      pickModel(
        { decision_id: 'D', model_role_override: 'synthesize' },
        'heuristic',
      ),
    ).toBe(OPENROUTER_MODELS.synthesize);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// roleOfModel
// ──────────────────────────────────────────────────────────────────────────

describe('roleOfModel', () => {
  it('maps each registry id back to its role', () => {
    expect(roleOfModel(OPENROUTER_MODELS.classify)).toBe('classify');
    expect(roleOfModel(OPENROUTER_MODELS.extract)).toBe('extract');
    expect(roleOfModel(OPENROUTER_MODELS.synthesize)).toBe('synthesize');
    expect(roleOfModel(OPENROUTER_MODELS.cheap_classify)).toBe(
      'cheap_classify',
    );
  });

  it('returns null for null input (heuristic path)', () => {
    expect(roleOfModel(null)).toBeNull();
  });

  it('returns "extract" (safe default) for unknown ids', () => {
    expect(roleOfModel('unknown/model')).toBe('extract');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// guardContextSize
// ──────────────────────────────────────────────────────────────────────────

describe('guardContextSize — G11', () => {
  it('null model (heuristic) always passes', () => {
    const r = guardContextSize(null, 10_000_000);
    expect(r.ok).toBe(true);
  });

  it('small prompt within budget → ok', () => {
    const r = guardContextSize(OPENROUTER_MODELS.classify, 1_000);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.budget).toBe(MODEL_CONTEXT_BUDGETS.classify);
  });

  it('prompt exceeding classify budget → rejected with reason', () => {
    // 180_001 tokens * 4 chars/token = 720_004 chars
    const r = guardContextSize(OPENROUTER_MODELS.classify, 720_004 + 100);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.estimatedTokens).toBeGreaterThan(MODEL_CONTEXT_BUDGETS.classify);
      expect(r.reason).toMatch(/exceeds budget/);
    }
  });

  it('prompt exceeding extract budget → rejected', () => {
    const r = guardContextSize(OPENROUTER_MODELS.extract, 1_000_000);
    expect(r.ok).toBe(false);
  });

  it('negative / zero chars handled gracefully', () => {
    expect(guardContextSize(OPENROUTER_MODELS.classify, 0).ok).toBe(true);
    expect(guardContextSize(OPENROUTER_MODELS.classify, -100).ok).toBe(true);
  });
});
