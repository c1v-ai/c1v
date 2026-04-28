/**
 * One-off Wave-E γ-shape rewriter (kb-rewrite agent, EC-V21-E.9).
 *
 * Wraps each phase markdown file under
 * `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/<module>/01-phase-docs/*.md`
 * with the schema-first 6-section shape locked by master plan v2.1 line 474:
 *
 *   §1 Decision context
 *   §2 Predicates (engine.json reference)
 *   §3 Fallback rules
 *   §4 STOP-GAP rules (machine-readable)
 *   §5 Math derivation
 *   §6 References (KB chunk IDs)
 *
 * The rewriter PRESERVES the legacy educational body verbatim under a
 * "## Educational content (legacy, preserved)" footer — the 6 sections are a
 * structural overlay so the file is machine-parseable while the teaching layer
 * stays readable. Predicate / STOP-GAP / math / KB-chunks bodies POINT AT
 * external sources of truth (engine.json, fail-closed-audit.md, kb_chunks
 * table) rather than inlining DSL.
 *
 * Idempotent: detects existing frontmatter and skips already-rewritten files.
 *
 * Usage:
 *   pnpm tsx apps/product-helper/scripts/rewrite-kb-phase-files.ts <module-slug>
 *   pnpm tsx apps/product-helper/scripts/rewrite-kb-phase-files.ts --all
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const KB_ROOT = path.resolve(
  __dirname,
  '../.planning/phases/13-Knowledge-banks-deepened',
);

interface ModuleConfig {
  slug: string;
  moduleNumber: number;
  engineStory: string;
  artifactKeyPrefix: string;
  failClosedAuditAnchor: string;
}

const MODULES: ModuleConfig[] = [
  {
    slug: '1-defining-scope',
    moduleNumber: 1,
    engineStory: 'm1-defining-scope',
    artifactKeyPrefix: 'module_1',
    failClosedAuditAnchor: 'module-1-defining-scope',
  },
  {
    slug: '2-requirements',
    moduleNumber: 2,
    engineStory: 'm2-requirements',
    artifactKeyPrefix: 'module_2',
    failClosedAuditAnchor: 'module-2-requirements',
  },
  {
    slug: '3-ffbd',
    moduleNumber: 3,
    engineStory: 'm3-ffbd',
    artifactKeyPrefix: 'module_3',
    failClosedAuditAnchor: 'module-3-ffbd',
  },
  {
    slug: '4-decision-net-crawley-on-cornell',
    moduleNumber: 4,
    engineStory: 'm4-decision-network',
    artifactKeyPrefix: 'module_4',
    failClosedAuditAnchor: 'module-4-decision-net-crawley-on-cornell',
  },
  {
    slug: '5-form-function',
    moduleNumber: 5,
    engineStory: 'm5-form-function',
    artifactKeyPrefix: 'module_5',
    failClosedAuditAnchor: 'module-5-form-function',
  },
  {
    slug: '6-hoq',
    moduleNumber: 6,
    engineStory: 'm6-qfd',
    artifactKeyPrefix: 'module_6',
    failClosedAuditAnchor: 'module-6-hoq',
  },
  {
    slug: '7-interfaces',
    moduleNumber: 7,
    engineStory: 'm7-n2',
    artifactKeyPrefix: 'module_7',
    failClosedAuditAnchor: 'module-7-interfaces',
  },
  {
    slug: '8-risk',
    moduleNumber: 8,
    engineStory: 'm8-fmea-residual',
    artifactKeyPrefix: 'module_8',
    failClosedAuditAnchor: 'module-8-risk',
  },
  {
    slug: '9-stacks-atlas',
    moduleNumber: 9,
    engineStory: 'm9-stacks-atlas',
    artifactKeyPrefix: 'module_9',
    failClosedAuditAnchor: 'module-9-stacks-atlas',
  },
];

function phaseSlugFromFile(fileName: string): string {
  const base = fileName.replace(/\.md$/u, '');
  return base
    .replace(/^[0-9]+[-_]?/u, '')
    .replace(/[\s_]+/gu, '-')
    .replace(/--+/gu, '-')
    .replace(/^-|-$/gu, '')
    .toLowerCase();
}

function buildOverlay(
  module: ModuleConfig,
  fileName: string,
  legacyBody: string,
  legacyTitle: string | null,
): string {
  const phaseSlug = phaseSlugFromFile(fileName);
  const artifactKey = `${module.artifactKeyPrefix}/${phaseSlug}`;
  const enginePath = `apps/product-helper/.planning/engines/${module.engineStory}.json`;
  const auditPath = `plans/v22-outputs/te1/fail-closed-audit.md#${module.failClosedAuditAnchor}`;

  const frontmatter = `---
schema: phase-file.v1
phase_slug: ${phaseSlug}
module: ${module.moduleNumber}
artifact_key: ${artifactKey}
engine_story: ${module.engineStory}
engine_path: ${enginePath}
fail_closed_audit: ${auditPath}
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/${module.slug}/01-phase-docs/${fileName}
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
`;

  const titleLine = legacyTitle ? legacyTitle : `# ${phaseSlug}`;
  const overlay = `${titleLine}

## §1 Decision context

This phase contributes to **${module.engineStory}** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from \`${enginePath}\` against EvalContext.
3. On match → auto-fill (clamped to \`auto_fill_threshold\`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** \`${module.engineStory}\` (\`${enginePath}\`)
- **Predicate DSL evaluator:** \`apps/product-helper/lib/langchain/engines/predicate-dsl.ts\`
- **Story-tree schema:** \`apps/product-helper/lib/langchain/schemas/engines/story-tree.ts\`
- **Decisions consumed by this phase:** see \`decisions[]\` in the engine.json keyed on \`target_field\` containing \`${phaseSlug}\` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. \`searchKB\` retrieves top-3 chunks scoped to \`{module: ${module.moduleNumber}, phase: ${phaseSlug}}\` (post-G8/G9 ingest).
2. If \`searchKB\` confidence < 0.90 OR returns zero chunks → \`surfaceGap\` emits \`needs_user_input\` to \`system-question-bridge.ts\` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** \`${artifactKey}\`
- **registry:** \`apps/product-helper/lib/langchain/engines/fail-closed-runner.ts\` (\`buildFailClosedRegistry\`)
- **schema:** \`apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts\` (\`failClosedRuleSetSchema\`)
- **audit doc (rule sources + severity):** [${auditPath.split('#')[0]}](${auditPath.split('#')[0].replace('plans/', '../../../../../../plans/')}#${module.failClosedAuditAnchor})

The STOP-GAP / Validation-Checklist text in the legacy educational body below has been audited by \`engine-fail-closed\` and converted into machine-readable rules registered under the \`artifact_key\` above. The runner default-FAILs if the artifact_key is queried with no rule set registered (conservative).

> Default severity is \`error\` (proceed-blocking). Only items phrased "advisory" / "soft check" / "warning" / "will NOT fail" are downgraded to \`warn\`.

## §5 Math derivation

This phase's quantitative outputs (if any) carry \`mathDerivationSchema\` (or \`mathDerivationMatrixSchema\` for M5 sites per TC1 \`tc1-wave-c-complete\`). Each derivation:

- references inputs by \`source\` (upstream artifact + field path);
- carries \`formula\` (LaTeX-safe ASCII) + \`units\` + \`computed_value\`;
- attaches \`base_confidence\` + \`confidence_modifiers\` consumed by NFREngineInterpreter step 6.

> Per-decision math traces are emitted into \`decision_audit\` (\`0011b_decision_audit.sql\`) on every Scoring pass per EC-V21-E.3 (audit-writer agent).

## §6 References (KB chunk IDs)

- **Frontmatter \`kb_chunk_refs\`:** populated by the embedding pipeline (\`engine-pgvector\` agent, G8/G9 — \`apps/product-helper/lib/langchain/engines/kb-embedder.ts\`).
- **Runtime retrieval:** \`searchKB(query, top_k, { module: ${module.moduleNumber}, phase: '${phaseSlug}' })\` over the \`kb_chunks\` table (\`0011a_kb_chunks.sql\`, ivfflat lists=100; HNSW upgrade gated on \`>10k\` rows).
- **Provenance:** every retrieved chunk carries \`{kb_source, chunk_hash, content, embedding_distance}\`; rendered by \`why-this-value-panel.tsx\` (\`provenance-ui\` agent).

> The \`kb_chunk_refs\` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

${legacyBody}
`;

  return frontmatter + overlay;
}

function rewriteFile(filePath: string, module: ModuleConfig): 'rewritten' | 'skipped-already' | 'skipped-empty' {
  const raw = fs.readFileSync(filePath, 'utf8');
  if (raw.startsWith('---\n') && raw.includes('schema: phase-file.v1')) {
    return 'skipped-already';
  }
  if (raw.trim().length === 0) {
    return 'skipped-empty';
  }
  const fileName = path.basename(filePath);

  const titleMatch = raw.match(/^#\s+.+$/mu);
  let legacyTitle: string | null = null;
  let legacyBody = raw;
  if (titleMatch && raw.startsWith(titleMatch[0])) {
    legacyTitle = titleMatch[0];
    legacyBody = raw.slice(titleMatch[0].length).replace(/^\n+/u, '');
  }

  const rewritten = buildOverlay(module, fileName, legacyBody, legacyTitle);
  fs.writeFileSync(filePath, rewritten, 'utf8');
  return 'rewritten';
}

function rewriteModule(moduleSlug: string): { module: string; rewritten: number; skippedAlready: number; skippedEmpty: number; total: number } {
  const module = MODULES.find((m) => m.slug === moduleSlug);
  if (!module) {
    throw new Error(`Unknown module slug: ${moduleSlug}. Known: ${MODULES.map((m) => m.slug).join(', ')}`);
  }
  const phaseDocsDir = path.join(KB_ROOT, module.slug, '01-phase-docs');
  if (!fs.existsSync(phaseDocsDir)) {
    return { module: moduleSlug, rewritten: 0, skippedAlready: 0, skippedEmpty: 0, total: 0 };
  }
  const files = fs
    .readdirSync(phaseDocsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(phaseDocsDir, f));

  let rewritten = 0;
  let skippedAlready = 0;
  let skippedEmpty = 0;
  for (const file of files) {
    const result = rewriteFile(file, module);
    if (result === 'rewritten') rewritten++;
    else if (result === 'skipped-already') skippedAlready++;
    else skippedEmpty++;
  }
  return { module: moduleSlug, rewritten, skippedAlready, skippedEmpty, total: files.length };
}

function main(): void {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: pnpm tsx scripts/rewrite-kb-phase-files.ts <module-slug>|--all');
    console.error(`Modules: ${MODULES.map((m) => m.slug).join(', ')}`);
    process.exit(1);
  }
  const targets = arg === '--all' ? MODULES.map((m) => m.slug) : [arg];
  for (const slug of targets) {
    const result = rewriteModule(slug);
    console.log(
      `[${result.module}] total=${result.total} rewritten=${result.rewritten} skipped-already=${result.skippedAlready} skipped-empty=${result.skippedEmpty}`,
    );
  }
}

main();
