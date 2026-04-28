/**
 * DecisionQuestionCard structural test.
 *
 * Jest runs in a `testEnvironment: 'node'` config (see jest.config.ts), and
 * the project does not depend on @testing-library/react / jsdom. Rather
 * than introduce those deps for a single component test, this suite
 * invokes the component as a pure function (React components ARE
 * functions) and walks the returned element tree structurally to verify
 * the public contract:
 *
 *   - Three option buttons render, each surfacing value + units + rationale
 *     + confidence, in the declared order.
 *   - Clicking an option fires `onSelect` with the matching /option N
 *     command string.
 *   - The `enabled={false}` prop disables every option button.
 *   - The "Why this value?" toggle is present and references the math
 *     trace.
 *   - Empty `computedOptions` renders the no-options fallback.
 *
 * This verifies the component's behaviour without pulling in a full DOM
 * environment. When we later adopt a DOM test runner for other component
 * work we can supersede this with interaction tests.
 */

import { describe, it, expect, jest } from '@jest/globals';
import * as React from 'react';

import { DecisionQuestionCard } from '../decision-question-card';
import type { GapMarkerPayload } from '@/lib/langchain/engines/surface-gap';

// ──────────────────────────────────────────────────────────────────────────
// Element-tree helpers — traverse the React element returned by calling a
// component as a function, looking for nodes matching a predicate.
// ──────────────────────────────────────────────────────────────────────────

type AnyElement = React.ReactElement<Record<string, unknown>>;

function isElement(n: unknown): n is AnyElement {
  return !!n && typeof n === 'object' && 'props' in (n as object);
}

function* walk(node: React.ReactNode): Generator<AnyElement> {
  if (Array.isArray(node)) {
    for (const c of node) yield* walk(c);
    return;
  }
  if (!isElement(node)) return;
  yield node;
  yield* walk(node.props.children as React.ReactNode);
}

function find(
  root: React.ReactNode,
  predicate: (el: AnyElement) => boolean,
): AnyElement[] {
  return Array.from(walk(root)).filter(predicate);
}

function collectText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (isElement(node)) return collectText(node.props.children as React.ReactNode);
  return '';
}

// ──────────────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────────────

const PAYLOAD: GapMarkerPayload = {
  decisionId: 'D_RESPONSE_BUDGET_MS',
  targetField: 'RESPONSE_BUDGET_MS',
  question: 'What response-latency budget should we use?',
  computedOptions: [
    { value: 500, units: 'ms', confidence: 0.94, rationale: 'PCI consumer sync' },
    { value: 800, units: 'ms', confidence: 0.72, rationale: 'default latency tier' },
    { value: 1500, units: 'ms', confidence: 0.51, rationale: 'batch background job' },
  ],
  mathTrace:
    'rule: consumer-app-user-facing-sync-pci; base 0.94; final 0.84 < 0.90',
};

function renderCard(props: Parameters<typeof DecisionQuestionCard>[0]) {
  // Call the component as a function so we can introspect the element tree
  // without a DOM. React function components are pure with respect to
  // props for first render (hooks return initial state).
  return DecisionQuestionCard(props) as AnyElement;
}

function getOptionButtons(root: AnyElement): AnyElement[] {
  return find(
    root,
    (el) =>
      el.type === 'button' &&
      typeof (el.props['aria-label'] as string | undefined) === 'string' &&
      String(el.props['aria-label']).startsWith('Select option'),
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────

describe('DecisionQuestionCard — structure', () => {
  it('renders exactly 3 option buttons for the fixture payload', () => {
    const tree = renderCard({ payload: PAYLOAD });
    expect(getOptionButtons(tree)).toHaveLength(3);
  });

  it('each option button surfaces value + units + rationale + confidence in order', () => {
    const tree = renderCard({ payload: PAYLOAD });
    const buttons = getOptionButtons(tree);
    PAYLOAD.computedOptions.forEach((opt, i) => {
      const text = collectText(buttons[i]);
      expect(text).toContain(String(opt.value));
      expect(text).toContain(opt.units as string);
      expect(text).toContain(opt.rationale);
      expect(text).toContain(opt.confidence.toFixed(2));
      expect(buttons[i]!.props['aria-label']).toBe(
        `Select option ${i + 1}: ${opt.value} ${opt.units}`,
      );
    });
  });

  it('exposes the decisionId via a data attribute on the root element', () => {
    const tree = renderCard({ payload: PAYLOAD });
    expect(tree.props['data-decision-id']).toBe('D_RESPONSE_BUDGET_MS');
    expect(tree.props['data-testid']).toBe('decision-question-card');
  });

  it('"Why this value?" toggle exists via native <details>/<summary>', () => {
    const tree = renderCard({ payload: PAYLOAD });
    const detailsEls = find(tree, (el) => el.type === 'details');
    expect(detailsEls).toHaveLength(1);
    expect(detailsEls[0]!.props['aria-controls']).toBe(
      `math-trace-${PAYLOAD.decisionId}`,
    );
    const summaries = find(tree, (el) => el.type === 'summary');
    expect(summaries).toHaveLength(1);
    expect(
      collectText(summaries[0]!.props.children as React.ReactNode),
    ).toContain('Why this value?');
  });

  it('math-trace region contains the engine trace verbatim', () => {
    const tree = renderCard({ payload: PAYLOAD });
    const preEls = find(
      tree,
      (el) =>
        el.type === 'pre' &&
        el.props['data-testid'] === 'math-trace',
    );
    expect(preEls).toHaveLength(1);
    expect(
      collectText(preEls[0]!.props.children as React.ReactNode),
    ).toBe(PAYLOAD.mathTrace);
    expect(preEls[0]!.props.id).toBe(`math-trace-${PAYLOAD.decisionId}`);
  });
});

describe('DecisionQuestionCard — interaction', () => {
  it('onSelect fires with /option N when an option button is clicked', () => {
    const onSelect = jest.fn();
    const tree = renderCard({ payload: PAYLOAD, onSelect });
    const buttons = getOptionButtons(tree);

    (buttons[0]!.props.onClick as () => void)();
    (buttons[2]!.props.onClick as () => void)();

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenNthCalledWith(1, '/option 1');
    expect(onSelect).toHaveBeenNthCalledWith(2, '/option 3');
  });

  it('disables every option button when enabled=false', () => {
    const tree = renderCard({ payload: PAYLOAD, enabled: false });
    const buttons = getOptionButtons(tree);
    expect(buttons).toHaveLength(3);
    for (const b of buttons) {
      expect(b.props.disabled).toBe(true);
    }
  });

  it('option buttons are enabled by default', () => {
    const tree = renderCard({ payload: PAYLOAD });
    const buttons = getOptionButtons(tree);
    for (const b of buttons) {
      expect(b.props.disabled).toBe(false);
    }
  });
});

describe('DecisionQuestionCard — empty-options fallback', () => {
  it('renders the no-options placeholder text when computedOptions is empty', () => {
    const tree = renderCard({
      payload: { ...PAYLOAD, computedOptions: [] },
    });
    expect(getOptionButtons(tree)).toHaveLength(0);
    const text = collectText(tree);
    expect(text).toContain('No computed options available');
  });
});
