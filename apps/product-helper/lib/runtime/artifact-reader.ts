import { promises as fs } from 'node:fs';
import * as path from 'node:path';

export interface UpstreamRef {
  module: string;
  artifact: string;
  field?: string;
}

export interface EvaluationContext {
  typedInputs: Record<string, unknown>;
  ragChunks: unknown[];
  chatSummary?: string;
}

export class ArtifactSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArtifactSecurityError';
  }
}

const RUNS_ROOT = path.resolve(
  process.cwd(),
  'apps/product-helper/.planning/runs'
);

const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

function assertSafeSegment(value: string, label: string): void {
  if (typeof value !== 'string' || value.length === 0) {
    throw new ArtifactSecurityError(`${label} must be a non-empty string`);
  }
  if (value.includes('\0')) {
    throw new ArtifactSecurityError(`${label} contains null byte`);
  }
  if (value.includes('..')) {
    throw new ArtifactSecurityError(`${label} contains ".." sequence`);
  }
  if (value.includes('/') || value.includes('\\')) {
    throw new ArtifactSecurityError(`${label} contains path separator`);
  }
  if (!SAFE_SEGMENT.test(value)) {
    throw new ArtifactSecurityError(`${label} contains disallowed characters`);
  }
}

function getByDotPath(obj: unknown, dotPath: string): unknown {
  return dotPath.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export class ArtifactReader {
  private cache = new Map<string, unknown>();
  private readonly runsRoot: string;

  constructor(opts?: { runsRoot?: string }) {
    this.runsRoot = opts?.runsRoot ? path.resolve(opts.runsRoot) : RUNS_ROOT;
  }

  async fetch(
    refs: UpstreamRef[],
    projectId: string
  ): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    for (const ref of refs) {
      const key = ref.field
        ? `${ref.module}.${ref.artifact}.${ref.field}`
        : `${ref.module}.${ref.artifact}`;
      out[key] = await this.resolve(ref, projectId);
    }
    return out;
  }

  async resolve(ref: UpstreamRef, projectId: string): Promise<unknown> {
    assertSafeSegment(projectId, 'projectId');
    assertSafeSegment(ref.module, 'ref.module');
    assertSafeSegment(ref.artifact, 'ref.artifact');

    const artifactPath = path.join(
      this.runsRoot,
      projectId,
      `${ref.artifact}.json`
    );
    const resolved = path.resolve(artifactPath);
    if (
      resolved !== this.runsRoot &&
      !resolved.startsWith(this.runsRoot + path.sep)
    ) {
      throw new ArtifactSecurityError(
        'artifact path is outside runs root'
      );
    }

    const cacheKey = `${projectId}::${resolved}`;
    let data: unknown;
    if (this.cache.has(cacheKey)) {
      data = this.cache.get(cacheKey);
    } else {
      const raw = await fs.readFile(resolved, 'utf8');
      data = JSON.parse(raw);
      this.cache.set(cacheKey, data);
    }

    if (ref.field) {
      return getByDotPath(data, ref.field);
    }
    return data;
  }

  invalidate(projectId: string, artifact?: string): void {
    if (!artifact) {
      for (const k of this.cache.keys()) {
        if (k.startsWith(`${projectId}::`)) this.cache.delete(k);
      }
      return;
    }
    const artifactPath = path.resolve(
      path.join(this.runsRoot, projectId, `${artifact}.json`)
    );
    this.cache.delete(`${projectId}::${artifactPath}`);
  }
}

export interface KbRetrieval {
  retrieve(query: string, topK: number): Promise<unknown[]>;
}

export class ContextResolver {
  constructor(
    private readonly reader: ArtifactReader,
    private readonly kbRetrieval: KbRetrieval
  ) {}

  async fetchContext(
    decisionId: string,
    upstreamArtifacts: UpstreamRef[],
    projectId: string
  ): Promise<EvaluationContext> {
    const typedInputs: Record<string, unknown> = {};
    const missing: UpstreamRef[] = [];

    for (const ref of upstreamArtifacts) {
      const key = ref.field
        ? `${ref.module}.${ref.artifact}.${ref.field}`
        : `${ref.module}.${ref.artifact}`;
      try {
        const value = await this.reader.resolve(ref, projectId);
        if (value === undefined || value === null) {
          missing.push(ref);
        } else {
          typedInputs[key] = value;
        }
      } catch (err) {
        if (err instanceof ArtifactSecurityError) throw err;
        missing.push(ref);
      }
    }

    let ragChunks: unknown[] = [];
    if (missing.length > 0) {
      const query = `${decisionId} ${missing
        .map((r) => `${r.module}/${r.artifact}${r.field ? '.' + r.field : ''}`)
        .join(' ')}`;
      ragChunks = await this.kbRetrieval.retrieve(query, 5);
    }

    return { typedInputs, ragChunks };
  }
}
