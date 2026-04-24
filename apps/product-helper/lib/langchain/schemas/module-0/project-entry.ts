/**
 * Module 0 — `project_entry.v1` (3-card entry-pattern selector).
 *
 * Emitted by the post-signup per-project entry UI (the 3-card picker that
 * replaces the legacy "defined scope / help me scope" toggle). Decides
 * which submodule the pipeline starts at and whether brownfield signals
 * (GitHub repo URL, market URL, architecture doc upload) are in play.
 *
 * Routing contract (per v1 §5.0.2, v1 §5.0.4 `project_run_state` hook):
 *   - `entry_pattern: 'new'`       → `pipeline_start_submodule: 'M1.1'`
 *   - `entry_pattern: 'exploring'` → `pipeline_start_submodule: 'M1.1'`
 *   - `entry_pattern: 'existing'`  → `pipeline_start_submodule: 'M3.1'`
 *
 * The `.superRefine` below enforces the routing contract; if you add a
 * new entry pattern, update both the enum AND the refine branch.
 *
 * Spec: `plans/c1v-MIT-Crawley-Cornell.md` §5.0.2.
 *
 * @module lib/langchain/schemas/module-0/project-entry
 */

import { z } from 'zod';

/**
 * The three entry patterns. Locked by David's ruling:
 *   - new + exploring both fire the FULL pipeline M1→M8 (exploring users
 *     experience the methodology end-to-end).
 *   - existing fires the abbreviated pipeline: reverse-derive M3 FFBD
 *     from repo scan + M4 decision refresh + M6 HoQ iff compliance ask.
 */
export const ENTRY_PATTERNS = ['new', 'existing', 'exploring'] as const;
export type EntryPattern = (typeof ENTRY_PATTERNS)[number];

/**
 * Allowed `pipeline_start_submodule` values. Kept as a closed enum so
 * drift between Module 0 and the runtime pipeline orchestrator is
 * type-checked rather than stringly coupled.
 */
export const PIPELINE_START_SUBMODULES = ['M1.1', 'M3.1'] as const;
export type PipelineStartSubmodule = (typeof PIPELINE_START_SUBMODULES)[number];

/**
 * Pain-point picker options (Existing card only). Selection maps to
 * sensitivity-analysis lens weights at M4.
 */
export const EXISTING_PAIN_POINTS = [
  'cost-exploding',
  'latency-spiking',
  'reliability-failing',
  'cannot-scale',
  'compliance-gap',
  'tech-debt',
  'security-incident',
  'other',
] as const;
export type ExistingPainPoint = (typeof EXISTING_PAIN_POINTS)[number];

/**
 * Brownfield signals — present iff `entry_pattern === 'existing'`.
 * All three fields are independently optional, but the `.superRefine`
 * on the outer schema requires at least one URL so the repo/market
 * scanners have something to chew on.
 */
export const existingProjectSignalsSchema = z
  .object({
    github_repo_url: z
      .string()
      .url()
      .max(2048)
      .optional()
      .describe(
        'x-ui-surface=page:/projects/new | Public GitHub repo URL. When present, triggers repo-scan auto-infer of D0/D3/D7/D9/D10/D12.',
      ),
    market_url: z
      .string()
      .url()
      .max(2048)
      .optional()
      .describe(
        'x-ui-surface=page:/projects/new | Live product / marketing site URL. Feeds industry + business-model inference.',
      ),
    architecture_doc_upload_url: z
      .string()
      .url()
      .max(2048)
      .optional()
      .describe(
        'x-ui-surface=page:/projects/new | Signed-URL pointer to user-uploaded architecture doc (PDF/MD). Optional prose input to M3 reverse-derivation.',
      ),
    pain_points: z
      .array(z.enum(EXISTING_PAIN_POINTS))
      .max(EXISTING_PAIN_POINTS.length)
      .optional()
      .describe(
        'x-ui-surface=page:/projects/new | Pain-point checkbox selection. Maps to M4 sensitivity-lens weights.',
      ),
    pain_points_other: z
      .string()
      .min(1)
      .max(500)
      .optional()
      .describe(
        'x-ui-surface=page:/projects/new | Free-text pain-point (only meaningful when `pain_points` contains `other`).',
      ),
    current_dau_estimate: z
      .string()
      .min(1)
      .max(40)
      .optional()
      .describe(
        'x-ui-surface=internal | Rough DAU band the user supplied on the Existing card. Feeds D4 as empirical (not aspirational).',
      ),
  })
  .strict()
  .superRefine((value, ctx) => {
    const hasAnyUrl =
      !!value.github_repo_url ||
      !!value.market_url ||
      !!value.architecture_doc_upload_url;
    if (!hasAnyUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['github_repo_url'],
        message:
          'Existing-card submission requires at least one of: github_repo_url, market_url, architecture_doc_upload_url.',
      });
    }
  });

export type ExistingProjectSignals = z.infer<typeof existingProjectSignalsSchema>;

/**
 * `project_entry.v1` — per-project entry record. Persisted to the
 * `project_entry_states` Drizzle table; feeds the pipeline orchestrator
 * via `project_run_state.v1.started_from_submodule`.
 */
export const projectEntrySchema = z
  .object({
    _schema: z
      .literal('project_entry.v1')
      .describe('x-ui-surface=internal | Stable schema identifier.'),
    project_id: z
      .string()
      .min(1)
      .max(64)
      .describe(
        'x-ui-surface=internal | Primary key; matches `projects.id` (stringified) in the app DB.',
      ),
    user_id: z
      .string()
      .min(1)
      .max(64)
      .describe(
        'x-ui-surface=internal | Creating user; matches `users.id`. Used for RLS on `project_entry_states`.',
      ),
    entry_pattern: z
      .enum(ENTRY_PATTERNS)
      .describe(
        'x-ui-surface=section:onboarding.entry-cards | Which of the 3 cards the user picked.',
      ),
    pipeline_start_submodule: z
      .enum(PIPELINE_START_SUBMODULES)
      .describe(
        'x-ui-surface=internal | Orchestrator hint: where to start the pipeline. Enforced against entry_pattern by the refine below.',
      ),
    existing_project_signals: existingProjectSignalsSchema
      .optional()
      .describe(
        'x-ui-surface=internal | Brownfield signals — required iff entry_pattern=existing; forbidden otherwise.',
      ),
    created_at: z
      .string()
      .datetime({ offset: true })
      .describe('x-ui-surface=internal | ISO-8601 creation timestamp.'),
  })
  .strict()
  .superRefine((value, ctx) => {
    // Routing contract: entry_pattern ⇒ pipeline_start_submodule.
    const expectedStart: PipelineStartSubmodule =
      value.entry_pattern === 'existing' ? 'M3.1' : 'M1.1';
    if (value.pipeline_start_submodule !== expectedStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pipeline_start_submodule'],
        message: `entry_pattern=${value.entry_pattern} requires pipeline_start_submodule=${expectedStart}; got ${value.pipeline_start_submodule}.`,
      });
    }

    // Brownfield signals gate.
    if (value.entry_pattern === 'existing' && !value.existing_project_signals) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['existing_project_signals'],
        message:
          'entry_pattern=existing requires `existing_project_signals` (at minimum one of github_repo_url / market_url / architecture_doc_upload_url).',
      });
    }
    if (value.entry_pattern !== 'existing' && value.existing_project_signals) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['existing_project_signals'],
        message:
          '`existing_project_signals` is only valid when entry_pattern=existing.',
      });
    }
  });

export type ProjectEntry = z.infer<typeof projectEntrySchema>;
