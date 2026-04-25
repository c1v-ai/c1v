/**
 * interface-specs-agent (T4b Wave 3, M7.b).
 *
 * Produces M7.b formal interface specs from decision-net winner + M7.a N2
 * matrix + NFRs. Per interface (IF.NN in n2_matrix): SLA (p95 latency,
 * availability %, throughput ceiling), retry policy, timeout,
 * circuit-breaker threshold, auth mode, error-handling contract.
 *
 * Each interface SLA cites its derivation: NFR ref + FMEA detectability
 * requirement (kb-8 atlas optional, future). Front-chain budget is
 * Σ p95_i ≤ user-facing p95 NFR (currently 3000ms for IF.01..IF.04 critical
 * authoring path).
 *
 * Portfolio-demo stance (matches T4b): LLM adapter stubbed; logic is
 * deterministic over hand-shaped n2_matrix rows. Output round-trips through
 * `interfaceSpecsV1Schema`.
 *
 * @module lib/langchain/agents/system-design/interface-specs-agent
 */

import {
  interfaceSpecsV1Schema,
  type InterfaceSpec,
  type InterfaceSpecsV1,
  type AuthMode,
} from '../../schemas/module-7-interfaces/formal-specs';

/** Minimal N2 row shape consumed by this agent. */
export interface N2Row {
  id: string;
  producer: string;
  consumer: string;
  payload_name: string;
  protocol: string;
  sync_style: string;
  criticality: string;
}

export interface InterfaceSpecsAgentInput {
  n2Matrix: { rows: N2Row[] };
  producedAt: string;
  producedBy: string;
  systemName: string;
  outputPath: string;
  upstreamRefs: InterfaceSpecsV1['_upstream_refs'];
}

/**
 * SLA derivation defaults by criticality. Tail-latency budgets chosen so
 * front-chain (IF.01..IF.04) sums to ≤ 3000ms (user-facing p95 NFR-like).
 */
export const SLA_DEFAULTS = {
  critical: { p95_latency_ms: 500, availability_pct: 99.95, throughput_ceiling_rps: 200 },
  high: { p95_latency_ms: 800, availability_pct: 99.9, throughput_ceiling_rps: 100 },
  medium: { p95_latency_ms: 1500, availability_pct: 99.5, throughput_ceiling_rps: 50 },
} as const;

export function slaFor(criticality: string) {
  return SLA_DEFAULTS[(criticality as keyof typeof SLA_DEFAULTS) in SLA_DEFAULTS ? (criticality as keyof typeof SLA_DEFAULTS) : 'high'];
}

export function authByProtocol(protocol: string): AuthMode {
  if (protocol === 'in-process') return 'in-process';
  if (protocol === 'http-json') return 'bearer-jwt';
  return 'api-key';
}

/** Compose one InterfaceSpec from one N2 row. */
export function buildInterfaceSpec(r: N2Row): InterfaceSpec {
  const sla = slaFor(r.criticality);
  return {
    interface_id: r.id,
    n2_row_ref: `system-design/kb-upgrade-v2/module-7-interfaces/n2_matrix.v1.json#${r.id}`,
    producer: r.producer,
    consumer: r.consumer,
    payload_name: r.payload_name,
    protocol: r.protocol,
    sync_style: r.sync_style as InterfaceSpec['sync_style'],
    sla: {
      ...sla,
      derivation_sources: [
        { kind: 'nfr', nfr_id: 'NFR.04' },
        { kind: 'fmea', fmea_row_id: `FM.${r.id.split('.')[1]}`, detectability_requirement: `IF ${r.id} must be observable within 1 RECOMMENDATION_CADENCE_MIN window.` },
      ],
      math_derivation: {
        formula: 'p95_i ≤ budget - Σ others (critical path apportion)',
        inputs: { criticality: r.criticality },
        kb_source: '_shared/resiliency-patterns-kb.md',
        result: sla.p95_latency_ms,
      },
    },
    retry: { max_attempts: r.sync_style === 'sync' ? 0 : 3, backoff_ms: 200, strategy: 'exponential_jitter', retry_on: ['5xx', 'timeout'] },
    timeout_ms: sla.p95_latency_ms * 2,
    circuit_breaker: { error_rate_threshold_pct: 25, min_requests_before_trip: 20, open_state_duration_ms: 30_000 },
    auth: authByProtocol(r.protocol),
    error_handling: {
      error_schema_ref: `lib/langchain/schemas/module-7-interfaces/formal-specs.ts#ErrorHandlingContract`,
      status_codes: [400, 401, 403, 404, 409, 429, 500, 503],
      idempotency: r.sync_style === 'async' || r.sync_style === 'batch' ? 'required' : 'advisory',
    },
  };
}

/**
 * Front-chain (IF.01..IF.04, critical authoring path) latency budget.
 * Σ p95_i ≤ user-facing NFR p95 (3000ms).
 */
export function buildFrontChainBudget(interfaces: InterfaceSpec[]) {
  const frontChain = ['IF.01', 'IF.02', 'IF.03', 'IF.04'];
  const sum_p95_latency_ms = frontChain.reduce(
    (acc, id) => acc + (interfaces.find((i) => i.interface_id === id)?.sla.p95_latency_ms ?? 0),
    0,
  );
  const user_facing_nfr_p95_ms = 3000;
  return {
    chain_id: 'AUTHORING_SPEC_EMIT',
    hops: frontChain,
    sum_p95_latency_ms,
    user_facing_nfr_p95_ms,
    budget_ok: sum_p95_latency_ms <= user_facing_nfr_p95_ms,
  };
}

export function runInterfaceSpecsAgent(input: InterfaceSpecsAgentInput): InterfaceSpecsV1 {
  const interfaces = input.n2Matrix.rows.map(buildInterfaceSpec);
  const frontChainBudget = buildFrontChainBudget(interfaces);

  return interfaceSpecsV1Schema.parse({
    _schema: 'module-7b.interface-specs.v1',
    _output_path: input.outputPath,
    _upstream_refs: input.upstreamRefs,
    produced_at: input.producedAt,
    produced_by: input.producedBy,
    system_name: input.systemName,
    interfaces,
    chain_budgets: [frontChainBudget],
  });
}

export const INTERFACE_SPECS_AGENT_VERSION = '1.0.0-t4b';
