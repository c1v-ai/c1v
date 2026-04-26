/**
 * synthesis-cache — TB1 Wave-B (EC-V21-B.1).
 *
 * Inputs-hash-keyed cache for the 7 synthesis artifacts. When a new project's
 * canonical intake payload + upstream module shas hash to a value that matches
 * a prior project's `project_artifacts.inputs_hash` (with `synthesis_status =
 * 'ready'`), we COPY the cached storage_path / sha256 onto a new row for the
 * new project. The blob in Supabase Storage is shared — no duplication, no
 * extra storage cost — and the new project's row is marked `ready` so the
 * downstream graph nodes skip the corresponding generators.
 *
 * Hash provenance:
 *   - Reuses the canonical `computeInputsHash` helper at
 *     `lib/langchain/graphs/contracts/inputs-hash.ts` (handoff Issue 15: do
 *     NOT rebuild). Hash inputs are content-addressed on the canonical intake
 *     shape + upstream shas; project_id / team_id / user identifiers are NOT
 *     included.
 *
 * Cache validity:
 *   - A row with `synthesis_status = 'ready'` AND non-null `storage_path` is
 *     considered cacheable. Failed/pending rows are ignored.
 *   - Bumping any agent version => caller passes a new `agentVersions` map =>
 *     hash changes => cache miss. No cache invalidation API is exposed on
 *     this module — rotation is implicit through the hash.
 *   - Tenant identifiers MUST NOT enter the hash (PII isolation). Cache hits
 *     therefore cross-tenant; the storage blob is shared but the per-tenant
 *     `project_artifacts` row carries the requesting project_id, so RLS
 *     surfacing remains tenant-scoped.
 *
 * @module lib/cache/synthesis-cache
 */

import { and, desc, eq, isNotNull } from 'drizzle-orm';

import { db } from '@/lib/db/drizzle';
import {
  EXPECTED_ARTIFACT_KINDS,
  projectArtifacts,
  type ExpectedArtifactKind,
  type ProjectArtifactRow,
} from '@/lib/db/schema/project-artifacts';
import {
  computeInputsHash,
  type InputsHashParts,
} from '@/lib/langchain/graphs/contracts/inputs-hash';

export interface SynthesisCacheKeyArgs {
  /** Canonical intake payload — projectName/projectVision/extractedData. NO tenant identifiers. */
  intake: unknown;
  /** Sha256s of upstream module artifacts. */
  upstreamShas?: Record<string, string>;
  /** Optional agent-version map (e.g. `{ synthesis: 'v2', hoq: 'v1' }`). Bumping invalidates cache. */
  agentVersions?: Record<string, string>;
}

export interface CachedArtifactSeed {
  artifactKind: string;
  storagePath: string;
  sha256: string | null;
  format: string | null;
  inputsHash: string;
}

export interface CacheLookupHit {
  hit: true;
  inputsHash: string;
  /** One row per artifact_kind (latest ready row of each kind). */
  cachedArtifacts: CachedArtifactSeed[];
}

export interface CacheLookupMiss {
  hit: false;
  inputsHash: string;
}

export type CacheLookupResult = CacheLookupHit | CacheLookupMiss;

/**
 * Compute the cache key for a synthesis run. Pure — same inputs => same hex.
 */
export function deriveCacheKey(args: SynthesisCacheKeyArgs): string {
  const parts: InputsHashParts = {
    intake: args.intake,
    upstreamShas: {
      ...(args.upstreamShas ?? {}),
      ...(args.agentVersions
        ? Object.fromEntries(
            Object.entries(args.agentVersions).map(([k, v]) => [`__agent_${k}`, v]),
          )
        : {}),
    },
  };
  return computeInputsHash(parts);
}

/**
 * Look up cached ready artifacts for a given inputs_hash. Returns the latest
 * ready row per artifact_kind across the entire `project_artifacts` table.
 */
export async function lookupCachedSynthesis(
  args: SynthesisCacheKeyArgs,
): Promise<CacheLookupResult> {
  const inputsHash = deriveCacheKey(args);

  const rows = await db
    .select()
    .from(projectArtifacts)
    .where(
      and(
        eq(projectArtifacts.inputsHash, inputsHash),
        eq(projectArtifacts.synthesisStatus, 'ready'),
        isNotNull(projectArtifacts.storagePath),
      ),
    )
    .orderBy(desc(projectArtifacts.synthesizedAt));

  if (rows.length === 0) return { hit: false, inputsHash };

  const latestByKind = new Map<string, ProjectArtifactRow>();
  for (const row of rows) {
    if (!latestByKind.has(row.artifactKind)) latestByKind.set(row.artifactKind, row);
  }

  const cachedArtifacts: CachedArtifactSeed[] = Array.from(latestByKind.values()).map((r) => ({
    artifactKind: r.artifactKind,
    storagePath: r.storagePath as string,
    sha256: r.sha256,
    format: r.format,
    inputsHash,
  }));

  return { hit: true, inputsHash, cachedArtifacts };
}

/**
 * Materialize cached artifacts onto a new project. Idempotent within a single
 * synthesis kickoff — re-invoking with the same inputs is a no-op once rows
 * land in the `ready` state. Returns the list of artifact kinds we satisfied
 * from cache so the caller can skip the matching GENERATE_* nodes.
 */
export async function applyCachedSynthesis(
  projectId: number,
  hit: CacheLookupHit,
): Promise<ExpectedArtifactKind[]> {
  const satisfied: ExpectedArtifactKind[] = [];
  const expected = new Set<string>(EXPECTED_ARTIFACT_KINDS);

  for (const seed of hit.cachedArtifacts) {
    const existing = await db
      .select()
      .from(projectArtifacts)
      .where(
        and(
          eq(projectArtifacts.projectId, projectId),
          eq(projectArtifacts.artifactKind, seed.artifactKind),
        ),
      )
      .orderBy(desc(projectArtifacts.createdAt))
      .limit(1);

    const synthesizedAt = new Date();
    if (existing[0]) {
      await db
        .update(projectArtifacts)
        .set({
          synthesisStatus: 'ready',
          storagePath: seed.storagePath,
          sha256: seed.sha256,
          format: seed.format,
          inputsHash: seed.inputsHash,
          synthesizedAt,
          failureReason: null,
        })
        .where(eq(projectArtifacts.id, existing[0].id));
    } else {
      await db.insert(projectArtifacts).values({
        projectId,
        artifactKind: seed.artifactKind,
        synthesisStatus: 'ready',
        storagePath: seed.storagePath,
        sha256: seed.sha256,
        format: seed.format,
        inputsHash: seed.inputsHash,
        synthesizedAt,
      });
    }

    if (expected.has(seed.artifactKind)) {
      satisfied.push(seed.artifactKind as ExpectedArtifactKind);
    }
  }

  return satisfied;
}

/**
 * One-shot helper: derive key, look up, and (on hit) apply onto the target
 * project. Returns the kinds satisfied from cache (empty array on miss).
 */
export async function tryServeFromCache(
  projectId: number,
  args: SynthesisCacheKeyArgs,
): Promise<{ inputsHash: string; satisfiedKinds: ExpectedArtifactKind[] }> {
  const result = await lookupCachedSynthesis(args);
  if (!result.hit) return { inputsHash: result.inputsHash, satisfiedKinds: [] };
  const satisfiedKinds = await applyCachedSynthesis(projectId, result);
  return { inputsHash: result.inputsHash, satisfiedKinds };
}
