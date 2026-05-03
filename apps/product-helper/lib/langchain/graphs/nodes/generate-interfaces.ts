/**
 * Generate Interfaces Node
 *
 * v2.1 Wave A RE-WIRE (langgraph-wirer / handoff Issue 21): node now invokes
 * `interface-specs-agent` (M7.b) when N2 matrix data is on state and persists
 * `interface_specs.v1` to `project_artifacts(kind='interface_specs_v1')`. The
 * legacy `extractInterfaces` path is preserved for back-compat with the
 * FROZEN `components/system-design/interfaces-viewer.tsx`
 * (`extractedData.interfaces` data path); both paths run.
 *
 * @module graphs/nodes/generate-interfaces
 */

import {
  IntakeState,
  ArtifactPhase,
  computeArtifactReadiness,
  calculateCompleteness,
} from '../types';
import { extractInterfaces } from '../../agents/interfaces-agent';
import { runInterfaceSpecsAgent } from '../../agents/system-design/interface-specs-agent';
import { formatMessagesAsText } from '../utils';
import { persistArtifact } from './_persist-artifact';

// ============================================================
// Main Node Function
// ============================================================

/**
 * Generate Interface artifacts from conversation and extracted data
 *
 * This node:
 * 1. Formats FFBD summary from extractedData.ffbd
 * 2. Formats use cases summary from extractedData.useCases
 * 3. Calls extractInterfaces with project context
 * 4. Merges interfaces result into extractedData
 * 5. Adds data_flow_diagram, n2_chart, sequence_diagrams, interface_matrix to generatedArtifacts
 * 6. Recomputes completeness and artifactReadiness
 *
 * @param state - Current intake state with messages and extractedData
 * @returns Partial state with updated extractedData, completeness, artifactReadiness, generatedArtifacts
 */
export async function generateInterfaces(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  if (state.error) {
    console.warn(`[GENERATE_INTERFACES] Skipping: ${state.error}`);
    return {};
  }
  console.log(`[GENERATE_INTERFACES] Node entered`);
  console.log(
    `[GENERATE_INTERFACES] Messages: ${state.messages?.length ?? 0}, ` +
    `Use cases: ${state.extractedData?.useCases?.length ?? 0}, ` +
    `FFBD present: ${!!state.extractedData?.ffbd}`
  );

  try {
    // Format conversation for extraction
    const conversationText = formatMessagesAsText(state.messages);

    if (!conversationText.trim()) {
      console.warn(`[GENERATE_INTERFACES] No conversation text available — skipping`);
      return {
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    // Format FFBD summary from extractedData
    const ffbd = state.extractedData?.ffbd;
    let ffbdStr = 'No FFBD data available yet.';
    if (ffbd) {
      const topLevelFns = ffbd.topLevelBlocks
        ?.map(blk => `${blk.id}: ${blk.name}${blk.description ? ` — ${blk.description}` : ''}`)
        .join('\n') ?? '';
      const decomposed = ffbd.decomposedBlocks
        ?.map(blk => `${blk.id}: ${blk.name} (parent: ${blk.parentId ?? 'root'})${blk.description ? ` — ${blk.description}` : ''}`)
        .join('\n') ?? '';
      ffbdStr = `Top-level functions:\n${topLevelFns || 'none'}\n\nDecomposed functions:\n${decomposed || 'none'}`;
    }

    // Format use cases summary
    const useCasesStr = (state.extractedData?.useCases ?? [])
      .map(uc => {
        const parts = [`${uc.id}: ${uc.name} — ${uc.description}`];
        if (uc.actor) parts.push(`  Actor: ${uc.actor}`);
        if (uc.preconditions?.length) parts.push(`  Preconditions: ${uc.preconditions.join('; ')}`);
        if (uc.postconditions?.length) parts.push(`  Postconditions: ${uc.postconditions.join('; ')}`);
        if (uc.mainFlow?.length) {
          parts.push(`  Main flow: ${uc.mainFlow.map(s => `${s.stepNumber}. ${s.actor}: ${s.action}`).join(' -> ')}`);
        }
        return parts.join('\n');
      })
      .join('\n\n') || 'No use cases extracted yet.';

    console.log(`[GENERATE_INTERFACES] Calling extractInterfaces for project: ${state.projectName}`);

    // Call the interfaces extraction agent
    const result = await extractInterfaces(
      conversationText,
      state.projectName,
      ffbdStr,
      useCasesStr,
      {
        extractedData: state.extractedData,
        projectType: state.projectType,
        projectVision: state.projectVision,
      }
    );

    // Handle null result gracefully
    if (!result) {
      console.warn(`[GENERATE_INTERFACES] extractInterfaces returned null — preserving existing state`);
      return {
        extractedData: state.extractedData,
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    console.log(`[GENERATE_INTERFACES] Interfaces extraction succeeded`);

    // v2.1 Wave A RE-WIRE — additionally invoke interface-specs-agent (M7.b)
    // when N2 matrix data is present on state. Persists to
    // project_artifacts(kind='interface_specs_v1').
    const ed = state.extractedData as Record<string, unknown> | undefined;
    const n2 = ed?.['n2Matrix'] as { rows?: unknown[] } | undefined;
    let interfaceSpecsResult: unknown = ed?.['interfaceSpecs'];
    if (n2 && Array.isArray(n2.rows) && n2.rows.length > 0) {
      try {
        interfaceSpecsResult = runInterfaceSpecsAgent({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          n2Matrix: { rows: n2.rows as any },
          producedAt: new Date().toISOString(),
          producedBy: 'langgraph:generate_interfaces',
          systemName: state.projectName,
          outputPath: `runtime://project/${state.projectId}/interface_specs.v1.json`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          upstreamRefs: { n2_matrix: 'runtime' } as any,
        });
        await persistArtifact({
          projectId: state.projectId,
          kind: 'interface_specs_v1',
          status: 'ready',
          result: interfaceSpecsResult,
        });
        console.log('[GENERATE_INTERFACES] interface-specs-agent re-wire emit OK');
      } catch (e) {
        const reason = e instanceof Error ? e.message : 'unknown';
        console.warn('[GENERATE_INTERFACES] interface-specs-agent re-wire FAILED (non-fatal for legacy):', reason);
        await persistArtifact({
          projectId: state.projectId,
          kind: 'interface_specs_v1',
          status: 'failed',
          failureReason: reason,
        });
      }
    } else {
      await persistArtifact({ projectId: state.projectId, kind: 'interface_specs_v1', status: 'pending' });
    }

    // Legacy interfaces result lands in extractedData (FROZEN interfaces-viewer.tsx
    // data path). interface_specs.v1 (synthesis artifact) persists to
    // project_artifacts above — do NOT add to extractedData per Bond
    // architectural correction.
    void interfaceSpecsResult; // referenced for sentinel; not stored on state.
    const updatedExtractedData = {
      ...state.extractedData,
      interfaces: result,
    };

    // Recompute completeness and artifact readiness
    const completeness = calculateCompleteness(updatedExtractedData);
    const artifactReadiness = computeArtifactReadiness(updatedExtractedData);

    // Add new artifact phases to generated list
    const newPhases: ArtifactPhase[] = [
      'data_flow_diagram',
      'n2_chart',
      'sequence_diagrams',
      'interface_matrix',
    ];
    const generatedArtifacts = [
      ...(state.generatedArtifacts ?? []),
      ...newPhases.filter(
        phase => !(state.generatedArtifacts ?? []).includes(phase)
      ),
    ];

    console.log(`[GENERATE_INTERFACES] Returning state update — completeness: ${completeness}, generatedArtifacts: ${generatedArtifacts.length}`);

    return {
      extractedData: updatedExtractedData,
      completeness,
      artifactReadiness,
      generatedArtifacts,
    };
  } catch (error) {
    console.error(
      `[GENERATE_INTERFACES] Interfaces generation FAILED:`,
      error instanceof Error ? error.message : error
    );

    return {
      error: `Interfaces generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
