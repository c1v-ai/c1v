/**
 * discriminator-intake-agent — deterministic-rule-tree coverage.
 *
 * No LLM, no DB. Covers:
 *   - Tier-0 gate routing (2×2 truth table).
 *   - Tier-1 skippable fallbacks — skipped fields get fallback values
 *     AND an audit surface (via computed_constants.tier1SkippedCount).
 *   - Tier-2 inference for every discriminator (D1/D3/D5/D9/D10/D12).
 *   - inference_audit[] covers all 6 Tier-2 ids (enforced by Zod refine).
 *   - pruning_set entries appear for budget / transaction / compliance gates.
 *   - Routing invariants: entry_pattern=existing ⇒ D3=brownfield.
 */

import { describe, it, expect } from '@jest/globals';

import {
  runDiscriminatorIntake,
  deriveTierZeroRoute,
} from '../discriminator-intake-agent';
import type { DiscriminatorIntakeInput } from '../discriminator-intake-agent';

function baseInput(overrides: Partial<DiscriminatorIntakeInput> = {}): DiscriminatorIntakeInput {
  return {
    project_id: 'prj_smoke_001',
    tier_0: { G1_decisions_needed: true, G2_prd_needed: true },
    tier_1: {
      D0_product_archetype: 'SaaS',
      D4_dau_band: '1K-10K',
      D6_industry: 'b2b-saas-agnostic',
      D8_budget_band: '$1-10K',
      D7_transaction_pattern: 'mixed-CRUD',
    },
    entry_pattern: 'new',
    now: () => new Date('2026-04-24T12:00:00Z'),
    ...overrides,
  };
}

describe('deriveTierZeroRoute', () => {
  it('maps G1×G2 truth table correctly', () => {
    expect(deriveTierZeroRoute({ G1_decisions_needed: true, G2_prd_needed: true })).toBe('full');
    expect(deriveTierZeroRoute({ G1_decisions_needed: true, G2_prd_needed: false })).toBe(
      'decisions-only',
    );
    expect(deriveTierZeroRoute({ G1_decisions_needed: false, G2_prd_needed: true })).toBe(
      'prd-only',
    );
    expect(deriveTierZeroRoute({ G1_decisions_needed: false, G2_prd_needed: false })).toBe(
      'browse-only',
    );
  });
});

describe('runDiscriminatorIntake — happy path', () => {
  it('emits a Zod-valid artifact with all required top-level fields', () => {
    const artifact = runDiscriminatorIntake(baseInput());
    expect(artifact._schema).toBe('intake_discriminators.v1');
    expect(artifact.project_id).toBe('prj_smoke_001');
    expect(artifact.tier_0.pipeline_route).toBe('full');
    expect(artifact.asked.D0_product_archetype).toBe('SaaS');
    expect(artifact.inferred.D3_project_type).toBe('greenfield');
    expect(artifact.inference_audit.length).toBeGreaterThanOrEqual(6);
    expect(artifact.created_at).toBe('2026-04-24T12:00:00.000Z');
  });

  it('inference_audit covers every Tier-2 discriminator', () => {
    const artifact = runDiscriminatorIntake(baseInput());
    const ids = new Set(artifact.inference_audit.map((r) => r.discriminator));
    for (const id of ['D1', 'D3', 'D5', 'D9', 'D10', 'D12']) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it('every audit row has sources ≥ 1 and confidence in [0,1]', () => {
    const artifact = runDiscriminatorIntake(baseInput());
    for (const row of artifact.inference_audit) {
      expect(row.sources.length).toBeGreaterThan(0);
      expect(row.confidence).toBeGreaterThanOrEqual(0);
      expect(row.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('computes peakRpsFromDau + monthlyInfraBudgetUsd constants', () => {
    const artifact = runDiscriminatorIntake(baseInput());
    expect(typeof artifact.computed_constants.peakRpsFromDau).toBe('number');
    expect(typeof artifact.computed_constants.monthlyInfraBudgetUsd).toBe('number');
    expect(artifact.computed_constants.dauBandLabel).toBe('1K-10K');
  });
});

describe('runDiscriminatorIntake — Tier-1 skippable fallbacks', () => {
  it('fills missing Tier-1 fields with fallbacks + records skip count', () => {
    const artifact = runDiscriminatorIntake(
      baseInput({ tier_1: { D0_product_archetype: 'E-Commerce' } }),
    );
    expect(artifact.asked.D0_product_archetype).toBe('E-Commerce');
    expect(artifact.asked.D4_dau_band).toBeDefined();
    expect(artifact.asked.D6_industry).toBeDefined();
    expect(artifact.asked.D7_transaction_pattern).toBeDefined();
    expect(artifact.asked.D8_budget_band).toBeDefined();
    expect(artifact.computed_constants.tier1SkippedCount).toBe(4);
  });

  it('uses company_signals.industry to fill D6 when user skipped', () => {
    const artifact = runDiscriminatorIntake(
      baseInput({
        tier_1: {
          D0_product_archetype: 'SaaS',
          D4_dau_band: '1K-10K',
          D8_budget_band: '$1-10K',
          D7_transaction_pattern: 'mixed-CRUD',
        },
        company_signals: { industry: 'healthcare', scraped_at: '2026-04-24T10:00:00Z' },
      }),
    );
    expect(artifact.asked.D6_industry).toBe('medical-healthcare');
  });

  it('uses company_signals.funding_stage to fill D8 when user skipped', () => {
    const artifact = runDiscriminatorIntake(
      baseInput({
        tier_1: {
          D0_product_archetype: 'SaaS',
          D4_dau_band: '1K-10K',
          D6_industry: 'b2b-saas-agnostic',
          D7_transaction_pattern: 'mixed-CRUD',
        },
        company_signals: { funding_stage: 'Seed' },
      }),
    );
    expect(artifact.asked.D8_budget_band).toBe('$100-1K');
  });
});

describe('runDiscriminatorIntake — Tier-2 inference', () => {
  it('D3=brownfield when entry_pattern=existing', () => {
    const artifact = runDiscriminatorIntake(baseInput({ entry_pattern: 'existing' }));
    expect(artifact.inferred.D3_project_type).toBe('brownfield');
  });

  it('D3=greenfield for new/exploring', () => {
    const newArt = runDiscriminatorIntake(baseInput({ entry_pattern: 'new' }));
    const explArt = runDiscriminatorIntake(baseInput({ entry_pattern: 'exploring' }));
    expect(newArt.inferred.D3_project_type).toBe('greenfield');
    expect(explArt.inferred.D3_project_type).toBe('greenfield');
  });

  it('D1 from employee_count_band when provided (higher confidence)', () => {
    const artifact = runDiscriminatorIntake(
      baseInput({ company_signals: { employee_count_band: '51-200' } }),
    );
    const d1Row = artifact.inference_audit.find((r) => r.discriminator === 'D1');
    expect(d1Row?.inferred_value).toBe('51-200');
    expect(d1Row?.confidence).toBeGreaterThan(0.8);
  });

  it('D1 falls back to D8 proxy when no company_signals (lower confidence)', () => {
    const artifact = runDiscriminatorIntake(baseInput());
    const d1Row = artifact.inference_audit.find((r) => r.discriminator === 'D1');
    expect(d1Row?.confidence).toBeLessThan(0.7);
    expect(d1Row?.sources[0]).toMatch(/^D8=/);
  });

  it('D12=PHI when industry=medical-healthcare', () => {
    const artifact = runDiscriminatorIntake(
      baseInput({
        tier_1: {
          D0_product_archetype: 'SaaS',
          D4_dau_band: '1K-10K',
          D6_industry: 'medical-healthcare',
          D8_budget_band: '$10-100K',
          D7_transaction_pattern: 'mixed-CRUD',
        },
      }),
    );
    expect(artifact.inferred.D12_data_sensitivity).toBe('PHI');
  });
});

describe('runDiscriminatorIntake — pruning_set', () => {
  it('prunes expensive DB tiers when budget is tight', () => {
    const artifact = runDiscriminatorIntake(
      baseInput({
        tier_1: {
          D0_product_archetype: 'SaaS',
          D4_dau_band: '1K-10K',
          D6_industry: 'b2b-saas-agnostic',
          D8_budget_band: '<$100',
          D7_transaction_pattern: 'mixed-CRUD',
        },
      }),
    );
    const dbEntry = artifact.pruning_set.find((p) => p.decision_id === 'database-choice');
    expect(dbEntry).toBeDefined();
    expect(dbEntry?.removed_alternatives).toContain('aurora-multi-region');
    expect(dbEntry?.rationale).toMatch(/D8=/);
  });

  it('prunes multi-region for small DAU', () => {
    const artifact = runDiscriminatorIntake(
      baseInput({
        tier_1: {
          D0_product_archetype: 'SaaS',
          D4_dau_band: '<100',
          D6_industry: 'b2b-saas-agnostic',
          D8_budget_band: '$1-10K',
          D7_transaction_pattern: 'mixed-CRUD',
        },
      }),
    );
    const region = artifact.pruning_set.find((p) => p.decision_id === 'region-strategy');
    expect(region).toBeDefined();
    expect(region?.removed_alternatives).toContain('multi-region-active-active');
  });

  it('prunes non-BAA regions when D12=PHI (healthcare)', () => {
    const artifact = runDiscriminatorIntake(
      baseInput({
        tier_1: {
          D0_product_archetype: 'SaaS',
          D4_dau_band: '10K-100K',
          D6_industry: 'medical-healthcare',
          D8_budget_band: '$10-100K',
          D7_transaction_pattern: 'mixed-CRUD',
        },
      }),
    );
    const cloud = artifact.pruning_set.find((p) => p.decision_id === 'cloud-region');
    expect(cloud).toBeDefined();
    expect(cloud?.removed_alternatives).toContain('public-region-non-baa');
  });

  it('each pruning entry carries non-empty removed_alternatives + rationale', () => {
    const artifact = runDiscriminatorIntake(
      baseInput({
        tier_1: {
          D0_product_archetype: 'SaaS',
          D4_dau_band: '<100',
          D6_industry: 'b2b-saas-agnostic',
          D8_budget_band: '<$100',
          D7_transaction_pattern: 'real-time',
        },
      }),
    );
    for (const entry of artifact.pruning_set) {
      expect(entry.removed_alternatives.length).toBeGreaterThan(0);
      expect(entry.rationale.length).toBeGreaterThan(0);
      expect(entry.decision_id.length).toBeGreaterThan(0);
    }
  });
});

describe('runDiscriminatorIntake — refine guards', () => {
  it('route mismatch throws ZodError (refine fires)', () => {
    // We can only observe this indirectly: agent derives the route,
    // so refine should never fire on agent output. Verify by tampering.
    const artifact = runDiscriminatorIntake(baseInput());
    expect(() =>
      // Re-validate with a mutated route to prove the refine works.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../../../schemas/module-0/intake-discriminators').intakeDiscriminatorsSchema.parse({
        ...artifact,
        tier_0: { ...artifact.tier_0, pipeline_route: 'browse-only' },
      }),
    ).toThrow();
  });
});
