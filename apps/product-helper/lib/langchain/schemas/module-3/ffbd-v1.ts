/**
 * Module 3 — FFBD v1 canonical (Gate C close-out)
 *
 * Downstream-consumable FFBD artifact produced after Gate C phases 1-5,7-10
 * land. Composes hierarchy (phase-0a), flow/branching (phase-6), handoff
 * (phase-11) into a single canonical `ffbd.v1.json`.
 *
 * Invariants enforced here (also validated semantically at emit-time):
 *   - Every function.inputs[] DE.NN ref MUST resolve in data_flows.v1.
 *   - Every OR/AND/IT gate has either `guard` (condition) OR `termination`.
 *   - Top-level function id space is F.N; nested functions F.N.M.
 *
 * @module lib/langchain/schemas/module-3/ffbd-v1
 */

import { z } from 'zod';

export const uncertaintyColorSchema = z.enum(['green', 'yellow', 'red']);

export const ffbdFunctionInputSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('data_flow'),
    ref: z
      .string()
      .regex(/^DE\.\d{2,}$/)
      .describe('DE.NN id from data_flows.v1.'),
    rationale: z.string().optional(),
  }),
  z.object({
    kind: z.literal('external'),
    actor: z.string().describe('Context-diagram external actor name.'),
    rationale: z.string().describe('Why an external reference is used instead of a DE.NN.'),
  }),
]);
export type FfbdFunctionInput = z.infer<typeof ffbdFunctionInputSchema>;

export const ffbdFunctionSchema = z
  .object({
    id: z
      .string()
      .regex(/^F(\.\d+)+$/)
      .describe('Function id F.N (top-level) or F.N.M (nested).'),
    name: z.string(),
    type: z.enum(['functional', 'reference']).default('functional'),
    uncertainty: uncertaintyColorSchema,
    delves_to: z
      .string()
      .nullable()
      .describe('Sub-diagram id this function delves into, or null.'),
    inputs: z.array(ffbdFunctionInputSchema).default([]),
    outputs: z
      .array(
        z.object({
          kind: z.enum(['data_flow', 'external']),
          ref: z.string(),
        }),
      )
      .default([]),
    source_uc: z.string().optional(),
    source_cc: z.array(z.string()).default([]),
  })
  .describe('FFBD function block.');
export type FfbdFunction = z.infer<typeof ffbdFunctionSchema>;

export const ffbdArrowSchema = z
  .object({
    from: z.string(),
    to: z.string(),
    kind: z.enum(['trigger', 'precedes']),
    label: z.string().optional(),
  })
  .describe('FFBD arrow (trigger or precedes).');
export type FfbdArrow = z.infer<typeof ffbdArrowSchema>;

export const ffbdLogicGateSchema = z
  .object({
    id: z.string().describe('Gate id (OR.N, AND.N, IT.N).'),
    kind: z.enum(['OR', 'AND', 'IT']),
    open_pos: z.string(),
    close_pos: z.string(),
    guard: z.string().optional().describe('Branching guard for OR/AND gates.'),
    termination: z.string().optional().describe('Termination condition for IT gates.'),
    purpose: z.string(),
  })
  .refine(
    (g) =>
      (g.kind === 'IT' && !!g.termination) ||
      (g.kind !== 'IT' && !!g.guard) ||
      !!g.guard ||
      !!g.termination,
    { message: 'OR/AND gates need guard; IT gates need termination.' },
  );
export type FfbdLogicGate = z.infer<typeof ffbdLogicGateSchema>;

export const ffbdV1Schema = z
  .object({
    _schema: z.literal('module-3.ffbd.v1'),
    _output_path: z.string(),
    _upstream_refs: z.object({
      scope_tree: z.string(),
      context_diagram: z.string(),
      data_flows: z.string(),
      ffbd_top_level: z.string(),
    }),
    produced_at: z.string(),
    produced_by: z.string(),
    system_name: z.string(),
    top_level_diagram_id: z.string().default('F.0'),
    functions: z.array(ffbdFunctionSchema).min(1),
    arrows: z.array(ffbdArrowSchema).min(1),
    logic_gates: z.array(ffbdLogicGateSchema).default([]),
    data_blocks: z
      .array(
        z.object({
          name: z.string(),
          feeds: z.array(z.string()),
          source_actor: z.string(),
          data_flow_refs: z
            .array(z.string().regex(/^DE\.\d{2,}$/))
            .default([])
            .describe('DE.NN ids from data_flows.v1 this data block materializes.'),
        }),
      )
      .default([]),
    cross_cutting_pervasive: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          applies_to: z.string(),
        }),
      )
      .default([]),
    mermaid_paths: z
      .array(z.string())
      .default([])
      .describe('Relative paths of per-function Mermaid renders.'),
  })
  .describe('Canonical FFBD v1 artifact (Gate C close-out).');
export type FfbdV1 = z.infer<typeof ffbdV1Schema>;
