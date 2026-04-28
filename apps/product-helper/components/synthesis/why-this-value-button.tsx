'use client';

/**
 * WhyThisValueButton — small inline button placed next to every auto-filled
 * NFR/constant/decision value. Clicking opens the side-panel with the matched
 * rule + math trace + KB references + override history.
 *
 * D-V21.23: reuses existing `components/chat/`-style panel layout via the
 * shadcn `Sheet` primitive.
 *
 * Brand-token compliance (EC-V21-A.11): uses semantic tokens only
 * (`text-muted-foreground`, `hover:text-foreground`, `bg-muted`) which already
 * map to Firefly/Porcelain/Tangerine/Danube via `app/globals.css` +
 * `app/theme.css`. NO new hex values.
 *
 * @module components/synthesis/why-this-value-button
 */

import { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { WhyThisValuePanel } from './why-this-value-panel';
import type { ExplainDecisionResponse } from './why-this-value-types';

export interface WhyThisValueButtonProps {
  /** Project id for the override-write tenant scope. */
  projectId: number;
  /** Stable decision id from the audit row. */
  decisionId: string;
  /** Field the decision wrote (e.g. `nfrs[NFR-001].target_value`). */
  targetField: string;
  /** Story id (for engine.json round-trip). */
  storyId: string;
  /** Engine.json version pinned by the row. */
  engineVersion: string;
  /**
   * Pre-fetched explain payload, when the parent already has it (e.g. from
   * an `architecture_recommendation.v1.json` field). When omitted, the panel
   * fetches via `/api/decision-audit/[projectId]/[targetField]/explain`.
   */
  payload?: ExplainDecisionResponse;
  /** Optional aria-label override for tighter labeling on the trigger. */
  ariaLabel?: string;
  /** Visual-density variant for tight vs roomy layouts. */
  size?: 'sm' | 'md';
  className?: string;
}

export function WhyThisValueButton({
  projectId,
  decisionId,
  targetField,
  storyId,
  engineVersion,
  payload,
  ariaLabel,
  size = 'sm',
  className,
}: WhyThisValueButtonProps) {
  const [open, setOpen] = useState(false);

  const label = ariaLabel ?? `Why this value? (${targetField})`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title="Why this value?"
          className={cn(
            'inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors',
            'hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            size === 'sm' ? 'h-5 w-5' : 'h-7 w-7',
            className,
          )}
        >
          <Info className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <WhyThisValuePanel
          projectId={projectId}
          decisionId={decisionId}
          targetField={targetField}
          storyId={storyId}
          engineVersion={engineVersion}
          initialPayload={payload}
          onClose={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
