-- Migration: Row-Level Security on kb_chunks (RAG corpus).
-- Created: 2026-04-27
-- Brief: c1v v2.2 Wave E TE1 — engine-pgvector (EC-V21-E.6).
--
-- DELTA migration. The table + ivfflat index were shipped by
-- 0011a_kb_chunks.sql; this migration only adds RLS + role grants.
--
-- Why GLOBAL-READ (NOT tenant-scoped):
--   The KB corpus is reference content (Crawley book excerpts, eCornell
--   modules, atlas priors, _shared cross-cutting KBs). It is the same
--   for every tenant — there is no per-team chunk. Tenant-scoping it
--   would break the engine's RAG path (zero rows visible from a tenant
--   role) without adding any privacy benefit (no PII, no tenant data).
--   D-V21.22 also locks RAG to KB chunks only; chat history + upstream
--   artifacts stay out of v1, so this surface stays narrow.
--
-- Policy shape:
--   * service-role: full ALL (USING + WITH CHECK on
--     current_setting('app.current_role') = 'service'). Mirrors the
--     pattern already used by `decision_audit` (0011b §RLS) and
--     `project_artifacts` so the runtime path can ingest, re-embed, and
--     read chunks under one role flag.
--   * authenticated/anon role: PERMISSIVE SELECT for everyone (KB is
--     global). No INSERT/UPDATE/DELETE policy → those verbs are denied
--     by default once RLS is on.
--   * No DELETE policy is intentional. If a chunk needs to be removed,
--     it goes via service-role + a new migration (audit trail).
--
-- Anchor: kb-runtime-architecture.md §2.1 (G8/G9). Day-0 inventory line
--   120 (`plans/wave-e-day-0-inventory.md`) records the upstream table.

-- ─── Role grants ────────────────────────────────────────────────────
-- PUBLIC default in postgres is broad; tighten to "SELECT for anyone
-- authenticated, nothing else." Service role is superuser via
-- rolbypassrls and isn't gated by these grants.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE "kb_chunks" FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE "kb_chunks" FROM "authenticated"';
    EXECUTE 'GRANT SELECT ON TABLE "kb_chunks" TO "authenticated"';
  END IF;
  -- anon (unauthenticated) gets nothing. RAG is a logged-in feature.
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE "kb_chunks" FROM "anon"';
  END IF;
END $$;

-- ─── Row Level Security ─────────────────────────────────────────────
ALTER TABLE "kb_chunks" ENABLE ROW LEVEL SECURITY;

-- Service-role escape hatch — used by the ingest path
-- (`scripts/ingest-kbs.ts`) and any future re-embed migration.
CREATE POLICY "kb_chunks_service_all"
  ON "kb_chunks"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.current_role', true) = 'service')
  WITH CHECK (current_setting('app.current_role', true) = 'service');

-- Authenticated read — KB corpus is global reference content.
-- No tenant condition: every logged-in user sees every chunk.
CREATE POLICY "kb_chunks_authenticated_select"
  ON "kb_chunks"
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    -- Allow when caller has explicitly entered the runtime context
    -- (engine path sets current_role='engine') OR the standard tenant
    -- session marker is set (i.e. we're inside an authenticated
    -- request). Anonymous connections without either flag set are
    -- denied by virtue of falling through to no matching policy.
    current_setting('app.current_role', true) IN ('engine', 'tenant')
    OR NULLIF(current_setting('app.current_team_id', true), '') IS NOT NULL
  );

-- Deliberately NO INSERT policy.
-- Deliberately NO UPDATE policy.
-- Deliberately NO DELETE policy.
-- Writes are service-role only via the kb_chunks_service_all policy.

-- ─── Comments ────────────────────────────────────────────────────────
COMMENT ON POLICY "kb_chunks_service_all" ON "kb_chunks" IS
  'Service-role escape hatch for ingest + re-embed paths. Gated on app.current_role = service.';
COMMENT ON POLICY "kb_chunks_authenticated_select" ON "kb_chunks" IS
  'KB corpus is global reference content — every authenticated caller (engine OR tenant context) reads every chunk. Anon role is denied via REVOKE + no matching policy.';
