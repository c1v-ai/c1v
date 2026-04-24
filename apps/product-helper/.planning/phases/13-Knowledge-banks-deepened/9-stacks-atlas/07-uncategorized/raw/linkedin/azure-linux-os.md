---
source_url: "https://www.linkedin.com/blog/engineering/architecture/navigating-the-transition-adopting-azure-linux-as-linkedins-operatingsystem"
retrieved_at: "2026-04-23T05:10:00Z"
publish_date: "2024-08-19"
source_tier: "B_official_blog"
sha256: "3b7b2d2ec26edccbbf5c0101c13b411f2fc6d5a66821f5579debe4db5a8b4b8b"
bytes: 112845
filing_type: "blog"
author: "Ievgen Priadka, Sweekar Pinto, Bubby Rayber"
is_ic: true
---

# Navigating the transition: adopting Azure Linux as LinkedIn's operating system

Raw bytes at `_sources/azure-linux-os.html`. Content extracted via WebFetch 2026-04-23.

## Scale and migration numbers

| Metric | Value |
|---|---|
| Member base served | **>1 billion members worldwide** |
| Azure Linux migration completion | "nearly all" servers/VMs/containers as of April 2024 |
| Azure Linux Developer VMs deployed | **>1,500 (and growing)** |
| Migration completion at post | 95%+ |
| Bootstrap time improvement | "over an hour → 10-30 minutes" |

## Architectural claims

- **Legacy**: CentOS 7 (reached end-of-life, forcing migration)
- **New OS**: Azure Linux (formerly CBL-Mariner, Microsoft's distribution)
- **Image tooling**: Azure Linux Image Customizer for image-based installation
- **Filesystem**: Migrated to XFS (from legacy EXT4) for improved performance
- **Init + networking**: Moved off legacy SystemD / network scripts to modern stack
- **Container builds**: Container Image Builder with converted package repositories
- **Driver signing**: Replaced DKMS with upstream Microsoft-signed drivers

## Migration drivers

1. CentOS 7 end-of-life (forcing function)
2. Compliance: 30-day security update mandate (requires modern package pipeline)
3. Cost efficiencies via Microsoft partnership (internal Azure-on-Azure tax optimization)
4. Modern hardware firmware support (CentOS 7 kernel couldn't enable newer hardware features)

## Interpretation for priors

- **Fleet-size anchor**: >1B members served + "nearly all servers/VMs/containers" on Azure Linux as of April 2024 is the narrative for LinkedIn's compute fleet scale. Absolute server count NOT disclosed. Reasonable synthetic estimate: 1B members / member-to-server ratios from public talks put LinkedIn fleet in the tens of thousands of servers, but that's inference not citation.
- **Deployment architecture**: LinkedIn runs on Azure post-MSFT acquisition (Azure Linux confirms the Azure-native substrate). gpu_exposure / cloud positioning: `rents_long_term` from Azure (enterprise commit).
- **OS migration pattern**: Bootstrap time improvement (>60min → 10-30 min, ~3-6× speedup) is a narrative latency anchor for infrastructure provisioning prior, though not a query-serving latency.

## is_ic assessment

All 3 authors carry IC titles per LinkedIn Engineering blog byline conventions:
- **Ievgen Priadka**: Infrastructure engineer role
- **Sweekar Pinto**: Dev/Tools engineer role
- **Bubby Rayber**: Hardware Provisioning engineer role

Treated as **is_ic=true**. LinkedIn Engineering blog is generally IC-authored (vs LinkedIn's main corporate press blog which is marketing). If curator wants tighter verification, authors' LinkedIn profiles are linked from the byline in the raw HTML.