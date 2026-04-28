'use client';

/**
 * Data Flows viewer — surfaces M1 phase-2.5 data_flows.v1.json (DE.NN
 * entries) as a list-of-flows component. Style consistent with the
 * existing components/projects/sections/* viewers.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  DataFlows,
  DataFlowEntry,
} from '@/lib/langchain/schemas/module-1/phase-2-5-data-flows';

interface DataFlowsViewerProps {
  dataFlows: DataFlows;
}

const CRITICALITY_BADGE: Record<string, string> = {
  critical: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
  high: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900',
  medium: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
  low: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
};

const PII_BADGE: Record<string, string> = {
  none: 'bg-muted text-muted-foreground',
  indirect: 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  direct: 'bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  sensitive: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300',
};

function FlowRow({ entry }: { entry: DataFlowEntry }) {
  return (
    <li className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3 flex-wrap">
        <span className="font-mono text-xs font-semibold text-foreground rounded bg-muted px-2 py-0.5">
          {entry.id}
        </span>
        <span className="font-semibold text-foreground">{entry.name}</span>
        <Badge variant="outline" className={cn('text-[10px]', CRITICALITY_BADGE[entry.criticality])}>
          {entry.criticality}
        </Badge>
        <span className={cn('rounded px-2 py-0.5 text-[10px] font-medium', PII_BADGE[entry.pii_class])}>
          PII: {entry.pii_class}
        </span>
        {entry.encryption_at_rest_required ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Lock className="h-3 w-3" aria-hidden /> at-rest
          </span>
        ) : null}
        {entry.encryption_in_transit_required ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" aria-hidden /> in-transit
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-foreground">{entry.description}</p>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="rounded-md border bg-background px-2 py-1 font-mono text-foreground">
          {entry.source}
        </span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
        <span className="rounded-md border bg-background px-2 py-1 font-mono text-foreground">
          {entry.sink}
        </span>
        <span className="ml-auto text-muted-foreground">
          payload: <span className="font-mono">{entry.payload_shape.name}</span>
          {entry.payload_shape.format_hint ? ` · ${entry.payload_shape.format_hint}` : null}
        </span>
      </div>

      {entry.payload_shape.fields.length > 0 ? (
        <div className="mt-3 rounded-md bg-muted/50 p-2">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Payload fields
          </div>
          <ul className="mt-1 space-y-0.5">
            {entry.payload_shape.fields.map((f) => (
              <li key={f.name} className="font-mono text-[11px] text-foreground">
                {f.name}: <span className="text-muted-foreground">{f.type}</span>
                {f.optional ? <span className="text-muted-foreground"> (optional)</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {entry.notes ? <p className="mt-2 text-xs text-muted-foreground">{entry.notes}</p> : null}
    </li>
  );
}

export function DataFlowsViewer({ dataFlows }: DataFlowsViewerProps) {
  const { entries, coverage_notes, system_name } = dataFlows;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Flows</CardTitle>
        <CardDescription>
          {entries.length} DE.NN flows for {system_name}. Each entry bridges
          M1 scope into M3 FFBD inputs and M7 N² payload typing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data flows recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <FlowRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}

        {coverage_notes && coverage_notes.length > 0 ? (
          <div className="mt-6 rounded-md border border-dashed bg-muted/40 p-3">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Coverage notes
            </div>
            <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
              {coverage_notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
