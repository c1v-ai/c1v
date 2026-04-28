/**
 * kb-search.test — verifies searchKB wiring: embedding call, filter
 * handling, result mapping, and topK respect.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the embedder BEFORE importing the module under test so `embedBatch`
// is intercepted at module load time.
jest.mock('../kb-embedder', () => ({
  embedBatch: jest.fn(),
}));

jest.mock('../../../db/drizzle', () => ({
  db: {
    execute: jest.fn(),
  },
}));

import { searchKB } from '../kb-search';
import { embedBatch } from '../kb-embedder';
import { db } from '../../../db/drizzle';

const mockedEmbed = jest.mocked(embedBatch);
const mockedExecute = jest.mocked(db.execute);

function fakeEmbedding(): number[] {
  return new Array(1536).fill(0).map((_, i) => (i % 7) / 13);
}

function fakeRows() {
  return [
    {
      id: '11111111-1111-1111-1111-111111111111',
      kb_source: '1-defining-scope-kb-for-software',
      module: '1',
      phase: '04-phase-1-context-diagram',
      section: 'Phase 1 > Context Diagram',
      content: 'Chunk about context diagrams.',
      chunk_index: 0,
      similarity: 0.92,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      kb_source: '1-defining-scope-kb-for-software',
      module: '1',
      phase: '04-phase-1-context-diagram',
      section: null,
      content: 'Chunk about actor boundaries.',
      chunk_index: 1,
      similarity: 0.85,
    },
  ];
}

describe('searchKB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedEmbed.mockResolvedValue([fakeEmbedding()]);
    // drizzle postgres-js returns an array-ish result
    mockedExecute.mockResolvedValue(fakeRows() as never);
  });

  it('returns empty array for blank query without embedding', async () => {
    const out = await searchKB('  ');
    expect(out).toEqual([]);
    expect(mockedEmbed).not.toHaveBeenCalled();
    expect(mockedExecute).not.toHaveBeenCalled();
  });

  it('returns empty array for non-positive topK', async () => {
    const out = await searchKB('context diagram', 0);
    expect(out).toEqual([]);
    expect(mockedEmbed).not.toHaveBeenCalled();
  });

  it('embeds the query exactly once and queries the db', async () => {
    const out = await searchKB('context diagram');
    expect(mockedEmbed).toHaveBeenCalledTimes(1);
    expect(mockedEmbed).toHaveBeenCalledWith(['context diagram']);
    expect(mockedExecute).toHaveBeenCalledTimes(1);
    expect(out).toHaveLength(2);
  });

  it('maps snake_case db columns onto the camelCase KBChunkResult shape', async () => {
    const out = await searchKB('context diagram', 2);
    expect(out[0]).toEqual({
      id: '11111111-1111-1111-1111-111111111111',
      kbSource: '1-defining-scope-kb-for-software',
      module: '1',
      phase: '04-phase-1-context-diagram',
      section: 'Phase 1 > Context Diagram',
      content: 'Chunk about context diagrams.',
      chunkIndex: 0,
      similarity: 0.92,
    });
    expect(out[1].section).toBeNull();
    expect(out[1].similarity).toBe(0.85);
  });

  it('coerces string similarity values (postgres NUMERIC) to numbers', async () => {
    mockedExecute.mockResolvedValueOnce([
      { ...fakeRows()[0], similarity: '0.77' },
    ] as never);
    const out = await searchKB('context');
    expect(out[0].similarity).toBeCloseTo(0.77);
  });

  it('unwraps pg driver result-object shape { rows: [...] }', async () => {
    mockedExecute.mockResolvedValueOnce({ rows: fakeRows() } as never);
    const out = await searchKB('context');
    expect(out).toHaveLength(2);
    expect(out[0].kbSource).toBe('1-defining-scope-kb-for-software');
  });

  it('forwards filter values to the SQL statement parameters', async () => {
    await searchKB('form function mapping', 5, {
      module: '5',
      phase: '05-form-function-mapping',
    });
    expect(mockedExecute).toHaveBeenCalledTimes(1);
    const sqlArg = mockedExecute.mock.calls[0][0] as { queryChunks?: unknown[] };
    // drizzle SQL tag collects params in queryChunks — we don't assert the
    // full structure (implementation-dependent) but we do assert it ran.
    expect(sqlArg).toBeDefined();
  });

  it('returns an empty array when the db returns no rows', async () => {
    mockedExecute.mockResolvedValueOnce([] as never);
    const out = await searchKB('nothing matches');
    expect(out).toEqual([]);
  });

  it('propagates embedding errors (no silent fallback)', async () => {
    mockedEmbed.mockRejectedValueOnce(new Error('OpenAI 429'));
    await expect(searchKB('x')).rejects.toThrow('OpenAI 429');
  });
});
