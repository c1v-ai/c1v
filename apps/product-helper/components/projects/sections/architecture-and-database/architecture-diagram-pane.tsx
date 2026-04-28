'use client';

/**
 * ArchitectureDiagramPane — renders the selected alternative's Mermaid
 * architecture diagram via the FROZEN diagram-viewer. Imports only — does
 * NOT modify diagram-viewer.tsx (UI Freeze).
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Boxes } from 'lucide-react';
import { DiagramViewer } from '@/components/diagrams/diagram-viewer';
import { AlternativePicker } from './alternative-picker';
import type { ArchitectureAlternative, DecisionNetworkLike } from './types';

interface Props {
  decisionNetwork: DecisionNetworkLike | null;
  /** Fallback Mermaid (legacy `class_diagram`-style) when no alternatives exist. */
  fallbackMermaid?: string;
  /**
   * Project id required by the `<WhyThisValueButton />` rendered inside
   * the alternative-picker. Optional so legacy callers without provenance
   * UI still type-check.
   */
  projectId?: number;
}

function pickAlternatives(dn: DecisionNetworkLike | null): ArchitectureAlternative[] {
  if (!dn) return [];
  if (dn.alternatives && dn.alternatives.length > 0) return dn.alternatives;
  if (dn.pareto_frontier && dn.pareto_frontier.length > 0) return dn.pareto_frontier;
  return [];
}

function pickDefault(alts: ArchitectureAlternative[]): string | undefined {
  const recommended = alts.find((a) => a.is_recommended);
  return (recommended ?? alts[0])?.id;
}

export function ArchitectureDiagramPane({ decisionNetwork, fallbackMermaid, projectId }: Props) {
  const alternatives = useMemo(() => pickAlternatives(decisionNetwork), [decisionNetwork]);
  const [selectedId, setSelectedId] = useState<string | undefined>(pickDefault(alternatives));

  const selected = alternatives.find((a) => a.id === selectedId) ?? alternatives[0];
  const mermaid =
    selected?.mermaid ??
    decisionNetwork?.mermaid_diagrams?.decision_network ??
    fallbackMermaid ??
    '';

  if (alternatives.length === 0 && !mermaid) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Architecture Diagram</CardTitle>
          </div>
          <CardDescription>
            No architecture alternatives have been generated yet. Run synthesis to populate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Awaiting synthesis output.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alternatives.length > 0 && selectedId && (
        <AlternativePicker
          alternatives={alternatives}
          selectedId={selectedId}
          onSelect={setSelectedId}
          projectId={projectId}
        />
      )}

      {mermaid ? (
        <DiagramViewer
          syntax={mermaid}
          type="class"
          title={selected ? `${selected.id} — ${selected.name}` : 'Architecture Diagram'}
          description={
            selected?.summary ??
            'System architecture diagram for the selected alternative.'
          }
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              No diagram available for {selected?.id ?? 'this alternative'}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
