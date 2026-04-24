# Networking & CDN — DNS, Load Balancing, TLS, CDN, and DDoS Protection

## Context (Why This Matters)

Every request in a distributed system travels through multiple networking layers before reaching your application code. Understanding these layers — how users are routed to the nearest server, how traffic is distributed, how connections are secured, and how attacks are mitigated — is essential for designing systems that are fast, reliable, and secure at global scale. Many performance and availability problems are networking problems, not application problems.

---

## DNS (Domain Name System)

DNS translates human-readable domain names (e.g., `example.com`) into IP addresses that computers use to route traffic.

### How DNS Resolution Works

```
User types example.com
    ↓
Browser checks local cache → miss
    ↓
OS resolver checks its cache → miss
    ↓
Recursive resolver (ISP or 8.8.8.8) queries:
    1. Root nameserver → "ask .com TLD"
    2. .com TLD nameserver → "ask ns1.example.com"
    3. Authoritative nameserver → "IP is 93.184.216.34"
    ↓
IP address cached at every level (TTL = time to live)
    ↓
Browser connects to 93.184.216.34
```

### DNS-Based Traffic Routing

DNS can do more than simple name resolution — it can route users to different servers based on geography, health, or load:

| Strategy | How It Works | Use Case |
|----------|-------------|----------|
| **GeoDNS** | Returns different IP addresses based on the user's geographic location | Route European users to EU servers, US users to US servers |
| **Weighted DNS** | Distributes traffic across IPs by assigned weights (e.g., 70/30 split) | Gradual migration between data centers, canary releases |
| **Failover DNS** | Returns a backup IP if the primary server fails health checks | Disaster recovery |
| **Latency-based DNS** | Returns the IP with the lowest measured latency to the user | Multi-region deployments (AWS Route 53) |

### DNS TTL Trade-Offs

| Short TTL (e.g., 60s) | Long TTL (e.g., 86400s / 24h) |
|----------------------|-------------------------------|
| Fast failover — DNS changes propagate quickly | Fewer DNS lookups — faster repeat visits |
| Higher DNS query volume (more load on nameservers) | Slow failover — old IPs cached for hours |
| Appropriate for dynamic environments | Appropriate for stable infrastructure |

---

## Load Balancing

A load balancer distributes incoming traffic across multiple backend servers to prevent any single server from being overwhelmed.

### L4 vs L7 Load Balancing

| Layer | Operates On | Sees | Decisions Based On | Speed |
|-------|------------|------|-------------------|-------|
| **L4 (Transport)** | TCP/UDP packets | IP addresses, ports | Source/destination IP, port numbers | Very fast — no payload inspection |
| **L7 (Application)** | HTTP requests | URLs, headers, cookies, body | URL path, HTTP method, headers, cookies, content type | Slower — must parse HTTP, but much more flexible |

**When to use each:**
- **L4:** High-throughput, protocol-agnostic balancing (e.g., distributing TCP connections across database replicas)
- **L7:** Most web applications — route `/api/*` to API servers, `/images/*` to media servers, apply rate limiting per user

### Load Balancing Algorithms

| Algorithm | How It Works | Best For |
|-----------|-------------|----------|
| **Round-robin** | Requests distributed sequentially: server 1, 2, 3, 1, 2, 3... | Servers with equal capacity, stateless requests |
| **Weighted round-robin** | Same as round-robin but servers with higher weights get more traffic | Mixed server capacities (e.g., 8-core and 16-core machines) |
| **Least connections** | Route to the server with the fewest active connections | Requests with variable processing times |
| **Consistent hashing** | Hash the request key (e.g., user ID) to determine the server. Same key always goes to the same server. | Sticky sessions, caching layers (same user hits same cache) |
| **Random** | Pick a server at random | Simple, surprisingly effective for large server pools |

### Health Checks

Load balancers periodically check backend servers to ensure they can handle traffic:
- **Active health checks:** Load balancer sends periodic requests (e.g., `GET /health` every 10s). If a server fails N consecutive checks, it's removed from the pool.
- **Passive health checks:** Load balancer monitors live traffic. If a server returns too many errors, it's marked unhealthy.

### Global Server Load Balancing (GSLB)

For multi-region deployments, GSLB combines DNS-based routing with load balancing:

```
User in Tokyo → DNS returns Tokyo region IP → Regional L7 load balancer → Backend servers in Tokyo
User in NYC → DNS returns US-East region IP → Regional L7 load balancer → Backend servers in US-East
```

If the Tokyo region goes down, DNS health checks detect the failure and redirect Tokyo users to the nearest healthy region.

---

## CDN (Content Delivery Network)

A CDN is a geographically distributed network of edge servers that cache and serve content close to users. Instead of optimizing for memory vs. disk speed (like application-level caching), CDNs optimize for **network latency** — the physical distance between user and server.

### The Problem CDNs Solve

| Without CDN | With CDN |
|-------------|----------|
| Every request travels to the origin server (e.g., Virginia → Australia = ~300–350ms round trip) | Request hits the nearest edge server (~20–40ms round trip) |
| Origin server handles all traffic | Edge servers handle the majority of read traffic |
| Origin is a single point of failure | CDN is distributed across hundreds of PoPs |

### How a CDN Works

```
User requests image.jpg
    ↓
Request routed to nearest PoP (via DNS or Anycast)
    ↓
Edge server checks cache:
    HIT → return immediately (~20ms)
    MISS → fetch from origin → cache at edge → return to user
    ↓
Subsequent requests from same region → served from edge cache
```

### CDN Routing Methods

| Method | How It Works |
|--------|-------------|
| **DNS-based routing** | Each PoP has its own IP address. DNS returns the IP of the closest PoP based on the user's location. |
| **Anycast** | All PoPs share the same IP address. The network itself routes the request to the nearest PoP. More resilient to DDoS (attack traffic is diffused across all PoPs). |

### What CDNs Can Cache

| Content Type | Examples | Cacheability |
|-------------|---------|-------------|
| **Static assets** | Images, CSS, JavaScript, fonts, videos | Highly cacheable — this is the primary CDN use case |
| **Public API responses** | Product listings, public profiles | Cacheable with appropriate TTL |
| **HTML pages** | Static pages, server-rendered pages | Cacheable if not personalized |
| **Dynamic content** | Personalized feeds, user-specific data | Generally not cached at the CDN — served from origin |

### CDN Beyond Caching

Modern CDNs do more than cache static files:

| Capability | How It Helps |
|-----------|-------------|
| **TLS termination** | CDN terminates HTTPS connections at the edge, reducing latency for the TLS handshake (TLS 1.2 requires multiple round trips). This is why even dynamic, uncacheable content benefits from a CDN. |
| **Content transformation** | Minify JavaScript, convert images to modern formats (WebP, AVIF) on the fly |
| **Edge compute** | Run logic at the edge (Cloudflare Workers, Lambda@Edge) for personalization, A/B testing, auth checks |
| **DDoS protection** | CDN's massive distributed capacity absorbs volumetric attacks (see Security section below) |

### CDN Technologies

| CDN Provider | Strengths |
|-------------|-----------|
| **CloudFront** (AWS) | Deep integration with S3, Lambda@Edge, WAF |
| **Cloudflare** | Anycast network, Workers edge compute, generous free tier |
| **Akamai** | Largest legacy CDN, enterprise-focused |
| **Fastly** | Real-time purging, VCL/Compute@Edge for advanced logic |

---

## TLS / HTTPS

TLS (Transport Layer Security) encrypts data in transit between client and server, preventing eavesdropping and tampering.

### TLS Handshake (Simplified)

```
Client → Server: "Hello, I support TLS 1.3, here are my cipher suites"
Server → Client: "Let's use TLS 1.3 with this cipher. Here's my certificate."
Client: Verifies certificate against trusted CA
Client ↔ Server: Key exchange (Diffie-Hellman)
Client ↔ Server: Encrypted communication begins
```

### TLS Performance Considerations

| Concern | Mitigation |
|---------|-----------|
| **Handshake latency** (TLS 1.2 = 2 round trips, TLS 1.3 = 1 round trip) | Use TLS 1.3 where possible. Terminate TLS at the CDN edge to reduce round-trip distance. |
| **Certificate management** | Use automated certificate management (Let's Encrypt, AWS ACM) |
| **TLS termination location** | Terminate at the load balancer or CDN edge. Internal traffic between services can use plain HTTP within a trusted network (VPC). |

---

## Network Security

### DDoS Protection

A Distributed Denial of Service attack overwhelms a system with traffic from many sources.

| Attack Type | Target | Mitigation |
|-------------|--------|-----------|
| **Volumetric** (L3/L4) | Bandwidth — flood the network pipe | CDN/Anycast absorbs and diffuses traffic across hundreds of PoPs |
| **Protocol** (L4) | Connection state — exhaust server connection tables (SYN floods) | SYN cookies, connection rate limiting, L4 firewalls |
| **Application** (L7) | Application resources — expensive API calls, slow queries | WAF (Web Application Firewall), rate limiting, bot detection |

### Network Architecture Concepts

| Concept | Definition | Purpose |
|---------|-----------|---------|
| **VPC** (Virtual Private Cloud) | Isolated network within a cloud provider | Services communicate internally without public internet exposure |
| **Security Groups** | Firewall rules attached to instances | Control which ports/IPs can reach each service |
| **Private subnet** | Network segment with no direct internet access | Database and internal services live here — only reachable via internal load balancers |
| **Public subnet** | Network segment with internet gateway | Load balancers and bastion hosts live here |
| **Zero-trust networking** | Every request is authenticated and authorized, even internal ones | Replaces "trust everything inside the VPC" with per-request verification |

---

## Decision Framework

When designing the networking layer:

1. **DNS:** Choose a routing strategy (GeoDNS, latency-based, failover) based on your deployment topology.
2. **Load balancer:** L7 for most web applications. Choose an algorithm based on your workload (round-robin for stateless, consistent hashing for sticky/cached).
3. **CDN:** Use for all HTTP traffic — even dynamic content benefits from TLS termination at the edge. Static assets and media are the highest-impact use case.
4. **TLS:** Terminate at the edge (CDN or load balancer). Use TLS 1.3. Automate certificate management.
5. **DDoS protection:** CDN + WAF + rate limiting. Anycast networks are especially effective.
6. **Network isolation:** Private subnets for databases and internal services. Security groups as the first line of defense.

## Validation Checklist

- [ ] I can explain how DNS resolution works and the role of TTL.
- [ ] I can describe GeoDNS, weighted DNS, and failover DNS routing strategies.
- [ ] I can distinguish L4 from L7 load balancing and know when to use each.
- [ ] I can name and explain common load balancing algorithms (round-robin, least connections, consistent hashing).
- [ ] I can explain how a CDN works (PoPs, edge servers, cache hit/miss, origin fetch).
- [ ] I can describe DNS-based routing vs Anycast for CDN traffic direction.
- [ ] I can list what CDNs do beyond caching (TLS termination, content transformation, edge compute, DDoS protection).
- [ ] I can explain the TLS handshake and why TLS termination at the edge reduces latency.
- [ ] I can describe the three types of DDoS attacks and their mitigations.
- [ ] I can explain VPC, security groups, private/public subnets, and zero-trust networking.
