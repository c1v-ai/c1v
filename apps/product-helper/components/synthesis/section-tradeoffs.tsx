/**
 * SectionTradeoffs — Pareto frontier table (winner + dominated alternatives).
 * Highlight the winning row.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { ParetoAlternative } from './types';

interface SectionTradeoffsProps {
  pareto: ParetoAlternative[];
}

export function SectionTradeoffs({ pareto }: SectionTradeoffsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pareto Tradeoffs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 text-left font-medium">ID</th>
                <th className="px-3 py-2 text-left font-medium">Alternative</th>
                <th className="px-3 py-2 text-right font-medium">Cost</th>
                <th className="px-3 py-2 text-right font-medium">Latency</th>
                <th className="px-3 py-2 text-right font-medium">Availability</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {pareto.map((alt) => (
                <tr
                  key={alt.id}
                  className={cn(
                    'border-b last:border-b-0',
                    alt.is_recommended && 'bg-tangerine/10',
                  )}
                >
                  <td className="px-3 py-2 font-mono text-xs text-foreground">
                    {alt.id}
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    <p className="font-medium">{alt.name}</p>
                    <p className="text-xs text-muted-foreground">{alt.summary}</p>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                    {alt.cost.value} {alt.cost.units}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                    {alt.latency.value} {alt.latency.units}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                    {alt.availability.value} {alt.availability.units}
                  </td>
                  <td className="px-3 py-2">
                    {alt.is_recommended ? (
                      <Badge>Recommended</Badge>
                    ) : (
                      <Badge variant="outline">Dominated</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
