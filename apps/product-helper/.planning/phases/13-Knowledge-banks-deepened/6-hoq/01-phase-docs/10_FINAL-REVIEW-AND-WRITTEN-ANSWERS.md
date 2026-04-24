# Phase 10: Final Review, Iteration, and Written Answers
> Corresponds to QFD Guide Steps 21, 22, 23

## Prerequisites
- [ ] Phase 9 is complete (all design targets set, performance scores updated, trade-offs documented)
- [ ] Required inputs: The complete QFD (all sections filled), all documentation from Phases 0-9

## Context (Why This Matters)

A completed QFD is a living document, not a one-time artifact. This phase ensures internal consistency, explores iteration strategies, and produces the written deliverables required for the course project. The written answers demonstrate that you understand not just the mechanics of the QFD but the *reasoning* behind your design decisions.

## Instructions

### Step 10.1: Full QFD Consistency Check

Review the entire House of Quality for internal consistency:

1. **Front porch**: Do PC weights still sum to 100%? Have any criteria changed meaning since you started?
2. **Back porch**: Do A(target) scores reflect the design targets you set? Is the competitive comparison up to date?
3. **Main floor**: After Phase 8 re-evaluation, are all relationship values current?
4. **Roof**: Do EC-to-EC relationships still hold given your final targets?
5. **Basement**: Are all rows filled? (Imputed importance, positive/negative II, units, competitor values, thresholds, difficulty, cost, design targets)
6. **Cross-check**: Do any design targets violate thresholds? Do any contradict each other based on roof relationships?

### Step 10.2: Iterate on Design Targets

Consider these iteration scenarios:

**Technical risk scenarios:**
- What if you cannot achieve the algorithm complexity you intended?
- What if sensors do not perform as well as anticipated?
- What if you cannot hit any one of your design targets?

**Resource scenarios:**
- What if your budget is cut by 20%?
- What if a critical part arrives late?
- What if a team member becomes unavailable?

For each scenario, trace the impact through the QFD:
- Which EC targets would need to change?
- Which roof relationships create cascading effects?
- How much does the overall performance score drop?

This exercise builds contingency planning into your design and helps you recognize which ECs are truly critical vs. which have flexibility.

**Key insight**: Optimal solutions commonly occur when you have pushed your design to the maximum your constraints allow. The QFD helps identify which constraints are truly the most limiting, often leading to multiple iterations.

### Step 10.3: Consider the Linked House of Quality (Optional Advanced)

A "Linked House of Quality" chains multiple QFD matrices together. The second floor (ECs) of the first QFD becomes the front porch (rows) of the next QFD:

```
QFD 1: Performance Criteria → Engineering Characteristics
QFD 2: Engineering Characteristics → System Parts/Components
QFD 3: System Parts → Production Requirements
```

This allows you to trace from a production tolerance all the way back to a customer performance criterion. While not required for the course project, it is a powerful extension for complex systems.

### Step 10.4: Resolve Cognitive Biases (Step 22 Insight)

The QFD process often reveals that initial intuitions were wrong. Common biases to check:

- **Optimization bias**: Tendency to focus on the most heavily weighted PC and the EC most directly linked to it (e.g., "make it faster because speed matters most"), ignoring the cascading negative effects
- **Coolness bias**: Overweighting "impressive" or "marketable" characteristics that have high emotional appeal but modest actual performance impact
- **Comfort bias**: Spending disproportionate effort on areas you understand well, rather than areas of greatest uncertainty

If your QFD analysis contradicts your gut instinct, trust the analysis. Document why the intuition was misleading.

### Step 10.5: Draft the Seven Written Answers (Course Project)

The course project requires a companion document (.docx) with 7 written answers in two parts.

**Part 1 (3 questions -- due after Module 1 work):**

**Q1: How did you determine your relative importance weights?**
Explain your method: what scale you used, how you justified each criterion's score, what data or stakeholder input informed the weights, and why the final percentages reflect the true priorities of the challenge.

**Q2: How does one engineering characteristic impact another? Pick one example from the roof.**
Select one non-obvious EC-to-EC relationship from the roof. Explain the mechanism: why does changing EC_A affect EC_B? Is the relationship symmetric or asymmetric? What does this mean for your design?

**Q3: Identify a competitor that outperforms your system and explain why.**
Pick a specific competitor and a specific PC where they score higher. Explain what they do differently that leads to better performance, and what (if anything) you plan to do about it.

**Part 2 (4 questions -- due after Module 2 work):**

**Q4: How did competitor EC values affect your design targets?**
Explain how knowing what competitors achieved for specific ECs influenced your target values. Did you aim to match, exceed, or deliberately stay below certain competitor values? Why?

**Q5: How did cost and technical difficulty influence your design targets?**
Explain how the difficulty/cost ratings affected your decisions. Give an example of a target you made more conservative due to high difficulty/cost, and/or one you made more aggressive because it was easy/cheap.

**Q6: How did positive/negative imputed importance influence your design targets?**
Explain how the split between positive and negative II guided your decisions. Reference specific ECs, especially any where negative II exceeded positive II (the "speed paradox" pattern).

**Q7: What additional research would you like to do?**
Identify 2-3 areas where more data, testing, or analysis would improve your confidence in the QFD. What specific uncertainties remain? What would you investigate next?

### Step 10.6: Final Performance Estimate

State your final estimated system performance:
- A(target) total weighted score vs. A(low), A(high), and all competitor scores
- Which PCs improved the most from the QFD process?
- Which PCs remain areas of concern?
- What is your overall competitive positioning?

## Worked Example

The e-commerce platform team's final state:
- A(target) = 3.72 (up from A(low) 2.40, approaching A(high) 3.90)
- Outperforms Shopify Plus (3.45) on Growth Ceiling and Cost; matches on Reliability
- Outperforms Rival Custom Build (2.15) on every criterion except Growth Ceiling (tied at 5)
- Biggest improvements: Reliability (+1.5 from investment in redundancy and failover) and Page Load Speed (+1 from aggressive CDN cache hit rate target)
- Remaining concern: Launch Speed still scores lower than Shopify due to conservative deployment frequency target — acceptable trade-off given the reliability and cost gains

Written answer example (Q6):
> Deployment Frequency had moderate total imputed importance (56.70%) with a nearly even positive/negative split (30% positive, 26.70% negative). This meant that pushing deployment speed aggressively would help Launch Speed and Maintenance Effort but hurt Reliability and Security — our two highest-weighted PCs. We set our deployment target at 2 deploys/week — above the 1/week minimum requirement but well below Shopify's continuous deployment model — and redirected engineering effort toward CDN Cache Hit Rate (difficulty=1, cost=1, overwhelmingly positive II) and Number of Redundant Instances (strong positive effect on Reliability). This decision improved our weighted performance score by an estimated 0.5 points while keeping our highest-weighted PCs safe. See [CI/CD KB](deployment-release-cicd-kb.md) for why progressive deployment maturity outperforms attempting continuous deployment from day one.

> **Bridge to Module 6:** The completed QFD reveals that this platform has 6 services, ~40 API endpoints, and multiple third-party integrations (payment gateway, CDN, search service, email provider). Each of these boundaries is an **interface** that must be formally defined: what data format, what protocols, what error handling, what SLAs. Module 6 (Defining Interfaces) takes the engineering characteristics and design targets from this QFD and translates them into interface specifications that ensure the components work together as a system.

## Validation Checklist (STOP-GAP)
- [ ] Full QFD consistency check is complete (all sections cross-referenced)
- [ ] At least 2 "what if" scenarios have been explored with traced impacts
- [ ] All 7 written answers are drafted (Part 1: Q1-Q3, Part 2: Q4-Q7)
- [ ] Each written answer references specific data from the QFD (not generic statements)
- [ ] Final A(target) performance score is calculated and compared to competitors
- [ ] The QFD reflects all final design targets and updated relationship values
- [ ] Cognitive biases have been explicitly checked and documented if found

> **STOP: The QFD House of Quality is complete.**
> Review the entire document one final time. Ensure all sections are populated, all math checks pass, and all written answers are substantive and specific to your project.

## Output Artifact
A complete House of Quality with all six sections filled, a companion document with 7 written answers, and a final performance estimate comparing your system to competitors.

## Completion

The QFD process is complete. You now have:
- A defensible set of design targets for every engineering characteristic
- A clear understanding of trade-offs and their justifications
- A competitive analysis showing where your system wins and where risks remain
- A master document that your team can reference throughout the design process
- Written documentation of your reasoning for stakeholder review

The QFD should be revisited regularly as you continue development: update scores as you prototype and test, refine relationships as you learn more, and adjust targets as constraints change.

---

**← Previous:** [Phase 9: Design Targets](09_DESIGN-TARGETS.md) | **Back to** [Phase 0: Overview](00_QFD-OVERVIEW-AND-TERMINOLOGY.md) | **Reference:** [Glossary](GLOSSARY.md) · [Cell Map](TEMPLATE_CELL-MAP.md)
