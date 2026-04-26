'use client';

/**
 * "Why incomplete?" disclosure chip for sequence diagrams that fall through
 * to the safety-net cleanup at diagram-viewer.tsx:88-110. Additive UI hint —
 * does NOT replace the safety net; renders alongside the diagram-viewer.
 *
 * Usage:
 *   <DiagramViewer syntax={...} type="activity" />
 *   <SequenceDiagramDisclosure failureReason={...} />
 */

import { useState } from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SequenceDiagramDisclosureProps {
  /**
   * Optional structured failure detail surfaced by the upstream generator
   * (e.g., the safety-net cleaning result in lib/diagrams). When absent, a
   * generic explainer is rendered.
   */
  failureReason?: string;
  /** Optional list of cleaned/dropped lines for the curious. */
  droppedFragments?: string[];
}

export function SequenceDiagramDisclosure({
  failureReason,
  droppedFragments,
}: SequenceDiagramDisclosureProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
      <CollapsibleTrigger
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-ring',
          'dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/40',
        )}
      >
        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
        <span>Why is this incomplete?</span>
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 transition-transform',
            open && 'rotate-90',
          )}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 rounded-md border bg-card p-3 text-xs text-foreground">
        <p>
          {failureReason ??
            'The generated sequence diagram contained syntax the renderer rejected. The safety-net cleanup in the diagram viewer dropped the offending fragments so the rest of the flow could render. Re-run synthesis after refining the upstream interface specs to regenerate a clean sequence.'}
        </p>
        {droppedFragments && droppedFragments.length > 0 ? (
          <div className="mt-2">
            <div className="font-medium text-foreground">Dropped fragments</div>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {droppedFragments.map((f, i) => (
                <li key={i} className="font-mono">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
