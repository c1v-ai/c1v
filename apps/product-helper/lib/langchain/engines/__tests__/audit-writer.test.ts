import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the shared drizzle instance so the writer works against an in-memory
// fake — we're asserting (a) Zod validation at the boundary, (b) hash-chain
// continuity per (projectId, targetField), (c) tamper detection.
jest.mock('@/lib/db/drizzle', () => ({
  db: {},
}));

// Mock drizzle-orm's and/eq so the writer's predicate composition is
// inspectable. Each eq returns a test marker; and merges markers. The fake
// DB double reads the marker to filter rows.
jest.mock('drizzle-orm', () => {
  const actual = jest.requireActual('drizzle-orm') as Record<string, unknown>;
  return {
    ...actual,
    and: (...clauses: Array<{ __test_filter?: Record<string, unknown> }>) => {
      const merged: Record<string, unknown> = {};
      for (const c of clauses) {
        if (c && c.__test_filter) {
          Object.assign(merged, c.__test_filter);
        }
      }
      return { __test_filter: merged };
    },
    eq: (column: { name?: string }, value: unknown) => {
      const name = column?.name ?? '';
      if (name === 'project_id') {
        return { __test_filter: { projectId: value as number } };
      }
      if (name === 'target_field') {
        return { __test_filter: { targetField: value as string } };
      }
      return { __test_filter: {} };
    },
    desc: (col: unknown) => col,
  };
});

import {
  decisionAuditInputSchema,
  canonicalJSON,
  canonicalHash,
  writeAuditRow,
  verifyChain,
  auditInputFromEngineOutput,
  type DecisionAuditInput,
  type EngineOutputShape,
  type HashableRow,
} from '../audit-writer';
import type { DecisionAuditRow } from '../../../db/schema/decision-audit';

// ──────────────────────────────────────────────────────────────────────────
// In-memory DB double.
// ──────────────────────────────────────────────────────────────────────────

type FakeRow = DecisionAuditRow;

interface WhereNode {
  __test_filter?: { projectId?: number; targetField?: string };
}

function makeDbDouble(initial: FakeRow[] = []) {
  const rows: FakeRow[] = [...initial];
  let idCounter = initial.length + 1;

  const insert = (_table: unknown) => ({
    values: (row: Partial<FakeRow> & Record<string, unknown>) => ({
      returning: (_cols?: unknown): Promise<FakeRow[]> => {
        const inserted: FakeRow = {
          id: `row-${idCounter++}`,
          projectId: row.projectId as number,
          decisionId: row.decisionId as string,
          targetField: row.targetField as string,
          targetArtifact: row.targetArtifact as string,
          storyId: row.storyId as string,
          engineVersion: row.engineVersion as string,
          value: (row.value ?? null) as FakeRow['value'],
          units: (row.units ?? null) as FakeRow['units'],
          inputsUsed: (row.inputsUsed ?? {}) as FakeRow['inputsUsed'],
          modifiersApplied: (row.modifiersApplied ??
            []) as FakeRow['modifiersApplied'],
          baseConfidence: row.baseConfidence as string,
          finalConfidence: row.finalConfidence as string,
          matchedRuleId: (row.matchedRuleId ?? null) as FakeRow['matchedRuleId'],
          autoFilled: (row.autoFilled ?? false) as boolean,
          needsUserInput: (row.needsUserInput ?? false) as boolean,
          computedOptions: (row.computedOptions ??
            null) as FakeRow['computedOptions'],
          mathTrace: row.mathTrace as string,
          missingInputs: (row.missingInputs ?? []) as string[],
          modelVersion: row.modelVersion as string,
          ragAttempted: (row.ragAttempted ?? false) as boolean,
          kbChunkIds: (row.kbChunkIds ?? []) as string[],
          hashChainPrev: (row.hashChainPrev ?? null) as FakeRow['hashChainPrev'],
          userOverrideable: (row.userOverrideable ?? true) as boolean,
          overrideHistory: (row.overrideHistory ??
            []) as FakeRow['overrideHistory'],
          evaluatedAt: new Date(Date.now() + rows.length),
          agentId: row.agentId as string,
        };
        rows.push(inserted);
        return Promise.resolve([inserted]);
      },
    }),
  });

  const select = (_cols?: unknown) => ({
    from: (_table: unknown) => ({
      where: (predicate: WhereNode) => {
        const filter = predicate.__test_filter ?? {};
        const filtered = rows.filter((r) => {
          if (filter.projectId !== undefined && r.projectId !== filter.projectId) {
            return false;
          }
          if (
            filter.targetField !== undefined &&
            r.targetField !== filter.targetField
          ) {
            return false;
          }
          return true;
        });
        return {
          orderBy: (..._cols: unknown[]) => {
            // writeAuditRow chains `.limit(1)` after desc ordering (newest first);
            // verifyChain awaits the orderBy directly (ascending).
            const chain: {
              limit: (n: number) => Promise<FakeRow[]>;
              then: (resolve: (v: FakeRow[]) => void) => void;
            } = {
              limit: (n: number) => {
                const sorted = [...filtered].sort(
                  (a, b) => b.evaluatedAt.getTime() - a.evaluatedAt.getTime(),
                );
                return Promise.resolve(sorted.slice(0, n));
              },
              then: (resolve: (v: FakeRow[]) => void) => {
                const sorted = [...filtered].sort(
                  (a, b) => a.evaluatedAt.getTime() - b.evaluatedAt.getTime(),
                );
                resolve(sorted);
              },
            };
            return chain;
          },
        };
      },
    }),
  });

  return { db: { insert, select } as never, rows };
}

// ──────────────────────────────────────────────────────────────────────────
// Fixtures.
// ──────────────────────────────────────────────────────────────────────────

function baseInput(
  overrides: Partial<DecisionAuditInput> = {},
): DecisionAuditInput {
  return {
    projectId: 42,
    decisionId: 'RESPONSE_BUDGET_MS',
    targetField: 'constants_table.RESPONSE_BUDGET_MS',
    targetArtifact: 'module_2_requirements/constants_table.json',
    storyId: 'story-03-latency-budget',
    engineVersion: '0.1.0',
    value: 500,
    units: 'ms',
    inputsUsed: {
      user_type: { value: 'consumer_app', source: 'M1.scope' },
      flow_class: { value: 'user_facing_sync', source: 'M2.ucbd' },
      regulatory_refs: { value: ['PCI-DSS'], source: 'M1.regulatory' },
    },
    modifiersApplied: [
      { modifier: 'cross_story_agreement', delta: 0.05, reason: 'story-13 agrees' },
    ],
    baseConfidence: 0.94,
    finalConfidence: 0.99,
    matchedRuleId: 'consumer-app-user-facing-sync-pci',
    autoFilled: true,
    needsUserInput: false,
    computedOptions: null,
    mathTrace: '0.94 + 0.05 (cross-story) = 0.99 → auto_fill',
    missingInputs: [],
    modelVersion: 'deterministic-rule-tree',
    ragAttempted: false,
    kbChunkIds: [],
    userOverrideable: true,
    overrideHistory: [],
    agentId: 'agent:phase-8-constants',
    ...overrides,
  };
}

function baseEngineOutput(
  overrides: Partial<EngineOutputShape> = {},
): EngineOutputShape {
  return {
    decision_id: 'RESPONSE_BUDGET_MS',
    target_field: 'constants_table.RESPONSE_BUDGET_MS',
    value: 500,
    units: 'ms',
    base_confidence: 0.9,
    matched_rule_id: 'rule-1',
    inputs_used: { user_type: { value: 'consumer_app', source: 'M1' } },
    modifiers_applied: [{ modifier: 'x', delta: 0.05, reason: 'r' }],
    final_confidence: 0.95,
    auto_filled: true,
    needs_user_input: false,
    math_trace: '0.9 + 0.05 = 0.95',
    missing_inputs: [],
    ...overrides,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Schema validation.
// ──────────────────────────────────────────────────────────────────────────

describe('decisionAuditInputSchema', () => {
  it('accepts a well-formed auto-fill input', () => {
    expect(() => decisionAuditInputSchema.parse(baseInput())).not.toThrow();
  });

  it('accepts value=null (no-match-no-default path per runtime)', () => {
    expect(() =>
      decisionAuditInputSchema.parse(
        baseInput({
          value: null,
          matchedRuleId: null,
          baseConfidence: 0,
          finalConfidence: 0,
          autoFilled: false,
          needsUserInput: true,
          computedOptions: [],
        }),
      ),
    ).not.toThrow();
  });

  it('rejects confidence > 1', () => {
    expect(() =>
      decisionAuditInputSchema.parse(baseInput({ finalConfidence: 1.1 })),
    ).toThrow(/<= 1/);
  });

  it('rejects confidence < 0', () => {
    expect(() =>
      decisionAuditInputSchema.parse(baseInput({ baseConfidence: -0.01 })),
    ).toThrow(/>= 0/);
  });

  it('rejects empty decision_id', () => {
    expect(() =>
      decisionAuditInputSchema.parse(baseInput({ decisionId: '' })),
    ).toThrow();
  });

  it('rejects empty target_artifact', () => {
    expect(() =>
      decisionAuditInputSchema.parse(baseInput({ targetArtifact: '' })),
    ).toThrow();
  });

  it('rejects empty agent_id', () => {
    expect(() =>
      decisionAuditInputSchema.parse(baseInput({ agentId: '' })),
    ).toThrow();
  });

  it('rejects empty model_version (it is NOT NULL at DB level)', () => {
    expect(() =>
      decisionAuditInputSchema.parse(baseInput({ modelVersion: '' })),
    ).toThrow();
  });

  it('rejects non-UUID in kbChunkIds', () => {
    expect(() =>
      decisionAuditInputSchema.parse(baseInput({ kbChunkIds: ['not-a-uuid'] })),
    ).toThrow(/UUID/);
  });

  it('accepts well-formed UUIDs in kbChunkIds (with rag_attempted=true)', () => {
    expect(() =>
      decisionAuditInputSchema.parse(
        baseInput({
          ragAttempted: true,
          kbChunkIds: [
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
          ],
        }),
      ),
    ).not.toThrow();
  });

  it('rejects mutually exclusive disposition flags', () => {
    expect(() =>
      decisionAuditInputSchema.parse(
        baseInput({ autoFilled: true, needsUserInput: true, computedOptions: [] }),
      ),
    ).toThrow(/mutually exclusive/);
  });

  it('rejects needs_user_input=true without computed_options', () => {
    expect(() =>
      decisionAuditInputSchema.parse(
        baseInput({
          autoFilled: false,
          needsUserInput: true,
          computedOptions: null,
        }),
      ),
    ).toThrow(/computed_options must be provided/);
  });

  it('rejects needs_user_input=false with computed_options present', () => {
    expect(() =>
      decisionAuditInputSchema.parse(
        baseInput({ computedOptions: [{ value: 500, confidence: 0.9 }] }),
      ),
    ).toThrow(/computed_options must be null/);
  });

  it('rejects non-empty kb_chunk_ids when rag_attempted=false', () => {
    expect(() =>
      decisionAuditInputSchema.parse(
        baseInput({
          ragAttempted: false,
          kbChunkIds: ['11111111-1111-4111-8111-111111111111'],
        }),
      ),
    ).toThrow(/kb_chunk_ids must be empty/);
  });

  it('accepts rag_attempted=true with empty kb_chunk_ids (zero-hits path)', () => {
    expect(() =>
      decisionAuditInputSchema.parse(
        baseInput({ ragAttempted: true, kbChunkIds: [] }),
      ),
    ).not.toThrow();
  });

  it('accepts rag_attempted=true with non-empty kb_chunk_ids (hits path)', () => {
    expect(() =>
      decisionAuditInputSchema.parse(
        baseInput({
          ragAttempted: true,
          kbChunkIds: ['11111111-1111-4111-8111-111111111111'],
        }),
      ),
    ).not.toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Canonical form determinism.
// ──────────────────────────────────────────────────────────────────────────

describe('canonicalJSON', () => {
  it('produces identical output regardless of key order', () => {
    const a = canonicalJSON({ z: 1, a: 2, m: { y: 3, x: 4 } });
    const b = canonicalJSON({ a: 2, m: { x: 4, y: 3 }, z: 1 });
    expect(a).toBe(b);
  });

  it('handles arrays element-order sensitively (arrays are ordered)', () => {
    expect(canonicalJSON([1, 2, 3])).not.toBe(canonicalJSON([3, 2, 1]));
  });

  it('omits undefined fields but preserves null', () => {
    expect(canonicalJSON({ a: undefined, b: null })).toBe('{"b":null}');
  });
});

function hashableFixture(
  overrides: Partial<HashableRow> = {},
): HashableRow {
  return {
    id: 'x',
    projectId: 1,
    decisionId: 'd',
    targetField: 't',
    targetArtifact: 'a',
    storyId: 's',
    engineVersion: 'v',
    value: 1,
    units: null,
    inputsUsed: {},
    modifiersApplied: [],
    baseConfidence: '0.500',
    finalConfidence: '0.500',
    matchedRuleId: null,
    autoFilled: false,
    needsUserInput: false,
    computedOptions: null,
    mathTrace: 'base=0.5',
    missingInputs: [],
    modelVersion: 'deterministic-rule-tree',
    ragAttempted: false,
    kbChunkIds: [],
    hashChainPrev: null,
    userOverrideable: true,
    agentId: 'a',
    ...overrides,
  };
}

describe('canonicalHash', () => {
  it('is a 64-char lowercase hex string', () => {
    const h = canonicalHash(hashableFixture());
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });

  it('changes when any hashed field changes', () => {
    const base = hashableFixture();
    const h1 = canonicalHash(base);
    const h2 = canonicalHash(hashableFixture({ value: 2 }));
    const h3 = canonicalHash(hashableFixture({ finalConfidence: '0.501' }));
    const h4 = canonicalHash(hashableFixture({ modelVersion: 'claude-4.5' }));
    const h5 = canonicalHash(hashableFixture({ ragAttempted: true }));
    expect(h1).not.toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).not.toBe(h4);
    expect(h1).not.toBe(h5);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Hash-chain continuity.
// ──────────────────────────────────────────────────────────────────────────

describe('writeAuditRow — hash chain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('first row in a stream has hashChainPrev = null', async () => {
    const { db } = makeDbDouble();
    const res = await writeAuditRow(baseInput(), { db });
    expect(res.hashChainPrev).toBeNull();
    expect(res.rowHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('second row in same stream chains to first', async () => {
    const { db, rows } = makeDbDouble();
    const r1 = await writeAuditRow(baseInput(), { db });
    const r2 = await writeAuditRow(
      baseInput({ value: 600, finalConfidence: 0.92 }),
      { db },
    );
    expect(r2.hashChainPrev).toBe(r1.rowHash);
    expect(rows).toHaveLength(2);
  });

  it('different stream (different target_field) starts its own chain', async () => {
    const { db } = makeDbDouble();
    await writeAuditRow(baseInput(), { db });
    const res = await writeAuditRow(
      baseInput({ targetField: 'constants_table.AVAILABILITY_TARGET' }),
      { db },
    );
    expect(res.hashChainPrev).toBeNull();
  });

  it('different project (same target_field) starts its own chain', async () => {
    const { db } = makeDbDouble();
    await writeAuditRow(baseInput(), { db });
    const res = await writeAuditRow(baseInput({ projectId: 99 }), { db });
    expect(res.hashChainPrev).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Tamper detection via verifyChain.
// ──────────────────────────────────────────────────────────────────────────

describe('verifyChain', () => {
  it('valid chain passes', async () => {
    const { db } = makeDbDouble();
    await writeAuditRow(baseInput(), { db });
    await writeAuditRow(baseInput({ value: 600 }), { db });
    await writeAuditRow(baseInput({ value: 700 }), { db });
    const res = await verifyChain(42, baseInput().targetField, { db });
    expect(res.valid).toBe(true);
    expect(res.rowsChecked).toBe(3);
  });

  it('hand-editing a prior row breaks the chain', async () => {
    const { db, rows } = makeDbDouble();
    await writeAuditRow(baseInput(), { db });
    await writeAuditRow(baseInput({ value: 600 }), { db });
    await writeAuditRow(baseInput({ value: 700 }), { db });

    // Simulate tamper: attacker edits row[0].value.
    rows[0] = { ...rows[0], value: 999 };

    const res = await verifyChain(42, baseInput().targetField, { db });
    expect(res.valid).toBe(false);
    expect(res.brokenAt).toBeDefined();
    expect(res.brokenAt!.id).toBe(rows[1].id);
  });

  it('empty stream is valid (rowsChecked=0)', async () => {
    const { db } = makeDbDouble();
    const res = await verifyChain(1, 'nonexistent', { db });
    expect(res.valid).toBe(true);
    expect(res.rowsChecked).toBe(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// EngineOutput → audit input mapping.
// ──────────────────────────────────────────────────────────────────────────

describe('auditInputFromEngineOutput', () => {
  it('round-trips the canonical fields from EngineOutput', () => {
    const mapped = auditInputFromEngineOutput({
      projectId: 7,
      agentId: 'agent:phase-8',
      targetArtifact: 'module_2_requirements/constants_table.json',
      storyId: 'story-03-latency-budget',
      engineVersion: '0.1.0',
      output: baseEngineOutput(),
      modelVersion: 'claude-sonnet-4-5-20250929',
      ragAttempted: true,
      kbChunkIds: ['11111111-1111-4111-8111-111111111111'],
    });

    expect(() => decisionAuditInputSchema.parse(mapped)).not.toThrow();
    expect(mapped.modelVersion).toBe('claude-sonnet-4-5-20250929');
    expect(mapped.ragAttempted).toBe(true);
    expect(mapped.kbChunkIds).toEqual(['11111111-1111-4111-8111-111111111111']);
    expect(mapped.storyId).toBe('story-03-latency-budget');
    expect(mapped.engineVersion).toBe('0.1.0');
  });

  it('defaults model_version to deterministic-rule-tree when omitted', () => {
    const mapped = auditInputFromEngineOutput({
      projectId: 1,
      agentId: 'a',
      targetArtifact: 'x.json',
      storyId: 's',
      engineVersion: 'v',
      output: baseEngineOutput(),
    });
    expect(mapped.modelVersion).toBe('deterministic-rule-tree');
    expect(mapped.ragAttempted).toBe(false);
    expect(mapped.kbChunkIds).toEqual([]);
    expect(mapped.userOverrideable).toBe(true);
  });

  it('threads ragAttempted=true when caller invokes RAG (even with zero hits)', () => {
    const mapped = auditInputFromEngineOutput({
      projectId: 1,
      agentId: 'a',
      targetArtifact: 'x.json',
      storyId: 's',
      engineVersion: 'v',
      output: baseEngineOutput(),
      ragAttempted: true,
      kbChunkIds: [],
    });
    expect(mapped.ragAttempted).toBe(true);
    expect(mapped.kbChunkIds).toEqual([]);
    expect(() => decisionAuditInputSchema.parse(mapped)).not.toThrow();
  });

  it('coerces computed_options to null when needs_user_input=false', () => {
    const mapped = auditInputFromEngineOutput({
      projectId: 1,
      agentId: 'a',
      targetArtifact: 'x.json',
      storyId: 's',
      engineVersion: 'v',
      output: baseEngineOutput({
        computed_options: [{ value: 500, confidence: 0.9 }],
      }),
    });
    expect(mapped.computedOptions).toBeNull();
    expect(() => decisionAuditInputSchema.parse(mapped)).not.toThrow();
  });

  it('keeps computed_options when needs_user_input=true, defaulting to []', () => {
    const mapped = auditInputFromEngineOutput({
      projectId: 1,
      agentId: 'a',
      targetArtifact: 'x.json',
      storyId: 's',
      engineVersion: 'v',
      output: baseEngineOutput({
        auto_filled: false,
        needs_user_input: true,
        computed_options: undefined,
      }),
    });
    expect(mapped.computedOptions).toEqual([]);
    expect(() => decisionAuditInputSchema.parse(mapped)).not.toThrow();
  });

  it('accepts the no-match-no-default path (runtime edge case)', () => {
    const mapped = auditInputFromEngineOutput({
      projectId: 1,
      agentId: 'a',
      targetArtifact: 'x.json',
      storyId: 's',
      engineVersion: 'v',
      output: baseEngineOutput({
        value: null,
        matched_rule_id: null,
        base_confidence: 0,
        final_confidence: 0,
        auto_filled: false,
        needs_user_input: true,
        computed_options: [],
      }),
    });
    expect(() => decisionAuditInputSchema.parse(mapped)).not.toThrow();
    expect(mapped.value).toBeNull();
    expect(mapped.matchedRuleId).toBeNull();
  });
});
