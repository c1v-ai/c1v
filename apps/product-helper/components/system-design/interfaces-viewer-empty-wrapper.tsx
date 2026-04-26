/**
 * Empty-state wrapper for the FROZEN <InterfacesViewer>.
 *
 * The viewer at `interfaces-viewer.tsx` is on the v2 UI-freeze list
 * (byte-identical in v2.1). This sibling wrapper honors EC-V21-A.16 by
 * rendering the unified <EmptySectionState> when the underlying
 * interface_specs / n2_matrix artifacts are missing OR
 * `synthesis_status !== 'ready'`.
 *
 * Replaces the failure mode called out in EC-V21-A.16: 13 red
 * `[INSUFFICIENT (found:X, all:Y)]` rows on the Sequence Diagrams tab when
 * the upstream artifact has not synthesized yet. The unified empty state
 * is per-section, not per-tab — the page-level wrapper renders it before
 * any tab is mounted.
 */

import { Workflow } from 'lucide-react';
import { EmptySectionState } from '@/components/projects/sections/empty-section-state';

export function InterfacesViewerEmptyWrapper({
  projectId,
}: {
  projectId: number;
}) {
  return (
    <EmptySectionState
      icon={Workflow}
      sectionName="Interfaces"
      methodologyCopy="Run Deep Synthesis to derive an N2 producer-consumer matrix, sequence diagrams, and per-interface specifications."
      projectId={projectId}
    />
  );
}
