/**
 * NFR Engine Interpreter — deterministic rule-tree evaluator.
 *
 * Pure arithmetic + predicate matching — zero LLM calls in the hot path.
 * Generalised from the heuristic-first confidence-scored pattern proven in
 * `apps/product-helper/lib/langchain/agents/intake/clarification-detector.ts`.
 *
 * Inputs:
 *   - `DecisionRef`  — the engine.json `decisions[i]` entry.
 *   - `EngineInputs` — typed name → value map resolved upstream
 *                      (M1 scope, M2 UCBD, M4 decision matrix, etc).
 *
 * Output (see `EngineOutput` type):
 *   - `value`, `units`
 *   - `base_confidence`, `final_confidence` (clamped to [0,1])
 *   - `matched_rule_id` or `'default'` or `null` when no rule matched
 *   - `inputs_used` (snapshot), `modifiers_applied` (array of deltas)
 *   - `auto_filled` (≥ auto_fill_threshold) or `needs_user_input` (+ computed_options)
 *   - `math_trace` (human-readable breakdown) — surfaced in the "why this value?" UI
 *
 * Audit-row emission: the interpreter returns the shape; the
 * `audit-db` team (Drizzle writer) owns the insert.
 *
 * @module lib/langchain/engines/nfr-engine-interpreter
 */

import { evaluatePredicate, type Predicate, type PredicateContext } from './predicate-dsl';

// ──────────────────────────────────────────────────────────────────────────
// engine.json types.
// ──────────────────────────────────────────────────────────────────────────

export interface EngineInputSpec {
  name: string;
  source: string;
}

export interface EngineRuleMatch {
  if: Predicate;
  value: number | string;
  units?: string;
  base_confidence: number;
  rule_id?: string;
}

export interface EngineRuleDefault {
  default: {
    value: number | string;
    units?: string;
    base_confidence: number;
    rule_id?: string;
  };
}

export type EngineRule = EngineRuleMatch | EngineRuleDefault;

export interface EngineDecisionFunction {
  type: 'decision_tree';
  rules: EngineRule[];
}

export interface ConfidenceModifier {
  when: string;
  delta: number;
  cap?: number;
}

export interface DecisionRef {
  decision_id: string;
  target_field: string;
  inputs: EngineInputSpec[];
  function: EngineDecisionFunction;
  confidence_modifiers?: ConfidenceModifier[];
  auto_fill_threshold?: number;
  fallback?: {
    action: 'surface_to_user';
    question_id: string;
  };
}

export interface EngineDoc {
  story_id: string;
  version: string;
  decisions: DecisionRef[];
}

// ──────────────────────────────────────────────────────────────────────────
// Interpreter I/O types.
// ──────────────────────────────────────────────────────────────────────────

export type EngineInputs = Record<string, unknown>;

/** Optional signals the caller may supply to activate standard modifiers. */
export interface EvaluationSignals {
  /** True if the user has directly answered a question that targets this field. */
  user_explicit?: boolean;
  /** True if an upstream approved artifact captured this value verbatim. */
  upstream_explicit?: boolean;
  /** True if any regulatory_refs entry forces a tighter value. */
  regulatory_override?: boolean;
  /** True if a sibling story arrives at the same value independently. */
  cross_story_agreement?: boolean;
  /** True if an upstream approved field contradicts this rule. */
  upstream_contradicts_rule?: boolean;
  /** True if any input constant is marked estimate_final: Estimate. */
  any_input_is_estimate?: boolean;
  /** Names of inputs that were declared but not resolvable upstream. */
  missing_inputs?: string[];
  /** Caller-supplied custom signals keyed by modifier `when` string. */
  custom?: Record<string, boolean>;
}

export interface AppliedModifier {
  modifier: string;
  delta: number;
  reason?: string;
}

export interface ComputedOption {
  value: number | string;
  units?: string;
  confidence: number;
  rationale: string;
}

export interface EngineOutput {
  decision_id: string;
  target_field: string;
  value: number | string | null;
  units?: string;
  base_confidence: number;
  matched_rule_id: string | null;
  inputs_used: Record<string, unknown>;
  modifiers_applied: AppliedModifier[];
  final_confidence: number;
  auto_filled: boolean;
  needs_user_input: boolean;
  /** Top-3 rule matches with their confidences; populated when below threshold. */
  computed_options?: ComputedOption[];
  /** Human-readable breakdown suitable for "why this value?" UI. */
  math_trace: string;
  /** Input names declared in engine.json but unresolvable in EngineInputs. */
  missing_inputs: string[];
}

// ──────────────────────────────────────────────────────────────────────────
// Defaults.
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_AUTO_FILL_THRESHOLD = 0.9;
const MAX_COMPUTED_OPTIONS = 3;

// Standard modifier registry — the `when` strings recognised without custom hooks.
// Keeping the table explicit so tests can assert exact deltas.
const STANDARD_MODIFIER_SIGNALS: Record<string, keyof EvaluationSignals> = {
  user_explicit: 'user_explicit',
  user_explicitly_stated_value_exists: 'user_explicit',
  upstream_explicit: 'upstream_explicit',
  regulatory_override: 'regulatory_override',
  cross_story_agreement: 'cross_story_agreement',
  upstream_contradicts_rule: 'upstream_contradicts_rule',
  any_input_is_estimate: 'any_input_is_estimate',
  any_input_is_Estimate: 'any_input_is_estimate',
};

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function isDefaultRule(r: EngineRule): r is EngineRuleDefault {
  return Object.prototype.hasOwnProperty.call(r, 'default');
}

function ruleId(r: EngineRule, index: number): string {
  if (isDefaultRule(r)) return r.default.rule_id ?? 'default';
  return r.rule_id ?? `rule_${index}`;
}

// ──────────────────────────────────────────────────────────────────────────
// Interpreter.
// ──────────────────────────────────────────────────────────────────────────

export class NFREngineInterpreter {
  /**
   * Evaluate one decision against a resolved input set.
   *
   * Semantics:
   *   1. Missing-input detection.
   *   2. First matching non-default rule wins → `{value, base_confidence, matched_rule_id}`.
   *   3. If no rule matches, fall back to `default` (if present).
   *   4. Apply modifiers (standard registry + custom signals).
   *   5. Clamp to [0,1] with per-modifier `cap` honoured on the positive side.
   *   6. Above auto_fill_threshold → `auto_filled: true`.
   *      Else → `needs_user_input: true` + computed_options (top-3).
   */
  evaluateRule(
    decision: DecisionRef,
    inputs: EngineInputs,
    signals: EvaluationSignals = {},
  ): EngineOutput {
    const threshold = decision.auto_fill_threshold ?? DEFAULT_AUTO_FILL_THRESHOLD;
    const predicateCtx = this.buildPredicateContext(inputs);
    const inputsUsed = this.snapshotInputs(decision, inputs);
    const missingInputs = this.findMissingInputs(decision, inputs);

    // 1. First-match sweep.
    const match = this.findFirstMatchingRule(decision.function.rules, predicateCtx);

    // 2. If no rule matched at all, produce a "no match" needs-input result.
    if (!match) {
      return this.buildNoMatchOutput(decision, inputsUsed, missingInputs, predicateCtx);
    }

    // 3. Pull base confidence + value from the winning rule.
    const { rule, index, isDefault } = match;
    const { value, units, base_confidence } = isDefaultRule(rule)
      ? rule.default
      : rule;
    const matchedRuleId = ruleId(rule, index);

    // 4. Apply modifiers (including the implicit `rule_default_branch: -0.10`
    // baked into the standard modifier set when the default matched and the
    // engine didn't declare its own modifier for that condition).
    const modifiers = this.applyModifiers(
      decision.confidence_modifiers ?? [],
      signals,
      { isDefault, missingInputsCount: missingInputs.length },
    );
    const deltaSum = modifiers.reduce((acc, m) => acc + m.delta, 0);
    const finalConfidence = clamp01(base_confidence + deltaSum);

    // 5. Route by threshold.
    const autoFilled = finalConfidence >= threshold;
    const needsUserInput = !autoFilled;

    const mathTrace = this.buildMathTrace({
      base_confidence,
      modifiers,
      finalConfidence,
      threshold,
      matchedRuleId,
      isDefault,
    });

    const output: EngineOutput = {
      decision_id: decision.decision_id,
      target_field: decision.target_field,
      value,
      units,
      base_confidence,
      matched_rule_id: matchedRuleId,
      inputs_used: inputsUsed,
      modifiers_applied: modifiers,
      final_confidence: finalConfidence,
      auto_filled: autoFilled,
      needs_user_input: needsUserInput,
      math_trace: mathTrace,
      missing_inputs: missingInputs,
    };

    if (needsUserInput) {
      output.computed_options = this.computeTopOptions(decision, predicateCtx, signals);
    }

    return output;
  }

  // ──────────────────────────────────────────────────────────────────────
  // Internals.
  // ──────────────────────────────────────────────────────────────────────

  private buildPredicateContext(inputs: EngineInputs): PredicateContext {
    // Engine rules address inputs by their declared `name` (e.g., `user_type`),
    // so we pass the inputs map straight through. Callers may nest objects
    // — the predicate DSL supports dotted paths.
    return inputs as PredicateContext;
  }

  private snapshotInputs(decision: DecisionRef, inputs: EngineInputs): Record<string, unknown> {
    const snapshot: Record<string, unknown> = {};
    for (const spec of decision.inputs) {
      snapshot[spec.name] = {
        value: inputs[spec.name] ?? null,
        source: spec.source,
      };
    }
    return snapshot;
  }

  private findMissingInputs(decision: DecisionRef, inputs: EngineInputs): string[] {
    const missing: string[] = [];
    for (const spec of decision.inputs) {
      const v = inputs[spec.name];
      if (v === undefined || v === null) missing.push(spec.name);
    }
    return missing;
  }

  private findFirstMatchingRule(
    rules: EngineRule[],
    ctx: PredicateContext,
  ): { rule: EngineRule; index: number; isDefault: boolean } | null {
    // Non-default rules first (engine.json order is authoritative).
    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      if (isDefaultRule(r)) continue;
      if (evaluatePredicate(r.if, ctx)) {
        return { rule: r, index: i, isDefault: false };
      }
    }
    // Default fallback if declared.
    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      if (isDefaultRule(r)) return { rule: r, index: i, isDefault: true };
    }
    return null;
  }

  private applyModifiers(
    registry: ConfidenceModifier[],
    signals: EvaluationSignals,
    context: { isDefault: boolean; missingInputsCount: number },
  ): AppliedModifier[] {
    const applied: AppliedModifier[] = [];
    for (const mod of registry) {
      if (!this.modifierFires(mod.when, signals, context)) continue;
      let delta = mod.delta;
      if (mod.cap !== undefined && delta > 0) {
        delta = Math.min(delta, mod.cap);
      }
      applied.push({
        modifier: mod.when,
        delta,
        reason: this.modifierReason(mod.when, context),
      });
    }
    return applied;
  }

  private modifierFires(
    when: string,
    signals: EvaluationSignals,
    context: { isDefault: boolean; missingInputsCount: number },
  ): boolean {
    // Structural conditions — derived from interpreter state, not caller signals.
    if (when === 'rule_default_branch') return context.isDefault;
    if (when === 'input_missing') return context.missingInputsCount > 0;

    // Standard caller signals.
    const standardKey = STANDARD_MODIFIER_SIGNALS[when];
    if (standardKey !== undefined) {
      return Boolean(signals[standardKey]);
    }

    // Custom signals keyed by the exact `when` string.
    return Boolean(signals.custom?.[when]);
  }

  private modifierReason(
    when: string,
    context: { isDefault: boolean; missingInputsCount: number },
  ): string | undefined {
    if (when === 'rule_default_branch' && context.isDefault) {
      return 'No specific rule matched; default branch fired.';
    }
    if (when === 'input_missing' && context.missingInputsCount > 0) {
      return `${context.missingInputsCount} required input(s) not found upstream.`;
    }
    return undefined;
  }

  private buildMathTrace(args: {
    base_confidence: number;
    modifiers: AppliedModifier[];
    finalConfidence: number;
    threshold: number;
    matchedRuleId: string;
    isDefault: boolean;
  }): string {
    const parts: string[] = [];
    parts.push(
      `Base ${args.base_confidence.toFixed(2)} (${args.matchedRuleId}${args.isDefault ? ' — default branch' : ''})`,
    );
    for (const m of args.modifiers) {
      const sign = m.delta >= 0 ? '+' : '';
      parts.push(`${sign}${m.delta.toFixed(2)} (${m.modifier})`);
    }
    const cmp = args.finalConfidence >= args.threshold ? '≥' : '<';
    parts.push(
      `= ${args.finalConfidence.toFixed(2)} ${cmp} ${args.threshold.toFixed(2)} threshold`,
    );
    return parts.join(' ');
  }

  private computeTopOptions(
    decision: DecisionRef,
    ctx: PredicateContext,
    signals: EvaluationSignals,
  ): ComputedOption[] {
    // Score every non-default rule as if it were the match, apply modifiers,
    // take top-N. Rules whose predicates don't fire get their base confidence
    // with a −0.30 penalty (same shape as `upstream_contradicts_rule`).
    const scored: ComputedOption[] = [];
    const rules = decision.function.rules;

    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      const isDefault = isDefaultRule(r);
      const base = isDefault ? r.default.base_confidence : r.base_confidence;
      const matched = isDefault || evaluatePredicate(r.if, ctx);
      const penalty = matched ? 0 : -0.3;
      const mods = this.applyModifiers(
        decision.confidence_modifiers ?? [],
        signals,
        { isDefault, missingInputsCount: 0 },
      );
      const deltaSum = mods.reduce((a, m) => a + m.delta, 0);
      const confidence = clamp01(base + deltaSum + penalty);
      const value = isDefault ? r.default.value : r.value;
      const units = isDefault ? r.default.units : r.units;
      const rationale = isDefault
        ? 'Default branch (no specific rule matched).'
        : `Rule ${ruleId(r, i)}${matched ? '' : ' (conditions not met)'}.`;

      scored.push({ value, units, confidence, rationale });
    }

    return scored
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, MAX_COMPUTED_OPTIONS);
  }

  private buildNoMatchOutput(
    decision: DecisionRef,
    inputsUsed: Record<string, unknown>,
    missingInputs: string[],
    ctx: PredicateContext,
  ): EngineOutput {
    const computed = this.computeTopOptions(decision, ctx, {});
    const mathTrace =
      missingInputs.length > 0
        ? `No rule matched — ${missingInputs.length} input(s) missing: ${missingInputs.join(', ')}.`
        : 'No rule matched and no default branch declared.';

    return {
      decision_id: decision.decision_id,
      target_field: decision.target_field,
      value: null,
      units: undefined,
      base_confidence: 0,
      matched_rule_id: null,
      inputs_used: inputsUsed,
      modifiers_applied: [],
      final_confidence: 0,
      auto_filled: false,
      needs_user_input: true,
      computed_options: computed,
      math_trace: mathTrace,
      missing_inputs: missingInputs,
    };
  }
}
