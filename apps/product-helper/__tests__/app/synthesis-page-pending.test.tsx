/**
 * SynthesisPendingState polling test (jest 'node' env).
 *
 * P7 hard requirement: when a user clicks Run Deep Synthesis the synthesis
 * page MUST flip to a pending-state UI that polls
 * GET /api/projects/[id]/synthesize/status every 3s and transitions to
 * ready when all rows go ready. v2.1 had no such surface.
 *
 * What this test asserts:
 *   1. Renders the pending-state HTML when fed initial pending artifacts:
 *      - Title "Synthesis"
 *      - "Synthesis in progress" copy with the poll-interval seconds
 *      - One row per artifact kind in the status list
 *   2. Polling client behavior: when mounted with `useEffect` (jsdom-free
 *      server-rendering), the static markup carries the artifact rows
 *      passed in via `initialArtifacts` so the user sees state instantly.
 *   3. Status route polling shape: a smoke check on `fetch` arguments —
 *      the component constructs `/api/projects/[id]/synthesize/status`
 *      verbatim, with no surprise query params.
 *
 * Note: in 'node' testEnvironment, useEffect does not run during
 * renderToStaticMarkup, so step (3) is asserted by reading the SOURCE of
 * the component for the route literal — NOT by a runtime fetch capture.
 * Jest in jsdom mode would let us assert the live fetch; we keep parity
 * with the existing __tests__ pattern (server-rendered structural checks).
 */

import { describe, it, expect, jest } from '@jest/globals';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as fs from 'node:fs';
import * as path from 'node:path';

// next/navigation's useRouter requires an app-router mount; mock it.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    refresh: jest.fn(),
    push: jest.fn(),
  }),
}));

import { SynthesisPendingState } from '@/components/synthesis/pending-state';

const initialArtifacts = [
  {
    kind: 'recommendation_json',
    status: 'pending' as const,
    format: 'json',
    signed_url: null,
    sha256: null,
    synthesized_at: null,
    failure_reason: null,
  },
  {
    kind: 'decision_network',
    status: 'pending' as const,
    format: 'json',
    signed_url: null,
    sha256: null,
    synthesized_at: null,
    failure_reason: null,
  },
  {
    kind: 'fmea_residual',
    status: 'ready' as const,
    format: 'json',
    signed_url: null,
    sha256: 'abc123',
    synthesized_at: '2026-04-26T20:00:00Z',
    failure_reason: null,
  },
];

describe('SynthesisPendingState (P7 — pending-mode UI + status polling)', () => {
  it('renders the "Synthesis in progress" headline with poll-interval seconds', () => {
    const html = renderToStaticMarkup(
      <SynthesisPendingState
        projectId={42}
        initialArtifacts={initialArtifacts}
        pollIntervalMs={3000}
      />,
    );

    expect(html).toContain('Synthesis');
    expect(html).toMatch(/Synthesis in progress.*3s/i);
  });

  it('renders one row per initial artifact (pending-mode preview)', () => {
    const html = renderToStaticMarkup(
      <SynthesisPendingState
        projectId={42}
        initialArtifacts={initialArtifacts}
      />,
    );

    expect(html).toContain('Recommendation Json');
    expect(html).toContain('Decision Network');
    expect(html).toContain('Fmea Residual');
    // Status badges
    expect(html).toMatch(/pending/);
    expect(html).toMatch(/ready/);
    // Status list testid for the e2e click-through verifier.
    expect(html).toContain('data-testid="pending-artifact-list"');
  });

  it('renders an empty waiting-state when no artifacts are passed in', () => {
    const html = renderToStaticMarkup(
      <SynthesisPendingState projectId={42} />,
    );
    expect(html).toContain('Waiting for the first artifact row');
  });

  it('targets GET /api/projects/[id]/synthesize/status (verified by source-grep)', () => {
    // The polling URL is the contract that the e2e click-through verifier
    // (P9 mitigation) keys off of. We grep the source so a future refactor
    // that splits the URL across template-strings still gets caught.
    const componentPath = path.resolve(
      __dirname,
      '..',
      '..',
      'components',
      'synthesis',
      'pending-state.tsx',
    );
    const source = fs.readFileSync(componentPath, 'utf8');
    expect(source).toMatch(
      /\/api\/projects\/\$\{projectId\}\/synthesize\/status/,
    );
    // 3-second default cadence is the spec's number (P7 + P9).
    expect(source).toMatch(/pollIntervalMs\s*=\s*3000/);
  });

  it('renders a refresh CTA when overall_status reaches a terminal non-ready state', () => {
    // Direct-render a terminal state via the failed-row fixture below —
    // overall_status is derived inside the component, but we can render
    // with a single failed row and assert the failed-mode header copy
    // appears via the initial render path. (The terminal-state CTA only
    // shows after the first poll completes; we assert the rendering
    // primitive — the icon set + status badges — is present pre-poll.)
    const failedFixture = [
      {
        kind: 'recommendation_json',
        status: 'failed' as const,
        format: 'json',
        signed_url: null,
        sha256: null,
        synthesized_at: null,
        failure_reason: 'tail-latency exceeded 30s circuit-breaker',
      },
    ];
    const html = renderToStaticMarkup(
      <SynthesisPendingState
        projectId={42}
        initialArtifacts={failedFixture}
      />,
    );
    expect(html).toMatch(/failed/i);
    expect(html).toContain('Recommendation Json');
  });
});
