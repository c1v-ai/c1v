---
source_url: "https://shopify.engineering/world-class-product-search"
retrieved_at: "2026-04-22T00:12:00Z"
publish_date: "2025-11-12"
source_tier: "B_official_blog"
sha256: "ecdb9b82f08e941ac875292bd03263b383eab67b00db1d70ee8a55bb2774c206"
filing_type: "blog"
author: "Mikhail Shakhray"
is_ic: true
---

# Building world-class product search at Shopify: Where C++ excellence meets ML innovation

Learn how we solved a major search engineering dilemma-running machine learning models at native C++ speed.

Published on

Nov 12, 2025

<!-- image -->

Engineering at Shopify

We're hiring

[See open roles](https://www.shopify.com/careers#Engineering)

**We solved a fundamental search engineering challenge:** running ML models (transformers, neural rankers) and gradient boosting algorithms (LightGBM, Catboost) at native C++ speed.

Modern commerce search demands both rapid ML iteration and millisecond latency at scale. Data scientists want to deploy new transformers and neural rankers daily. Our system serves billions of queries during Black Friday Cyber Monday (BFCM). Traditional approaches force a choice: flexibility or performance. We refused to choose.

Our Search team operates infrastructure serving millions of merchants globally. We handle real-time indexing, retrieval, ranking, and experimentation. Our ranking pipeline combines classical information retrieval with modern ML-typo correction, synonyms, faceting, and semantic search across storefronts and the [Shop app](https://shop.app/) .

We built privacy controls, multi-language support, and accessibility features into the core architecture. Merchants get merchandising APIs and relevance controls for customization at scale. Automated metrics and evaluation pipelines let us ship ranking improvements without breaking production.

Our solution: RankFlow, a Domain-Specific Language, and TurboDSL, an execution engine enable data scientists to deploy models trained on billions of queries in minutes. We get the best of both worlds: Machine Learning (ML) innovation and systems performance.

## What defines world-class commerce search

Commerce search isn't just about matching keywords-it's about understanding purchase intent.

Our ranking system combines multiple signals:

- **Relevance:** Search results must directly address what shoppers look for. No fluff, just accurate matches.
- **Purchase popularity:** We prioritize products with actual sales, not just clicks. A product with thousands of orders outranks one with lots of views but few buyers.
- **Brand trust:** Established brands with significant GMV contribution receive higher ranking weight. For queries like "running shoes," trusted names often rise to the top.
- **Merchant intent (navigational):** Some shoppers know exactly what they want. When they search for a specific brand or product, we recognize that intent and take them straight to the relevant store or product page.

Commerce search optimizes for conversion-each result can convert and strengthen a business.

## The challenge: Why we build our own search engine

At commerce scale, owning search lets us control relevance, latency, and cost.

In March 2025, [we acquired Vantage Discovery](https://x.com/MParakhin/status/1900614024116740309) to bring world-class consumer discovery expertise to Shopify-scale commerce.

Off-the-shelf engines like Elasticsearch and Solr are excellent foundations, but meeting our scale would require significant re-architecture.

We needed a system that could:

- Manage real-time inventory updates across millions of merchants
- Handle complex pricing and product variants like size, color, and location-aware availability
- Support merchant-specific ranking and merchandising in a massive multi-tenant environment
- Deliver global, low-latency results

These constraints led us to build a search stack optimized for multi-tenant commerce, real-time indexing, and sub-second relevance worldwide.

## The dilemma every search team faces

Modern commerce search faces two demands: adapt quickly as data scientists evolve signals and models, and deliver results in milliseconds globally. These goals often clash.

To power commerce search at Shopify's scale, we rely on C++ for performance.

C++ delivers fast response times for millions of global shoppers, even under high query volumes. It optimizes memory usage to handle hundreds of millions of items across millions of merchants. C++'s close-to-hardware optimizations let us fine-tune our search stack for speed and reliability. These optimizations also drive cost efficiency-each performance gain reduces infrastructure demands.

Yet performance is only half the equation. Commerce search demands rapid innovation through machine learning.

Our data scientists need to experiment with new ranking algorithms daily, refining results to match shopper intent. This involves A/B testing different approaches in live production to pinpoint effective strategies. We integrate ML models-transformers, large language models, and embeddings-to keep our search relevance current. Our system must support swift updates to business logic that can't wait for slower C++ development cycles.

Balancing rapid iteration with high-performance infrastructure is critical.

<!-- image -->

Traditional approaches force strict tradeoffs. A pure C++ system delivers speed but lacks flexibility, making it slow to adapt to new ideas. Conversely, flexible languages like Python or Java enable rapid ML iteration but introduce unacceptable latency overhead and memory inefficiency at our query volume. Hybrid approaches, such as Python calling C++, create deployment complexity, version skew, and operational overhead.

## Our approach: RankFlow-the best of both worlds

We solved this challenge with RankFlow, our domain-specific language designed to combine Python-like simplicity with C++ performance.

This approach empowers data scientists to write Python-like code, deploy ranking changes instantly, and access the full range of ML models and features without C++ expertise. RankFlow eliminates the barriers that typically slow down experimentation, enabling our data scientists to iterate rapidly.

RankFlow delivers the performance of compiled C++ without the drawbacks of interpretive languages in production. It ensures predictable latency and efficient memory usage, critical for handling the massive scale of global commerce search. Vectorized operations and cache optimization maximize speed while maintaining stability.

Additionally, type safety and compile-time validation provide reliability to keep our search stack running smoothly. In practice, RankFlow bridges the gap between flexibility and performance, creating a seamless workflow where data scientists and engineers can collaborate to build a world-class search experience.

Here's what this looks like in practice.

### How data scientists actually write ranking modules at Shopify

<!-- image -->

### Advanced text matching with TextStreams

A single line of DSL can extract over 80 text similarity features, including hundreds of different text features applied to various document fields (e.g., `TfIdf` for Title, `QueryInText` for Description, `ExactMatch` for Brand):

<!-- image -->

We keep the iteration loop in a declarative layer that's quick to edit and review, and execute it with a compiler-grade runtime.

The result: ML innovation with the performance and reliability commerce requires.

**The machine learning workflow**

Our ML team drives ranking models through this process:

1. Train models on massive historical query data using Catboost/LightGBM/Neural networks
2. Validate offline with precision/recall metrics
3. Validate online via A/B testing
4. Deploy the model to production
5. RankFlow handles inference at C++ speed

<!-- image -->

## How we actually built this: The TurboDSL story

### Ship fast, optimize later, maintain compatibility always

This philosophy drives how we solve the speed vs. innovation dilemma.

We embraced a pragmatic two-phase rollout:

Phase 1: SimScorerDSL - First C++ engine (Weeks 1-4)

- Built a C++ execution engine that compiles DSL directly into optimized C++ code
- Delivered essential functionality fast
- Freed the data science team to start experiments immediately
- Demonstrated the DSL's viability for production ranking

Phase 2: TurboDSL engine (Months 2-4)

- Built a high-performance execution engine in parallel with the ML team's ongoing experiments
- Preserved the exact same DSL syntax-no disruptions for data scientists
- Achieved a 48% speedup in ranking feature computation

The results:

<!-- image -->

### Performance visibility on every PR

Every PR gets automatic performance analysis with a detailed breakdown of component-level timings: DSL, model inference, embeddings, and text matching.

Each analysis includes statistical significance testing with a ±2% tolerance to distinguish meaningful changes from noise, categorizing updates as improvements, regressions, or neutral. Side-by-side result comparisons help us catch accuracy regressions before production. This automated process lets our team maintain fast performance and search relevance with every change.

What we track:

<!-- image -->

Our engineering culture ensures that every engineer understands the performance impact of their changes before merging. No guessing, no surprises in production.

*If you're a C++ engineer who loves performance tuning and cache optimization,* [*build product search with us*](https://www.shopify.com/careers/c-search-ranking-engineer_13e77b6a-e6d9-458a-a376-6447cb145671) *.*

### About the author

[Misha Shakhray](https://www.linkedin.com/in/mikhailshakhray/) is a Senior Staff Engineer.

MS

by [Mikhail Shakhray](/authors/mikhail-shakhray)

Published on

Nov 12, 2025

Share article

- [Facebook](https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fshopify.engineering%2Fworld-class-product-search)
- [Twitter](https://twitter.com/intent/tweet?text=Building+world-class+product+search+at+Shopify:+Where+C+++excellence+meets+ML+innovation&url=https%3A%2F%2Fshopify.engineering%2Fworld-class-product-search&via=Shopify)
- [LinkedIn](https://www.linkedin.com/shareArticle?mini=true&source=Shopify&title=Building+world-class+product+search+at+Shopify:+Where+C+++excellence+meets+ML+innovation&url=https%3A%2F%2Fshopify.engineering%2Fworld-class-product-search)

by [Mikhail Shakhray](/authors/mikhail-shakhray)

Published on

Nov 12, 2025

• 5 minute read

[Development](/topics/development) [Introducing Ruvy](/introducing-ruvy) [Developer Tooling](/topics/developer-tooling) [Building a ShopifyQL Code Editor](/building-a-shopifyql-code-editor)

[Apps](/topics/apps) [Shopify's platform is the Web platform](/shopifys-platform-is-the-web-platform) [Development](/topics/development) [The Engineering Story Behind Flex Comp](/building-flex-comp)

##### 

[Development](/topics/development)

[Introducing Ruvy](/introducing-ruvy)

2023-10-18

[Developer Tooling](/topics/developer-tooling)

[Building a ShopifyQL Code Editor](/building-a-shopifyql-code-editor)

2023-09-11

[Apps](/topics/apps)

[Shopify's platform is the Web platform](/shopifys-platform-is-the-web-platform)

2023-07-26

[Development](/topics/development)

[The Engineering Story Behind Flex Comp](/building-flex-comp)

2022-10-05

Work from anywhere with Shopify

See our open roles and learn more about our digital by design culture.

[See open roles](https://www.shopify.com/careers#Engineering)

### Shopify

- [About](https://www.shopify.com/about)
- [Careers](https://www.shopify.com/careers)
- [Investors](https://www.shopify.com/investors)
- [Press and Media](https://www.shopify.com/news)
- [Partners](https://www.shopify.com/partners)
- [Affiliates](https://www.shopify.com/affiliates)
- [Legal](https://www.shopify.com/legal)
- [Service status](https://www.shopifystatus.com/)

### Support

- [Merchant Support](https://help.shopify.com/en/questions)
- [Shopify Help Center](https://help.shopify.com/en/)
- [Hire a Partner](https://www.shopify.com/partners/directory)
- [Shopify Academy](https://www.shopifyacademy.com/?itcat=brochure&itterm=global-footer)
- [Shopify Community](https://community.shopify.com/?utm_campaign=footer&utm_content=en&utm_medium=web&utm_source=shopify)

### Developers

- [Shopify.dev](https://shopify.dev/)
- [API Documentation](https://shopify.dev/api)
- [Dev Degree](https://devdegree.ca/)

### Products

- [Shop](https://shop.app/)
- [Shop Pay](https://www.shopify.com/shop-pay)
- [Shopify for Enterprise](https://www.shopify.com/enterprise)

### Global Impact

- [Sustainability](https://www.shopify.com/climate)
- [Build Black](https://operationhope.org/initiatives/1-million-black-businesses/)
- [Accessibility](https://www.shopify.com/accessibility)
- [Research](https://www.shopify.com/plus/commerce-trends)

### Solutions

- [Online Store Builder](https://www.shopify.com/online)
- [Website Builder](https://www.shopify.com/website/builder)
- [Ecommerce Website](https://www.shopify.com/tour/ecommerce-website)

- [Terms of service](https://www.shopify.com/legal/terms)
- [Privacy policy](https://www.shopify.com/legal/privacy)
- [Sitemap](https://www.shopify.com/sitemap)
- [Your Privacy Choices](https://privacy.shopify.com/en)
California Consumer Privacy Act (CCPA) Opt-Out Icon

<!-- image -->