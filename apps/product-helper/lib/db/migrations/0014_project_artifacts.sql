-- Migration: project_artifacts — per-tenant generated synthesis artifact metadata
-- Created: 2026-04-25
-- Brief: TA1 c1v-runtime-wiring (master plan v2.1 Wave A, D-V21.04).
--
-- Purpose:
--   Stores metadata for synthesis artifacts (recommendation JSON/HTML/PDF/PPTX,
--   FMEA/HoQ/N2 xlsx, mermaid diagrams, bundle ZIPs, decision-network/decision-matrix
--   JSON). Bytes live in Supabase Storage with signed URLs per D-V21.08 — this
--   table is metadata + status only.
--
--   The TA3 sidecar writes rows on synthesis kickoff (status='pending') and
--   updates them as artifacts emit (status='ready' with storage_path/sha256/
--   synthesized_at). Reads are surfaced by the TA2 synthesis viewer +
--   /api/projects/[id]/artifacts/manifest.
--
-- RLS pattern mirrors `project_run_state` (0013) — service-role bypass for
-- sidecar writers, tenant SELECT via project.team_id, tenant INSERT/UPDATE
-- gated on team membership; DELETE policy NOT created (intentional — audit
-- retention, no row deletion).
--
-- Drizzle-kit is broken per repo CLAUDE.md — manual SQL only.

CREATE TABLE IF NOT EXISTS "project_artifacts" (
  "id"                 uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id"         integer        NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,

  "artifact_kind"      text           NOT NULL,
  "storage_path"       text,
  "format"             text,
  "sha256"             text,
  "synthesis_status"   text           NOT NULL DEFAULT 'pending',
  "inputs_hash"        text,

  "synthesized_at"     timestamptz,
  "failure_reason"     text,

  "created_at"         timestamptz    NOT NULL DEFAULT now(),
  "updated_at"         timestamptz    NOT NULL DEFAULT now(),

  CONSTRAINT "project_artifacts_synthesis_status_chk"
    CHECK ("synthesis_status" IN ('pending', 'ready', 'failed')),
  CONSTRAINT "project_artifacts_sha256_hex_chk"
    CHECK ("sha256" IS NULL OR "sha256" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "project_artifacts_inputs_hash_hex_chk"
    CHECK ("inputs_hash" IS NULL OR "inputs_hash" ~ '^[0-9a-f]+$')
);

-- Synthesis-page reads: fetch all artifact kinds for a project, or the latest
-- of a given kind. Compound index covers both (project_id, project_id+kind).
CREATE INDEX IF NOT EXISTS "project_artifacts_project_kind_idx"
  ON "project_artifacts" ("project_id", "artifact_kind");

-- Status polling: TA3 sidecar polls per-artifact synthesis_status (pending/
-- ready/failed) until terminal.
CREATE INDEX IF NOT EXISTS "project_artifacts_project_status_idx"
  ON "project_artifacts" ("project_id", "synthesis_status");

-- updated_at trigger
CREATE OR REPLACE FUNCTION "project_artifacts_set_updated_at"()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "project_artifacts_updated_at" ON "project_artifacts";
CREATE TRIGGER "project_artifacts_updated_at"
  BEFORE UPDATE ON "project_artifacts"
  FOR EACH ROW
  EXECUTE FUNCTION "project_artifacts_set_updated_at"();

-- ─────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────
--
-- Day-one RLS per R-V21.08 (do NOT mirror the documented `projects` table
-- gap — projects has RLS enabled with zero tenant policies, deferred to
-- post-v2-followups; this table ships with full policy set).

ALTER TABLE "project_artifacts" ENABLE ROW LEVEL SECURITY;

-- Service role: full access for sidecar writers (TA3 orchestrator).
CREATE POLICY "project_artifacts_service_all"
  ON "project_artifacts"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.current_role', true) = 'service')
  WITH CHECK (current_setting('app.current_role', true) = 'service');

-- Tenant SELECT: caller's team_id matches the parent project.team_id.
CREATE POLICY "project_artifacts_tenant_select"
  ON "project_artifacts"
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_artifacts"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

-- Tenant INSERT: only via service role per spec (sidecar uses service key).
-- We still ship a tenant policy for defense-in-depth — caller must own the
-- project, but the sidecar code path always sets app.current_role='service'
-- so this branch is rarely exercised.
CREATE POLICY "project_artifacts_tenant_insert"
  ON "project_artifacts"
  AS PERMISSIVE
  FOR INSERT
  TO PUBLIC
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_artifacts"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

-- Tenant UPDATE: same gate as INSERT; in practice sidecar (service role)
-- handles all updates. Tenant updates would only fire if an end-user UI
-- ever needed to mutate a row — none planned in v2.1.
CREATE POLICY "project_artifacts_tenant_update"
  ON "project_artifacts"
  AS PERMISSIVE
  FOR UPDATE
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_artifacts"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "project_artifacts"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

-- DELETE: intentionally NO tenant policy. Audit-only retention — once an
-- artifact row is created, it persists. Service-role can still DELETE via
-- the FOR ALL service policy above (ON DELETE CASCADE from projects fires
-- as a system action, not a tenant action).

COMMENT ON TABLE "project_artifacts" IS
  'Per-tenant synthesis artifact metadata (TA1 c1v-runtime-wiring, master plan v2.1 D-V21.04). Bytes live in Supabase Storage; this table is metadata + status only. TA3 sidecar writes rows on kickoff (status=pending) and updates as artifacts emit. Reads via TA2 synthesis viewer + manifest API. RLS: service-role bypass for sidecar; tenant SELECT/INSERT/UPDATE via project.team_id; DELETE blocked for tenants (audit retention).';

COMMENT ON COLUMN "project_artifacts"."artifact_kind" IS
  'Artifact kind enum-like text. Pre-created on synthesis kickoff: recommendation_json, recommendation_html, recommendation_pdf, recommendation_pptx, fmea_early_xlsx, fmea_residual_xlsx, hoq_xlsx. Optional kinds emitted as synthesis runs: n2_matrix_xlsx, mermaid_*, bundle_zip, decision_network_v1, decision_matrix_v1.';

COMMENT ON COLUMN "project_artifacts"."storage_path" IS
  'Supabase Storage object path (e.g. "project-artifacts/{project_id}/{artifact_kind}-{sha256}.{format}"). Null while synthesis_status=pending.';

COMMENT ON COLUMN "project_artifacts"."synthesis_status" IS
  'Lifecycle state — pending | ready | failed. Sidecar writes pending on kickoff, ready on artifact emit (with storage_path + sha256 + synthesized_at), failed on error (with failure_reason).';

COMMENT ON COLUMN "project_artifacts"."inputs_hash" IS
  'Content-addressed hash of the artifact''s synthesis inputs (per EC-V21-A.12). Stable across re-runs with identical inputs — enables cache-keyed deduplication. Real hash owned by langgraph-wirer agent; placeholder value accepted from TA3 until real-hash lands.';

COMMENT ON COLUMN "project_artifacts"."failure_reason" IS
  'Set when synthesis_status=failed. Free-text explanation surfaced in the TA2 retry UX.';
