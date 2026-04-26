/**
 * TypeScript shape for the per-tenant `architecture_recommendation.v1.json`
 * payload, as emitted by the synthesis pipeline (T6 wave-4 self-application
 * sample at `.planning/runs/self-application/synthesis/architecture_recommendation.v1.json`).
 *
 * This module is layout-side only — section components consume the typed
 * payload; the parent server component owns the fetch + signed-URL plumbing.
 */

export type MermaidDiagramKey =
  | 'context'
  | 'use_case'
  | 'class'
  | 'sequence'
  | 'decision_network';

export interface ParetoAlternative {
  id: string;
  name: string;
  summary: string;
  cost: { value: number | string; units: string; derivation: string; sentinel?: boolean };
  latency: { value: number | string; units: string; derivation: string; sentinel?: boolean };
  availability: { value: number | string; units: string; derivation: string; sentinel?: boolean };
  dominates: string[];
  is_recommended: boolean;
}

export interface DecisionEntry {
  id: string;
  claim: string;
  chosen_option: string;
  alternatives: { name: string; reason_rejected: string }[];
  rationale: string;
  nfr_engine_trace_id?: string | null;
  kb_chunk_ids: string[];
  prior_refs?: unknown[];
  needs_prior_sentinel?: boolean;
  missing_prior_kinds?: string[];
  final_confidence: number;
}

export interface RiskEntry {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | string;
  mitigation: string;
}

export interface ResidualFlag {
  id: string;
  predecessor_ref: string;
  failure_mode: string;
  rpn: number;
  weighted_rpn: number;
  criticality_category: string;
  open_residual_risk: string;
}

export interface DerivationChainEntry {
  decision_id: string;
  decision_network_node: string;
  nfrs_driving_choice: string[];
  kb_chunk_ids: string[];
  empirical_priors: {
    atlas_entry_id: string;
    kind: string;
    quote: string;
  }[];
  fmea_refs: string[];
}

export interface TailLatencyBudget {
  chain_id: string;
  user_facing_p95_ms: number;
  sum_per_if_p95_ms: number;
  budget_ok: boolean;
  derivation_source: string;
}

export interface HoqSummary {
  pc_count: number;
  ec_count: number;
  matrix_nonzero: number;
  matrix_total: number;
  matrix_sparsity_pct: number;
  roof_pairs_nonzero: number;
  flagged_ecs: number[];
  target_values: {
    ec_id: number;
    target: number | string;
    unit: string;
    constant_ref: string | null;
  }[];
}

export interface ArchitectureRecommendation {
  _schema: string;
  _output_path: string;
  _phase_status: string;
  metadata: {
    phase_number: number;
    phase_slug: string;
    phase_name: string;
    schema_version: string;
    project_id: number;
    project_name: string;
    author: string;
    generated_at: string;
    generator: string;
    revision: number;
  };
  _upstream_refs: string[];
  top_level_architecture: {
    summary: string;
    cited_priors: unknown[];
  };
  mermaid_diagrams: Record<MermaidDiagramKey, string>;
  pareto_frontier: ParetoAlternative[];
  decisions: DecisionEntry[];
  risks: RiskEntry[];
  derivation_chain: DerivationChainEntry[];
  tail_latency_budgets: TailLatencyBudget[];
  residual_risk: {
    threshold: number;
    flag_count: number;
    flags: ResidualFlag[];
  };
  hoq: HoqSummary;
  next_steps: string[];
  inputs_hash: string;
  model_version: string;
  synthesized_at: string;
}
