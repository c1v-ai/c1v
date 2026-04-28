# Phase 4: Main Floor -- Relationship Matrix (EC Impact on PC)
> Corresponds to QFD Guide Steps 8, 10

## Prerequisites
- [ ] Phase 3 is complete (ECs listed with direction-of-change arrows)
- [ ] Required inputs: The grid formed by PC rows (Phase 1) and EC columns (Phase 3)

## Context (Why This Matters)

The main floor is the heart of the House of Quality. It answers the question: "How does adjusting each engineering characteristic affect each performance criterion?" This is where things start to get exciting -- you are formally mapping the levers you control to the outcomes your customer cares about. The relationship matrix reveals both obvious connections (faster speed helps time-to-accomplish) and non-obvious ones (faster speed hurts safety), building the foundation for informed design trade-offs.

## Instructions

### Step 4.1: Understand the Scale

Each cell in the matrix receives a value representing how adjusting the EC (in the direction of its arrow) affects that PC:

| Value | Symbol | Meaning |
|-------|--------|---------|
| +2 | ++ | Strong positive effect |
| +1 | + | Moderate positive effect |
| 0 | (blank) | No significant effect |
| -1 | x | Moderate negative effect |
| -2 | xx | Strong negative effect |

**Use {-2, -1, 0, +1, +2} or {xx, x, (blank), +, ++}**. Either notation is acceptable, but be consistent. If you use symbols, include a legend in your QFD (typically in Rows 10-15 of Columns A-B in the template).

### Step 4.2: Why the Scale is Narrow

Do NOT use scales wider than -3 to +3. Many practitioners reject even -3 to +3, insisting on -2 to +2. The reason: at this stage, the design concept is not fleshed out enough to justify fine-grained distinctions. Can you truly defend that something rated "5" is five times more influential than something rated "1"? At an early stage, you usually cannot.

You are establishing **general trends**, not precise measurements. The symbols {++, +, blank, x, xx} reinforce this -- you are saying an EC either strongly, somewhat, or not significantly affects a PC.

### Step 4.3: Fill the Matrix

For each EC column, go down through every PC row and ask:

> "If we adjust [EC] in the direction of its arrow, what effect will that have on [PC]?"

**Example**: Deployment Frequency has an ↑ arrow. Ask: "If we *increase* Deployment Frequency, what effect does that have on..." See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) for the engineering context.
- Launch Speed → ++ (strong positive: deploying more often means features reach customers faster)
- Ongoing Maintenance Effort → + (moderate positive: smaller, frequent releases are easier to debug than large batch releases)
- Reliability (Uptime) → x (moderate negative: each deployment is a potential point of failure if testing is inadequate)
- Risk Exposure (Security) → x (moderate negative: more deployments mean more opportunities to introduce vulnerabilities)
- Growth Ceiling → 0 (no significant effect: how often you deploy does not change your system's scaling limits)

### Step 4.4: Expect Sparsity

Most cells should be 0 (blank). Yes, there may be some small influence, but if you don't have enough information to accurately quantify it, leave the cell blank. The QFD main body is **intentionally sparse**. This is normal and expected. Do not force relationships where none meaningfully exist.

### Step 4.5: Review Trends (Do Not Decide Yet)

Once filled, scan the matrix for insights but **do not make design decisions yet**. Observations to look for:

- An EC with many strong positive marks → high-leverage design knob
- An EC with many strong negative marks → dangerous to push aggressively
- A PC row with few marks → may need additional ECs that influence it
- An EC column with all zeros → question whether it belongs in the QFD

**Example insight**: Increasing Deployment Frequency has a positive effect on Launch Speed (10% weight) and Maintenance Effort (10% weight), making it tempting to push for maximum deployment velocity. But the matrix also shows negative effects on Reliability (16.7% weight) and Security (10% weight) — the two criteria with the heaviest weights. This is the kind of trade-off the QFD is designed to surface: the business instinct is "ship faster," but the data says "shipping faster can hurt the things customers care about most." See [Resiliency Patterns KB](resilliency-patterns-kb.md) for deployment-related failure modes.

## Worked Example

In the e-commerce QFD, the relationship matrix for **Deployment Frequency (↑)** shows:

| Performance Criterion | Effect | Reasoning |
|---|---|---|
| Reliability (Uptime) | x | Each deployment risks introducing bugs; more deployments = more risk windows |
| Customer Page Load Speed | 0 | How often you deploy does not directly affect page speed |
| Total Cost over 3 Years | 0 | Deployment frequency has negligible cost impact (CI/CD tooling is a fixed cost) |
| Peak Traffic Capacity | 0 | Deployment rate does not change capacity limits |
| Launch Speed | ++ | More frequent deploys = features reach users faster |
| Growth Ceiling | 0 | Deployment frequency does not change scaling architecture |
| Ongoing Maintenance | + | Smaller releases are easier to diagnose and roll back — see [Maintainability KB](maintainability-kb.md) |
| Risk Exposure (Security) | x | More deployments = more chances to ship a vulnerability |

Most of the matrix is sparse zeros. The non-zero entries highlight the true design tensions. Notice how Deployment Frequency primarily affects the development-process criteria (Launch Speed, Maintenance) but creates risk for the customer-facing criteria (Reliability, Security).

> **Interface design preview:** When you fill the matrix for ECs like "Number of Services/Modules" and "Number of Exposed API Endpoints," you will find that these ECs affect almost every PC — because they determine how many interfaces exist between components. More services means more interfaces to define, test, and maintain. This is exactly what Module 6 (Defining Interfaces) addresses.

## Validation Checklist (STOP-GAP)
- [ ] Every cell in the EC × PC matrix has a value (including explicit blanks for 0)
- [ ] No value falls outside the -2 to +2 range (or -3 to +3 maximum if justified)
- [ ] The scale notation is consistent throughout (all numbers or all symbols, not mixed)
- [ ] A legend is included if using symbols
- [ ] The matrix is intentionally sparse -- more than 50% of cells should be 0
- [ ] You can explain the reasoning for every non-zero cell if asked
- [ ] You have considered how the direction-of-change arrow frames each question

> **STOP: Do not proceed to Phase 5 until ALL validation items pass.**
> If the matrix is not sparse enough, reconsider whether weaker relationships truly warrant a +1/-1 or should be 0. If values exceed the range, bring them within bounds.

## Output Artifact
The main floor is populated: a complete relationship matrix showing how each EC affects each PC, using the -2 to +2 scale, with appropriate sparsity.

## Handoff to Next Phase
You now know how each EC influences performance. Phase 5 builds the **roof** -- how engineering characteristics influence *each other* -- revealing the trade-offs within your design itself.

---

**← Previous:** [Phase 3: Second Floor -- Engineering Characteristics](03_SECOND-FLOOR--ENGINEERING-CHARACTERISTICS.md) | **Next →** [Phase 5: Roof -- EC Interrelationships](05_ROOF--EC-INTERRELATIONSHIPS.md)
