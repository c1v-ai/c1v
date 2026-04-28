import { describe, it, expect } from '@jest/globals';
import {
  decompositionPlaneArtifactSchema,
  type DecompositionPlaneArtifact,
} from '../decomposition-plane';
import { roundTrip } from '../../__tests__/crawley-fixtures';
import { zodToStrictJsonSchema } from '../../zod-to-json';

function valid() {
  return {
    _schema: 'module-3.decomposition-plane.v1' as const,
    _phase_status: 'complete' as const,
    decomposition_plane: 'form_structure' as const,
    plane_alignment_score: 0.7,
    plane_rationale: 'Form structure aligns with delivered function emergence.',
    complexity_measures: {
      N1: 5,
      N2: 3,
      N3: 6,
      N4: 2,
      C_crawley: 16,
      C_boothroyd_dewhurst: 0,
      complexity_source: 'crawley' as const,
    },
    complexity_derivations: {
      crawley: {
        formula: 'C = N1 + N2 + N3 + N4',
        inputs: { N1: 5, N2: 3, N3: 6, N4: 2 },
        kb_source: 'crawley-ch13',
        result: 16,
      },
    },
    essential_complexity: 12,
    delta_above_essential: 4,
    gratuitous_complexity_flag: false,
    level_1_clusters: [
      {
        cluster_id: 'C1',
        name: 'Auth',
        entities: ['user', 'session', 'token'],
        internal_coupling_score: 0.8,
        external_coupling_score: 0.2,
        level_2_detail_populated: true,
        level_2_relationship_evidence: 'detailed sub-graph in section A',
        needs_subdivision: false,
        consider_merging_level: false,
      },
    ],
    crawley_refs: [],
  };
}

describe('module-3.decomposition-plane.v1', () => {
  it('parses a valid fixture', () => {
    const parsed = decompositionPlaneArtifactSchema.parse(valid());
    expect(parsed.level_1_clusters).toHaveLength(1);
  });

  it('rejects 2-Down-1-Up gate when complete (Box 13.6)', () => {
    const bad = valid();
    bad.level_1_clusters[0].level_2_detail_populated = false;
    expect(() => decompositionPlaneArtifactSchema.parse(bad)).toThrow(/2 Down, 1 Up/);
  });

  it('rejects cluster with > 9 entities (line 6245)', () => {
    const bad = valid();
    bad.level_1_clusters[0].entities = Array.from({ length: 10 }, (_, i) => `e${i}`);
    expect(() => decompositionPlaneArtifactSchema.parse(bad)).toThrow(/Subdivide/);
  });

  it('rejects elegance advisory when alignment < 0.5', () => {
    const bad = valid();
    bad.plane_alignment_score = 0.3;
    expect(() => decompositionPlaneArtifactSchema.parse(bad)).toThrow(/Box 13.7/);
  });

  it('round-trips through JSON.stringify → JSON.parse', () => {
    const parsed = decompositionPlaneArtifactSchema.parse(valid());
    const round = decompositionPlaneArtifactSchema.parse(roundTrip(parsed));
    expect(round).toEqual(parsed);
  });

  it('describe() metadata uses x-ui-surface= prefix', () => {
    const json = zodToStrictJsonSchema(
      decompositionPlaneArtifactSchema,
      'DecompositionPlaneArtifact',
    ) as { description?: string };
    expect(json.description).toMatch(/^x-ui-surface=/);
  });

  it('type narrowing works through the inferred type', () => {
    const parsed: DecompositionPlaneArtifact = decompositionPlaneArtifactSchema.parse(valid());
    expect(parsed._schema).toBe('module-3.decomposition-plane.v1');
  });
});
