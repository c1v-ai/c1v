'use client';

/**
 * ProvenanceAccordion — disclosures over the synthesis payload (Dimension L).
 * Three collapsible sections: full JSON, derivation chain, and next-steps
 * checklist. The parent server component supplies the typed payload; this
 * component is layout-only and renders the JSON via <pre>.
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import type { ArchitectureRecommendation } from './types';

interface ProvenanceAccordionProps {
  payload: ArchitectureRecommendation;
}

export function ProvenanceAccordion({ payload }: ProvenanceAccordionProps) {
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="metadata">
        <AccordionTrigger>Provenance metadata</AccordionTrigger>
        <AccordionContent>
          <dl className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            <Datum label="Inputs hash" value={payload.inputs_hash} mono />
            <Datum label="Synthesized at" value={payload.synthesized_at} />
            <Datum label="Generator" value={payload.metadata.generator} />
            <Datum label="Model version" value={payload.model_version} />
            <Datum
              label="Schema version"
              value={payload.metadata.schema_version}
            />
            <Datum
              label="Phase status"
              value={payload._phase_status}
            />
          </dl>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="next-steps">
        <AccordionTrigger>Next steps</AccordionTrigger>
        <AccordionContent>
          {payload.next_steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No next steps recorded.</p>
          ) : (
            <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
              {payload.next_steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="json">
        <AccordionTrigger>Full JSON payload</AccordionTrigger>
        <AccordionContent>
          <pre className="max-h-96 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-xs text-foreground">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function Datum({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          mono
            ? 'truncate font-mono text-xs text-foreground'
            : 'text-sm text-foreground'
        }
      >
        {value}
      </dd>
    </div>
  );
}
