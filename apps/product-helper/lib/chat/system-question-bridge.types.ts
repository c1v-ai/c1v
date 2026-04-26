/**
 * system-question-bridge.types — Zod schemas for the OpenQuestion event.
 *
 * **STUB owned by langgraph-wirer (TA1 v2.1 Wave A).** open-questions-emitter
 * agent owns the canonical types — when their commit lands (currently on
 * `wave-a/ta1-emitter` at `86712ad`), the file body is overwritten while
 * the export surface remains stable.
 *
 * @module lib/chat/system-question-bridge.types
 */

import { z } from 'zod';

export const openQuestionSourceSchema = z.enum([
  'm2_nfr',
  'm6_qfd',
  'm8_residual',
  'wave_e_engine',
]);
export type OpenQuestionSource = z.infer<typeof openQuestionSourceSchema>;

export const SOURCE_TO_BUCKET = {
  m2_nfr: 'requirements',
  m6_qfd: 'qfdResolved',
  m8_residual: 'riskResolved',
  wave_e_engine: 'requirements',
} as const satisfies Record<OpenQuestionSource, string>;

export const openQuestionEventSchema = z.object({
  source: openQuestionSourceSchema,
  question: z.string().min(1),
  computed_options: z.array(z.unknown()).optional(),
  math_trace: z.string().optional(),
  project_id: z.number().int().positive(),
});
export type OpenQuestionEvent = z.infer<typeof openQuestionEventSchema>;

export interface SurfaceOpenQuestionResult {
  conversation_id: number;
  bucket: 'requirements' | 'qfdResolved' | 'riskResolved';
  latency_ms: number;
}

export type OpenQuestionReplyHandler = (args: {
  reply_conversation_id: number;
  reply_body: string;
  pending_answer_id: number;
  source: OpenQuestionSource;
}) => void | Promise<void>;
