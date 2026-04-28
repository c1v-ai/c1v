# 17 — From Decision Matrix to Quality Function Deployment (QFD)

## What You Built

In this module you built a complete Decision Matrix — a tool for comparing solution options against weighted, normalized performance criteria. You now know how to:

- Identify solution-independent performance criteria
- Define objective measures (direct and scaled) with unambiguous conditions
- Normalize scores to a common 0–1 scale
- Assign consensus-driven weights
- Interpret results with sensitivity analysis and the 10% rule
- Use the matrix as a living tool throughout development

This is a powerful evaluation framework. But it answers one question: **"Which option best meets the customer's needs?"**

## What Comes Next

The next module introduces **Quality Function Deployment (QFD)** and its central artifact, the **House of Quality**. The QFD builds directly on the Decision Matrix foundations — and then goes further.

### What the Decision Matrix Does Well

The Decision Matrix excels at **comparing discrete options** against customer-facing criteria. It tells you which solution scores highest and where each option's strengths and weaknesses lie.

### What the Decision Matrix Cannot Answer

Once you've selected a winning option (or narrowed to a few finalists), new questions emerge:

| Question | Decision Matrix | QFD |
|---|---|---|
| Which option best meets customer needs? | **Yes** — this is its core purpose | Also does this (back porch) |
| What engineering parameters should I target? | No — it evaluates options, not design variables | **Yes** — engineering characteristics + design targets |
| How do my design knobs interact with each other? | No | **Yes** — the roof captures EC-to-EC trade-offs |
| If I increase speed, which criteria improve and which suffer? | No | **Yes** — the relationship matrix maps EC-to-PC impact |
| Where should I focus engineering effort for maximum performance gain? | Indirectly (via performance deltas) | **Yes** — imputed importance ranks ECs by leverage |
| How do my competitors achieve their performance? | No — it only scores them on criteria | **Yes** — competitor EC values show *how* they score well |

### The Conceptual Bridge

Several concepts transfer directly from the Decision Matrix to the QFD:

| Decision Matrix Concept | QFD Equivalent | What Changes |
|---|---|---|
| **Performance Criteria** | **Performance Criteria (PCs)** on the front porch | Same concept, same role — the customer's evaluation dimensions |
| **Weights** (% importance) | **Relative Importance Weights** on the front porch | Same calculation method (rate on 1–5, convert to %) |
| **Options** scored in columns | **Your system + Competitors** scored on the back porch | QFD scores systems on PCs, similar to Decision Matrix scoring |
| **Normalized, weighted scores** | **Back-porch competitive analysis** | Same normalization and weighting logic |
| **Sensitivity analysis** | **Design target iteration** (Phase 9) and **re-evaluation** (Phase 8) | QFD formalizes "what if" analysis across the entire matrix |

The QFD does not replace the Decision Matrix — it extends the analysis into the *engineering design space*. Where the Decision Matrix asks "which option wins?", the QFD asks "what specific design values will make our option win, and what are the trade-offs?"

### New Concepts the QFD Introduces

These have no Decision Matrix equivalent and represent the QFD's unique analytical power:

- **Engineering Characteristics (ECs)** — the design "knobs" you control (speed, weight, cost, algorithm quality)
- **Relationship Matrix** (main floor) — how each EC affects each PC (+2 to −2 scale)
- **Interrelationship Matrix** (roof) — how each EC affects other ECs (trade-offs within your design)
- **Imputed Importance** — a weighted summary of each EC's total influence on performance
- **Design Targets** — the specific values you choose for each EC, justified by data

## When to Use Each Tool

| Situation | Use |
|---|---|
| Comparing 2+ discrete solution options | **Decision Matrix** |
| Selecting a vendor, technology, or component | **Decision Matrix** |
| Setting engineering design targets for a chosen solution | **QFD** |
| Understanding trade-offs between design parameters | **QFD** |
| Defending design decisions to stakeholders with traceable rationale | **QFD** (or both) |
| Early-stage concept selection before detailed design | **Decision Matrix first**, then QFD |

## Ready to Begin

If you have a system or product concept selected (possibly using a Decision Matrix), you are ready to start the QFD. Open **[Phase 0: QFD Overview and Terminology](../../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/MD_for_LLM/00_QFD-OVERVIEW-AND-TERMINOLOGY.md)** to begin.

---

**← Previous:** [16 — Decision Matrix Template Instructions](16%20-%20Decision%20Matrix%20Template%20Instructions.md) | **Back to** [00 — Module Overview](00%20-%20Module%20Overview.md)
