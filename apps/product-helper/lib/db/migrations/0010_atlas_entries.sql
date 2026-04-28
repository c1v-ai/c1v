-- Migration: Create atlas_entries table (KB-8 Public Stacks & Priors Atlas)
-- Created: 2026-04-21
-- Brief: c1v-kb8-atlas — architect (David Ancor + peer swarm)
-- Mitigates (partial): security-review.md F1-F5 (ingest allowlist / NDA screen
--                      enforced at scraper layer; this migration covers
--                      tenant isolation + provenance + reviewer gate).
--
-- Purpose:
--   Storage substrate for the KB-8 Atlas. Each row is a cited company
--   entry whose frontmatter is Zod-validated against
--   `companyAtlasEntrySchema` (lib/langchain/schemas/atlas/entry.ts).
--
-- Column notes:
--   team_id             — tenant FK; NULL = SHARED baseline corpus. RLS
--                         policies below restrict SELECT/INSERT/UPDATE to
--                         row-owning team + SHARED.
--   frontmatter_sha256  — SHA-256 of canonical frontmatter JSON.
--                         Tamper-detection + re-ingest idempotency.
--   body_sha256         — SHA-256 of markdown body. Chunker invalidates
--                         downstream embeddings on change.
--   reviewer_approved   — HARD gate. M4/M5 agents MUST check both
--                         reviewer_approved=true AND (COUNT>=10) before
--                         consuming priors (F2 minimum-corpus gate).
--                         Threshold lowered from 20→10 per David's ruling
--                         2026-04-23 (portfolio-scope sufficiency).
--   nda_clean           — HARD gate. Insertion trigger refuses rows with
--                         nda_clean=false. (security-review F1).
--   revision            — monotonic counter per (team_id, slug). Updates
--                         bump revision + point old row at new via
--                         superseded_by. Preserves history without
--                         double-writes.
--   deleted_at          — soft-delete. Physical DELETE reserved for
--                         takedown requests.

CREATE TABLE IF NOT EXISTS "atlas_entries" (
  "id"                      serial PRIMARY KEY,
  "team_id"                 integer REFERENCES "teams"("id") ON DELETE CASCADE,
  "slug"                    varchar(80) NOT NULL,
  "name"                    varchar(120) NOT NULL,
  "kind"                    varchar(32) NOT NULL,
  "hq"                      varchar(120) NOT NULL,
  "website"                 text,
  "last_verified"           timestamptz NOT NULL,
  "verification_status"     varchar(16) NOT NULL,
  "reviewer"                varchar(80) NOT NULL,
  "data_quality_grade"      varchar(2) NOT NULL,
  "primary_source_tier"     varchar(20) NOT NULL,
  "primary_source_url"      text NOT NULL,
  "dau_band"                varchar(16) NOT NULL,
  "cost_band"               varchar(24) NOT NULL,
  "gpu_exposure"            varchar(24) NOT NULL DEFAULT 'none',
  "inference_pattern"       varchar(24) NOT NULL DEFAULT 'none',
  "archetype_tags"          jsonb NOT NULL DEFAULT '[]'::jsonb,
  "frontmatter"             jsonb NOT NULL,
  "body_markdown"           text NOT NULL DEFAULT '',
  "frontmatter_sha256"      varchar(64) NOT NULL,
  "body_sha256"             varchar(64) NOT NULL,
  "ingest_script_version"   varchar(16) NOT NULL,
  "reviewer_approved"       boolean NOT NULL DEFAULT false,
  "approved_at"             timestamptz,
  "approved_by"             varchar(80),
  "nda_clean"               boolean NOT NULL DEFAULT false,
  "revision"                integer NOT NULL DEFAULT 1,
  "superseded_by"           integer,
  "deleted_at"              timestamptz,
  "deleted_reason"          text,
  "created_at"              timestamptz NOT NULL DEFAULT now(),
  "updated_at"              timestamptz NOT NULL DEFAULT now(),

  -- CHECK constraints mirror Zod enums (defense-in-depth).
  CONSTRAINT "atlas_entries_kind_chk"
    CHECK ("kind" IN ('public', 'ai_infra_public', 'frontier_ai_private')),
  CONSTRAINT "atlas_entries_verification_status_chk"
    CHECK ("verification_status" IN ('verified', 'partial', 'inferred')),
  CONSTRAINT "atlas_entries_dau_band_chk"
    CHECK ("dau_band" IN (
      'under_10k', '10k_100k', '100k_1m', '1m_10m',
      '10m_100m', 'over_100m', 'unknown'
    )),
  CONSTRAINT "atlas_entries_gpu_exposure_chk"
    CHECK ("gpu_exposure" IN (
      'owns_cluster', 'rents_long_term', 'rents_spot', 'serverless', 'none'
    )),
  CONSTRAINT "atlas_entries_inference_pattern_chk"
    CHECK ("inference_pattern" IN (
      'edge', 'batch', 'streaming', 'fine_tune_service', 'training_only', 'none'
    )),
  CONSTRAINT "atlas_entries_data_quality_grade_chk"
    CHECK ("data_quality_grade" IN ('Q1', 'Q2', 'Q3')),
  CONSTRAINT "atlas_entries_primary_source_tier_chk"
    CHECK ("primary_source_tier" IN (
      'A_sec_filing', 'B_official_blog', 'C_press_analyst', 'D_stackshare',
      'E_conference', 'F_github', 'G_model_card', 'H_social_flagged'
    )),
  CONSTRAINT "atlas_entries_primary_source_url_https_chk"
    CHECK ("primary_source_url" LIKE 'https://%'),
  CONSTRAINT "atlas_entries_slug_format_chk"
    CHECK ("slug" ~ '^[a-z][a-z0-9-]*$'),
  CONSTRAINT "atlas_entries_frontmatter_sha256_format_chk"
    CHECK ("frontmatter_sha256" ~ '^[a-f0-9]{64}$'),
  CONSTRAINT "atlas_entries_body_sha256_format_chk"
    CHECK ("body_sha256" ~ '^[a-f0-9]{64}$'),
  -- NDA screen: HARD gate per security-review F1.
  CONSTRAINT "atlas_entries_nda_clean_required"
    CHECK ("nda_clean" = true),
  -- Approval coherence: approved_at + approved_by iff reviewer_approved.
  CONSTRAINT "atlas_entries_approval_coherence"
    CHECK (
      ("reviewer_approved" = false AND "approved_at" IS NULL AND "approved_by" IS NULL)
      OR
      ("reviewer_approved" = true AND "approved_at" IS NOT NULL AND "approved_by" IS NOT NULL)
    )
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "atlas_entries_slug_team_rev_uniq"
  ON "atlas_entries" ("slug", COALESCE("team_id", -1), "revision");

CREATE INDEX IF NOT EXISTS "atlas_entries_team_idx"
  ON "atlas_entries" ("team_id");
CREATE INDEX IF NOT EXISTS "atlas_entries_kind_idx"
  ON "atlas_entries" ("kind");
CREATE INDEX IF NOT EXISTS "atlas_entries_dau_band_idx"
  ON "atlas_entries" ("dau_band");
CREATE INDEX IF NOT EXISTS "atlas_entries_gpu_exposure_idx"
  ON "atlas_entries" ("gpu_exposure");
CREATE INDEX IF NOT EXISTS "atlas_entries_reviewer_approved_idx"
  ON "atlas_entries" ("reviewer_approved");

-- GIN index on archetype_tags so the archetype cross-cut lookup is fast.
CREATE INDEX IF NOT EXISTS "atlas_entries_archetype_tags_gin"
  ON "atlas_entries" USING gin ("archetype_tags" jsonb_path_ops);

-- updated_at trigger
CREATE OR REPLACE FUNCTION "atlas_entries_set_updated_at"()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "atlas_entries_updated_at" ON "atlas_entries";
CREATE TRIGGER "atlas_entries_updated_at"
  BEFORE UPDATE ON "atlas_entries"
  FOR EACH ROW
  EXECUTE FUNCTION "atlas_entries_set_updated_at"();

-- ─────────────────────────────────────────────────────────────────────
-- Row Level Security (security-review F5 — multi-tenant isolation)
-- ─────────────────────────────────────────────────────────────────────
-- Policy shape: app sets `SET app.current_team_id = '<teamId>'` on every
-- transaction via the existing auth middleware (same pattern as projects).
-- SHARED baseline rows (team_id IS NULL) are readable by all tenants but
-- only writable by service-role (RLS bypass via role check).

ALTER TABLE "atlas_entries" ENABLE ROW LEVEL SECURITY;

-- Service-role bypass: migrations + admin jobs run as c1v_service.
-- Safe because service-role key is server-only (CLAUDE.md auth pattern).
CREATE POLICY "atlas_entries_service_all"
  ON "atlas_entries"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.current_role', true) = 'service')
  WITH CHECK (current_setting('app.current_role', true) = 'service');

-- Tenant SELECT: own team + SHARED baseline.
CREATE POLICY "atlas_entries_tenant_select"
  ON "atlas_entries"
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    "team_id" IS NULL
    OR "team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
  );

-- Tenant INSERT: must set team_id to own team (no SHARED writes from tenant path).
CREATE POLICY "atlas_entries_tenant_insert"
  ON "atlas_entries"
  AS PERMISSIVE
  FOR INSERT
  TO PUBLIC
  WITH CHECK (
    "team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
  );

-- Tenant UPDATE: only rows owned by own team; may not reassign team_id.
CREATE POLICY "atlas_entries_tenant_update"
  ON "atlas_entries"
  AS PERMISSIVE
  FOR UPDATE
  TO PUBLIC
  USING (
    "team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
  )
  WITH CHECK (
    "team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
  );

-- Tenant DELETE: own team only.
CREATE POLICY "atlas_entries_tenant_delete"
  ON "atlas_entries"
  AS PERMISSIVE
  FOR DELETE
  TO PUBLIC
  USING (
    "team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
  );

-- Comments (reviewer affordance)
COMMENT ON TABLE "atlas_entries" IS
  'KB-8 Atlas. Each row is a cited public-company / AI-infra stack entry. Zod-validated against companyAtlasEntrySchema at write time. RLS-isolated per team_id; SHARED corpus has team_id=NULL.';
COMMENT ON COLUMN "atlas_entries"."frontmatter_sha256" IS
  'SHA-256 (hex) of canonical frontmatter JSON. Tamper + re-ingest idempotency gate (security-review F2).';
COMMENT ON COLUMN "atlas_entries"."reviewer_approved" IS
  'Reviewer gate. M4/M5 agents MUST check reviewer_approved=true AND corpus size >= 10 before consuming priors (threshold lowered from 20→10 per 2026-04-23 ruling).';
COMMENT ON COLUMN "atlas_entries"."nda_clean" IS
  'NDA screen. Hard-true precondition enforced by CHECK constraint (security-review F1).';
