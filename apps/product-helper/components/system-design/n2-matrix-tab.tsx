'use client';

/**
 * N2 Matrix tab — sibling to the FROZEN interfaces-viewer. Renders the
 * canonical `module-7.n2-matrix.v1` artifact (function × function grid)
 * with cell-level click → scroll-to interface spec.
 *
 * Per EC-V21-A.5 this is the FIRST sub-tab on the Interfaces page.
 */

import { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { N2Matrix, N2Row } from '@/lib/langchain/schemas/module-7-interfaces/n2-matrix';

interface N2MatrixTabProps {
  n2Matrix: N2Matrix;
  /** DOM id prefix for interface-spec rows (used for scroll-to behavior). */
  interfaceSpecIdPrefix?: string;
}

const CRITICALITY_STYLES: Record<string, string> = {
  critical: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300',
  high: 'bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  medium: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  low: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
};

export function N2MatrixTab({
  n2Matrix,
  interfaceSpecIdPrefix = 'iface-',
}: N2MatrixTabProps) {
  const { functions_axis, rows } = n2Matrix;

  // (producer, consumer) → list of IF.NN ids
  const cellIndex = useMemo(() => {
    const map = new Map<string, N2Row[]>();
    for (const row of rows) {
      const key = `${row.producer}::${row.consumer}`;
      const bucket = map.get(key) ?? [];
      bucket.push(row);
      map.set(key, bucket);
    }
    return map;
  }, [rows]);

  const handleCellClick = useCallback(
    (interfaceId: string) => {
      if (typeof document === 'undefined') return;
      const el = document.getElementById(
        `${interfaceSpecIdPrefix}${interfaceId}`,
      );
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [interfaceSpecIdPrefix],
  );

  if (functions_axis.length < 2) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            N2 matrix requires at least 2 functions; got {functions_axis.length}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>N² Interface Matrix</CardTitle>
        <CardDescription>
          Producer × consumer cross-grid for {functions_axis.length} functions
          ({rows.length} interfaces). Click a cell to jump to the interface
          spec.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-2 bg-muted font-semibold text-foreground text-center">
                FROM \ TO
              </th>
              {functions_axis.map((fn) => (
                <th
                  key={fn}
                  className="border px-2 py-2 bg-muted font-semibold text-foreground text-center min-w-[80px]"
                >
                  {fn}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {functions_axis.map((from) => (
              <tr key={from}>
                <th className="border px-2 py-2 bg-muted font-semibold text-foreground text-center">
                  {from}
                </th>
                {functions_axis.map((to) => {
                  if (from === to) {
                    return (
                      <td
                        key={to}
                        className="border px-2 py-2 text-center bg-indigo-100 dark:bg-indigo-950 font-semibold text-foreground"
                      >
                        {from}
                      </td>
                    );
                  }
                  const cellRows = cellIndex.get(`${from}::${to}`) ?? [];
                  if (cellRows.length === 0) {
                    return (
                      <td
                        key={to}
                        className="border px-2 py-2 text-center text-muted-foreground/40"
                      >
                        &mdash;
                      </td>
                    );
                  }
                  // Pick worst-case criticality for cell color
                  const order: Record<string, number> = {
                    low: 0,
                    medium: 1,
                    high: 2,
                    critical: 3,
                  };
                  const worst = cellRows.reduce((acc, r) =>
                    (order[r.criticality] ?? 0) > (order[acc.criticality] ?? 0)
                      ? r
                      : acc,
                  );
                  const style = CRITICALITY_STYLES[worst.criticality] ?? '';
                  return (
                    <td
                      key={to}
                      className={cn(
                        'border p-0 text-center text-foreground',
                        style,
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleCellClick(cellRows[0]!.id)}
                        className="block w-full h-full px-2 py-2 text-left hover:underline focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label={`Jump to interface ${cellRows[0]!.id} (${cellRows[0]!.payload_name})`}
                      >
                        <div className="font-mono text-[11px]">
                          {cellRows.map((r) => r.id).join(', ')}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {cellRows[0]!.payload_name}
                        </div>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Interface specs list — anchor targets for scroll-to */}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            Interface specs
          </h3>
          <ul className="space-y-1">
            {rows.map((row) => (
              <li
                key={row.id}
                id={`${interfaceSpecIdPrefix}${row.id}`}
                className="rounded-md border bg-card p-3 text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold text-foreground">
                    {row.id}
                  </span>
                  <span className="text-muted-foreground">
                    {row.producer} → {row.consumer}
                  </span>
                  <span
                    className={cn(
                      'rounded px-2 py-0.5 text-[10px] font-medium',
                      CRITICALITY_STYLES[row.criticality],
                    )}
                  >
                    {row.criticality}
                  </span>
                  <span className="text-muted-foreground">
                    {row.protocol} · {row.sync_style}
                  </span>
                </div>
                <div className="mt-1 text-foreground">{row.payload_name}</div>
                {row.notes ? (
                  <div className="mt-1 text-muted-foreground">{row.notes}</div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
