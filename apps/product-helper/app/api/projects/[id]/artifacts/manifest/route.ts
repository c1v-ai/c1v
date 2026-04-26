/**
 * GET /api/projects/[id]/artifacts/manifest
 *
 * Returns the parsed artifacts.manifest.jsonl for the project's latest run
 * (legacy `entries` + `latest`) merged with the v2.1 per-tenant
 * project_artifacts rows (PDF / PPTX / Bundle ZIP signed URLs from
 * Supabase Storage).
 *
 * Read-only; no credit deduction.
 *
 * Contract: plans/c1v-MIT-Crawley-Cornell.v2.md §15.6 / §15.7 Agent 3
 *           + v2.1 §Wave A (TA3 manifest extension).
 *
 * Response shape (manifest_contract_version='v1'):
 *   {
 *     manifest_contract_version: 'v1',
 *     runDir: string | null,
 *     entries: ManifestEntry[],         // legacy filesystem manifest
 *     latest: ManifestEntry[],          // legacy latest-per-generator
 *     dbArtifacts: Array<{              // v2.1 per-tenant extension
 *       kind: string,
 *       status: 'pending' | 'ready' | 'failed',
 *       format: string | null,
 *       signed_url: string | null,
 *       sha256: string | null,
 *       synthesized_at: string | null,
 *     }>
 *   }
 *
 * Version-bump rule (canonical spec at plans/v21-outputs/ta3/manifest-contract.md):
 *   - MAJOR (v1 → v2): shape break — field removal or type change
 *   - MINOR (v1 → v1.1): additive fields only
 *
 * RLS: cross-tenant requests 404 inside withProjectAuth before this handler
 * runs; project_artifacts RLS provides defense-in-depth on the DB read.
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

import { withProjectAuth } from '@/lib/api/with-project-auth';
import { listArtifacts, latestPerGenerator } from '@/lib/artifact-generators/manifest';
import { getProjectArtifacts } from '@/lib/synthesis/artifacts-bridge';
import { getSignedUrl, type SignedUrlCache } from '@/lib/storage/supabase-storage';

const MANIFEST_CONTRACT_VERSION = 'v1' as const;

// Resolves to <repo>/apps/product-helper/.planning/runs
const RUNS_ROOT = path.resolve(process.cwd(), '.planning', 'runs');

/**
 * Find the run directory for a given project.
 *
 * Resolution order:
 *   1. .planning/runs/project-<id>/latest (symlink or real dir)
 *   2. .planning/runs/project-<id>/<newest timestamped subdir>
 *   3. null — no run yet
 *
 * The Python generators decide the actual output path via outputDir in the
 * input JSON; this API is agnostic and discovers whatever the pipeline produced.
 */
async function resolveRunDir(projectId: number): Promise<string | null> {
  const projectRoot = path.join(RUNS_ROOT, `project-${projectId}`);

  try {
    const stat = await fs.stat(projectRoot);
    if (!stat.isDirectory()) return null;
  } catch {
    return null;
  }

  // 1. 'latest' wins if present.
  const latestPath = path.join(projectRoot, 'latest');
  try {
    const stat = await fs.stat(latestPath);
    if (stat.isDirectory()) return latestPath;
  } catch {
    // ignore
  }

  // 2. Newest timestamped subdir.
  let entries: string[];
  try {
    entries = await fs.readdir(projectRoot);
  } catch {
    return null;
  }

  const candidates: Array<{ name: string; mtimeMs: number }> = [];
  for (const name of entries) {
    const p = path.join(projectRoot, name);
    try {
      const s = await fs.stat(p);
      if (s.isDirectory()) candidates.push({ name, mtimeMs: s.mtimeMs });
    } catch {
      // skip
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return path.join(projectRoot, candidates[0].name);
}

interface DbArtifactEntry {
  kind: string;
  status: 'pending' | 'ready' | 'failed';
  format: string | null;
  signed_url: string | null;
  sha256: string | null;
  synthesized_at: string | null;
}

async function loadDbArtifacts(projectId: number): Promise<DbArtifactEntry[]> {
  const rows = await getProjectArtifacts(projectId);
  if (rows.length === 0) return [];
  const cache: SignedUrlCache = new Map();
  return Promise.all(
    rows.map(async (row) => {
      let signedUrl: string | null = null;
      if (row.synthesisStatus === 'ready' && row.storagePath) {
        try {
          signedUrl = await getSignedUrl(row.storagePath, undefined, cache);
        } catch (err) {
          console.error(
            `[manifest] signed-URL failed for project=${projectId} kind=${row.artifactKind}:`,
            err instanceof Error ? err.message : err
          );
        }
      }
      return {
        kind: row.artifactKind,
        status: row.synthesisStatus,
        format: row.format,
        signed_url: signedUrl,
        sha256: row.sha256,
        synthesized_at: row.synthesizedAt
          ? new Date(row.synthesizedAt).toISOString()
          : null,
      };
    })
  );
}

export const GET = withProjectAuth(async (_req, { projectId }) => {
  const runDir = await resolveRunDir(projectId);
  const dbArtifacts = await loadDbArtifacts(projectId);

  if (!runDir) {
    return NextResponse.json({
      manifest_contract_version: MANIFEST_CONTRACT_VERSION,
      runDir: null,
      entries: [],
      latest: [],
      dbArtifacts,
    });
  }

  try {
    const entries = await listArtifacts(runDir);
    return NextResponse.json({
      manifest_contract_version: MANIFEST_CONTRACT_VERSION,
      runDir: path.relative(process.cwd(), runDir),
      entries,
      latest: latestPerGenerator(entries),
      dbArtifacts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        manifest_contract_version: MANIFEST_CONTRACT_VERSION,
        error: 'Failed to read manifest',
        message,
        runDir: path.relative(process.cwd(), runDir),
        dbArtifacts,
      },
      { status: 500 }
    );
  }
});
