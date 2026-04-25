#!/usr/bin/env tsx
/**
 * verify-tree-pair-consistency — T8 cross-tree consistency verifier
 * (v2 §0.4.4 / §0.4.5).
 *
 * Reads:
 *   apps/product-helper/lib/langchain/schemas/                    (schema tree)
 *   apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/ (KB tree)
 *   system-design/kb-upgrade-v2/module-(star)/(star).json          (v2 artifacts)
 *   apps/product-helper/lib/langchain/schemas/generate-all.ts     (registry)
 *   apps/product-helper/lib/mcp/                                  (MCP refs)
 *
 * Exit codes (per v2 §0.4.4):
 *   0 — all consistent
 *   1 — schema/KB tree mismatch (missing pair)
 *   2 — slug mismatch between trees (e.g. module-4-decision-net vs 4-decisions)
 *   3 — v2 artifact `_upstream_refs` path broken
 *   4 — generate-all.ts schema reference broken
 *   5 — MCP tool reference broken
 *
 * Read-only. No writes. Designed to run in <5s in CI.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const REPO_ROOT = resolve(__dirname, '..');
export const SCHEMA_DIR = join(REPO_ROOT, 'apps/product-helper/lib/langchain/schemas');
export const KB_DIR = join(
  REPO_ROOT,
  'apps/product-helper/.planning/phases/13-Knowledge-banks-deepened',
);
export const V2_ARTIFACT_ROOT = join(REPO_ROOT, 'system-design/kb-upgrade-v2');
export const GENERATE_ALL_PATH = join(SCHEMA_DIR, 'generate-all.ts');
export const MCP_DIR = join(REPO_ROOT, 'apps/product-helper/lib/mcp');

const SKIP_NAMES = new Set([
  '_shared',
  'generated',
  'engines',
  'atlas',
  'synthesis',
  '__tests__',
  'build-projections.ts',
  'projections.ts',
  'zod-to-json.ts',
  'generate-all.ts',
]);

export interface ModuleEntry {
  n: number;
  slug: string | null;
  dirname: string;
}

export interface VerifyOptions {
  schemaDir?: string;
  kbDir?: string;
  v2Root?: string;
  generateAllPath?: string;
  mcpDir?: string;
}

export interface VerifyResult {
  exitCode: 0 | 1 | 2 | 3 | 4 | 5;
  errors: string[];
}

/** Parse `module-N[-slug]` or `N-slug` → {n, slug}. Returns null on no match. */
export function parseModuleDir(name: string, prefix: 'module-' | ''): ModuleEntry | null {
  const re = prefix === 'module-' ? /^module-(\d+)(?:-(.+))?$/ : /^(\d+)-(.+)$/;
  const m = name.match(re);
  if (!m) return null;
  return {
    n: Number(m[1]),
    slug: m[2] ?? null,
    dirname: name,
  };
}

function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((entry) => {
    if (SKIP_NAMES.has(entry)) return false;
    return statSync(join(dir, entry)).isDirectory();
  });
}

/** EC=1, EC=2: pair every N in {1..9} between schema and KB trees. */
export function checkTreePairing(opts: VerifyOptions = {}): {
  errorsEc1: string[];
  errorsEc2: string[];
} {
  const schemaDir = opts.schemaDir ?? SCHEMA_DIR;
  const kbDir = opts.kbDir ?? KB_DIR;

  const schemaModules = new Map<number, ModuleEntry>();
  for (const name of listDirs(schemaDir)) {
    const e = parseModuleDir(name, 'module-');
    if (e && e.n >= 1 && e.n <= 9) schemaModules.set(e.n, e);
  }
  const kbModules = new Map<number, ModuleEntry>();
  for (const name of listDirs(kbDir)) {
    const e = parseModuleDir(name, '');
    if (e && e.n >= 1 && e.n <= 9) kbModules.set(e.n, e);
  }

  const errorsEc1: string[] = [];
  const errorsEc2: string[] = [];

  for (let n = 1; n <= 9; n++) {
    const schema = schemaModules.get(n);
    const kb = kbModules.get(n);

    // Per §0.4.4: schema dir missing is allowed for new-only modules until T5/T6
    // creates them. KB dir missing when schema exists is a hard mismatch.
    if (schema && !kb) {
      errorsEc1.push(
        `EC=1: schema has module-${n} (${schema.dirname}) but KB tree has no ${n}-* folder`,
      );
      continue;
    }

    if (schema && kb && schema.slug && kb.slug && schema.slug !== kb.slug) {
      errorsEc2.push(
        `EC=2: slug mismatch for module ${n}: schema="${schema.slug}" (${schema.dirname}), KB="${kb.slug}" (${kb.dirname})`,
      );
    }
  }

  return { errorsEc1, errorsEc2 };
}

/** Recursively gather *.json files under root. */
function walkJson(root: string, out: string[] = []): string[] {
  if (!existsSync(root)) return out;
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    const st = statSync(full);
    if (st.isDirectory()) walkJson(full, out);
    else if (st.isFile() && entry.endsWith('.json')) out.push(full);
  }
  return out;
}

/** Extract all _upstream_refs paths (array OR object map) from a parsed JSON. */
export function extractUpstreamRefs(parsed: unknown): string[] {
  if (!parsed || typeof parsed !== 'object') return [];
  const refs = (parsed as Record<string, unknown>)._upstream_refs;
  if (!refs) return [];
  if (Array.isArray(refs)) {
    return refs.filter((r): r is string => typeof r === 'string');
  }
  if (typeof refs === 'object') {
    return Object.values(refs as Record<string, unknown>).filter(
      (r): r is string => typeof r === 'string',
    );
  }
  return [];
}

/** EC=3: v2 artifact `_upstream_refs` paths must resolve. */
export function checkV2UpstreamRefs(opts: VerifyOptions = {}): string[] {
  const v2Root = opts.v2Root ?? V2_ARTIFACT_ROOT;
  // v2Root is `<repo>/system-design/kb-upgrade-v2`; go up two to recover repo root.
  const repoRoot = opts.v2Root ? resolve(opts.v2Root, '../..') : REPO_ROOT;
  const errors: string[] = [];

  for (const file of walkJson(v2Root)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      // Non-JSON parse failure is not in scope of this verifier.
      continue;
    }
    for (const ref of extractUpstreamRefs(parsed)) {
      const abs = resolve(repoRoot, ref);
      if (!existsSync(abs)) {
        errors.push(`EC=3: ${file.replace(repoRoot + '/', '')} references missing path "${ref}"`);
      }
    }
  }
  return errors;
}

/** EC=4: every output dir / module import path in generate-all.ts must exist. */
export function checkGenerateAllRefs(opts: VerifyOptions = {}): string[] {
  const generateAllPath = opts.generateAllPath ?? GENERATE_ALL_PATH;
  const schemaDir = opts.schemaDir ?? SCHEMA_DIR;
  if (!existsSync(generateAllPath)) {
    return [`EC=4: generate-all.ts not found at ${generateAllPath}`];
  }
  const src = readFileSync(generateAllPath, 'utf8');
  const errors: string[] = [];

  // Module folder imports: from './module-X-slug' or './module-X'
  const importRe = /from\s+'(\.\/[^']+)'/g;
  for (const m of src.matchAll(importRe)) {
    const rel = m[1];
    if (!rel.startsWith('./module-') && !['./atlas', './synthesis'].includes(rel)) continue;
    // strip leading './' and resolve as folder (with optional index.ts)
    const dir = join(schemaDir, rel.replace(/^\.\//, ''));
    if (!existsSync(dir) && !existsSync(`${dir}.ts`)) {
      errors.push(`EC=4: generate-all.ts imports '${rel}' but ${dir} does not exist`);
    }
  }

  // Output dirs declared as join(OUTPUT_DIR, 'module-X-slug')
  const outputRe = /join\(OUTPUT_DIR,\s*'([^']+)'\)/g;
  for (const m of src.matchAll(outputRe)) {
    // OUTPUT_DIR resolves at write-time; we only care that the output subdir
    // name corresponds to a real source module folder under schemas/.
    const sub = m[1];
    if (!sub.startsWith('module-') && !['atlas', 'synthesis'].includes(sub)) continue;
    const sourceDir = join(schemaDir, sub);
    if (!existsSync(sourceDir)) {
      errors.push(
        `EC=4: generate-all.ts emits to '${sub}' but source dir ${sourceDir} does not exist`,
      );
    }
  }

  return errors;
}

/** EC=5: MCP tool refs into schemas/ or KBs must resolve.
 *  Today no such refs exist; this is a forward-looking guard. */
export function checkMcpRefs(opts: VerifyOptions = {}): string[] {
  const mcpDir = opts.mcpDir ?? MCP_DIR;
  const repoRoot = opts.mcpDir ? resolve(opts.mcpDir, '../../../..') : REPO_ROOT;
  if (!existsSync(mcpDir)) return [];

  const errors: string[] = [];
  const tsFiles: string[] = [];
  const collect = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      if (entry === '__tests__' || entry === 'node_modules') continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) collect(full);
      else if (entry.endsWith('.ts')) tsFiles.push(full);
    }
  };
  collect(mcpDir);

  // Match string literals that look like repo-relative paths into the two trees.
  const pathRe =
    /['"`]((?:apps\/product-helper\/lib\/langchain\/schemas|apps\/product-helper\/\.planning\/phases\/13-Knowledge-banks-deepened|lib\/langchain\/schemas|\.planning\/phases\/13-Knowledge-banks-deepened)\/[^'"`]+)['"`]/g;

  for (const file of tsFiles) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(pathRe)) {
      const ref = m[1];
      // Try repo-root then app-root resolution.
      const tryAbs = [
        resolve(repoRoot, ref),
        resolve(repoRoot, 'apps/product-helper', ref),
      ];
      if (!tryAbs.some(existsSync)) {
        errors.push(`EC=5: MCP file ${file.replace(repoRoot + '/', '')} references missing path "${ref}"`);
      }
    }
  }
  return errors;
}

export function verify(opts: VerifyOptions = {}): VerifyResult {
  const { errorsEc1, errorsEc2 } = checkTreePairing(opts);
  if (errorsEc1.length > 0) return { exitCode: 1, errors: errorsEc1 };
  if (errorsEc2.length > 0) return { exitCode: 2, errors: errorsEc2 };

  const ec3 = checkV2UpstreamRefs(opts);
  if (ec3.length > 0) return { exitCode: 3, errors: ec3 };

  const ec4 = checkGenerateAllRefs(opts);
  if (ec4.length > 0) return { exitCode: 4, errors: ec4 };

  const ec5 = checkMcpRefs(opts);
  if (ec5.length > 0) return { exitCode: 5, errors: ec5 };

  return { exitCode: 0, errors: [] };
}

function main(): void {
  const result = verify();
  if (result.exitCode === 0) {
    console.log('verify-tree-pair-consistency: PASS');
  } else {
    console.error(`verify-tree-pair-consistency: FAIL (exit ${result.exitCode})`);
    for (const err of result.errors) console.error('  ' + err);
  }
  process.exit(result.exitCode);
}

const invokedDirectly =
  typeof require !== 'undefined' && require.main === module;
if (invokedDirectly) main();
