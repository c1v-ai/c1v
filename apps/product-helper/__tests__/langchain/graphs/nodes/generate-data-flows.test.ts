/**
 * P10 success-path test for generate-data-flows.
 *
 * Per spawn-prompt deliverable #2 + qa-e-verifier static-scan rule:
 * the literal substring 'given fixture intake' MUST appear in the test
 * name. This is the v2.1.1 verifier-mistake correction (P10 resolution
 * recommendation #3).
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const persistArtifactMock = jest.fn(async () => undefined);
jest.mock('../../../../lib/langchain/graphs/nodes/_persist-artifact', () => ({
  persistArtifact: persistArtifactMock,
}));

import { generateDataFlows } from '../../../../lib/langchain/graphs/nodes/generate-data-flows';
import { createInitialState } from '../../../../lib/langchain/graphs/types';

describe('generate-data-flows P10 greenfield', () => {
  beforeEach(() => persistArtifactMock.mockClear());

  it('given fixture intake + upstream artifacts, produces non-empty data_flows.v1 within 30s', async () => {
    const state = createInitialState(99, 'P10 fixture', 'fixture vision', 1);
    await generateDataFlows(state);

    const readyCalls = persistArtifactMock.mock.calls.filter(
      (c) => (c[0] as { status: string }).status === 'ready' && (c[0] as { kind: string }).kind === 'data_flows_v1',
    );
    expect(readyCalls.length).toBeGreaterThan(0);
    const arg = readyCalls[0][0] as { result: { engine_evaluation: { decisions: unknown[]; total: number } }; inputsHash?: string };
    expect(arg.result).toBeDefined();
    expect(arg.result.engine_evaluation).toBeDefined();
    expect(arg.result.engine_evaluation.total).toBeGreaterThan(0);
    expect(Array.isArray(arg.result.engine_evaluation.decisions)).toBe(true);
    expect(arg.result.engine_evaluation.decisions.length).toBeGreaterThan(0);
  }, 30000);
});
