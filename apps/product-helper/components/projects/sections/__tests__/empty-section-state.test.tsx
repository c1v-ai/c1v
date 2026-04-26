/**
 * EmptySectionState structural + contract tests.
 *
 * Jest runs `testEnvironment: 'node'` (see jest.config.ts), so this suite
 * invokes the component as a pure function and walks the React element
 * tree structurally to verify the EC-V21-A.16 contract:
 *
 *   - Headline format: "<sectionName> not generated yet".
 *   - Methodology copy renders verbatim (1-line generic copy from caller).
 *   - CTA defaults to label "Run Deep Synthesis" + href `/projects/<id>/synthesis`.
 *   - Custom `ctaLabel` / `ctaHref` overrides honor caller intent.
 *   - D-V21.17 hard-fail: the rendered tree contains zero canned-c1v
 *     exemplar strings (regex sweep for "AV.01" / "Sonnet 4.5" / "pgvector" /
 *     "Vercel" / "Anthropic" / "Sonnet" / "LangGraph" / "Cloud Run").
 */

import { describe, it, expect } from '@jest/globals';
import type { ReactElement } from 'react';

import { EmptySectionState } from '../empty-section-state';

// ---------------------------------------------------------------------------
// Tree-walk helpers — collect text + props from a React element tree.
// ---------------------------------------------------------------------------

function isElement(node: unknown): node is ReactElement {
  return typeof node === 'object' && node !== null && 'props' in node;
}

function collectStrings(node: unknown, acc: string[]): void {
  if (node == null || typeof node === 'boolean') return;
  if (typeof node === 'string' || typeof node === 'number') {
    acc.push(String(node));
    return;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectStrings(child, acc);
    return;
  }
  if (isElement(node)) {
    const props = (node.props ?? {}) as Record<string, unknown>;
    if ('children' in props) collectStrings(props.children, acc);
  }
}

function findFirstByPredicate(
  node: unknown,
  predicate: (el: ReactElement) => boolean,
): ReactElement | null {
  if (!isElement(node)) {
    if (Array.isArray(node)) {
      for (const child of node) {
        const found = findFirstByPredicate(child, predicate);
        if (found) return found;
      }
    }
    return null;
  }
  if (predicate(node)) return node;
  const props = (node.props ?? {}) as Record<string, unknown>;
  if ('children' in props) {
    return findFirstByPredicate(props.children, predicate);
  }
  return null;
}

function renderToTree(props: Parameters<typeof EmptySectionState>[0]) {
  return EmptySectionState(props) as ReactElement;
}

// Canned-c1v exemplar strings the verifier (and this test) sweep for.
// Per D-V21.17 + EC-V21-A.16, none of these may leak into the empty state.
const CANNED_C1V_FORBIDDEN = [
  'AV.01',
  'AV.02',
  'AV.03',
  'Sonnet 4.5',
  'pgvector',
  'Vercel',
  'Anthropic',
  'LangGraph',
  'Cloud Run',
  'Supabase',
];

// ---------------------------------------------------------------------------

describe('EmptySectionState — EC-V21-A.16 contract', () => {
  it('renders the locked headline format "<sectionName> not generated yet"', () => {
    const tree = renderToTree({
      sectionName: 'Decision Matrix',
      methodologyCopy: 'Generic methodology copy for the section.',
      projectId: 42,
    });
    const text = [] as string[];
    collectStrings(tree, text);
    // JSX text-node concatenation can introduce whitespace between
    // the interpolated `sectionName` and the trailing literal — match
    // with whitespace tolerance.
    const joined = text.join(' ');
    expect(joined).toMatch(/Decision Matrix\s+not generated yet/);
  });

  it('renders the caller-provided generic methodology copy verbatim', () => {
    const copy =
      'Run Deep Synthesis to map customer needs to engineering characteristics with weighted correlations.';
    const tree = renderToTree({
      sectionName: 'House of Quality',
      methodologyCopy: copy,
      projectId: 7,
    });
    const text = [] as string[];
    collectStrings(tree, text);
    expect(text.join(' ')).toContain(copy);
  });

  it('CTA defaults: label "Run Deep Synthesis" + href "/projects/<id>/synthesis"', () => {
    const tree = renderToTree({
      sectionName: 'FMEA',
      methodologyCopy: 'Generic copy.',
      projectId: 99,
    });
    const text = [] as string[];
    collectStrings(tree, text);
    expect(text.join(' ')).toContain('Run Deep Synthesis');

    // Locate the underlying <Link> by its `href` prop.
    const link = findFirstByPredicate(tree, (el) => {
      const props = (el.props ?? {}) as Record<string, unknown>;
      return typeof props.href === 'string';
    });
    expect(link).not.toBeNull();
    const linkProps = (link!.props ?? {}) as Record<string, unknown>;
    expect(linkProps.href).toBe('/projects/99/synthesis');
  });

  it('honors custom ctaLabel + ctaHref overrides', () => {
    const tree = renderToTree({
      sectionName: 'Problem Statement',
      methodologyCopy: 'Generic copy.',
      projectId: 5,
      ctaLabel: 'Start Chat',
      ctaHref: '/projects/5/chat',
    });
    const text = [] as string[];
    collectStrings(tree, text);
    expect(text.join(' ')).toContain('Start Chat');

    const link = findFirstByPredicate(tree, (el) => {
      const props = (el.props ?? {}) as Record<string, unknown>;
      return typeof props.href === 'string';
    });
    const linkProps = (link!.props ?? {}) as Record<string, unknown>;
    expect(linkProps.href).toBe('/projects/5/chat');
  });

  it('D-V21.17 hard-fail: zero canned-c1v exemplar strings leak in default render', () => {
    const tree = renderToTree({
      sectionName: 'Architecture & Database',
      methodologyCopy:
        'Run Deep Synthesis to render an interactive architecture diagram alongside the approved schema and DBML export.',
      projectId: 1,
    });
    const text = [] as string[];
    collectStrings(tree, text);
    const joined = text.join(' ');
    for (const forbidden of CANNED_C1V_FORBIDDEN) {
      expect(joined).not.toContain(forbidden);
    }
  });
});
