/**
 * Wave A ↔ Wave E contract pin (`nfr_engine_contract_version: 'v1'`).
 *
 * Stable Zod envelope around `GENERATE_nfr` and `GENERATE_constants` graph-node
 * outputs. The envelope shape is the v2.1 ↔ v2.2 handshake; engine internals can
 * change in v2.2 (Wave E) without re-editing this file as long as the emitted
 * shape still parses against `nfrEngineContractV1Schema`. If the shape changes,
 * the version flag MUST bump (forces an explicit re-edit).
 *
 * Two output modes:
 *   - success: `{ status: 'ok', result, ... }` carries the engine's emission.
 *   - needs_user_input: `{ status: 'needs_user_input', computed_options,
 *     math_trace }` routes to `system-question-bridge.surfaceOpenQuestion`
 *     (NOT a thrown error).
 *
 * @module lib/langchain/graphs/contracts/nfr-engine-contract-v1
 */

import { z } from 'zod';

export const NFR_ENGINE_CONTRACT_VERSION = 'v1' as const;

const envelopeBase = {
  nfr_engine_contract_version: z.literal('v1'),
  synthesized_at: z.string(),
  inputs_hash: z.string(),
};

/** Status: ok — engine produced its emission. */
export const successEnvelopeSchema = z.object({
  ...envelopeBase,
  status: z.literal('ok'),
  result: z.unknown(),
});

/**
 * Status: needs_user_input — engine could not commit to an emission. The graph
 * node MUST NOT throw; it routes the event to `surfaceOpenQuestion` and exits
 * the node without a result. `computed_options` enumerate the engine's
 * candidate answers (so chat can render them as picks); `math_trace` is the
 * derivation log surfaced to the user.
 */
export const needsUserInputEnvelopeSchema = z.object({
  ...envelopeBase,
  status: z.literal('needs_user_input'),
  computed_options: z.array(z.unknown()).default([]),
  math_trace: z.string(),
});

export const nfrEngineContractV1Schema = z.discriminatedUnion('status', [
  successEnvelopeSchema,
  needsUserInputEnvelopeSchema,
]);

export type NfrEngineContractV1 = z.infer<typeof nfrEngineContractV1Schema>;
export type SuccessEnvelope = z.infer<typeof successEnvelopeSchema>;
export type NeedsUserInputEnvelope = z.infer<typeof needsUserInputEnvelopeSchema>;

export function isNeedsUserInput(env: NfrEngineContractV1): env is NeedsUserInputEnvelope {
  return env.status === 'needs_user_input';
}
