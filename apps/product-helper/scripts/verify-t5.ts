#!/usr/bin/env tsx
/**
 * verify-t5 — V5.1 through V5.4 gate runner.
 *
 *   V5.1   tsc green                                    (delegated)
 *   V5.2a  imports fixed + existing test cases green     (delegated to jest)
 *   V5.2b  5 named it() blocks present (grep by name)
 *   V5.3   form_function_map.v1.json schema-valid + F.NN xref to ffbd.v1
 *          + every redundancy_source_fm cites an FM.NN that exists in
 *          fmea_early.v1
 *   V5.4   Crawley not cited as math source in form-function-agent.ts or
 *          module-5/** (math is Stevens1974 + Bass2021 only)
 *
 * Run from apps/product-helper:
 *   pnpm tsx scripts/verify-t5.ts
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { formFunctionMapV1Schema } from '../lib/langchain/schemas/module-5';

const APP_ROOT = join(__dirname, '..');
const REPO_ROOT = join(APP_ROOT, '..', '..');
const SD_ROOT = join(REPO_ROOT, 'system-design', 'kb-upgrade-v2');

const FORM_FUNCTION_MAP_PATH = join(SD_ROOT, 'module-5-formfunction', 'form_function_map.v1.json');
const FFBD_PATH = join(SD_ROOT, 'module-3-ffbd', 'ffbd.v1.json');
const FMEA_PATH = join(SD_ROOT, 'module-8-risk', 'fmea_early.v1.json');

const TEST_FILE = join(APP_ROOT, 'lib/langchain/agents/system-design/__tests__/form-function-agent.test.ts');
const AGENT_FILE = join(APP_ROOT, 'lib/langchain/agents/system-design/form-function-agent.ts');
const SCHEMA_DIR = join(APP_ROOT, 'lib/langchain/schemas/module-5');

type Result = { gate: string; pass: boolean; detail: string };
const results: Result[] = [];
function record(gate: string, pass: boolean, detail: string) {
  results.push({ gate, pass, detail });
  console.log(`${pass ? '✔' : '✘'} ${gate}  ${detail}`);
}

// ─── V5.2b — 5 named it() blocks present ────────────────────────────────
{
  if (!existsSync(TEST_FILE)) {
    record('V5.2b', false, `missing ${TEST_FILE}`);
  } else {
    const txt = readFileSync(TEST_FILE, 'utf8');
    const required = [
      { name: 'surjectivity refine', pattern: /it\([^,]*surjectivity/i },
      { name: 'Q=s*(1-k) refine', pattern: /it\([^,]*Q\s*!=\s*s\*\(1-k\)/i },
      { name: 'Stevens/Bass citation gate', pattern: /it\([^,]*Stevens.*Bass|it\([^,]*citations missing/i },
      { name: 'FMEA redundancy soft-dep', pattern: /it\([^,]*redundant form when FMEA|it\([^,]*FMEA flags/i },
      { name: 'ffbd F.NN cross-artifact', pattern: /it\([^,]*not in ffbd/i },
    ];
    const missing = required.filter((r) => !r.pattern.test(txt));
    if (missing.length > 0) {
      record('V5.2b', false, `missing test case(s): ${missing.map((m) => m.name).join(', ')}`);
    } else {
      record('V5.2b', true, `5 V5.2b cases present in form-function-agent.test.ts`);
    }
  }
}

// ─── V5.3 — form_function_map.v1.json schema + xref ────────────────────
try {
  if (!existsSync(FORM_FUNCTION_MAP_PATH) || !existsSync(FFBD_PATH) || !existsSync(FMEA_PATH)) {
    record('V5.3', false, `missing one of: form_function_map / ffbd / fmea_early`);
  } else {
    const ffmap = JSON.parse(readFileSync(FORM_FUNCTION_MAP_PATH, 'utf8'));
    const parsed = formFunctionMapV1Schema.parse(ffmap);

    const ffbd = JSON.parse(readFileSync(FFBD_PATH, 'utf8')) as { functions: Array<{ id: string }> };
    const ffbdFnIds = new Set(ffbd.functions.map((f) => f.id));
    const orphanFns = parsed.phase_2_function_inventory.functions.filter((f) => !ffbdFnIds.has(f.id));

    const fmea = JSON.parse(readFileSync(FMEA_PATH, 'utf8')) as { failure_modes: Array<{ id: string }> };
    const fmeaIds = new Set(fmea.failure_modes.map((m) => m.id));
    const badFm = parsed.phase_1_form_inventory.forms
      .filter((f) => f.redundancy_source_fm)
      .filter((f) => !fmeaIds.has(f.redundancy_source_fm as string));

    if (orphanFns.length > 0) {
      record('V5.3', false, `phase-2 F.NN not in ffbd.v1: ${orphanFns.map((f) => f.id).join(', ')}`);
    } else if (badFm.length > 0) {
      record('V5.3', false, `redundancy_source_fm not in fmea_early: ${badFm.map((f) => `${f.id}->${f.redundancy_source_fm}`).join(', ')}`);
    } else {
      record('V5.3', true, `${parsed.phase_2_function_inventory.functions.length} F.NN resolve in ffbd.v1; redundancy FM refs valid`);
    }
  }
} catch (err) {
  record('V5.3', false, `form_function_map parse error: ${(err as Error).message?.slice(0, 200)}`);
}

// ─── V5.4 — Crawley not a math citation source ─────────────────────────
{
  function* walk(dir: string): Generator<string> {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      const s = statSync(p);
      if (s.isDirectory()) yield* walk(p);
      else if (p.endsWith('.ts') || p.endsWith('.tsx')) yield p;
    }
  }

  const targets: string[] = [AGENT_FILE, ...Array.from(walk(SCHEMA_DIR))];
  const offenders: string[] = [];
  for (const p of targets) {
    if (!existsSync(p)) continue;
    const lines = readFileSync(p, 'utf8').split('\n');
    lines.forEach((line, i) => {
      // Reject only when "Crawley" appears AS a citation source — i.e., in
      // a citationSchema source enum, mathDerivation source string, or
      // similar. Comments/docstrings naming Crawley as the methodology
      // framing source are allowed; what's banned is using Crawley as a
      // math-citation enum value or formula attribution string.
      if (/source\s*:\s*['"]Crawley['"]|enum\s*\(\s*\[[^\]]*['"]Crawley['"]/i.test(line)) {
        offenders.push(`${p.replace(APP_ROOT + '/', '')}:${i + 1}: ${line.trim().slice(0, 100)}`);
      }
    });
  }
  if (offenders.length > 0) {
    record('V5.4', false, `${offenders.length} Crawley-as-math-source occurrence(s): ${offenders.slice(0, 3).join(' | ')}`);
  } else {
    record('V5.4', true, `Crawley never used as math-citation source in form-function-agent.ts + module-5/**`);
  }
}

// ─── Summary ───────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.pass);
console.log('');
console.log(`T5 verification: ${results.length - failed.length}/${results.length} gates pass`);
if (failed.length > 0) {
  console.log(`FAIL: ${failed.map((f) => f.gate).join(', ')}`);
  process.exit(1);
}
console.log('READY-FOR-TAG: V5.2b/V5.3/V5.4 green (V5.1 tsc + V5.2a jest must be run separately).');
