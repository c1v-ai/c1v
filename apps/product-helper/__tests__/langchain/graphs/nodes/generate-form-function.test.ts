/**
 * P10 success-path test for generate-form-function.
 *
 * Per spawn-prompt deliverable #2 + qa-e-verifier static-scan rule:
 * the literal substring 'given fixture intake' MUST appear in the test
 * name.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const persistArtifactMock = jest.fn(async () => undefined);
jest.mock('../../../../lib/langchain/graphs/nodes/_persist-artifact', () => ({
  persistArtifact: persistArtifactMock,
}));

import { generateFormFunction } from '../../../../lib/langchain/graphs/nodes/generate-form-function';
import { createInitialState } from '../../../../lib/langchain/graphs/types';

describe('generate-form-function P10 greenfield', () => {
  beforeEach(() => persistArtifactMock.mockClear());

  it('given fixture intake + upstream artifacts, produces non-empty form_function_map.v1 within 30s', async () => {
    const state = createInitialState(99, 'P10 fixture', 'fixture vision', 1);
    await generateFormFunction(state);

    const readyCalls = persistArtifactMock.mock.calls.filter(
      (c) => (c[0] as { status: string }).status === 'ready' && (c[0] as { kind: string }).kind === 'form_function_map_v1',
    );
    expect(readyCalls.length).toBeGreaterThan(0);
    const arg = readyCalls[0][0] as { result: { engine_evaluation: { decisions: unknown[]; total: number } } };
    expect(arg.result.engine_evaluation.total).toBeGreaterThan(0);
    expect(arg.result.engine_evaluation.decisions.length).toBeGreaterThan(0);
  }, 30000);
});
