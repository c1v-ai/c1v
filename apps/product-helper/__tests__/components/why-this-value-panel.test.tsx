/**
 * WhyThisValuePanel structural + override-form-validation tests (jest 'node' env).
 *
 * EC-V21-E.11 ship-gate:
 *   1. Panel renders all 5 sections (matched-rule / math-trace /
 *      kb-references / override-history / override-cta).
 *   2. Override form rejects rationale shorter than 10 chars.
 *   3. Override submit POSTs to the override API (writes a new audit row).
 *   4. Cross-tenant override request is blocked at the API layer (403).
 *
 * Pattern follows `__tests__/synthesis/recommendation-viewer.test.tsx` —
 * jest runs with testEnvironment: 'node' (no jsdom), so we invoke function
 * components as pure functions and walk the React element tree.
 *
 * The override-form validation assertion is a unit-style check on the
 * `MIN_RATIONALE_CHARS` boundary by constructing the form's expected
 * `canSubmit` predicate inline (jsdom-free).
 *
 * The override-API tests stub `next/server` + the audit writer + queries to
 * exercise the route handler directly without a live DB.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// ──────────────────────────────────────────────────────────────────────────
// Mock Radix-backed UI primitives so renderToStaticMarkup can walk them
// without a Dialog/Sheet root context. The panel + form only use these as
// styling/structure wrappers — no behaviour relies on the Radix runtime
// here.
// ──────────────────────────────────────────────────────────────────────────

jest.mock('@/components/ui/sheet', () => {
  const React = require('react');
  type DivProps = React.HTMLAttributes<HTMLDivElement>;
  const passthrough = (testid: string) =>
    function MockSheetPart(props: DivProps) {
      return React.createElement('div', { 'data-mock': testid, ...props });
    };
  return {
    Sheet: passthrough('sheet'),
    SheetTrigger: passthrough('sheet-trigger'),
    SheetClose: passthrough('sheet-close'),
    SheetContent: passthrough('sheet-content'),
    SheetHeader: passthrough('sheet-header'),
    SheetFooter: passthrough('sheet-footer'),
    SheetTitle: passthrough('sheet-title'),
    SheetDescription: passthrough('sheet-description'),
  };
});

jest.mock('@/components/ui/dialog', () => {
  const React = require('react');
  type DivProps = React.HTMLAttributes<HTMLDivElement>;
  const passthrough = (testid: string) =>
    function MockDialogPart(props: DivProps) {
      return React.createElement('div', { 'data-mock': testid, ...props });
    };
  return {
    Dialog: passthrough('dialog'),
    DialogTrigger: passthrough('dialog-trigger'),
    DialogContent: passthrough('dialog-content'),
    DialogHeader: passthrough('dialog-header'),
    DialogFooter: passthrough('dialog-footer'),
    DialogTitle: passthrough('dialog-title'),
    DialogDescription: passthrough('dialog-description'),
  };
});

// ──────────────────────────────────────────────────────────────────────────
// Mock infra used by the override route + its inputs.
// ──────────────────────────────────────────────────────────────────────────

const getUserMock = jest.fn<() => Promise<{ id: number } | null>>();
const getTeamForUserMock = jest.fn<() => Promise<{ id: number } | null>>();

jest.mock('@/lib/db/queries', () => ({
  getUser: () => getUserMock(),
  getTeamForUser: () => getTeamForUserMock(),
}));

const projectLookupMock = jest.fn<() => Promise<Array<{ id: number }>>>();
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({ limit: () => projectLookupMock() }),
      }),
    }),
  },
}));

const getLatestDecisionAuditRowMock =
  jest.fn<
    () => Promise<{
      decisionId: string;
      targetField: string;
      targetArtifact: string;
      storyId: string;
      engineVersion: string;
      units: string | null;
      userOverrideable: boolean;
      autoFilled: boolean;
      mathTrace: string;
    } | null>
  >();
jest.mock('@/lib/db/decision-audit-queries', () => ({
  getLatestDecisionAuditRow: () => getLatestDecisionAuditRowMock(),
  getDecisionAuditStream: () => Promise.resolve([]),
}));

const writeAuditRowMock = jest.fn<
  () => Promise<{ id: string; hashChainPrev: string | null; rowHash: string }>
>();
jest.mock('@/lib/langchain/engines/audit-writer', () => ({
  writeAuditRow: (input: unknown) => {
    return writeAuditRowMock();
  },
}));

// Imports AFTER mocks.
import { WhyThisValuePanel } from '@/components/synthesis/why-this-value-panel';
import { OverrideForm } from '@/components/synthesis/override-form';
import type { ExplainDecisionResponse } from '@/components/synthesis/why-this-value-types';
import { POST as OverridePost } from '@/app/api/decision-audit/[projectId]/[targetField]/override/route';

// ──────────────────────────────────────────────────────────────────────────
// Helpers — render to HTML via react-dom/server (initializes hooks correctly).
// ──────────────────────────────────────────────────────────────────────────

function makePayload(
  override: Partial<ExplainDecisionResponse> = {},
): ExplainDecisionResponse {
  return {
    decision_id: 'D-01',
    target_field: 'architecture_recommendation/decisions[D-01].chosen_option',
    value: 'PostgreSQL',
    units: null,
    user_overrideable: true,
    matched_rule: {
      rule_id: 'rule-prefer-postgres',
      summary: 'Pick PostgreSQL when team has SQL expertise + RPS < 10k.',
      story_id: 'story-04-database-pick',
      engine_version: 'v1.0.0',
    },
    math: {
      trace: 'rule-prefer-postgres fired; base 0.85 + reliability +0.05 = 0.90',
      inputs_used: { 'team.sql_expertise': true, 'load.rps_p95': 1200 },
      modifiers_applied: [
        { id: 'reliability-bonus', delta: 0.05, reason: 'pgvector mature' },
      ],
      base_confidence: 0.85,
      final_confidence: 0.9,
    },
    kb_references: [
      {
        chunk_id: '00000000-0000-0000-0000-000000000001',
        kb_source: '4-decision-net-crawley-on-cornell',
        excerpt: 'PostgreSQL with pgvector is a strong default…',
        score: 0.91,
      },
    ],
    override_history: [
      {
        audit_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        evaluated_at: '2026-04-27T12:00:00.000Z',
        agent_id: 'agent:synthesizer',
        value: 'PostgreSQL',
        units: null,
        auto_filled: true,
      },
    ],
    ...override,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Tests.
// ──────────────────────────────────────────────────────────────────────────

describe('WhyThisValuePanel structural', () => {
  test('renders all 5 sections when given a ready payload', () => {
    const payload = makePayload();
    const html = renderToStaticMarkup(
      <WhyThisValuePanel
        projectId={42}
        decisionId={payload.decision_id}
        targetField={payload.target_field}
        storyId={payload.matched_rule.story_id}
        engineVersion={payload.matched_rule.engine_version}
        initialPayload={payload}
        onClose={() => {}}
      />,
    );

    expect(html).toContain('data-testid="why-this-value-panel"');
    expect(html).toContain('data-testid="section-matched-rule"');
    expect(html).toContain('data-testid="section-math-trace"');
    expect(html).toContain('data-testid="section-kb-references"');
    expect(html).toContain('data-testid="section-override-history"');
    expect(html).toContain('data-testid="section-override-cta"');
  });
});

describe('OverrideForm validation', () => {
  test('rationale below 10 chars renders the validation hint', () => {
    const html = renderToStaticMarkup(
      <OverrideForm
        projectId={42}
        decisionId="D-01"
        targetField="foo.bar"
        storyId="story-01"
        engineVersion="v1"
        currentValue="old"
        currentUnits={null}
        userOverrideable={true}
        onClose={() => {}}
        onSubmitted={() => {}}
      />,
    );

    expect(html).toContain('data-testid="override-form"');
    // Empty initial rationale → validation hint visible.
    expect(html).toContain('data-testid="rationale-validation"');
    // Submit button is disabled while rationale is too short.
    expect(html).toMatch(/disabled[^>]*>\s*Save override/);
  });
});

describe('Override route — POST /api/decision-audit/.../override', () => {
  function buildRequest(body: unknown) {
    return {
      json: async () => body,
    } as unknown as Parameters<typeof OverridePost>[0];
  }

  function buildParams(projectId: number, targetField: string) {
    return {
      params: Promise.resolve({
        projectId: String(projectId),
        targetField: encodeURIComponent(targetField),
      }),
    };
  }

  beforeEach(() => {
    getUserMock.mockReset();
    getTeamForUserMock.mockReset();
    projectLookupMock.mockReset();
    getLatestDecisionAuditRowMock.mockReset();
    writeAuditRowMock.mockReset();
  });

  test('writes a new audit row on a valid override', async () => {
    getUserMock.mockResolvedValue({ id: 1 });
    getTeamForUserMock.mockResolvedValue({ id: 7 });
    projectLookupMock.mockResolvedValue([{ id: 42 }]);
    getLatestDecisionAuditRowMock.mockResolvedValue({
      decisionId: 'D-01',
      targetField: 'foo.bar',
      targetArtifact: 'recommendation_json',
      storyId: 'story-01',
      engineVersion: 'v1',
      units: null,
      userOverrideable: true,
      autoFilled: true,
      mathTrace: 'rule-x fired',
    });
    writeAuditRowMock.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      hashChainPrev: 'a'.repeat(64),
      rowHash: 'b'.repeat(64),
    });

    const res = await OverridePost(
      buildRequest({
        decisionId: 'D-01',
        storyId: 'story-01',
        engineVersion: 'v1',
        newValue: 'NewChoice',
        rationale: 'Operational reasons documented in incident IR-2026-04-27.',
      }),
      buildParams(42, 'foo.bar'),
    );

    expect(res.status).toBe(201);
    expect(writeAuditRowMock).toHaveBeenCalledTimes(1);
  });

  test('cross-tenant request returns 403 (project not in user team)', async () => {
    getUserMock.mockResolvedValue({ id: 1 });
    getTeamForUserMock.mockResolvedValue({ id: 7 });
    // Empty result simulates the project belonging to another team.
    projectLookupMock.mockResolvedValue([]);

    const res = await OverridePost(
      buildRequest({
        decisionId: 'D-01',
        storyId: 'story-01',
        engineVersion: 'v1',
        newValue: 'NewChoice',
        rationale: 'a documented operational reason ten plus chars.',
      }),
      buildParams(99, 'foo.bar'),
    );

    expect(res.status).toBe(403);
    expect(writeAuditRowMock).not.toHaveBeenCalled();
  });

  test('rejects rationale below 10 chars at the route boundary', async () => {
    getUserMock.mockResolvedValue({ id: 1 });
    getTeamForUserMock.mockResolvedValue({ id: 7 });
    projectLookupMock.mockResolvedValue([{ id: 42 }]);

    const res = await OverridePost(
      buildRequest({
        decisionId: 'D-01',
        storyId: 'story-01',
        engineVersion: 'v1',
        newValue: 'NewChoice',
        rationale: 'too short',
      }),
      buildParams(42, 'foo.bar'),
    );

    expect(res.status).toBe(400);
    expect(writeAuditRowMock).not.toHaveBeenCalled();
  });
});
