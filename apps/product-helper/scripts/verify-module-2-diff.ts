/**
 * Gate B Verification Step (flag C)
 *
 * Diffs the Zod-generated Module 2 JSON Schemas in
 *   lib/langchain/schemas/generated/module-2/
 * against the hand-written F14/2 layout schemas in
 *   .planning/phases/14-artifact-publishing-json-excel-ppt-pdf/.../*.schema.json
 *
 * These files serve DIFFERENT purposes:
 *   - Generated (Gate B) = data shape for LLM structured output + validation
 *   - F14/2 hand-written  = xlsx layout spec (cell addresses, data_range, write strategy)
 *
 * The report surfaces three kinds of info so Gate C can decide the
 * path-swap approach safely:
 *   1. Envelope fields present in generated that F14/2 lacks (expected).
 *   2. F14/2 metadata fields not yet represented in `metadataHeaderSchema`.
 *   3. Column-layout overlap between `_columns_plan` and F14/2 `dynamic_tables[].columns[]`.
 *
 * Writes a markdown report to
 *   plans/m2-folder-2-schema-az-sweep/02-gate-b-diff-report.md
 *
 * Run: `pnpm tsx scripts/verify-module-2-diff.ts` from apps/product-helper/.
 *
 * @module scripts/verify-module-2-diff
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

// ──────────────────────────────────────────────────────────────────────────
// Types (loose — we're consuming untyped JSON)
// ──────────────────────────────────────────────────────────────────────────

interface HandwrittenLayout {
  source_file?: string;
  known_issues?: string[];
  fields?: Record<string, { label_literal?: string; cell?: string; type?: string }>;
  dynamic_tables?: Record<
    string,
    {
      header_row?: number;
      columns?: Array<{ name: string; cell_col?: string; header?: string; type?: string }>;
      data_start_row?: number;
      data_range?: string;
      write_strategy?: string;
    }
  >;
}

interface GeneratedSchema {
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────
// File resolution
// ──────────────────────────────────────────────────────────────────────────

const APP_ROOT = join(__dirname, '..');
const REPO_ROOT = join(APP_ROOT, '..', '..');

const PAIRS: Array<{ slug: string; generated: string; handwritten: string }> = [
  {
    slug: 'phase-6-requirements-table',
    generated: join(
      APP_ROOT,
      'lib/langchain/schemas/generated/module-2/phase-6-requirements-table.schema.json',
    ),
    handwritten: join(
      APP_ROOT,
      '.planning/phases/14-artifact-publishing-json-excel-ppt-pdf/2-dev-sys-reqs-for-kb-llm-software/Requirements-table.schema.json',
    ),
  },
  {
    slug: 'phase-8-constants-table',
    generated: join(
      APP_ROOT,
      'lib/langchain/schemas/generated/module-2/phase-8-constants-table.schema.json',
    ),
    handwritten: join(
      APP_ROOT,
      '.planning/phases/14-artifact-publishing-json-excel-ppt-pdf/2-dev-sys-reqs-for-kb-llm-software/Requirement_Constants_Definition_Template.schema.json',
    ),
  },
];

const REPORT_PATH = join(REPO_ROOT, 'plans/m2-folder-2-schema-az-sweep/02-gate-b-diff-report.md');

// ──────────────────────────────────────────────────────────────────────────
// Diff logic
// ──────────────────────────────────────────────────────────────────────────

function safeReadJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch (e) {
    console.warn(`[verify-module-2-diff] failed to parse ${path}: ${(e as Error).message}`);
    return null;
  }
}

function envelopeOnlyProperties(gen: GeneratedSchema): string[] {
  const props = Object.keys(gen.properties ?? {});
  // The 6 reserved envelope fields + metadata are new-to-F14/2.
  return props.filter((p) => p.startsWith('_') || p === 'metadata');
}

function nonEnvelopeProperties(gen: GeneratedSchema): string[] {
  return Object.keys(gen.properties ?? {}).filter(
    (p) => !p.startsWith('_') && p !== 'metadata',
  );
}

function handwrittenMetadataFieldSet(hw: HandwrittenLayout): Set<string> {
  return new Set(Object.keys(hw.fields ?? {}));
}

function buildDiffSection(pair: (typeof PAIRS)[number], gen: GeneratedSchema | null, hw: HandwrittenLayout | null): string {
  const lines: string[] = [`## \`${pair.slug}\``];

  if (!gen) {
    lines.push(`⚠ Generated schema not found at \`${pair.generated}\` — run \`pnpm tsx lib/langchain/schemas/generate-all.ts\` first.`);
    return lines.join('\n');
  }
  if (!hw) {
    lines.push(`⚠ Handwritten F14/2 schema not found at \`${pair.handwritten}\` — skipping (no baseline to diff against).`);
    return lines.join('\n');
  }

  // 1. Envelope fields that are new-to-F14/2 (expected)
  const envFields = envelopeOnlyProperties(gen);
  lines.push('');
  lines.push('**Envelope fields new-to-F14/2 (expected — per plan §5 bullet 2):**');
  for (const f of envFields) lines.push(`- \`${f}\``);

  // 2. F14/2 metadata fields not covered by metadataHeaderSchema today
  const hwFields = handwrittenMetadataFieldSet(hw);
  const covered = new Set([
    'phase_number',
    'phase_slug',
    'phase_name',
    'schema_version',
    'project_id',
    'project_name',
    'author',
    'generated_at',
    'generator',
    'revision',
  ]);
  const uncovered = Array.from(hwFields).filter((f) => !covered.has(f));
  lines.push('');
  lines.push(`**F14/2 metadata fields (${hwFields.size}) vs metadataHeaderSchema coverage (10 fields):**`);
  lines.push(`- Overlap: project_name${hwFields.has('author') ? ', author' : ''}`);
  lines.push(`- F14/2 unique (${uncovered.length}): ${uncovered.map((f) => `\`${f}\``).join(', ') || '(none)'}`);
  lines.push('');
  lines.push(
    '**Path-swap implication:** Gate C must decide whether the above F14/2 fields should ' +
      '(a) be added to `metadataHeaderSchema` so generated emissions carry them, or ' +
      '(b) remain xlsx-layout-only and get injected by the Python marshaller at write time.',
  );

  // 3. Column-layout overlap (generated `_columns_plan` vs F14/2 dynamic_tables)
  const hwTables = hw.dynamic_tables ? Object.values(hw.dynamic_tables) : [];
  const totalHandwrittenColumns = hwTables.reduce((n, t) => n + (t.columns?.length ?? 0), 0);
  lines.push('');
  lines.push(`**Column layout overlap:**`);
  lines.push(`- F14/2 dynamic tables: ${hwTables.length}, total columns: ${totalHandwrittenColumns}`);
  lines.push(
    `- Generated schema promotes \`_columns_plan\` to first-class (C5). Each F14/2 column maps 1:1 onto a \`ColumnPlan\` row:`,
  );
  lines.push(
    `  - \`cell_col\` → \`column_letter\`, \`name\` → \`field_name\`, \`header\` → \`header_text\`, \`type\` → \`type_hint\`.`,
  );

  // 4. data-shape notes
  const dataProps = nonEnvelopeProperties(gen);
  lines.push('');
  lines.push(`**Generated data-shape top-level properties (${dataProps.length}):**`);
  for (const p of dataProps) lines.push(`- \`${p}\``);

  return lines.join('\n');
}

// ──────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────

function main(): void {
  const header = [
    '# Gate B Verification Step (flag C)',
    '',
    '**Generated at:** ' + new Date().toISOString(),
    '',
    '**Purpose:** Surface the structural gap between Zod-generated Module 2 JSON Schemas (data shape) ',
    'and F14/2 hand-written schemas (xlsx layout) BEFORE Gate C path-swap. These files serve different ',
    'roles and are expected to diverge; this report makes the divergence explicit so Gate C can decide ',
    'how to wire Python marshallers to the new canonical location.',
    '',
    '**Not a CI gate.** This script is a one-shot review tool. Run via:',
    '',
    '```bash',
    'cd apps/product-helper && pnpm tsx scripts/verify-module-2-diff.ts',
    '```',
    '',
    '---',
    '',
  ];

  const sections: string[] = [];
  for (const pair of PAIRS) {
    const gen = safeReadJson<GeneratedSchema>(pair.generated);
    const hw = safeReadJson<HandwrittenLayout>(pair.handwritten);
    sections.push(buildDiffSection(pair, gen, hw));
    sections.push('');
  }

  const body = [...header, ...sections].join('\n');
  mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, body, 'utf8');
  console.log(`✔ wrote ${REPORT_PATH}`);
  console.log(`  ${PAIRS.length} pair(s) analyzed`);
}

main();
