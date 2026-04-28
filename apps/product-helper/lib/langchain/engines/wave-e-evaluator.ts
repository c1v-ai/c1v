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
import {
  auditInputFromEngineOutput,
  writeAuditRow,
  type EngineOutputShape,
  type WriteAuditRowResult,
} from './audit-writer';

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

/**
 * Caller-supplied context the audit row needs but `EngineOutput` doesn't
 * carry (the interpreter doesn't know who's writing, where the answer
 * lands, or which model produced it). Passed through `auditInputFromEngineOutput`
 * to `writeAuditRow` synchronously after every evaluation when
 * `skipAudit !== true`.
 *
 * `modelVersion` defaults to `'deterministic-rule-tree'` for pure-engine
 * paths; `engine-prod-swap` overrides on llm_refine paths.
 *
 * `ragAttempted` defaults to `false`; set `true` (with `kbChunkIds` array)
 * when ContextResolver invoked RAG. CHECK constraint forbids non-empty
 * `kbChunkIds` with `ragAttempted=false`.
 */
export interface AuditContext {
  projectId: number;
  agentId: string;
  targetArtifact: string;
  storyId: string;
  engineVersion: string;
  modelVersion?: string;
  ragAttempted?: boolean;
  kbChunkIds?: string[];
  userOverrideable?: boolean;
}

export interface EvaluateOptions {
  /** Inject a real LLM-refine path (default: stubLlmRefine). */
  llmRefine?: LlmRefineFn;
  /**
   * Skip the synchronous `writeAuditRow()` call. Default `false` —
   * production callers MUST audit. Tests that don't have a DB pass `true`.
   * When `false` (or omitted), `auditContext` is REQUIRED — the wrapper
   * throws a typed error if absent.
   */
  skipAudit?: boolean;
  /**
   * Caller-supplied audit context. REQUIRED when `skipAudit !== true`.
   * The wrapper composes this with the interpreter output via
   * `auditInputFromEngineOutput()` before calling `writeAuditRow()`.
   */
  auditContext?: AuditContext;
}

/** Thrown when `evaluateWaveE` is called with audit on but no context. */
export class WaveEAuditContextRequiredError extends Error {
  constructor() {
    super(
      'evaluateWaveE: auditContext is required when skipAudit !== true. ' +
        'Pass { skipAudit: true } in tests, or supply auditContext in production.',
    );
    this.name = 'WaveEAuditContextRequiredError';
  }
}

/** Thrown when `writeAuditRow()` fails inside the hot path. The hash chain
 *  is the tamper-detection contract — degrading silently breaks it. */
export class WaveEAuditWriteError extends Error {
  readonly cause: unknown;
  constructor(cause: unknown) {
    const causeMsg =
      cause instanceof Error ? cause.message : String(cause);
    super(
      `evaluateWaveE: writeAuditRow() failed inside the evaluation hot path: ${causeMsg}. ` +
        'The hash chain is the tamper-detection contract; this is not a recoverable state.',
    );
    this.name = 'WaveEAuditWriteError';
    this.cause = cause;
  }
}

/**
 * Evaluate a decision through plural's NFREngineInterpreter, then apply
 * Wave-E 2-band routing + LLM-refine hook + contract envelope.
 *
 * Always returns a typed `WaveEEngineOutput`. Never throws on confidence.
 *
 * Audit side-effect (synchronous, in the hot path):
 *   When `options.skipAudit !== true`, after the final output is computed
 *   and BEFORE returning to the caller, the wrapper composes
 *   `auditInputFromEngineOutput()` and calls `writeAuditRow()` against the
 *   `decision_audit` table. Hash-chain compute failures throw
 *   `WaveEAuditWriteError` — the chain is the tamper-detection contract.
 */
export async function evaluateWaveE(
  decision: DecisionRef & { llm_assist?: boolean },
  inputs: EngineInputs,
  signals: EvaluationSignals = {},
  options: EvaluateOptions = {},
): Promise<WaveEEngineOutput> {
  const llmRefine = options.llmRefine ?? stubLlmRefine;
  const skipAudit = options.skipAudit === true;

  if (!skipAudit && !options.auditContext) {
    throw new WaveEAuditContextRequiredError();
  }

  const interp = new NFREngineInterpreter();
  const base = interp.evaluateRule(decision, inputs, signals);

  const enriched: WaveEEngineOutput = {
    ...base,
    nfr_engine_contract_version: ENGINE_CONTRACT_VERSION,
    status: 'needs_user_input',
  };

  const c = base.final_confidence;

  let finalOut: WaveEEngineOutput;
  if (c >= AUTO_FILL_THRESHOLD) {
    finalOut = { ...enriched, status: 'ready' };
  } else if (c >= REFINE_THRESHOLD && decision.llm_assist === true) {
    finalOut = await llmRefine({ decision, inputs, signals, candidate: enriched });
  } else {
    // Surface to user — preserve plural's computed_options for the chat-bridge.
    finalOut = {
      ...enriched,
      status: 'needs_user_input',
      auto_filled: false,
      needs_user_input: true,
      value: null,
    };
  }

  if (!skipAudit && options.auditContext) {
    await runAuditWrite(finalOut, options.auditContext);
  }

  return finalOut;
}

async function runAuditWrite(
  out: WaveEEngineOutput,
  ctx: AuditContext,
): Promise<WriteAuditRowResult> {
  try {
    // EngineOutputShape's `modifiers_applied` and `computed_options` are typed
    // as Array<Record<string, unknown>> (a structural supertype), while
    // EngineOutput uses concrete AppliedModifier[] / ComputedOption[]. The
    // shapes are runtime-equivalent — cast through unknown to satisfy TS.
    const auditInput = auditInputFromEngineOutput({
      projectId: ctx.projectId,
      agentId: ctx.agentId,
      targetArtifact: ctx.targetArtifact,
      storyId: ctx.storyId,
      engineVersion: ctx.engineVersion,
      modelVersion: ctx.modelVersion,
      ragAttempted: ctx.ragAttempted,
      kbChunkIds: ctx.kbChunkIds,
      userOverrideable: ctx.userOverrideable,
      output: out as unknown as EngineOutputShape,
    });
    return await writeAuditRow(auditInput);
  } catch (err) {
    throw new WaveEAuditWriteError(err);
  }
}

/**
 * Object-form export for symmetry with the engine-prod-swap dispatch spec
 * naming. Internally identical to `evaluateWaveE`.
 */
export const waveEEvaluator = {
  evaluate: evaluateWaveE,
};
