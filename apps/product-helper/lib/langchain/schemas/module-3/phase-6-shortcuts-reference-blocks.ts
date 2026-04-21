/**
 * Phase 6 — Shortcuts + Reference Blocks (with inserted cache-layer decision)
 *
 * Master §4.5.4 hotspot #1. Methodology content (F13/3 `06_SHORTCUTS-AND-
 * REFERENCE-BLOCKS.md`) covers diagram readability primitives: arrow
 * shortcuts (matching letter pairs within one diagram) and reference blocks
 * (cross-diagram pointers). **Cache-layer decision + TTL math are schema
 * insertions** per plan §5 bullet 4 — they ride on the Phase 6 envelope via
 * `_insertions[]` tracking so methodology-vs-architecture drift is visible
 * at Zod-parse time.
 *
 * Inserted fields use `softwareArchDecisionSchema` with `ref: 'caching'`
 * (valid enum member per M2 `_shared.ts` flag A expansion). TTL field
 * requires a `mathDerivationSchema` per plan §6.0 (NUMERIC_ONLY gate).
 *
 * @module lib/langchain/schemas/module-3/phase-6-shortcuts-reference-blocks
 */

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  mathDerivationSchema,
  softwareArchDecisionSchema,
} from '../module-2/_shared';

// ─────────────────────────────────────────────────────────────────────────
// Arrow shortcut (within-diagram only; methodology §6.1-6.3)
// ─────────────────────────────────────────────────────────────────────────

export const arrowShortcutSchema = z
  .object({
    label: z
      .string()
      .regex(/^[A-Z]{1,2}$/)
      .describe(
        'x-ui-surface=section:Shortcut Manager — shortcut label (A, B, …, Z; then AA, BB, … per methodology §6.3).',
      ),
    source_block_id: z
      .string()
      .regex(/^F\.[0-9]+(\.[0-9]+)*$/)
      .describe(
        'x-ui-surface=section:Shortcut Manager — block id where the shortcut exits.',
      ),
    dest_block_id: z
      .string()
      .regex(/^F\.[0-9]+(\.[0-9]+)*$/)
      .describe(
        'x-ui-surface=section:Shortcut Manager — block id where the shortcut enters.',
      ),
    diagram_scope: z
      .string()
      .describe(
        'x-ui-surface=section:Shortcut Manager — diagram identifier (shortcuts are within-diagram only per methodology §6.3).',
      ),
  })
  .describe(
    'x-ui-surface=section:Shortcut Manager — arrow shortcut (wormhole pair) replacing a long crossing arrow.',
  );
export type ArrowShortcut = z.infer<typeof arrowShortcutSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Reference block (cross-diagram; methodology §6.4-6.6)
// ─────────────────────────────────────────────────────────────────────────

export const referenceBlockSchema = z
  .object({
    ref_block_id: z
      .string()
      .regex(/^F\.[0-9]+(\.[0-9]+)* Ref$/)
      .describe(
        'x-ui-surface=section:Reference Blocks — "F.N Ref" identifier pointing at another diagram.',
      ),
    referenced_diagram_title: z
      .string()
      .describe(
        'x-ui-surface=section:Reference Blocks — target diagram title (must match the referenced block name exactly per methodology Mistake 3).',
      ),
    boundary_side: z
      .enum(['entry', 'exit'])
      .describe(
        'x-ui-surface=section:Reference Blocks — whether this ref appears at sub-diagram entry or exit.',
      ),
  })
  .describe(
    'x-ui-surface=section:Reference Blocks — cross-diagram pointer to a peer FFBD.',
  );
export type ReferenceBlock = z.infer<typeof referenceBlockSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Cache-layer decision (schema insertion — master §4.5.4 hotspot #1)
// ─────────────────────────────────────────────────────────────────────────

export const cacheTtlSchema = z
  .object({
    value: z
      .number()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Cache Strategy — TTL value in seconds.',
      ),
    unit: z
      .literal('seconds')
      .describe(
        'x-ui-surface=section:Cache Strategy — unit fixed to seconds for TTL arithmetic.',
      ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:Cache Strategy — required math derivation (kb_source: "caching-system-design-kb.md"). Formula cites cache invalidation pattern + data volatility.',
    ),
  })
  .describe(
    'x-ui-surface=section:Cache Strategy — cache TTL with required math derivation per §4.5.4 NUMERIC_ONLY gate.',
  );

// ─────────────────────────────────────────────────────────────────────────
// Phase 6 emission
// ─────────────────────────────────────────────────────────────────────────

export const phase6Schema = phaseEnvelopeSchema.extend({
  arrow_shortcuts: z
    .array(arrowShortcutSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Shortcut Manager — all within-diagram arrow shortcuts.',
    ),
  reference_blocks: z
    .array(referenceBlockSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Reference Blocks — all cross-diagram reference blocks.',
    ),
  cache_strategy: softwareArchDecisionSchema.describe(
    'x-ui-surface=section:Cache Strategy — inserted cache-layer decision (ref: "caching"). NOT methodology-driven; schema insertion per plan §4.5.4 hotspot #1.',
  ),
  cache_ttl_sec: cacheTtlSchema,
});
export type Phase6Artifact = z.infer<typeof phase6Schema>;
