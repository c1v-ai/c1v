/**
 * Next.js boot-time instrumentation hook.
 *
 * Runs once per Node runtime instance at process start (App Router calls
 * `register()` lazily on the first request). Used here to:
 *
 *   1. Wire the v2.1 system-question-bridge adapter into the Wave-E
 *      `surfaceGap` producer (D-V21.23 — every Wave-E gap routes through
 *      bridge for DB persistence + cross-process resilience).
 *   2. Register the `wave_e_engine` reply handler so user replies on a
 *      bridge `pending_answer` row settle the right Deferred.
 *   3. Wire the Sentry transport for `synthesis-metrics.ts` so
 *      `synthesis_metrics_total{module,impl,llm_invoked}` events ship to
 *      Sentry. If `@sentry/nextjs` is not installed (per spawn-prompt
 *      guardrail), instrumentation falls back to the no-op transport
 *      and counters remain in-process only — production-grade transport
 *      wiring is coordinator-owned (requires SDK adoption decision).
 *
 * Edge runtime is excluded — gap registration + bridge insert both use
 * `db` (postgres driver), which is Node-only.
 *
 * @see lib/langchain/engines/surface-gap.ts (BridgeAdapter, waveEReplyHandler)
 * @see lib/observability/synthesis-metrics.ts (setSentryTransport)
 */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // ─── Wave-E gap-fill bridge wiring ───────────────────────────────────
  const [{ setBridgeAdapter, waveEReplyHandler }, bridge] = await Promise.all([
    import('@/lib/langchain/engines/surface-gap'),
    import('@/lib/chat/system-question-bridge'),
  ]);
  setBridgeAdapter({
    surfaceOpenQuestion: bridge.surfaceOpenQuestion,
  });
  bridge.onOpenQuestionReply('wave_e_engine', waveEReplyHandler);

  // ─── Sentry transport wiring ─────────────────────────────────────────
  // GUARDRAIL: If @sentry/nextjs is not in deps, do NOT silently add it.
  // The no-op fallback keeps counters in-process; coordinator-owned
  // decision to adopt the SDK is documented in prod-swap-completion.md.
  const sentryNextjs = await tryImportSentry();
  if (sentryNextjs) {
    const { setSentryTransport } = await import('@/lib/observability/synthesis-metrics');
    setSentryTransport({
      captureMessage: (message, ctx) => {
        sentryNextjs.captureMessage(message, {
          level: ctx.level,
          tags: ctx.tags,
          extra: ctx.extra,
        });
      },
      captureException: (err, ctx) => {
        sentryNextjs.captureException(err, {
          tags: ctx.tags,
          extra: ctx.extra,
        });
      },
    });
  }
  // else: in-process counters only — no Sentry export. Acceptable for
  // staging-green; production observability requires SDK adoption.
}

interface SentryNextjsLike {
  captureMessage: (
    message: string,
    options: {
      level: 'info' | 'error';
      tags: Record<string, string>;
      extra: Record<string, unknown>;
    },
  ) => void;
  captureException: (
    err: unknown,
    options: { tags: Record<string, string>; extra: Record<string, unknown> },
  ) => void;
}

async function tryImportSentry(): Promise<SentryNextjsLike | null> {
  try {
    // @ts-expect-error — optional peer; resolves only if installed.
    const mod = await import('@sentry/nextjs');
    return mod as unknown as SentryNextjsLike;
  } catch {
    return null;
  }
}
