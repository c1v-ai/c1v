/**
 * GENERATE_nfr — M2 NFR row generation, dual-impl (DI swap).
 *
 * Wave-A↔Wave-E contract pin: every call returns an `NfrEngineContractV1`
 * envelope (success or needs_user_input). The envelope shape is FROZEN at
 * `nfr_engine_contract_version: 'v1'` per master plan v2.1 lines 498–504.
 *
 * Two implementations, swappable via `nfrImpl: 'llm' | 'engine'`:
 *
 *   1. `'llm'` (v2.1 default pre-swap):
 *        Invokes the v2.1 LLM-only NFR agent. Always emits `synthesis_metrics_total{module="m2",impl="llm-only",llm_invoked="true"}`.
 *
 *   2. `'engine'` (v2.2 default post-swap, EC-V21-E.12):
 *        Walks `m2-nfr.json` story tree via `evaluateEngineStory` →
 *        `evaluateWaveE`. The 2-band routing in wave-e-evaluator decides:
 *          - confidence ≥ 0.90       → 'ready'             (engine-only, no LLM)
 *          - 0.60 ≤ c < 0.90 + assist → llm-refine band     (LLM invoked)
 *          - otherwise                → 'needs_user_input'  (engine-only, no LLM)
 *        The `llm_invoked` label captures whether the refine band fired.
 *
 * The DI surface (`createGenerateNfrNode({ nfrImpl, llmAgent })`) is the
 * v2.1↔v2.2 swap mechanism LOCKED in the team context. Both impls produce
 * the same Zod-pinned envelope so qa-e-verifier's implementation-independence
 * proof passes for both.
 *
 * @module lib/langchain/graphs/nodes/generate-nfr
 */

import { sha256Of } from '../contracts/inputs-hash';
import {
  NFR_ENGINE_CONTRACT_VERSION,
  type NfrEngineContractV1,
} from '../contracts/nfr-engine-contract-v1';
import { recordSynthesisMetricsTotal } from '@/lib/observability/synthesis-metrics';
import type { IntakeState } from '../types';
import {
  evaluateEngineStory,
  type SubstrateEvaluation,
} from './_engine-substrate';
import {
  buildProjectContextPreamble,
  summarizeUpstream,
  NFR_RULES,
} from '../../prompts';
import { renderAtlasPriors } from '../../atlas-loader';
import { intakePromptV2 } from '@/lib/config/feature-flags';

const STORY_ID = 'm2-nfr';
const MODULE = 'm2' as const;

export type NfrImpl = 'llm' | 'engine';

export interface GenerateNfrLlmAgent {
  /**
   * v2.1 LLM-only NFR agent contract: takes intake-shape input, returns
   * the NFR row. Per the contract pin, this MUST yield an NFR slice that
   * conforms to the M2 schema.
   *
   * Optional second argument `promptContext` is the V2 prompt body assembled
   * from shared utilities (preamble + upstream summary + atlas priors +
   * NFR_RULES). It is supplied only when `INTAKE_PROMPT_V2=true`. Agents that
   * use it should set their LLM `maxTokens` cap to 6000 on the V2 path; the
   * legacy path retains the agent's pre-existing cap.
   */
  generate(
    state: IntakeState,
    promptContext?: string,
  ): Promise<{ nfrs: unknown[]; constants?: unknown[] }>;
}

/**
 * Build the V2 NFR prompt context from shared utilities. Exported for tests.
 */
export function buildNfrPromptContextV2(state: IntakeState): string {
  const preamble = buildProjectContextPreamble({
    projectName: state.projectName,
    projectVision: state.projectVision,
    projectType: state.projectType ?? null,
  });
  const upstream = summarizeUpstream({ extractedData: state.extractedData }, [
    'actors',
    'useCases',
    'systemBoundaries',
    'ffbd',
  ]);
  const priors = renderAtlasPriors(state.projectType ?? 'unknown', [
    'latency',
    'availability',
  ]);
  return [preamble, upstream, priors.text, NFR_RULES].join('\n\n');
}

export interface CreateGenerateNfrNodeOptions {
  nfrImpl: NfrImpl;
  /**
   * v2.1 LLM-only agent. REQUIRED when `nfrImpl === 'llm'`. Tests inject
   * a stub; production wiring (post-default-flip) bypasses this field
   * entirely.
   */
  llmAgent?: GenerateNfrLlmAgent;
}

/**
 * Factory: returns a graph-node compatible function whose impl is bound at
 * graph-build time. The `nfrImpl` parameter is the LOCKED swap mechanism
 * (no env-var, no fixture-override).
 */
export function createGenerateNfrNode(
  options: CreateGenerateNfrNodeOptions,
): (state: IntakeState) => Promise<{ nfrEnvelope: NfrEngineContractV1 }> {
  return async (state) => {
    if (options.nfrImpl === 'llm') {
      return runLlmOnly(state, options.llmAgent);
    }
    return runEngineFirst(state);
  };
}

// ─────────────────────────────────────────────────────────────────────────
// llm-only impl — v2.1 path
// ─────────────────────────────────────────────────────────────────────────

async function runLlmOnly(
  state: IntakeState,
  agent: GenerateNfrLlmAgent | undefined,
): Promise<{ nfrEnvelope: NfrEngineContractV1 }> {
  // The 'llm' impl ALWAYS counts as an LLM invocation in the baseline.
  recordSynthesisMetricsTotal({
    module: MODULE,
    impl: 'llm-only',
    llm_invoked: true,
    project_id: state.projectId,
  });

  if (!agent) {
    // Pre-swap baseline: v2.1 didn't have a wired NFR LLM agent today.
    // Emit a needs_user_input envelope so the caller can route to the
    // chat-bridge if they choose; envelope still parses against v1.
    return {
      nfrEnvelope: {
        nfr_engine_contract_version: NFR_ENGINE_CONTRACT_VERSION,
        synthesized_at: new Date().toISOString(),
        inputs_hash: sha256Of({
          impl: 'llm-only',
          projectId: state.projectId,
          extractedData: state.extractedData ?? {},
        }),
        status: 'needs_user_input',
        computed_options: [],
        math_trace: 'llm-only impl: no LLM agent wired (v2.1 baseline gap)',
      },
    };
  }

  // V2: build a fresh prompt context from shared utilities and pass it to
  // the injected agent. Flag-off path passes nothing (legacy agent prompt).
  const promptContext = intakePromptV2()
    ? buildNfrPromptContextV2(state)
    : undefined;
  const result = await agent.generate(state, promptContext);
  return {
    nfrEnvelope: {
      nfr_engine_contract_version: NFR_ENGINE_CONTRACT_VERSION,
      synthesized_at: new Date().toISOString(),
      inputs_hash: sha256Of({
        impl: 'llm-only',
        projectId: state.projectId,
        extractedData: state.extractedData ?? {},
      }),
      status: 'ok',
      result,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// engine-first impl — v2.2 path (default post-swap)
// ─────────────────────────────────────────────────────────────────────────

async function runEngineFirst(
  state: IntakeState,
): Promise<{ nfrEnvelope: NfrEngineContractV1 }> {
  const evaluation: SubstrateEvaluation = await evaluateEngineStory(
    STORY_ID,
    {
      projectId: state.projectId,
      messages: state.messages,
      extractedData: state.extractedData,
      projectName: state.projectName,
      projectVision: state.projectVision,
    },
    {
      auditContext: {
        projectId: state.projectId,
        agentId: 'generate_nfr',
        targetArtifact: 'nfrs',
        storyId: STORY_ID,
        engineVersion: 'v1',
        modelVersion: 'deterministic-rule-tree',
      },
    },
  );

  // The refine band is the only path where engine-first invokes the LLM.
  // Detect by counting decisions whose status is neither 'ready' nor
  // 'needs_user_input' — the wave-e-evaluator's stub-refine downgrades to
  // needs_user_input, so the band is captured by the underlying
  // `llm_assist` flag on the decision being true AND confidence between
  // the thresholds. We approximate via decision-status: any 'failed' or
  // any output that came from the refine path. Conservative: when ANY
  // decision in the story routed through refine, label llm_invoked=true.
  //
  // (The substrate already increments per-decision; aggregate here for
  // the per-call label.)
  const llmInvoked = evaluation.decisions.some(
    (d) => d.status !== 'ready' && d.status !== 'needs_user_input',
  );

  recordSynthesisMetricsTotal({
    module: MODULE,
    impl: 'engine-first',
    llm_invoked: llmInvoked,
    project_id: state.projectId,
  });

  const inputsHash = sha256Of({
    impl: 'engine-first',
    storyId: STORY_ID,
    projectId: state.projectId,
    extractedData: state.extractedData ?? {},
  });

  // Ready-count threshold: if every decision evaluated 'ready', emit ok;
  // else emit needs_user_input with the unresolved decisions surfaced.
  const allReady =
    evaluation.total > 0 && evaluation.ready_count === evaluation.total;
  if (allReady) {
    return {
      nfrEnvelope: {
        nfr_engine_contract_version: NFR_ENGINE_CONTRACT_VERSION,
        synthesized_at: new Date().toISOString(),
        inputs_hash: inputsHash,
        status: 'ok',
        result: { nfrs: evaluation.decisions, constants: [] },
      },
    };
  }

  return {
    nfrEnvelope: {
      nfr_engine_contract_version: NFR_ENGINE_CONTRACT_VERSION,
      synthesized_at: new Date().toISOString(),
      inputs_hash: inputsHash,
      status: 'needs_user_input',
      computed_options: [],
      math_trace: `engine-first: ${evaluation.ready_count}/${evaluation.total} ready, ${evaluation.needs_input_count} needs_user_input`,
    },
  };
}
