/**
 * GET /api/schemas/module-4
 *
 * Preload bundle: serves all 14 Module 4 (Decision Matrix) JSON Schemas in
 * a single response. Clients fetch once, validate all M4 phase artifacts
 * client-side with `ajv` (or equivalent). Beats 14 round trips for the
 * dashboard's DM review surfaces.
 *
 * Response shape:
 *   {
 *     module: 'module-4',
 *     schemaCount: 14,
 *     generatedAt: string,     // server-side timestamp (cached 24h)
 *     schemas: { [slug]: JsonSchema }
 *   }
 *
 * Caching: 24h public cache with stale-while-revalidate. Drift guard (when
 * wired) surfaces schema-source changes via CI so clients don't serve
 * stale JSON beyond the next deploy.
 */

import { NextResponse } from 'next/server';

import phase1 from '@/lib/langchain/schemas/generated/module-4/phase-1-dm-envelope.schema.json';
import phase3 from '@/lib/langchain/schemas/generated/module-4/phase-3-performance-criteria.schema.json';
import phase4 from '@/lib/langchain/schemas/generated/module-4/phase-4-pc-pitfalls.schema.json';
import phase5 from '@/lib/langchain/schemas/generated/module-4/phase-5-direct-scaled-measures.schema.json';
import phase6 from '@/lib/langchain/schemas/generated/module-4/phase-6-ranges.schema.json';
import phase7 from '@/lib/langchain/schemas/generated/module-4/phase-7-subjective-rubric.schema.json';
import phase8 from '@/lib/langchain/schemas/generated/module-4/phase-8-measurement-scale.schema.json';
import phase9 from '@/lib/langchain/schemas/generated/module-4/phase-9-normalization.schema.json';
import phase10 from '@/lib/langchain/schemas/generated/module-4/phase-10-criterion-weights.schema.json';
import phase11 from '@/lib/langchain/schemas/generated/module-4/phase-11-consensus.schema.json';
import phase12 from '@/lib/langchain/schemas/generated/module-4/phase-12-min-max-scores.schema.json';
import phase13 from '@/lib/langchain/schemas/generated/module-4/phase-13-score-interpretation.schema.json';
import phase17 from '@/lib/langchain/schemas/generated/module-4/phase-17-dm-to-qfd-bridge.schema.json';
import phase18 from '@/lib/langchain/schemas/generated/module-4/phase-18-software-specific-dm.schema.json';

const SCHEMAS: Record<string, unknown> = {
  'phase-1-dm-envelope': phase1,
  'phase-3-performance-criteria': phase3,
  'phase-4-pc-pitfalls': phase4,
  'phase-5-direct-scaled-measures': phase5,
  'phase-6-ranges': phase6,
  'phase-7-subjective-rubric': phase7,
  'phase-8-measurement-scale': phase8,
  'phase-9-normalization': phase9,
  'phase-10-criterion-weights': phase10,
  'phase-11-consensus': phase11,
  'phase-12-min-max-scores': phase12,
  'phase-13-score-interpretation': phase13,
  'phase-17-dm-to-qfd-bridge': phase17,
  'phase-18-software-specific-dm': phase18,
};

const SCHEMA_COUNT = Object.keys(SCHEMAS).length;

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      module: 'module-4',
      schemaCount: SCHEMA_COUNT,
      generatedAt: new Date().toISOString(),
      schemas: SCHEMAS,
    },
    {
      headers: {
        'Cache-Control':
          'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
      },
    },
  );
}
