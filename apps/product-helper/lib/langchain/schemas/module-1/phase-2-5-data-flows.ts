/**
 * Module 1 — Phase 2.5: Data Flows
 *
 * First canonical data-flow artifact for the v2 Wave 2-early pipeline.
 * Produces `data_flows.v1.json` (DE.NN entries) bridging M1 scope_tree +
 * context_diagram into M3 FFBD inputs and M7 N2 payload typing.
 *
 * Every DE.NN MUST resolve against either:
 *   - a scope_tree node id (e.g., "SpecGen.FromIdea.Intake"), or
 *   - an external actor from context_diagram (e.g., "FOUNDERS"), or
 *   - the sentinel literal "external" (only for external-terminated flows)
 *
 * Consumed by:
 *   - M3 FFBD Gate C phases — function.inputs[] reference DE.NN ids
 *   - M7 N2 matrix — row.data_flow_ref soft-links to DE.NN
 *   - M8 FMEA-early — failure modes may target DE.NN for data-integrity modes
 *
 * @module lib/langchain/schemas/module-1/phase-2-5-data-flows
 */

import { z } from 'zod';

export const criticalitySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type Criticality = z.infer<typeof criticalitySchema>;

export const piiClassSchema = z.enum(['none', 'indirect', 'direct', 'sensitive']);
export type PiiClass = z.infer<typeof piiClassSchema>;

export const payloadShapeSchema = z
  .object({
    name: z
      .string()
      .describe('Canonical payload type name (e.g., "OneSentenceIdea", "DraftSpec").'),
    fields: z
      .array(
        z.object({
          name: z.string(),
          type: z.string().describe('Logical type hint: string | number | json | binary | ref<...>.'),
          optional: z.boolean().default(false),
        }),
      )
      .default([])
      .describe('Ordered field list for the payload; downstream schema-gen reads this.'),
    format_hint: z
      .string()
      .optional()
      .describe('Optional wire format hint (json, protobuf, sse, event-stream, etc.).'),
  })
  .describe('Shape of the payload carried by this data flow.');
export type PayloadShape = z.infer<typeof payloadShapeSchema>;

export const dataFlowEntrySchema = z
  .object({
    id: z
      .string()
      .regex(/^DE\.\d{2,}$/)
      .describe('Stable identifier DE.NN (zero-padded, min 2 digits).'),
    name: z.string().describe('Short human-readable name for the flow.'),
    description: z.string().describe('One-line description of what moves across this edge.'),
    source: z
      .string()
      .describe(
        'Producer — scope_tree node id OR context_diagram external actor name OR literal "external".',
      ),
    sink: z
      .string()
      .describe(
        'Consumer — scope_tree node id OR context_diagram external actor name OR literal "external".',
      ),
    payload_shape: payloadShapeSchema,
    criticality: criticalitySchema,
    encryption_at_rest_required: z.boolean(),
    encryption_in_transit_required: z.boolean(),
    pii_class: piiClassSchema,
    notes: z.string().optional(),
  })
  .describe('Single DE.NN data-flow entry.');
export type DataFlowEntry = z.infer<typeof dataFlowEntrySchema>;

export const dataFlowsSchema = z
  .object({
    _schema: z.literal('module-1.phase-2-5-data-flows.v1'),
    _output_path: z
      .string()
      .describe(
        'Canonical emit path (v2 tree): system-design/kb-upgrade-v2/module-1-defining-scope/data_flows.v1.json',
      ),
    _upstream_refs: z
      .object({
        scope_tree: z.string(),
        context_diagram: z.string(),
      })
      .describe('Upstream artifact paths this data_flows build was derived from.'),
    produced_at: z.string().describe('ISO-8601 timestamp of emission.'),
    produced_by: z.string().describe('Emitting agent id.'),
    system_name: z.string(),
    entries: z.array(dataFlowEntrySchema).min(1).describe('DE.NN list, ordered.'),
    coverage_notes: z
      .array(z.string())
      .default([])
      .describe('Reviewer-facing notes on coverage/gaps.'),
  })
  .describe(
    'Module 1 Phase 2.5 artifact: canonical data-flow enumeration bridging M1 scope to M3/M7 downstream consumers.',
  );
export type DataFlows = z.infer<typeof dataFlowsSchema>;
