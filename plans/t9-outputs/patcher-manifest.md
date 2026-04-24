# T9 Patcher Manifest — Crawley → KB 05-crawley/ patch pass

**Agent:** patcher (T9 team `c1v-kb-hygiene`)
**Date:** 2026-04-24
**Spec:** `plans/c1v-MIT-Crawley-Cornell.v2.md` §0.2.5 Agent 3
**Matrix source:** v2 §0.2.4
**Findings source:** `plans/research/crawley-book-findings.md` (646 lines, §§6.1–7)

## R-v2.1 compliance note

R-v2.1 (research gap pass) was checked against findings file §7 Status Summary, which states: "All 14 required chapters per v2 §0.2.4 now have patcher-ready authoring depth (≥200 words grounded in the markdown extract, with line-number citations). No chapter was absent from the extract." **No MISSING stubs required.** No content was fabricated; all excerpts are trimmed from the findings file.

## Patch table

| KB (new path) | Chapter | Status | Source location (findings.md) | Word count | Notes |
|---|---|---|---|---|---|
| `1-defining-scope/05-crawley/` | Ch 1 Introduction | patched | §6 Ch 1 (lines 271–294) | 370 | `ch01-introduction-to-system-architecture.md` |
| `1-defining-scope/05-crawley/` | Ch 2 System Thinking | patched | §6 Ch 2 (lines 297–328) | 440 | `ch02-system-thinking.md` |
| `2-requirements/05-crawley/` | Ch 11 Needs→Goals | verified | existing `crawley-ch11-needs-to-goals.md` (654 lines) | 90 (note only) | `ch11-needs-to-goals.verified.md` — no drift, points to canonical in-tree file |
| `2-requirements/05-crawley/` | Ch 13 Decomposition | verified | existing `crawley-ch13-decomposition-heuristics.md` (456 lines) | 160 (note only) | `ch13-decomposition.verified.md` — no drift, Box 13.8 supplement pointer to KB-3 copy |
| `3-ffbd/05-crawley/` | Ch 5 Function | patched | §6 Ch 5 (lines 398–429) | 470 | `ch05-function.md` — §5.5 functional-interaction procedure + PO Array |
| `3-ffbd/05-crawley/` | Ch 13 Decomposition | patched | §6 Ch 13 (lines 550–581) | 500 | `ch13-decomposition.md` — includes Box 13.8 full 12-plane list |
| `4-decision-net-crawley-on-cornell/05-crawley/` | Ch 12 Concept Generation | patched | §6 Ch 12 (lines 532–547) | 380 | `ch12-concept-generation.md` |
| `4-decision-net-crawley-on-cornell/05-crawley/` | Ch 14 Decision-Making | patched | §6 Ch 14 (lines 585–596) + findings §3.2 | 390 | `ch14-decision-making-process.md` |
| `4-decision-net-crawley-on-cornell/05-crawley/` | Ch 15 Tradespaces | patched | §6 Ch 15 (lines 600–611) | 360 | `ch15-tradespaces.md` — four-quadrant sequencing |
| `4-decision-net-crawley-on-cornell/05-crawley/` | Ch 16 Optimization | patched | §6 Ch 16 (lines 615–635) | 440 | `ch16-optimization-problems.md` — six Selva patterns |
| `5-form-function/05-crawley/` | Ch 4 Form | patched | §6 Ch 4 (lines 364–394) | 500 | `ch04-form.md` |
| `5-form-function/05-crawley/` | Ch 5 Function | patched | §6 Ch 5 (lines 398–429) | 430 | `ch05-function.md` (KB-5 scoped variant) |
| `5-form-function/05-crawley/` | Ch 6 Synthesis | patched | §6 Ch 6 (lines 432–458) | 500 | `ch06-synthesis.md` — non-1:1 taxonomy + interface spec |
| `5-form-function/05-crawley/` | Ch 7 SNF | patched | §6 Ch 7 (lines 462–490) | 490 | `ch07-solution-neutral-function.md` |
| `5-form-function/05-crawley/` | Ch 8 Concept→Architecture | patched | §6 Ch 8 (lines 494–520) | 490 | `ch08-concept-to-architecture.md` |
| `6-hoq/05-crawley/` | Ch 16 §Patterns | patched | §6 Ch 16 (lines 621–635) | 450 | `ch16-selva-patterns.md` — six-pattern HoQ shapes |
| `7-interfaces/05-crawley/` | Ch 5 §Functional Interactions | patched | §6 Ch 5 §5.5 (lines 411–413) | 400 | `ch05-functional-interactions.md` |
| `7-interfaces/05-crawley/` | Ch 6 §6.3 interfaces + non-1:1 | patched | §6 Ch 6 (Figure 6.5 + Figure 6.11) | 470 | `ch06-interface-spec-and-non-idealities.md` |
| `8-risk/05-crawley/` | — | skipped | no Crawley content per matrix | 0 | FMEA lineage is MIL-STD-1629 / INCOSE, not Crawley |
| `9-stacks-atlas/05-crawley/` | — | skipped | no Crawley content per matrix | 0 | Atlas is empirical grounding, not methodology source |
| `_shared/05-crawley/` | Ch 3 Complex Systems | patched | §6 Ch 3 (lines 332–360) | 490 | `ch03-complex-systems.md` — cross-cutting toolkit |
| `_shared/05-crawley/` | Ch 7 SNF | patched | §6 Ch 7 (lines 462–490) | 440 | `ch07-solution-neutral-function.md` — cross-KB reference |

## 07-atlas-references.md pass

Atlas references delivered for v1 §6.3 consumers (M4/M5/M6 = KB-4/KB-5/KB-6):

| KB | File | Atlas entries cited | Notes |
|---|---|---|---|
| `4-decision-net-crawley-on-cornell/` | `07-atlas-references.md` | 11 | Decision-node empirical priors for cost/latency/throughput/availability |
| `5-form-function/` | `07-atlas-references.md` | 11 | Morphological-matrix instrument population from real-world stacks |
| `6-hoq/` | `07-atlas-references.md` | 11 | HoQ quantitative-cell population + roof-correlation justification |

All three reference files cite the 11 atlas companies as of T9 patcher pass (airbnb, anthropic, cloudflare, discord, dropbox, etsy, linkedin, netflix, shopify, stripe, uber). All pass R2 gate (≥7 entries; `provisional: true` + `sample_size: N` metadata required on consumption).

## Summary

- **Total chapters patched:** 18 file-instances across 7 KBs + `_shared` (Ch 5 and Ch 13 each patched in two KBs because Crawley matrix assigned them twice; Ch 7 also exists in both KB-5 and `_shared`).
- **Verified-only (no re-author):** 2 — KB-2 Ch 11 and Ch 13 (existing in-tree files are canonical).
- **MISSING stubs:** 0 (findings file §7 confirms all 14 required chapters present with ≥200 words).
- **KBs touched:** 7 (KB-1, KB-2, KB-3, KB-4, KB-5, KB-6, KB-7) + `_shared`.
- **KBs skipped per matrix:** 2 (KB-8 risk, KB-9 atlas — no Crawley column).
- **07-atlas-references.md files created:** 3 (KB-4, KB-5, KB-6).
- **Fabricated content:** none — all excerpts trimmed from findings file.
- **Existing files modified:** none — patcher only created new files per guardrail.

## Blockers

None.

## Follow-ups (not in patcher scope)

- Future T9 refinement may extract duplicated Ch 5 / Ch 7 / Ch 13 content into `_shared/05-crawley/` symlinks and point KB-3/KB-5/KB-7 at them, mirroring the structurer's `_shared/` pattern for cross-cutting sw-design KBs.
- KB-2's existing `crawley-ch11-needs-to-goals.md` and `crawley-ch13-decomposition-heuristics.md` should be audited for any updates since findings §6 was authored; if new content lands, re-verify via a `.verified.md` diff note.
