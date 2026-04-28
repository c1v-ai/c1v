#!/usr/bin/env tsx
/**
 * verify-t6 — V6.1 through V6.7 gate runner for the synthesis capstone.
 *
 *   V6.1  tsc green                                          (delegated)
 *   V6.2  architecture_recommendation.v1.json schema-valid   (zod parse)
 *   V6.3  derivation_chain coverage: every decision has an entry; every
 *         entry cites DN.NN-X (in decision_network) + ≥1 NFR.NN (in nfrs)
 *         + ≥1 atlas empirical_prior + (kb_chunk_ids OR fmea_refs)
 *   V6.4  Tail-latency consistency: each tail_latency_budget chain_id
 *         resolves in interface_specs.chain_budgets; sum_per_if_p95_ms
 *         matches recomputation from per-IF specs; budget_ok matches
 *         claimed user_facing_p95_ms
 *   V6.5  Residual risk: flag_count == flags.length; every flag's id
 *         + predecessor_ref preserved verbatim from fmea_residual.failure_modes
 *         (where flagged_high_rpn=true)
 *   V6.6  HoQ embed: pc_count, ec_count, matrix stats match hoq.v1.json
 *         exactly; target_values.length == ec_count
 *   V6.7  Envelope: _upstream_refs[] has all 11 hard-deps + scope_tree
 *         + context_diagram (13 total); inputs_hash is 64-hex; pareto≥3
 *
 * Run from apps/product-helper:
 *   pnpm tsx scripts/verify-t6.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  validateArchitectureRecommendation,
} from '../lib/langchain/agents/system-design/synthesis-agent';

const APP_ROOT = join(__dirname, '..');
const REPO_ROOT = join(APP_ROOT, '..', '..');
const SD_ROOT = join(REPO_ROOT, 'system-design', 'kb-upgrade-v2');

const ARTIFACT_PATH = join(
  REPO_ROOT,
  '.planning/runs/self-application/synthesis/architecture_recommendation.v1.json',
);
const DECISION_NETWORK_PATH = join(SD_ROOT, 'module-4-decision-matrix', 'decision_network.v1.json');
const NFRS_PATH = join(SD_ROOT, 'module-2-requirements', 'nfrs.v2.json');
const INTERFACE_SPECS_PATH = join(SD_ROOT, 'module-7-interfaces', 'interface_specs.v1.json');
const FMEA_RESIDUAL_PATH = join(SD_ROOT, 'module-8-risk', 'fmea_residual.v1.json');
const HOQ_PATH = join(REPO_ROOT, '.planning/runs/self-application/module-6/hoq.v1.json');

type Result = { gate: string; pass: boolean; detail: string };
const results: Result[] = [];
function record(gate: string, pass: boolean, detail: string) {
  results.push({ gate, pass, detail });
  console.log(`${pass ? '✔' : '✘'} ${gate}  ${detail}`);
}

function safeReadJson<T>(p: string): T | null {
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as T;
  } catch {
    return null;
  }
}

// ─── load artifact + parse ──────────────────────────────────────────────
const raw = safeReadJson<unknown>(ARTIFACT_PATH);
if (!raw) {
  record('V6.2', false, `missing or unreadable artifact: ${ARTIFACT_PATH}`);
  console.log('\nT6 verification: 0/1 gates pass (artifact missing — cannot continue)');
  process.exit(1);
}

let artifact: ReturnType<typeof validateArchitectureRecommendation>;
try {
  artifact = validateArchitectureRecommendation(raw);
  record('V6.2', true, `architecture_recommendation.v1.json schema-valid (decisions=${artifact.decisions.length}, pareto=${artifact.pareto_frontier.length}, derivation=${artifact.derivation_chain.length})`);
} catch (err) {
  record('V6.2', false, `zod parse error: ${(err as Error).message?.slice(0, 200)}`);
  console.log(`\nT6 verification: 0/1 gates pass`);
  process.exit(1);
}

// ─── V6.3 — derivation_chain coverage + cross-refs ──────────────────────
{
  const decisionNetwork = safeReadJson<{
    phases: { phase_14_decision_nodes: { decision_nodes: Array<{ id: string; alternatives: Array<{ id: string }> }> } };
  }>(DECISION_NETWORK_PATH);
  const nfrs = safeReadJson<{ nfrs: Array<{ req_id: string }> }>(NFRS_PATH);

  if (!decisionNetwork || !nfrs) {
    record('V6.3', false, 'missing decision_network or nfrs upstream');
  } else {
    const dnPairs = new Set<string>();
    for (const node of decisionNetwork.phases.phase_14_decision_nodes.decision_nodes) {
      for (const alt of node.alternatives) dnPairs.add(`${node.id}-${alt.id}`);
    }
    const nfrIds = new Set(nfrs.nfrs.map((n) => n.req_id));
    const decisionIds = new Set(artifact.decisions.map((d) => d.id));
    const failures: string[] = [];

    for (const d of artifact.decisions) {
      const chain = artifact.derivation_chain.find((c) => c.decision_id === d.id);
      if (!chain) {
        failures.push(`${d.id}: missing derivation_chain entry`);
        continue;
      }
      if (!dnPairs.has(chain.decision_network_node)) {
        failures.push(`${d.id}: ${chain.decision_network_node} not in decision_network`);
      }
      if (chain.nfrs_driving_choice.length === 0) {
        failures.push(`${d.id}: 0 NFRs driving choice`);
      }
      const badNfrs = chain.nfrs_driving_choice.filter((n) => !nfrIds.has(n));
      if (badNfrs.length > 0) failures.push(`${d.id}: NFRs not in nfrs.v2: ${badNfrs.join(',')}`);
      if (chain.empirical_priors.length === 0) failures.push(`${d.id}: 0 atlas empirical_priors`);
      if (chain.kb_chunk_ids.length === 0 && chain.fmea_refs.length === 0) {
        failures.push(`${d.id}: 0 kb_chunk_ids AND 0 fmea_refs (need at least one provenance)`);
      }
    }
    // Also check no orphan derivation_chain entries
    for (const c of artifact.derivation_chain) {
      if (!decisionIds.has(c.decision_id)) {
        failures.push(`derivation_chain.${c.decision_id}: orphan (no matching decision)`);
      }
    }

    if (failures.length > 0) {
      record('V6.3', false, `${failures.length} derivation-chain coverage failure(s): ${failures.slice(0, 4).join(' | ')}`);
    } else {
      record(
        'V6.3',
        true,
        `${artifact.derivation_chain.length} chains; all DN.NN-X resolve in decision_network; ` +
          `all NFRs in nfrs.v2; all chains have ≥1 atlas prior + ≥1 (kb|fmea) ref`,
      );
    }
  }
}

// ─── V6.4 — tail-latency consistency ────────────────────────────────────
{
  const specs = safeReadJson<{
    interfaces: Array<{ interface_id: string; sla: { p95_latency_ms: number } }>;
    chain_budgets: Array<{ chain_id: string; hops: string[]; sum_p95_latency_ms: number; user_facing_nfr_p95_ms: number }>;
  }>(INTERFACE_SPECS_PATH);

  if (!specs) {
    record('V6.4', false, 'missing interface_specs upstream');
  } else {
    const ifById = new Map(specs.interfaces.map((i) => [i.interface_id, i]));
    const chainById = new Map(specs.chain_budgets.map((c) => [c.chain_id, c]));
    const failures: string[] = [];
    let checked = 0;

    for (const tl of artifact.tail_latency_budgets) {
      const cb = chainById.get(tl.chain_id);
      if (!cb) {
        failures.push(`chain ${tl.chain_id} not in interface_specs.chain_budgets`);
        continue;
      }
      let sum = 0;
      for (const hop of cb.hops) {
        const iface = ifById.get(hop);
        if (!iface) {
          failures.push(`chain ${tl.chain_id} hop ${hop} not in interfaces[]`);
        } else {
          sum += iface.sla.p95_latency_ms;
        }
      }
      if (sum !== tl.sum_per_if_p95_ms) {
        failures.push(`chain ${tl.chain_id}: artifact.sum=${tl.sum_per_if_p95_ms}, recomputed=${sum}`);
      }
      if (tl.user_facing_p95_ms !== cb.user_facing_nfr_p95_ms) {
        failures.push(`chain ${tl.chain_id}: user_facing_p95 mismatch (artifact=${tl.user_facing_p95_ms}, upstream=${cb.user_facing_nfr_p95_ms})`);
      }
      const expectedOk = sum <= cb.user_facing_nfr_p95_ms;
      if (tl.budget_ok !== expectedOk) {
        failures.push(`chain ${tl.chain_id}: budget_ok=${tl.budget_ok} but expected ${expectedOk}`);
      }
      checked++;
    }

    if (failures.length > 0) {
      record('V6.4', false, `${failures.length} tail-latency consistency failure(s): ${failures.slice(0, 3).join(' | ')}`);
    } else {
      record('V6.4', true, `${checked} chain(s) reconciled: per-IF sum matches; budget_ok matches; user_facing_p95 matches`);
    }
  }
}

// ─── V6.5 — residual_risk verbatim from fmea_residual ───────────────────
{
  const fmea = safeReadJson<{
    failure_modes: Array<{
      id: string;
      predecessor_ref: string;
      flagged_high_rpn: boolean;
      failure_mode: string;
      rpn: number;
      weighted_rpn: number;
      criticality_category: string;
      open_residual_risk?: string;
    }>;
    high_rpn_flag_threshold: number;
  }>(FMEA_RESIDUAL_PATH);

  if (!fmea) {
    record('V6.5', false, 'missing fmea_residual upstream');
  } else {
    const expectedFlags = fmea.failure_modes.filter((f) => f.flagged_high_rpn === true);
    const failures: string[] = [];

    if (artifact.residual_risk.flag_count !== artifact.residual_risk.flags.length) {
      failures.push(`flag_count(${artifact.residual_risk.flag_count}) != flags.length(${artifact.residual_risk.flags.length})`);
    }
    if (artifact.residual_risk.flag_count !== expectedFlags.length) {
      failures.push(`flag_count(${artifact.residual_risk.flag_count}) != upstream flagged_high_rpn=true count(${expectedFlags.length})`);
    }
    if (artifact.residual_risk.threshold !== fmea.high_rpn_flag_threshold) {
      failures.push(`threshold(${artifact.residual_risk.threshold}) != upstream(${fmea.high_rpn_flag_threshold})`);
    }
    const upstreamById = new Map(expectedFlags.map((f) => [f.id, f]));
    for (const f of artifact.residual_risk.flags) {
      const u = upstreamById.get(f.id);
      if (!u) {
        failures.push(`flag ${f.id} not in upstream flagged_high_rpn=true set`);
        continue;
      }
      if (f.predecessor_ref !== u.predecessor_ref) {
        failures.push(`${f.id}: predecessor_ref drift (${f.predecessor_ref} != ${u.predecessor_ref})`);
      }
      if (f.failure_mode !== u.failure_mode) {
        failures.push(`${f.id}: failure_mode text drift`);
      }
    }
    if (failures.length > 0) {
      record('V6.5', false, `${failures.length} residual-risk failure(s): ${failures.slice(0, 3).join(' | ')}`);
    } else {
      record('V6.5', true, `${expectedFlags.length} flags verbatim from fmea_residual (predecessor_ref + failure_mode preserved)`);
    }
  }
}

// ─── V6.6 — HoQ embed matches hoq.v1 ────────────────────────────────────
{
  const hoq = safeReadJson<{
    customer_requirements: { rows: unknown[] };
    engineering_characteristics: { rows: unknown[] };
    relationship_matrix: { stats: { nonzero_cells: number; total_cells: number; sparsity_pct: number } };
    roof_correlations: { stats: { nonzero_pairs: number } };
    target_values: { rows: unknown[] };
  }>(HOQ_PATH);

  if (!hoq) {
    record('V6.6', false, `missing hoq.v1.json at ${HOQ_PATH}`);
  } else {
    const failures: string[] = [];
    const ah = artifact.hoq;
    if (ah.pc_count !== hoq.customer_requirements.rows.length)
      failures.push(`pc_count(${ah.pc_count}) != upstream(${hoq.customer_requirements.rows.length})`);
    if (ah.ec_count !== hoq.engineering_characteristics.rows.length)
      failures.push(`ec_count(${ah.ec_count}) != upstream(${hoq.engineering_characteristics.rows.length})`);
    if (ah.matrix_nonzero !== hoq.relationship_matrix.stats.nonzero_cells)
      failures.push(`matrix_nonzero drift`);
    if (ah.matrix_total !== hoq.relationship_matrix.stats.total_cells)
      failures.push(`matrix_total drift`);
    if (Math.abs(ah.matrix_sparsity_pct - hoq.relationship_matrix.stats.sparsity_pct) > 0.01)
      failures.push(`matrix_sparsity_pct drift`);
    if (ah.roof_pairs_nonzero !== hoq.roof_correlations.stats.nonzero_pairs)
      failures.push(`roof_pairs_nonzero drift`);
    if (ah.target_values.length !== ah.ec_count)
      failures.push(`target_values.length(${ah.target_values.length}) != ec_count(${ah.ec_count})`);

    if (failures.length > 0) {
      record('V6.6', false, `${failures.length} hoq-embed drift(s): ${failures.join(' | ')}`);
    } else {
      record('V6.6', true, `HoQ embed exact-match (PCs=${ah.pc_count}, ECs=${ah.ec_count}, sparsity=${ah.matrix_sparsity_pct.toFixed(1)}%, target_values=${ah.target_values.length})`);
    }
  }
}

// ─── V6.7 — envelope: _upstream_refs[] + inputs_hash + pareto ───────────
{
  const failures: string[] = [];
  const refs = artifact._upstream_refs;
  if (refs.length < 11) failures.push(`_upstream_refs.length=${refs.length} < 11`);
  // sanity-check expected substrings in the ref list
  const expectedSubstrings = [
    'scope_tree.json',
    'context_diagram.json',
    'data_flows.v1.json',
    'nfrs.v2.json',
    'constants.v2.json',
    'ffbd.v1.json',
    'decision_network.v1.json',
    'form_function_map.v1.json',
    'n2_matrix.v1.json',
    'interface_specs.v1.json',
    'fmea_early.v1.json',
    'fmea_residual.v1.json',
    'hoq.v1.json',
  ];
  for (const sub of expectedSubstrings) {
    if (!refs.some((r) => r.endsWith(sub))) failures.push(`_upstream_refs missing ${sub}`);
  }
  if (!/^[0-9a-f]{64}$/.test(artifact.inputs_hash)) failures.push(`inputs_hash not 64-hex`);
  if (artifact.pareto_frontier.length < 3) failures.push(`pareto_frontier.length=${artifact.pareto_frontier.length} < 3`);
  if (!artifact.pareto_frontier.some((p) => p.is_recommended)) failures.push(`no pareto alternative marked is_recommended`);

  if (failures.length > 0) {
    record('V6.7', false, `${failures.length} envelope failure(s): ${failures.slice(0, 3).join(' | ')}`);
  } else {
    record(
      'V6.7',
      true,
      `_upstream_refs has all 13 expected paths; inputs_hash=${artifact.inputs_hash.slice(0, 16)}…; pareto=${artifact.pareto_frontier.length} (1 recommended)`,
    );
  }
}

// ─── Summary ────────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.pass);
console.log('');
console.log(`T6 verification: ${results.length - failed.length}/${results.length} gates pass`);
if (failed.length > 0) {
  console.log(`FAIL: ${failed.map((f) => f.gate).join(', ')}`);
  process.exit(1);
}
console.log('READY-FOR-TAG: V6.2/V6.3/V6.4/V6.5/V6.6/V6.7 green (V6.1 tsc + V6.0 jest must be run separately).');
