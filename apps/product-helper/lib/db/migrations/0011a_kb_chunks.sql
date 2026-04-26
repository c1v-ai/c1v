-- Migration: Create kb_chunks table (RAG layer for 7-module KB corpus)
-- Created: 2026-04-21
-- Brief: c1v-runtime-prereqs T3 — rag (Vector Store Engineer)
-- Unblocks: kb-runtime-architecture.md §2.1 (Databases-vectorDB, G8 + G9).
--
-- Purpose:
--   Chunked, embedded storage for the 313 KB markdown files under
--   .planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/
--   plus KB-8 Atlas bodies and KB-9 AI-sysdesign sources. Each row is a
--   ~500-token chunk with provenance back to its source module/phase/section.
--
-- Column notes:
--   kb_source    — opaque origin key. Examples: 'kb-1-scope', 'kb-8-atlas',
--                  'kb-9-ai-sysdesign/huyen-aie-2025'. Lets a single table
--                  host the 7 local modules + PDF-parsed corpora.
--   module       — '1'..'7' for in-repo KBs; 'atlas' or 'ai-sysdesign' for
--                  external corpora. Free text (no CHECK) to keep the
--                  ingest script decoupled from future module names.
--   phase        — phase slug from the path (e.g., '03-phase-0-ingest').
--                  Empty string when phase isn't applicable.
--   section      — optional heading path ('Ch 3 > Requirements'). NULL when
--                  chunk didn't fall under a known heading.
--   content      — raw chunk text. Quoted back to the user on citation.
--   embedding    — OpenAI text-embedding-3-small (1536). Indexed ivfflat.
--   chunk_index  — 0-based ordinal within (kb_source, module, phase). Lets
--                  callers reconstruct chunk order if they need to rejoin.
--   chunk_hash   — SHA-256 of content. UNIQUE (kb_source, chunk_hash) is
--                  the dedup gate in the embedder — unchanged source text
--                  hashes to the same row, so re-ingest is a no-op.
--
-- pgvector extension was enabled in 0008_enable_pgvector.sql; not re-run.

CREATE TABLE IF NOT EXISTS "kb_chunks" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "kb_source"     text NOT NULL,
  "module"        text NOT NULL,
  "phase"         text NOT NULL DEFAULT '',
  "section"       text,
  "content"       text NOT NULL,
  "embedding"     vector(1536) NOT NULL,
  "chunk_index"   integer NOT NULL,
  "chunk_hash"    varchar(64) NOT NULL,
  "created_at"    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT "kb_chunks_chunk_hash_format_chk"
    CHECK ("chunk_hash" ~ '^[a-f0-9]{64}$'),
  CONSTRAINT "kb_chunks_chunk_index_nonneg_chk"
    CHECK ("chunk_index" >= 0)
);

-- Dedup gate. (kb_source, chunk_hash) is the unique identity of a chunk;
-- identical text under the same source hashes the same, so re-ingesting
-- an unchanged file is an ON CONFLICT DO NOTHING upsert.
CREATE UNIQUE INDEX IF NOT EXISTS "kb_chunks_source_hash_uniq"
  ON "kb_chunks" ("kb_source", "chunk_hash");

-- Facet filter used by searchKB(filter={module, phase}). Partial indexes
-- or additional composite indexes can be added once we see real query
-- shapes from the context-resolver.
CREATE INDEX IF NOT EXISTS "kb_chunks_source_module_phase_idx"
  ON "kb_chunks" ("kb_source", "module", "phase");

-- ivfflat cosine index. lists=100 fits an ~10k-row corpus (3 of the 4
-- modules × ~80 files × ~3 chunks/file + KB-8 atlas + KB-9 sysdesign ≈
-- 8k–12k rows). pgvector docs: start at rows/1000, tune upward once row
-- count crosses 1M.
CREATE INDEX IF NOT EXISTS "kb_chunks_embedding_ivfflat_idx"
  ON "kb_chunks"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);

COMMENT ON TABLE "kb_chunks" IS
  'RAG chunk store for the c1v KB corpus (local 7 modules + KB-8 Atlas + KB-9 AI sysdesign). See lib/db/schema/kb-chunks.ts and lib/langchain/engines/kb-search.ts.';
COMMENT ON COLUMN "kb_chunks"."chunk_hash" IS
  'SHA-256 (hex) of content. (kb_source, chunk_hash) unique — dedup + re-ingest idempotency.';
COMMENT ON COLUMN "kb_chunks"."embedding" IS
  'OpenAI text-embedding-3-small (1536 dims). Query with pgvector <=> cosine operator.';
