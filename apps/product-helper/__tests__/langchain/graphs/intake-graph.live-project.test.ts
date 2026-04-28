/**
 * P10 e2e live-project test (verifier-owned).
 *
 * Asserts that running ALL 7 NEW v2.1 generate-* nodes from a fixture
 * project state transitions every project_artifacts row from pending to
 * ready — closing EC-V21-E.14 (engine-prod-swap dependency).
 *
 * Coverage scope:
 *   - 7 NEW v2.1 nodes (P10 greenfield refactor):
 *       generate_data_flows        → data_flows_v1
 *       generate_form_function     → form_function_map_v1
 *       generate_decision_network  → decision_network_v1
 *       generate_n2                → n2_matrix_v1
 *       generate_fmea_early        → fmea_early_v1
 *       generate_fmea_residual     → fmea_residual_v1
 *       generate_synthesis         → recommendation_json
 *
 * The 4 pre-v2.1 nodes (generate_qfd / generate_interfaces / generate_ffbd /
 * generate_decision_matrix) are out of scope for the P10 refactor per spawn
 * prompt — they're not modified, so this test does NOT assert their status
 * transitions. The "11 project_artifacts rows" framing in the master plan
 * combines this 7 + the 4 already-shipped legacy paths.
 *
 * Per spawn-prompt deliverable #3: fixture LLM mocks for determinism;
 * matches v2.1.1 e2e mock pattern.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const persistArtifactMock = jest.fn(async () => undefined);
jest.mock('../../../lib/langchain/graphs/nodes/_persist-artifact', () => ({
  persistArtifact: persistArtifactMock,
}));

// Determinism — extraction-agent must not call live LLMs.
jest.mock('../../../lib/langchain/agents/extraction-agent', () => ({
  extractProjectData: jest.fn(async () => null),
  mergeExtractionData: jest.fn((a: unknown) => a),
  calculateCompleteness: jest.fn(() => 0),
}));

import { generateDataFlows } from '../../../lib/langchain/graphs/nodes/generate-data-flows';
import { generateFormFunction } from '../../../lib/langchain/graphs/nodes/generate-form-function';
import { generateDecisionNetwork } from '../../../lib/langchain/graphs/nodes/generate-decision-network';
import { generateN2 } from '../../../lib/langchain/graphs/nodes/generate-n2';
import { generateFmeaEarly } from '../../../lib/langchain/graphs/nodes/generate-fmea-early';
import { generateFmeaResidual } from '../../../lib/langchain/graphs/nodes/generate-fmea-residual';
import { generateSynthesis } from '../../../lib/langchain/graphs/nodes/generate-synthesis';
import { createInitialState } from '../../../lib/langchain/graphs/types';
import type { IntakeState } from '../../../lib/langchain/graphs/types';

const NEW_V21_NODES = [
  ['generate_data_flows', 'data_flows_v1', generateDataFlows],
  ['generate_form_function', 'form_function_map_v1', generateFormFunction],
  ['generate_decision_network', 'decision_network_v1', generateDecisionNetwork],
  ['generate_n2', 'n2_matrix_v1', generateN2],
  ['generate_fmea_early', 'fmea_early_v1', generateFmeaEarly],
  ['generate_fmea_residual', 'fmea_residual_v1', generateFmeaResidual],
  ['generate_synthesis', 'recommendation_json', generateSynthesis],
] as const;

function fixtureLiveProject(): IntakeState {
  return createInitialState(
    101,
    'P10 e2e fixture project',
    'A portfolio-grade architecture-recommendation pipeline',
    1,
  ) as IntakeState;
}

describe('P10 live-project e2e — 7-of-7 NEW v2.1 nodes pending→ready', () => {
  beforeEach(() => persistArtifactMock.mockClear());

  it('given fixture intake at completion, all 7 NEW v2.1 nodes persist status=ready (engine substrate-read, nfrImpl=engine)', async () => {
    const state = fixtureLiveProject();

    // Run all 7 NEW v2.1 nodes in disposition order (per master plan v2.1
    // Wave A disposition table). Order: data-flows → form-function →
    // decision-network → n2 → fmea-early → fmea-residual → synthesis.
    for (const [, , node] of NEW_V21_NODES) {
      await node(state);
    }

    // Assert: every NEW v2.1 kind appears with status='ready' at least once.
    const readyByKind = new Map<string, number>();
    for (const call of persistArtifactMock.mock.calls) {
      const arg = call[0] as { kind: string; status: string };
      if (arg.status === 'ready') {
        readyByKind.set(arg.kind, (readyByKind.get(arg.kind) ?? 0) + 1);
      }
    }

    const expectedKinds = NEW_V21_NODES.map(([, k]) => k);
    for (const kind of expectedKinds) {
      expect(readyByKind.get(kind) ?? 0).toBeGreaterThanOrEqual(1);
    }

    // Assert: zero pending rows from the 7 NEW nodes (P10 closure invariant).
    const pendingFromNewNodes = persistArtifactMock.mock.calls.filter((c) => {
      const arg = c[0] as { kind: string; status: string };
      return arg.status === 'pending' && expectedKinds.includes(arg.kind as typeof expectedKinds[number]);
    });
    expect(pendingFromNewNodes.length).toBe(0);

    // Assert: all 7 calls carry projectId from state (multi-tenant safety).
    for (const call of persistArtifactMock.mock.calls) {
      const arg = call[0] as { projectId: number };
      expect(arg.projectId).toBe(101);
    }
  }, 60000);

  it('given fixture intake, every NEW v2.1 ready row carries non-empty engine_evaluation', async () => {
    persistArtifactMock.mockClear();
    const state = fixtureLiveProject();
    for (const [, , node] of NEW_V21_NODES) {
      await node(state);
    }

    const readyCalls = persistArtifactMock.mock.calls.filter(
      (c) => (c[0] as { status: string }).status === 'ready',
    );

    for (const call of readyCalls) {
      const arg = call[0] as {
        result: { engine_evaluation: { decisions: unknown[]; total: number; story_id: string }; nfr_engine_contract_version: string };
      };
      expect(arg.result.nfr_engine_contract_version).toBe('v1');
      expect(arg.result.engine_evaluation).toBeDefined();
      expect(arg.result.engine_evaluation.total).toBeGreaterThan(0);
      expect(arg.result.engine_evaluation.story_id).toBeTruthy();
    }
  }, 60000);
});
