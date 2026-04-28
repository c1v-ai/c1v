/**
 * Type contract for the "why this value?" provenance UI.
 *
 * `ExplainDecisionResponse` mirrors the shape `kb-rewrite`'s `explain_decision`
 * LangGraph node will return when wired live. Until then, callers may construct
 * one from a `decision_audit` row + the `(project_id, target_field)` stream
 * (prior rows = override history).
 *
 * Append-row override pattern:
 *   The `decision_audit` table is APPEND-ONLY (REVOKE UPDATE). Manual user
 *   overrides INSERT a new row with `agent_id='user'`, `auto_filled=false`,
 *   the new value, and a `hash_chain_prev` pointing at the prior row in the
 *   same `(project_id, target_field)` stream. The override-history table in
 *   the side-panel is therefore a chronological scan of all rows in that
 *   stream — not a JSONB array on a single row.
 *
 * @module components/synthesis/why-this-value-types
 */

export interface MatchedRuleSummary {
  /** Rule id from engine.json that fired (`null` on fallback path). */
  rule_id: string | null;
  /** Plain-language summary of what the rule does. */
  summary: string;
  /** Story id (e.g. `story-03-latency-budget`). */
  story_id: string;
  /** Engine.json version that produced this decision. */
  engine_version: string;
}

export interface MathTraceSummary {
  /** Human-readable derivation string from EngineOutput.math_trace. */
  trace: string;
  /** Inputs the rule consumed (path → value). */
  inputs_used: Record<string, unknown>;
  /** Modifier deltas applied (id + delta + reason). */
  modifiers_applied: Array<{
    id?: string;
    modifier?: string;
    delta?: number;
    reason?: string;
  }>;
  /** Pre-modifier rule confidence. */
  base_confidence: number;
  /** Final confidence (clamped). */
  final_confidence: number;
}

export interface KbReference {
  /** UUID of the chunk (`kb_chunks.id`). */
  chunk_id: string;
  /** KB source name (e.g. `4-decision-net-crawley-on-cornell`). */
  kb_source: string;
  /** Excerpt or first ~200 chars of the matched chunk. */
  excerpt: string;
  /** Optional similarity score (0..1) when known. */
  score?: number;
}

export interface OverrideHistoryEntry {
  /** Audit-row id. */
  audit_id: string;
  /** ISO timestamp when the row was written. */
  evaluated_at: string;
  /** Agent that wrote the row (`user`, `agent:<name>`, `mcp:<key_id>`). */
  agent_id: string;
  /** Value at this point in the stream. */
  value: unknown;
  /** Units, if any. */
  units: string | null;
  /** Whether the row was an auto-fill (true) or a manual override (false). */
  auto_filled: boolean;
  /** Optional rationale carried in math_trace for user-override rows. */
  rationale?: string;
}

/**
 * The 5-section payload the side-panel renders.
 *
 * Producer (eventually `kb-rewrite`'s `explain_decision` node):
 *   reads the latest `decision_audit` row for `(project_id, target_field)`,
 *   resolves `kb_chunk_ids` via `searchKB` chunk lookup, and walks the prior
 *   stream rows for the override history.
 */
export interface ExplainDecisionResponse {
  /** Stable decision id (echoed). */
  decision_id: string;
  /** Field the decision wrote (echoed). */
  target_field: string;
  /** Current emitted value. */
  value: unknown;
  /** Units (`ms`, `req/s`, …). */
  units: string | null;
  /** Whether the user is allowed to manually override this value. */
  user_overrideable: boolean;
  /** 1) matched rule. */
  matched_rule: MatchedRuleSummary;
  /** 2) math trace. */
  math: MathTraceSummary;
  /** 3) KB references. */
  kb_references: KbReference[];
  /** 4) override history (chronological; oldest first). */
  override_history: OverrideHistoryEntry[];
}
