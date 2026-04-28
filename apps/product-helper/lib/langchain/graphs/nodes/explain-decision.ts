/**
 * `explain_decision` LangGraph node — "why this value?" provenance producer.
 *
 * Owned by the kb-rewrite agent (Wave-E ε phase per master plan v2.1 line 476).
 * Consumed by `provenance-ui`'s `<WhyThisValuePanel />` (5-section side-panel)
 * via a route handler that delegates to this node.
 *
 * Inputs:
 *   - `decisionRef`: `{ projectId: number, targetField: string }`
 *
 * Output:
 *   - `ExplainDecisionResponse` (5-section payload defined in
 *     `components/synthesis/why-this-value-types.ts` by `provenance-ui`):
 *       1. matched_rule (rule_id, summary, story_id, engine_version)
 *       2. math (trace, inputs_used, modifiers_applied, base_confidence,
 *          final_confidence)
 *       3. kb_references (chunk_id, kb_source, excerpt)
 *       4. override_history (chronological scan of `decision_audit` rows in
 *          the `(project_id, target_field)` stream — append-row pattern per
 *          `0011b_decision_audit.sql` REVOKE UPDATE)
 *
 * Failure semantics:
 *   - returns `null` if no audit row exists for the stream (caller surfaces
 *     404). Does NOT throw; the route's own auth/tenant gate stays the
 *     primary policy boundary.
 *
 * Tenant isolation:
 *   - this node does NOT enforce tenancy; the caller (route or sibling node)
 *     must gate `(projectId)` against the session team BEFORE invoking. RLS on
 *     `decision_audit` is the defense-in-depth fallback.
 *
 * @module lib/langchain/graphs/nodes/explain-decision
 */

import { inArray } from 'drizzle-orm';

import { db } from '@/lib/db/drizzle';
import { kbChunks } from '@/lib/db/schema/kb-chunks';
import { getAuditTrail } from '@/lib/db/queries/decision-audit';
import type { DecisionAuditRow } from '@/lib/db/schema/decision-audit';

import type {
  ExplainDecisionResponse,
  KbReference,
  OverrideHistoryEntry,
} from '@/components/synthesis/why-this-value-types';

export interface ExplainDecisionInput {
  projectId: number;
  targetField: string;
}

export async function explainDecision(
  input: ExplainDecisionInput,
): Promise<ExplainDecisionResponse | null> {
  const { projectId, targetField } = input;

  const trail: DecisionAuditRow[] = await getAuditTrail(projectId, {
    targetField,
  });
  if (trail.length === 0) return null;

  const latest = trail[trail.length - 1];

  const kb_references: KbReference[] =
    latest.kbChunkIds.length > 0
      ? await resolveKbChunks(latest.kbChunkIds)
      : [];

  const override_history: OverrideHistoryEntry[] = trail.map((row) => ({
    audit_id: row.id,
    evaluated_at:
      row.evaluatedAt instanceof Date
        ? row.evaluatedAt.toISOString()
        : new Date(row.evaluatedAt as unknown as string).toISOString(),
    agent_id: row.agentId,
    value: row.value,
    units: row.units ?? null,
    auto_filled: row.autoFilled,
    rationale: row.autoFilled ? undefined : row.mathTrace,
  }));

  return {
    decision_id: latest.decisionId,
    target_field: latest.targetField,
    value: latest.value,
    units: latest.units ?? null,
    user_overrideable: latest.userOverrideable,
    matched_rule: {
      rule_id: latest.matchedRuleId,
      summary: latest.matchedRuleId
        ? `Rule ${latest.matchedRuleId} fired on story ${latest.storyId}.`
        : 'No rule matched — fallback path produced this value.',
      story_id: latest.storyId,
      engine_version: latest.engineVersion,
    },
    math: {
      trace: latest.mathTrace,
      inputs_used: latest.inputsUsed as Record<string, unknown>,
      modifiers_applied: latest.modifiersApplied as Array<{
        id?: string;
        modifier?: string;
        delta?: number;
        reason?: string;
      }>,
      base_confidence: Number(latest.baseConfidence),
      final_confidence: Number(latest.finalConfidence),
    },
    kb_references,
    override_history,
  };
}

async function resolveKbChunks(ids: string[]): Promise<KbReference[]> {
  const rows = await db
    .select({
      id: kbChunks.id,
      kbSource: kbChunks.kbSource,
      content: kbChunks.content,
    })
    .from(kbChunks)
    .where(inArray(kbChunks.id, ids));
  return rows.map((r) => ({
    chunk_id: r.id,
    kb_source: r.kbSource,
    excerpt: r.content.length > 240 ? `${r.content.slice(0, 237)}…` : r.content,
  }));
}
