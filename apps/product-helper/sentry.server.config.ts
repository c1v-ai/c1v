/**
 * Sentry — Node.js server runtime init.
 *
 * Wave-E EC-V21-E.13 adoption: Error Monitoring + Tracing + AI
 * Monitoring (Vercel AI SDK detected at `ai@3.4.33`).
 *
 * Loaded by `instrumentation.ts` when `NEXT_RUNTIME === "nodejs"`.
 * The `vercelAIIntegration` instruments the `ai` package's
 * `generateText`/`streamText` etc. so LLM calls appear as spans
 * with token + cost metadata in the trace view.
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  sendDefaultPii: true,

  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  includeLocalVariables: true,

  enableLogs: true,

  integrations: [Sentry.vercelAIIntegration()],
});
