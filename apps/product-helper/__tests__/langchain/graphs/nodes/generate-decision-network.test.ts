/**
 * P10 success-path test for generate-decision-network.
 *
 * Per spawn-prompt deliverable #2 + qa-e-verifier static-scan rule:
 * the literal substring 'given fixture intake' MUST appear in the test name.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const persistArtifactMock = jest.fn(async () => undefined);
jest.mock('../../../../lib/langchain/graphs/nodes/_persist-artifact', () => ({
  persistArtifact: persistArtifactMock,
}));

import { generateDecisionNetwork } from '../../../../lib/langchain/graphs/nodes/generate-decision-network';
import { createInitialState } from '../../../../lib/langchain/graphs/types';

describe('generate-decision-network P10 greenfield', () => {
  beforeEach(() => persistArtifactMock.mockClear());

  it('given fixture intake + upstream artifacts, produces non-empty decision_network.v1 within 30s', async () => {
    const state = createInitialState(99, 'P10 fixture', 'fixture vision', 1);
    await generateDecisionNetwork(state);

    const readyCalls = persistArtifactMock.mock.calls.filter(
      (c) => (c[0] as { status: string }).status === 'ready' && (c[0] as { kind: string }).kind === 'decision_network_v1',
    );
    expect(readyCalls.length).toBeGreaterThan(0);
    const arg = readyCalls[0][0] as { result: { engine_evaluation: { decisions: unknown[]; total: number } } };
    expect(arg.result.engine_evaluation.total).toBeGreaterThan(0);
    expect(arg.result.engine_evaluation.decisions.length).toBeGreaterThan(0);
  }, 30000);
});
