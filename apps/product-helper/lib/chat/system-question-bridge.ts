/**
 * system-question-bridge — single shared transport for OpenQuestion events.
 *
 * Wave-A producers (M2 NFR / M6 HoQ / M8 fmea-residual) and the future
 * Wave-E `surface-gap.ts` producer (v2.2) both call `surfaceOpenQuestion`
 * to:
 *   1. Insert a chat-thread row with `role='system'`, `kind='pending_answer'`,
 *      `metadata={ source, computed_options, math_trace }`.
 *   2. Append a ledger entry to
 *      `project_data.intake_state.extractedData.openQuestions.<bucket>`
 *      atomically (read-modify-write under a single transaction).
 *   3. Target latency ≤ 2s end-to-end (insert + ledger). The transaction
 *      keeps the two writes consistent; ChatBridge does not retry on
 *      failure — callers receive the thrown error and surface gracefully.
 *
 * Reply routing: `subscribeToReplies` polls (or the runtime supplies a
 * push subscription) for `conversations` rows whose `parent_id` points at
 * a known pending_answer; on hit it invokes the registered handler and
 * marks the ledger entry `status='answered'`. The poll path is unit-test
 * deterministic; production runtime can swap in LISTEN/NOTIFY without
 * changing the surface.
 *
 * Wave A ↔ Wave E handshake: this bridge is the SHARED transport. v2.1
 * Wave-A producers (M2 NFR / M6 HoQ / M8 fmea-residual) ship now;
 * v2.2 Wave-E `surface-gap.ts` reuses this same `surfaceOpenQuestion`
 * surface. See `plans/v21-outputs/ta1/handshake-spec.md` for the
 * authoritative contract (envelope shape, version-flag bump rules,
 * failure-path test fixtures). Anchored by EC-V21-A.4 (≤ 2s p95).
 *
 * @module lib/chat/system-question-bridge
 */

import { eq, gt, and, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { conversations, projectData } from '@/lib/db/schema';
import {
  openQuestionEventSchema,
  SOURCE_TO_BUCKET,
  type OpenQuestionEvent,
  type OpenQuestionLedgerEntry,
  type OpenQuestionReplyHandler,
  type OpenQuestionSource,
  type SurfaceOpenQuestionResult,
} from './system-question-bridge.types';

type DrizzleClient = typeof db;

const replyHandlers = new Map<OpenQuestionSource, OpenQuestionReplyHandler>();

/**
 * Register a handler for replies on a given OpenQuestion source bucket.
 * The handler fires once per user reply, after the ledger entry is marked
 * `answered`. Idempotency guards (against re-firing on the same reply) live
 * in the consumer — bridge fires once per `pollReplies` cycle that observes
 * a new reply.
 */
export function onOpenQuestionReply(
  source: OpenQuestionSource,
  handler: OpenQuestionReplyHandler,
): void {
  replyHandlers.set(source, handler);
}

/** Test/runtime helper to clear all registered handlers. */
export function clearOpenQuestionReplyHandlers(): void {
  replyHandlers.clear();
}

/**
 * Insert the pending_answer chat row + append to the ledger atomically.
 * Returns the chat conversation id and the ledger bucket the entry landed in.
 */
export async function surfaceOpenQuestion(
  event: OpenQuestionEvent,
  opts: { dbClient?: DrizzleClient } = {},
): Promise<SurfaceOpenQuestionResult> {
  const parsed = openQuestionEventSchema.parse(event);
  const client = opts.dbClient ?? db;
  const start = Date.now();

  const bucket = SOURCE_TO_BUCKET[parsed.source];

  // Run insert + ledger in a single transaction. Read-modify-write under a
  // row-level lock so concurrent surfaces on the same project never trample
  // each other's ledger appends.
  const result = await client.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(conversations)
      .values({
        projectId: parsed.project_id,
        role: 'system',
        kind: 'pending_answer',
        content: parsed.question,
        metadata: {
          source: parsed.source,
          computed_options: parsed.computed_options ?? [],
          math_trace: parsed.math_trace ?? '',
        },
      })
      .returning({ id: conversations.id, createdAt: conversations.createdAt });

    if (!inserted) {
      throw new Error('surfaceOpenQuestion: chat insert returned no row');
    }

    // Lock the project_data row, mutate intake_state.extractedData.openQuestions[bucket].
    const [row] = await tx
      .select({ intakeState: projectData.intakeState })
      .from(projectData)
      .where(eq(projectData.projectId, parsed.project_id))
      .for('update');

    const intakeState = (row?.intakeState ?? {}) as {
      extractedData?: {
        openQuestions?: {
          requirements?: OpenQuestionLedgerEntry[];
          qfdResolved?: OpenQuestionLedgerEntry[];
          riskResolved?: OpenQuestionLedgerEntry[];
        };
      };
    };

    const extracted = intakeState.extractedData ?? {};
    const ledger = extracted.openQuestions ?? {};
    const list = ledger[bucket as keyof typeof ledger] ?? [];

    const entry: OpenQuestionLedgerEntry = {
      conversation_id: inserted.id,
      source: parsed.source,
      question: parsed.question,
      computed_options: parsed.computed_options,
      math_trace: parsed.math_trace,
      status: 'pending',
      created_at: inserted.createdAt.toISOString(),
    };

    const nextIntakeState = {
      ...intakeState,
      extractedData: {
        ...extracted,
        openQuestions: {
          ...ledger,
          [bucket]: [...list, entry],
        },
      },
    };

    if (row) {
      await tx
        .update(projectData)
        .set({ intakeState: nextIntakeState, updatedAt: new Date() })
        .where(eq(projectData.projectId, parsed.project_id));
    } else {
      await tx
        .insert(projectData)
        .values({ projectId: parsed.project_id, intakeState: nextIntakeState });
    }

    return { conversation_id: inserted.id };
  });

  return {
    conversation_id: result.conversation_id,
    bucket: bucket as 'requirements' | 'qfdResolved' | 'riskResolved',
    latency_ms: Date.now() - start,
  };
}

/**
 * Scan for new replies whose `parent_id` references one of `pendingIds`.
 * For each new reply, invoke the registered handler (by source) and flip
 * the ledger entry to `answered`.
 *
 * Caller passes `lastSeenReplyId` to make polling resumable; the function
 * returns the new high-water mark. Designed for both unit tests and a
 * production poll loop. Push subscriptions (LISTEN/NOTIFY, Supabase
 * realtime) can replace the poll without changing this signature.
 */
export async function pollReplies(args: {
  pendingIds: number[];
  lastSeenReplyId?: number;
  dbClient?: DrizzleClient;
}): Promise<{ newHighWater: number; processed: number }> {
  const client = args.dbClient ?? db;
  if (args.pendingIds.length === 0) {
    return { newHighWater: args.lastSeenReplyId ?? 0, processed: 0 };
  }

  const since = args.lastSeenReplyId ?? 0;
  const replies = await client
    .select({
      id: conversations.id,
      projectId: conversations.projectId,
      parentId: conversations.parentId,
      content: conversations.content,
      metadata: conversations.metadata,
    })
    .from(conversations)
    .where(
      and(
        gt(conversations.id, since),
        inArray(conversations.parentId, args.pendingIds),
      ),
    );

  let highWater = since;
  let processed = 0;
  for (const reply of replies) {
    if (reply.id > highWater) highWater = reply.id;
    if (reply.parentId == null) continue;

    // Resolve source by reading the parent's metadata.
    const [parent] = await client
      .select({ metadata: conversations.metadata })
      .from(conversations)
      .where(eq(conversations.id, reply.parentId));
    const meta = parent?.metadata as { source?: OpenQuestionSource } | null;
    const source = meta?.source;
    if (!source) continue;

    await markLedgerAnswered(client, {
      projectId: reply.projectId,
      pendingId: reply.parentId,
      replyId: reply.id,
      replyBody: reply.content,
      source,
    });

    const handler = replyHandlers.get(source);
    if (handler) {
      await handler({
        reply_conversation_id: reply.id,
        reply_body: reply.content,
        pending_answer_id: reply.parentId,
        source,
      });
    }
    processed += 1;
  }

  return { newHighWater: highWater, processed };
}

async function markLedgerAnswered(
  client: DrizzleClient,
  args: {
    projectId: number;
    pendingId: number;
    replyId: number;
    replyBody: string;
    source: OpenQuestionSource;
  },
): Promise<void> {
  const bucket = SOURCE_TO_BUCKET[args.source];
  await client.transaction(async (tx) => {
    const [row] = await tx
      .select({ intakeState: projectData.intakeState })
      .from(projectData)
      .where(eq(projectData.projectId, args.projectId))
      .for('update');
    if (!row) return;

    const intakeState = (row.intakeState ?? {}) as {
      extractedData?: {
        openQuestions?: Record<string, OpenQuestionLedgerEntry[]>;
      };
    };
    const extracted = intakeState.extractedData ?? {};
    const ledger = extracted.openQuestions ?? {};
    const list = ledger[bucket] ?? [];

    const updated = list.map((e) =>
      e.conversation_id === args.pendingId
        ? {
            ...e,
            status: 'answered' as const,
            answered_at: new Date().toISOString(),
            reply_conversation_id: args.replyId,
            reply_body: args.replyBody,
          }
        : e,
    );

    await tx
      .update(projectData)
      .set({
        intakeState: {
          ...intakeState,
          extractedData: {
            ...extracted,
            openQuestions: { ...ledger, [bucket]: updated },
          },
        },
        updatedAt: new Date(),
      })
      .where(eq(projectData.projectId, args.projectId));
  });
}

export { SOURCE_TO_BUCKET } from './system-question-bridge.types';
