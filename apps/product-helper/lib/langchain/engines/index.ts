/**
 * lib/langchain/engines/ — barrel
 *
 * **Public API convention (Wave E, 2026-04-27):**
 *
 *   ✅ For new code, use `evaluateWaveE` / `waveEEvaluator` from `wave-e-evaluator.ts`.
 *      That entry point applies the v2.2 contract pin envelope, the LOCKED
 *      0.90 / 0.60 confidence bands, and the LLM-refine hook (master plan
 *      v2.1 lines 445 + 498–504).
 *
 *   ⚠️ The lower-level class is exported as `_NFREngineInterpreterCore` (underscore
 *      = "you are intentionally bypassing the v2.2 wrapper"). Use only when you
 *      specifically need rule-level matching without the Wave-E envelope (e.g.,
 *      offline rule-correctness verification in `scripts/verify-t3.ts`, or the
 *      audit-writer canonical-hash test path).
 *
 *   New Wave-E callers (engine-prod-swap, agent-greenfield-refactor, the 7 P10
 *   greenfield generators) MUST go through `evaluateWaveE`. Importing
 *   `_NFREngineInterpreterCore` from a Wave-E path triggers a code-review flag.
 *
 * The class definition in `nfr-engine-interpreter.ts` keeps its original name
 * (`NFREngineInterpreter`) so the existing 3 direct-path consumers (verify-t3,
 * decision-audit's audit-writer, TC1's literal pin in module-5/_shared.ts)
 * remain unchanged. Bypass enforcement applies to barrel consumers only.
 */

export {
  evaluatePredicate,
  type Predicate,
  type PredicateContext,
  type PredicateLeaf,
} from './predicate-dsl';

export {
  // Underscore-prefixed re-export — see convention note above. Direct-path
  // imports (`from './nfr-engine-interpreter'`) keep the original name.
  NFREngineInterpreter as _NFREngineInterpreterCore,
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
