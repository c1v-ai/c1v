/**
 * decision_audit query helpers (read-side) for the "why this value?"
 * provenance UI.
 *
 * Append-row override pattern (see
 * `components/synthesis/why-this-value-types.ts`):
 *   The `decision_audit` table is APPEND-ONLY. Every write is a new row.
 *   The "override history" rendered by the UI is therefore a chronological
 *   scan of all rows in the `(project_id, target_field)` stream, NOT a
 *   JSONB-array UPDATE on a single row.
 *
 * Tenant isolation: all queries filter by `projectId` whose tenant ownership
 * was already verified by the calling API route (session → team_id →
 * projects.team_id). RLS provides defense-in-depth via
 * `decision_audit_tenant_select` policy.
 *
 * @module lib/db/decision-audit-queries
 */

import { and, asc, desc, eq } from 'drizzle-orm';

import { db } from './drizzle';
import {
  decisionAudit,
  type DecisionAuditRow,
} from './schema/decision-audit';

/**
 * Most recent row for `(projectId, targetField)`. Used by the explain
 * endpoint to surface the "current value" + matched-rule info.
 */
export async function getLatestDecisionAuditRow(
  projectId: number,
  targetField: string,
): Promise<DecisionAuditRow | null> {
  const [row] = await db
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
  return row ?? null;
}

/**
 * All rows in the `(projectId, targetField)` stream, chronological
 * (oldest first). Used by the override-history table in the side-panel.
 */
export async function getDecisionAuditStream(
  projectId: number,
  targetField: string,
): Promise<DecisionAuditRow[]> {
  return db
    .select()
    .from(decisionAudit)
    .where(
      and(
        eq(decisionAudit.projectId, projectId),
        eq(decisionAudit.targetField, targetField),
      ),
    )
    .orderBy(asc(decisionAudit.evaluatedAt), asc(decisionAudit.id));
}
