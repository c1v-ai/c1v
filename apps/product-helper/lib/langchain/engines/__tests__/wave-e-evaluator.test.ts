/**
 * wave-e-evaluator.test.ts
 *
 * Boundary coverage for the Wave-E thin wrapper on top of plural's
 * NFREngineInterpreter.evaluateRule(). Confidence thresholds 0.90 / 0.60
 * are LOCKED per master plan v2.1 line 445 — these tests pin the
 * boundaries at exactly 0.90 / 0.89 / 0.59.
 *
 * Coverage:
 *   - confidence ≥ 0.90 → status='ready'
 *   - 0.60 ≤ c < 0.90 + llm_assist=true → llm-refine hook fires
 *   - 0.60 ≤ c < 0.90 + llm_assist=false → status='needs_user_input'
 *   - confidence < 0.60 → status='needs_user_input' regardless of llm_assist
 *   - nfr_engine_contract_version: 'v1' on every output
 *   - never throws on insufficient confidence
 *   - LLM-refine hook injection (test substitutes a stub returning 'ready')
 *   - audit-context guard: missing auditContext throws when skipAudit !== true
 *
 * All evaluator calls in this file pass `{ skipAudit: true }` because they
 * exercise the wrapper's routing logic without a DB connection. The
 * synchronous audit-write hot path is covered separately in
 * `apps/product-helper/__tests__/engine/audit-trail.test.ts` against a
 * real local Supabase.
 */

import { describe, it, expect } from '@jest/globals';

import {
  ENGINE_CONTRACT_VERSION,
  evaluateWaveE,
  waveEEvaluator,
  WaveEAuditContextRequiredError,
  type EvaluateOptions,
  type LlmRefineFn,
  type WaveEEngineOutput,
} from '../wave-e-evaluator';
import type {
  DecisionRef,
  EngineInputs,
} from '../nfr-engine-interpreter';

/** Default options for boundary tests — DB-free path. The audit hot path
 *  has its own integration coverage in __tests__/engine/audit-trail.test.ts. */
const SKIP_AUDIT: EvaluateOptions = { skipAudit: true };

// ──────────────────────────────────────────────────────────────────────────
// Fixture builders — minimal DecisionRef with single match rule + no modifiers
// for precise confidence control.
// ──────────────────────────────────────────────────────────────────────────

function buildDecision(
  baseConfidence: number,
  opts: { llm_assist?: boolean } = {},
): DecisionRef & { llm_assist?: boolean } {
  return {
    decision_id: 'test-decision',
    target_field: 'constants_table.TEST_FIELD',
    inputs: [{ name: 'flow_class', source: 'M2.test' }],
    function: {
      type: 'decision_tree',
      rules: [
        {
          if: { flow_class: 'matches' },
          value: 42,
          base_confidence: baseConfidence,
          rule_id: `rule-${baseConfidence}`,
        },
        {
          default: { value: 0, base_confidence: 0.5, rule_id: 'default' },
        },
      ],
    },
    ...(opts.llm_assist !== undefined ? { llm_assist: opts.llm_assist } : {}),
  };
}

const matchingInputs: EngineInputs = { flow_class: 'matches' };

// ──────────────────────────────────────────────────────────────────────────
// Boundary: confidence >= 0.90 → ready
// ──────────────────────────────────────────────────────────────────────────

describe('evaluateWaveE: high-confidence auto-fill (status=ready)', () => {
  it('exactly 0.90 base_confidence with no modifiers → status=ready', async () => {
    const decision = buildDecision(0.9);
    const out = await evaluateWaveE(decision, matchingInputs, {}, SKIP_AUDIT);
    expect(out.status).toBe('ready');
    expect(out.final_confidence).toBe(0.9);
    expect(out.auto_filled).toBe(true);
    expect(out.value).toBe(42);
  });

  it('above 0.90 (e.g. 0.94) → status=ready', async () => {
    const decision = buildDecision(0.94);
    const out = await evaluateWaveE(decision, matchingInputs, {}, SKIP_AUDIT);
    expect(out.status).toBe('ready');
    expect(out.auto_filled).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Boundary: 0.60 <= confidence < 0.90 — refine band routing
// ──────────────────────────────────────────────────────────────────────────

describe('evaluateWaveE: refine band (0.60 ≤ c < 0.90)', () => {
  it('0.89 with llm_assist=true → llm-refine hook fires', async () => {
    const decision = buildDecision(0.89, { llm_assist: true });
    let hookCalled = false;
    const llmRefine: LlmRefineFn = async ({ candidate }) => {
      hookCalled = true;
      // Refine produces a confident answer — bump status to ready.
      return {
        ...candidate,
        status: 'ready',
        auto_filled: true,
        needs_user_input: false,
        value: 99,
        math_trace: `${candidate.math_trace} | llm-refine: bumped to ready`,
      };
    };
    const out = await evaluateWaveE(decision, matchingInputs, {}, { ...SKIP_AUDIT, llmRefine });
    expect(hookCalled).toBe(true);
    expect(out.status).toBe('ready');
    expect(out.value).toBe(99);
  });

  it('0.89 with llm_assist=false → status=needs_user_input (no refine)', async () => {
    const decision = buildDecision(0.89, { llm_assist: false });
    let hookCalled = false;
    const llmRefine: LlmRefineFn = async ({ candidate }) => {
      hookCalled = true;
      return candidate;
    };
    const out = await evaluateWaveE(decision, matchingInputs, {}, { ...SKIP_AUDIT, llmRefine });
    expect(hookCalled).toBe(false);
    expect(out.status).toBe('needs_user_input');
    expect(out.auto_filled).toBe(false);
    expect(out.value).toBeNull();
  });

  it('0.89 with llm_assist undefined → status=needs_user_input', async () => {
    const decision = buildDecision(0.89);
    const out = await evaluateWaveE(decision, matchingInputs, {}, SKIP_AUDIT);
    expect(out.status).toBe('needs_user_input');
    expect(out.auto_filled).toBe(false);
  });

  it('default LLM-refine stub downgrades to needs_user_input', async () => {
    const decision = buildDecision(0.75, { llm_assist: true });
    const out = await evaluateWaveE(decision, matchingInputs, {}, SKIP_AUDIT);
    expect(out.status).toBe('needs_user_input');
    expect(out.value).toBeNull();
    expect(out.math_trace).toContain('llm-refine stub');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Boundary: confidence < 0.60 — always surface to user
// ──────────────────────────────────────────────────────────────────────────

describe('evaluateWaveE: below refine threshold (c < 0.60)', () => {
  it('0.59 with llm_assist=true → status=needs_user_input (no refine)', async () => {
    const decision = buildDecision(0.59, { llm_assist: true });
    let hookCalled = false;
    const llmRefine: LlmRefineFn = async ({ candidate }) => {
      hookCalled = true;
      return candidate;
    };
    const out = await evaluateWaveE(decision, matchingInputs, {}, { ...SKIP_AUDIT, llmRefine });
    expect(hookCalled).toBe(false);
    expect(out.status).toBe('needs_user_input');
    expect(out.value).toBeNull();
  });

  it('0.30 → status=needs_user_input regardless', async () => {
    const decision = buildDecision(0.3, { llm_assist: true });
    const out = await evaluateWaveE(decision, matchingInputs, {}, SKIP_AUDIT);
    expect(out.status).toBe('needs_user_input');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Contract envelope (FROZEN per Wave A↔E handshake, v2.1 lines 498–504)
// ──────────────────────────────────────────────────────────────────────────

describe('evaluateWaveE: contract envelope', () => {
  it('every output carries nfr_engine_contract_version: v1', async () => {
    const cases: WaveEEngineOutput[] = await Promise.all([
      evaluateWaveE(buildDecision(0.95), matchingInputs, {}, SKIP_AUDIT),
      evaluateWaveE(buildDecision(0.75, { llm_assist: true }), matchingInputs, {}, SKIP_AUDIT),
      evaluateWaveE(buildDecision(0.5), matchingInputs, {}, SKIP_AUDIT),
    ]);
    for (const out of cases) {
      expect(out.nfr_engine_contract_version).toBe('v1');
      expect(out.nfr_engine_contract_version).toBe(ENGINE_CONTRACT_VERSION);
    }
  });

  it('exposes valid status enum on every output', async () => {
    const validStatuses = new Set(['ready', 'needs_user_input', 'failed']);
    const cases = await Promise.all([
      evaluateWaveE(buildDecision(0.95), matchingInputs, {}, SKIP_AUDIT),
      evaluateWaveE(buildDecision(0.75, { llm_assist: true }), matchingInputs, {}, SKIP_AUDIT),
      evaluateWaveE(buildDecision(0.3), matchingInputs, {}, SKIP_AUDIT),
    ]);
    for (const out of cases) {
      expect(validStatuses.has(out.status)).toBe(true);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Failure semantics — never throws on insufficient confidence
// ──────────────────────────────────────────────────────────────────────────

describe('evaluateWaveE: never throws on confidence', () => {
  it('zero-confidence rule still produces an output', async () => {
    const decision = buildDecision(0);
    const out = await evaluateWaveE(decision, matchingInputs, {}, SKIP_AUDIT);
    expect(out.status).toBe('needs_user_input');
    expect(out).toHaveProperty('math_trace');
  });

  it('no matching rule (default-only path) still produces an output', async () => {
    const decision: DecisionRef = {
      decision_id: 'no-match',
      target_field: 'tf',
      inputs: [],
      function: {
        type: 'decision_tree',
        rules: [
          { default: { value: 1, base_confidence: 0.5, rule_id: 'd' } },
        ],
      },
    };
    const out = await evaluateWaveE(decision, {}, {}, SKIP_AUDIT);
    expect(out.status).toBe('needs_user_input');
    expect(out.nfr_engine_contract_version).toBe('v1');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Object-form parity — waveEEvaluator.evaluate matches evaluateWaveE
// ──────────────────────────────────────────────────────────────────────────

describe('evaluateWaveE: object-form export', () => {
  it('waveEEvaluator.evaluate is the same function as evaluateWaveE', async () => {
    const decision = buildDecision(0.95);
    const a = await evaluateWaveE(decision, matchingInputs, {}, SKIP_AUDIT);
    const b = await waveEEvaluator.evaluate(decision, matchingInputs, {}, SKIP_AUDIT);
    expect(a.status).toBe(b.status);
    expect(a.final_confidence).toBe(b.final_confidence);
    expect(a.value).toBe(b.value);
    expect(a.nfr_engine_contract_version).toBe(b.nfr_engine_contract_version);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Audit-context guard — production callers MUST audit by default
// ──────────────────────────────────────────────────────────────────────────

describe('evaluateWaveE: audit-context guard', () => {
  it('throws WaveEAuditContextRequiredError when skipAudit is omitted and no auditContext is provided', async () => {
    const decision = buildDecision(0.95);
    // Default options — no skipAudit, no auditContext. Production guard.
    await expect(evaluateWaveE(decision, matchingInputs)).rejects.toBeInstanceOf(
      WaveEAuditContextRequiredError,
    );
  });

  it('throws WaveEAuditContextRequiredError when skipAudit is explicitly false and no auditContext is provided', async () => {
    const decision = buildDecision(0.95);
    await expect(
      evaluateWaveE(decision, matchingInputs, {}, { skipAudit: false }),
    ).rejects.toBeInstanceOf(WaveEAuditContextRequiredError);
  });

  it('does NOT throw when skipAudit=true and auditContext is omitted', async () => {
    const decision = buildDecision(0.95);
    const out = await evaluateWaveE(decision, matchingInputs, {}, SKIP_AUDIT);
    expect(out.status).toBe('ready');
  });
});
