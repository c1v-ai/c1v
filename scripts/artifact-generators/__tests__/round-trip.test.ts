/**
 * Round-trip tests for MIGRATED generators (T10 EC-15.2).
 *
 * STATUS: DEFERRED for byte-compare. See plans/t10-outputs/verification-report.md.
 *
 * Per v2 §15.8 EC-15.2, migrated generators must round-trip with byte-identical
 * output vs the v1 script baselines. At the time of writing (2026-04-24):
 *
 *   - The v1 scripts have NOT been moved to archive/scripts-v1/ (per
 *     runtime-wirer blocker #1, archival is DEFERRED), so there is no clean
 *     way to execute the v1 baseline in isolation.
 *   - No pre-captured golden artifacts exist in system-design/kb-upgrade-v2/
 *     with sha256 alongside, only the *source* JSONs and final .pptx/.xlsx
 *     that were hand-built in v1 — these were not produced by the migrator's
 *     new generator code with identical inputs.
 *   - Even if baselines existed, pptx files contain embedded timestamps
 *     (slide.xml.rels, core.xml) — byte-identical compare is brittle; spec
 *     §15.8 allows visual-equivalent for pptx/svg.
 *
 * This suite therefore runs a reduced check on each of 8 migrated generators:
 *
 *   - Enumerate ArtifactGeneratorName migrated-subset.
 *   - For each, locate a candidate v2 source JSON under
 *     system-design/kb-upgrade-v2/module-*\/.
 *   - Mark DEFERRED with a .skip that logs the intent; when archive/scripts-v1/
 *     lands, flip .skip → .each and add byte-compare logic.
 *
 * The 4 new Crawley generators (decision-net, form-function, cost-curves,
 * latency-chain, arch-recommendation) are OUT OF SCOPE for round-trip (no v1
 * baseline exists — they are greenfield).
 */

import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO_ROOT = resolve(__dirname, '..', '..', '..');

interface MigratedCase {
  generator: string;
  v2SourceGlob: string;
  baselineArtifact: string | null;
  note?: string;
}

const MIGRATED: MigratedCase[] = [
  {
    generator: 'gen-ffbd',
    v2SourceGlob: 'system-design/kb-upgrade-v2/module-3-ffbd/ffbd_top_level.json',
    baselineArtifact: 'system-design/kb-upgrade-v2/module-3-ffbd/c1v_FFBD.pptx',
  },
  {
    generator: 'gen-qfd',
    v2SourceGlob: 'system-design/kb-upgrade-v2/module-6-qfd/c1v_QFD.json',
    baselineArtifact: null,
    note: 'v1 xlsx baseline not committed',
  },
  {
    generator: 'gen-n2',
    v2SourceGlob: 'system-design/kb-upgrade-v2/module-7-interfaces/n2_chart.json',
    baselineArtifact: null,
  },
  {
    generator: 'gen-sequence',
    v2SourceGlob: 'system-design/kb-upgrade-v2/module-7-interfaces/interface_matrix.json',
    baselineArtifact: null,
  },
  {
    generator: 'gen-dfd',
    v2SourceGlob: 'system-design/kb-upgrade-v2/module-7-interfaces/interface_matrix.json',
    baselineArtifact: null,
  },
  {
    generator: 'gen-interfaces',
    v2SourceGlob: 'system-design/kb-upgrade-v2/module-7-interfaces/interface_matrix.json',
    baselineArtifact: null,
  },
  {
    generator: 'gen-fmea',
    v2SourceGlob: 'system-design/kb-upgrade-v2/module-8-risk/fmea_table.json',
    baselineArtifact: null,
  },
  {
    generator: 'gen-ucbd',
    v2SourceGlob: 'system-design/kb-upgrade-v2/module-2-requirements/use_case_priority.json',
    baselineArtifact: null,
  },
];

describe('artifact-generators round-trip (T10 EC-15.2) — DEFERRED', () => {
  test('v1 archive dir exists but is empty (archival DEFERRED)', () => {
    const archiveDir = join(REPO_ROOT, 'archive', 'scripts-v1');
    // Archive dir was created but no scripts have been moved — per
    // plans/t10-outputs/legacy-archival-log.md, 14 legacy scripts are still
    // shelled out to via common/legacy_invoke.py::run_legacy(). Moving them
    // now would break runtime. This test records the known-deferred state.
    expect(existsSync(archiveDir)).toBe(true);
    const entries = require('node:fs').readdirSync(archiveDir);
    expect(entries).toEqual([]);
  });

  test.each(MIGRATED)('v2 source JSON exists for %s', ({ v2SourceGlob }) => {
    const p = join(REPO_ROOT, v2SourceGlob);
    expect(existsSync(p)).toBe(true);
  });

  test.skip.each(MIGRATED)(
    '%s: byte-identical round-trip vs v1 baseline (DEFERRED)',
    () => {
      // Intentionally skipped. Enable once archive/scripts-v1/ lands and
      // baselines are captured under system-design/kb-upgrade-v2/__golden__/.
    }
  );
});
