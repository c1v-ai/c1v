---
source_url: "https://shopify.engineering/bfcm-readiness-2025"
retrieved_at: "2026-04-22T00:12:00Z"
publish_date: "2025-11-20"
source_tier: "B_official_blog"
sha256: "f218cd69eae9a800e502fa29ce6ad56f115d38d9a9ee0655aecf55127161f2c4"
filing_type: "blog"
author: "Kyle Petroski and Matthew Frail"
is_ic: true
---

# How we prepare Shopify for BFCM

From March to October we simulated traffic tsunamis, injected chaos, and fixed every bottleneck before our merchants needed us most.

Published on

Nov 20, 2025

Shopify providing commerce infrastructure globally

<!-- image -->

Engineering at Shopify

We're hiring

[See open roles](https://www.shopify.com/careers#Engineering)

***TL;DR: Bimonthly fire drills all year, simulating 150% of last year's BFCM load. Tests so massive we ran them at night and coordinated with YouTube. Each test exposed bottlenecks-Kafka, memory, timeouts-that we fixed and revalidated. We didn't stop until the infrastructure performed under extreme load.***

Black Friday Cyber Monday (BFCM) weekend is the ultimate test of Shopify's infrastructure. Millions of merchants and tens of millions of buyers depend on us during the biggest four days of the year.

In 2024, we broke multiple performance records : 57.3 PB of data, 10.5 trillion database queries, 1.19 trillion edge requests, and 1.17 trillion database writes. We peaked at 284 million requests per minute on edge and 80 million on app servers, pushing 12TB per minute on Black Friday alone. Now, this level of traffic is just a regular day for Shopify.

Of course, this year is going to be even bigger. To handle the traffic tsunami coming our way, we've rebuilt our BFCM readiness program from the ground up.

Benjamin Franklin once said, "By failing to prepare, you are preparing to fail." This is how we've been preparing all year to succeed in the Super Bowl of commerce.

## Building year-round resilience

Our BFCM prep started in March with capacity planning and a multi-region strategy on Google Cloud. Reliability is year-round work. We don't use BFCM as a release deadline-every architectural change and migration happens months before that critical window.

Three parallel workstreams run simultaneously during our prep:

1. **Capacity planning** : We model traffic patterns from historical data and merchant growth, submitting our estimates to our cloud providers so they don't run out of cloud. This planning defines how much infrastructure we need and where we need it geographically.
2. **Infrastructure roadmap** : We review our tech stack, evaluate architectural changes, and identify upgrades for target capacity. This helps us sequence the work ahead.
3. **Risk assessments:** What Could Go Wrong (WCGW) exercises document failure scenarios, set escalation priorities, and generate Game Day inputs. With this intel, we test and harden our systems in advance.

Each track influences the others. Risk findings might reveal capacity gaps, infrastructure changes might introduce new risks, etc.

## Game Days

To assess risks, we leaned hard into Game Days: chaos engineering exercises that simulate production failures at BFCM scale.

We began hosting Game Days in early spring. We intentionally injected faults into our systems to test how they responded under failure conditions and whether they validated our incident response. We spent extra time on the most business-critical user paths through Shopify, like checkout, payment processing, order creation, and fulfillment-we call these "critical journeys."

Critical Journey Game Days ran cross-system disaster simulations, testing search and pages endpoints, randomizing navigation to mimic real users, injecting network faults and latency, and cache-busting to create realistic load patterns. Frontend teams ran bug bashes to identify regressions, test critical user flows, and validate UX under peak load conditions.

These exercises built muscle memory for our incident response and exposed gaps in our playbooks and monitoring tooling. We closed those gaps well ahead of BFCM.

All findings fed into our Resiliency Matrix: a centralized documentation of vulnerabilities, incident response procedures, and fixes.

## The Resiliency Matrix

The Matrix now serves as our roadmap for system hardening before BFCM. Teams update the Matrix continuously throughout the year, documenting our resilience across Shopify. The Matrix includes:

- **Service status:** Current operational state of all critical services
- **Failure scenarios:** Documented failure modes with impact analysis
- **Recovery procedures:** Expected recovery time objectives (RTOs) and detailed runbooks
- **Operational playbooks:** Step-by-step incident response guides
- **On-call coverage:** Team schedules and PagerDuty escalation paths to ensure rapid incident response

## Load testing

We can't wait until BFCM to discover our capacity limits, so we use load testing to simulate that traffic beforehand. This allows us to find our breaking points months in advance and gives our teams time to scale infrastructure and optimize code accordingly.

Our load testing tool Genghis runs scripted workflows that mimic user behavior like browsing, cart adds, and checkout flows. We gradually ramp traffic to find breaking points. Tests run on production infrastructure simultaneously from three GCP regions (us-central, us-east, and europe-west4) to simulate global traffic patterns. We inject flash sale bursts on top of baseline load to test peak capacity.

[Toxip r oxy](https://github.com/Shopify/toxiproxy) , an open-source framework we built for simulating network conditions, injects network failures and partitions (where services can't reach each other). We monitor dashboards in real-time, ready to abort if systems degrade. Multiple teams coordinate to find and fix bottlenecks.

When we hit limits, teams have three options:

- **Horizontal scaling:** more instances
- **Vertical scaling:** more resources per instance
- **Optimizations** : architecture-layer changes that improve performance

Optimizations range from query improvements at the database level, to performance tuning across consuming layers, up to the frontend. These decisions set final BFCM capacity and drive optimization work across our stack.

## New analytics challenges

BFCM tests every system at Shopify, but 2025 presents a unique challenge: part of our infrastructure has never experienced holiday traffic. How do you prepare for peak load when you have no historical data to model from?

In 2024, our team rebuilt the analytics platform, creating new ETL (Extract, Load, Transform) pipelines, switching the persistence layer, and replacing our legacy system with new APIs. The migration rolled out throughout the year.

This created an asymmetry. Our ETL pipelines ran through BFCM 2024, meaning we have one season of production data. But our API layer launched after peak season. We're preparing for BFCM on APIs that have never seen holiday traffic.

Our analytics infrastructure mirrors Shopify's broader architecture: independent services handling intensive reports, aggregations, and real-time processing. We ran Game Days here too: controlled experiments designed to reveal failure modes and bottlenecks. We simulated increased traffic loads, introduced database latency, and tested cache failures-systematically mapping system behavior under stress.

The results showed that our ETL pipelines needed Kafka partition increases to maintain data freshness during spikes. API layer memory usage required optimization, found through profiling. Connection timeouts needed tuning to prevent pool exhaustion. We offloaded requests going to another region via a different load balancer approach to buy extra breathing room. Beyond performance fixes, we validated alerting and documented response procedures. As a result, our teams are trained and prepared to handle and respond during failures.

BFCM 2025 will be the ultimate test, hitting our APIs with unprecedented holiday traffic. We've tackled all known bottlenecks and are prepared to handle the unknown.

## The scale testing program

Game Days and load testing prepare us, but they test components in isolation. Scale testing is different-it validates the entire platform working together at BFCM volumes, revealing issues that only surface when everything runs at capacity simultaneously.

From April through October we ran five major scale tests at forecasted traffic levels, our peak p90 traffic assumptions. The first two tests validated baseline performance against 2024 performance. Tests three through five ramped to 2025 projections. By the fourth test, we hit 146 million requests per minute and 80,000+ checkouts per minute. On the last test of the year, we tested p99, which was 200M RPM.

These tests are so large that we have to run them at night and coordinate with YouTube. We tested resilience, not just load. We executed regional failovers, evacuating traffic from core US and EU regions to validate disaster recovery.

We ran multiple tests:

- **Architecture scale-up:** Validated that our infrastructure handles planned capacity
- **Load tests (normal operations):** Established baseline performance at peak load
- **Load tests (with failover):** Validated disaster recovery and cross-region failover
- **Game Day simulations:** Tested cross-system resilience through chaos engineering

We simulated real user behavior: storefront browsing and checkout, admin API traffic from apps and integrations, analytics and reporting loads, and backend webhook processing. We also tested critical scenarios: peak load, regional failover, and cascading failures where multiple systems fail simultaneously.

Each test cycle identified issues we would never see in steady-state load, and we fixed each issue as it emerged.

- **Scale Test 1-2:** Under heavy load, core operations threw errors and checkout queues backed up.
- **Scale Test 3:** Validated key migrations and confirmed regional routing behaves as expected after changes.
- **Scale Test 4:** Hit limits that triggered unplanned failover. Identified priority issues in test traffic routing and discovered delays when bringing regions back online during rebalancing.
- **Scale Test 5:** Performed full dress rehearsal, the only test run during NA business hours to simulate real BFCM conditions (the rest were at night).
- **Mid-program shift:** Added authenticated checkout to test scenarios. Modeling real buyers exposed rate-limit paths that anonymous browsing never touches. Even as a small percentage of traffic, authenticated flows revealed bottlenecks.

Scale tests are a team sport. Infrastructure scales the platform and monitors health, product teams validate features under load, SRE prepares incident response, and Support prepares for merchant questions. We also heavily coordinate these tests with our cloud and CDN providers.

## BFCM operational plan

BFCM preparation gets us ready, and operational excellence keeps us steady when traffic spikes. Our operational plan coordinates engineering teams, incident response, and live system tuning.

Our operational plan for BFCM weekend includes:

- **Real-time monitoring:** Dashboard visibility across all regions with automated alerts
- **Incident response:** Incident Manager OnCall (IMOC) teams with 24/7 coverage and escalation paths
- **Merchant communications:** Status updates and notifications
- **Live optimization:** System tuning based on real-time traffic patterns
- **Post-BFCM debrief:** Correlating monitoring data with merchant outcomes

## It's the most wonderful time of the year

Thousands of engineers. Nine months. Five scale tests. Four days of peak commerce, and one solid platform ready to handle it all.

Our 2025 readiness program was intensive. We executed regional failovers, ran chaos engineering exercises, documented system vulnerabilities, and hardened systems with updated runbooks before our merchants needed them.

As a bonus, the tools we built aren't temporary BFCM scaffolding. The Resiliency Matrix, Critical Journey Game Days, and real-time adaptive forecasting are permanent infrastructure improvements. They make Shopify more resilient every day, not just during peak season.

BFCM starts November 28th. We're ready. 🚀

*If you're interested in joining us on our mission to make commerce better for everyone, check out our* [*careers page*](https://www.shopify.com/careers/disciplines/engineering-data) *.*

**Kyle Petroski** is an Engineering Manager on the Analytics team.

**Matthew Frail** is a Staff Technical Program Manager on the Engineering Operations team.

KPaMF

by [Kyle Petroski and Matthew Frail](/authors/kyle-petroski-and-matthew-frail)

Published on

Nov 20, 2025

Share article

- [Facebook](https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fshopify.engineering%2Fbfcm-readiness-2025)
- [Twitter](https://twitter.com/intent/tweet?text=How+we+prepare+Shopify+for+BFCM&url=https%3A%2F%2Fshopify.engineering%2Fbfcm-readiness-2025&via=Shopify)
- [LinkedIn](https://www.linkedin.com/shareArticle?mini=true&source=Shopify&title=How+we+prepare+Shopify+for+BFCM&url=https%3A%2F%2Fshopify.engineering%2Fbfcm-readiness-2025)

by [Kyle Petroski and Matthew Frail](/authors/kyle-petroski-and-matthew-frail)

Published on

Nov 20, 2025

• 8 minute read

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

Work from anywhere

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