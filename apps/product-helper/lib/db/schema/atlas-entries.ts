/**
 * KB-8 Atlas — Drizzle schema for atlas entries.
 *
 * Storage substrate for the KB-8 Public Stacks Atlas. Each row is a
 * per-company entry whose frontmatter Zod shape is defined in
 * `lib/langchain/schemas/atlas/entry.ts` (`companyAtlasEntrySchema`).
 *
 * Design contract:
 *   - Tenant-isolated via `team_id` + PostgreSQL RLS (security-review F5).
 *   - Content-addressed via `frontmatter_sha256` — tamper detection +
 *     re-ingest idempotency.
 *   - Forward-compatible with pgvector: a sibling `kb_chunks` table (owned
 *     by T3 c1v-runtime-prereqs) FKs atlas_entries.id when prose body is
 *     chunk-embedded. This table stores frontmatter + source pointer;
 *     chunk storage is separate.
 *   - Append-only in practice: updates bump `revision` + keep old row via
 *     `superseded_by`, matching the write-once + reviewer-gate posture
 *     from security-review F2. Deletes are soft (`deleted_at`).
 *
 * Migration: 0010_atlas_entries.sql (manual SQL per CLAUDE.md drizzle-kit
 * broken note).
 *
 * @module lib/db/schema/atlas-entries
 */

import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { teams } from '../schema';

/**
 * Entry kind. Mirrors `entryKindSchema` from the Zod layer. Duplicated here
 * intentionally — Drizzle doesn't derive enums from Zod, and this constant
 * is the one used at CHECK-constraint authoring time.
 */
export const ATLAS_ENTRY_KINDS = [
  'public',
  'ai_infra_public',
  'frontier_ai_private',
] as const;
export type AtlasEntryKind = (typeof ATLAS_ENTRY_KINDS)[number];

export const ATLAS_VERIFICATION_STATUSES = [
  'verified',
  'partial',
  'inferred',
] as const;
export type AtlasVerificationStatus =
  (typeof ATLAS_VERIFICATION_STATUSES)[number];

/**
 * DAU / scale bucket. Matches `dauBandSchema`. Used by the
 * `by_dau_band_idx` for fast band queries in `atlasLookup(dauRange)`.
 */
export const ATLAS_DAU_BANDS = [
  'under_10k',
  '10k_100k',
  '100k_1m',
  '1m_10m',
  '10m_100m',
  'over_100m',
  'unknown',
] as const;
export type AtlasDauBand = (typeof ATLAS_DAU_BANDS)[number];

export const atlasEntries = pgTable(
  'atlas_entries',
  {
    id: serial('id').primaryKey(),

    // ─── Tenant isolation (F5) ──────────────────────────────────────────
    /**
     * Tenant key. All current test users are internal per David's ruling;
     * still enforce RLS so any future external-customer atlas rows cannot
     * bleed across tenants. Set NULL for SHARED baseline corpus rows
     * (reviewer-only writable via service-role key).
     */
    teamId: integer('team_id').references(() => teams.id, {
      onDelete: 'cascade',
    }),

    // ─── Identity ───────────────────────────────────────────────────────
    slug: varchar('slug', { length: 80 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    kind: varchar('kind', { length: 32 }).notNull(),
    hq: varchar('hq', { length: 120 }).notNull(),
    website: text('website'),

    // ─── Verification + staleness gates ─────────────────────────────────
    lastVerified: timestamp('last_verified', { withTimezone: true }).notNull(),
    verificationStatus: varchar('verification_status', { length: 16 }).notNull(),
    reviewer: varchar('reviewer', { length: 80 }).notNull(),

    /**
     * Entry-level data-quality grade — Q1/Q2/Q3. Orthogonal to citation
     * tiers (A-H); numeric prefix is intentional. See
     * `lib/langchain/schemas/atlas/entry.ts#dataQualityGradeSchema`.
     */
    dataQualityGrade: varchar('data_quality_grade', { length: 2 }).notNull(),

    /** Strongest-tier citation summary (convenience for UI + indexer). */
    primarySourceTier: varchar('primary_source_tier', { length: 20 }).notNull(),
    primarySourceUrl: text('primary_source_url').notNull(),

    // ─── Scale + index facets (for cheap lookups without JSONB) ─────────
    dauBand: varchar('dau_band', { length: 16 }).notNull(),
    costBand: varchar('cost_band', { length: 24 }).notNull(),
    gpuExposure: varchar('gpu_exposure', { length: 24 }).notNull().default('none'),
    inferencePattern: varchar('inference_pattern', { length: 24 })
      .notNull()
      .default('none'),
    archetypeTags: jsonb('archetype_tags')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    // ─── Full frontmatter payload ───────────────────────────────────────
    /**
     * The parsed YAML frontmatter — validated against
     * `companyAtlasEntrySchema` at write time. Stored as JSONB so agents
     * can query priors by anchor without re-reading the markdown file.
     */
    frontmatter: jsonb('frontmatter').$type<Record<string, unknown>>().notNull(),

    /** Raw markdown body below the frontmatter. Chunk-ready for pgvector. */
    bodyMarkdown: text('body_markdown').notNull().default(''),

    // ─── Provenance (security-review F2) ────────────────────────────────
    /** SHA-256 hex of the canonical frontmatter JSON. Detects drift. */
    frontmatterSha256: varchar('frontmatter_sha256', { length: 64 }).notNull(),

    /** SHA-256 hex of the markdown body. Chunker invalidates embeddings on change. */
    bodySha256: varchar('body_sha256', { length: 64 }).notNull(),

    /** Semver of the ingest script that produced this row. */
    ingestScriptVersion: varchar('ingest_script_version', { length: 16 }).notNull(),

    /** Reviewer approval gate — no prior consumption until true. */
    reviewerApproved: boolean('reviewer_approved').notNull().default(false),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    approvedBy: varchar('approved_by', { length: 80 }),

    /** NDA-screen gate — hard-true precondition for commit. */
    ndaClean: boolean('nda_clean').notNull().default(false),

    // ─── Revision lineage ───────────────────────────────────────────────
    revision: integer('revision').notNull().default(1),
    supersededBy: integer('superseded_by'),

    // ─── Soft delete ────────────────────────────────────────────────────
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    deletedReason: text('deleted_reason'),

    // ─── Lineage timestamps ─────────────────────────────────────────────
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('atlas_entries_slug_team_rev_uniq').on(
      table.slug,
      table.teamId,
      table.revision,
    ),
    index('atlas_entries_team_idx').on(table.teamId),
    index('atlas_entries_kind_idx').on(table.kind),
    index('atlas_entries_dau_band_idx').on(table.dauBand),
    index('atlas_entries_gpu_exposure_idx').on(table.gpuExposure),
    index('atlas_entries_reviewer_approved_idx').on(table.reviewerApproved),
  ],
);

export type AtlasEntryRow = typeof atlasEntries.$inferSelect;
export type NewAtlasEntryRow = typeof atlasEntries.$inferInsert;

/**
 * Corpus-readiness gate threshold. M4/M5 agents must verify this count of
 * `reviewer_approved=true` entries carrying ≥1 §6.3-compliant math prior
 * before consuming priors. Mirrors `MIN_CORPUS_READY_SIZE` in the Zod
 * layer. NOT a "T1-tier" gate — tier letters (A-H) apply to citations,
 * not to the corpus threshold.
 *
 * Lowered from 20 to 10 per David's ruling 2026-04-23 (portfolio-scope
 * sufficiency; R2 fallback path accepted). Kept in sync with
 * `MIN_CORPUS_READY_SIZE` in `lib/langchain/schemas/atlas/entry.ts`.
 */
export const ATLAS_MIN_CORPUS_SIZE = 10;

/**
 * Data-quality grades surfaced in the `data_quality_grade` column.
 * Mirrors `dataQualityGradeSchema` in the Zod layer.
 */
export const ATLAS_DATA_QUALITY_GRADES = ['Q1', 'Q2', 'Q3'] as const;
export type AtlasDataQualityGrade = (typeof ATLAS_DATA_QUALITY_GRADES)[number];
