/**
 * POST /api/signup-signals/[userId]
 *
 * Fire-and-forget background-enrichment trigger. Invoked by the Clerk
 * signup webhook (or the in-app signup action) with the user's numeric
 * id as a path param. Looks up the user's email, runs the
 * signup-signals-agent, and upserts the result into `user_signals`.
 *
 * Contract (per T7 spec guardrails):
 *   - Non-blocking: on any failure (lookup / scrape / db), the route
 *     still returns 200 OK so signup never blocks on enrichment.
 *   - Consumer-email → status=skipped, no outbound HTTP.
 *   - Rate-limit: 1 req/5s per domain (enforced by the agent).
 *   - RLS: the route runs under service role, bypassing tenant policy.
 *
 * @module app/api/signup-signals/[userId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { userSignals } from '@/lib/db/schema/user-signals';
import { eq } from 'drizzle-orm';

import {
  scrapeSignupSignals,
  type SignalsScrapeStatus,
} from '@/lib/langchain/agents/system-design/signup-signals-agent';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function POST(
  _req: NextRequest,
  ctx: RouteContext,
): Promise<NextResponse> {
  const { userId: userIdParam } = await ctx.params;
  const userId = Number.parseInt(userIdParam, 10);

  if (!Number.isFinite(userId) || userId <= 0) {
    // Return 200 anyway (non-blocking contract) but tag the outcome.
    return NextResponse.json(
      { status: 'failed', error: 'Invalid userId' },
      { status: 200 },
    );
  }

  try {
    // Service role for the RLS policies on user_signals.
    await db.execute(sql`SELECT set_config('app.current_role', 'service', true)`);

    const userRow = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userRow.length === 0) {
      return NextResponse.json(
        { status: 'failed', error: 'User not found' },
        { status: 200 },
      );
    }

    const { email } = userRow[0];

    // Insert a `pending` row up-front so downstream readers know we're on it.
    await db
      .insert(userSignals)
      .values({
        userId,
        scrapeStatus: 'pending',
      })
      .onConflictDoNothing({ target: userSignals.userId });

    const result = await scrapeSignupSignals({
      user_id: userId,
      email,
    });

    const mappedStatus = mapAgentStatusToRowStatus(result.status);

    await db
      .update(userSignals)
      .set({
        domain: result.domain ?? null,
        companyName: result.signals?.company_name ?? null,
        industry: result.signals?.industry ?? null,
        employeeCountBand: result.signals?.employee_count_band ?? null,
        fundingStage: result.signals?.funding_stage ?? null,
        websiteTechStack: result.signals?.website_tech_stack ?? [],
        complianceBadges: result.signals?.compliance_badges ?? [],
        scrapeStatus: mappedStatus,
        scrapeError: result.error ?? null,
        scrapeConfidence:
          result.confidence !== undefined ? String(result.confidence) : null,
        scrapedAt: new Date(result.scraped_at),
        updatedAt: new Date(),
      })
      .where(eq(userSignals.userId, userId));

    return NextResponse.json({
      status: result.status,
      user_id: userId,
      domain: result.domain,
      confidence: result.confidence,
      scraped_at: result.scraped_at,
    });
  } catch (err) {
    // Never block signup — always 200.
    return NextResponse.json(
      {
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 200 },
    );
  }
}

function mapAgentStatusToRowStatus(
  s: SignalsScrapeStatus,
): 'pending' | 'success' | 'failed' | 'skipped' {
  switch (s) {
    case 'success':
      return 'success';
    case 'skipped':
      return 'skipped';
    case 'rate-limited':
    case 'pending':
      return 'pending';
    case 'failed':
    default:
      return 'failed';
  }
}
