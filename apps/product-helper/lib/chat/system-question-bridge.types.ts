/**
 * system-question-bridge.types — Zod schemas for the OpenQuestion event.
 *
 * Shared transport contract between v2.1 Wave-A producers (M2 NFR / M6 HoQ /
 * M8 fmea-residual emitters) and v2.2 Wave-E `surface-gap.ts` producer.
 * Engine internals can change in v2.2 without re-editing this file because
 * `nfr_engine_contract_version: 'v1'` envelopes the event shape.
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

/**
 * Bucket key on extractedData.openQuestions where the ledger entry lands.
 * - m2_nfr      → requirements
 * - m6_qfd      → qfdResolved
 * - m8_residual → riskResolved
 * - wave_e_engine → requirements (fallback bucket; v2.2 may add a new key)
 */
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

/**
 * Ledger entry shape persisted under
 * `extractedData.openQuestions.<bucket>` as a JSON array.
 */
export const openQuestionLedgerEntrySchema = z.object({
  conversation_id: z.number().int().positive(),
  source: openQuestionSourceSchema,
  question: z.string(),
  computed_options: z.array(z.unknown()).optional(),
  math_trace: z.string().optional(),
  status: z.enum(['pending', 'answered']).default('pending'),
  created_at: z.string(),
  answered_at: z.string().optional(),
  reply_conversation_id: z.number().int().positive().optional(),
  reply_body: z.string().optional(),
});
export type OpenQuestionLedgerEntry = z.infer<
  typeof openQuestionLedgerEntrySchema
>;

/** Result of a successful surface call. */
export interface SurfaceOpenQuestionResult {
  conversation_id: number;
  bucket: 'requirements' | 'qfdResolved' | 'riskResolved';
  latency_ms: number;
}

/** Callback invoked when a user reply lands on a pending_answer row. */
export type OpenQuestionReplyHandler = (args: {
  reply_conversation_id: number;
  reply_body: string;
  pending_answer_id: number;
  source: OpenQuestionSource;
}) => void | Promise<void>;
