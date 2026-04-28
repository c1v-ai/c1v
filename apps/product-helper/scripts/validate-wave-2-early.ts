/**
 * Wave 2-early validator — parses the 4 canonical v1 artifacts through
 * their Zod schemas + runs the cross-artifact referential checks baked
 * into the agent helpers (ffbd-agent, n2-agent, fmea-early-agent).
 *
 * Usage:
 *   cd apps/product-helper && pnpm tsx scripts/validate-wave-2-early.ts
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { dataFlowsSchema } from '@/lib/langchain/schemas/module-1/phase-2-5-data-flows';
import { ffbdV1Schema } from '@/lib/langchain/schemas/module-3/ffbd-v1';
import { n2MatrixSchema } from '@/lib/langchain/schemas/module-7-interfaces/n2-matrix';
import { fmeaEarlySchema } from '@/lib/langchain/schemas/module-8-risk/fmea-early';
import { runFfbdAgent } from '@/lib/langchain/agents/system-design/ffbd-agent';
import { runN2Agent } from '@/lib/langchain/agents/system-design/n2-agent';
import { runFmeaEarlyAgent } from '@/lib/langchain/agents/system-design/fmea-early-agent';

const ROOT = join(__dirname, '..', '..', '..');

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8')) as T;
}

async function main(): Promise<void> {
  const df = dataFlowsSchema.parse(
    readJson('system-design/kb-upgrade-v2/module-1-defining-scope/data_flows.v1.json'),
  );
  console.log(`✔ data_flows.v1 — ${df.entries.length} DE entries`);

  const ffbdRaw = readJson('system-design/kb-upgrade-v2/module-3-ffbd/ffbd.v1.json');
  const ffbd = await runFfbdAgent(
    {
      scopeTree: {},
      contextDiagram: {},
      dataFlows: df,
      ffbdTopLevel: {},
      systemName: 'c1v',
      producedBy: 'validator',
      outputPath: '',
      upstreamRefs: (ffbdRaw as any)._upstream_refs,
    },
    { stub: ffbdV1Schema.parse(ffbdRaw) },
  );
  console.log(`✔ ffbd.v1 — ${ffbd.functions.length} functions, ${ffbd.logic_gates.length} gates`);

  const n2Raw = readJson('system-design/kb-upgrade-v2/module-7-interfaces/n2_matrix.v1.json');
  const n2 = await runN2Agent(
    {
      ffbd,
      dataFlows: df,
      systemName: 'c1v',
      producedBy: 'validator',
      outputPath: '',
      upstreamRefs: (n2Raw as any)._upstream_refs,
    },
    { stub: n2MatrixSchema.parse(n2Raw) },
  );
  console.log(`✔ n2_matrix.v1 — ${n2.rows.length} rows`);

  const fmeaRaw = readJson('system-design/kb-upgrade-v2/module-8-risk/fmea_early.v1.json');
  const fmea = await runFmeaEarlyAgent(
    {
      ffbd,
      n2,
      dataFlows: df,
      ratingScalesVersion: 'fmea_rating_scales.v1',
      systemName: 'c1v',
      producedBy: 'validator',
      outputPath: '',
      upstreamRefs: (fmeaRaw as any)._upstream_refs,
    },
    { stub: fmeaEarlySchema.parse(fmeaRaw) },
  );
  console.log(`✔ fmea_early.v1 — ${fmea.failure_modes.length} failure modes`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
