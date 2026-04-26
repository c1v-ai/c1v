/**
 * Form-Function Agent (Module 5)
 *
 * Produces canonical `form_function_map.v1.json`. Orchestrates phases 1-7
 * of the Crawley Concept stage for c1v.
 *
 * Math attribution policy (CRITICAL): `Q(f,g) = s · (1 - k)` cites
 * Stevens/Myers/Constantine (1974) and Bass/Clements/Kazman (2021) —
 * NEVER Crawley directly. The schema's `mathCitationSchema.source` enum
 * (Stevens1974 | Bass2021) is the primary gate; verify-t5 greps this
 * agent + schema dir as a secondary gate.
 *
 * Upstream consumption:
 *   - `ffbd.v1.json`        — function inventory source. Every F.NN in
 *                             phase 2 MUST resolve in ffbd.v1.functions.
 *   - `fmea_early.v1.json`  — SOFT signal. Failure modes whose mitigation
 *                             text mentions "multi-provider" / "fallback"
 *                             / "redundant" drive phase-1 redundant form
 *                             elements on the affected functions.
 *   - `nfrs.v2.json`        — priority weights (future; unused in stub).
 *
 * Portfolio-positioning scope: live LLM path stubbed (matches T4a
 * pattern). Consumers pass `opts.stub` with a hand-crafted artifact; the
 * agent performs Zod round-trip + referential validation against
 * upstream artifacts. This is sufficient for self-application demo.
 *
 * @module lib/langchain/agents/system-design/form-function-agent
 */

import type { ChatAnthropic } from '@langchain/anthropic';
import { withAgentMetrics } from '@/lib/observability/synthesis-metrics';
import {
  formFunctionMapV1Schema,
  type FormFunctionMapV1,
} from '@/lib/langchain/schemas/module-5';
import type { FfbdV1 } from '@/lib/langchain/schemas/module-3/ffbd-v1';
import type { FmeaEarly } from '@/lib/langchain/schemas/module-8-risk/fmea-early';

/** Words that mark an FMEA mitigation as implying redundancy. */
const REDUNDANCY_KEYWORDS = ['multi-provider', 'fallback', 'redundant', 'redundancy'] as const;

export interface FormFunctionAgentInput {
  ffbd: FfbdV1;
  fmea: FmeaEarly;
  /** Passed-through for NFR weight hooks; not consumed in stub path. */
  nfrsPath: string;
  systemName: string;
  producedBy: string;
  outputPath: string;
  upstreamRefs: FormFunctionMapV1['_upstream_refs'];
}

/**
 * Scan FMEA failure_modes for mitigation language implying redundancy and
 * return the set of F.NN ids that require redundant forms.
 */
export function deriveRedundancyRequiredFunctions(fmea: FmeaEarly): Map<string, string> {
  const result = new Map<string, string>();
  for (const fm of fmea.failure_modes) {
    if (fm.target_ref.kind !== 'function') continue;
    const mitigations = fm.candidate_mitigation.map((m) => m.summary.toLowerCase()).join(' | ');
    const hit = REDUNDANCY_KEYWORDS.some((kw) => mitigations.includes(kw));
    if (hit) {
      result.set(fm.target_ref.ref, fm.id);
    }
  }
  return result;
}

export async function runFormFunctionAgent(
  input: FormFunctionAgentInput,
  opts: { llm?: ChatAnthropic; stub?: FormFunctionMapV1 } = {},
): Promise<FormFunctionMapV1> {
  return withAgentMetrics({ agent: 'form-function' }, () =>
    runFormFunctionAgentInner(input, opts),
  );
}

async function runFormFunctionAgentInner(
  input: FormFunctionAgentInput,
  opts: { llm?: ChatAnthropic; stub?: FormFunctionMapV1 } = {},
): Promise<FormFunctionMapV1> {
  if (!opts.stub) {
    throw new Error('runFormFunctionAgent: live LLM path not implemented; pass opts.stub.');
  }

  // Zod round-trip — catches schema drift + runs all refines
  // (Q=s*(1-k), citations Stevens+Bass, surjectivity, referential).
  const parsed = formFunctionMapV1Schema.parse(opts.stub);

  // Cross-artifact referential: every F.NN in phase-2 resolves in ffbd.v1.
  const ffbdFnIds = new Set(input.ffbd.functions.map((f) => f.id));
  for (const fn of parsed.phase_2_function_inventory.functions) {
    if (!ffbdFnIds.has(fn.id)) {
      throw new Error(
        `form-function-agent: phase-2 function ${fn.id} does not resolve in ffbd.v1.`,
      );
    }
  }

  // Cross-artifact soft-dep: if FMEA flags a function as redundancy-required,
  // phase-1 must carry a redundant form referencing that FM id.
  const redundancyRequired = deriveRedundancyRequiredFunctions(input.fmea);
  for (const [fnId, fmId] of redundancyRequired) {
    const redundantForms = parsed.phase_1_form_inventory.forms.filter(
      (form) => form.redundancy_source_fm === fmId && form.realizes_functions.includes(fnId),
    );
    if (redundantForms.length === 0) {
      throw new Error(
        `form-function-agent: FMEA ${fmId} flags function ${fnId} as redundancy-required, ` +
          `but phase-1 has no form with redundancy_source_fm=${fmId} covering it.`,
      );
    }
  }

  // Top-level metadata consistency.
  if (parsed._output_path !== input.outputPath) {
    throw new Error(
      `form-function-agent: _output_path ${parsed._output_path} != input.outputPath ${input.outputPath}.`,
    );
  }
  if (parsed.system_name !== input.systemName) {
    throw new Error(
      `form-function-agent: system_name ${parsed.system_name} != input.systemName ${input.systemName}.`,
    );
  }
  if (parsed.produced_by !== input.producedBy) {
    throw new Error(
      `form-function-agent: produced_by ${parsed.produced_by} != input.producedBy ${input.producedBy}.`,
    );
  }

  return parsed;
}

export { formFunctionMapV1Schema };
