/**
 * Submodule 4.3 — Sensitivity + Handoff
 *
 * Consolidates score interpretation and the DM→QFD bridge per
 * `plans/reorg-mapping.md` §4. `phase-17-dm-to-qfd-bridge` is a SHIPPED
 * artifact — its slug (`phase-17-dm-to-qfd-bridge`) is preserved verbatim
 * in the module-4 registry.
 *
 * Merges: phase-13-score-interpretation, phase-17-dm-to-qfd-bridge.
 *
 * @module lib/langchain/schemas/module-4/submodule-4-3-sensitivity-handoff
 */

export {
  phase13Schema,
  type Phase13Artifact,
  optionWeightedScoreSchema,
  type OptionWeightedScore,
  interpretationThresholdSchema,
  type InterpretationThreshold,
} from './phase-13-score-interpretation';

export {
  phase17Schema,
  type Phase17Artifact,
  selectedOptionSchema,
  type SelectedOption,
  criterionWeightOutputSchema,
  type CriterionWeightOutput,
  scoringSnapshotSchema,
  type ScoringSnapshot,
  scoringSnapshotCellSchema,
  type ScoringSnapshotCell,
} from './phase-17-dm-to-qfd-bridge';
