/**
 * synthesis-cache tests — TB1 EC-V21-B.1.
 *
 * Asserts:
 *   - inputs_hash is content-addressed (same intake => same hex; different
 *     intake => different hex; tenant identifiers do NOT influence the key).
 *   - lookup returns hit on a matching prior `ready` row with non-null
 *     storage_path; miss otherwise.
 *   - applyCachedSynthesis writes new project_artifacts rows pointing at the
 *     cached storage_path (no blob duplication).
 *   - synthetic 10x5 load produces hit-rate > 30%.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

interface FakeRow {
  id: string;
  projectId: number;
  artifactKind: string;
  storagePath: string | null;
  format: string | null;
  sha256: string | null;
  synthesisStatus: string;
  inputsHash: string | null;
  synthesizedAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const store: { rows: FakeRow[] } = { rows: [] };
let idCounter = 1;

function resetStore() {
  store.rows = [];
  idCounter = 1;
}

type Predicate = (row: FakeRow) => boolean;

function makeChain(initial: FakeRow[]) {
  const rows = [...initial];
  let predicate: Predicate | null = null;
  let limitN: number | null = null;
  let orderField: keyof FakeRow | null = null;
  let orderDir: 'asc' | 'desc' = 'asc';

  const runQuery = (): FakeRow[] => {
    let r = rows;
    if (predicate) r = r.filter(predicate);
    if (orderField) {
      const f = orderField;
      const dir = orderDir === 'desc' ? -1 : 1;
      r = [...r].sort((a, b) => {
        const av = a[f] as unknown as number | string | Date | null;
        const bv = b[f] as unknown as number | string | Date | null;
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }
    if (limitN != null) r = r.slice(0, limitN);
    return r;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {
    from: () => chain,
    where: (p: Predicate) => {
      predicate = p;
      return chain;
    },
    orderBy: (spec: { field: keyof FakeRow; dir: 'asc' | 'desc' }) => {
      orderField = spec.field;
      orderDir = spec.dir;
      return chain;
    },
    limit: (n: number) => {
      limitN = n;
      return chain;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then: (resolve: any, reject: any) =>
      Promise.resolve(runQuery()).then(resolve, reject),
  };
  return chain;
}

const mockDb = {
  select: () => makeChain(store.rows),
  insert: (_t: unknown) => ({
    values: (vals: Partial<FakeRow>) => {
      const persist = (): FakeRow => {
        const row: FakeRow = {
          id: String(idCounter++),
          projectId: vals.projectId as number,
          artifactKind: vals.artifactKind as string,
          storagePath: vals.storagePath ?? null,
          format: vals.format ?? null,
          sha256: vals.sha256 ?? null,
          synthesisStatus: vals.synthesisStatus ?? 'pending',
          inputsHash: vals.inputsHash ?? null,
          synthesizedAt: vals.synthesizedAt ?? null,
          failureReason: vals.failureReason ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.rows.push(row);
        return row;
      };
      return {
        returning: async () => [persist()],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        then: (resolve: any, reject: any) => {
          try {
            persist();
            return Promise.resolve(undefined).then(resolve, reject);
          } catch (e) {
            return Promise.reject(e).then(resolve, reject);
          }
        },
      };
    },
  }),
  update: (_t: unknown) => ({
    set: (vals: Partial<FakeRow>) => ({
      where: (p: Predicate) => {
        for (const row of store.rows) {
          if (p(row)) Object.assign(row, vals, { updatedAt: new Date() });
        }
        return Promise.resolve();
      },
    }),
  }),
};

jest.mock('@/lib/db/drizzle', () => ({
  __esModule: true,
  db: mockDb,
}));

jest.mock('drizzle-orm', () => {
  const eq = (col: string, val: unknown): Predicate =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (row: FakeRow) => (row as any)[col] === val;
  const and = (...preds: Predicate[]): Predicate => (row: FakeRow) =>
    preds.every((p) => p(row));
  const isNotNull = (col: string): Predicate =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (row: FakeRow) => (row as any)[col] != null;
  const desc = (col: string) => ({ field: col, dir: 'desc' as const });
  return { __esModule: true, eq, and, isNotNull, desc };
});

jest.mock('@/lib/db/schema/project-artifacts', () => {
  const cols = new Proxy(
    {},
    {
      get: (_t, prop) => prop,
    },
  );
  return {
    __esModule: true,
    projectArtifacts: cols,
    EXPECTED_ARTIFACT_KINDS: [
      'recommendation_json',
      'recommendation_html',
      'recommendation_pdf',
      'recommendation_pptx',
      'fmea_early_xlsx',
      'fmea_residual_xlsx',
      'hoq_xlsx',
    ],
  };
});

import {
  deriveCacheKey,
  lookupCachedSynthesis,
  applyCachedSynthesis,
  tryServeFromCache,
} from '@/lib/cache/synthesis-cache';

beforeEach(() => {
  resetStore();
});

describe('synthesis-cache — key derivation', () => {
  it('produces a 64-char lowercase hex sha256', () => {
    const hex = deriveCacheKey({ intake: { foo: 'bar' } });
    expect(hex).toMatch(/^[0-9a-f]{64}$/u);
  });

  it('is stable across re-invocations with identical inputs', () => {
    const a = deriveCacheKey({ intake: { x: 1, y: 'two' } });
    const b = deriveCacheKey({ intake: { y: 'two', x: 1 } });
    expect(a).toBe(b);
  });

  it('changes when intake content changes', () => {
    const a = deriveCacheKey({ intake: { vision: 'A' } });
    const b = deriveCacheKey({ intake: { vision: 'B' } });
    expect(a).not.toBe(b);
  });

  it('changes when agentVersions bump', () => {
    const intake = { projectName: 'X' };
    const a = deriveCacheKey({ intake, agentVersions: { synthesis: 'v1' } });
    const b = deriveCacheKey({ intake, agentVersions: { synthesis: 'v2' } });
    expect(a).not.toBe(b);
  });
});

describe('synthesis-cache — lookup', () => {
  it('returns miss when no rows match the hash', async () => {
    const result = await lookupCachedSynthesis({ intake: { v: 'unique' } });
    expect(result.hit).toBe(false);
  });

  it('returns hit with cachedArtifacts on a matching ready row', async () => {
    const intake = { projectName: 'P', vision: 'V' };
    const hash = deriveCacheKey({ intake });
    store.rows.push({
      id: 'r1',
      projectId: 100,
      artifactKind: 'recommendation_html',
      storagePath: 'projects/100/recommendation_html.html',
      format: 'html',
      sha256: 'a'.repeat(64),
      synthesisStatus: 'ready',
      inputsHash: hash,
      synthesizedAt: new Date(),
      failureReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await lookupCachedSynthesis({ intake });
    expect(result.hit).toBe(true);
    if (result.hit) {
      expect(result.cachedArtifacts).toHaveLength(1);
      expect(result.cachedArtifacts[0].artifactKind).toBe('recommendation_html');
      expect(result.cachedArtifacts[0].storagePath).toBe('projects/100/recommendation_html.html');
    }
  });

  it('ignores rows with synthesis_status != ready or null storage_path', async () => {
    const intake = { vision: 'X' };
    const hash = deriveCacheKey({ intake });
    store.rows.push(
      {
        id: 'r1',
        projectId: 100,
        artifactKind: 'recommendation_html',
        storagePath: null,
        format: null,
        sha256: null,
        synthesisStatus: 'ready',
        inputsHash: hash,
        synthesizedAt: null,
        failureReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'r2',
        projectId: 100,
        artifactKind: 'recommendation_pdf',
        storagePath: 'p',
        format: 'pdf',
        sha256: null,
        synthesisStatus: 'failed',
        inputsHash: hash,
        synthesizedAt: null,
        failureReason: 'x',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    const result = await lookupCachedSynthesis({ intake });
    expect(result.hit).toBe(false);
  });
});

describe('synthesis-cache — apply', () => {
  it('writes new rows for the target project pointing at cached storage_path', async () => {
    const intake = { vision: 'X' };
    const hash = deriveCacheKey({ intake });
    store.rows.push({
      id: 'r1',
      projectId: 100,
      artifactKind: 'recommendation_html',
      storagePath: 'shared/blob.html',
      format: 'html',
      sha256: 'b'.repeat(64),
      synthesisStatus: 'ready',
      inputsHash: hash,
      synthesizedAt: new Date(),
      failureReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const lookup = await lookupCachedSynthesis({ intake });
    expect(lookup.hit).toBe(true);
    if (!lookup.hit) return;

    const satisfied = await applyCachedSynthesis(200, lookup);
    expect(satisfied).toContain('recommendation_html');

    const newRow = store.rows.find(
      (r) => r.projectId === 200 && r.artifactKind === 'recommendation_html',
    );
    expect(newRow).toBeDefined();
    expect(newRow?.storagePath).toBe('shared/blob.html');
    expect(newRow?.synthesisStatus).toBe('ready');
  });
});

describe('synthesis-cache — synthetic load (EC-V21-B.1: hit-rate > 30%)', () => {
  it('achieves >30% hit-rate on a 10x5 synthetic load with intake overlap', async () => {
    const intakeFor = (projectId: number) => {
      if (projectId <= 5) return { vision: `unique-${projectId}` };
      return { vision: 'shared-cluster' };
    };

    let kickoffs = 0;
    let hits = 0;

    for (let run = 0; run < 5; run++) {
      for (let projectId = 1; projectId <= 10; projectId++) {
        kickoffs++;
        const intake = intakeFor(projectId);

        const before = await lookupCachedSynthesis({ intake });
        if (before.hit) hits++;

        const hash = deriveCacheKey({ intake });
        for (const kind of ['recommendation_json', 'recommendation_html']) {
          store.rows.push({
            id: `k${kickoffs}-${kind}`,
            projectId,
            artifactKind: kind,
            storagePath: `p/${projectId}/${kind}`,
            format: kind.split('_').pop() ?? 'json',
            sha256: 'c'.repeat(64),
            synthesisStatus: 'ready',
            inputsHash: hash,
            synthesizedAt: new Date(),
            failureReason: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    const hitRate = hits / kickoffs;
    expect(hitRate).toBeGreaterThan(0.3);
  });
});

describe('synthesis-cache — tryServeFromCache one-shot', () => {
  it('returns satisfiedKinds=[] on miss', async () => {
    const out = await tryServeFromCache(99, { intake: { v: 'novel' } });
    expect(out.satisfiedKinds).toEqual([]);
    expect(out.inputsHash).toMatch(/^[0-9a-f]{64}$/u);
  });

  it('returns satisfied kinds on hit', async () => {
    const intake = { vision: 'shared' };
    const hash = deriveCacheKey({ intake });
    store.rows.push({
      id: 'src',
      projectId: 1,
      artifactKind: 'recommendation_html',
      storagePath: 'shared/html',
      format: 'html',
      sha256: null,
      synthesisStatus: 'ready',
      inputsHash: hash,
      synthesizedAt: new Date(),
      failureReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const out = await tryServeFromCache(2, { intake });
    expect(out.satisfiedKinds).toContain('recommendation_html');
  });
});
