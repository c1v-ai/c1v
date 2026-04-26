/**
 * Empty-state wrapper for the FROZEN <QFDViewer> (House of Quality).
 *
 * The viewer at `qfd-viewer.tsx` is on the v2 UI-freeze list (byte-identical
 * in v2.1). This sibling wrapper honors EC-V21-A.16 by rendering the unified
 * <EmptySectionState> when the underlying hoq_xlsx / qfd_v1 artifact is
 * missing OR `synthesis_status !== 'ready'`.
 */

import { BarChart3 } from 'lucide-react';
import { EmptySectionState } from '@/components/projects/sections/empty-section-state';

export function QFDViewerEmptyWrapper({ projectId }: { projectId: number }) {
  return (
    <EmptySectionState
      icon={BarChart3}
      sectionName="House of Quality"
      methodologyCopy="Run Deep Synthesis to map customer needs to engineering characteristics with weighted correlations and a roof correlation matrix."
      projectId={projectId}
    />
  );
}
