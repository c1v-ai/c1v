/**
 * Empty-state wrapper for the FROZEN <DecisionMatrixViewer>.
 *
 * The viewer at `decision-matrix-viewer.tsx` is on the v2 UI-freeze list
 * (byte-identical in v2.1). This sibling wrapper honors EC-V21-A.16 by
 * rendering the unified <EmptySectionState> when the underlying
 * `decision_matrix_v1` artifact row is missing OR `synthesis_status !== 'ready'`.
 *
 * Intended usage from the page server component:
 *
 *   const artifact = await getArtifactByKind(projectId, 'decision_matrix_v1');
 *   if (!artifact || artifact.synthesisStatus !== 'ready') {
 *     return <DecisionMatrixViewerEmptyWrapper projectId={projectId} />;
 *   }
 *   return <DecisionMatrixViewer decisionMatrix={...} />;
 */

import { Grid3X3 } from 'lucide-react';
import { EmptySectionState } from '@/components/projects/sections/empty-section-state';

export function DecisionMatrixViewerEmptyWrapper({
  projectId,
}: {
  projectId: number;
}) {
  return (
    <EmptySectionState
      icon={Grid3X3}
      sectionName="Decision Matrix"
      methodologyCopy="Run Deep Synthesis to score design alternatives against weighted performance criteria and surface the recommended choice."
      projectId={projectId}
    />
  );
}
