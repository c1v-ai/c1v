import { describe, it, expect } from '@jest/globals';
import { CRAWLEY_SCHEMAS, CRAWLEY_MATRIX_KEYSTONE } from '../index';

describe('CRAWLEY_SCHEMAS registry (REQUIREMENTS-crawley §1)', () => {
  it('contains exactly 10 phase-artifact schemas (REQUIREMENTS-crawley §1)', () => {
    // §1 table = 10 schemas. The 11th deliverable is the matrix keystone,
    // which is a primitive (CRAWLEY_MATRIX_KEYSTONE), not a phase artifact.
    expect(CRAWLEY_SCHEMAS).toHaveLength(10);
  });

  it('combined with the matrix keystone covers all 11 Crawley deliverables', () => {
    expect(CRAWLEY_SCHEMAS.length + 1).toBe(11);
    expect(CRAWLEY_MATRIX_KEYSTONE).toBeDefined();
  });

  it('has no duplicate schema IDs', () => {
    const ids = CRAWLEY_SCHEMAS.map((e) => e.schemaId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('has no duplicate source paths', () => {
    const paths = CRAWLEY_SCHEMAS.map((e) => e.sourcePath);
    const unique = new Set(paths);
    expect(unique.size).toBe(paths.length);
  });

  it('keystone schema id is distinct from registry entries', () => {
    const ids = new Set(CRAWLEY_SCHEMAS.map((e) => e.schemaId));
    expect(ids.has(CRAWLEY_MATRIX_KEYSTONE.schemaId)).toBe(false);
  });

  it('every entry references a real Zod schema', () => {
    for (const entry of CRAWLEY_SCHEMAS) {
      expect(entry.zodSchema).toBeDefined();
      // Sanity: zodSchema must have a parse method.
      expect(typeof (entry.zodSchema as { parse?: unknown }).parse).toBe('function');
    }
  });
});
