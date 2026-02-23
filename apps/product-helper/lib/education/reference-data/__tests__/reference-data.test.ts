import { describe, it, expect } from '@jest/globals';
import { getIndustryEntities, industryPatterns } from '../industry-patterns';
import { getBudgetStack, budgetStacks } from '../budget-stacks';
import { getMarketPattern, marketPatterns, marketplacePatterns } from '../market-patterns';

describe('Reference Data Utilities', () => {
  // ---------------------------------------------------------------
  // getIndustryEntities
  // ---------------------------------------------------------------
  describe('getIndustryEntities', () => {
    it('returns undefined for undefined industry', () => {
      expect(getIndustryEntities(undefined)).toBeUndefined();
    });

    it('returns undefined for "general" industry', () => {
      expect(getIndustryEntities('general')).toBeUndefined();
    });

    it('returns undefined for unknown industry', () => {
      expect(getIndustryEntities('unknown')).toBeUndefined();
    });

    it('returns healthcare catalog', () => {
      const result = getIndustryEntities('healthcare');
      expect(result).toBeDefined();
      expect(result!.industry).toBe('healthcare');
      expect(result!.entities.length).toBeGreaterThan(0);
      expect(result!.entities.map(e => e.name)).toContain('Patient');
      expect(result!.entities.map(e => e.name)).toContain('Encounter');
      expect(result!.complianceRequirements.length).toBeGreaterThan(0);
      expect(result!.apiPatterns.length).toBeGreaterThan(0);
    });

    it('returns fintech catalog', () => {
      const result = getIndustryEntities('fintech');
      expect(result).toBeDefined();
      expect(result!.industry).toBe('fintech');
      expect(result!.entities.map(e => e.name)).toContain('Account');
      expect(result!.entities.map(e => e.name)).toContain('Transaction');
      expect(result!.entities.map(e => e.name)).toContain('LedgerEntry');
    });

    it('returns education catalog', () => {
      const result = getIndustryEntities('education');
      expect(result).toBeDefined();
      expect(result!.industry).toBe('education');
      expect(result!.entities.map(e => e.name)).toContain('Course');
      expect(result!.entities.map(e => e.name)).toContain('Enrollment');
    });

    it('returns real-estate catalog', () => {
      const result = getIndustryEntities('real-estate');
      expect(result).toBeDefined();
      expect(result!.industry).toBe('real-estate');
      expect(result!.entities.map(e => e.name)).toContain('Property');
      expect(result!.entities.map(e => e.name)).toContain('Listing');
    });

    it('returns automotive catalog', () => {
      const result = getIndustryEntities('automotive');
      expect(result).toBeDefined();
      expect(result!.industry).toBe('automotive');
      expect(result!.entities.map(e => e.name)).toContain('Vehicle');
    });

    it('every entity has required fields', () => {
      for (const [key, catalog] of Object.entries(industryPatterns)) {
        for (const entity of catalog.entities) {
          expect(entity.name).toBeTruthy();
          expect(entity.description).toBeTruthy();
          expect(entity.keyFields.length).toBeGreaterThan(0);
          expect(entity.relationships.length).toBeGreaterThan(0);
        }
      }
    });

    it('healthcare entities have HIPAA compliance requirements', () => {
      const result = getIndustryEntities('healthcare')!;
      const hipaaReqs = result.complianceRequirements.filter(r => r.includes('HIPAA'));
      expect(hipaaReqs.length).toBeGreaterThanOrEqual(3);
    });

    it('fintech entities have PCI-DSS compliance requirements', () => {
      const result = getIndustryEntities('fintech')!;
      const pciReqs = result.complianceRequirements.filter(r => r.includes('PCI-DSS'));
      expect(pciReqs.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ---------------------------------------------------------------
  // getBudgetStack
  // ---------------------------------------------------------------
  describe('getBudgetStack', () => {
    it('returns undefined for undefined budget', () => {
      expect(getBudgetStack(undefined, undefined)).toBeUndefined();
    });

    it('returns undefined for undefined budget with defined stage', () => {
      expect(getBudgetStack(undefined, 'mvp')).toBeUndefined();
    });

    it('returns exact match for bootstrap/idea', () => {
      const result = getBudgetStack('bootstrap', 'idea');
      expect(result).toBeDefined();
      expect(result!.tier).toBe('bootstrap');
      expect(result!.stage).toBe('idea');
      expect(result!.monthlyCost).toBe('$0');
    });

    it('returns exact match for bootstrap/mvp', () => {
      const result = getBudgetStack('bootstrap', 'mvp');
      expect(result).toBeDefined();
      expect(result!.tier).toBe('bootstrap');
      expect(result!.stage).toBe('mvp');
    });

    it('returns exact match for seed/mvp', () => {
      const result = getBudgetStack('seed', 'mvp');
      expect(result).toBeDefined();
      expect(result!.tier).toBe('seed');
      expect(result!.stage).toBe('mvp');
    });

    it('returns exact match for enterprise/mature', () => {
      const result = getBudgetStack('enterprise', 'mature');
      expect(result).toBeDefined();
      expect(result!.tier).toBe('enterprise');
      expect(result!.stage).toBe('mature');
    });

    it('falls back to budget tier when stage not matched', () => {
      // bootstrap + mature — no exact match, should return any bootstrap entry
      const result = getBudgetStack('bootstrap', 'mature');
      expect(result).toBeDefined();
      expect(result!.tier).toBe('bootstrap');
    });

    it('returns a stack even with undefined stage', () => {
      const result = getBudgetStack('seed', undefined);
      expect(result).toBeDefined();
      expect(result!.tier).toBe('seed');
    });

    it('every budget stack has required fields', () => {
      for (const stack of budgetStacks) {
        expect(stack.tier).toBeTruthy();
        expect(stack.stage).toBeTruthy();
        expect(stack.monthlyCost).toBeTruthy();
        expect(Object.keys(stack.stack).length).toBeGreaterThan(0);
        expect(stack.tradeoffs.length).toBeGreaterThan(0);
      }
    });

    it('enterprise stack includes monitoring', () => {
      const result = getBudgetStack('enterprise', 'mature')!;
      expect(result.stack.monitoring).toBeDefined();
    });
  });

  // ---------------------------------------------------------------
  // getMarketPattern
  // ---------------------------------------------------------------
  describe('getMarketPattern', () => {
    it('returns undefined for undefined market', () => {
      expect(getMarketPattern(undefined)).toBeUndefined();
    });

    it('returns undefined for unknown market', () => {
      expect(getMarketPattern('unknown')).toBeUndefined();
    });

    it('returns B2B patterns', () => {
      const result = getMarketPattern('b2b');
      expect(result).toBeDefined();
      expect(result!.market).toBe('b2b');
      expect(result!.authPatterns.length).toBeGreaterThan(0);
      expect(result!.billingPatterns.length).toBeGreaterThan(0);
      expect(result!.architecturePatterns.length).toBeGreaterThan(0);
      expect(result!.keyEntities.length).toBeGreaterThan(0);
    });

    it('B2B includes RBAC and SSO', () => {
      const result = getMarketPattern('b2b')!;
      expect(result.authPatterns.some(p => p.includes('RBAC'))).toBe(true);
      expect(result.authPatterns.some(p => p.includes('SSO'))).toBe(true);
    });

    it('returns B2C patterns', () => {
      const result = getMarketPattern('b2c');
      expect(result).toBeDefined();
      expect(result!.market).toBe('b2c');
      expect(result!.authPatterns.some(p => p.includes('Social auth'))).toBe(true);
    });

    it('returns B2B2C patterns', () => {
      const result = getMarketPattern('b2b2c');
      expect(result).toBeDefined();
      expect(result!.market).toBe('b2b2c');
      expect(result!.authPatterns.some(p => p.includes('White-label'))).toBe(true);
    });

    it('marketplace patterns are defined', () => {
      expect(marketplacePatterns.authPatterns.length).toBeGreaterThan(0);
      expect(marketplacePatterns.billingPatterns.length).toBeGreaterThan(0);
      expect(marketplacePatterns.billingPatterns.some(p => p.includes('Stripe Connect'))).toBe(true);
      expect(marketplacePatterns.keyEntities).toContain('Buyer');
      expect(marketplacePatterns.keyEntities).toContain('Seller');
    });
  });
});
