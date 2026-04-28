'use client';

import * as Sentry from '@sentry/nextjs';

export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Sentry Example Page</h1>
      <p>
        Click the button to trigger a client-side test error. The click also
        calls <code>/api/sentry-example-api</code> which throws a server-side
        error inside the same Sentry span — both should appear in your Sentry
        Issues dashboard within ~30 seconds.
      </p>
      <button
        type="button"
        onClick={async () => {
          await Sentry.startSpan(
            { name: 'Example Frontend Span', op: 'test' },
            async () => {
              const res = await fetch('/api/sentry-example-api');
              if (!res.ok) {
                throw new Error('Sentry Example Frontend Error');
              }
            },
          );
        }}
      >
        Throw client + server test error
      </button>
    </main>
  );
}
