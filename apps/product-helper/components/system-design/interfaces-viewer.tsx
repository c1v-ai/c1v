'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DiagramViewer } from '@/components/diagrams/diagram-viewer';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateDFDDiagram,
  generateSequenceDiagram,
} from '@/lib/diagrams/system-design-generators';
import type { Interfaces } from '@/lib/langchain/schemas';

interface InterfacesViewerProps {
  interfaces: Interfaces;
}

/** Category color mapping for N2 cells */
const CATEGORY_STYLES: Record<string, string> = {
  'system-flow': 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  critical: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300',
  auth: 'bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  audit: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
};

/**
 * Build use-case groups from interface data.
 *
 * Since the Interfaces schema does not include explicit use-case-to-interface
 * mappings, we derive them: each unique (source, destination) pair is treated
 * as a "use case" whose relevant interfaces are those sharing that pair,
 * ordered by interface ID.
 */
function deriveUseCaseGroups(interfaces: Interfaces) {
  const groupMap = new Map<
    string,
    { id: string; name: string; interfaceIds: string[] }
  >();

  interfaces.interfaces.forEach((iface) => {
    const key = `${iface.source}::${iface.destination}`;
    if (!groupMap.has(key)) {
      const sourceName =
        interfaces.subsystems.find((s) => s.id === iface.source)?.name ??
        iface.source;
      const destName =
        interfaces.subsystems.find((s) => s.id === iface.destination)?.name ??
        iface.destination;
      groupMap.set(key, {
        id: '',
        name: `${sourceName} to ${destName}`,
        interfaceIds: [],
      });
    }
    groupMap.get(key)!.interfaceIds.push(iface.id);
  });

  // Number cleanly
  const groups = Array.from(groupMap.values());
  groups.forEach((g, i) => {
    g.id = `UC-${String(i + 1).padStart(2, '0')}`;
  });

  return groups;
}

/**
 * N2 Chart rendered as a React table (avoids dangerouslySetInnerHTML).
 */
function N2ChartTable({ interfaces }: { interfaces: Interfaces }) {
  const { subsystems } = interfaces;
  const n2 = interfaces.n2Chart ?? {};

  // Build category lookup: `source::dest` -> category
  const categoryLookup = useMemo(() => {
    const map = new Map<string, string>();
    interfaces.interfaces.forEach((iface) => {
      if (iface.category) {
        map.set(`${iface.source}::${iface.destination}`, iface.category);
      }
    });
    return map;
  }, [interfaces.interfaces]);

  if (subsystems.length < 2) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          N2-001: Insufficient subsystems (found: {subsystems.length}, min: 2)
        </p>
      </div>
    );
  }

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-2 bg-muted font-semibold text-foreground text-center">
            FROM / TO
          </th>
          {subsystems.map((ss) => (
            <th
              key={ss.id}
              className="border px-2 py-2 bg-muted font-semibold text-foreground text-center min-w-[80px]"
            >
              <div>{ss.id}</div>
              <div className="text-[10px] font-normal text-muted-foreground">
                {ss.name}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {subsystems.map((fromSs) => (
          <tr key={fromSs.id}>
            <th className="border px-2 py-2 bg-muted font-semibold text-foreground text-center">
              <div>{fromSs.id}</div>
              <div className="text-[10px] font-normal text-muted-foreground">
                {fromSs.name}
              </div>
            </th>
            {subsystems.map((toSs) => {
              if (fromSs.id === toSs.id) {
                return (
                  <td
                    key={toSs.id}
                    className="border px-2 py-2 text-center bg-indigo-100 dark:bg-indigo-950 font-bold text-foreground"
                  >
                    {fromSs.name}
                  </td>
                );
              }
              const payload = n2[fromSs.id]?.[toSs.id];
              if (payload && payload.trim() !== '') {
                const category = categoryLookup.get(
                  `${fromSs.id}::${toSs.id}`
                );
                const catStyle = category
                  ? CATEGORY_STYLES[category] ?? ''
                  : '';
                return (
                  <td
                    key={toSs.id}
                    className={cn(
                      'border px-2 py-2 text-center text-foreground',
                      catStyle
                    )}
                  >
                    {payload}
                  </td>
                );
              }
              return (
                <td
                  key={toSs.id}
                  className="border px-2 py-2 text-center text-muted-foreground/40"
                >
                  &mdash;
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function InterfacesViewer({ interfaces }: InterfacesViewerProps) {
  const [expandedUCs, setExpandedUCs] = useState<Set<string>>(new Set());

  // Generate DFD
  const dfdResult = useMemo(
    () => generateDFDDiagram(interfaces),
    [interfaces]
  );

  // Derive use case groups for sequence diagrams
  const useCaseGroups = useMemo(
    () => deriveUseCaseGroups(interfaces),
    [interfaces]
  );

  const toggleUC = (id: string) => {
    setExpandedUCs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Tabs defaultValue="dfd" className="space-y-4">
      <TabsList>
        <TabsTrigger value="dfd">Data Flow Diagram</TabsTrigger>
        <TabsTrigger value="n2">N2 Chart</TabsTrigger>
        <TabsTrigger value="sequence">Sequence Diagrams</TabsTrigger>
      </TabsList>

      {/* DFD Tab */}
      <TabsContent value="dfd">
        <Card>
          <CardHeader>
            <CardTitle>Data Flow Diagram</CardTitle>
            <CardDescription>
              System boundary with {interfaces.subsystems.length} subsystems and{' '}
              {interfaces.interfaces.length} interfaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dfdResult.validation.passed ? (
              <DiagramViewer
                syntax={dfdResult.mermaidSyntax}
                type="context"
                title="System Data Flow"
                description="Subsystems and data flows within and across the system boundary"
              />
            ) : (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">
                  Validation errors:
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  {dfdResult.validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {dfdResult.validation.warnings.length > 0 && (
              <div className="mt-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Warnings:
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  {dfdResult.validation.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* N2 Chart Tab */}
      <TabsContent value="n2">
        <Card>
          <CardHeader>
            <CardTitle>N2 Interface Matrix</CardTitle>
            <CardDescription>
              Subsystem-to-subsystem data exchange matrix (
              {interfaces.subsystems.length}x{interfaces.subsystems.length})
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <N2ChartTable interfaces={interfaces} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Sequence Diagrams Tab */}
      <TabsContent value="sequence">
        <Card>
          <CardHeader>
            <CardTitle>Sequence Diagrams</CardTitle>
            <CardDescription>
              Interaction sequences per use case ({useCaseGroups.length} use
              cases derived from interfaces)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {useCaseGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No use cases could be derived from the interface data.
              </p>
            ) : (
              useCaseGroups.map((uc) => {
                const isExpanded = expandedUCs.has(uc.id);
                const seqResult = isExpanded
                  ? generateSequenceDiagram(
                      interfaces,
                      uc.id,
                      uc.name,
                      uc.interfaceIds
                    )
                  : null;

                return (
                  <Collapsible
                    key={uc.id}
                    open={isExpanded}
                    onOpenChange={() => toggleUC(uc.id)}
                  >
                    <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left hover:bg-muted/50 transition-colors">
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                      />
                      <span className="font-mono text-sm text-muted-foreground">
                        {uc.id}
                      </span>
                      <span className="font-medium text-foreground">
                        {uc.name}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {uc.interfaceIds.length} interface
                        {uc.interfaceIds.length !== 1 ? 's' : ''}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 ml-7">
                      {seqResult && seqResult.validation.passed ? (
                        <DiagramViewer
                          syntax={seqResult.mermaidSyntax}
                          type="activity"
                          title={`${uc.id}: ${uc.name}`}
                          description={`Interfaces: ${uc.interfaceIds.join(', ')}`}
                        />
                      ) : seqResult ? (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                          <p className="text-sm text-destructive">
                            {seqResult.validation.errors.join('; ')}
                          </p>
                        </div>
                      ) : null}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
