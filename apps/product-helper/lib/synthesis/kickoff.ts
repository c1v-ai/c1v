/**
 * Vercel-side LangGraph kickoff for the synthesis pipeline (per D-V21.24).
 *
 * Boundary contract: POST /api/projects/[id]/synthesize triggers this
 * function in a fire-and-forget pattern (Vercel `waitUntil` if available,
 * else a detached promise). It does NOT post to Cloud Run directly —
 * each LangGraph GENERATE_* node owns its own `POST /run-render` invocation
 * to the sidecar. TA1's `langgraph-wirer` owns the per-node integration;
 * TA3 (this file) owns the kickoff seam + invoker IAM context-setup.
 *
 * Wave-A interim: the actual graph invocation is wired by TA1 inside
 * the same dispatch wave. Until TA1's commit lands, this stub logs and
 * returns. The route on top of this seam is shipped + tested first so
 * TA1's wiring slots in without route churn (single-edit point).
 *
 * v2.2 may swap waitUntil → Vercel-compatible queue (QStash / Inngest) if
 * intake exceeds the function ceiling. Caller MUST treat this as detached.
 */

export interface SynthesisKickoffInput {
  projectId: number;
  teamId: number;
  userId: number;
  synthesisId: string;
  inputsHash?: string;
}

/**
 * Fire the Vercel-side LangGraph for a synthesis run. MUST be called from
 * inside a route's `waitUntil` (or equivalent detached-promise pattern) —
 * this function may take longer than a normal request budget.
 *
 * Failure mode: any thrown error is logged + swallowed (the per-artifact
 * `synthesis_status='failed'` writes happen at the GENERATE_* node layer
 * via TA1's queries). The route caller has already returned 202 to the UI
 * by the time this runs.
 */
export async function kickoffSynthesisGraph(
  input: SynthesisKickoffInput
): Promise<void> {
  try {
    // TA1's langgraph-wirer will replace the body of this try block with:
    //   const { invokeIntakeGraph } = await import('@/lib/langchain/graphs/intake-graph');
    //   await invokeIntakeGraph({ ...initialStateForSynthesis, projectId, teamId, userId, synthesisId }, { configurable: { thread_id: synthesisId } });
    // The 7 GENERATE_* nodes (data_flows, form_function, decision_network,
    // n2, fmea_early, fmea_residual, synthesis) each fire POST /run-render
    // to the Cloud Run sidecar with the agent's output payload.
    console.log(
      `[synthesis-kickoff] pre-TA1 stub: project=${input.projectId} team=${input.teamId} user=${input.userId} synthesisId=${input.synthesisId}`
    );
  } catch (err) {
    console.error('[synthesis-kickoff] graph invocation failed (detached):', err);
  }
}
