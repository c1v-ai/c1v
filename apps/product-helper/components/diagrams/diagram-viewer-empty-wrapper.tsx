/**
 * Empty-state wrapper for the FROZEN <DiagramViewer>.
 *
 * The viewer at `components/diagrams/diagram-viewer.tsx` is on the v2 UI-freeze
 * list (byte-identical in v2.1). This sibling wrapper honors EC-V21-A.16 by
 * rendering the unified <EmptySectionState> when the upstream Mermaid source
 * has not been generated yet — replacing the legacy raw-Mermaid-source-as-text
 * failure mode called out in EC-V21-A.16.
 */

import { GitBranch } from 'lucide-react';
import { EmptySectionState } from '@/components/projects/sections/empty-section-state';

export interface DiagramViewerEmptyWrapperProps {
  projectId: number;
  diagramName?: string;
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
