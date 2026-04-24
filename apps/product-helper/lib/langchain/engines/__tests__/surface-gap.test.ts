import { describe, it, expect, beforeEach } from '@jest/globals';

import {
  surfaceGap,
  resolveGap,
  rejectGap,
  parseGapAnswer,
  decodeGapMarker,
  encodeGapMarker,
  stripGapMarker,
  decisionKey,
  hasPendingGap,
  listPendingGaps,
  __resetPendingGapsForTests,
  type SurfaceGapInput,
} from '../surface-gap';
import type { ComputedOption } from '../nfr-engine-interpreter';

beforeEach(() => {
  __resetPendingGapsForTests();
});

const OPTS: ComputedOption[] = [
  { value: 500, units: 'ms', confidence: 0.94, rationale: 'PCI consumer sync' },
  { value: 800, units: 'ms', confidence: 0.72, rationale: 'default latency tier' },
  { value: 1500, units: 'ms', confidence: 0.51, rationale: 'batch background job' },
];

function fixture(overrides: Partial<SurfaceGapInput> = {}): SurfaceGapInput {
  return {
    decision: {
      decision_id: 'D_RESPONSE_BUDGET_MS',
      target_field: 'RESPONSE_BUDGET_MS',
      question: 'What response-latency budget should we use?',
    },
    computedOptions: OPTS,
    mathTrace: 'rule: consumer-app-user-facing-sync-pci; base 0.94; final 0.84 < 0.90',
    projectId: 42,
    threadId: 'thread_abc',
    ...overrides,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// decisionKey + registry basics
// ──────────────────────────────────────────────────────────────────────────

describe('decisionKey', () => {
  it('builds a stable key from {projectId, threadId, decisionId}', () => {
    expect(
      decisionKey({ projectId: 42, decisionId: 'D_X', threadId: 't1' }),
    ).toBe('42::t1::D_X');
  });

  it('coerces numeric projectId to string', () => {
    expect(
      decisionKey({ projectId: '42', decisionId: 'D_X', threadId: 't1' }),
    ).toBe('42::t1::D_X');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// surfaceGap — registration + assistant content
// ──────────────────────────────────────────────────────────────────────────

describe('surfaceGap', () => {
  it('registers a pending gap and exposes it via list/has', () => {
    const h = surfaceGap(fixture());
    expect(hasPendingGap(h.key)).toBe(true);
    const list = listPendingGaps();
    expect(list).toHaveLength(1);
    expect(list[0]?.decisionId).toBe('D_RESPONSE_BUDGET_MS');
  });

  it('returns a promise that resolves via resolveGap', async () => {
    const h = surfaceGap(fixture());
    setTimeout(
      () =>
        resolveGap(h.key, {
          value: 500,
          source: 'computed_option',
          selectedOptionIndex: 0,
          rawResponse: '/option 1',
        }),
      0,
    );
    const ans = await h.answer;
    expect(ans.value).toBe(500);
    expect(ans.source).toBe('computed_option');
    expect(hasPendingGap(h.key)).toBe(false);
  });

  it('is idempotent — repeated surface for same key adopts the same promise', async () => {
    const h1 = surfaceGap(fixture());
    const h2 = surfaceGap(fixture());
    expect(h1.key).toBe(h2.key);
    resolveGap(h1.key, {
      value: 'ok',
      source: 'free_text',
      rawResponse: 'ok',
    });
    await expect(h1.answer).resolves.toEqual(await h2.answer);
    expect(listPendingGaps()).toHaveLength(0);
  });

  it('rejectGap settles the promise with the supplied error', async () => {
    const h = surfaceGap(fixture());
    const err = new Error('thread closed');
    setTimeout(() => rejectGap(h.key, err), 0);
    await expect(h.answer).rejects.toBe(err);
    expect(hasPendingGap(h.key)).toBe(false);
  });

  it('resolveGap returns false for unknown keys', () => {
    expect(
      resolveGap('no-such-key', {
        value: 1,
        source: 'free_text',
        rawResponse: '1',
      }),
    ).toBe(false);
  });

  it('assistantContent contains the question, all option lines, and a marker', () => {
    const h = surfaceGap(fixture());
    expect(h.assistantContent).toContain(
      'What response-latency budget should we use?',
    );
    expect(h.assistantContent).toContain('1. **500 ms**');
    expect(h.assistantContent).toContain('2. **800 ms**');
    expect(h.assistantContent).toContain('3. **1500 ms**');
    expect(h.assistantContent).toContain('<!--c1v-gap:');
    expect(h.assistantContent).toContain('-->');
  });

  it('assistantContent handles the no-options case gracefully', () => {
    const h = surfaceGap(fixture({ computedOptions: [] }));
    expect(h.assistantContent).toContain('_No computed options available._');
    // Marker still present with empty options array.
    const payload = decodeGapMarker(h.assistantContent);
    expect(payload?.computedOptions).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Marker round-trip
// ──────────────────────────────────────────────────────────────────────────

describe('gap marker serialization', () => {
  it('encode → decode round-trips a payload', () => {
    const payload = {
      decisionId: 'D',
      targetField: 'F',
      question: 'Q?',
      computedOptions: OPTS,
      mathTrace: 'trace',
    };
    const encoded = encodeGapMarker(payload);
    expect(decodeGapMarker(encoded)).toEqual(payload);
  });

  it('decodeGapMarker returns null for missing marker', () => {
    expect(decodeGapMarker('plain text')).toBeNull();
  });

  it('decodeGapMarker returns null for truncated marker', () => {
    expect(decodeGapMarker('<!--c1v-gap:abc')).toBeNull();
  });

  it('decodeGapMarker returns null for unparseable payload', () => {
    expect(decodeGapMarker('<!--c1v-gap:not_valid_base64_$$$-->')).toBeNull();
  });

  it('decodeGapMarker returns null for wrong-shape JSON', () => {
    const b64 = Buffer.from(JSON.stringify({ foo: 'bar' }), 'utf8').toString(
      'base64',
    );
    expect(decodeGapMarker(`<!--c1v-gap:${b64}-->`)).toBeNull();
  });

  it('encoded content contains no raw newlines or HTML-unsafe chars', () => {
    const encoded = encodeGapMarker({
      decisionId: 'D',
      targetField: 'F',
      question: 'line1\nline2',
      computedOptions: OPTS,
      mathTrace: 'trace with\nnewlines',
    });
    // Marker body is base64, so it stays on one line regardless of payload.
    const body = encoded.slice('<!--c1v-gap:'.length, -'-->'.length);
    expect(body).not.toContain('\n');
    expect(body).not.toContain('<');
    expect(body).not.toContain('>');
  });

  it('stripGapMarker removes the marker and trailing blanks', () => {
    const h = surfaceGap(fixture());
    const stripped = stripGapMarker(h.assistantContent);
    expect(stripped).not.toContain('<!--c1v-gap:');
    expect(stripped).toContain('What response-latency budget should we use?');
    // No trailing whitespace / runaway blank lines.
    expect(stripped).toBe(stripped.trim());
    expect(stripped).not.toMatch(/\n\n\n/);
  });

  it('stripGapMarker is a no-op when no marker is present', () => {
    expect(stripGapMarker('hello world')).toBe('hello world');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// parseGapAnswer — option selection vs free-text
// ──────────────────────────────────────────────────────────────────────────

describe('parseGapAnswer', () => {
  it('/option 1 selects the first option', () => {
    const ans = parseGapAnswer('/option 1', OPTS);
    expect(ans.source).toBe('computed_option');
    expect(ans.selectedOptionIndex).toBe(0);
    expect(ans.value).toBe(500);
  });

  it('/option 3 selects the third option', () => {
    const ans = parseGapAnswer('/option 3', OPTS);
    expect(ans.selectedOptionIndex).toBe(2);
    expect(ans.value).toBe(1500);
  });

  it('bare "2" selects option 2 when options exist', () => {
    const ans = parseGapAnswer('2', OPTS);
    expect(ans.source).toBe('computed_option');
    expect(ans.selectedOptionIndex).toBe(1);
    expect(ans.value).toBe(800);
  });

  it('bare "1" is NOT treated as option when options array is empty', () => {
    const ans = parseGapAnswer('1', []);
    expect(ans.source).toBe('free_text');
    expect(ans.value).toBe(1);
  });

  it('out-of-range /option N falls back to free text', () => {
    const ans = parseGapAnswer('/option 9', OPTS);
    expect(ans.source).toBe('free_text');
    expect(ans.rawResponse).toBe('/option 9');
  });

  it('free-text numeric is typed as number', () => {
    const ans = parseGapAnswer('450', OPTS);
    // `450` is not 1-3 so it isn't a bare index; treated as free text.
    expect(ans.source).toBe('free_text');
    expect(ans.value).toBe(450);
  });

  it('free-text string with units stays a string', () => {
    const ans = parseGapAnswer('500ms', OPTS);
    expect(ans.source).toBe('free_text');
    expect(ans.value).toBe('500ms');
  });

  it('handles leading/trailing whitespace in user content', () => {
    const ans = parseGapAnswer('   /option 2   ', OPTS);
    expect(ans.source).toBe('computed_option');
    expect(ans.selectedOptionIndex).toBe(1);
  });

  it('preserves the raw user content verbatim in rawResponse', () => {
    const ans = parseGapAnswer('  hello world  ', OPTS);
    expect(ans.rawResponse).toBe('  hello world  ');
  });
});
