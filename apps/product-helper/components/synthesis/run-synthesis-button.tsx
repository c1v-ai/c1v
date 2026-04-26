/**
 * RunSynthesisButton — the SINGLE canonical UI trigger that fires
 * `POST /api/projects/[id]/synthesize` (P7 fix).
 *
 * Renders `<form action={runSynthesisAction}>` with a hidden `projectId`
 * input. Pending state via `useFormStatus()` so double-clicks are blocked
 * during submit (the route also has 5-min idempotency, so a double-click
 * that slips through still produces a single synthesis run).
 *
 * Result handling via `useActionState` (React 19):
 *   - On 202 (success): redirects via `router.replace()` to
 *     `/projects/[id]/synthesis?just_started=1` so the page flips to
 *     pending-state UI and starts polling. Idempotent replays use the
 *     same redirect.
 *   - On 402 (quota): renders an inline upgrade CTA (link to upgrade_url).
 *     Per spec, DO NOT redirect — surface inline.
 *   - On other errors: renders a small inline error string.
 *
 * Deliberate scope:
 *   - This component lives ONLY at the top of the synthesis-page empty
 *     state. Sub-page CTAs in `EmptySectionState` STAY `<Link>`. Adding
 *     a duplicate trigger surface elsewhere will fail the verifier grep.
 */

'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Loader2, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  runSynthesisAction,
  type RunSynthesisResult,
} from '@/app/(dashboard)/projects/[id]/synthesis/actions';

interface RunSynthesisButtonProps {
  projectId: number;
  /** Override label. Defaults to "Run Deep Synthesis". */
  label?: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2
            className="mr-2 h-4 w-4 animate-spin"
            aria-hidden="true"
          />
          Starting synthesis...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          {label}
        </>
      )}
    </Button>
  );
}

// Bridges the server-action signature (FormData → result) onto
// useActionState's reducer signature (prev, FormData → result).
async function reducer(
  _prev: RunSynthesisResult | null,
  formData: FormData,
): Promise<RunSynthesisResult | null> {
  return runSynthesisAction(formData);
}

export function RunSynthesisButton({
  projectId,
  label = 'Run Deep Synthesis',
}: RunSynthesisButtonProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<RunSynthesisResult | null, FormData>(
    reducer,
    null,
  );

  // On success, flip the page into pending-mode (`?just_started=1`) so the
  // synthesis page starts polling for ready/failed transitions.
  useEffect(() => {
    if (state && state.ok) {
      router.replace(
        `/projects/${projectId}/synthesis?just_started=1`,
      );
      router.refresh();
    }
  }, [state, projectId, router]);

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <input type="hidden" name="projectId" value={String(projectId)} />
        <SubmitButton label={label} />
      </form>

      {state && !state.ok && state.error === 'quota' && (
        <div
          role="alert"
          className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <p className="font-medium">
            Synthesis quota reached
            {state.plan_name ? ` on the ${state.plan_name} plan` : ''}.
          </p>
          {state.remaining_this_month != null && (
            <p className="mt-1 text-xs">
              Remaining this month: {state.remaining_this_month}.
            </p>
          )}
          <Link
            href={state.upgrade_url}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline"
          >
            Upgrade plan
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {state && !state.ok && state.error === 'generic' && (
        <p
          role="alert"
          className="text-sm text-destructive"
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
