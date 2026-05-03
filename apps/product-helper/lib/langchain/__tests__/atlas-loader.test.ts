/**
 * @file lib/langchain/__tests__/atlas-loader.test.ts
 *
 * Tests for the v1 stub atlas-loader. The most important test here is the
 * "industry-standard" regression check (plan §9 acceptance test #5) — the
 * renderer must NEVER emit the legacy boilerplate, even on edge cases.
 */

import {
  getPriorsForArchetype,
  renderAtlasPriors,
  type AtlasPriors,
} from '../atlas-loader';

describe('atlas-loader (v1 stub)', () => {
  describe('getPriorsForArchetype', () => {
    it('returns provisional=true with empty arrays for any archetype', async () => {
      const priors = await getPriorsForArchetype('saas');
      expect(priors.provisional).toBe(true);
      expect(priors.entryCount).toBe(0);
      expect(priors.latency).toEqual([]);
      expect(priors.availability).toEqual([]);
      expect(priors.throughput).toEqual([]);
      expect(priors.cost).toEqual([]);
      expect(priors.citations).toEqual([]);
    });

    it('also returns the provisional stub for marketplace, ecommerce, etc.', async () => {
      for (const tag of ['marketplace', 'ecommerce', 'internal-tool', 'unknown-archetype']) {
        const priors = await getPriorsForArchetype(tag);
        expect(priors.provisional).toBe(true);
        expect(priors.entryCount).toBe(0);
      }
    });
  });

  describe('renderAtlasPriors', () => {
    it('emits honest "No peer evidence available" when priors omitted', () => {
      const out = renderAtlasPriors('saas', ['latency']);
      expect(out.provisional).toBe(true);
      expect(out.entryCount).toBe(0);
      expect(out.text).toContain('No peer evidence available');
      expect(out.text).toContain('"saas"');
    });

    it('emits the honest fallback when priors are provisional', () => {
      const provisional: AtlasPriors = {
        latency: [],
        availability: [],
        throughput: [],
        cost: [],
        citations: [],
        provisional: true,
        entryCount: 0,
      };
      const out = renderAtlasPriors('marketplace', ['latency', 'cost'], provisional);
      expect(out.provisional).toBe(true);
      expect(out.text).toContain('No peer evidence available');
      expect(out.text).toContain('"marketplace"');
    });

    it('renders a markdown table when non-provisional priors are supplied', () => {
      const fakePriors: AtlasPriors = {
        latency: [
          {
            // shape-cast through `as unknown` — test fixture only
            description: 'p95 chat completion (Sonnet)',
            value: 800,
            units: 'ms',
            citation: { kb_source: 'anthropic', source_url: 'https://example.com/a' },
          } as unknown as AtlasPriors['latency'][number],
        ],
        availability: [],
        throughput: [],
        cost: [],
        citations: [],
        provisional: false,
        entryCount: 12,
      };
      const out = renderAtlasPriors('saas', ['latency'], fakePriors);
      expect(out.provisional).toBe(false);
      expect(out.entryCount).toBe(12);
      expect(out.text).toContain('## Empirical priors');
      expect(out.text).toContain('### latency');
      expect(out.text).toContain('p95 chat completion (Sonnet)');
      expect(out.text).toContain('800 ms');
      expect(out.text).toContain('anthropic');
      // Even with real data, the legacy boilerplate must NEVER appear.
      expect(out.text).not.toMatch(/industry[- ]standard/i);
    });

    // Plan §9 acceptance test #5 — regression: no rendered output may
    // contain the legacy "industry-standard" boilerplate, on any code path.
    it('NEVER emits "industry-standard" boilerplate on any path', () => {
      const cases: Array<{ tag: string; priors?: AtlasPriors }> = [
        { tag: 'saas' },
        { tag: 'marketplace' },
        {
          tag: 'ecommerce',
          priors: {
            latency: [],
            availability: [],
            throughput: [],
            cost: [],
            citations: [],
            provisional: true,
            entryCount: 0,
          },
        },
        {
          tag: 'internal-tool',
          priors: {
            latency: [
              {
                description: 'p95',
                value: 1500,
                units: 'ms',
                citation: { kb_source: 'shopify' },
              } as unknown as AtlasPriors['latency'][number],
            ],
            availability: [],
            throughput: [],
            cost: [],
            citations: [],
            provisional: false,
            entryCount: 10,
          },
        },
      ];
      for (const c of cases) {
        const out = renderAtlasPriors(c.tag, ['latency', 'availability', 'throughput', 'cost'], c.priors);
        expect(out.text).not.toMatch(/industry[- ]standard/i);
        expect(out.text).not.toMatch(/industry typical/i);
      }
    });
  });
});
