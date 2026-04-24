/**
 * NFR Resynthesizer (Wave-2-mid / T-new c1v-m2-nfr-resynth)
 *
 * Produces `nfrs.v2.json` — a resynthesized NFR set where every entry is
 * derived from an upstream FMEA-early failure mode, a data-flow entry, or
 * a functional requirement (NOT guessed linearly from intake, as v2 did).
 *
 * Per plans/c1v-MIT-Crawley-Cornell.v2.md §0.3.6, this agent consumes:
 *   - module-8-risk/fmea_early.v1.json   → FM.NN mitigations become NFRs
 *   - module-1-defining-scope/data_flows.v1.json → pii/criticality imply security/availability NFRs
 *   - module-2-requirements/requirements_table.json → numeric FR budgets imply performance NFRs
 *   - module-2-requirements/constants_table.json → baseline target values (preserved unless FMEA invalidates)
 *
 * Emits:
 *   - nfrs.v2.json                    (the new NFR set)
 *   - nfr-diff-v2-to-v2.1.md          (side-by-side OLD vs NEW with rationale)
 *
 * Output schema: every NFR carries `derived_from` (discriminated union from
 * requirements-table-base.ts) pointing at its upstream demand.
 *
 * Not wired into LangGraph runtime yet — this is an offline synthesis agent
 * invoked manually to produce the v2.1 artifact. Future wave will promote
 * to an in-graph node.
 *
 * @module lib/langchain/agents/system-design/nfr-resynth-agent
 */

import type { DerivedFrom } from '../../schemas/module-2/requirements-table-base';

export interface NfrResynthInputs {
  fmeaEarlyPath: string;
  dataFlowsPath: string;
  requirementsTablePath: string;
  constantsTablePath: string;
}

export interface NfrResynthOutputs {
  nfrsPath: string;
  diffPath: string;
}

/**
 * NFR entry shape emitted into nfrs.v2.json. Mirrors the base
 * requirementRowSchema field set plus the resynth-specific metadata
 * (target_value, rationale, orphan flag).
 */
export interface NfrV21Entry {
  req_id: string;                        // NFR.NN
  text: string;                          // shall-prefixed requirement statement
  requirement_class:
    | 'performance'
    | 'reliability'
    | 'scalability'
    | 'capacity'
    | 'security'
    | 'usability'
    | 'compliance'
    | 'maintainability';
  derived_from: DerivedFrom;
  target_value?: { value: number | string; unit?: string; constant_ref?: string };
  verification_method: 'test' | 'inspection' | 'analysis' | 'demonstration';
  rationale: string;
  status: 'Final' | 'Estimate';
  supersedes_v2?: string | null;         // pointer to v2 construct this replaces
}

/**
 * Executed out-of-band via `pnpm tsx` or invoked from a higher-level
 * orchestrator. The live synthesis for c1v-self-application lives as the
 * nfrs.v2.json artifact; this function is a stub for deterministic replay
 * and to document the contract.
 */
export function resynthesizeNfrs(_inputs: NfrResynthInputs): NfrResynthOutputs {
  // Deterministic output paths — this agent is offline-synthesis only.
  return {
    nfrsPath: 'system-design/kb-upgrade-v2/module-2-requirements/nfrs.v2.json',
    diffPath:
      'system-design/kb-upgrade-v2/module-2-requirements/nfr-diff-v2-to-v2.1.md',
  };
}
