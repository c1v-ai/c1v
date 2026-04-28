/**
 * SynthesisEmptyState — pre-synthesis surface for /projects/[id]/synthesis.
 *
 * Per EC-V21-A.16 (locked 2026-04-25 21:21 EDT) the synthesis keystone page
 * composes 5 instances of the shared <EmptySectionState> for its 5
 * sub-sections (recommendation / decision-network / fmea / qfd /
 * architecture-and-database) when no `recommendation_json` artifact exists
 * for the project. NOT a blurred-tile-grid.
 *
 * Per D-V21.17 the methodology copy is generic — no canned exemplar values
 * (no "AV.01" / "Sonnet 4.5" / "pgvector" / "Vercel" / "Anthropic" leaks).
 * The verifier sweeps for those strings.
 *
 * P7 (UI synthesize-trigger, 2026-04-26): the actual synthesis trigger now
 * lives at the TOP of this empty state via <RunSynthesisButton/>. The 5
 * <EmptySectionState/> CTAs below are intentionally still <Link>s pointing
 * to /projects/[id]/synthesis — they are NAVIGATION ONLY, funnelling users
 * into this page where the single canonical trigger lives. Adding another
 * trigger surface anywhere else will fail the qa-th1-verifier grep.
 */

import {
  Sparkles,
  Network,
  ShieldAlert,
  TableProperties,
  LayoutGrid,
} from 'lucide-react';

import { EmptySectionState } from '@/components/projects/sections/empty-section-state';
import { RunSynthesisButton } from '@/components/synthesis/run-synthesis-button';

interface SynthesisEmptyStateProps {
  projectId: number;
}

const SECTIONS = [
  {
    icon: Sparkles,
    sectionName: 'Recommendation',
    methodologyCopy:
      'Run Deep Synthesis to derive a winning architecture alternative from the Pareto frontier with a 4-decision rationale chain.',
  },
  {
    icon: Network,
    sectionName: 'Decision Network',
    methodologyCopy:
      'Run Deep Synthesis to evaluate alternatives across cost, latency, and availability and select dominant options at each decision node.',
  },
  {
    icon: ShieldAlert,
    sectionName: 'FMEA',
    methodologyCopy:
      'Run Deep Synthesis to surface residual failure modes ranked by Risk Priority Number with mitigation traces back to controls.',
  },
  {
    icon: TableProperties,
    sectionName: 'QFD',
    methodologyCopy:
      'Run Deep Synthesis to map customer needs to engineering characteristics with weighted correlations and a roof correlation matrix.',
  },
  {
    icon: LayoutGrid,
    sectionName: 'Architecture & Database',
    methodologyCopy:
      'Run Deep Synthesis to render the recommended architecture diagram and a normalized database schema ready for review.',
  },
] as const;

export function SynthesisEmptyState({ projectId }: SynthesisEmptyStateProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Synthesis</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Your project hasn&apos;t been synthesized yet. Click{' '}
          <span className="font-medium text-foreground">
            Run Deep Synthesis
          </span>{' '}
          below to derive an architecture recommendation grounded in your
          requirements, decisions, and risk register. The five sections below
          preview what will be generated.
        </p>
        <div className="pt-1">
          <RunSynthesisButton projectId={projectId} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <EmptySectionState
            key={section.sectionName}
            icon={section.icon}
            sectionName={section.sectionName}
            methodologyCopy={section.methodologyCopy}
            projectId={projectId}
          />
        ))}
      </div>
    </div>
  );
}
