/**
 * P10 success-path test for generate-synthesis (T6 keystone).
 *
 * Per spawn-prompt deliverable #2 + qa-e-verifier static-scan rule:
 * the literal substring 'given fixture intake' MUST appear in the test name.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const persistArtifactMock = jest.fn(async () => undefined);
jest.mock('../../../../lib/langchain/graphs/nodes/_persist-artifact', () => ({
  persistArtifact: persistArtifactMock,
}));

import { generateSynthesis } from '../../../../lib/langchain/graphs/nodes/generate-synthesis';
import { createInitialState } from '../../../../lib/langchain/graphs/types';

describe('generate-synthesis P10 greenfield', () => {
  beforeEach(() => persistArtifactMock.mockClear());

  it('given fixture intake + upstream artifacts, produces non-empty architecture_recommendation.v1 within 30s', async () => {
    const state = createInitialState(99, 'P10 fixture', 'fixture vision', 1);
    await generateSynthesis(state);

    const readyCalls = persistArtifactMock.mock.calls.filter(
      (c) => (c[0] as { status: string }).status === 'ready' && (c[0] as { kind: string }).kind === 'recommendation_json',
    );
    expect(readyCalls.length).toBeGreaterThan(0);
    const arg = readyCalls[0][0] as {
      result: { engine_evaluation: { decisions: unknown[]; total: number }; payload: { upstream_shas: Record<string, string> } };
      inputsHash?: string;
    };
    expect(arg.result.engine_evaluation.total).toBeGreaterThan(0);
    expect(arg.result.engine_evaluation.decisions.length).toBeGreaterThan(0);
    expect(arg.result.payload.upstream_shas).toBeDefined();
    expect(arg.inputsHash).toMatch(/^[a-f0-9]{64}$/);
  }, 30000);
});
