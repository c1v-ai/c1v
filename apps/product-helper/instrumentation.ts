/**
 * Next.js boot-time instrumentation hook.
 *
 * Runs once per Node runtime instance at process start (App Router calls
 * `register()` lazily on the first request). Used here to:
 *
 *   1. Dispatch Sentry init to the right runtime config file. The
 *      `sentry.server.config.ts` / `sentry.edge.config.ts` files run as
 *      side-effect imports based on `NEXT_RUNTIME`.
 *   2. Wire the v2.1 system-question-bridge adapter into the Wave-E
 *      `surfaceGap` producer (D-V21.23 — every Wave-E gap routes through
 *      bridge for DB persistence + cross-process resilience).
 *   3. Register the `wave_e_engine` reply handler so user replies on a
 *      bridge `pending_answer` row settle the right Deferred.
 *   4. Wire the Sentry transport for `synthesis-metrics.ts` so
 *      `synthesis_metrics_total{module,impl,llm_invoked}` events ship to
 *      Sentry. With `@sentry/nextjs` now adopted as a real dep, this
 *      transport actually emits — unblocks EC-V21-E.13's 7-day
 *      measurement window.
 *
 * Edge runtime is excluded from bridge + transport wiring — both use
 * `db` (postgres driver), which is Node-only. Edge gets Sentry init only.
 *
 * @see lib/langchain/engines/surface-gap.ts (BridgeAdapter, waveEReplyHandler)
 * @see lib/observability/synthesis-metrics.ts (setSentryTransport)
 * @see sentry.server.config.ts
 * @see sentry.edge.config.ts
 */

import * as Sentry from '@sentry/nextjs';

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
    return;
  }

  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // ─── Wave-E gap-fill bridge wiring (Node.js only) ────────────────────
  const [{ setBridgeAdapter, waveEReplyHandler }, bridge] = await Promise.all([
    import('@/lib/langchain/engines/surface-gap'),
    import('@/lib/chat/system-question-bridge'),
  ]);
  setBridgeAdapter({
    surfaceOpenQuestion: bridge.surfaceOpenQuestion,
  });
  bridge.onOpenQuestionReply('wave_e_engine', waveEReplyHandler);

  // ─── Sentry transport wiring ─────────────────────────────────────────
  const { setSentryTransport } = await import('@/lib/observability/synthesis-metrics');
  setSentryTransport({
    captureMessage: (message, ctx) => {
      Sentry.captureMessage(message, {
        level: ctx.level,
        tags: ctx.tags,
        extra: ctx.extra,
      });
    },
    captureException: (err, ctx) => {
      Sentry.captureException(err, {
        tags: ctx.tags,
        extra: ctx.extra,
      });
    },
  });
}

export const onRequestError = Sentry.captureRequestError;
