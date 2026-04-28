# Phase 8: Basement Part 3 -- Technical Difficulty, Cost, and Re-Evaluation
> Corresponds to QFD Guide Steps 16, 17, 18

## Prerequisites
- [ ] Phase 7 is complete (units, competitor EC values, and thresholds documented)
- [ ] Required inputs: EC list, main floor matrix (Phase 4), roof matrix (Phase 5), imputed importance (Phase 6)

## Context (Why This Matters)

You might want to significantly improve a particular engineering characteristic, but if it is technically very difficult or prohibitively expensive, that desire needs to be tempered with reality. Technical difficulty and cost ratings add the final layer of pragmatism before you set design targets. More importantly, this phase includes a **re-evaluation step** -- the most commonly overlooked part of the QFD process -- where you revisit the main floor and roof relationships in light of what you now know about difficulty and cost.

## Instructions

### Step 8.1: Rate Technical Difficulty (1-5 per EC)

For each engineering characteristic, assign a technical difficulty score on a 1-5 scale:

| Score | Meaning |
|-------|---------|
| 1 | Very easy -- well-understood, standard practice |
| 2 | Somewhat easy -- minor challenges expected |
| 3 | Moderate -- requires meaningful expertise and effort |
| 4 | Difficult -- significant technical challenges |
| 5 | Very difficult -- cutting-edge, uncertain feasibility |

**Factors to consider** (separately or combined into one score):
- Technical difficulty to develop a solution the first time
- Technical difficulty to change the EC once initial work is done
- Expertise level required
- Amount of labor time needed
- Kind of equipment necessary to use

Some companies have formal definitions for each score level. If this is your first QFD, even a rough estimate is valuable. Assess the difficulty of the tasks directly associated with that EC, not the ripple effects on other ECs (those are captured in the roof).

Record technical difficulty in a new basement row.

### Step 8.2: Rate Cost (1-5 per EC)

For each EC, assign a cost score on the same 1-5 scale:

| Score | Meaning |
|-------|---------|
| 1 | Very inexpensive |
| 2 | Low cost |
| 3 | Moderate cost |
| 4 | Expensive |
| 5 | Very expensive |

**Cost factors to consider:**
- Fixed costs (one-time investments)
- Variable / non-fixed costs
- Labor costs
- Materials costs
- Equipment costs (including machine time)
- Testing costs (every change may require re-validation)
- Rate at which costs change as you adjust the EC

As with technical difficulty, a single combined score is fine for a first pass. Formalize later as you gather more data.

Record estimated cost in another new basement row.

### Step 8.3: Re-Evaluate Relationships (CRITICAL STEP)

**This step is required, not optional.** With technical difficulty and cost data now visible, revisit the main floor (EC-to-PC) and roof (EC-to-EC) relationships. The question is:

> "Now that I know what is cheap/easy and what is expensive/hard, should any relationships be adjusted?"

**Example -- CDN configuration re-evaluation:**
You might have recorded that increasing CDN Cache Hit Rate has a moderate positive effect on Server Response Time in the roof. But now you see that CDN Cache Hit Rate is rated difficulty=1 (well-understood, standard CDN configuration) and cost=1 (CDN providers like Cloudflare offer generous free tiers). Since improving cache hit rate is cheap and easy, you may decide to **increase** the positive influence — because aggressive caching is essentially free leverage. See [CDN & Networking KB](cdn-networking-kb.md).

**Example -- Custom search engine re-evaluation:**
Seeing that Database Query Latency has high technical difficulty (4) and relates to building a custom product search, you might decide to **increase** the negative influence that Peak Traffic Capacity has on Database Query Latency. Under high load, the already-difficult search queries become even slower and harder to optimize. This might push the team toward a managed search service (like Algolia or Elasticsearch) rather than building custom — a decision that creates a new **interface** to define in Module 6. See [Data Model KB](data-model-kb.md).

**What to do:**
1. Review each EC with difficulty >= 4 or cost >= 4. Ask: should any relationship values involving this EC be adjusted?
2. Review each EC with difficulty <= 2 and cost <= 2. Ask: can any negative relationships involving this EC be softened because it is easy/cheap to compensate?
3. Document every change: which cell changed, from what value, to what value, and why
4. If any main floor values changed, **recalculate the affected imputed importance scores** (return to Phase 6 formulas for those specific ECs)

### Step 8.4: Document Your Re-Evaluation

For the course project and professional practice, you must record:
- Which cells were changed
- The old value and new value
- The reasoning for each change

This can be a simple table:

| Cell (EC × PC or EC × EC) | Old Value | New Value | Reasoning |
|---------------------------|-----------|-----------|-----------|
| Peak Traffic × DB Query Latency (main floor) | -1 | -2 | Custom search is difficulty=4; high traffic makes it even harder |
| CDN Cache Hit Rate × Server Response Time (roof) | +1 | +2 | CDN tuning is cheap (cost=1) and easy (difficulty=1) — free leverage |

## Worked Example

In the e-commerce platform QFD:
- CDN Cache Hit Rate: difficulty=1, cost=1 (standard configuration, cheap CDN tiers)
- Frontend Bundle Size: difficulty=2, cost=1 (well-understood optimization, free tooling)
- Database Query Latency (custom search): difficulty=4, cost=3 (requires search expertise, possibly a managed service)
- Automated Failover Coverage: difficulty=4, cost=4 (complex distributed systems engineering, multi-region hosting costs)

Re-evaluation decisions:
1. Increased the positive relationship between CDN Cache Hit Rate and Server Response Time from +1 to +2, because CDN optimization is cheap and easy — it is essentially free performance
2. Increased the negative relationship between Peak Traffic Capacity and Database Query Latency from -1 to -2, because the custom search subsystem is technically difficult (difficulty=4) and high traffic compounds the challenge
3. Recalculated imputed importance for CDN Cache Hit Rate (now even more strongly positive — confirms it as the top leverage point)

> **Non-technical insight:** The re-evaluation often reveals that the cheapest, easiest improvements (CDN tuning, caching configuration) have outsized impact — while the expensive, difficult improvements (custom search, failover automation) need careful cost-benefit analysis before committing.

## Validation Checklist (STOP-GAP)
- [ ] Every EC has a technical difficulty score (1-5)
- [ ] Every EC has an estimated cost score (1-5)
- [ ] Both scores are recorded in the QFD basement
- [ ] The re-evaluation step was performed: you reviewed relationships in light of difficulty/cost
- [ ] Any changes to main floor or roof values are documented with old value, new value, and reasoning
- [ ] If any main floor values changed, imputed importance has been recalculated for the affected ECs
- [ ] The math check from Phase 6 still holds: Positive II + Negative II = Total II for all affected ECs

> **STOP: Do not proceed to Phase 9 until ALL validation items pass.**
> The re-evaluation is the most commonly skipped step. If you changed zero relationships, confirm that you genuinely reviewed them and found no adjustments warranted -- do not simply skip the review.

## Output Artifact
Two new basement rows (technical difficulty, cost per EC). A documented re-evaluation table showing any relationship changes and their rationale. Updated imputed importance values if any main floor cells changed.

## Handoff to Next Phase
You now have the complete analytical foundation: relationship matrices, imputed importance, competitor data, difficulty, and cost. Phase 9 uses all of this to make the actual design decisions -- setting your **design targets**.

---

**← Previous:** [Phase 7: Basement Part 2 -- Competitor EC Values](07_BASEMENT-PART2--COMPETITOR-EC-VALUES.md) | **Next →** [Phase 9: Design Targets](09_DESIGN-TARGETS.md)
