import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the shared drizzle instance so the reader works against an injected
// fake client — we never hit a real database in unit tests.
jest.mock('@/lib/db/drizzle', () => ({
  db: {},
}));

import {
  ArtifactReader,
  ArtifactValidationError,
  type DrizzleClient,
} from '../artifact-reader';
import type { ModuleRef } from '../../schemas/engines/engine';

// ─────────────────────────────────────────────────────────────────────────
// In-memory Drizzle double. Only what ArtifactReader actually calls:
// db.query.projectData.findFirst({ where: ... }) → row | undefined
// ─────────────────────────────────────────────────────────────────────────

function makeDbDouble(row: Record<string, unknown> | undefined) {
  const findFirst = jest.fn<() => Promise<Record<string, unknown> | undefined>>();
  findFirst.mockResolvedValue(row);
  return {
    query: {
      projectData: {
        findFirst,
      },
    },
  } as unknown as DrizzleClient;
}

// Valid Phase-0 ingest payload matching phase0Schema (extends phaseEnvelopeSchema).
const validPhase0 = {
  _schema: 'module-2.phase-0-ingest.v1',
  _output_path: '/artifacts/phase-0.json',
  _phase_status: 'complete',
  metadata: {
    phase_number: 0,
    phase_slug: 'phase-0-ingest',
    phase_name: 'Phase 0 — Ingest Module 1 Scope',
    schema_version: '1.0.0',
    project_id: 42,
    project_name: 'Fixture Project',
    author: 'test-fixture',
    generated_at: '2026-04-21T00:00:00.000Z',
    generator: 'product-helper-tests@0.1.0',
    revision: 0,
  },
  intake_summary: 'Ingested scope from fixture.',
  carried_constants: [
    { name: 'COMPLIANCE_REGIME', value: 'PCI-DSS', unit: undefined },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────

describe('ArtifactReader', () => {
  let db: DrizzleClient;
  let reader: ArtifactReader;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty result when no refs requested', async () => {
    db = makeDbDouble(undefined);
    reader = new ArtifactReader({ db });
    const result = await reader.fetch(1, []);
    expect(result.artifacts).toEqual({});
    expect(result.missing_inputs).toEqual([]);
    expect(result.validation_errors).toEqual([]);
  });

  it('records missing_inputs when project has no project_data row', async () => {
    db = makeDbDouble(undefined);
    reader = new ArtifactReader({ db });
    const refs: ModuleRef[] = [
      { module: 'module-2', phase_slug: 'phase-0-ingest' },
    ];
    const result = await reader.fetch(42, refs);
    expect(result.artifacts).toEqual({});
    expect(result.missing_inputs).toEqual(refs);
  });

  it('records missing_inputs when ref has no registered schema or landing path', async () => {
    db = makeDbDouble({ intakeState: {} });
    reader = new ArtifactReader({ db });
    // module-5 has neither schema registry nor landing path
    const refs: ModuleRef[] = [
      { module: 'module-5', phase_slug: 'phase-1-anything' },
    ];
    const result = await reader.fetch(1, refs);
    expect(result.missing_inputs).toEqual(refs);
    expect(result.artifacts).toEqual({});
  });

  it('records missing_inputs when JSONB path is not written yet', async () => {
    db = makeDbDouble({ intakeState: { kbStepData: {} } });
    reader = new ArtifactReader({ db });
    const refs: ModuleRef[] = [
      { module: 'module-2', phase_slug: 'phase-0-ingest' },
    ];
    const result = await reader.fetch(1, refs);
    expect(result.missing_inputs).toEqual(refs);
  });

  it('returns validated artifact on happy path', async () => {
    db = makeDbDouble({
      intakeState: {
        kbStepData: {
          'phase-0-ingest': validPhase0,
        },
      },
    });
    reader = new ArtifactReader({ db });
    const result = await reader.fetch(1, [
      { module: 'module-2', phase_slug: 'phase-0-ingest' },
    ]);
    expect(result.missing_inputs).toEqual([]);
    expect(result.artifacts['module-2/phase-0-ingest']).toBeDefined();
    const artifact = result.artifacts['module-2/phase-0-ingest'] as typeof validPhase0;
    expect(artifact.carried_constants[0].name).toBe('COMPLIANCE_REGIME');
    expect(artifact.carried_constants[0].value).toBe('PCI-DSS');
    expect(artifact.intake_summary).toBe('Ingested scope from fixture.');
  });

  it('throws ArtifactValidationError when present artifact violates its schema', async () => {
    const corrupted = { ...validPhase0, _phase_status: 'not-a-valid-status' };
    db = makeDbDouble({
      intakeState: {
        kbStepData: {
          'phase-0-ingest': corrupted,
        },
      },
    });
    reader = new ArtifactReader({ db });
    await expect(
      reader.fetch(1, [
        { module: 'module-2', phase_slug: 'phase-0-ingest' },
      ]),
    ).rejects.toThrow(ArtifactValidationError);
  });

  it('validates the ModuleRef input boundary', async () => {
    db = makeDbDouble({});
    reader = new ArtifactReader({ db });
    // @ts-expect-error — intentionally invalid module slug
    await expect(reader.fetch(1, [{ module: 'not-a-module', phase_slug: 'x' }]))
      .rejects.toThrow();
  });

  it('landing-path registry covers all registered M2/M3/M4 schemas', () => {
    const paths = ArtifactReader._landingPaths();
    expect(paths['module-2']).toBeDefined();
    expect(paths['module-2']!.has('phase-0-ingest')).toBe(true);
    expect(paths['module-3']).toBeDefined();
    expect(paths['module-3']!.has('phase-0a-ingest-m2-handoff')).toBe(true);
    expect(paths['module-4']).toBeDefined();
    expect(paths['module-4']!.has('phase-1-dm-envelope')).toBe(true);
  });
});
