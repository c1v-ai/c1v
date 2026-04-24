/**
 * GET /api/projects/[id]/artifacts/manifest
 *
 * Returns the parsed artifacts.manifest.jsonl for the project's latest run.
 * Read-only; no credit deduction.
 *
 * Contract: plans/c1v-MIT-Crawley-Cornell.v2.md §15.6 / §15.7 Agent 3.
 *
 * Response shape:
 *   { runDir: string, entries: ManifestEntry[] }
 *   — entries empty array if no manifest exists yet.
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

import { withProjectAuth } from '@/lib/api/with-project-auth';
import { listArtifacts, latestPerGenerator } from '@/lib/artifact-generators/manifest';

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

export const GET = withProjectAuth(async (_req, { projectId }) => {
  const runDir = await resolveRunDir(projectId);

  if (!runDir) {
    return NextResponse.json({
      runDir: null,
      entries: [],
      latest: [],
    });
  }

  try {
    const entries = await listArtifacts(runDir);
    return NextResponse.json({
      runDir: path.relative(process.cwd(), runDir),
      entries,
      latest: latestPerGenerator(entries),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Failed to read manifest', message, runDir: path.relative(process.cwd(), runDir) },
      { status: 500 }
    );
  }
});
