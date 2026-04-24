/**
 * Submodule 3.1 — Hierarchy (M2 → M3 Ingest)
 *
 * Re-exports the phase-0a ingest schema that establishes the M2→M3 FFBD
 * hierarchy per `plans/reorg-mapping.md` §3. Gate C hierarchy + parent-
 * child phases (pending) should register against this submodule.
 *
 * Source: `phase-0a-ingest-m2-handoff.ts` (registry slug preserved).
 *
 * @module lib/langchain/schemas/module-3/submodule-3-1-hierarchy
 */

export {
  phase0aSchema,
  type Phase0aArtifact,
  externalActorSchema,
  type ExternalActor,
  functionCandidateSchema,
  type FunctionCandidate,
  useCaseFlowSchema,
  type UseCaseFlow,
  carriedConstantSchema,
  type CarriedConstant,
  crossCuttingConcernSchema,
  type CrossCuttingConcern,
} from './phase-0a-ingest-m2-handoff';
