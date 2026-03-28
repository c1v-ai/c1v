'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Qfd } from '@/lib/langchain/schemas';

interface QFDViewerProps {
  qfd: Qfd;
}

/** Relationship symbol mapping */
const RELATIONSHIP_SYMBOLS: Record<string, { symbol: string; value: number; className: string }> = {
  strong: { symbol: '\u25CF', value: 9, className: 'text-green-600 dark:text-green-400' },
  moderate: { symbol: '\u25CB', value: 3, className: 'text-yellow-600 dark:text-yellow-400' },
  weak: { symbol: '\u25B3', value: 1, className: 'text-red-600 dark:text-red-400' },
};

/** Roof correlation symbols */
const CORRELATION_SYMBOLS: Record<string, { symbol: string; className: string }> = {
  'strong-positive': { symbol: '++', className: 'text-green-600 dark:text-green-400 font-bold' },
  positive: { symbol: '+', className: 'text-green-500 dark:text-green-500' },
  negative: { symbol: '-', className: 'text-red-500 dark:text-red-500' },
  'strong-negative': { symbol: '--', className: 'text-red-600 dark:text-red-400 font-bold' },
};

/** Direction of improvement arrows */
const DIRECTION_ARROWS: Record<string, string> = {
  higher: '\u2191',
  lower: '\u2193',
  target: '\u25C7',
};

export function QFDViewer({ qfd }: QFDViewerProps) {
  const { customerNeeds, engineeringCharacteristics, relationships, roof, competitors } = qfd;

  // Build a fast lookup for relationships: `${needId}::${charId}` -> strength
  const relationshipMap = useMemo(() => {
    const map = new Map<string, string>();
    relationships.forEach((r) => {
      map.set(`${r.needId}::${r.charId}`, r.strength);
    });
    return map;
  }, [relationships]);

  // Compute absolute importance for each engineering characteristic
  const charImportance = useMemo(() => {
    const importance: Record<string, number> = {};
    engineeringCharacteristics.forEach((ec) => {
      let total = 0;
      customerNeeds.forEach((cn) => {
        const strength = relationshipMap.get(`${cn.id}::${ec.id}`);
        if (strength && RELATIONSHIP_SYMBOLS[strength]) {
          total += cn.relativeImportance * RELATIONSHIP_SYMBOLS[strength].value;
        }
      });
      importance[ec.id] = total;
    });
    return importance;
  }, [customerNeeds, engineeringCharacteristics, relationshipMap]);

  const maxImportance = Math.max(...Object.values(charImportance), 1);

  return (
    <div className="space-y-6">
      {/* Main HOQ Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>House of Quality Matrix</CardTitle>
          <CardDescription>
            Mapping {customerNeeds.length} customer needs to{' '}
            {engineeringCharacteristics.length} engineering characteristics
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Engineering characteristics header */}
              <tr className="border-b">
                <th className="px-2 py-1.5 text-left font-semibold text-foreground min-w-[180px]">
                  Customer Need
                </th>
                <th className="px-2 py-1.5 text-center font-semibold text-foreground w-16">
                  Wt
                </th>
                {engineeringCharacteristics.map((ec) => (
                  <th
                    key={ec.id}
                    className="px-2 py-1.5 text-center font-semibold text-foreground min-w-[80px]"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-muted-foreground">
                        {DIRECTION_ARROWS[ec.directionOfImprovement] ?? ''}
                      </span>
                      <span className="leading-tight">{ec.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {ec.id}
                      </span>
                    </div>
                  </th>
                ))}
                {/* Competitive analysis columns */}
                {competitors.map((comp) => (
                  <th
                    key={comp.name}
                    className="px-2 py-1.5 text-center font-semibold text-foreground min-w-[60px] bg-muted/30"
                  >
                    {comp.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customerNeeds.map((need) => (
                <tr key={need.id} className="border-b">
                  <td className="px-2 py-1.5 text-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-mono">
                        {need.id}
                      </span>
                      <span>{need.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <div className="h-1.5 w-10 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${need.relativeImportance * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-muted-foreground">
                        {(need.relativeImportance * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  {/* Relationship cells */}
                  {engineeringCharacteristics.map((ec) => {
                    const strength = relationshipMap.get(
                      `${need.id}::${ec.id}`
                    );
                    const rel = strength
                      ? RELATIONSHIP_SYMBOLS[strength]
                      : null;
                    return (
                      <td
                        key={ec.id}
                        className="px-2 py-1.5 text-center"
                        title={
                          strength
                            ? `${strength} (${rel?.value})`
                            : 'No relationship'
                        }
                      >
                        {rel ? (
                          <span className={cn('text-base', rel.className)}>
                            {rel.symbol}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">
                            &mdash;
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {/* Competitor scores */}
                  {competitors.map((comp) => {
                    const score = comp.scores[need.id];
                    return (
                      <td
                        key={comp.name}
                        className="px-2 py-1.5 text-center bg-muted/30"
                      >
                        {score != null ? (
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex gap-px">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    'h-2 w-2 rounded-full',
                                    i <= score
                                      ? 'bg-primary'
                                      : 'bg-muted-foreground/20'
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30">
                            &mdash;
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              {/* Absolute importance row */}
              <tr className="border-t-2">
                <td
                  className="px-2 py-2 font-semibold text-foreground"
                  colSpan={2}
                >
                  Absolute Importance
                </td>
                {engineeringCharacteristics.map((ec) => (
                  <td key={ec.id} className="px-2 py-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-foreground">
                        {charImportance[ec.id]?.toFixed(1)}
                      </span>
                      <div className="h-1.5 w-full max-w-[60px] rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${(charImportance[ec.id] / maxImportance) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                ))}
                {competitors.map((comp) => (
                  <td key={comp.name} className="bg-muted/30" />
                ))}
              </tr>
              {/* Design targets row */}
              <tr className="border-t">
                <td
                  className="px-2 py-2 font-semibold text-foreground"
                  colSpan={2}
                >
                  Design Target
                </td>
                {engineeringCharacteristics.map((ec) => (
                  <td
                    key={ec.id}
                    className="px-2 py-2 text-center text-xs text-foreground"
                  >
                    {ec.designTarget}
                  </td>
                ))}
                {competitors.map((comp) => (
                  <td key={comp.name} className="bg-muted/30" />
                ))}
              </tr>
              {/* Technical difficulty row */}
              <tr className="border-t">
                <td
                  className="px-2 py-2 font-semibold text-foreground"
                  colSpan={2}
                >
                  Technical Difficulty
                </td>
                {engineeringCharacteristics.map((ec) => (
                  <td key={ec.id} className="px-2 py-2 text-center">
                    {ec.technicalDifficulty != null ? (
                      <div className="flex justify-center gap-px">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'h-2 w-2 rounded-sm',
                              i <= (ec.technicalDifficulty ?? 0)
                                ? 'bg-orange-500'
                                : 'bg-muted-foreground/20'
                            )}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/30">&mdash;</span>
                    )}
                  </td>
                ))}
                {competitors.map((comp) => (
                  <td key={comp.name} className="bg-muted/30" />
                ))}
              </tr>
              {/* Estimated cost row */}
              <tr className="border-t">
                <td
                  className="px-2 py-2 font-semibold text-foreground"
                  colSpan={2}
                >
                  Estimated Cost
                </td>
                {engineeringCharacteristics.map((ec) => (
                  <td key={ec.id} className="px-2 py-2 text-center">
                    {ec.estimatedCost != null ? (
                      <div className="flex justify-center gap-px">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'h-2 w-2 rounded-sm',
                              i <= (ec.estimatedCost ?? 0)
                                ? 'bg-blue-500'
                                : 'bg-muted-foreground/20'
                            )}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/30">&mdash;</span>
                    )}
                  </td>
                ))}
                {competitors.map((comp) => (
                  <td key={comp.name} className="bg-muted/30" />
                ))}
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Roof / Correlation Triangle */}
      {roof.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Correlation Roof (Engineering Characteristic Relationships)
            </CardTitle>
            <CardDescription>
              How engineering characteristics interact with each other
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left" />
                    {engineeringCharacteristics.map((ec) => (
                      <th
                        key={ec.id}
                        className="px-2 py-1 text-center font-semibold text-foreground min-w-[60px]"
                      >
                        {ec.id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {engineeringCharacteristics.map((rowEc, rowIdx) => (
                    <tr key={rowEc.id}>
                      <td className="px-2 py-1 font-semibold text-foreground">
                        {rowEc.id}
                      </td>
                      {engineeringCharacteristics.map((colEc, colIdx) => {
                        if (colIdx <= rowIdx) {
                          return (
                            <td
                              key={colEc.id}
                              className="px-2 py-1 text-center bg-muted/20"
                            >
                              {colIdx === rowIdx ? (
                                <span className="text-muted-foreground/30">
                                  &mdash;
                                </span>
                              ) : null}
                            </td>
                          );
                        }
                        const entry = roof.find(
                          (r) =>
                            (r.charId1 === rowEc.id &&
                              r.charId2 === colEc.id) ||
                            (r.charId1 === colEc.id && r.charId2 === rowEc.id)
                        );
                        const corr = entry
                          ? CORRELATION_SYMBOLS[entry.correlation]
                          : null;
                        return (
                          <td
                            key={colEc.id}
                            className="px-2 py-1 text-center"
                            title={
                              entry
                                ? `${rowEc.id} / ${colEc.id}: ${entry.correlation}`
                                : 'No correlation'
                            }
                          >
                            {corr ? (
                              <span className={corr.className}>
                                {corr.symbol}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/30">
                                &mdash;
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Relationship strengths */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Relationship Strength
              </p>
              {Object.entries(RELATIONSHIP_SYMBOLS).map(([key, rel]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={cn('text-base', rel.className)}>
                    {rel.symbol}
                  </span>
                  <span className="text-xs text-foreground capitalize">
                    {key} ({rel.value})
                  </span>
                </div>
              ))}
            </div>
            {/* Correlations */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Roof Correlations
              </p>
              {Object.entries(CORRELATION_SYMBOLS).map(([key, corr]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={cn('text-sm', corr.className)}>
                    {corr.symbol}
                  </span>
                  <span className="text-xs text-foreground capitalize">
                    {key.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
            {/* Direction of improvement */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Direction of Improvement
              </p>
              {Object.entries(DIRECTION_ARROWS).map(([key, arrow]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-base text-foreground">{arrow}</span>
                  <span className="text-xs text-foreground capitalize">
                    {key} is better
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
