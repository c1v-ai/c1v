-- Migration: project_run_state — pipeline-wide run state per project
-- Created: 2026-04-24
-- Brief: T6 c1v-synthesis Wave-4. v1 §8.2 + Exit Criterion §12-bullet-5.
--
-- Purpose:
--   Tracks pipeline entry phase, current phase, loop iteration, per-module
--   revision counters, modules running on stub upstream artifacts, and a
--   structured delta log (v1 §8.4). Mutated by every phase agent on
--   start/complete/revision.
--
-- One row per project (UNIQUE project_id). Updated in place; the row is
-- not versioned — revision history lives inside the `revision_log[]`
-- JSONB array.
--
-- RLS pattern mirrors `project_entry_states` (0012):
--   - service-role bypass for backend pipeline writers.
--   - tenant SELECT via project.team_id (caller's app.current_team_id).
--   - owner INSERT/UPDATE: caller's team must own the project.
--
-- Drizzle-kit is broken per repo CLAUDE.md — manual SQL only.

CREATE TABLE IF NOT EXISTS "project_run_state" (
  "id"                     serial PRIMARY KEY,
  "project_id"             integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,

  "started_from_phase"     integer NOT NULL,
  "current_phase"          integer NOT NULL,
  "loop_iteration"         integer NOT NULL DEFAULT 0,

  "module_revisions"       jsonb   NOT NULL DEFAULT '{}'::jsonb,
  "stub_upstream"          jsonb   NOT NULL DEFAULT '[]'::jsonb,
  "revision_log"           jsonb   NOT NULL DEFAULT '[]'::jsonb,

  "created_at"             timestamptz NOT NULL DEFAULT now(),
  "updated_at"             timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT "project_run_state_loop_iteration_nonneg_chk"
    CHECK ("loop_iteration" >= 0),
  CONSTRAINT "project_run_state_started_from_phase_range_chk"
    CHECK ("started_from_phase" BETWEEN 0 AND 8),
  CONSTRAINT "project_run_state_current_phase_range_chk"
    CHECK ("current_phase" BETWEEN 0 AND 8),
  CONSTRAINT "project_run_state_module_revisions_object_chk"
    CHECK (jsonb_typeof("module_revisions") = 'object'),
  CONSTRAINT "project_run_state_stub_upstream_array_chk"
    CHECK (jsonb_typeof("stub_upstream") = 'array'),
  CONSTRAINT "project_run_state_revision_log_array_chk"
    CHECK (jsonb_typeof("revision_log") = 'array')
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_run_state_project_id_unique"
  ON "project_run_state" ("project_id");

CREATE INDEX IF NOT EXISTS "project_run_state_current_phase_idx"
  ON "project_run_state" ("current_phase");

-- updated_at trigger
CREATE OR REPLACE FUNCTION "project_run_state_set_updated_at"()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "project_run_state_updated_at" ON "project_run_state";
CREATE TRIGGER "project_run_state_updated_at"
  BEFORE UPDATE ON "project_run_state"
  FOR EACH ROW
  EXECUTE FUNCTION "project_run_state_set_updated_at"();

-- ─────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE "project_run_state" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_run_state_service_all"
  ON "project_run_state"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.current_role', true) = 'service')
  WITH CHECK (current_setting('app.current_role', true) = 'service');

CREATE POLICY "project_run_state_tenant_select"
  ON "project_run_state"
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_run_state"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

CREATE POLICY "project_run_state_tenant_insert"
  ON "project_run_state"
  AS PERMISSIVE
  FOR INSERT
  TO PUBLIC
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_run_state"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

CREATE POLICY "project_run_state_tenant_update"
  ON "project_run_state"
  AS PERMISSIVE
  FOR UPDATE
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_run_state"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_run_state"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

CREATE POLICY "project_run_state_tenant_delete"
  ON "project_run_state"
  AS PERMISSIVE
  FOR DELETE
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_run_state"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

COMMENT ON TABLE "project_run_state" IS
  'Pipeline-wide run state per project (v1 §8.2). One row per project (UNIQUE project_id). Mutated in place by phase agents on start/complete/revision. RLS: service-role bypass; tenant access via project.team_id.';
COMMENT ON COLUMN "project_run_state"."module_revisions" IS
  'Per-module monotonic revision counters: {"M1":3,"M2":1,...}. Bumped whenever the module emits a new envelope revision.';
COMMENT ON COLUMN "project_run_state"."stub_upstream" IS
  'Modules currently running with stub upstream artifacts (e.g. M5 with hand-provided M3/M4 stubs). Tracks partial-pipeline flows per v1 §8.3.';
COMMENT ON COLUMN "project_run_state"."revision_log" IS
  'Append-only revision delta log per v1 §8.4. Each entry: {module,from_revision,to_revision,changed_fields[],changed_by,reason,timestamp}.';
