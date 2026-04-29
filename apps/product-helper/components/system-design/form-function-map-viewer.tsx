import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormEntry {
  id: string;
  name: string;
  realizes_functions?: string[];
}

interface FunctionEntry {
  id: string;
  name: string;
}

interface MatrixCell {
  form_id: string;
  function_id: string;
  score?: number;
  interaction_type?: string;
}

export interface FormFunctionMapData {
  system_name?: string;
  phase_1_form_inventory?: { forms?: FormEntry[] };
  phase_2_function_inventory?: { functions?: FunctionEntry[] };
  phase_3_concept_mapping_matrix?: { cells?: MatrixCell[] };
}

interface FormFunctionMapViewerProps {
  data: FormFunctionMapData;
}

function scoreToDisplay(score: number | undefined): string {
  if (score == null) return '—';
  if (score >= 0.7) return '●●●';
  if (score >= 0.4) return '●●○';
  if (score > 0) return '●○○';
  return '—';
}

function scoreToStyle(score: number | undefined): string {
  if (score == null || score === 0) return 'text-muted-foreground/30';
  if (score >= 0.7) return 'text-green-600 dark:text-green-400';
  if (score >= 0.4) return 'text-amber-600 dark:text-amber-400';
  return 'text-muted-foreground';
}

export function FormFunctionMapViewer({ data }: FormFunctionMapViewerProps) {
  const forms = data.phase_1_form_inventory?.forms ?? [];
  const functions = data.phase_2_function_inventory?.functions ?? [];
  const cells = data.phase_3_concept_mapping_matrix?.cells ?? [];

  const cellMap = new Map<string, MatrixCell>();
  for (const cell of cells) {
    cellMap.set(`${cell.function_id}::${cell.form_id}`, cell);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form-Function Map</CardTitle>
          <CardDescription>
            {functions.length} function{functions.length !== 1 ? 's' : ''} ×{' '}
            {forms.length} form{forms.length !== 1 ? 's' : ''} for{' '}
            {data.system_name ?? 'the system'}. Strength: ●●● high · ●●○ medium · ●○○ low
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forms.length === 0 || functions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No mapping data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-2 bg-muted font-semibold text-foreground text-left min-w-[140px]">
                      Function
                    </th>
                    {forms.map((form) => (
                      <th
                        key={form.id}
                        className="border px-2 py-2 bg-muted font-semibold text-foreground text-center min-w-[80px]"
                      >
                        <div className="font-mono">{form.id}</div>
                        <div className="text-[10px] font-normal text-muted-foreground truncate max-w-[80px]">
                          {form.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {functions.map((fn) => (
                    <tr key={fn.id}>
                      <td className="border px-2 py-2 text-foreground">
                        <span className="font-mono text-[10px] text-muted-foreground mr-1">
                          {fn.id}
                        </span>
                        {fn.name}
                      </td>
                      {forms.map((form) => {
                        const cell = cellMap.get(`${fn.id}::${form.id}`);
                        return (
                          <td
                            key={form.id}
                            className={cn(
                              'border px-2 py-2 text-center font-mono',
                              scoreToStyle(cell?.score),
                            )}
                            title={cell ? `Score: ${cell.score ?? 'n/a'}` : undefined}
                          >
                            {scoreToDisplay(cell?.score)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
