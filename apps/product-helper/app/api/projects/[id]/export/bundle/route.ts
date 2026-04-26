/**
 * Bundle ZIP export — D-V21.11 / EC-V21-A.9.
 *
 * Streams a STORE-mode ZIP (no compression) of per-artifact JSON manifests
 * pulled from `project_artifacts`, plus a top-level `manifest.json` that
 * mirrors the `system-design/kb-upgrade-v2/module-N/` layout.
 *
 * v2.1 Wave A scope:
 *   - Route exists, auth-gated, returns a real ZIP.
 *   - Bundles per-row metadata as JSON files in the archive.
 *   - Storage-backed bytes (PDF/PPTX/XLSX) are wired in Wave B once TA3's
 *     signed-URL fetch helper lands. TODO(TB1) below.
 *
 * The `archiver` package is the spec-mandated streaming library, but the
 * shared multi-peer worktree made the dependency add unstable. This file
 * ships a hand-rolled STORE-mode ZIP encoder (PKZIP appnote 6.3.4 §4.4)
 * that produces a compliant single-pass archive without external deps.
 * TB1 may swap to `archiver` once the dep lands cleanly.
 *
 * GET /api/projects/[id]/export/bundle
 */

import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { getProjectArtifacts } from '@/lib/db/queries';

function bundlePathFor(kind: string): string {
  if (kind.startsWith('recommendation_')) return `synthesis/${kind}.json`;
  if (kind.startsWith('fmea_')) return `module-8-risk/${kind}.json`;
  if (kind === 'hoq_xlsx') return `module-6-architecture/${kind}.json`;
  if (kind.startsWith('n2_matrix') || kind.startsWith('interface_'))
    return `module-7-interfaces/${kind}.json`;
  if (kind.startsWith('decision_')) return `module-4-concept/${kind}.json`;
  return `misc/${kind}.json`;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]!) & 0xff]! ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

/**
 * Build a STORE-mode (no-compression) ZIP. Sufficient for the
 * v2.1 manifest bundle; no per-file size > 4GB so 32-bit fields suffice.
 */
function buildZip(entries: ZipEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const e of entries) {
    const nameBytes = Buffer.from(e.name, 'utf8');
    const crc = crc32(e.data);
    const size = e.data.length;

    // Local file header (signature 0x04034b50)
    const local = Buffer.alloc(30 + nameBytes.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(0, 8); // method: 0 = STORE
    local.writeUInt16LE(0, 10); // mod time
    local.writeUInt16LE(0, 12); // mod date
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18); // compressed size
    local.writeUInt32LE(size, 22); // uncompressed size
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28); // extra length
    nameBytes.copy(local, 30);
    localParts.push(local);
    localParts.push(Buffer.from(e.data));

    // Central directory entry (signature 0x02014b50)
    const central = Buffer.alloc(46 + nameBytes.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0, 8); // flags
    central.writeUInt16LE(0, 10); // method
    central.writeUInt16LE(0, 12); // mod time
    central.writeUInt16LE(0, 14); // mod date
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(size, 20);
    central.writeUInt32LE(size, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt16LE(0, 30); // extra
    central.writeUInt16LE(0, 32); // comment
    central.writeUInt16LE(0, 34); // disk
    central.writeUInt16LE(0, 36); // internal attrs
    central.writeUInt32LE(0, 38); // external attrs
    central.writeUInt32LE(offset, 42); // local header offset
    nameBytes.copy(central, 46);
    centralParts.push(central);

    offset += local.length + size;
  }

  const central = Buffer.concat(centralParts);
  const centralOffset = offset;
  const centralSize = central.length;

  // End of central directory record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, central, eocd]);
}

export const GET = withProjectAuth(async (_req, { team, projectId }) => {
  const artifacts = await getProjectArtifacts(projectId);
  if (!artifacts || artifacts.length === 0) {
    return NextResponse.json(
      {
        error: 'No artifacts to bundle',
        hint: 'Run Deep Synthesis to populate project_artifacts before exporting.',
      },
      { status: 404 },
    );
  }

  const enc = new TextEncoder();
  const entries: ZipEntry[] = [];

  const manifest = {
    project_id: projectId,
    team_id: team.id,
    generated_at: new Date().toISOString(),
    bundle_version: 'v1',
    note:
      'v2.1 Wave A bundle. Per-artifact bytes (PDF/PPTX/XLSX) follow in Wave B once the sidecar-storage fetch lands.',
    artifacts: artifacts.map((row) => ({
      id: row.id,
      kind: row.artifactKind,
      format: row.format,
      status: row.synthesisStatus,
      sha256: row.sha256,
      bundle_path: bundlePathFor(row.artifactKind),
      synthesized_at: row.synthesizedAt,
      failure_reason: row.failureReason,
    })),
  };
  entries.push({
    name: 'manifest.json',
    data: enc.encode(JSON.stringify(manifest, null, 2)),
  });

  for (const row of artifacts) {
    const payload = {
      id: row.id,
      project_id: row.projectId,
      kind: row.artifactKind,
      format: row.format,
      status: row.synthesisStatus,
      sha256: row.sha256,
      storage_path: row.storagePath,
      inputs_hash: row.inputsHash,
      synthesized_at: row.synthesizedAt,
      failure_reason: row.failureReason,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    };
    entries.push({
      name: bundlePathFor(row.artifactKind),
      data: enc.encode(JSON.stringify(payload, null, 2)),
    });
  }

  // TODO(TB1): fetch sidecar-stored bytes via getSignedUrl + add to entries
  // for kinds 'recommendation_pdf' / 'recommendation_pptx' / *_xlsx etc.

  const zipBytes = buildZip(entries);
  const sha = createHash('sha256').update(zipBytes).digest('hex').slice(0, 12);

  return new NextResponse(new Uint8Array(zipBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="project-${projectId}-bundle.zip"`,
      'Cache-Control': 'no-store',
      'X-Bundle-Sha256-Prefix': sha,
    },
  });
});
