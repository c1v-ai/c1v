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
 * KB-8 Atlas bodies (under `8-stacks-and-priors-atlas/`) are picked up
 * the same way. KB-9 AI-sysdesign markdown lands once T2 scraper produces
 * it; this walker will discover it automatically via the top-level folder.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... POSTGRES_URL=... pnpm tsx scripts/ingest-kbs.ts
 *   # optional: --dry-run (parse + chunk but do not embed or write)
 *   # optional: --kb-root=<abs-path> to override the default root
 */

import { readFileSync, readdirSync, existsSync, type Dirent } from 'fs';
import { resolve, join, basename, extname } from 'path';
import type { KBChunkInput } from '@/lib/langchain/engines/kb-embedder';

const DEFAULT_KB_ROOT = resolve(
  __dirname,
  '..',
  '.planning',
  'phases',
  '13-Knowledge-banks-deepened',
  'New-knowledge-banks',
);

// Chunk target. 500 tokens ≈ 2000 chars for English prose (cl100k).
// Overlap keeps heading context glued to the paragraph below it.
const TARGET_CHARS = 2000;
const OVERLAP_CHARS = 200;

// Folders skipped entirely — build artifacts, tool state, raw unreviewed input.
const SKIP_DIR_PATTERNS = [
  /^\.claude$/,
  /^\.git$/,
  /^__pycache__$/,
  /^node_modules$/,
  /^raw$/,
  /^rejected$/,
];

interface WalkedFile {
  absPath: string;
  kbSource: string;
  module: string;
  phase: string;
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
      out.push({
        absPath: join(here, entry.name),
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

  const bySource = new Map<string, KBChunkInput[]>();
  let totalChunks = 0;
  const perFilePhaseIndex = new Map<string, number>();

  for (const file of files) {
    const body = readFileSync(file.absPath, 'utf8');
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
      totalChunks++;
    }
    perFilePhaseIndex.set(phaseKey, idx);
    bySource.set(file.kbSource, arr);
  }

  console.log(
    `[ingest-kbs] prepared ${totalChunks} chunks across ${bySource.size} sources`,
  );

  if (dryRun) {
    for (const [src, arr] of bySource.entries()) {
      console.log(`  ${src}: ${arr.length} chunks`);
    }
    console.log('[ingest-kbs] --dry-run set; skipping embed + write.');
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
}

main().catch((err) => {
  console.error('[ingest-kbs] failed:', err);
  process.exit(1);
});
