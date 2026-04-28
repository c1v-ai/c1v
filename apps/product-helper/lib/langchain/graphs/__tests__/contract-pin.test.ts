/**
 * Contract-pin tests (v2.1 Wave A ↔ Wave E handshake).
 *
 * Pins the Zod envelope shape for `GENERATE_nfr` / `GENERATE_constants`. v2.2
 * Wave E swaps the engine internals; this test fires on both v2.1
 * (LLM-stub) and v2.2 (engine-first) shapes. If the envelope changes, the
 * version flag MUST bump to 'v2' and this test moves with it.
 *
 * @module graphs/__tests__/contract-pin.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import {
  nfrEngineContractV1Schema,
  successEnvelopeSchema,
  needsUserInputEnvelopeSchema,
  isNeedsUserInput,
  NFR_ENGINE_CONTRACT_VERSION,
} from '../contracts/nfr-engine-contract-v1';
import {
  computeInputsHash,
  canonicalStringify,
  sha256Of,
} from '../contracts/inputs-hash';

describe('NFR engine contract v1 — envelope shape', () => {
  const baseEnvelope = {
    nfr_engine_contract_version: 'v1' as const,
    synthesized_at: '2026-04-25T22:00:00Z',
    inputs_hash: 'a'.repeat(64),
  };

  it('parses an ok envelope with arbitrary result payload', () => {
    const parsed = successEnvelopeSchema.parse({
      ...baseEnvelope,
      status: 'ok',
      result: { nfrs: [{ id: 'NFR.01', text: 'shall ...' }] },
    });
    expect(parsed.status).toBe('ok');
    expect(parsed.nfr_engine_contract_version).toBe('v1');
  });

  it('parses a needs_user_input envelope with computed_options + math_trace', () => {
    const parsed = needsUserInputEnvelopeSchema.parse({
      ...baseEnvelope,
      status: 'needs_user_input',
      computed_options: [{ id: 'opt-1' }, { id: 'opt-2' }],
      math_trace: 'p95 budget = 3000ms; computed 2 candidates',
    });
    expect(parsed.status).toBe('needs_user_input');
    expect(parsed.computed_options).toHaveLength(2);
  });

  it('discriminated union routes by status', () => {
    const ok = nfrEngineContractV1Schema.parse({
      ...baseEnvelope,
      status: 'ok',
      result: 42,
    });
    expect(isNeedsUserInput(ok)).toBe(false);

    const need = nfrEngineContractV1Schema.parse({
      ...baseEnvelope,
      status: 'needs_user_input',
      computed_options: [],
      math_trace: 'cant decide',
    });
    expect(isNeedsUserInput(need)).toBe(true);
  });

  it('rejects an envelope with missing version flag', () => {
    expect(() =>
      successEnvelopeSchema.parse({
        // nfr_engine_contract_version omitted
        synthesized_at: '2026-04-25T22:00:00Z',
        inputs_hash: 'a'.repeat(64),
        status: 'ok',
        result: null,
      }),
    ).toThrow();
  });

  it('exposes the canonical version constant', () => {
    expect(NFR_ENGINE_CONTRACT_VERSION).toBe('v1');
  });
});

describe('inputs_hash — content-addressed sha256 (EC-V21-A.12)', () => {
  it('canonical stringify sorts object keys recursively', () => {
    const a = canonicalStringify({ b: 1, a: 2 });
    const b = canonicalStringify({ a: 2, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":2,"b":1}');
  });

  it('produces stable hash across re-runs with identical inputs', () => {
    const args = {
      intake: { projectId: 1, projectName: 'x', projectVision: 'y' },
      upstreamShas: { mod_a: 'aa', mod_b: 'bb' },
    };
    const h1 = computeInputsHash(args);
    const h2 = computeInputsHash(args);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when intake payload changes', () => {
    const h1 = computeInputsHash({ intake: { v: 1 } });
    const h2 = computeInputsHash({ intake: { v: 2 } });
    expect(h1).not.toBe(h2);
  });

  it('changes when upstream sha changes', () => {
    const h1 = computeInputsHash({ intake: {}, upstreamShas: { x: 'aa' } });
    const h2 = computeInputsHash({ intake: {}, upstreamShas: { x: 'bb' } });
    expect(h1).not.toBe(h2);
  });

  it('insensitive to upstream key insertion order', () => {
    const h1 = computeInputsHash({ intake: {}, upstreamShas: { a: '1', b: '2' } });
    const h2 = computeInputsHash({ intake: {}, upstreamShas: { b: '2', a: '1' } });
    expect(h1).toBe(h2);
  });

  it('sha256Of round-trips canonical JSON', () => {
    const h = sha256Of({ k: 'v' });
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});
