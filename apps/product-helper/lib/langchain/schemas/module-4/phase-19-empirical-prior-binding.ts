/**
 * Phase 19 — Empirical Prior Binding (T4b Wave 3).
 *
 * Aggregates all prior citations across decision-net scores and binds them
 * to the KB-8 atlas entries + _shared KBs + FMEA + NFR sources. Serves as
 * the provenance manifest: every score in phase-14 must appear here with
 * `bound_to` referencing an atlas entry or flagged `provisional` / inferred.
 *
 * Per v1 R2 ruling (2026-04-23): if KB-8 corpus returns < 7 valid entries
 * for a decision's archetype, mark `provisional: true` + sample_size; do
 * NOT block pipeline.
 *
 * @module lib/langchain/schemas/module-4/phase-19-empirical-prior-binding
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { decisionNodeIdSchema, alternativeIdSchema } from './phase-14-decision-nodes';

export const priorBindingSchema = z
  .object({
    decision_node_id: decisionNodeIdSchema,
    alternative_id: alternativeIdSchema,
    criterion_id: z.string().regex(/^PC-[0-9]{2}$/),
    bound_to: z
      .union([
        z.object({
          source: z.literal('kb-8-atlas'),
          entry_path: z.string().min(3),
          field_path: z.string().min(1),
          sample_size: z.number().int().min(0),
        }),
        z.object({
          source: z.literal('kb-shared'),
          kb_file: z.string().min(3),
          section: z.string().optional(),
        }),
        z.object({
          source: z.literal('nfr'),
          nfr_id: z.string().regex(/^NFR\.[0-9]{2,}$/),
        }),
        z.object({
          source: z.literal('fmea'),
          fmea_row_id: z.string().min(1),
        }),
        z.object({
          source: z.literal('inferred'),
          rationale: z.string().min(5),
        }),
      ])
      .describe(
        'x-ui-surface=section:Prior Binding > Row — discriminated union over prior source.',
      ),
    provisional: z.boolean().default(false),
    hash_chain_prev: z
      .string()
      .regex(/^[a-f0-9]{8,64}$|^GENESIS$/)
      .describe(
        'x-ui-surface=internal:audit — previous audit-row hash for decision_audit chain.',
      ),
  })
  .describe(
    'x-ui-surface=section:Prior Binding > Row — provenance manifest row tying a score to its empirical source.',
  );
export type PriorBinding = z.infer<typeof priorBindingSchema>;

export const phase19Schema = module4PhaseEnvelopeSchema.extend({
  bindings: z.array(priorBindingSchema).min(1),
  kb_8_entries_consulted: z.array(z.string()).default([]),
});
export type Phase19Artifact = z.infer<typeof phase19Schema>;
