/**
 * SectionCallout — Winning Alternative card. Tangerine-bordered (brand token,
 * never inline hex). Reads pareto_frontier[is_recommended=true] + the
 * 4-decision summary chips from `decisions[]`.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

import type { ArchitectureRecommendation, ParetoAlternative } from './types';

interface SectionCalloutProps {
  pareto: ParetoAlternative[];
  decisions: ArchitectureRecommendation['decisions'];
  topLevelSummary: string;
}

export function SectionCallout({
  pareto,
  decisions,
  topLevelSummary,
}: SectionCalloutProps) {
  const winner = pareto.find((p) => p.is_recommended) ?? pareto[0];
  if (!winner) return null;

  return (
    <Card className="border-2 border-tangerine">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-tangerine" aria-hidden="true" />
          <CardTitle>Winning Alternative — {winner.id}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-semibold text-foreground">{winner.name}</p>
        <p className="text-sm text-muted-foreground">{winner.summary}</p>

        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <Stat label="Cost" value={`${winner.cost.value} ${winner.cost.units}`} />
          <Stat
            label="Latency"
            value={`${winner.latency.value} ${winner.latency.units}`}
          />
          <Stat
            label="Availability"
            value={`${winner.availability.value} ${winner.availability.units}`}
          />
        </div>

        {decisions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Decisions
            </p>
            <div className="flex flex-wrap gap-2">
              {decisions.map((d) => (
                <Badge key={d.id} variant="secondary">
                  {d.id}: {d.chosen_option}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {topLevelSummary && (
          <p className="border-t pt-3 text-xs text-muted-foreground">
            {topLevelSummary}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
