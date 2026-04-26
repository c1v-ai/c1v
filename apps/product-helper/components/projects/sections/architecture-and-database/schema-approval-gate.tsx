'use client';

/**
 * SchemaApprovalGate — Approve CTA + DBML download.
 *
 * Approval persists to `extractedData.schema.{approvedAt, approvedBy,
 * approvedSha}` via `approveSchema` server action. Re-extraction (a new
 * schema SHA) silently invalidates the prior approval — the parent computes
 * the digest fresh on every render and passes it as `currentSha`.
 */

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { approveSchema } from '@/app/actions/schema-approval';
import type { SchemaApprovalState } from './types';

interface Props {
  projectId: number;
  currentSha: string;
  approval: SchemaApprovalState | null;
  dbml: string;
  warnings: string[];
}

function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function SchemaApprovalGate({ projectId, currentSha, approval, dbml, warnings }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<SchemaApprovalState | null>(null);

  const effective = optimistic ?? approval;
  const approvedForCurrent =
    !!effective?.approvedAt && effective.approvedSha === currentSha;
  const staleApproval =
    !!effective?.approvedAt && !!currentSha && effective.approvedSha !== currentSha;

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveSchema(projectId, currentSha);
      if (result.ok) {
        setOptimistic({
          approvedAt: result.approvedAt,
          approvedSha: currentSha,
        });
        toast.success('Schema approved');
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([dbml], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `schema.dbml`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Schema exported as DBML');
    } catch {
      toast.error('Failed to export DBML');
    }
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Schema approval</h4>
            <p className="text-xs text-muted-foreground">
              Lock the database schema before downstream code generation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!dbml}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download DBML
          </Button>
          {approvedForCurrent ? (
            <Button variant="secondary" size="sm" disabled>
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Approved
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isPending || !currentSha}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {isPending ? 'Approving…' : staleApproval ? 'Re-approve' : 'Approve schema'}
            </Button>
          )}
        </div>
      </div>

      {approvedForCurrent && (
        <p className="text-xs text-muted-foreground">
          Approved {formatTimestamp(effective?.approvedAt)}.
        </p>
      )}
      {staleApproval && (
        <p className="text-xs text-yellow-700 dark:text-yellow-400">
          Schema changed since last approval ({formatTimestamp(effective?.approvedAt)}). Re-approval required.
        </p>
      )}

      {warnings.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            DBML transpile warnings ({warnings.length})
          </summary>
          <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
