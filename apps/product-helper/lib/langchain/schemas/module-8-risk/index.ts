/**
 * Module 8 — Risk (FMEA-early) barrel + registry
 *
 * @module lib/langchain/schemas/module-8-risk
 */

import type { z } from 'zod';
import { fmeaEarlySchema } from './fmea-early';

export {
  fmeaEarlySchema,
  fmeaFailureModeSchema,
  candidateMitigationSchema,
  targetRefSchema,
  type FmeaEarly,
  type FmeaFailureMode,
  type CandidateMitigation,
  type TargetRef,
} from './fmea-early';

export interface Module8PhaseEntry {
  slug: string;
  name: string;
  phaseNumber: number | string;
  zodSchema: z.ZodType;
}

export const MODULE_8_PHASE_SCHEMAS: readonly Module8PhaseEntry[] = [
  {
    slug: 'fmea-early',
    name: 'FmeaEarly',
    phaseNumber: 1,
    zodSchema: fmeaEarlySchema,
  },
] as const;
