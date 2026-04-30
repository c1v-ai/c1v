'use client';

/**
 * DownloadDropdown — surfaces signed-URL downloads for synthesis artifacts.
 *
 * Reads the manifest contract v1 (`plans/v21-outputs/ta3/manifest-contract.md`).
 * Each `dbArtifacts[]` entry renders one menu item:
 *   - `status === 'ready'` AND non-null `signed_url` → `<a href={signed_url} download>`
 *   - `status === 'pending'` → disabled item with "Generating…" hint
 *   - `status === 'failed'` → retry stub-toast (TB1 wires the live retry)
 *
 * Per the agent spec, the v2.1-Wave-A retry CTA ships enabled with a
 * stub-toast; TB1 replaces the stub action with a real POST to the retry
 * endpoint.
 */

import { useState } from 'react';
import { Download, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface DownloadDropdownArtifact {
  kind: string;
  status: 'pending' | 'ready' | 'failed';
  format: string | null;
  signed_url: string | null;
  sha256: string | null;
  synthesized_at: string | null;
}

interface DownloadDropdownProps {
  artifacts: DownloadDropdownArtifact[];
  manifestContractVersion?: string | null;
  /** projectId enables the future retry endpoint (TB1). */
  projectId: number;
}

const KIND_LABELS: Record<string, string> = {
  recommendation_json: 'JSON',
  recommendation_html: 'HTML',
  recommendation_pdf: 'PDF',
  recommendation_pptx: 'PPTX',
  fmea_early_xlsx: 'FMEA early (xlsx)',
  fmea_residual_xlsx: 'FMEA residual (xlsx)',
  hoq_xlsx: 'HoQ (xlsx)',
  bundle_zip: 'Bundle ZIP',
  // Wave-E UI export gap (2026-04-29) — sidecar-rendered Python outputs.
  n2_matrix_xlsx: 'N² Matrix (xlsx)',
  decision_network_xlsx: 'Decision Network (xlsx)',
  decision_network_svg: 'Decision Network (svg)',
  form_function_map_xlsx: 'Form-Function Map (xlsx)',
  form_function_map_svg: 'Form-Function Map (svg)',
  form_function_map_mmd: 'Form-Function Map (mmd)',
};

function labelFor(kind: string): string {
  return KIND_LABELS[kind] ?? kind;
}

export function DownloadDropdown({
  artifacts,
  manifestContractVersion,
  projectId,
}: DownloadDropdownProps) {
  const [pendingRetryKind, setPendingRetryKind] = useState<string | null>(null);

  // Per manifest contract §2: pin to v1; refuse to render on v2+ shape break.
  if (manifestContractVersion && manifestContractVersion.startsWith('v2')) {
    return (
      <Button variant="outline" disabled>
        <AlertCircle className="mr-2 h-4 w-4" aria-hidden="true" />
        Manifest contract incompatible
      </Button>
    );
  }

  const hasArtifacts = artifacts.length > 0;

  async function handleRetry(kind: string) {
    setPendingRetryKind(kind);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${encodeURIComponent(kind)}/retry`,
        { method: 'POST' },
      );
      if (res.status === 202) {
        toast.success(`Retry queued for ${labelFor(kind)}.`);
      } else {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(
          body.error
            ? `Retry failed: ${body.error}`
            : `Retry failed (status ${res.status}).`,
        );
      }
    } catch (err) {
      toast.error(
        `Retry failed: ${err instanceof Error ? err.message : 'network error'}`,
      );
    } finally {
      setPendingRetryKind(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={!hasArtifacts}>
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Downloads
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Synthesis artifacts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!hasArtifacts ? (
          <DropdownMenuItem disabled>No artifacts yet</DropdownMenuItem>
        ) : (
          artifacts.map((artifact) => {
            const label = labelFor(artifact.kind);

            if (artifact.status === 'ready' && artifact.signed_url) {
              return (
                <DropdownMenuItem key={artifact.kind} asChild>
                  <a
                    href={artifact.signed_url}
                    download
                    rel="noopener noreferrer"
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span>{label}</span>
                      {artifact.format && (
                        <span className="text-xs uppercase text-muted-foreground">
                          {artifact.format}
                        </span>
                      )}
                    </span>
                  </a>
                </DropdownMenuItem>
              );
            }

            if (artifact.status === 'pending') {
              return (
                <DropdownMenuItem key={artifact.kind} disabled>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  {label} — generating
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuItem
                key={artifact.kind}
                disabled={pendingRetryKind === artifact.kind}
                onSelect={(event) => {
                  event.preventDefault();
                  handleRetry(artifact.kind);
                }}
              >
                <AlertCircle
                  className="mr-2 h-4 w-4 text-destructive"
                  aria-hidden="true"
                />
                {label} — retry
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
