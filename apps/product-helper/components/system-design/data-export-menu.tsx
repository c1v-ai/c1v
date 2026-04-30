'use client';

/**
 * DataExportMenu — fallback export surface for legacy/intake-stage data
 * (project.projectData.intakeState.extractedData.*). Used on pages whose
 * canonical artifact lives in `project_artifacts` but where the user is
 * still pre-synthesis.
 *
 * Source-of-truth contract: when a sidecar-rendered artifact exists for the
 * page's data, prefer the sidecar artifact (via `<DownloadDropdown />`) and
 * either hide this menu or label its outputs as "intake fallback".
 *
 * Targets: JSON (always), CSV (when `rows` provided), PPTX (table-only,
 * via existing pptxgenjs dynamic import + `next.config.ts` `IgnorePlugin`
 * for `node:` protocol).
 *
 * Deliberately NO xlsx dependency: real Excel rendering is owned by the
 * Python sidecar (`scripts/artifact-generators/gen-*.py`).
 */

import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
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

interface DataExportMenuProps {
  /** Raw object — always JSON-exportable. */
  data: unknown;
  /** Base filename without extension. */
  filename: string;
  /** Optional flat rows for CSV / PPTX-table export. */
  rows?: Array<Record<string, unknown>>;
  /** Optional title to embed in PPTX slide. */
  title?: string;
  /** Optional explanatory line in the menu (e.g. "Inferred from intake data"). */
  hint?: string;
  /** Optional button label override (default "Export"). */
  label?: string;
  /** Optional button variant. */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Optional size. */
  size?: 'sm' | 'default' | 'lg';
  /** Disable the trigger entirely (e.g., no data). */
  disabled?: boolean;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str =
    typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return '';
  const headers = Array.from(
    rows.reduce((acc, row) => {
      Object.keys(row).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>()),
  );
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(',')),
  ];
  return lines.join('\n');
}

export function DataExportMenu({
  data,
  filename,
  rows,
  title,
  hint,
  label = 'Export',
  variant = 'outline',
  size = 'sm',
  disabled = false,
}: DataExportMenuProps) {
  const [busy, setBusy] = useState(false);
  const hasRows = !!(rows && rows.length > 0);

  const handleJson = () => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      downloadBlob(blob, `${filename}.json`);
      toast.success('Exported as JSON');
    } catch {
      toast.error('JSON export failed');
    }
  };

  const handleCsv = () => {
    if (!hasRows) {
      toast.error('No tabular data to export');
      return;
    }
    try {
      const csv = rowsToCsv(rows!);
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadBlob(blob, `${filename}.csv`);
      toast.success('Exported as CSV');
    } catch {
      toast.error('CSV export failed');
    }
  };

  const handlePptx = async () => {
    setBusy(true);
    try {
      const pptxModule = await import('pptxgenjs');
      const PptxGenJS = (pptxModule as { default: new () => unknown }).default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pptx = new PptxGenJS() as any;
      const slide = pptx.addSlide();
      if (title) {
        slide.addText(title, { x: 0.5, y: 0.2, fontSize: 18, bold: true });
      }
      if (hasRows) {
        const headers = Array.from(
          rows!.reduce((acc, row) => {
            Object.keys(row).forEach((k) => acc.add(k));
            return acc;
          }, new Set<string>()),
        );
        const tableRows = [
          headers.map((h) => ({
            text: h,
            options: { bold: true, fill: 'EEEEEE' },
          })),
          ...rows!.map((row) =>
            headers.map((h) => ({
              text:
                row[h] === null || row[h] === undefined
                  ? ''
                  : typeof row[h] === 'object'
                    ? JSON.stringify(row[h])
                    : String(row[h]),
            })),
          ),
        ];
        slide.addTable(tableRows, {
          x: 0.5,
          y: title ? 0.8 : 0.5,
          w: 9,
          fontSize: 9,
          border: { type: 'solid', pt: 0.5, color: 'CCCCCC' },
        });
      } else {
        slide.addText(JSON.stringify(data, null, 2), {
          x: 0.5,
          y: title ? 0.8 : 0.5,
          w: 9,
          h: 6,
          fontSize: 9,
          fontFace: 'Courier New',
        });
      }
      await pptx.writeFile({ fileName: `${filename}.pptx` });
      toast.success('Exported as PPTX');
    } catch (err) {
      console.error('PPTX export error:', err);
      toast.error('PPTX export failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={busy || disabled}>
          <Download className="h-4 w-4 mr-1" />
          {label}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hint ? (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {hint}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem onSelect={handleJson}>
          <span className="flex w-full items-center justify-between">
            <span>JSON</span>
            <span className="text-xs text-muted-foreground">.json</span>
          </span>
        </DropdownMenuItem>
        {hasRows && (
          <DropdownMenuItem onSelect={handleCsv}>
            <span className="flex w-full items-center justify-between">
              <span>CSV</span>
              <span className="text-xs text-muted-foreground">.csv</span>
            </span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={handlePptx}>
          <span className="flex w-full items-center justify-between">
            <span>PowerPoint</span>
            <span className="text-xs text-muted-foreground">.pptx</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
