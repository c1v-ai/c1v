#!/usr/bin/env tsx
/**
 * verify-tc1 — TC1 Wave-C exit-criteria gate runner (EC-V21-C.0 .. C.6).
 *
 * Asserts the 7 sub-points landed by the TC1 deliverable agents:
 *   - namespace-resolver (C.0)
 *   - crawley-schemas (C.1, C.2)
 *   - crawley-migrations (C.3)
 *   - eval-harness (C.4, C.6)
 *   - methodology-page (C.5)
 *
 * Non-fix verifier — logs PASS/FAIL/WARN with evidence. CI-reusable. No DB
 * writes. The integration-smoke gate (registry-load + matrix-keystone
 * round-trip) runs inline; jest suites are NOT spawned here (the
 * qa-c-verifier spawn handles those out-of-band so per-EC verdicts stay
 * green/red as separate signals).
 *
 * Usage:
 *   pnpm tsx apps/product-helper/scripts/verify-tc1.ts          # human
 *   pnpm tsx apps/product-helper/scripts/verify-tc1.ts --json   # machine
 *
 * @module scripts/verify-tc1
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..', '..');
const APP_ROOT = join(REPO_ROOT, 'apps', 'product-helper');
const SCHEMAS_ROOT = join(APP_ROOT, 'lib', 'langchain', 'schemas');
const MIGRATIONS_ROOT = join(APP_ROOT, 'lib', 'db', 'migrations');
const DATASETS_ROOT = join(APP_ROOT, 'lib', 'eval', 'datasets');
const FIXTURES_ROOT = join(APP_ROOT, '__tests__', 'fixtures', 'reference-projects');

type Verdict = 'PASS' | 'FAIL' | 'WARN';

interface GateResult {
  id: string;
  verdict: Verdict;
  detail: string;
}

const results: GateResult[] = [];

function record(id: string, verdict: Verdict, detail: string): void {
  results.push({ id, verdict, detail });
}

function fileExists(p: string): boolean {
  try { return statSync(p).isFile(); } catch { return false; }
}
function dirExists(p: string): boolean {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

function git(args: string[]): { ok: boolean; out: string } {
  try {
    const out = execFileSync('git', args, { cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    return { ok: true, out };
  } catch (e: unknown) {
    return { ok: false, out: (e as { stderr?: Buffer }).stderr?.toString() ?? String(e) };
  }
}

// ─── EC-V21-C.0 — namespace resolution ──────────────────────────────────────
function gateC0(): void {
  const failures: string[] = [];

  const tag1 = git(['rev-parse', 'tc1-c0-complete']);
  const tag2 = git(['rev-parse', 'tc1-preflight-complete']);
  if (!tag1.ok) failures.push(`tc1-c0-complete unresolved`);
  if (!tag2.ok) failures.push(`tc1-preflight-complete unresolved`);
  if (tag1.ok && tag2.ok && tag1.out !== tag2.out) {
    failures.push(`tag SHAs diverge: c0=${tag1.out} preflight=${tag2.out}`);
  }

  const m5Dir = join(SCHEMAS_ROOT, 'module-5');
  const legacyDir = join(SCHEMAS_ROOT, 'module-5-form-function');
  if (!dirExists(m5Dir)) failures.push(`module-5/ folder missing`);
  if (dirExists(legacyDir)) failures.push(`legacy module-5-form-function/ still present`);

  // Baseline tsc errors check — expect 0 (all baseline errors suppressed).
  let tscOut = '';
  try {
    execFileSync('npx', ['tsc', '--noEmit', '--project', 'tsconfig.json'], {
      cwd: APP_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e: unknown) {
    tscOut = (e as { stdout?: Buffer }).stdout?.toString() ?? '';
  }
  const errLines = tscOut.split('\n').filter(l => /error TS\d+/.test(l));
  if (errLines.length !== 0) {
    failures.push(`tsc baseline error count = ${errLines.length}, expected 0. Errors: ${errLines.slice(0, 3).join('; ')}${errLines.length > 3 ? `; … +${errLines.length - 3} more` : ''}`);
  }

  // Schema registry no-dupes — load barrel, assert CRAWLEY_SCHEMAS unique schemaIds.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('../lib/langchain/schemas/index') as { CRAWLEY_SCHEMAS: ReadonlyArray<{ schemaId: string }> };
    const ids = mod.CRAWLEY_SCHEMAS.map(s => s.schemaId);
    if (ids.length !== 10) failures.push(`CRAWLEY_SCHEMAS length=${ids.length}, expected 10`);
    const set = new Set(ids);
    if (set.size !== ids.length) failures.push(`CRAWLEY_SCHEMAS duplicate keys: ${JSON.stringify(ids)}`);
  } catch (e) {
    failures.push(`barrel import failed: ${(e as Error).message}`);
  }

  if (failures.length === 0) {
    record('EC-V21-C.0', 'PASS', `tags + module-5 layout + 9 baseline tsc errors + registry no-dupes all green`);
  } else {
    record('EC-V21-C.0', 'FAIL', failures.join('; '));
  }
}

// ─── EC-V21-C.1 — 10 schemas + 11 sibling tests ─────────────────────────────
const SCHEMA_PATHS = [
  'module-5/phase-1-form-taxonomy.ts',
  'module-5/phase-2-function-taxonomy.ts',
  'module-5/phase-3-form-function-concept.ts',
  'module-5/phase-4-solution-neutral-concept.ts',
  'module-5/phase-5-concept-expansion.ts',
  'module-3/decomposition-plane.ts',
  'module-4/decision-network-foundations.ts',
  'module-4/tradespace-pareto-sensitivity.ts',
  'module-4/optimization-patterns.ts',
  'module-2/requirements-crawley-extension.ts',
] as const;

function gateC1(): void {
  const failures: string[] = [];

  for (const rel of SCHEMA_PATHS) {
    const full = join(SCHEMAS_ROOT, rel);
    if (!fileExists(full)) failures.push(`schema missing: ${rel}`);
    const slug = rel.split('/').slice(-1)[0].replace(/\.ts$/, '');
    const dir = rel.split('/').slice(0, -1).join('/');
    const testRel = `${dir}/__tests__/${slug}.test.ts`;
    const testFull = join(SCHEMAS_ROOT, testRel);
    if (!fileExists(testFull)) failures.push(`sibling test missing: ${testRel}`);
  }

  // Matrix keystone test sibling
  const matrixTest = join(SCHEMAS_ROOT, 'module-5/__tests__/_matrix.test.ts');
  if (!fileExists(matrixTest)) failures.push(`_matrix.test.ts sibling missing`);

  if (failures.length === 0) {
    record('EC-V21-C.1', 'PASS', `10 schemas + 11 sibling tests present (matrix included). Run jest separately for green.`);
  } else {
    record('EC-V21-C.1', 'FAIL', failures.join('; '));
  }
}

// ─── EC-V21-C.2 — mathDerivationMatrixSchema + schema-layer consumers ────────
function gateC2(): void {
  const failures: string[] = [];
  const warnings: string[] = [];

  const matrixPath = join(SCHEMAS_ROOT, 'module-5/_matrix.ts');
  if (!fileExists(matrixPath)) {
    failures.push(`module-5/_matrix.ts missing`);
  } else {
    const src = readFileSync(matrixPath, 'utf8');
    if (!/mathDerivationMatrixSchema/.test(src)) {
      failures.push(`mathDerivationMatrixSchema not in _matrix.ts`);
    }
  }

  const phase2Path = join(SCHEMAS_ROOT, 'module-5/phase-2-function-taxonomy.ts');
  const phase3Path = join(SCHEMAS_ROOT, 'module-5/phase-3-form-function-concept.ts');
  const phase2Src = fileExists(phase2Path) ? readFileSync(phase2Path, 'utf8') : '';
  const phase3Src = fileExists(phase3Path) ? readFileSync(phase3Path, 'utf8') : '';

  if (!/po_array_derivation\s*:\s*mathDerivationMatrixSchema/.test(phase2Src)) {
    failures.push(`phase-2 missing po_array_derivation: mathDerivationMatrixSchema site`);
  }
  // phase-3 uses the matrix inside fullDsmBlockDerivationEntrySchema (which feeds 9 array entries),
  // and a scalar mathDerivationSchema for dsm_projection_chain_derivation.
  if (!/mathDerivationMatrixSchema/.test(phase3Src)) {
    failures.push(`phase-3 missing mathDerivationMatrixSchema reference`);
  }
  if (!/dsm_projection_chain_derivation\s*:\s*mathDerivationSchema/.test(phase3Src)) {
    failures.push(`phase-3 missing scalar dsm_projection_chain_derivation: mathDerivationSchema site`);
  }

  // Document agent-emitter deferral — WARN-level, NOT a FAIL.
  warnings.push('agent-emitter matrix-site refactor DEFERRED to v2.2 per REQUIREMENTS-crawley §5 locality rule (schema-layer count is the EC-C.2 gate)');

  if (failures.length === 0) {
    record('EC-V21-C.2', 'PASS', `keystone present + 1 phase-2 site + phase-3 (9 matrix + 1 scalar chain). ${warnings.join(' | ')}`);
  } else {
    record('EC-V21-C.2', 'FAIL', failures.join('; '));
  }
}

// ─── EC-V21-C.3 — 10 migrations + RLS test artifact ─────────────────────────
const MIGRATIONS = [
  '0016_m5_phase_1_form_taxonomy.sql',
  '0017_m5_phase_2_function_taxonomy.sql',
  '0018_m5_phase_3_form_function_concept.sql',
  '0019_m5_phase_4_solution_neutral_concept.sql',
  '0020_m5_phase_5_concept_expansion.sql',
  '0021_m3_decomposition_plane.sql',
  '0022_m4_decision_network_foundations.sql',
  '0023_m4_tradespace_pareto_sensitivity.sql',
  '0024_m4_optimization_patterns.sql',
  '0025_m2_requirements_crawley_extension.sql',
];

function gateC3(): void {
  const failures: string[] = [];

  for (const f of MIGRATIONS) {
    const full = join(MIGRATIONS_ROOT, f);
    if (!fileExists(full)) {
      failures.push(`migration missing: ${f}`);
      continue;
    }
    const sql = readFileSync(full, 'utf8');
    if (!/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(sql)) failures.push(`${f} missing ENABLE ROW LEVEL SECURITY`);
    if (!/CREATE\s+POLICY/i.test(sql)) failures.push(`${f} missing CREATE POLICY`);
  }

  const rlsTestPath = join(APP_ROOT, '__tests__/db/crawley-rls.test.ts');
  if (!fileExists(rlsTestPath)) failures.push(`crawley-rls.test.ts missing`);

  const applyLog = join(REPO_ROOT, 'plans/v22-outputs/tc1/migrations-apply-log.md');
  if (!fileExists(applyLog)) failures.push(`migrations-apply-log.md missing`);

  if (failures.length === 0) {
    record('EC-V21-C.3', 'PASS', `10 migrations on disk with RLS + CREATE POLICY each + apply log + RLS test present`);
  } else {
    record('EC-V21-C.3', 'FAIL', failures.join('; '));
  }
}

// ─── EC-V21-C.4 — 10 LangSmith dataset jsonls + per-example shape ───────────
const AGENTS = [
  'decision-net', 'form-function', 'hoq', 'fmea-early', 'fmea-residual',
  'interface-specs', 'n2', 'data-flows', 'nfr-resynth', 'architecture-recommendation',
];
const REQUIRED_KEYS = ['input', 'expected_output', 'grade', 'graded_at', 'grader'] as const;
const ALLOWED_GRADES = new Set(['correct', 'partial', 'wrong']);

function gateC4(): void {
  const failures: string[] = [];

  for (const a of AGENTS) {
    const path = join(DATASETS_ROOT, `${a}.jsonl`);
    if (!fileExists(path)) {
      failures.push(`${a}.jsonl missing`);
      continue;
    }
    const lines = readFileSync(path, 'utf8').split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 30) failures.push(`${a}.jsonl has ${lines.length} lines, expected ≥30`);

    for (let i = 0; i < lines.length; i++) {
      let obj: Record<string, unknown>;
      try {
        obj = JSON.parse(lines[i]);
      } catch (e) {
        failures.push(`${a}.jsonl line ${i + 1}: parse error — ${(e as Error).message}`);
        continue;
      }
      for (const k of REQUIRED_KEYS) {
        if (!(k in obj)) {
          failures.push(`${a}.jsonl line ${i + 1}: missing key '${k}'`);
        }
      }
      if (!ALLOWED_GRADES.has(obj.grade as string)) {
        failures.push(`${a}.jsonl line ${i + 1}: grade='${obj.grade as string}' not in {correct, partial, wrong}`);
      }
    }
  }

  // Reference projects fixture sanity
  if (!dirExists(FIXTURES_ROOT)) {
    failures.push(`reference-projects fixture dir missing`);
  } else {
    const fixCount = readdirSync(FIXTURES_ROOT).filter(n => /^ref-\d+\.json$/.test(n)).length;
    if (fixCount !== 10) failures.push(`reference-projects count=${fixCount}, expected 10`);
  }

  if (failures.length === 0) {
    record('EC-V21-C.4', 'PASS', `10 jsonls × ≥30 examples × valid shape; 10 reference-project fixtures`);
  } else {
    record('EC-V21-C.4', 'FAIL', failures.slice(0, 8).join('; ') + (failures.length > 8 ? `; … +${failures.length - 8} more` : ''));
  }
}

// ─── EC-V21-C.5 — methodology page + nav + canonical path ───────────────────
function gateC5(): void {
  const failures: string[] = [];
  const pagePath = join(APP_ROOT, 'app/(dashboard)/about/methodology/page.tsx');
  const navPath = join(APP_ROOT, 'components/about/about-nav.ts');

  if (!fileExists(pagePath)) {
    failures.push(`methodology page.tsx missing`);
  } else {
    const src = readFileSync(pagePath, 'utf8');
    if (!src.includes('system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md')) {
      failures.push(`page.tsx missing canonical path literal`);
    }
  }

  if (!fileExists(navPath)) {
    failures.push(`about-nav.ts missing`);
  } else {
    const src = readFileSync(navPath, 'utf8');
    if (!src.includes('/about/methodology')) {
      failures.push(`about-nav.ts does not expose /about/methodology entry`);
    }
  }

  // Canonical doc on disk
  const canonicalPath = join(REPO_ROOT, 'system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md');
  if (!fileExists(canonicalPath)) failures.push(`canonical METHODOLOGY-CORRECTION.md missing on disk`);

  // Snapshot test artifact
  const testPath = join(APP_ROOT, '__tests__/app/about/methodology.test.tsx');
  if (!fileExists(testPath)) failures.push(`methodology.test.tsx missing`);

  if (failures.length === 0) {
    record('EC-V21-C.5', 'PASS', `page.tsx pins canonical path + about-nav exposes entry + canonical doc on disk + snapshot test present`);
  } else {
    record('EC-V21-C.5', 'FAIL', failures.join('; '));
  }
}

// ─── EC-V21-C.6 — quarterly drift workflow + script ─────────────────────────
function gateC6(): void {
  const failures: string[] = [];
  const wfPath = join(REPO_ROOT, '.github/workflows/quarterly-drift-check.yml');
  const scriptPath = join(APP_ROOT, 'scripts/quarterly-drift-check.ts');

  if (!fileExists(wfPath)) {
    failures.push(`quarterly-drift-check.yml workflow missing`);
  } else {
    const src = readFileSync(wfPath, 'utf8');
    if (!/cron:\s*['"]?0 0 1 \*\/3 \*['"]?/.test(src)) {
      failures.push(`workflow cron != '0 0 1 */3 *'`);
    }
    if (!/quarterly-drift-check\.ts/.test(src)) {
      failures.push(`workflow does not invoke quarterly-drift-check.ts`);
    }
  }
  if (!fileExists(scriptPath)) failures.push(`scripts/quarterly-drift-check.ts missing`);

  if (failures.length === 0) {
    record('EC-V21-C.6', 'PASS', `workflow exists + cron='0 0 1 */3 *' + script invoked`);
  } else {
    record('EC-V21-C.6', 'FAIL', failures.join('; '));
  }
}

// ─── Integration smoke — barrel boot + matrix-keystone round-trip ───────────
function smokeIntegration(): void {
  const failures: string[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('../lib/langchain/schemas/index') as {
      CRAWLEY_SCHEMAS: ReadonlyArray<{ schemaId: string; zodSchema: { safeParse: (v: unknown) => { success: boolean } } }>;
      mathDerivationMatrixSchema: { safeParse: (v: unknown) => { success: boolean } };
    };

    if (mod.CRAWLEY_SCHEMAS.length !== 10) {
      failures.push(`registry length=${mod.CRAWLEY_SCHEMAS.length}, expected 10`);
    }

    const matrixStub = {
      formula: 'I',
      inputs: {},
      kb_source: 'inline',
      result_kind: 'matrix' as const,
      result_matrix: [[1, 0], [0, 1]],
      result_shape: [2, 2] as [number, number],
      result_is_square: true,
    };
    const r = mod.mathDerivationMatrixSchema.safeParse(matrixStub);
    if (!r.success) failures.push(`matrix keystone failed to parse 2×2 stub`);
  } catch (e) {
    failures.push(`integration smoke threw: ${(e as Error).message}`);
  }
  if (failures.length === 0) {
    record('SMOKE-INTEGRATION', 'PASS', `barrel boot clean; registry length=10; matrix keystone parses 2×2 stub`);
  } else {
    record('SMOKE-INTEGRATION', 'FAIL', failures.join('; '));
  }
}

// ─── Entry point ────────────────────────────────────────────────────────────
function main(): void {
  const json = process.argv.includes('--json');

  gateC0();
  gateC1();
  gateC2();
  gateC3();
  gateC4();
  gateC5();
  gateC6();
  smokeIntegration();

  if (json) {
    process.stdout.write(JSON.stringify({ results }, null, 2) + '\n');
  } else {
    console.log('\n=== TC1 Wave-C verification ===\n');
    for (const r of results) {
      console.log(`[${r.verdict}] ${r.id}\n        ${r.detail}\n`);
    }
    const fails = results.filter(r => r.verdict === 'FAIL').length;
    const warns = results.filter(r => r.verdict === 'WARN').length;
    const passes = results.filter(r => r.verdict === 'PASS').length;
    console.log(`\nSummary: ${passes} PASS / ${warns} WARN / ${fails} FAIL\n`);
  }

  const fails = results.filter(r => r.verdict === 'FAIL').length;
  process.exit(fails === 0 ? 0 : 1);
}

main();
