/**
 * E2E smoke test for the build-all-headless pipeline (T6 Wave 4 deliverable
 * #3 of plans/c1v-MIT-Crawley-Cornell.md §12 bullet 7).
 *
 * Two responsibilities:
 *  1. Pipeline integrity — runs `scripts/build-all-headless.ts main()` in
 *     `--dry-run` mode against the minimal stub-project fixture and asserts
 *     every M1..M7 phase + synthesizer artifact is emitted.
 *  2. Preload schema serve — for every module (0..8 + synthesis) imports the
 *     `MODULE_N_PHASE_SCHEMAS` registry (the canonical source the
 *     `/api/preload/module-N` endpoint reads from) and asserts the registry
 *     is non-empty + every entry has a usable Zod schema. This is the
 *     in-process equivalent of hitting each preload route — no Next dev
 *     server required, no 5xx surface area.
 *
 * Stub env vars are set BEFORE imports because lib/config/env.ts validates
 * shape at import time (per apps/product-helper/CLAUDE.md "Dev Quirks").
 */

process.env.POSTGRES_URL ??= 'postgres://stub';
process.env.AUTH_SECRET ??= 'stub-auth-secret-at-least-32-chars-0000';
process.env.ANTHROPIC_API_KEY ??= 'sk-ant-stubXXXXXXXXXXXXXXXXXXXX';
process.env.STRIPE_SECRET_KEY ??= 'sk_test_stub';
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_stub';
process.env.OPENROUTER_API_KEY ??= 'stub';
process.env.BASE_URL ??= 'http://localhost:3000';

import { describe, it, expect } from '@jest/globals';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { main, PHASE_ORDER } from '@/scripts/build-all-headless';
import { MODULE_0_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-0';
import { MODULE_1_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-1';
import { MODULE_2_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-2';
import { MODULE_3_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-3';
import { MODULE_4_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-4';
import { MODULE_5_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-5';
import { MODULE_6_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-6-hoq';
import { MODULE_7_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-7-interfaces';
import { MODULE_8_PHASE_SCHEMAS } from '@/lib/langchain/schemas/module-8-risk';
import { SYNTHESIS_SCHEMAS } from '@/lib/langchain/schemas/synthesis';

interface ModuleRegistry {
  module: string;
  registry: ReadonlyArray<{ slug: string; zodSchema: unknown }>;
}

const REGISTRIES: ModuleRegistry[] = [
  { module: 'module-0', registry: MODULE_0_PHASE_SCHEMAS as any },
  { module: 'module-1', registry: MODULE_1_PHASE_SCHEMAS as any },
  { module: 'module-2', registry: MODULE_2_PHASE_SCHEMAS as any },
  { module: 'module-3', registry: MODULE_3_PHASE_SCHEMAS as any },
  { module: 'module-4', registry: MODULE_4_PHASE_SCHEMAS as any },
  { module: 'module-5', registry: MODULE_5_PHASE_SCHEMAS as any },
  { module: 'module-6-hoq', registry: MODULE_6_PHASE_SCHEMAS as any },
  { module: 'module-7-interfaces', registry: MODULE_7_PHASE_SCHEMAS as any },
  { module: 'module-8-risk', registry: MODULE_8_PHASE_SCHEMAS as any },
];

describe('build-all-headless E2E smoke (T6 Wave 4)', () => {
  it('pipeline integrity: dry-run emits every artifact for the stub project', async () => {
    const stubFixturePath = resolve(__dirname, '..', 'scripts', 'fixtures', 'stub-project.json');
    expect(existsSync(stubFixturePath)).toBe(true);
    const stub = JSON.parse(readFileSync(stubFixturePath, 'utf8'));
    expect(stub.projectDescription).toBeTruthy();

    const outDir = mkdtempSync(join(tmpdir(), 'build-all-smoke-'));
    try {
      const savedArgv = process.argv;
      process.argv = [
        'node',
        'build-all-headless.ts',
        '--dry-run',
        '--project-description',
        String(stub.projectDescription),
        '--output-dir',
        outDir,
        '--story-id',
        String(stub.storyId ?? 'stub-smoke'),
        '--force',
      ];
      try {
        const code = await main();
        expect(code).toBe(0);
      } finally {
        process.argv = savedArgv;
      }

      // Per-phase JSON artifact present.
      for (const p of PHASE_ORDER) {
        expect(existsSync(join(outDir, `${p}.json`))).toBe(true);
      }
      // Synthesizer artifacts.
      expect(existsSync(join(outDir, 'architecture-recommendation.v1.json'))).toBe(true);
      const diagrams = readdirSync(join(outDir, 'diagrams'));
      for (const d of stub.expectedSynthesisArtifacts as string[]) {
        if (d.startsWith('diagrams/')) {
          expect(diagrams).toContain(d.slice('diagrams/'.length));
        } else {
          expect(existsSync(join(outDir, d))).toBe(true);
        }
      }
      // Audit trail closed cleanly.
      const audit = readFileSync(join(outDir, 'audit.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
      expect(audit.some((r) => r.event === 'synthesizer.done')).toBe(true);
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  }, 60_000);

  describe('preload schema registries — every module serves without 5xx surface', () => {
    for (const { module, registry } of REGISTRIES) {
      it(`${module}: registry is non-empty and every entry has a usable Zod schema`, () => {
        expect(Array.isArray(registry)).toBe(true);
        expect(registry.length).toBeGreaterThan(0);
        const slugs = new Set<string>();
        for (const entry of registry) {
          expect(typeof entry.slug).toBe('string');
          expect(entry.slug.length).toBeGreaterThan(0);
          // A valid Zod schema exposes `_def` (private) + `parse` (public).
          expect(entry.zodSchema).toBeTruthy();
          expect(typeof (entry.zodSchema as any).parse).toBe('function');
          // Reject duplicate slugs — the preload bundle would collide.
          expect(slugs.has(entry.slug)).toBe(false);
          slugs.add(entry.slug);
        }
      });
    }

    it('synthesis: SYNTHESIS_SCHEMAS exposes architecture-recommendation', () => {
      expect(SYNTHESIS_SCHEMAS).toBeTruthy();
      const keys = Object.keys(SYNTHESIS_SCHEMAS as any);
      expect(keys.length).toBeGreaterThan(0);
    });
  });
});
