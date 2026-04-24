/**
 * Module 4 — Barrel Re-Export + Registry
 *
 * Single entry point for all Module 4 (Decision Matrix) phase schemas.
 * Used by
 *   - `lib/langchain/schemas/generate-all.ts` to emit JSON Schemas into
 *     `lib/langchain/schemas/generated/module-4/`
 *   - the preload-bundle endpoint at `app/api/schemas/module-4/route.ts`
 *   - agent contexts (tech-stack-agent, infrastructure-agent) via named
 *     re-exports
 *
 * The `MODULE_4_PHASE_SCHEMAS` registry is the canonical source list;
 * adding a phase is a 2-line edit here plus one new phase file.
 *
 * M2 `_shared.ts` primitives are re-exported via the module-4 _shared
 * helper so M4 consumers have one import surface. **M2 + M3 are read-only**
 * from M4's perspective; M4 never edits either.
 *
 * Phase numbering matches F13/4 methodology filenames. Phases 0, 2, 14,
 * 15, 16 are envelope-only acks (calibration / glossary / checklist /
 * instructions — no independent JSON emission) per plan §4 decision #1.
 *
 * **Layout (post `plans/reorg-mapping.md` §4 reorg):** phase schemas are
 * grouped under 3 submodule files:
 *   - `submodule-4-1-nodes-dependencies.ts` — phases 1,3,4,5,18
 *   - `submodule-4-2-utility-pareto.ts`     — phases 6,7,8,9,10,11,12
 *   - `submodule-4-3-sensitivity-handoff.ts` — phases 13,17
 *
 * Registry slugs are preserved verbatim — only the TS source path moved.
 *
 * @module lib/langchain/schemas/module-4
 */

import type { z } from 'zod';
import {
  phase1Schema,
  phase3Schema,
  phase4Schema,
  phase5Schema,
  phase18Schema,
} from './submodule-4-1-nodes-dependencies';
import {
  phase6Schema,
  phase7Schema,
  phase8Schema,
  phase9Schema,
  phase10Schema,
  phase11Schema,
  phase12Schema,
} from './submodule-4-2-utility-pareto';
import {
  phase13Schema,
  phase17Schema,
} from './submodule-4-3-sensitivity-handoff';

// Decision-net rework (T4b Wave 3)
import { phase14Schema } from './phase-14-decision-nodes';
import { phase15Schema } from './phase-15-decision-dependencies';
import { phase16Schema } from './phase-16-pareto-frontier';
import { phase17bSchema } from './phase-17b-sensitivity-analysis';
import { phase19Schema } from './phase-19-empirical-prior-binding';
import { phases11to13VectorScoresSchema } from './phases-11-13-vector-scores';

export * from './phase-14-decision-nodes';
export * from './phase-15-decision-dependencies';
export * from './phase-16-pareto-frontier';
export * from './phase-17b-sensitivity-analysis';
export * from './phase-19-empirical-prior-binding';
export * from './phases-11-13-vector-scores';

// M4-specific envelope + metadata (widened phase_number)
export * from './_shared';

// Phase exports — via submodule barrels (registry slugs preserved verbatim)
export {
  phase1Schema,
  type Phase1Artifact,
  decisionContextSchema,
  type DecisionContext,
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
  phase4Schema,
  type Phase4Artifact,
  pitfallCheckSchema,
  type PitfallCheck,
  pitfallTypeSchema,
  type PitfallType,
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
  phase18Schema,
  type Phase18Artifact,
  softwareCriterionLinkageSchema,
  type SoftwareCriterionLinkage,
} from './submodule-4-1-nodes-dependencies';

export {
  phase6Schema,
  type Phase6Artifact,
  rangeEntrySchema,
  type RangeEntry,
  phase7Schema,
  type Phase7Artifact,
  subjectiveRubricSchema,
  type SubjectiveRubric,
  phase8Schema,
  type Phase8Artifact,
  scaleTypeSchema,
  type ScaleType,
  phase9Schema,
  type Phase9Artifact,
  normalizationMethodSchema,
  type NormalizationMethod,
  normalizationEntrySchema,
  type NormalizationEntry,
  phase10Schema,
  type Phase10Artifact,
  criterionWeightSchema,
  type CriterionWeight,
  consensusMethodSchema,
  type ConsensusMethod,
  fmeaSeverityLinkageSchema,
  type FmeaSeverityLinkage,
  phase11Schema,
  type Phase11Artifact,
  consensusMetricTypeSchema,
  type ConsensusMetricType,
  phase12Schema,
  type Phase12Artifact,
} from './submodule-4-2-utility-pareto';

export {
  phase13Schema,
  type Phase13Artifact,
  optionWeightedScoreSchema,
  type OptionWeightedScore,
  interpretationThresholdSchema,
  type InterpretationThreshold,
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
} from './submodule-4-3-sensitivity-handoff';

/**
 * Canonical registry consumed by `generate-all.ts` + the preload bundle.
 * Each entry owns:
 *   - `slug`        — stable identifier used in filenames + URLs
 *   - `name`        — TitleCase name emitted into the JSON Schema title
 *   - `phaseNumber` — methodology phase (F13/4 number)
 *   - `zodSchema`   — source of truth (drift-gated by CI)
 */
export interface Module4PhaseEntry {
  slug: string;
  name: string;
  phaseNumber: number;
  zodSchema: z.ZodType;
}

export const MODULE_4_PHASE_SCHEMAS: readonly Module4PhaseEntry[] = [
  {
    slug: 'phase-1-dm-envelope',
    name: 'Phase1DmEnvelope',
    phaseNumber: 1,
    zodSchema: phase1Schema,
  },
  {
    slug: 'phase-3-performance-criteria',
    name: 'Phase3PerformanceCriteria',
    phaseNumber: 3,
    zodSchema: phase3Schema,
  },
  {
    slug: 'phase-4-pc-pitfalls',
    name: 'Phase4PcPitfalls',
    phaseNumber: 4,
    zodSchema: phase4Schema,
  },
  {
    slug: 'phase-5-direct-scaled-measures',
    name: 'Phase5DirectScaledMeasures',
    phaseNumber: 5,
    zodSchema: phase5Schema,
  },
  {
    slug: 'phase-6-ranges',
    name: 'Phase6Ranges',
    phaseNumber: 6,
    zodSchema: phase6Schema,
  },
  {
    slug: 'phase-7-subjective-rubric',
    name: 'Phase7SubjectiveRubric',
    phaseNumber: 7,
    zodSchema: phase7Schema,
  },
  {
    slug: 'phase-8-measurement-scale',
    name: 'Phase8MeasurementScale',
    phaseNumber: 8,
    zodSchema: phase8Schema,
  },
  {
    slug: 'phase-9-normalization',
    name: 'Phase9Normalization',
    phaseNumber: 9,
    zodSchema: phase9Schema,
  },
  {
    slug: 'phase-10-criterion-weights',
    name: 'Phase10CriterionWeights',
    phaseNumber: 10,
    zodSchema: phase10Schema,
  },
  {
    slug: 'phase-11-consensus',
    name: 'Phase11Consensus',
    phaseNumber: 11,
    zodSchema: phase11Schema,
  },
  {
    slug: 'phase-12-min-max-scores',
    name: 'Phase12MinMaxScores',
    phaseNumber: 12,
    zodSchema: phase12Schema,
  },
  {
    slug: 'phase-13-score-interpretation',
    name: 'Phase13ScoreInterpretation',
    phaseNumber: 13,
    zodSchema: phase13Schema,
  },
  {
    slug: 'phase-17-dm-to-qfd-bridge',
    name: 'Phase17DmToQfdBridge',
    phaseNumber: 17,
    zodSchema: phase17Schema,
  },
  {
    slug: 'phase-18-software-specific-dm',
    name: 'Phase18SoftwareSpecificDm',
    phaseNumber: 18,
    zodSchema: phase18Schema,
  },
  // Decision-net rework (T4b Wave 3) ─────────────────────────────────────
  {
    slug: 'phase-14-decision-nodes',
    name: 'Phase14DecisionNodes',
    phaseNumber: 14,
    zodSchema: phase14Schema,
  },
  {
    slug: 'phase-15-decision-dependencies',
    name: 'Phase15DecisionDependencies',
    phaseNumber: 15,
    zodSchema: phase15Schema,
  },
  {
    slug: 'phase-16-pareto-frontier',
    name: 'Phase16ParetoFrontier',
    phaseNumber: 16,
    zodSchema: phase16Schema,
  },
  {
    slug: 'phase-17b-sensitivity-analysis',
    name: 'Phase17bSensitivityAnalysis',
    phaseNumber: 17,
    zodSchema: phase17bSchema,
  },
  {
    slug: 'phase-19-empirical-prior-binding',
    name: 'Phase19EmpiricalPriorBinding',
    phaseNumber: 18,
    zodSchema: phase19Schema,
  },
  {
    slug: 'phases-11-13-vector-scores',
    name: 'Phases11To13VectorScores',
    phaseNumber: 13,
    zodSchema: phases11to13VectorScoresSchema,
  },
] as const;
