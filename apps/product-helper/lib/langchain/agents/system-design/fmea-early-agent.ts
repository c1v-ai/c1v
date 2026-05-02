/**
 * FMEA-early Agent (Module 8)
 *
 * Produces canonical `fmea_early.v1.json`. Every FM.NN's target_ref MUST
 * resolve in ffbd.v1 (function), n2_matrix.v1 (interface), or data_flows.v1
 * (data_flow). severity/likelihood/detectability must match scales in
 * `rating_scales.json`. `candidate_mitigation` lists options only — no
 * commitment implied. Consumed downstream by T-new nfr-resynth to promote
 * selected mitigations into NFRs.
 *
 * @module lib/langchain/agents/system-design/fmea-early-agent
 */

import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { withAgentMetrics } from '@/lib/observability/synthesis-metrics';
import { fmeaEarlySchema, type FmeaEarly } from '@/lib/langchain/schemas/module-8-risk/fmea-early';
import type { FfbdV1 } from '@/lib/langchain/schemas/module-3/ffbd-v1';
import type { N2Matrix } from '@/lib/langchain/schemas/module-7-interfaces/n2-matrix';
import type { DataFlows } from '@/lib/langchain/schemas/module-1/phase-2-5-data-flows';

export interface FmeaEarlyAgentInput {
  ffbd: FfbdV1;
  n2: N2Matrix;
  dataFlows: DataFlows;
  ratingScalesVersion: string;
  systemName: string;
  producedBy: string;
  outputPath: string;
  upstreamRefs: FmeaEarly['_upstream_refs'];
}

export async function runFmeaEarlyAgent(
  input: FmeaEarlyAgentInput,
  opts: { llm?: BaseChatModel; stub?: FmeaEarly } = {},
): Promise<FmeaEarly> {
  return withAgentMetrics({ agent: 'fmea-early' }, () => runFmeaEarlyAgentInner(input, opts));
}

async function runFmeaEarlyAgentInner(
  input: FmeaEarlyAgentInput,
  opts: { llm?: BaseChatModel; stub?: FmeaEarly } = {},
): Promise<FmeaEarly> {
  if (opts.stub) {
    const parsed = fmeaEarlySchema.parse(opts.stub);
    const fnIds = new Set(input.ffbd.functions.map((f) => f.id));
    const ifIds = new Set(input.n2.rows.map((r) => r.id));
    const deIds = new Set(input.dataFlows.entries.map((e) => e.id));
    for (const fm of parsed.failure_modes) {
      const { kind, ref } = fm.target_ref;
      const ok =
        (kind === 'function' && fnIds.has(ref)) ||
        (kind === 'interface' && ifIds.has(ref)) ||
        (kind === 'data_flow' && deIds.has(ref));
      if (!ok) {
        throw new Error(`fmea-early-agent: FM ${fm.id} target_ref ${kind}:${ref} unresolved`);
      }
      if (fm.rpn !== fm.severity * fm.likelihood) {
        throw new Error(`fmea-early-agent: FM ${fm.id} rpn ${fm.rpn} != ${fm.severity}*${fm.likelihood}`);
      }
    }
    return parsed;
  }
  throw new Error('runFmeaEarlyAgent: live LLM path not implemented; pass opts.stub.');
}

export { fmeaEarlySchema };
