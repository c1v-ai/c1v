#!/usr/bin/env tsx
/**
 * Fixture-based tests for verify-tree-pair-consistency.
 *
 * Self-contained: creates throwaway fixture trees in os.tmpdir(), invokes
 * verify() with overridden paths, asserts the expected exit code.
 *
 * Run: pnpm tsx scripts/__tests__/verify-tree-pair-consistency.test.ts
 *      (also wired into .github/workflows/verify-trees.yml)
 *
 * Exit: 0 if all cases pass, 1 if any fail.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { verify, parseModuleDir, extractUpstreamRefs } from '../verify-tree-pair-consistency';

interface Case {
  name: string;
  expected: 0 | 1 | 2 | 3 | 4 | 5;
  build: (root: string) => {
    schemaDir: string;
    kbDir: string;
    v2Root: string;
    generateAllPath: string;
    mcpDir: string;
  };
}

function scaffold(root: string, opts: {
  schemaModules?: string[];
  kbModules?: string[];
  v2Artifacts?: Record<string, unknown>;
  generateAllSrc?: string;
  mcpFiles?: Record<string, string>;
}): {
  schemaDir: string;
  kbDir: string;
  v2Root: string;
  generateAllPath: string;
  mcpDir: string;
} {
  const schemaDir = join(root, 'schemas');
  const kbDir = join(root, 'kb');
  const v2Root = join(root, 'system-design/kb-upgrade-v2');
  const mcpDir = join(root, 'mcp');
  mkdirSync(schemaDir, { recursive: true });
  mkdirSync(kbDir, { recursive: true });
  mkdirSync(v2Root, { recursive: true });
  mkdirSync(mcpDir, { recursive: true });

  for (const m of opts.schemaModules ?? []) mkdirSync(join(schemaDir, m), { recursive: true });
  for (const m of opts.kbModules ?? []) mkdirSync(join(kbDir, m), { recursive: true });

  for (const [relPath, body] of Object.entries(opts.v2Artifacts ?? {})) {
    const abs = join(v2Root, relPath);
    mkdirSync(join(abs, '..'), { recursive: true });
    writeFileSync(abs, JSON.stringify(body, null, 2));
  }

  const generateAllPath = join(schemaDir, 'generate-all.ts');
  writeFileSync(generateAllPath, opts.generateAllSrc ?? '// empty\n');

  for (const [name, body] of Object.entries(opts.mcpFiles ?? {})) {
    writeFileSync(join(mcpDir, name), body);
  }

  return { schemaDir, kbDir, v2Root, generateAllPath, mcpDir };
}

const cases: Case[] = [
  {
    name: 'EC=0 fully consistent (slugs match, refs resolve)',
    expected: 0,
    build: (root) =>
      scaffold(root, {
        schemaModules: ['module-2-requirements', 'module-5'],
        kbModules: ['2-requirements', '5-form-function'],
        v2Artifacts: {
          'module-2/x.json': {
            _upstream_refs: ['system-design/kb-upgrade-v2/module-2/x.json'],
          },
        },
        generateAllSrc: `import { X } from './module-2-requirements';\n`,
      }),
  },
  {
    name: 'EC=1 schema has module-3 but KB tree missing 3-*',
    expected: 1,
    build: (root) =>
      scaffold(root, {
        schemaModules: ['module-2-requirements', 'module-3-ffbd'],
        kbModules: ['2-requirements'],
      }),
  },
  {
    name: 'EC=2 slug mismatch between trees',
    expected: 2,
    build: (root) =>
      scaffold(root, {
        schemaModules: ['module-4-decision-net'],
        kbModules: ['4-decisions'],
      }),
  },
  {
    name: 'EC=2 not triggered when one side has bare numeric (module-2 vs 2-requirements)',
    expected: 0,
    build: (root) =>
      scaffold(root, {
        schemaModules: ['module-2'],
        kbModules: ['2-requirements'],
      }),
  },
  {
    name: 'EC=3 v2 artifact references nonexistent path',
    expected: 3,
    build: (root) =>
      scaffold(root, {
        schemaModules: ['module-2-requirements'],
        kbModules: ['2-requirements'],
        v2Artifacts: {
          'module-2/broken.json': {
            _upstream_refs: ['system-design/kb-upgrade-v2/module-99/ghost.json'],
          },
        },
      }),
  },
  {
    name: 'EC=3 detects broken ref in object-form _upstream_refs',
    expected: 3,
    build: (root) =>
      scaffold(root, {
        schemaModules: ['module-2-requirements'],
        kbModules: ['2-requirements'],
        v2Artifacts: {
          'module-2/obj.json': {
            _upstream_refs: { foo: 'system-design/kb-upgrade-v2/missing/file.json' },
          },
        },
      }),
  },
  {
    name: 'EC=4 generate-all.ts imports a module folder that does not exist',
    expected: 4,
    build: (root) =>
      scaffold(root, {
        schemaModules: ['module-2-requirements'],
        kbModules: ['2-requirements'],
        generateAllSrc: `import { X } from './module-99-ghost';\n`,
      }),
  },
  {
    name: 'EC=5 MCP file references nonexistent schema path',
    expected: 5,
    build: (root) =>
      scaffold(root, {
        schemaModules: ['module-2-requirements'],
        kbModules: ['2-requirements'],
        mcpFiles: {
          'tool.ts': `const path = 'apps/product-helper/lib/langchain/schemas/module-99-ghost/x.ts';\n`,
        },
      }),
  },
];

// Unit tests for helpers
function unitTests(): string[] {
  const failures: string[] = [];
  const eq = <T>(label: string, a: T, b: T): void => {
    if (JSON.stringify(a) !== JSON.stringify(b)) failures.push(`unit:${label} expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`);
  };

  eq('parseModuleDir module-5 (no slug, post-rename)', parseModuleDir('module-5', 'module-'), {
    n: 5, slug: null, dirname: 'module-5',
  });
  eq('parseModuleDir module-2 (no slug)', parseModuleDir('module-2', 'module-'), {
    n: 2, slug: null, dirname: 'module-2',
  });
  eq('parseModuleDir 5-form-function', parseModuleDir('5-form-function', ''), {
    n: 5, slug: 'form-function', dirname: '5-form-function',
  });
  eq('parseModuleDir invalid', parseModuleDir('not-a-module', 'module-'), null);

  eq('extractUpstreamRefs array', extractUpstreamRefs({ _upstream_refs: ['a', 'b'] }), ['a', 'b']);
  eq('extractUpstreamRefs object', extractUpstreamRefs({ _upstream_refs: { x: 'a', y: 'b' } }), ['a', 'b']);
  eq('extractUpstreamRefs missing', extractUpstreamRefs({}), []);
  eq('extractUpstreamRefs non-string entries', extractUpstreamRefs({ _upstream_refs: ['a', 7, null] }), ['a']);

  return failures;
}

function main(): void {
  const failures: string[] = [...unitTests()];
  let passed = failures.length === 0 ? cases.length : cases.length;

  for (const c of cases) {
    const root = mkdtempSync(join(tmpdir(), 'verify-tree-fixture-'));
    try {
      const opts = c.build(root);
      const { exitCode, errors } = verify(opts);
      if (exitCode !== c.expected) {
        failures.push(
          `case "${c.name}" expected exit ${c.expected} got ${exitCode}: ${errors.join('; ')}`,
        );
        passed--;
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  if (failures.length > 0) {
    console.error(`FAIL ${failures.length} test(s):`);
    for (const f of failures) console.error('  - ' + f);
    process.exit(1);
  }
  console.log(`PASS ${passed}/${cases.length} fixture cases + helper unit tests`);
}

main();
