import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('@/lib/db/queries', () => ({
  getTeamByStripeCustomerId: jest.fn(),
  updateTeamSubscription: jest.fn(),
  getUser: jest.fn(),
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    products: { retrieve: jest.fn() },
  }));
});

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

import { handleSubscriptionChange } from '../stripe';
import { getTeamByStripeCustomerId, updateTeamSubscription } from '@/lib/db/queries';
import type Stripe from 'stripe';

const mockedGetTeam = getTeamByStripeCustomerId as jest.MockedFunction<typeof getTeamByStripeCustomerId>;
const mockedUpdateTeam = updateTeamSubscription as jest.MockedFunction<typeof updateTeamSubscription>;

describe('handleSubscriptionChange', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetTeam.mockResolvedValue({ id: 1 } as any);
  });

  function makeSubscription(status: string, productName: string): Stripe.Subscription {
    return {
      id: 'sub_123',
      customer: 'cus_123',
      status,
      items: {
        data: [{
          plan: {
            product: { id: 'prod_123', name: productName } as any,
          } as any,
        }],
      } as any,
    } as any;
  }

  it('sets Base tier limits for active Base subscription', async () => {
    await handleSubscriptionChange(makeSubscription('active', 'Base'));
    expect(mockedUpdateTeam).toHaveBeenCalledWith(1, expect.objectContaining({
      creditLimit: 5000,
      teamMemberLimit: 2,
      creditsUsed: 0,
    }));
  });

  it('sets Plus tier limits for active Plus subscription', async () => {
    await handleSubscriptionChange(makeSubscription('active', 'Plus'));
    expect(mockedUpdateTeam).toHaveBeenCalledWith(1, expect.objectContaining({
      creditLimit: 999999,
      teamMemberLimit: 999999,
      creditsUsed: 0,
    }));
  });

  it('resets to free tier on cancellation', async () => {
    await handleSubscriptionChange(makeSubscription('canceled', 'Base'));
    expect(mockedUpdateTeam).toHaveBeenCalledWith(1, expect.objectContaining({
      creditLimit: 2500,
      teamMemberLimit: 2,
      creditsUsed: 0,
    }));
  });
});
