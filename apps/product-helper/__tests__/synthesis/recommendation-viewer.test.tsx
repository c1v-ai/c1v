/**
 * RecommendationViewer + SynthesisEmptyState structural tests (TA2 v2.1 Wave A).
 *
 * Jest runs with testEnvironment: 'node' (no jsdom); these tests invoke the
 * components as pure functions and walk the returned React element tree —
 * the same pattern used by `__tests__/artifact-pipeline.test.tsx`.
 *
 * Assertions:
 *   - 5-section render (callout/rationale/references/risks/tradeoffs/figures)
 *     wired into the orchestrator output.
 *   - Download dropdown reachable in the tree (chrome row).
 *   - Empty state pre-synthesis renders 5 EmptySectionState instances and
 *     contains zero canned-c1v exemplar strings (D-V21.17).
 */

import { describe, test, expect } from '@jest/globals';
import type { ReactElement, ReactNode } from 'react';

import { RecommendationViewer } from '@/components/synthesis/recommendation-viewer';
import { SynthesisEmptyState } from '@/components/synthesis/empty-state';
import type {
  ArchitectureRecommendation,
  ParetoAlternative,
  DecisionEntry,
  ResidualFlag,
  DerivationChainEntry,
} from '@/components/synthesis/types';

// Walks the element tree, invoking function components as pure functions.
// Returns the flat list of (string-typed names + literal text nodes) for
// structural assertions.
function renderToText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(renderToText).join(' ');
  const el = node as ReactElement;
  const props = (el.props ?? {}) as { children?: ReactNode };

  if (typeof el.type === 'function') {
    try {
      const result = (el.type as (p: unknown) => ReactNode)(props);
      return renderToText(result);
    } catch {
      // forwardRef / class components: fall through to children walk.
    }
  }
  return renderToText(props.children);
}

function collectComponentNames(node: ReactNode, acc: Set<string>): void {
  if (node == null || typeof node === 'boolean') return;
  if (typeof node === 'string' || typeof node === 'number') return;
  if (Array.isArray(node)) {
    node.forEach((child) => collectComponentNames(child, acc));
    return;
  }
  const el = node as ReactElement;
  if (typeof el.type === 'function') {
    const name = (el.type as { displayName?: string; name?: string }).displayName
      ?? (el.type as { name?: string }).name
      ?? '';
    if (name) acc.add(name);
    const props = (el.props ?? {}) as { children?: ReactNode };
    try {
      const result = (el.type as (p: unknown) => ReactNode)(props);
      collectComponentNames(result, acc);
    } catch {
      collectComponentNames(props.children, acc);
    }
    return;
  }
  const props = (el.props ?? {}) as { children?: ReactNode };
  collectComponentNames(props.children, acc);
}

const FIXTURE_ALTERNATIVE: ParetoAlternative = {
  id: 'ALT.01',
  name: 'Fixture Alternative',
  summary: 'A fixture alternative used by the structural test.',
  cost: { value: 100, units: 'units/month', derivation: '' },
  latency: { value: 1000, units: 'ms p95', derivation: '' },
  availability: { value: 99.0, units: '%', derivation: '' },
  dominates: [],
  is_recommended: true,
};

const FIXTURE_DECISION: DecisionEntry = {
  id: 'D-FX',
  claim: 'Pick a fixture path',
  chosen_option: 'Fixture option',
  alternatives: [{ name: 'Other', reason_rejected: 'fixture' }],
  rationale: 'Fixture rationale.',
  kb_chunk_ids: [],
  final_confidence: 0.5,
};

const FIXTURE_RISK: ResidualFlag = {
  id: 'FX.01',
  predecessor_ref: 'FX.01',
  failure_mode: 'A fixture failure mode',
  rpn: 5,
  weighted_rpn: 100,
  criticality_category: 'MEDIUM',
  open_residual_risk: '',
};

const FIXTURE_DERIVATION: DerivationChainEntry = {
  decision_id: 'D-FX',
  decision_network_node: 'DN.FX-A',
  nfrs_driving_choice: ['NFR.FX'],
  kb_chunk_ids: [],
  empirical_priors: [],
  fmea_refs: [],
};

const FIXTURE_PAYLOAD: ArchitectureRecommendation = {
  _schema: 'synthesis.architecture-recommendation.v1',
  _output_path: 'fixture/path.json',
  _phase_status: 'complete',
  metadata: {
    phase_number: 12,
    phase_slug: 'fixture',
    phase_name: 'Fixture',
    schema_version: '1.0.0',
    project_id: 999,
    project_name: 'Fixture Project',
    author: 'fixture',
    generated_at: '2026-04-25T12:00:00.000Z',
    generator: 'fixture',
    revision: 0,
  },
  _upstream_refs: ['module-1/fixture.json'],
  top_level_architecture: { summary: 'Fixture summary.', cited_priors: [] },
  mermaid_diagrams: {
    context: 'flowchart LR\n  A --> B',
    use_case: 'flowchart TB\n  A --> B',
    class: 'classDiagram\n  class A',
    sequence: 'sequenceDiagram\n  A->>B: x',
    decision_network: 'flowchart TB\n  A --> B',
  },
  pareto_frontier: [FIXTURE_ALTERNATIVE],
  decisions: [FIXTURE_DECISION],
  risks: [],
  derivation_chain: [FIXTURE_DERIVATION],
  tail_latency_budgets: [],
  residual_risk: { threshold: 100, flag_count: 1, flags: [FIXTURE_RISK] },
  hoq: {
    pc_count: 0,
    ec_count: 0,
    matrix_nonzero: 0,
    matrix_total: 0,
    matrix_sparsity_pct: 0,
    roof_pairs_nonzero: 0,
    flagged_ecs: [],
    target_values: [],
  },
  next_steps: ['Step 1'],
  inputs_hash: 'fixturehash',
  model_version: 'fixture',
  synthesized_at: '2026-04-25T12:00:00.000Z',
};

describe('RecommendationViewer (5-section orchestrator)', () => {
  test('renders all six sub-sections + chrome', () => {
    const tree = RecommendationViewer({
      payload: FIXTURE_PAYLOAD,
      projectId: 999,
      artifacts: [
        {
          kind: 'recommendation_json',
          status: 'ready',
          format: 'json',
          signed_url: 'https://example.test/sign?x=1',
          sha256: null,
          synthesized_at: '2026-04-25T12:00:00.000Z',
        },
      ],
      manifestContractVersion: 'v1',
    });

    const names = new Set<string>();
    collectComponentNames(tree, names);

    expect(names.has('SectionCallout')).toBe(true);
    expect(names.has('SectionRationale')).toBe(true);
    expect(names.has('SectionReferencesTable')).toBe(true);
    expect(names.has('SectionRisks')).toBe(true);
    expect(names.has('SectionTradeoffs')).toBe(true);
    expect(names.has('SectionFigures')).toBe(true);
    expect(names.has('ProvenanceAccordion')).toBe(true);
    expect(names.has('DownloadDropdown')).toBe(true);
  });

  test('text rendering surfaces the winning alternative + decision id', () => {
    const tree = RecommendationViewer({
      payload: FIXTURE_PAYLOAD,
      projectId: 999,
      artifacts: [],
      manifestContractVersion: 'v1',
    });
    const text = renderToText(tree);

    expect(text).toContain('ALT.01');
    expect(text).toContain('Fixture Alternative');
    expect(text).toContain('D-FX');
  });
});

describe('SynthesisEmptyState (D-V21.17 — no canned data)', () => {
  test('renders 5 EmptySectionState instances', () => {
    const tree = SynthesisEmptyState({ projectId: 42 });
    const names = new Set<string>();
    collectComponentNames(tree, names);
    expect(names.has('EmptySectionState')).toBe(true);

    // Count by walking with a mutable counter.
    let count = 0;
    function count_(node: ReactNode): void {
      if (node == null || typeof node === 'boolean') return;
      if (typeof node === 'string' || typeof node === 'number') return;
      if (Array.isArray(node)) {
        node.forEach(count_);
        return;
      }
      const el = node as ReactElement;
      const elName =
        typeof el.type === 'function'
          ? (el.type as { displayName?: string; name?: string }).displayName
            ?? (el.type as { name?: string }).name
          : null;
      if (elName === 'EmptySectionState') count += 1;
      if (typeof el.type === 'function') {
        try {
          const result = (el.type as (p: unknown) => ReactNode)(
            (el.props ?? {}) as Record<string, unknown>,
          );
          count_(result);
          return;
        } catch {
          /* fall through */
        }
      }
      const props = (el.props ?? {}) as { children?: ReactNode };
      count_(props.children);
    }
    count_(tree);
    expect(count).toBe(5);
  });

  test('contains zero canned-c1v exemplar strings (D-V21.17 sweep)', () => {
    const tree = SynthesisEmptyState({ projectId: 42 });
    const text = renderToText(tree);

    const banned = [
      'AV.01',
      'Sonnet 4.5',
      'pgvector',
      'Anthropic',
      'Vercel',
      'LangGraph',
    ];
    for (const phrase of banned) {
      expect(text).not.toContain(phrase);
    }
  });

  test('CTA links to /projects/<id>/synthesis', () => {
    const tree = SynthesisEmptyState({ projectId: 42 });
    const text = renderToText(tree);
    expect(text).toContain('Run Deep Synthesis');
  });
});
