/**
 * quarterly-drift-check — schema-drift detector (EC-V21-C.6).
 *
 * Loads 10 reference projects from
 * `__tests__/fixtures/reference-projects/`, computes per-agent
 * `inputs_hash` over a fixed canonical-upstream pinning, compares against
 * the last-quarter snapshot, and writes a markdown drift report.
 *
 * Drift is detected by comparing the current `inputs_hash` for each
 * (agent, project) pair to the snapshot stored at
 * `lib/eval/datasets/_drift-snapshot.json`. Any divergence indicates that
 * the agent's input contract has changed — typically because an upstream
 * schema bumped a field or the canonical artifact moved.
 *
 * Usage:
 *   pnpm tsx scripts/quarterly-drift-check.ts
 *   pnpm tsx scripts/quarterly-drift-check.ts --update-snapshot
 *   pnpm tsx scripts/quarterly-drift-check.ts --out=plans/drift-report.md
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';

import { V2_AGENTS, type AgentName, hashInput } from '../lib/eval/v2-eval-harness';

const REPO_ROOT = resolve(__dirname, '../../..');
const FIXTURES_DIR = join(__dirname, '../__tests__/fixtures/reference-projects');
const SNAPSHOT_PATH = join(__dirname, '../lib/eval/datasets/_drift-snapshot.json');
const DEFAULT_OUT = join(REPO_ROOT, 'plans/v22-outputs/tc1/drift-report.md');

interface ReferenceProject {
  project_id: string;
  vision: string;
  industry: string;
  scale: string;
}

interface DriftSnapshot {
  generated_at: string;
  hashes: Record<string, string>; // key = `${agent}::${project_id}`
}

interface DriftFinding {
  agent: AgentName;
  project_id: string;
  prior_hash: string | null;
  current_hash: string;
  status: 'unchanged' | 'drifted' | 'new';
}

function loadFixtures(): ReferenceProject[] {
  if (!existsSync(FIXTURES_DIR)) return [];
  return readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(FIXTURES_DIR, f), 'utf8')) as ReferenceProject);
}

function loadSnapshot(): DriftSnapshot | null {
  if (!existsSync(SNAPSHOT_PATH)) return null;
  return JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as DriftSnapshot;
}

function pinUpstream(agent: AgentName): Record<string, unknown> {
  // Pin upstream to the canonical v2 self-app artifact paths. If a path
  // no longer exists, hash it as 'missing' — that itself is drift.
  const pin: Record<string, unknown> = { _agent: agent };
  const candidates: string[] = [
    'system-design/kb-upgrade-v2/module-1-defining-scope/data_flows.v1.json',
    'system-design/kb-upgrade-v2/module-3-ffbd/ffbd.v1.json',
    'system-design/kb-upgrade-v2/module-4-decision-matrix/decision_network.v1.json',
    'system-design/kb-upgrade-v2/module-5-formfunction/form_function_map.v1.json',
    'system-design/kb-upgrade-v2/module-7-interfaces/n2_matrix.v1.json',
    'system-design/kb-upgrade-v2/module-7-interfaces/interface_specs.v1.json',
    'system-design/kb-upgrade-v2/module-8-risk/fmea_early.v1.json',
    'system-design/kb-upgrade-v2/module-8-risk/fmea_residual.v1.json',
    'system-design/kb-upgrade-v2/module-2-requirements/nfrs.v2.json',
    '.planning/runs/self-application/module-6/hoq.v1.json',
    '.planning/runs/self-application/synthesis/architecture_recommendation.v1.json',
  ];
  for (const c of candidates) {
    const full = join(REPO_ROOT, c);
    if (existsSync(full)) {
      const content = readFileSync(full, 'utf8');
      pin[c] = createHash('sha256').update(content).digest('hex').slice(0, 16);
    } else {
      pin[c] = 'missing';
    }
  }
  return pin;
}

function detectDrift(snapshot: DriftSnapshot | null): {
  findings: DriftFinding[];
  current: DriftSnapshot;
} {
  const projects = loadFixtures();
  if (projects.length === 0) {
    throw new Error(
      `No reference projects in ${FIXTURES_DIR}. Run scripts/generate-eval-datasets.ts first.`,
    );
  }
  const findings: DriftFinding[] = [];
  const hashes: Record<string, string> = {};
  const upstreamByAgent: Partial<Record<AgentName, Record<string, unknown>>> = {};

  for (const agent of V2_AGENTS) {
    upstreamByAgent[agent] = pinUpstream(agent);
    for (const project of projects) {
      const input = {
        projectIntake: project as unknown as Record<string, unknown>,
        upstreamArtifacts: upstreamByAgent[agent]!,
      };
      const current = hashInput(input);
      const key = `${agent}::${project.project_id}`;
      const prior = snapshot?.hashes?.[key] ?? null;
      hashes[key] = current;
      let status: DriftFinding['status'];
      if (prior === null) status = 'new';
      else if (prior === current) status = 'unchanged';
      else status = 'drifted';
      findings.push({ agent, project_id: project.project_id, prior_hash: prior, current_hash: current, status });
    }
  }

  return {
    findings,
    current: { generated_at: new Date().toISOString(), hashes },
  };
}

function renderReport(findings: DriftFinding[]): string {
  const drifted = findings.filter((f) => f.status === 'drifted');
  const fresh = findings.filter((f) => f.status === 'new');
  const unchanged = findings.filter((f) => f.status === 'unchanged');
  const lines: string[] = [];
  lines.push(`# Quarterly drift report`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`- Total checks: ${findings.length}`);
  lines.push(`- Drifted: ${drifted.length}`);
  lines.push(`- New (no prior baseline): ${fresh.length}`);
  lines.push(`- Unchanged: ${unchanged.length}`);
  lines.push('');
  if (drifted.length > 0) {
    lines.push(`## Drifted (${drifted.length})`);
    lines.push('');
    lines.push('| agent | project | prior_hash | current_hash |');
    lines.push('|---|---|---|---|');
    for (const f of drifted) {
      lines.push(`| ${f.agent} | ${f.project_id} | \`${f.prior_hash}\` | \`${f.current_hash}\` |`);
    }
    lines.push('');
  }
  if (fresh.length > 0) {
    lines.push(`## New (${fresh.length})`);
    lines.push('');
    for (const f of fresh) {
      lines.push(`- ${f.agent} / ${f.project_id} → \`${f.current_hash}\``);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function main(): void {
  const args = process.argv.slice(2);
  const updateSnapshot = args.includes('--update-snapshot');
  const outArg = args.find((a) => a.startsWith('--out='));
  const outPath = outArg ? outArg.slice('--out='.length) : DEFAULT_OUT;

  const snapshot = loadSnapshot();
  const { findings, current } = detectDrift(snapshot);
  const report = renderReport(findings);

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, report);

  const drifted = findings.filter((f) => f.status === 'drifted').length;
  console.log(`drift-check: ${findings.length} pairs, ${drifted} drifted → ${outPath}`);

  if (updateSnapshot || snapshot === null) {
    writeFileSync(SNAPSHOT_PATH, JSON.stringify(current, null, 2));
    console.log(`snapshot updated → ${SNAPSHOT_PATH}`);
  }

  // Non-zero exit on drift, so GHA can open an issue.
  if (drifted > 0) process.exit(1);
}

main();
