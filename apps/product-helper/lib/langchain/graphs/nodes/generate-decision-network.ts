/**
 * GENERATE_decision_network node — sibling to existing `generate_decision_matrix`.
 *
 * Per master plan v2.1 §Wave A coexistence rule (D-V21.25 / handoff Issue 4):
 * Decision Matrix (Cornell weighted-scoring view) and Decision Network
 * (Crawley DN-graph view) are SIBLINGS. Both run on every synthesis. This
 * node writes `kind='decision_network_v1'`; the existing node continues to
 * write `kind='decision_matrix_v1'`.
 *
 * `decision-net-agent.ts` exports utilities (no `runDecisionNetAgent`); the
 * node validates a stub from state via `validateDecisionNetworkArtifact` to
 * lock the contract. Live LLM path is the agent's portfolio-demo stance —
 * out of scope for v2.1.
 *
 * @module lib/langchain/graphs/nodes/generate-decision-network
 */

import { IntakeState } from '../types';
import { validateDecisionNetworkArtifact } from '../../agents/system-design/decision-net-agent';
import { persistArtifact } from './_persist-artifact';

const ARTIFACT_KIND = 'decision_network_v1';

export async function generateDecisionNetwork(
  state: IntakeState,
): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_decision_network] entered');
  const ed = state.extractedData as Record<string, unknown> | undefined;
  const stub = ed?.['decisionNetwork'];

  if (!stub) {
    console.warn('[GENERATE_decision_network] no upstream stub; persisting pending row');
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'pending' });
    return {};
  }

  try {
    const result = validateDecisionNetworkArtifact(stub);
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'ready', result });
    return {
      extractedData: {
        ...state.extractedData,
        decisionNetwork: result,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    console.error('[GENERATE_decision_network] failed:', reason);
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'failed', failureReason: reason });
    return { error: `generate_decision_network: ${reason}` };
  }
}
