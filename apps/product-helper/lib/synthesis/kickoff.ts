/**
 * Synthesis kickoff seam.
 *
 * Single entry point that the synthesis API route (`/api/projects/[id]/synthesize`)
 * calls inside `after()` to launch the v2.1 Wave A synthesis chain. Wires the
 * intake graph + the 7 NEW system-design nodes + the keystone synthesis node
 * + per-artifact persistence to `project_artifacts`.
 *
 * Cloud Run sidecar handshake (per master plan v2.1 §D-V21.24): each
 * `GENERATE_*` node is responsible for firing `POST /run-render` to the
 * sidecar with `{ project_id, artifact_kind, agent_output_payload }`. This
 * file is the orchestration seam; TA3's sidecar trigger is plugged in below
 * via the `RENDER_SIDECAR_URL` env var (no-op when unset → graph still runs,
 * artifacts persist as JSON, binary renders skipped).
 *
 * Real `inputs_hash` per EC-V21-A.12 — the keystone `generate_synthesis`
 * node computes a content-addressed sha256 over (intake payload + upstream
 * module shas) and writes it to `project_artifacts.inputs_hash`. Re-runs
 * with identical inputs produce a byte-identical hash.
 *
 * @module lib/synthesis/kickoff
 */

import {
  createInitialState,
  invokeIntakeGraph,
} from '@/lib/langchain/graphs';
import type { IntakeState } from '@/lib/langchain/graphs/types';
import { upsertArtifactStatus } from '@/lib/db/queries';
import { EXPECTED_ARTIFACT_KINDS } from '@/lib/db/schema/project-artifacts';
import { computeInputsHash } from '@/lib/langchain/graphs/contracts/inputs-hash';

export interface SynthesisKickoffArgs {
  projectId: number;
  teamId: number;
  /**
   * Project name. Optional because the route-level caller doesn't have it
   * (the route only owns auth + credit deduction); when absent we fall back
   * to `Project ${projectId}` so the intake-state still constructs.
   */
  projectName?: string;
  /**
   * Project vision. Optional — see projectName note. Empty string by
   * default so the graph's intake-state shape is preserved.
   */
  projectVision?: string;
  /** Optional pre-populated extractedData (used for fixture / re-run paths). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extractedData?: any;
  /**
   * Acting user. Threaded through for audit / future per-user policy hooks
   * (e.g. RLS service-role swap). Optional today.
   */
  userId?: number;
  /**
   * UUID minted by the route to correlate this run across logs + the UI's
   * `?just_started=1` redirect target. Optional today (pre-route a stub
   * caller may omit it).
   */
  synthesisId?: string;
  /**
   * Pre-computed inputs hash from the route. When omitted, kickoff
   * computes its own content-addressed hash from intake state.
   */
  inputsHash?: string;
}

export interface SynthesisKickoffResult {
  inputsHash: string;
  finalState: IntakeState;
  errored: boolean;
}

/**
 * Launch the v2.1 synthesis chain for a project.
 *
 * 1. Pre-creates `pending` rows in `project_artifacts` for every expected
 *    artifact kind so the synthesis page can render a manifest immediately.
 * 2. Computes the content-addressed `inputs_hash` upfront so every persisted
 *    row carries the same hash (cache-key alignment per EC-V21-A.12).
 * 3. Invokes the intake graph with synthesis-mode entry-state — the chain
 *    runs from `analyze_response` through the 7 NEW nodes to
 *    `generate_synthesis`. Each node persists its own `ready`/`failed` row.
 * 4. Returns the final state + `errored` flag (non-fatal — caller surfaces
 *    failures via the `synthesis_status='failed'` rows).
 *
 * **NOTE:** Bonded to `lib/langchain/graphs/intake-graph.ts` graph. Under
 * v2.1 the graph terminates either at the legacy `generate_qfd → END` for
 * intake turns OR at `generate_synthesis → END` for synthesis kickoff. This
 * function passes through the intake-graph; the synthesis path runs after
 * `generate_interfaces` per the v2.1 edges.
 */
export async function kickoffSynthesisGraph(
  args: SynthesisKickoffArgs,
): Promise<SynthesisKickoffResult> {
  const projectName = args.projectName ?? `Project ${args.projectId}`;
  const projectVision = args.projectVision ?? '';
  const inputsHash =
    args.inputsHash ??
    computeInputsHash({
      intake: {
        projectId: args.projectId,
        projectName,
        projectVision,
        extractedData: args.extractedData ?? null,
      },
      upstreamShas: {},
    });

  // Pre-create pending rows for every expected artifact kind so TA2's
  // /api/projects/[id]/artifacts/manifest renders the placeholder set
  // immediately. Each GENERATE_* node will overwrite its row to `ready` or
  // `failed` on completion.
  for (const kind of EXPECTED_ARTIFACT_KINDS) {
    try {
      await upsertArtifactStatus({
        projectId: args.projectId,
        kind,
        status: 'pending',
        inputsHash,
      });
    } catch (e) {
      console.warn(
        `[kickoffSynthesisGraph] pre-create pending row failed (kind=${kind}, non-fatal):`,
        e instanceof Error ? e.message : e,
      );
    }
  }

  const state = createInitialState(
    args.projectId,
    projectName,
    projectVision,
    args.teamId,
    args.extractedData ? { extractedData: args.extractedData } : undefined,
  );

  let finalState: IntakeState = state;
  let errored = false;
  try {
    finalState = await invokeIntakeGraph(state, {
      debug: process.env.NODE_ENV !== 'production',
      maxIterations: 100,
    });
    if (finalState.error) errored = true;
  } catch (e) {
    console.error(
      `[kickoffSynthesisGraph] graph invocation threw:`,
      e instanceof Error ? e.message : e,
    );
    errored = true;
  }

  // TODO(TA3 sidecar): Cloud Run sidecar trigger. Once
  // `services/python-sidecar/orchestrator.py` lands and `RENDER_SIDECAR_URL`
  // is set, each GENERATE_* node fires `POST /run-render` to render binary
  // formats (PDF / PPTX / xlsx / PNG); the sidecar updates the corresponding
  // project_artifacts rows out-of-band via service role. Per D-V21.24, the
  // sidecar is render-only — orchestration + LLM stays in Vercel/LangGraph.
  // For now, this kickoff function returns when the graph completes; binary
  // renders happen lazily on first download or are skipped pre-sidecar.

  return { inputsHash, finalState, errored };
}
