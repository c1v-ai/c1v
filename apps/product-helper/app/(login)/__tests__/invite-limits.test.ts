import { describe, it, expect } from '@jest/globals';
import { isUnlimitedMembers } from '@/lib/constants';

describe('team member limit logic', () => {
  it('unlimited check returns true for plus sentinel (999999)', () => {
    expect(isUnlimitedMembers(999999)).toBe(true);
  });

  it('unlimited check returns false for 2', () => {
    expect(isUnlimitedMembers(2)).toBe(false);
  });

  it('limit check: memberCount >= limit should block', () => {
    const memberCount = 2;
    const limit = 2;
    const blocked = !isUnlimitedMembers(limit) && memberCount >= limit;
    expect(blocked).toBe(true);
  });

  it('limit check: memberCount < limit should allow', () => {
    const memberCount = 1;
    const limit = 2;
    const blocked = !isUnlimitedMembers(limit) && memberCount >= limit;
    expect(blocked).toBe(false);
  });

  it('limit check: Plus tier (999999) with 50 members should allow', () => {
    const memberCount = 50;
    const limit = 999999;
    const blocked = !isUnlimitedMembers(limit) && memberCount >= limit;
    expect(blocked).toBe(false);
  });

  it('generates correct error message for limit=2', () => {
    const limit = 2;
    const msg = `Your plan allows up to ${limit} team member${limit === 1 ? '' : 's'}. Upgrade to add more.`;
    expect(msg).toBe('Your plan allows up to 2 team members. Upgrade to add more.');
  });
});
