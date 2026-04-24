/**
 * FFBD Agent (Module 3, Gate C close-out)
 *
 * Produces canonical `ffbd.v1.json` by composing M3 Gate B artifacts
 * (phase-0a, phase-6, phase-11) with the new Phase 2.5 data_flows. Every
 * function.inputs[] DE.NN MUST resolve in data_flows.v1; every OR/AND/IT
 * gate MUST carry a guard or termination.
 *
 * Wave 2-early dispatch: live LLM path stubbed; self-application artifact
 * is hand-synthesized from existing M3 files and validated through the
 * schema at emit-time.
 *
 * @module lib/langchain/agents/system-design/ffbd-agent
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { ffbdV1Schema, type FfbdV1 } from '@/lib/langchain/schemas/module-3/ffbd-v1';
import type { DataFlows } from '@/lib/langchain/schemas/module-1/phase-2-5-data-flows';

export interface FfbdAgentInput {
  scopeTree: unknown;
  contextDiagram: unknown;
  dataFlows: DataFlows;
  ffbdTopLevel: unknown;
  systemName: string;
  producedBy: string;
  outputPath: string;
  upstreamRefs: FfbdV1['_upstream_refs'];
}

export async function runFfbdAgent(
  input: FfbdAgentInput,
  opts: { llm?: ChatAnthropic; stub?: FfbdV1 } = {},
): Promise<FfbdV1> {
  if (opts.stub) {
    const parsed = ffbdV1Schema.parse(opts.stub);
    const dfIds = new Set(input.dataFlows.entries.map((e) => e.id));
    for (const fn of parsed.functions) {
      for (const inp of fn.inputs) {
        if (inp.kind === 'data_flow' && !dfIds.has(inp.ref)) {
          throw new Error(
            `ffbd-agent: function ${fn.id} input ${inp.ref} not found in data_flows.v1`,
          );
        }
      }
    }
    return parsed;
  }
  throw new Error(
    'runFfbdAgent: live LLM path not implemented in Wave 2-early; pass opts.stub for now.',
  );
}

export { ffbdV1Schema };
