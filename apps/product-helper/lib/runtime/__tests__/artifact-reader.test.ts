/// <reference types="jest" />
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  ArtifactReader,
  ArtifactSecurityError,
  ContextResolver,
  type KbRetrieval,
  type UpstreamRef,
} from '../artifact-reader';

async function makeRunsRoot(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'artifact-reader-'));
  return dir;
}

async function writeArtifact(
  runsRoot: string,
  projectId: string,
  artifact: string,
  data: unknown
): Promise<void> {
  const dir = path.join(runsRoot, projectId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, `${artifact}.json`),
    JSON.stringify(data),
    'utf8'
  );
}

describe('ArtifactReader', () => {
  let runsRoot: string;
  let reader: ArtifactReader;

  beforeEach(async () => {
    runsRoot = await makeRunsRoot();
    reader = new ArtifactReader({ runsRoot });
  });

  afterEach(async () => {
    await fs.rm(runsRoot, { recursive: true, force: true });
  });

  test('happy path: resolves valid upstream ref to typed artifact', async () => {
    await writeArtifact(runsRoot, 'proj1', 'm3', {
      ffbd: { functions: ['F1', 'F2'] },
    });
    const ref: UpstreamRef = { module: 'module-3', artifact: 'm3' };
    const result = await reader.resolve(ref, 'proj1');
    expect(result).toEqual({ ffbd: { functions: ['F1', 'F2'] } });
  });

  test('resolves dot-path field into artifact', async () => {
    await writeArtifact(runsRoot, 'proj1', 'm3', {
      ffbd: { functions: ['F1', 'F2'] },
    });
    const ref: UpstreamRef = {
      module: 'module-3',
      artifact: 'm3',
      field: 'ffbd.functions',
    };
    const result = await reader.resolve(ref, 'proj1');
    expect(result).toEqual(['F1', 'F2']);
  });

  test('rejects path traversal in projectId', async () => {
    const ref: UpstreamRef = { module: 'm', artifact: 'a' };
    await expect(
      reader.resolve(ref, '../../../etc/passwd')
    ).rejects.toThrow(ArtifactSecurityError);
  });

  test('rejects absolute path in projectId', async () => {
    const ref: UpstreamRef = { module: 'm', artifact: 'a' };
    await expect(reader.resolve(ref, '/etc/passwd')).rejects.toThrow(
      ArtifactSecurityError
    );
  });

  test('rejects null byte in projectId', async () => {
    const ref: UpstreamRef = { module: 'm', artifact: 'a' };
    await expect(reader.resolve(ref, 'runs\x00evil')).rejects.toThrow(
      ArtifactSecurityError
    );
  });

  test('rejects path traversal in artifact name', async () => {
    const ref: UpstreamRef = { module: 'm', artifact: '../../../etc/passwd' };
    await expect(reader.resolve(ref, 'proj1')).rejects.toThrow(
      ArtifactSecurityError
    );
  });

  test('rejects path separator in artifact name', async () => {
    const ref: UpstreamRef = { module: 'm', artifact: 'foo/bar' };
    await expect(reader.resolve(ref, 'proj1')).rejects.toThrow(
      ArtifactSecurityError
    );
  });

  test('cache hit: second read returns cached value without re-reading file', async () => {
    await writeArtifact(runsRoot, 'proj1', 'm3', { v: 1 });
    const ref: UpstreamRef = { module: 'module-3', artifact: 'm3' };
    const first = await reader.resolve(ref, 'proj1');

    const spy = jest.spyOn(fs, 'readFile');
    const second = await reader.resolve(ref, 'proj1');

    expect(second).toEqual(first);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('invalidate clears cache for a project', async () => {
    await writeArtifact(runsRoot, 'proj1', 'm3', { v: 1 });
    const ref: UpstreamRef = { module: 'module-3', artifact: 'm3' };
    await reader.resolve(ref, 'proj1');

    await writeArtifact(runsRoot, 'proj1', 'm3', { v: 2 });
    reader.invalidate('proj1');

    const result = await reader.resolve(ref, 'proj1');
    expect(result).toEqual({ v: 2 });
  });
});

describe('ContextResolver', () => {
  let runsRoot: string;
  let reader: ArtifactReader;

  beforeEach(async () => {
    runsRoot = await makeRunsRoot();
    reader = new ArtifactReader({ runsRoot });
  });

  afterEach(async () => {
    await fs.rm(runsRoot, { recursive: true, force: true });
  });

  test('returns typedInputs and no RAG chunks when all refs resolve', async () => {
    await writeArtifact(runsRoot, 'proj1', 'm3', { ok: true });
    const retrieve = jest.fn<Promise<unknown[]>, [string, number]>();
    const kbRetrieval: KbRetrieval = { retrieve };
    const resolver = new ContextResolver(reader, kbRetrieval);

    const ctx = await resolver.fetchContext(
      'RESPONSE_BUDGET_MS',
      [{ module: 'module-3', artifact: 'm3' }],
      'proj1'
    );

    expect(ctx.typedInputs['module-3.m3']).toEqual({ ok: true });
    expect(ctx.ragChunks).toEqual([]);
    expect(retrieve).not.toHaveBeenCalled();
  });

  test('RAG fallback fires when upstream ref is missing', async () => {
    const retrieve = jest
      .fn<Promise<unknown[]>, [string, number]>()
      .mockResolvedValue([{ chunk: 'kb-content' }]);
    const kbRetrieval: KbRetrieval = { retrieve };
    const resolver = new ContextResolver(reader, kbRetrieval);

    const ctx = await resolver.fetchContext(
      'RESPONSE_BUDGET_MS',
      [{ module: 'module-3', artifact: 'missing' }],
      'proj1'
    );

    expect(retrieve).toHaveBeenCalledTimes(1);
    expect(retrieve.mock.calls[0][1]).toBe(5);
    expect(ctx.ragChunks).toEqual([{ chunk: 'kb-content' }]);
  });

  test('security errors from resolve propagate (not swallowed into RAG fallback)', async () => {
    const retrieve = jest.fn<Promise<unknown[]>, [string, number]>();
    const kbRetrieval: KbRetrieval = { retrieve };
    const resolver = new ContextResolver(reader, kbRetrieval);

    await expect(
      resolver.fetchContext(
        'RESPONSE_BUDGET_MS',
        [{ module: 'module-3', artifact: 'm3' }],
        '../../../etc/passwd'
      )
    ).rejects.toThrow(ArtifactSecurityError);
    expect(retrieve).not.toHaveBeenCalled();
  });
});
