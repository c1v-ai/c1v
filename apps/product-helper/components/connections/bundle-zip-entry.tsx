'use client';

/**
 * Bundle ZIP entry for the Connections page — D-V21.11 "Show your work"
 * pillar. Triggers a streamed download from
 * GET /api/projects/[id]/export/bundle.
 *
 * Per-section dropdown (download a specific module subset) is deferred
 * to TB1 / v2.2 per the spec guardrail.
 */

import { useState } from 'react';
import { Download, Loader2, Check, FolderArchive } from 'lucide-react';

interface BundleZipEntryProps {
  projectId: number;
  projectName: string;
}

// TODO(TB1): per-section dropdown — surface a menu with module subsets
// (M3 / M4 / M6 / M7 / M8 / synthesis-only). v2.1 Wave A ships single
// "all artifacts" download only.

export function BundleZipEntry({ projectId, projectName }: BundleZipEntryProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setDownloading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/export/bundle`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('No artifacts yet — run Deep Synthesis first, then re-try the bundle download.');
        } else {
          setError(`Bundle download failed (${response.status}).`);
        }
        return;
      }
      const blob = await response.blob();
      const safeName = projectName.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName || 'project'}-bundle.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloaded(true);
    } catch {
      setError('Network error — check your connection and try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={downloading}
        className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 disabled:opacity-50 ${
          downloaded ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' : ''
        }`}
        aria-label="Download project bundle ZIP"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : downloaded ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <FolderArchive className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span>Show your work — full bundle</span>
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Streamed ZIP of every synthesised artifact. Mirrors the{' '}
            <span className="font-mono">module-N/</span> layout.
          </p>
        </div>
      </button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
