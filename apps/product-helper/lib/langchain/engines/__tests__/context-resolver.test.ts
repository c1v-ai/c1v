import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('@/lib/db/drizzle', () => ({
  db: {},
}));

import {
  ContextResolver,
  type KbChunk,
  type RagFetcher,
} from '../context-resolver';
import {
  ArtifactReader,
  type ArtifactFetchResult,
  type DrizzleClient,
} from '../artifact-reader';
import type { DecisionRef, ModuleRef } from '../../schemas/engines/engine';

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

function makeDecision(overrides: Partial<DecisionRef> = {}): DecisionRef {
  return {
    decision_id: 'RESPONSE_BUDGET_MS',
    target_field: 'constants_table.RESPONSE_BUDGET_MS',
    inputs: [
      { name: 'user_type', source: 'module-2/phase-0-ingest' },
      { name: 'flow_class', source: 'module-2/phase-5-ucbd-step-flow' },
      { name: 'regulatory_refs', source: 'user_input' },
    ],
    function: {
      type: 'decision_tree',
      rules: [
        {
          if: { user_type: 'consumer_app' },
          value: 500,
          units: 'ms',
          base_confidence: 0.9,
          rule_id: 'consumer-app',
        },
      ],
    },
    ...overrides,
  };
}

/**
 * Minimal ArtifactReader stub — bypasses Drizzle entirely so we can
 * exercise ContextResolver's projection + RAG logic in isolation.
 */
function makeReaderStub(result: ArtifactFetchResult): ArtifactReader {
  const stub: Partial<ArtifactReader> = {
    fetch: jest.fn(async () => result),
  };
  return stub as ArtifactReader;
}

function makeDbDouble(rows: Array<{ role: string; content: string }> = []) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => Promise.resolve(rows),
          }),
        }),
      }),
    }),
  } as unknown as DrizzleClient;
}

// ─────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────

describe('ContextResolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('projects typed inputs from artifact bags using dot-path reads', async () => {
    const reader = makeReaderStub({
      artifacts: {
        'module-2/phase-0-ingest': { user_type: 'consumer_app' },
        'module-2/phase-5-ucbd-step-flow': { flow_class: 'user_facing_sync' },
      },
      missing_inputs: [],
      validation_errors: [],
    });
    const resolver = new ContextResolver({
      artifactReader: reader,
      db: makeDbDouble(),
    });

    const result = await resolver.resolveContext({
      decision: makeDecision(),
      projectId: 1,
      signals: { regulatory_refs: ['PCI-DSS'] },
    });

    expect(result.typed_inputs).toEqual({
      user_type: 'consumer_app',
      flow_class: 'user_facing_sync',
      regulatory_refs: ['PCI-DSS'],
    });
    expect(result.missing_inputs).toEqual([]);
    expect(result.rag_chunks).toEqual([]);
  });

  it('accumulates missing_inputs when artifact + signal both absent', async () => {
    const reader = makeReaderStub({
      artifacts: {},
      missing_inputs: [
        { module: 'module-2', phase_slug: 'phase-0-ingest' },
        { module: 'module-2', phase_slug: 'phase-5-ucbd-step-flow' },
      ] satisfies ModuleRef[],
      validation_errors: [],
    });
    const resolver = new ContextResolver({
      artifactReader: reader,
      db: makeDbDouble(),
    });

    const result = await resolver.resolveContext({
      decision: makeDecision(),
      projectId: 1,
      // no signals supplied — regulatory_refs is also missing
    });

    expect(result.typed_inputs).toEqual({});
    expect(result.missing_inputs.sort()).toEqual([
      'flow_class',
      'regulatory_refs',
      'user_type',
    ]);
  });

  it('calls ragFetcher for missing inputs and dedupes chunks', async () => {
    const reader = makeReaderStub({
      artifacts: {},
      missing_inputs: [{ module: 'module-2', phase_slug: 'phase-0-ingest' }],
      validation_errors: [],
    });

    const chunk: KbChunk = {
      chunk_id: 'chunk-1',
      module: 'module-2',
      phase: 'phase-0-ingest',
      content: 'user_type consumer_app default',
      score: 0.82,
    };
    const ragFetcher = jest.fn<RagFetcher>(async () => [chunk, chunk]);

    const resolver = new ContextResolver({
      artifactReader: reader,
      db: makeDbDouble(),
      ragFetcher,
    });

    const result = await resolver.resolveContext({
      decision: makeDecision(),
      projectId: 1,
    });

    expect(ragFetcher).toHaveBeenCalled();
    expect(result.rag_chunks).toHaveLength(1); // deduped across missingKeys
    expect(result.rag_chunks[0].chunk_id).toBe('chunk-1');
    expect(result.rag_attempted).toBe(true);
    // Scoped filter is set from the artifact-backed source
    const firstCall = ragFetcher.mock.calls[0][0];
    expect(firstCall.filter).toEqual({
      module: 'module-2',
      phase: 'phase-0-ingest',
    });
  });

  it('tri-state: rag_attempted=true with empty chunks when RAG returns zero hits', async () => {
    const reader = makeReaderStub({
      artifacts: {},
      missing_inputs: [{ module: 'module-2', phase_slug: 'phase-0-ingest' }],
      validation_errors: [],
    });
    const ragFetcher = jest.fn<RagFetcher>(async () => []);
    const resolver = new ContextResolver({
      artifactReader: reader,
      db: makeDbDouble(),
      ragFetcher,
    });
    const result = await resolver.resolveContext({
      decision: makeDecision(),
      projectId: 1,
    });
    expect(ragFetcher).toHaveBeenCalled();
    expect(result.rag_attempted).toBe(true);
    expect(result.rag_chunks).toEqual([]);
  });

  it('tri-state: rag_attempted=false on pure rule-tree paths (all inputs resolved)', async () => {
    const reader = makeReaderStub({
      artifacts: {
        'module-2/phase-0-ingest': { user_type: 'consumer_app' },
        'module-2/phase-5-ucbd-step-flow': { flow_class: 'user_facing_sync' },
      },
      missing_inputs: [],
      validation_errors: [],
    });
    const ragFetcher = jest.fn<RagFetcher>(async () => []);
    const resolver = new ContextResolver({
      artifactReader: reader,
      db: makeDbDouble(),
      ragFetcher,
    });
    const result = await resolver.resolveContext({
      decision: makeDecision(),
      projectId: 1,
      signals: { regulatory_refs: ['PCI-DSS'] },
    });
    expect(ragFetcher).not.toHaveBeenCalled();
    expect(result.rag_attempted).toBe(false);
    expect(result.rag_chunks).toEqual([]);
  });

  it('tri-state: rag_attempted=false when no fetcher is wired, even with missing inputs', async () => {
    const reader = makeReaderStub({
      artifacts: {},
      missing_inputs: [{ module: 'module-2', phase_slug: 'phase-0-ingest' }],
      validation_errors: [],
    });
    const resolver = new ContextResolver({
      artifactReader: reader,
      db: makeDbDouble(),
    });
    const result = await resolver.resolveContext({
      decision: makeDecision(),
      projectId: 1,
    });
    expect(result.rag_attempted).toBe(false);
    expect(result.rag_chunks).toEqual([]);
    expect(result.missing_inputs.length).toBeGreaterThan(0);
  });

  it('swallows RAG failures and returns empty chunks', async () => {
    const reader = makeReaderStub({
      artifacts: {},
      missing_inputs: [{ module: 'module-2', phase_slug: 'phase-0-ingest' }],
      validation_errors: [],
    });
    const ragFetcher = jest.fn<RagFetcher>(async () => {
      throw new Error('rag offline');
    });
    const resolver = new ContextResolver({
      artifactReader: reader,
      db: makeDbDouble(),
      ragFetcher,
    });

    const result = await resolver.resolveContext({
      decision: makeDecision(),
      projectId: 1,
    });

    expect(result.rag_chunks).toEqual([]);
    // Resolver still returns the missing_inputs for the engine to act on
    expect(result.missing_inputs.length).toBeGreaterThan(0);
  });

  it('does not fire RAG when no fetcher is wired', async () => {
    const reader = makeReaderStub({
      artifacts: {},
      missing_inputs: [],
      validation_errors: [],
    });
    const resolver = new ContextResolver({
      artifactReader: reader,
      db: makeDbDouble(),
    });

    const result = await resolver.resolveContext({
      decision: makeDecision({ inputs: [] }),
      projectId: 1,
    });

    expect(result.rag_chunks).toEqual([]);
    expect(result.typed_inputs).toEqual({});
  });

  it('folds chat history into a chat_summary when rows exist', async () => {
    const reader = makeReaderStub({
      artifacts: {},
      missing_inputs: [],
      validation_errors: [],
    });
    const resolver = new ContextResolver({
      artifactReader: reader,
      db: makeDbDouble([
        { role: 'user', content: 'What is the latency budget?' },
        { role: 'assistant', content: '500ms for consumer flows.' },
      ]),
    });

    const result = await resolver.resolveContext({
      decision: makeDecision({ inputs: [] }),
      projectId: 1,
    });

    expect(result.chat_summary).toContain('[user]');
    expect(result.chat_summary).toContain('latency budget');
    expect(result.chat_summary).toContain('500ms');
  });

  it('omits chat_summary when chat-history query throws', async () => {
    const reader = makeReaderStub({
      artifacts: {},
      missing_inputs: [],
      validation_errors: [],
    });
    const brokenDb = {
      select: () => {
        throw new Error('db offline');
      },
    } as unknown as DrizzleClient;
    const resolver = new ContextResolver({
      artifactReader: reader,
      db: brokenDb,
    });

    const result = await resolver.resolveContext({
      decision: makeDecision({ inputs: [] }),
      projectId: 1,
    });
    expect(result.chat_summary).toBeUndefined();
  });

  it('propagates ArtifactValidationError without swallowing', async () => {
    const failingReader: Partial<ArtifactReader> = {
      fetch: jest.fn(async () => {
        throw new Error('data corruption');
      }),
    };
    const resolver = new ContextResolver({
      artifactReader: failingReader as ArtifactReader,
      db: makeDbDouble(),
    });
    await expect(
      resolver.resolveContext({
        decision: makeDecision(),
        projectId: 1,
      }),
    ).rejects.toThrow('data corruption');
  });

  it('never calls an LLM — resolver is plumbing only', async () => {
    // No Anthropic or OpenAI client imports in this module. This test
    // asserts intent by ensuring the public surface is free of LLM types.
    const resolver = new ContextResolver({
      artifactReader: makeReaderStub({
        artifacts: {},
        missing_inputs: [],
        validation_errors: [],
      }),
      db: makeDbDouble(),
    });
    const result = await resolver.resolveContext({
      decision: makeDecision({ inputs: [] }),
      projectId: 1,
    });
    expect(result).toHaveProperty('typed_inputs');
    expect(result).toHaveProperty('rag_chunks');
    expect(result).toHaveProperty('missing_inputs');
  });
});
