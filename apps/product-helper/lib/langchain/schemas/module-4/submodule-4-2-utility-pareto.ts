/**
 * Submodule 4.2 — Utility + Pareto (Scoring Pipeline)
 *
 * Consolidates the ranges + rubric + scale + normalization + weights +
 * consensus + min/max phases per `plans/reorg-mapping.md` §4. These
 * together compose the scoring pipeline: criterion → utility value.
 *
 * Merges: phase-6-ranges, phase-7-subjective-rubric,
 * phase-8-measurement-scale, phase-9-normalization,
 * phase-10-criterion-weights, phase-11-consensus, phase-12-min-max-scores.
 *
 * @module lib/langchain/schemas/module-4/submodule-4-2-utility-pareto
 */

export {
  phase6Schema,
  type Phase6Artifact,
  rangeEntrySchema,
  type RangeEntry,
} from './phase-6-ranges';

export {
  phase7Schema,
  type Phase7Artifact,
  subjectiveRubricSchema,
  type SubjectiveRubric,
} from './phase-7-subjective-rubric';

export {
  phase8Schema,
  type Phase8Artifact,
  scaleTypeSchema,
  type ScaleType,
} from './phase-8-measurement-scale';

export {
  phase9Schema,
  type Phase9Artifact,
  normalizationMethodSchema,
  type NormalizationMethod,
  normalizationEntrySchema,
  type NormalizationEntry,
} from './phase-9-normalization';

export {
  phase10Schema,
  type Phase10Artifact,
  criterionWeightSchema,
  type CriterionWeight,
  consensusMethodSchema,
  type ConsensusMethod,
  fmeaSeverityLinkageSchema,
  type FmeaSeverityLinkage,
} from './phase-10-criterion-weights';

export {
  phase11Schema,
  type Phase11Artifact,
  consensusMetricTypeSchema,
  type ConsensusMetricType,
} from './phase-11-consensus';

export {
  phase12Schema,
  type Phase12Artifact,
} from './phase-12-min-max-scores';
