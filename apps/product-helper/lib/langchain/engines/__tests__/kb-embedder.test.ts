/**
 * kb-embedder.test — verifies chunk hashing, dedup-against-existing-rows,
 * OpenAI request shape, and the upsert idempotency contract.
 */

import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterAll,
} from '@jest/globals';

// ──────────────────────────────────────────────────────────────────────────
// Typed mock handles. Declaring these up front keeps the `jest.mock()`
// factory from inferring the return type as `never` (which it does when
// the mock shape is untyped).
// ──────────────────────────────────────────────────────────────────────────
const whereMock = jest.fn<(...args: unknown[]) => Promise<unknown[]>>();
const onConflictMock = jest.fn<(...args: unknown[]) => Promise<unknown[]>>();
const fromMock = jest.fn(() => ({ where: whereMock }));
const selectMock = jest.fn(() => ({ from: fromMock }));
const valuesMock = jest.fn(() => ({ onConflictDoNothing: onConflictMock }));
const insertMock = jest.fn(() => ({ values: valuesMock }));

jest.mock('../../../db/drizzle', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
  },
}));

const originalFetch = global.fetch;
const fetchMock = jest.fn<(...args: unknown[]) => Promise<Response>>();
global.fetch = fetchMock as unknown as typeof fetch;

import { hashChunk, embedChunks } from '../kb-embedder';

function fakeEmbeddingResponse(n: number): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      data: Array.from({ length: n }, (_, i) => ({
        index: i,
        embedding: new Array(1536).fill(i / 1000),
      })),
    }),
    text: async () => '',
  } as unknown as Response;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.OPENAI_API_KEY = 'sk-test-key';
  // Default: dedup lookup finds nothing; everything goes to embed.
  whereMock.mockResolvedValue([]);
  // Default: upsert returns no conflict-count array.
  onConflictMock.mockResolvedValue([]);
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('hashChunk', () => {
  it('returns a 64-char hex sha256 digest', () => {
    const h = hashChunk('hello world');
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(h).toBe(
      'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
    );
  });

  it('is deterministic — same input, same hash', () => {
    expect(hashChunk('x')).toBe(hashChunk('x'));
    expect(hashChunk('x')).not.toBe(hashChunk('y'));
  });
});

describe('embedChunks', () => {
  it('returns zeros for empty input without hitting OpenAI', async () => {
    const result = await embedChunks([]);
    expect(result).toEqual({ skipped: 0, inserted: 0, total: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('throws when OPENAI_API_KEY is absent', async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(
      embedChunks([
        {
          kbSource: '1-scope',
          module: '1',
          phase: 'x',
          section: null,
          content: 'hello',
          chunkIndex: 0,
        },
      ]),
    ).rejects.toThrow(/OPENAI_API_KEY missing/);
  });

  it('embeds fresh chunks, sends the right OpenAI payload, and inserts', async () => {
    fetchMock.mockResolvedValueOnce(fakeEmbeddingResponse(2));
    const result = await embedChunks([
      {
        kbSource: '1-scope',
        module: '1',
        phase: 'a',
        section: null,
        content: 'first chunk',
        chunkIndex: 0,
      },
      {
        kbSource: '1-scope',
        module: '1',
        phase: 'a',
        section: 'H1',
        content: 'second chunk',
        chunkIndex: 1,
      },
    ]);

    // OpenAI request shape
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/embeddings');
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe('text-embedding-3-small');
    expect(body.dimensions).toBe(1536);
    expect(body.input).toEqual(['first chunk', 'second chunk']);

    // One insert of two rows, vectors serialized to pgvector literal.
    expect(valuesMock).toHaveBeenCalledTimes(1);
    const firstCall = valuesMock.mock.calls[0] as unknown as [Array<{ chunkHash: string; embedding: number[] }>];
    const rows = firstCall[0];
    expect(rows).toHaveLength(2);
    expect(rows[0].chunkHash).toBe(hashChunk('first chunk'));
    expect(rows[1].chunkHash).toBe(hashChunk('second chunk'));
    expect(Array.isArray(rows[0].embedding)).toBe(true);
    expect(rows[0].embedding.length).toBeGreaterThan(0);
    expect(typeof rows[0].embedding[0]).toBe('number');

    expect(result.total).toBe(2);
    expect(result.skipped).toBe(0);
  });

  it('skips chunks whose (kb_source, chunk_hash) already exists', async () => {
    const content = 'dup content';
    whereMock.mockResolvedValueOnce([{ chunkHash: hashChunk(content) }]);

    const result = await embedChunks([
      {
        kbSource: '1-scope',
        module: '1',
        phase: 'a',
        section: null,
        content,
        chunkIndex: 0,
      },
    ]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
    expect(result).toEqual({ total: 1, skipped: 1, inserted: 0 });
  });

  it('groups dedup lookups by kbSource (one select per source)', async () => {
    fetchMock.mockResolvedValueOnce(fakeEmbeddingResponse(2));
    await embedChunks([
      {
        kbSource: 'src-a',
        module: '1',
        phase: 'a',
        section: null,
        content: 'a1',
        chunkIndex: 0,
      },
      {
        kbSource: 'src-b',
        module: '2',
        phase: 'b',
        section: null,
        content: 'b1',
        chunkIndex: 0,
      },
    ]);

    // select() invoked once per kbSource
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it('propagates OpenAI non-2xx errors', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'rate limited',
      json: async () => ({}),
    } as unknown as Response);

    await expect(
      embedChunks([
        {
          kbSource: '1',
          module: '1',
          phase: 'x',
          section: null,
          content: 'hello',
          chunkIndex: 0,
        },
      ]),
    ).rejects.toThrow(/OpenAI embeddings failed \(429/);
  });
});
