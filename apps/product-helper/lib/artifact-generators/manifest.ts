/**
 * TS-side reader/writer for artifacts.manifest.jsonl.
 *
 * Python side (scripts/artifact-generators/common/manifest_writer.py) does the
 * heavy lifting during generator runs with fcntl.flock. This module exists so
 * TS code paths (Next.js API routes, pipeline orchestration, tests) can read
 * existing manifests and, in rare cases, append their own entries.
 *
 * Atomicity: Node's fs.appendFile uses O_APPEND under the hood (see
 * https://nodejs.org/api/fs.html#file-system-flags), which is atomic on POSIX
 * for writes <= PIPE_BUF. We keep manifest lines small (single-line JSON) so
 * this holds without an explicit flock. If we ever need multi-writer safety
 * across Node + Python in the same process tree, swap in proper-lockfile.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { ManifestEntry } from '../../../../scripts/artifact-generators/types';

export const MANIFEST_FILENAME = 'artifacts.manifest.jsonl';

export type ArtifactEntry = ManifestEntry;

function manifestPath(runDir: string): string {
  return path.join(runDir, MANIFEST_FILENAME);
}

/**
 * Parse the JSONL manifest at <runDir>/artifacts.manifest.jsonl.
 *
 * Missing file returns []. Malformed lines are skipped with a console.warn so a
 * partial manifest never fails the whole UI render.
 */
export async function listArtifacts(runDir: string): Promise<ArtifactEntry[]> {
  const p = manifestPath(runDir);
  let raw: string;
  try {
    raw = await fs.readFile(p, 'utf8');
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }

  const out: ArtifactEntry[] = [];
  const lines = raw.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      out.push(JSON.parse(line) as ArtifactEntry);
    } catch (e) {
      console.warn(
        `[artifact-generators] skipped malformed manifest line ${i + 1} at ${p}: ${(e as Error).message}`
      );
    }
  }
  return out;
}

/**
 * Append an entry to the manifest. Creates parent dirs if missing.
 *
 * Prefer the Python writer during generator runs. This is for TS-originated
 * entries (e.g. a manifest stub when a generator is queued but not yet
 * executed, or an error-only entry when invoke.ts cannot spawn the process).
 */
export async function appendArtifact(runDir: string, entry: ArtifactEntry): Promise<string> {
  await fs.mkdir(runDir, { recursive: true });
  const p = manifestPath(runDir);
  const line = JSON.stringify(entry) + '\n';
  // flag 'a' = O_APPEND; atomic on POSIX for small writes.
  await fs.appendFile(p, line, { encoding: 'utf8', flag: 'a' });
  return p;
}

/** Convenience: only successful entries. */
export function filterSuccessful(entries: ArtifactEntry[]): ArtifactEntry[] {
  return entries.filter((e) => e.ok);
}

/** Convenience: latest entry per (generator, instance) pair. */
export function latestPerGenerator(entries: ArtifactEntry[]): ArtifactEntry[] {
  const map = new Map<string, ArtifactEntry>();
  for (const e of entries) {
    const key = `${e.generator}::${e.instance}`;
    const prev = map.get(key);
    if (!prev || e.timestamp > prev.timestamp) {
      map.set(key, e);
    }
  }
  return Array.from(map.values());
}
