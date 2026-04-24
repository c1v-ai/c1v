/**
 * Module 7 — Interfaces / N² Matrix barrel + registry
 *
 * @module lib/langchain/schemas/module-7-interfaces
 */

import type { z } from 'zod';
import { n2MatrixSchema } from './n2-matrix';

export { n2MatrixSchema, n2RowSchema, type N2Matrix, type N2Row } from './n2-matrix';

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
] as const;
