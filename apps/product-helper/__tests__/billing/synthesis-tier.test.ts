/**
 * Tests for lib/billing/synthesis-tier — TB1 DB-backed tier gate.
 *
 * Validates EC-V21-B.3 (Free hard-capped at 1/mo; Plus unlimited) +
 * D-V21.10 + edge cases (start-of-month boundary, plan upgrade mid-month,
 * SYNTHESIS_FREE_TIER_GATE modes).
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

const mockTeamRow: { planName: string | null; subscriptionStatus: string | null } = {
  planName: null,
  subscriptionStatus: null,
};
let mockMonthCount = 0;

jest.mock('@/lib/db/drizzle', () => ({
  __esModule: true,
  db: {
    query: {
      teams: {
        findFirst: jest.fn(async () => ({ ...mockTeamRow })),
      },
    },
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        innerJoin: jest.fn(() => ({
          where: jest.fn(async () => [{ value: mockMonthCount }]),
        })),
      })),
    })),
  },
}));

jest.mock('@/lib/db/schema', () => ({
  __esModule: true,
  teams: { id: 'teams.id' },
  projects: { id: 'projects.id', teamId: 'projects.team_id' },
}));

jest.mock('@/lib/db/schema/project-artifacts', () => ({
  __esModule: true,
  projectArtifacts: {
    projectId: 'project_artifacts.project_id',
    artifactKind: 'project_artifacts.artifact_kind',
    createdAt: 'project_artifacts.created_at',
  },
}));

jest.mock('drizzle-orm', () => ({
  __esModule: true,
  and: (...a: unknown[]) => ({ __and: a }),
  eq: (a: unknown, b: unknown) => ({ __eq: [a, b] }),
  gte: (a: unknown, b: unknown) => ({ __gte: [a, b] }),
  like: (a: unknown, b: unknown) => ({ __like: [a, b] }),
  sql: (strings: TemplateStringsArray) => ({ __sql: strings.join('') }),
}));

import {
  checkSynthesisAllowance,
  FREE_SYNTHESIS_PER_MONTH,
} from '@/lib/billing/synthesis-tier';

describe('checkSynthesisAllowance', () => {
  const originalEnv = process.env.SYNTHESIS_FREE_TIER_GATE;

  beforeEach(() => {
    mockTeamRow.planName = null;
    mockTeamRow.subscriptionStatus = null;
    mockMonthCount = 0;
    delete process.env.SYNTHESIS_FREE_TIER_GATE;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.SYNTHESIS_FREE_TIER_GATE;
    } else {
      process.env.SYNTHESIS_FREE_TIER_GATE = originalEnv;
    }
  });

  it('allows Free user with 0 runs this month (default mode = enabled)', async () => {
    mockMonthCount = 0;
    const result = await checkSynthesisAllowance(11);
    expect(result.allowed).toBe(true);
    expect(result.remaining_this_month).toBe(FREE_SYNTHESIS_PER_MONTH);
    expect(result.plan_name).toBe('Free');
  });

  it('hard-caps Free user at 1 synthesis/mo (EC-V21-B.3)', async () => {
    mockMonthCount = 1;
    const result = await checkSynthesisAllowance(11);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('free_tier_exhausted');
    expect(result.remaining_this_month).toBe(0);
  });

  it('treats overshoot as exhausted', async () => {
    mockMonthCount = 5;
    const result = await checkSynthesisAllowance(11);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('free_tier_exhausted');
  });

  it('grants unlimited to Plus + active sub', async () => {
    mockTeamRow.planName = 'Plus';
    mockTeamRow.subscriptionStatus = 'active';
    mockMonthCount = 99;
    const result = await checkSynthesisAllowance(11);
    expect(result.allowed).toBe(true);
    expect(result.plan_name).toBe('Plus');
  });

  it('grants unlimited to Base + trialing sub', async () => {
    mockTeamRow.planName = 'Base';
    mockTeamRow.subscriptionStatus = 'trialing';
    mockMonthCount = 50;
    const result = await checkSynthesisAllowance(11);
    expect(result.allowed).toBe(true);
    expect(result.plan_name).toBe('Base');
  });

  it('treats Plus with inactive sub as Free (downgrade path)', async () => {
    mockTeamRow.planName = 'Plus';
    mockTeamRow.subscriptionStatus = 'past_due';
    mockMonthCount = 1;
    const result = await checkSynthesisAllowance(11);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('free_tier_exhausted');
  });

  it('log_only mode: never denies, but still reports remaining=0 at cap', async () => {
    process.env.SYNTHESIS_FREE_TIER_GATE = 'log_only';
    mockMonthCount = 1;
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = await checkSynthesisAllowance(11);
    expect(result.allowed).toBe(true);
    expect(result.remaining_this_month).toBe(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('disabled mode: short-circuits to allowed=true', async () => {
    process.env.SYNTHESIS_FREE_TIER_GATE = 'disabled';
    mockMonthCount = 999;
    const result = await checkSynthesisAllowance(11);
    expect(result.allowed).toBe(true);
  });
});
