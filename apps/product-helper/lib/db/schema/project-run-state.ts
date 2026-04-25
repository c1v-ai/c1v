/**
 * `project_run_state` Drizzle schema (T6 c1v-synthesis Wave-4).
 *
 * Tracks pipeline-wide run state for a project: entry phase, current phase,
 * loop iteration counter, per-module revision counters, list of modules
 * currently running with stub upstream artifacts, and a revision delta log.
 *
 * Mutated by every phase agent on start / complete / revision. Required by
 * v1 Exit Criterion §12-bullet-5 ("project_run_state.v1 tracks start-phase
 * + loop-iteration + per-module revisions with RLS policies").
 *
 * Wire contract: persists `projectRunStateSchema` (v1 §8.2). One row per
 * project (UNIQUE on project_id) — the row is updated in place; revision
 * history lives in `revision_log[]` not in row history.
 *
 * Tenant isolation:
 *   - service role bypass (`app.current_role = 'service'`) for backend
 *     pipeline writers.
 *   - tenant SELECT via project.team_id (caller's `app.current_team_id`).
 *   - owner INSERT/UPDATE: caller must own the referenced project's team.
 *
 * Migration: `0013_project_run_state.sql` (manual SQL — drizzle-kit broken
 * per repo CLAUDE.md).
 *
 * @module lib/db/schema/project-run-state
 */

import {
  pgTable,
  serial,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { projects } from '../schema';

/**
 * Per-revision delta entry. Mirrors v1 §8.4 `revisionDeltaSchema`.
 */
export interface RevisionDelta {
  module: string;             // e.g. 'M2', 'M3'
  from_revision: number;
  to_revision: number;
  changed_fields: string[];
  changed_by: string;         // agent id or human reviewer
  reason: string;
  timestamp: string;          // ISO-8601
}

export const projectRunState = pgTable(
  'project_run_state',
  {
    id: serial('id').primaryKey(),

    /**
     * One run-state row per project. Unique on project_id (mutated in
     * place; revisions live in `revision_log[]`).
     */
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),

    /** Pipeline entry point (typically 1 = M1, or 3 = M3 for brownfield). */
    startedFromPhase: integer('started_from_phase').notNull(),

    /** Module the orchestrator is currently executing. */
    currentPhase: integer('current_phase').notNull(),

    /** Loop iteration counter for the full pipeline (≥0; bumped per re-run). */
    loopIteration: integer('loop_iteration').notNull().default(0),

    /**
     * Per-module revision counters: `{ "M1": 3, "M2": 1, ... }`.
     * Mutated whenever a module agent emits a new envelope revision.
     */
    moduleRevisions: jsonb('module_revisions')
      .$type<Record<string, number>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    /**
     * Modules currently running with stub upstream artifacts (M5 with
     * hand-provided M3/M4 stubs, etc.). Tracks partial-pipeline flows
     * per v1 §8.3.
     */
    stubUpstream: jsonb('stub_upstream')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    /** Append-only delta log per v1 §8.4. */
    revisionLog: jsonb('revision_log')
      .$type<RevisionDelta[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectIdUnique: uniqueIndex('project_run_state_project_id_unique').on(
      table.projectId,
    ),
    currentPhaseIdx: index('project_run_state_current_phase_idx').on(
      table.currentPhase,
    ),
  }),
);

export type ProjectRunStateRow = typeof projectRunState.$inferSelect;
export type NewProjectRunStateRow = typeof projectRunState.$inferInsert;
