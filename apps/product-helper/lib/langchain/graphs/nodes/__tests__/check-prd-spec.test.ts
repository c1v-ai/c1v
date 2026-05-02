// env stubs MUST be the very first lines before any import.
// lib/config/env.ts validates shape at import time.
process.env.POSTGRES_URL ??= 'postgres://stub';
process.env.AUTH_SECRET ??= 'stub-auth-secret-at-least-32-chars-0000';
process.env.STRIPE_SECRET_KEY ??= 'sk_test_stub';
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_stub';
process.env.OPENROUTER_API_KEY ??= 'sk-or-stub';
process.env.BASE_URL ??= 'http://localhost:3000';

import { describe, it, expect } from '@jest/globals';
// transformToValidationData is NOT exported from check-prd-spec.ts today.
// Plan 03 will add the `export` keyword. Until then this import fails (RED).
// Once the export exists, Tests 1 and 3 still fail until the mapping fix lands.
import { transformToValidationData } from '../check-prd-spec';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function buildState(
  overrides: Partial<{ outOfScope: string[]; inScope: string[]; internal: string[] }> = {},
) {
  return {
    projectId: 1,
    projectName: 'Test',
    projectVision: 'Test vision',
    completeness: 50,
    extractedData: {
      actors: [],
      useCases: [],
      dataEntities: [],
      systemBoundaries: {
        internal: overrides.internal ?? ['Token generation', 'Auth registry'],
        external: ['Certificate Authority'],
        inScope: overrides.inScope,       // optional — may be undefined
        outOfScope: overrides.outOfScope, // optional — may be undefined
      },
    },
  } as any;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('transformToValidationData', () => {
  // TEST 1 — RED (INTK-03): Real outOfScope data is mapped when present.
  // FAILS before fix: result.systemBoundaries.outOfScope is [] (hardcoded).
  it('maps real outOfScope array when extractedData.systemBoundaries.outOfScope is populated', () => {
    const state = buildState({ outOfScope: ['Mobile clients', 'Billing integration'] });
    const result = transformToValidationData(state);
    expect(result.systemBoundaries.outOfScope).toEqual(['Mobile clients', 'Billing integration']);
  });

  // TEST 2 — GREEN (backward compat): outOfScope defaults to [] when absent.
  // Passes before and after fix.
  it('defaults outOfScope to [] when extractedData.systemBoundaries.outOfScope is undefined', () => {
    const state = buildState(); // no outOfScope override
    const result = transformToValidationData(state);
    expect(result.systemBoundaries.outOfScope).toEqual([]);
  });

  // TEST 3 — RED (INTK-03): Explicit inScope data is preferred over internal.
  // FAILS before fix: inScope is mapped from internal = ['Token generation'].
  it('maps explicit inScope array when present instead of internal', () => {
    const state = buildState({ inScope: ['User profile', 'Auth flow'], internal: ['Token generation'] });
    const result = transformToValidationData(state);
    expect(result.systemBoundaries.inScope).toEqual(['User profile', 'Auth flow']);
  });

  // TEST 4 — GREEN (backward compat): inScope falls back to internal when absent.
  // Passes before and after fix (internal is the correct fallback).
  it('falls back to internal for inScope when extractedData.systemBoundaries.inScope is undefined', () => {
    const state = buildState({ internal: ['Token generation', 'Auth registry'] });
    const result = transformToValidationData(state);
    expect(result.systemBoundaries.inScope).toEqual(['Token generation', 'Auth registry']);
  });
});
