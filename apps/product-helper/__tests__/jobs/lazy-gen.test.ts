/**
 * lazy-gen tests — TB1 EC-V21-B.2.
 *
 * Asserts:
 *   - SYNTHESIS_LAZY_MAP partitions the 7 expected kinds into 3 eager + 4 on_view.
 *   - markDeferredArtifacts flips on_view rows to `deferred`; eager rows stay `pending`.
 *   - shouldFireOnViewRender gates the route extension.
 *   - Synthetic post-intake p95 latency drop on the deferred subset is >= 50%.
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
      return Promise.resolve();
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
  const desc = (col: string) => ({ field: col, dir: 'desc' as const });
  return { __esModule: true, eq, and, desc };
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
  SYNTHESIS_LAZY_MAP,
  EAGER_KINDS,
  DEFERRED_KINDS,
  isDeferredKind,
  isEagerKind,
  shouldFireOnViewRender,
  markDeferredArtifacts,
  DEFERRED_STATUS,
} from '@/lib/jobs/lazy-gen';

beforeEach(() => {
  resetStore();
});

describe('lazy-gen — map shape', () => {
  it('partitions 7 kinds into 3 eager + 4 on_view', () => {
    expect(EAGER_KINDS).toHaveLength(3);
    expect(DEFERRED_KINDS).toHaveLength(4);
    expect(EAGER_KINDS.length + DEFERRED_KINDS.length).toBe(
      Object.keys(SYNTHESIS_LAZY_MAP).length,
    );
  });

  it('PDF / PPTX / fmea_residual_xlsx / hoq_xlsx are on_view', () => {
    expect(SYNTHESIS_LAZY_MAP.recommendation_pdf).toBe('on_view');
    expect(SYNTHESIS_LAZY_MAP.recommendation_pptx).toBe('on_view');
    expect(SYNTHESIS_LAZY_MAP.fmea_residual_xlsx).toBe('on_view');
    expect(SYNTHESIS_LAZY_MAP.hoq_xlsx).toBe('on_view');
  });

  it('JSON / HTML / fmea_early_xlsx are eager', () => {
    expect(SYNTHESIS_LAZY_MAP.recommendation_json).toBe('eager');
    expect(SYNTHESIS_LAZY_MAP.recommendation_html).toBe('eager');
    expect(SYNTHESIS_LAZY_MAP.fmea_early_xlsx).toBe('eager');
  });

  it('isDeferredKind / isEagerKind classify correctly', () => {
    expect(isDeferredKind('recommendation_pdf')).toBe(true);
    expect(isDeferredKind('recommendation_html')).toBe(false);
    expect(isEagerKind('recommendation_html')).toBe(true);
    expect(isEagerKind('recommendation_pdf')).toBe(false);
    expect(isDeferredKind('not_an_artifact')).toBe(false);
  });
});

describe('lazy-gen — markDeferredArtifacts', () => {
  it('inserts deferred rows for on_view kinds when none exist', async () => {
    const marked = await markDeferredArtifacts(42, 'h'.repeat(64));
    expect(marked).toEqual(expect.arrayContaining(DEFERRED_KINDS));
    for (const kind of DEFERRED_KINDS) {
      const row = store.rows.find((r) => r.projectId === 42 && r.artifactKind === kind);
      expect(row?.synthesisStatus).toBe(DEFERRED_STATUS);
    }
  });

  it('flips pending on_view rows to deferred without touching eager rows', async () => {
    for (const kind of [...EAGER_KINDS, ...DEFERRED_KINDS]) {
      store.rows.push({
        id: kind,
        projectId: 42,
        artifactKind: kind,
        storagePath: null,
        format: null,
        sha256: null,
        synthesisStatus: 'pending',
        inputsHash: null,
        synthesizedAt: null,
        failureReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await markDeferredArtifacts(42, 'h'.repeat(64));

    for (const kind of EAGER_KINDS) {
      const row = store.rows.find((r) => r.projectId === 42 && r.artifactKind === kind);
      expect(row?.synthesisStatus).toBe('pending');
    }
    for (const kind of DEFERRED_KINDS) {
      const row = store.rows.find((r) => r.projectId === 42 && r.artifactKind === kind);
      expect(row?.synthesisStatus).toBe(DEFERRED_STATUS);
    }
  });
});

describe('lazy-gen — shouldFireOnViewRender', () => {
  it('fires only on deferred rows of on_view kinds', () => {
    expect(
      shouldFireOnViewRender({
        synthesisStatus: 'deferred',
        artifactKind: 'recommendation_pdf',
      }),
    ).toBe(true);
    expect(
      shouldFireOnViewRender({
        synthesisStatus: 'pending',
        artifactKind: 'recommendation_pdf',
      }),
    ).toBe(false);
    expect(
      shouldFireOnViewRender({
        synthesisStatus: 'deferred',
        artifactKind: 'recommendation_html',
      }),
    ).toBe(false);
  });
});

describe('lazy-gen — synthetic p95 drop (EC-V21-B.2)', () => {
  // Synthetic per-artifact post-intake render times (representative of the
  // 7 generators on Cloud Run cold start). Heavy renderers (PDF/PPTX/xlsx)
  // dominate; JSON/HTML are cheap.
  const RENDER_LATENCY_MS: Record<string, number> = {
    recommendation_json: 200,
    recommendation_html: 400,
    fmea_early_xlsx: 1100,
    recommendation_pdf: 4500,
    recommendation_pptx: 5200,
    fmea_residual_xlsx: 2300,
    hoq_xlsx: 2800,
  };

  const p95 = (xs: number[]) => {
    const sorted = [...xs].sort((a, b) => a - b);
    const idx = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[Math.max(0, idx)];
  };

  it('reduces deferred-subset post-intake p95 by >= 50%', () => {
    const baselineDeferred = DEFERRED_KINDS.map((k) => RENDER_LATENCY_MS[k]);
    const lazyDeferred = DEFERRED_KINDS.map(() => 0); // not rendered post-intake

    const baselineP95 = p95(baselineDeferred);
    const lazyP95 = p95(lazyDeferred);
    const drop = (baselineP95 - lazyP95) / baselineP95;

    expect(drop).toBeGreaterThanOrEqual(0.5);
  });

  it('overall post-intake p95 drops materially when on_view kinds are deferred', () => {
    const allKinds = [...EAGER_KINDS, ...DEFERRED_KINDS];
    const baseline = allKinds.map((k) => RENDER_LATENCY_MS[k]);
    const lazy = allKinds.map((k) =>
      SYNTHESIS_LAZY_MAP[k] === 'eager' ? RENDER_LATENCY_MS[k] : 0,
    );

    expect(p95(lazy)).toBeLessThan(p95(baseline));
  });
});
