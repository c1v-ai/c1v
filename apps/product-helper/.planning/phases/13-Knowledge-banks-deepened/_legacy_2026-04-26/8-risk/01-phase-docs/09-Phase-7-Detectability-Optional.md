# Phase 7: Detectability and Troubleshooting (Optional)

This phase is optional. It is most relevant for safety-critical systems, military/space/health applications, or any system where undetected failures could escalate.

---

## Part A: Detectability Rating

### Knowledge

Detectability quantifies how likely it is that a failure can be **detected before it escalates** into a more severe problem. A failure that is hard to detect is more dangerous than one that is immediately obvious.

**Why it matters:**
- An undetected failure may increase in severity over time
- An undetected failure may trigger additional failures (cascading risk)
- Some failures can only be detected during specific operational phases (initialization, normal operation, maintenance)

### Detectability rating scale:
Like severity and likelihood, detectability uses a numeric scale. However, the direction is inverted:
- **Higher score = HARDER to detect** (more dangerous)
- **Lower score = EASIER to detect** (less concerning)

### Example detectability scale (1-5) — adapted for software systems:

| Rating | Label | Conditions | Software Examples |
|--------|-------|-----------|-------------------|
| 1 | Automated real-time detection | System detects and alerts within seconds via automated monitoring. See [Observability KB](observability-kb.md) | Health check fails → auto-restart. Error rate spike → PagerDuty alert. Synthetic checkout test fails → on-call paged |
| 2 | Fast manual detection | Failure is visible on dashboards within minutes; on-call engineer notices during active monitoring | Datadog dashboard shows latency spike. Log aggregator shows error pattern. Queue depth graph trending up |
| 3 | Delayed detection | Failure detected during routine review (daily standup, weekly metrics review) or by customer reports | Slow query shows up in weekly performance report. Customer emails about missing confirmation. Billing reconciliation catches discrepancy |
| 4 | Difficult detection | Failure requires active investigation — not visible in standard monitoring. Needs specialized analysis or A/B comparison | Data inconsistency between services only found during audit. Cache serving subtly wrong data. Gradual memory leak only visible over weeks |
| 5 | Undetectable until consequences manifest | Failure only discovered when a downstream effect triggers a visible incident or customer complaint | Silent data corruption in database. Security vulnerability exploited before detection. Pricing error that only affects edge-case currency conversions |

### Additional optional column -- Detectability Certainty:
If a detection is reported, how confident are we that it is not a false alarm? This is typically expressed as a confidence percentage (e.g., 90% certain).

### Incorporating detectability into RPN:
There are two approaches:
1. **Three-factor RPN:** RPN = Severity x Likelihood x Detectability (creates a 3D criticality space; criticality ranges must be recalibrated)
2. **Standalone information:** Add the detectability column for reference but do NOT multiply it into the RPN. Use it as additional context for decision-making.

Approach 2 is recommended when detectability estimates are uncertain or the design has not matured enough for reliable detection assessments.

### When to include detectability:
- Financial transaction systems (payment processing, billing — undetected failures cost money every minute)
- Systems handling personal data (GDPR/PCI — undetected breaches have regulatory consequences)
- High-traffic consumer-facing systems (delayed detection during peak = massive revenue loss)
- Systems with HIGH severity failures only (no need for LOW severity items)
- Post-launch when monitoring infrastructure exists and provides real detection data

---

## Part B: Troubleshooting Actions

### Knowledge

A troubleshooting column lists **what to do if the failure still occurs after all corrective actions have been applied**. This transforms the FMEA from a risk analysis tool into a **troubleshooting guide** for operations and maintenance teams.

For each remaining possible cause, the troubleshooting entry describes:
- Diagnostic steps to confirm the cause
- Actions to resolve or work around the failure
- Escalation procedures if the fix fails

### Example (E-Commerce Platform — troubleshooting across system layers):

| Possible Cause | Troubleshooting |
|---|---|
| Stripe API timeout with no retry | Check Stripe status page (status.stripe.com). Check Payment Service logs for timeout errors. Verify network connectivity from Payment Service to Stripe endpoint. Check if circuit breaker is open. If Stripe is down, activate fallback payment queue. See [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| Database connection pool exhausted | Check PgBouncer/connection pooler metrics. Run `SELECT count(*) FROM pg_stat_activity` to see active connections. Check for long-running queries (`pg_stat_activity` with `state = 'active'` and high `query_start` age). Kill zombie connections if needed. Scale read replicas if under sustained load. See [Data Model KB](data-model-kb.md) |
| CDN cache invalidation failure | Check CloudFront invalidation history in AWS Console. Verify SNS topic is receiving price-update events. Test manual invalidation via CLI. Check if invalidation quota exceeded (AWS limits 3000/month). As fallback, reduce TTL to 1min on affected paths. See [CDN & Networking KB](cdn-networking-kb.md) |
| Auto-scaling threshold too high | Check CloudWatch/Datadog scaling metrics. Verify current instance count vs. desired. Manually scale up as emergency measure. Post-incident: adjust threshold and run load test to validate. See [Load Balancing KB](load-balancing-kb.md) |
| Monitoring alerts misconfigured | Check alert history — were alerts firing but ignored (alert fatigue)? Verify alert thresholds against actual SLO. Check on-call routing — did pages reach the right person? Add synthetic test for the failed scenario. See [Observability KB](observability-kb.md) |

### When to include troubleshooting:
- Toward the end of the design implementation phase
- When the FMEA has been iterated enough that remaining risks are well understood
- When creating deliverables for operations/maintenance teams

## Input Required

- Complete FMEA table from Phase 6
- User decision: Include detectability in RPN calculation or as standalone info?
- User decision: Include troubleshooting column?

## Instructions for the LLM

### If the user wants detectability:

1. Propose a detectability rating scale appropriate to the system.
2. Present for user approval (mini stop gap).
3. Assign detectability ratings to each cause row, prioritizing HIGH severity items.
4. If three-factor RPN: recalculate RPN = Severity x Likelihood x Detectability and recalibrate criticality ranges.
5. If standalone: add the column without modifying RPN.

### If the user wants troubleshooting:

1. For each cause row with remaining risk (even after corrective actions), write troubleshooting steps.
2. Focus on: How would an operator diagnose this? What would they check first? What is the fix?

## Output Format

Add optional columns to the far right of the FMEA:

```markdown
| ... (all previous columns) ... | Detectability | Det. Certainty | Troubleshooting |
|---|---|---|---|
| ... | [1-5] | [%] | [diagnostic and fix steps] |
```

---

## STOP GAP -- Checkpoint 7 (Final)

**Present the complete FMEA to the user and ask:**

> "The FMEA is now complete. Here is the final table with all columns. Please review:
> 1. Is the detectability assessment reasonable? (if included)
> 2. Are the troubleshooting steps actionable for an operations team? (if included)
> 3. Walk through the Final Output Checklist in `00-FMEA-Master-Prompt.md` -- are all items checked?
>
> If everything looks good, this FMEA is ready to be exported to a spreadsheet."

**FMEA is complete.**
