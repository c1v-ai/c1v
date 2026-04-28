/**
 * kb_chunks — Drizzle schema for the RAG chunk store.
 *
 * Brief: c1v-runtime-prereqs T3 — rag (Vector Store Engineer)
 * Migration: 0011_kb_chunks.sql (depends on 0008_enable_pgvector.sql)
 *
 * Storage substrate for the semantic-search fallback declared in
 * kb-runtime-architecture.md §2.1. Every row is one ~500-token chunk
 * of source markdown (local KB or docling-parsed PDF), embedded with
 * OpenAI text-embedding-3-small for cosine retrieval.
 *
 * Dedup contract:
 *   (kb_source, chunk_hash) is unique. Unchanged source text hashes to
 *   the same row, so re-ingest is idempotent (ON CONFLICT DO NOTHING).
 *
 * Every chunk carries enough provenance (kb_source + module + phase +
 * optional section heading) to cite back to the exact origin file.
 */
import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  vector,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * OpenAI text-embedding-3-small dimensionality. Kept as a named constant
 * so the embedder and search paths share one source of truth — swapping
 * models is a one-line change here plus a re-embed.
 */
export const KB_EMBEDDING_DIMENSIONS = 1536;

export const kbChunks = pgTable(
  'kb_chunks',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    /**
     * Origin key — opaque string identifying the corpus the chunk came
     * from. Examples: `kb-1-scope`, `kb-8-atlas`,
     * `kb-9-ai-sysdesign/huyen-aie-2025`.
     */
    kbSource: text('kb_source').notNull(),

    /**
     * Module tag — `'1'..'7'` for in-repo KBs, `'atlas'` / `'ai-sysdesign'`
     * for external corpora. Free-text (no CHECK) so new modules don't
     * require a migration.
     */
    module: text('module').notNull(),

    /**
     * Phase slug derived from the source path (e.g.
     * `03-phase-0-ingest`). Empty string when the source isn't phased.
     */
    phase: text('phase').notNull().default(''),

    /**
     * Nearest heading path for the chunk (e.g., `Ch 3 > Requirements`).
     * NULL when the chunk didn't fall under a known heading.
     */
    section: text('section'),

    /** Raw chunk text. Quoted back to the user on citation. */
    content: text('content').notNull(),

    /** OpenAI text-embedding-3-small. 1536 dims. ivfflat cosine index. */
    embedding: vector('embedding', {
      dimensions: KB_EMBEDDING_DIMENSIONS,
    }).notNull(),

    /**
     * 0-based ordinal within `(kb_source, module, phase)`. Lets callers
     * reconstruct chunk order for paragraph-level rejoining.
     */
    chunkIndex: integer('chunk_index').notNull(),

    /**
     * SHA-256 hex of `content`. Together with `kb_source`, forms the
     * dedup key — unchanged source text hashes to the same row, so
     * re-embedding an unmodified file is a no-op.
     */
    chunkHash: varchar('chunk_hash', { length: 64 }).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sourceHashUniq: uniqueIndex('kb_chunks_source_hash_uniq').on(
      table.kbSource,
      table.chunkHash,
    ),
    sourceModulePhaseIdx: index('kb_chunks_source_module_phase_idx').on(
      table.kbSource,
      table.module,
      table.phase,
    ),
    // ivfflat cosine index is declared in SQL migration (Drizzle 0.43
    // does not emit ivfflat `WITH (lists = ...)` verbatim).
  }),
);

export type KBChunkRow = typeof kbChunks.$inferSelect;
export type NewKBChunkRow = typeof kbChunks.$inferInsert;
