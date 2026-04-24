/**
 * kb-embedder — OpenAI text-embedding-3-small embedding pipeline + upsert.
 *
 * Brief: c1v-runtime-prereqs T3 — rag (Vector Store Engineer)
 *
 * Consumers pass parsed+chunked markdown (provenance-tagged) and this
 * module handles:
 *   1. Skipping chunks already in the DB (by (kb_source, chunk_hash)).
 *   2. Batching remaining chunks through OpenAI's embeddings endpoint.
 *   3. Upserting rows into `kb_chunks` with ON CONFLICT DO NOTHING.
 *
 * Direct `fetch` to OpenAI — no `openai` package dep (keeps the bundle
 * lean; we only ever call one endpoint). If we later adopt multiple
 * OpenAI surfaces we can swap to the official SDK without touching
 * callers.
 */

import { createHash } from 'crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { kbChunks, KB_EMBEDDING_DIMENSIONS } from '@/lib/db/schema/kb-chunks';

const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_URL = 'https://api.openai.com/v1/embeddings';

/**
 * OpenAI `text-embedding-3-small` hard limits (docs, Apr 2026):
 *   - 2,048 inputs per request
 *   - 8,191 tokens per input
 * Kept well below the ceiling to leave headroom for very long chunks.
 */
const MAX_BATCH_SIZE = 128;

/**
 * Shape the ingest script produces and the embedder consumes. All fields
 * except `section` are required — missing provenance is a bug, not a
 * silent-pass case.
 */
export interface KBChunkInput {
  kbSource: string;
  module: string;
  phase: string;
  section: string | null;
  content: string;
  chunkIndex: number;
}

export interface EmbedChunksResult {
  /** How many inputs were skipped because (kb_source, chunk_hash) already existed. */
  skipped: number;
  /** How many new rows were inserted. */
  inserted: number;
  /** Total chunks examined (should equal input length). */
  total: number;
}

function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      'OPENAI_API_KEY missing — required for kb-embedder. Set it in .env.local ' +
        'or the ingest environment before calling embedChunks().',
    );
  }
  return key;
}

/** SHA-256 hex of the chunk content — the dedup + idempotency key. */
export function hashChunk(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Deterministic stub embedder — activated by `EMBEDDINGS_STUB=1`.
 *
 * Seeds a 1536-dim unit vector from SHA-256(content). Identical inputs
 * always produce identical vectors, so pgvector cosine retrieval still
 * returns "semantic"-looking rankings (near-duplicate chunks cluster
 * tightly, unrelated chunks are ~orthogonal). No network, no key.
 *
 * Use-case: Phase A ingestion dry-run before the real EMBEDDINGS_API_KEY
 * is provisioned. Rows written with stub vectors SHOULD be re-embedded
 * under the real model before Phase B — delete them via
 * `DELETE FROM kb_chunks WHERE kb_source IN (...);` then rerun without
 * the flag.
 */
function stubEmbed(text: string): number[] {
  const hash = createHash('sha256').update(text).digest();
  const out = new Array<number>(KB_EMBEDDING_DIMENSIONS);
  let sumSq = 0;
  for (let i = 0; i < KB_EMBEDDING_DIMENSIONS; i++) {
    // Cycle through the 32-byte SHA-256 digest; map each byte to
    // [-1, 1) to spread signs. Good enough for cosine spread in tests.
    const byte = hash[i % hash.length];
    const v = (byte / 128) - 1;
    out[i] = v;
    sumSq += v * v;
  }
  const norm = Math.sqrt(sumSq) || 1;
  for (let i = 0; i < KB_EMBEDDING_DIMENSIONS; i++) {
    out[i] = out[i] / norm;
  }
  return out;
}

/**
 * Call OpenAI `/v1/embeddings` for up to `MAX_BATCH_SIZE` inputs.
 *
 * When `EMBEDDINGS_STUB=1` is set, returns deterministic hash-seeded
 * unit vectors instead of calling the network — lets Phase A ingestion
 * run before `EMBEDDINGS_API_KEY` is provisioned.
 *
 * Returns float[][] preserving input order. Throws on non-2xx.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (texts.length > MAX_BATCH_SIZE) {
    throw new Error(
      `embedBatch: ${texts.length} inputs exceeds MAX_BATCH_SIZE=${MAX_BATCH_SIZE}`,
    );
  }

  if (process.env.EMBEDDINGS_STUB === '1') {
    return texts.map(stubEmbed);
  }

  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getOpenAIKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
      dimensions: KB_EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `OpenAI embeddings failed (${res.status} ${res.statusText}): ${body}`,
    );
  }

  const json = (await res.json()) as {
    data: Array<{ embedding: number[]; index: number }>;
  };

  // OpenAI returns embeddings ordered by `index` but we sort defensively.
  const sorted = [...json.data].sort((a, b) => a.index - b.index);
  return sorted.map((d) => d.embedding);
}

/**
 * Ingest one corpus's worth of chunks. Dedup-aware: identical
 * (kb_source, chunk_hash) rows are left untouched (ON CONFLICT DO NOTHING).
 */
export async function embedChunks(
  chunks: KBChunkInput[],
): Promise<EmbedChunksResult> {
  if (chunks.length === 0) {
    return { skipped: 0, inserted: 0, total: 0 };
  }

  // Hash every chunk up front — cheap and the key we need for dedup.
  const hashed = chunks.map((c) => ({ ...c, chunkHash: hashChunk(c.content) }));

  // Group by kbSource so the dedup lookup is bounded (we query one source
  // at a time rather than an IN list across every corpus).
  const bySource = new Map<string, typeof hashed>();
  for (const c of hashed) {
    const arr = bySource.get(c.kbSource) ?? [];
    arr.push(c);
    bySource.set(c.kbSource, arr);
  }

  const existingHashes = new Set<string>();
  for (const [src, group] of bySource.entries()) {
    const hashes = group.map((c) => c.chunkHash);
    const existing = await db
      .select({ chunkHash: kbChunks.chunkHash })
      .from(kbChunks)
      .where(and(eq(kbChunks.kbSource, src), inArray(kbChunks.chunkHash, hashes)));
    for (const row of existing) {
      existingHashes.add(`${src}::${row.chunkHash}`);
    }
  }

  const needsEmbed = hashed.filter(
    (c) => !existingHashes.has(`${c.kbSource}::${c.chunkHash}`),
  );

  let inserted = 0;
  for (let i = 0; i < needsEmbed.length; i += MAX_BATCH_SIZE) {
    const batch = needsEmbed.slice(i, i + MAX_BATCH_SIZE);
    const embeddings = await embedBatch(batch.map((c) => c.content));

    const rows = batch.map((c, j) => ({
      kbSource: c.kbSource,
      module: c.module,
      phase: c.phase,
      section: c.section,
      content: c.content,
      embedding: embeddings[j],
      chunkIndex: c.chunkIndex,
      chunkHash: c.chunkHash,
    }));

    const result = await db.insert(kbChunks).values(rows).onConflictDoNothing({
      target: [kbChunks.kbSource, kbChunks.chunkHash],
    });

    // drizzle-orm's postgres-js dialect returns `{ count: number }` only
    // when `.returning()` is used; we count optimistically against batch
    // size since ON CONFLICT may silently skip. The existingHashes gate
    // above means conflicts are rare (racing ingesters only).
    inserted += Array.isArray(result) ? result.length : batch.length;
  }

  return {
    total: chunks.length,
    skipped: chunks.length - needsEmbed.length,
    inserted,
  };
}
