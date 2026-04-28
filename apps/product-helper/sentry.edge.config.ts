/**
 * Sentry — Edge runtime init.
 *
 * Wave-E EC-V21-E.13 adoption: Error Monitoring + Tracing only.
 * Session Replay + AI Monitoring don't run on edge — Replay is
 * client-only and Vercel AI SDK calls happen in the Node.js
 * runtime.
 *
 * Loaded by `instrumentation.ts` when `NEXT_RUNTIME === "edge"`.
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  sendDefaultPii: true,

  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  enableLogs: true,
});
