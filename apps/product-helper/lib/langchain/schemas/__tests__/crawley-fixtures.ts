/**
 * Shared fixture helpers for Crawley round-trip tests (REQUIREMENTS-crawley §7).
 *
 * @module lib/langchain/schemas/__tests__/crawley-fixtures
 */

export function envelope(schemaId: string, outputPath: string, phaseNumber = 1) {
  return {
    _schema: schemaId,
    _output_path: outputPath,
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: phaseNumber,
      phase_slug: 'crawley-fixture',
      phase_name: 'Crawley Fixture',
      schema_version: '1.0.0',
      project_id: 1,
      project_name: 'Crawley Test',
      author: 'crawley-schemas-test',
      generated_at: '2026-04-27T00:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

export function roundTrip<T>(parsed: T): T {
  return JSON.parse(JSON.stringify(parsed)) as T;
}
