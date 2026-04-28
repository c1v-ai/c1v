/**
 * Wave-E ↔ v2.1 bridge integration tests.
 *
 * Drives the full surface-gap loop with a MOCK bridge — never hits a
 * live DB. Mocks `surfaceOpenQuestion` (returns synthetic
 * `conversation_id`s) and emulates `pollReplies` by directly invoking
 * `waveEReplyHandler` with the same payload the bridge would deliver.
 *
 * Cases:
 *   - single-turn: 1 missing param → user provides → resolved
 *   - multi-turn: 3 missing params (3 distinct decisions) → user
 *     provides over 3 turns → all resolved
 *   - timeout: user doesn't reply within configurable window → returns
 *     `status: 'timeout'`
 *   - infinite-loop guard: 6th would-be turn for the same decision
 *     throws `MaxTurnsExceededError`
 *
 * Existing `surface-gap.test.ts` (26 cases) is the canonical coverage of
 * the in-memory Deferred + marker codec and is NOT modified — Wave-E
 * wiring is additive.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import {
  surfaceGap,
  waveEReplyHandler,
  setBridgeAdapter,
  rejectGap,
  MAX_TURNS,
  MaxTurnsExceededError,
  __resetPendingGapsForTests,
  __getTurnCountForTests,
  decisionKey,
  hasPendingGap,
  type BridgeAdapter,
  type SurfaceGapInput,
} from '../surface-gap';
import type { ComputedOption } from '../nfr-engine-interpreter';
import type {
  OpenQuestionEvent,
  SurfaceOpenQuestionResult,
} from '@/lib/chat/system-question-bridge.types';

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
    mathTrace: 'rule: consumer-app-user-facing-sync-pci; final 0.84 < 0.90',
    projectId: 42,
    threadId: 'thread_abc',
    ...overrides,
  };
}

/**
 * Mock bridge that records calls + returns synthetic conversation_ids.
 * Tests can inspect `events` to assert on what was emitted, and call
 * `simulateUserReply(convId, body)` to drive `waveEReplyHandler`.
 */
function makeMockBridge(): {
  adapter: BridgeAdapter;
  events: OpenQuestionEvent[];
  results: SurfaceOpenQuestionResult[];
  simulateUserReply: (convId: number, body: string) => Promise<void>;
} {
  const events: OpenQuestionEvent[] = [];
  const results: SurfaceOpenQuestionResult[] = [];
  let nextConvId = 1000;

  const surfaceOpenQuestion: BridgeAdapter['surfaceOpenQuestion'] = async (
    event,
  ) => {
    events.push(event);
    const result: SurfaceOpenQuestionResult = {
      conversation_id: nextConvId++,
      bucket: 'requirements',
      latency_ms: 5,
    };
    results.push(result);
    return result;
  };

  return {
    adapter: { surfaceOpenQuestion },
    events,
    results,
    simulateUserReply: async (convId, body) => {
      await waveEReplyHandler({
        reply_conversation_id: convId + 5000,
        reply_body: body,
        pending_answer_id: convId,
      });
    },
  };
}

/**
 * Race a Promise against a timeout. Returns
 * `{ status: 'resolved', value }` or `{ status: 'timeout' }`.
 *
 * Used to model the engine's wait-for-reply window. Real engine uses an
 * AbortController; for unit-test determinism a setTimeout race suffices.
 */
async function withTimeout<T>(
  p: Promise<T>,
  ms: number,
): Promise<{ status: 'resolved'; value: T } | { status: 'timeout' }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<{ status: 'timeout' }>((resolve) => {
    timer = setTimeout(() => resolve({ status: 'timeout' }), ms);
  });
  const wrapped = p.then((value) => ({ status: 'resolved' as const, value }));
  const result = await Promise.race([wrapped, timeout]);
  if (timer) clearTimeout(timer);
  return result;
}

describe('Wave-E ↔ v2.1 bridge: single-turn', () => {
  it('1 missing param — user picks /option 1 — Deferred resolves', async () => {
    const bridge = makeMockBridge();
    setBridgeAdapter(bridge.adapter);

    const handle = surfaceGap(fixture());

    // Bridge call is fire-and-forget; await microtask flush so the
    // adapter's promise resolves and bridgeConvToKey is populated.
    await new Promise((r) => setImmediate(r));

    expect(bridge.events).toHaveLength(1);
    expect(bridge.events[0]?.source).toBe('wave_e_engine');
    expect(bridge.events[0]?.project_id).toBe(42);
    expect(bridge.events[0]?.computed_options).toEqual(OPTS);

    const [{ conversation_id }] = bridge.results;
    await bridge.simulateUserReply(conversation_id!, '/option 1');

    const ans = await handle.answer;
    expect(ans.source).toBe('computed_option');
    expect(ans.selectedOptionIndex).toBe(0);
    expect(ans.value).toBe(500);
    expect(hasPendingGap(handle.key)).toBe(false);
  });

  it('user reply via free-text numeric — Deferred resolves with number', async () => {
    const bridge = makeMockBridge();
    setBridgeAdapter(bridge.adapter);

    const handle = surfaceGap(fixture());
    await new Promise((r) => setImmediate(r));

    const [{ conversation_id }] = bridge.results;
    await bridge.simulateUserReply(conversation_id!, '450');

    const ans = await handle.answer;
    expect(ans.source).toBe('free_text');
    expect(ans.value).toBe(450);
  });
});

describe('Wave-E ↔ v2.1 bridge: multi-turn', () => {
  it('3 distinct decisions resolved across 3 user turns', async () => {
    const bridge = makeMockBridge();
    setBridgeAdapter(bridge.adapter);

    const decisions = [
      { decision_id: 'D_LATENCY_MS', target_field: 'LATENCY_MS', question: 'Latency budget?' },
      { decision_id: 'D_AVAIL_PCT', target_field: 'AVAIL_PCT', question: 'Availability target?' },
      { decision_id: 'D_RPS_MAX', target_field: 'RPS_MAX', question: 'Peak RPS?' },
    ];

    const handles = decisions.map((decision) =>
      surfaceGap(fixture({ decision })),
    );
    await new Promise((r) => setImmediate(r));

    expect(bridge.events).toHaveLength(3);
    expect(bridge.results).toHaveLength(3);

    // User answers turn-by-turn (each in its own microtask "turn").
    await bridge.simulateUserReply(bridge.results[0]!.conversation_id, '/option 1');
    await bridge.simulateUserReply(bridge.results[1]!.conversation_id, '/option 2');
    await bridge.simulateUserReply(bridge.results[2]!.conversation_id, '/option 3');

    const answers = await Promise.all(handles.map((h) => h.answer));
    expect(answers[0]?.value).toBe(500);
    expect(answers[1]?.value).toBe(800);
    expect(answers[2]?.value).toBe(1500);
    handles.forEach((h) => expect(hasPendingGap(h.key)).toBe(false));
  });
});

describe('Wave-E ↔ v2.1 bridge: timeout', () => {
  it("user doesn't reply within window — returns status: 'timeout'", async () => {
    const bridge = makeMockBridge();
    setBridgeAdapter(bridge.adapter);

    const handle = surfaceGap(fixture());
    await new Promise((r) => setImmediate(r));

    const result = await withTimeout(handle.answer, 50);
    expect(result.status).toBe('timeout');
    expect(hasPendingGap(handle.key)).toBe(true);

    // Cleanup: reject the still-pending Deferred so jest doesn't
    // complain about an unhandled rejection on suite teardown.
    rejectGap(handle.key, new Error('test cleanup'));
    await handle.answer.catch(() => undefined);
  });
});

describe('Wave-E ↔ v2.1 bridge: infinite-loop guard', () => {
  it('5 unresolved turns OK; 6th throws MaxTurnsExceededError', () => {
    // No bridge wired — the cap is independent of bridge state.
    const input = fixture();
    const key = decisionKey({
      projectId: input.projectId,
      decisionId: input.decision.decision_id,
      threadId: input.threadId,
    });

    // Drive MAX_TURNS unresolved surfaces. Each turn rejects the prior
    // Deferred so a NEW surface registers (idempotency would otherwise
    // adopt the existing one and not increment the counter).
    for (let i = 1; i <= MAX_TURNS; i++) {
      const h = surfaceGap(input);
      expect(__getTurnCountForTests(key)).toBe(i);
      // Don't consume the rejection — just clear the live Deferred.
      rejectGap(h.key, new Error('next turn'));
      // Suppress the unhandled rejection.
      h.answer.catch(() => undefined);
    }

    expect(__getTurnCountForTests(key)).toBe(MAX_TURNS);
    expect(() => surfaceGap(input)).toThrow(MaxTurnsExceededError);
  });

  it('successful resolveGap clears the turn counter', async () => {
    const bridge = makeMockBridge();
    setBridgeAdapter(bridge.adapter);

    const input = fixture();
    const key = decisionKey({
      projectId: input.projectId,
      decisionId: input.decision.decision_id,
      threadId: input.threadId,
    });

    const h = surfaceGap(input);
    expect(__getTurnCountForTests(key)).toBe(1);
    await new Promise((r) => setImmediate(r));

    await bridge.simulateUserReply(bridge.results[0]!.conversation_id, '/option 1');
    await h.answer;

    expect(__getTurnCountForTests(key)).toBe(0);

    // Re-surface starts a fresh turn budget.
    const h2 = surfaceGap(input);
    expect(__getTurnCountForTests(key)).toBe(1);
    rejectGap(h2.key, new Error('teardown'));
    await h2.answer.catch(() => undefined);
  });
});

describe('Wave-E ↔ v2.1 bridge: bridge failure isolation', () => {
  it('bridge.surfaceOpenQuestion rejection does NOT reject the Deferred', async () => {
    const failingAdapter: BridgeAdapter = {
      surfaceOpenQuestion: jest
        .fn<BridgeAdapter['surfaceOpenQuestion']>()
        .mockRejectedValue(new Error('db down')),
    };
    setBridgeAdapter(failingAdapter);

    // Silence the expected console.warn from surface-gap's catch path.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const handle = surfaceGap(fixture());
    await new Promise((r) => setImmediate(r));

    // Deferred is still live — the chat-marker path is the fallback.
    expect(hasPendingGap(handle.key)).toBe(true);

    rejectGap(handle.key, new Error('test cleanup'));
    await handle.answer.catch(() => undefined);

    warnSpy.mockRestore();
  });
});
