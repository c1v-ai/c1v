/**
 * Phase 1 — Creating an Objective Decision Matrix (DM Envelope)
 *
 * Entry point for the M4 pipeline. Ingests M3 Phase 11's
 * `decision_matrix_handoff.v1` contract (candidate criteria with required
 * math, alternatives, peak_RPS sizing, inherited budgets) and declares the
 * top-level decision context: decision_statement, system_context,
 * criteria_count_target.
 *
 * Read-only upstream contract: `module-3/phase-11-ffbd-to-decision-matrix`.
 * M4 never edits M3; it only imports the typed handoff.
 *
 * @module lib/langchain/schemas/module-4/phase-1-dm-envelope
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { phase11Schema } from '../module-3';

// ─────────────────────────────────────────────────────────────────────────
// Decision context
// ─────────────────────────────────────────────────────────────────────────

/**
 * A decision matrix is a tool for selecting among alternatives against
 * weighted criteria. The decision statement frames WHAT is being chosen.
 */
export const decisionContextSchema = z
  .object({
    decision_statement: z
      .string()
      .min(12)
      .describe(
        'x-ui-surface=page:/projects/[id]/system-design/decision-matrix — one-sentence framing of the decision (e.g., "Select the primary data persistence layer for the ingestion pipeline.").',
      ),
    scope_boundary: z
      .string()
      .describe(
        'x-ui-surface=section:Decision Context > Scope — explicit in-scope/out-of-scope boundary; what this decision does and does not cover.',
      ),
    decision_owner_role: z
      .string()
      .describe(
        'x-ui-surface=section:Decision Context > Ownership — role accountable for ratifying the selection (e.g., "Principal Engineer", "CTO").',
      ),
    success_signal: z
      .string()
      .describe(
        'x-ui-surface=section:Decision Context > Success — how we know the selected option worked after implementation (e.g., "p95 latency < 100ms sustained for 30 days").',
      ),
    criteria_count_target: z
      .number()
      .int()
      .min(6)
      .max(10)
      .default(7)
      .describe(
        'x-ui-surface=section:Decision Context > Plan — target number of PCs (methodology §11 recommends 6-10).',
      ),
    alternative_count: z
      .number()
      .int()
      .min(2)
      .describe(
        'x-ui-surface=section:Decision Context > Plan — number of alternatives under comparison (≥2 required).',
      ),
  })
  .describe(
    'x-ui-surface=section:Decision Context — top-level framing of the decision (methodology §1 Step 1).',
  );
export type DecisionContext = z.infer<typeof decisionContextSchema>;

// ─────────────────────────────────────────────────────────────────────────
// M3 Phase 11 ingestion pointer
// ─────────────────────────────────────────────────────────────────────────

/**
 * Pointer to the upstream M3 Phase 11 artifact that seeds this DM.
 * Inline consumption shape — M4 reads M3's Phase 11 as a typed
 * read-only contract. Breaking the contract is M3's responsibility; M4
 * validates expectations at this boundary.
 */
export const upstreamHandoffRefSchema = z
  .object({
    source: z
      .literal('module-3.phase-11-ffbd-to-decision-matrix')
      .describe(
        'x-ui-surface=internal:contract-validation — fixed upstream id.',
      ),
    contract_version: z
      .literal('decision_matrix_handoff.v1')
      .describe(
        'x-ui-surface=internal:contract-validation — M3 Phase 11 emits this exact contract tag.',
      ),
    handoff_path: z
      .string()
      .describe(
        'x-ui-surface=section:Decision Context > Upstream — filesystem path to the ingested M3 Phase 11 JSON.',
      ),
  })
  .describe(
    'x-ui-surface=section:Decision Context > Upstream — identifies the M3 Phase 11 handoff consumed here.',
  );

// ─────────────────────────────────────────────────────────────────────────
// Phase 1 envelope
// ─────────────────────────────────────────────────────────────────────────

export const phase1Schema = module4PhaseEnvelopeSchema.extend({
  decision_context: decisionContextSchema,
  upstream_handoff_ref: upstreamHandoffRefSchema,
  /**
   * Inlined, read-only copy of the M3 Phase 11 artifact. M4 Phase 3-17
   * downstream phases reference this for candidate criteria, alternatives,
   * peak_RPS, and inherited budgets. Storing a copy (not just a ref) keeps
   * the DM artifact self-contained for review + archive.
   */
  ingested_handoff: phase11Schema.describe(
    'x-ui-surface=section:Decision Context > Upstream — full inlined M3 Phase 11 artifact (read-only snapshot at ingest time).',
  ),
});
export type Phase1Artifact = z.infer<typeof phase1Schema>;
