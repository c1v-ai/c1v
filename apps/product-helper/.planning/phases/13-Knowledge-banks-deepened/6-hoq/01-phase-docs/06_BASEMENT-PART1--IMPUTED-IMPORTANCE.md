# Phase 6: Basement Part 1 -- Imputed Importance Calculation
> Corresponds to QFD Guide Steps 12, 12a

## Prerequisites
- [ ] Phase 5 is complete (roof filled with EC interrelationships)
- [ ] Required inputs: Main floor relationship matrix (Phase 4) and PC weights (Phase 1)

## Context (Why This Matters)

With the full relationship matrix built, you need a summary: "How critical is each engineering characteristic to my system's overall performance?" The imputed importance is that summary -- a single number per EC calculated from the main floor marks weighted by PC importance. It tells you which ECs are your highest-leverage design knobs and will directly guide where you focus when setting design targets.

Splitting imputed importance into positive and negative components adds deeper insight: an EC might have high total importance but actually have more negative influence than positive, meaning pushing it further could *hurt* overall performance.

## Instructions

### Step 6.1: Convert Symbols to Absolute Marks

Transform every cell in the main floor into an absolute value (the "marks number"):

| Original | Absolute Mark |
|----------|--------------|
| ++ or +2 | 2 |
| + or +1 | 1 |
| (blank) or 0 | 0 |
| x or -1 | 1 |
| xx or -2 | 2 |

The key operation: take the absolute value of each cell's numeric equivalent.

### Step 6.2: Calculate Total Imputed Importance

For each engineering characteristic (each column in the main floor):

1. Take each cell's absolute marks number
2. Multiply it by the PC weight of that row
3. Sum all the products

```
Imputed Importance(EC_j) = Σ |mark(PC_i, EC_j)| × weight(PC_i)
```

**Worked calculation for Deployment Frequency:**

| Performance Criteria | Mark | Absolute Mark | PC Weight | Product |
|---------------------|------|---------------|-----------|---------|
| Reliability (Uptime) | x | 1 | 16.7% | 16.70% |
| Customer Page Load Speed | 0 | 0 | 16.7% | 0.00% |
| Total Cost over 3 Years | 0 | 0 | 13.3% | 0.00% |
| Peak Traffic Capacity | 0 | 0 | 13.3% | 0.00% |
| Launch Speed | ++ | 2 | 10.0% | 20.00% |
| Growth Ceiling | 0 | 0 | 10.0% | 0.00% |
| Ongoing Maintenance | + | 1 | 10.0% | 10.00% |
| Risk Exposure (Security) | x | 1 | 10.0% | 10.00% |
| **Imputed Importance** | | | | **56.70%** |

Note: The imputed importance is traditionally expressed as a percentage even though the maximum possible value is 200% (if every cell were a 2-mark). This notation is a convention -- don't worry about it exceeding 100%.

Compare this to **CDN Cache Hit Rate**, which might show imputed importance of 83.4% — almost entirely positive (strong effects on Page Load Speed and Peak Traffic Capacity, which carry the heaviest weights). CDN Cache Hit Rate is a "clean" high-leverage knob; Deployment Frequency is a "messy" one with significant trade-offs.

### Step 6.3: Calculate Positive Imputed Importance

Repeat the calculation but only use the **positive marks** (ignoring all negative marks):

1. For each cell in the EC's column, if the original value is positive (+1 or +2), use its absolute mark; if negative or zero, use 0
2. Multiply by the PC weight
3. Sum

```
Positive II(EC_j) = Σ positive_mark(PC_i, EC_j) × weight(PC_i)
```

### Step 6.4: Calculate Negative Imputed Importance

Same calculation but only using **negative marks**:

1. For each cell, if the original value is negative (-1 or -2), use its absolute mark; if positive or zero, use 0
2. Multiply by the PC weight
3. Sum

```
Negative II(EC_j) = Σ |negative_mark(PC_i, EC_j)| × weight(PC_i)
```

### Step 6.5: Verify the Math

For every EC:

```
Positive Imputed Importance + Negative Imputed Importance = Total Imputed Importance
```

This must hold exactly. If it does not, there is an arithmetic error.

### Step 6.6: Record in the Basement

Enter three rows in the QFD basement (below the main floor):
- **Imputed Importance**: Total value per EC
- **Positive Imputed Importance**: Positive-only value per EC
- **Negative Imputed Importance**: Negative-only value per EC

Sometimes the positive/negative values are written in the same cell separated by a slash (e.g., "37.84% / 59.46%").

### Step 6.7: Identify Top 5 ECs

Rank all ECs by total imputed importance. Note the top 5 -- these are your highest-leverage engineering characteristics and will receive priority attention when setting design targets in Phase 9.

Also note any ECs where the negative imputed importance exceeds the positive. These are ECs where pushing them further could actually *decrease* your system's overall performance. This is a critical insight.

**Example -- Deployment Frequency:**
- Positive II: 30.00% (from Launch Speed ++ and Ongoing Maintenance +)
- Negative II: 26.70% (from Reliability x, Security x)
- Total II: 56.70%

Deployment Frequency has moderate total imputed importance with a nearly even positive/negative split. This means pushing it aggressively in either direction will hurt something. The resolution — as you will see in Phase 9 — is to set a moderate deployment frequency AND simultaneously invest in Test Coverage and Automated Failover Coverage (the ECs that mitigate Deployment Frequency's negative effects). See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) for how CI/CD pipelines balance speed with safety.

## Worked Example

The e-commerce platform's imputed importance calculation shows Deployment Frequency at 56.70% total with a nearly even positive/negative split. Meanwhile, CDN Cache Hit Rate might show 83.4% total with 80% positive and only 3.4% negative — a clear candidate for aggressive improvement (push the cache hit rate as high as possible with minimal downside). Number of Redundant Instances might show 73% total with 50% positive (Reliability, Peak Traffic) and 23% negative (Cost) — worth pushing, but with a cost trade-off to manage.

This phase does not make design decisions. It quantifies the landscape so Phase 9 decisions are data-driven.

## Validation Checklist (STOP-GAP)
- [ ] Imputed importance is calculated for every EC
- [ ] Positive imputed importance is calculated for every EC
- [ ] Negative imputed importance is calculated for every EC
- [ ] **Math check**: Positive II + Negative II = Total II for every single EC (exact equality)
- [ ] All three values are recorded in the QFD basement rows
- [ ] Top 5 ECs by total imputed importance are identified
- [ ] Any ECs where negative II > positive II are flagged for attention in Phase 9

> **STOP: Do not proceed to Phase 7 until ALL validation items pass.**
> The math check (Positive + Negative = Total) is non-negotiable. If any EC fails this check, re-examine the calculation step by step.

## Output Artifact
Three rows in the QFD basement: Total Imputed Importance, Positive Imputed Importance, and Negative Imputed Importance for every EC. A ranked list of the top 5 ECs.

## Handoff to Next Phase
You now know which ECs matter most to overall performance. Phase 7 continues filling the basement with competitor engineering characteristic values, units, and requirement thresholds -- real-world data that will inform your design targets.

---

**← Previous:** [Phase 5: Roof -- EC Interrelationships](05_ROOF--EC-INTERRELATIONSHIPS.md) | **Next →** [Phase 7: Basement Part 2 -- Competitor EC Values](07_BASEMENT-PART2--COMPETITOR-EC-VALUES.md)
