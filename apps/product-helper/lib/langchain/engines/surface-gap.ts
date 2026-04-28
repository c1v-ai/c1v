/**
 * surface-gap — multi-turn gap-fill adapter for the NFR engine.
 *
 * Per plans/kb-runtime-architecture.md §3.2: when
 * `NFREngineInterpreter.evaluate()` emits `needs_user_input: true`,
 * the pipeline must not return to Response. Instead it surfaces a question
 * (plus top-3 computed options and the math trace) into the project's
 * chat thread, waits for the user's answer, then re-enters Context
 * construction.
 *
 * Design constraints driving this module:
 *   1. The chat stack uses the Vercel AI SDK's `useChat` hook with the
 *      `Message` type from `ai`. There is no persisted `messages` table
 *      to poll.
 *   2. "Do not fork message schemas" — `Message.content` stays a string.
 *      Gap payloads therefore travel as a typed HTML-comment marker
 *      embedded in content, exactly like the `<!--status:...-->`
 *      convention the bubble renderer already strips.
 *   3. `surfaceGap()` returns a Promise, resolved by whichever component
 *      receives the user's reply (typically the `/api/chat` route).
 *
 * Pub/sub plumbing:
 *   - `surfaceGap(input)` registers a Deferred in the process-local
 *     registry keyed by decisionKey, returns both the Promise AND the
 *     assistant content string to inject into the next assistant message.
 *     The caller appends that message to the chat stream.
 *   - `resolveGap(key, answer)` settles the Promise.
 *   - `rejectGap(key, reason)` cancels on timeout / thread close.
 *   - `parseGapAnswer(rawUserContent, pendingOptions)` parses a user reply
 *     into a `UserAnswer`. Pure.
 *
 * v2.2 Wave-E (D-V21.23): every `surfaceGap` ALSO routes through the
 * shared v2.1 bridge `lib/chat/system-question-bridge.ts` for DB
 * persistence + cross-process resilience. Bridge wiring is OPT-IN via
 * `setBridgeAdapter` so legacy in-memory tests keep working without
 * touching a database. The chat route registers the real bridge at
 * module init; integration tests inject a mock per-suite.
 *
 * This module owns NO react/ui code. Chat renderer strips the marker;
 * a sibling component renders the option buttons + math trace from the
 * decoded payload.
 *
 * @module lib/langchain/engines/surface-gap
 */

import type { ComputedOption } from './nfr-engine-interpreter';
import type {
  OpenQuestionEvent,
  SurfaceOpenQuestionResult,
} from '@/lib/chat/system-question-bridge.types';

// Types ────────────────────────────────────────────────────────────────────

export interface SurfaceGapDecision {
  decision_id: string;
  target_field: string;
  /** Phrased as a user-facing question — the agent should build this. */
  question: string;
}

export interface SurfaceGapInput {
  decision: SurfaceGapDecision;
  /** Top-3 options produced by the engine; at most 3, may be fewer. */
  computedOptions: ComputedOption[];
  /** Human-readable engine math_trace string. */
  mathTrace: string;
  projectId: string | number;
  threadId: string;
}

export interface UserAnswer {
  value: number | string;
  source: 'computed_option' | 'free_text';
  /** Index into computedOptions (0-based) if `source` is 'computed_option'. */
  selectedOptionIndex?: number;
  /** Verbatim user content as posted to the chat thread. */
  rawResponse: string;
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: Error) => void;
}

interface PendingGap {
  key: string;
  input: SurfaceGapInput;
  deferred: Deferred<UserAnswer>;
  createdAt: number;
  /** v2.1 bridge pending_answer conversation_id, populated once the
   *  bridge insert resolves. Used by the wave_e reply handler to map
   *  bridge replies back to the right Deferred. */
  bridgeConversationId?: number;
}

/**
 * Adapter for the v2.1 system-question-bridge. Wave-E routes every
 * `surfaceGap` call through `surfaceOpenQuestion` for DB persistence +
 * cross-process resilience (master plan D-V21.23).
 */
export interface BridgeAdapter {
  surfaceOpenQuestion: (
    event: OpenQuestionEvent,
  ) => Promise<SurfaceOpenQuestionResult>;
}

/** Multi-turn cap; spec §Guardrails. */
export const MAX_TURNS = 5;

/** Thrown when a single decision exceeds MAX_TURNS unresolved surfaces. */
export class MaxTurnsExceededError extends Error {
  readonly key: string;
  readonly turns: number;
  constructor(key: string, turns: number) {
    super(
      `surfaceGap: decision ${key} exceeded MAX_TURNS=${MAX_TURNS} (turn ${turns})`,
    );
    this.name = 'MaxTurnsExceededError';
    this.key = key;
    this.turns = turns;
  }
}

// Content marker — embedded in assistant messages ─────────────────────────

const MARKER_OPEN = '<!--c1v-gap:';
const MARKER_CLOSE = '-->';

export interface GapMarkerPayload {
  decisionId: string;
  targetField: string;
  question: string;
  computedOptions: ComputedOption[];
  mathTrace: string;
}

export function encodeGapMarker(payload: GapMarkerPayload): string {
  const json = JSON.stringify(payload);
  const b64 =
    typeof btoa === 'function'
      ? btoa(json)
      : Buffer.from(json, 'utf8').toString('base64');
  return `${MARKER_OPEN}${b64}${MARKER_CLOSE}`;
}

export function decodeGapMarker(content: string): GapMarkerPayload | null {
  const start = content.indexOf(MARKER_OPEN);
  if (start === -1) return null;
  const end = content.indexOf(MARKER_CLOSE, start + MARKER_OPEN.length);
  if (end === -1) return null;
  const b64 = content.slice(start + MARKER_OPEN.length, end);
  try {
    const json =
      typeof atob === 'function'
        ? atob(b64)
        : Buffer.from(b64, 'base64').toString('utf8');
    const parsed = JSON.parse(json) as unknown;
    if (!isGapPayload(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function stripGapMarker(content: string): string {
  const re = new RegExp(
    `${escapeRegExp(MARKER_OPEN)}[\\s\\S]*?${escapeRegExp(MARKER_CLOSE)}`,
    'g',
  );
  return content.replace(re, '').replace(/\n{3,}/g, '\n\n').trim();
}

// Registry — module-local maps ─────────────────────────────────────────────

const pending = new Map<string, PendingGap>();

/**
 * Per-decision turn counter. Increments on every NEW `surfaceGap` call
 * (idempotent re-surfaces on the same live key don't burn turns); resets
 * on `resolveGap` success. After MAX_TURNS, the next surface throws
 * `MaxTurnsExceededError` rather than registering a Deferred.
 */
const turnCounts = new Map<string, number>();

/**
 * Reverse index from bridge `conversation_id` → decisionKey. Populated
 * once the bridge insert resolves; consumed by `waveEReplyHandler` so a
 * user reply on a `pending_answer` row settles the right Deferred.
 */
const bridgeConvToKey = new Map<number, string>();

let bridgeAdapter: BridgeAdapter | null = null;

/**
 * Wire (or replace) the v2.1 bridge adapter. Call once at chat-route
 * module init; tests inject a mock per-suite. Pass `null` to clear.
 */
export function setBridgeAdapter(adapter: BridgeAdapter | null): void {
  bridgeAdapter = adapter;
}

export function decisionKey(args: {
  projectId: string | number;
  decisionId: string;
  threadId: string;
}): string {
  return `${args.projectId}::${args.threadId}::${args.decisionId}`;
}

export function hasPendingGap(key: string): boolean {
  return pending.has(key);
}

export function listPendingGaps(): Array<{
  key: string;
  decisionId: string;
  createdAt: number;
}> {
  return Array.from(pending.values()).map((g) => ({
    key: g.key,
    decisionId: g.input.decision.decision_id,
    createdAt: g.createdAt,
  }));
}

export interface SurfaceGapHandle {
  answer: Promise<UserAnswer>;
  key: string;
  assistantContent: string;
}

export function surfaceGap(input: SurfaceGapInput): SurfaceGapHandle {
  const key = decisionKey({
    projectId: input.projectId,
    decisionId: input.decision.decision_id,
    threadId: input.threadId,
  });

  // Idempotency: repeated call for the same key adopts the existing
  // promise — prevents runaway agents from registering N gaps. Idempotent
  // re-surfaces don't burn turns and don't re-fire the bridge.
  const existing = pending.get(key);
  if (existing) {
    return {
      key,
      answer: existing.deferred.promise,
      assistantContent: buildAssistantContent(input),
    };
  }

  // Multi-turn cap (D-V21.23 §Guardrails).
  const nextTurn = (turnCounts.get(key) ?? 0) + 1;
  if (nextTurn > MAX_TURNS) {
    throw new MaxTurnsExceededError(key, nextTurn);
  }
  turnCounts.set(key, nextTurn);

  const deferred = makeDeferred<UserAnswer>();
  const gap: PendingGap = {
    key,
    input,
    deferred,
    createdAt: Date.now(),
  };
  pending.set(key, gap);

  // Fire-and-forget bridge persistence. Adapter unset = legacy in-memory
  // mode (existing unit tests). When wired, errors are logged but DO NOT
  // reject the Deferred — chat-marker path still works on bridge failure.
  if (bridgeAdapter) {
    const projectIdNum =
      typeof input.projectId === 'number'
        ? input.projectId
        : Number(input.projectId);
    if (Number.isFinite(projectIdNum) && projectIdNum > 0) {
      const event: OpenQuestionEvent = {
        source: 'wave_e_engine',
        question: input.decision.question,
        computed_options: input.computedOptions,
        math_trace: input.mathTrace,
        project_id: projectIdNum,
      };
      bridgeAdapter
        .surfaceOpenQuestion(event)
        .then((res) => {
          if (pending.get(key) === gap) {
            gap.bridgeConversationId = res.conversation_id;
            bridgeConvToKey.set(res.conversation_id, key);
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.warn(
            `[surface-gap] bridge.surfaceOpenQuestion failed for ${key}:`,
            err,
          );
        });
    }
  }

  return {
    key,
    answer: deferred.promise,
    assistantContent: buildAssistantContent(input),
  };
}

export function resolveGap(key: string, answer: UserAnswer): boolean {
  const gap = pending.get(key);
  if (!gap) return false;
  pending.delete(key);
  // Successful resolution clears the turn counter so a future surface
  // for the same decision starts fresh (e.g. user revises later).
  turnCounts.delete(key);
  if (gap.bridgeConversationId !== undefined) {
    bridgeConvToKey.delete(gap.bridgeConversationId);
  }
  gap.deferred.resolve(answer);
  return true;
}

export function rejectGap(key: string, reason: Error): boolean {
  const gap = pending.get(key);
  if (!gap) return false;
  pending.delete(key);
  if (gap.bridgeConversationId !== undefined) {
    bridgeConvToKey.delete(gap.bridgeConversationId);
  }
  gap.deferred.reject(reason);
  return true;
}

/**
 * Reply handler for `wave_e_engine`-sourced replies arriving via the v2.1
 * bridge. Maps `pending_answer_id` → decisionKey, parses the reply
 * against the Deferred's stashed `computedOptions`, and settles via
 * `resolveGap`. Register once at chat-route init:
 *
 *   onOpenQuestionReply('wave_e_engine', waveEReplyHandler);
 */
export async function waveEReplyHandler(args: {
  reply_conversation_id: number;
  reply_body: string;
  pending_answer_id: number;
}): Promise<void> {
  const key = bridgeConvToKey.get(args.pending_answer_id);
  if (!key) return;
  const gap = pending.get(key);
  if (!gap) {
    bridgeConvToKey.delete(args.pending_answer_id);
    return;
  }
  const answer = parseGapAnswer(args.reply_body, gap.input.computedOptions);
  resolveGap(key, answer);
}

/**
 * Parse a user chat reply into a UserAnswer.
 *
 * Option-selection protocol:
 *   - `/option N` (1-based) selects that option.
 *   - Bare `1` / `2` / `3` also selects, but only when options exist (so
 *     free-text "1ms" doesn't accidentally resolve to an option).
 *   - Anything else is free text; pure numbers are coerced to `number`.
 */
export function parseGapAnswer(
  rawUserContent: string,
  pendingOptions: ComputedOption[],
): UserAnswer {
  const trimmed = rawUserContent.trim();

  const slashMatch = /^\/option\s+(\d+)$/i.exec(trimmed);
  const bareIndex =
    pendingOptions.length > 0 && /^[1-3]$/.test(trimmed)
      ? Number(trimmed)
      : null;

  const selectedOneBased = slashMatch ? Number(slashMatch[1]) : bareIndex;
  if (selectedOneBased !== null) {
    const zeroBased = selectedOneBased - 1;
    const picked = pendingOptions[zeroBased];
    if (picked) {
      return {
        value: picked.value,
        source: 'computed_option',
        selectedOptionIndex: zeroBased,
        rawResponse: rawUserContent,
      };
    }
  }

  return {
    value: coerceFreeText(trimmed),
    source: 'free_text',
    rawResponse: rawUserContent,
  };
}

/** @internal test-only — resets all module-local state. */
export function __resetPendingGapsForTests(): void {
  pending.clear();
  turnCounts.clear();
  bridgeConvToKey.clear();
  bridgeAdapter = null;
}

/** @internal test helper — peek at the internal turn count for a key. */
export function __getTurnCountForTests(key: string): number {
  return turnCounts.get(key) ?? 0;
}

// Helpers ──────────────────────────────────────────────────────────────────

function makeDeferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void;
  let reject!: (e?: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function buildAssistantContent(input: SurfaceGapInput): string {
  const marker = encodeGapMarker({
    decisionId: input.decision.decision_id,
    targetField: input.decision.target_field,
    question: input.decision.question,
    computedOptions: input.computedOptions,
    mathTrace: input.mathTrace,
  });

  const optionLines = input.computedOptions
    .map((opt, i) => {
      const units = opt.units ? ` ${opt.units}` : '';
      return `${i + 1}. **${opt.value}${units}** — ${opt.rationale} _(confidence ${opt.confidence.toFixed(2)})_`;
    })
    .join('\n');

  const body = [
    input.decision.question,
    '',
    optionLines || '_No computed options available._',
    '',
    '_Reply with `/option 1`, `/option 2`, or `/option 3` to pick — or send your own value._',
  ].join('\n');

  return `${body}\n\n${marker}`;
}

function isGapPayload(v: unknown): v is GapMarkerPayload {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.decisionId === 'string' &&
    typeof o.targetField === 'string' &&
    typeof o.question === 'string' &&
    Array.isArray(o.computedOptions) &&
    typeof o.mathTrace === 'string'
  );
}

function coerceFreeText(s: string): number | string {
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
