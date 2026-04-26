# CLAUDE.md diff — pending-david-review

**Status:** `pending-david-review`
**File:** `apps/product-helper/CLAUDE.md`
**Author:** TB1 docs (v2.1 closeout)
**Date:** 2026-04-26

Per CLAUDE.md memory rule "NO LIBERTIES with CSS/design" and the file-safety rule (NEVER move/rename/delete without permission, edits to CLAUDE.md require explicit David authorization), the proposed edit is staged here for review before merging.

---

## Section: `## Deployed Features`

### Add (after the Synthesis Pipeline kickoff entry on line 141)

```markdown
- **Synthesis Hardening (v2.1 Wave B)** (Apr 26, 2026) — inputs_hash cache (≥30% hit on 10×5 synthetic load test) + lazy-gen (defer 4-of-7 artifacts: PDF, PPTX, fmea_residual.xlsx, hoq.xlsx) + tier gating (Free 1/mo, Plus∞ — `SYNTHESIS_FREE_TIER_GATE='enabled'` default) + circuit-breaker (30s sidecar timeout → per-artifact retry CTA, **no canned fall-back** per D-V21.17) + Sentry per-agent observability (7 v2 agents, p50/p95/p99 latency, token cost). Code at `lib/cache/synthesis-cache.ts`, `lib/jobs/lazy-gen.ts`, `lib/billing/synthesis-tier.ts`, `lib/jobs/circuit-breaker.ts`, `lib/observability/synthesis-metrics.ts`. Per-artifact retry endpoint at `app/api/projects/[id]/artifacts/[kind]/retry/route.ts`. Cost ~$330/mo at 100 DAU baseline (down from Wave-A unoptimized ~$924/mo; informational, not a ship gate per David 2026-04-25 21:09 EDT). Tag `tb1-wave-b-complete` @ `e56d37f`.
```

---

## Rationale

- Captures the 5 hardening surfaces in one bullet so future Claudes navigating CLAUDE.md see the cache/lazy/tier/breaker/metrics modules.
- Cites file paths so the next agent doesn't re-derive.
- Documents the cost figures as informational (per David's 2026-04-25 21:09 EDT lock) — NOT framed as a budget gate.
- Cites the canonical D-V21.17 anchor for "no canned fall-back" so the rule is durable across agent handoffs.

## How to apply

Open `apps/product-helper/CLAUDE.md`, insert the markdown block above immediately after line 141 (the existing "Synthesis Pipeline kickoff" entry), preserve all other content, commit with message `docs(claude-md): v2.1 Wave-B hardening entry in Deployed Features`.

## Authorization gate

David: please reply "approved" (or with edits) on this diff before TB1 docs commits to `apps/product-helper/CLAUDE.md`. Until approved, no CLAUDE.md edit lands.
