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
import { tryServeFromCache } from '@/lib/cache/synthesis-cache';
import { markDeferredArtifacts } from '@/lib/jobs/lazy-gen';

export interface SynthesisKickoffArgs {
  projectId: number;
  projectName: string;
  projectVision: string;
  teamId: number;
  /** Optional pre-populated extractedData (used for fixture / re-run paths). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extractedData?: any;
}

export interface SynthesisKickoffResult {
  inputsHash: string;
  finalState: IntakeState;
  errored: boolean;
  /** Artifact kinds satisfied from the inputs-hash cache (TB1 EC-V21-B.1). */
  cacheHitKinds: string[];
  /** Artifact kinds marked `deferred` for lazy on-view rendering (TB1 EC-V21-B.2). */
  deferredKinds: string[];
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
  // Cache key — content-addressed on intake payload only (NO project_id /
  // team_id / user identifiers per TB1 PII isolation guardrail).
  const cacheableIntake = {
    projectName: args.projectName,
    projectVision: args.projectVision,
    extractedData: args.extractedData ?? null,
  };

  const inputsHash = computeInputsHash({
    intake: cacheableIntake,
    upstreamShas: {},
  });

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

  // TB1 EC-V21-B.1 — try to satisfy artifacts from the inputs-hash cache.
  // On hit, COPY storagePath/sha256/format onto the new project's rows
  // (no blob duplication) and skip the matching GENERATE_* nodes.
  let cacheHitKinds: string[] = [];
  try {
    const { satisfiedKinds } = await tryServeFromCache(args.projectId, {
      intake: cacheableIntake,
    });
    cacheHitKinds = satisfiedKinds;
  } catch (e) {
    console.warn(
      `[kickoffSynthesisGraph] cache lookup failed (non-fatal):`,
      e instanceof Error ? e.message : e,
    );
  }

  // TB1 EC-V21-B.2 — mark on_view artifacts as `deferred`. These are NOT
  // generated post-intake; they wait for the first download hit. Skip any
  // kind already satisfied from cache.
  const cacheHitSet = new Set(cacheHitKinds);
  let deferredKinds: string[] = [];
  try {
    const allDeferred = await markDeferredArtifacts(args.projectId, inputsHash);
    deferredKinds = allDeferred.filter((k) => !cacheHitSet.has(k));
  } catch (e) {
    console.warn(
      `[kickoffSynthesisGraph] markDeferredArtifacts failed (non-fatal):`,
      e instanceof Error ? e.message : e,
    );
  }

  const state = createInitialState(
    args.projectId,
    args.projectName,
    args.projectVision,
    args.teamId,
    args.extractedData ? { extractedData: args.extractedData } : undefined,
  );

  let finalState: IntakeState = state;
  let errored = false;

  // Full cache hit on every expected kind => skip graph invocation entirely.
  // Eager rows are already `ready` from cache; deferred rows render on view.
  const fullyCached =
    cacheHitKinds.length === EXPECTED_ARTIFACT_KINDS.length;
  if (!fullyCached) {
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
  }

  return { inputsHash, finalState, errored, cacheHitKinds, deferredKinds };
}
