-- Migration: conversations pending_answer columns — TA1 system-question-bridge
-- Created: 2026-04-25
-- Renumbered: 0014 -> 0015 on 2026-04-26 (collision with 0014_project_artifacts).
-- Sequence: 0011a/0011b -> 0012 -> 0013 -> 0014 (project_artifacts) -> 0015 (this).
-- Brief: TA1 c1v-runtime-wiring Wave-A. v2.1 EC-V21-A.4 open-question chat bridge.
--
-- Purpose:
--   Extends `conversations` so the system-question-bridge can post
--   `system`-authored pending-answer rows (kind='pending_answer'), thread
--   user replies to them (parent_id), and persist the OpenQuestion event
--   payload (computed_options + math_trace + source bucket).
--
-- Surfaces only the columns needed by surfaceOpenQuestion(); reply routing
-- relies on parent_id pointing at the pending_answer row. RLS lives on
-- projects via existing patterns — conversations are project-scoped and
-- readable through the project ownership chain (no new policy added here).
--
-- Drizzle-kit is broken per repo CLAUDE.md — manual SQL only.

ALTER TABLE "conversations"
  ADD COLUMN IF NOT EXISTS "kind" varchar(32) NOT NULL DEFAULT 'message',
  ADD COLUMN IF NOT EXISTS "parent_id" integer
    REFERENCES "conversations"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "metadata" jsonb;

CREATE INDEX IF NOT EXISTS "conversations_parent_id_idx"
  ON "conversations" ("parent_id");

CREATE INDEX IF NOT EXISTS "conversations_kind_idx"
  ON "conversations" ("kind");

COMMENT ON COLUMN "conversations"."kind" IS
  'Row kind: ''message'' (default user/assistant chat) or ''pending_answer'' (system-authored OpenQuestion awaiting user reply). Set by lib/chat/system-question-bridge.ts.';
COMMENT ON COLUMN "conversations"."parent_id" IS
  'For replies, references the conversations row this reply answers. Used by system-question-bridge to route user replies back to the OpenQuestion emitter.';
COMMENT ON COLUMN "conversations"."metadata" IS
  'OpenQuestion payload: { source: ''m2_nfr''|''m6_qfd''|''m8_residual''|''wave_e_engine'', computed_options: any[], math_trace: string }. Null for plain messages.';
