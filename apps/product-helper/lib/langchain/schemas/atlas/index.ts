/**
 * KB-8 Atlas — barrel + registry for schema generation.
 *
 * Every Zod-typed shape surfaced by the Atlas is re-exported here; the
 * `MODULE_8_ATLAS_SCHEMAS` registry is consumed by
 * `lib/langchain/schemas/generate-all.ts` to emit JSON Schemas into
 * `lib/langchain/schemas/generated/atlas/`.
 *
 * @module lib/langchain/schemas/atlas
 */

import type { z } from 'zod';

// Priors
export {
  atlasPriorRefSchema,
  availabilityPriorSchema,
  citationSchema,
  costCurveSchema,
  graphShapeSchema,
  isoDateSchema,
  latencyPriorSchema,
  matrixShapeSchema,
  piecewiseShapeSchema,
  priorBaseSchema,
  resultShapeKindSchema,
  resultShapeSchema,
  scalarShapeSchema,
  sha256HexSchema,
  sourceTierSchema,
  throughputPriorSchema,
  utilityWeightHintsSchema,
  vectorShapeSchema,
  citationIsPriorAcceptable,
  PRIOR_ACCEPTABLE_TIERS,
} from './priors';
export type {
  AtlasPriorRef,
  AvailabilityPrior,
  Citation,
  CostCurve,
  LatencyPrior,
  ResultShape,
  ResultShapeKind,
  SourceTier,
  ThroughputPrior,
  UtilityWeightHints,
} from './priors';

// Entry
export {
  aiStackSchema,
  archetypeTagSchema,
  backendStackSchema,
  companyAtlasEntrySchema,
  companyAtlasEntryBaseObject,
  costBandSchema,
  dataQualityGradeSchema,
  dataStackSchema,
  dauBandSchema,
  entryKindSchema,
  frontendStackSchema,
  gpuExposureSchema,
  inferencePatternSchema,
  infraStackSchema,
  primarySourceSchema,
  scaleBandSchema,
  scaleMetricSchema,
  stackSlotArraySchema,
  verificationStatusSchema,
  ATLAS_ENTRY_SCHEMA_VERSION,
  MIN_CORPUS_READY_SIZE,
  MIN_T1_CORPUS_SIZE,
} from './entry';
export type {
  ArchetypeTag,
  CompanyAtlasEntry,
  CostBand,
  DataQualityGrade,
  DauBand,
  EntryKind,
  GpuExposure,
  InferencePattern,
  PrimarySource,
  ScaleBand,
  ScaleMetric,
  VerificationStatus,
} from './entry';

import { companyAtlasEntrySchema } from './entry';
import {
  availabilityPriorSchema,
  citationSchema,
  costCurveSchema,
  latencyPriorSchema,
  resultShapeSchema,
  throughputPriorSchema,
  utilityWeightHintsSchema,
} from './priors';

/**
 * Registry entry — same shape as MODULE_{2,3,4}_PHASE_SCHEMAS for
 * parallel consumption by `generate-all.ts`.
 */
export interface Module8AtlasEntry {
  slug: string;
  name: string;
  zodSchema: z.ZodType;
}

/**
 * Canonical registry consumed by `generate-all.ts`. Entries here map 1:1
 * to emitted `lib/langchain/schemas/generated/atlas/<slug>.schema.json`.
 */
export const MODULE_8_ATLAS_SCHEMAS: readonly Module8AtlasEntry[] = [
  {
    slug: 'company-atlas-entry',
    name: 'CompanyAtlasEntry',
    zodSchema: companyAtlasEntrySchema,
  },
  {
    slug: 'citation',
    name: 'Citation',
    zodSchema: citationSchema,
  },
  {
    slug: 'result-shape',
    name: 'ResultShape',
    zodSchema: resultShapeSchema,
  },
  {
    slug: 'latency-prior',
    name: 'LatencyPrior',
    zodSchema: latencyPriorSchema,
  },
  {
    slug: 'availability-prior',
    name: 'AvailabilityPrior',
    zodSchema: availabilityPriorSchema,
  },
  {
    slug: 'throughput-prior',
    name: 'ThroughputPrior',
    zodSchema: throughputPriorSchema,
  },
  {
    slug: 'cost-curve',
    name: 'CostCurve',
    zodSchema: costCurveSchema,
  },
  {
    slug: 'utility-weight-hints',
    name: 'UtilityWeightHints',
    zodSchema: utilityWeightHintsSchema,
  },
] as const;
