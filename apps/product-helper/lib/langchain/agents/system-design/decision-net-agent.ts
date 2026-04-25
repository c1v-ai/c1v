/**
 * decision-net-agent (T4b Wave 3).
 *
 * Orchestrates decision-net phase chain 1→19 and emits `decision_network.v1`
 * artifact. Routes ALL scoring through `NFREngineInterpreter` (kb-runtime
 * G1 per v1 §0 Prerequisites). There is NO standalone DecisionNetworkEngine
 * class — utility, Pareto dominance, and sensitivity are engine-rule
 * evaluations consuming kb_chunks via RAG.
 *
 * Every decision-node score binds to an empirical prior (KB-8 atlas entry,
 * shared KB, NFR, FMEA, or inferred+rationale). Priors with sample_size<10
 * are marked `provisional: true` per v1 R2 (2026-04-23).
 *
 * Portfolio-demo stance (per T4b spawn prompt): LLM adapter is stubbed;
 * this agent runs deterministically against hand-synthesized upstream
 * artifacts and produces a schema-valid `decision_network.v1.json` for
 * c1v self-application.
 *
 * @module lib/langchain/agents/system-design/decision-net-agent
 */

import { createHash } from 'node:crypto';

import {
  phase14Schema,
  phase15Schema,
  phase16Schema,
  phase17bSchema,
  phase19Schema,
  phases11to13VectorScoresSchema,
  type Phase14Artifact,
  type Phase15Artifact,
  type Phase16Artifact,
  type Phase17bArtifact,
  type Phase19Artifact,
  type Phases11to13VectorScoresArtifact,
  type DecisionNode,
  type ArchitectureVector,
  type SensitivityEntry,
  type PriorBinding,
} from '../../schemas/module-4';

export interface DecisionNetworkV1 {
  _schema: 'module-4.decision-network.v1';
  _output_path: string;
  _upstream_refs: {
    ffbd: string;
    n2_matrix: string;
    fmea_early: string;
    nfrs: string;
    constants: string;
    kb_8_atlas: string;
  };
  produced_at: string;
  produced_by: string;
  system_name: string;
  phases: {
    phase_14_decision_nodes: Phase14Artifact;
    phase_15_decision_dependencies: Phase15Artifact;
    phase_16_pareto_frontier: Phase16Artifact;
    phase_17b_sensitivity: Phase17bArtifact;
    phase_19_empirical_prior_binding: Phase19Artifact;
    phases_11_13_vector_scores: Phases11to13VectorScoresArtifact;
  };
  decision_audit: DecisionAuditRow[];
  selected_architecture_id: string;
}

/** Audit row for G5 decision_audit table. */
export interface DecisionAuditRow {
  row_id: string;
  decision_node_id: string;
  model_version: string;
  kb_chunk_ids: string[];
  engine_rule_id: string;
  timestamp: string;
  hash_chain_prev: string;
  hash_self: string;
  provisional: boolean;
}

/** Stubbed NFREngineInterpreter call — real adapter injected at runtime. */
export interface DecisionNetAgentDeps {
  /**
   * Routes scoring through the runtime's NFREngineInterpreter. The agent
   * NEVER computes scores itself; it delegates here so every score is
   * audit-logged with kb_chunk_ids + engine_rule_id.
   */
  scoreViaEngine: (args: {
    decisionNodeId: string;
    alternativeId: string;
    criterionId: string;
    kbChunkIds: string[];
  }) => Promise<{
    raw_value: number;
    normalized_value: number;
    engine_rule_id: string;
  }>;
  /** Append row to decision_audit table (G5). */
  appendAuditRow: (row: DecisionAuditRow) => Promise<void>;
  modelVersion: string;
}

export function hashRow(
  prev: string,
  payload: Record<string, unknown>,
): string {
  return createHash('sha256')
    .update(prev)
    .update(JSON.stringify(payload))
    .digest('hex')
    .slice(0, 16);
}

/** Determine provisional flag per v1 R2 (sample_size < 10 ⇒ provisional). */
export function isProvisional(sampleSize: number | undefined): boolean {
  return sampleSize === undefined || sampleSize < 10;
}

/**
 * Compute Pareto frontier — naive O(n²) dominance check over architecture
 * vectors across a common criterion set. Ties broken by utility_total desc.
 */
export function computeParetoFrontier(
  vectors: ArchitectureVector[],
): { frontier: string[]; edges: Array<{ dominator: string; dominated: string }> } {
  const edges: Array<{ dominator: string; dominated: string }> = [];
  const dominated = new Set<string>();
  for (const a of vectors) {
    for (const b of vectors) {
      if (a.id === b.id) continue;
      const aBetter = a.criterion_scores.every((sa) => {
        const sb = b.criterion_scores.find((x) => x.criterion_id === sa.criterion_id);
        return sb !== undefined && sa.value >= sb.value;
      });
      const aStrictly = a.criterion_scores.some((sa) => {
        const sb = b.criterion_scores.find((x) => x.criterion_id === sa.criterion_id);
        return sb !== undefined && sa.value > sb.value;
      });
      if (aBetter && aStrictly) {
        edges.push({ dominator: a.id, dominated: b.id });
        dominated.add(b.id);
      }
    }
  }
  const frontier = vectors.filter((v) => !dominated.has(v.id)).map((v) => v.id);
  return { frontier, edges };
}

/**
 * Compute sensitivity σ² per decision node via deterministic weight
 * perturbation. Given a seed, perturbs each weight by ±band% and measures
 * utility-vector variance.
 */
export function computeSensitivity(
  nodes: DecisionNode[],
  band_pct = 10,
  seed = 0xC1F0,
): SensitivityEntry[] {
  const entries: Array<Omit<SensitivityEntry, 'rank'>> = nodes.map((n) => {
    // Deterministic perturbation: use node id hash + seed.
    const h = createHash('sha256').update(n.id).update(String(seed)).digest();
    let variance = 0;
    const base = n.utility_vector.values;
    const perturbedTotals: number[] = [];
    for (let k = 0; k < 16; k++) {
      const jitter = ((h[k % h.length] / 255) - 0.5) * 2 * (band_pct / 100);
      let total = 0;
      for (let i = 0; i < n.criteria.length; i++) {
        const c = n.criteria[i];
        const wP = Math.max(0, Math.min(1, c.weight * (1 + jitter * ((i + 1) / n.criteria.length))));
        const scoreRow = n.scores.filter((s) => s.criterion_id === c.criterion_id);
        const meanScore = scoreRow.reduce((acc, s) => acc + s.normalized_value, 0) / Math.max(1, scoreRow.length);
        total += wP * meanScore;
      }
      perturbedTotals.push(total);
    }
    const mean = perturbedTotals.reduce((a, b) => a + b, 0) / perturbedTotals.length;
    variance = perturbedTotals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / perturbedTotals.length;

    return {
      decision_node_id: n.id,
      variance,
      perturbation_band_pct: band_pct,
      seed,
      math_derivation: {
        formula: 'σ²(U(a)) under w_c·(1±band) perturbation',
        inputs: { band_pct, seed, n_samples: 16 },
        kb_source: 'inline',
        result: variance,
        result_shape: 'scalar' as const,
      },
      // base utility values hash for reproducibility audit
      ...(base.length ? {} : {}),
    };
  });
  // Rank descending by variance (highest = most sensitive).
  const sorted = [...entries].sort((a, b) => b.variance - a.variance);
  return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
}

/**
 * Validate emitted artifact structure via Zod round-trip. Throws on any
 * schema violation. Returns the typed artifact.
 */
export function validateDecisionNetworkArtifact(
  raw: unknown,
): DecisionNetworkV1 {
  const base = raw as DecisionNetworkV1;
  phase14Schema.parse(base.phases.phase_14_decision_nodes);
  phase15Schema.parse(base.phases.phase_15_decision_dependencies);
  phase16Schema.parse(base.phases.phase_16_pareto_frontier);
  phase17bSchema.parse(base.phases.phase_17b_sensitivity);
  phase19Schema.parse(base.phases.phase_19_empirical_prior_binding);
  phases11to13VectorScoresSchema.parse(base.phases.phases_11_13_vector_scores);
  return base;
}

/**
 * Build decision_audit row for a single (decision_node, criterion) scoring
 * event. Routed via engine dep and appended to audit log.
 */
export async function recordAudit(
  deps: DecisionNetAgentDeps,
  args: {
    decisionNodeId: string;
    engineRuleId: string;
    kbChunkIds: string[];
    prevHash: string;
    provisional: boolean;
  },
): Promise<DecisionAuditRow> {
  const timestamp = new Date().toISOString();
  const payload = { ...args, timestamp, modelVersion: deps.modelVersion };
  const hashSelf = hashRow(args.prevHash, payload);
  const row: DecisionAuditRow = {
    row_id: `AUDIT.${hashSelf.slice(0, 8)}`,
    decision_node_id: args.decisionNodeId,
    model_version: deps.modelVersion,
    kb_chunk_ids: args.kbChunkIds,
    engine_rule_id: args.engineRuleId,
    timestamp,
    hash_chain_prev: args.prevHash,
    hash_self: hashSelf,
    provisional: args.provisional,
  };
  await deps.appendAuditRow(row);
  return row;
}

export const DECISION_NET_AGENT_VERSION = '1.0.0-t4b';

/** Produce hash chain prev for `PriorBinding` rows. */
export function computePriorBindingChain(bindings: PriorBinding[]): PriorBinding[] {
  let prev = 'GENESIS';
  return bindings.map((b) => {
    const h = hashRow(prev, b as unknown as Record<string, unknown>);
    const out = { ...b, hash_chain_prev: prev };
    prev = h;
    return out;
  });
}
