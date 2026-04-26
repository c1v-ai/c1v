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

export async function persistArtifact(args: PersistArtifactArgs): Promise<void> {
  try {
    const sha = args.status === 'ready' && args.result !== undefined ? sha256Of(args.result) : null;
    await upsertArtifactStatus({
      projectId: args.projectId,
      kind: args.kind,
      status: args.status,
      format: args.format ?? 'json',
      sha256: sha,
      inputsHash: args.inputsHash ?? null,
      synthesizedAt: args.status === 'ready' ? new Date() : null,
      failureReason: args.failureReason ?? null,
    });
  } catch (err) {
    console.warn(
      `[persistArtifact] non-fatal upsertArtifactStatus failure (kind=${args.kind}):`,
      err instanceof Error ? err.message : err,
    );
  }
}
