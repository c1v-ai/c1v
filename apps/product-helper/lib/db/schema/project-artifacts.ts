/**
 * `project_artifacts` Drizzle schema (TA1 c1v-runtime-wiring, v2.1 Wave A,
 * master-plan decision D-V21.04).
 *
 * Per-tenant metadata for synthesis artifacts (recommendation JSON/HTML/PDF/
 * PPTX, FMEA/HoQ/N2 xlsx, mermaid, bundle ZIP, decision-network/matrix JSON).
 * Artifact bytes live in Supabase Storage with signed URLs (D-V21.08); this
 * table stores metadata + lifecycle status only.
 *
 * Writer/reader contract:
 *   - WRITER (TA3 python-sidecar): creates rows on synthesis kickoff with
 *     `synthesis_status='pending'`, then updates each row to `'ready'` (with
 *     `storage_path`, `sha256`, `synthesized_at`) or `'failed'` (with
 *     `failure_reason`) as the artifact emits. Service role.
 *   - READER (TA2 synthesis viewer + `/api/projects/[id]/artifacts/manifest`):
 *     selects rows for the active project via `getProjectArtifacts`,
 *     `getLatestSynthesis`, `getArtifactByKind`. Tenant role.
 *   - BRIDGE: `lib/synthesis/artifacts-bridge.ts` re-exports the queries below
 *     so TA3's sidecar code path collapses to a static import once TA1 lands.
 *
 * Row identity:
 *   - `id` is uuid PK (auto-generated server-side via `gen_random_uuid()`).
 *   - `(project_id, artifact_kind)` is NOT unique by design — re-syntheses
 *     append new rows per kind. Use `getLatestSynthesis(projectId)` or
 *     `getArtifactByKind(projectId, kind)` for "latest" semantics.
 *
 * RLS:
 *   - Service role bypass (`app.current_role = 'service'`) for sidecar writes.
 *   - Tenant SELECT/INSERT/UPDATE via `projects.team_id =
 *     app.current_team_id`.
 *   - No DELETE policy (audit retention; rows persist until project deletion
 *     cascades the row out).
 *
 * Migration: `0014_project_artifacts.sql` (manual SQL — drizzle-kit broken
 * per repo CLAUDE.md).
 *
 * @module lib/db/schema/project-artifacts
 */

import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { projects } from '../schema';

/**
 * Synthesis lifecycle state.
 *   - `pending`: row created on kickoff, sidecar has not yet emitted.
 *   - `ready`:   sidecar wrote `storage_path`, `sha256`, `synthesized_at`.
 *   - `failed`:  sidecar wrote `failure_reason`; UI surfaces retry button.
 */
export const SYNTHESIS_STATUSES = ['pending', 'ready', 'failed'] as const;
export type SynthesisStatus = (typeof SYNTHESIS_STATUSES)[number];

/**
 * Pre-created artifact kinds emitted on every synthesis kickoff. Sidecar
 * may also emit additional optional kinds (n2_matrix_xlsx, mermaid_*,
 * bundle_zip, decision_network_v1, decision_matrix_v1) — those rows are
 * appended as they complete.
 */
export const EXPECTED_ARTIFACT_KINDS = [
  'recommendation_json',
  'recommendation_html',
  'recommendation_pdf',
  'recommendation_pptx',
  'fmea_early_xlsx',
  'fmea_residual_xlsx',
  'hoq_xlsx',
] as const;
export type ExpectedArtifactKind = (typeof EXPECTED_ARTIFACT_KINDS)[number];

export const projectArtifacts = pgTable(
  'project_artifacts',
  {
    /** uuid PK; defaulted server-side via `gen_random_uuid()`. */
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    /** FK → projects.id (integer/serial parent — NOT uuid). */
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),

    /** Enum-like text — see `EXPECTED_ARTIFACT_KINDS` + sidecar optional kinds. */
    artifactKind: text('artifact_kind').notNull(),

    /** Supabase Storage object path. Null while `synthesis_status='pending'`. */
    storagePath: text('storage_path'),

    /** Output format (`json` | `html` | `pdf` | `pptx` | `xlsx` | `mmd` | `png` | `zip`). */
    format: text('format'),

    /** SHA-256 hex of the artifact bytes (64 lowercase hex chars; CHECK constraint). */
    sha256: text('sha256'),

    /** Lifecycle status — see `SynthesisStatus`. CHECK constraint enforces enum. */
    synthesisStatus: text('synthesis_status')
      .$type<SynthesisStatus>()
      .notNull()
      .default('pending'),

    /**
     * Content-addressed hash of synthesis inputs (EC-V21-A.12). Stable across
     * re-runs with identical inputs. Real hash owned by langgraph-wirer
     * agent; placeholder accepted from TA3 until real-hash lands.
     */
    inputsHash: text('inputs_hash'),

    /** Set when synthesis_status transitions to `ready`. */
    synthesizedAt: timestamp('synthesized_at', { withTimezone: true }),

    /** Free-text explanation; set when synthesis_status transitions to `failed`. */
    failureReason: text('failure_reason'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    /** Compound index for synthesis-page reads (all kinds for a project). */
    projectKindIdx: index('project_artifacts_project_kind_idx').on(
      table.projectId,
      table.artifactKind,
    ),
    /** Status polling index (TA3 sidecar polls until terminal). */
    projectStatusIdx: index('project_artifacts_project_status_idx').on(
      table.projectId,
      table.synthesisStatus,
    ),
  }),
);

export type ProjectArtifactRow = typeof projectArtifacts.$inferSelect;
export type NewProjectArtifactRow = typeof projectArtifacts.$inferInsert;
