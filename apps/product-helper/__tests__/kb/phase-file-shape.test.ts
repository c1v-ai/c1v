/**
 * Wave-E γ-shape conformance test (kb-rewrite agent, EC-V21-E.9).
 *
 * Asserts every phase markdown file under
 * .planning/phases/13-Knowledge-banks-deepened/<module>/01-phase-docs/*.md
 * matches the schema-first 6-section shape locked by master plan v2.1
 * line 474:
 *
 *   sec1 Decision context
 *   sec2 Predicates (engine.json reference)
 *   sec3 Fallback rules
 *   sec4 STOP-GAP rules (machine-readable)
 *   sec5 Math derivation
 *   sec6 References (KB chunk IDs)
 *
 * Plus YAML frontmatter with the machine-readable fields the engine consumes:
 *   schema, phase_slug, module, artifact_key, engine_story, engine_path,
 *   fail_closed_audit, fail_closed_registry, kb_chunk_refs, legacy_snapshot,
 *   rewritten_at, rewritten_by.
 *
 * Snapshot files under `_legacy_2026-04-26/` are EXCLUDED from this gate —
 * they are rollback anchors and intentionally remain in pre-Wave-E shape.
 *
 * Predicate / STOP-GAP / KB-chunk content is NOT inlined in the markdown.
 * Section bodies POINT AT the engine.json (predicates), the fail-closed-audit
 * doc + runner registry (STOP-GAP), and the kb_chunks table (KB chunks).
 * This test enforces presence of the section headers + frontmatter, NOT
 * semantic predicate validation. Predicate-DSL semantic checks live in
 * engine-stories' golden-rules tests.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const KB_ROOT = path.resolve(
  __dirname,
  '../../.planning/phases/13-Knowledge-banks-deepened',
);

const REQUIRED_FRONTMATTER_KEYS = [
  'schema',
  'phase_slug',
  'module',
  'artifact_key',
  'engine_story',
  'engine_path',
  'fail_closed_audit',
  'fail_closed_registry',
  'kb_chunk_refs',
  'legacy_snapshot',
  'rewritten_at',
  'rewritten_by',
];

const REQUIRED_SECTION_HEADERS = [
  'Decision context',
  'Predicates (engine.json reference)',
  'Fallback rules',
  'STOP-GAP rules (machine-readable)',
  'Math derivation',
  'References (KB chunk IDs)',
];

const MODULE_DIRS = [
  '1-defining-scope',
  '2-requirements',
  '3-ffbd',
  '5-form-function',
  '6-hoq',
  '7-interfaces',
  '8-risk',
  '9-stacks-atlas',
];

interface PhaseFile {
  module: string;
  fileName: string;
  absPath: string;
}

function collectPhaseFiles(): PhaseFile[] {
  const files: PhaseFile[] = [];
  for (const moduleSlug of MODULE_DIRS) {
    const dir = path.join(KB_ROOT, moduleSlug, '01-phase-docs');
    if (!fs.existsSync(dir)) continue;
    for (const fileName of fs.readdirSync(dir)) {
      if (!fileName.endsWith('.md')) continue;
      files.push({
        module: moduleSlug,
        fileName,
        absPath: path.join(dir, fileName),
      });
    }
  }
  return files;
}

function parseFrontmatter(raw: string): Record<string, string> | null {
  if (!raw.startsWith('---\n')) return null;
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const block = raw.slice(4, end);
  const out: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const m = /^([a-z_]+):\s*(.*)$/u.exec(line);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

describe('Wave-E γ-shape: every phase file matches schema-first 6-section shape', () => {
  const files = collectPhaseFiles();

  it('finds 80 phase files across the 8 modules with phase docs', () => {
    expect(files.length).toBe(80);
  });

  describe.each(files)(
    '$module/01-phase-docs/$fileName',
    ({ absPath }) => {
      const raw = fs.readFileSync(absPath, 'utf8');
      const fm = parseFrontmatter(raw);

      it('has YAML frontmatter', () => {
        expect(fm).not.toBeNull();
      });

      it.each(REQUIRED_FRONTMATTER_KEYS)(
        'frontmatter contains key "%s"',
        (key) => {
          expect(fm).not.toBeNull();
          expect(fm).toHaveProperty(key);
        },
      );

      it('frontmatter schema is "phase-file.v1"', () => {
        expect(fm?.schema).toBe('phase-file.v1');
      });

      it.each(REQUIRED_SECTION_HEADERS)(
        'contains a markdown heading mentioning "%s"',
        (substring) => {
          const headingLines = raw
            .split('\n')
            .filter((l) => l.startsWith('## '));
          const matches = headingLines.some((l) => l.includes(substring));
          expect(matches).toBe(true);
        },
      );

      it('STOP-GAP body references the fail-closed-runner registry', () => {
        expect(raw).toContain('fail-closed-runner.ts');
      });

      it('Predicates body references an engine.json story path', () => {
        expect(raw).toContain('.planning/engines/');
      });

      it('preserves the legacy educational body under footer', () => {
        expect(raw).toContain('Educational content (legacy, preserved)');
      });
    },
  );
});
