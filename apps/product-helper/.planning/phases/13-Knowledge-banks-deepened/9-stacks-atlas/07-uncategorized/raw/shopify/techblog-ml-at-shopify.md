---
source_url: "https://shopify.engineering/machine-learning-at-shopify"
retrieved_at: "2026-04-22T00:12:00Z"
publish_date: "2025-07-04"
source_tier: "B_official_blog"
sha256: "5d349d6e53ca845fde482863bb5b5d5dfc2a89193c5f0583694c16777ec89d7f"
filing_type: "blog"
author: "Javier Moreno"
is_ic: true
---

# Augmented commerce: Machine learning at Shopify

Commerce is a dynamic ecosystem where our mission is to empower every merchant to succeed. We optimize each step of their journey-from product creation to customer delivery-using advanced tools, infrastructure, and partnerships to solve a complex optimization challenge.

Published on

Jul 4, 2025

Cashier inside robot

<!-- image -->

Engineering at Shopify

We're hiring

[See open roles](https://www.shopify.com/careers#Engineering)

## The game

Commerce is an open world multiplayer game. Each Shopify merchant is a player; some team up, some compete. Everyone has a chance to succeed. There is no tutorial island available, no easy mode.

The game is complex: merchants create and offer products and figure out ways of presenting (and eventually selling!)  those products to customers. This does not happen in isolation. Understanding the environment and controlling the business are both difficult continuous tasks. Decisions need to be made every day. Their livelihood depends on it.

Shopify offers a highly customizable control panel and operating system for each business. We guide merchants, simplify their journey, and amplify network effects that make them more effective, sharper.

## The setup

Framed like this, Shopify is a gigantic optimization problem: ideally, we would like all our merchants to succeed. But success is defined differently for each. The game gives you that flexibility.

Machine learning at Shopify partitions this infinite problem into finite ones. We optimize every component from product creation to customer delivery. Some of these optimizations are highly personalized, concentrated on the needs and objectives of each merchant. Some are system wide, making our product significantly better, stronger or faster, for everyone at the same time.

Two decades supporting merchants have equipped us with a historic dataset capturing at high definition the stories of millions of businesses. It condenses a lot of deep knowledge about the way businesses exist in the world and the choices they make along the way. This is the raw material that fuels our work.

## The problems

The gameboard is wide and always expanding. Here are some of the main areas where our investment on ML is already paying off:

- Determining what each of our merchants sells and what are the main characteristics of each product that deserve highlighting is a gigantic and always evolving problem. We use finetuned [Qwen multimodal models](https://huggingface.co/collections/Qwen/qwen25-vl-6795ffac22b334a837c0f9a5) for [classifying and enriching the metadata](https://shopify.engineering/evolution-product-classification) of each product uploaded into the system. This entails hundreds of millions of inferences a day.
- Commerce is an antagonistic game with many bad actors trying to abuse merchants and customers. We assess fraud of every transaction using very fast risk models. Currently we are taking inspiration from [this work by Feature Space](https://arxiv.org/pdf/2401.01641) .
- Our merchants have an advantage when they can use our product at its fullest, taking into consideration all our capabilities and features. We use a combination of fine-tuned [LLaMa models](https://huggingface.co/meta-llama) and large general models, combined with refined MCPs, to build [Sidekick](https://www.shopify.com/ca/magic) , our loyal multi-purpose merchant assistant.
- General purpose representations of products and other commerce entities give us the ability of building richer, simpler, and more powerful machine learning systems. We rely on finetuned [Nomic embeddings](https://huggingface.co/collections/nomic-ai/nomic-embed-v2-67acc40c3aa2865aa8a7d114) for vector representations of the many billions of products in our catalog. These embeddings empower product discovery systems including search and recommendations.
- Access to capital is key for merchants' success. For this we need to know how much a business will make long term. We have multiple services that give merchants access to money when they need it and in good terms. At the heart of our risk assessment tools, we developed a tabular transformer based model (using ideas from [here](https://arxiv.org/abs/1908.07442) and [here](https://arxiv.org/abs/2201.12886) and [here](https://arxiv.org/pdf/2107.07511) , among others) for forecasting merchant GMV.
- Sequence based foundational models are key for understanding merchant and customer actions at detail and determining what would be the best move given their current objectives. For this, we are actively experimenting with the [HSTU architecture](https://arxiv.org/abs/2402.17152) to build models for customer and merchant behaviour.
- Query rewriting increases the chance of offering the customer what they are really looking for. This requires very small and very smart language models producing better queries at request time. Our search team is actively exploring the space. Papers such as [this one](https://arxiv.org/abs/2501.18056v2) are guiding our ambition.
- And this is just a sample of what we do.

## The gear

We want to be at the forefront of what technology can offer to our merchants. As such, we are making heavy investments to ensure our machine learning engineers have access to the latest tools and capabilities to do their work.

It all starts with GPUs, of course. For this we are partnering with GCP, as our main infra provider, and also engaging with neo-cloud providers such as [Nebius](https://nebius.com/) to utilize large training clusters. Our objective is to offer easy access to compute whenever it is needed to make rapid iteration and experimentation possible. Our tooling abstracts away from the underlying cloud provider, allowing us to move between vendors to get access to the latest GPUs as they're made available.

Some of our tasks require high throughput and high volume, or extremely low latency inferences. For these challenges we have partnered with companies like [CentML](https://centml.ai/) , that bring very deep practical knowledge for accelerating GPU computations.

We also understand that our models will always be only as good as the quality of the data we use for training them. We need excellent training data quickly available. For this, we complement our internal operation with the services of [Toloka](https://toloka.ai/) .

Since we strive to be at the cutting edge, we have full unconstrained early access to the latest models from all the frontier labs. They are excellent for annotations and evaluations, but we also have direct deployments for specific use cases such as Sidekick. Attached to coding assistants, we use these models to accelerate prototyping and development.

In addition, we are building an always growing collection of internal tools and systems to make the practice of machine learning a delight.

## The crew

We want builders, tinkerers, and explorers: people who are curious, imaginative, and obsessed with their craft. We don't care about credentials. We like researchers who are unafraid of production systems and engineers who know their way around the [arXiv](https://arxiv.org/) . We want people who feel uncomfortable when they are placed in specialized boxes.

If this resonates, we want to hear from you. At Shopify, you'll be architecting the future of global commerce with state of the art tools and unprecedented datasets. We're looking for people who see beauty in both theory and practice, and who are excited by turning ambitious ideas into merchant success stories.

Ready to help merchants everywhere win their game? [Join us](https://www.shopify.com/careers) .

JM

by [Javier Moreno](/authors/javier-moreno)

Published on

Jul 4, 2025

Share article

- [Facebook](https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fshopify.engineering%2Fmachine-learning-at-shopify)
- [Twitter](https://twitter.com/intent/tweet?text=Augmented+commerce:+Machine+learning+at+Shopify&url=https%3A%2F%2Fshopify.engineering%2Fmachine-learning-at-shopify&via=Shopify)
- [LinkedIn](https://www.linkedin.com/shareArticle?mini=true&source=Shopify&title=Augmented+commerce:+Machine+learning+at+Shopify&url=https%3A%2F%2Fshopify.engineering%2Fmachine-learning-at-shopify)

by [Javier Moreno](/authors/javier-moreno)

Published on

Jul 4, 2025

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