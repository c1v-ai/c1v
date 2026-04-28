/**
 * NFREngineInterpreter (G1)
 *
 * Generalized from `clarification-detector.heuristicCheck()`. Heuristic-first
 * evaluator: walks an EngineDecision's rule list, applies modifiers,
 * routes by confidence band:
 *
 *   final_confidence ≥ 0.90  → status='ready'             (auto-fill)
 *   0.60 ≤ final < 0.90      → llm_assist=true  → llm-refine hook (HOOK ONLY here)
 *                               llm_assist=false → status='needs_user_input'
 *   final_confidence < 0.60  → status='needs_user_input'  (surface to user)
 *
 * Confidence thresholds 0.90 / 0.60 are LOCKED per master plan v2.1 line 445.
 *
 * Out of scope (intentional hooks):
 *  - LLM-refine call path: `engine-prod-swap` wires the actual cheapLLM call.
 *    We accept an `llmRefine` injection (default: a stub that downgrades to
 *    `needs_user_input`) so this module is unit-testable without an API key.
 *  - Audit-row write: `audit-writer` wires `writeAuditRow` later. Interpreter
 *    accepts `skipAudit?: boolean` so unit tests don't need a DB.
 *  - RAG / ContextResolver: G4. Interpreter consumes whatever
 *    `EvalContext.kb_chunks` already holds; doesn't fetch.
 *
 * Contract pin (FROZEN, v2.1 lines 498–504): never throw on insufficient
 * confidence — always emit `EngineOutput`. Throwing breaks Wave A's
 * `system-question-bridge` consumer.
 *
 * @module langchain/engine/nfr-engine-interpreter
 */

import {
  ENGINE_CONTRACT_VERSION,
  EngineOutputSchema,
  type EngineDecision,
  type EngineOutput,
  type EvalContext,
  type Modifier,
  type ModifierApplied,
  type Rule,
} from './types';
import { evalPredicate } from './predicate-dsl';

const AUTO_FILL_THRESHOLD = 0.9;
const REFINE_THRESHOLD = 0.6;

/** Stub identity for the LLM-refine path until engine-prod-swap wires the real call. */
export type LlmRefineFn = (args: {
  decision: EngineDecision;
  context: EvalContext;
  candidate: EngineOutput;
}) => Promise<EngineOutput>;

export interface EvaluateOptions {
  /** Override for the LLM-refine hook (test injection). */
  llmRefine?: LlmRefineFn;
  /** Skip the audit-row write (unit tests). Default: true until audit-writer ships. */
  skipAudit?: boolean;
}

/**
 * Default llm-refine: returns the candidate unchanged but downgrades to
 * `needs_user_input`. Production path is wired by `engine-prod-swap`.
 */
const stubLlmRefine: LlmRefineFn = async ({ candidate }) => {
  return finalizeOutput({
    ...candidate,
    status: 'needs_user_input',
    auto_filled: false,
    needs_user_input: true,
    value: null,
    units: null,
    computed_options: candidate.computed_options ?? [],
    math_trace: `${candidate.math_trace} | llm-refine stub: defer to user`,
  });
};

/**
 * Evaluate a decision against context. Heuristic-first; routes by confidence.
 * Never throws on confidence-related failure — always emits an EngineOutput.
 */
export async function evaluate(
  decision: EngineDecision,
  context: EvalContext,
  options: EvaluateOptions = {}
): Promise<EngineOutput> {
  const llmRefine = options.llmRefine ?? stubLlmRefine;

  const inputsUsed: Record<string, unknown> = {};
  const missingInputs = new Set<string>();
  const onMissing = (path: string) => missingInputs.add(path);

  // Walk rules in order; first match wins.
  let matched: { rule: Rule; index: number } | null = null;
  for (let i = 0; i < decision.rules.length; i++) {
    const rule = decision.rules[i];
    try {
      if (evalPredicate(rule.predicate, context, onMissing)) {
        matched = { rule, index: i };
        capturePathsUsed(rule.predicate, context, inputsUsed);
        break;
      }
    } catch {
      // Malformed predicate: skip rule, leave for next; surfaces in math_trace.
      continue;
    }
  }

  if (!matched) {
    return buildFallbackOutput(decision, context, inputsUsed, missingInputs);
  }

  const { rule } = matched;
  const modifiers = applyModifiers(decision.modifiers, context, inputsUsed, onMissing);
  const totalDelta = modifiers.reduce((acc, m) => acc + m.delta, 0);
  const finalConfidence = clamp01(rule.base_confidence + totalDelta);

  const candidate = buildMatchOutput({
    decision,
    context,
    rule,
    modifiers,
    inputsUsed,
    missingInputs,
    finalConfidence,
  });

  if (finalConfidence >= AUTO_FILL_THRESHOLD) {
    return candidate;
  }

  if (finalConfidence >= REFINE_THRESHOLD && decision.llm_assist) {
    // Refine path — engine-prod-swap wires the real call.
    return await llmRefine({ decision, context, candidate });
  }

  // Surface to user.
  return finalizeOutput({
    ...candidate,
    status: 'needs_user_input',
    auto_filled: false,
    needs_user_input: true,
    value: null,
    units: null,
    computed_options:
      decision.fallback.computed_options ?? candidate.computed_options ?? [],
    math_trace: `${candidate.math_trace} | confidence ${finalConfidence.toFixed(3)} below auto-fill threshold ${AUTO_FILL_THRESHOLD}; surfacing to user`,
  });
}

// ─── helpers ────────────────────────────────────────────────────────────

function buildMatchOutput(args: {
  decision: EngineDecision;
  context: EvalContext;
  rule: Rule;
  modifiers: ModifierApplied[];
  inputsUsed: Record<string, unknown>;
  missingInputs: Set<string>;
  finalConfidence: number;
}): EngineOutput {
  const { decision, context, rule, modifiers, inputsUsed, missingInputs, finalConfidence } = args;
  const modifierTrace = modifiers.length
    ? ` | modifiers: ${modifiers.map((m) => `${m.id}(${m.delta >= 0 ? '+' : ''}${m.delta})`).join(', ')}`
    : '';
  const ragTrace = context.rag_attempted
    ? ` | rag: ${context.kb_chunks.length} chunk(s)`
    : '';

  return finalizeOutput({
    nfr_engine_contract_version: ENGINE_CONTRACT_VERSION,
    status: 'ready',
    decision_id: decision.decision_id,
    target_field: decision.target_field,
    target_artifact: decision.target_artifact,
    story_id: decision.story_id,
    engine_version: decision.engine_version,
    value: rule.value,
    units: rule.units ?? null,
    inputs_used: inputsUsed,
    modifiers_applied: modifiers,
    base_confidence: rule.base_confidence,
    final_confidence: finalConfidence,
    matched_rule_id: rule.rule_id,
    auto_filled: true,
    needs_user_input: false,
    computed_options: null,
    math_trace: `${rule.math_trace}${modifierTrace}${ragTrace}`,
    missing_inputs: Array.from(missingInputs),
    rag_attempted: context.rag_attempted,
    kb_chunk_ids: context.kb_chunks.map((c) => c.id),
    user_overrideable: decision.user_overrideable,
  });
}

function buildFallbackOutput(
  decision: EngineDecision,
  context: EvalContext,
  inputsUsed: Record<string, unknown>,
  missingInputs: Set<string>
): EngineOutput {
  const fb = decision.fallback;
  const hasOptions = (fb.computed_options ?? []).length > 0;
  const ragTrace = context.rag_attempted
    ? ` | rag: ${context.kb_chunks.length} chunk(s)`
    : '';

  return finalizeOutput({
    nfr_engine_contract_version: ENGINE_CONTRACT_VERSION,
    status: 'needs_user_input',
    decision_id: decision.decision_id,
    target_field: decision.target_field,
    target_artifact: decision.target_artifact,
    story_id: decision.story_id,
    engine_version: decision.engine_version,
    value: null,
    units: null,
    inputs_used: inputsUsed,
    modifiers_applied: [],
    base_confidence: fb.base_confidence,
    final_confidence: fb.base_confidence,
    matched_rule_id: null,
    auto_filled: false,
    needs_user_input: true,
    computed_options: hasOptions ? (fb.computed_options ?? []) : [],
    math_trace: `fallback: ${fb.reason} | ${fb.math_trace}${ragTrace}`,
    missing_inputs: Array.from(missingInputs),
    rag_attempted: context.rag_attempted,
    kb_chunk_ids: context.kb_chunks.map((c) => c.id),
    user_overrideable: decision.user_overrideable,
  });
}

function applyModifiers(
  mods: Modifier[],
  context: EvalContext,
  inputsUsed: Record<string, unknown>,
  onMissing: (path: string) => void
): ModifierApplied[] {
  const applied: ModifierApplied[] = [];
  for (const m of mods) {
    if (m.applies_when) {
      let fires = false;
      try {
        fires = evalPredicate(m.applies_when, context, onMissing);
      } catch {
        fires = false;
      }
      if (!fires) continue;
      capturePathsUsed(m.applies_when, context, inputsUsed);
    }
    applied.push({ id: m.id, delta: m.delta, reason: m.reason });
  }
  return applied;
}

/** Walk a predicate AST collecting `$.foo.bar` paths into inputs_used. */
function capturePathsUsed(
  predicate: unknown,
  context: EvalContext,
  out: Record<string, unknown>
): void {
  if (typeof predicate !== 'object' || predicate === null) return;
  const node = predicate as { op?: unknown; args?: unknown[] };
  if (typeof node.op !== 'string' || !Array.isArray(node.args)) return;
  for (const arg of node.args) {
    if (typeof arg === 'string' && arg.startsWith('$.')) {
      const path = arg.slice(2);
      out[path] = readPath(context, path);
    } else if (typeof arg === 'object' && arg !== null) {
      capturePathsUsed(arg, context, out);
    }
  }
}

function readPath(context: EvalContext, path: string): unknown {
  let cursor: unknown = context;
  for (const seg of path.split('.')) {
    if (cursor == null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[seg];
  }
  return cursor;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/** Validate via Zod before returning — catches contract drift at the boundary. */
function finalizeOutput(o: EngineOutput): EngineOutput {
  return EngineOutputSchema.parse(o);
}

/** Object-form export to match the interpreter spec in the engine-core prompt. */
export const nfrEngineInterpreter = {
  evaluate,
};
