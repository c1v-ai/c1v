/**
 * Server actions for the synthesis page (P7 — UI synthesize-trigger).
 *
 * Closes the v2.1 production gap where every `[Run Deep Synthesis →]` CTA
 * was a `<Link>` navigation that looped the user back to another empty
 * state — the backend `POST /api/projects/[id]/synthesize` route was never
 * actually called from a real user flow.
 *
 * `runSynthesisAction` is the SINGLE canonical trigger. It is wired into
 * the synthesis-page empty state via `<form action={runSynthesisAction}>`
 * (see `components/synthesis/run-synthesis-button.tsx`). Sub-page CTAs
 * (FMEA / Decision Network / etc., rendered by `EmptySectionState`) STAY
 * `<Link>` — they navigate the user IN to the synthesis page where this
 * action lives. Any future contributor MUST NOT add a duplicate trigger
 * surface; the `qa-th1-verifier` greps for it.
 *
 * Internal-fetch contract: the action POSTs to `/api/projects/[id]/synthesize`
 * with the request's cookies forwarded so the route's `withProjectAuth`
 * middleware authenticates the SAME user. The route owns:
 *   - Credit deduction (D-V21.10, 1000 credits)
 *   - Idempotency (5-min window per project)
 *   - Free-tier allowance gate (TB1 EC-V21-B.3)
 *   - LangGraph kickoff via Next.js `after()`
 *
 * Bypassing this seam to call `kickoffSynthesisGraph` directly would lose
 * credit accounting + idempotency. DO NOT.
 *
 * @module app/(dashboard)/projects/[id]/synthesis/actions
 */

'use server';

import { headers, cookies } from 'next/headers';

export type RunSynthesisSuccess = {
  ok: true;
  synthesis_id: string;
  status_url: string;
  expected_artifacts: string[];
  idempotent_replay?: boolean;
};

export type RunSynthesisQuotaError = {
  ok: false;
  error: 'quota';
  reason: string | null;
  upgrade_url: string;
  plan_name: string | null;
  remaining_this_month: number | null;
};

export type RunSynthesisGenericError = {
  ok: false;
  error: 'generic';
  status: number;
  message: string;
};

export type RunSynthesisResult =
  | RunSynthesisSuccess
  | RunSynthesisQuotaError
  | RunSynthesisGenericError;

/** Build an absolute URL for the internal route POST. */
async function buildSynthesizeUrl(projectId: number): Promise<string> {
  const path = `/api/projects/${projectId}/synthesize`;
  // Prefer the runtime host header (handles preview deployments, custom
  // domains, localhost) over a hard-coded BASE_URL. Falls back to BASE_URL
  // for environments where headers() is unavailable.
  try {
    const h = await headers();
    const host = h.get('host');
    const proto =
      h.get('x-forwarded-proto') ??
      (host && host.startsWith('localhost') ? 'http' : 'https');
    if (host) return `${proto}://${host}${path}`;
  } catch {
    // headers() called outside a request context — fall through.
  }
  const base = process.env.BASE_URL ?? 'http://localhost:3000';
  return `${base}${path}`;
}

/**
 * Server action invoked from the synthesis-page form. Reads `projectId`
 * from form data, forwards the user's session cookies, and POSTs to the
 * existing `/api/projects/[id]/synthesize` route.
 *
 * Return shapes (consumed by `RunSynthesisButton`):
 *   - 202 → `{ ok: true, synthesis_id, status_url, expected_artifacts }`
 *   - 402 (allowance OR insufficient credits) → quota-error shape with
 *     `upgrade_url` so the form can render an inline upgrade CTA
 *   - 4xx/5xx other → generic error shape with the message body
 */
export async function runSynthesisAction(
  formData: FormData,
): Promise<RunSynthesisResult> {
  const raw = formData.get('projectId');
  const projectIdStr = typeof raw === 'string' ? raw : '';
  const projectId = Number.parseInt(projectIdStr, 10);
  if (Number.isNaN(projectId) || projectId <= 0) {
    return {
      ok: false,
      error: 'generic',
      status: 400,
      message: 'Missing or invalid projectId.',
    };
  }

  const url = await buildSynthesizeUrl(projectId);
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward session cookies so withProjectAuth sees the same user.
        Cookie: cookieHeader,
      },
      body: '{}',
      cache: 'no-store',
    });
  } catch (err) {
    return {
      ok: false,
      error: 'generic',
      status: 0,
      message:
        err instanceof Error
          ? `Synthesis request failed: ${err.message}`
          : 'Synthesis request failed.',
    };
  }

  type RouteOk = {
    synthesis_id: string;
    expected_artifacts: string[];
    status_url: string;
    idempotent_replay?: boolean;
  };
  type RouteQuota = {
    error: string;
    reason?: string | null;
    upgrade_url?: string;
    plan_name?: string | null;
    remaining_this_month?: number | null;
  };

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.status === 202 && body && typeof body === 'object') {
    const ok = body as RouteOk;
    return {
      ok: true,
      synthesis_id: ok.synthesis_id,
      status_url: ok.status_url,
      expected_artifacts: ok.expected_artifacts ?? [],
      idempotent_replay: Boolean(ok.idempotent_replay),
    };
  }

  if (res.status === 402 && body && typeof body === 'object') {
    const quota = body as RouteQuota;
    return {
      ok: false,
      error: 'quota',
      reason: quota.reason ?? null,
      upgrade_url: quota.upgrade_url ?? '/pricing',
      plan_name: quota.plan_name ?? null,
      remaining_this_month: quota.remaining_this_month ?? null,
    };
  }

  const message =
    body && typeof body === 'object' && 'error' in body
      ? String((body as { error?: unknown }).error ?? 'Synthesis request failed.')
      : `Synthesis request failed (HTTP ${res.status}).`;
  return {
    ok: false,
    error: 'generic',
    status: res.status,
    message,
  };
}
