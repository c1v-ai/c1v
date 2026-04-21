/**
 * Phase 10 — SysML Activity Diagram
 *
 * Emits a SysML-style activity graph for the UC set: nodes (actions /
 * decisions / forks / joins / initial / final) + directed edges + a
 * `concurrency` block with `fork_join_count` and token-flow math per
 * plan §6.0 (KB: `message-queues-kb.md`).
 *
 * Kept purely structural; no references to requirement rows — this is a
 * behavior artifact, not a requirement artifact.
 *
 * @module lib/langchain/schemas/module-2/phase-10-sysml-activity
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, mathDerivationSchema } from './_shared';

export const sysmlNodeKindSchema = z.enum([
  'initial',
  'action',
  'decision',
  'merge',
  'fork',
  'join',
  'final',
]);

export const sysmlNodeSchema = z
  .object({
    id: z
      .string()
      .describe(
        'x-ui-surface=section:Activity Diagram — stable node id (e.g., "A1", "F1", "J1").',
      ),
    kind: sysmlNodeKindSchema.describe(
      'x-ui-surface=section:Activity Diagram — SysML node kind.',
    ),
    label: z
      .string()
      .describe(
        'x-ui-surface=section:Activity Diagram — display label (verb-phrase for actions, predicate for decisions).',
      ),
    swimlane: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Activity Diagram — actor/subsystem swimlane assignment.',
      ),
  })
  .describe('x-ui-surface=section:Activity Diagram — one graph node.');

export const sysmlEdgeSchema = z
  .object({
    from: z.string(),
    to: z.string(),
    guard: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Activity Diagram — guard expression on decision branches.',
      ),
    label: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Activity Diagram — optional edge label (e.g., "success", "retry").',
      ),
  })
  .describe('x-ui-surface=section:Activity Diagram — one directed edge.');

export const phase10Schema = phaseEnvelopeSchema.extend({
  nodes: z
    .array(sysmlNodeSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/activity — SysML node set.',
    ),
  edges: z
    .array(sysmlEdgeSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/activity — directed edges.',
    ),
  fork_join_count: z
    .number()
    .int()
    .nonnegative()
    .describe(
      'x-ui-surface=section:Audit > Concurrency — number of fork/join pairs (concurrency score).',
    ),
  concurrency_math: mathDerivationSchema.describe(
    'x-ui-surface=section:Requirement Detail > Design Rationale — token-flow derivation per plan §6.0 (KB: message-queues-kb.md).',
  ),
});
export type Phase10Artifact = z.infer<typeof phase10Schema>;
