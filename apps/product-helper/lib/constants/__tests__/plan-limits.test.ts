import { describe, it, expect } from '@jest/globals';
import { PLAN_LIMITS, resolvePlanTier, isUnlimitedMembers } from '@/lib/constants';

describe('PLAN_LIMITS', () => {
  it('defines correct limits for free tier', () => {
    expect(PLAN_LIMITS.free.creditLimit).toBe(2500);
    expect(PLAN_LIMITS.free.creditGrace).toBe(2750);
    expect(PLAN_LIMITS.free.teamMemberLimit).toBe(2);
  });

  it('defines correct limits for base tier', () => {
    expect(PLAN_LIMITS.base.creditLimit).toBe(5000);
    expect(PLAN_LIMITS.base.creditGrace).toBe(5500);
    expect(PLAN_LIMITS.base.teamMemberLimit).toBe(2);
  });

  it('defines correct limits for plus tier', () => {
    expect(PLAN_LIMITS.plus.creditLimit).toBe(999999);
    expect(PLAN_LIMITS.plus.teamMemberLimit).toBe(999999);
  });
});

describe('resolvePlanTier', () => {
  it('maps "Base" to base', () => {
    expect(resolvePlanTier('Base')).toBe('base');
  });

  it('maps "Plus" to plus', () => {
    expect(resolvePlanTier('Plus')).toBe('plus');
  });

  it('maps null to free', () => {
    expect(resolvePlanTier(null)).toBe('free');
  });

  it('maps unknown string to free', () => {
    expect(resolvePlanTier('Enterprise')).toBe('free');
  });
});

describe('isUnlimitedMembers', () => {
  it('returns true for plus sentinel', () => {
    expect(isUnlimitedMembers(999999)).toBe(true);
  });

  it('returns false for 2', () => {
    expect(isUnlimitedMembers(2)).toBe(false);
  });
});
