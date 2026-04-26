/**
 * Module 5 — Form-Function Mapping barrel + registry.
 *
 * Crawley Concept stage, c1v-scoped. 7 phases shipped as individual Zod
 * schemas plus the top-level `form_function_map.v1` composite (phase 7).
 *
 * Math attribution: `Q(f,g) = s·(1-k)` cites Stevens/Myers/Constantine
 * 1974 + Bass/Clements/Kazman 2021 — NEVER Crawley. See `_shared.ts`.
 *
 * @module lib/langchain/schemas/module-5
 */

import type { z } from 'zod';
import { phase1FormInventorySchema } from './phase-1-form-inventory';
import { phase2FunctionInventorySchema } from './phase-2-function-inventory';
import { phase3ConceptMappingMatrixSchema } from './phase-3-concept-mapping-matrix';
import { phase4ConceptQualityScoringSchema } from './phase-4-concept-quality-scoring';
import { phase5OperandProcessCatalogSchema } from './phase-5-operand-process-catalog';
import { phase6ConceptAlternativesSchema } from './phase-6-concept-alternatives';
import {
  formFunctionMapV1Schema,
  phase7FormFunctionHandoffSchema,
} from './phase-7-form-function-handoff';

export * from './_shared';
export * from './phase-1-form-inventory';
export * from './phase-2-function-inventory';
export * from './phase-3-concept-mapping-matrix';
export * from './phase-4-concept-quality-scoring';
export * from './phase-5-operand-process-catalog';
export * from './phase-6-concept-alternatives';
export * from './phase-7-form-function-handoff';

export interface Module5PhaseEntry {
  slug: string;
  name: string;
  phaseNumber: number | string;
  zodSchema: z.ZodType;
}

export const MODULE_5_PHASE_SCHEMAS: readonly Module5PhaseEntry[] = [
  {
    slug: 'phase-1-form-inventory',
    name: 'Phase1FormInventory',
    phaseNumber: 1,
    zodSchema: phase1FormInventorySchema,
  },
  {
    slug: 'phase-2-function-inventory',
    name: 'Phase2FunctionInventory',
    phaseNumber: 2,
    zodSchema: phase2FunctionInventorySchema,
  },
  {
    slug: 'phase-3-concept-mapping-matrix',
    name: 'Phase3ConceptMappingMatrix',
    phaseNumber: 3,
    zodSchema: phase3ConceptMappingMatrixSchema,
  },
  {
    slug: 'phase-4-concept-quality-scoring',
    name: 'Phase4ConceptQualityScoring',
    phaseNumber: 4,
    zodSchema: phase4ConceptQualityScoringSchema,
  },
  {
    slug: 'phase-5-operand-process-catalog',
    name: 'Phase5OperandProcessCatalog',
    phaseNumber: 5,
    zodSchema: phase5OperandProcessCatalogSchema,
  },
  {
    slug: 'phase-6-concept-alternatives',
    name: 'Phase6ConceptAlternatives',
    phaseNumber: 6,
    zodSchema: phase6ConceptAlternativesSchema,
  },
  {
    slug: 'phase-7-form-function-handoff',
    name: 'Phase7FormFunctionHandoff',
    phaseNumber: 7,
    zodSchema: phase7FormFunctionHandoffSchema,
  },
  {
    slug: 'form-function-map-v1',
    name: 'FormFunctionMapV1',
    phaseNumber: 'v1',
    zodSchema: formFunctionMapV1Schema,
  },
] as const;
