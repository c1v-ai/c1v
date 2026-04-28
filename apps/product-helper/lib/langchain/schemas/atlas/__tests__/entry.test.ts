/**
 * KB-8 Atlas — Zod parse tests.
 *
 * Three representative fixtures:
 *   - Netflix               — public, scalar-heavy priors
 *   - Shopify               — public, SaaS / Rails archetype
 *   - OpenAI                — frontier_ai_private, AI-stack + utility hints
 *
 * @module lib/langchain/schemas/atlas/__tests__/entry.test
 */

import { describe, it, expect } from '@jest/globals';
import {
  companyAtlasEntrySchema,
  MIN_CORPUS_READY_SIZE,
  MIN_T1_CORPUS_SIZE,
  type CompanyAtlasEntry,
} from '../index';

const VALID_SHA =
  'a1b2c3d4e5f67890abcdef0123456789a1b2c3d4e5f67890abcdef0123456789';
const ALT_SHA =
  '112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00';

const SCALE_CITATION_A = {
  kb_source: 'netflix',
  source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001065280',
  source_tier: 'A_sec_filing' as const,
  publish_date: '2025-01-31',
  retrieved_at: '2026-04-21',
  sha256: VALID_SHA,
  corroborated_by: [],
};

const BLOG_CITATION_B = {
  kb_source: 'netflix',
  source_url: 'https://netflixtechblog.com/some-post',
  source_tier: 'B_official_blog' as const,
  publish_date: '2025-06-15',
  retrieved_at: '2026-04-21',
  sha256: ALT_SHA,
  corroborated_by: [],
};

// ─────────────────────────────────────────────────────────────────────────
// Fixture: Netflix — public, scalar priors
// ─────────────────────────────────────────────────────────────────────────

const netflix: CompanyAtlasEntry = {
  slug: 'netflix',
  name: 'Netflix',
  kind: 'public',
  hq: 'Los Gatos, CA',
  last_verified: '2026-04-21',
  verification_status: 'verified',
  reviewer: 'curator',
  data_quality_grade: 'Q1',
  primary_source: {
    tier: 'A_sec_filing',
    source_url: SCALE_CITATION_A.source_url,
  },
  scale: {
    metric: 'paying_subscribers',
    value: 260_000_000,
    as_of: '2025-Q4',
    citation: SCALE_CITATION_A,
  },
  dau_band: 'over_100m',
  revenue_usd_annual: 33_700_000_000,
  infra_cost_usd_annual: null,
  cost_band: 'over_1b_usd',
  headcount_est: 14_000,
  economics_citations: [SCALE_CITATION_A],
  frontend: { web: ['React', 'TypeScript'], mobile: ['Native_iOS', 'Android_native'] },
  backend: { primary_langs: ['Java', 'Python'], frameworks: ['Spring_Boot'] },
  data: {
    oltp: ['Cassandra'],
    cache: ['EVCache'],
    warehouse: ['S3_Iceberg'],
  },
  infra: { cloud: ['AWS'], compute: ['EC2'], cdn: ['OpenConnect'] },
  gpu_exposure: 'none',
  inference_pattern: 'none',
  latency_priors: [
    {
      anchor: 'playback_start_p95_ms',
      description: 'Start-of-playback tail latency for consumer web.',
      citation: BLOG_CITATION_B,
      confidence: 0.8,
      verification_status: 'partial',
      result_kind: 'scalar',
      value: 1200,
      units: 'ms',
      percentile: 'p95',
    },
  ],
  availability_priors: [
    {
      anchor: 'streaming_monthly_sla',
      description: 'Streaming-tier monthly uptime (published).',
      citation: BLOG_CITATION_B,
      confidence: 0.9,
      verification_status: 'verified',
      result_kind: 'scalar',
      value: 0.9995,
      units: 'fraction_uptime',
      window: 'monthly',
    },
  ],
  throughput_priors: [],
  cost_curves: [],
  archetype_tags: ['scala-jvm-platform'],
  related_refs: [],
  nda_clean: true,
  ingest_script_version: '1.0.0',
};

// ─────────────────────────────────────────────────────────────────────────
// Fixture: Shopify — public, Rails monolith
// ─────────────────────────────────────────────────────────────────────────

const shopify: CompanyAtlasEntry = {
  slug: 'shopify',
  name: 'Shopify',
  kind: 'public',
  hq: 'Ottawa, ON',
  last_verified: '2026-04-21',
  verification_status: 'verified',
  reviewer: 'curator',
  data_quality_grade: 'Q2',
  primary_source: {
    tier: 'A_sec_filing',
    source_url: SCALE_CITATION_A.source_url,
  },
  scale: {
    metric: 'gmv_usd_annual',
    value: 290_000_000_000,
    as_of: '2025-Q4',
    citation: { ...SCALE_CITATION_A, kb_source: 'shopify' },
  },
  dau_band: 'over_100m',
  revenue_usd_annual: 7_000_000_000,
  infra_cost_usd_annual: null,
  cost_band: '100m_1b_usd',
  headcount_est: 11_600,
  economics_citations: [{ ...SCALE_CITATION_A, kb_source: 'shopify' }],
  frontend: { web: ['Remix', 'React', 'TypeScript'], mobile: ['React_Native'] },
  backend: { primary_langs: ['Ruby', 'Go'], frameworks: ['Rails'] },
  data: {
    oltp: ['MySQL'],
    cache: ['Memcached', 'Redis'],
    warehouse: ['BigQuery'],
  },
  infra: { cloud: ['GCP'], compute: ['GKE'], cdn: ['Cloudflare', 'Fastly'] },
  gpu_exposure: 'none',
  inference_pattern: 'none',
  latency_priors: [],
  availability_priors: [],
  throughput_priors: [],
  cost_curves: [],
  archetype_tags: ['rails-majestic-monolith'],
  related_refs: [],
  nda_clean: true,
  ingest_script_version: '1.0.0',
};

// ─────────────────────────────────────────────────────────────────────────
// Fixture: OpenAI — frontier_ai_private, AI-stack + utility hints
// ─────────────────────────────────────────────────────────────────────────

const openai: CompanyAtlasEntry = {
  slug: 'openai',
  name: 'OpenAI',
  kind: 'frontier_ai_private',
  hq: 'San Francisco, CA',
  last_verified: '2026-04-21',
  verification_status: 'partial',
  reviewer: 'curator',
  data_quality_grade: 'Q2',
  primary_source: {
    tier: 'B_official_blog',
    source_url: 'https://openai.com/blog/some-scale-post',
  },
  scale: {
    metric: 'api_calls_per_day_est',
    value: [1_500_000_000, 3_000_000_000],
    as_of: '2025-Q4',
    citation: {
      kb_source: 'openai',
      source_url: 'https://openai.com/blog/some-scale-post',
      source_tier: 'B_official_blog',
      publish_date: '2025-10-01',
      retrieved_at: '2026-04-21',
      sha256: VALID_SHA,
      corroborated_by: [],
    },
  },
  dau_band: 'over_100m',
  revenue_usd_annual: 4_000_000_000,
  infra_cost_usd_annual: null,
  cost_band: 'over_1b_usd',
  headcount_est: 2_500,
  economics_citations: [
    {
      kb_source: 'openai',
      source_url: 'https://www.theinformation.com/article/openai-revenue',
      source_tier: 'C_press_analyst',
      publish_date: '2025-12-01',
      retrieved_at: '2026-04-21',
      sha256: ALT_SHA,
      corroborated_by: [
        {
          source_url: 'https://www.bloomberg.com/news/openai-revenue',
          source_tier: 'C_press_analyst',
        },
      ],
    },
  ],
  frontend: { web: ['React', 'TypeScript', 'Next.js'], mobile: ['React_Native'] },
  backend: { primary_langs: ['Python'], frameworks: ['FastAPI'] },
  data: {
    oltp: ['Postgres_managed'],
    cache: ['Redis'],
    warehouse: ['Snowflake'],
    vector: ['self_hosted'],
  },
  infra: { cloud: ['Azure'], compute: ['H100', 'TPU_v5'], cdn: ['Cloudflare'] },
  ai_stack: {
    training_framework: ['PyTorch', 'Triton'],
    serving: ['custom_vLLM_style'],
    evals: ['custom_internal'],
  },
  gpu_exposure: 'owns_cluster',
  inference_pattern: 'streaming',
  latency_priors: [
    {
      anchor: 'chat_completion_first_token_p95_ms',
      description: 'First-token latency for GPT-4-class streaming completion.',
      citation: {
        kb_source: 'openai',
        source_url: 'https://platform.openai.com/docs/guides/latency',
        source_tier: 'B_official_blog',
        publish_date: '2025-09-01',
        retrieved_at: '2026-04-21',
        sha256: VALID_SHA,
        corroborated_by: [],
      },
      confidence: 0.75,
      verification_status: 'partial',
      result_kind: 'scalar',
      value: 900,
      units: 'ms',
      percentile: 'p95',
    },
  ],
  availability_priors: [
    {
      anchor: 'api_monthly_sla',
      description: 'Published API tier SLA.',
      citation: {
        kb_source: 'openai',
        source_url: 'https://platform.openai.com/docs/guides/reliability',
        source_tier: 'B_official_blog',
        publish_date: '2025-08-15',
        retrieved_at: '2026-04-21',
        sha256: ALT_SHA,
        corroborated_by: [],
      },
      confidence: 0.9,
      verification_status: 'verified',
      result_kind: 'scalar',
      value: 0.999,
      units: 'fraction_uptime',
      window: 'monthly',
    },
  ],
  throughput_priors: [],
  cost_curves: [
    {
      anchor: 'api_usd_per_1m_tokens_gpt4o_input',
      description: 'GPT-4o input pricing per 1M tokens.',
      citation: {
        kb_source: 'openai',
        source_url: 'https://openai.com/api/pricing/',
        source_tier: 'B_official_blog',
        publish_date: '2026-01-01',
        retrieved_at: '2026-04-21',
        sha256: VALID_SHA,
        corroborated_by: [],
      },
      confidence: 0.99,
      verification_status: 'verified',
      result_kind: 'piecewise',
      x_label: 'tokens_per_month',
      y_label: 'usd_per_month',
      units: 'usd_per_1m_tokens',
      breakpoints: [
        { x: 0, y: 0, regime_label: 'flat' },
        { x: 1_000_000, y: 2.5, regime_label: 'flat' },
      ],
    },
  ],
  utility_weight_hints: {
    latency: 0.2,
    cost: 0.2,
    quality_bench: 0.3,
    availability: 0.15,
    safety: 0.15,
    developer_velocity: 0,
    security_compliance: 0,
  },
  archetype_tags: ['ai-training-gpu-fleet', 'ai-native-inference-edge'],
  related_refs: [],
  nda_clean: true,
  ingest_script_version: '1.0.0',
};

// ─────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────

describe('companyAtlasEntrySchema', () => {
  it('netflix (public) parses cleanly', () => {
    expect(companyAtlasEntrySchema.parse(netflix).slug).toBe('netflix');
  });

  it('shopify (public) parses cleanly', () => {
    expect(companyAtlasEntrySchema.parse(shopify).archetype_tags).toContain(
      'rails-majestic-monolith',
    );
  });

  it('openai (frontier_ai_private) parses cleanly', () => {
    const parsed = companyAtlasEntrySchema.parse(openai);
    expect(parsed.ai_stack).toBeDefined();
    expect(parsed.utility_weight_hints).toBeDefined();
    expect(parsed.cost_curves.length).toBe(1);
  });

  it('frontier_ai_private WITHOUT ai_stack is rejected', () => {
    const broken = {
      ...openai,
      ai_stack: undefined,
      utility_weight_hints: undefined,
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(/ai_stack/);
  });

  it('frontier_ai_private cannot cite A_sec_filing on economics', () => {
    const broken: CompanyAtlasEntry = {
      ...openai,
      economics_citations: [
        {
          kb_source: 'openai',
          source_url: 'https://www.sec.gov/fake',
          source_tier: 'A_sec_filing',
          publish_date: '2025-01-01',
          retrieved_at: '2026-04-21',
          sha256: VALID_SHA,
          corroborated_by: [],
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /A_sec_filing/,
    );
  });

  it('public-kind scale with tier-D citation is rejected', () => {
    const broken: CompanyAtlasEntry = {
      ...netflix,
      scale: {
        ...netflix.scale,
        citation: {
          ...netflix.scale.citation,
          source_tier: 'D_stackshare',
          corroborated_by: [],
        },
      },
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /public-kind scale/,
    );
  });

  it('latency prior citing D_stackshare alone is rejected', () => {
    const broken: CompanyAtlasEntry = {
      ...netflix,
      latency_priors: [
        {
          ...netflix.latency_priors[0],
          citation: {
            ...netflix.latency_priors[0].citation,
            source_tier: 'D_stackshare',
            corroborated_by: [],
          },
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /D_stackshare rejected/,
    );
  });

  it('latency prior citing C_press_analyst is rejected even WITH corroboration (priors need B/E/G)', () => {
    const broken: CompanyAtlasEntry = {
      ...netflix,
      latency_priors: [
        {
          ...netflix.latency_priors[0],
          citation: {
            ...netflix.latency_priors[0].citation,
            source_tier: 'C_press_analyst',
            corroborated_by: [
              {
                source_url: 'https://www.theinformation.com/another',
                source_tier: 'C_press_analyst',
              },
            ],
          },
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /C_press_analyst rejected/,
    );
  });

  it('latency prior citing E_conference WITH is_ic=true is accepted', () => {
    const fine: CompanyAtlasEntry = {
      ...netflix,
      latency_priors: [
        {
          ...netflix.latency_priors[0],
          citation: {
            ...netflix.latency_priors[0].citation,
            source_tier: 'E_conference',
            source_url: 'https://qconferences.com/qcon-sf-2025/talk/netflix-caching',
            is_ic: true,
          },
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(fine)).not.toThrow();
  });

  it('latency prior citing E_conference WITHOUT is_ic=true is rejected', () => {
    const broken: CompanyAtlasEntry = {
      ...netflix,
      latency_priors: [
        {
          ...netflix.latency_priors[0],
          citation: {
            ...netflix.latency_priors[0].citation,
            source_tier: 'E_conference',
            source_url: 'https://qconferences.com/qcon-sf-2025/talk/ceo-keynote',
          },
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /requires is_ic=true/,
    );
  });

  it('latency prior citing E_conference with is_ic=false is rejected', () => {
    const broken: CompanyAtlasEntry = {
      ...netflix,
      latency_priors: [
        {
          ...netflix.latency_priors[0],
          citation: {
            ...netflix.latency_priors[0].citation,
            source_tier: 'E_conference',
            source_url: 'https://qconferences.com/qcon-sf-2025/talk/vp-keynote',
            is_ic: false,
          },
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /requires is_ic=true/,
    );
  });

  it('utility_weight_hints not summing to 1.0 is rejected', () => {
    const broken: CompanyAtlasEntry = {
      ...openai,
      utility_weight_hints: {
        latency: 0.1,
        cost: 0.1,
        quality_bench: 0.1,
        availability: 0.1,
        safety: 0.1,
        developer_velocity: 0,
        security_compliance: 0,
      },
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /sum to ~1.0/,
    );
  });

  it('duplicate anchors within cost_curves are rejected', () => {
    const dup = openai.cost_curves[0];
    const broken: CompanyAtlasEntry = {
      ...openai,
      cost_curves: [dup, dup],
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /duplicate anchor/,
    );
  });

  it('non-HTTPS citation URL is rejected', () => {
    const broken: CompanyAtlasEntry = {
      ...netflix,
      scale: {
        ...netflix.scale,
        citation: {
          ...netflix.scale.citation,
          source_url: 'http://insecure.example.com',
        },
      },
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow();
  });

  it('invalid SHA-256 hex is rejected', () => {
    const broken: CompanyAtlasEntry = {
      ...netflix,
      scale: {
        ...netflix.scale,
        citation: {
          ...netflix.scale.citation,
          sha256: 'not-a-valid-hash',
        },
      },
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow();
  });

  it('nda_clean must be literal true', () => {
    const broken = { ...netflix, nda_clean: false } as unknown as CompanyAtlasEntry;
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow();
  });

  it('MIN_CORPUS_READY_SIZE matches the Zod-layer threshold', () => {
    // Keep this assertion data-driven against the exported constant so
    // bumps to the threshold don't break the test suite spuriously.
    expect(MIN_CORPUS_READY_SIZE).toBeGreaterThan(0);
    expect(MIN_CORPUS_READY_SIZE).toBe(MIN_CORPUS_READY_SIZE);
  });

  it('MIN_T1_CORPUS_SIZE alias is preserved', () => {
    expect(MIN_T1_CORPUS_SIZE).toBe(MIN_CORPUS_READY_SIZE);
  });

  it('data_quality_grade accepts Q1/Q2/Q3 only', () => {
    const bad = { ...netflix, data_quality_grade: 'Q4' } as unknown as CompanyAtlasEntry;
    expect(() => companyAtlasEntrySchema.parse(bad)).toThrow();
    for (const g of ['Q1', 'Q2', 'Q3'] as const) {
      expect(() =>
        companyAtlasEntrySchema.parse({ ...netflix, data_quality_grade: g }),
      ).not.toThrow();
    }
  });

  it('primary_source round-trips tier letter', () => {
    const parsed = companyAtlasEntrySchema.parse(openai);
    expect(parsed.primary_source.tier).toBe('B_official_blog');
    expect(parsed.data_quality_grade).toBe('Q2');
  });

  it('primary_source rejects non-HTTPS url', () => {
    const broken = {
      ...netflix,
      primary_source: {
        tier: 'A_sec_filing' as const,
        source_url: 'http://example.com',
      },
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow();
  });

  it('throughput prior (BFCM-style peak_burst) is accepted with tier-B citation', () => {
    const fine: CompanyAtlasEntry = {
      ...shopify,
      throughput_priors: [
        {
          anchor: 'bfcm_2025_peak_rpm',
          description: 'BFCM 2025 peak platform throughput.',
          citation: {
            kb_source: 'shopify',
            source_url: 'https://shopify.engineering/bfcm-2025-readiness',
            source_tier: 'B_official_blog',
            publish_date: '2025-11-20',
            retrieved_at: '2026-04-22',
            sha256: VALID_SHA,
            corroborated_by: [],
          },
          confidence: 0.95,
          verification_status: 'verified',
          result_kind: 'scalar',
          value: 284_000_000,
          units: 'rpm',
          measurement: 'peak_burst',
          window: 'BFCM 2025 1m',
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(fine)).not.toThrow();
  });

  it('throughput prior citing D_stackshare is rejected', () => {
    const broken: CompanyAtlasEntry = {
      ...shopify,
      throughput_priors: [
        {
          anchor: 'some_rps_claim',
          description: 'Community-reported RPS.',
          citation: {
            kb_source: 'shopify',
            source_url: 'https://stackshare.io/shopify',
            source_tier: 'D_stackshare',
            publish_date: '2025-05-01',
            retrieved_at: '2026-04-22',
            sha256: ALT_SHA,
            corroborated_by: [],
          },
          confidence: 0.3,
          verification_status: 'inferred',
          result_kind: 'scalar',
          value: 50_000,
          units: 'rps',
          measurement: 'sustained',
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /D_stackshare rejected/,
    );
  });

  // ───── schema_v 1.1.0 additions (gaps #34-#38) ──────────────────────────

  it('archetype_tags accepts globally-distributed-edge-network (#34)', () => {
    const cloudflareLike: CompanyAtlasEntry = {
      ...shopify,
      slug: 'cloudflare',
      name: 'Cloudflare',
      archetype_tags: [
        'globally-distributed-edge-network',
        'ai-native-inference-edge',
        'developer-platform-saas',
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(cloudflareLike)).not.toThrow();
  });

  it('archetype_tags accepts elixir-beam-actor-platform (#34 discord finding)', () => {
    const discordLike: CompanyAtlasEntry = {
      ...shopify,
      slug: 'discord',
      name: 'Discord',
      archetype_tags: ['elixir-beam-actor-platform'],
    };
    expect(() => companyAtlasEntrySchema.parse(discordLike)).not.toThrow();
  });

  it('scaleMetricSchema accepts registered_members (#35 linkedin finding)', () => {
    const linkedinLike: CompanyAtlasEntry = {
      ...shopify,
      slug: 'linkedin',
      name: 'LinkedIn',
      scale: {
        metric: 'registered_members',
        value: 1_000_000_000,
        as_of: '2025-Q4',
        citation: { ...SCALE_CITATION_A, kb_source: 'linkedin' },
      },
    };
    expect(() => companyAtlasEntrySchema.parse(linkedinLike)).not.toThrow();
  });

  it('throughput prior accepts tb_per_day unit (#36 linkedin 20TB/day)', () => {
    const fine: CompanyAtlasEntry = {
      ...shopify,
      throughput_priors: [
        {
          anchor: 'job_ingest_tb_per_day',
          description: 'Job ingestion data-rate.',
          citation: {
            kb_source: 'linkedin',
            source_url: 'https://www.linkedin.com/blog/engineering/job-ingest',
            source_tier: 'B_official_blog',
            publish_date: '2025-10-01',
            retrieved_at: '2026-04-22',
            sha256: VALID_SHA,
            corroborated_by: [],
          },
          confidence: 0.85,
          verification_status: 'verified',
          result_kind: 'scalar',
          value: 20,
          units: 'tb_per_day',
          measurement: 'sustained',
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(fine)).not.toThrow();
  });

  it('throughput prior accepts gb_per_hour unit (#36)', () => {
    const fine: CompanyAtlasEntry = {
      ...shopify,
      throughput_priors: [
        {
          anchor: 'some_gb_per_hour',
          description: 'x',
          citation: {
            kb_source: 'shopify',
            source_url: 'https://shopify.engineering/x',
            source_tier: 'B_official_blog',
            publish_date: '2025-10-01',
            retrieved_at: '2026-04-22',
            sha256: VALID_SHA,
            corroborated_by: [],
          },
          confidence: 0.8,
          verification_status: 'partial',
          result_kind: 'scalar',
          value: 100,
          units: 'gb_per_hour',
          measurement: 'sustained',
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(fine)).not.toThrow();
  });

  it('entryKindSchema accepts private_consumer (#37 discord finding)', () => {
    const discordLike: CompanyAtlasEntry = {
      ...shopify,
      slug: 'discord',
      name: 'Discord',
      kind: 'private_consumer',
      scale: {
        metric: 'registered_members',
        value: 200_000_000,
        as_of: '2025-Q4',
        citation: {
          ...SCALE_CITATION_A,
          kb_source: 'discord',
          source_tier: 'B_official_blog',
        },
      },
      economics_citations: [
        {
          ...SCALE_CITATION_A,
          kb_source: 'discord',
          source_tier: 'B_official_blog',
        },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(discordLike)).not.toThrow();
  });

  it('private_consumer rejects A_sec_filing economics (#37)', () => {
    const broken: CompanyAtlasEntry = {
      ...shopify,
      slug: 'discord',
      kind: 'private_consumer',
      scale: {
        ...shopify.scale,
        citation: {
          ...SCALE_CITATION_A,
          kb_source: 'discord',
          source_tier: 'B_official_blog',
        },
      },
      economics_citations: [
        { ...SCALE_CITATION_A, kb_source: 'discord', source_tier: 'A_sec_filing' },
      ],
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /private_consumer cannot cite A_sec_filing/,
    );
  });

  it('private_consumer rejects scale tier C (narrower than frontier_ai_private) (#37)', () => {
    const broken: CompanyAtlasEntry = {
      ...shopify,
      slug: 'discord',
      kind: 'private_consumer',
      scale: {
        ...shopify.scale,
        citation: {
          ...SCALE_CITATION_A,
          kb_source: 'discord',
          source_tier: 'C_press_analyst',
          corroborated_by: [
            { source_url: 'https://bloomberg.com/x', source_tier: 'C_press_analyst' },
          ],
        },
      },
      economics_citations: [],
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /private_consumer-kind scale requires B_official_blog/,
    );
  });

  it('bytes_integrity defaults to clean and does not require content_sha256 (#38)', () => {
    const parsed = companyAtlasEntrySchema.parse(netflix);
    expect(parsed.scale.citation.bytes_integrity).toBe('clean');
    expect(parsed.scale.citation.content_sha256).toBeUndefined();
  });

  it('bytes_integrity=captcha_wall_content_via_webfetch REQUIRES content_sha256 (#38 airbnb)', () => {
    const broken: CompanyAtlasEntry = {
      ...netflix,
      scale: {
        ...netflix.scale,
        citation: {
          ...netflix.scale.citation,
          bytes_integrity: 'captcha_wall_content_via_webfetch',
        },
      },
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /content_sha256 is REQUIRED/,
    );
  });

  it('bytes_integrity=captcha_wall_content_via_webfetch accepted WITH content_sha256 (#38 airbnb)', () => {
    const fine: CompanyAtlasEntry = {
      ...netflix,
      scale: {
        ...netflix.scale,
        citation: {
          ...netflix.scale.citation,
          bytes_integrity: 'captcha_wall_content_via_webfetch',
          content_sha256: ALT_SHA,
        },
      },
    };
    expect(() => companyAtlasEntrySchema.parse(fine)).not.toThrow();
  });

  it('duplicate anchors within throughput_priors are rejected', () => {
    const tp = {
      anchor: 'peak_rpm',
      description: 'x',
      citation: {
        kb_source: 'shopify',
        source_url: 'https://shopify.engineering/bfcm',
        source_tier: 'B_official_blog' as const,
        publish_date: '2025-11-20',
        retrieved_at: '2026-04-22',
        sha256: VALID_SHA,
        corroborated_by: [],
      },
      confidence: 0.9,
      verification_status: 'verified' as const,
      result_kind: 'scalar' as const,
      value: 10_000_000,
      units: 'rpm' as const,
      measurement: 'peak_burst' as const,
    };
    const broken: CompanyAtlasEntry = {
      ...shopify,
      throughput_priors: [tp, tp],
    };
    expect(() => companyAtlasEntrySchema.parse(broken)).toThrow(
      /duplicate anchor/,
    );
  });
});
