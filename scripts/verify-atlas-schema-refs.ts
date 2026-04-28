#!/usr/bin/env tsx
/**
 * verify-atlas-schema-refs - EC-0.2.10 companion verifier.
 *
 * T9 c1v-kb-hygiene: ensure every path assumption embedded in
 *   apps/product-helper/lib/langchain/schemas/atlas/(star).ts
 *   apps/product-helper/lib/langchain/schemas/generated/atlas/(star).schema.json
 * resolves under the new
 *   .planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/
 * location (not the legacy plans/8-stacks-and-priors-atlas/ or the old
 * New-knowledge-banks/8-stacks-and-priors-atlas/).
 *
 * Scans schema source + generated JSON for legacy atlas path patterns
 * (description strings, examples strings, $ref pointers, JSDoc hints).
 *
 * Exits 0 on PASS, 1 on FAIL.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO_ROOT = resolve(__dirname, '..');
const ATLAS_SRC = join(REPO_ROOT, 'apps/product-helper/lib/langchain/schemas/atlas');
const ATLAS_GENERATED = join(
  REPO_ROOT,
  'apps/product-helper/lib/langchain/schemas/generated/atlas',
);
const NEW_ATLAS_ROOT = join(
  REPO_ROOT,
  'apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas',
);

// Patterns considered LEGACY (must NOT appear in schemas post-T9).
const LEGACY_PATH_PATTERNS: RegExp[] = [
  /plans\/8-stacks-and-priors-atlas/g,
  /New-knowledge-banks\/8-stacks-and-priors-atlas/g,
  /New-knowledge-banks\/8-public-company-stacks-atlas/g,
];

// File extensions to scan.
const SCAN_EXTS = new Set(['.ts', '.json']);

interface Finding {
  file: string;
  line: number;
  lineText: string;
  matched: string;
  severity: 'legacy' | 'unresolved';
}

const findings: Finding[] = [];
const scanned: string[] = [];

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (entry === '__tests__' || entry === 'node_modules') continue;
      walk(full, out);
    } else {
      const dot = entry.lastIndexOf('.');
      const ext = dot >= 0 ? entry.slice(dot) : '';
      if (SCAN_EXTS.has(ext)) out.push(full);
    }
  }
  return out;
}

function scanFile(file: string): void {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((ln, idx) => {
    for (const pat of LEGACY_PATH_PATTERNS) {
      pat.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = pat.exec(ln))) {
        findings.push({
          file,
          line: idx + 1,
          lineText: ln.trim().slice(0, 200),
          matched: m[0],
          severity: 'legacy',
        });
      }
    }
  });
}

function main(): number {
  const files = [...walk(ATLAS_SRC), ...walk(ATLAS_GENERATED)];
  scanned.push(...files);
  for (const f of files) scanFile(f);

  if (!existsSync(NEW_ATLAS_ROOT)) {
    findings.push({
      file: NEW_ATLAS_ROOT,
      line: 0,
      lineText: '',
      matched: 'NEW_ATLAS_ROOT does not exist',
      severity: 'unresolved',
    });
  }
  const companiesDir = join(NEW_ATLAS_ROOT, '04-filled-examples/companies');
  if (!existsSync(companiesDir)) {
    findings.push({
      file: companiesDir,
      line: 0,
      lineText: '',
      matched: 'atlas companies/ not found under new 9-stacks-atlas root',
      severity: 'unresolved',
    });
  }

  console.log(`[verify-atlas-schema-refs] scanned ${scanned.length} files under:`);
  console.log(`  ${ATLAS_SRC}`);
  console.log(`  ${ATLAS_GENERATED}`);

  if (findings.length === 0) {
    console.log('[verify-atlas-schema-refs] PASS - no legacy atlas path references found.');
    return 0;
  }

  console.error(`[verify-atlas-schema-refs] FAIL - ${findings.length} finding(s):`);
  for (const f of findings) {
    console.error(
      `  ${f.severity.toUpperCase()}  ${f.file}:${f.line}  matched="${f.matched}"`,
    );
    if (f.lineText) console.error(`    > ${f.lineText}`);
  }
  return 1;
}

process.exit(main());
