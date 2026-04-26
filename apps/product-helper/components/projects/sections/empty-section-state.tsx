/**
 * EmptySectionState — shared empty-state component for requirements +
 * system-design section surfaces (EC-V21-A.16, locked 2026-04-25 21:21 EDT).
 *
 * Renders when a section's underlying project_artifacts row is missing OR
 * `synthesis_status !== 'ready'`. Pattern (locked): section icon +
 * "<sectionName> not generated yet" headline + 1-line GENERIC methodology
 * copy + `[Run Deep Synthesis →]` CTA.
 *
 * Honors D-V21.17 (no canned data) — methodology copy is generic, no
 * exemplar values like "AV.01 / Sonnet 4.5 / pgvector / Vercel" leak in.
 *
 * IMPORTANT (P7 — UI synthesize-trigger contract, 2026-04-26):
 * Sub-page CTAs rendered by this component are NAVIGATIONAL ONLY. The CTA
 * is a `<Link>` to `/projects/[id]/synthesis` (or an explicit `ctaHref`
 * override) — it does NOT POST to `/api/projects/[id]/synthesize`. The
 * actual synthesis trigger lives on the synthesis page, in
 * `components/synthesis/empty-state.tsx` + `run-synthesis-button.tsx`,
 * via a server action. There is exactly ONE canonical trigger surface in
 * the app; introducing another (e.g. converting this component's CTA into
 * a form-with-action) would create duplicate POST surfaces, break the
 * route's 5-min idempotency guarantee for double-clicks, and fail the
 * `qa-th1-verifier` greps. If you need a section to surface synthesis
 * differently, route the user IN to the synthesis page where the trigger
 * lives — do not re-introduce the trigger here.
 */

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface EmptySectionStateProps {
  /** Section icon — Lucide icon component. Falls back to Sparkles. */
  icon?: LucideIcon;
  /** Section name used in the headline ("<sectionName> not generated yet"). */
  sectionName: string;
  /**
   * 1-line generic methodology copy. MUST NOT include canned-c1v exemplar
   * strings (verifier sweeps for "AV.01" / "Sonnet 4.5" / "pgvector" / "Vercel").
   */
  methodologyCopy: string;
  /** Project ID — drives the [Run Deep Synthesis →] CTA href. */
  projectId: number;
  /** Override CTA label. Defaults to "Run Deep Synthesis". */
  ctaLabel?: string;
  /**
   * Override CTA href. Defaults to `/projects/<id>/synthesis`. Used when a
   * section's CTA should route to a non-synthesis surface (e.g. intake chat
   * for pre-synthesis stages).
   */
  ctaHref?: string;
}

export function EmptySectionState({
  icon: Icon = Sparkles,
  sectionName,
  methodologyCopy,
  projectId,
  ctaLabel = 'Run Deep Synthesis',
  ctaHref,
}: EmptySectionStateProps) {
  const href = ctaHref ?? `/projects/${projectId}/synthesis`;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16 px-4">
          <Icon
            className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40"
            aria-hidden="true"
          />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {sectionName} not generated yet
          </h3>
          <p className="text-sm mb-6 max-w-md mx-auto text-muted-foreground">
            {methodologyCopy}
          </p>
          <Button asChild>
            <Link href={href}>
              {ctaLabel}
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
