/**
 * Module 7 — N² Matrix (v1 canonical)
 *
 * Interface enumeration produced by walking M3 FFBD functions + M1 data_flows.
 * Every IF.NN row MUST have both `producer` and `consumer` present in the
 * ffbd.v1 function set. `data_flow_ref` is soft-nullable: when non-null it
 * must resolve to a DE.NN from data_flows.v1 and `criticality` SHALL be
 * derived from that DE's criticality unless explicitly overridden with a
 * rationale in `criticality_override_rationale`.
 *
 * @module lib/langchain/schemas/module-7-interfaces/n2-matrix
 */

import { z } from 'zod';
import { criticalitySchema } from '../module-1/phase-2-5-data-flows';

export const n2RowSchema = z
  .object({
    id: z
      .string()
      .regex(/^IF\.\d{2,}$/)
      .describe('Stable interface id IF.NN (zero-padded).'),
    producer: z.string().describe('Producing function id from ffbd.v1 (e.g., "F.2").'),
    consumer: z.string().describe('Consuming function id from ffbd.v1.'),
    payload_name: z.string().describe('Short name of the payload (human-readable).'),
    data_flow_ref: z
      .string()
      .regex(/^DE\.\d{2,}$/)
      .nullable()
      .describe('Soft-nullable reference to a DE.NN from data_flows.v1.'),
    protocol: z
      .string()
      .describe('Transport / invocation style (e.g., "in-process", "http-json", "sse", "event-bus").'),
    sync_style: z
      .enum(['sync', 'async', 'streaming', 'batch'])
      .describe('Invocation style.'),
    criticality: criticalitySchema.describe(
      'Derived from data_flow_ref.criticality if ref present, else manual.',
    ),
    criticality_override_rationale: z
      .string()
      .optional()
      .describe('Required when criticality deviates from data_flow_ref source.'),
    notes: z.string().optional(),
  })
  .describe('Single IF.NN row in the N² matrix.');
export type N2Row = z.infer<typeof n2RowSchema>;

export const n2MatrixSchema = z
  .object({
    _schema: z.literal('module-7.n2-matrix.v1'),
    _output_path: z.string(),
    _upstream_refs: z.object({
      ffbd: z.string(),
      data_flows: z.string(),
    }),
    produced_at: z.string(),
    produced_by: z.string(),
    system_name: z.string(),
    functions_axis: z
      .array(z.string())
      .min(2)
      .describe('Ordered function id axis for the matrix (e.g., ["F.1","F.2",...]).'),
    rows: z.array(n2RowSchema).min(1),
    mermaid_path: z
      .string()
      .optional()
      .describe('Optional relative path to the Mermaid flowchart render.'),
  })
  .describe('Canonical N² matrix artifact (v1).');
export type N2Matrix = z.infer<typeof n2MatrixSchema>;
