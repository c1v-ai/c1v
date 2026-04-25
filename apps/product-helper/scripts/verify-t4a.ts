#!/usr/bin/env tsx
/**
 * verify-t4a — V4a.1 through V4a.7 gate runner.
 *
 * Forward-fills the existing `wave-2-early-complete` soft tag with green-gate
 * evidence for the T4a deliverables (Wave 2-early per v2 §0.3.5):
 *
 *   M1 phase 2.5  — data_flows.v1.json     (commit 15f5855)
 *   M3 gate-c     — ffbd.v1.json           (commit b1082cd)
 *   M7.a          — n2_matrix.v1.json      (commit 152e38b)
 *   M8.a          — fmea_early.v1.json     (commit 84e194b)
 *
 *   V4a.1  tsc green                                       (delegated)
 *   V4a.2  data_flows.v1.json schema-valid via M1 Zod
 *   V4a.3  ffbd.v1.json schema-valid + every DE.NN input ⊆ data_flows.v1
 *   V4a.4  n2_matrix.v1.json schema-valid + every producer/consumer ⊆
 *          ffbd.v1 functions + every non-null data_flow_ref ⊆ data_flows.v1
 *   V4a.5  fmea_early.v1.json schema-valid + every target_ref resolves
 *          (kind=function ⊆ ffbd, kind=interface ⊆ n2, kind=data_flow ⊆ DE)
 *   V4a.6  cross-tree _upstream_refs resolve from disk for all 4 artifacts
 *   V4a.7  no TODO/FIXME/XXX/placeholder text in T4a production files
 *
 * Run from apps/product-helper:
 *   pnpm tsx scripts/verify-t4a.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { dataFlowsSchema } from '../lib/langchain/schemas/module-1';
import { ffbdV1Schema } from '../lib/langchain/schemas/module-3';
import { n2MatrixSchema } from '../lib/langchain/schemas/module-7-interfaces';
import { fmeaEarlySchema } from '../lib/langchain/schemas/module-8-risk';

const APP_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(APP_ROOT, '..', '..');
const SD_ROOT = join(REPO_ROOT, 'system-design', 'kb-upgrade-v2');

const DATA_FLOWS_PATH = join(SD_ROOT, 'module-1-defining-scope', 'data_flows.v1.json');
const FFBD_PATH = join(SD_ROOT, 'module-3-ffbd', 'ffbd.v1.json');
const N2_PATH = join(SD_ROOT, 'module-7-interfaces', 'n2_matrix.v1.json');
const FMEA_PATH = join(SD_ROOT, 'module-8-risk', 'fmea_early.v1.json');

// V4a.7 sentinel-string scan applies to T4a production code only. The verifier
// itself is excluded because it must mention the sentinel strings (TODO,
// FIXME, XXX, placeholder) to scan for them — a self-scan would always trip.
const T4A_FILES = [
  'lib/langchain/agents/system-design/data-flows-agent.ts',
  'lib/langchain/agents/system-design/ffbd-agent.ts',
  'lib/langchain/agents/system-design/n2-agent.ts',
  'lib/langchain/agents/system-design/fmea-early-agent.ts',
];

type Result = { gate: string; pass: boolean; detail: string };
const results: Result[] = [];

function record(gate: string, pass: boolean, detail: string) {
  results.push({ gate, pass, detail });
  console.log(`${pass ? '✔' : '✘'} ${gate}  ${detail}`);
}

function readJson<T = unknown>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

// ─── V4a.2 — data_flows.v1 schema-valid ─────────────────────────────────
let dataFlows: ReturnType<typeof dataFlowsSchema.parse> | null = null;
try {
  if (!existsSync(DATA_FLOWS_PATH)) {
    record('V4a.2', false, `missing artifact: ${DATA_FLOWS_PATH}`);
  } else {
    const raw = readJson(DATA_FLOWS_PATH);
    dataFlows = dataFlowsSchema.parse(raw);
    record('V4a.2', true, `data_flows.v1.json: ${dataFlows.entries.length} DE.NN entries, schema-valid`);
  }
} catch (err) {
  record('V4a.2', false, `data_flows parse error: ${(err as Error).message?.slice(0, 240)}`);
}

// ─── V4a.3 — ffbd.v1 schema-valid + DE.NN inputs ⊆ data_flows ──────────
let ffbd: ReturnType<typeof ffbdV1Schema.parse> | null = null;
try {
  if (!existsSync(FFBD_PATH)) {
    record('V4a.3', false, `missing artifact: ${FFBD_PATH}`);
  } else {
    const raw = readJson(FFBD_PATH);
    ffbd = ffbdV1Schema.parse(raw);
    if (!dataFlows) {
      record('V4a.3', false, `cannot xref DE.NN — data_flows parse failed`);
    } else {
      const deIds = new Set(dataFlows.entries.map((e) => e.id));
      const orphans: string[] = [];
      for (const fn of ffbd.functions) {
        for (const inp of fn.inputs) {
          if (inp.kind === 'data_flow' && !deIds.has(inp.ref)) {
            orphans.push(`${fn.id}.input ${inp.ref}`);
          }
        }
        for (const out of fn.outputs) {
          if (out.kind === 'data_flow' && !deIds.has(out.ref)) {
            orphans.push(`${fn.id}.output ${out.ref}`);
          }
        }
      }
      if (orphans.length > 0) {
        record('V4a.3', false, `ffbd DE.NN refs not in data_flows: ${orphans.slice(0, 5).join(', ')}`);
      } else {
        record(
          'V4a.3',
          true,
          `ffbd.v1.json: ${ffbd.functions.length} functions, all DE.NN inputs/outputs resolve in data_flows`,
        );
      }
    }
  }
} catch (err) {
  record('V4a.3', false, `ffbd parse error: ${(err as Error).message?.slice(0, 240)}`);
}

// ─── V4a.4 — n2_matrix.v1 schema-valid + producers/consumers ⊆ ffbd +
//             data_flow_ref ⊆ data_flows ────────────────────────────────
let n2: ReturnType<typeof n2MatrixSchema.parse> | null = null;
try {
  if (!existsSync(N2_PATH)) {
    record('V4a.4', false, `missing artifact: ${N2_PATH}`);
  } else {
    const raw = readJson(N2_PATH);
    n2 = n2MatrixSchema.parse(raw);
    if (!ffbd || !dataFlows) {
      record('V4a.4', false, `cannot xref — ffbd/data_flows parse failed`);
    } else {
      const fnIds = new Set(ffbd.functions.map((f) => f.id));
      const deIds = new Set(dataFlows.entries.map((e) => e.id));
      const badEndpoints: string[] = [];
      const badDeRefs: string[] = [];
      for (const row of n2.rows) {
        if (!fnIds.has(row.producer)) badEndpoints.push(`${row.id}.producer=${row.producer}`);
        if (!fnIds.has(row.consumer)) badEndpoints.push(`${row.id}.consumer=${row.consumer}`);
        if (row.data_flow_ref !== null && !deIds.has(row.data_flow_ref)) {
          badDeRefs.push(`${row.id}.data_flow_ref=${row.data_flow_ref}`);
        }
      }
      if (badEndpoints.length > 0) {
        record('V4a.4', false, `n2 endpoints not in ffbd: ${badEndpoints.slice(0, 5).join(', ')}`);
      } else if (badDeRefs.length > 0) {
        record('V4a.4', false, `n2 data_flow_ref not in data_flows: ${badDeRefs.slice(0, 5).join(', ')}`);
      } else {
        record(
          'V4a.4',
          true,
          `n2_matrix.v1.json: ${n2.rows.length} IF.NN rows, all endpoints + DE refs resolve`,
        );
      }
    }
  }
} catch (err) {
  record('V4a.4', false, `n2 parse error: ${(err as Error).message?.slice(0, 240)}`);
}

// ─── V4a.5 — fmea_early.v1 schema-valid + target_ref resolves by kind ──
try {
  if (!existsSync(FMEA_PATH)) {
    record('V4a.5', false, `missing artifact: ${FMEA_PATH}`);
  } else {
    const raw = readJson(FMEA_PATH);
    const fmea = fmeaEarlySchema.parse(raw);
    if (!ffbd || !n2 || !dataFlows) {
      record('V4a.5', false, `cannot xref — upstream artifact parse failed`);
    } else {
      const fnIds = new Set(ffbd.functions.map((f) => f.id));
      const ifIds = new Set(n2.rows.map((r) => r.id));
      const deIds = new Set(dataFlows.entries.map((e) => e.id));
      const orphans: string[] = [];
      for (const fm of fmea.failure_modes) {
        const { kind, ref } = fm.target_ref;
        if (kind === 'function' && !fnIds.has(ref)) orphans.push(`${fm.id}->fn:${ref}`);
        else if (kind === 'interface' && !ifIds.has(ref)) orphans.push(`${fm.id}->if:${ref}`);
        else if (kind === 'data_flow' && !deIds.has(ref)) orphans.push(`${fm.id}->de:${ref}`);
      }
      if (orphans.length > 0) {
        record('V4a.5', false, `fmea target_ref orphans: ${orphans.slice(0, 5).join(', ')}`);
      } else {
        record(
          'V4a.5',
          true,
          `fmea_early.v1.json: ${fmea.failure_modes.length} FM.NN rows, all target_refs resolve`,
        );
      }
    }
  }
} catch (err) {
  record('V4a.5', false, `fmea parse error: ${(err as Error).message?.slice(0, 240)}`);
}

// ─── V4a.6 — cross-tree _upstream_refs resolve on disk ─────────────────
{
  const checks: Array<{ artifact: string; refs: Record<string, string> }> = [];
  for (const p of [DATA_FLOWS_PATH, FFBD_PATH, N2_PATH, FMEA_PATH]) {
    if (!existsSync(p)) continue;
    const raw = readJson<{ _upstream_refs?: Record<string, string> }>(p);
    if (raw._upstream_refs) {
      checks.push({ artifact: p, refs: raw._upstream_refs });
    }
  }
  const broken: string[] = [];
  for (const c of checks) {
    for (const [name, refPath] of Object.entries(c.refs)) {
      const abs = join(REPO_ROOT, refPath);
      if (!existsSync(abs)) {
        const artifactRel = c.artifact.replace(REPO_ROOT + '/', '');
        broken.push(`${artifactRel}._upstream_refs.${name}=${refPath}`);
      }
    }
  }
  if (broken.length > 0) {
    record('V4a.6', false, `${broken.length} broken upstream ref(s): ${broken.slice(0, 3).join(' | ')}`);
  } else {
    const totalRefs = checks.reduce((n, c) => n + Object.keys(c.refs).length, 0);
    record(
      'V4a.6',
      true,
      `${totalRefs} _upstream_refs across ${checks.length} artifacts all resolve on disk`,
    );
  }
}

// ─── V4a.7 — no placeholder text in T4a files ──────────────────────────
{
  const placeholderPattern = /\b(TODO|FIXME|XXX|placeholder)\b/i;
  const offenders: string[] = [];
  for (const rel of T4A_FILES) {
    const p = join(APP_ROOT, rel);
    if (!existsSync(p)) {
      offenders.push(`${rel}: file missing`);
      continue;
    }
    const lines = readFileSync(p, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (placeholderPattern.test(line)) {
        offenders.push(`${rel}:${i + 1}: ${line.trim().slice(0, 80)}`);
      }
    });
  }
  if (offenders.length > 0) {
    record('V4a.7', false, `${offenders.length} placeholder line(s): ${offenders.slice(0, 3).join(' | ')}`);
  } else {
    record('V4a.7', true, `no TODO/FIXME/XXX/placeholder in ${T4A_FILES.length} T4a agent files`);
  }
}

// ─── Summary ───────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.pass);
console.log('');
console.log(`T4a verification: ${results.length - failed.length}/${results.length} gates pass`);
if (failed.length > 0) {
  console.log(`FAIL: ${failed.map((f) => f.gate).join(', ')}`);
  process.exit(1);
}
console.log('READY-FOR-TAG: all V4a gates green (V4a.1 tsc must be run separately).');
