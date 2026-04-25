/**
 * synthesis-agent — T6 Wave-4 capstone orchestrator.
 *
 * Assembles the `architecture_recommendation.v1.json` artifact by folding
 * the 11 upstream module artifacts (M1 scope/context/data_flows, M2 nfrs +
 * constants, M3 ffbd, M4 decision_network, M5 form_function_map, M6 hoq,
 * M7 n2_matrix + interface_specs, M8 fmea_early + fmea_residual) into a
 * single schema-validated bundle.
 *
 * Guardrails enforced (see architecture-recommendation.ts superRefine):
 *   1. derivation_chain[] — every top-level decision cites DN node + NFRs +
 *      kb_chunk_ids + atlas empirical_priors + FMEA refs.
 *   2. pareto_frontier.length >= 3 (alternative-summary).
 *   3. tail_latency_budgets[] reconciled against interface_specs.chain_budgets.
 *   4. residual_risk embeds verbatim flags[] from fmea_residual with
 *      predecessor_ref preserved.
 *   5. hoq summary embeds target-values + matrix stats + flagged ECs.
 *
 * @module lib/langchain/agents/system-design/synthesis-agent
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import {
  architectureRecommendationSchema,
  type ArchitectureRecommendation,
} from '../../schemas/synthesis';

// ─────────────────────────────────────────────────────────────────────────
// Upstream-artifact path registry
// ─────────────────────────────────────────────────────────────────────────

export interface UpstreamPaths {
  scope_tree: string;
  context_diagram: string;
  data_flows: string;
  nfrs: string;
  constants: string;
  ffbd: string;
  decision_network: string;
  form_function_map: string;
  n2_matrix: string;
  interface_specs: string;
  fmea_early: string;
  fmea_residual: string;
  hoq: string;
}

/**
 * The 13 canonical upstream paths relative to repo root. 11 hard-deps
 * plus scope_tree + context_diagram (M1 context artifacts). Matches spec
 * Upstream list verbatim; hoq ships to .planning/, the rest to
 * system-design/kb-upgrade-v2/.
 */
export const DEFAULT_UPSTREAM_PATHS: UpstreamPaths = {
  scope_tree: 'system-design/kb-upgrade-v2/module-1-defining-scope/scope_tree.json',
  context_diagram: 'system-design/kb-upgrade-v2/module-1-defining-scope/context_diagram.json',
  data_flows: 'system-design/kb-upgrade-v2/module-1-defining-scope/data_flows.v1.json',
  nfrs: 'system-design/kb-upgrade-v2/module-2-requirements/nfrs.v2.json',
  constants: 'system-design/kb-upgrade-v2/module-2-requirements/constants.v2.json',
  ffbd: 'system-design/kb-upgrade-v2/module-3-ffbd/ffbd.v1.json',
  decision_network:
    'system-design/kb-upgrade-v2/module-4-decision-matrix/decision_network.v1.json',
  form_function_map:
    'system-design/kb-upgrade-v2/module-5-formfunction/form_function_map.v1.json',
  n2_matrix: 'system-design/kb-upgrade-v2/module-7-interfaces/n2_matrix.v1.json',
  interface_specs: 'system-design/kb-upgrade-v2/module-7-interfaces/interface_specs.v1.json',
  fmea_early: 'system-design/kb-upgrade-v2/module-8-risk/fmea_early.v1.json',
  fmea_residual: 'system-design/kb-upgrade-v2/module-8-risk/fmea_residual.v1.json',
  hoq: '.planning/runs/self-application/module-6/hoq.v1.json',
};

export const UPSTREAM_REF_ORDER: readonly (keyof UpstreamPaths)[] = [
  'scope_tree',
  'context_diagram',
  'data_flows',
  'nfrs',
  'constants',
  'ffbd',
  'decision_network',
  'form_function_map',
  'n2_matrix',
  'interface_specs',
  'fmea_early',
  'fmea_residual',
  'hoq',
] as const;

// ─────────────────────────────────────────────────────────────────────────
// Upstream shape helpers (typed just enough to extract what we need).
// ─────────────────────────────────────────────────────────────────────────

interface DecisionAlternative {
  id: string;
  name: string;
  description?: string;
}
interface DecisionNode {
  id: string;
  title: string;
  question?: string;
  alternatives: DecisionAlternative[];
  scores: Array<{
    alternative_id: string;
    criterion_id: string;
    empirical_priors?: {
      source: string;
      atlas_entry_id?: string;
      kind?: string;
      citation?: string;
      rationale?: string;
      sample_size?: number;
      provisional?: boolean;
    };
  }>;
}
interface DecisionNetworkArtifact {
  _schema: string;
  selected_architecture_id: string;
  phases: {
    phase_14_decision_nodes: { decision_nodes: DecisionNode[] };
    phase_16_pareto_frontier: {
      architecture_vectors: Array<{ id: string; choices: Array<{ decision_node_id: string; alternative_id: string }> }>;
      frontier_ids?: string[];
      dominance_edges?: Array<{ dominator: string; dominated: string }>;
    };
  };
}

interface NfrEntry {
  req_id: string;
  text: string;
  requirement_class: string;
  derived_from?: { type: string; ref?: string };
  rationale?: string;
}
interface NfrArtifact {
  nfrs: NfrEntry[];
}

interface InterfaceSpec {
  interface_id: string;
  producer: string;
  consumer: string;
  payload_name: string;
  sla: {
    p95_latency_ms: number;
    derivation_sources?: Array<{ kind: string; nfr_id?: string; fmea_row_id?: string }>;
  };
}
interface ChainBudget {
  chain_id: string;
  hops: string[];
  sum_p95_latency_ms: number;
  user_facing_nfr_p95_ms: number;
  budget_ok: boolean;
}
interface InterfaceSpecsArtifact {
  interfaces: InterfaceSpec[];
  chain_budgets: ChainBudget[];
}

interface FmeaResidualFlag {
  id: string;
  predecessor_ref: string;
  failure_mode: string;
  rpn: number;
  weighted_rpn: number;
  criticality_category: string;
  open_residual_risk: string;
  flagged_high_rpn: boolean;
}
interface FmeaResidualArtifact {
  high_rpn_flag_threshold: number;
  failure_modes: FmeaResidualFlag[];
  summary?: { flagged_high_rpn?: number };
}

interface HoqArtifact {
  customer_requirements: { rows: Array<{ pc_id: string }> };
  engineering_characteristics: { rows: Array<{ ec_id: number }> };
  relationship_matrix: {
    rows: unknown[];
    flagged_ec_no_pc?: Array<{ ec_id: number }>;
    stats: { nonzero_cells: number; total_cells: number; sparsity_pct: number };
  };
  roof_correlations: { stats: { nonzero_pairs: number } };
  target_values: {
    rows: Array<{
      ec_id: number;
      target: number | string;
      unit: string;
      constant_ref: string | null;
    }>;
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Agent input/output
// ─────────────────────────────────────────────────────────────────────────

export interface SynthesisAgentInput {
  paths?: Partial<UpstreamPaths>;
  repoRoot: string;
  projectId: number;
  projectName: string;
  systemName: string;
  outputPath: string;
  modelVersion?: string;
  synthesizedAt?: string;
}

export interface LoadedUpstream {
  paths: UpstreamPaths;
  decisionNetwork: DecisionNetworkArtifact;
  nfrs: NfrArtifact;
  interfaceSpecs: InterfaceSpecsArtifact;
  fmeaResidual: FmeaResidualArtifact;
  hoq: HoqArtifact;
  rawBytes: Record<string, string>;
}

export function loadUpstream(
  repoRoot: string,
  overrides: Partial<UpstreamPaths> = {},
): LoadedUpstream {
  const paths: UpstreamPaths = { ...DEFAULT_UPSTREAM_PATHS, ...overrides };
  const rawBytes: Record<string, string> = {};
  const resolve = (rel: string) => `${repoRoot}/${rel}`;
  for (const k of Object.keys(paths) as (keyof UpstreamPaths)[]) {
    rawBytes[k] = readFileSync(resolve(paths[k]), 'utf8');
  }
  return {
    paths,
    decisionNetwork: JSON.parse(rawBytes.decision_network) as DecisionNetworkArtifact,
    nfrs: JSON.parse(rawBytes.nfrs) as NfrArtifact,
    interfaceSpecs: JSON.parse(rawBytes.interface_specs) as InterfaceSpecsArtifact,
    fmeaResidual: JSON.parse(rawBytes.fmea_residual) as FmeaResidualArtifact,
    hoq: JSON.parse(rawBytes.hoq) as HoqArtifact,
    rawBytes,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Pure builders
// ─────────────────────────────────────────────────────────────────────────

/**
 * Parse the "AV.01" winner vector into {DN.NN -> alternative_id} lookup.
 */
export function winnerChoicesOf(net: DecisionNetworkArtifact): Map<string, string> {
  const av = net.phases.phase_16_pareto_frontier.architecture_vectors.find(
    (v) => v.id === net.selected_architecture_id,
  );
  if (!av) {
    throw new Error(`synthesis-agent: selected_architecture_id ${net.selected_architecture_id} not in phase_16`);
  }
  const m = new Map<string, string>();
  for (const c of av.choices) m.set(c.decision_node_id, c.alternative_id);
  return m;
}

/**
 * NFR.NN lookup indexed by req_id.
 */
export function nfrIndex(nfrs: NfrArtifact): Map<string, NfrEntry> {
  return new Map(nfrs.nfrs.map((n) => [n.req_id, n]));
}

/**
 * Build one tail_latency_budget per chain in interface_specs.chain_budgets.
 * Recomputes `sum_per_if_p95_ms` from the per-IF specs along the chain —
 * fails loudly if the recomputation disagrees with the producer's claim.
 */
export function buildTailLatencyBudgets(specs: InterfaceSpecsArtifact): ArchitectureRecommendation['tail_latency_budgets'] {
  const byId = new Map(specs.interfaces.map((i) => [i.interface_id, i]));
  const result: ArchitectureRecommendation['tail_latency_budgets'] = [];
  for (const cb of specs.chain_budgets) {
    let sum = 0;
    for (const hop of cb.hops) {
      const iface = byId.get(hop);
      if (!iface) {
        throw new Error(`synthesis-agent: chain ${cb.chain_id} references unknown IF ${hop}`);
      }
      sum += iface.sla.p95_latency_ms;
    }
    if (sum !== cb.sum_p95_latency_ms) {
      throw new Error(
        `synthesis-agent: chain ${cb.chain_id} tail-latency mismatch — recomputed ${sum} != claimed ${cb.sum_p95_latency_ms}`,
      );
    }
    result.push({
      chain_id: cb.chain_id,
      user_facing_p95_ms: cb.user_facing_nfr_p95_ms,
      sum_per_if_p95_ms: sum,
      budget_ok: sum <= cb.user_facing_nfr_p95_ms,
      derivation_source: `interface_specs.v1.json#chain_budgets[${cb.chain_id}]`,
    });
  }
  return result;
}

/**
 * Embed fmea_residual flags verbatim (preserving predecessor_ref).
 */
export function buildResidualRisk(fmea: FmeaResidualArtifact): ArchitectureRecommendation['residual_risk'] {
  const flags = fmea.failure_modes.filter((f) => f.flagged_high_rpn === true);
  return {
    threshold: fmea.high_rpn_flag_threshold,
    flag_count: flags.length,
    flags: flags.map((f) => ({
      id: f.id,
      predecessor_ref: f.predecessor_ref,
      failure_mode: f.failure_mode,
      rpn: f.rpn,
      weighted_rpn: f.weighted_rpn,
      criticality_category: f.criticality_category,
      open_residual_risk: f.open_residual_risk,
    })),
  };
}

/**
 * Embed HoQ summary (stats snapshot + target-values + flagged ECs).
 */
export function buildHoqSummary(hoq: HoqArtifact): ArchitectureRecommendation['hoq'] {
  return {
    pc_count: hoq.customer_requirements.rows.length,
    ec_count: hoq.engineering_characteristics.rows.length,
    matrix_nonzero: hoq.relationship_matrix.stats.nonzero_cells,
    matrix_total: hoq.relationship_matrix.stats.total_cells,
    matrix_sparsity_pct: hoq.relationship_matrix.stats.sparsity_pct,
    roof_pairs_nonzero: hoq.roof_correlations.stats.nonzero_pairs,
    flagged_ecs: (hoq.relationship_matrix.flagged_ec_no_pc ?? []).map((r) => r.ec_id),
    target_values: hoq.target_values.rows.map((r) => ({
      ec_id: r.ec_id,
      target: r.target,
      unit: r.unit,
      constant_ref: r.constant_ref,
    })),
  };
}

/**
 * SHA-256 of concatenated raw upstream bytes, canonically ordered
 * (UPSTREAM_REF_ORDER). Reproducibility key per guardrail envelope.
 */
export function computeInputsHash(loaded: LoadedUpstream): string {
  const h = createHash('sha256');
  for (const k of UPSTREAM_REF_ORDER) h.update(loaded.rawBytes[k]);
  return h.digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────
// Agent entry point
// ─────────────────────────────────────────────────────────────────────────

/**
 * Caller-supplied synthesis payload — the prose / diagrams / hand-curated
 * decisions + pareto alternatives + derivation_chain + next_steps that
 * the LLM or hand-author produces on top of the mechanical embeds.
 */
export interface SynthesisPayload {
  top_level_architecture: ArchitectureRecommendation['top_level_architecture'];
  mermaid_diagrams: ArchitectureRecommendation['mermaid_diagrams'];
  pareto_frontier: ArchitectureRecommendation['pareto_frontier'];
  decisions: ArchitectureRecommendation['decisions'];
  derivation_chain: ArchitectureRecommendation['derivation_chain'];
  risks: ArchitectureRecommendation['risks'];
  next_steps: ArchitectureRecommendation['next_steps'];
}

/**
 * Assemble the full `architecture_recommendation.v1` artifact and validate
 * against the Zod schema. Caller provides the synthesis payload; this
 * function layers the mechanical embeds (tail_latency_budgets,
 * residual_risk, hoq, inputs_hash) + envelope fields.
 *
 * Throws on schema violation; returns the parsed artifact on success.
 */
export function assembleArchitectureRecommendation(
  input: SynthesisAgentInput,
  loaded: LoadedUpstream,
  payload: SynthesisPayload,
): ArchitectureRecommendation {
  const tail = buildTailLatencyBudgets(loaded.interfaceSpecs);
  const residual = buildResidualRisk(loaded.fmeaResidual);
  const hoqSummary = buildHoqSummary(loaded.hoq);
  const upstreamRefs = UPSTREAM_REF_ORDER.map((k) => loaded.paths[k]);
  const inputsHash = computeInputsHash(loaded);

  const artifact = {
    _schema: 'synthesis.architecture-recommendation.v1',
    _output_path: input.outputPath,
    _phase_status: 'complete' as const,
    _upstream_refs: upstreamRefs,
    metadata: {
      phase_number: 12,
      phase_slug: 'synthesis-capstone',
      phase_name: 'Architecture Recommendation (Synthesis Capstone)',
      schema_version: '1.0.0',
      project_id: input.projectId,
      project_name: input.projectName,
      author: 'synthesis-agent@t6-wave-4',
      generated_at: input.synthesizedAt ?? new Date().toISOString(),
      generator: 'product-helper@0.1.0/synthesis-agent',
      revision: 0,
    },
    top_level_architecture: payload.top_level_architecture,
    mermaid_diagrams: payload.mermaid_diagrams,
    pareto_frontier: payload.pareto_frontier,
    decisions: payload.decisions,
    derivation_chain: payload.derivation_chain,
    risks: payload.risks,
    tail_latency_budgets: tail,
    residual_risk: residual,
    hoq: hoqSummary,
    next_steps: payload.next_steps,
    inputs_hash: inputsHash,
    model_version: input.modelVersion ?? 'deterministic-rule-tree@t6-wave-4',
    synthesized_at: input.synthesizedAt ?? new Date().toISOString(),
  };

  return architectureRecommendationSchema.parse(artifact);
}

/**
 * Validation-only entrypoint — parse an already-assembled artifact JSON
 * against the Zod schema (used by verify-t6.ts).
 */
export function validateArchitectureRecommendation(raw: unknown): ArchitectureRecommendation {
  return architectureRecommendationSchema.parse(raw);
}
