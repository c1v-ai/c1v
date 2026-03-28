'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DiagramViewer } from '@/components/diagrams/diagram-viewer';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateFFBDDiagram } from '@/lib/diagrams/system-design-generators';
import type { Ffbd } from '@/lib/langchain/schemas';

interface FFBDViewerProps {
  ffbd: Ffbd;
}

/**
 * Gate legend labels and descriptions
 */
const GATE_LEGEND = [
  { symbol: 'AND', label: 'AND Gate', description: 'Parallel execution — all branches run simultaneously' },
  { symbol: 'OR', label: 'OR Gate', description: 'Decision — one branch selected based on condition' },
  { symbol: 'IT', label: 'IT Gate', description: 'Iteration — loop until condition met' },
  { symbol: 'SEQ', label: 'Sequence', description: 'Sequential flow from one function to the next' },
] as const;

export function FFBDViewer({ ffbd }: FFBDViewerProps) {
  const [expandedFunctions, setExpandedFunctions] = useState<Set<string>>(new Set());

  // Generate top-level FFBD diagram
  const topLevelResult = generateFFBDDiagram(ffbd, 'top');

  // Identify top-level blocks that have decomposed children
  const parentIds = new Set(ffbd.decomposedBlocks.map((b) => b.parentId).filter(Boolean));

  const toggleFunction = (id: string) => {
    setExpandedFunctions((prev) => {
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
    <div className="space-y-6">
      {/* Top-level FFBD */}
      <Card>
        <CardHeader>
          <CardTitle>Top-Level Functional Flow</CardTitle>
          <CardDescription>
            System-level function sequence showing the primary operational flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topLevelResult.validation.passed ? (
            <DiagramViewer
              syntax={topLevelResult.mermaidSyntax}
              type="activity"
              title="Top-Level FFBD"
              description="F.1 through F.N — primary functional flow"
            />
          ) : (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Validation errors:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                {topLevelResult.validation.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation warnings */}
          {topLevelResult.validation.warnings.length > 0 && (
            <div className="mt-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Warnings:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                {topLevelResult.validation.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decomposed Functions */}
      {ffbd.topLevelBlocks.filter((b) => parentIds.has(b.id)).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Decomposed Functions</CardTitle>
            <CardDescription>
              Expand each top-level function to see its sub-function breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {ffbd.topLevelBlocks
              .filter((block) => parentIds.has(block.id))
              .map((block) => {
                const isExpanded = expandedFunctions.has(block.id);
                const decomposedResult = isExpanded
                  ? generateFFBDDiagram(ffbd, 'decomposed', block.id)
                  : null;

                return (
                  <Collapsible
                    key={block.id}
                    open={isExpanded}
                    onOpenChange={() => toggleFunction(block.id)}
                  >
                    <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left hover:bg-muted/50 transition-colors">
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                      />
                      <span className="font-mono text-sm text-muted-foreground">
                        {block.id}
                      </span>
                      <span className="font-medium text-foreground">
                        {block.name}
                      </span>
                      {block.isCoreValue && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 ml-7">
                      {decomposedResult && decomposedResult.validation.passed ? (
                        <DiagramViewer
                          syntax={decomposedResult.mermaidSyntax}
                          type="activity"
                          title={`${block.id}: ${block.name}`}
                          description={block.description}
                        />
                      ) : decomposedResult ? (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                          <p className="text-sm text-destructive">
                            {decomposedResult.validation.errors.join('; ')}
                          </p>
                        </div>
                      ) : null}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Gate Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gate Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GATE_LEGEND.map((gate) => (
              <div
                key={gate.symbol}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <span className="inline-flex h-8 w-12 items-center justify-center rounded bg-muted font-mono text-xs font-bold text-foreground">
                  {gate.symbol}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {gate.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {gate.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Core value indicator */}
          <div className="mt-3 flex items-center gap-2 rounded-lg border p-3">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Core Value Function
              </p>
              <p className="text-xs text-muted-foreground">
                The primary value-delivering function, highlighted with a red
                border in the diagram
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
