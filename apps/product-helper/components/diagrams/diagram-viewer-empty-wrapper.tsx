/**
 * Empty-state wrapper for the FROZEN <DiagramViewer>.
 *
 * The viewer at `components/diagrams/diagram-viewer.tsx` is on the v2 UI-freeze
 * list (byte-identical in v2.1). This sibling wrapper honors EC-V21-A.16 by
 * rendering the unified <EmptySectionState> when the upstream Mermaid source
 * has not been generated yet — replacing the legacy raw-Mermaid-source-as-text
 * failure mode called out in EC-V21-A.16.
 *
 * Callers (e.g. tech-stack section's Infrastructure Mermaid block, the
 * Architecture & Database section) should branch on the presence of the
 * Mermaid source string and render this wrapper for the empty branch.
 */

import { GitBranch } from 'lucide-react';
import { EmptySectionState } from '@/components/projects/sections/empty-section-state';

export interface DiagramViewerEmptyWrapperProps {
  projectId: number;
  /** Diagram label, used in the headline ("<diagramName> not generated yet"). */
  diagramName?: string;
  /** Override methodology copy. Defaults to a generic Mermaid-diagram explainer. */
  methodologyCopy?: string;
}

export function DiagramViewerEmptyWrapper({
  projectId,
  diagramName = 'Diagram',
  methodologyCopy = 'Run Deep Synthesis to render this diagram from the underlying functional model.',
}: DiagramViewerEmptyWrapperProps) {
  return (
    <EmptySectionState
      icon={GitBranch}
      sectionName={diagramName}
      methodologyCopy={methodologyCopy}
      projectId={projectId}
    />
  );
}
