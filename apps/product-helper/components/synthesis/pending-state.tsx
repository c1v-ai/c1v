/**
 * SynthesisPendingState — client-side polling surface shown after the
 * `runSynthesisAction` POST fires (P7 — UI synthesize-trigger).
 *
 * Renders when:
 *   (a) the synthesis page receives `?just_started=1` query param, OR
 *   (b) any project_artifacts row has `synthesis_status === 'pending'`
 *       (passed in via `initiallyPending`).
 *
 * Behavior:
 *   - Polls `GET /api/projects/[id]/synthesize/status` every 3s.
 *   - Renders a small status table (one row per expected artifact kind).
 *   - Stops polling when `overall_status` ∈ {ready, failed, partial}.
 *   - On `ready`: triggers `router.refresh()` so the server component
 *     re-fetches and renders the RecommendationViewer.
 *   - On `failed` (per-row): TB1 already shipped per-artifact retry CTAs
 *     in `download-dropdown.tsx` — when overall_status is terminal and
 *     non-ready, we surface a "Synthesis incomplete" banner + a refresh
 *     CTA so the user lands on the page in its real state.
 *
 * Circuit-breaker (EC-V21-B.4): TB1 ships a 30s per-artifact circuit
 * breaker server-side; this component does NOT spinner forever. If the
 * status route reports a row as `failed`, we render that immediately.
 *
 * Latency target: < 100ms p95 on the status route per CLAUDE.md, so a
 * 3-second poll cadence is conservative for tail-latency budget.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ArtifactStatusEntry {
  kind: string;
  status: 'pending' | 'ready' | 'failed';
  format: string | null;
  signed_url: string | null;
  sha256: string | null;
  synthesized_at: string | null;
  failure_reason: string | null;
}

interface StatusResponse {
  project_id: number;
  overall_status: 'pending' | 'ready' | 'failed' | 'partial';
  artifacts: ArtifactStatusEntry[];
}

interface SynthesisPendingStateProps {
  projectId: number;
  /** Optional initial set of artifacts the server component already fetched. */
  initialArtifacts?: ArtifactStatusEntry[];
  /** Polling cadence in ms. Defaults to 3000 (3s) per spec. */
  pollIntervalMs?: number;
}

const TERMINAL_STATES = new Set(['ready', 'failed', 'partial']);

function StatusIcon({ status }: { status: ArtifactStatusEntry['status'] }) {
  switch (status) {
    case 'ready':
      return (
        <CheckCircle2
          className="h-4 w-4 text-emerald-600 dark:text-emerald-500"
          aria-label="Ready"
        />
      );
    case 'failed':
      return (
        <XCircle
          className="h-4 w-4 text-destructive"
          aria-label="Failed"
        />
      );
    case 'pending':
    default:
      return (
        <Clock
          className="h-4 w-4 text-muted-foreground animate-pulse"
          aria-label="Pending"
        />
      );
  }
}

function formatKind(kind: string): string {
  return kind
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SynthesisPendingState({
  projectId,
  initialArtifacts,
  pollIntervalMs = 3000,
}: SynthesisPendingStateProps) {
  const router = useRouter();
  const [artifacts, setArtifacts] = useState<ArtifactStatusEntry[]>(
    initialArtifacts ?? [],
  );
  const [overall, setOverall] = useState<StatusResponse['overall_status']>(
    'pending',
  );
  const [error, setError] = useState<string | null>(null);
  const stopped = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled || stopped.current) return;
      try {
        const res = await fetch(
          `/api/projects/${projectId}/synthesize/status`,
          { cache: 'no-store' },
        );
        if (!res.ok) {
          throw new Error(`Status request failed: HTTP ${res.status}`);
        }
        const body = (await res.json()) as StatusResponse;
        if (cancelled) return;

        setArtifacts(body.artifacts);
        setOverall(body.overall_status);
        setError(null);

        if (TERMINAL_STATES.has(body.overall_status)) {
          stopped.current = true;
          // When ready, refresh the route so the page re-fetches and the
          // server component flips to RecommendationViewer.
          if (body.overall_status === 'ready') {
            router.refresh();
          }
          return;
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Status poll failed.',
        );
      }
      timer = setTimeout(tick, pollIntervalMs);
    };

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [projectId, pollIntervalMs, router]);

  const isTerminalNonReady = overall === 'failed' || overall === 'partial';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Synthesis</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Synthesis in progress — checking every {Math.round(pollIntervalMs / 1000)}s...
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          {overall === 'ready' ? (
            <CheckCircle2
              className="h-5 w-5 text-emerald-600 dark:text-emerald-500"
              aria-hidden="true"
            />
          ) : isTerminalNonReady ? (
            <XCircle
              className="h-5 w-5 text-destructive"
              aria-hidden="true"
            />
          ) : (
            <Loader2
              className="h-5 w-5 animate-spin text-primary"
              aria-hidden="true"
            />
          )}
          <span className="text-sm font-medium">
            {overall === 'ready'
              ? 'Synthesis complete — refreshing...'
              : overall === 'failed'
                ? 'Synthesis failed.'
                : overall === 'partial'
                  ? 'Synthesis incomplete — some artifacts failed.'
                  : 'Generating artifacts...'}
          </span>
        </div>

        {artifacts.length > 0 ? (
          <ul
            role="list"
            className="divide-y divide-border text-sm"
            data-testid="pending-artifact-list"
          >
            {artifacts.map((a) => (
              <li
                key={a.kind}
                className="flex items-center justify-between py-2"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <StatusIcon status={a.status} />
                  <span>{formatKind(a.kind)}</span>
                </span>
                <span
                  className={`text-xs uppercase tracking-wide ${
                    a.status === 'ready'
                      ? 'text-emerald-600 dark:text-emerald-500'
                      : a.status === 'failed'
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                  }`}
                >
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            Waiting for the first artifact row to appear...
          </p>
        )}

        {error && (
          <p className="mt-3 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}

        {isTerminalNonReady && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              Refresh page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
