'use client';

/**
 * AlternativePicker — selects which Pareto-frontier architecture alternative
 * to render. Recommended option is pre-selected; non-recommended options
 * surface why they were dominated.
 *
 * Per EC-V21-A.6: user can swap between AV.01/.02/.03 (or however many the
 * synthesizer produced) and the Architecture pane re-renders the matching
 * Mermaid syntax.
 */

import { useId } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ArchitectureAlternative } from './types';

interface Props {
  alternatives: ArchitectureAlternative[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function AlternativePicker({ alternatives, selectedId, onSelect }: Props) {
  const labelId = useId();
  const selected = alternatives.find((a) => a.id === selectedId) ?? alternatives[0];

  if (!selected) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label
          id={labelId}
          className="text-sm font-medium text-foreground"
        >
          Architecture alternative
        </label>
        <Select value={selectedId} onValueChange={onSelect}>
          <SelectTrigger
            aria-labelledby={labelId}
            className="w-[420px] max-w-full"
          >
            <SelectValue placeholder="Select alternative" />
          </SelectTrigger>
          <SelectContent>
            {alternatives.map((alt) => (
              <SelectItem key={alt.id} value={alt.id}>
                <span className="font-mono text-xs mr-2">{alt.id}</span>
                {alt.name}
                {alt.is_recommended && (
                  <span className="ml-2 text-xs text-primary">(recommended)</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AlternativeSummary alt={selected} />
    </div>
  );
}

function AlternativeSummary({ alt }: { alt: ArchitectureAlternative }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{alt.id}</span>
            <span className="font-semibold text-foreground">{alt.name}</span>
            {alt.is_recommended ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Recommended
              </Badge>
            ) : (
              <Badge variant="outline">Alternative</Badge>
            )}
          </div>
          {alt.summary && (
            <p className="text-sm text-muted-foreground">{alt.summary}</p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <Metric label="Cost" metric={alt.cost} />
        <Metric label="Latency" metric={alt.latency} />
        <Metric label="Availability" metric={alt.availability} />
      </dl>

      {alt.dominates && alt.dominates.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Dominates: <span className="font-mono">{alt.dominates.join(', ')}</span>
        </p>
      )}
    </div>
  );
}

function Metric({
  label,
  metric,
}: {
  label: string;
  metric: ArchitectureAlternative['cost'];
}) {
  if (!metric) {
    return (
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="text-sm text-muted-foreground italic">unknown</dd>
      </div>
    );
  }

  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-mono text-sm text-foreground flex items-center gap-1.5">
        {metric.value} <span className="text-xs text-muted-foreground">{metric.units}</span>
        {metric.sentinel && (
          <AlertTriangle
            className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400"
            aria-label="Sentinel value — derivation incomplete"
          />
        )}
      </dd>
    </div>
  );
}
