/**
 * Module 1 — Barrel + Registry
 *
 * Gate B ships Phase 2.5 (data_flows.v1) — the canonical data-flow
 * enumeration bridging M1 scope into M3/M7 downstream consumers.
 *
 * @module lib/langchain/schemas/module-1
 */

import type { z } from 'zod';
import { dataFlowsSchema } from './phase-2-5-data-flows';

export {
  dataFlowsSchema,
  dataFlowEntrySchema,
  payloadShapeSchema,
  criticalitySchema,
  piiClassSchema,
  type DataFlows,
  type DataFlowEntry,
  type PayloadShape,
  type Criticality,
  type PiiClass,
} from './phase-2-5-data-flows';

export interface Module1PhaseEntry {
  slug: string;
  name: string;
  phaseNumber: number | string;
  zodSchema: z.ZodType;
}

export const MODULE_1_PHASE_SCHEMAS: readonly Module1PhaseEntry[] = [
  {
    slug: 'phase-2-5-data-flows',
    name: 'Phase25DataFlows',
    phaseNumber: 2.5,
    zodSchema: dataFlowsSchema,
  },
] as const;
