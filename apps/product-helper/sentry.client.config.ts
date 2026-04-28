/**
 * Sentry — browser / client runtime init.
 *
 * Wave-E EC-V21-E.13 adoption: Error Monitoring + Tracing + Session
 * Replay. Replay defaults are non-masking per spawn-prompt (user-facing
 * SaaS app where readability of session traces aids debugging); revisit
 * if PII shows up in masked-content audits.
 *
 * Loaded by Next.js automatically for the client bundle. Server +
 * edge inits live in `sentry.server.config.ts` and `sentry.edge.config.ts`
 * respectively, dispatched from `instrumentation.ts`.
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: true,

  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
