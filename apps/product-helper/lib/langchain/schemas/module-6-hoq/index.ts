/**
 * Module 6 — House of Quality (QFD) barrel + registry.
 *
 * Per v2 §0.3.4 (Wave-4 synthesis), M6 HoQ folds into terminal synthesis
 * because engineering characteristics derive from the M4 decision-network
 * winner (chicken-and-egg resolved by ordering AFTER T4b).
 *
 * Six phases produce the canonical HoQ artifact `hoq.v1.json`:
 *   1. customer-requirements    (Front Porch — PCs anchored to NFRs)
 *   2. engineering-characteristics (Second Floor — ECs anchored to decision nodes / constants)
 *   3. relationship-matrix      (Main Floor — PC times EC body, {-2..+2})
 *   4. roof-correlations        (Roof — symmetric EC times EC, lower-triangle only)
 *   5. target-values            (Basement — targets, thresholds, difficulty, cost)
 *   6. competitive-benchmarks   (Back Porch + Basement competitors — KB-8 anchored)
 *
 * @module lib/langchain/schemas/module-6-hoq
 */

import { z } from 'zod';

import {
  customerRequirementsArtifactSchema,
  customerRequirementSchema,
  directionOfChangeSchema,
  type CustomerRequirement,
  type CustomerRequirementsArtifact,
  type DirectionOfChange,
} from './phase-1-customer-requirements';
import {
  engineeringCharacteristicsArtifactSchema,
  engineeringCharacteristicSchema,
  ecDerivationSourceSchema,
  type EcDerivationSource,
  type EngineeringCharacteristic,
  type EngineeringCharacteristicsArtifact,
} from './phase-2-engineering-characteristics';
import {
  relationshipMatrixArtifactSchema,
  relationshipRowSchema,
  relationshipValueSchema,
  type RelationshipMatrixArtifact,
  type RelationshipRow,
} from './phase-3-relationship-matrix';
import {
  roofCorrelationsArtifactSchema,
  roofPairSchema,
  correlationSymbolSchema,
  SYMBOL_TO_INT,
  type CorrelationSymbol,
  type RoofCorrelationsArtifact,
  type RoofPair,
} from './phase-4-roof-correlations';
import {
  targetValuesArtifactSchema,
  targetValueRowSchema,
  type TargetValueRow,
  type TargetValuesArtifact,
} from './phase-5-target-values';
import {
  competitiveBenchmarksArtifactSchema,
  competitorSchema,
  backPorchRowSchema,
  basementCompetitorRowSchema,
  type BackPorchRow,
  type BasementCompetitorRow,
  type CompetitiveBenchmarksArtifact,
  type Competitor,
} from './phase-6-competitive-benchmarks';

export {
  customerRequirementsArtifactSchema,
  customerRequirementSchema,
  directionOfChangeSchema,
  engineeringCharacteristicsArtifactSchema,
  engineeringCharacteristicSchema,
  ecDerivationSourceSchema,
  relationshipMatrixArtifactSchema,
  relationshipRowSchema,
  relationshipValueSchema,
  roofCorrelationsArtifactSchema,
  roofPairSchema,
  correlationSymbolSchema,
  SYMBOL_TO_INT,
  targetValuesArtifactSchema,
  targetValueRowSchema,
  competitiveBenchmarksArtifactSchema,
  competitorSchema,
  backPorchRowSchema,
  basementCompetitorRowSchema,
};
export type {
  CustomerRequirement,
  CustomerRequirementsArtifact,
  DirectionOfChange,
  EcDerivationSource,
  EngineeringCharacteristic,
  EngineeringCharacteristicsArtifact,
  RelationshipMatrixArtifact,
  RelationshipRow,
  CorrelationSymbol,
  RoofCorrelationsArtifact,
  RoofPair,
  TargetValueRow,
  TargetValuesArtifact,
  BackPorchRow,
  BasementCompetitorRow,
  CompetitiveBenchmarksArtifact,
  Competitor,
};

/**
 * Top-level `hoq.v1` artifact. Composes the 6 phase artifacts under one
 * envelope with provenance pointers to upstream M2/M4/KB-8 sources.
 */
export const hoqV1Schema = z
  .object({
    _schema: z.literal('module-6.hoq.v1'),
    _output_path: z.string(),
    _upstream_refs: z.object({
      nfrs: z.string(),
      constants: z.string(),
      decision_network: z.string(),
      kb_8_atlas_root: z.string(),
    }),
    _winning_concept: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=page-header — selected_architecture_id from decision_network.v1 + human label.',
      ),
    produced_at: z.string(),
    produced_by: z.string(),
    system_name: z.string(),
    metadata: z.object({
      project_title: z.string(),
      developed_by: z.string(),
      last_updated: z.string(),
    }),
    customer_requirements: customerRequirementsArtifactSchema,
    engineering_characteristics: engineeringCharacteristicsArtifactSchema,
    relationship_matrix: relationshipMatrixArtifactSchema,
    roof_correlations: roofCorrelationsArtifactSchema,
    target_values: targetValuesArtifactSchema,
    competitive_benchmarks: competitiveBenchmarksArtifactSchema,
  })
  .describe(
    'x-ui-surface=page:/system-design/qfd — top-level HoQ v1 artifact.',
  );
export type HoqV1 = z.infer<typeof hoqV1Schema>;

export interface Module6PhaseEntry {
  slug: string;
  name: string;
  phaseNumber: number;
  zodSchema: z.ZodType;
}

export const MODULE_6_PHASE_SCHEMAS: readonly Module6PhaseEntry[] = [
  {
    slug: 'customer-requirements',
    name: 'CustomerRequirements',
    phaseNumber: 1,
    zodSchema: customerRequirementsArtifactSchema,
  },
  {
    slug: 'engineering-characteristics',
    name: 'EngineeringCharacteristics',
    phaseNumber: 2,
    zodSchema: engineeringCharacteristicsArtifactSchema,
  },
  {
    slug: 'relationship-matrix',
    name: 'RelationshipMatrix',
    phaseNumber: 3,
    zodSchema: relationshipMatrixArtifactSchema,
  },
  {
    slug: 'roof-correlations',
    name: 'RoofCorrelations',
    phaseNumber: 4,
    zodSchema: roofCorrelationsArtifactSchema,
  },
  {
    slug: 'target-values',
    name: 'TargetValues',
    phaseNumber: 5,
    zodSchema: targetValuesArtifactSchema,
  },
  {
    slug: 'competitive-benchmarks',
    name: 'CompetitiveBenchmarks',
    phaseNumber: 6,
    zodSchema: competitiveBenchmarksArtifactSchema,
  },
] as const;
