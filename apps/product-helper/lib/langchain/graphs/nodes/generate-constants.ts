/**
 * GENERATE_constants — M2 constants row generation, dual-impl (DI swap).
 *
 * Mirror of `generate-nfr.ts` for the constants slice of M2. See
 * `generate-nfr.ts` for the full DI rationale + Wave-A↔Wave-E contract pin
 * details. Both nodes share the swap mechanism LOCKED in the team context.
 *
 * Engine story: `m2-constants.json`.
 *
 * @module lib/langchain/graphs/nodes/generate-constants
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

const STORY_ID = 'm2-constants';
const MODULE = 'm2' as const;

export type ConstantsImpl = 'llm' | 'engine';

export interface GenerateConstantsLlmAgent {
  generate(state: IntakeState): Promise<{ constants: unknown[] }>;
}

export interface CreateGenerateConstantsNodeOptions {
  nfrImpl: ConstantsImpl;
  llmAgent?: GenerateConstantsLlmAgent;
}

export function createGenerateConstantsNode(
  options: CreateGenerateConstantsNodeOptions,
): (state: IntakeState) => Promise<{ constantsEnvelope: NfrEngineContractV1 }> {
  return async (state) => {
    if (options.nfrImpl === 'llm') {
      return runLlmOnly(state, options.llmAgent);
    }
    return runEngineFirst(state);
  };
}

async function runLlmOnly(
  state: IntakeState,
  agent: GenerateConstantsLlmAgent | undefined,
): Promise<{ constantsEnvelope: NfrEngineContractV1 }> {
  recordSynthesisMetricsTotal({
    module: MODULE,
    impl: 'llm-only',
    llm_invoked: true,
    project_id: state.projectId,
  });

  if (!agent) {
    return {
      constantsEnvelope: {
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

  const result = await agent.generate(state);
  return {
    constantsEnvelope: {
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

async function runEngineFirst(
  state: IntakeState,
): Promise<{ constantsEnvelope: NfrEngineContractV1 }> {
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
        agentId: 'generate_constants',
        targetArtifact: 'constants',
        storyId: STORY_ID,
        engineVersion: 'v1',
        modelVersion: 'deterministic-rule-tree',
      },
    },
  );

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

  const allReady =
    evaluation.total > 0 && evaluation.ready_count === evaluation.total;
  if (allReady) {
    return {
      constantsEnvelope: {
        nfr_engine_contract_version: NFR_ENGINE_CONTRACT_VERSION,
        synthesized_at: new Date().toISOString(),
        inputs_hash: inputsHash,
        status: 'ok',
        result: { constants: evaluation.decisions },
      },
    };
  }

  return {
    constantsEnvelope: {
      nfr_engine_contract_version: NFR_ENGINE_CONTRACT_VERSION,
      synthesized_at: new Date().toISOString(),
      inputs_hash: inputsHash,
      status: 'needs_user_input',
      computed_options: [],
      math_trace: `engine-first: ${evaluation.ready_count}/${evaluation.total} ready, ${evaluation.needs_input_count} needs_user_input`,
    },
  };
}
