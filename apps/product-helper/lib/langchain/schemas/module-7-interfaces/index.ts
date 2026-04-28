/**
 * Module 7 — Interfaces / N² Matrix barrel + registry
 *
 * @module lib/langchain/schemas/module-7-interfaces
 */

import type { z } from 'zod';
import { n2MatrixSchema } from './n2-matrix';
import { interfaceSpecsV1Schema } from './formal-specs';

export { n2MatrixSchema, n2RowSchema, type N2Matrix, type N2Row } from './n2-matrix';
export * from './formal-specs';

export interface Module7PhaseEntry {
  slug: string;
  name: string;
  phaseNumber: number | string;
  zodSchema: z.ZodType;
}

export const MODULE_7_PHASE_SCHEMAS: readonly Module7PhaseEntry[] = [
  {
    slug: 'n2-matrix',
    name: 'N2Matrix',
    phaseNumber: 1,
    zodSchema: n2MatrixSchema,
  },
  {
    slug: 'interface-specs-v1',
    name: 'InterfaceSpecsV1',
    phaseNumber: 2,
    zodSchema: interfaceSpecsV1Schema,
  },
] as const;
