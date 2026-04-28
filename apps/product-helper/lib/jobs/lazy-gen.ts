/**
 * lazy-gen — TB1 Wave-B (EC-V21-B.2).
 *
 * Splits the 7 expected synthesis artifacts into eager + on_view buckets.
 * Eager artifacts are generated post-intake on the synthesis kickoff. On_view
 * artifacts are pre-created with `synthesis_status='deferred'` and only
 * rendered when the first /api/projects/[id]/artifacts/[kind] hit fires the
 * sidecar's single-artifact retry path (TA3 owns the route extension; this
 * file specifies the contract).
 *
 * The map is hard-coded (configuration as data, not as env). Bumping this
 * surface forces a code review.
 *
 * @module lib/jobs/lazy-gen
 */

import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/lib/db/drizzle';
import {
  EXPECTED_ARTIFACT_KINDS,
  projectArtifacts,
  type ExpectedArtifactKind,
  type SynthesisStatus,
} from '@/lib/db/schema/project-artifacts';

/** Lazy-gen disposition for a given artifact kind. */
export type LazyMode = 'eager' | 'on_view';

/**
 * Master lazy-map. The 4 'on_view' kinds are the heavy renderers (PDF, PPTX,
 * residual FMEA xlsx, HoQ xlsx) that don't gate the synthesis page first
 * paint. The 3 'eager' kinds are the JSON/HTML keystone + the early FMEA
 * xlsx (cheap and visible by default).
 */
export const SYNTHESIS_LAZY_MAP: Record<ExpectedArtifactKind, LazyMode> = {
  recommendation_html: 'eager',
  recommendation_json: 'eager',
  fmea_early_xlsx: 'eager',
  recommendation_pdf: 'on_view',
  recommendation_pptx: 'on_view',
  fmea_residual_xlsx: 'on_view',
  hoq_xlsx: 'on_view',
};

/**
 * Extended status surface — `'deferred'` is the new lifecycle state surfaced
 * by lazy-gen. Stored in the existing `synthesis_status` text column; the
 * Drizzle type is intentionally widened beyond the original 3-element tuple.
 */
export type LazySynthesisStatus = SynthesisStatus | 'deferred';

export const DEFERRED_STATUS = 'deferred' as const;

export function getLazyMode(kind: ExpectedArtifactKind): LazyMode {
  return SYNTHESIS_LAZY_MAP[kind];
}

export function isDeferredKind(kind: string): kind is ExpectedArtifactKind {
  return (EXPECTED_ARTIFACT_KINDS as readonly string[]).includes(kind)
    && SYNTHESIS_LAZY_MAP[kind as ExpectedArtifactKind] === 'on_view';
}

export function isEagerKind(kind: string): kind is ExpectedArtifactKind {
  return (EXPECTED_ARTIFACT_KINDS as readonly string[]).includes(kind)
    && SYNTHESIS_LAZY_MAP[kind as ExpectedArtifactKind] === 'eager';
}

export const DEFERRED_KINDS: ExpectedArtifactKind[] = (EXPECTED_ARTIFACT_KINDS as readonly ExpectedArtifactKind[])
  .filter((k) => SYNTHESIS_LAZY_MAP[k] === 'on_view');

export const EAGER_KINDS: ExpectedArtifactKind[] = (EXPECTED_ARTIFACT_KINDS as readonly ExpectedArtifactKind[])
  .filter((k) => SYNTHESIS_LAZY_MAP[k] === 'eager');

/**
 * Mark every on_view artifact for a project as `deferred`. Called by
 * `kickoffSynthesisGraph` immediately after the pending pre-create, before
 * the graph runs. Eager rows stay `pending` and are flipped to `ready` by
 * their generator nodes.
 *
 * Idempotent — re-running on the same project is a no-op once rows are in
 * `deferred` (or beyond, e.g. `ready` if the user has already viewed).
 */
export async function markDeferredArtifacts(
  projectId: number,
  inputsHash: string,
): Promise<ExpectedArtifactKind[]> {
  const marked: ExpectedArtifactKind[] = [];

  for (const kind of DEFERRED_KINDS) {
    const existing = await db
      .select()
      .from(projectArtifacts)
      .where(
        and(
          eq(projectArtifacts.projectId, projectId),
          eq(projectArtifacts.artifactKind, kind),
        ),
      )
      .orderBy(desc(projectArtifacts.createdAt))
      .limit(1);

    if (existing[0]) {
      if (existing[0].synthesisStatus === 'pending') {
        await db
          .update(projectArtifacts)
          .set({
            synthesisStatus: DEFERRED_STATUS as SynthesisStatus,
            inputsHash,
          })
          .where(eq(projectArtifacts.id, existing[0].id));
        marked.push(kind);
      }
    } else {
      await db.insert(projectArtifacts).values({
        projectId,
        artifactKind: kind,
        synthesisStatus: DEFERRED_STATUS as SynthesisStatus,
        inputsHash,
      });
      marked.push(kind);
    }
  }

  return marked;
}

/**
 * Contract surfaced to TA3's route handler. When a deferred artifact is
 * requested via `/api/projects/[id]/artifacts/[kind]`, the route checks
 * `shouldFireOnViewRender` and, if true, calls the sidecar's single-artifact
 * retry endpoint, then flips the row to `pending` while the render runs.
 */
export function shouldFireOnViewRender(row: {
  synthesisStatus: string;
  artifactKind: string;
}): boolean {
  return row.synthesisStatus === DEFERRED_STATUS && isDeferredKind(row.artifactKind);
}
