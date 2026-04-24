'use client';

/**
 * FMEA viewer — renders Early (Wave-2) and Residual (Wave-4) FMEA instances
 * in a tabbed UI. Per v2 §15.5 R-v2.3 this is the ONLY net-new system-design
 * frontend component allowed while the rest of the viewers are frozen.
 *
 * Data source: project.projectData.intakeState.extractedData.fmeaEarly and
 * .fmeaResidual (see app/(dashboard)/projects/[id]/system-design/fmea/page.tsx).
 *
 * Instance shape (from gen-fmea.py, scripts/artifact-generators):
 *   { fmea_table: { rows: [...] }, rating_scales: {...}, stoplight_charts: {...} }
 * The row shape is not strictly typed here — we defensively read common keys
 * (function, failure_mode, effect, cause, severity, occurrence, detection,
 * rpn, mitigation) and gracefully render unknown fields.
 *
 * Stoplight SVG: referenced by path (stoplight_svg_path) so we can load it as
 * an <img> without any dangerouslySetInnerHTML. The path is produced by
 * gen-fmea and resolved through the artifacts manifest API.
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type FMEARow = {
  id?: string;
  function?: string;
  failure_mode?: string;
  failureMode?: string;
  effect?: string;
  cause?: string;
  severity?: number;
  occurrence?: number;
  detection?: number;
  rpn?: number;
  mitigation?: string;
  [k: string]: unknown;
};

export interface FMEAInstance {
  fmea_table?: { rows?: FMEARow[]; [k: string]: unknown } | FMEARow[];
  rating_scales?: Record<string, unknown>;
  stoplight_charts?: Record<string, unknown>;
  /** Optional path to an SVG file produced by gen-fmea. */
  stoplight_svg_path?: string;
  [k: string]: unknown;
}

interface FMEAViewerProps {
  early?: FMEAInstance | null;
  residual?: FMEAInstance | null;
  /**
   * Optional URL prefix for resolving stoplight_svg_path into a downloadable
   * asset. If omitted, the viewer falls back to showing raw chart data.
   */
  artifactUrlFor?: (relPath: string) => string;
}

function extractRows(instance: FMEAInstance | null | undefined): FMEARow[] {
  if (!instance) return [];
  const t = instance.fmea_table;
  if (!t) return [];
  if (Array.isArray(t)) return t;
  if (Array.isArray(t.rows)) return t.rows;
  return [];
}

function rpnClass(rpn: number | undefined): string {
  if (typeof rpn !== 'number' || Number.isNaN(rpn)) return '';
  if (rpn >= 80) return 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300';
  if (rpn >= 40) return 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
  return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
}

function FMEATable({ rows }: { rows: FMEARow[] }) {
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const ra = typeof a.rpn === 'number' ? a.rpn : -1;
        const rb = typeof b.rpn === 'number' ? b.rpn : -1;
        return rb - ra;
      }),
    [rows]
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        FMEA table is empty for this wave.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {['ID', 'Function', 'Failure Mode', 'Effect', 'Cause', 'S', 'O', 'D', 'RPN', 'Mitigation'].map(
              (h) => (
                <th key={h} className="border px-2 py-2 bg-muted font-semibold text-foreground text-left">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const failureMode = row.failure_mode ?? row.failureMode ?? '';
            return (
              <tr key={(row.id as string) ?? i} className="align-top">
                <td className="border px-2 py-1 font-mono text-[10px] text-muted-foreground">
                  {row.id ?? i + 1}
                </td>
                <td className="border px-2 py-1">{row.function ?? ''}</td>
                <td className="border px-2 py-1">{failureMode as string}</td>
                <td className="border px-2 py-1">{row.effect ?? ''}</td>
                <td className="border px-2 py-1">{row.cause ?? ''}</td>
                <td className="border px-2 py-1 text-center">{row.severity ?? ''}</td>
                <td className="border px-2 py-1 text-center">{row.occurrence ?? ''}</td>
                <td className="border px-2 py-1 text-center">{row.detection ?? ''}</td>
                <td
                  className={cn(
                    'border px-2 py-1 text-center font-semibold',
                    rpnClass(row.rpn as number | undefined)
                  )}
                >
                  {row.rpn ?? ''}
                </td>
                <td className="border px-2 py-1">{row.mitigation ?? ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StoplightPanel({
  instance,
  artifactUrlFor,
}: {
  instance: FMEAInstance;
  artifactUrlFor?: (relPath: string) => string;
}) {
  if (instance.stoplight_svg_path && artifactUrlFor) {
    const src = artifactUrlFor(instance.stoplight_svg_path);
    // <img> loads SVG as a document — scripts inside are ignored by browsers,
    // so no XSS surface. Trusted producer (gen-fmea.py) regardless.
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="FMEA stoplight matrix" className="w-full h-auto" />
      </div>
    );
  }

  const charts = instance.stoplight_charts;
  if (!charts || Object.keys(charts).length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No stoplight data for this wave.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-2">
        Stoplight SVG not yet rendered. Download from the Artifact Pipeline
        panel once gen-fmea completes.
      </p>
      <pre className="text-[10px] leading-tight overflow-x-auto bg-muted/40 p-2 rounded">
        {JSON.stringify(charts, null, 2).slice(0, 2000)}
      </pre>
    </div>
  );
}

function WaveSection({
  instance,
  waveLabel,
  artifactUrlFor,
}: {
  instance: FMEAInstance | null | undefined;
  waveLabel: string;
  artifactUrlFor?: (relPath: string) => string;
}) {
  if (!instance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{waveLabel}</CardTitle>
          <CardDescription>
            Not yet generated. Run the {waveLabel.toLowerCase()} pass to populate this view.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const rows = extractRows(instance);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{waveLabel} — Stoplight</CardTitle>
          <CardDescription>Severity × Occurrence heatmap produced by gen-fmea.</CardDescription>
        </CardHeader>
        <CardContent>
          <StoplightPanel instance={instance} artifactUrlFor={artifactUrlFor} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{waveLabel} — Failure Mode Table</CardTitle>
          <CardDescription>
            Sorted by RPN descending. {rows.length} row{rows.length === 1 ? '' : 's'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FMEATable rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}

export function FMEAViewer({ early, residual, artifactUrlFor }: FMEAViewerProps) {
  const [tab, setTab] = useState<string>(early ? 'early' : residual ? 'residual' : 'early');

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="early" disabled={!early && !residual}>
          FMEA Early {early ? '' : '(pending)'}
        </TabsTrigger>
        <TabsTrigger value="residual" disabled={!early && !residual}>
          FMEA Residual {residual ? '' : '(pending)'}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="early" className="space-y-4">
        <WaveSection instance={early} waveLabel="FMEA Early" artifactUrlFor={artifactUrlFor} />
      </TabsContent>
      <TabsContent value="residual" className="space-y-4">
        <WaveSection instance={residual} waveLabel="FMEA Residual" artifactUrlFor={artifactUrlFor} />
      </TabsContent>
    </Tabs>
  );
}

export default FMEAViewer;
