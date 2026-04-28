/**
 * kb-search — semantic retrieval over `kb_chunks`.
 *
 * Brief: c1v-runtime-prereqs T3 — rag (Vector Store Engineer)
 *
 * Contract per kb-runtime-architecture.md §2.1:
 *   searchKB(query, topK=3, filter?) -> KBChunkResult[]
 *
 * Wire:
 *   1. Embed `query` via OpenAI text-embedding-3-small.
 *   2. Cosine search `kb_chunks` with pgvector's `<=>` operator.
 *   3. Return chunks + similarity score (= 1 - cosine_distance).
 */

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { embedBatch } from './kb-embedder';

export interface SearchKBFilter {
  module?: string;
  phase?: string;
  kbSource?: string;
}

export interface KBChunkResult {
  id: string;
  kbSource: string;
  module: string;
  phase: string;
  section: string | null;
  content: string;
  chunkIndex: number;
  similarity: number;
}

type KBChunkRawRow = {
  id: string;
  kb_source: string;
  module: string;
  phase: string;
  section: string | null;
  content: string;
  chunk_index: number;
  similarity: number | string;
  [key: string]: unknown;
};

function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

/**
 * Run cosine similarity against `kb_chunks` and return top-K results.
 * Results are sorted best-first (highest similarity).
 *
 * When no filter matches any row the call still returns cleanly (empty
 * array). Embedding failures propagate as thrown errors so upstream
 * callers can fall back to rule-tree defaults.
 */
export async function searchKB(
  query: string,
  topK: number = 3,
  filter?: SearchKBFilter,
): Promise<KBChunkResult[]> {
  if (!query || !query.trim()) return [];
  if (topK <= 0) return [];

  const [embedding] = await embedBatch([query]);
  const vectorLiteral = toVectorLiteral(embedding);

  const module = filter?.module ?? null;
  const phase = filter?.phase ?? null;
  const kbSource = filter?.kbSource ?? null;

  // Raw SQL — Drizzle's query builder doesn't know the `<=>` operator,
  // and we want the filter clauses to optimize out (`NULL IS NULL OR ...`)
  // when no filter is supplied.
  const rows = await db.execute<KBChunkRawRow>(sql`
    SELECT
      id,
      kb_source,
      module,
      phase,
      section,
      content,
      chunk_index,
      1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM kb_chunks
    WHERE
      (${module}::text IS NULL OR module = ${module})
      AND (${phase}::text IS NULL OR phase = ${phase})
      AND (${kbSource}::text IS NULL OR kb_source = ${kbSource})
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${topK}
  `);

  // drizzle postgres-js returns a result object where iteration yields
  // the rows. Normalize to an array regardless of driver shape.
  const list: KBChunkRawRow[] = Array.isArray(rows)
    ? (rows as KBChunkRawRow[])
    : ((rows as { rows?: KBChunkRawRow[] }).rows ?? []);

  return list.map((r) => ({
    id: r.id,
    kbSource: r.kb_source,
    module: r.module,
    phase: r.phase,
    section: r.section,
    content: r.content,
    chunkIndex: r.chunk_index,
    similarity:
      typeof r.similarity === 'string' ? parseFloat(r.similarity) : r.similarity,
  }));
}
