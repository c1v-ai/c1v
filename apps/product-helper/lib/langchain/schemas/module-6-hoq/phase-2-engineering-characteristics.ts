/**
 * Module 6 — HoQ Phase 2: Engineering Characteristics (Second Floor).
 *
 * Each EC.N row is a measurable property that engineering can dial. Per v2
 * §0.3.4 every EC MUST trace to either:
 *   (a) a measurable property of the M4 decision-network winner (a node id
 *       in `decision_network.v1.json::phases.phase_14_decision_nodes`), OR
 *   (b) a Constants entry from `m2/constants.v2.json` (constant_name).
 *
 * The chicken-and-egg between EC enumeration and decision-network winner is
 * resolved by ordering this phase AFTER T4b (decision_network.v1 already
 * exists, tag `t4b-wave-3-complete`).
 *
 * @module lib/langchain/schemas/module-6-hoq/phase-2-engineering-characteristics
 */

import { z } from 'zod';
import { directionOfChangeSchema } from './phase-1-customer-requirements';

export const ecDerivationSourceSchema = z
  .discriminatedUnion('kind', [
    z.object({
      kind: z.literal('decision-node'),
      decision_node_id: z
        .string()
        .min(1)
        .describe(
          'x-ui-surface=internal:hoq-trace — id from decision_network.v1.json phase_14 node set (e.g., "DN.04").',
        ),
      property_path: z
        .string()
        .min(1)
        .describe(
          'x-ui-surface=internal:hoq-trace — JSONPath inside decision-node to the measurable property.',
        ),
    }),
    z.object({
      kind: z.literal('constant'),
      constant_name: z
        .string()
        .regex(/^[A-Z][A-Z0-9_]+$/)
        .describe(
          'x-ui-surface=internal:hoq-trace — constants.v2 constant_name (UPPER_SNAKE).',
        ),
    }),
  ])
  .describe(
    'x-ui-surface=section:HoQ > Second Floor — required derivation source for an EC.',
  );
export type EcDerivationSource = z.infer<typeof ecDerivationSourceSchema>;

export const engineeringCharacteristicSchema = z
  .object({
    ec_id: z
      .number()
      .int()
      .min(1)
      .max(99)
      .describe(
        'x-ui-surface=section:HoQ > Second Floor — 1-based stable EC integer id (legacy gen-qfd contract).',
      ),
    name: z
      .string()
      .min(2)
      .max(60)
      .describe(
        'x-ui-surface=section:HoQ > Second Floor — short name printed in the EC column header.',
      ),
    unit: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:HoQ > Second Floor — measurement unit (e.g., "ms", "%", "MB", "scale 1-3").',
      ),
    direction_of_change: directionOfChangeSchema,
    derivation: ecDerivationSourceSchema,
    notes: z.string().optional(),
  })
  .describe(
    'x-ui-surface=section:HoQ > Second Floor — single EC.N row (the "how" axis).',
  );
export type EngineeringCharacteristic = z.infer<
  typeof engineeringCharacteristicSchema
>;

export const engineeringCharacteristicsArtifactSchema = z
  .object({
    _phase: z.literal('module-6.phase-2.engineering-characteristics.v1'),
    rows: z.array(engineeringCharacteristicSchema).min(1),
  })
  .superRefine((v, ctx) => {
    const ids = new Set<number>();
    for (const r of v.rows) {
      if (ids.has(r.ec_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rows'],
          message: `duplicate ec_id ${r.ec_id}`,
        });
      }
      ids.add(r.ec_id);
    }
  })
  .describe(
    'x-ui-surface=page:/system-design/qfd — Phase-2 engineering characteristics artifact.',
  );
export type EngineeringCharacteristicsArtifact = z.infer<
  typeof engineeringCharacteristicsArtifactSchema
>;
