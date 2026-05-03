/**
 * ingest-kbs — one-off ingestion of the 7-module KB corpus into `kb_chunks`.
 *
 * Brief: c1v-runtime-prereqs T3 — rag (Vector Store Engineer)
 *
 * Walks `.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/`,
 * and per markdown file:
 *   1. Derives kbSource (top-level folder slug) + module (numeric prefix
 *      when present, else the folder slug) + phase (filename stem).
 *   2. Chunks body with a recursive header/paragraph splitter aiming at
 *      ~500 tokens per chunk (cl100k rough ratio: 1 token ≈ 4 chars).
 *   3. Tracks the nearest markdown heading as `section` provenance.
 *   4. Hands the batch to `embedChunks()` which handles dedup + embed +
 *      upsert.
 *
 * KB-9 Atlas bodies (under `9-stacks-atlas/`, post-T9 rename from
 * `8-stacks-and-priors-atlas/`) are picked up the same way. The walker
 * discovers folders by top-level slug, so the rename is path-only — no
 * walker logic change required.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... POSTGRES_URL=... pnpm tsx scripts/ingest-kbs.ts
 *   # optional: --dry-run (parse + chunk but do not embed or write)
 *   # optional: --kb-root=<abs-path> to override the default root
 */

import {
  readFileSync,
  readdirSync,
  existsSync,
  realpathSync,
  type Dirent,
} from 'fs';
import { resolve, join, basename, extname } from 'path';
import { createHash } from 'crypto';
import type { KBChunkInput } from '@/lib/langchain/engines/kb-embedder';

// Post-T8 reorg (2026-04): the `New-knowledge-banks/` intermediate
// folder was removed and the KB-1..7 corpora sit directly under
// `13-Knowledge-banks-deepened/`. Default points at the current layout
// so the script is self-serve; `--kb-root=` override remains.
const DEFAULT_KB_ROOT = resolve(
  __dirname,
  '..',
  '.planning',
  'phases',
  '13-Knowledge-banks-deepened',
);

// Chunk target. 500 tokens ≈ 2000 chars for English prose (cl100k).
// Overlap keeps heading context glued to the paragraph below it.
const TARGET_CHARS = 2000;
const OVERLAP_CHARS = 200;

// Folders skipped entirely — build artifacts, tool state, raw unreviewed input,
// and internal GSD dirs that are not KB knowledge-bank content.
const SKIP_DIR_PATTERNS = [
  /^\.claude$/,
  /^\.git$/,
  /^__pycache__$/,
  /^node_modules$/,
  /^raw$/,
  /^rejected$/,
  /^_legacy_/,     // Archived pre-T9 content superseded by numbered KB folders
  /^_dev-runbooks$/, // Developer operational guides, not KB content
];

interface WalkedFile {
  absPath: string;
  realPath: string;
  kbSource: string;
  module: string;
  phase: string;
}

function sha256Hex(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[idx];
}

function deriveModule(folder: string): string {
  const m = /^(\d+)/.exec(folder);
  return m ? m[1] : folder;
}

function derivePhase(fileName: string): string {
  return basename(fileName, extname(fileName)).toLowerCase();
}

function walkMarkdown(
  root: string,
  relFromRoot: string[] = [],
): WalkedFile[] {
  const here = join(root, ...relFromRoot);
  let entries: Dirent[];
  try {
    entries = readdirSync(here, { withFileTypes: true });
  } catch {
    return [];
  }

  const out: WalkedFile[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIR_PATTERNS.some((p) => p.test(entry.name))) continue;
      out.push(...walkMarkdown(root, [...relFromRoot, entry.name]));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      const topLevel = relFromRoot[0];
      if (!topLevel) continue;
      const absPath = join(here, entry.name);
      let realPath = absPath;
      try {
        realPath = realpathSync(absPath);
      } catch {
        // fall back to absPath
      }
      out.push({
        absPath,
        realPath,
        kbSource: topLevel,
        module: deriveModule(topLevel),
        phase: derivePhase(entry.name),
      });
    }
  }
  return out;
}

function chunkMarkdown(
  text: string,
): Array<{ content: string; section: string | null }> {
  const lines = text.split(/\r?\n/);
  const headingStack: Array<{ level: number; text: string }> = [];
  let buffer: string[] = [];
  let bufferSection: string | null = null;
  const chunks: Array<{ content: string; section: string | null }> = [];

  const bufferLen = () => buffer.reduce((n, l) => n + l.length + 1, 0);

  const flush = () => {
    if (buffer.length === 0) return;
    const content = buffer.join('\n').trim();
    if (content.length > 0) {
      chunks.push({ content, section: bufferSection });
    }
    if (OVERLAP_CHARS > 0 && content.length > OVERLAP_CHARS) {
      buffer = [content.slice(-OVERLAP_CHARS)];
    } else {
      buffer = [];
    }
  };

  const currentSection = () =>
    headingStack.map((h) => h.text).join(' > ') || null;

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (headingMatch) {
      flush();
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      while (
        headingStack.length > 0 &&
        headingStack[headingStack.length - 1].level >= level
      ) {
        headingStack.pop();
      }
      headingStack.push({ level, text: title });
      bufferSection = currentSection();
      buffer.push(line);
      continue;
    }

    buffer.push(line);
    if (bufferSection === null) bufferSection = currentSection();

    if (bufferLen() >= TARGET_CHARS) {
      flush();
      bufferSection = currentSection();
    }
  }

  flush();
  return chunks;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rootArg = args.find((a) => a.startsWith('--kb-root='));
  const kbRoot = rootArg ? rootArg.slice('--kb-root='.length) : DEFAULT_KB_ROOT;

  if (!existsSync(kbRoot)) {
    console.error(`KB root not found: ${kbRoot}`);
    process.exit(1);
  }

  console.log(`[ingest-kbs] root=${kbRoot}`);
  const files = walkMarkdown(kbRoot);
  console.log(`[ingest-kbs] walked ${files.length} markdown files`);

  // Realpath-level dedup: symlinks or duplicated folders map to a single
  // canonical disk file. Surfaces the "13 cross-cutting sw-design KBs
  // copy-pasted into 4 folders" problem described in CLAUDE.md.
  const byRealPath = new Map<string, WalkedFile[]>();
  // Content-hash dedup: even without symlinks, the 4x duplicate corpus
  // produces identical file bodies. SHA-256 of raw file buffer.
  const byContentHash = new Map<string, WalkedFile[]>();

  const bySource = new Map<string, KBChunkInput[]>();
  let totalChunks = 0;
  const perFilePhaseIndex = new Map<string, number>();
  const chunkCharSizes: number[] = [];

  for (const file of files) {
    const raw = readFileSync(file.absPath);
    const contentHash = sha256Hex(raw);
    const realPathList = byRealPath.get(file.realPath) ?? [];
    realPathList.push(file);
    byRealPath.set(file.realPath, realPathList);
    const contentList = byContentHash.get(contentHash) ?? [];
    contentList.push(file);
    byContentHash.set(contentHash, contentList);

    const body = raw.toString('utf8');
    const chunks = chunkMarkdown(body);
    const arr = bySource.get(file.kbSource) ?? [];
    const phaseKey = `${file.kbSource}::${file.phase}`;
    let idx = perFilePhaseIndex.get(phaseKey) ?? 0;
    for (const c of chunks) {
      arr.push({
        kbSource: file.kbSource,
        module: file.module,
        phase: file.phase,
        section: c.section,
        content: c.content,
        chunkIndex: idx++,
      });
      chunkCharSizes.push(c.content.length);
      totalChunks++;
    }
    perFilePhaseIndex.set(phaseKey, idx);
    bySource.set(file.kbSource, arr);
  }

  console.log(
    `[ingest-kbs] prepared ${totalChunks} chunks across ${bySource.size} sources`,
  );

  // ── Stats: dedup + chunk-size distribution ─────────────────────────────
  const realPathDupes = [...byRealPath.entries()].filter(
    ([, v]) => v.length > 1,
  );
  const contentHashDupes = [...byContentHash.entries()].filter(
    ([, v]) => v.length > 1,
  );
  const uniqueRealPaths = byRealPath.size;
  const uniqueContentHashes = byContentHash.size;

  console.log(`\n[stats] file dedup:`);
  console.log(`  walked files:          ${files.length}`);
  console.log(`  unique realpaths:      ${uniqueRealPaths}`);
  console.log(`  unique content SHA-256:${uniqueContentHashes}`);
  console.log(`  realpath duplicates:   ${realPathDupes.length} groups`);
  console.log(
    `  content-hash duplicates:${contentHashDupes.length} groups (${
      files.length - uniqueContentHashes
    } redundant files)`,
  );
  if (contentHashDupes.length > 0) {
    console.log(`  top content-hash dupes (by group size):`);
    const sorted = [...contentHashDupes]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
    for (const [hash, group] of sorted) {
      console.log(
        `    ${hash.slice(0, 8)}… ×${group.length}: ${group
          .map((f) => `${f.kbSource}/${basename(f.absPath)}`)
          .slice(0, 4)
          .join(', ')}${group.length > 4 ? ', …' : ''}`,
      );
    }
  }

  const sortedSizes = [...chunkCharSizes].sort((a, b) => a - b);
  const avg =
    chunkCharSizes.reduce((n, v) => n + v, 0) /
    Math.max(1, chunkCharSizes.length);
  console.log(`\n[stats] chunk-size distribution (chars):`);
  console.log(`  n:     ${chunkCharSizes.length}`);
  console.log(`  min:   ${sortedSizes[0] ?? 0}`);
  console.log(`  p50:   ${percentile(sortedSizes, 50)}`);
  console.log(`  p95:   ${percentile(sortedSizes, 95)}`);
  console.log(`  p99:   ${percentile(sortedSizes, 99)}`);
  console.log(`  max:   ${sortedSizes[sortedSizes.length - 1] ?? 0}`);
  console.log(`  mean:  ${avg.toFixed(0)}`);
  console.log(
    `  target: ${TARGET_CHARS} (overlap=${OVERLAP_CHARS})  — ~500 tokens cl100k`,
  );

  if (dryRun) {
    console.log(`\n[ingest-kbs] per-source chunk counts:`);
    for (const [src, arr] of bySource.entries()) {
      console.log(`  ${src}: ${arr.length} chunks`);
    }
    console.log('\n[ingest-kbs] --dry-run set; skipping embed + write.');
    return;
  }

  // Lazy import: keeps --dry-run from needing a valid POSTGRES_URL.
  const { embedChunks } = await import('@/lib/langchain/engines/kb-embedder');

  let grandInserted = 0;
  let grandSkipped = 0;
  for (const [src, arr] of bySource.entries()) {
    const result = await embedChunks(arr);
    grandInserted += result.inserted;
    grandSkipped += result.skipped;
    console.log(
      `  ${src}: inserted=${result.inserted} skipped=${result.skipped} total=${result.total}`,
    );
  }

  console.log(
    `[ingest-kbs] done. inserted=${grandInserted} skipped=${grandSkipped} total=${totalChunks}`,
  );

  await postInsertVerify(Array.from(bySource.keys()));
}

async function postInsertVerify(allSources: string[]): Promise<void> {
  const { db } = await import('@/lib/db/drizzle');
  const { sql } = await import('drizzle-orm');

  const rowCountRes = await db.execute(
    sql`SELECT COUNT(*)::int AS n FROM kb_chunks`,
  );
  const rowCount = Number(
    (rowCountRes as unknown as Array<{ n: number }>)[0]?.n ?? 0,
  );
  console.log(`\n[verify] kb_chunks row count: ${rowCount}`);

  const indexRes = await db.execute(sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'kb_chunks'
    ORDER BY indexname
  `);
  const indexes = indexRes as unknown as Array<{
    indexname: string;
    indexdef: string;
  }>;
  console.log(`[verify] kb_chunks indexes:`);
  for (const idx of indexes) {
    const kind = /\busing (\w+)/i.exec(idx.indexdef)?.[1] ?? '?';
    console.log(`  ${idx.indexname} — using ${kind}`);
  }
  const vectorIdx = indexes.find((i) => /ivfflat|hnsw/i.test(i.indexdef));
  if (vectorIdx) {
    const kind = /ivfflat/i.test(vectorIdx.indexdef) ? 'IVFFLAT' : 'HNSW';
    console.log(`[verify] vector index kind: ${kind}`);
  } else {
    console.log(`[verify] WARNING: no ivfflat/hnsw vector index found`);
  }

  const sources = allSources.slice(0, 3);
  for (const src of sources) {
    const r = await db.execute(sql`
      SELECT COUNT(*)::int AS n
      FROM kb_chunks
      WHERE kb_source = ${src}
    `);
    const n = Number((r as unknown as Array<{ n: number }>)[0]?.n ?? 0);
    console.log(`[verify] spot-check kb_source='${src}': ${n} rows`);
  }
}

main().catch((err) => {
  console.error('[ingest-kbs] failed:', err);
  process.exit(1);
});
