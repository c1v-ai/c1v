/**
 * Verifies that no source files outside the explicit allowlist import
 * `@langchain/anthropic` or construct `new ChatAnthropic(...)` /
 * `new Anthropic(...)`.
 *
 * Why this exists: post-2026-04-30 OpenRouter migration. Every production
 * LLM call must route through OpenRouter via either:
 *   - `lib/langchain/config.ts`         (LangChain ChatOpenAI w/ baseURL override)
 *   - `lib/langchain/engines/openrouter-client.ts`  (raw fetch-based gateway)
 *
 * The Anthropic API key is intentionally kept *optional* in the env validator
 * (see `lib/config/env.ts`). If a future agent/Codex/Claude session pastes a
 * `new ChatAnthropic({ anthropicApiKey: process.env.ANTHROPIC_API_KEY })` back
 * into the codebase, it will silently start draining the (likely-exhausted)
 * Anthropic key in production. This guardrail blocks that PR at CI time.
 *
 * Allowlist: only `apps/product-helper/scripts/preflight-api-spec.ts` is
 * permitted to import `@langchain/anthropic` — it's a debug harness for
 * replaying raw Anthropic stop_reason / usage_metadata. It only runs with a
 * real `ANTHROPIC_API_KEY` and is never invoked in the request path.
 *
 * Run:
 *   pnpm tsx scripts/verify-llm-routing.ts
 *
 * Exit codes:
 *   0 — all clean
 *   1 — at least one forbidden import / construction found (logged with file:line)
 *   2 — internal error (couldn't read repo, etc.)
 *
 * Implementation note: uses pure node:fs for walking — no shell-out — so the
 * verifier is injection-safe and Windows-portable. Same scope as
 * `scripts/verify-tree-pair-consistency.ts`.
 *
 * @module scripts/verify-llm-routing
 */

import { readFileSync, readdirSync, statSync, type Stats } from 'node:fs';
import path from 'node:path';

const ALLOWLIST: ReadonlySet<string> = new Set<string>([
  'apps/product-helper/scripts/preflight-api-spec.ts',
]);

const FORBIDDEN_PATTERNS: ReadonlyArray<{ regex: RegExp; description: string }> = [
  {
    regex: /from\s+['"]@langchain\/anthropic['"]/,
    description: 'import from "@langchain/anthropic"',
  },
  {
    regex: /\bnew\s+ChatAnthropic\s*\(/,
    description: 'new ChatAnthropic(...)',
  },
  {
    regex: /from\s+['"]@anthropic-ai\/sdk['"]/,
    description: 'import from "@anthropic-ai/sdk"',
  },
  {
    regex: /\bnew\s+Anthropic\s*\(/,
    description: 'new Anthropic(...)',
  },
];

const SEARCH_ROOTS: ReadonlyArray<string> = [
  'apps/product-helper/app',
  'apps/product-helper/lib',
  'apps/product-helper/scripts',
];

const SKIP_DIRS: ReadonlySet<string> = new Set<string>([
  'node_modules',
  '.next',
  '__tests__',
  'dist',
  'build',
  '.turbo',
]);

const SCAN_EXTS: ReadonlySet<string> = new Set<string>(['.ts', '.tsx']);

interface Violation {
  file: string;
  line: number;
  pattern: string;
  text: string;
}

function repoRoot(): string {
  // Resolve whether the script is invoked from repo root or apps/product-helper.
  const cwd = process.cwd();
  if (path.basename(cwd) === 'product-helper') return path.resolve(cwd, '..', '..');
  return cwd;
}

function* walk(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    let st: Stats;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      yield* walk(full);
    } else if (st.isFile() && SCAN_EXTS.has(path.extname(entry))) {
      yield full;
    }
  }
}

function scanFile(absPath: string, root: string): Violation[] {
  const relPath = path.relative(root, absPath);
  if (ALLOWLIST.has(relPath)) return [];

  let contents: string;
  try {
    contents = readFileSync(absPath, 'utf-8');
  } catch {
    return [];
  }

  const out: Violation[] = [];
  const lines = contents.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    // Skip comment-only lines (// ... or JSDoc * ... or /* ... */).
    const trimmed = text.trimStart();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('* ') ||
      trimmed === '*' ||
      trimmed.startsWith('/*')
    ) {
      continue;
    }
    for (const { regex, description } of FORBIDDEN_PATTERNS) {
      const match = regex.exec(text);
      if (!match) continue;
      // Skip string-literal occurrences: if the matched substring is
      // immediately preceded by ', ", or `, it's documented text, not code.
      const prevChar = match.index > 0 ? text.charAt(match.index - 1) : '';
      if (prevChar === "'" || prevChar === '"' || prevChar === '`') continue;
      out.push({
        file: relPath,
        line: i + 1,
        pattern: description,
        text: text.trim().slice(0, 120),
      });
    }
  }
  return out;
}

function findViolations(root: string): Violation[] {
  const out: Violation[] = [];
  for (const searchRoot of SEARCH_ROOTS) {
    const absRoot = path.join(root, searchRoot);
    for (const file of walk(absRoot)) {
      out.push(...scanFile(file, root));
    }
  }
  return out.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

function main(): void {
  const root = repoRoot();
  const violations = findViolations(root);

  if (violations.length === 0) {
    console.log('✓ verify-llm-routing: 0 violations');
    console.log('  All LLM construction routes through OpenRouter.');
    process.exit(0);
  }

  console.error(`✗ verify-llm-routing: ${violations.length} forbidden import(s) / construction(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`    ${v.pattern}`);
    console.error(`    ${v.text}`);
    console.error('');
  }
  console.error('All Anthropic LLM access must route through OpenRouter:');
  console.error('  - LangChain handles: lib/langchain/config.ts (ChatOpenAI w/ baseURL)');
  console.error('  - Raw API:           lib/langchain/engines/openrouter-client.ts');
  console.error('');
  console.error('If a file genuinely needs direct Anthropic access (e.g., a debug');
  console.error('harness), add its repo-relative path to ALLOWLIST in this script');
  console.error('with a comment explaining why.');
  process.exit(1);
}

try {
  main();
} catch (err) {
  console.error('verify-llm-routing: internal error');
  console.error(err);
  process.exit(2);
}
