/**
 * Module 8 — FMEA (early) v1 canonical
 *
 * Wave 2-early FMEA: enumerates failure modes against targets resolvable in
 * ffbd.v1 (F.N) or n2_matrix.v1 (IF.NN). Severity/likelihood/detectability
 * ratings come from `rating_scales.json` (M8 dir). `candidate_mitigation`
 * lists OPTIONS only — no commitment. Consumed by downstream T-new
 * nfr-resynth to promote selected mitigations into NFRs.
 *
 * @module lib/langchain/schemas/module-8-risk/fmea-early
 */

import { z } from 'zod';

export const targetRefSchema = z
  .object({
    kind: z.enum(['function', 'interface', 'data_flow']),
    ref: z
      .string()
      .describe('F.N | IF.NN | DE.NN — MUST resolve in the upstream artifact for its kind.'),
  })
  .describe('Target of a failure mode — must resolve in upstream artifact.');
export type TargetRef = z.infer<typeof targetRefSchema>;

export const candidateMitigationSchema = z
  .object({
    id: z.string().describe('Stable id within this FMEA row (e.g., "M1", "M2").'),
    summary: z.string(),
    kb_refs: z
      .array(z.string())
      .default([])
      .describe('KB file refs supporting this mitigation option.'),
  })
  .describe('One candidate mitigation option; no commitment implied.');
export type CandidateMitigation = z.infer<typeof candidateMitigationSchema>;

export const fmeaFailureModeSchema = z
  .object({
    id: z
      .string()
      .regex(/^FM\.\d{2,}$/)
      .describe('Stable failure-mode id FM.NN.'),
    target_ref: targetRefSchema,
    failure_mode: z.string().describe('Short description of the failure mode.'),
    potential_cause: z.string(),
    potential_effect: z.string(),
    severity: z.number().int().min(1).max(4).describe('Per rating_scales.json severity scale (1..4).'),
    likelihood: z.number().int().min(1).max(5).describe('Per rating_scales.json likelihood scale (1..5).'),
    detectability: z
      .number()
      .int()
      .min(1)
      .max(5)
      .describe('Per rating_scales.json detectability scale (1..5; higher = harder).'),
    rpn: z.number().int().min(1).max(20).describe('severity * likelihood per rating_scales.rpn_matrix.'),
    criticality_category: z
      .enum(['LOW', 'MEDIUM LOW', 'MEDIUM', 'MEDIUM HIGH', 'HIGH'])
      .describe('Derived from rpn via rating_scales.criticality_ranges.'),
    candidate_mitigation: z
      .array(candidateMitigationSchema)
      .default([])
      .describe('Options only; no commitment.'),
    notes: z.string().optional(),
  })
  .describe('Single FMEA row (FM.NN).');
export type FmeaFailureMode = z.infer<typeof fmeaFailureModeSchema>;

export const fmeaEarlySchema = z
  .object({
    _schema: z.literal('module-8.fmea-early.v1'),
    _output_path: z.string(),
    _upstream_refs: z.object({
      ffbd: z.string(),
      n2_matrix: z.string(),
      data_flows: z.string(),
      rating_scales: z.string(),
    }),
    produced_at: z.string(),
    produced_by: z.string(),
    system_name: z.string(),
    rating_scales_version: z
      .string()
      .describe('Version identifier of rating_scales.json used at build time.'),
    failure_modes: z.array(fmeaFailureModeSchema).min(1),
    xlsx_path: z
      .string()
      .optional()
      .describe('Optional relative path to xlsx render (via scripts/artifact-generators/gen-fmea.py).'),
  })
  .describe('Canonical FMEA-early (v1) artifact.');
export type FmeaEarly = z.infer<typeof fmeaEarlySchema>;
