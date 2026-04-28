/**
 * lib/langchain/engines/wave-e-evaluator.ts
 *
 * Wave-E thin wrapper on top of `NFREngineInterpreter.evaluateRule()`.
 *
 * Adds the 4 v2.2-required behaviors that the Apr-22 runtime-peer interpreter
 * doesn't carry, without changing plural's existing API surface:
 *
 *   1. **Two-band confidence (LOCKED per master plan v2.1 line 445):**
 *        final_confidence ≥ 0.90              → status='ready'             (auto-fill)
 *        0.60 ≤ final < 0.90 + llm_assist     → llm-refine hook
 *        otherwise (incl. < 0.60)             → status='needs_user_input'
 *
 *   2. **LLM-refine hook injection** — `engine-prod-swap` swaps in the real
 *      cheap-LLM call later. Default is a stub that downgrades to
 *      `needs_user_input` so unit tests can run without an API key.
 *
 *   3. **`nfr_engine_contract_version: 'v1'` envelope** on output — the
 *      FROZEN Wave A↔E handshake pin (master plan v2.1 lines 498–504).
 *      Bumping to `'v2'` forces a Wave-A re-edit; do not change without ADR.
 *
 *   4. **Failure semantics:** never throws on insufficient confidence —
 *      always emits a typed `WaveEEngineOutput`. Throwing breaks Wave A's
 *      `system-question-bridge` consumer.
 *
 * The wrapper is decision-shape-additive: it only requires `decision.llm_assist?`
 * as an optional property on top of plural's `DecisionRef`. Existing callers
 * (scripts/verify-t3.ts, lib/db/queries/decision-audit.ts, TC1 schemas) keep
 * using `evaluateRule()` directly with no shape change.
 *
 * Wave-E specific consumers (engine-prod-swap's GENERATE_nfr / GENERATE_constants
 * graph nodes, agent-greenfield-refactor's 7 P10 nodes) call `evaluateWaveE()`
 * — which routes through the 2-band + envelope semantics.
 *
 * @module lib/langchain/engines/wave-e-evaluator
 */

import {
  NFREngineInterpreter,
  type DecisionRef,
  type EngineInputs,
  type EngineOutput,
  type EvaluationSignals,
} from './nfr-engine-interpreter';

// ─────────────────────────────────────────────────────────────────────────
// Contract pin (FROZEN per Wave A↔E handshake, v2.1 lines 498–504)
// ─────────────────────────────────────────────────────────────────────────

export const ENGINE_CONTRACT_VERSION = 'v1' as const;
export type EngineContractVersion = typeof ENGINE_CONTRACT_VERSION;

// LOCKED thresholds per master plan v2.1 line 445.
const AUTO_FILL_THRESHOLD = 0.9;
const REFINE_THRESHOLD = 0.6;

// ─────────────────────────────────────────────────────────────────────────
// Output shape — extends plural's EngineOutput with Wave-E fields
// ─────────────────────────────────────────────────────────────────────────

export type EngineOutputStatus = 'ready' | 'needs_user_input' | 'failed';

export interface WaveEEngineOutput extends EngineOutput {
  /** Wave A↔E handshake envelope. FROZEN at 'v1'. */
  nfr_engine_contract_version: EngineContractVersion;
  /**
   * Tri-state status:
   *   'ready'             → auto-fill carried (final_confidence ≥ 0.90)
   *   'needs_user_input'  → surface to user via system-question-bridge
   *   'failed'            → fail-closed rule fired or interpreter raised
   */
  status: EngineOutputStatus;
}

// ─────────────────────────────────────────────────────────────────────────
// LLM-refine hook
// ─────────────────────────────────────────────────────────────────────────

export interface LlmRefineArgs {
  decision: DecisionRef & { llm_assist?: boolean };
  inputs: EngineInputs;
  signals: EvaluationSignals;
  candidate: WaveEEngineOutput;
}

export type LlmRefineFn = (args: LlmRefineArgs) => Promise<WaveEEngineOutput>;

/**
 * Default LLM-refine: downgrade to `needs_user_input` without making any
 * external call. `engine-prod-swap` injects the real cheap-LLM path.
 */
const stubLlmRefine: LlmRefineFn = async ({ candidate }) => ({
  ...candidate,
  status: 'needs_user_input',
  auto_filled: false,
  needs_user_input: true,
  value: null,
  units: undefined,
  math_trace: `${candidate.math_trace} | llm-refine stub: defer to user`,
});

// ─────────────────────────────────────────────────────────────────────────
// Public evaluate
// ─────────────────────────────────────────────────────────────────────────

export interface EvaluateOptions {
  /** Inject a real LLM-refine path (default: stubLlmRefine). */
  llmRefine?: LlmRefineFn;
  /**
   * Reserved for `audit-writer` to wire `writeAuditRow()` into the hot
   * path. The wrapper is audit-agnostic in this module — auditing is
   * applied by the caller around `evaluateWaveE()` per audit-writer's
   * delivered API.
   */
  skipAudit?: boolean;
}

/**
 * Evaluate a decision through plural's NFREngineInterpreter, then apply
 * Wave-E 2-band routing + LLM-refine hook + contract envelope.
 *
 * Always returns a typed `WaveEEngineOutput`. Never throws on confidence.
 */
export async function evaluateWaveE(
  decision: DecisionRef & { llm_assist?: boolean },
  inputs: EngineInputs,
  signals: EvaluationSignals = {},
  options: EvaluateOptions = {},
): Promise<WaveEEngineOutput> {
  const llmRefine = options.llmRefine ?? stubLlmRefine;

  const interp = new NFREngineInterpreter();
  const base = interp.evaluateRule(decision, inputs, signals);

  const enriched: WaveEEngineOutput = {
    ...base,
    nfr_engine_contract_version: ENGINE_CONTRACT_VERSION,
    status: 'needs_user_input',
  };

  const c = base.final_confidence;

  if (c >= AUTO_FILL_THRESHOLD) {
    return { ...enriched, status: 'ready' };
  }

  if (c >= REFINE_THRESHOLD && decision.llm_assist === true) {
    return await llmRefine({ decision, inputs, signals, candidate: enriched });
  }

  // Surface to user — preserve plural's computed_options for the chat-bridge.
  return {
    ...enriched,
    status: 'needs_user_input',
    auto_filled: false,
    needs_user_input: true,
    value: null,
  };
}

/**
 * Object-form export for symmetry with the engine-prod-swap dispatch spec
 * naming. Internally identical to `evaluateWaveE`.
 */
export const waveEEvaluator = {
  evaluate: evaluateWaveE,
};
