# 04 — Avoiding Performance Criteria Pitfalls

## Prerequisites

- [ ] Step 01 complete — you understand what a decision matrix is and why objectivity matters.
- [ ] Step 02 complete — you can define criterion, metric, rubric, weight, and related terms.
- [ ] Step 03 complete — you have an initial list of solution-independent performance criteria.

## Context (Why This Matters)

Even experienced teams fall into two traps when building their criteria list: listing **features** as criteria, and listing **binary requirements** as criteria. Both errors corrupt your decision matrix. Features masquerading as criteria assign value based on intuition rather than measuring the underlying need. Binary pass/fail items inflate the matrix with rows that cannot differentiate between options on a performance scale — they belong in a separate requirements checklist, not in the scoring matrix.

Catching these pitfalls now, before you define metrics and assign scores, saves significant rework later.

## Instructions

### Pitfall 1: Using Features as Criteria

1. **Review each criterion on your list.** Ask: *"Is this a structural solution or a feature, rather than a measurable quality?"* If it describes a specific component, technology, or design choice, it is a feature — not a criterion.

2. **Convert features to criteria.** For any feature you find, ask: *"Why would the customer value this feature?"* The answer is the real performance criterion.

3. **Watch for double-counting.** If you list a feature as a criterion *and* separately list the underlying need it serves, you are scoring the same value twice. Remove the feature and keep the underlying need.

### Pitfall 2: Binary (Yes/No) Criteria

4. **Identify any criterion with only two possible outcomes:** pass or fail, yes or no.

5. **Determine if failure eliminates the option entirely.** If a "no" answer makes the solution invalid (not just lower-scoring, but completely disqualified), that item is a **requirement**, not a performance criterion.

6. **Move requirements out of the decision matrix** and into your requirements list. Reserve the matrix for criteria where options can score across a range of performance levels.

   | | Requirements | Performance Criteria |
   |---|---|---|
   | **What they measure** | What you **must** do | How **well** you do something |
   | **Scoring** | Binary (pass/fail) | Scaled (degrees of performance) |
   | **Effect of failure** | Solution is invalid | Solution scores lower but may still be viable |

## Worked Example

Review the e-commerce platform criteria list from Step 03 and apply both pitfall checks:

**Pitfall 1 — Features disguised as criteria:**

Non-technical stakeholders are especially prone to this pitfall. Vendor buzzwords and technology names are features, not criteria. Ask "Why does the business value this?" to find the real criterion.

| Feature (wrong) | Ask: "Why does the business value this?" | Real Criterion (right) |
|---|---|---|
| Uses microservices | Because we want to update features independently without downtime | **Release Agility** — see [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |
| Runs on AWS | Because we want reliable, globally distributed hosting | **Reliability (Uptime)** — see [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| Has a REST API | Because we need other internal systems to connect to it | **Integration Capability** — see [API Design KB](api-design-sys-design-kb.md) |
| Built with React | Because we want a fast, responsive storefront | **Customer Page Load Speed** — see [Caching KB](caching-system-design-kb.md) |

**Pitfall 2 — Binary requirements disguised as criteria:**

| Binary Item | If "no," is the option eliminated? | Verdict |
|---|---|---|
| PCI-DSS compliant (can process credit cards) | Yes — cannot legally handle payments without it | Move to **requirements list** |
| GDPR compliant | Yes — cannot operate in the EU | Move to **requirements list** |
| Supports our current catalog size (50K+ SKUs) | Yes — platform is a non-starter if it cannot hold our inventory | Move to **requirements list** |

After this review, your criteria list is cleaner: it contains only items where options can score on a meaningful performance scale, and your requirements list captures the non-negotiable compliance and capability gates separately.

## Validation Checklist (STOP-GAP)

- [ ] I have reviewed every criterion and confirmed none are features or structural solutions in disguise.
- [ ] For any feature found, I have converted it to the underlying customer need it serves.
- [ ] I have identified any binary (pass/fail) items and moved them to the requirements list.
- [ ] My decision matrix contains only criteria with a meaningful range of performance levels.
- [ ] I am not double-counting any value (feature + underlying need both listed).

**STOP: Do not proceed to Step 05 until every box above is checked.**

## Output Artifact

A refined criteria list free of feature-masquerading and binary-requirement contamination, plus a separate requirements list for non-negotiable gates.

## Handoff to Next Step

Step 05 introduces direct and scaled measures — how to define the metrics that will score each criterion on your refined list.

---

**← Previous:** [03 — Identifying Performance Criteria](03%20-%20Identifying%20Performance%20Criteria.md) | **Next →** [05 — Using Direct and Scaled Measures](05%20-%20Using%20Direct%20and%20Scaled%20Measures.md)
