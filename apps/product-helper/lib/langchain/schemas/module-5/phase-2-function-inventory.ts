/**
 * Module 5 Phase 2 — Function Inventory.
 *
 * Mirror of ffbd.v1 functions lifted into M5 scope. Every entry MUST
 * resolve against the upstream ffbd.v1 functions[] by id. The top-level
 * refine (phase 7 handoff) enforces resolution across all phases.
 *
 * @module lib/langchain/schemas/module-5/phase-2-function-inventory
 */

import { z } from 'zod';
import { functionIdRegex } from './_shared';

export const functionEntrySchema = z
  .object({
    id: z.string().regex(functionIdRegex).describe('F.NN — must resolve in ffbd.v1.'),
    name: z.string(),
    uncertainty: z
      .enum(['green', 'yellow', 'red'])
      .describe('Mirror of ffbd.v1 function uncertainty.'),
    source_uc: z.string().optional().describe('Use-case ref from ffbd.v1 (if any).'),
  })
  .describe('Function lifted from ffbd.v1 for M5 scoping.');
export type FunctionEntry = z.infer<typeof functionEntrySchema>;

export const phase2FunctionInventorySchema = z
  .object({
    phase: z.literal(2),
    functions: z.array(functionEntrySchema).min(1),
  })
  .describe('Phase 2 — function inventory (derived from ffbd.v1).');
export type Phase2FunctionInventory = z.infer<typeof phase2FunctionInventorySchema>;
