/**
 * SectionReferencesTable — module outputs referenced by the synthesis,
 * driven by the recommendation's `_upstream_refs` array. Each row is a
 * sibling artifact path the recommendation depends on.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface SectionReferencesTableProps {
  upstreamRefs: string[];
}

const MODULE_LABELS: Record<string, string> = {
  'module-1': 'M1 Scope',
  'module-2': 'M2 Requirements',
  'module-3': 'M3 FFBD',
  'module-4': 'M4 Decision Network',
  'module-5': 'M5 Form-Function',
  'module-6': 'M6 HoQ',
  'module-7': 'M7 Interfaces',
  'module-8': 'M8 Risk',
};

function moduleLabel(path: string): string {
  for (const [key, label] of Object.entries(MODULE_LABELS)) {
    if (path.includes(key)) return label;
  }
  if (path.includes('synthesis')) return 'Synthesis';
  return 'Module';
}

export function SectionReferencesTable({
  upstreamRefs,
}: SectionReferencesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referenced Module Outputs</CardTitle>
      </CardHeader>
      <CardContent>
        {upstreamRefs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upstream references recorded.
          </p>
        ) : (
          <ul className="divide-y">
            {upstreamRefs.map((ref) => (
              <li
                key={ref}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileText
                    className="h-4 w-4 flex-shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="truncate font-mono text-xs text-foreground">
                    {ref}
                  </span>
                </div>
                <span className="flex-shrink-0 text-xs font-medium text-muted-foreground">
                  {moduleLabel(ref)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
