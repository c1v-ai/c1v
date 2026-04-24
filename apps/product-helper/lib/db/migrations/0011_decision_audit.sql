-- Migration: Create decision_audit table (NFR-engine Scoring audit sink)
-- Created: 2026-04-21
-- Revised: 2026-04-22 (row shape finalized with 'runtime' peer)
-- Brief: c1v-runtime-prereqs G5 — audit-db peer.
-- Mitigates: kb-runtime-architecture.md §3.1 (audit sink gap G5),
--            security-review.md F8 (incident-response completeness: adds
--            model_version, kb_chunk_ids, hash_chain_prev, agent_id),
--            security-review.md F5 (tenant isolation via project→team RLS).
--
-- Purpose:
--   Append-only sink for every NFR-engine Scoring decision. Write path:
--     NFREngineInterpreter.evaluate() → writeAuditRow() → INSERT.
--   There is no UPDATE path and no DELETE path — rows form a hash chain
--   per (project_id, target_field) so tampering is detectable.
--
-- EngineOutput → column mapping (source of truth: runtime peer, 2026-04-22):
--   1:1 from EngineOutput: decision_id, target_field, value, units,
--     inputs_used, modifiers_applied, base_confidence, final_confidence,
--     matched_rule_id, auto_filled, needs_user_input, computed_options,
--     math_trace, missing_inputs.
--   Caller-supplied: target_artifact, story_id, engine_version, project_id,
--     agent_id, model_version, kb_chunk_ids, user_overrideable.
--   Writer-computed: id, hash_chain_prev, evaluated_at (default), override_history (default).

CREATE TABLE IF NOT EXISTS "decision_audit" (
  "id"                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id"         integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,

  -- Decision identity
  "decision_id"        text NOT NULL,
  "target_field"       text NOT NULL,
  "target_artifact"    text NOT NULL,
  "story_id"           text NOT NULL,
  "engine_version"     text NOT NULL,

  -- Scoring output (EngineOutput 1:1)
  "value"              jsonb,
  "units"              text,
  "inputs_used"        jsonb NOT NULL DEFAULT '{}'::jsonb,
  "modifiers_applied"  jsonb NOT NULL DEFAULT '[]'::jsonb,
  "base_confidence"    numeric(4, 3) NOT NULL,
  "final_confidence"   numeric(4, 3) NOT NULL,
  "matched_rule_id"    text,
  "auto_filled"        boolean NOT NULL DEFAULT false,
  "needs_user_input"   boolean NOT NULL DEFAULT false,
  "computed_options"   jsonb,
  "math_trace"         text NOT NULL,
  "missing_inputs"     text[] NOT NULL DEFAULT '{}'::text[],

  -- Reproducibility (security-review F8)
  "model_version"      text NOT NULL,
  "rag_attempted"      boolean NOT NULL DEFAULT false,
  "kb_chunk_ids"       uuid[] NOT NULL DEFAULT '{}'::uuid[],
  "hash_chain_prev"    varchar(64),

  -- Policy + override lineage
  "user_overrideable"  boolean NOT NULL DEFAULT true,
  "override_history"   jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- When + who
  "evaluated_at"       timestamptz NOT NULL DEFAULT now(),
  "agent_id"           text NOT NULL,

  -- Confidence must be in [0, 1].
  CONSTRAINT "decision_audit_base_conf_range_chk"
    CHECK ("base_confidence" >= 0 AND "base_confidence" <= 1),
  CONSTRAINT "decision_audit_final_conf_range_chk"
    CHECK ("final_confidence" >= 0 AND "final_confidence" <= 1),

  -- Hash must be 64 lowercase hex chars if present.
  CONSTRAINT "decision_audit_hash_chain_prev_format_chk"
    CHECK ("hash_chain_prev" IS NULL OR "hash_chain_prev" ~ '^[a-f0-9]{64}$'),

  -- Disposition flags are mutually exclusive.
  CONSTRAINT "decision_audit_disposition_chk"
    CHECK (NOT ("auto_filled" = true AND "needs_user_input" = true)),

  -- Invariant #3 from runtime: computed_options non-null iff needs_user_input=true.
  CONSTRAINT "decision_audit_computed_options_chk"
    CHECK (
      ("needs_user_input" = true  AND "computed_options" IS NOT NULL)
      OR
      ("needs_user_input" = false AND "computed_options" IS NULL)
    ),

  -- RAG tri-state: if rag_attempted=false, kb_chunk_ids MUST be empty.
  -- (rag_attempted=true allows either empty [zero hits] or non-empty.)
  CONSTRAINT "decision_audit_rag_attempted_chk"
    CHECK (
      "rag_attempted" = true
      OR cardinality("kb_chunk_ids") = 0
    ),

  -- JSONB shape guards (defense-in-depth; Zod is the source of truth).
  CONSTRAINT "decision_audit_modifiers_is_array_chk"
    CHECK (jsonb_typeof("modifiers_applied") = 'array'),
  CONSTRAINT "decision_audit_override_history_is_array_chk"
    CHECK (jsonb_typeof("override_history") = 'array'),
  CONSTRAINT "decision_audit_inputs_is_object_chk"
    CHECK (jsonb_typeof("inputs_used") = 'object'),
  CONSTRAINT "decision_audit_computed_options_is_array_chk"
    CHECK ("computed_options" IS NULL OR jsonb_typeof("computed_options") = 'array')
);

-- ─── Indexes ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "decision_audit_project_target_ts_idx"
  ON "decision_audit" ("project_id", "target_field", "evaluated_at" DESC);

CREATE INDEX IF NOT EXISTS "decision_audit_project_ts_idx"
  ON "decision_audit" ("project_id", "evaluated_at" DESC);

CREATE INDEX IF NOT EXISTS "decision_audit_project_story_ts_idx"
  ON "decision_audit" ("project_id", "story_id", "evaluated_at" DESC);

CREATE INDEX IF NOT EXISTS "decision_audit_hash_chain_prev_idx"
  ON "decision_audit" ("hash_chain_prev");

-- ─── Append-only enforcement (security-review F8) ───────────────────
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE "decision_audit" FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE UPDATE, DELETE, TRUNCATE ON TABLE "decision_audit" FROM "authenticated"';
    EXECUTE 'GRANT SELECT, INSERT ON TABLE "decision_audit" TO "authenticated"';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE "decision_audit" FROM "anon"';
  END IF;
END $$;

-- ─── Row Level Security ─────────────────────────────────────────────
ALTER TABLE "decision_audit" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decision_audit_service_all"
  ON "decision_audit"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.current_role', true) = 'service')
  WITH CHECK (current_setting('app.current_role', true) = 'service');

CREATE POLICY "decision_audit_tenant_select"
  ON "decision_audit"
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "decision_audit"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

CREATE POLICY "decision_audit_tenant_insert"
  ON "decision_audit"
  AS PERMISSIVE
  FOR INSERT
  TO PUBLIC
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "projects" p
      WHERE p."id" = "decision_audit"."project_id"
        AND p."team_id" = NULLIF(current_setting('app.current_team_id', true), '')::integer
    )
  );

-- Deliberately NO UPDATE policy.
-- Deliberately NO DELETE policy.

-- ─── Comments ────────────────────────────────────────────────────────
COMMENT ON TABLE "decision_audit" IS
  'Append-only audit sink for every NFR-engine Scoring decision. Hash-chained per (project_id, target_field) for tamper detection. No UPDATE, no DELETE — RLS policies omit both; role grants exclude both. Row shape finalized with runtime peer 2026-04-22. See plans/kb-runtime-architecture.md §3.1, plans/reviews/c1v-MIT-Crawley-Cornell/security-review.md F8.';
COMMENT ON COLUMN "decision_audit"."hash_chain_prev" IS
  'SHA-256 hex of the prior row''s canonical bytes for the same (project_id, target_field) stream. NULL iff first row in the stream. Hand-edit any prior row and this breaks — see security-review A10.';
COMMENT ON COLUMN "decision_audit"."model_version" IS
  'Reproducibility substrate. `deterministic-rule-tree` for pure-engine rows; LLM model id (e.g. claude-sonnet-4-5-20250929) on llm_refine paths. NOT NULL.';
COMMENT ON COLUMN "decision_audit"."rag_attempted" IS
  'Tri-state companion to kb_chunk_ids. false = ContextResolver skipped RAG (pure rule-tree). true + empty kb_chunk_ids = RAG ran with zero hits. true + non-empty = RAG hits fed the decision. CHECK constraint forbids (rag_attempted=false AND kb_chunk_ids non-empty).';
COMMENT ON COLUMN "decision_audit"."kb_chunk_ids" IS
  'RAG chunk UUIDs that fed this decision. Empty {} for pure rule-tree runs OR for RAG-attempted-zero-hits; distinguish via rag_attempted. References kb_chunks.id.';
COMMENT ON COLUMN "decision_audit"."agent_id" IS
  'Writer identity: mcp:<api_key_id> for MCP, agent:<name> for swarm peer, user for direct override.';
