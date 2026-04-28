#!/usr/bin/env tsx
/**
 * verify-t4b — V4b.1 through V4b.5 gate runner.
 *
 *   V4b.1  tsc green                          (delegated; run separately)
 *   V4b.2  decision_network.v1.json schema-valid via M4 phase schemas
 *   V4b.3  interface_specs.v1.json schema-valid + IF.NN ⊆ n2_matrix
 *   V4b.4  Every decision-node score has an empirical prior with valid
 *          source enum; sample_size<10 ⟹ provisional=true;
 *          source='inferred' ⟹ rationale present
 *   V4b.5  No placeholder text (TODO/FIXME/XXX/placeholder) in the 4
 *          new/touched T4b files
 *
 * Run from apps/product-helper:
 *   pnpm tsx scripts/verify-t4b.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  phase14Schema,
  phase15Schema,
  phase16Schema,
  phase17bSchema,
  phase19Schema,
  phases11to13VectorScoresSchema,
} from '../lib/langchain/schemas/module-4';
import { interfaceSpecsV1Schema } from '../lib/langchain/schemas/module-7-interfaces';
import { validateDecisionNetworkArtifact } from '../lib/langchain/agents/system-design/decision-net-agent';

const REPO_ROOT = join(__dirname, '..', '..', '..');
const SD_ROOT = join(REPO_ROOT, 'system-design', 'kb-upgrade-v2');

const DECISION_NETWORK_PATH = join(SD_ROOT, 'module-4-decision-matrix', 'decision_network.v1.json');
const INTERFACE_SPECS_PATH = join(SD_ROOT, 'module-7-interfaces', 'interface_specs.v1.json');
const N2_MATRIX_PATH = join(SD_ROOT, 'module-7-interfaces', 'n2_matrix.v1.json');

// V4b.5 sentinel-string scan applies to T4b production code. The verifier
// itself is excluded because it must mention the sentinel strings (TODO,
// FIXME, XXX, placeholder) to scan for them; a self-scan would always
// trip on the gate description.
const T4B_FILES = [
  'lib/langchain/agents/system-design/decision-net-agent.ts',
  'lib/langchain/agents/system-design/interface-specs-agent.ts',
  'scripts/build-t4b-self-application.ts',
];

type Result = { gate: string; pass: boolean; detail: string };
const results: Result[] = [];

function record(gate: string, pass: boolean, detail: string) {
  results.push({ gate, pass, detail });
  console.log(`${pass ? '✔' : '✘'} ${gate}  ${detail}`);
}

// ─── V4b.2 — decision_network.v1.json schema-valid ─────────────────────
try {
  if (!existsSync(DECISION_NETWORK_PATH)) {
    record('V4b.2', false, `missing artifact: ${DECISION_NETWORK_PATH}`);
  } else {
    const raw = JSON.parse(readFileSync(DECISION_NETWORK_PATH, 'utf8'));
    phase14Schema.parse(raw.phases.phase_14_decision_nodes);
    phase15Schema.parse(raw.phases.phase_15_decision_dependencies);
    phase16Schema.parse(raw.phases.phase_16_pareto_frontier);
    phase17bSchema.parse(raw.phases.phase_17b_sensitivity);
    phase19Schema.parse(raw.phases.phase_19_empirical_prior_binding);
    phases11to13VectorScoresSchema.parse(raw.phases.phases_11_13_vector_scores);
    validateDecisionNetworkArtifact(raw);
    record('V4b.2', true, `decision_network.v1.json passes 6 M4 phase schemas`);
  }
} catch (err) {
  record('V4b.2', false, `decision_network parse error: ${(err as Error).message?.slice(0, 200)}`);
}

// ─── V4b.3 — interface_specs.v1.json schema-valid + IF.NN ⊆ n2_matrix ──
try {
  if (!existsSync(INTERFACE_SPECS_PATH) || !existsSync(N2_MATRIX_PATH)) {
    record('V4b.3', false, `missing artifact(s)`);
  } else {
    const raw = JSON.parse(readFileSync(INTERFACE_SPECS_PATH, 'utf8'));
    const parsed = interfaceSpecsV1Schema.parse(raw);
    const n2 = JSON.parse(readFileSync(N2_MATRIX_PATH, 'utf8')) as { rows: Array<{ id: string }> };
    const n2Ids = new Set(n2.rows.map((r) => r.id));
    const orphans = parsed.interfaces.filter((i) => !n2Ids.has(i.interface_id));
    if (orphans.length > 0) {
      record('V4b.3', false, `interface_id(s) not in n2_matrix: ${orphans.map((o) => o.interface_id).join(', ')}`);
    } else {
      record('V4b.3', true, `${parsed.interfaces.length} interfaces, all IF.NN resolve in n2_matrix`);
    }
  }
} catch (err) {
  record('V4b.3', false, `interface_specs parse error: ${(err as Error).message?.slice(0, 200)}`);
}

// ─── V4b.4 — empirical-prior business rules ────────────────────────────
try {
  const raw = JSON.parse(readFileSync(DECISION_NETWORK_PATH, 'utf8'));
  const allowedSources = new Set(['kb-8-atlas', 'kb-shared', 'nfr', 'fmea', 'inferred']);
  const failures: string[] = [];
  let scoreCount = 0;
  for (const node of raw.phases.phase_14_decision_nodes.decision_nodes) {
    for (const s of node.scores) {
      scoreCount++;
      const ep = s.empirical_priors;
      if (!ep) {
        failures.push(`${node.id}/${s.alternative_id}/${s.criterion_id}: missing empirical_priors`);
        continue;
      }
      if (!allowedSources.has(ep.source)) {
        failures.push(`${node.id}/${s.alternative_id}/${s.criterion_id}: bad source=${ep.source}`);
      }
      if (ep.source === 'inferred' && !ep.rationale && !(s.empirical_priors as { rationale?: string }).rationale) {
        failures.push(`${node.id}/${s.alternative_id}/${s.criterion_id}: source=inferred missing rationale`);
      }
      if (typeof ep.sample_size === 'number' && ep.sample_size < 10 && ep.provisional !== true) {
        failures.push(`${node.id}/${s.alternative_id}/${s.criterion_id}: sample_size<10 but provisional=${ep.provisional}`);
      }
    }
  }
  if (failures.length > 0) {
    record('V4b.4', false, `${failures.length} score(s) violate empirical-prior rules: ${failures.slice(0, 3).join('; ')}`);
  } else {
    record('V4b.4', true, `${scoreCount} scores satisfy empirical-prior business rules`);
  }
} catch (err) {
  record('V4b.4', false, `prior-binding check error: ${(err as Error).message?.slice(0, 200)}`);
}

// ─── V4b.5 — no placeholder text in T4b files ──────────────────────────
{
  const APP_ROOT = join(__dirname, '..');
  const placeholderPattern = /\b(TODO|FIXME|XXX|placeholder)\b/i;
  const offenders: string[] = [];
  for (const rel of T4B_FILES) {
    const p = join(APP_ROOT, rel);
    if (!existsSync(p)) {
      offenders.push(`${rel}: file missing`);
      continue;
    }
    const txt = readFileSync(p, 'utf8');
    const lines = txt.split('\n');
    lines.forEach((line, i) => {
      if (placeholderPattern.test(line)) {
        offenders.push(`${rel}:${i + 1}: ${line.trim().slice(0, 80)}`);
      }
    });
  }
  if (offenders.length > 0) {
    record('V4b.5', false, `${offenders.length} placeholder line(s): ${offenders.slice(0, 3).join(' | ')}`);
  } else {
    record('V4b.5', true, `no TODO/FIXME/XXX/placeholder in ${T4B_FILES.length} files`);
  }
}

// ─── Summary ───────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.pass);
console.log('');
console.log(`T4b verification: ${results.length - failed.length}/${results.length} gates pass`);
if (failed.length > 0) {
  console.log(`FAIL: ${failed.map((f) => f.gate).join(', ')}`);
  process.exit(1);
}
console.log('READY-FOR-TAG: all V4b gates green (V4b.1 tsc must be run separately).');
