import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/lib/auth/session', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('@/lib/db/drizzle', () => ({
  db: {
    query: { teams: { findFirst: jest.fn() } },
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(),
        })),
      })),
    })),
  },
}));

import { checkAndDeductCredits } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';

const mockedFindFirst = db.query.teams.findFirst as jest.MockedFunction<any>;
const mockedUpdate = db.update as jest.MockedFunction<any>;

function mockTeam(overrides: Record<string, any>) {
  return {
    creditsUsed: 0,
    creditLimit: 2500,
    subscriptionStatus: null,
    planName: null,
    ...overrides,
  };
}

function setupUpdateReturning(rows: any[]) {
  mockedUpdate.mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue(rows),
      }),
    }),
  });
}

describe('checkAndDeductCredits', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Plus active: always allowed (bypass)', async () => {
    mockedFindFirst.mockResolvedValue(mockTeam({
      planName: 'Plus', subscriptionStatus: 'active',
      creditsUsed: 500000, creditLimit: 999999,
    }));
    setupUpdateReturning([]);
    const result = await checkAndDeductCredits(1, 100);
    expect(result.allowed).toBe(true);
  });

  it('Base active at grace limit: allowed (5499 + 1 = 5500)', async () => {
    mockedFindFirst.mockResolvedValue(mockTeam({
      planName: 'Base', subscriptionStatus: 'active',
      creditsUsed: 5499, creditLimit: 5000,
    }));
    setupUpdateReturning([{ creditsUsed: 5500, creditLimit: 5000 }]);
    const result = await checkAndDeductCredits(1, 1);
    expect(result.allowed).toBe(true);
  });

  it('Base active over grace: blocked (5499 + 2 = 5501 > 5500)', async () => {
    mockedFindFirst.mockResolvedValue(mockTeam({
      planName: 'Base', subscriptionStatus: 'active',
      creditsUsed: 5499, creditLimit: 5000,
    }));
    setupUpdateReturning([]);
    const result = await checkAndDeductCredits(1, 2);
    expect(result.allowed).toBe(false);
  });

  it('Free at grace limit: allowed (2749 + 1 = 2750)', async () => {
    mockedFindFirst.mockResolvedValue(mockTeam({
      planName: null, subscriptionStatus: null,
      creditsUsed: 2749, creditLimit: 2500,
    }));
    setupUpdateReturning([{ creditsUsed: 2750, creditLimit: 2500 }]);
    const result = await checkAndDeductCredits(1, 1);
    expect(result.allowed).toBe(true);
  });

  it('Free over grace: blocked (2749 + 2 = 2751 > 2750)', async () => {
    mockedFindFirst.mockResolvedValue(mockTeam({
      planName: null, subscriptionStatus: null,
      creditsUsed: 2749, creditLimit: 2500,
    }));
    setupUpdateReturning([]);
    const result = await checkAndDeductCredits(1, 2);
    expect(result.allowed).toBe(false);
  });

  it('returns false for nonexistent team', async () => {
    mockedFindFirst.mockResolvedValue(undefined);
    const result = await checkAndDeductCredits(999, 1);
    expect(result.allowed).toBe(false);
  });
});
