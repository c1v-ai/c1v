-- Migration: Module 0 tables — user_signals + project_entry_states
-- Created: 2026-04-24
-- Brief: T7 c1v-module0-be Wave-2-early. Pre-pipeline gate per v1 §5.0.
--
-- Purpose:
--   user_signals         — company enrichment cache keyed by user_id
--                          (Clearbit/LinkedIn scrape results); 30-day TTL
--                          enforced in query layer via scraped_at.
--   project_entry_states — per-project entry pattern (new/existing/exploring)
--                          + pipeline_start_submodule hint (M1.1 or M3.1).
--
-- RLS:
--   - service role bypass (`app.current_role = 'service'`) — used by the
--     signup-signals-agent writer + admin tooling.
--   - user_signals tenant policy: rows visible iff
--     user_id = current_setting('app.current_user_id')::int.
--   - project_entry_states tenant policy: rows visible iff the referenced
--     project belongs to the caller's current team
--     (app.current_team_id) AND the caller is the owning user
--     OR current_role = service.
--
-- Drizzle-kit is broken per CLAUDE.md — manual SQL only.

-- ═════════════════════════════════════════════════════════════════════
-- user_signals
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "user_signals" (
  "id"                    serial PRIMARY KEY,
  "user_id"               integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

  -- Company enrichment envelope
  "domain"                varchar(253),
  "company_name"          varchar(255),
  "industry"              varchar(120),
  "employee_count_band"   varchar(40),
  "funding_stage"         varchar(40),
  "website_tech_stack"    jsonb NOT NULL DEFAULT '[]'::jsonb,
  "compliance_badges"     jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Scrape telemetry
  "scrape_status"         varchar(20) NOT NULL DEFAULT 'pending',
  "scrape_error"          text,
  "scrape_confidence"     numeric(4, 3),
  "scraped_at"            timestamptz,

  "created_at"            timestamptz NOT NULL DEFAULT now(),
  "updated_at"            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT "user_signals_scrape_status_chk"
    CHECK ("scrape_status" IN ('pending', 'success', 'failed', 'skipped')),
  CONSTRAINT "user_signals_confidence_range_chk"
    CHECK ("scrape_confidence" IS NULL
           OR ("scrape_confidence" >= 0 AND "scrape_confidence" <= 1)),
  CONSTRAINT "user_signals_tech_stack_array_chk"
    CHECK (jsonb_typeof("website_tech_stack") = 'array'),
  CONSTRAINT "user_signals_compliance_array_chk"
    CHECK (jsonb_typeof("compliance_badges") = 'array')
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_signals_user_id_unique"
  ON "user_signals" ("user_id");
CREATE INDEX IF NOT EXISTS "user_signals_domain_idx"
  ON "user_signals" ("domain");
CREATE INDEX IF NOT EXISTS "user_signals_scraped_at_idx"
  ON "user_signals" ("scraped_at");

ALTER TABLE "user_signals" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_signals_service_all"
  ON "user_signals"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.current_role', true) = 'service')
  WITH CHECK (current_setting('app.current_role', true) = 'service');

CREATE POLICY "user_signals_owner_select"
  ON "user_signals"
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    "user_id" = NULLIF(current_setting('app.current_user_id', true), '')::integer
  );

COMMENT ON TABLE "user_signals" IS
  'Module 0 enrichment cache. One row per user (unique on user_id). 30-day TTL enforced in query layer via scraped_at — rows older than USER_SIGNALS_TTL_DAYS are considered stale and rescraped on next read. RLS: service role writes; users SELECT own row only.';
COMMENT ON COLUMN "user_signals"."scrape_status" IS
  'pending (job queued), success (enrichment landed), failed (provider error or timeout — scrape_error set), skipped (consumer-email domain — no scrape attempted).';
COMMENT ON COLUMN "user_signals"."scraped_at" IS
  'Timestamp enrichment payload was produced. NULL until the first successful scrape. Read freshness = now() - scraped_at < interval ''30 days''.';

-- ═════════════════════════════════════════════════════════════════════
-- project_entry_states
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "project_entry_states" (
  "id"                         serial PRIMARY KEY,
  "project_id"                 integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id"                    integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

  "entry_pattern"              varchar(16) NOT NULL,
  "pipeline_start_submodule"   varchar(16) NOT NULL,

  "existing_project_signals"   jsonb,

  "created_at"                 timestamptz NOT NULL DEFAULT now(),
  "updated_at"                 timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT "project_entry_states_entry_pattern_chk"
    CHECK ("entry_pattern" IN ('new', 'existing', 'exploring')),
  CONSTRAINT "project_entry_states_pipeline_start_chk"
    CHECK ("pipeline_start_submodule" IN ('M1.1', 'M3.1')),
  -- Routing invariant: entry_pattern ⇒ pipeline_start_submodule.
  CONSTRAINT "project_entry_states_routing_chk"
    CHECK (
      ("entry_pattern" IN ('new', 'exploring') AND "pipeline_start_submodule" = 'M1.1')
      OR
      ("entry_pattern" = 'existing' AND "pipeline_start_submodule" = 'M3.1')
    ),
  -- Brownfield-signals gate: non-null iff entry_pattern = existing.
  CONSTRAINT "project_entry_states_signals_gate_chk"
    CHECK (
      ("entry_pattern" = 'existing'     AND "existing_project_signals" IS NOT NULL)
      OR
      ("entry_pattern" IN ('new', 'exploring') AND "existing_project_signals" IS NULL)
    ),
  CONSTRAINT "project_entry_states_signals_object_chk"
    CHECK (
      "existing_project_signals" IS NULL
      OR jsonb_typeof("existing_project_signals") = 'object'
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_entry_states_project_id_unique"
  ON "project_entry_states" ("project_id");
CREATE INDEX IF NOT EXISTS "project_entry_states_user_id_idx"
  ON "project_entry_states" ("user_id");
CREATE INDEX IF NOT EXISTS "project_entry_states_entry_pattern_idx"
  ON "project_entry_states" ("entry_pattern");

ALTER TABLE "project_entry_states" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_entry_states_service_all"
  ON "project_entry_states"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.current_role', true) = 'service')
  WITH CHECK (current_setting('app.current_role', true) = 'service');

CREATE POLICY "project_entry_states_tenant_select"
  ON "project_entry_states"
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_entry_states"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

CREATE POLICY "project_entry_states_owner_insert"
  ON "project_entry_states"
  AS PERMISSIVE
  FOR INSERT
  TO PUBLIC
  WITH CHECK (
    "user_id" = NULLIF(current_setting('app.current_user_id', true), '')::integer
    AND EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_entry_states"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

CREATE POLICY "project_entry_states_owner_update"
  ON "project_entry_states"
  AS PERMISSIVE
  FOR UPDATE
  TO PUBLIC
  USING (
    "user_id" = NULLIF(current_setting('app.current_user_id', true), '')::integer
  )
  WITH CHECK (
    "user_id" = NULLIF(current_setting('app.current_user_id', true), '')::integer
  );

COMMENT ON TABLE "project_entry_states" IS
  'Module 0 per-project entry record. One row per project (unique on project_id). Persists project_entry.v1 — entry_pattern drives pipeline_start_submodule (enforced via CHECK). RLS: service role writes; tenant SELECT via project.team_id; owner INSERT/UPDATE via user_id.';
COMMENT ON COLUMN "project_entry_states"."pipeline_start_submodule" IS
  'Orchestrator hint. Tied to entry_pattern by CHECK constraint: new/exploring → M1.1, existing → M3.1.';
COMMENT ON COLUMN "project_entry_states"."existing_project_signals" IS
  'Brownfield signals envelope. Non-null iff entry_pattern = existing. Shape matches existingProjectSignalsSchema (github_repo_url, market_url, architecture_doc_upload_url, pain_points[], pain_points_other, current_dau_estimate).';
