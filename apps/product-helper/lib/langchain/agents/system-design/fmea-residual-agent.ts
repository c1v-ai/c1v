/**
 * FMEA-residual Agent (Module 8, Wave 4 / T6)
 *
 * Produces canonical `fmea_residual.v1.json`. Re-scores failure modes against
 * the CHOSEN architecture from `decision_network.v1` (selected_architecture_id
 * → AV.NN), with form anchors from `form_function_map.v1` and SLA/contract
 * detail from `interface_specs.v1`. Every residual FM.NN MUST carry a
 * `predecessor_ref` (either an `fmea_early` FM.NN id that survived
 * mitigation, or `'new'` for failure modes that ONLY emerge in the chosen
 * topology — e.g., cascade failures in chosen queue/event-bus, primary/
 * fallback split-brain, etc.).
 *
 * Per task spec: detectability + recoverability are RE-SCORED on the chosen
 * forms. Rows where weighted_rpn = severity*likelihood*100/detectability
 * exceeds HIGH_RPN_FLAG_THRESHOLD (default 100) are flagged for the
 * synthesizer (T6) to escalate into HoQ rooms + ADRs.
 *
 * Portfolio-demo stance: stub path is the canonical execution path; live LLM
 * path is intentionally not implemented (mirrors fmea-early-agent + T4b
 * decision-net-agent convention).
 *
 * @module lib/langchain/agents/system-design/fmea-residual-agent
 */

import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { withAgentMetrics } from '@/lib/observability/synthesis-metrics';
import {
  fmeaResidualSchema,
  computeWeightedRpn,
  shouldFlagHighRpn,
  HIGH_RPN_FLAG_THRESHOLD,
  type FmeaResidual,
  type ResidualFailureMode,
} from '@/lib/langchain/schemas/module-8-risk/fmea-residual';
import type { FmeaEarly } from '@/lib/langchain/schemas/module-8-risk/fmea-early';
import type { FfbdV1 } from '@/lib/langchain/schemas/module-3/ffbd-v1';
import type { N2Matrix } from '@/lib/langchain/schemas/module-7-interfaces/n2-matrix';
import type { DataFlows } from '@/lib/langchain/schemas/module-1/phase-2-5-data-flows';

/** Minimal structural slice of decision_network we depend on (avoid tight coupling to full M4 type). */
export interface DecisionNetworkSlice {
  selected_architecture_id: string;
  phases: {
    phase_14_decision_nodes: {
      decision_nodes: Array<{
        id: string;
        alternatives: Array<{ id: string; name?: string; description?: string }>;
      }>;
    };
    phase_16_pareto_frontier: {
      architecture_vectors: Array<{
        id: string;
        choices: Array<{ decision_node_id: string; alternative_id: string }>;
        on_frontier?: boolean;
      }>;
    };
  };
}

/** Minimal structural slice of form_function_map we depend on. */
export interface FormFunctionMapSlice {
  phase_1_form_inventory: {
    forms: Array<{
      id: string;
      kind: string;
      realizes_functions: string[];
      redundancy_source_fm?: string;
    }>;
  };
}

/** Minimal structural slice of interface_specs we depend on. */
export interface InterfaceSpecsSlice {
  interfaces: Array<{
    interface_id: string;
    producer: string;
    consumer: string;
    protocol: string;
    sync_style: string;
  }>;
}

export interface FmeaResidualAgentInput {
  fmeaEarly: FmeaEarly;
  decisionNetwork: DecisionNetworkSlice;
  formFunctionMap: FormFunctionMapSlice;
  interfaceSpecs: InterfaceSpecsSlice;
  ffbd: FfbdV1;
  n2: N2Matrix;
  dataFlows: DataFlows;
  ratingScalesVersion: string;
  systemName: string;
  producedBy: string;
  outputPath: string;
  upstreamRefs: FmeaResidual['_upstream_refs'];
  highRpnFlagThreshold?: number;
}

/**
 * Recompute rpn / weighted_rpn / flagged_high_rpn from severity, likelihood,
 * detectability so callers cannot ship inconsistent rows.
 */
export function normalizeResidualRow(
  row: ResidualFailureMode,
  threshold: number = HIGH_RPN_FLAG_THRESHOLD,
): ResidualFailureMode {
  const rpn = row.severity * row.likelihood;
  const weighted_rpn = computeWeightedRpn(row.severity, row.likelihood, row.detectability);
  const flagged_high_rpn = shouldFlagHighRpn(
    row.severity,
    row.likelihood,
    row.detectability,
    threshold,
  );
  return { ...row, rpn, weighted_rpn, flagged_high_rpn };
}

/** Build the summary roll-up the synthesizer reads. */
export function summarizeResidual(
  rows: ResidualFailureMode[],
): FmeaResidual['summary'] {
  const by_criticality: FmeaResidual['summary']['by_criticality'] = {
    LOW: 0,
    'MEDIUM LOW': 0,
    MEDIUM: 0,
    'MEDIUM HIGH': 0,
    HIGH: 0,
  };
  let new_modes = 0;
  let surviving_modes = 0;
  let flagged_high_rpn = 0;
  for (const r of rows) {
    by_criticality[r.criticality_category] += 1;
    if (r.predecessor_ref === 'new') new_modes += 1;
    else surviving_modes += 1;
    if (r.flagged_high_rpn) flagged_high_rpn += 1;
  }
  return { total: rows.length, new_modes, surviving_modes, flagged_high_rpn, by_criticality };
}

export async function runFmeaResidualAgent(
  input: FmeaResidualAgentInput,
  opts: { llm?: BaseChatModel; stub?: FmeaResidual } = {},
): Promise<FmeaResidual> {
  return withAgentMetrics({ agent: 'fmea-residual' }, () =>
    runFmeaResidualAgentInner(input, opts),
  );
}

async function runFmeaResidualAgentInner(
  input: FmeaResidualAgentInput,
  opts: { llm?: BaseChatModel; stub?: FmeaResidual } = {},
): Promise<FmeaResidual> {
  if (!opts.stub) {
    throw new Error('runFmeaResidualAgent: live LLM path not implemented; pass opts.stub.');
  }

  const threshold = input.highRpnFlagThreshold ?? HIGH_RPN_FLAG_THRESHOLD;

  // Recompute derived numeric fields so we never ship a hand-edit drift.
  const normalized: FmeaResidual = {
    ...opts.stub,
    high_rpn_flag_threshold: threshold,
    failure_modes: opts.stub.failure_modes.map((r) => normalizeResidualRow(r, threshold)),
  };
  normalized.summary = summarizeResidual(normalized.failure_modes);

  const parsed = fmeaResidualSchema.parse(normalized);

  // ---- Cross-artifact resolver checks --------------------------------
  const fnIds = new Set(input.ffbd.functions.map((f) => f.id));
  const ifIds = new Set(input.n2.rows.map((r) => r.id));
  const deIds = new Set(input.dataFlows.entries.map((e) => e.id));
  const formIds = new Set(input.formFunctionMap.phase_1_form_inventory.forms.map((f) => f.id));
  const earlyIds = new Set(input.fmeaEarly.failure_modes.map((m) => m.id));
  const dnIds = new Set(
    input.decisionNetwork.phases.phase_14_decision_nodes.decision_nodes.map((d) => d.id),
  );
  const avIds = new Set(
    input.decisionNetwork.phases.phase_16_pareto_frontier.architecture_vectors.map((a) => a.id),
  );

  if (parsed.selected_architecture_id !== input.decisionNetwork.selected_architecture_id) {
    throw new Error(
      `fmea-residual-agent: selected_architecture_id ${parsed.selected_architecture_id} != decision_network ${input.decisionNetwork.selected_architecture_id}`,
    );
  }
  if (!avIds.has(parsed.selected_architecture_id)) {
    throw new Error(
      `fmea-residual-agent: selected_architecture_id ${parsed.selected_architecture_id} not in phase_16 architecture_vectors`,
    );
  }

  for (const fm of parsed.failure_modes) {
    // target_ref resolves
    const { kind, ref } = fm.target_ref;
    const targetOk =
      (kind === 'function' && fnIds.has(ref)) ||
      (kind === 'interface' && ifIds.has(ref)) ||
      (kind === 'data_flow' && deIds.has(ref));
    if (!targetOk) {
      throw new Error(`fmea-residual-agent: ${fm.id} target_ref ${kind}:${ref} unresolved`);
    }

    // form anchors resolve
    for (const f of fm.form_refs) {
      if (!formIds.has(f.form_id)) {
        throw new Error(`fmea-residual-agent: ${fm.id} form_ref ${f.form_id} not in form_function_map`);
      }
    }

    // predecessor_ref: 'new' OR existing fmea_early FM.NN
    if (fm.predecessor_ref !== 'new' && !earlyIds.has(fm.predecessor_ref)) {
      throw new Error(
        `fmea-residual-agent: ${fm.id} predecessor_ref ${fm.predecessor_ref} not in fmea_early`,
      );
    }

    // 'new' rows MUST anchor a decision node so we know WHY this is new
    if (fm.predecessor_ref === 'new' && !fm.decision_anchor) {
      throw new Error(
        `fmea-residual-agent: ${fm.id} predecessor_ref='new' requires decision_anchor`,
      );
    }
    if (fm.decision_anchor) {
      if (!dnIds.has(fm.decision_anchor.decision_node_id)) {
        throw new Error(
          `fmea-residual-agent: ${fm.id} decision_anchor ${fm.decision_anchor.decision_node_id} not in phase_14`,
        );
      }
      if (!avIds.has(fm.decision_anchor.architecture_vector_id)) {
        throw new Error(
          `fmea-residual-agent: ${fm.id} decision_anchor AV ${fm.decision_anchor.architecture_vector_id} not in phase_16`,
        );
      }
    }

    // arithmetic guards (defensive — normalizeResidualRow already ran)
    if (fm.rpn !== fm.severity * fm.likelihood) {
      throw new Error(`fmea-residual-agent: ${fm.id} rpn ${fm.rpn} != ${fm.severity}*${fm.likelihood}`);
    }
    const expectedWeighted = computeWeightedRpn(fm.severity, fm.likelihood, fm.detectability);
    if (Math.abs(fm.weighted_rpn - expectedWeighted) > 1e-9) {
      throw new Error(
        `fmea-residual-agent: ${fm.id} weighted_rpn ${fm.weighted_rpn} != ${expectedWeighted}`,
      );
    }
    const expectedFlag = shouldFlagHighRpn(fm.severity, fm.likelihood, fm.detectability, threshold);
    if (fm.flagged_high_rpn !== expectedFlag) {
      throw new Error(
        `fmea-residual-agent: ${fm.id} flagged_high_rpn ${fm.flagged_high_rpn} != ${expectedFlag}`,
      );
    }
  }

  return parsed;
}

export { fmeaResidualSchema };
export const FMEA_RESIDUAL_AGENT_VERSION = '1.0.0-t6';

import type { OpenQuestionEvent } from '@/lib/chat/system-question-bridge.types';

/**
 * Emitter contract — runtime caller supplies the bridge.surfaceOpenQuestion
 * binding. Agent calls `emit` for residual flag decisions that fall below
 * the confidence threshold (e.g. ambiguous detectability scoring on a
 * surviving FM, unresolved decision_anchor on a 'new' FM).
 */
export type FmeaResidualOpenQuestionEmitter = (
  ev: Omit<OpenQuestionEvent, 'source'>,
) => Promise<unknown>;

/** Confidence threshold for residual FM scoring decisions. */
export const FMEA_RESIDUAL_OPEN_QUESTION_CONFIDENCE_THRESHOLD = 0.9;

/**
 * Decision-point hook for low-confidence residual FM rows. When emit is
 * provided AND final_confidence < threshold, surfaces the question and
 * returns true so the caller can either drop or placeholder the row.
 */
export async function maybeSurfaceResidualOpenQuestion(args: {
  emit?: FmeaResidualOpenQuestionEmitter;
  project_id: number;
  final_confidence: number;
  question: string;
  computed_options?: unknown[];
  math_trace?: string;
  threshold?: number;
}): Promise<boolean> {
  const t = args.threshold ?? FMEA_RESIDUAL_OPEN_QUESTION_CONFIDENCE_THRESHOLD;
  if (!args.emit || args.final_confidence >= t) return false;
  await args.emit({
    project_id: args.project_id,
    question: args.question,
    computed_options: args.computed_options,
    math_trace: args.math_trace,
  });
  return true;
}
