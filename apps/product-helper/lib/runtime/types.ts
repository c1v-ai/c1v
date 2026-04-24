/**
 * Shared types for the NFR runtime module.
 *
 * Contract source: plans/kb-runtime-architecture.md §2.4 + §3.
 * All Crawley math (utility vectors, Pareto dominance, sensitivity) expresses
 * as NFREngineInterpreter rules — no standalone DecisionNetworkEngine exists.
 *
 * @module lib/runtime/types
 */

/**
 * Reference to a single decision the interpreter must resolve.
 *
 * `rule_file` is a relative path to an engine.json that defines the rule tree.
 * `target_field` is the artifact path the computed value writes back into
 * (e.g. `constants[i].value`). `auto_fill_threshold` controls the cutoff
 * between auto_filled=true and needs_user_input=true.
 */
export interface DecisionRef {
  id: string;
  rule_file: string;
  target_field: string;
  inputs: Record<string, unknown>;
  llm_assist: boolean;
  auto_fill_threshold: number;
}

/**
 * A retrieved KB chunk (pgvector hit or markdown section).
 * Emitted by the resolver's ContextResolver (G4), consumed by rules
 * that inspect text content (e.g. `_contains`).
 */
export interface KBChunk {
  id: string;
  kb_folder: string;
  heading: string;
  content: string;
  source_hash: string;
}

/**
 * Everything the interpreter needs to evaluate a decision.
 * Typed inputs are produced by `rewriteQuery`; ragChunks fill gaps.
 */
export interface EvaluationContext {
  typedInputs: Record<string, unknown>;
  ragChunks: KBChunk[];
  chatSummary?: string;
}

/**
 * The interpreter's verdict for a single decision.
 *
 * - `auto_filled` and `needs_user_input` are mutually exclusive on the
 *   happy path: `final_confidence >= auto_fill_threshold` → auto_filled.
 * - `computed_options` is populated when surfacing a gap to the user.
 * - `math_trace` is a human-readable chain of the rule-match reasoning.
 * - `kb_chunk_ids` records every chunk that influenced the output
 *   (feeds the audit payload).
 */
export interface EngineOutput {
  matched_rule_id: string;
  base_confidence: number;
  final_confidence: number;
  value?: unknown;
  units?: string;
  auto_filled: boolean;
  needs_user_input: boolean;
  computed_options?: unknown[];
  math_trace?: string;
  kb_chunk_ids: string[];
}

/**
 * Payload emitted on every evaluation; written by audit-db's G5 writer.
 * `hash_chain_prev` is the previous row's `output_hash` to form a tamper-
 * evident chain (null on the first row for a given decision_id).
 */
export interface AuditPayload {
  model_version: string;
  kb_chunk_ids: string[];
  inputs_hash: string;
  output_hash: string;
  hash_chain_prev: string | null;
}

/**
 * Rule tree node shape. Matches the format in engine.json files
 * authored in Phase β of the parent plan.
 *
 * A rule node carries its own predicate (checked by predicate-dsl),
 * an optional concrete value emitted on match, optional child rules
 * (first-match-wins), and an optional base_confidence + modifiers list.
 *
 * Predicates are plain JSON objects keyed by operator (`_lt`, `_in`,
 * `_dominates`, …) — the DSL walks them recursively. Rule source is
 * always treated as data.
 */
export interface RuleNode {
  id: string;
  predicate?: Record<string, unknown>;
  value?: unknown;
  units?: string;
  base_confidence?: number;
  modifiers?: Modifier[];
  children?: RuleNode[];
  math_trace?: string;
  kb_chunk_ids?: string[];
}

/**
 * A confidence modifier applied after a rule matches (e.g. cross-story
 * agreement bonus, fresh-KB penalty). `delta` is signed; the interpreter
 * clamps final_confidence into [0, 1] after summation.
 */
export interface Modifier {
  id: string;
  reason: string;
  delta: number;
  predicate?: Record<string, unknown>;
}

/**
 * Output of evaluating a single predicate subtree.
 * `trace` explains which branch fired, for math_trace assembly.
 */
export interface PredicateResult {
  matched: boolean;
  confidence: number;
  trace: string;
}
