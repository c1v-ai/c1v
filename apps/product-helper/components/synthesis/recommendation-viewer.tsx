/**
 * RecommendationViewer — keystone synthesis surface.
 *
 * Composes the 5-section structure of `architecture_recommendation.v1.json`
 * (per the self-application HTML capstone) plus chrome (provenance accordion
 * + download dropdown).
 *
 * Section order: callout → rationale → references → risks → tradeoffs → figures.
 *
 * Layout-only — the parent server component owns data fetching + signed-URL
 * resolution; this component receives a typed payload + manifest entries.
 */

import { SectionCallout } from './section-callout';
import { SectionRationale } from './section-rationale';
import { SectionReferencesTable } from './section-references-table';
import { SectionRisks } from './section-risks';
import { SectionTradeoffs } from './section-tradeoffs';
import { SectionFigures } from './section-figures';
import { ProvenanceAccordion } from './provenance-accordion';
import {
  DownloadDropdown,
  type DownloadDropdownArtifact,
} from './download-dropdown';

import type { ArchitectureRecommendation } from './types';

export interface RecommendationViewerProps {
  payload: ArchitectureRecommendation;
  projectId: number;
  artifacts: DownloadDropdownArtifact[];
  manifestContractVersion?: string | null;
}

export function RecommendationViewer({
  payload,
  projectId,
  artifacts,
  manifestContractVersion,
}: RecommendationViewerProps) {
  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            Architecture Recommendation
          </h1>
          <p className="text-sm text-muted-foreground">
            {payload.metadata.project_name} ·{' '}
            {new Date(payload.synthesized_at).toLocaleString()}
          </p>
        </div>
        <DownloadDropdown
          artifacts={artifacts}
          manifestContractVersion={manifestContractVersion}
          projectId={projectId}
        />
      </header>

      <SectionCallout
        pareto={payload.pareto_frontier}
        decisions={payload.decisions}
        topLevelSummary={payload.top_level_architecture.summary}
      />

      <SectionRationale
        decisions={payload.decisions}
        derivationChain={payload.derivation_chain}
        projectId={projectId}
      />

      <SectionReferencesTable upstreamRefs={payload._upstream_refs} />

      <SectionRisks
        flags={payload.residual_risk.flags}
        threshold={payload.residual_risk.threshold}
      />

      <SectionTradeoffs pareto={payload.pareto_frontier} />

      <SectionFigures diagrams={payload.mermaid_diagrams} />

      <ProvenanceAccordion payload={payload} />
    </div>
  );
}
