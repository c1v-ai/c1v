/**
 * GET /api/decision-audit/[projectId]/[targetField]/explain
 *
 * Returns the `ExplainDecisionResponse` payload the "why this value?"
 * side-panel renders. Resolves:
 *   - latest decision_audit row in the stream (matched rule + math trace)
 *   - chronological scan of the stream (override history; append-row pattern)
 *   - kb_chunk_ids → content excerpts (when those rows fed the decision)
 *
 * SOFT-DEP: kb-rewrite owns the `explain_decision` LangGraph node. Until
 * that node ships, this route resolves the payload directly from the
 * `decision_audit` + `kb_chunks` tables. When the node ships, this route
 * delegates to it.
 *
 * Tenant isolation: session → team_id → projects.team_id. RLS provides
 * defense-in-depth via `decision_audit_tenant_select`.
 *
 * @module app/api/decision-audit/[projectId]/[targetField]/explain/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';

import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { kbChunks } from '@/lib/db/schema/kb-chunks';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import {
  getLatestDecisionAuditRow,
  getDecisionAuditStream,
} from '@/lib/db/decision-audit-queries';

import type {
  ExplainDecisionResponse,
  KbReference,
  OverrideHistoryEntry,
} from '@/components/synthesis/why-this-value-types';

interface RouteParams {
  params: Promise<{ projectId?: string; targetField?: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { projectId: projectIdRaw, targetField: targetFieldRaw } =
    await params;
  const projectId = Number(projectIdRaw);
  if (!projectId || Number.isNaN(projectId)) {
    return NextResponse.json({ error: 'invalid_project_id' }, { status: 400 });
  }
  const targetField = targetFieldRaw
    ? decodeURIComponent(targetFieldRaw)
    : '';
  if (!targetField) {
    return NextResponse.json(
      { error: 'invalid_target_field' },
      { status: 400 },
    );
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const team = await getTeamForUser();
  if (!team) {
    return NextResponse.json({ error: 'no_team' }, { status: 403 });
  }

  // Tenant gate: project must belong to this team.
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.teamId, team.id)))
    .limit(1);
  if (!project) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 403 });
  }

  const latest = await getLatestDecisionAuditRow(projectId, targetField);
  if (!latest) {
    return NextResponse.json(
      { error: 'decision_not_found' },
      { status: 404 },
    );
  }

  const stream = await getDecisionAuditStream(projectId, targetField);

  const kbRefs: KbReference[] =
    latest.kbChunkIds.length > 0
      ? await resolveKbChunks(latest.kbChunkIds)
      : [];

  const overrideHistory: OverrideHistoryEntry[] = stream.map((row) => ({
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

  const response: ExplainDecisionResponse = {
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
      inputs_used: latest.inputsUsed,
      modifiers_applied: latest.modifiersApplied,
      base_confidence: Number(latest.baseConfidence),
      final_confidence: Number(latest.finalConfidence),
    },
    kb_references: kbRefs,
    override_history: overrideHistory,
  };

  return NextResponse.json(response);
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
