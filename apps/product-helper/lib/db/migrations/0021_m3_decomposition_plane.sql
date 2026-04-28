-- Migration: m3_decomposition_plane — Crawley Ch 13 decomposition plane supplement (M3)
-- Created: 2026-04-27
-- Brief: Wave-C TC1 EC-V21-C.3 — persists `module-3.decomposition-plane.v1`.
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

CREATE TABLE IF NOT EXISTS "m3_decomposition_plane" (
  "id"            serial         PRIMARY KEY,
  "project_id"    integer        NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,

  "phase_status"  text           NOT NULL DEFAULT 'planned',
  "schema_id"     text           NOT NULL DEFAULT 'module-3.decomposition-plane.v1',
  "payload"       jsonb          NOT NULL,

  "decomposition_plane"  text          NOT NULL,
  "created_at"    timestamptz    NOT NULL DEFAULT now(),
  "updated_at"    timestamptz    NOT NULL DEFAULT now(),

  CONSTRAINT "m3_decomposition_plane_phase_status_chk"
    CHECK ("phase_status" IN ('planned', 'in_progress', 'complete', 'needs_revision')),
  CONSTRAINT "m3_decomposition_plane_payload_object_chk"
    CHECK (jsonb_typeof("payload") = 'object'),
  CONSTRAINT "m3_decomposition_plane_schema_id_chk"
    CHECK ("schema_id" = 'module-3.decomposition-plane.v1')
);

CREATE UNIQUE INDEX IF NOT EXISTS "m3_decomposition_plane_project_id_unique"
  ON "m3_decomposition_plane" ("project_id");

CREATE INDEX IF NOT EXISTS "m3_decomposition_plane_phase_status_idx"
  ON "m3_decomposition_plane" ("phase_status");

CREATE INDEX IF NOT EXISTS "m3_decomposition_plane_plane_idx"
  ON "m3_decomposition_plane" ("decomposition_plane");

CREATE OR REPLACE FUNCTION "m3_decomposition_plane_set_updated_at"()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "m3_decomposition_plane_updated_at" ON "m3_decomposition_plane";
CREATE TRIGGER "m3_decomposition_plane_updated_at"
  BEFORE UPDATE ON "m3_decomposition_plane"
  FOR EACH ROW
  EXECUTE FUNCTION "m3_decomposition_plane_set_updated_at"();

-- ─────────────────────────────────────────────────────────────────────
-- Row Level Security (day-one — explicit anti-pattern is the legacy
-- `projects` table where RLS is enabled with zero tenant policies. See
-- plans/post-v2-followups.md P3 security pass.)
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE "m3_decomposition_plane" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "m3_decomposition_plane_service_all"
  ON "m3_decomposition_plane"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.current_role', true) = 'service')
  WITH CHECK (current_setting('app.current_role', true) = 'service');

CREATE POLICY "m3_decomposition_plane_tenant_select"
  ON "m3_decomposition_plane"
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    current_setting('app.current_role', true) IN ('tenant', 'user', 'service')
    AND EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "m3_decomposition_plane"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

CREATE POLICY "m3_decomposition_plane_tenant_insert"
  ON "m3_decomposition_plane"
  AS PERMISSIVE
  FOR INSERT
  TO PUBLIC
  WITH CHECK (
    current_setting('app.current_role', true) IN ('tenant', 'user', 'service')
    AND EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "m3_decomposition_plane"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

CREATE POLICY "m3_decomposition_plane_tenant_update"
  ON "m3_decomposition_plane"
  AS PERMISSIVE
  FOR UPDATE
  TO PUBLIC
  USING (
    current_setting('app.current_role', true) IN ('tenant', 'user', 'service')
    AND EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "m3_decomposition_plane"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  )
  WITH CHECK (
    current_setting('app.current_role', true) IN ('tenant', 'user', 'service')
    AND EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "m3_decomposition_plane"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

-- NO DELETE policy — audit retention; rows persist until projects.id cascade.

COMMENT ON TABLE "m3_decomposition_plane" IS
  'Crawley Ch 13 decomposition plane supplement (M3) (REQUIREMENTS-crawley §6). One row per project; payload validated against module-3.decomposition-plane.v1 Zod schema. RLS day-one: service-role bypass + tenant access via project.team_id; no DELETE.';
