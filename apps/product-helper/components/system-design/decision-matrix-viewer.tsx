'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DecisionMatrix } from '@/lib/langchain/schemas';

interface DecisionMatrixViewerProps {
  decisionMatrix: DecisionMatrix;
}

export function DecisionMatrixViewer({ decisionMatrix }: DecisionMatrixViewerProps) {
  const { criteria, alternatives, recommendation } = decisionMatrix;

  // Compute weighted totals and find winner
  const { totals, winnerId } = useMemo(() => {
    const computed: Record<string, number> = {};
    let maxScore = -Infinity;
    let winner = '';

    alternatives.forEach((alt) => {
      const total =
        alt.weightedTotal ??
        criteria.reduce((sum, c) => {
          const score = alt.scores[c.id] ?? 0;
          return sum + score * c.weight;
        }, 0);
      computed[alt.id] = total;
      if (total > maxScore) {
        maxScore = total;
        winner = alt.id;
      }
    });

    return { totals: computed, winnerId: winner };
  }, [criteria, alternatives]);

  return (
    <div className="space-y-6">
      {/* Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Criteria vs. Design Alternatives</CardTitle>
          <CardDescription>
            Weighted scoring matrix comparing {alternatives.length} alternatives
            across {criteria.length} criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-semibold text-foreground">
                  Criterion
                </th>
                <th className="px-3 py-2 text-center font-semibold text-foreground w-20">
                  Weight
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground w-24">
                  Unit
                </th>
                {alternatives.map((alt) => (
                  <th
                    key={alt.id}
                    className={cn(
                      'px-3 py-2 text-center font-semibold text-foreground min-w-[100px]',
                      alt.id === winnerId && 'bg-green-500/10'
                    )}
                  >
                    <div>{alt.name}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {alt.id}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion) => (
                <tr key={criterion.id} className="border-b">
                  <td className="px-3 py-2 text-foreground">
                    <div className="font-medium">{criterion.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {criterion.id}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${criterion.weight * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground min-w-[2rem]">
                        {(criterion.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {criterion.unit}
                  </td>
                  {alternatives.map((alt) => {
                    const score = alt.scores[criterion.id] ?? 0;
                    return (
                      <td
                        key={alt.id}
                        className={cn(
                          'px-3 py-2 text-center',
                          alt.id === winnerId && 'bg-green-500/10'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block rounded px-2 py-0.5 text-xs font-medium',
                            score >= 0.8
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : score >= 0.5
                                ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                : 'bg-red-500/20 text-red-700 dark:text-red-400'
                          )}
                        >
                          {score.toFixed(2)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2">
                <td
                  className="px-3 py-3 font-bold text-foreground"
                  colSpan={3}
                >
                  Weighted Total
                </td>
                {alternatives.map((alt) => (
                  <td
                    key={alt.id}
                    className={cn(
                      'px-3 py-3 text-center font-bold',
                      alt.id === winnerId
                        ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                        : 'text-foreground'
                    )}
                  >
                    {totals[alt.id]?.toFixed(3)}
                    {alt.id === winnerId && (
                      <span className="ml-1.5 inline-block rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
                        Winner
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Recommendation */}
      {recommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {recommendation}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
