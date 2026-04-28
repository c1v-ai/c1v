/**
 * verify-th1.ts — TH1 v2.1.1-hotfix verifier (CI-reusable)
 *
 * Asserts the four exit-criteria sub-points for the v2.1.1 hotfix:
 *   (a) EC-V21.1.1.P7 — UI synthesize-trigger present + canonical
 *   (b) EC-V21.1.1.P8 — @dbml/core named-import (default-import banned)
 *   (c) EC-V21.1.1.P9 — Playwright spec + P10-aware evidence
 *   (d) Dispatch rule #8 — every TH1 Agent prompt body cites
 *       `post-v2.1-followups.md` in `required_reading[]`.
 *
 * Authoritative spec:
 *   - plans/post-v2.1-followups.md §P7 + §P8 + §P9 + §P10 + §P11
 *   - plans/team-spawn-prompts-v2.1.1.md §"Agent §4: qa-th1-verifier"
 *
 * Run from repo root OR apps/product-helper/ — paths are resolved against
 * the discovered repo root (walk up until plans/ + apps/ are siblings).
 *
 * Evidence contract (locked 2026-04-27 by David):
 *   spec file exists + e2e-evidence.md grep substrings + jest hotfix tests
 *   pass + tsc clean for hotfix-touched files + dev-mode click-through
 *   evidence (project=119 in conversation transcript).
 *   Local Playwright execution is NOT required — the GH workflow at
 *   `.github/workflows/v2.1.1-e2e.yml` is the authoritative full-run gate.
 *
 * Exit codes:
 *   0 — all green, tag-eligible
 *   1 — at least one EC red, do NOT tag
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

type GateResult = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

const RESULTS: GateResult[] = [];

function record(id: string, label: string, passed: boolean, detail: string): void {
  RESULTS.push({ id, label, passed, detail });
  const tag = passed ? 'PASS' : 'FAIL';
  // eslint-disable-next-line no-console
  console.log(`[${tag}] ${id} — ${label}`);
  if (!passed || detail.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`       ${detail}`);
  }
}

function findRepoRoot(start: string): string {
  let cur = path.resolve(start);
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(cur, 'plans')) && existsSync(path.join(cur, 'apps'))) {
      return cur;
    }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  throw new Error(`Could not locate repo root from ${start} (need plans/ + apps/ as siblings).`);
}

const repoRoot = findRepoRoot(process.cwd());

function readIfExists(rel: string): string | null {
  const abs = path.join(repoRoot, rel);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf8');
}

function fileExists(rel: string): boolean {
  return existsSync(path.join(repoRoot, rel));
}

/**
 * Walk a directory recursively and yield text-file paths (relative to repoRoot)
 * whose basename matches a regex.
 */
function walkText(rel: string, basenameRe: RegExp): string[] {
  const root = path.join(repoRoot, rel);
  if (!existsSync(root)) return [];
  const out: string[] = [];
  const stack: string[] = [root];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.next' || e.name === 'dist') continue;
        stack.push(abs);
      } else if (e.isFile() && basenameRe.test(e.name)) {
        out.push(path.relative(repoRoot, abs));
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// EC-V21.1.1.P7 — UI synthesize-trigger
// ─────────────────────────────────────────────────────────────────────────────

function verifyP7(): void {
  const buttonPath = 'apps/product-helper/components/synthesis/run-synthesis-button.tsx';
  const actionsPath = 'apps/product-helper/app/(dashboard)/projects/[id]/synthesis/actions.ts';
  const emptyStatePath = 'apps/product-helper/components/synthesis/empty-state.tsx';

  record(
    'EC-V21.1.1.P7.a',
    'run-synthesis-button.tsx exists',
    fileExists(buttonPath),
    buttonPath,
  );

  const actionsSrc = readIfExists(actionsPath);
  record(
    'EC-V21.1.1.P7.b',
    'actions.ts exports runSynthesisAction',
    actionsSrc !== null && /export\s+async\s+function\s+runSynthesisAction\b/.test(actionsSrc),
    actionsPath,
  );

  const emptyStateSrc = readIfExists(emptyStatePath);
  record(
    'EC-V21.1.1.P7.c',
    'empty-state.tsx references RunSynthesisButton',
    emptyStateSrc !== null && /RunSynthesisButton/.test(emptyStateSrc),
    emptyStatePath,
  );

  // Duplicate-trigger scan: only actions.ts should POST to /api/projects/.../synthesize
  const triggerRe =
    /(fetch[^\n]*\/synthesize|method[^\n]*POST[^\n]*synthesize|action=[^\n]*synthesize)/i;
  const allowed = path.normalize(
    'apps/product-helper/app/(dashboard)/projects/[id]/synthesis/actions.ts',
  );
  const candidates = [
    ...walkText('apps/product-helper/components', /\.(tsx|ts|jsx|js)$/),
    ...walkText('apps/product-helper/app', /\.(tsx|ts|jsx|js)$/),
  ];
  const duplicateHits: string[] = [];
  for (const rel of candidates) {
    if (path.normalize(rel) === allowed) continue;
    const src = readIfExists(rel);
    if (src && triggerRe.test(src)) {
      duplicateHits.push(rel);
    }
  }
  record(
    'EC-V21.1.1.P7.d',
    'NO duplicate trigger surfaces (grep)',
    duplicateHits.length === 0,
    duplicateHits.length === 0
      ? 'only actions.ts POSTs to /api/projects/[id]/synthesize'
      : `unexpected hits:\n         ${duplicateHits.join('\n         ')}`,
  );

  // Jest hotfix tests
  const buttonTest = 'apps/product-helper/__tests__/components/run-synthesis-button.test.tsx';
  const pendingTest = 'apps/product-helper/__tests__/app/synthesis-page-pending.test.tsx';
  record(
    'EC-V21.1.1.P7.e',
    'jest test files exist (button + page-pending)',
    fileExists(buttonTest) && fileExists(pendingTest),
    `${buttonTest}\n       ${pendingTest}`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EC-V21.1.1.P8 — @dbml/core named-import
// ─────────────────────────────────────────────────────────────────────────────

function verifyP8(): void {
  const sqlToDbml = 'apps/product-helper/lib/dbml/sql-to-dbml.ts';
  const src = readIfExists(sqlToDbml);

  if (src === null) {
    record('EC-V21.1.1.P8.a', 'sql-to-dbml.ts exists', false, sqlToDbml);
    return;
  }

  // Default-import pattern is BANNED. Allow the string in comments mentioning
  // the BAD pattern by checking only `import` statement lines.
  const importLines = src.split('\n').filter((l) => /^\s*import\s/.test(l));
  const hasDefault = importLines.some((l) => /import\s+\w+\s+from\s+['"]@dbml\/core['"]/.test(l));
  const hasNamed = importLines.some((l) => /import\s+\{\s*importer\b/.test(l) && /@dbml\/core/.test(l));

  record(
    'EC-V21.1.1.P8.a',
    'no default-import of @dbml/core',
    !hasDefault,
    hasDefault ? 'found `import dbmlCore from "@dbml/core"`' : 'OK — no default import',
  );
  record(
    'EC-V21.1.1.P8.b',
    'named-import `import { importer ... } from "@dbml/core"`',
    hasNamed,
    hasNamed ? 'OK' : 'missing `import { importer ... }` on a `@dbml/core` line',
  );

  const smokeTest = 'apps/product-helper/lib/dbml/__tests__/sql-to-dbml.test.ts';
  record(
    'EC-V21.1.1.P8.c',
    'smoke test file exists',
    fileExists(smokeTest),
    smokeTest,
  );

  const evidence = readIfExists('plans/v211-outputs/th1/dbml-fix-evidence.md');
  record(
    'EC-V21.1.1.P8.d',
    'dbml-fix-evidence.md exists + cites @dbml/core',
    evidence !== null && /@dbml\/core/.test(evidence ?? ''),
    'plans/v211-outputs/th1/dbml-fix-evidence.md',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EC-V21.1.1.P9 — Playwright spec + P10-aware evidence
// ─────────────────────────────────────────────────────────────────────────────

function verifyP9(): void {
  const spec = 'apps/product-helper/tests/e2e/synthesis-clickthrough.spec.ts';
  const fixture = 'apps/product-helper/tests/e2e/fixtures/synthesis-fixture-project.ts';
  const mocks = 'apps/product-helper/tests/e2e/fixtures/synthesis-mocks.ts';
  const wf = '.github/workflows/v2.1.1-e2e.yml';
  const evidencePath = 'plans/v211-outputs/th1/e2e-evidence.md';

  record('EC-V21.1.1.P9.a', 'Playwright spec exists', fileExists(spec), spec);
  record('EC-V21.1.1.P9.b', 'fixture project exists', fileExists(fixture), fixture);
  record('EC-V21.1.1.P9.c', 'fixture mocks exist', fileExists(mocks), mocks);
  record('EC-V21.1.1.P9.d', 'CI workflow exists', fileExists(wf), wf);

  const evidence = readIfExists(evidencePath);
  if (evidence === null) {
    record('EC-V21.1.1.P9.e', 'e2e-evidence.md exists', false, evidencePath);
    return;
  }

  const subs: Array<[string, RegExp]> = [
    ['4 ready', /4 ready/],
    ['7 stuck-pending', /7 stuck-pending/],
    ['P10', /\bP10\b/],
  ];
  const missing = subs.filter(([, r]) => !r.test(evidence)).map(([s]) => s);
  record(
    'EC-V21.1.1.P9.e',
    'e2e-evidence.md grep contract (4 ready + 7 stuck-pending + P10)',
    missing.length === 0,
    missing.length === 0 ? 'all three substrings present' : `MISSING: ${missing.join(', ')}`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dispatch rule #8 — every TH1 Agent prompt body cites post-v2.1-followups.md
// in required_reading[]
// ─────────────────────────────────────────────────────────────────────────────

function verifyDispatchRule8(): void {
  const docPath = 'plans/team-spawn-prompts-v2.1.1.md';
  const src = readIfExists(docPath);
  if (src === null) {
    record('EC-V21.1.1.D8', 'spawn-prompts doc exists', false, docPath);
    return;
  }

  // Find Agent({ ... }) blocks using line-anchored boundaries. A block runs
  // from `Agent({` (start of line, inside a fenced code block) through the
  // first `})` that appears at column 0 (end of the JS-literal block). This
  // is robust against `})` substrings inside multi-line goal/deliverables
  // string literals.
  const lines = src.split('\n');
  const blocks: Array<{ name: string; reading: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^Agent\(\{\s*$/.test(lines[i])) continue;
    let end = -1;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^\}\)\s*$/.test(lines[j])) {
        end = j;
        break;
      }
    }
    if (end < 0) continue;
    const body = lines.slice(i + 1, end).join('\n');
    const nameMatch = /^\s*name:\s*["']([^"']+)["']/m.exec(body);
    const readMatch = /^\s*required_reading:\s*\[([\s\S]*?)\]/m.exec(body);
    blocks.push({
      name: nameMatch?.[1] ?? `<unnamed-block-line-${i + 1}>`,
      reading: readMatch?.[1] ?? '',
    });
  }

  if (blocks.length === 0) {
    record('EC-V21.1.1.D8', 'parsed Agent({...}) blocks', false, 'no Agent blocks parsed');
    return;
  }

  const missing = blocks
    .filter((b) => !/post-v2\.1-followups\.md/.test(b.reading))
    .map((b) => b.name);
  record(
    'EC-V21.1.1.D8',
    `dispatch rule #8 — post-v2.1-followups.md in required_reading (${blocks.length} agents scanned)`,
    missing.length === 0,
    missing.length === 0 ? 'all agents cite the followups doc' : `MISSING in: ${missing.join(', ')}`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function main(): void {
  // eslint-disable-next-line no-console
  console.log(`verify-th1: repoRoot=${repoRoot}`);
  // eslint-disable-next-line no-console
  console.log('');

  verifyP7();
  verifyP8();
  verifyP9();
  verifyDispatchRule8();

  const failed = RESULTS.filter((r) => !r.passed);
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log(`verify-th1: ${RESULTS.length - failed.length}/${RESULTS.length} gates green`);
  if (failed.length > 0) {
    // eslint-disable-next-line no-console
    console.log('FAILED:');
    for (const f of failed) {
      // eslint-disable-next-line no-console
      console.log(`  - ${f.id}: ${f.label} — ${f.detail}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main();
