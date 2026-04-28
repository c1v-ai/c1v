/**
 * ArtifactPipeline structural test (T10 EC-15.6).
 *
 * Jest runs with testEnvironment: 'node' and the project does not depend on
 * @testing-library/react or jsdom (see jest.config.ts). Following the same
 * pattern as components/chat/__tests__/decision-question-card.test.tsx, this
 * suite invokes the component as a pure function and walks the returned
 * element tree structurally.
 *
 * Asserts:
 *  - When manifest has ok entries, a Generated Artifacts section renders
 *    with one download link per output.
 *  - When manifest is absent (runDir null, entries empty), no Artifacts
 *    section renders — graceful fallback to existing pipeline UI.
 *  - Download links point at the manifest download API route.
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import type { ReactElement } from 'react';

// Key-based SWR mock: keyed by URL prefix so repeat expansions return the
// same data deterministically (structural walker invokes components multiple
// times which would exhaust a queue-based mock).
const swrByKey: Record<string, { data: unknown }> = {};

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key: string) => {
    if (typeof key === 'string' && key.includes('/artifacts/manifest')) {
      return swrByKey.manifest ?? { data: undefined };
    }
    if (typeof key === 'string' && key.includes('/explorer')) {
      return swrByKey.explorer ?? { data: undefined };
    }
    return { data: undefined };
  }),
}));

jest.mock('@/components/project/project-chat-provider', () => ({
  useProjectChat: () => ({ isLoading: false }),
}));

// shadcn Card — stubbed to passthrough children.
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: unknown }) => ({ type: 'Card', props: { children } }),
  CardContent: ({ children }: { children: unknown }) => ({ type: 'CardContent', props: { children } }),
}));

// lucide-react icons — stubbed to minimal component functions.
jest.mock('lucide-react', () => {
  const stub = () => ({ type: 'Icon', props: {} });
  return new Proxy({} as Record<string, unknown>, { get: () => stub });
});

// next/link — stubbed.
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: unknown }) => ({
    type: 'Link',
    props: { href, children },
  }),
}));

// Walk a React element tree collecting nodes where predicate returns true.
// Recurses into function-component children by invoking type(props), since
// we don't have a renderer and the tree returned by ArtifactPipeline()
// contains nested PipelineGroup / ArtifactDownloads function elements.
function expand(node: unknown): unknown {
  if (!node || typeof node !== 'object') return node;
  const n = node as any;
  if (typeof n.type === 'function') {
    try {
      return n.type(n.props ?? {});
    } catch {
      return n;
    }
  }
  return n;
}

function collect(node: unknown, pred: (n: any) => boolean, out: any[] = []): any[] {
  const expanded = expand(node);
  if (!expanded || typeof expanded !== 'object') return out;
  const n = expanded as any;
  if (pred(n)) out.push(n);
  const kids = n.props?.children;
  if (Array.isArray(kids)) kids.forEach((k) => collect(k, pred, out));
  else if (kids) collect(kids, pred, out);
  return out;
}

function findText(node: unknown, text: string): boolean {
  if (typeof node === 'string') return node.includes(text);
  if (typeof node === 'number') return String(node).includes(text);
  const expanded = expand(node);
  if (!expanded || typeof expanded !== 'object') return false;
  const n = expanded as any;
  const kids = n.props?.children;
  if (Array.isArray(kids)) return kids.some((k) => findText(k, text));
  if (kids) return findText(kids, text);
  return false;
}

describe('ArtifactPipeline (T10 EC-15.6)', () => {
  beforeEach(() => {
    delete swrByKey.manifest;
    delete swrByKey.explorer;
  });

  test('renders Generated Artifacts section when manifest has ok entries', async () => {
    swrByKey.manifest = {
      data: {
        runDir: '/abs/run/dir',
        entries: [],
        latest: [
          {
            timestamp: '2026-04-24T12:00:00Z',
            generator: 'gen-ffbd',
            instance: 'ffbd_top_level.json',
            ok: true,
            outputs: [
              { target: 'pptx', path: '/abs/run/dir/ffbd.pptx', sha256: 'abc', bytes: 1234 },
              { target: 'mmd', path: '/abs/run/dir/ffbd.mmd', sha256: 'def', bytes: 567 },
            ],
          },
        ],
      },
    };
    swrByKey.explorer = { data: { hasData: {}, completeness: 0 } };

    const { ArtifactPipeline } = await import(
      '@/components/project/overview/artifact-pipeline'
    );
    const tree = (ArtifactPipeline as (p: { projectId: number }) => ReactElement)({
      projectId: 42,
    });

    // Heading "Generated Artifacts" must appear.
    expect(findText(tree, 'Generated Artifacts')).toBe(true);

    // Exactly two download anchors, one per output, pointing at the
    // download API with the expected path param.
    const anchors = collect(
      tree,
      (n) =>
        n.type === 'a' &&
        typeof n.props?.href === 'string' &&
        n.props.href.includes('/api/projects/42/artifacts/download')
    );
    expect(anchors).toHaveLength(2);
    expect(anchors[0].props.href).toContain(encodeURIComponent('/abs/run/dir/ffbd.pptx'));
    expect(anchors[1].props.href).toContain(encodeURIComponent('/abs/run/dir/ffbd.mmd'));
  });

  test('graceful fallback when manifest is absent', async () => {
    // No runDir → ArtifactDownloads returns null.
    swrByKey.manifest = { data: undefined };
    swrByKey.explorer = { data: { hasData: {}, completeness: 0 } };

    const { ArtifactPipeline } = await import(
      '@/components/project/overview/artifact-pipeline'
    );
    const tree = (ArtifactPipeline as (p: { projectId: number }) => ReactElement)({
      projectId: 7,
    });

    // No "Generated Artifacts" heading.
    expect(findText(tree, 'Generated Artifacts')).toBe(false);

    // Core pipeline headings still render (Product Requirements, Backend).
    expect(findText(tree, 'Product Requirements')).toBe(true);
    expect(findText(tree, 'Backend')).toBe(true);
  });

  test('hides download section when runDir present but no ok entries', async () => {
    swrByKey.manifest = {
      data: {
        runDir: '/abs/run/dir',
        entries: [],
        latest: [
          {
            timestamp: '2026-04-24T12:00:00Z',
            generator: 'gen-ffbd',
            instance: 'bad.json',
            ok: false,
            outputs: [],
          },
        ],
      },
    };
    swrByKey.explorer = { data: { hasData: {}, completeness: 0 } };

    const { ArtifactPipeline } = await import(
      '@/components/project/overview/artifact-pipeline'
    );
    const tree = (ArtifactPipeline as (p: { projectId: number }) => ReactElement)({
      projectId: 99,
    });

    expect(findText(tree, 'Generated Artifacts')).toBe(false);
  });
});
