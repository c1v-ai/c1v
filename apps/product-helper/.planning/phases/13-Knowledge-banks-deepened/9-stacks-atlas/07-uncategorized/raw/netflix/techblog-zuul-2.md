---
source_url: "https://netflixtechblog.com/open-sourcing-zuul-2-82ea476cb2b3"
retrieved_at: "2026-04-22T00:02:00Z"
publish_date: "2018-05-21"
source_tier: "B_official_blog"
sha256: "8ab49dbed981a2542c7090dcfce1322d0483705b05aa5c1d2f7789a425ec74e0"
filing_type: "blog"
author: "Netflix Technology Blog (collective)"
is_ic: false
---

## [Netflix TechBlog](https://netflixtechblog.com/?source=post_page---publication_nav-2615bd06b42e-82ea476cb2b3---------------------------------------)

Follow publication

Netflix TechBlog

<!-- image -->

Learn about Netflix's world class engineering efforts, company culture, product developments and more.

Follow publication

# Open Sourcing Zuul 2

Netflix Technology Blog

<!-- image -->

[Netflix Technology Blog](https://netflixtechblog.medium.com/?source=post_page---byline--82ea476cb2b3---------------------------------------)

7 min read May 21, 2018

--

8

[Listen](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2Fplans%3Fdimension%3Dpost_audio_button%26postId%3D82ea476cb2b3&operation=register&redirect=https%3A%2F%2Fnetflixtechblog.com%2Fopen-sourcing-zuul-2-82ea476cb2b3&source=---header_actions--82ea476cb2b3---------------------post_audio_button------------------)

Share

We are excited to announce the open sourcing of [Zuul 2](https://github.com/netflix/zuul/) , Netflix's cloud gateway. We use Zuul 2 at Netflix as the front door for all requests coming into Netflix's cloud infrastructure. Zuul 2 significantly improves the architecture and features that allow our gateway to handle, route, and protect Netflix's cloud systems, and helps provide our 125 million members the best experience possible. The Cloud Gateway team at Netflix runs and operates more than 80 clusters of Zuul 2, sending traffic to about 100 (and growing) backend service clusters which amounts to more than 1 million requests per second. Nearly all of this traffic is from customer devices and browsers that enable the discovery and playback experience you are likely familiar with.

This post will overview Zuul 2, provide details on some of the interesting features we are releasing today, and discuss some of the other projects that we're building with Zuul 2.

## How Zuul 2 Works

For context, here's a high-level diagram of Zuul 2's architecture:

<!-- image -->

The Netty handlers on the front and back of the filters are mainly responsible for handling the network protocol, web server, connection management and proxying work. With those inner workings abstracted away, the filters do all of the heavy lifting. The inbound filters run before proxying the request and can be used for authentication, routing, or decorating the request. The endpoint filters can either be used to return a static response or proxy the request to the backend service (or origin as we call it). The outbound filters run after a response has been returned and can be used for things like gzipping, metrics, or adding/removing custom headers.

Zuul's functionality depends almost entirely on the logic that you add in each filter. That means you can deploy it in multiple contexts and have it solve different problems based on the configurations and filters it is running.

We use Zuul at the entrypoint of all external traffic into Netflix's cloud services and we've started using it for routing internal traffic, as well. We deploy the same core but with a substantially reduced amount of functionality (i.e. fewer filters). This allows us to leverage load balancing, self service routing, and resiliency features for internal traffic.

## Open Source

The Zuul code that's running today is the most stable and resilient version of Zuul yet. The various phases of evolving and refactoring the codebase have paid dividends and we couldn't be happier to share it with you.

Today we are releasing many [core features](https://github.com/Netflix/zuul/wiki/Core-Features) . Here are the ones we're most excited about:

### Server Protocols

- **HTTP/2** - full server support for inbound HTTP/2 connections
- **Mutual TLS** - allow for running Zuul in more secure scenarios

### Resiliency Features

- **Adaptive Retries** - the core retry logic that we use at Netflix to increase our resiliency and availability
- **Origin Concurrency Protection** - configurable concurrency limits to protect your origins from getting overloaded and protect other origins behind Zuul from each other

### Operational Features

- **Request Passport** - track all the lifecycle events for each request, which is invaluable for debugging async requests
- **Status Categories** - an enumeration of possible success and failure states for requests that are more granular than HTTP status codes
- **Request Attempts** - track proxy attempts and status of each, particularly useful for debugging retries and routing

We are also working on some features that will be [coming soon](https://github.com/Netflix/zuul/wiki/Coming-Soon) , including:

- **Websocket/SSE** - support for side-channel push notifications
- **Throttling and rate-limiting** - protection from malicious client connections and requests, helping defend against volumetric attacks
- **Brownout filters** - for disabling certain CPU-intensive features when Zuul is overloaded
- **Configurable routing** - file-based routing configuration, instead of having to create routing filters in Zuul

We would love to hear from you and see all the new and interesting applications of Zuul. For instructions on getting started, please visit our [wiki page](https://github.com/Netflix/zuul/wiki/Getting-Started-2.0) .

## Leveraging Zuul 2 at Netflix

Internally, there are several major features that we've been working on but have not open sourced yet. Each one deserves its own blog post, but let's go over them briefly.

## Self Service Routing

The most widely-used feature by our partners is self service routing. We provide an application and API for users to create routing rules based on any criteria in the request URL, path, query params, or headers. We then publish these routing rules to all the Zuul instances.

## Get Netflix Technology Blog 's stories in your inbox

Join Medium for free to get updates from this writer.

Enter your email

Subscribe

Subscribe

- [x] Remember me for faster sign in

Remember me for faster sign in

The main use case is for routing traffic to a specific test or staging cluster. However, there are many use cases for real production traffic. For example:

- Services needing to shard their traffic create routing rules that map certain paths or prefixes to separate origins
- Developers onboard new services by creating a route that maps a new hostname to their new origin
- Developers run load tests by routing a percentage of existing traffic to a small cluster and ensuring applications will degrade gracefully under load
- Teams refactoring applications migrate to a new origin slowly by creating rules mapping traffic gradually, one path at a time
- Teams test changes (canary testing) by sending a small percentage of traffic to an instrumented cluster running the new build
- If teams need to test changes requiring multiple consecutive requests on their new build, they run sticky canary tests that route the same users to their new build for brief periods of time
- Security teams create rules that reject "bad" requests based on path or header rules across all Zuul clusters

As you can see we use self service routing extensively and are increasing the customizability and scope of routes to allow for even more use cases.

## Load Balancing for Resiliency

Another major feature we've worked on is making load balancing to origins more intelligent. We are able to route around failures, slowness, GC issues, and various other things that crop up often when running large amounts of nodes. The goal of this work is to increase resiliency, availability, and quality of service for all Netflix services.

We have several cases that we handle:

### Cold Instances

When new origin instances start up, we send them a reduced amount of traffic for some time, until they're warmed up. This was an issue we observed for applications with large codebases and huge metaspace usage. It takes a significant amount of time for these apps to JIT their code and be ready to handle a large amount of traffic.

We also generally bias the traffic to older instances and if we happen to hit a cold instance that throttles, we can always retry on a warm one. This gives us an order of magnitude improvement in availability.

### High Error Rates

Errors happen all the time and for varying reasons, whether it's because of a bug in the code, a bad instance, or an invalid configuration property being set. Fortunately, as a proxy, we can detect errors reliably - either we get a 5xx error or there are connectivity problems to the service.

We track error rates for each origin and if the error rate is high enough, it implies the entire service is in trouble. We throttle retries from devices and disable internal retries to allow the service to recover. Moreover, we also track successive failures per instance and blacklist the bad ones for a period of time.

### Overloaded Instances

With the above approaches we send less traffic to servers in a cluster that are throttling or refusing connections, and lessened the impact by retrying those failed requests on other servers.

We're now rolling out an additional approach where we aim to avoid overloading servers in the first place. This is achieved by allowing origins to signal to Zuul their current utilization, which Zuul then uses as a factor in its load-balancing choices - leading to reduced error rates, retries, and latency.

The origins add a header to all responses stating their utilization as a percentage, along with a target utilization they would like to have across the cluster. Calculating the percentage is completely up to each application and engineers can use whatever metric suits them best. This allows for a general solution as opposed to us trying to come up with a one-size-fits-all approach.

With this functionality in place, we assign a score (combination of instance utilization and other factors like the ones above) to each instance and do a choice-of-two load balancing selection.

## Anomaly Detection and Contextual Alerting

As we grew from just a handful of origins to a new world where anyone can quickly spin up a container cluster and put it behind Zuul, we found there was a need to automatically detect and pinpoint origin failures.

With the help of [Mantis real time event streaming](https://medium.com/netflix-techblog/stream-processing-with-mantis-78af913f51a6) , we built an anomaly detector that aggregates error rates per service and notifies us in real time when services are in trouble. It takes all of the anomalies in a given time window and creates a timeline of all the origins in trouble. We then create a contextual alert email with the timeline of events and services affected. This allows an operator to quickly correlate these events and orient themselves to debug a specific app or feature, and ultimately find the root cause.

In fact, it was so useful that we expanded it to send notifications to the origin teams themselves. We've also added more internal applications, other than Zuul, and can build a much more extensive timeline of events. This has been a huge help during production incidents and helps operators quickly detect and fix problems before they cascade into massive outages.

We hope to open source as many of the above features as we can. Keep watching the tech blog for more depth on them in the future. If you want to help us solve these kinds of problem, please check out our [jobs site](https://jobs.netflix.com/teams/engineering?team=Product+Engineering&organization=Engineering) .

- Arthur Gonigberg ( @agonigberg ), Mikey Cohen (@moldfarm ), Michael Smith (@kerumai ), Gaya Varadarajan ( @gaya3varadhu ), Sudheer Vinukonda ( @apachesudheerv ), Susheel Aroskar (@susheelaroskar )

[Zuul](https://medium.com/tag/zuul?source=post_page-----82ea476cb2b3---------------------------------------)

[Api Gateway](https://medium.com/tag/api-gateway?source=post_page-----82ea476cb2b3---------------------------------------)

[Cloud Gateway](https://medium.com/tag/cloud-gateway?source=post_page-----82ea476cb2b3---------------------------------------)

[Netflixoss](https://medium.com/tag/netflixoss?source=post_page-----82ea476cb2b3---------------------------------------)

[Cloud Computing](https://medium.com/tag/cloud-computing?source=post_page-----82ea476cb2b3---------------------------------------)

Netflix TechBlog

<!-- image -->

Netflix TechBlog

<!-- image -->

Follow

## [Published in Netflix TechBlog](https://netflixtechblog.com/?source=post_page---post_publication_info--82ea476cb2b3---------------------------------------)

[183K followers](/followers?source=post_page---post_publication_info--82ea476cb2b3---------------------------------------)

[Last published 4 days ago](/the-human-infrastructure-how-netflix-built-the-operations-layer-behind-live-at-scale-33e2a311c597?source=post_page---post_publication_info--82ea476cb2b3---------------------------------------)

Learn about Netflix's world class engineering efforts, company culture, product developments and more.

Follow

Netflix Technology Blog

<!-- image -->

Netflix Technology Blog

<!-- image -->

## [Written by Netflix Technology Blog](https://netflixtechblog.medium.com/?source=post_page---post_author_info--82ea476cb2b3---------------------------------------)

[454K followers](https://netflixtechblog.medium.com/followers?source=post_page---post_author_info--82ea476cb2b3---------------------------------------)

[1 following](https://medium.com/@netflixtechblog/following?source=post_page---post_author_info--82ea476cb2b3---------------------------------------)

Learn more about how Netflix designs, builds, and operates our systems and engineering organizations

## Responses ( 8 )

See all responses

[Help](https://help.medium.com/hc/en-us?source=post_page-----82ea476cb2b3---------------------------------------)

[Status](https://status.medium.com/?source=post_page-----82ea476cb2b3---------------------------------------)

[About](https://medium.com/about?autoplay=1&source=post_page-----82ea476cb2b3---------------------------------------)

[Careers](https://medium.com/jobs-at-medium/work-at-medium-959d1a85284e?source=post_page-----82ea476cb2b3---------------------------------------)

[Press](mailto:pressinquiries@medium.com)

[Blog](https://blog.medium.com/?source=post_page-----82ea476cb2b3---------------------------------------)

[Privacy](https://policy.medium.com/medium-privacy-policy-f03bf92035c9?source=post_page-----82ea476cb2b3---------------------------------------)

[Rules](https://policy.medium.com/medium-rules-30e5502c4eb4?source=post_page-----82ea476cb2b3---------------------------------------)

[Terms](https://policy.medium.com/medium-terms-of-service-9db0094a1e0f?source=post_page-----82ea476cb2b3---------------------------------------)

[Text to speech](https://speechify.com/medium?source=post_page-----82ea476cb2b3---------------------------------------)