/**
 * system-question-bridge — STUB owned by langgraph-wirer (TA1 v2.1 Wave A).
 *
 * The canonical implementation (chat-thread insert + ledger write + reply
 * subscription) is owned by `open-questions-emitter` agent and lives on
 * `wave-a/ta1-emitter` at commit `86712ad`. When that branch merges to main,
 * the file body is overwritten with the durable transport while the export
 * surface (`surfaceOpenQuestion`, types) stays stable.
 *
 * Stub behavior: validates the event shape, logs, returns a synthetic
 * result. Callers (extract_data envelope failure path, M2/M6/M8 emitters)
 * compile + run a no-op against the stub until the real bridge merges.
 *
 * @module lib/chat/system-question-bridge
 */

import {
  openQuestionEventSchema,
  type OpenQuestionEvent,
  type SurfaceOpenQuestionResult,
  SOURCE_TO_BUCKET,
} from './system-question-bridge.types';

export type {
  OpenQuestionEvent,
  SurfaceOpenQuestionResult,
  OpenQuestionReplyHandler,
} from './system-question-bridge.types';

export { SOURCE_TO_BUCKET } from './system-question-bridge.types';

export async function surfaceOpenQuestion(
  event: OpenQuestionEvent,
): Promise<SurfaceOpenQuestionResult> {
  const parsed = openQuestionEventSchema.parse(event);
  const start = Date.now();
  console.log(
    `[system-question-bridge STUB] source=${parsed.source} ` +
      `project=${parsed.project_id} q=${parsed.question.slice(0, 80)}`,
  );
  return {
    conversation_id: 0,
    bucket: SOURCE_TO_BUCKET[parsed.source] as 'requirements' | 'qfdResolved' | 'riskResolved',
    latency_ms: Date.now() - start,
  };
}
