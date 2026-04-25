/**
 * Module 8 — Risk (FMEA-early) barrel + registry
 *
 * @module lib/langchain/schemas/module-8-risk
 */

import type { z } from 'zod';
import { fmeaEarlySchema } from './fmea-early';
import { fmeaResidualSchema } from './fmea-residual';

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

export {
  fmeaResidualSchema,
  residualFailureModeSchema,
  predecessorRefSchema,
  formRefSchema,
  decisionAnchorSchema,
  recoverabilitySchema,
  mitigationStatusSchema,
  computeWeightedRpn,
  shouldFlagHighRpn,
  HIGH_RPN_FLAG_THRESHOLD,
  type FmeaResidual,
  type ResidualFailureMode,
  type PredecessorRef,
  type FormRef,
  type DecisionAnchor,
} from './fmea-residual';

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
  {
    slug: 'fmea-residual',
    name: 'FmeaResidual',
    phaseNumber: 2,
    zodSchema: fmeaResidualSchema,
  },
] as const;
