-- Migration: Enable pgvector extension
-- Created: 2026-04-20
-- Brief: W0A — database-engineer (v1 hardening sprint)
-- Mitigates (partial): M7 F.15-c1, F.15-c2, F.17, F.18
--
-- Rationale:
--   SS7 citation store requires pgvector for HNSW-indexed cosine-distance
--   similarity search against OpenAI text-embedding-3-small (1536 dims).
--   Enabling the extension is a precondition for migration 0009 which
--   creates the traceback_citations table.
--
-- Supabase note:
--   pgcrypto (for gen_random_uuid) is pre-installed in Supabase. We
--   include it here defensively so manual psql applies against a vanilla
--   Postgres succeed as well.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
