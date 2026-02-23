import { describe, it, expect } from '@jest/globals';
import {
  getSchemaKnowledge,
  getTechStackKnowledge,
  getAPISpecKnowledge,
  getInfrastructureKnowledge,
  getCodingStandardsKnowledge,
  getUserStoriesKnowledge,
} from '../generator-kb';
import type { KBProjectContext } from '../reference-data/types';

// Rough token estimate: 1 token ≈ 4 characters (conservative for English text)
const estimateTokens = (text: string): number => Math.ceil(text.length / 4);
const TOKEN_CEILING = 2500;

describe('Generator KB Functions', () => {
  // ---------------------------------------------------------------
  // getSchemaKnowledge
  // ---------------------------------------------------------------
  describe('getSchemaKnowledge', () => {
    it('returns generic content when no context provided', () => {
      const result = getSchemaKnowledge();
      expect(result).toContain('Entity Discovery');
      expect(result).toContain('Domain Entity Patterns by Project Type');
      expect(result).toContain('PostgreSQL 18');
      expect(result).toContain('Multi-Tenancy (B2B SaaS Default)');
      expect(result).not.toContain('Industry Entity Catalog');
    });

    it('returns healthcare entities when industry is healthcare', () => {
      const ctx: Partial<KBProjectContext> = { industry: 'healthcare' };
      const result = getSchemaKnowledge(ctx);
      expect(result).toContain('Industry Entity Catalog (healthcare)');
      expect(result).toContain('Patient');
      expect(result).toContain('Encounter');
      expect(result).toContain('Industry Schema Snippets');
      // Generic project type list should NOT appear
      expect(result).not.toContain('Domain Entity Patterns by Project Type');
    });

    it('returns fintech entities when industry is fintech', () => {
      const ctx: Partial<KBProjectContext> = { industry: 'fintech' };
      const result = getSchemaKnowledge(ctx);
      expect(result).toContain('Industry Entity Catalog (fintech)');
      expect(result).toContain('Account');
      expect(result).toContain('LedgerEntry');
    });

    it('returns generic content when industry is general', () => {
      const ctx: Partial<KBProjectContext> = { industry: 'general' };
      const result = getSchemaKnowledge(ctx);
      expect(result).toContain('Domain Entity Patterns by Project Type');
      expect(result).not.toContain('Industry Entity Catalog');
    });

    it('includes multi-tenancy RLS for B2B market', () => {
      const ctx: Partial<KBProjectContext> = { market: 'b2b' };
      const result = getSchemaKnowledge(ctx);
      expect(result).toContain('Multi-Tenancy (Required for B2B)');
      expect(result).toContain('ROW LEVEL SECURITY');
      expect(result).toContain('audit_logs');
    });

    it('includes multi-tenancy RLS for B2B2C market', () => {
      const ctx: Partial<KBProjectContext> = { market: 'b2b2c' };
      const result = getSchemaKnowledge(ctx);
      expect(result).toContain('Multi-Tenancy (Required for B2B)');
    });

    it('includes vector embedding section for AI products', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'ai-product' };
      const result = getSchemaKnowledge(ctx);
      expect(result).toContain('Vector Embeddings (AI Product)');
      expect(result).toContain('document_chunks');
      expect(result).toContain('hnsw');
    });

    it('does not include vector section for non-AI products', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'saas' };
      const result = getSchemaKnowledge(ctx);
      expect(result).not.toContain('Vector Embeddings (AI Product)');
    });

    it('combines multiple context dimensions', () => {
      const ctx: Partial<KBProjectContext> = {
        industry: 'healthcare',
        market: 'b2b',
        projectType: 'ai-product',
      };
      const result = getSchemaKnowledge(ctx);
      expect(result).toContain('Industry Entity Catalog (healthcare)');
      expect(result).toContain('Multi-Tenancy (Required for B2B)');
      expect(result).toContain('Vector Embeddings (AI Product)');
    });

    it('stays under token ceiling', () => {
      // Test with the most context-rich combination
      const ctx: Partial<KBProjectContext> = {
        industry: 'healthcare',
        market: 'b2b',
        projectType: 'ai-product',
      };
      const result = getSchemaKnowledge(ctx);
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });

    it('stays under token ceiling with no context', () => {
      const result = getSchemaKnowledge();
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });
  });

  // ---------------------------------------------------------------
  // getTechStackKnowledge
  // ---------------------------------------------------------------
  describe('getTechStackKnowledge', () => {
    it('returns generic stacks when no context provided', () => {
      const result = getTechStackKnowledge();
      expect(result).toContain('Tech Stack Selection');
      expect(result).toContain('Frontend Framework Selection');
      expect(result).toContain('Recommended Stacks by Project Type');
      expect(result).toContain('Tailwind CSS v4');
    });

    it('returns budget-specific stack for bootstrap/idea', () => {
      const ctx: Partial<KBProjectContext> = { budget: 'bootstrap', stage: 'idea' };
      const result = getTechStackKnowledge(ctx);
      expect(result).toContain('Recommended Stack');
      expect(result).toContain('$0');
      expect(result).not.toContain('Recommended Stacks by Project Type');
    });

    it('returns budget-specific stack for seed/mvp', () => {
      const ctx: Partial<KBProjectContext> = { budget: 'seed', stage: 'mvp' };
      const result = getTechStackKnowledge(ctx);
      expect(result).toContain('Recommended Stack');
      expect(result).toContain('seed');
    });

    it('returns budget-specific stack for enterprise/mature', () => {
      const ctx: Partial<KBProjectContext> = { budget: 'enterprise', stage: 'mature' };
      const result = getTechStackKnowledge(ctx);
      expect(result).toContain('Recommended Stack');
      expect(result).toContain('enterprise');
    });

    it('falls back to budget tier when exact stage not found', () => {
      // 'bootstrap' + 'mature' — no exact match, should fall back to first bootstrap entry
      const ctx: Partial<KBProjectContext> = { budget: 'bootstrap', stage: 'mature' };
      const result = getTechStackKnowledge(ctx);
      expect(result).toContain('Recommended Stack');
    });

    it('includes market patterns for B2B', () => {
      const ctx: Partial<KBProjectContext> = { market: 'b2b' };
      const result = getTechStackKnowledge(ctx);
      expect(result).toContain('B2B Architecture Patterns');
      expect(result).toContain('Auth:');
      expect(result).toContain('Billing:');
    });

    it('includes market patterns for B2C', () => {
      const ctx: Partial<KBProjectContext> = { market: 'b2c' };
      const result = getTechStackKnowledge(ctx);
      expect(result).toContain('B2C Architecture Patterns');
    });

    it('stays under token ceiling', () => {
      const ctx: Partial<KBProjectContext> = {
        budget: 'enterprise',
        stage: 'mature',
        market: 'b2b',
      };
      const result = getTechStackKnowledge(ctx);
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });

    it('stays under token ceiling with no context', () => {
      const result = getTechStackKnowledge();
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });
  });

  // ---------------------------------------------------------------
  // getAPISpecKnowledge
  // ---------------------------------------------------------------
  describe('getAPISpecKnowledge', () => {
    it('returns generic content when no context provided', () => {
      const result = getAPISpecKnowledge();
      expect(result).toContain('API Specification Patterns');
      expect(result).toContain('REST Endpoint Naming Rules');
      expect(result).toContain('HTTP Method Semantics');
      expect(result).toContain('OpenAPI 3.2');
      expect(result).not.toContain('Industry API Patterns');
      expect(result).not.toContain('Marketplace Payment API');
    });

    it('includes healthcare API patterns', () => {
      const ctx: Partial<KBProjectContext> = { industry: 'healthcare' };
      const result = getAPISpecKnowledge(ctx);
      expect(result).toContain('Industry API Patterns (healthcare)');
      expect(result).toContain('/patients');
    });

    it('includes fintech API patterns', () => {
      const ctx: Partial<KBProjectContext> = { industry: 'fintech' };
      const result = getAPISpecKnowledge(ctx);
      expect(result).toContain('Industry API Patterns (fintech)');
      expect(result).toContain('idempotency');
    });

    it('includes marketplace payment patterns', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'marketplace' };
      const result = getAPISpecKnowledge(ctx);
      expect(result).toContain('Marketplace Payment API Patterns');
      expect(result).toContain('Stripe Connect');
      expect(result).toContain('escrow');
    });

    it('does not include marketplace patterns for non-marketplace', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'saas' };
      const result = getAPISpecKnowledge(ctx);
      expect(result).not.toContain('Marketplace Payment API');
    });

    it('stays under token ceiling', () => {
      const ctx: Partial<KBProjectContext> = {
        industry: 'healthcare',
        projectType: 'marketplace',
      };
      const result = getAPISpecKnowledge(ctx);
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });

    it('stays under token ceiling with no context', () => {
      const result = getAPISpecKnowledge();
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });
  });

  // ---------------------------------------------------------------
  // getInfrastructureKnowledge
  // ---------------------------------------------------------------
  describe('getInfrastructureKnowledge', () => {
    it('returns generic security checklist when no context provided', () => {
      const result = getInfrastructureKnowledge();
      expect(result).toContain('Infrastructure Patterns');
      expect(result).toContain('Hosting by Project Stage');
      expect(result).toContain('Security Checklist (Day 1)');
      expect(result).toContain('HTTPS everywhere');
      expect(result).not.toContain('Compliance Requirements');
    });

    it('returns HIPAA compliance for healthcare', () => {
      const ctx: Partial<KBProjectContext> = { industry: 'healthcare' };
      const result = getInfrastructureKnowledge(ctx);
      expect(result).toContain('Compliance Requirements (healthcare)');
      expect(result).toContain('HIPAA');
      expect(result).not.toContain('Security Checklist (Day 1)');
    });

    it('returns PCI-DSS compliance for fintech', () => {
      const ctx: Partial<KBProjectContext> = { industry: 'fintech' };
      const result = getInfrastructureKnowledge(ctx);
      expect(result).toContain('Compliance Requirements (fintech)');
      expect(result).toContain('PCI-DSS');
    });

    it('returns generic checklist for general industry', () => {
      const ctx: Partial<KBProjectContext> = { industry: 'general' };
      const result = getInfrastructureKnowledge(ctx);
      expect(result).toContain('Security Checklist (Day 1)');
      expect(result).not.toContain('Compliance Requirements');
    });

    it('includes AI-ready infra for AI products', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'ai-product' };
      const result = getInfrastructureKnowledge(ctx);
      expect(result).toContain('AI-Ready Infrastructure');
      expect(result).toContain('pgvector');
      expect(result).toContain('LLM gateway');
    });

    it('does not include AI infra for non-AI products', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'saas' };
      const result = getInfrastructureKnowledge(ctx);
      expect(result).not.toContain('AI-Ready Infrastructure');
    });

    it('includes self-hosting guidance for growth stage', () => {
      const ctx: Partial<KBProjectContext> = { stage: 'growth' };
      const result = getInfrastructureKnowledge(ctx);
      expect(result).toContain('Self-Hosting Option');
      expect(result).toContain('Coolify');
    });

    it('includes self-hosting guidance for bootstrap budget', () => {
      const ctx: Partial<KBProjectContext> = { budget: 'bootstrap' };
      const result = getInfrastructureKnowledge(ctx);
      expect(result).toContain('Self-Hosting Option');
    });

    it('does not include self-hosting for idea stage without bootstrap budget', () => {
      const ctx: Partial<KBProjectContext> = { stage: 'idea', budget: 'seed' };
      const result = getInfrastructureKnowledge(ctx);
      expect(result).not.toContain('Self-Hosting Option');
    });

    it('stays under token ceiling', () => {
      const ctx: Partial<KBProjectContext> = {
        industry: 'healthcare',
        projectType: 'ai-product',
        stage: 'growth',
      };
      const result = getInfrastructureKnowledge(ctx);
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });

    it('stays under token ceiling with no context', () => {
      const result = getInfrastructureKnowledge();
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });
  });

  // ---------------------------------------------------------------
  // getCodingStandardsKnowledge
  // ---------------------------------------------------------------
  describe('getCodingStandardsKnowledge', () => {
    it('returns generic standards when no context provided', () => {
      const result = getCodingStandardsKnowledge();
      expect(result).toContain('Coding Standards & Conventions');
      expect(result).toContain('Naming Conventions');
      expect(result).toContain('Biome v2.3');
      expect(result).toContain('Standards by Project Type');
    });

    it('includes B2B-specific standards for B2B market', () => {
      const ctx: Partial<KBProjectContext> = { market: 'b2b' };
      const result = getCodingStandardsKnowledge(ctx);
      expect(result).toContain('B2B-Specific Standards');
      expect(result).toContain('Audit logging');
      expect(result).toContain('API versioning');
    });

    it('does not include B2B standards for B2C market', () => {
      const ctx: Partial<KBProjectContext> = { market: 'b2c' };
      const result = getCodingStandardsKnowledge(ctx);
      expect(result).not.toContain('B2B-Specific Standards');
    });

    it('includes open-source conventions', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'open-source' };
      const result = getCodingStandardsKnowledge(ctx);
      expect(result).toContain('Open-Source Conventions');
      expect(result).toContain('CONTRIBUTING.md');
      expect(result).toContain('semver');
      expect(result).not.toContain('Standards by Project Type');
    });

    it('includes API platform standards', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'api-platform' };
      const result = getCodingStandardsKnowledge(ctx);
      expect(result).toContain('API Platform Standards');
      expect(result).toContain('OpenAPI-first');
      expect(result).toContain('Scalar');
      expect(result).not.toContain('Standards by Project Type');
    });

    it('returns generic project type standards for other types', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'saas' };
      const result = getCodingStandardsKnowledge(ctx);
      expect(result).toContain('Standards by Project Type');
      expect(result).not.toContain('Open-Source Conventions');
      expect(result).not.toContain('API Platform Standards');
    });

    it('stays under token ceiling', () => {
      const ctx: Partial<KBProjectContext> = {
        market: 'b2b',
        projectType: 'open-source',
      };
      const result = getCodingStandardsKnowledge(ctx);
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });

    it('stays under token ceiling with no context', () => {
      const result = getCodingStandardsKnowledge();
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });
  });

  // ---------------------------------------------------------------
  // getUserStoriesKnowledge
  // ---------------------------------------------------------------
  describe('getUserStoriesKnowledge', () => {
    it('returns generic content when no context provided', () => {
      const result = getUserStoriesKnowledge();
      expect(result).toContain('User Story Patterns');
      expect(result).toContain('Story Format');
      expect(result).toContain('Acceptance Criteria');
      expect(result).toContain('Story Sizing');
      expect(result).toContain('Example Stories (Generic SaaS)');
      expect(result).toContain('Epic Grouping (General)');
      expect(result).toContain('Undesired Stories');
    });

    it('includes healthcare story catalog', () => {
      const ctx: Partial<KBProjectContext> = { industry: 'healthcare' };
      const result = getUserStoriesKnowledge(ctx);
      expect(result).toContain('Healthcare Story Catalog');
      expect(result).toContain('Doctor');
      expect(result).toContain('medication history');
      expect(result).toContain('Healthcare Epics');
      expect(result).not.toContain('Example Stories (Generic SaaS)');
    });

    it('includes fintech story catalog', () => {
      const ctx: Partial<KBProjectContext> = { industry: 'fintech' };
      const result = getUserStoriesKnowledge(ctx);
      expect(result).toContain('Fintech Story Catalog');
      expect(result).toContain('transactions categorized');
      expect(result).toContain('Fintech Epics');
    });

    it('includes e-commerce story catalog for e-commerce type', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'e-commerce' };
      const result = getUserStoriesKnowledge(ctx);
      expect(result).toContain('E-Commerce / Marketplace Story Catalog');
      expect(result).toContain('Seller');
    });

    it('includes e-commerce story catalog for marketplace type', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'marketplace' };
      const result = getUserStoriesKnowledge(ctx);
      expect(result).toContain('E-Commerce / Marketplace Story Catalog');
    });

    it('includes SaaS epic grouping for SaaS type', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'saas' };
      const result = getUserStoriesKnowledge(ctx);
      expect(result).toContain('SaaS Epic Grouping');
      expect(result).toContain('Billing & Subscription');
    });

    it('includes marketplace epic grouping for marketplace type', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'marketplace' };
      const result = getUserStoriesKnowledge(ctx);
      expect(result).toContain('Marketplace Epic Grouping');
      expect(result).toContain('Dispute Resolution');
    });

    it('includes mobile epic grouping for mobile type', () => {
      const ctx: Partial<KBProjectContext> = { projectType: 'mobile' };
      const result = getUserStoriesKnowledge(ctx);
      expect(result).toContain('Mobile Epic Grouping');
      expect(result).toContain('Offline Mode');
    });

    it('stays under token ceiling', () => {
      const ctx: Partial<KBProjectContext> = {
        industry: 'healthcare',
        projectType: 'saas',
      };
      const result = getUserStoriesKnowledge(ctx);
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });

    it('stays under token ceiling with no context', () => {
      const result = getUserStoriesKnowledge();
      expect(estimateTokens(result)).toBeLessThan(TOKEN_CEILING);
    });
  });

  // ---------------------------------------------------------------
  // Token Budget Summary (all functions × all contexts)
  // ---------------------------------------------------------------
  describe('token budget compliance', () => {
    const industries: (KBProjectContext['industry'] | undefined)[] = [
      undefined, 'healthcare', 'fintech', 'education', 'real-estate', 'automotive', 'general',
    ];
    const markets: (KBProjectContext['market'] | undefined)[] = [undefined, 'b2b', 'b2c', 'b2b2c'];
    const projectTypes: (KBProjectContext['projectType'] | undefined)[] = [
      undefined, 'saas', 'marketplace', 'mobile', 'api-platform', 'ai-product', 'e-commerce', 'internal-tool', 'open-source',
    ];
    const budgets: (KBProjectContext['budget'] | undefined)[] = [undefined, 'bootstrap', 'seed', 'series-a', 'enterprise'];
    const stages: (KBProjectContext['stage'] | undefined)[] = [undefined, 'idea', 'mvp', 'growth', 'mature'];

    const kbFunctions = [
      { name: 'getSchemaKnowledge', fn: getSchemaKnowledge },
      { name: 'getTechStackKnowledge', fn: getTechStackKnowledge },
      { name: 'getAPISpecKnowledge', fn: getAPISpecKnowledge },
      { name: 'getInfrastructureKnowledge', fn: getInfrastructureKnowledge },
      { name: 'getCodingStandardsKnowledge', fn: getCodingStandardsKnowledge },
      { name: 'getUserStoriesKnowledge', fn: getUserStoriesKnowledge },
    ];

    // Test representative combinations (not full cartesian product — that would be 6,300 cases)
    const representativeCombinations: Partial<KBProjectContext>[] = [
      {},
      { industry: 'healthcare', market: 'b2b', projectType: 'ai-product', budget: 'enterprise', stage: 'mature' },
      { industry: 'fintech', market: 'b2c', projectType: 'saas', budget: 'seed', stage: 'mvp' },
      { industry: 'education', market: 'b2b2c', projectType: 'marketplace', budget: 'bootstrap', stage: 'growth' },
      { industry: 'automotive', projectType: 'internal-tool' },
      { industry: 'real-estate', market: 'b2c' },
      { projectType: 'open-source', budget: 'bootstrap', stage: 'idea' },
      { projectType: 'api-platform', market: 'b2b', budget: 'series-a' },
      { industry: 'general', market: 'b2b', projectType: 'e-commerce' },
    ];

    for (const { name, fn } of kbFunctions) {
      for (const ctx of representativeCombinations) {
        const label = Object.keys(ctx).length === 0
          ? 'no context'
          : Object.entries(ctx).map(([k, v]) => `${k}=${v}`).join(', ');

        it(`${name} under ${TOKEN_CEILING} tokens with ${label}`, () => {
          const result = fn(ctx);
          const tokens = estimateTokens(result);
          expect(tokens).toBeLessThan(TOKEN_CEILING);
        });
      }
    }
  });
});
