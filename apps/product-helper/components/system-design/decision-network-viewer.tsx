import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface Alternative {
  id: string;
  label: string;
  rationale?: string;
}

interface DecisionNode {
  id: string;
  label: string;
  alternatives?: Alternative[];
  winning_alternative?: Alternative;
}

interface ParetoAlternative {
  id: string;
  utility_total?: number;
  on_frontier?: boolean;
  choices?: Array<{ decision_node_id: string; alternative_id: string }>;
}

export interface DecisionNetworkData {
  system_name?: string;
  decision_nodes?: DecisionNode[];
  pareto_alternatives?: ParetoAlternative[];
}

interface DecisionNetworkViewerProps {
  data: DecisionNetworkData;
}

export function DecisionNetworkViewer({ data }: DecisionNetworkViewerProps) {
  const nodes = data.decision_nodes ?? [];
  const pareto = (data.pareto_alternatives ?? []).filter((a) => a.on_frontier);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Decision Network</CardTitle>
          <CardDescription>
            {nodes.length} decision node{nodes.length !== 1 ? 's' : ''} for{' '}
            {data.system_name ?? 'the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No decision nodes recorded.</p>
          ) : (
            <div className="divide-y">
              {nodes.map((node) => (
                <div key={node.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-semibold text-foreground rounded bg-muted px-2 py-0.5 shrink-0">
                      {node.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{node.label}</p>
                      {node.winning_alternative && (
                        <div className="mt-2 flex items-start gap-2">
                          <CheckCircle2
                            className="h-4 w-4 text-green-500 shrink-0 mt-0.5"
                            aria-hidden
                          />
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {node.winning_alternative.label}
                            </span>
                            {node.winning_alternative.rationale && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {node.winning_alternative.rationale}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {node.alternatives && node.alternatives.length > 1 && (
                        <div className="mt-2">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            All alternatives
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {node.alternatives.map((alt) => (
                              <Badge key={alt.id} variant="outline" className="text-[10px]">
                                {alt.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pareto.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pareto Frontier</CardTitle>
            <CardDescription>
              {pareto.length} non-dominated architecture vector
              {pareto.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="border px-3 py-2 bg-muted font-semibold text-foreground text-left">
                      ID
                    </th>
                    <th className="border px-3 py-2 bg-muted font-semibold text-foreground text-left">
                      Utility
                    </th>
                    <th className="border px-3 py-2 bg-muted font-semibold text-foreground text-left">
                      Choices
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pareto.map((alt) => (
                    <tr key={alt.id}>
                      <td className="border px-3 py-2 font-mono text-foreground">{alt.id}</td>
                      <td className="border px-3 py-2 text-foreground">
                        {alt.utility_total != null ? alt.utility_total.toFixed(3) : '—'}
                      </td>
                      <td className="border px-3 py-2 text-muted-foreground">
                        {alt.choices
                          ?.map((c) => `${c.decision_node_id}→${c.alternative_id}`)
                          .join(', ') ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
