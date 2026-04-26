/**
 * Empty-state wrapper for the FROZEN <FFBDViewer>.
 *
 * The viewer at `ffbd-viewer.tsx` is on the v2 UI-freeze list (byte-identical
 * in v2.1). This sibling wrapper honors EC-V21-A.16 by rendering the unified
 * <EmptySectionState> when the underlying ffbd_v1 / functional-flow artifact
 * is missing OR `synthesis_status !== 'ready'`.
 */

import { Network } from 'lucide-react';
import { EmptySectionState } from '@/components/projects/sections/empty-section-state';

export function FFBDViewerEmptyWrapper({ projectId }: { projectId: number }) {
  return (
    <EmptySectionState
      icon={Network}
      sectionName="Functional Flow"
      methodologyCopy="Run Deep Synthesis to derive the functional flow block diagram with system functions, branches, and feedback loops."
      projectId={projectId}
    />
  );
}
