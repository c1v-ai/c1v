/**
 * Module 5 Phase 5 — Operand / Process Catalog.
 *
 * Crawley form-function framing: every function acts on operands via
 * processes. This phase enumerates (operand, process) tuples per function
 * so downstream HoQ (T6) can lift engineering-characteristics without
 * re-derivation. Pure Crawley content — no Q math lives here.
 *
 * @module lib/langchain/schemas/module-5-form-function/phase-5-operand-process-catalog
 */

import { z } from 'zod';
import { functionIdRegex } from './_shared';

export const operandProcessSchema = z
  .object({
    function_id: z.string().regex(functionIdRegex),
    operand: z
      .string()
      .describe('The entity being acted upon (e.g., "Draft Spec", "Metric Stream").'),
    process: z
      .string()
      .describe('Verb-phrase for the action (e.g., "generate", "trace").'),
    kb_ref: z
      .string()
      .optional()
      .describe('Crawley KB chunk id supporting this operand/process pair.'),
  })
  .describe('One operand/process tuple anchored to a function.');
export type OperandProcess = z.infer<typeof operandProcessSchema>;

export const phase5OperandProcessCatalogSchema = z
  .object({
    phase: z.literal(5),
    entries: z.array(operandProcessSchema).min(1),
  })
  .describe('Phase 5 — operand/process catalog (Crawley framing).');
export type Phase5OperandProcessCatalog = z.infer<typeof phase5OperandProcessCatalogSchema>;
