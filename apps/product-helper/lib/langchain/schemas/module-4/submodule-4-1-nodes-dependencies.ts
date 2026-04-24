/**
 * Submodule 4.1 — Nodes + Dependencies (Input Side of Decision Network)
 *
 * Consolidates the envelope + criteria + pitfalls + measures + software-
 * specific phases per `plans/reorg-mapping.md` §4. These define the nodes
 * of the decision network and their evaluation axes.
 *
 * Merges: phase-1-dm-envelope, phase-3-performance-criteria,
 * phase-4-pc-pitfalls, phase-5-direct-scaled-measures,
 * phase-18-software-specific-dm.
 *
 * @module lib/langchain/schemas/module-4/submodule-4-1-nodes-dependencies
 */

export {
  phase1Schema,
  type Phase1Artifact,
  decisionContextSchema,
  type DecisionContext,
} from './phase-1-dm-envelope';

export {
  phase3Schema,
  type Phase3Artifact,
  performanceCriterionSchema,
  type PerformanceCriterion,
  pcCategorySchema,
  type PcCategory,
  pcDirectionSchema,
  type PcDirection,
  pcMeasureTypeSchema,
  type PcMeasureType,
} from './phase-3-performance-criteria';

export {
  phase4Schema,
  type Phase4Artifact,
  pitfallCheckSchema,
  type PitfallCheck,
  pitfallTypeSchema,
  type PitfallType,
} from './phase-4-pc-pitfalls';

export {
  phase5Schema,
  type Phase5Artifact,
  rubricAnchorSchema,
  type RubricAnchor,
  scaledMeasureSchema,
  type ScaledMeasure,
  directMeasureSchema,
  type DirectMeasure,
  measureEntrySchema,
  type MeasureEntry,
} from './phase-5-direct-scaled-measures';

export {
  phase18Schema,
  type Phase18Artifact,
  softwareCriterionLinkageSchema,
  type SoftwareCriterionLinkage,
} from './phase-18-software-specific-dm';
