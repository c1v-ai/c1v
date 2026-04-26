/**
 * TA1 ↔ TA3 indirection for project_artifacts queries.
 *
 * TA1's `project-artifacts-table` agent (c1v-runtime-wiring) ships the real
 * Drizzle table + queries (`getProjectArtifacts`, `upsertArtifactStatus`,
 * etc.) per master-plan v2.1 §Wave A and team-spawn TA1.
 * TA3 (this file's caller — synthesis-api-routes) consumes that surface.
 *
 * Until TA1's commit lands inside the same Wave-A dispatch, this bridge
 * resolves the imports lazily so TS compiles + Jest runs against the
 * existing schema. Once TA1 publishes, the static imports below replace
 * the dynamic resolution and this file collapses to a re-export.
 *
 * Single-edit point: when TA1 merges, change ONLY this file (swap the
 * lazy resolver for `export { getProjectArtifacts, upsertArtifactStatus,
 * type ProjectArtifactRow } from '@/lib/db/queries'`). The route + tests
 * keep their imports stable.
 */

/**
 * The 7 artifact kinds pre-created by POST /synthesize per spec.
 * Sidecar emits more (mermaid_*, n2_matrix_xlsx, decision_network_v1,
 * decision_matrix_v1) but those are OPTIONAL and surface as they complete.
 */
export const EXPECTED_ARTIFACT_KINDS = [
  'recommendation_json',
  'recommendation_html',
  'recommendation_pdf',
  'recommendation_pptx',
  'fmea_early_xlsx',
  'fmea_residual_xlsx',
  'hoq_xlsx',
] as const;

export type ExpectedArtifactKind = (typeof EXPECTED_ARTIFACT_KINDS)[number];

export type SynthesisStatus = 'pending' | 'ready' | 'failed';

/**
 * Row shape this file's consumers depend on. TA1's Drizzle row type MUST
 * be assignment-compatible with this interface; if TA1 drops a field, the
 * caller surface (status route + manifest extension) needs updating in
 * lockstep.
 */
export interface ProjectArtifactRow {
  id: string | number;
  projectId: number;
  artifactKind: string;
  storagePath: string | null;
  format: string | null;
  sha256: string | null;
  synthesisStatus: SynthesisStatus;
  inputsHash: string | null;
  synthesizedAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertArtifactStatusInput {
  projectId: number;
  kind: string;
  status: SynthesisStatus;
  storagePath?: string | null;
  format?: string | null;
  sha256?: string | null;
  inputsHash?: string | null;
  synthesizedAt?: Date | null;
  failureReason?: string | null;
}

type QueriesModule = {
  getProjectArtifacts?: (projectId: number) => Promise<ProjectArtifactRow[]>;
  upsertArtifactStatus?: (input: UpsertArtifactStatusInput) => Promise<ProjectArtifactRow>;
};

let cachedQueries: QueriesModule | null = null;

async function loadQueries(): Promise<QueriesModule> {
  if (cachedQueries) return cachedQueries;
  try {
    // Eslint/TS allow dynamic import here since the target file may not yet exist.
    cachedQueries = (await import('@/lib/db/queries')) as QueriesModule;
  } catch {
    cachedQueries = {};
  }
  return cachedQueries;
}

export async function getProjectArtifacts(
  projectId: number
): Promise<ProjectArtifactRow[]> {
  const mod = await loadQueries();
  if (!mod.getProjectArtifacts) {
    // TA1 not yet published — return empty list so status route degrades
    // to "still pending" rather than throwing.
    return [];
  }
  return mod.getProjectArtifacts(projectId);
}

export async function upsertArtifactStatus(
  input: UpsertArtifactStatusInput
): Promise<ProjectArtifactRow | null> {
  const mod = await loadQueries();
  if (!mod.upsertArtifactStatus) {
    // TA1 not yet published — log + no-op so the kickoff path doesn't 500.
    console.warn(
      `[artifacts-bridge] upsertArtifactStatus pre-TA1: project=${input.projectId} kind=${input.kind} status=${input.status}`
    );
    return null;
  }
  return mod.upsertArtifactStatus(input);
}

/** Test-only seam: reset the lazy import cache. */
export function __resetArtifactsBridgeCache(): void {
  cachedQueries = null;
}
