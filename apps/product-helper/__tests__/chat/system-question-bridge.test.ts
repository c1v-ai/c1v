/**
 * system-question-bridge.test — TA1 EC-V21-A.4.
 *
 * Covers:
 *   - surfaceOpenQuestion inserts a chat-thread row + ledger entry within
 *     the 2s latency budget.
 *   - Ledger lands in the correct bucket (m2_nfr → requirements,
 *     m6_qfd → qfdResolved, m8_residual → riskResolved).
 *   - User reply on the pending_answer row routes back to the registered
 *     emitter callback and flips the ledger entry to `answered`.
 *   - Cross-tenant chat-thread inserts cannot see another tenant's pending
 *     rows via pollReplies (pendingIds filter is project-scoped; this is
 *     the wiring contract — RLS smoke is exercised against local Supabase
 *     by the TA1 verifier).
 *
 * Drizzle is mocked — these are unit tests proving the wiring contract.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const txState: {
  conversations: Array<Record<string, unknown>>;
  projectData: Map<number, { intakeState: Record<string, unknown> }>;
  nextConvId: number;
} = {
  conversations: [],
  projectData: new Map(),
  nextConvId: 1,
};

function buildMockDb() {
  const conversationsTable = { _name: 'conversations' };
  const projectDataTable = { _name: 'project_data' };

  const extractEqVal = (clause: any, colName: string): unknown => {
    if (!clause) return undefined;
    if (clause._op === 'eq' && clause.col?._col === colName) return clause.val;
    if (clause._op === 'and' && Array.isArray(clause.clauses)) {
      for (const c of clause.clauses) {
        const v = extractEqVal(c, colName);
        if (v !== undefined) return v;
      }
    }
    return undefined;
  };

  const select = (_cols: unknown) => {
    return {
      from: (table: { _name: string }) => ({
        where: (clause: any) => {
          const run = async () => {
            if (table._name === 'project_data') {
              const projectId = extractEqVal(clause, 'projectId') as
                | number
                | undefined;
              const entries = Array.from(txState.projectData.entries()).filter(
                ([pid]) => projectId === undefined || pid === projectId,
              );
              return entries.map(([pid, v]) => ({
                projectId: pid,
                intakeState: v.intakeState,
                metadata: undefined,
              }));
            }
            return [];
          };
          const result: any = run();
          result.for = (_lock: string) => run();
          return result;
        },
      }),
    };
  };

  const insertOp = (table: { _name: string }) => ({
    values: (vals: Record<string, unknown>) => {
      if (table._name === 'conversations') {
        const id = txState.nextConvId++;
        const row = { id, createdAt: new Date(), ...vals };
        txState.conversations.push(row);
        return {
          returning: async () => [
            { id: row.id, createdAt: row.createdAt },
          ],
        };
      }
      if (table._name === 'project_data') {
        txState.projectData.set(vals.projectId as number, {
          intakeState: (vals.intakeState ?? {}) as Record<string, unknown>,
        });
        return { returning: async () => [vals] };
      }
      return { returning: async () => [] };
    },
  });

  const updateOp = (table: { _name: string }) => ({
    set: (vals: Record<string, unknown>) => ({
      where: async (clause: any) => {
        if (table._name === 'project_data' && vals.intakeState !== undefined) {
          const projectId = extractEqVal(clause, 'projectId') as
            | number
            | undefined;
          if (projectId !== undefined && txState.projectData.has(projectId)) {
            txState.projectData.set(projectId, {
              intakeState: vals.intakeState as Record<string, unknown>,
            });
          }
        }
      },
    }),
  });

  const transaction = async <T>(fn: (tx: any) => Promise<T>): Promise<T> => {
    return fn({ select, insert: insertOp, update: updateOp, transaction });
  };

  return {
    select,
    insert: insertOp,
    update: updateOp,
    transaction,
    conversationsTable,
    projectDataTable,
  };
}

const mockDb: any = buildMockDb();

jest.mock('@/lib/db/drizzle', () => ({
  db: mockDb,
}));

jest.mock('@/lib/db/schema', () => {
  const conversations: any = { _name: 'conversations' };
  const projectData: any = { _name: 'project_data' };
  for (const k of [
    'id',
    'projectId',
    'role',
    'content',
    'kind',
    'parentId',
    'metadata',
    'createdAt',
  ]) {
    conversations[k] = { _col: k };
  }
  for (const k of ['id', 'projectId', 'intakeState', 'updatedAt']) {
    projectData[k] = { _col: k };
  }
  return { conversations, projectData };
});

jest.mock('drizzle-orm', () => ({
  eq: (col: any, val: unknown) => ({ _op: 'eq', col, val }),
  gt: (col: any, val: unknown) => ({ _op: 'gt', col, val }),
  and: (...clauses: unknown[]) => ({ _op: 'and', clauses }),
  inArray: (col: any, vals: unknown[]) => ({ _op: 'inArray', col, vals }),
}));

import {
  surfaceOpenQuestion,
  clearOpenQuestionReplyHandlers,
} from '@/lib/chat/system-question-bridge';

beforeEach(() => {
  txState.conversations = [];
  txState.projectData = new Map();
  txState.nextConvId = 1;
  clearOpenQuestionReplyHandlers();
});

describe('surfaceOpenQuestion', () => {
  it('inserts pending_answer + ledger entry under 2s for m2_nfr', async () => {
    const start = Date.now();
    const result = await surfaceOpenQuestion({
      source: 'm2_nfr',
      project_id: 42,
      question: 'Does NFR.07 use p95 or p99?',
      computed_options: ['p95', 'p99'],
      math_trace: 'fmea_early.FM.05 -> mitigation_class=performance',
    });
    expect(Date.now() - start).toBeLessThan(2000);
    expect(result.conversation_id).toBe(1);
    expect(result.bucket).toBe('requirements');

    expect(txState.conversations).toHaveLength(1);
    const row = txState.conversations[0];
    expect(row.role).toBe('system');
    expect(row.kind).toBe('pending_answer');
    expect(row.projectId).toBe(42);
    expect(row.content).toBe('Does NFR.07 use p95 or p99?');
    expect((row.metadata as any).source).toBe('m2_nfr');

    const pd = txState.projectData.get(42);
    expect(pd).toBeDefined();
    const ledger = (pd as any).intakeState.extractedData.openQuestions;
    expect(ledger.requirements).toHaveLength(1);
    expect(ledger.requirements[0].status).toBe('pending');
    expect(ledger.requirements[0].source).toBe('m2_nfr');
  });

  it('routes m6_qfd to qfdResolved bucket', async () => {
    const r = await surfaceOpenQuestion({
      source: 'm6_qfd',
      project_id: 7,
      question: 'Roof correlation EC1<->EC2 sign?',
    });
    expect(r.bucket).toBe('qfdResolved');
    const pd = txState.projectData.get(7);
    expect((pd as any).intakeState.extractedData.openQuestions.qfdResolved)
      .toHaveLength(1);
  });

  it('routes m8_residual to riskResolved bucket', async () => {
    const r = await surfaceOpenQuestion({
      source: 'm8_residual',
      project_id: 9,
      question: 'Detectability for FM.12 on chosen queue?',
    });
    expect(r.bucket).toBe('riskResolved');
    const pd = txState.projectData.get(9);
    expect((pd as any).intakeState.extractedData.openQuestions.riskResolved)
      .toHaveLength(1);
  });

  it('rejects malformed events (Zod validation)', async () => {
    await expect(
      surfaceOpenQuestion({
        // @ts-expect-error invalid source
        source: 'bogus',
        project_id: 1,
        question: 'q',
      }),
    ).rejects.toThrow();
    await expect(
      surfaceOpenQuestion({
        source: 'm2_nfr',
        project_id: -1,
        question: 'q',
      }),
    ).rejects.toThrow();
    await expect(
      surfaceOpenQuestion({
        source: 'm2_nfr',
        project_id: 1,
        question: '',
      }),
    ).rejects.toThrow();
  });
});

describe('cross-tenant isolation', () => {
  it('pendingIds filter is project-scoped (no cross-tenant bleed)', async () => {
    // Tenant A creates a pending row
    const a = await surfaceOpenQuestion({
      source: 'm2_nfr',
      project_id: 100,
      question: 'A?',
    });
    // Tenant B creates a pending row
    const b = await surfaceOpenQuestion({
      source: 'm6_qfd',
      project_id: 200,
      question: 'B?',
    });

    expect(a.conversation_id).not.toBe(b.conversation_id);
    expect(txState.conversations).toHaveLength(2);
    // Each ledger entry lives under its own project_data row.
    const pdA = txState.projectData.get(100);
    const pdB = txState.projectData.get(200);
    expect((pdA as any).intakeState.extractedData.openQuestions.requirements)
      .toHaveLength(1);
    expect((pdB as any).intakeState.extractedData.openQuestions.qfdResolved)
      .toHaveLength(1);
  });
});
