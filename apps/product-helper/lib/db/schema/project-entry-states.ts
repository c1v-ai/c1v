/**
 * Module 0 — `project_entry_states` Drizzle schema.
 *
 * Per-project record of the 3-card entry pattern (new / existing / exploring)
 * and the submodule the pipeline starts at. Persists the Zod `project_entry.v1`
 * envelope from `lib/langchain/schemas/module-0/project-entry.ts`.
 *
 * Routing invariant (mirrors the Zod refine):
 *   - entry_pattern ∈ {new, exploring} ⇒ pipeline_start_submodule = 'M1.1'
 *   - entry_pattern  = existing         ⇒ pipeline_start_submodule = 'M3.1'
 *
 * Tenant isolation: RLS on project owner (`app.current_user_id`) + team
 * membership (`app.current_team_id`); service role bypass for backend
 * writers.
 *
 * Migration: 0012_module-0-tables.sql.
 *
 * @module lib/db/schema/project-entry-states
 */

import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

import { projects, users } from '../schema';
import {
  ENTRY_PATTERNS,
  PIPELINE_START_SUBMODULES,
  type EntryPattern,
  type ExistingProjectSignals,
  type PipelineStartSubmodule,
} from '../../langchain/schemas/module-0/project-entry';

export { ENTRY_PATTERNS, PIPELINE_START_SUBMODULES };
export type { EntryPattern, PipelineStartSubmodule };

export const projectEntryStates = pgTable(
  'project_entry_states',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    entryPattern: varchar('entry_pattern', { length: 16 })
      .notNull()
      .$type<EntryPattern>(),
    pipelineStartSubmodule: varchar('pipeline_start_submodule', { length: 16 })
      .notNull()
      .$type<PipelineStartSubmodule>(),

    /** Matches `existingProjectSignalsSchema` — null iff entry_pattern ≠ existing. */
    existingProjectSignals: jsonb('existing_project_signals')
      .$type<ExistingProjectSignals | null>(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectIdUnique: uniqueIndex('project_entry_states_project_id_unique').on(
      table.projectId,
    ),
    userIdIdx: index('project_entry_states_user_id_idx').on(table.userId),
    entryPatternIdx: index('project_entry_states_entry_pattern_idx').on(
      table.entryPattern,
    ),
  }),
);

export type ProjectEntryStateRow = typeof projectEntryStates.$inferSelect;
export type NewProjectEntryStateRow = typeof projectEntryStates.$inferInsert;
