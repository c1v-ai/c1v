/**
 * Methodology page render test (jest 'node' env).
 *
 * EC-V21-C.5: /about/methodology renders the canonical
 * METHODOLOGY-CORRECTION.md content + the three-pass overview Mermaid block,
 * and the about-nav exposes the entry.
 *
 * Pattern parity with __tests__/app/synthesis-page-pending.test.tsx —
 * server-rendered structural checks via renderToStaticMarkup.
 */

import { describe, it, expect, jest } from '@jest/globals';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as fs from 'node:fs';
import * as path from 'node:path';

// react-markdown is ESM-only; jest cannot transform it. Stub it to a thin
// passthrough that emits its `content` so structural assertions still hold.
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children?: string }) =>
    React.createElement('div', { 'data-testid': 'markdown' }, children ?? ''),
}));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => () => undefined }));

import { MethodologyRenderer } from '@/components/about/methodology-renderer';
import { aboutNavEntries } from '@/components/about/about-nav';

const CANONICAL_REL = 'system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md';

function loadCanonical(): string {
  const repoRoot = path.resolve(__dirname, '..', '..', '..', '..', '..');
  return fs.readFileSync(path.join(repoRoot, CANONICAL_REL), 'utf8');
}

describe('about/methodology', () => {
  it('canonical METHODOLOGY-CORRECTION.md is readable from disk', () => {
    const source = loadCanonical();
    expect(source).toMatch(/Pragmatic Three-Pass SE Ordering/);
    expect(source).toMatch(/PASS 1 — Functional understanding/);
    expect(source).toMatch(/PASS 2 — Requirements synthesis/);
    expect(source).toMatch(/PASS 3 — Decision/);
  });

  it('renderer renders the three-pass overview + canonical body', () => {
    const source = loadCanonical();
    const html = renderToStaticMarkup(
      React.createElement(MethodologyRenderer, { source }),
    );

    expect(html).toContain('Three-pass overview');
    expect(html).toMatch(/Pragmatic Three-Pass SE Ordering/);
    expect(html).toMatch(/Pass 1 — Functional Understanding/);
    expect(html).toMatch(/instrumental/);
  });

  it('about-nav exposes the methodology entry', () => {
    const entry = aboutNavEntries.find((e) => e.href === '/about/methodology');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('Methodology');
  });

  it('page module reads the canonical relative path', () => {
    const pageSrc = fs.readFileSync(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'app',
        '(dashboard)',
        'about',
        'methodology',
        'page.tsx',
      ),
      'utf8',
    );
    expect(pageSrc).toContain(CANONICAL_REL);
  });
});
