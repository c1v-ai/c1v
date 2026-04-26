/**
 * SectionRisks — embedded FMEA residual flags table. Severity-classified
 * rows derived from `residual_risk.flags[].criticality_category`.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import type { ResidualFlag } from './types';

interface SectionRisksProps {
  flags: ResidualFlag[];
  threshold: number;
}

function severityVariant(
  category: string,
): 'destructive' | 'default' | 'secondary' | 'outline' {
  const c = category.toUpperCase();
  if (c.includes('HIGH')) return 'destructive';
  if (c.includes('MEDIUM')) return 'default';
  if (c.includes('LOW')) return 'secondary';
  return 'outline';
}

export function SectionRisks({ flags, threshold }: SectionRisksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Residual Risks
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            (RPN threshold: {threshold})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {flags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No residual risk flags above the threshold.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                  <th className="px-3 py-2 text-left font-medium">Failure Mode</th>
                  <th className="px-3 py-2 text-right font-medium">RPN</th>
                  <th className="px-3 py-2 text-left font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((flag) => (
                  <tr key={flag.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-mono text-xs text-foreground">
                      {flag.id}
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {flag.failure_mode}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                      {flag.rpn}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={severityVariant(flag.criticality_category)}>
                        {flag.criticality_category}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
