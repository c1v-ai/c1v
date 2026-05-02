// env stubs MUST be the very first lines before any import.
// lib/config/env.ts validates shape at import time.
process.env.POSTGRES_URL ??= 'postgres://stub';
process.env.AUTH_SECRET ??= 'stub-auth-secret-at-least-32-chars-0000';
process.env.STRIPE_SECRET_KEY ??= 'sk_test_stub';
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_stub';
process.env.OPENROUTER_API_KEY ??= 'sk-or-stub';
process.env.BASE_URL ??= 'http://localhost:3000';

import { describe, it, expect } from '@jest/globals';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const NODES_DIR = resolve(__dirname, '../lib/langchain/graphs/nodes');

// Collect all .ts source files in the nodes directory (exclude test files).
function getNodeSourceFiles(): string[] {
  return readdirSync(NODES_DIR).filter(
    f => f.endsWith('.ts') && !f.includes('.test.') && !f.startsWith('__'),
  );
}

describe('Crawley gate isolation — no CRAWLEY_SCHEMAS in production nodes', () => {
  // Regression guard: no production graph node imports CRAWLEY_SCHEMAS.
  // Hypothesis B (INTK-02) was confirmed FALSE by research — this test
  // locks that finding and prevents future accidental wiring.
  it('no graph node file imports CRAWLEY_SCHEMAS', () => {
    const files = getNodeSourceFiles();
    expect(files.length).toBeGreaterThan(0); // sanity: nodes dir is not empty

    const violations: string[] = [];
    for (const file of files) {
      const content = readFileSync(join(NODES_DIR, file), 'utf-8');
      if (content.includes('CRAWLEY_SCHEMAS')) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  // Regression guard: no production graph node imports from schemas/index
  // at runtime. Crawley schema barrel is for verifiers/docs only — nodes
  // must not pull it in on the hot path.
  it('no graph node file imports from lib/langchain/schemas/index at runtime', () => {
    const files = getNodeSourceFiles();

    const violations: string[] = [];
    for (const file of files) {
      const content = readFileSync(join(NODES_DIR, file), 'utf-8');
      // Catch both @/ and relative import paths containing 'schemas/index'.
      if (content.includes('schemas/index')) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });
});
