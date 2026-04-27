-- Migration: m5_phase_4_solution_neutral_concept — Crawley Ch 7 solution-neutral concept artifact (morphological matrix)
-- Created: 2026-04-27
-- Brief: Wave-C TC1 EC-V21-C.3 — persists `module-5.phase-4-solution-neutral-concept.v1`.
--
-- Per REQUIREMENTS-crawley §6: typed JSONB payload column carries the full
-- envelope-validated shape. One row per project (UNIQUE on project_id),
-- mutated in place by the M-phase agent.
--
-- RLS pattern mirrors `project_run_state` (0013) — service-role bypass,
-- tenant SELECT/INSERT/UPDATE via project.team_id, NO DELETE policy (audit
-- retention; cascade-only via projects.id deletion).
--
-- Drizzle-kit is broken per repo CLAUDE.md — manual SQL only.

CREATE TABLE IF NOT EXISTS "m5_phase_4_solution_neutral_concept" (
  "id"            serial         PRIMARY KEY,
  "project_id"    integer        NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,

  "phase_status"  text           NOT NULL DEFAULT 'planned',
  "schema_id"     text           NOT NULL DEFAULT 'module-5.phase-4-solution-neutral-concept.v1',
  "payload"       jsonb          NOT NULL,

  "created_at"    timestamptz    NOT NULL DEFAULT now(),
  "updated_at"    timestamptz    NOT NULL DEFAULT now(),

  CONSTRAINT "m5_phase_4_solution_neutral_concept_phase_status_chk"
    CHECK ("phase_status" IN ('planned', 'in_progress', 'complete', 'needs_revision')),
  CONSTRAINT "m5_phase_4_solution_neutral_concept_payload_object_chk"
    CHECK (jsonb_typeof("payload") = 'object'),
  CONSTRAINT "m5_phase_4_solution_neutral_concept_schema_id_chk"
    CHECK ("schema_id" = 'module-5.phase-4-solution-neutral-concept.v1')
);

CREATE UNIQUE INDEX IF NOT EXISTS "m5_phase_4_solution_neutral_concept_project_id_unique"
  ON "m5_phase_4_solution_neutral_concept" ("project_id");

CREATE INDEX IF NOT EXISTS "m5_phase_4_solution_neutral_concept_phase_status_idx"
  ON "m5_phase_4_solution_neutral_concept" ("phase_status");

CREATE OR REPLACE FUNCTION "m5_phase_4_solution_neutral_concept_set_updated_at"()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "m5_phase_4_solution_neutral_concept_updated_at" ON "m5_phase_4_solution_neutral_concept";
CREATE TRIGGER "m5_phase_4_solution_neutral_concept_updated_at"
  BEFORE UPDATE ON "m5_phase_4_solution_neutral_concept"
  FOR EACH ROW
  EXECUTE FUNCTION "m5_phase_4_solution_neutral_concept_set_updated_at"();

-- ─────────────────────────────────────────────────────────────────────
-- Row Level Security (day-one — explicit anti-pattern is the legacy
-- `projects` table where RLS is enabled with zero tenant policies. See
-- plans/post-v2-followups.md P3 security pass.)
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE "m5_phase_4_solution_neutral_concept" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "m5_phase_4_solution_neutral_concept_service_all"
  ON "m5_phase_4_solution_neutral_concept"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.current_role', true) = 'service')
  WITH CHECK (current_setting('app.current_role', true) = 'service');

CREATE POLICY "m5_phase_4_solution_neutral_concept_tenant_select"
  ON "m5_phase_4_solution_neutral_concept"
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    current_setting('app.current_role', true) IN ('tenant', 'user', 'service')
    AND EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "m5_phase_4_solution_neutral_concept"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

CREATE POLICY "m5_phase_4_solution_neutral_concept_tenant_insert"
  ON "m5_phase_4_solution_neutral_concept"
  AS PERMISSIVE
  FOR INSERT
  TO PUBLIC
  WITH CHECK (
    current_setting('app.current_role', true) IN ('tenant', 'user', 'service')
    AND EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "m5_phase_4_solution_neutral_concept"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

CREATE POLICY "m5_phase_4_solution_neutral_concept_tenant_update"
  ON "m5_phase_4_solution_neutral_concept"
  AS PERMISSIVE
  FOR UPDATE
  TO PUBLIC
  USING (
    current_setting('app.current_role', true) IN ('tenant', 'user', 'service')
    AND EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "m5_phase_4_solution_neutral_concept"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  )
  WITH CHECK (
    current_setting('app.current_role', true) IN ('tenant', 'user', 'service')
    AND EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "m5_phase_4_solution_neutral_concept"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

-- NO DELETE policy — audit retention; rows persist until projects.id cascade.

COMMENT ON TABLE "m5_phase_4_solution_neutral_concept" IS
  'Crawley Ch 7 solution-neutral concept artifact (morphological matrix) (REQUIREMENTS-crawley §6). One row per project; payload validated against module-5.phase-4-solution-neutral-concept.v1 Zod schema. RLS day-one: service-role bypass + tenant access via project.team_id; no DELETE.';
