import { desc, and, eq, isNull, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { resolvePlanTier, PLAN_LIMITS } from '@/lib/constants';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
    creditsUsed?: number;
    creditLimit?: number;
    teamMemberLimit?: number;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

export async function checkAndDeductCredits(
  teamId: number,
  amount: number
): Promise<{ allowed: boolean; creditsUsed: number; creditLimit: number }> {
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: { creditsUsed: true, creditLimit: true, subscriptionStatus: true, planName: true },
  });

  if (!team) return { allowed: false, creditsUsed: 0, creditLimit: 0 };

  const tier = resolvePlanTier(team.planName);

  // Plus tier with active sub: unlimited — always allow, track for analytics
  if (tier === 'plus' && (team.subscriptionStatus === 'active' || team.subscriptionStatus === 'trialing')) {
    await db.update(teams).set({
      creditsUsed: sql`${teams.creditsUsed} + ${amount}`,
      updatedAt: new Date(),
    }).where(eq(teams.id, teamId));
    return { allowed: true, creditsUsed: team.creditsUsed + amount, creditLimit: team.creditLimit };
  }

  // Free & Base: atomic check-and-deduct with 10% grace
  const grace = PLAN_LIMITS[tier].creditGrace;
  const result = await db.update(teams).set({
    creditsUsed: sql`${teams.creditsUsed} + ${amount}`,
    updatedAt: new Date(),
  }).where(
    and(
      eq(teams.id, teamId),
      sql`${teams.creditsUsed} + ${amount} <= ${grace}`
    )
  ).returning({
    creditsUsed: teams.creditsUsed,
    creditLimit: teams.creditLimit,
  });

  if (result.length === 0) {
    return { allowed: false, creditsUsed: team.creditsUsed, creditLimit: team.creditLimit };
  }

  return { allowed: true, creditsUsed: result[0].creditsUsed, creditLimit: result[0].creditLimit };
}

export async function getTeamCredits(teamId: number) {
  return db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: { creditsUsed: true, creditLimit: true, subscriptionStatus: true },
  });
}
