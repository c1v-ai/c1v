/**
 * Shared persistence helper for v2.1 GENERATE_* graph nodes.
 *
 * Every node persists its output (or its lifecycle state) to
 * `project_artifacts` via TA1's `upsertArtifactStatus` query. Failures here
 * are logged but never thrown — the graph node's own state update is
 * authoritative for downstream nodes; the artifact row is observability /
 * download-manifest plumbing.
 *
 * @module lib/langchain/graphs/nodes/_persist-artifact
 */

import { upsertArtifactStatus } from '@/lib/db/queries';
import type { SynthesisStatus } from '@/lib/db/schema/project-artifacts';
import { uploadStorageObject } from '@/lib/storage/supabase-storage';
import { runWithCircuitBreaker } from '@/lib/jobs/circuit-breaker';
import { sha256Of } from '../contracts/inputs-hash';

export interface PersistArtifactArgs {
  projectId: number;
  kind: string;
  status: SynthesisStatus;
  result?: unknown;
  format?: string;
  inputsHash?: string | null;
  failureReason?: string | null;
}

const SIDECAR_DERIVATIVES: Record<string, string[]> = {
  hoq_v1: ['hoq_xlsx'],
  fmea_early_v1: ['fmea_early_xlsx'],
  fmea_residual_v1: ['fmea_residual_xlsx'],
  n2_matrix_v1: ['n2_matrix_xlsx'],
  decision_network_v1: ['decision_network_xlsx', 'decision_network_svg'],
  form_function_map_v1: [
    'form_function_map_xlsx',
    'form_function_map_svg',
    'form_function_map_mmd',
  ],
};

function jsonStoragePath(projectId: number, kind: string): string {
  return `project-artifacts/${projectId}/${kind}.json`;
}

async function uploadJsonArtifact(
  projectId: number,
  kind: string,
  result: unknown,
): Promise<string | null> {
  const storagePath = jsonStoragePath(projectId, kind);
  try {
    await uploadStorageObject({
      storagePath,
      body: JSON.stringify(result, null, 2),
      contentType: 'application/json; charset=utf-8',
      upsert: true,
    });
    return storagePath;
  } catch (err) {
    console.warn(
      `[persistArtifact] JSON storage upload failed (kind=${kind}):`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

async function dispatchSidecarDerivatives(args: {
  projectId: number;
  sourceKind: string;
  result: unknown;
  inputsHash?: string | null;
}): Promise<void> {
  const derivativeKinds = SIDECAR_DERIVATIVES[args.sourceKind] ?? [];
  if (derivativeKinds.length === 0) return;

  const sidecarBase = process.env.RENDER_SIDECAR_URL;
  if (!sidecarBase) {
    return;
  }

  await Promise.allSettled(
    derivativeKinds.map(async (kind) => {
      await upsertArtifactStatus({
        projectId: args.projectId,
        kind,
        status: 'pending',
        inputsHash: args.inputsHash ?? null,
        failureReason: null,
      });

      await runWithCircuitBreaker({
        projectId: args.projectId,
        artifactKind: kind,
        invoke: async (signal) => {
          const response = await fetch(`${sidecarBase}/run-render`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            signal,
            body: JSON.stringify({
              project_id: args.projectId,
              artifact_kind: kind,
              agent_output_payload: args.result,
            }),
          });

          const text = await response.text();
          let body: { ok?: boolean; failure_reason?: string } | null = null;
          try {
            body = text ? JSON.parse(text) : null;
          } catch {
            body = null;
          }

          if (!response.ok || body?.ok === false) {
            throw new Error(
              body?.failure_reason ??
                `sidecar render failed: ${response.status} ${text.slice(0, 300)}`,
            );
          }

          return body;
        },
      });
    }),
  );
}

export async function persistArtifact(args: PersistArtifactArgs): Promise<void> {
  try {
    const sha = args.status === 'ready' && args.result !== undefined ? sha256Of(args.result) : null;
    const storagePath =
      args.status === 'ready' && args.result !== undefined
        ? await uploadJsonArtifact(args.projectId, args.kind, args.result)
        : null;

    await upsertArtifactStatus({
      projectId: args.projectId,
      kind: args.kind,
      status: args.status,
      format: args.format ?? 'json',
      sha256: sha,
      storagePath,
      inputsHash: args.inputsHash ?? null,
      synthesizedAt: args.status === 'ready' ? new Date() : null,
      failureReason: args.failureReason ?? null,
    });

    if (args.status === 'ready' && args.result !== undefined) {
      await dispatchSidecarDerivatives({
        projectId: args.projectId,
        sourceKind: args.kind,
        result: args.result,
        inputsHash: args.inputsHash ?? null,
      });
    }
  } catch (err) {
    console.warn(
      `[persistArtifact] non-fatal upsertArtifactStatus failure (kind=${args.kind}):`,
      err instanceof Error ? err.message : err,
    );
  }
}
