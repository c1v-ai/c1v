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
 * @module lib/langchain/schemas/module-4
 */

import type { z } from 'zod';
import { phase1Schema } from './phase-1-dm-envelope';
import { phase3Schema } from './phase-3-performance-criteria';
import { phase4Schema } from './phase-4-pc-pitfalls';
import { phase5Schema } from './phase-5-direct-scaled-measures';
import { phase6Schema } from './phase-6-ranges';
import { phase7Schema } from './phase-7-subjective-rubric';
import { phase8Schema } from './phase-8-measurement-scale';
import { phase9Schema } from './phase-9-normalization';
import { phase10Schema } from './phase-10-criterion-weights';
import { phase11Schema } from './phase-11-consensus';
import { phase12Schema } from './phase-12-min-max-scores';
import { phase13Schema } from './phase-13-score-interpretation';
import { phase17Schema } from './phase-17-dm-to-qfd-bridge';
import { phase18Schema } from './phase-18-software-specific-dm';

// M4-specific envelope + metadata (widened phase_number)
export * from './_shared';

// Phase exports
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

export {
  phase18Schema,
  type Phase18Artifact,
  softwareCriterionLinkageSchema,
  type SoftwareCriterionLinkage,
} from './phase-18-software-specific-dm';

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
] as const;
