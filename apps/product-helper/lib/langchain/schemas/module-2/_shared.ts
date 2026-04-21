/**
 * Module 2 — Shared Schemas (Gate B foundation)
 *
 * Reusable Zod primitives every Phase 0-12 schema in `module-2/` extends or
 * composes. Enforces strict envelope compliance per plan §5 bullet 2 and the
 * Gate A decisions locked in the Peer-3 review digest:
 *
 *   C1  dual-surface metadata (render + xlsx marshaller)
 *   C4  `_phase_status` as cross-phase discriminator
 *   C5  `_columns_plan` + `_insertions` promoted to first-class fields
 *   C9  `source_lens` as 3-enum discriminated union
 *   C11 `also_appears_in` + `source_ucbd` unified as `sourceRefSchema`
 *   A   `software_arch_decision.ref` enum expanded 6 → 12
 *
 * Every field carries a `.describe()` annotation with one of three
 * `x-ui-surface=` prefixes (page / section / internal) so Peer-3's
 * `zod-to-json.ts` round-trip can derive frontend routing from schema
 * metadata at build time.
 *
 * @module lib/langchain/schemas/module-2/_shared
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────
// Phase-status discriminator (C4)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Workflow state of a phase artifact. Drives the requirements-table
 * discriminated union (C4) so phases 6/7/8/9/11 can share one base
 * `requirementsTableSchema` and diverge only on status-conditional fields.
 */
export const phaseStatusSchema = z.enum([
  'planned',
  'in_progress',
  'complete',
  'needs_revision',
]);
export type PhaseStatus = z.infer<typeof phaseStatusSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Software architecture decision (flag A: expanded 6 → 12)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Canonical KB references for software-architecture decisions. Each value
 * maps 1:1 to a KB file in F13/2 (`New-knowledge-banks/...`). Adding a new
 * member here means a new KB file must exist; removing one means the
 * Phase 8 methodology .md addendum (tracked separately in Gate B doc
 * rollup) is now stale.
 *
 * Pilot (6): cap_theorem, resiliency, caching, load_balancing, api_design, none.
 * Gate-B addition (6): observability, maintainability, cdn_networking,
 *   message_queues, data_model, deployment_cicd.
 */
export const softwareArchRefSchema = z.enum([
  // Phase 8 pilot set
  'cap_theorem',
  'resiliency',
  'caching',
  'load_balancing',
  'api_design',
  'none',
  // Gate-B expansion (flag A)
  'observability',
  'maintainability',
  'cdn_networking',
  'message_queues',
  'data_model',
  'deployment_cicd',
]);
export type SoftwareArchRef = z.infer<typeof softwareArchRefSchema>;

export const softwareArchDecisionSchema = z
  .object({
    ref: softwareArchRefSchema.describe(
      'x-ui-surface=section:Requirement Detail > Design Rationale — KB file this decision cites.',
    ),
    rationale: z
      .string()
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — why this decision maps to the numeric target.',
      ),
    tradeoffs: z
      .array(z.string())
      .default([])
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — explicit trade-offs accepted (e.g., latency vs consistency).',
      ),
    alternatives_rejected: z
      .array(z.string())
      .default([])
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — alternatives considered and rejected, with one-line reason.',
      ),
  })
  .describe(
    'x-ui-surface=section:Requirement Detail > Design Rationale — KB-grounded design decision attached to a numeric requirement.',
  );
export type SoftwareArchDecision = z.infer<typeof softwareArchDecisionSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Math derivation (plan §6.0; numeric-only requirement-gating lives in C6/B)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Per-field derivation of a numeric value. Forces the LLM to cite a formula
 * and KB source, not emit a bare number. Required on the 4 numeric
 * primitives in `operational_primitives` and on requirements whose
 * `requirement_class ∈ {performance, reliability, scalability, capacity}`
 * (flag B — NUMERIC_ONLY gating, enforced at the per-phase schema layer).
 *
 * `inputs` is a record so text-valued constants (Phase 8 pilot pattern)
 * can pass `{}` without breaking validation.
 */
export const mathDerivationSchema = z
  .object({
    formula: z
      .string()
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — LaTeX-like or plain-English formula (e.g., "p95 = base + queueing_delay(λ, μ)").',
      ),
    inputs: z
      .record(z.string(), z.union([z.number(), z.string()]))
      .default({})
      .describe(
        'x-ui-surface=internal:math-derivation-resolver — named inputs to the formula (e.g., {"lambda": 150, "mu": 200}).',
      ),
    kb_source: z
      .string()
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — KB filename (matches softwareArchRefSchema or "inline") that sourced the formula.',
      ),
    kb_section: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — optional heading/anchor within the KB file (e.g., "§P95 envelope").',
      ),
    result: z
      .union([z.number(), z.string()])
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — computed value, if the formula is evaluated at generation time.',
      ),
  })
  .describe(
    'x-ui-surface=section:Requirement Detail > Design Rationale — math derivation for a numeric field (formula + inputs + KB citation).',
  );
export type MathDerivation = z.infer<typeof mathDerivationSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Source-reference provenance (C11)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Unified provenance primitive covering both the `also_appears_in`
 * (cross-phase reference) and `source_ucbd` (originating UC pointer) use
 * cases flagged in C11. Rendered in two surfaces per the dual-surface
 * decision: internal for agent consumers, plus a Requirement Detail panel
 * for reviewer transparency.
 */
export const sourceRefSchema = z
  .object({
    phase: z
      .string()
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — phase slug (e.g., "phase-6-requirements-table").',
      ),
    artifact: z
      .string()
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — artifact identifier within the phase (e.g., "UC03.R02", "PC-01").',
      ),
    relationship: z
      .enum(['sourced_from', 'also_appears_in', 'derived_from', 'refines'])
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — kind of link to the source artifact.',
      ),
    note: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — reviewer-facing context for the link.',
      ),
  })
  .describe(
    'x-ui-surface=section:Requirement Detail > Provenance — cross-phase reference (also_appears_in / source_ucbd unified per C11).',
  );
export type SourceRef = z.infer<typeof sourceRefSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Source-lens discriminated unions (C9)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Where a downstream field was derived from. Modeled as three discriminated
 * enums per C9 — flat 40-member enum was rejected for type-safety. The
 * `kind` discriminator lets consumers narrow on compile-time.
 *
 *   lens       — analytical lens applied (e.g., "functional_decomposition")
 *   category   — problem-domain bucket (e.g., "performance")
 *   contractor — which agent / role emitted the field (e.g., "ffbd_agent")
 */
export const sourceLensSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('lens'),
    value: z.enum([
      'functional_decomposition',
      'data_flow',
      'state_machine',
      'sequence',
      'concurrency',
      'error_paths',
      'security',
      'accessibility',
      'internationalization',
      'observability',
      'failure_mode',
      'cost',
      'ux_flow',
    ]),
  }),
  z.object({
    kind: z.literal('category'),
    value: z.enum([
      'performance',
      'reliability',
      'scalability',
      'maintainability',
      'security',
      'usability',
      'compliance',
      'cost',
      'portability',
      'testability',
      'observability',
    ]),
  }),
  z.object({
    kind: z.literal('contractor'),
    value: z.enum([
      'intake_agent',
      'extraction_agent',
      'ffbd_agent',
      'decision_matrix_agent',
      'qfd_agent',
      'interfaces_agent',
      'tech_stack_agent',
      'schema_agent',
      'api_spec_agent',
      'infrastructure_agent',
      'user_stories_agent',
      'guidelines_agent',
      'human_reviewer',
      'external_kb',
      'inline_heuristic',
      'unknown',
    ]),
  }),
]);
export type SourceLens = z.infer<typeof sourceLensSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Metadata header (C1 dual-surface)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Dual-surface metadata per C1 — every field serves both the page-header
 * render path AND the xlsx marshaller. Single source of truth; no separate
 * "header" vs "metadata" shapes.
 *
 * Fields split into three groups:
 *   - Identity: phase_number / phase_slug / phase_name / schema_version
 *   - Project context: project_name / project_id (render + workbook title)
 *   - Lineage: author / generated_at / generator / revision
 */
export const metadataHeaderSchema = z
  .object({
    // Identity
    phase_number: z
      .number()
      .int()
      .min(0)
      .max(12)
      .describe(
        'x-ui-surface=page-header — methodology phase number (0-12) per plan §4.5.',
      ),
    phase_slug: z
      .string()
      .describe(
        'x-ui-surface=page-header — URL-safe slug (e.g., "requirements-table"). Also the xlsx sheet slug.',
      ),
    phase_name: z
      .string()
      .describe(
        'x-ui-surface=page-header — human-facing phase title (e.g., "Phase 6 — Extract Requirements Table").',
      ),
    schema_version: z
      .string()
      .describe(
        'x-ui-surface=page-header — Zod schema semver (e.g., "1.0.0") for drift-detection.',
      ),
    // Project context
    project_id: z
      .number()
      .int()
      .describe(
        'x-ui-surface=page-header — parent project id; keys workbook + PDF filename.',
      ),
    project_name: z
      .string()
      .describe(
        'x-ui-surface=page-header — project display name; rendered at top and used as xlsx workbook title.',
      ),
    // Lineage
    author: z
      .string()
      .describe(
        'x-ui-surface=page-header — emitting agent or human reviewer identifier.',
      ),
    generated_at: z
      .string()
      .describe(
        'x-ui-surface=page-header — ISO-8601 timestamp of emission.',
      ),
    generator: z
      .string()
      .describe(
        'x-ui-surface=page-header — tool that produced this artifact (e.g., "product-helper@0.1.0").',
      ),
    revision: z
      .number()
      .int()
      .nonnegative()
      .default(0)
      .describe(
        'x-ui-surface=page-header — monotonic revision counter per (project, phase).',
      ),
  })
  .describe(
    'x-ui-surface=page-header — dual-surface header metadata (render + xlsx marshaller), per C1.',
  );
export type MetadataHeader = z.infer<typeof metadataHeaderSchema>;

// ─────────────────────────────────────────────────────────────────────────
// First-class columns_plan + insertions (C5)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Column-layout instruction for downstream xlsx marshallers. Promoted from
 * a hidden `_columns_plan` blob into a typed first-class field per C5 so
 * methodology drift surfaces at Zod-parse time instead of spreadsheet
 * rendering.
 */
export const columnPlanSchema = z
  .object({
    column_letter: z
      .string()
      .regex(/^[A-Z]{1,3}$/)
      .describe(
        'x-ui-surface=internal:xlsx-marshaller — Excel column letter (A..AZ..).',
      ),
    field_name: z
      .string()
      .describe(
        'x-ui-surface=internal:xlsx-marshaller — Zod field path emitted in this column.',
      ),
    header_text: z
      .string()
      .describe(
        'x-ui-surface=internal:xlsx-marshaller — text printed in the header row.',
      ),
    width: z
      .number()
      .positive()
      .optional()
      .describe(
        'x-ui-surface=internal:xlsx-marshaller — preferred column width in Excel units.',
      ),
    type_hint: z
      .enum(['text', 'number', 'date', 'bool', 'enum', 'json', 'formula'])
      .optional()
      .describe(
        'x-ui-surface=internal:xlsx-marshaller — Excel cell-type hint for the marshaller.',
      ),
    required: z
      .boolean()
      .default(false)
      .describe(
        'x-ui-surface=internal:xlsx-marshaller — whether marshaller should error on null.',
      ),
  })
  .describe(
    'x-ui-surface=internal:xlsx-marshaller — single column-layout instruction (first-class per C5).',
  );
export type ColumnPlan = z.infer<typeof columnPlanSchema>;

/**
 * Methodology-level "insertion" — a field or rule added to a phase after
 * the base methodology was authored (e.g., Phase 8 math_derivation, Phase
 * 12 operational_primitives). Promoted from a hidden `_insertions` blob
 * per C5 so changes to methodology are tracked in the schema itself.
 */
export const insertionSchema = z
  .object({
    phase_slug: z
      .string()
      .describe(
        'x-ui-surface=internal:methodology-drift-check — phase that received this insertion.',
      ),
    field_path: z
      .string()
      .describe(
        'x-ui-surface=internal:methodology-drift-check — dotted path within the phase schema (e.g., "rows[].math_derivation").',
      ),
    introduced_in: z
      .string()
      .describe(
        'x-ui-surface=internal:methodology-drift-check — schema semver where this field was added.',
      ),
    rationale: z
      .string()
      .describe(
        'x-ui-surface=section:Methodology Lineage — reviewer-facing reason the insertion was made.',
      ),
    kb_source: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Methodology Lineage — KB file that motivated the insertion, if any.',
      ),
  })
  .describe(
    'x-ui-surface=section:Methodology Lineage — methodology insertion (first-class per C5).',
  );
export type Insertion = z.infer<typeof insertionSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Phase envelope (plan §5 bullet 2; extended per C2, C4, C5)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Base shape every Module 2 phase schema extends via `.extend()`. Holds the
 * four reserved envelope fields (`_schema`, `_output_path`, `_phase_status`,
 * `metadata`) plus the two first-class methodology fields promoted in C5
 * (`_columns_plan`, `_insertions`).
 *
 * Phase 2's envelope-only ack (C2) uses this directly with no additions.
 * Phase 3/4/5 extend it via `.extend()` to build the UCBD stack (C3).
 * Phases 6/7/8/9/11 compose with `requirementsTableSchema` and differ only
 * on `_phase_status` branches (C4).
 */
export const phaseEnvelopeSchema = z
  .object({
    _schema: z
      .string()
      .describe(
        'x-ui-surface=internal:schema-drift-check — fully-qualified schema id (e.g., "module-2.phase-6-requirements-table.v1").',
      ),
    _output_path: z
      .string()
      .describe(
        'x-ui-surface=internal:xlsx-marshaller — target filesystem path for the marshalled artifact.',
      ),
    _phase_status: phaseStatusSchema.describe(
      'x-ui-surface=page-header — workflow state (drives C4 requirements-table branch).',
    ),
    _columns_plan: z
      .array(columnPlanSchema)
      .optional()
      .describe(
        'x-ui-surface=internal:xlsx-marshaller — optional layout instructions (first-class per C5).',
      ),
    _insertions: z
      .array(insertionSchema)
      .optional()
      .describe(
        'x-ui-surface=section:Methodology Lineage — optional methodology insertions applied to this phase (first-class per C5).',
      ),
    metadata: metadataHeaderSchema.describe(
      'x-ui-surface=page-header — dual-surface header metadata (C1).',
    ),
  })
  .describe(
    'x-ui-surface=page-header — base phase envelope extended by every Module 2 phase.',
  );
export type PhaseEnvelope = z.infer<typeof phaseEnvelopeSchema>;
