/**
 * N² Matrix Agent (Module 7)
 *
 * Walks ffbd.v1 × ffbd.v1 and emits IF.NN rows. Each row's producer and
 * consumer MUST be present in ffbd.v1.functions. `data_flow_ref` is
 * soft-nullable; when non-null it MUST resolve in data_flows.v1 and the
 * row's criticality SHALL match the referenced DE.NN unless overridden
 * with a rationale.
 *
 * @module lib/langchain/agents/system-design/n2-agent
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { withAgentMetrics } from '@/lib/observability/synthesis-metrics';
import { n2MatrixSchema, type N2Matrix } from '@/lib/langchain/schemas/module-7-interfaces/n2-matrix';
import type { FfbdV1 } from '@/lib/langchain/schemas/module-3/ffbd-v1';
import type { DataFlows } from '@/lib/langchain/schemas/module-1/phase-2-5-data-flows';

export interface N2AgentInput {
  ffbd: FfbdV1;
  dataFlows: DataFlows;
  systemName: string;
  producedBy: string;
  outputPath: string;
  upstreamRefs: N2Matrix['_upstream_refs'];
}

export async function runN2Agent(
  input: N2AgentInput,
  opts: { llm?: ChatAnthropic; stub?: N2Matrix } = {},
): Promise<N2Matrix> {
  // n2 is M7.a — folded into 'synthesis' bucket alongside ffbd.
  return withAgentMetrics({ agent: 'synthesis' }, () => runN2AgentInner(input, opts));
}

async function runN2AgentInner(
  input: N2AgentInput,
  opts: { llm?: ChatAnthropic; stub?: N2Matrix } = {},
): Promise<N2Matrix> {
  if (opts.stub) {
    const parsed = n2MatrixSchema.parse(opts.stub);
    const fnIds = new Set(input.ffbd.functions.map((f) => f.id));
    const dfMap = new Map(input.dataFlows.entries.map((e) => [e.id, e]));
    for (const row of parsed.rows) {
      if (!fnIds.has(row.producer)) {
        throw new Error(`n2-agent: row ${row.id} producer ${row.producer} not in ffbd.v1`);
      }
      if (!fnIds.has(row.consumer)) {
        throw new Error(`n2-agent: row ${row.id} consumer ${row.consumer} not in ffbd.v1`);
      }
      if (row.data_flow_ref) {
        const de = dfMap.get(row.data_flow_ref);
        if (!de) {
          throw new Error(`n2-agent: row ${row.id} data_flow_ref ${row.data_flow_ref} not in data_flows.v1`);
        }
        if (de.criticality !== row.criticality && !row.criticality_override_rationale) {
          throw new Error(
            `n2-agent: row ${row.id} criticality ${row.criticality} != ${de.criticality} without override rationale`,
          );
        }
      }
    }
    return parsed;
  }
  throw new Error('runN2Agent: live LLM path not implemented; pass opts.stub.');
}

export { n2MatrixSchema };
