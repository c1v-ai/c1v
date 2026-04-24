/**
 * Submodule 3.3 — Handoff (FFBD → Decision Matrix)
 *
 * Re-exports the FFBD→DM bridge schema per `plans/reorg-mapping.md` §3.
 * Gate C handoff/bridge phases (pending) should register against this
 * submodule.
 *
 * Source: `phase-11-ffbd-to-decision-matrix.ts` (registry slug preserved).
 *
 * @module lib/langchain/schemas/module-3/submodule-3-3-handoff
 */

export {
  phase11Schema,
  type Phase11Artifact,
  flatFunctionSchema,
  type FlatFunction,
  candidateCriterionSchema,
  type CandidateCriterion,
  candidateDimensionSchema,
  type CandidateDimension,
  alternativeSchema,
  type Alternative,
} from './phase-11-ffbd-to-decision-matrix';
