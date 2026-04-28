export {
  evaluatePredicate,
  type Predicate,
  type PredicateContext,
  type PredicateLeaf,
} from './predicate-dsl';

export {
  NFREngineInterpreter,
  type EngineInputSpec,
  type EngineRule,
  type EngineRuleMatch,
  type EngineRuleDefault,
  type EngineDecisionFunction,
  type ConfidenceModifier,
  type DecisionRef,
  type EngineDoc,
  type EngineInputs,
  type EvaluationSignals,
  type AppliedModifier,
  type ComputedOption,
  type EngineOutput,
} from './nfr-engine-interpreter';

export {
  embedBatch,
  embedChunks,
  hashChunk,
  type KBChunkInput,
  type EmbedChunksResult,
} from './kb-embedder';

export {
  searchKB,
  type KBChunkResult,
  type SearchKBFilter,
} from './kb-search';

export {
  ENGINE_CONTRACT_VERSION,
  evaluateWaveE,
  waveEEvaluator,
  type EngineContractVersion,
  type EngineOutputStatus,
  type EvaluateOptions,
  type LlmRefineArgs,
  type LlmRefineFn,
  type WaveEEngineOutput,
} from './wave-e-evaluator';
