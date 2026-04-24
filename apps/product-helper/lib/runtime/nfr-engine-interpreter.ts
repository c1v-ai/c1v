/**
 * G1 NFREngineInterpreter.
 *
 * Generalizes the `heuristicCheck()` pattern from clarification-detector
 * into a reusable rule-tree evaluator. Every NFR decision (latency budget,
 * throughput, availability, utility-vector dominance, FMEA RPN, etc.)
 * routes through this class. There is NO standalone DecisionNetworkEngine.
 *
 * Evaluation order:
 *   1. Walk rule tree children (first-match-wins, depth-first).
 *   2. On leaf match → base_confidence + value + units.
 *   3. applyModifiers: sum deltas whose predicate fires, clamp to [0,1].
 *   4. Threshold gate: final_confidence ≥ auto_fill_threshold → auto_filled.
 *   5. Build AuditPayload (SHA256 over inputs + output).
 *
 * The rule-tree loader (G2) is injected — the interpreter itself is
 * transport-agnostic. Pass a `loadRuleTree` function to the constructor
 * or call `evaluateWithTree(decision, context, tree)` directly.
 *
 * @module lib/runtime/nfr-engine-interpreter
 */

import { createHash } from 'crypto';
import { evaluatePredicate, type DSLContext } from './predicate-dsl';
import type {
  AuditPayload,
  DecisionRef,
  EngineOutput,
  EvaluationContext,
  Modifier,
  RuleNode,
} from './types';

const MODEL_VERSION = 'nfr-engine-interpreter@1';
const NO_MATCH_RULE_ID = '__no_match__';

export interface RuleTreeLoader {
  (rule_file: string): RuleNode;
}

export class NFREngineInterpreter {
  private readonly loadRuleTree: RuleTreeLoader | undefined;

  constructor(loadRuleTree?: RuleTreeLoader) {
    this.loadRuleTree = loadRuleTree;
  }

  /**
   * Evaluate a decision against its rule tree. Loads the tree via the
   * injected loader and calls {@link evaluateWithTree}.
   */
  evaluate(decision: DecisionRef, context: EvaluationContext): EngineOutput {
    if (!this.loadRuleTree) {
      throw new Error('NFREngineInterpreter: no rule-tree loader configured');
    }
    const tree = this.loadRuleTree(decision.rule_file);
    return this.evaluateWithTree(decision, context, tree);
  }

  /**
   * Evaluate against an already-loaded tree (primary path for tests and
   * callers who resolve engine.json themselves).
   */
  evaluateWithTree(
    decision: DecisionRef,
    context: EvaluationContext,
    tree: RuleNode
  ): EngineOutput {
    const dslContext: DSLContext = {
      inputs: { ...context.typedInputs, ...decision.inputs },
    };

    const matched = this.walk(tree, dslContext, []);

    if (!matched) {
      const baseOutput: EngineOutput = {
        matched_rule_id: NO_MATCH_RULE_ID,
        base_confidence: 0,
        final_confidence: 0,
        auto_filled: false,
        needs_user_input: true,
        computed_options: [],
        math_trace: 'no rule matched',
        kb_chunk_ids: context.ragChunks.map((c) => c.id),
      };
      return baseOutput;
    }

    const { rule, trace } = matched;
    const baseConfidence = rule.base_confidence ?? 0;
    const base: EngineOutput = {
      matched_rule_id: rule.id,
      base_confidence: baseConfidence,
      final_confidence: baseConfidence,
      value: rule.value,
      units: rule.units,
      auto_filled: false,
      needs_user_input: false,
      math_trace: trace.concat(rule.math_trace ?? `match:${rule.id}`).join(' → '),
      kb_chunk_ids: [
        ...context.ragChunks.map((c) => c.id),
        ...(rule.kb_chunk_ids ?? []),
      ],
    };

    const modified = this.applyModifiers(base, rule.modifiers ?? [], dslContext);

    if (modified.final_confidence >= decision.auto_fill_threshold) {
      modified.auto_filled = true;
      modified.needs_user_input = false;
    } else {
      modified.auto_filled = false;
      modified.needs_user_input = true;
      if (!modified.computed_options) modified.computed_options = [];
    }

    return modified;
  }

  /**
   * Apply modifiers whose predicate matches (or unconditional modifiers).
   * Clamps final_confidence to [0, 1] after summation.
   */
  applyModifiers(
    base: EngineOutput,
    modifiers: Modifier[],
    dslContext?: DSLContext
  ): EngineOutput {
    let final = base.final_confidence;
    const traceParts: string[] = [];
    for (const m of modifiers) {
      let fires = true;
      if (m.predicate) {
        if (!dslContext) {
          throw new Error('applyModifiers: predicate requires DSLContext');
        }
        fires = evaluatePredicate(m.predicate, dslContext).matched;
      }
      if (fires) {
        final += m.delta;
        traceParts.push(`${m.id}(${m.delta >= 0 ? '+' : ''}${m.delta}) [${m.reason}]`);
      }
    }
    if (final < 0) final = 0;
    if (final > 1) final = 1;
    const mergedTrace = base.math_trace
      ? traceParts.length
        ? `${base.math_trace} | mods: ${traceParts.join(', ')}`
        : base.math_trace
      : traceParts.join(', ') || undefined;
    return {
      ...base,
      final_confidence: final,
      math_trace: mergedTrace,
    };
  }

  /**
   * Depth-first walk. A node "matches" when its predicate fires (or it has
   * none) AND either it has a concrete `value`/`base_confidence` or a child
   * downstream matches. First match wins.
   */
  private walk(
    node: RuleNode,
    dslContext: DSLContext,
    traceAcc: string[]
  ): { rule: RuleNode; trace: string[] } | null {
    let localTrace = traceAcc;
    if (node.predicate) {
      const r = evaluatePredicate(node.predicate, dslContext);
      if (!r.matched) return null;
      localTrace = [...traceAcc, `${node.id}:${r.trace}`];
    } else {
      localTrace = [...traceAcc, `${node.id}:default`];
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const hit = this.walk(child, dslContext, localTrace);
        if (hit) return hit;
      }
      // Children exist but none matched: fall through to this node only
      // if it carries its own concrete value.
      if (node.value === undefined && node.base_confidence === undefined) {
        return null;
      }
    }

    if (node.value === undefined && node.base_confidence === undefined) {
      return null;
    }
    return { rule: node, trace: localTrace };
  }
}

/**
 * Build the AuditPayload for a single evaluation. The DB write itself is
 * audit-db's responsibility (G5); this helper owns the payload shape so
 * every evaluator emits the same schema.
 *
 * `hash_chain_prev` is passed in by the caller — audit-db looks up the
 * previous row for this decision_id and threads it through.
 */
export function buildAuditPayload(
  decision: DecisionRef,
  context: EvaluationContext,
  output: EngineOutput,
  hash_chain_prev: string | null = null
): AuditPayload {
  const inputsBlob = stableStringify({
    decision_id: decision.id,
    rule_file: decision.rule_file,
    target_field: decision.target_field,
    inputs: decision.inputs,
    typedInputs: context.typedInputs,
    chatSummary: context.chatSummary ?? null,
  });
  const outputBlob = stableStringify({
    matched_rule_id: output.matched_rule_id,
    base_confidence: output.base_confidence,
    final_confidence: output.final_confidence,
    value: output.value ?? null,
    units: output.units ?? null,
    auto_filled: output.auto_filled,
    needs_user_input: output.needs_user_input,
  });
  return {
    model_version: MODEL_VERSION,
    kb_chunk_ids: output.kb_chunk_ids,
    inputs_hash: sha256(inputsBlob),
    output_hash: sha256(outputBlob),
    hash_chain_prev,
  };
}

function sha256(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

/**
 * Deterministic JSON.stringify — keys sorted at every depth so the same
 * object always hashes to the same digest regardless of insertion order.
 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(',')}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`
  );
  return `{${parts.join(',')}}`;
}
