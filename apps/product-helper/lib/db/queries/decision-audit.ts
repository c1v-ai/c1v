/**
 * decision_audit read-side query helpers.
 *
 * The canonical write path lives in `lib/langchain/engines/audit-writer.ts`
 * (`writeAuditRow` + `verifyChain`) because hash-chain computation must stay
 * colocated with the Zod boundary schema and canonicalization logic. These
 * helpers are thin wrappers + a trail reader for UI / replay / verifier
 * consumers that don't need to import the engine module.
 *
 * Stream key: (projectId, targetField). Matches the hash-chain stream that
 * `writeAuditRow` maintains.
 *
 * @module lib/db/queries/decision-audit
 */

import { and, asc, desc, eq } from 'drizzle-orm';

import { db as defaultDb } from '@/lib/db/drizzle';
import {
  decisionAudit,
  type DecisionAuditRow,
} from '@/lib/db/schema/decision-audit';
import {
  canonicalHash,
  writeAuditRow,
  type DecisionAuditInput,
  type WriteAuditRowResult,
} from '@/lib/langchain/engines/audit-writer';

type Db = typeof defaultDb;

/**
 * Append a new audit row. Delegates to the canonical writer so hash-chain
 * computation, Zod validation, and canonicalization stay in one place.
 */
export async function appendAuditRow(
  payload: DecisionAuditInput,
  db: Db = defaultDb,
): Promise<WriteAuditRowResult> {
  return writeAuditRow(payload, { db });
}

/**
 * Return the hash that the next row on the (projectId, targetField) stream
 * should carry as `hash_chain_prev`. `null` iff the stream is empty.
 *
 * Exposed for callers that want to preview the chain state before writing
 * (e.g. UI "about to record decision X" affordances). The actual writer
 * re-reads this internally — do NOT try to precompute and pass it through.
 */
export async function getHashChainPrev(
  projectId: number,
  targetField: string,
  db: Db = defaultDb,
): Promise<string | null> {
  const [prev] = await db
    .select()
    .from(decisionAudit)
    .where(
      and(
        eq(decisionAudit.projectId, projectId),
        eq(decisionAudit.targetField, targetField),
      ),
    )
    .orderBy(desc(decisionAudit.evaluatedAt), desc(decisionAudit.id))
    .limit(1);

  return prev ? canonicalHash(prev) : null;
}

/**
 * Full chronological audit trail for a project. Used by the provenance-chain
 * UI ("show me every decision this project made") and by `verifyChain`
 * consumers that want to surface the rows alongside the verification result.
 *
 * Ordered by (evaluated_at ASC, id ASC) — replay order, not newest-first.
 * Filter by `targetField` to scope to a single hash-chain stream.
 */
export async function getAuditTrail(
  projectId: number,
  opts: { targetField?: string; limit?: number } = {},
  db: Db = defaultDb,
): Promise<DecisionAuditRow[]> {
  const where = opts.targetField
    ? and(
        eq(decisionAudit.projectId, projectId),
        eq(decisionAudit.targetField, opts.targetField),
      )
    : eq(decisionAudit.projectId, projectId);

  const query = db
    .select()
    .from(decisionAudit)
    .where(where)
    .orderBy(asc(decisionAudit.evaluatedAt), asc(decisionAudit.id));

  return opts.limit ? query.limit(opts.limit) : query;
}
